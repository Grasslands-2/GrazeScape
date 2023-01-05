"""
Helper SmartScape views
Author: Matthew Bayles
Created: July 2021
Python Version: 3.9.2
"""
import uuid
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from smartscape.raster_data_smartscape import RasterDataSmartScape
from smartscape.smart_scape import SmartScape
from grazescape.db_connect import *
import traceback
from django.http import FileResponse
from django.views.decorators.csrf import csrf_protect
import time
import requests
import json as js
import threading
import shutil
from osgeo import gdal
import math

def download_base_rasters_helper(request, geo_folder):
    request_json = js.loads(request.body)
    # geo_folder = request_json["folderId"]
    region = request_json['region']
    base_scen = request_json['baseTrans']
    geo_folder = os.path.join(settings.BASE_DIR, 'smartscape', 'data_files',
                                   'raster_inputs', geo_folder)
    base_layer_dic = {}
    # download layers for base case
    base_names = ("contCorn", "cornGrain", "dairyRotation", "hayGrassland", "pastureWatershed")
    model_names_base = ("Erosion", "PI", "CN")
    # contCorn
    # create name of the layer that corresponds to geoserver for base case
    for name in base_names:
        for model in model_names_base:
            if name == "hayGrassland" or name == "pastureWatershed":
                # medium_GrassYield_southWestWI.tif
                # pasture_CN_rt_rt_0_0_southWestWI.tif
                base_layer_dic[name + "_" + model] = "pasture_" + model + "_rt_rt_0_0_" + region
            else:
                file_name = name + "_" + \
                            model + "_" + \
                            base_scen["management"]["cover"] + "_" + \
                            base_scen["management"]["tillage"] + "_" + \
                            base_scen["management"]["contour"] + "_" + \
                            base_scen["management"]["fertilizer"] + "_" + \
                            region
                base_layer_dic[name + "_" + model] = "" + file_name
    # download corn and soy rasters for yield
    corn = "corn_Yield_" + region
    soy = "soy_Yield_" + region
    base_layer_dic["corn_yield"] = "" + corn
    base_layer_dic["soy_yield"] = "" + soy
    base_layer_dic["landuse"] = "" + region + "_WiscLand_30m"
    base_layer_dic["hyd_letter"] = "" + region + "_hydgrp_30m"
    base_layer_dic["hayGrassland_Yield"] = "pasture_Yield_medium_" + region
    base_layer_dic["pastureWatershed_Yield"] = "pasture_Yield_medium_" + region
    print(base_layer_dic)
    image = gdal.Open(os.path.join(geo_folder, "landuse_aoi-clipped.tif"))
    band = image.GetRasterBand(1)
    geoTransform = image.GetGeoTransform()
    minx = geoTransform[0]
    maxy = geoTransform[3]
    maxx = minx + geoTransform[1] * image.RasterXSize
    miny = maxy + geoTransform[5] * image.RasterYSize
    extents = [minx, miny, maxx, maxy]
    if extents is not None:
        extents_string_x = "&subset=X(" + str(math.floor(float(extents[0]))) + "," + str(
            math.ceil(float(extents[2]))) + ")"
        extents_string_y = "&subset=Y(" + str(math.floor(float(extents[1]))) + "," + str(
            math.ceil(float(extents[3]))) + ")"
    geo_server_url = settings.GEOSERVER_URL

    geoserver_url = geo_server_url + "/geoserver/ows?service=WCS&version=2.0.1&" \
                                     "srsName=EPSG:3071&request=GetCoverage&CoverageId="
    workspace = "SmartScapeRaster:"
    threads_list = []
    folder_base = os.path.join(geo_folder, "base")
    if not os.path.exists(folder_base):
        os.makedirs(folder_base)
    else:
        shutil.rmtree(folder_base)
        os.makedirs(folder_base)

    for layer in base_layer_dic:
        print("downloading layer ", base_layer_dic[layer])
        url = geoserver_url + workspace + base_layer_dic[layer] + extents_string_x + extents_string_y
        raster_file_path = os.path.join(geo_folder, "base", layer + ".tif")
        download_thread = threading.Thread(target=download, args=(url, raster_file_path))
        download_thread.start()
        # download_thread.join()
        # createNewDownloadThread(url, raster_file_path)
def download(link, filelocation):
    r = requests.get(link, stream=True)
    with open(filelocation, 'wb') as f:
        for chunk in r.iter_content(1024):
            if chunk:
                f.write(chunk)
