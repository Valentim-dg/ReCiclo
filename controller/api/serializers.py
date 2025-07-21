from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import (
    CustomUser, Bottle, Model3D, ModelLike, ModelFavorite,
    ModelFile, Comment, ModelImage, CoinOffer, CoinTransaction,
    ExchangeRequest, Achievement
)

# Obtém o modelo de utilizador ativo do projeto para garantir a flexibilidade.
User = get_user_model()

# --- Serializers de Utilizador ---


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer completo para os detalhes do utilizador, usado em endpoints
    como o de autenticação (/api/auth/user/) e perfis.
    """
    handle = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'handle', 'image',
            'recycling_coins', 'reputation_coins', 'level',
            'is_curator', 'profile_image'
        ]
        read_only_fields = ['id', 'recycling_coins',
                            'reputation_coins', 'level', 'is_curator']

    def get_handle(self, obj):
        """Gera um identificador único para o utilizador."""
        return f"@{obj.username.lower()}"

    def get_image(self, obj):
        """Retorna a URL completa da imagem de perfil ou None se não existir."""
        if hasattr(obj, 'profile_image') and obj.profile_image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.profile_image.url) if request else obj.profile_image.url
        return None


class UserSimpleSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para informações de utilizador, ideal para ser aninhado
    dentro de outros serializers, como o de modelos 3D.
    """
    handle = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'handle', 'image']

    def get_handle(self, obj):
        return f"@{obj.username.lower()}"

    def get_image(self, obj):
        if hasattr(obj, 'profile_image') and obj.profile_image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.profile_image.url) if request else obj.profile_image.url
        return None


class PublicUserSerializer(serializers.ModelSerializer):
    """
    Serializa os dados públicos de um utilizador para a sua página de perfil,
    incluindo uma lista dos seus modelos visíveis.
    """
    models = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'image', 'level', 'models']

    def get_image(self, obj):
        if hasattr(obj, 'profile_image') and obj.profile_image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.profile_image.url) if request else obj.profile_image.url
        return None

    def get_models(self, obj):
        """Busca e serializa apenas os modelos visíveis publicamente do utilizador."""
        visible_models = Model3D.objects.filter(
            user=obj, is_visible=True).order_by('-date')
        request = self.context.get('request')
        return Model3DSerializer(visible_models, many=True, context={'request': request}).data


# --- Serializer de Reciclagem ---

class BottleSerializer(serializers.ModelSerializer):
    """Serializa os dados de um registo de reciclagem de garrafas."""
    class Meta:
        model = Bottle
        fields = '__all__'


# --- Serializers de Conteúdo (Modelos 3D) ---

class ModelImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelImage
        fields = ['id', 'image', 'model3d']


class ModelFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelFile
        fields = ['id', 'file', 'file_name', 'model']


class Model3DSerializer(serializers.ModelSerializer):
    """
    Serializer principal para os modelos 3D. Inclui dados aninhados do autor,
    ficheiros, imagens e o estado de 'like'/'save' para o utilizador atual.
    """
    user = UserSimpleSerializer(read_only=True)
    images = ModelImageSerializer(many=True, read_only=True)
    files = ModelFileSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Model3D
        fields = [
            'id', 'name', 'description', 'user', 'date', 'likes',
            'downloads', 'images', 'files', 'is_liked', 'is_saved',
            'price', 'is_free', 'is_visible'
        ]

    def get_is_liked(self, obj):
        """Verifica se o utilizador logado curtiu este modelo."""
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return ModelLike.objects.filter(user=request.user, model=obj).exists()

    def get_is_saved(self, obj):
        """Verifica se o utilizador logado salvou este modelo."""
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return ModelFavorite.objects.filter(user=request.user, model=obj).exists()


class CommentSerializer(serializers.ModelSerializer):
    """Serializa os comentários de um modelo, exibindo o nome do autor."""
    user = serializers.StringRelatedField()

    class Meta:
        model = Comment
        fields = ["id", "user", "text", "image", "date"]


# --- Serializers do Marketplace ---

