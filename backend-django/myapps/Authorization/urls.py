from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
# 第三方套件
from rest_framework.routers import DefaultRouter
# app
from myapps.Authorization.auth_views import UserViewSet, AuthTokenViewSet, RegisterView ,forgot_password, reset_password

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'token', AuthTokenViewSet, basename='auth-token')

# 自定義 JWT 登入視圖
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

@swagger_auto_schema(
    method='post',
    operation_summary="用戶登入",
    operation_description="使用 email 和密碼進行用戶登入，返回 JWT token",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['email', 'password'],
        properties={
            'email': openapi.Schema(type=openapi.TYPE_STRING, description='用戶電子郵件'),
            'password': openapi.Schema(type=openapi.TYPE_STRING, description='用戶密碼'),
        },
    ),
    responses={
        200: openapi.Response(
            description="登入成功",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'token': openapi.Schema(type=openapi.TYPE_STRING, description='JWT access token'),
                    'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='JWT refresh token'),
                    'user_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='用戶ID'),
                    'username': openapi.Schema(type=openapi.TYPE_STRING, description='用戶名'),
                    'email': openapi.Schema(type=openapi.TYPE_STRING, description='電子郵件'),
                    'is_paid': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='是否為付費用戶'),
                }
            )
        ),
        400: openapi.Response(description="請求參數錯誤"),
        401: openapi.Response(description="登入憑證無效"),
        500: openapi.Response(description="伺服器錯誤"),
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def custom_jwt_login(request):
    import json
    import logging
    from rest_framework.response import Response
    from rest_framework import status
    
    # 添加日誌記錄
    logger = logging.getLogger(__name__)
    logger.info(f"Login request received: {request.method}")
    
    try:
        # 解析請求數據
        email = request.data.get('email')
        password = request.data.get('password')
        
        logger.info(f"Login attempt for email: {email}")
        
        if not email or not password:
            logger.warning("Missing email or password")
            return Response({'error': '需要提供 email 和 password'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 驗證用戶
        from django.contrib.auth import authenticate
        from myapps.Authorization.models import User, AuthToken
        
        # 由於 USERNAME_FIELD = 'email'，所以第一個參數還是 username，但值是 email
        user = authenticate(request, username=email, password=password)
        if not user:
            logger.warning(f"Invalid login credentials for email: {email}")
            return Response({'error': '登入憑證無效'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # 生成 JWT token
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        logger.info(f"Successful login for user: {user.email}")
        
        return Response({
            'token': str(access_token),  # 為了前端兼容性，保持 'token' 字段
            'refresh': str(refresh),
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'is_paid': user.is_paid
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Unexpected error in login: {str(e)}")
        return Response({'error': f'伺服器錯誤: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),  # 手動註冊路徑
    path('login/', custom_jwt_login, name='login'),  # 自定義 JWT 登入路徑
    path('', include(router.urls)),  # 加入 DefaultRouter 的路徑
    path('forgot-password/', forgot_password),
    path('reset-password/', reset_password),
]