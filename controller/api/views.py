from rest_framework import viewsets, permissions
from .models import Bottle, Model3D, ModelLike, ModelFavorite, Comment, ModelFile, ModelImage, RecyclingHistory
from .serializers import BottleSerializer, Model3DSerializer, CommentSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import Model3DSerializer, UserSerializer
from datetime import datetime
from django.db.models import Sum
from datetime import datetime
import calendar
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse


class UserProfileView(APIView):
    """Retorna os dados do usuário autenticado"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)


class BottleViewSet(viewsets.ModelViewSet):
    queryset = Bottle.objects.all()
    serializer_class = BottleSerializer


class Model3DViewSet(viewsets.ModelViewSet):
    queryset = Model3D.objects.all()
    serializer_class = Model3DSerializer

    def perform_create(self, serializer):
        """Garante que o usuário autenticado seja registrado no modelo."""
        serializer.save(user=self.request.user)

    def get_permissions(self):
        """
        Define permissões diferentes para ações diferentes:
        - Listagem e visualização: qualquer usuário pode ver.
        - Criar, editar e excluir exige login.
        """
        if self.action in ['list', 'retrieve']:
            # 🔹 Permite acesso público
            permission_classes = [permissions.AllowAny]
        else:
            # 🔹 Exige login para modificar
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        """
        Permite curtir/remover like, apenas usuários autenticados.
        """
        model = get_object_or_404(Model3D, pk=pk)
        user = request.user

        like, created = ModelLike.objects.get_or_create(user=user, model=model)

        if not created:
            like.delete()
            model.likes -= 1
            model.save()
            return Response({'likes': model.likes, 'message': 'Like removido'}, status=status.HTTP_200_OK)
        else:
            model.likes += 1
            model.save()
            return Response({'likes': model.likes, 'message': 'Like adicionado'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def save(self, request, pk=None):
        """
        Permite salvar/remover dos favoritos, apenas usuários autenticados.
        """
        model = get_object_or_404(Model3D, pk=pk)
        user = request.user

        favorite, created = ModelFavorite.objects.get_or_create(
            user=user, model=model)

        if not created:
            favorite.delete()
            return Response({'saved': False, 'message': 'Removido dos favoritos'}, status=status.HTTP_200_OK)
        else:
            return Response({'saved': True, 'message': 'Adicionado aos favoritos'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def download(self, request, pk=None):
        """Registra um download e envia o arquivo do modelo para o usuário autenticado."""
        model = get_object_or_404(Model3D, pk=pk)
        model.downloads += 1
        model.save()

        response = FileResponse(model.file.open(
            'rb'), as_attachment=True, filename=model.file.name)
        return response


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by("-date")
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ModelUploadView(APIView):
    """View para upload de modelos 3D"""
    parser_classes = (MultiPartParser, FormParser)
    # Apenas usuários autenticados podem enviar modelos
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        """Recebe e processa o upload de arquivos"""
        user = request.user
        name = request.data.get("name")
        description = request.data.get("description")
        file = request.FILES.get("file")  # Apenas um arquivo
        image = request.FILES.get("image")  # Apenas uma imagem (opcional)

        if not name or not description or not file:
            return Response({"error": "Preencha todos os campos obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        # Criar o modelo 3D
        model_3d = Model3D.objects.create(
            user=user,
            name=name,
            description=description
        )

        # Salvar o arquivo STL
        ModelFile.objects.create(
            model=model_3d, file=file, file_name=file.name
        )

        # Salvar a imagem, se houver
        if image:
            ModelImage.objects.create(model3d=model_3d, image=image)

        return Response({"message": "Modelo enviado com sucesso!"}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def register_user(request):
    data = request.data
    if User.objects.filter(email=data["email"]).exists():
        return Response({"error": "Email já cadastrado."}, status=400)

    user = User.objects.create(
        username=data["email"],
        email=data["email"],
        password=make_password(data["password"]),
        first_name=data.get("name", ""),
    )

    return Response({"message": "Usuário cadastrado com sucesso!"}, status=201)


class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retorna os dados do usuário para o dashboard"""
        user = request.user  # O usuário autenticado já é um CustomUser

        # Add recycling history data - similar to get_dashboard_data
        recycling_data = [0] * 12
        current_year = datetime.now().year

        monthly_records = RecyclingHistory.objects.filter(
            user=user,
            month__startswith=f"{current_year}-"
        )

        for record in monthly_records:
            month_str = record.month.split('-')[1]  # Extrair "MM" de "YYYY-MM"
            month_index = int(month_str) - 1  # Ajustar para índice 0-11
            recycling_data[month_index] = record.quantity

        # If no records, calculate from bottles
        if sum(recycling_data) == 0:
            for month in range(1, 13):
                month_str = f"{current_year}-{month:02d}"
                start_date = f"{month_str}-01"
                last_day = calendar.monthrange(current_year, month)[1]
                end_date = f"{month_str}-{last_day}"
                bottles_count = Bottle.objects.filter(
                    user=user,
                    date__range=[start_date, end_date]
                ).aggregate(total=Sum('quantity'))['total'] or 0
                recycling_data[month-1] = bottles_count

        return Response({
            "recyclingCoins": user.recycling_coins,
            "reputationCoins": user.reputation_coins,
            "level": user.level,
            "recyclingHistory": recycling_data,
            "achievements": user.achievements,
        })


