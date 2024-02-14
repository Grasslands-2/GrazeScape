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
import smartscape.helper_base
import numpy as np
from osgeo import gdalconst as gc


def offline(request):
    return render(request, 'offline.html')


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
        "cloverBeltWI_Huc12",
        "southWestWI_Huc12",
        "uplandsWI_Huc12",
        "northeastWI_Huc12",
        "redCedarWI_Huc12",
        "pineRiverMN_Huc12",
    ]
    threads = []
    for name in file_names:
        url = settings.GEOSERVER_URL + "/geoserver/SmartScapeVector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=SmartScapeVector%3A" + name + "&outputFormat=application%2Fjson"
        print("downloading", url)
        raster_file_path = os.path.join(dir_path, name + ".geojson")
        thread = createNewDownloadThread(url, raster_file_path)
        threads.append(thread)
        # r = requests.get(url)
        # with open(raster_file_path, "wb") as f:
        #     f.write(r.content)
    for th in threads:
        th.join()
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
    return download_thread


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
        smartscape.helper_base.download_base_rasters_helper(request, folder_id)
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
    smartscape.helper_base.download_base_rasters_helper(request, geo_folder)
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
        return_data : JsonResponse
            Contains the trans/base id and the p values
    """
    request_json = js.loads(request.body)
    # print(request_json)
    base_calc = request_json['base_calc']
    region = request_json["region"]
    print("doing base calc for phos fert options", base_calc)
    return_data = smartscape.helper_base.get_phos_fert_options(request, base_calc, region)
    print("done getting phos fert options !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
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
    request_json = js.loads(request.body)
    folder_id = request_json["folderId"]

    trans_id = request_json["transId"]
    extents = request_json["geometry"]["extent"]
    field_coors = request_json["geometry"]["field_coors"]
    region = request_json["region"]
    field_coors_formatted = []

    for val in field_coors:
        field_coors_formatted.append(val[0][0])
    # try:
    print("intitaling rasters")
    geo_data = RasterDataSmartScape(extents, field_coors_formatted, folder_id, region)
    print("Create clipping boundary ", time.time() - start)
    # geo_data.create_clip()
    print("Clip created ", time.time() - start)
    # geo_data.clip_rasters(False)
    print("done clipping rasters", time.time() - start)

    clipped_rasters, bounds = geo_data.get_clipped_rasters()
    # geo_data.clean()
    # time.sleep(5)
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
    print("return data", data)
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

    geo_folder = os.path.join(settings.BASE_DIR, 'smartscape', 'data_files',
                              'raster_inputs', folder_id, "base")

    smartscape.helper_base.check_base_files_loaded(geo_folder, request_json['region'])

    model = SmartScape(request_json, trans_id, folder_id)
    return_data = model.run_models()
    # return_data = []
    print("done running models")

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
