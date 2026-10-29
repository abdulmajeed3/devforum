from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts.serializers import AuthorSerializer
from apps.tags.models import Tag
from apps.tags.serializers import TagMinimalSerializer

from .models import Answer, Comment, Question

User = get_user_model()


class CommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'author', 'body', 'created_at', 'updated_at')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

    def validate_body(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Comment must be at least 10 characters.')
        return value


class AnswerSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    user_vote = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = (
            'id', 'question', 'author', 'body', 'is_accepted',
            'vote_score', 'user_vote', 'comments', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'author', 'is_accepted', 'vote_score', 'user_vote', 'created_at', 'updated_at')

    def validate_body(self, value):
        if len(value.strip()) < 30:
            raise serializers.ValidationError('Answer body must be at least 30 characters.')
        return value

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        vote = obj.votes.filter(author=request.user).first()
        return vote.value if vote else None


class QuestionListSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    tags = TagMinimalSerializer(many=True, read_only=True)
    answer_count = serializers.IntegerField(read_only=True)
    has_accepted_answer = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = (
            'id', 'title', 'author', 'tags', 'status',
            'vote_score', 'answer_count', 'has_accepted_answer',
            'view_count', 'created_at', 'updated_at',
        )

    def get_has_accepted_answer(self, obj):
        return obj.answers.filter(is_accepted=True).exists()


class QuestionDetailSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    tags = TagMinimalSerializer(many=True, read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    answer_count = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()
    has_accepted_answer = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = (
            'id', 'title', 'body', 'author', 'tags', 'status',
            'vote_score', 'user_vote', 'view_count',
            'answer_count', 'has_accepted_answer',
            'answers', 'comments', 'created_at', 'updated_at',
        )

    def get_answer_count(self, obj):
        return obj.answers.count()

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        vote = obj.votes.filter(author=request.user).first()
        return vote.value if vote else None

    def get_has_accepted_answer(self, obj):
        return obj.answers.filter(is_accepted=True).exists()


class QuestionCreateSerializer(serializers.ModelSerializer):
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Tag.objects.all(), source='tags', required=False
    )
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True, required=False
    )

    class Meta:
        model = Question
        fields = ('title', 'body', 'tag_ids', 'tag_names')

    def validate_title(self, value):
        if len(value.strip()) < 15:
            raise serializers.ValidationError('Title must be at least 15 characters.')
        return value

    def validate_body(self, value):
        if len(value.strip()) < 30:
            raise serializers.ValidationError('Body must be at least 30 characters.')
        return value

    def create(self, validated_data):
        from django.utils.text import slugify
        tag_names = validated_data.pop('tag_names', [])
        tags = list(validated_data.pop('tags', []))
        question = Question.objects.create(**validated_data)
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(
                slug=slugify(name.lower()),
                defaults={'name': name.lower()}
            )
            tags.append(tag)
        question.tags.set(tags)
        return question

    def update(self, instance, validated_data):
        from django.utils.text import slugify
        tag_names = validated_data.pop('tag_names', None)
        tags = validated_data.pop('tags', None)
        instance.title = validated_data.get('title', instance.title)
        instance.body = validated_data.get('body', instance.body)
        instance.save()
        if tags is not None or tag_names is not None:
            all_tags = list(tags or [])
            for name in (tag_names or []):
                tag, _ = Tag.objects.get_or_create(
                    slug=slugify(name.lower()),
                    defaults={'name': name.lower()}
                )
                all_tags.append(tag)
            instance.tags.set(all_tags)
        return instance
