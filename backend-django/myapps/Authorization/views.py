from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status, serializers
from .models import User, AuthToken
from .serializers import UserSerializer, AuthTokenSerializer, RegisterInputSerializer
from rest_framework.permissions import AllowAny
# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]  # 允許未認證的使用者
    queryset = User.objects.all()
    serializer_class = UserSerializer

class AuthTokenViewSet(viewsets.ModelViewSet):
    queryset = AuthToken.objects.all()
    serializer_class = AuthTokenSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# 註冊帳號
class RegisterView(APIView):
    permission_classes = [AllowAny]  # 允許未認證的使用者
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
