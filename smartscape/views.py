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
        url = settings.GEOSERVER_URL + "/geoserver/SmartScapeVector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=SmartScapeVector%3A"+name+"&outputFormat=application%2Fjson"
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
    folder_id = str(uuid.uuid4())
    extents = request_json["geometry"]["extent"]
    field_coors = request_json["geometry"]["field_coors"]
    region = request_json["region"]
    print(field_coors)
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
    print(" ", time.time()-start)
    # print(request.POST)
    request_json = js.loads(request.body)
    folder_id = request_json["folderId"]

    # folder_id = request.POST.get("folderId")
    # trans_id = request.POST.get("transId")
    trans_id = request_json["transId"]
    print(request_json)
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