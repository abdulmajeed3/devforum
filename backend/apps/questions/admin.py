from django.contrib import admin

from .models import Answer, Comment, Question


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0
    readonly_fields = ['author', 'vote_score', 'is_accepted', 'created_at']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'status', 'vote_score', 'view_count', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'body', 'author__username']
    readonly_fields = ['vote_score', 'view_count', 'created_at', 'updated_at']
    inlines = [AnswerInline]


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'is_accepted', 'vote_score', 'created_at']
    list_filter = ['is_accepted', 'created_at']
    search_fields = ['body', 'author__username']
    readonly_fields = ['vote_score', 'created_at', 'updated_at']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'body', 'question', 'answer', 'created_at']
    search_fields = ['body', 'author__username']
    readonly_fields = ['created_at', 'updated_at']
