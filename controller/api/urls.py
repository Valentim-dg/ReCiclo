from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BottleViewSet, Model3DViewSet

router = DefaultRouter()
router.register('bottles', BottleViewSet)
router.register('models3d', Model3DViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
