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
import numpy as np

BASE_FOLDER_COUNT = 30


def download_base_rasters_helper(request, geo_folder):
    print("starting to download base rasters")
    request_json = js.loads(request.body)
    # geo_folder = request_json["folderId"]
    region = request_json['region']
    manure_options = get_phos_fert_options(request, True, region)
    print("manure options", manure_options)
    base_scen = request_json['baseTrans']
    geo_folder = os.path.join(settings.BASE_DIR, 'smartscape', 'data_files',
                              'raster_inputs', geo_folder)
    base_layer_dic = {}
    # download layers for base case
    base_names = ("contCorn", "cornGrain", "dairyRotation", "hayGrassland", "pastureWatershed")
    model_names_base = ("Erosion", "PI", "CN", "SCI")
    # contCorn
    # create name of the layer that corresponds to geoserver for base case
    # Todo fix this
    phos_fertilizer = base_scen["managementCont"]["phos_fertilizer"]

    def calc_manure_level(manure):
        """
        Calculates the closest P manure value from Raster
        Parameters
        ----------
        manure float
            The value of the P manure

        Returns
        ------- float
            Closest categorical value to give manure

        """
        # phos_choices = {
        # "0": [0, 50, 100],
        # "25": [50],
        # "50": [50],
        # "100": [0],
        # "150": [0],
        # "200": [0]
        # }

        if manure < 12.5:
            return 0
        elif 12.5 <= manure < 37.5:
            return 25
        elif 37.5 <= manure < 75:
            return 50
        elif 75 <= manure < 125:
            return 100
        elif 125 <= manure <= 175:
            return 150
        elif 125 <= manure:
            return 200

    def get_m_p_options(manure_val, phos_val, man_actual):
        print("manure_val, phos_val, man_actual", manure_val, phos_val, man_actual)
        m1, m2, p1, p2 = 0, 0, 0, 0
        phos_val = float(phos_val)
        if manure_val == 0:
            if phos_val == 0:
                m1, m2, p1, p2 = 0, 0, 0, 50
            elif phos_val == 50:
                m1, m2, p1, p2 = 0, 0, 50, 100
            # need to extrapolate
            elif phos_val == 100:
                m1, m2, p1, p2 = 0, 0, 100, 50
            else:
                raise ValueError("P phos is wrong value")
        elif manure_val == 25:
            if phos_val == 50:
                m1, m2, p1, p2 = 25, 50, 50, 50
            else:
                raise ValueError("P phos is wrong value")
        elif manure_val == 50:
            if phos_val == 50:
                m1, m2, p1, p2 = 50, 25, 50, 50
            else:
                raise ValueError("P phos is wrong value")
        elif manure_val == 100:
            if phos_val == 0:
                m1, m2, p1, p2 = 100, 150, 0, 0
            else:
                raise ValueError("P phos is wrong value")
        elif manure_val == 150:
            if man_actual < manure_val:
                if phos_val == 0:
                    m1, m2, p1, p2 = 150, 100, 0, 0
                else:
                    raise ValueError("P phos is wrong value")
            else:
                if phos_val == 0:
                    m1, m2, p1, p2 = 150, 200, 0, 0
                else:
                    raise ValueError("P phos is wrong value")
        elif manure_val == 200:
            if phos_val == 0:
                m1, m2, p1, p2 = 200, 150, 0, 0
            else:
                raise ValueError("P phos is wrong value")
        else:
            raise ValueError("P manure is not one of the available options")
        return m1, m2, p1, p2

    # p manure is the same for all base
    manure = float(manure_options["base"]["cont"]["p_manure"])
    manure_rounded = calc_manure_level(manure)

    man1, man2, phos1, phos2 = get_m_p_options(manure_rounded, phos_fertilizer, manure)
    print("manure values for raster baseline")
    manure_p = str(man1) + "_" + str(phos1)
    manure_p2 = str(man2) + "_" + str(phos2)
    # setting our x interpolatation value
    if man1 == man2:
        man1 = phos1
        man2 = phos2
    print(manure_p)
    print(manure_p2)

    for name in base_names:
        for model in model_names_base:
            if name == "hayGrassland":
                # medium_GrassYield_southWestWI.tif
                # pasture_CN_rt_rt_0_0_southWestWI.tif
                base_layer_dic[name + "_" + model] = "pasture_" + model + "_cn_lo_0_0_" + region
            elif name == "pastureWatershed":
                base_layer_dic[name + "_" + model] = "pasture_" + model + "_" + \
                                                     base_scen["managementPast"]["density"] + "_" + \
                                                     manure_p + "_" + \
                                                     region
                if model == "PI":
                    base_layer_dic[name + "_" + "PI2"] = "pasture_" + model + "_" + \
                                                         base_scen["managementPast"]["density"] + "_" + \
                                                         manure_p2 + "_" + \
                                                         region
            else:
                management_type = None
                if name == "contCorn":
                    management_type = "managementCont"
                elif name == "cornGrain":
                    management_type = "managementCorn"
                elif name == "dairyRotation":
                    management_type = "managementDairy"

                file_name = name + "_" + \
                            model + "_" + \
                            base_scen[management_type]["cover"] + "_" + \
                            base_scen[management_type]["tillage"] + "_" + \
                            base_scen[management_type]["contour"] + "_" + \
                            manure_p + "_" + \
                            region
                base_layer_dic[name + "_" + model] = "" + file_name
                if model == "PI":
                    file_name = name + "_" + \
                                model + "_" + \
                                base_scen[management_type]["cover"] + "_" + \
                                base_scen[management_type]["tillage"] + "_" + \
                                base_scen[management_type]["contour"] + "_" + \
                                manure_p2 + "_" + \
                                region
                    base_layer_dic[name + "_" + "PI2"] = "" + file_name

    # download corn and soy rasters for yield
    corn = "corn_Yield_" + region
    soy = "soy_Yield_" + region
    base_layer_dic["corn_yield"] = "" + corn
    base_layer_dic["soy_yield"] = "" + soy
    base_layer_dic["landuse"] = "" + region + "_WiscLand_30m"
    base_layer_dic["hyd_letter"] = "" + region + "_hydgrp_30m"
    base_layer_dic["hayGrassland_Yield"] = "pasture_Yield_medium_" + region

    base_layer_dic["pastureWatershed_Yield"] = "pasture_Yield_"+ base_scen["managementPast"]["grassYield"]+"_" + region
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
    workspace = "SmartScapeRaster_" + region + ":"
    threads_list = []
    print("geofolder file path", geo_folder)
    folder_base = os.path.join(geo_folder, "base")
    if not os.path.exists(folder_base):
        os.makedirs(folder_base)
    else:
        shutil.rmtree(folder_base)
        os.makedirs(folder_base)

    for layer in base_layer_dic:
        print("downloading layer base", base_layer_dic[layer])
        url = geoserver_url + workspace + base_layer_dic[layer] + extents_string_x + extents_string_y
        raster_file_path = os.path.join(geo_folder, "base", layer + ".tif")
        download_thread = threading.Thread(target=download, args=(url, raster_file_path))
        download_thread.start()


