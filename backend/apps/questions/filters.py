import django_filters

from .models import Question


class QuestionFilter(django_filters.FilterSet):
    tag = django_filters.CharFilter(field_name='tags__slug', lookup_expr='iexact')
    status = django_filters.CharFilter(field_name='status')
    author = django_filters.CharFilter(field_name='author__username', lookup_expr='iexact')
    has_accepted_answer = django_filters.BooleanFilter(method='filter_has_accepted')
    unanswered = django_filters.BooleanFilter(method='filter_unanswered')

    class Meta:
        model = Question
        fields = ['tag', 'status', 'author', 'has_accepted_answer', 'unanswered']

    def filter_has_accepted(self, queryset, name, value):
        if value:
            return queryset.filter(answers__is_accepted=True).distinct()
        return queryset.exclude(answers__is_accepted=True).distinct()

    def filter_unanswered(self, queryset, name, value):
        if value:
            return queryset.filter(answers__isnull=True)
        return queryset
