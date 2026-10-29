from django.contrib import admin

from .models import Vote


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['author', 'value', 'question', 'answer', 'created_at']
    list_filter = ['value', 'created_at']
    search_fields = ['author__username']
    readonly_fields = ['created_at']
