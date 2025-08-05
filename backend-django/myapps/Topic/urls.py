from django.urls import path
from .views import CreateQuizViewSet

urlpatterns = [
    path('create_quiz/', CreateQuizViewSet.as_view(), name='create_quiz'),
]
