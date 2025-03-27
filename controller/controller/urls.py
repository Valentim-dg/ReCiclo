from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [

    path('admin/', admin.site.urls),

    # Login, Logout, Reset de Senha
    path('api/auth/', include('dj_rest_auth.urls')),

    # Cadastro de Usuários
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(),
         name='token_refresh'),  # Atualiza o token JWT

    # Autenticação social (Google)
    path('api/auth/google/', include('allauth.socialaccount.providers.google.urls')),

    # Incluindo as rotas do app "api"
    path('api/', include('api.urls')),
]

# Configuração para servir arquivos de mídia durante desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
