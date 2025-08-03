from rest_framework import serializers
from .models import User, AuthToken

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username','email','password','is_staff','created_at','updated_at']
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
            'password': {'write_only': True ,"required": True}
        }
class AuthTokenSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        source='user',  # ✅ 指向 model 的 ForeignKey 名稱
        queryset=User.objects.all()
    )

    class Meta:
        model = AuthToken
        fields = ['user_id', 'jwt_token', 'refresh_token', 'ip_address', 'created_at', 'expired_at']
        extra_kwargs = {
            'jwt_token': {'required': True},
            'refresh_token': {'required': True},
            'ip_address': {'required': True},
            'created_at': {'read_only': True},
            'expired_at': {'required': True}
        }

class RegisterInputSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    is_staff = serializers.BooleanField(default=False, required=False)
    is_paid = serializers.BooleanField(default=False, required=False)
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email 信箱重複註冊")
        return value