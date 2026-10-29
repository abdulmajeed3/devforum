from django.conf import settings
from django.db import models


class Vote(models.Model):
    UPVOTE = 1
    DOWNVOTE = -1
    VOTE_CHOICES = [(UPVOTE, 'Upvote'), (DOWNVOTE, 'Downvote')]

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='votes',
    )
    question = models.ForeignKey(
        'questions.Question',
        on_delete=models.CASCADE,
        related_name='votes',
        null=True,
        blank=True,
    )
    answer = models.ForeignKey(
        'questions.Answer',
        on_delete=models.CASCADE,
        related_name='votes',
        null=True,
        blank=True,
    )
    value = models.SmallIntegerField(choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'votes_vote'
        constraints = [
            models.UniqueConstraint(
                fields=['author', 'question'],
                condition=models.Q(question__isnull=False),
                name='unique_question_vote',
            ),
            models.UniqueConstraint(
                fields=['author', 'answer'],
                condition=models.Q(answer__isnull=False),
                name='unique_answer_vote',
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(question__isnull=False, answer__isnull=True) |
                    models.Q(question__isnull=True, answer__isnull=False)
                ),
                name='vote_has_exactly_one_target',
            ),
            models.CheckConstraint(
                condition=models.Q(value__in=[1, -1]),
                name='vote_value_valid',
            ),
        ]
        indexes = [
            models.Index(fields=['question', 'author']),
            models.Index(fields=['answer', 'author']),
        ]
