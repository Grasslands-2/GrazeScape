"""
Helper floodscape views
Author: Matthew Bayles
Created: July 2021
Python Version: 3.9.2
"""
import uuid
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from floodscape.raster_data_smartscape import RasterDataSmartScape
from floodscape.smart_scape import SmartScape
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
import numpy as np


def download_base_rasters_helper(request, geo_folder):
    manure_options = get_phos_fert_options(request, True)
    request_json = js.loads(request.body)
    # geo_folder = request_json["folderId"]
    region = request_json['region']
    base_scen = request_json['baseTrans']
    geo_folder = os.path.join(settings.BASE_DIR, 'floodscape', 'data_files',
                              'raster_inputs', geo_folder)
    base_layer_dic = {}
    # download layers for base case
    base_names = ("contCorn", "cornGrain", "dairyRotation", "hayGrassland", "pastureWatershed")
    model_names_base = ["CN"]
    # contCorn
    # create name of the layer that corresponds to geoserver for base case
    phos_fertilizer = base_scen["management"]["phos_fertilizer"]
    region_extents = base_scen["selection"]["extent"]
    # if not value chosen set it to the first item in the list (usually zero)
    if phos_fertilizer == "default":
        phos_fertilizer = manure_options["base"]["p_choices"][0]
    manure_fert_p = str(manure_options["base"]["p_manure_cat"]) + "_" + str(phos_fertilizer)
    for name in base_names:
        for model in model_names_base:
            if name == "hayGrassland" or name == "pastureWatershed":
                # medium_GrassYield_southWestWI.tif
                # pasture_CN_rt_rt_0_0_southWestWI.tif
                base_layer_dic[name + "_" + model] = "pasture_" + model + "_cn_lo_0_0_" + region
                base_layer_dic[name + "_" + model + "_whole_region"] = "pasture_" + model + "_rt_rt_0_0_" + region
            else:
                file_name = name + "_" + \
                            model + "_" + \
                            base_scen["management"]["cover"] + "_" + \
                            base_scen["management"]["tillage"] + "_" + \
                            base_scen["management"]["contour"] + "_" + \
                            manure_fert_p + "_" + \
                            region
                base_layer_dic[name + "_" + model] = "" + file_name
                base_layer_dic[name + "_" + model + "_whole_region"] = "" + file_name
    # download corn and soy rasters for yield
    # corn = "corn_Yield_" + region
    # soy = "soy_Yield_" + region
    # base_layer_dic["corn_yield"] = "" + corn
    # base_layer_dic["soy_yield"] = "" + soy
    base_layer_dic["landuse"] = "" + region + "_WiscLand_30m"
    base_layer_dic["landuse" + "_whole_region"] = "" + region + "_WiscLand_30m"
    base_layer_dic["hyd_letter"] = "" + region + "_hydgrp_30m"
    # base_layer_dic["hayGrassland_Yield"] = "pasture_Yield_medium_" + region
    # base_layer_dic["pastureWatershed_Yield"] = "pasture_Yield_medium_" + region
    print(base_layer_dic)
    # whole_watershed = True
    # if whole_watershed:
    #     watershed_folder = os.path.join(settings.BASE_DIR,'static','public',"library","floodscape","gis","CC_GIS")
    #     image = gdal.Open(os.path.join(watershed_folder, "CC_fixed.geojson"))
    # else:
    image = gdal.Open(os.path.join(geo_folder, "landuse_aoi-clipped.tif"))

    band = image.GetRasterBand(1)
    geoTransform = image.GetGeoTransform()
    minx = geoTransform[0]
    maxy = geoTransform[3]
    maxx = minx + geoTransform[1] * image.RasterXSize
    miny = maxy + geoTransform[5] * image.RasterYSize
    extents = [minx, miny, maxx, maxy]
    print("geotransform ", geoTransform)
    print("extents ", extents)
    print("region_extents ", region_extents)
    if extents is not None:
        extents_string_x = "&subset=X(" + str(math.floor(float(extents[0]))) + "," + str(
            math.ceil(float(extents[2]))) + ")"
        extents_string_y = "&subset=Y(" + str(math.floor(float(extents[1]))) + "," + str(
            math.ceil(float(extents[3]))) + ")"
    # getting region level curve numbers
    if region_extents is not None:
        region_extents_string_x = "&subset=X(" + str(math.floor(float(region_extents[0]))) + "," + str(
            math.ceil(float(region_extents[2]))) + ")"
        region_extents_string_y = "&subset=Y(" + str(math.floor(float(region_extents[1]))) + "," + str(
            math.ceil(float(region_extents[3]))) + ")"


    geo_server_url = settings.GEOSERVER_URL

    geoserver_url = geo_server_url + "/geoserver/ows?service=WCS&version=2.0.1&" \
                                     "srsName=EPSG:3071&request=GetCoverage&CoverageId="
    workspace = "SmartScapeRaster_" + region + ":"
    threads_list = []
    folder_base = os.path.join(geo_folder, "base")
    if not os.path.exists(folder_base):
        os.makedirs(folder_base)
    else:
        shutil.rmtree(folder_base)
        os.makedirs(folder_base)

    for layer in base_layer_dic:
        print("downloading layer ", layer, base_layer_dic[layer])
        if "_whole_region" in layer:

            url = geoserver_url + workspace + base_layer_dic[layer] + region_extents_string_x + region_extents_string_y
        else:
            url = geoserver_url + workspace + base_layer_dic[layer] + extents_string_x + extents_string_y
        print(url)
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