def download(link, filelocation):
    r = requests.get(link, stream=True)
    with open(filelocation, 'wb') as f:
        for chunk in r.iter_content(1024):
            if chunk:
                f.write(chunk)


def get_phos_fert_options(request, base_calc, region):
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
    # file path of our input data
    geo_folder = os.path.join(settings.BASE_DIR, 'smartscape', 'data_files', 'raster_inputs', folder_id)

    # make sure files are loaded
    def check_file_path(geo_folder_func):
        # print("checking files!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        # print(geo_folder_func)
        if not os.path.exists(geo_folder_func):
            return False
        dir_list = os.listdir(geo_folder_func)
        # print(dir_list)
        if region != "pineRiverMN":
            if "om.tif" in dir_list and "drainClass.tif" in dir_list and "nResponse.tif" in dir_list:
                return True
            else:
                return False
        else:
            if "om.tif" in dir_list and "drainClass.tif" in dir_list:
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
    model.load_nrec(region)

    def calc_p_local(tran, nrec_trans, name, management):
        nrec = nrec_trans[name]["ManureN"]
        pneeds = nrec_trans[name]["Pneeds"]
        manure_n = float(nrec) * float(tran[management]["nitrogen"]) / 100
        applied_manure_n = (manure_n / 0.4) / 3
        manure_percent = (applied_manure_n / float(pneeds)) * 100
        return manure_percent

    file_path = os.path.join(geo_folder, "landuse_aoi-clipped.tif")
    image = gdal.Open(file_path)
    band = image.GetRasterBand(1)
    arr = band.ReadAsArray()

    def calc_phos_calc(arr, base, id):
        if id != "base":
            mang_cont = "management"
            mang_corn = "management"
            mang_dairy = "management"
            mang_past = "management"
            is_not_base = True
        else:
            mang_cont = "managementCont"
            mang_corn = "managementCorn"
            mang_dairy = "managementDairy"
            mang_past = "managementPast"
            is_not_base = False

        output = np.copy(arr)
        cell_corn = np.count_nonzero(arr == 4)
        cell_corn_grain = np.count_nonzero(arr == 3)
        cell_dairy = np.count_nonzero(arr == 5)
        cell_pasture = np.count_nonzero(arr == 9)

        total_cells = cell_corn + cell_corn_grain + cell_dairy + cell_pasture
        total_total_cell = np.count_nonzero(arr > -9999)

        if region == "pineRiverMN":
            n_parameters = model.get_nitrate_params_base_mn(base, arr, total_total_cell, is_not_base)
        else:
            n_parameters = model.get_nitrate_params_base(base, arr, total_total_cell, is_not_base)

        p_manure_corn = calc_p_local(base, n_parameters, "nrec_trans_cont_values", mang_cont)
        p_manure_cash_grain = 0.5 * calc_p_local(base, n_parameters, "nrec_trans_corn_values", mang_corn) + \
                              0.5 * calc_p_local(base, n_parameters, "nrec_trans_soy_values", mang_corn)
        p_manure_dairy = 1 / 5 * calc_p_local(base, n_parameters, "nrec_trans_corn_dairy_values", mang_dairy) + \
                         2 / 5 * calc_p_local(base, n_parameters, "nrec_trans_alfalfa_values", mang_dairy) + \
                         1 / 5 * calc_p_local(base, n_parameters, "nrec_trans_alfalfa_seed_values", mang_dairy) + \
                         1 / 5 * calc_p_local(base, n_parameters, "nrec_trans_silage_values", mang_dairy)
        p_manure_pasture = calc_p_local(base, n_parameters, "nrec_trans_pasture_values", mang_past)
        # only calc p_manure for the three main crop systems
        watershed_total = {3: {"p_manure": p_manure_cash_grain},
                           4: {"p_manure": p_manure_corn},
                           5: {"p_manure": p_manure_dairy},
                           1: {"p_manure": 0},
                           2: {"p_manure": 0},
                           6: {"p_manure": 0},
                           7: {"p_manure": 0},
                           8: {"p_manure": 0},
                           9: {"p_manure": p_manure_pasture},
                           10: {"p_manure": 0},
                           11: {"p_manure": 0},
                           12: {"p_manure": 0},
                           13: {"p_manure": 0},
                           14: {"p_manure": 0},
                           15: {"p_manure": 0}
                           }
        for land_type in watershed_total:
            output = np.where(arr == land_type, watershed_total[land_type]["p_manure"], output)
        p_manure_arr = np.where(output == model.no_data, 0, output)
        p_manure = np.sum(p_manure_arr) / total_cells
        p_manure_levels = model.calc_manure_level(p_manure)
        if id != "base":
            return_data[id] = {"p_manure": "{:,.0f}".format(p_manure), "p_choices": phos_choices[str(p_manure_levels)],
                               "p_manure_cat": p_manure_levels}
        else:
            return_data["base"] = {
                "cont": {
                    "p_manure": "{:,.0f}".format(p_manure),
                    "p_choices": phos_choices[str(p_manure_levels)],
                    "p_manure_cat": p_manure_levels
                },
                "corn": {
                    "p_manure": "{:,.0f}".format(p_manure),
                    "p_choices": phos_choices[str(p_manure_levels)],
                    "p_manure_cat": p_manure_levels
                },
                "dairy": {
                    "p_manure": "{:,.0f}".format(p_manure),
                    "p_choices": phos_choices[str(p_manure_levels)],
                    "p_manure_cat": p_manure_levels
                },
                "past": {
                    "p_manure": "{:,.0f}".format(p_manure),
                    "p_choices": phos_choices[str(p_manure_levels)],
                    "p_manure_cat": p_manure_levels
                },
            }

        return return_data

    return_data = {}

    if not base_calc:
        trans = request_json['trans']
        for tran1 in trans:
            tran = trans[tran1]
            return_data.update(calc_phos_calc(arr, tran, tran["id"]))
    else:
        return_data = calc_phos_calc(arr, base, "base")

    print(return_data)
    return return_data


def check_base_files_loaded(geo_folder, region):
    # make sure files are loaded
    print("geo_folder", geo_folder)
    print("region", region)

    def check_file_path(geo_folder_func):
        folder_count = 0
        print(geo_folder_func)
        if not os.path.exists(geo_folder_func):
            return False
        dir_list = os.listdir(geo_folder_func)
        for file in dir_list:
            folder_count = folder_count + 1
        print("Number of base files loaded", folder_count)
        if folder_count != BASE_FOLDER_COUNT:
            return False
        return True

    files_loaded = check_file_path(geo_folder)
    while not files_loaded:
        time.sleep(.5)
        files_loaded = check_file_path(geo_folder)
        print("file not loaded")
    print("all base files are loaded")
