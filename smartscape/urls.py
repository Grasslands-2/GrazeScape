from django.urls import include, path
from django.contrib import admin
from . import views


from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('get_selection_raster', views.get_selection_raster, name='get_selection_raster'),
    path('get_selection_raster', views.get_selection_raster, name='get_selection_raster'),
    path('get_selection_criteria_raster', views.get_selection_criteria_raster, name='get_selection_criteria_raster'),
    path('get_transformed_land', views.get_transformed_land, name='get_transformed_land'),
    path('get_image', views.get_image, name='get_image'),

]