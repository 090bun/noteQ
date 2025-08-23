from rest_framework import serializers
from .models import User, AuthToken , Feedback
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username','email','password','is_staff','created_at','updated_at']
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
            'password': {'write_only': True ,"required": True}
        }

class UserSimplifiedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

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
    
class UserTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # 存進資料庫
        request = self.context['request']
        ip = request.META.get('REMOTE_ADDR')

        AuthToken.objects.create(
            user=self.user,
            jwt_token=data['access'],
            refresh_token=data['refresh'],
            ip_address=ip,
            expired_at=self.token['exp']
        )
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['is_paid'] = self.user.is_paid
        return data

class FeedbackSerializer(serializers.ModelSerializer):
    user = UserSimplifiedSerializer()

    class Meta:
        model = Feedback
        fields = ['user', 'level', 'content']
        extra_kwargs = {
            'user': {'required': True},
            'level': {'required': True},
            'content': {'required': False}
        }

# API 文件
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(help_text="使用者電子郵件")

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, help_text="使用者名稱")
    email = serializers.EmailField(help_text="使用者電子郵件")
    password = serializers.CharField(write_only=True, help_text="使用者密碼")
    is_staff = serializers.BooleanField(default=False, help_text="是否為管理員")
    is_paid = serializers.BooleanField(default=False, help_text="是否為付費使用者")

class ResetPasswordFromEmailSerializer(serializers.Serializer):
    old_password=serializers.CharField(write_only=True, help_text="舊密碼"),
    new_password=serializers.CharField(write_only=True, help_text="新密碼")

class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField(help_text="使用者ID")
    new_password = serializers.CharField(write_only=True, help_text="新密碼")