from rest_framework import serializers
from .models import UserFavorite , Topic , Note , Chat , AiPrompt , AiInteraction , Quiz , UserFamiliarity , DifficultyLevels
from myapps.Authorization.serializers import UserSerializer , UserSimplifiedSerializer

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
        fields = ['id', 'quiz_topic', 'difficulty','title', 'User_answer','explanation_text','Ai_answer', 'created_at', 'deleted_at', 'option_A', 'option_B', 'option_C', 'option_D']
        extra_kwargs = {
            'explanation_text': {'required': False, 'allow_null': True},
            'deleted_at': {'required': False, 'allow_null': True}
        }

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
        fields = ['id', 'level_name', 'familiarity_cap','weight_coefficients', 'created_at']

class ChatSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    topic = TopicSerializer(read_only=True)
    
    class Meta:
        model = Chat
        fields = ['id', 'topic', 'user', 'content', 'sender', 'created_at', 'deleted_at']
        extra_kwargs = {
            'deleted_at': {'required': False, 'allow_null': True}
        }


class NoteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    topic = TopicSerializer(read_only=True)
    quiz_topic = QuizSerializer(read_only=True)

    class Meta:
        model = Note
        fields = ['id', 'quiz_topic','title', 'topic', 'user', 'content', 'is_retake', 'created_at', 'updated_at', 'deleted_at']
        extra_kwargs = {
            'updated_at': {'required': False, 'allow_null': True},
            'deleted_at': {'required': False, 'allow_null': True},
            'is_retake': {'required': False},
            'title': {'required': False, 'allow_null': True}
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

# 簡化回傳內容----------------------------------
class UserFamiliaritySimplifiedSerializer(serializers.ModelSerializer):
    user = UserSimplifiedSerializer(read_only=True)

    class Meta:
        model = UserFamiliarity
        fields = ['id', 'familiarity_score','user', 'difficulty_level']


class QuizSimplifiedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'quiz_topic' ]

class TopicSimplifiedSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    user = UserSimplifiedSerializer(read_only=True)
    class Meta:
        model = Topic
        fields = ['id', 'quiz', 'user']
class AddFavoriteTopicSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)

    class Meta:
        model = Topic
        fields = ['id','title', 'quiz_topic']

class NoteSimplifiedSerializer(serializers.ModelSerializer):
    quiz_topic_id = serializers.PrimaryKeyRelatedField(source='quiz_topic', read_only=True)
    class Meta:
        model = Note
        fields = ['id', 'title','content','quiz_topic_id']


# API 文件 --------------------------
class SubmitAnswerSerializer(serializers.Serializer):
    is_test = serializers.BooleanField(help_text="是否為測試模式")
    updates = serializers.ListField(
        child=serializers.DictField(),
        help_text="使用者每一題的作答紀錄"
    )

class SubmitAttemptSerializer(serializers.Serializer):
    quiz_topic_id = serializers.IntegerField(help_text="題目 ID")
    difficulty = serializers.CharField(help_text="題目難度")
    total_questions = serializers.FloatField(help_text="總題數")
    correct_answers = serializers.FloatField(help_text="正確回答數")

class QuizSerializer(serializers.Serializer):
    user_id= serializers.IntegerField(help_text="使用者ID")
    topic = serializers.CharField(help_text="題目主題")
    difficulty = serializers.CharField(help_text="題目難度")
    question_count = serializers.IntegerField(help_text="題目數量")

class AddFavoriteTopicSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(help_text="使用者ID")
    topic_id = serializers.CharField(help_text="題目ID")
    content = serializers.CharField(help_text="儲存內容")

class ChatAPISerializer(serializers.Serializer):
    user_id = serializers.IntegerField(help_text="使用者ID")
    topic_id = serializers.CharField(help_text="主題ID")
    sender = serializers.CharField(help_text="發送者USER")
    message = serializers.CharField(help_text="傳送內容")

class NoteAPISerializer(serializers.Serializer):
    quiz_topic_id = serializers.IntegerField(help_text="題目ID")

class NoteAddAPISerializer(serializers.Serializer):
    quiz_topic = serializers.IntegerField(help_text="題目ID")
    content = serializers.CharField(help_text="筆記內容")

class NoteEditQuizTopicSerializer(serializers.Serializer):
    quiz_topic = serializers.IntegerField(help_text="題目ID")

class RetestSerializer(serializers.Serializer):
    note_id = serializers.IntegerField(help_text="筆記ID")

class ParseAnswerSerializer(serializers.Serializer):
    topic_id = serializers.IntegerField(help_text="題目ID")

class CreateQuizTopicSerializer(serializers.Serializer):
    quiz_topic = serializers.IntegerField(help_text="新增主題名稱")