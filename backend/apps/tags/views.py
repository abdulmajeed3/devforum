from django.db.models import Count
from rest_framework import generics, permissions

from .models import Tag
from .serializers import TagSerializer


class TagListView(generics.ListCreateAPIView):
    serializer_class = TagSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        return Tag.objects.annotate(question_count=Count('questions')).order_by('-question_count', 'name')


class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
