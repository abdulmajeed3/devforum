from .models import Notification


def create_notification(recipient, sender, notification_type, question=None, answer=None):
    if recipient == sender:
        return None
    return Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        question=question,
        answer=answer,
    )
