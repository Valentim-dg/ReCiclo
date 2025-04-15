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
from django.db import models


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
            # Permite acesso público
            permission_classes = [permissions.AllowAny]
        else:
            # Exige login para modificar
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

    # Inicializa as conquistas do usuário
    user.achievements = []
    user.save()

    # Gera as conquistas iniciais
    check_achievements(user)

    return Response({"message": "Usuário cadastrado com sucesso!"}, status=201)


class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retorna os dados do usuário para o dashboard"""
        user = request.user

        # Verifica se o usuário já tem conquistas
        if not hasattr(user, 'achievements') or not user.achievements:
            # Inicializa as conquistas do usuário se ainda não existirem
            achievements = check_achievements(user)
        else:
            # Atualiza as conquistas existentes
            achievements = check_achievements(user)

        # Add recycling history data
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
            "achievements": achievements,
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

    # Verifica e atualiza as conquistas
    achievements = check_achievements(user)

    # Processa histórico de reciclagem para um array de 12 meses
    recycling_history = get_monthly_history(user)

    # Retorna dados do dashboard
    return Response({
        'recyclingCoins': user.recycling_coins,
        'reputationCoins': user.reputation_coins,
        'level': user.level,
        'recyclingHistory': recycling_history,
        'achievements': achievements,
    })


def get_monthly_history(user):
    """
    Retorna um array de 12 meses com a quantidade de garrafas recicladas
    """
    # Obtém o mês atual e ano
    now = datetime.datetime.now()

    # Cria um array com os últimos 12 meses
    history = [0] * 12

    # Obtém registros do banco de dados
    records = RecyclingHistory.objects.filter(user=user)

    # Preenche o array com os dados existentes
    for record in records:
        year, month = map(int, record.month.split('-'))
        month_index = month - 1  # 0-based index

        # Considera apenas os registros do último ano
        if year == now.year and month <= now.month:
            history[month_index] = record.quantity
        elif year == now.year - 1 and month > now.month:
            history[month_index] = record.quantity

    return history


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recycle_bottles(request):
    user = request.user
    bottle_type = request.data.get('type')
    volume = request.data.get('volume')
    quantity = request.data.get('quantity', 1)

    # Validações básicas
    if not bottle_type or not volume:
        return Response({'message': 'Tipo e volume são obrigatórios.'}, status=400)

    try:
        quantity = int(quantity)
        if quantity <= 0:
            return Response({'message': 'A quantidade deve ser maior que zero.'}, status=400)
    except ValueError:
        return Response({'message': 'Quantidade inválida.'}, status=400)

    # Registrar a garrafa reciclada
    bottle = Bottle.objects.create(
        user=user,
        type=bottle_type,
        volume=volume,
        quantity=quantity,
        date=datetime.now()  # Garante que a data seja definida corretamente
    )

    print(
        f"Nova garrafa registrada: ID={bottle.id}, User={user.username}, Tipo={bottle_type}, Volume={volume}, Quantidade={quantity}")

    # Obter lista de conquistas desbloqueadas antes da reciclagem
    previous_achievements = []
    if hasattr(user, 'achievements') and user.achievements:
        for ach in user.achievements:
            if ach.get('unlocked', False):
                previous_achievements.append(ach.get('id'))

    # Adicionar moedas de reciclagem
    user.recycling_coins += quantity

    # Adicionar experiência
    experience_gain = quantity * 5
    user.experience += experience_gain

    # Verificar se subiu de nível
    exp_per_level = 100
    if user.experience >= user.level * exp_per_level:
        # Calcular quantos níveis ganhou
        levels_gained = 0
        while user.experience >= (user.level + levels_gained) * exp_per_level:
            levels_gained += 1

        user.level += levels_gained

    # Atualizar histórico mensal
    current_month = datetime.now().strftime('%Y-%m')
    try:
        history_record = RecyclingHistory.objects.get(
            user=user, month=current_month)
        history_record.quantity += quantity
        history_record.save()
        print(
            f"Histórico de reciclagem atualizado: mês={current_month}, total={history_record.quantity}")
    except RecyclingHistory.DoesNotExist:
        history_record = RecyclingHistory.objects.create(
            user=user,
            month=current_month,
            quantity=quantity
        )
        print(
            f"Novo histórico de reciclagem criado: mês={current_month}, quantidade={quantity}")

    # Salvar alterações no usuário
    user.save()

    total_bottles = Bottle.objects.filter(user=user).aggregate(
        total=models.Sum('quantity'))['total'] or 0
    print(f"Total de garrafas após registro: {total_bottles}")

    # Verificar e atualizar conquistas
    updated_achievements = check_achievements(user)

    # Identificar quais conquistas foram desbloqueadas nesta reciclagem
    new_unlocked_achievements = []
    for ach in updated_achievements:
        if ach.get('unlocked', False) and ach.get('id') not in previous_achievements:
            new_unlocked_achievements.append({
                'id': ach.get('id'),
                'title': ach.get('title'),
                'description': ach.get('description')
            })
            print(f"Nova conquista desbloqueada: {ach.get('title')}")

    return Response({
        'message': 'Reciclagem registrada com sucesso!',
        'bottles': quantity,
        'recycling_coins': user.recycling_coins,
        'level': user.level,
        'experience': user.experience,
        'new_achievements': new_unlocked_achievements
    })


def check_achievements(user):
    """
    Verifica conquistas do usuário e retorna todas as conquistas possíveis
    com status atualizado (desbloqueadas e não desbloqueadas)
    """
    # Define todas as possíveis conquistas (com critérios)
    all_achievements = [
        {
            "id": "first_bottle",
            "title": "Primeiro Passo",
            "description": "Recicle sua primeira garrafa",
            "criteria": {"bottles_recycled": 1}
        },
        {
            "id": "eco_beginner",
            "title": "Eco Iniciante",
            "description": "Recicle 10 garrafas",
            "criteria": {"bottles_recycled": 10}
        },
        {
            "id": "eco_enthusiast",
            "title": "Eco Entusiasta",
            "description": "Recicle 50 garrafas",
            "criteria": {"bottles_recycled": 50}
        },
        {
            "id": "eco_warrior",
            "title": "Eco Guerreiro",
            "description": "Recicle 100 garrafas",
            "criteria": {"bottles_recycled": 100}
        },
        {
            "id": "eco_master",
            "title": "Mestre da Reciclagem",
            "description": "Recicle 500 garrafas",
            "criteria": {"bottles_recycled": 500}
        },
        {
            "id": "level_5",
            "title": "Aprendiz",
            "description": "Alcance o nível 5",
            "criteria": {"level": 5}
        },
        {
            "id": "level_10",
            "title": "Experiente",
            "description": "Alcance o nível 10",
            "criteria": {"level": 10}
        },
        {
            "id": "level_20",
            "title": "Elite",
            "description": "Alcance o nível 20",
            "criteria": {"level": 20}
        },
        {
            "id": "monthly_champion",
            "title": "Campeão Mensal",
            "description": "Recicle 50 garrafas em um único mês",
            "criteria": {"monthly_bottles": 50}
        },
        {
            "id": "consistent_recycler",
            "title": "Reciclador Consistente",
            "description": "Recicle garrafas em 3 meses consecutivos",
            "criteria": {"consecutive_months": 3}
        }
    ]

    # Obtém estatísticas do usuário
    bottles_query = Bottle.objects.filter(user=user)
    total_bottles = 0

    # Se houver registros de garrafas, somamos as quantidades
    if bottles_query.exists():
        total_sum = bottles_query.aggregate(total=models.Sum('quantity'))
        total_bottles = total_sum['total'] or 0

    # Se não encontrarmos garrafas no modelo Bottle, tentamos calcular a partir do histórico de reciclagem
    if total_bottles == 0:
        history_sum = RecyclingHistory.objects.filter(
            user=user).aggregate(total=models.Sum('quantity'))
        total_bottles = history_sum['total'] or 0

    print(f"User {user.username}: Total bottles query result: {total_bottles}")
    print(f"Bottles records count: {bottles_query.count()}")
    if bottles_query.exists():
        for bottle in bottles_query:
            print(
                f"Bottle record: type={bottle.type}, volume={bottle.volume}, quantity={bottle.quantity}, date={bottle.date}")

    # Obtém maior quantidade de garrafas recicladas em um único mês
    monthly_max = RecyclingHistory.objects.filter(
        user=user).aggregate(max=models.Max('quantity'))['max'] or 0

    # Verifica meses consecutivos
    histories = RecyclingHistory.objects.filter(user=user).order_by('month')
    consecutive_months = 0
    if histories:
        months = [h.month for h in histories]
        months.sort()  # Garante ordem cronológica

        current_streak = 1
        max_streak = 1

        for i in range(1, len(months)):
            # Verifica se os meses são consecutivos
            prev_year, prev_month = map(int, months[i-1].split('-'))
            curr_year, curr_month = map(int, months[i].split('-'))

            if (curr_month == prev_month + 1 and curr_year == prev_year) or \
               (curr_month == 1 and prev_month == 12 and curr_year == prev_year + 1):
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 1

        consecutive_months = max_streak

    # Lista para armazenar conquistas atualizadas
    user_achievements = []

    # Verifica se o usuário já tem conquistas salvas
    existing_achievements = getattr(user, 'achievements', [])
    # Conjunto para rastrear IDs de conquistas já desbloqueadas
    unlocked_ids = set()
    for ach in existing_achievements:
        if ach.get('unlocked', False):
            unlocked_ids.add(ach.get('id'))

    # Verifica cada conquista
    for achievement in all_achievements:
        # Prepara informações da conquista
        ach_info = {
            "id": achievement["id"],
            "title": achievement["title"],
            "description": achievement["description"],
            "unlocked": False,
            "progress": None
        }

        # Verifica os critérios
        criteria = achievement["criteria"]
        unlocked = False

        if "bottles_recycled" in criteria:
            target = criteria["bottles_recycled"]
            ach_info["progress"] = {
                "current": total_bottles,
                "total": target,
                "unit": "garrafas"
            }
            unlocked = total_bottles >= target

        elif "level" in criteria:
            target = criteria["level"]
            ach_info["progress"] = {
                "current": user.level,
                "total": target,
                "unit": "níveis"
            }
            unlocked = user.level >= target

        elif "monthly_bottles" in criteria:
            target = criteria["monthly_bottles"]
            ach_info["progress"] = {
                "current": monthly_max,
                "total": target,
                "unit": "garrafas"
            }
            unlocked = monthly_max >= target

        elif "consecutive_months" in criteria:
            target = criteria["consecutive_months"]
            ach_info["progress"] = {
                "current": consecutive_months,
                "total": target,
                "unit": "meses"
            }
            unlocked = consecutive_months >= target

        # Define se está desbloqueada
        ach_info["unlocked"] = unlocked or achievement["id"] in unlocked_ids

        # Adiciona à lista
        user_achievements.append(ach_info)

        # Se for uma nova conquista desbloqueada, concede moedas de reputação
        if unlocked and achievement["id"] not in unlocked_ids:
            user.reputation_coins += 10  # Recompensa por conquista desbloqueada
            # Adiciona à lista de desbloqueadas
            unlocked_ids.add(achievement["id"])

    print(f"User {user.username}: Final total bottles counted: {total_bottles}")
    print(
        f"User achievements after processing: {len(user_achievements)} achievements")

    # Atualiza as conquistas do usuário
    user.achievements = user_achievements
    user.save()

    return user_achievements
