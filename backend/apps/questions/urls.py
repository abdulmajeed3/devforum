from django.urls import path

from .views import (
    AcceptAnswerView,
    AnswerCommentListCreateView,
    AnswerDetailView,
    AnswerListCreateView,
    CommentDetailView,
    QuestionCommentListCreateView,
    QuestionDetailView,
    QuestionListCreateView,
    UnacceptAnswerView,
)

urlpatterns = [
    path('', QuestionListCreateView.as_view(), name='question_list_create'),
    path('<int:pk>/', QuestionDetailView.as_view(), name='question_detail'),
    path('<int:pk>/answers/', AnswerListCreateView.as_view(), name='answer_list_create'),
    path('<int:question_pk>/answers/<int:answer_pk>/accept/', AcceptAnswerView.as_view(), name='accept_answer'),
    path('<int:question_pk>/answers/<int:answer_pk>/unaccept/', UnacceptAnswerView.as_view(), name='unaccept_answer'),
    path('<int:pk>/comments/', QuestionCommentListCreateView.as_view(), name='question_comments'),
    path('answers/<int:pk>/', AnswerDetailView.as_view(), name='answer_detail'),
    path('answers/<int:pk>/comments/', AnswerCommentListCreateView.as_view(), name='answer_comments'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment_detail'),
]
