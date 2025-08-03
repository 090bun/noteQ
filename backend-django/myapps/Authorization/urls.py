from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
# 第三方套件
from rest_framework.routers import DefaultRouter
# app
from myapps.Authorization.auth_views import UserViewSet, AuthTokenViewSet, RegisterView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'token', AuthTokenViewSet, basename='auth-token')

# 自定義 JWT 登入視圖
@csrf_exempt
def custom_jwt_login(request):
    import json
    from django.http import JsonResponse
    
    if request.method == 'POST':
        try:
            # 解析請求數據
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            
            if not email or not password:
                return JsonResponse({'error': '需要提供 email 和 password'}, status=400)
            
            # 驗證用戶
            from django.contrib.auth import authenticate
            from myapps.Authorization.models import User, AuthToken
            
            # 由於 USERNAME_FIELD = 'email'，所以第一個參數還是 username，但值是 email
            user = authenticate(request, username=email, password=password)
            if not user:
                return JsonResponse({'error': '登入憑證無效'}, status=401)
            
            # 生成 JWT token
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # 存儲到資料庫
            try:
                ip_address = request.META.get('REMOTE_ADDR', '127.0.0.1')
                import datetime
                
                AuthToken.objects.create(
                    user=user,
                    jwt_token=str(access_token),
                    refresh_token=str(refresh),
                    ip_address=ip_address,
                    expired_at=datetime.datetime.now() + datetime.timedelta(days=1)
                )
            except Exception as db_error:
                print(f"資料庫儲存錯誤: {db_error}")
            
            return JsonResponse({
                'access': str(access_token),
                'refresh': str(refresh),
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'is_paid': user.is_paid
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'error': '無效的 JSON 格式'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'伺服器錯誤: {str(e)}'}, status=500)
    
    return JsonResponse({'error': '只支援 POST 請求'}, status=405)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),  # 手動註冊路徑
    path('login/', custom_jwt_login, name='login'),  # 自定義 JWT 登入路徑
    path('', include(router.urls)),  # 加入 DefaultRouter 的路徑

]