# api/permissions.py

from rest_framework import permissions


class IsCurator(permissions.BasePermission):
    """
    Permissão personalizada que permite acesso apenas a utilizadores
    que estão autenticados e têm o atributo 'is_curator' definido como True.
    """

    def has_permission(self, request, view):
        """
        Verifica se o utilizador da requisição tem permissões de curador.
        """
        return (
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'is_curator', False)
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permissão personalizada para permitir que apenas os donos de um objeto o editem.
    Outros utilizadores (incluindo anónimos) têm permissão de apenas leitura.
    """

    def has_object_permission(self, request, view, obj):
        """
        Verifica se o utilizador da requisição é o dono do objeto.
        Esta permissão é flexível e consegue encontrar o dono em modelos relacionados.
        """
        # Permissões de leitura (GET, HEAD, OPTIONS) são permitidas para qualquer pedido.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Para permissões de escrita, o utilizador deve estar autenticado.
        if not request.user or not request.user.is_authenticated:
            return False

        # Tenta encontrar o dono do objeto através de diferentes atributos comuns.
        owner = None
        if hasattr(obj, 'user'):
            # Caso 1: O objeto tem um campo 'user' direto (ex: Model3D).
            owner = obj.user
        elif hasattr(obj, 'seller'):
            # Caso 2: O objeto tem um campo 'seller' (ex: CoinOffer).
            owner = obj.seller
        elif hasattr(obj, 'requester'):
            # Caso 3: O objeto tem um campo 'requester' (ex: ExchangeRequest).
            owner = obj.requester
        elif hasattr(obj, 'model') and hasattr(obj.model, 'user'):
            # Caso 4: O objeto tem uma relação 'model' com o dono (ex: ModelFile).
            owner = obj.model.user
        elif hasattr(obj, 'model3d') and hasattr(obj.model3d, 'user'):
            # Caso 5: O objeto tem uma relação 'model3d' com o dono (ex: ModelImage).
            owner = obj.model3d.user

        # A permissão é concedida se o dono do objeto for o mesmo utilizador que fez a requisição.
        return owner == request.user
