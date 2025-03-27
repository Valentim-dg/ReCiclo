from rest_framework import serializers
from django.contrib.auth.models import User
from .models import CustomUser, Bottle, Model3D, ModelLike, ModelFavorite, ModelFile, Comment, ModelImage
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializa informações do usuário incluindo moedas, nível e conquistas"""

    handle = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'handle', 'recycling_coins',
                  'reputation_coins', 'level', 'achievements', 'recycling_history', 'image']

    def get_handle(self, obj):
        """Gera um identificador único do usuário"""
        return f"@{obj.username.lower()}"

    def get_image(self, obj):
        """Retorna a URL da imagem do usuário (se existir)"""
        if obj.profile_image:  # 🔹 Se o usuário tiver uma imagem de perfil
            return obj.profile_image.url
        return "/default-avatar.png"


class BottleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bottle
        fields = '__all__'


class ModelFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelFile
        fields = ('file', 'file_name')


class ModelImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelImage
        fields = ('image',)


class Model3DSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    file = serializers.FileField(write_only=True)
    images = ModelImageSerializer(many=True, read_only=True)
    # Adiciona para permitir upload
    image = serializers.ImageField(write_only=True, required=False)

    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    likes = serializers.IntegerField(read_only=True)
    downloads = serializers.IntegerField(read_only=True)

    class Meta:
        model = Model3D
        fields = ["id", "user", "name", "description", "likes",
                  "downloads", "file", "image", "images", "is_liked", "is_saved"]

    def create(self, validated_data):
        print("Criando novo modelo 3D:", validated_data["name"])  # Depuração

        file = validated_data.pop('file')
        image = validated_data.pop('image', None)

        model_3d = Model3D.objects.create(**validated_data)

        ModelFile.objects.create(
            model=model_3d, file=file, file_name=file.name)

        if image:
            ModelImage.objects.create(model3d=model_3d, image=image)

        return model_3d

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return ModelLike.objects.filter(user=request.user, model=obj).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return ModelFavorite.objects.filter(user=request.user, model=obj).exists()
        return False


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = Comment
        fields = ["id", "user", "text", "image", "date"]
