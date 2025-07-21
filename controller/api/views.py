import zipfile
import tempfile
import os
import logging
from datetime import datetime
from collections import defaultdict

from django.http import FileResponse
from django.db import models, transaction
from django.db.models import Sum, Max, Q, OuterRef, Subquery, BooleanField
from django.db.models.functions import TruncMonth
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, permissions, generics, filters, status, mixins, serializers
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny

from .models import (
    Bottle, Model3D, ModelLike, ModelFavorite, Comment, ModelFile,
    ModelImage, RecyclingHistory, CoinOffer, CoinTransaction, ExchangeRequest,
    UserAchievement, Achievement
)
from .serializers import (
    BottleSerializer, Model3DSerializer, CommentSerializer, UserSerializer,
    UserSimpleSerializer, CoinOfferSerializer, CoinTransactionSerializer,
    ExchangeRequestSerializer, UserSearchSerializer, AchievementSerializer,
    ModelFileSerializer, ModelImageSerializer, PublicUserSerializer
)
from .permissions import IsCurator, IsOwnerOrReadOnly
from .services import add_experience, update_user_achievements


class BottleViewSet(viewsets.ModelViewSet):
    queryset = Bottle.objects.all()
    serializer_class = BottleSerializer


# Configuração do logger
logger = logging.getLogger(__name__)

# --- Constantes de Negócio ---

MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai",
                "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

FILAMENT_GRAMS_BY_VOLUME = {
    "350ml": 15, "500ml": 20, "1L": 30, "1.5L": 40, "2L": 50, "3L": 60, "Outro": 25,
}

# --- Views de Autenticação e Utilizador ---


