from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Bottle, Model3D, ModelLike, ModelFavorite


class UserSerializer(serializers.ModelSerializer):
    """Serializa informações básicas do usuário"""
    handle = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = '__all__'

    def get_handle(self, obj):
        """Gera um identificador único do usuário"""
        return f"@{obj.username.lower()}"


class BottleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bottle
        fields = '__all__'


class Model3DSerializer(serializers.ModelSerializer):
    # Substitui o ID pelo objeto usuário completo
    user = UserSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Model3D
        fields = '__all__'

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ModelLike.objects.filter(user=request.user, model=obj).exists()
        return False  # Usuário anônimo vê False, mas ainda vê o total de likes

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ModelFavorite.objects.filter(user=request.user, model=obj).exists()
        return False  # Usuário anônimo vê False, mas ainda vê o total de saves
