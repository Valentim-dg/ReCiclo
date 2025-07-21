# controller/settings.py

"""
Configurações do Django para o projeto ReCiclo.

Este ficheiro contém todas as configurações da aplicação, desde a definição
dos apps instalados e middleware, até à configuração do banco de dados,
autenticação e da API REST.
"""

from pathlib import Path
from datetime import timedelta
import os

# --- Configurações Principais do Projeto ---

# Define o diretório base do projeto.
BASE_DIR = Path(__file__).resolve().parent.parent

# Chave secreta para a segurança criptográfica do Django.
# ATENÇÃO: Em produção, esta chave deve ser mantida em segredo e fora do controlo de versão.
SECRET_KEY = 'django-insecure-5vg6lc@7xc$9i*637#*pao09avg00oarl*(aot8xn!aq5@b9%@'

# Modo de depuração. Deve ser 'False' em produção.
DEBUG = True

# Hosts/domínios permitidos para a aplicação.
ALLOWED_HOSTS = []

# --- Definição das Aplicações ---

INSTALLED_APPS = [
    # Apps padrão do Django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Apps de terceiros
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'django.contrib.sites',

    # Apps locais
    'api.apps.ApiConfig',
]

# ID do site, necessário para o 'django.contrib.sites' e 'allauth'.
SITE_ID = 1

# --- Configuração do Middleware ---

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Lida com as políticas de CORS
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',  # Middleware do allauth
]

# --- Configuração de URLs ---

ROOT_URLCONF = 'controller.urls'

# --- Configuração de Templates ---

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'controller.wsgi.application'

# --- Banco de Dados ---

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# --- Autenticação e Autorização ---

# Define o modelo de utilizador personalizado como o padrão para o projeto.
AUTH_USER_MODEL = "api.CustomUser"

# Validadores de senha para garantir a segurança.
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Backends de autenticação, incluindo o do allauth para login social.
AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)

# --- Configuração da API (Django REST Framework e dj-rest-auth) ---

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
        'dj_rest_auth.jwt_auth.JWTCookieAuthentication',  # Autenticação JWT
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',  # Permite acesso público por defeito
    ),
}

# Configura o dj-rest-auth para usar JWT.
REST_USE_JWT = True

# Configura o serializer a ser usado para os detalhes do utilizador.
REST_AUTH = {
    'USER_DETAILS_SERIALIZER': 'api.serializers.UserSerializer',
}

# Configurações do allauth para o registo e login.
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_VERIFICATION = "none"  # Em produção, mudar para 'mandatory'

# --- Configuração de Ficheiros Estáticos e de Média ---

STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media/'

# --- Internacionalização ---

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

# --- Configuração de CORS ---

# Permite que todas as origens acedam à API (ideal para desenvolvimento).
# Em produção, deve ser restringido a domínios específicos.
CORS_ALLOW_ALL_ORIGINS = True

# Expõe o header 'Content-Disposition' para que o frontend possa ler o nome dos ficheiros em downloads.
CORS_EXPOSE_HEADERS = ['Content-Disposition']

# --- Outras Configurações ---

# Define o tipo de campo de chave primária padrão para os modelos.
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
