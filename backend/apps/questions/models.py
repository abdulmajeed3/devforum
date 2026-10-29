from django.conf import settings
from django.db import models


class Question(models.Model):
    STATUS_OPEN = 'open'
    STATUS_SOLVED = 'solved'
    STATUS_CLOSED = 'closed'
    STATUS_CHOICES = [
        (STATUS_OPEN, 'Open'),
        (STATUS_SOLVED, 'Solved'),
        (STATUS_CLOSED, 'Closed'),
    ]

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='questions',
    )
    title = models.CharField(max_length=300)
    body = models.TextField()
    tags = models.ManyToManyField('tags.Tag', related_name='questions', blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_OPEN)
    view_count = models.PositiveIntegerField(default=0)
    vote_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'questions_question'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['-vote_score']),
            models.Index(fields=['status']),
            models.Index(fields=['author']),
        ]

    def __str__(self):
        return self.title

    @property
    def answer_count(self):
        return self.answers.count()

    @property
    def accepted_answer(self):
        return self.answers.filter(is_accepted=True).first()


class Answer(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='answers',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='answers',
    )
    body = models.TextField()
    is_accepted = models.BooleanField(default=False)
    vote_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'questions_answer'
        ordering = ['-is_accepted', '-vote_score', '-created_at']
        indexes = [
            models.Index(fields=['question', '-is_accepted', '-vote_score']),
            models.Index(fields=['author']),
        ]

    def __str__(self):
        return f'Answer by {self.author.username} on {self.question.title[:50]}'


class Comment(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='comments',
        null=True,
        blank=True,
    )
    answer = models.ForeignKey(
        Answer,
        on_delete=models.CASCADE,
        related_name='comments',
        null=True,
        blank=True,
    )
    body = models.CharField(max_length=600)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'questions_comment'
        ordering = ['created_at']
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(question__isnull=False, answer__isnull=True) |
                    models.Q(question__isnull=True, answer__isnull=False)
                ),
                name='comment_has_exactly_one_target',
            )
        ]
        indexes = [
            models.Index(fields=['question']),
            models.Index(fields=['answer']),
        ]

    def __str__(self):
        return f'Comment by {self.author.username}'
