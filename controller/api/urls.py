from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BottleViewSet, Model3DViewSet, CommentViewSet, ModelUploadView, UserDashboardView, UserProfileView, register_user

router = DefaultRouter()
router.register('bottles', BottleViewSet)
router.register('models3d', Model3DViewSet)
router.register('comments', CommentViewSet)


urlpatterns = [
    path('', include(router.urls)),  # Inclui todas as rotas do ViewSet
    path("models3d/upload/", ModelUploadView.as_view(), name="model-upload"),
    path("auth/register/", register_user, name="register"),
    path("user/dashboard/", UserDashboardView.as_view(), name="user-dashboard"),
    path("auth/user/", UserProfileView.as_view(), name="user-profile"),

    # Rotas de autenticação
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
]
