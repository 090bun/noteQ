"""
URL configuration for myapps project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("myapps.Authorization.urls")),  # 包含 Authorization app 的 URLs
    
]

# 簡單的 JWT 路由，直接使用類視圖
@csrf_exempt
def jwt_token_view(request):
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
            from myapps.Authorization.models import User
            
            # 由於 USERNAME_FIELD = 'email'，所以第一個參數還是 username，但值是 email
            user = authenticate(request, username=email, password=password)
            if not user:
                return JsonResponse({'error': '登入憑證無效'}, status=401)
            
            # 生成 JWT token
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            return JsonResponse({
                'access': str(refresh.access_token),
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

@csrf_exempt
def jwt_refresh_view(request):
    from rest_framework_simplejwt.views import TokenRefreshView
    return TokenRefreshView.as_view()(request)

# 添加 JWT 路由
urlpatterns += [
    path("api/token/", jwt_token_view, name='token_obtain_pair'),
    path("api/token/refresh/", jwt_refresh_view, name='token_refresh'),
    path("api/", include("myapps.Topic.urls")),  # 包含 Topic app 的 URLs
]
