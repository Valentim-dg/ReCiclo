"""
Configuração de URLs para a API da aplicação ReCiclo.

Este ficheiro define os endpoints da API, mapeando as URLs para as suas respetivas
views. Utiliza o DefaultRouter do Django REST Framework para gerar automaticamente
as rotas para os ViewSets, e define caminhos explícitos para as views baseadas
em funções e classes.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # ViewSets registados no router
    Model3DViewSet,
    CommentViewSet,
    UserViewSet,
    ModelImageViewSet,
    ModelFileViewSet,

    # Views baseadas em classes e funções
    ModelUploadView,
    UserDashboardView,
    UserProfileView,
    RecycleView,
    TransactionHistoryView,
    ExchangeRequestListCreateView,
    ExchangeRequestDetailView,
    RespondToExchangeRequestView,
    CancelExchangeRequestView,
    MyOffersListView,
    CoinOfferListCreateView,
    CancelOfferView,
    PurchaseCoinOfferView,
    register_user,
)

# O router gera automaticamente as URLs para os ViewSets (ex: /api/models3d/, /api/users/)
router = DefaultRouter()
router.register(r'models3d', Model3DViewSet, basename='model3d')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'users', UserViewSet, basename='user')
router.register(r'model-images', ModelImageViewSet, basename='model-image')
router.register(r'model-files', ModelFileViewSet, basename='model-file')

# Lista de padrões de URL para a API.
urlpatterns = [
    # --- Autenticação e Gestão de Utilizadores ---
    path("auth/register/", register_user, name="register"),
    path("auth/user/", UserProfileView.as_view(), name="user-profile"),
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),

    # --- Conteúdo e Perfil do Utilizador ---
    path("user/dashboard/", UserDashboardView.as_view(), name="user-dashboard"),
    path("recycle/bottles/", RecycleView.as_view(), name="recycle_bottles"),
    path("models3d/upload/", ModelUploadView.as_view(), name="model-upload"),

    # --- Marketplace: Ofertas e Transações ---
    path('coin-offers/', CoinOfferListCreateView.as_view(), name='coin-offers'),
    path('coin-offers/<int:pk>/cancel/',
         CancelOfferView.as_view(), name='cancel-coin-offer'),
    path('coin-offers/<int:pk>/purchase/',
         PurchaseCoinOfferView.as_view(), name='purchase-coin-offer'),
    path('my-offers/', MyOffersListView.as_view(), name='my-offers'),
    path('transactions/', TransactionHistoryView.as_view(),
         name='transaction-history'),

    # --- Marketplace: Trocas Diretas ---
    path('exchange-requests/', ExchangeRequestListCreateView.as_view(),
         name='exchange-request-list'),
    path('exchange-requests/<int:pk>/',
         ExchangeRequestDetailView.as_view(), name='exchange-request-detail'),
    path('exchange-requests/<int:pk>/respond/',
         RespondToExchangeRequestView.as_view(), name='respond-to-exchange'),
    path('exchange-requests/<int:pk>/cancel/',
         CancelExchangeRequestView.as_view(), name='cancel-exchange-request'),

    # --- Rotas do Router ---
    # Inclui todas as rotas geradas pelo DefaultRouter (ex: /users/, /models3d/, etc.)
    path('', include(router.urls)),
]

