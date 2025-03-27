from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


# Register your models here.

class CustomUserAdmin(UserAdmin):
    # Campos a serem exibidos na lista de usuários no Django Admin
    list_display = ['username', 'email', 'recycling_coins', 'achievements',
                    'reputation_coins', 'level', 'is_active', 'date_joined']

    # Configuração dos campos no formulário de detalhes do usuário
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('recycling_coins', 'reputation_coins',
         'level', 'achievements', 'recycling_history')}),
    )

    # Campos que podem ser editados diretamente na lista de usuários
    list_filter = UserAdmin.list_filter + \
        ('recycling_coins', 'reputation_coins', 'level')

    # Configurações dos campos que aparecem no formulário de edição do usuário
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('recycling_coins', 'reputation_coins',
         'level', 'achievements', 'recycling_history')}),
    )


# Registrando o modelo CustomUser com a configuração personalizada do Admin
admin.site.register(CustomUser, CustomUserAdmin)
