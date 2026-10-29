import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, MessageSquare, ThumbsUp, CheckCircle2 } from 'lucide-react'
import { notificationsApi } from '@/lib/api-helpers'
import { timeAgo } from '@/lib/utils'
import type { Notification } from '@/types'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import Avatar from '@/components/ui/Avatar'

const ICON_MAP: Record<string, typeof MessageSquare> = {
  answer: MessageSquare,
  comment: MessageSquare,
  vote: ThumbsUp,
  accepted: CheckCircle2,
}

function notificationMessage(n: Notification): string {
  const sender = n.sender ? n.sender.display_name || n.sender.username : 'Someone'
  switch (n.notification_type) {
    case 'answer':
      return `${sender} answered your question`
    case 'comment':
      return `${sender} commented on your content`
    case 'vote':
      return `${sender} voted on your content`
    case 'accepted':
      return `${sender} accepted your answer`
    default:
      return `New notification`
  }
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [showUnread, setShowUnread] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', { unread: showUnread }],
    queryFn: () => notificationsApi.list({ unread: showUnread || undefined }),
  })

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markRead = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const unreadCount = data?.results.filter((n) => !n.is_read).length ?? 0

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUnread((v) => !v)}
            className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
              showUnread
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {showUnread ? 'All' : 'Unread only'}
          </button>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => markAllRead.mutate()}
              isLoading={markAllRead.isPending}
            >
              <Check className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.results.length ? (
        <EmptyState
          icon={<Bell className="h-12 w-12" />}
          title="No notifications"
          description={showUnread ? 'You have no unread notifications.' : "You're all caught up!"}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {data.results.map((notification) => {
            const Icon = ICON_MAP[notification.notification_type] ?? Bell
            return (
              <div
                key={notification.id}
                className={`flex gap-3 p-4 transition-colors hover:bg-gray-50 ${
                  !notification.is_read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="shrink-0">
                  {notification.sender ? (
                    <Avatar user={notification.sender} size="sm" />
                  ) : (
                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Icon className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    {notificationMessage(notification)}
                  </p>
                  {notification.question_title && notification.question_id && (
                    <Link
                      to={`/questions/${notification.question_id}`}
                      onClick={() => !notification.is_read && markRead.mutate(notification.id)}
                      className="text-xs text-blue-600 hover:underline line-clamp-1 mt-0.5 block"
                    >
                      {notification.question_title}
                    </Link>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notification.created_at)}</p>
                </div>
                {!notification.is_read && (
                  <button
                    onClick={() => markRead.mutate(notification.id)}
                    className="shrink-0 text-blue-400 hover:text-blue-600 p-1"
                    title="Mark as read"
                  >
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
