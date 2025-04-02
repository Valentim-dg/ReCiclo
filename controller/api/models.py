from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class CustomUser(AbstractUser):
    recycling_coins = models.IntegerField(default=0)
    reputation_coins = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    experience = models.IntegerField(default=0)
    achievements = models.JSONField(default=list, blank=True)
    recycling_history = models.JSONField(default=list, blank=True)
    profile_image = models.ImageField(
        upload_to="profile_images/", null=True, blank=True)

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
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    quantity = models.IntegerField()
    type = models.CharField(max_length=100)
    # Ex: "500ml", "1L", "2L"
    volume = models.CharField(max_length=10, default=0)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.quantity} garrafas de {self.volume}"


class RecyclingHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    month = models.CharField(max_length=7)  # Exemplo: "2025-03"
    # Número total de garrafas recicladas no mês
    quantity = models.IntegerField(default=0)

    class Meta:
        # Para evitar múltiplos registros do mesmo mês
        unique_together = ("user", "month")

    def __str__(self):
        return f"{self.user.username} - {self.month}: {self.quantity} garrafas recicladas"


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
    # 🔹 Adicionado related_name="images"
    model3d = models.ForeignKey(
        Model3D, related_name="images", on_delete=models.CASCADE)
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
