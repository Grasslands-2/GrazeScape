from django.urls import include, path
from django.contrib import admin
from . import views
from django.views.generic.base import RedirectView
from django.contrib.staticfiles.storage import staticfiles_storage

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('', views.uploadindex, name='uploadindex'),
    path('get_model_results', views.get_model_results, name='get_model_results'),
    path('get_field_rot_defaults', views.get_field_rot_defaults, name='get_field_rot_defaults'),
    path('get_image', views.get_image, name='get_image'),
    path('get_results_image', views.get_results_image, name='get_results_image'),
    path('get_results_image', views.get_results_image, name='get_results_image'),
    path('clean_data', views.clean_data, name='clean_data'),
    path('download_rasters', views.download_rasters, name='download_rasters'),
    path('run_InfraTrueLength',views.run_InfraTrueLength, name='run_InfraTrueLength'),
    #path('manage_raster_visuals',views.manage_raster_visuals, name='manage_raster_visuals'),
    path('heiferFeedBreakDown',views.heiferFeedBreakDown, name='heiferFeedBreakDown'),
    # path('adjust_field_yields',views.adjust_field_yields, name='adjust_field_yields'),
    path('geoserver_request', views.geoserver_request, name='geoserver_request'),
    path('get_default_om', views.get_default_om, name='get_default_om'),
    path('outside_geojson_coord_pull', views.outside_geojson_coord_pull, name='outside_geojson_coord_pull'),
    path('outside_shpfile_coord_pull', views.outside_shpfile_coord_pull, name='outside_shpfile_coord_pull'),
    path('field_png_lookup', views.field_png_lookup, name='field_png_lookup'),
    path('upload/', views.upload_file, name='upload_file'),
    path('upload_file_test', views.upload_file_test, name='upload_file_test'),
    #path('run_econ_model', views.run_econ_model, name='run_econ_model'),
    # path('chart_data', views.chart, name='chart'),
    # path('point_elevations', views.point_elevation    s, name='point_elevations'),
]