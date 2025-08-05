import requests
from django.shortcuts import render
from django.http import JsonResponse
from .serializers import UserFavoriteSerializer, TopicSerializer, ScoreSerializer, NoteSerializer, ChatSerializer, AiPromptSerializer ,AiInteractionSerializer ,QuizSerializer
from .models import UserFavorite, Topic, Score, Note, Chat, AiPrompt,AiInteraction , Quiz
from myapps.Authorization.serializers import UserSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view , permission_classes
from django.utils import timezone
from rest_framework.response import Response

# Create your views here.

# flask api接口
# Topic接flask測試
class CreateQuizViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # 傳給 Flask 做處理
            flask_response = requests.post(
                'http://localhost:5000/api/create_quiz',
                json=request.data  # 傳遞請求資料
            )
            
            # 檢查 Flask 響應狀態
            if flask_response.status_code != 201:
                return Response({
                    'error': f'Flask service error: {flask_response.status_code}',
                    'details': flask_response.text
                }, status=500)
            
            result = flask_response.json()
            
            # 返回結果 寫回資料庫
            # 先創建 Quiz
            quiz = Quiz.objects.create(
                quiz_topic=result.get('quiz_topic')
            )
            
            # 然後創建 Topic，並關聯到剛創建的 Quiz
            topic = Topic.objects.create(
                quiz_topic=quiz,  # 關聯到剛創建的 Quiz 實例
                title=result.get('title'),
                subtitle=result.get('subtitle'),
                User_answer=result.get('User_answer'),
                Ai_answer=result.get('Ai_answer')
            )

            # 序列化返回資料
            quiz_serializer = QuizSerializer(quiz)
            serializer = TopicSerializer(topic)

            return Response({
                "quiz": quiz_serializer.data,
                "topic": serializer.data
            })

        except requests.exceptions.ConnectionError:
            return Response({
                'error': 'Cannot connect to Flask service. Make sure it is running on port 5000.'
            }, status=503)
        except Exception as e:
            return Response({
                'error': f'Internal server error: {str(e)}'
            }, status=500)