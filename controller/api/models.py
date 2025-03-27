from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class CustomUser(AbstractUser):
    recycling_coins = models.IntegerField(default=0)
    reputation_coins = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    achievements = models.JSONField(default=list, blank=True)
    recycling_history = models.JSONField(default=list, blank=True)
    profile_image = models.ImageField(upload_to="profile_images/", null=True, blank=True)


    groups = models.ManyToManyField(
        "auth.Group",
        related_name="customuser_groups",
        blank=True
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="customuser_permissions",
        blank=True
    )

    def __str__(self):
        return self.username


class Bottle(models.Model):
    # Relaciona com o usuário padrão
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    quantity = models.IntegerField()
    # Ex: Tipo 1A: Marca 1, 2L ; Tipo 2C: Marca 2, 600ml
    type = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.quantity} garrafas"


class Model3D(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField()
    likes = models.IntegerField(default=0)
    downloads = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class ModelFile(models.Model):
    model = models.ForeignKey(
        Model3D, on_delete=models.CASCADE, related_name="files")
    file = models.FileField(upload_to="models3d/files/")
    file_name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.model.name} - {self.file_name}"


class ModelImage(models.Model):
    model3d = models.ForeignKey(Model3D, related_name="images", on_delete=models.CASCADE)  # 🔹 Adicionado related_name="images"
    image = models.ImageField(upload_to="models3d/images/")

    def __str__(self):
        return f"Imagem para {self.model3d.name}"



class ModelLike(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    model = models.ForeignKey(Model3D, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'model')


class ModelFavorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    model = models.ForeignKey(Model3D, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'model')


class Comment(models.Model):
    model = models.ForeignKey(
        Model3D, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    text = models.TextField()
    image = models.ImageField(
        upload_to="comments/images/", null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentário de {self.user.username} - {self.text[:30]}"
