from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.questions.models import Answer, Question

from .models import Vote


@transaction.atomic
def cast_vote(author, target_obj, value: int) -> dict:
    is_question = isinstance(target_obj, Question)

    if author == target_obj.author:
        raise ValidationError('You cannot vote on your own content.')

    if is_question:
        existing = Vote.objects.filter(author=author, question=target_obj).first()
    else:
        existing = Vote.objects.filter(author=author, answer=target_obj).first()

    if existing:
        if existing.value == value:
            existing.delete()
            delta = -value
            user_vote = None
        else:
            delta = value - existing.value
            existing.value = value
            existing.save(update_fields=['value'])
            user_vote = value
    else:
        kwargs = {'author': author, 'value': value}
        if is_question:
            kwargs['question'] = target_obj
        else:
            kwargs['answer'] = target_obj
        Vote.objects.create(**kwargs)
        delta = value
        user_vote = value

    if is_question:
        Question.objects.filter(pk=target_obj.pk).update(vote_score=target_obj.vote_score + delta)
        target_obj.refresh_from_db(fields=['vote_score'])
    else:
        Answer.objects.filter(pk=target_obj.pk).update(vote_score=target_obj.vote_score + delta)
        target_obj.refresh_from_db(fields=['vote_score'])

    return {'vote_score': target_obj.vote_score, 'user_vote': user_vote}
