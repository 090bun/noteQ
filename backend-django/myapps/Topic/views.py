import requests
from django.shortcuts import render
from django.http import JsonResponse
from .serializers import UserFavoriteSerializer, TopicSerializer,  NoteSerializer, ChatSerializer, AiPromptSerializer ,AiInteractionSerializer ,QuizSerializer , UserFamiliaritySerializer, DifficultyLevelsSerializer
from .models import UserFavorite, Topic,  Note, Chat, AiPrompt,AiInteraction , Quiz , UserFamiliarity, DifficultyLevels
from myapps.Authorization.serializers import UserSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny , IsAuthenticated
from rest_framework.decorators import api_view , permission_classes
from django.utils import timezone
from rest_framework.response import Response

# Create your views here.

# flask api接口
# 產生題目和取得題目
class QuizViewSet(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # 傳給 Flask 做處理
            flask_response = requests.post(
                'http://localhost:5000/api/quiz',
                json=request.data  # 傳遞請求資料
            )
            
            # 檢查 Flask 響應狀態
            if flask_response.status_code != 201:
                return Response({
                    'error': f'Flask service error: {flask_response.status_code}',
                    'details': flask_response.text
                }, status=500)
            
            result = flask_response.json()
            
            # 從請求中獲取 user_id（可能來自 Flask 的回應或原始請求）
            user_id = request.data.get('user_id') or result.get('user')
            user_instance = None
            
            # 如果有 user_id，取得 User 實例
            if user_id:
                from myapps.Authorization.models import User
                try:
                    user_instance = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    return Response({
                        'error': f'User with ID {user_id} not found'
                    }, status=400)
            
            # 返回結果 寫回資料庫
            # 檢查是否已存在相同的 Quiz（根據 quiz_topic 和 user），如果存在就使用現有的
            quiz, created = Quiz.objects.get_or_create(
                quiz_topic=result.get('quiz_topic'),
                user=user_instance,  # 加入 user 作為查詢條件
                defaults={
                    'quiz_topic': result.get('quiz_topic'),
                    'user': user_instance
                }
            )
            
            # 如果是新創建的 Quiz，記錄日誌
            if created:
                print(f"Created new Quiz: {quiz.quiz_topic} for user: {user_instance}")
            else:
                print(f"Using existing Quiz: {quiz.quiz_topic} for user: {user_instance}")
            
            # 然後創建 Topic，並關聯到 Quiz
            topics = []
            for q in result.get('questions', []):
                topic = Topic.objects.create(
                    quiz_topic=quiz,  # 關聯到 Quiz 實例
                    title=q.get('title'),
                    option_A=q.get('option_A'),
                    option_B=q.get('option_B'),
                    option_C=q.get('option_C'),
                    option_D=q.get('option_D'),
                    Ai_answer=q.get('Ai_answer')
                )
                topics.append(topic)
            
            # 生成新題目後，軟刪除同一個 Quiz 下的舊 Topics（保留最新的）
            old_topics = Topic.objects.filter(
                quiz_topic=quiz
            ).exclude(id=topic.id).order_by('-created_at')
            
            for old_topic in old_topics:
                old_topic.soft_delete()
                print(f"Soft deleted old topic: {old_topic.title}")
            
            print(f"Kept latest topic: {topic.title}")

            # 重新從資料庫獲取 quiz 實例以確保最新資料
            quiz.refresh_from_db()
            
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
    
    def get(self, request):
        # 直接從 Django 資料庫獲取資料，不調用 Flask
        try:
            # 獲取所有 Quiz 和相關的 Topic
            quizzes = Quiz.objects.filter(deleted_at__isnull=True)
            
            quiz_list = []
            for quiz in quizzes:
                # 獲取該 Quiz 相關的 Topics
                topics = Topic.objects.filter(quiz_topic=quiz)
                
                quiz_data = {
                    'id': quiz.id,
                    'quiz_topic': quiz.quiz_topic,
                    'created_at': quiz.created_at.isoformat() if quiz.created_at else None,
                    'topics': []
                }
                
                for topic in topics:
                    topic_data = {
                        'id': topic.id,
                        'title': topic.title,
                        'User_answer': topic.User_answer,
                        'Ai_answer': topic.Ai_answer,
                        'created_at': topic.created_at.isoformat() if topic.created_at else None
                    }
                    quiz_data['topics'].append(topic_data)
                
                quiz_list.append(quiz_data)
            
            return Response(quiz_list)
            
        except Exception as e:
            return Response({
                'error': f'Internal server error: {str(e)}'
            }, status=500)

# 根據題目ID獲取單個題目詳細資料
class TopicDetailViewSet(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, topic_id):
        """根據題目ID獲取題目詳細資料"""
        try:
            # 獲取單個 Topic
            topic = Topic.objects.select_related('quiz_topic').get(
                id=topic_id, 
                deleted_at__isnull=True
            )
            
            # 構建返回資料
            topic_data = {
                'id': topic.id,
                'title': topic.title,
                'option_A': topic.option_A,
                'option_B': topic.option_B,
                'option_C': topic.option_C,
                'option_D': topic.option_D,
                'User_answer': topic.User_answer,
                'Ai_answer': topic.Ai_answer,
                'created_at': topic.created_at.isoformat() if topic.created_at else None,
                'quiz': {
                    'id': topic.quiz_topic.id,
                    'quiz_topic': topic.quiz_topic.quiz_topic,
                    'created_at': topic.quiz_topic.created_at.isoformat() if topic.quiz_topic.created_at else None
                }
            }
            
            return Response(topic_data)
            
        except Topic.DoesNotExist:
            return Response({
                'error': f'Topic with ID {topic_id} not found'
            }, status=404)
        except Exception as e:
            return Response({
                'error': f'Internal server error: {str(e)}'
            }, status=500)



# 根據Quiz ID獲取該Quiz下的所有題目
class QuizTopicsViewSet(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, quiz_id):
        """根據Quiz ID獲取該Quiz下的所有題目"""
        try:
            # 檢查 Quiz 是否存在
            quiz = Quiz.objects.get(id=quiz_id, deleted_at__isnull=True)
            
            # 獲取該 Quiz 下的所有 Topics
            topics = Topic.objects.filter(
                quiz_topic=quiz,
                deleted_at__isnull=True
            ).order_by('created_at')
            
            # 構建返回資料
            quiz_data = {
                'id': quiz.id,
                'user': quiz.user.id if quiz.user else None,
                'quiz_topic': quiz.quiz_topic,
                'created_at': quiz.created_at.isoformat() if quiz.created_at else None,
                'topics': []
            }
            
            for topic in topics:
                topic_data = {
                    'id': topic.id,
                    'title': topic.title,
                    'option_A': topic.option_A,
                    'option_B': topic.option_B,
                    'option_C': topic.option_C,
                    'option_D': topic.option_D,
                    'User_answer': topic.User_answer,
                    'Ai_answer': topic.Ai_answer,
                    'created_at': topic.created_at.isoformat() if topic.created_at else None
                }
                quiz_data['topics'].append(topic_data)
            
            return Response(quiz_data)
            
        except Quiz.DoesNotExist:
            return Response({
                'error': f'Quiz with ID {quiz_id} not found'
            }, status=404)
        except Exception as e:
            return Response({
                'error': f'Internal server error: {str(e)}'
            }, status=500)

# 前端回傳要收藏的題目 加入到 userfavorites 和 note
class AddFavoriteViewSet(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            user = request.data.get('user_id')  # 從請求中獲取當前使用者
            topic = request.data.get('topic_id')
            print(f"~~~~~ 使用者: {user} 要收藏的題目ID: {topic} ~~~~~")
            if not user:
                return Response({'error': 'User is not authenticated'}, status=401)
            if not topic:
                return Response({'error': 'Topic ID is required'}, status=400)
            
            
            # 獲取 User 實例
            from myapps.Authorization.models import User
            try:
                user_instance = User.objects.get(id=user)
            except User.DoesNotExist:
                return Response({'error': f'User with ID {user} not found'}, status=404)


            # 檢查 Topic 是否存在
            topic_instance = Topic.objects.filter(id=topic, deleted_at__isnull=True).first()
            if not topic_instance:
                return Response({'error': 'Topic not found'}, status=404)
            
            # 檢查該 Topic 的 Quiz 是否屬於該使用者
            if topic_instance.quiz_topic.user != user_instance:
                return Response({
                    'error': 'You can only favorite topics from your own quizzes'
                }, status=403)
            
            # 檢查是否已經收藏過
            existing_favorite = UserFavorite.objects.filter(
                user=user_instance,
                topic=topic_instance,
                deleted_at__isnull=True
            ).first()
            if existing_favorite:
                return Response({'message': 'This topic is already in your favorites'}, status=200) 
            # 創建 UserFavorite 實例
            user_favorite = UserFavorite.objects.create(
                user=user_instance,
                topic=topic_instance,
                note=Note.objects.create(
                    quiz_topic=topic_instance.quiz_topic,
                    user=user_instance,
                    is_retake=False  # 修正欄位名稱
                )
            )
            # 序列化返回資料
            serializer = UserFavoriteSerializer(user_favorite)
            return Response(serializer.data, status=201)
        except Exception as e:
            return Response({'error': f'Internal server error: {str(e)}'}, status=500)

class ChatViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """獲取聊天記錄"""
        try:
            topic_id = request.GET.get('topic_id')
            user_id = request.GET.get('user_id')
            
            if not topic_id:
                return Response({'error': 'topic_id is required'}, status=400)
            
            # 構建查詢條件
            filters = {'topic_id': topic_id, 'deleted_at__isnull': True}
            if user_id:
                filters['user_id'] = user_id
            
            # 獲取聊天記錄，按時間排序
            chats = Chat.objects.filter(**filters).order_by('created_at')
            
            # 序列化並返回
            serializer = ChatSerializer(chats, many=True)
            return Response({
                'topic_id': topic_id,
                'chat_history': serializer.data,
                'total_messages': chats.count()
            }, status=200)
            
        except Exception as e:
            return Response({
                'error': f'Internal server error: {str(e)}'
            }, status=500)

    def post(self, request):
        """處理聊天訊息"""
        try:
            print(f"~~~~~ Django 收到的請求資料: {request.data} ~~~~~")
            
            # 檢查必要欄位是否存在
            user_id = request.data.get('user_id')
            topic_id = request.data.get('topic_id')
            content = request.data.get('content') or request.data.get('message')
            
            if not user_id:
                return Response({'error': 'user_id is required'}, status=400)
            if not topic_id:
                return Response({'error': 'topic_id is required'}, status=400)
            if not content:
                return Response({'error': 'content or message is required'}, status=400)
            
            # 驗證用戶和主題存在
            from myapps.Authorization.models import User
            try:
                user_instance = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({
                    'error': f'User with ID {user_id} not found'
                }, status=400)
            
            try:
                topic_instance = Topic.objects.get(id=topic_id, deleted_at__isnull=True)
            except Topic.DoesNotExist:
                return Response({
                    'error': f'Topic with ID {topic_id} not found'
                }, status=404)
            
            # 1. 先儲存用戶訊息
            user_chat = Chat.objects.create(
                user=user_instance,
                topic=topic_instance,
                content=content,
                sender='user'
            )
            
            # 2. 獲取歷史對話記錄用於 AI 思考
            chat_history = Chat.objects.filter(
                topic=topic_instance, 
                deleted_at__isnull=True
            ).order_by('created_at').values('content', 'sender')
            
            # 準備傳送給 Flask 的資料，包含歷史對話
            flask_data = {
                'user_id': user_id,
                'topic_id': topic_id,
                'content': content,
                'chat_history': list(chat_history)  # 包含歷史對話供 AI 參考
            }
            
            print(f"~~~~~ 傳送給 Flask 的資料: {flask_data} ~~~~~")
            
            # 3. 傳給 Flask 做處理
            flask_response = requests.post(
                'http://localhost:5000/api/chat',
                json=flask_data
            )
        
            # 檢查 Flask 響應狀態
            if flask_response.status_code not in [200, 201]:
                return Response({
                    'error': f'Flask service error: {flask_response.status_code}',
                    'details': flask_response.text
                }, status=500)
            
            result = flask_response.json()
            print(f"~~~~~ Flask 回傳的資料: {result} ~~~~~")
            
            # 4. 儲存 AI 回應
            ai_chat = Chat.objects.create(
                user=user_instance,
                topic=topic_instance,
                content=result.get('response', ''),
                sender='ai'
            )
            
            # 5. 返回雙方的訊息
            return Response({
                'user_message': ChatSerializer(user_chat).data,
                'ai_response': ChatSerializer(ai_chat).data,
                'conversation_id': topic_id
            }, status=201)
            
        except requests.exceptions.ConnectionError:
            return Response({
                'error': 'Cannot connect to Flask service. Make sure it is running on port 5000.'
            }, status=503)
        except Exception as e:
            return Response({
                'error': f'Internal server error: {str(e)}'
            }, status=500)  