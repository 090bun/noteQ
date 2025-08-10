from django.urls import path
from .views import QuizViewSet , TopicDetailViewSet, QuizTopicsViewSet , AddFavoriteViewSet , ChatViewSet , ChatContentToNoteView,NoteEdit , NoteListView , CreateQuizTopicView ,UserQuizView ,RetestView
from .soft_delete_views import SoftDeleteManagementViewSet

urlpatterns = [
    # 創建題目和獲取所有題目
    path('quiz/', QuizViewSet.as_view(), name='quiz'),
    
    # 根據題目ID獲取單個題目詳細資料
    path('topic/<int:topic_id>/', TopicDetailViewSet.as_view(), name='topic_detail'),
    
    # 根據Quiz ID獲取該Quiz下的所有題目
    path('quiz/<int:quiz_id>/topics/', QuizTopicsViewSet.as_view(), name='quiz_topics'),
    
    # 軟刪除管理
    path('quiz/<int:quiz_id>/soft-delete/', SoftDeleteManagementViewSet.as_view(), name='soft_delete_quiz'),
    path('deleted-quizzes/', SoftDeleteManagementViewSet.as_view(), name='deleted_quizzes'),

    # 加入收藏
    path('add-favorite/', AddFavoriteViewSet.as_view(), name='add_favorite'),

    # AI聊天室
    path('chat/', ChatViewSet.as_view(), name='ai_chat'),
    path('chat/addtonote/', ChatContentToNoteView.as_view(), name='add_to_note'),
    path('notes/<int:note_id>/', NoteEdit.as_view(), name='note_edit'),
    path('notes/', NoteListView.as_view(), name='note-list'),
    path('create_quiz/', CreateQuizTopicView.as_view(), name='create_quiz'),

    # 查詢USER創建的主題
    path('user_quiz/', UserQuizView.as_view(), name='user_quiz'),
    # note內容重新測試
    path('retest/', RetestView.as_view(), name='retest'),

]