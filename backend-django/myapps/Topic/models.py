from django.db import models
from django.utils import timezone

# Create your models here.

# 軟刪除管理器
class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

# 包含軟刪除的所有記錄管理器
class AllObjectsManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()

# 使用者加入'最愛'
# 儲存使用者最愛的題目
# user_id: 使用者ID
# note_id: 題目ID
# created_at: 建立時間
# deleted_at: 刪除時間
class UserFavorite(models.Model):
    user = models.ForeignKey("Authorization.User", on_delete=models.CASCADE)
    note = models.ForeignKey("Topic.Note", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = "UserFavorite"
# 題目資料
# 儲存題目資訊
# quiz_topic: 題目名稱
# title: 題目標題
# subtitle: 題目副標題
# option_a: 選項 A
# option_b: 選項 B
# option_c: 選項 C
# option_d: 選項 D
# Ai_answer: AI 答案
# User_answer: 使用者答案
# created_at: 建立時間
# deleted_at: 刪除時間
class Topic(models.Model):
    quiz_topic = models.ForeignKey("Topic.Quiz", on_delete=models.CASCADE)
    title = models.CharField(max_length=254)
    subtitle = models.TextField()
    # 選項 A～D
    option_a = models.CharField(max_length=128, null=True, blank=True)
    option_b = models.CharField(max_length=128, null=True, blank=True)
    option_c = models.CharField(max_length=128, null=True, blank=True)
    option_d = models.CharField(max_length=128, null=True, blank=True)
    Ai_answer = models.CharField(max_length=1,
        choices=[
            ('A', 'A'),
            ('B', 'B'),
            ('C', 'C'),
            ('D', 'D'),
        ], null=True, blank=True)  
    User_answer = models.CharField(max_length=1 , null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    difficultyLevels = models.ForeignKey("Topic.DifficultyLevels", on_delete=models.CASCADE, null=True, blank=True)
    # 管理器
    objects = SoftDeleteManager()  # 預設只顯示未刪除的
    all_objects = AllObjectsManager()  # 顯示所有記錄（包含已刪除）
    
    class Meta:
        db_table = "Topic"
    
    def soft_delete(self):
        """軟刪除 Topic"""
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """恢復軟刪除的 Topic"""
        self.deleted_at = None
        self.save()

# 考題題目
#儲存考題名稱
# quiz_topic: 考題名稱
# created_at: 建立時間
# updated_at: 更新時間
# deleted_at: 刪除時間
class Quiz(models.Model):
    quiz_topic = models.CharField(max_length=254)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    # 管理器
    objects = SoftDeleteManager()  # 預設只顯示未刪除的
    all_objects = AllObjectsManager()  # 顯示所有記錄（包含已刪除）
    
    class Meta:
        db_table = "Quiz"
    
    def soft_delete(self):
        """軟刪除 Quiz 及其相關的 Topic"""
        # 軟刪除自己
        self.deleted_at = timezone.now()
        self.save()
        
        # 軟刪除所有相關的 Topic
        topics = Topic.all_objects.filter(quiz_topic=self, deleted_at__isnull=True)
        for topic in topics:
            topic.soft_delete()
    
    def restore(self):
        """恢復軟刪除的 Quiz"""
        self.deleted_at = None
        self.save()
    
    @classmethod
    def soft_delete_old_quizzes_except_latest(cls, quiz_topic_name, latest_quiz_id):
        """軟刪除同名的舊 Quiz，保留最新的"""
        old_quizzes = cls.objects.filter(
            quiz_topic=quiz_topic_name
        ).exclude(id=latest_quiz_id)
        
        for quiz in old_quizzes:
            quiz.soft_delete()

# 使用者熟悉度
# 儲存使用者對考題的熟悉度
# user: 使用者ID
# quiz_topic: 考題ID
# note: 關聯的筆記ID
# difficultyLevels: 難度分類ID
# total_questions: 總題數
# correct_answers: 正確答案數量
# familiarity: 熟悉度
# updated_at: 更新時間
class UserFamiliarity(models.Model):
    user = models.ForeignKey("Authorization.User", on_delete=models.CASCADE)
    quiz_topic = models.ForeignKey("Topic.Quiz", on_delete=models.CASCADE)
    note = models.ForeignKey("Topic.Note", on_delete=models.CASCADE , null=True, blank=True)
    difficultyLevels = models.ForeignKey("Topic.DifficultyLevels", on_delete=models.CASCADE, null=True, blank=True)
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    familiarity = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = "UserFamiliarity"


# 難度分類
# 儲存使用者熟悉度
# level_name: 難度名稱
    # EASY = 'E', 'Easy'
    # MEDIUM = 'M', 'Medium'
    # HARD = 'H', 'Hard'
    # EXPERT = 'X', 'Expert'
# familiarity_cap: 熟悉度上限
# weight_coefficients: 不同題型的權重係數
# created_at: 建立時間

class DifficultyLevels(models.Model):
    level_name = models.CharField(max_length=10, unique=True)
    familiarity_cap = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    weight_coefficients = models.JSONField(default=dict)  # 儲存不同題型的權重係數
    created_at = models.DateTimeField(auto_now_add=True)

        
# note 資料庫
# 儲存使用者筆記
# quiz_topic: 關聯的考題ID
# user: 使用者ID
# chat: 聊天ID
# retake: 是否再次測驗(針對筆記)
# retake_score_id: 再次測驗分數ID
# created_at: 建立時間
# updated_at: 更新時間
# deleted_at: 刪除時間
class Note(models.Model):
    quiz_topic = models.ForeignKey("Topic.Quiz", on_delete=models.CASCADE)
    user = models.ForeignKey("Authorization.User", on_delete=models.CASCADE)
    is_retake = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = "Note"
# -----------------
# AI Chat 資料庫
# 儲存聊天內容
# note: 關聯的筆記ID
# content: 聊天內容
# sender: 發送者 (user 或 ai)預設為 ai
# created_at: 建立時間
# deleted_at: 刪除時間
# updated_at: 更新時間
class Chat(models.Model):
    note = models.ForeignKey("Topic.Note", on_delete=models.CASCADE)
    content = models.TextField()
    sender = models.CharField(max_length=16, choices=[('user', 'User'), ('ai', 'AI')],default='ai')
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = "Chat"

# AI 提示資料庫
# 儲存 AI 提示內容
# prompt: 提示內容
# created_at: 建立時間
# updated_at: 更新時間

class AiPrompt(models.Model):
    prompt = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = "AiPrompt"



# 儲存用戶對 AI 互動的反饋
# user_id: 使用者ID
# feedback: 反饋內容
# feedback_score: 反饋分數
# prompt_id: 關聯的 AI 提示id
# created_at: 建立時間
class AiInteraction(models.Model):
    user = models.ForeignKey("Authorization.User", on_delete=models.CASCADE)
    feedback = models.TextField()
    feedback_score = models.IntegerField(default=0)
    prompt = models.ForeignKey("Topic.AiPrompt",on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = "AiInteraction"
