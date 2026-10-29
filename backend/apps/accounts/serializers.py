from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class AuthorSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    reputation = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'display_name', 'avatar_url', 'reputation')

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password_confirm', 'display_name')

    def validate_username(self, value):
        if not value.replace('_', '').replace('-', '').isalnum():
            raise serializers.ValidationError(
                'Username may only contain letters, numbers, hyphens, and underscores.'
            )
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class PublicUserSerializer(serializers.ModelSerializer):
    reputation = serializers.IntegerField(read_only=True)
    question_count = serializers.SerializerMethodField()
    answer_count = serializers.SerializerMethodField()
    accepted_answer_count = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'display_name', 'bio', 'avatar_url',
            'website', 'location', 'date_joined',
            'reputation', 'question_count', 'answer_count', 'accepted_answer_count',
        )

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_answer_count(self, obj):
        return obj.answers.count()

    def get_accepted_answer_count(self, obj):
        return obj.answers.filter(is_accepted=True).count()

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None


class CurrentUserSerializer(PublicUserSerializer):
    class Meta(PublicUserSerializer.Meta):
        fields = PublicUserSerializer.Meta.fields + ('email',)  # type: ignore[assignment]


class UpdateProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ('display_name', 'bio', 'website', 'location', 'avatar')

    def validate_avatar(self, value):
        if value:
            import os

            from django.conf import settings
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in settings.ALLOWED_AVATAR_EXTENSIONS:
                raise serializers.ValidationError(
                    f'Unsupported file extension. Allowed: {", ".join(settings.ALLOWED_AVATAR_EXTENSIONS)}'
                )
            if value.size > settings.MAX_AVATAR_SIZE_MB * 1024 * 1024:
                raise serializers.ValidationError(
                    f'Avatar must be smaller than {settings.MAX_AVATAR_SIZE_MB}MB.'
                )
        return value


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs.pop('new_password_confirm'):
            raise serializers.ValidationError({'new_password_confirm': 'Passwords do not match.'})
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Incorrect current password.')
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token
