from django.urls import path, include
# 第三方套件
from rest_framework.routers import DefaultRouter
# app
from myapps.Authorization.views import UserViewSet, AuthTokenViewSet , RegisterView
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'token', AuthTokenViewSet, basename='auth-token')
# 移除 RegisterView 的 router 註冊，因為它是 APIView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),  # 手動註冊路徑
    path('', include(router.urls)),  # 加入 DefaultRouter 的路徑
    # path('/api/token/',TokenObtainPairView.as_view(),name = 'token_obtain_pair'),
    # path('/api/token/refresh/',TokenRefreshView.as_view(),name='token_refresh')
]