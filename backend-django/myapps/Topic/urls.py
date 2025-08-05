from django.urls import path
from .views import CreateQuizViewSet

urlpatterns = [
    path('quiz/', CreateQuizViewSet.as_view() , name='quiz'),  # 支援 POST 和 GET
]
