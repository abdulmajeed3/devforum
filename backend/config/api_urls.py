from django.urls import include, path

urlpatterns = [
    path('auth/', include('apps.accounts.urls')),
    path('questions/', include('apps.questions.urls')),
    path('tags/', include('apps.tags.urls')),
    path('votes/', include('apps.votes.urls')),
    path('notifications/', include('apps.notifications.urls')),
]
