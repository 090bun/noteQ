from rest_framework import serializers
from .models import UserFavorite , Topic , Note , Chat , AiPrompt , AiInteraction , Quiz , UserFamiliarity , DifficultyLevels
from myapps.Authorization.serializers import UserSerializer

class UserFavoriteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = UserFavorite
        fields = ['id', 'user', 'note', 'created_at', 'deleted_at']
        extra_kwargs = {
            'deleted_at': {'required': False, 'allow_null': True}
        }

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'quiz_topic', 'title', 'User_answer', 'Ai_answer', 'created_at', 'deleted_at', 'option_a', 'option_b', 'option_c', 'option_d']
class QuizSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Quiz
        fields = ['id', 'user', 'quiz_topic', 'created_at', 'updated_at', 'deleted_at']
        extra_kwargs = {
            'updated_at': {'required': False, 'allow_null': True},
            'deleted_at': {'required': False, 'allow_null': True}
        }

class UserFamiliaritySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    topic = TopicSerializer(read_only=True)
    class Meta:
        model = UserFamiliarity
        fields = ['id', 'user', 'topic', 'familiarity_score']

class DifficultyLevelsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DifficultyLevels
        fields = ['id', 'level', 'description']
        extra_kwargs = {
            'description': {'required': False, 'allow_null': True}
        }
class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'user', 'content', 'sender', 'created_at', 'updated_at', 'deleted_at']
        extra_kwargs = {
            'updated_at': {'required': False, 'allow_null': True},
            'deleted_at': {'required': False, 'allow_null': True}
        }


class NoteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    topic = TopicSerializer(read_only=True)
    chat = ChatSerializer(read_only=True)

    class Meta:
        model = Note
        fields = ['id', 'topic', 'user', 'chat', 'retake', 'retake_score_id', 'created_at', 'updated_at', 'deleted_at']
        extra_kwargs = {
            'retake_score_id': {'required': False, 'allow_null': True},
            'updated_at': {'required': False, 'allow_null': True},
            'deleted_at': {'required': False, 'allow_null': True}
        }

class AiPromptSerializer(serializers.ModelSerializer):
    class Meta:
        model = AiPrompt
        fields = ['id', 'prompt', 'created_at', 'updated_at']
        extra_kwargs = {
            'updated_at': {'required': False, 'allow_null': True}
        }
        
class AiInteractionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    promppt = AiPromptSerializer(read_only=True)
    class Meta:
        model = AiInteraction
        fields = ['id', 'user','feedback','feedback_score', 'prompt', 'created_at']
