from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
import datetime
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from django.utils import timezone
import math


# --- Modelos de Utilizador e Conquistas ---

class CustomUser(AbstractUser):
    """
    Modelo de utilizador personalizado que estende o AbstractUser padrão do Django.
    Adiciona campos para gamificação, economia interna e perfil.
    """
    recycling_coins = models.IntegerField(
        default=0, verbose_name=_('Moedas de Reciclagem'))
    reputation_coins = models.IntegerField(
        default=0, verbose_name=_('Moedas de Reputação'))
    level = models.IntegerField(default=1, verbose_name=_('Nível'))
    experience = models.IntegerField(default=0, verbose_name=_('Experiência'))
    profile_image = models.ImageField(
        upload_to="profile_images/", null=True, blank=True, verbose_name=_('Foto de Perfil')
    )
    is_curator = models.BooleanField(
        default=False, help_text=_("Designa que este utilizador tem permissões de curadoria.")
    )

    # Relações ManyToMany para evitar conflitos com o modelo User padrão.
    groups = models.ManyToManyField(
        "auth.Group", related_name="customuser_groups", blank=True
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission", related_name="customuser_permissions", blank=True
    )

    def __str__(self):
        return self.username


class Achievement(models.Model):
    """
    Define uma conquista que pode ser desbloqueada pelos utilizadores.
    A lógica de desbloqueio é determinada pelo 'criteria_type' e 'criteria_value'.
    """
    CRITERIA_TYPE_CHOICES = [
        ('BOTTLES_TOTAL', 'Total de Garrafas Recicladas'),
        ('USER_LEVEL', 'Nível do Utilizador'),
        ('MONTHLY_BOTTLES', 'Garrafas num Mês'),
        ('CONSECUTIVE_MONTHS', 'Meses Consecutivos a Reciclar'),
        ('MODELS_UPLOADED', 'Total de Modelos Publicados'),
    ]

    id = models.CharField(max_length=50, primary_key=True)
    title = models.CharField(max_length=100, verbose_name=_('Título'))
    description = models.TextField(verbose_name=_('Descrição'))
    icon_name = models.CharField(
        max_length=50, default="FaTrophy", verbose_name=_('Nome do Ícone'))
    criteria_type = models.CharField(
        max_length=20, choices=CRITERIA_TYPE_CHOICES, default='BOTTLES_TOTAL',
        help_text=_("O tipo de estatística do utilizador a ser verificada.")
    )
    criteria_value = models.IntegerField(
        default=0, help_text=_("O valor que o utilizador precisa de alcançar para esta conquista.")
    )

    def __str__(self):
        return self.title


class UserAchievement(models.Model):
    """
    Tabela de ligação que regista o progresso de um utilizador numa conquista específica.
    """
    user = models.ForeignKey(
        'CustomUser', on_delete=models.CASCADE, related_name="user_achievements")
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(
        null=True, blank=True, verbose_name=_('Desbloqueada em'))

    class Meta:
        unique_together = ('user', 'achievement')

    def unlock(self):
        """Marca a conquista como desbloqueada se ainda não o estiver."""
        if not self.unlocked_at:
            self.unlocked_at = timezone.now()
            self.save()
            return True  # Retorna True se foi desbloqueada agora
        return False  # Já estava desbloqueada


# --- Modelos de Reciclagem ---

class Bottle(models.Model):
    """Regista cada submissão de reciclagem de garrafas por um utilizador."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    quantity = models.IntegerField()
    type = models.CharField(max_length=100, verbose_name=_('Tipo (Marca)'))
    volume = models.CharField(
        max_length=10, default='0', help_text=_('Ex: "500ml", "1L", "2L"'))
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.quantity} garrafas de {self.volume}"


class RecyclingHistory(models.Model):
    """
    Agrega a quantidade total de garrafas recicladas por um utilizador num determinado mês.
    Útil para cálculos de conquistas mensais.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    month = models.CharField(max_length=7, help_text=_('Formato: "AAAA-MM"'))
    quantity = models.IntegerField(default=0)

    class Meta:
        unique_together = ("user", "month")

    def __str__(self):
        return f"{self.user.username} - {self.month}: {self.quantity} garrafas"


# --- Modelos de Conteúdo (Modelos 3D) ---

class Model3D(models.Model):
    """Representa um modelo 3D publicado por um utilizador."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField()
    likes = models.IntegerField(default=0)
    downloads = models.IntegerField(default=0)
    price = models.IntegerField(
        default=0, help_text=_("Preço em moedas de reciclagem."))
    is_free = models.BooleanField(default=True)
    is_visible = models.BooleanField(default=True, help_text=_(
        "Controla se o modelo é visível para o público."))

    def __str__(self):
        return self.name


class ModelFile(models.Model):
    """Um ficheiro de modelo (ex: .stl, .obj) associado a um Model3D."""
    model = models.ForeignKey(
        Model3D, on_delete=models.CASCADE, related_name="files")
    file = models.FileField(upload_to="models3d/files/")
    file_name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.model.name} - {self.file_name}"


class ModelImage(models.Model):
    """Uma imagem de pré-visualização associada a um Model3D."""
    model3d = models.ForeignKey(
        Model3D, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="models3d/images/")

    def __str__(self):
        return f"Imagem para {self.model3d.name}"


class ModelLike(models.Model):
    """Regista um 'like' de um utilizador num Model3D."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    model = models.ForeignKey(Model3D, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'model')


