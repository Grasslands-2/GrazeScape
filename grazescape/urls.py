from django.urls import include, path
from django.contrib import admin
from . import views


from . import views

urlpatterns = [
    path('', views.index, name='index'),
    # path('get_model_results', views.get_model_results, name='get_model_results'),
    path('get_model_results', views.get_model_results, name='get_model_results'),
    path('get_image', views.get_image, name='get_image'),
    path('clean_data', views.clean_data, name='clean_data'),
    path('download_rasters', views.download_rasters, name='download_rasters'),
    path('run_InfraTrueLength',views.run_InfraTrueLength, name='run_InfraTrueLength')
    # path('chart_data', views.chart, name='chart'),
    # path('point_elevations', views.point_elevations, name='point_elevations'),
]