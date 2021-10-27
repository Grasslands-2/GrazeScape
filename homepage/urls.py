"""grassland URL Configuration
"""
from django.contrib import admin
from django.urls import include, path
from django.contrib.auth import views as auth_views
from . import views


urlpatterns = [


    path('', views.home),
]

