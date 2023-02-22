"""
Main file for controlling SmartScape views
Author: Matthew Bayles
Created: November 2021
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
import smartscape.helper
import numpy as np
from osgeo import gdalconst as gc


@login_required
def index(request):
    """
    Render the base template for SmartScape
    Parameters
    ----------
    request : request object
            The request object from the client

    Returns
    -------
    HTTP Response
        Return the page render
    """
    # if request.user.is_athenticated:
    user_name = request.user.username
    context = {
        "user_info": {"user_name": user_name}
    }
    dir_path = os.path.join(settings.BASE_DIR, 'smartscape',
                            'data_files', 'raster_inputs')
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    # download the watersheds for the learning hubs
    file_names = [
        "southWestWI_Huc10", "CloverBeltWI_Huc12", "CloverBeltWI_Huc10", "southWestWI_Huc12",
        "uplandsWI_Huc10", "uplandsWI_Huc12", "northeastWI_Huc10", "northeastWI_Huc12",
    ]
    for name in file_names:
        url = settings.GEOSERVER_URL + "/geoserver/SmartScapeVector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=SmartScapeVector%3A" + name + "&outputFormat=application%2Fjson"
        print("downloading", url)
        raster_file_path = os.path.join(dir_path, name + ".geojson")
        createNewDownloadThread(url, raster_file_path)
        # r = requests.get(url)
        # with open(raster_file_path, "wb") as f:
        #     f.write(r.content)
    input_path = os.path.join(settings.BASE_DIR, 'smartscape', 'data_files',
                              'raster_inputs')
    now = time.time()
    for f in os.listdir(input_path):
        try:
            f = os.path.join(input_path, f)
            if os.stat(f).st_mtime < now - 3600:
                shutil.rmtree(f)
        except OSError as e:
            print("Error: %s : %s" % (f, e.strerror))

    return render(request, 'smartscape_home.html', context=context)


def createNewDownloadThread(link, filelocation):
    download_thread = threading.Thread(target=download, args=(link, filelocation))
    download_thread.start()


def download(link, filelocation):
    r = requests.get(link, stream=True)
    with open(filelocation, 'wb') as f:
        for chunk in r.iter_content(1024):
            if chunk:
                f.write(chunk)


@login_required
def get_selection_raster(request):
    """
    Download input rasters in background
    Parameters
    ----------
    request : request object
        The request object from the client

    Returns
    -------
    JsonResponse
        Contains output parameters needed for client

    """
    data = {}
    field_coors_formatted = []
    error = ""
    start = time.time()
    print("downloading rasters in background")
    request_json = js.loads(request.body)
    # folder for all input and outputs
    # folder_id = str(uuid.uuid4())
    folder_id = request_json["folderId"]
    extents = request_json["geometry"]["extent"]
    field_coors = request_json["geometry"]["field_coors"]
    region = request_json["region"]
    # print(field_coors)
    for val in field_coors:
        # print("###########################")
        # print(val)
        field_coors_formatted.append(val[0][0])
    print("downloading base raster")

    try:
        geo_data = RasterDataSmartScape(
            extents, field_coors_formatted,
            folder_id,
            region)
        print("loading layers")
        geo_data.load_layers()
        print("create clip #######################################")
        geo_data.create_clip()
        print("Clip raster ", time.time() - start)

        geo_data.clip_rasters(True)
        print("Downloading ", time.time() - start)
        print("Layer loaded ", time.time() - start)
        data = {
            "get_data": "success",
            "folder_id": folder_id
        }
        # download base layers async
        smartscape.helper.download_base_rasters_helper(request, folder_id)
    except KeyError as e:
        error = str(e)
    except ValueError as e:
        error = str(e)
    except TypeError as e:
        print("type error")
        error = str(e)
    except FileNotFoundError as e:
        error = str(e)
    except Exception as e:
        error = str(e)
        print(type(e).__name__)
        print(traceback.format_exc())
        traceback.print_exc()
    print(error)
    return JsonResponse(data, safe=False)


@login_required
def download_base_rasters(request):
    request_json = js.loads(request.body)
    geo_folder = request_json["folderId"]
    smartscape.helper.download_base_rasters_helper(request, geo_folder)
    return JsonResponse({"download": "started"}, safe=False)


# get the raster with selection criteria applied
def get_phos_fert_options(request):
    """
    Calculate p manure and avialable p fert options for each transformation and base case
    Parameters
    ----------
    request : request object
        The request object from the client

    Returns
    -------
        return_dict : dict
            dictionary containing the trans/base id and the p values
    """
    # base on the available rasters for smartscape
    phos_choices = {"0": [0, 100], "100": [0], "150": [0], "200": [0], "25": [50], "50": [50]}

    request_json = js.loads(request.body)
    # folder id of our aoi input data
    folder_id = request_json["folderId"]
    # transformation data
    trans = request_json['trans']
    base = request_json['base']
    base_calc = request_json['base_calc']
    # trans_id = request_json["transId"]
    # file path of our input data
    geo_folder = os.path.join(settings.BASE_DIR, 'smartscape', 'data_files', 'raster_inputs', folder_id)
    data_dir = os.path.join(settings.BASE_DIR, 'smartscape', 'data_files', 'raster_inputs')
    return_data = {}

    # make sure files are loaded
    def check_file_path(geo_folder_func):
        print("checking files!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print(geo_folder_func)
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
    for tran1 in trans:
        tran = trans[tran1]
        layer_rank = tran1
        print("layer rank", layer_rank, tran["id"])
        image = gdal.Open(os.path.join(data_dir, tran["id"], "selection_output.tif"))
        band = image.GetRasterBand(1)
        arr = band.ReadAsArray()
        arr = np.where(arr == -99, float(layer_rank), arr)
        arr_holder.append(arr)

        cell_count_trans = np.count_nonzero(arr == float(layer_rank))
        print(np.unique(arr, return_counts=True))
        print("cell count for transition ", cell_count_trans)
        n_parameters = model.get_nitrate_params(tran, arr, layer_rank)
        manure_p_bounds = model.calc_p(tran, n_parameters["nirate_inputs"])
        manure_p = manure_p_bounds[0]
        print("p manure!!")
        print(manure_p)
        return_data[tran["id"]] = {"p_manure": manure_p, "p_choices": phos_choices[manure_p]}
    if base_calc:
        file_path = os.path.join(geo_folder, "landuse_aoi-clipped.tif")
        image = gdal.Open(file_path)
        band = image.GetRasterBand(1)
        arr = band.ReadAsArray()
        output = np.copy(arr)
        total_cells = np.count_nonzero(arr > model.no_data)
        n_parameters = model.get_nitrate_params_base(base, arr, total_cells)
        print(n_parameters)

        def calc_p(tran, nrec_trans, name):
            nrec = nrec_trans[name]["fertN"]
            pneeds = nrec_trans[name]["Pneeds"]
            manure_n = float(nrec) * float(tran["management"]["nitrogen"]) / 100
            applied_manure_n = (manure_n / 0.4) / 3
            manure_percent = (applied_manure_n / float(pneeds)) * 100
            return manure_percent

        p_manure_hay = calc_p(base, n_parameters, "nrec_trans_pasture_values")
        p_manure_corn = calc_p(base, n_parameters, "nrec_trans_cont_values")
        p_manure_cash_grain = 0.5 * calc_p(base, n_parameters, "nrec_trans_corn_values") + 0.5 * calc_p(base,
                                                                                                           n_parameters,
                                                                                                           "nrec_trans_soy_values")
        p_manure_dairy = 1 / 5 * calc_p(base, n_parameters, "nrec_trans_corn_dairy_values") + \
                         2 / 5 * calc_p(base, n_parameters, "nrec_trans_alfalfa_values") + \
                         1 / 5 * calc_p(base, n_parameters, "nrec_trans_alfalfa_seed_values") + \
                         1 / 5 * calc_p(base, n_parameters, "nrec_trans_silage_values")
        watershed_total = {3: {"p_manure": p_manure_cash_grain},
                           4: {"p_manure": p_manure_corn},
                           5: {"p_manure": p_manure_dairy},
                           1: {"p_manure": 0},
                           2: {"p_manure": 0},
                           6: {"p_manure": 0},
                           7: {"p_manure": 0},
                           8: {"p_manure": p_manure_hay},
                           9: {"p_manure": p_manure_hay},
                           10: {"p_manure": p_manure_hay},
                           11: {"p_manure": 0},
                           12: {"p_manure": 0},
                           13: {"p_manure": 0},
                           14: {"p_manure": 0},
                           15: {"p_manure": 0}}
        for land_type in watershed_total:
            print(land_type)
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
        image = gdal.Open(os.path.join(geo_folder, "om_aoi-clipped.tif"))
        [rows, cols] = p_manure_arr.shape
        driver = gdal.GetDriverByName("GTiff")
        file_path = os.path.join(geo_folder, "aaaAaaaap_output_base111.tif")
        print("file path of test ffile", file_path)
        outdata = driver.Create(file_path, cols, rows, 1,
                                gdal.GDT_Float32)
        outdata.SetGeoTransform(image.GetGeoTransform())  ##sets same geotransform as input
        outdata.SetProjection(image.GetProjection())  ##sets same projection as input
        outdata.GetRasterBand(1).WriteArray(p_manure_arr)
        outdata.GetRasterBand(1).SetNoDataValue(-9999)
        # write to disk
        outdata.FlushCache()
        outdata = None
        band = None
        ds = None

        p_manure = model.calc_manure_level(p_manure)
        # phos_choices = {"55": [66, 88888, 56777]}
        return_data["base"] = {"p_manure": p_manure[0], "p_choices": phos_choices[manure_p]}
    print(return_data)
    return JsonResponse({"response": return_data}, safe=False)


def get_selection_criteria_raster(request):
    """
    Takes user transformation and creates a selection raster and png indicating which cells are selected given
    the transformation criteria.
    Parameters
    ----------
    request : request object
        The request object from the client

    Returns
    -------
    JsonResponse
        Contains output parameters needed for client
    """
    start = time.time()
    print(" ", time.time() - start)
    # print(request.POST)
    request_json = js.loads(request.body)
    folder_id = request_json["folderId"]

    # folder_id = request.POST.get("folderId")
    # trans_id = request.POST.get("transId")
    trans_id = request_json["transId"]
    # print(request_json)
    print("this is the folder id ", trans_id)
    # print(field_id)
    scenario_id = 1
    farm_id = 1
    print("field coors test")
    # print(request_json["geometry"]["field_coors"][0])
    # print(request_json["geometry"]["field_coors"][0][0])
    # print(request_json["geometry"]["field_coors"][0][0][0])
    f_name = "smartscape"
    model_type = "smartscape"
    scen = "smartscape"
    extents = request_json["geometry"]["extent"]
    # slope1 = request_json["selectionCrit"]["selection"]["slope1"]
    # slope2 = request_json["selectionCrit"]["selection"]["slope2"]

    field_coors = request_json["geometry"]["field_coors"]
    region = request_json["region"]
    field_coors_formatted = []

    for val in field_coors:
        # print("###########################")
        # print(val)
        field_coors_formatted.append(val[0][0])
    # for val in field_coors_formatted:
    #     print("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
    #     print(val)
    # format field geometry
    # for x in range(int(field_coors_len)):
    #     sub_field_coors = []
    #     for input in request.POST:
    #         if "geometry[field_coors]["+str(x)+"]" in input:
    #             sub_field_coors.append(request.POST.getlist(input))
    #     field_coors.append(sub_field_coors)
    print("Printing field coordinates")
    # try:
    geo_data = RasterDataSmartScape(extents, field_coors_formatted, folder_id, region)
    print("Create clipping boundary ", time.time() - start)

    geo_data.create_clip()
    print("Clip raster ", time.time() - start)

    geo_data.clip_rasters(False)
    print("done clipping ", time.time() - start)

    clipped_rasters, bounds = geo_data.get_clipped_rasters()
    # geo_data.clean()

    model = SmartScape(request_json, trans_id, folder_id)

    model.bounds["x"] = geo_data.bounds["x"]
    model.bounds["y"] = geo_data.bounds["y"]
    print(model.bounds)
    model.raster_inputs = clipped_rasters
    # loop here to build a response for all the model types
    return_data = []
    print("Creating png", time.time() - start)
    cell_ratio = model.get_model_png()
    print("Done ", time.time() - start)

    data = {
        "extent": extents,
        "url": os.path.join(model.file_name, "selection.png"),
        "transId": trans_id,
        "cellRatio": cell_ratio
    }
    return_data.append(data)
    return JsonResponse(return_data, safe=False)
    # except KeyError as e:
    #     error = str(e) + " while running models for field " + f_name
    # except ValueError as e:
    #     error = str(e) + " while running models for field " + f_name
    # except TypeError as e:
    #     print("type error")
    #     error = str(e) + " while running models for field " + f_name
    # except FileNotFoundError as e:
    #     error = str(e)
    # except Exception as e:
    #     error = str(e) + " while running models for field " + f_name
    #     print(type(e).__name__)
    #     print(traceback.format_exc())
    #     traceback.print_exc()
    #     # error = "Unexpected error:", sys.exc_info()[0]
    #     # error = "Unexpected error"
    # print(error)


def get_transformed_land(request):
    """
    This function will output model results for transformed land
    Parameters
    ----------
    request : request object
        The request object from the client

    Returns
    -------
    JsonResponse
        Contains output parameters needed for client
    """
    print("running models")
    # print(request.POST)
    # print(request.body)
    request_json = js.loads(request.body)
    # create a new folder for the model outputs
    trans_id = str(uuid.uuid4())
    folder_id = request_json["folderId"]
    base_loaded = request_json["baseLoaded"]
    model = SmartScape(request_json, trans_id, folder_id)
    return_data = model.run_models()
    print("done running models")
    #
    # except KeyError as e:
    #     error = str(e) + " while running models for field " + f_name
    # except ValueError as e:
    #     error = str(e) + " while running models for field " + f_name
    # except TypeError as e:
    #     print("type error")
    #     error = str(e) + " while running models for field " + f_name
    # except FileNotFoundError as e:
    #     error = str(e)
    # except Exception as e:
    #     error = str(e) + " while running models for field " + f_name
    #     print(type(e).__name__)
    #     print(traceback.format_exc())
    #     traceback.print_exc()
    #     # error = "Unexpected error:", sys.exc_info()[0]
    #     # error = "Unexpected error"
    #     print(error)
    # # data = {
    # #     # overall model type crop, ploss, bio, runoff
    # #     "model_type": model_type,
    # #     # specific model for runs with multiple models like corn silage
    # #     "value_type": "dry lot",
    # #     "f_name": f_name,
    # #     "scen": scen,
    # #     "scen_id": scenario_id,
    # #     "field_id": field_id,
    # #     "error": error
    # # }
    # # data = {
    # #     # overall model type crop, ploss, bio, runoff
    # #     "model_type": "test1",
    # # }
    # print(return_data)
    return JsonResponse(return_data, safe=False)


@login_required
@csrf_protect
def get_image(response):
    """
    Handle requests to get png stored on server

    Parameters
    ----------
    response : request object
        The request object from the client

    Returns
    -------
    FileResponse
        The image object
    """
    file_name = response.GET.get('file_name')
    file_path = os.path.join(settings.BASE_DIR, 'smartscape', 'data_files',
                             'raster_inputs', file_name)
    print(file_path)
    img = open(file_path, 'rb')
    # FileResponse takes care of closing file
    response = FileResponse(img)

    return response
