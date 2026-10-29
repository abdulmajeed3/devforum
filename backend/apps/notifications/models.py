from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_ANSWER = 'answer'
    TYPE_COMMENT = 'comment'
    TYPE_VOTE = 'vote'
    TYPE_ACCEPTED = 'accepted'
    TYPE_CHOICES = [
        (TYPE_ANSWER, 'New answer'),
        (TYPE_COMMENT, 'New comment'),
        (TYPE_VOTE, 'Vote received'),
        (TYPE_ACCEPTED, 'Answer accepted'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_notifications',
    )
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    question = models.ForeignKey(
        'questions.Question',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
    )
    answer = models.ForeignKey(
        'questions.Answer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications_notification'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read']),
        ]
