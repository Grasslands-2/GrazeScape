"""grassland URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.contrib.auth import views as auth_views
from .geocode import geocode
from django.views.generic.base import RedirectView
from django.contrib.staticfiles.storage import staticfiles_storage


urlpatterns = [
    #path('', views.index,name = 'index'),
    path('grazescape/', include('grazescape.urls')),
    path('', include('homepage.urls')),
    path('smartscape/', include('smartscape.urls')),
    #path('data_files/', include('data_files.urls')),
    path('', include('homepage.urls')),
    path('admin/', admin.site.urls),
    # handles the login and logout requests
    path('accounts/', include('homepage.urls')),
    path('homepage/', include('homepage.urls')),

    path('floodscape/', include('floodscape.urls')),

    path('geocode/', geocode),
    path('favicon.ico', RedirectView.as_view(url=staticfiles_storage.url('grazescape/public/app_images/Grasslands_icon.png'))),
    path('password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),

    # path('accounts/', include('django.contrib.auth.urls')),
    # path('accounts/register', )
]

