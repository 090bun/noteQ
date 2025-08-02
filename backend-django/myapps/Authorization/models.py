from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
# 繼承 Django 內建 User 模型
# 使用者模型
# topic: 使用者關注的主題
# is_paid: 是否為付費使用者
# created_at: 使用者建立時間
# updated_at: 使用者更新時間
class User (AbstractUser):
    topic = models.CharField(max_length=254, blank=True, null=True)
    is_paid = models.ForeignKey("Ecpay.PaymentPlan", on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# JWT 資料庫
# 儲存使用者的 JWT token 和 refresh token
# user_id: 使用者ID
# jwt_token: JWT token
# refresh_token: Refresh token
# ip_address: 使用者 IP 位址
# created_at: 建立時間
# expired_at: token 過期時間
class AuthToken(models.Model):
    user_id = models.ForeignKey("Authorization.User", on_delete=models.CASCADE)
    jwt_token = models.CharField(max_length=512)
    refresh_token = models.CharField(max_length=512)
    ip_address = models.GenericIPAddressField(
        unpack_ipv4=False,
        null=False
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expired_at = models.DateTimeField()

    class Meta:
        db_table = "AuthToken"

