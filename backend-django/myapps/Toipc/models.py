from django.db import models

# Create your models here.

# 使用者加入'最愛'
# 儲存使用者最愛的題目
# user_id: 使用者ID
# note_id: 題目ID
class UserFavorite(models.Model):
    user = models.ForeignKey("Authorization.User", on_delete=models.CASCADE)
    note = models.ForeignKey("Toipc.Note", on_delete=models.CASCADE)

    class Meta:
        db_table = "UserFavorite"
# 題目資料
# 儲存題目資訊
# topic: 題目名稱
# title: 題目標題
# subtitle: 題目副標題
# answer: 題目答案
# created_at: 建立時間
class Topic(models.Model):
    topic = models.CharField(max_length=254)
    title = models.CharField(max_length=254)
    subtitle = models.TextField()
    answer = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = "Topic"
# 測驗分數
# 儲存使用者測驗分數
# topic_id: 題目ID
# user_id: 使用者ID
# score: 測驗分數
# familiarity: 熟悉度
# created_at: 建立時間
class Score(models.Model):
    topic = models.ForeignKey("Toipc.Topic", on_delete=models.CASCADE)
    user = models.ForeignKey("Authorization.User", on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    familiarity = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = "Score"
# note 資料庫
# 儲存使用者筆記
# topic_id: 題目ID
# user_id: 使用者ID
# chat_id: 聊天ID
# retake: 是否再次測驗(針對筆記)
# retake_score_id: 再次測驗分數ID
# created_at: 建立時間
# updated_at: 更新時間
# deleted_at: 刪除時間
class Note(models.Model):
    topic = models.ForeignKey("Toipc.Topic", on_delete=models.CASCADE)
    user = models.ForeignKey("Authorization.User", on_delete=models.CASCADE)
    chat = models.ForeignKey("Toipc.Chat", on_delete=models.CASCADE)
    retake = models.BooleanField(default=False)
    retake_score = models.ForeignKey("Toipc.Score", on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = "Note"
# -----------------
# AI Chat 資料庫
# 儲存聊天內容
class Chat(models.Model):
    content = models.TextField()
    sender = models.CharField(max_length=16, choices=[('user', 'User'), ('ai', 'AI')],default='ai')
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = "Chat"

# AI 提示資料庫
# 儲存 AI 提示內容
# prompt: 提示內容
# created_at: 建立時間

class AiPrompt(models.Model):
    prompt = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
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
    prompt = models.ForeignKey("Toipc.AiPrompt",on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = "AiInteraction"
