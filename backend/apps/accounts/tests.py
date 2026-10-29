import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user(db):
    def make_user(**kwargs):
        defaults = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpass123",
        }
        defaults.update(kwargs)
        return User.objects.create_user(**defaults)
    return make_user


@pytest.fixture
def auth_client(api_client, create_user):
    user = create_user()
    api_client.force_authenticate(user=user)
    return api_client, user


@pytest.mark.django_db
class TestRegistration:
    def test_register_success(self, api_client):
        url = reverse('register')
        data = {
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert 'access' in response.data
        assert 'user' in response.data

    def test_register_duplicate_email(self, api_client, create_user):
        create_user(email="existing@example.com")
        url = reverse('register')
        data = {
            "email": "existing@example.com",
            "username": "different",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_password_mismatch(self, api_client):
        url = reverse('register')
        data = {
            "email": "user@example.com",
            "username": "user123",
            "password": "StrongPass123!",
            "password_confirm": "Different123!",
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestAuthentication:
    def test_login_success(self, api_client, create_user):
        create_user(email="login@example.com", password="testpass123")
        url = reverse('login')
        response = api_client.post(url, {"email": "login@example.com", "password": "testpass123"})
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_wrong_password(self, api_client, create_user):
        create_user(email="login@example.com", password="testpass123")
        url = reverse('login')
        response = api_client.post(url, {"email": "login@example.com", "password": "wrongpassword"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_current_user_requires_auth(self, api_client):
        url = reverse('current_user')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_current_user_returns_user(self, auth_client):
        client, user = auth_client
        url = reverse('current_user')
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == user.email

    def test_public_profile_not_expose_email(self, api_client, create_user):
        create_user(username="publicuser", email="publicuser@example.com")
        url = reverse('public_profile', kwargs={'username': 'publicuser'})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'email' not in response.data
