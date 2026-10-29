from django.urls import path

from .views import MarkAllReadView, MarkNotificationReadView, NotificationCountView, NotificationListView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('count/', NotificationCountView.as_view(), name='notification_count'),
    path('mark-all-read/', MarkAllReadView.as_view(), name='mark_all_read'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark_notification_read'),
]
