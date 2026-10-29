import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.questions.models import Question

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user(db):
    counter = [0]

    def make_user(**kwargs):
        counter[0] += 1
        defaults = {"email": f"u{counter[0]}@example.com", "username": f"u{counter[0]}", "password": "pass"}
        defaults.update(kwargs)
        return User.objects.create_user(**defaults)

    return make_user


@pytest.fixture
def create_question(db, create_user):
    def make(author=None, **kwargs):
        if author is None:
            author = create_user()
        return Question.objects.create(
            author=author,
            title="Sample question title that is long enough",
            body="Sample question body content.",
            **kwargs
        )

    return make


@pytest.mark.django_db
class TestVoting:
    def test_upvote_question(self, api_client, create_user, create_question):
        voter = create_user()
        question = create_question()
        api_client.force_authenticate(user=voter)
        url = reverse('question_vote', kwargs={'pk': question.pk})
        response = api_client.post(url, {"value": 1})
        assert response.status_code == status.HTTP_200_OK
        assert response.data['vote_score'] == 1
        assert response.data['user_vote'] == 1

    def test_cannot_vote_twice(self, api_client, create_user, create_question):
        voter = create_user()
        question = create_question()
        api_client.force_authenticate(user=voter)
        url = reverse('question_vote', kwargs={'pk': question.pk})
        api_client.post(url, {"value": 1})
        response = api_client.post(url, {"value": 1})
        # Second same-value vote removes it (toggle)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['vote_score'] == 0
        assert response.data['user_vote'] is None

    def test_change_vote(self, api_client, create_user, create_question):
        voter = create_user()
        question = create_question()
        api_client.force_authenticate(user=voter)
        url = reverse('question_vote', kwargs={'pk': question.pk})
        api_client.post(url, {"value": 1})
        response = api_client.post(url, {"value": -1})
        assert response.status_code == status.HTTP_200_OK
        assert response.data['vote_score'] == -1
        assert response.data['user_vote'] == -1

    def test_cannot_vote_own_content(self, api_client, create_user, create_question):
        user = create_user()
        question = create_question(author=user)
        api_client.force_authenticate(user=user)
        url = reverse('question_vote', kwargs={'pk': question.pk})
        response = api_client.post(url, {"value": 1})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_vote_requires_auth(self, api_client, create_question):
        question = create_question()
        url = reverse('question_vote', kwargs={'pk': question.pk})
        response = api_client.post(url, {"value": 1})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
