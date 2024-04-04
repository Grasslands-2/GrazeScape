"""
Helper SmartScape views
Author: Matthew Bayles
Created: July 2021
Python Version: 3.9.2
"""
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

BASE_FOLDER_COUNT = 30


def download_base_rasters_helper(request, geo_folder):
    print("starting to download base rasters")
    request_json = js.loads(request.body)
    # geo_folder = request_json["folderId"]
    region = request_json['region']
    # manure_options = get_phos_fert_options(request, True, region)
    # print("manure options", manure_options)
    base_scen = request_json['baseTrans']

    print(settings.BASE_DIR, 'floodscape', 'data_files',
                              'raster_inputs', geo_folder)
    geo_folder = os.path.join(settings.BASE_DIR, 'floodscape', 'data_files',
                              'raster_inputs', geo_folder)
    base_layer_dic = {}
    # download layers for base case
    base_names = ("contCorn", "cornGrain", "dairyRotation", "hayGrassland", "pastureWatershed")
    model_names_base = ["CN"]
    region_extents = base_scen["selection"]["extent"]

    # contCorn
    # create name of the layer that corresponds to geoserver for base case
    # Todo fix this

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
        m1, m2, p1, p2 = 0, 0, 0, 0
        if phos_val == "default":
            phos_val = 0
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
            # handling edge case where phos hasn't been calculated
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
    manure_cont = float(base_scen["managementCont"]["phos_manure"])
    manure_corn = float(base_scen["managementCorn"]["phos_manure"])
    manure_dairy = float(base_scen["managementDairy"]["phos_manure"])
    manure_past = float(base_scen["managementPast"]["phos_manure"])

    manure_rounded_cont = calc_manure_level(manure_cont)
    manure_rounded_corn = calc_manure_level(manure_corn)
    manure_rounded_dairy = calc_manure_level(manure_dairy)
    manure_rounded_past = calc_manure_level(manure_past)

    base_phos_fert_cont = float(base_scen["managementCont"]["phos_fertilizer"])
    base_phos_fert_corn = float(base_scen["managementCorn"]["phos_fertilizer"])
    base_phos_fert_dairy = float(base_scen["managementDairy"]["phos_fertilizer"])
    base_phos_fert_past = float(base_scen["managementPast"]["phos_fertilizer"])

    print("done getting phos values from scenario")

    man1_cont, man2_cont, phos1_cont, phos2_cont = get_m_p_options(manure_rounded_cont, base_phos_fert_cont,
                                                                   manure_cont)
    man1_corn, man2_corn, phos1_corn, phos2_corn = get_m_p_options(manure_rounded_corn, base_phos_fert_corn,
                                                                   manure_corn)
    man1_dairy, man2_dairy, phos1_dairy, phos2_dairy = get_m_p_options(manure_rounded_dairy, base_phos_fert_dairy,
                                                                       manure_dairy)
    man1_past, man2_past, phos1_past, phos2_past = get_m_p_options(manure_rounded_past, base_phos_fert_past,
                                                                   manure_past)

    print("manure values for raster baseline")
    manure_p_cont = str(man1_cont) + "_" + str(phos1_cont)
    manure_p2_cont = str(man2_cont) + "_" + str(phos2_cont)

    manure_p_corn = str(man1_corn) + "_" + str(phos1_corn)
    manure_p2_corn = str(man2_corn) + "_" + str(phos2_corn)

    manure_p_dairy = str(man1_dairy) + "_" + str(phos1_dairy)
    manure_p2_dairy = str(man2_dairy) + "_" + str(phos2_dairy)

    manure_p_past = str(man1_past) + "_" + str(phos1_past)
    manure_p2_past = str(man2_past) + "_" + str(phos2_past)

    for name in base_names:
        for model in model_names_base:
            if name == "hayGrassland":
                # medium_GrassYield_southWestWI.tif
                # pasture_CN_rt_rt_0_0_southWestWI.tif
                base_layer_dic[name + "_" + model] = "pasture_" + model + "_cn_lo_0_0_" + region
                base_layer_dic[name + "_" + model + "_whole_region"] = "pasture_" + model + "_rt_rt_0_0_" + region
            elif name == "pastureWatershed":
                base_layer_dic[name + "_" + model] = "pasture_" + model + "_" + \
                                                     base_scen["managementPast"]["density"] + "_" + \
                                                     manure_p_past + "_" + \
                                                     region
                base_layer_dic[name + "_" + model + "_whole_region"] = "pasture_" + model + "_" + \
                                                     base_scen["managementPast"]["density"] + "_" + \
                                                     manure_p_past + "_" + \
                                                     region

                if model == "PI":
                    base_layer_dic[name + "_" + "PI2"] = "pasture_" + model + "_" + \
                                                         base_scen["managementPast"]["density"] + "_" + \
                                                         manure_p2_past + "_" + \
                                                         region
            else:
                management_type = None
                if name == "contCorn":
                    management_type = "managementCont"
                    manure_p = manure_p_cont
                    manure_p2 = manure_p2_cont
                elif name == "cornGrain":
                    management_type = "managementCorn"
                    manure_p = manure_p_corn
                    manure_p2 = manure_p2_corn
                elif name == "dairyRotation":
                    management_type = "managementDairy"
                    manure_p = manure_p_dairy
                    manure_p2 = manure_p2_dairy

                file_name = name + "_" + \
                            model + "_" + \
                            base_scen[management_type]["cover"] + "_" + \
                            base_scen[management_type]["tillage"] + "_" + \
                            base_scen[management_type]["contour"] + "_" + \
                            manure_p + "_" + \
                            region
                base_layer_dic[name + "_" + model] = "" + file_name
                base_layer_dic[name + "_" + model + "_whole_region"] = "" + file_name

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
    base_layer_dic["landuse" + "_whole_region"] = "" + region + "_WiscLand_30m"
    base_layer_dic["hyd_letter"] = "" + region + "_hydgrp_30m"
    base_layer_dic["hyd_letter"+ "_whole_region"] = "" + region + "_hydgrp_30m"
    base_layer_dic["hayGrassland_Yield"] = "pasture_Yield_medium_" + region

    base_layer_dic["pastureWatershed_Yield"] = "pasture_Yield_" + base_scen["managementPast"][
        "grassYield"] + "_" + region
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
    print("geofolder file path", geo_folder)
    folder_base = os.path.join(geo_folder, "base")
    if not os.path.exists(folder_base):
        os.makedirs(folder_base)
    else:
        shutil.rmtree(folder_base)
        os.makedirs(folder_base)

    for layer in base_layer_dic:
        print("downloading layer base", base_layer_dic[layer])
        if "_whole_region" in layer:
            url = geoserver_url + workspace + base_layer_dic[layer] + region_extents_string_x + region_extents_string_y
        else:
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
    # folder id of our aoi input data
    folder_id = request_json["folderId"]
    # transformation data

    base = request_json['baseTrans']
    # file path of our input data
    print(settings.BASE_DIR, 'floodscape', 'data_files', 'raster_inputs', folder_id)
    geo_folder = os.path.join(settings.BASE_DIR, 'floodscape', 'data_files', 'raster_inputs', folder_id)

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

    def calc_phos_calc(arr, input_tran, id, base_for_tran):
        mang_cont = "managementCont"
        mang_corn = "managementCorn"
        mang_dairy = "managementDairy"
        mang_past = "managementPast"
        cover_den_leg_dict = {
            "managementCont": base_for_tran["managementCont"]["cover"],
            "managementCorn": base_for_tran["managementCont"]["cover"],
            "managementDairy": base_for_tran["managementCont"]["cover"],
            "managementPastDensity": base_for_tran["managementPast"]["density"],
            "managementPastLegume": base_for_tran["managementPast"]["legume"],
        }
        if id != "base":
            rot_type = input_tran["management"]["rotationType"]
            # use the parameters from the transformation for the selected rotation type
            if rot_type == "pasture":
                mang_past = "management"
                cover_den_leg_dict["managementPastDensity"] = input_tran["management"]["density"]
                cover_den_leg_dict["managementPastLegume"] = input_tran["management"]["legume"]
            elif rot_type == "contCorn":
                mang_cont = "management"
                cover_den_leg_dict["managementCont"] = input_tran["management"]["cover"]
            elif rot_type == "cornGrain":
                mang_corn = "management"
                cover_den_leg_dict["managementCorn"] = input_tran["management"]["cover"]
            elif rot_type == "dairyRotation":
                mang_dairy = "management"
                cover_den_leg_dict["managementDairy"] = input_tran["management"]["cover"]
            elif rot_type == "cornSoyOat":
                cover_den_leg_dict["managementDairy"] = input_tran["management"]["cover"]
                mang_dairy = "management"

        cell_corn = np.count_nonzero(arr == 4)
        cell_corn_grain = np.count_nonzero(arr == 3)
        cell_dairy = np.count_nonzero(arr == 5)
        cell_pasture = np.count_nonzero(arr == 9)

        total_total_cell = np.count_nonzero(arr > -9999)

        if region == "pineRiverMN":
            n_parameters = model.get_nitrate_params_base_mn(total_total_cell, cover_den_leg_dict)
        else:
            n_parameters = model.get_nitrate_params_base(total_total_cell, cover_den_leg_dict)

        p_manure_corn = calc_p_local(base_for_tran, n_parameters, "nrec_trans_cont_values", mang_cont)

        p_manure_cash_grain = 0.5 * calc_p_local(base_for_tran, n_parameters, "nrec_trans_corn_values", mang_corn) + \
                              0.5 * calc_p_local(base_for_tran, n_parameters, "nrec_trans_soy_values", mang_corn)

        p_manure_dairy = 1 / 5 * calc_p_local(base_for_tran, n_parameters, "nrec_trans_corn_dairy_values", mang_dairy) + \
                         2 / 5 * calc_p_local(base_for_tran, n_parameters, "nrec_trans_alfalfa_values", mang_dairy) + \
                         1 / 5 * calc_p_local(base_for_tran, n_parameters, "nrec_trans_alfalfa_seed_values",
                                              mang_dairy) + \
                         1 / 5 * calc_p_local(base_for_tran, n_parameters, "nrec_trans_silage_values", mang_dairy)

        p_manure_pasture = calc_p_local(base_for_tran, n_parameters, "nrec_trans_pasture_values", mang_past)

        # sub in the transformation for the corresponding base scenario
        if id != "base":
            rot_type = input_tran["management"]["rotationType"]
            output_trans = np.copy(arr)
            # use the parameters from the transformation for the selected rotation type
            if rot_type == "pasture":
                mang_past = "management"
                p_manure = calc_p_local(input_tran, n_parameters, "nrec_trans_pasture_values", mang_past)
                land_number = 9
                cell_number = cell_pasture
            elif rot_type == "contCorn":
                mang_cont = "management"
                p_manure = calc_p_local(input_tran, n_parameters, "nrec_trans_cont_values", mang_cont)
                land_number = 4
                cell_number = cell_corn
            elif rot_type == "cornGrain":
                mang_corn = "management"
                p_manure = 0.5 * calc_p_local(input_tran, n_parameters, "nrec_trans_corn_values",
                                              mang_corn) + \
                           0.5 * calc_p_local(input_tran, n_parameters, "nrec_trans_soy_values",
                                              mang_corn)
                land_number = 3
                cell_number = cell_corn_grain
            elif rot_type == "dairyRotation":
                mang_dairy = "management"
                p_manure = 1 / 5 * calc_p_local(input_tran, n_parameters, "nrec_trans_corn_dairy_values",
                                                mang_dairy) + \
                           2 / 5 * calc_p_local(input_tran, n_parameters, "nrec_trans_alfalfa_values",
                                                mang_dairy) + \
                           1 / 5 * calc_p_local(input_tran, n_parameters, "nrec_trans_alfalfa_seed_values",
                                                mang_dairy) + \
                           1 / 5 * calc_p_local(input_tran, n_parameters, "nrec_trans_silage_values",
                                                mang_dairy)
                land_number = 5
                cell_number = cell_dairy
            elif rot_type == "cornSoyOat":
                mang_dairy = "management"
                p_manure = 1 / 5 * calc_p_local(input_tran, n_parameters, "nrec_trans_corn_dairy_values",
                                                mang_dairy) + \
                           2 / 5 * calc_p_local(input_tran, n_parameters, "nrec_trans_alfalfa_values",
                                                mang_dairy) + \
                           1 / 5 * calc_p_local(input_tran, n_parameters, "nrec_trans_alfalfa_seed_values",
                                                mang_dairy) + \
                           1 / 5 * calc_p_local(input_tran, n_parameters, "nrec_trans_silage_values",
                                                mang_dairy)
                land_number = 5
                cell_number = cell_dairy
            output_trans = np.where(output_trans != land_number, 0, output_trans)
            output_trans = np.where(output_trans == land_number, p_manure, output_trans)
            p_manure_trans = np.sum(output_trans) / cell_number
            p_manure_levels_trans = model.calc_manure_level(p_manure_trans)
        output_cont = np.copy(arr)
        output_corn = np.copy(arr)
        output_dairy = np.copy(arr)
        output_past = np.copy(arr)

        output_cont = np.where(output_cont != 4, 0, output_cont)
        output_cont = np.where(output_cont == 4, p_manure_corn, output_cont)

        output_corn = np.where(output_corn != 3, 0, output_corn)
        output_corn = np.where(output_corn == 3, p_manure_cash_grain, output_corn)

        output_dairy = np.where(output_dairy != 5, 0, output_dairy)
        output_dairy = np.where(output_dairy == 5, p_manure_dairy, output_dairy)

        output_past = np.where(output_past != 9, 0, output_past)
        output_past = np.where(output_past == 9, p_manure_pasture, output_past)

        # total_cells = cell_corn + cell_corn_grain + cell_dairy + cell_pasture

        p_manure_cont = np.sum(output_cont) / cell_corn
        p_manure_corn = np.sum(output_corn) / cell_corn_grain
        p_manure_dairy = np.sum(output_dairy) / cell_dairy
        p_manure_past = np.sum(output_past) / cell_pasture
        print("p_manure_cont", p_manure_cont)
        print("p_manure_cont", cell_corn)
        print("p_manure_cont", output_cont)
        p_manure_levels_cont = model.calc_manure_level(p_manure_cont)
        p_manure_levels_corn = model.calc_manure_level(p_manure_corn)
        p_manure_levels_dairy = model.calc_manure_level(p_manure_dairy)
        p_manure_levels_past = model.calc_manure_level(p_manure_past)

        if id != "base":
            return_data[id] = {"p_manure": "{:,.0f}".format(p_manure_trans),
                               "p_choices": phos_choices[str(p_manure_levels_trans)],
                               "p_manure_cat": p_manure_levels_trans}
        else:
            return_data["base"] = {
                "cont": {
                    "p_manure": "{:,.0f}".format(p_manure_cont),
                    "p_choices": phos_choices[str(p_manure_levels_cont)],
                    "p_manure_cat": p_manure_levels_cont
                },
                "corn": {
                    "p_manure": "{:,.0f}".format(p_manure_corn),
                    "p_choices": phos_choices[str(p_manure_levels_corn)],
                    "p_manure_cat": p_manure_levels_corn
                },
                "dairy": {
                    "p_manure": "{:,.0f}".format(p_manure_dairy),
                    "p_choices": phos_choices[str(p_manure_levels_dairy)],
                    "p_manure_cat": p_manure_levels_dairy
                },
                "past": {
                    "p_manure": "{:,.0f}".format(p_manure_past),
                    "p_choices": phos_choices[str(p_manure_levels_past)],
                    "p_manure_cat": p_manure_levels_past
                },
            }

        return return_data

    return_data = {}

    if not base_calc:
        print("calculating phos for trans")
        trans = request_json['trans']
        for tran1 in trans:
            tran = trans[tran1]
            return_data.update(calc_phos_calc(arr, tran, tran["id"], base))
    else:
        return_data = calc_phos_calc(arr, base, "base", base)

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
