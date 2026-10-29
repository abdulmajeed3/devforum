from django.urls import path

from .views import AnswerVoteView, QuestionVoteView

urlpatterns = [
    path('questions/<int:pk>/', QuestionVoteView.as_view(), name='question_vote'),
    path('answers/<int:pk>/', AnswerVoteView.as_view(), name='answer_vote'),
]