class UserMinimalSerializer(serializers.ModelSerializer):
    """
    Serializer super simplificado para utilizadores, usado em contextos
    onde apenas a informação essencial é necessária (ex: listas de ofertas).
    """
    image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'image']

    def get_image(self, obj):
        if hasattr(obj, 'profile_image') and obj.profile_image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.profile_image.url) if request else obj.profile_image.url
        return None


class CoinOfferSerializer(serializers.ModelSerializer):
    """Serializer para as ofertas de moedas no marketplace."""
    seller = UserMinimalSerializer(read_only=True)
    specific_user = UserMinimalSerializer(read_only=True)

    specific_user_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True)
    price_per_coin = serializers.FloatField(required=False, allow_null=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CoinOffer
        fields = [
            'id', 'seller', 'specific_user', 'specific_user_id',
            'coin_type', 'amount', 'price_per_coin', 'offer_type',
            'status', 'created_at', 'updated_at', 'total_price'
        ]
        read_only_fields = ['id', 'seller', 'specific_user',
                            'status', 'created_at', 'updated_at']

    def get_total_price(self, obj):
        return obj.calculate_total_price()

    def validate(self, data):
        """Valida os dados da oferta antes da criação."""
        offer_type = data.get('offer_type')

        if offer_type == 'sale':
            price = data.get('price_per_coin')
            if price is None or price <= 0:
                raise serializers.ValidationError({
                    'price_per_coin': 'O preço por moeda é obrigatório e deve ser maior que zero para uma venda.'
                })
        else:  # gift
            data['price_per_coin'] = 0

        return data


class CoinTransactionSerializer(serializers.ModelSerializer):
    """Serializer para o histórico de transações de moedas."""
    sender = UserMinimalSerializer(read_only=True)
    receiver = UserMinimalSerializer(read_only=True)

    class Meta:
        model = CoinTransaction
        fields = '__all__'


class ExchangeRequestSerializer(serializers.ModelSerializer):
    """Serializer para as solicitações de troca direta entre utilizadores."""
    requester = UserMinimalSerializer(read_only=True)
    receiver = UserMinimalSerializer(read_only=True)
    receiver_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='receiver', write_only=True
    )

    class Meta:
        model = ExchangeRequest
        fields = [
            'id', 'requester', 'receiver', 'receiver_id', 'status',
            'offer_recycling_coins', 'offer_reputation_coins',
            'request_recycling_coins', 'request_reputation_coins',
            'message', 'created_at',
        ]
        read_only_fields = ['id', 'requester',
                            'receiver', 'status', 'created_at']

    def validate(self, data):
        user = self.context['request'].user
        if data.get('receiver') == user:
            raise serializers.ValidationError(
                "Você não pode fazer uma troca consigo mesmo.")
        return data

    def create(self, validated_data):
        """Cria a solicitação e reserva as moedas do solicitante."""
        requester = self.context.get('request').user
        receiver = validated_data.pop('receiver')
        with transaction.atomic():
            requester_for_update = User.objects.select_for_update().get(pk=requester.pk)
            offer_recycling = validated_data.get('offer_recycling_coins', 0)
            offer_reputation = validated_data.get('offer_reputation_coins', 0)

            if offer_recycling > requester_for_update.recycling_coins or \
               offer_reputation > requester_for_update.reputation_coins:
                raise serializers.ValidationError(
                    "Saldo insuficiente para fazer a oferta.")

            requester_for_update.recycling_coins -= offer_recycling
            requester_for_update.reputation_coins -= offer_reputation
            requester_for_update.save()

            exchange_request = ExchangeRequest.objects.create(
                requester=requester_for_update,
                receiver=receiver,
                status='pending',
                **validated_data
            )
        return exchange_request


# --- Serializers de Gamificação ---

class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class AchievementSerializer(serializers.ModelSerializer):
    """Serializa os dados de uma conquista, incluindo o progresso do utilizador."""
    unlocked = serializers.BooleanField(read_only=True)
    progress = serializers.DictField(read_only=True, required=False)

    class Meta:
        model = Achievement
        fields = ['id', 'title', 'description',
                  'icon_name', 'unlocked', 'progress']
