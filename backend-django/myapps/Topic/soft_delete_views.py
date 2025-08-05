from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Quiz, Topic

# 軟刪除管理視圖
class SoftDeleteManagementViewSet(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, quiz_id):
        """軟刪除 Quiz 及其所有相關 Topic"""
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            quiz.soft_delete()
            
            return Response({
                'message': f'Quiz "{quiz.quiz_topic}" and all its topics have been soft deleted'
            })
            
        except Quiz.DoesNotExist:
            return Response({
                'error': f'Quiz with ID {quiz_id} not found'
            }, status=404)
        except Exception as e:
            return Response({
                'error': f'Internal server error: {str(e)}'
            }, status=500)
    
    def post(self, request, quiz_id):
        """恢復軟刪除的 Quiz"""
        try:
            quiz = Quiz.all_objects.get(id=quiz_id)
            quiz.restore()
            
            return Response({
                'message': f'Quiz "{quiz.quiz_topic}" has been restored'
            })
            
        except Quiz.DoesNotExist:
            return Response({
                'error': f'Quiz with ID {quiz_id} not found'
            }, status=404)
        except Exception as e:
            return Response({
                'error': f'Internal server error: {str(e)}'
            }, status=500)
    
    def get(self, request):
        """獲取所有軟刪除的 Quiz"""
        try:
            deleted_quizzes = Quiz.all_objects.filter(deleted_at__isnull=False)
            
            quiz_list = []
            for quiz in deleted_quizzes:
                quiz_data = {
                    'id': quiz.id,
                    'quiz_topic': quiz.quiz_topic,
                    'created_at': quiz.created_at.isoformat() if quiz.created_at else None,
                    'deleted_at': quiz.deleted_at.isoformat() if quiz.deleted_at else None
                }
                quiz_list.append(quiz_data)
            
            return Response(quiz_list)
            
        except Exception as e:
            return Response({
                'error': f'Internal server error: {str(e)}'
            }, status=500)
