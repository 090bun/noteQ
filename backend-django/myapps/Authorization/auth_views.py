from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status, serializers
from django.conf import settings
from .models import User, AuthToken
from .serializers import UserSerializer, AuthTokenSerializer, RegisterInputSerializer, UserTokenSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode  ,urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view

import jwt
# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # 僅允許已認證的使用者訪問

class AuthTokenViewSet(viewsets.ModelViewSet):
    queryset = AuthToken.objects.all()
    serializer_class = AuthTokenSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# 註冊帳號
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]  # 允許未認證的使用者
    
    @swagger_auto_schema(
        operation_summary="用戶註冊",
        operation_description="創建新的用戶帳號",
        request_body=RegisterInputSerializer,
        responses={
            201: openapi.Response(
                description="註冊成功",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING, description='成功消息'),
                        'user_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='用戶ID'),
                        'username': openapi.Schema(type=openapi.TYPE_STRING, description='用戶名'),
                        'email': openapi.Schema(type=openapi.TYPE_STRING, description='電子郵件'),
                        'is_paid': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='是否為付費用戶'),
                    }
                )
            ),
            400: openapi.Response(description="請求參數錯誤"),
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = RegisterInputSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                is_staff=serializer.validated_data.get('is_staff', False),  # 預設不設為管理員
                is_paid=serializer.validated_data.get('is_paid', False)  # 預設不設為付費使用者
            )
            return Response({
                "message": "註冊成功",
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "is_paid": user.is_paid
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 忘記密碼 API：發送重設連結
@swagger_auto_schema(
    method='post',
    operation_summary="忘記密碼",
    operation_description="發送密碼重設連結到用戶電子郵件",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['email'],
        properties={
            'email': openapi.Schema(type=openapi.TYPE_STRING, description='用戶電子郵件'),
        },
    ),
    responses={
        200: openapi.Response(description="重設密碼郵件已發送"),
        400: openapi.Response(description="請求參數錯誤"),
        404: openapi.Response(description="使用者不存在"),
        500: openapi.Response(description="伺服器錯誤"),
    }
)
@api_view(['POST'])
def forgot_password(request):
    try:
        email = request.data.get('email')
        if not email:
            return Response({"error": "請提供電子郵件地址"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "使用者不存在"}, status=status.HTTP_404_NOT_FOUND)
        
        # 生成重設密碼的
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:3000/reset-password/{uid}/{token}/"
        
        # 嘗試發送郵件，並捕獲可能的錯誤
        try:
            send_mail(
                subject="重設密碼",
                message=f"請點擊以下連結重設您的密碼：{reset_link}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False
            )
            return Response({"message": "重設密碼郵件已發送"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"郵件發送失敗: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({"error": f"伺服器錯誤: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@swagger_auto_schema(
    method='post',
    operation_summary="重設密碼",
    operation_description="使用重設連結重設用戶密碼",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['uid', 'token', 'new_password'],
        properties={
            'uid': openapi.Schema(type=openapi.TYPE_STRING, description='用戶ID（base64編碼）'),
            'token': openapi.Schema(type=openapi.TYPE_STRING, description='重設密碼token'),
            'new_password': openapi.Schema(type=openapi.TYPE_STRING, description='新密碼'),
        },
    ),
    responses={
        200: openapi.Response(description="密碼重設成功"),
        400: openapi.Response(description="連結無效或token過期"),
    }
)
@api_view(['POST'])
def reset_password(request):
    uidb64 = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': '連結無效'}, status=400)

    if default_token_generator.check_token(user, token):
        user.set_password(new_password)
        user.save()
        return Response({'message': '密碼重設成功'}, status=200)
    else:
        return Response({'error': 'token 無效或已過期'}, status=400)