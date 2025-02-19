from django.db import models
# Importa o modelo padrão de usuário do Django
from django.contrib.auth.models import User


class Bottle(models.Model):
    # Relaciona com o usuário padrão
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    # Ex: Tipo 1A: Marca 1, 2L ; Tipo 2C: Marca 2, 600ml
    type = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.quantity} garrafas"


class Model3D(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    file = models.FileField(upload_to='models3d/files/')
    image = models.ImageField(
        upload_to='models3d/images/', null=True, blank=True)  # Novo campo de imagem
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField()
    likes = models.IntegerField(default=0)
    downloads = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class ModelLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    model = models.ForeignKey(Model3D, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'model')


class ModelFavorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    model = models.ForeignKey(Model3D, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'model')
