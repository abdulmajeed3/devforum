from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.questions.models import Answer, Question

from .serializers import VoteSerializer
from .services import cast_vote


class QuestionVoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            question = Question.objects.get(pk=pk)
        except Question.DoesNotExist:
            return Response({'detail': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = VoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = cast_vote(request.user, question, serializer.validated_data['value'])
        return Response(result)


class AnswerVoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            answer = Answer.objects.get(pk=pk)
        except Answer.DoesNotExist:
            return Response({'detail': 'Answer not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = VoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = cast_vote(request.user, answer, serializer.validated_data['value'])
        return Response(result)
