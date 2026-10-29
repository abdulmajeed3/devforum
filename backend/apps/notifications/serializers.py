from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Notification

User = get_user_model()


class SenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'display_name')


class NotificationSerializer(serializers.ModelSerializer):
    sender = SenderSerializer(read_only=True)
    question_title = serializers.SerializerMethodField()
    question_id = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = (
            'id', 'sender', 'notification_type', 'question_id', 'question_title',
            'answer', 'is_read', 'created_at',
        )

    def get_question_title(self, obj):
        return obj.question.title if obj.question else None

    def get_question_id(self, obj):
        return obj.question.pk if obj.question else None