@api_view(['POST'])
def register_user(request):
    """Cria um novo utilizador no sistema."""
    User = get_user_model()
    data = request.data
    if User.objects.filter(email=data["email"]).exists():
        return Response({"error": "Email já cadastrado."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create(
        username=data["email"],
        email=data["email"],
        password=make_password(data["password"]),
        first_name=data.get("name", ""),
    )
    return Response({"message": "Usuário cadastrado com sucesso!"}, status=status.HTTP_201_CREATED)


class UserProfileView(APIView):
    """Retorna os dados completos do utilizador autenticado."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para listar, pesquisar e ver perfis públicos de utilizadores."""
    queryset = get_user_model().objects.all()
    serializer_class = PublicUserSerializer
    permission_classes = [AllowAny]
    lookup_field = 'username'
    filter_backends = [filters.SearchFilter]
    search_fields = ['username']


# --- Views de Gamificação e Dashboard ---

class UserDashboardView(APIView):
    """Fornece todos os dados agregados para o dashboard do utilizador."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        current_year = datetime.now().year

        # Lógica do Gráfico de Reciclagem
        bottle_records = Bottle.objects.filter(
            user=user, date__year=current_year
        ).values('date__month', 'type', 'volume').annotate(total_bottles=Sum('quantity')).order_by('date__month')

        processed_data = defaultdict(
            lambda: {'filamentGrams': [0] * 12, 'bottleCounts': [0] * 12})
        for record in bottle_records:
            month_index = record['date__month'] - 1
            grams_per_bottle = FILAMENT_GRAMS_BY_VOLUME.get(
                record['volume'], 25)
            processed_data[record['type']
                           ]['bottleCounts'][month_index] += record['total_bottles']
            processed_data[record['type']
                           ]['filamentGrams'][month_index] += record['total_bottles'] * grams_per_bottle

        final_datasets = []
        for bottle_type in sorted(processed_data.keys()):
            final_datasets.append({
                'label': bottle_type,
                'filamentGrams': processed_data[bottle_type]['filamentGrams'],
                'bottleCounts': processed_data[bottle_type]['bottleCounts'],
            })
        recycling_chart_data = {
            "labels": MONTH_LABELS, "datasets": final_datasets}

        # Lógica de Conquistas e Progresso
        user_stats = {
            'BOTTLES_TOTAL': Bottle.objects.filter(user=user).aggregate(total=Sum('quantity'))['total'] or 0,
            'USER_LEVEL': user.level,
        }
        unlocked_ids = set(UserAchievement.objects.filter(
            user=user, unlocked_at__isnull=False).values_list('achievement_id', flat=True))
        all_achievements_definitions = Achievement.objects.all()
        achievements_data = []
        for ach in all_achievements_definitions:
            current_progress = user_stats.get(ach.criteria_type, 0)
            unit_map = {'BOTTLES_TOTAL': 'garrafas', 'USER_LEVEL': 'níveis'}
            unit = unit_map.get(ach.criteria_type, '')
            achievements_data.append({
                'id': ach.id, 'title': ach.title, 'description': ach.description,
                'icon_name': ach.icon_name, 'unlocked': ach.id in unlocked_ids,
                'progress': {'current': current_progress, 'total': ach.criteria_value, 'unit': unit}
            })

        # Resposta Final da API
        return Response({
            "recyclingCoins": user.recycling_coins,
            "reputationCoins": user.reputation_coins,
            "level": user.level,
            "experience": user.experience,
            "experience_for_next_level": user.level * 100,
            "recyclingData": recycling_chart_data,
            "achievements": achievements_data,
            "user": UserSimpleSerializer(user, context={'request': request}).data
        })


class RecycleView(APIView):
    """Processa o registo de uma nova reciclagem de garrafas."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        quantity = int(request.data.get("quantity", 1))
        volume = request.data.get("volume")
        bottle_type = request.data.get("type")

        Bottle.objects.create(user=user, type=bottle_type,
                              volume=volume, quantity=quantity)

        base_reward = FILAMENT_GRAMS_BY_VOLUME.get(volume, 10)
        recycling_coins_earned = base_reward * quantity

        user.recycling_coins += recycling_coins_earned
        user.reputation_coins += recycling_coins_earned // 2
        user.save(update_fields=['recycling_coins', 'reputation_coins'])

        leveled_up = add_experience(user, xp_amount=recycling_coins_earned)

        today = datetime.today().strftime("%Y-%m")
        history, _ = RecyclingHistory.objects.get_or_create(
            user=user, month=today)
        history.quantity += quantity
        history.save()

        newly_unlocked_achievements = update_user_achievements(user)

        return Response({
            "message": "Reciclagem registrada com sucesso!",
            "level": user.level,
            "leveled_up": leveled_up,
            "new_achievements": AchievementSerializer(newly_unlocked_achievements, many=True).data,
        }, status=status.HTTP_200_OK)


# --- Views de Conteúdo (Modelos 3D, Comentários, etc.) ---

class ModelUploadView(APIView):
    """View dedicada para o upload de novos modelos 3D com múltiplos ficheiros e imagens."""
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        user = request.user
        name = request.data.get("name")
        description = request.data.get("description")
        is_free = request.data.get("is_free", 'true').lower() == 'true'
        price = int(request.data.get("price", 0)) if not is_free else 0

        if not name or not description:
            return Response({"error": "Nome e descrição são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)
        if not is_free and price <= 0:
            return Response({"error": "Para modelos pagos, o preço deve ser maior que zero."}, status=status.HTTP_400_BAD_REQUEST)

        files = request.FILES.getlist('file')
        images = request.FILES.getlist('image')

        if not files or not images:
            return Response({"error": "É necessário enviar pelo menos um ficheiro de modelo e uma imagem."}, status=status.HTTP_400_BAD_REQUEST)

        model_3d = Model3D.objects.create(
            user=user, name=name, description=description, is_free=is_free, price=price)

        for file in files:
            ModelFile.objects.create(
                model=model_3d, file=file, file_name=file.name)
        for image in images:
            ModelImage.objects.create(model3d=model_3d, image=image)

        serializer = Model3DSerializer(model_3d, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class Model3DViewSet(viewsets.ModelViewSet):
    """ViewSet principal para todas as operações de CRUD e ações em Modelos 3D."""
    serializer_class = Model3DSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'user__username']
    ordering_fields = ['date', 'likes', 'downloads', 'name']

    def get_queryset(self):
        """
        Sobrescreve o queryset para uma lógica de visibilidade robusta.
        - Curadores veem tudo.
        - Utilizadores normais veem todos os modelos visíveis E os seus próprios modelos (mesmo que ocultos).
        - Visitantes anónimos veem apenas os modelos visíveis.
        """
        user = self.request.user
        if user.is_authenticated:
            if hasattr(user, 'is_curator') and user.is_curator:
                return Model3D.objects.all().order_by('-date')
            return Model3D.objects.filter(Q(is_visible=True) | Q(user=user)).distinct().order_by('-date')
        return Model3D.objects.filter(is_visible=True).order_by('-date')

    def get_permissions(self):
        """Define permissões específicas por ação."""
        if self.action in ['update', 'partial_update', 'destroy', 'add_image', 'add_file']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        if self.action == 'set_visibility':
            return [permissions.IsAuthenticated(), IsCurator()]
        return super().get_permissions()

    def perform_create(self, serializer):
        """Garante que o utilizador autenticado seja registado no modelo e ganhe recompensas."""
        user = self.request.user
        serializer.save(user=user)
        # Recompensa o utilizador com experiência por contribuir com um novo modelo.
        add_experience(user, xp_amount=50)

    @action(detail=True, methods=['post'])
    def add_image(self, request, pk=None):
        """Adiciona uma nova imagem a um modelo existente."""
        model = self.get_object()
        image_serializer = ModelImageSerializer(
            data={'model3d': model.pk, 'image': request.data.get('image')})
        if image_serializer.is_valid():
            image_serializer.save()
            return Response(image_serializer.data, status=status.HTTP_201_CREATED)
        return Response(image_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_file(self, request, pk=None):
        """Adiciona um novo ficheiro a um modelo existente."""
        model = self.get_object()
        file = request.data.get('file')
        file_serializer = ModelFileSerializer(
            data={'model': model.pk, 'file': file, 'file_name': file.name})
        if file_serializer.is_valid():
            file_serializer.save()
            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def set_visibility(self, request, pk=None):
        """Endpoint para curadores definirem a visibilidade de um modelo."""
        model = self.get_object()
        is_visible = request.data.get('is_visible')
        if is_visible is None or not isinstance(is_visible, bool):
            return Response({'error': 'O campo "is_visible" (booleano) é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)
        model.is_visible = is_visible
        model.save()
        message = "visível" if is_visible else "oculto"
        return Response({'status': f'Modelo "{model.name}" foi marcado como {message}.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def my_models(self, request):
        """Retorna uma lista de todos os modelos criados pelo utilizador autenticado."""
        user_models = self.get_queryset().filter(user=request.user)
        page = self.paginate_queryset(user_models)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(user_models, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Permite a um utilizador curtir ou descurtir um modelo."""
        model = get_object_or_404(Model3D, pk=pk)
        like, created = ModelLike.objects.get_or_create(
            user=request.user, model=model)
        if not created:
            like.delete()
            model.likes = max(0, model.likes - 1)
            message = 'Like removido'
        else:
            model.likes += 1
            message = 'Like adicionado'
        model.save()
        return Response({'likes': model.likes, 'message': message}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def liked(self, request):
        """Retorna uma lista de todos os modelos que o utilizador autenticado curtiu."""
        liked_models = Model3D.objects.filter(
            modellike__user=request.user).order_by('-modellike__created_at')
        page = self.paginate_queryset(liked_models)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(liked_models, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def save(self, request, pk=None):
        """Permite a um utilizador salvar ou remover um modelo dos seus favoritos."""
        model = get_object_or_404(Model3D, pk=pk)
        favorite, created = ModelFavorite.objects.get_or_create(
            user=request.user, model=model)
        if not created:
            favorite.delete()
            return Response({'saved': False, 'message': 'Removido dos favoritos'}, status=status.HTTP_200_OK)
        return Response({'saved': True, 'message': 'Adicionado aos favoritos'}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def saved(self, request):
        """Retorna uma lista de todos os modelos que o utilizador autenticado salvou."""
        saved_models = Model3D.objects.filter(
            modelfavorite__user=request.user).order_by('-modelfavorite__created_at')
        page = self.paginate_queryset(saved_models)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(saved_models, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        user = request.user
        model = get_object_or_404(Model3D, pk=pk)
        paid_for_model = False  # Flag para controle de rollback

        try:
            if not model.is_free:
                if user.recycling_coins < model.price:
                    return Response(
                        {"error": f"Você não possui moedas de reciclagem suficientes. Necessário: {model.price}"},
                        status=status.HTTP_402_PAYMENT_REQUIRED
                    )
                user.recycling_coins -= model.price
                paid_for_model = True

            model_files = model.files.all()
            if not model_files.exists():
                logger.warning(
                    f"Modelo ID {model.pk} não possui arquivos (ModelFile) para download.")
                return Response(
                    {"error": "Este modelo não possui arquivos para download."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Lógica de arquivo único
            if model_files.count() == 1:
                model_file = model_files.first()
                logger.info(
                    f"Retornando arquivo único: {model_file.file_name} para modelo ID {model.pk}")
                try:
                    file_handle = model_file.file.open('rb')
                    if paid_for_model:
                        user.save()  # Salva débito de moedas
                        model.downloads += 1
                        model.save()  # Salva incremento de downloads
                    elif model.is_free:  # Se for gratuito e não pago
                        model.downloads += 1
                        model.save()

                    response = FileResponse(
                        file_handle,
                        as_attachment=True,
                        # Usar nome real do arquivo
                        filename=os.path.basename(model_file.file.name)
                    )
                    return response
                except Exception as e:
                    logger.error(
                        f"Erro ao abrir arquivo único {model_file.file.name} para modelo ID {model.pk}: {e}", exc_info=True)
                    return Response({"error": "Erro ao acessar o arquivo do modelo."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Lógica para múltiplos arquivos (ZIP)
            logger.info(
                f"Criando ZIP para modelo ID {model.pk} com {model_files.count()} arquivos.")
            temp_zip_path = None  # Para garantir a limpeza em caso de erro
            try:
                temp_zip_file = tempfile.NamedTemporaryFile(
                    delete=False, suffix='.zip')
                temp_zip_path = temp_zip_file.name

                with zipfile.ZipFile(temp_zip_file, 'w', zipfile.ZIP_DEFLATED) as zf:
                    files_added_to_zip = 0
                    for model_file in model_files:
                        filename_in_zip = os.path.basename(
                            model_file.file.name)

                        logger.info(
                            f"Tentando adicionar '{model_file.file.name}' (como '{filename_in_zip}') ao ZIP para modelo ID {model.pk}.")
                        try:
                            with model_file.file.open('rb') as f_content:
                                content = f_content.read()
                                if content:
                                    zf.writestr(filename_in_zip, content)
                                    files_added_to_zip += 1
                                    logger.info(
                                        f"Adicionado '{filename_in_zip}' ({len(content)} bytes) ao ZIP.")
                                else:
                                    logger.warning(
                                        f"Conteúdo do arquivo '{model_file.file.name}' está vazio para ModelFile ID {model_file.pk}.")
                        except FileNotFoundError:
                            logger.error(
                                f"Arquivo não encontrado: {model_file.file.path if hasattr(model_file.file, 'path') else model_file.file.name} para ModelFile ID {model_file.pk}", exc_info=True)
                        except Exception as e_file:
                            logger.error(
                                f"Erro ao ler ou adicionar '{model_file.file.name}' ao ZIP: {e_file}", exc_info=True)

                temp_zip_file.close()  # Fechar o arquivo temporário para que possa ser lido/verificado

                if files_added_to_zip == 0:
                    logger.error(
                        f"Nenhum arquivo foi adicionado com sucesso ao ZIP para modelo ID {model.pk}. O ZIP estará vazio.")
                    if os.path.exists(temp_zip_path):
                        os.unlink(temp_zip_path)
                    return Response(
                        {"error": "Não foi possível adicionar arquivos ao pacote de download."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

                if paid_for_model:
                    user.save()  # Salva débito de moedas
                    model.downloads += 1
                    model.save()  # Salva incremento de downloads
                elif model.is_free:
                    model.downloads += 1
                    model.save()

                zip_response_filename = f"{model.name.replace(' ', '_')}_arquivos.zip"
                response = FileResponse(
                    open(temp_zip_path, 'rb'),
                    as_attachment=True,
                    filename=zip_response_filename
                )

                # Função de limpeza para o FileResponse
                original_temp_path = temp_zip_path  # Captura o path para a closure

                def cleanup_temp_file_on_close():
                    try:
                        if os.path.exists(original_temp_path):
                            os.unlink(original_temp_path)
                            logger.info(
                                f"Arquivo temporário {original_temp_path} limpo após o download.")
                    except Exception as e_cleanup:
                        logger.error(
                            f"Erro ao limpar arquivo temporário {original_temp_path}: {e_cleanup}", exc_info=True)

                response.close = cleanup_temp_file_on_close
                return response

            except Exception as e_zip_creation:
                logger.error(
                    f"Erro geral durante a criação do ZIP para modelo ID {model.pk}: {e_zip_creation}", exc_info=True)
                if temp_zip_path and os.path.exists(temp_zip_path):
                    try:
                        os.unlink(temp_zip_path)
                    except Exception as e_inner_cleanup:
                        logger.error(
                            f"Erro ao limpar temp_zip_path em falha de criação de ZIP: {e_inner_cleanup}")
                return Response({"error": "Erro ao preparar o pacote de download."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e_outer:
            logger.error(
                f"Erro inesperado na função de download para o modelo pk={pk}: {e_outer}", exc_info=True)
            return Response(
                {"error": "Ocorreu um erro inesperado ao processar seu pedido."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet para gerir os comentários de um modelo."""
    queryset = Comment.objects.all().order_by("-date")
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ModelImageViewSet(viewsets.GenericViewSet, mixins.DestroyModelMixin):
    """ViewSet para apagar imagens de modelos."""
    queryset = ModelImage.objects.all()
    serializer_class = ModelImageSerializer
    permission_classes = [IsOwnerOrReadOnly]


class ModelFileViewSet(viewsets.GenericViewSet, mixins.DestroyModelMixin):
    """ViewSet para apagar ficheiros de modelos."""
    queryset = ModelFile.objects.all()
    serializer_class = ModelFileSerializer
    permission_classes = [IsOwnerOrReadOnly]


# def get_monthly_history(user):
#     """
#     Retorna um array de 12 meses com a quantidade de garrafas recicladas
#     """
#     # Obtém o mês atual e ano
#     now = datetime.datetime.now()

#     # Cria um array com os últimos 12 meses
#     history = [0] * 12

#     # Obtém registros do banco de dados
#     records = RecyclingHistory.objects.filter(user=user)

#     # Preenche o array com os dados existentes
#     for record in records:
#         year, month = map(int, record.month.split('-'))
#         month_index = month - 1  # 0-based index

#         # Considera apenas os registros do último ano
#         if year == now.year and month <= now.month:
#             history[month_index] = record.quantity
#         elif year == now.year - 1 and month > now.month:
#             history[month_index] = record.quantity

#     return history


# --- Views do Marketplace ---

class CoinOfferListCreateView(generics.ListCreateAPIView):
    """Lista e cria ofertas de moedas de reciclagem."""
    serializer_class = CoinOfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return CoinOffer.objects.filter(status='active', coin_type='recycling').filter(
            Q(specific_user__isnull=True) | Q(specific_user=user)
        ).exclude(seller=user).order_by('-created_at')

    def perform_create(self, serializer):
        amount = serializer.validated_data.get('amount')
        seller = self.request.user
        with transaction.atomic():
            seller_for_update = get_user_model().objects.select_for_update().get(pk=seller.pk)
            if seller_for_update.recycling_coins < amount:
                raise serializers.ValidationError(
                    "Você não tem moedas de reciclagem suficientes.")
            seller_for_update.recycling_coins -= amount
            seller_for_update.save()
            serializer.save(seller=seller_for_update, coin_type='recycling')


class MyOffersListView(generics.ListAPIView):
    """Lista todas as ofertas criadas pelo utilizador atual."""
    serializer_class = CoinOfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CoinOffer.objects.filter(seller=self.request.user).order_by('-created_at')


class CancelOfferView(APIView):
    """Cancela uma oferta ativa e devolve as moedas ao vendedor."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        offer = get_object_or_404(
            CoinOffer, id=pk, seller=request.user, status='active')
        with transaction.atomic():
            offer.status = 'cancelled'
            offer.save()
            if offer.coin_type == 'recycling':
                offer.seller.recycling_coins += offer.amount
            else:
                offer.seller.reputation_coins += offer.amount
            offer.seller.save()
        return Response({"message": "Oferta cancelada com sucesso!"}, status=status.HTTP_200_OK)


class PurchaseCoinOfferView(APIView):
    """Processa a compra de uma oferta de moedas."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        buyer = request.user
        offer = get_object_or_404(CoinOffer, id=pk, status='active')

        if offer.specific_user and offer.specific_user != buyer:
            return Response({"error": "Esta oferta não está disponível para você."}, status=status.HTTP_403_FORBIDDEN)
        if offer.seller == buyer:
            return Response({"error": "Você não pode comprar sua própria oferta."}, status=status.HTTP_400_BAD_REQUEST)

        total_price = offer.calculate_total_price()
        if buyer.reputation_coins < total_price:
            return Response({"error": "Você não tem moedas de reputação suficientes."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            offer.status = 'completed'
            offer.save()
            if offer.offer_type == 'sale':
                buyer.reputation_coins -= total_price
                offer.seller.reputation_coins += total_price
            buyer.recycling_coins += offer.amount
            buyer.save()
            offer.seller.save()
            coin_transaction = CoinTransaction.objects.create(
                sender=offer.seller, receiver=buyer, offer=offer,
                coin_type=offer.coin_type, amount=offer.amount,
                transaction_type='gift' if offer.offer_type == 'gift' else 'purchase',
                price_paid=total_price
            )
        return Response(CoinTransactionSerializer(coin_transaction).data, status=status.HTTP_201_CREATED)


class TransactionHistoryView(generics.ListAPIView):
    """Lista o histórico de transações do utilizador."""
    serializer_class = CoinTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return CoinTransaction.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('-transaction_date')


class ExchangeRequestListCreateView(generics.ListCreateAPIView):
    """Lista ou cria solicitações de troca direta."""
    serializer_class = ExchangeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ExchangeRequest.objects.filter(Q(requester=user) | Q(receiver=user)).order_by('-created_at')


class ExchangeRequestDetailView(generics.RetrieveAPIView):
    """
    Recupera detalhes de uma solicitação de troca específica.
    """
    queryset = ExchangeRequest.objects.all()
    serializer_class = ExchangeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        user = self.request.user

        # Verificar se o usuário tem permissão para ver esta solicitação
        if obj.requester != user and obj.receiver != user:
            self.permission_denied(self.request)

        return obj


class RespondToExchangeRequestView(APIView):
    """
    Responde a uma solicitação de troca (aceitar ou rejeitar).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            exchange_request = get_object_or_404(
                ExchangeRequest,
                id=pk,
                receiver=request.user,
                status='pending'
            )

            # Obter decisão do corpo da requisição
            accept = request.data.get('accept', False)

            with transaction.atomic():
                if accept:
                    # Verificar se o receptor ainda tem moedas suficientes
                    if exchange_request.request_recycling_coins > request.user.recycling_coins:
                        # Devolver moedas ao solicitante e rejeitar
                        requester = exchange_request.requester
                        requester.recycling_coins += exchange_request.offer_recycling_coins
                        requester.reputation_coins += exchange_request.offer_reputation_coins
                        requester.save()

                        exchange_request.status = 'rejected'
                        exchange_request.save()

                        return Response(
                            {"error": "Você não tem moedas de reciclagem suficientes para completar esta troca."},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                    if exchange_request.request_reputation_coins > request.user.reputation_coins:
                        # Devolver moedas ao solicitante e rejeitar
                        requester = exchange_request.requester
                        requester.recycling_coins += exchange_request.offer_recycling_coins
                        requester.reputation_coins += exchange_request.offer_reputation_coins
                        requester.save()

                        exchange_request.status = 'rejected'
                        exchange_request.save()

                        return Response(
                            {"error": "Você não tem moedas de reputação suficientes para completar esta troca."},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                    # Processar a troca - Transferir moedas do receptor para o solicitante
                    requester = exchange_request.requester
                    receiver = request.user

                    # Transferir o que foi solicitado (do receptor para o solicitante)
                    receiver.recycling_coins -= exchange_request.request_recycling_coins
                    receiver.reputation_coins -= exchange_request.request_reputation_coins
                    requester.recycling_coins += exchange_request.request_recycling_coins
                    requester.reputation_coins += exchange_request.request_reputation_coins

                    # Transferir o que foi oferecido (moedas já foram reservadas do solicitante)
                    receiver.recycling_coins += exchange_request.offer_recycling_coins
                    receiver.reputation_coins += exchange_request.offer_reputation_coins

                    # Salvar alterações
                    requester.save()
                    receiver.save()

                    # Registrar as transações
                    transactions = []

                    if exchange_request.offer_recycling_coins > 0:
                        transactions.append(CoinTransaction.objects.create(
                            sender=requester,
                            receiver=receiver,
                            coin_type='recycling',
                            amount=exchange_request.offer_recycling_coins,
                            transaction_type='purchase',
                            price_paid=0,
                            notes=f"Parte de troca direta (ID: {exchange_request.id})"
                        ))

                    if exchange_request.offer_reputation_coins > 0:
                        transactions.append(CoinTransaction.objects.create(
                            sender=requester,
                            receiver=receiver,
                            coin_type='reputation',
                            amount=exchange_request.offer_reputation_coins,
                            transaction_type='purchase',
                            price_paid=0,
                            notes=f"Parte de troca direta (ID: {exchange_request.id})"
                        ))

                    if exchange_request.request_recycling_coins > 0:
                        transactions.append(CoinTransaction.objects.create(
                            sender=receiver,
                            receiver=requester,
                            coin_type='recycling',
                            amount=exchange_request.request_recycling_coins,
                            transaction_type='purchase',
                            price_paid=0,
                            notes=f"Parte de troca direta (ID: {exchange_request.id})"
                        ))

                    if exchange_request.request_reputation_coins > 0:
                        transactions.append(CoinTransaction.objects.create(
                            sender=receiver,
                            receiver=requester,
                            coin_type='reputation',
                            amount=exchange_request.request_reputation_coins,
                            transaction_type='purchase',
                            price_paid=0,
                            notes=f"Parte de troca direta (ID: {exchange_request.id})"
                        ))

                    exchange_request.status = 'accepted'

                    # Serializar todas as transações
                    transaction_serializer = CoinTransactionSerializer(
                        transactions, many=True)

                else:
                    # Rejeitar e devolver moedas ao solicitante
                    requester = exchange_request.requester
                    requester.recycling_coins += exchange_request.offer_recycling_coins
                    requester.reputation_coins += exchange_request.offer_reputation_coins
                    requester.save()

                    exchange_request.status = 'rejected'
                    transaction_serializer = None

                exchange_request.save()

                # Serializar a solicitação de troca
                exchange_serializer = ExchangeRequestSerializer(
                    exchange_request)

                response_data = {
                    "exchange_request": exchange_serializer.data,
                    "message": "Solicitação de troca aceita com sucesso!" if accept else "Solicitação de troca rejeitada."
                }

                if transaction_serializer:
                    response_data["transactions"] = transaction_serializer.data

                return Response(response_data, status=status.HTTP_200_OK)

        except ExchangeRequest.DoesNotExist:
            return Response(
                {"error": "Solicitação de troca não encontrada ou já foi processada."},
                status=status.HTTP_404_NOT_FOUND
            )


class CancelExchangeRequestView(APIView):
    """
    Cancela uma solicitação de troca pendente.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            exchange_request = get_object_or_404(
                ExchangeRequest,
                id=pk,
                requester=request.user,
                status='pending'
            )

            with transaction.atomic():
                # Devolver moedas reservadas ao solicitante
                request.user.recycling_coins += exchange_request.offer_recycling_coins
                request.user.reputation_coins += exchange_request.offer_reputation_coins
                request.user.save()

                exchange_request.status = 'cancelled'
                exchange_request.save()

                return Response(
                    {"message": "Solicitação de troca cancelada com sucesso!"},
                    status=status.HTTP_200_OK
                )

        except ExchangeRequest.DoesNotExist:
            return Response(
                {"error": "Solicitação de troca não encontrada ou já foi processada."},
                status=status.HTTP_404_NOT_FOUND
            )


class UserBalanceView(APIView):
    """
    Retorna o saldo atual de moedas do usuário.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "recycling_coins": user.recycling_coins,
            "reputation_coins": user.reputation_coins
        })