class ModelFavorite(models.Model):
    """Regista quando um utilizador salva um Model3D nos seus favoritos."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    model = models.ForeignKey(Model3D, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'model')


class Comment(models.Model):
    """Representa um comentário feito por um utilizador num Model3D."""
    model = models.ForeignKey(
        Model3D, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentário de {self.user.username} - {self.text[:30]}"


# --- Modelos do Marketplace ---

class CoinOffer(models.Model):
    """
    Modelo para ofertas de moedas que um utilizador coloca disponível para venda
    ou doação no mercado geral ou para um utilizador específico.
    """
    COIN_TYPES = (('recycling', _('Reciclagem')),
                  ('reputation', _('Reputação')))
    OFFER_TYPES = (('sale', _('Venda')), ('gift', _('Doação')))
    STATUS_CHOICES = (('active', _('Ativa')), ('completed', _(
        'Concluída')), ('cancelled', _('Cancelada')))

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='coin_offers')
    specific_user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True,
                                      blank=True, on_delete=models.SET_NULL, related_name='directed_offers')
    coin_type = models.CharField(max_length=20, choices=COIN_TYPES)
    amount = models.IntegerField(validators=[MinValueValidator(1)])
    price_per_coin = models.FloatField(
        validators=[MinValueValidator(0)], default=0)
    offer_type = models.CharField(
        max_length=10, choices=OFFER_TYPES, default='sale')
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Oferta de {self.amount} {self.get_coin_type_display()} por {self.seller.username}"

    def calculate_total_price(self):
        """Calcula o preço total da oferta, arredondando para baixo."""
        if self.offer_type != 'sale':
            return 0
        return math.floor(self.amount * self.price_per_coin)


class CoinTransaction(models.Model):
    """
    Registra todas as transações de moedas entre usuários,
    seja por compra, venda ou doação.
    """
    TRANSACTION_TYPES = (
        ('purchase', _('Compra')),
        ('gift', _('Doação')),
        ('system', _('Sistema')),
    )

    COIN_TYPES = (
        ('recycling', _('Moedas de Reciclagem')),
        ('reputation', _('Moedas de Reputação')),
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_transactions',
        verbose_name=_('Remetente')
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_transactions',
        verbose_name=_('Destinatário')
    )
    offer = models.ForeignKey(
        CoinOffer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions',
        verbose_name=_('Oferta')
    )
    coin_type = models.CharField(
        max_length=20,
        choices=COIN_TYPES,
        verbose_name=_('Tipo de Moeda')
    )
    amount = models.IntegerField(
        validators=[MinValueValidator(1)],
        verbose_name=_('Quantidade')
    )
    transaction_type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPES,
        verbose_name=_('Tipo de Transação')
    )
    price_paid = models.IntegerField(
        default=0,
        verbose_name=_('Preço Pago')
    )
    transaction_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Data da Transação')
    )
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Observações')
    )

    class Meta:
        verbose_name = _('Transação de Moedas')
        verbose_name_plural = _('Transações de Moedas')
        ordering = ['-transaction_date']

    def __str__(self):
        if self.transaction_type == 'system':
            return f"Sistema → {self.receiver.username}: {self.amount} {self.get_coin_type_display()}"
        return f"{self.sender.username} → {self.receiver.username}: {self.amount} {self.get_coin_type_display()}"


class ExchangeRequest(models.Model):
    """
    Solicitações diretas de troca de moedas entre usuários
    sem passar pelo mercado geral.
    """
    STATUS_CHOICES = (
        ('pending', _('Pendente')),
        ('accepted', _('Aceita')),
        ('rejected', _('Rejeitada')),
        ('cancelled', _('Cancelada')),
    )

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='coin_exchange_requests',
        verbose_name=_('Solicitante')
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='coin_exchange_offers',
        verbose_name=_('Receptor')
    )

    # O que o solicitante oferece
    offer_recycling_coins = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_('Moedas de Reciclagem Oferecidas')
    )
    offer_reputation_coins = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_('Moedas de Reputação Oferecidas')
    )

    # O que o solicitante deseja em troca
    request_recycling_coins = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_('Moedas de Reciclagem Solicitadas')
    )
    request_reputation_coins = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_('Moedas de Reputação Solicitadas')
    )

    message = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Mensagem')
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name=_('Status')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Criado em')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Atualizado em')
    )

    class Meta:
        verbose_name = _('Solicitação de Troca')
        verbose_name_plural = _('Solicitações de Troca')
        ordering = ['-created_at']

    def __str__(self):
        return f"Solicitação de {self.requester.username} para {self.receiver.username}"

    def is_valid_request(self):
        """Verifica se a solicitação é válida (oferece ou solicita algo)"""
        offers_something = self.offer_recycling_coins > 0 or self.offer_reputation_coins > 0
        requests_something = self.request_recycling_coins > 0 or self.request_reputation_coins > 0
        return offers_something and requests_something
