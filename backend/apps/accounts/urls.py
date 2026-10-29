from django.urls import path
from rest_framework_simplejwt.views import TokenBlacklistView, TokenRefreshView

from .views import (
    ChangePasswordView,
    CurrentUserView,
    CustomTokenObtainPairView,
    PublicProfileView,
    RegisterView,
    UserListView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('me/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<str:username>/', PublicProfileView.as_view(), name='public_profile'),
]