REWARD_TABLE = {
    "350ml": 5,   # 5 moedas de reciclagem
    "500ml": 7,
    "1L": 10,
    "1.5L": 15,
    "2L": 20,
    "3L": 25,
}


class RecycleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        volume = request.data.get("volume")
        quantity = int(request.data.get("quantity", 1))

        # Calcular moedas de reciclagem e reputação
        # Se não encontrado, usa 5 como padrão
        base_reward = REWARD_TABLE.get(volume, 5)
        recycling_coins = base_reward * quantity
        reputation_coins = recycling_coins // 2  # Metade da reciclagem vira reputação

        # Atualizar perfil do usuário
        user.recycling_coins += recycling_coins
        user.reputation_coins += reputation_coins
        user.experience += recycling_coins  # Exp baseada nas moedas de reciclagem

        # Calcular nível (Exemplo: a cada 100 pontos de experiência sobe 1 nível)
        while user.experience >= user.level * 100:
            user.experience -= user.level * 100
            user.level += 1

        user.save()
        # Registrar histórico de reciclagem
        today = datetime.today().strftime("%Y-%m")
        history, _ = RecyclingHistory.objects.get_or_create(
            user=user, month=today)
        history.quantity += quantity
        history.save()

        return Response({
            "message": "Reciclagem registrada com sucesso!",
            "recyclingCoins": user.recycling_coins,
            "reputationCoins": user.reputation_coins,
            "level": user.level,
            "experience": user.experience,
            "recyclingHistory": history.quantity,
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_data(request):
    user = request.user

    # Obter os dados de recycling_history
    recycling_data = [0] * 12  # Inicializa com 0 para cada mês

    # Obter ano atual
    current_year = datetime.now().year

    # Buscar os registros de RecyclingHistory do usuário para o ano atual
    monthly_records = RecyclingHistory.objects.filter(
        user=user,
        month__startswith=f"{current_year}-"
    )

    # Preencher os dados mensais
    for record in monthly_records:
        month_str = record.month.split('-')[1]  # Extrair "MM" de "YYYY-MM"
        month_index = int(month_str) - 1  # Ajustar para índice 0-11
        recycling_data[month_index] = record.quantity

    # Alternativamente, podemos calcular diretamente das garrafas recicladas
    # caso não existam registros em RecyclingHistory
    if sum(recycling_data) == 0:
        for month in range(1, 13):
            month_str = f"{current_year}-{month:02d}"
            start_date = f"{month_str}-01"

            # Determinar o último dia do mês
            last_day = calendar.monthrange(current_year, month)[1]
            end_date = f"{month_str}-{last_day}"

            # Contar garrafas recicladas no mês
            bottles_count = Bottle.objects.filter(
                user=user,
                date__range=[start_date, end_date]
            ).aggregate(total=Sum('quantity'))['total'] or 0

            recycling_data[month-1] = bottles_count

    # Obter conquistas e outros dados relevantes
    achievements = user.achievements

    print("Recycling data:", recycling_data)

    return JsonResponse({
        'recyclingCoins': user.recycling_coins,
        'reputationCoins': user.reputation_coins,
        'level': user.level,
        'recyclingHistory': recycling_data,
        'achievements': achievements
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recycle_bottles(request):
    user = request.user
    bottle_type = request.data.get('type')
    volume = request.data.get('volume')
    quantity = int(request.data.get('quantity', 1))

    # Criar registro de garrafa
    bottle = Bottle.objects.create(
        user=user,
        type=bottle_type,
        volume=volume,
        quantity=quantity
    )

    # Atualizar moedas e experiência do usuário
    coins_per_bottle = 10  # Você pode ajustar conforme sua lógica de negócio
    user.recycling_coins += quantity * coins_per_bottle
    user.experience += quantity * 5

    # Verificar se o usuário subiu de nível
    level_threshold = user.level * 100
    if user.experience >= level_threshold:
        user.level += 1
        # Adicionar conquista se for o primeiro nível ganho
        if user.level == 2 and not any(a.get('title') == 'Primeiro Nível' for a in user.achievements):
            user.achievements.append({
                'title': 'Primeiro Nível',
                'description': 'Você alcançou o nível 2!'
            })

    # Atualizar RecyclingHistory
    current_month = datetime.now().strftime('%Y-%m')
    history, created = RecyclingHistory.objects.get_or_create(
        user=user,
        month=current_month,
        defaults={'quantity': 0}
    )
    history.quantity += quantity
    history.save()

    # Salvar usuário
    user.save()

    return JsonResponse({
        'success': True,
        'message': 'Reciclagem registrada com sucesso!',
        'recyclingCoins': user.recycling_coins,
        'level': user.level
    })
