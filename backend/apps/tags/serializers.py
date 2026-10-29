from rest_framework import serializers

from .models import Tag


class TagSerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Tag
        fields = ('id', 'name', 'slug', 'description', 'question_count', 'created_at')
        read_only_fields = ('id', 'slug', 'created_at')

    def validate_name(self, value):
        return value.lower().strip()


class TagMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'slug')