def get_phos_fert_options(request, base_calc):
    """
    Calculate p manure and avialable p fert options for each transformation and base case
    Parameters
    ----------
    base_calc : boolean
        True if p calcs are for the base scenario
    request : request object
        The request object from the client
    Returns
    -------
        return_data : dict
            dictionary containing the trans/base id and the p values
    """
    # based on the available rasters for smartscape
    phos_choices = {"0": [0, 50, 100], "100": [0], "150": [0], "200": [0], "25": [50], "50": [50]}

    request_json = js.loads(request.body)
    # print("get phos fert options request", request_json)
    # folder id of our aoi input data
    folder_id = request_json["folderId"]
    # transformation data

    base = request_json['baseTrans']

    # trans_id = request_json["transId"]
    # file path of our input data
    geo_folder = os.path.join(settings.BASE_DIR, 'floodscape', 'data_files', 'raster_inputs', folder_id)
    data_dir = os.path.join(settings.BASE_DIR, 'floodscape', 'data_files', 'raster_inputs')
    return_data = {}

    # make sure files are loaded
    def check_file_path(geo_folder_func):
        print("checking files!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print(geo_folder_func)
        if not os.path.exists(geo_folder_func):
            return False
        dir_list = os.listdir(geo_folder_func)
        print(dir_list)
        if "om.tif" in dir_list and "drainClass.tif" in dir_list and "nResponse.tif" in dir_list:
            return True
        else:
            return False

    files_loaded = check_file_path(geo_folder)
    while not files_loaded:
        time.sleep(.5)
        files_loaded = check_file_path(geo_folder)
        print("file not loaded")

    model = SmartScape(request_json, folder_id, folder_id)
    model.geo_folder = geo_folder
    model.load_nrec()
    arr_holder = []
    if not base_calc:
        trans = request_json['trans']
        for tran1 in trans:
            tran = trans[tran1]
            layer_rank = tran1
            print("layer rank", layer_rank, tran["id"])
            print(os.path.join(data_dir, tran["id"], "selection_output.tif"))
            image = gdal.Open(os.path.join(data_dir, tran["id"], "selection_output.tif"))
            band = image.GetRasterBand(1)
            arr = band.ReadAsArray()
            arr = np.where(arr == -99, float(layer_rank), arr)
            arr_holder.append(arr)

            cell_count_trans = np.count_nonzero(arr == float(layer_rank))
            print(np.unique(arr, return_counts=True))
            print("cell count for transition ", cell_count_trans)
            n_parameters = model.get_nitrate_params(tran, arr, layer_rank)
            print("n_parameters", n_parameters)
            manure_p_bounds, manure_value = model.calc_p(tran, n_parameters["nirate_inputs"])
            manure_p = str(manure_p_bounds)
            print("p manure!!")
            print(manure_p)
            print(manure_value)
            return_data[tran["id"]] = {"p_manure": "{:,.0f}".format(manure_value), "p_choices": phos_choices[manure_p]}
    if base_calc:
        file_path = os.path.join(geo_folder, "landuse_aoi-clipped.tif")
        image = gdal.Open(file_path)
        band = image.GetRasterBand(1)
        arr = band.ReadAsArray()
        output = np.copy(arr)
        cell_corn = np.count_nonzero(arr == 4)
        cell_corn_grain = np.count_nonzero(arr == 3)
        cell_dairy = np.count_nonzero(arr == 5)
        total_cells = cell_corn + cell_corn_grain + cell_dairy
        total_total_cell = np.count_nonzero(arr > -9999)
        print("crop cells", total_cells)
        print("total cells", np.count_nonzero(arr > -9999))
        # n_parameters = model.get_nitrate_params_base(base, arr, total_cells)
        # print(n_parameters)
        # looks at whole raster so use all valid cells here but final value only uses crop land cells
        n_parameters = model.get_nitrate_params_base(base, arr, total_total_cell)
        print(n_parameters)

        def calc_p_local(tran, nrec_trans, name):
            nrec = nrec_trans[name]["ManureN"]
            pneeds = nrec_trans[name]["Pneeds"]
            manure_n = float(nrec) * float(tran["management"]["nitrogen"]) / 100
            applied_manure_n = (manure_n / 0.4) / 3
            manure_percent = (applied_manure_n / float(pneeds)) * 100
            return manure_percent

        p_manure_corn = calc_p_local(base, n_parameters, "nrec_trans_cont_values")
        p_manure_cash_grain = 0.5 * calc_p_local(base, n_parameters, "nrec_trans_corn_values") + \
                              0.5 * calc_p_local(base, n_parameters, "nrec_trans_soy_values")
        p_manure_dairy = 1 / 5 * calc_p_local(base, n_parameters, "nrec_trans_corn_dairy_values") + \
                         2 / 5 * calc_p_local(base, n_parameters, "nrec_trans_alfalfa_values") + \
                         1 / 5 * calc_p_local(base, n_parameters, "nrec_trans_alfalfa_seed_values") + \
                         1 / 5 * calc_p_local(base, n_parameters, "nrec_trans_silage_values")
        # only calc p_manure for the three main crop systems
        watershed_total = {3: {"p_manure": p_manure_cash_grain},
                           4: {"p_manure": p_manure_corn},
                           5: {"p_manure": p_manure_dairy},
                           1: {"p_manure": 0},
                           2: {"p_manure": 0},
                           6: {"p_manure": 0},
                           7: {"p_manure": 0},
                           8: {"p_manure": 0},
                           9: {"p_manure": 0},
                           10: {"p_manure": 0},
                           11: {"p_manure": 0},
                           12: {"p_manure": 0},
                           13: {"p_manure": 0},
                           14: {"p_manure": 0},
                           15: {"p_manure": 0}
                           }
        for land_type in watershed_total:
            # print(land_type)
            output = np.where(arr == land_type, watershed_total[land_type]["p_manure"], output)
        p_manure_arr = np.where(output == model.no_data, 0, output)
        p_manure = np.sum(p_manure_arr) / total_cells
        print("p manure for base", p_manure)
        # holds the combined layer of each transformation so we can properly model the base
        # main_arr = arr_holder[0]
        # for arr in arr_holder:
        #     main_arr = np.where(arr > 0, arr, main_arr)
        #     # main_arr = arr
        # # testing output
        #
        # image = gdal.Open(os.path.join(geo_folder, "om_aoi-clipped.tif"))
        # [rows, cols] = p_manure_arr.shape
        # driver = gdal.GetDriverByName("GTiff")
        # file_path = os.path.join(geo_folder, "aaaAaaaap_output_base111.tif")
        # print("file path of test ffile", file_path)
        # outdata = driver.Create(file_path, cols, rows, 1,
        #                         gdal.GDT_Float32)
        # outdata.SetGeoTransform(image.GetGeoTransform())  ##sets same geotransform as input
        # outdata.SetProjection(image.GetProjection())  ##sets same projection as input
        # outdata.GetRasterBand(1).WriteArray(p_manure_arr)
        # outdata.GetRasterBand(1).SetNoDataValue(-9999)
        # # write to disk
        # outdata.FlushCache()
        # outdata = None
        # band = None
        # ds = None

        p_manure_levels = model.calc_manure_level(p_manure)
        # phos_choices = {"55": [66, 88888, 56777]}
        return_data["base"] = {"p_manure": "{:,.2f}".format(p_manure),
                               "p_choices": phos_choices[str(p_manure_levels)],
                               "p_manure_cat": p_manure_levels}
    print(return_data)
    return return_data
