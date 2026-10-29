import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.questions.models import Answer, Question

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user(db):
    counter = [0]

    def make_user(**kwargs):
        counter[0] += 1
        defaults = {
            "email": f"user{counter[0]}@example.com",
            "username": f"user{counter[0]}",
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


@pytest.fixture
def create_question(db, create_user):
    def make_question(author=None, **kwargs):
        if author is None:
            author = create_user()
        defaults = {
            "author": author,
            "title": "How do I do something specific in Python?",
            "body": "I want to do something but I don't know how to do it properly in Python.",
        }
        defaults.update(kwargs)
        return Question.objects.create(**defaults)

    return make_question


@pytest.mark.django_db
class TestQuestions:
    def test_list_questions_anonymous(self, api_client):
        url = reverse('question_list_create')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_create_question_requires_auth(self, api_client):
        url = reverse('question_list_create')
        response = api_client.post(url, {"title": "Test question title here", "body": "Test body content that is long enough"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_question_authenticated(self, auth_client):
        client, user = auth_client
        url = reverse('question_list_create')
        data = {
            "title": "How do I test Django REST Framework properly?",
            "body": "I want to write comprehensive tests for my DRF API. What are the best practices?",
        }
        response = client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED

    def test_edit_own_question(self, auth_client, create_question):
        client, user = auth_client
        question = create_question(author=user)
        url = reverse('question_detail', kwargs={'pk': question.pk})
        response = client.patch(url, {"title": "Updated title that is long enough for validation"})
        assert response.status_code == status.HTTP_200_OK

    def test_cannot_edit_others_question(self, api_client, create_user, create_question):
        other_user = create_user()
        question = create_question(author=other_user)
        me = create_user()
        api_client.force_authenticate(user=me)
        url = reverse('question_detail', kwargs={'pk': question.pk})
        response = api_client.patch(url, {"title": "Trying to edit someone else's question"})
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestAnswers:
    def test_post_answer(self, auth_client, create_question):
        client, user = auth_client
        question = create_question()
        url = reverse('answer_list_create', kwargs={'pk': question.pk})
        data = {"body": "This is my answer to the question. It provides a detailed explanation of the topic."}
        response = client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED

    def test_accept_answer_by_question_author(self, api_client, create_user, create_question, db):
        author = create_user()
        other = create_user()
        question = create_question(author=author)
        answer = Answer.objects.create(
            question=question, author=other,
            body="This is a detailed answer to the question that solves the problem completely."
        )
        api_client.force_authenticate(user=author)
        url = reverse('accept_answer', kwargs={'question_pk': question.pk, 'answer_pk': answer.pk})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        answer.refresh_from_db()
        assert answer.is_accepted is True

    def test_cannot_accept_answer_non_author(self, api_client, create_user, create_question, db):
        author = create_user()
        other = create_user()
        intruder = create_user()
        question = create_question(author=author)
        answer = Answer.objects.create(
            question=question, author=other,
            body="This is a detailed answer to the question that explains everything clearly."
        )
        api_client.force_authenticate(user=intruder)
        url = reverse('accept_answer', kwargs={'question_pk': question.pk, 'answer_pk': answer.pk})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_only_one_accepted_answer(self, api_client, create_user, create_question, db):
        author = create_user()
        other1 = create_user()
        other2 = create_user()
        question = create_question(author=author)
        answer1 = Answer.objects.create(
            question=question, author=other1,
            body="First answer explaining the solution in detail for the question."
        )
        answer2 = Answer.objects.create(
            question=question, author=other2,
            body="Second answer providing an alternative solution to the problem."
        )
        api_client.force_authenticate(user=author)
        url1 = reverse('accept_answer', kwargs={'question_pk': question.pk, 'answer_pk': answer1.pk})
        api_client.post(url1)
        url2 = reverse('accept_answer', kwargs={'question_pk': question.pk, 'answer_pk': answer2.pk})
        api_client.post(url2)
        answer1.refresh_from_db()
        answer2.refresh_from_db()
        assert answer1.is_accepted is False
        assert answer2.is_accepted is True

    def test_cannot_accept_answer_from_wrong_question(self, api_client, create_user, create_question, db):
        author = create_user()
        other = create_user()
        question1 = create_question(author=author)
        question2 = create_question(author=author)
        answer_on_q2 = Answer.objects.create(
            question=question2, author=other,
            body="This is an answer on a different question that should not be accepted here."
        )
        api_client.force_authenticate(user=author)
        url = reverse('accept_answer', kwargs={'question_pk': question1.pk, 'answer_pk': answer_on_q2.pk})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
