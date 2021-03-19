from django.urls import include, path
from django.contrib import admin
from . import views


from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('get_model_results', views.get_model_results, name='get_model_results'),
    path('get_image', views.get_image, name='get_image'),
    path('load_data', views.load_data, name='load_data'),
]