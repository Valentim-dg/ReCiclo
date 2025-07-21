from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Achievement, UserAchievement
from .forms import CustomUserCreationForm, CustomUserChangeForm


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Configuração personalizada para a exibição e gestão do modelo CustomUser
    no painel de administração do Django.
    """
    # Define os formulários customizados para a criação e edição de utilizadores.
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    model = CustomUser

    # Define as colunas a serem exibidas na lista de utilizadores.
    list_display = [
        'username',
        'email',
        'is_curator',
        'is_staff',
        'level',
        'recycling_coins',
        'reputation_coins',
        'unlocked_achievements_count'
    ]

    # Organiza os campos no formulário de edição de um utilizador existente.
    fieldsets = UserAdmin.fieldsets + (
        ('Campos Customizados', {'fields': (
            'recycling_coins',
            'reputation_coins',
            'level',
            'experience',
            'profile_image',
            'is_curator'
        )}),
    )

    # Organiza os campos no formulário de criação de um novo utilizador.
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('is_curator',)}),
    )

    def unlocked_achievements_count(self, obj):
        """
        Calcula e retorna a contagem de conquistas desbloqueadas para um utilizador.
        Este método é usado para criar uma coluna calculada em 'list_display'.
        """
        return obj.user_achievements.filter(unlocked_at__isnull=False).count()

    # Define um nome amigável para a coluna no painel de administração.
    unlocked_achievements_count.short_description = 'Conquistas Desbloqueadas'


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    """
    Configuração para a gestão do modelo Achievement no painel de administração.
    Permite criar e editar as definições de todas as conquistas da plataforma.
    """
    list_display = ('id', 'title', 'description',
                    'criteria_type', 'criteria_value')
    list_filter = ('criteria_type',)
    search_fields = ('id', 'title', 'description')


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    """
    Configuração para a gestão do modelo UserAchievement no painel de administração.
    Permite visualizar e gerir as relações entre utilizadores e as suas conquistas.
    """
    list_display = ('user', 'achievement', 'unlocked_at')
    list_filter = ('achievement', 'unlocked_at')
    search_fields = ('user__username', 'achievement__title')
