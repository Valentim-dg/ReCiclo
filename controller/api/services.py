# api/services.py

from datetime import datetime
from django.db.models import Sum, Max
from .models import Bottle, RecyclingHistory, Achievement, UserAchievement, Model3D


def _calculate_consecutive_months(user):
    """
    Calcula a maior sequência de meses consecutivos em que um utilizador reciclou.
    Função auxiliar para o sistema de conquistas.
    """
    # Usa .distinct() para garantir que não há meses duplicados na contagem
    histories = RecyclingHistory.objects.filter(user=user).values_list(
        'month', flat=True).order_by('month').distinct()
    if not histories:
        return 0

    # Converte as strings "AAAA-MM" para objetos de data para uma comparação fiável
    months_dates = sorted([datetime.strptime(m, "%Y-%m") for m in histories])
    if not months_dates:
        return 0

    max_streak = 1
    current_streak = 1
    for i in range(1, len(months_dates)):
        prev_month = months_dates[i-1]
        current_month = months_dates[i]

        # Verifica se os meses são consecutivos, considerando a viragem do ano
        if (current_month.year - prev_month.year) * 12 + (current_month.month - prev_month.month) == 1:
            current_streak += 1
        else:
            current_streak = 1  # Reseta a contagem se houver uma falha na sequência

        max_streak = max(max_streak, current_streak)

    return max_streak


def add_experience(user, xp_amount):
    """
    Adiciona uma quantidade específica de experiência a um utilizador e trata os level-ups.

    Esta função centraliza a lógica de ganho de XP para que possa ser
    reutilizada em diferentes partes da aplicação (reciclagem, upload de modelos, etc.).

    Args:
        user: A instância do objeto de utilizador.
        xp_amount: A quantidade de experiência a ser adicionada.

    Returns:
        bool: True se o utilizador subiu de nível, False caso contrário.
    """
    if not isinstance(xp_amount, int) or xp_amount <= 0:
        return False

    user.experience += xp_amount
    leveled_up = False

    # A regra de negócio para o próximo nível (pode ser ajustada).
    # Ex: Nível 1 precisa de 100 XP, Nível 2 de 200 XP, etc.
    experience_needed = user.level * 100

    while user.experience >= experience_needed:
        user.experience -= experience_needed
        user.level += 1
        leveled_up = True
        # Atualiza a experiência necessária para o novo nível.
        experience_needed = user.level * 100

    user.save(update_fields=['experience', 'level'])

    return leveled_up


def update_user_achievements(user):
    """
    Verifica todas as conquistas e desbloqueia as que forem necessárias,
    usando uma abordagem "data-driven" baseada nos critérios do modelo Achievement.
    """
    newly_unlocked = []

    # 1. Calcula todas as estatísticas relevantes do utilizador de uma só vez para eficiência
    user_stats = {
        'BOTTLES_TOTAL': Bottle.objects.filter(user=user).aggregate(total=Sum('quantity'))['total'] or 0,
        'USER_LEVEL': user.level,
        'MONTHLY_BOTTLES': RecyclingHistory.objects.filter(user=user).aggregate(max_quantity=Max('quantity'))['max_quantity'] or 0,
        'CONSECUTIVE_MONTHS': _calculate_consecutive_months(user),
        'MODELS_UPLOADED': Model3D.objects.filter(user=user).count(),
    }

    # 2. Pega todas as conquistas que o utilizador AINDA NÃO DESBLOQUEOU
    achievements_to_check = Achievement.objects.exclude(
        userachievement__user=user,
        userachievement__unlocked_at__isnull=False
    )

    for achievement in achievements_to_check:
        # Pega a estatística relevante do utilizador com base no tipo de critério da conquista
        current_progress = user_stats.get(achievement.criteria_type, 0)

        # Compara o progresso atual com a meta (valor) da conquista
        if current_progress >= achievement.criteria_value:
            user_achievement, created = UserAchievement.objects.get_or_create(
                user=user,
                achievement=achievement
            )

            # Desbloqueia a conquista e aplica a recompensa se for a primeira vez
            if user_achievement.unlock():
                user.reputation_coins += 10
                newly_unlocked.append(achievement)

    # Se alguma conquista foi desbloqueada, a recompensa em moedas precisa de ser guardada
    if newly_unlocked:
        user.save(update_fields=['reputation_coins'])

    return newly_unlocked
