import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Camera } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/lib/api-helpers'
import { getErrorMessage } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Avatar from '@/components/ui/Avatar'

const profileSchema = z.object({
  display_name: z.string().max(100, 'Too long').optional(),
  bio: z.string().max(500, 'Max 500 characters').optional(),
  website: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  location: z.string().max(100, 'Too long').optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    old_password: z.string().min(1, 'Required'),
    new_password: z.string().min(8, 'Minimum 8 characters'),
    new_password_confirm: z.string().min(1, 'Required'),
  })
  .refine((d) => d.new_password === d.new_password_confirm, {
    path: ['new_password_confirm'],
    message: 'Passwords do not match',
  })

type PasswordFormData = z.infer<typeof passwordSchema>

export default function EditProfilePage() {
  const { user, updateUser } = useAuth()
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const avatarRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: user?.display_name ?? '',
      bio: user?.bio ?? '',
      website: user?.website ?? '',
      location: user?.location ?? '',
    },
  })

  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    reset: resetPw,
    formState: { errors: pwErrors, isSubmitting: pwSubmitting },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) })

  const updateProfile = useMutation({
    mutationFn: (data: FormData) => authApi.updateMe(data),
    onSuccess: (updated) => {
      updateUser(updated)
      setProfileSuccess(true)
      setProfileError(null)
    },
    onError: (err) => setProfileError(getErrorMessage(err)),
  })

  const changePassword = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      setPasswordSuccess(true)
      setPasswordError(null)
      resetPw()
    },
    onError: (err) => setPasswordError(getErrorMessage(err)),
  })

  const onProfileSubmit = async (data: ProfileFormData) => {
    setProfileSuccess(false)
    setProfileError(null)
    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) formData.append(k, v)
    })
    if (avatarRef.current?.files?.[0]) {
      formData.append('avatar', avatarRef.current.files[0])
    }
    await updateProfile.mutateAsync(formData)
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordSuccess(false)
    setPasswordError(null)
    await changePassword.mutateAsync(data)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>

      {/* Profile form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>

        {profileSuccess && (
          <Alert variant="success">Profile updated successfully.</Alert>
        )}
        {profileError && (
          <Alert variant="error" dismissible>
            {profileError}
          </Alert>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <Avatar user={user} size="lg" />
            )}
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 shadow"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Profile photo</p>
            <p className="text-xs text-gray-400">JPG, PNG, GIF up to 2MB</p>
          </div>
          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
          <Input
            label="Display name"
            error={errors.display_name?.message}
            {...register('display_name')}
          />
          <Textarea
            label="Bio"
            rows={3}
            helpText="Tell others about yourself (max 500 characters)"
            error={errors.bio?.message}
            {...register('bio')}
          />
          <Input
            label="Website"
            type="url"
            placeholder="https://your-website.com"
            error={errors.website?.message}
            {...register('website')}
          />
          <Input
            label="Location"
            placeholder="City, Country"
            error={errors.location?.message}
            {...register('location')}
          />
          <Button type="submit" isLoading={isSubmitting || updateProfile.isPending}>
            Save Profile
          </Button>
        </form>
      </div>

      {/* Password form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>

        {passwordSuccess && (
          <Alert variant="success">Password changed successfully.</Alert>
        )}
        {passwordError && (
          <Alert variant="error" dismissible>
            {passwordError}
          </Alert>
        )}

        <form onSubmit={handlePwSubmit(onPasswordSubmit)} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            error={pwErrors.old_password?.message}
            {...registerPw('old_password')}
          />
          <Input
            label="New password"
            type="password"
            helpText="Minimum 8 characters"
            error={pwErrors.new_password?.message}
            {...registerPw('new_password')}
          />
          <Input
            label="Confirm new password"
            type="password"
            error={pwErrors.new_password_confirm?.message}
            {...registerPw('new_password_confirm')}
          />
          <Button type="submit" isLoading={pwSubmitting || changePassword.isPending}>
            Change Password
          </Button>
        </form>
      </div>
    </div>
  )
}
