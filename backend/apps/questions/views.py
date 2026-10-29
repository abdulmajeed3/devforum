from django.db import transaction
from django.db.models import Count
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications.services import create_notification

from .filters import QuestionFilter
from .models import Answer, Comment, Question
from .permissions import IsAuthorOrReadOnly
from .serializers import (
    AnswerSerializer,
    CommentSerializer,
    QuestionCreateSerializer,
    QuestionDetailSerializer,
    QuestionListSerializer,
)


class QuestionListCreateView(generics.ListCreateAPIView):
    filterset_class = QuestionFilter
    search_fields = ['title', 'body', 'tags__name']
    ordering_fields = ['created_at', 'vote_score', 'view_count']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return QuestionCreateSerializer
        return QuestionListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        return Question.objects.select_related('author').prefetch_related('tags').annotate(
            answer_count=Count('answers')
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthorOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return QuestionCreateSerializer
        return QuestionDetailSerializer

    def get_queryset(self):
        return Question.objects.select_related('author').prefetch_related(
            'tags', 'answers__author', 'answers__comments__author',
            'answers__votes', 'comments__author', 'votes',
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Question.objects.filter(pk=instance.pk).update(view_count=instance.view_count + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


class AnswerListCreateView(generics.ListCreateAPIView):
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Answer.objects.filter(
            question_id=self.kwargs['pk']
        ).select_related('author').prefetch_related('comments__author', 'votes').order_by(
            '-is_accepted', '-vote_score', '-created_at'
        )

    def perform_create(self, serializer):
        question = Question.objects.get(pk=self.kwargs['pk'])
        answer = serializer.save(author=self.request.user, question=question)
        if question.author != self.request.user:
            create_notification(
                recipient=question.author,
                sender=self.request.user,
                notification_type='answer',
                question=question,
                answer=answer,
            )


class AnswerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthorOrReadOnly]
    queryset = Answer.objects.select_related('author', 'question').prefetch_related('comments__author', 'votes')

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


class AcceptAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, question_pk, answer_pk):
        try:
            question = Question.objects.select_for_update().get(pk=question_pk)
            answer = Answer.objects.get(pk=answer_pk, question=question)
        except Question.DoesNotExist:
            return Response({'detail': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Answer.DoesNotExist:
            return Response({'detail': 'Answer not found for this question.'}, status=status.HTTP_404_NOT_FOUND)

        if question.author != request.user:
            return Response(
                {'detail': 'Only the question author can accept an answer.'},
                status=status.HTTP_403_FORBIDDEN
            )

        Answer.objects.filter(question=question, is_accepted=True).update(is_accepted=False)
        answer.is_accepted = True
        answer.save(update_fields=['is_accepted'])
        question.status = Question.STATUS_SOLVED
        question.save(update_fields=['status'])
        if answer.author != request.user:
            create_notification(
                recipient=answer.author,
                sender=request.user,
                notification_type='accepted',
                question=question,
                answer=answer,
            )
        return Response({'detail': 'Answer accepted.', 'answer_id': answer.pk})


class UnacceptAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, question_pk, answer_pk):
        try:
            question = Question.objects.select_for_update().get(pk=question_pk)
            answer = Answer.objects.get(pk=answer_pk, question=question, is_accepted=True)
        except Question.DoesNotExist:
            return Response({'detail': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Answer.DoesNotExist:
            return Response({'detail': 'Accepted answer not found.'}, status=status.HTTP_404_NOT_FOUND)

        if question.author != request.user:
            return Response(
                {'detail': 'Only the question author can unaccept an answer.'},
                status=status.HTTP_403_FORBIDDEN
            )

        answer.is_accepted = False
        answer.save(update_fields=['is_accepted'])
        if not question.answers.filter(is_accepted=True).exists():
            question.status = Question.STATUS_OPEN
            question.save(update_fields=['status'])
        return Response({'detail': 'Answer unaccepted.'})


class QuestionCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Comment.objects.filter(question_id=self.kwargs['pk']).select_related('author')

    def perform_create(self, serializer):
        question = Question.objects.get(pk=self.kwargs['pk'])
        serializer.save(author=self.request.user, question=question)


class AnswerCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Comment.objects.filter(answer_id=self.kwargs['pk']).select_related('author')

    def perform_create(self, serializer):
        answer = Answer.objects.get(pk=self.kwargs['pk'])
        serializer.save(author=self.request.user, answer=answer)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthorOrReadOnly]
    queryset = Comment.objects.select_related('author')

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
