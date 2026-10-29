from django.urls import path

from .views import TagDetailView, TagListView

urlpatterns = [
    path('', TagListView.as_view(), name='tag_list'),
    path('<slug:slug>/', TagDetailView.as_view(), name='tag_detail'),
]
