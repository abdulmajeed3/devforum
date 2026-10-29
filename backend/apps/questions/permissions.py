from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class IsQuestionAuthor(permissions.BasePermission):
    message = 'Only the question author can perform this action.'

    def has_object_permission(self, request, view, obj):
        return obj.question.author == request.user
