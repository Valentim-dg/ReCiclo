from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser


class CustomUserCreationForm(UserCreationForm):
    """
    Um formulário para criar novos utilizadores através do painel de administração.
    Herda do UserCreationForm padrão e o adapta para o modelo CustomUser.
    """
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        # Define os campos que aparecerão no formulário de CRIAÇÃO de utilizador.
        fields = ('username', 'email', 'is_curator')


class CustomUserChangeForm(UserChangeForm):
    """
    Um formulário para atualizar utilizadores existentes através do painel de administração.
    Herda do UserChangeForm padrão e o expande para incluir todos os campos
    personalizados do modelo CustomUser.
    """
    class Meta:
        model = CustomUser
        # Define TODOS os campos que podem ser editados na página de admin.
        fields = (
            'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'is_superuser', 'is_curator',
            'groups', 'user_permissions',
            'recycling_coins', 'reputation_coins', 'level', 'experience', 'profile_image'
        )
