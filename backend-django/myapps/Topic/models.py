from django.db import models

# Create your models here.

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
    class Meta:
        db_table = "Topic"

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
    class Meta:
        db_table = "Quiz"
# 測驗分數
# 儲存使用者測驗分數
# quiz_topic: 考題ID
# user: 使用者ID
# score: 測驗分數
# familiarity: 熟悉度
# created_at: 建立時間
class Score(models.Model):
    quiz_topic = models.ForeignKey("Topic.Quiz", on_delete=models.CASCADE)
    user = models.ForeignKey("Authorization.User", on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    familiarity = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = "Score"
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
    retake = models.BooleanField(default=False)
    retake_score = models.ForeignKey("Topic.Score", on_delete=models.CASCADE, null=True, blank=True)
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
