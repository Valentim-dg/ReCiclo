from rest_framework import viewsets
from .models import Bottle, Model3D, ModelLike, ModelFavorite
from .serializers import BottleSerializer, Model3DSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import FileResponse


class BottleViewSet(viewsets.ModelViewSet):
    queryset = Bottle.objects.all()
    serializer_class = BottleSerializer


class Model3DViewSet(viewsets.ModelViewSet):
    queryset = Model3D.objects.all()
    serializer_class = Model3DSerializer

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        model = get_object_or_404(Model3D, pk=pk)
        user = request.user

        # Verifica se o usuário já curtiu o modelo
        like, created = ModelLike.objects.get_or_create(user=user, model=model)

        if not created:
            # Se já existe um like, remove o like
            like.delete()
            model.likes -= 1
            model.save()
            return Response({'likes': model.likes, 'message': 'Like removido'})
        else:
            # Se não existe, adiciona o like
            model.likes += 1
            model.save()
            return Response({'likes': model.likes, 'message': 'Like adicionado'})

    @action(detail=True, methods=['post'])
    def save(self, request, pk=None):
        model = get_object_or_404(Model3D, pk=pk)
        user = request.user

        # Verifica se o usuário já favoritou o modelo
        favorite, created = ModelFavorite.objects.get_or_create(
            user=user, model=model)

        if not created:
            favorite.delete()
            return Response({'saved': False, 'message': 'Removido dos favoritos'})
        else:
            return Response({'saved': True, 'message': 'Adicionado aos favoritos'})

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        model = get_object_or_404(Model3D, pk=pk)
        model.downloads += 1
        model.save()

        response = FileResponse(model.file.open(), as_attachment=True)
        return response
