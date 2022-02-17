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
from grazescape.model_defintions.smart_scape import SmartScape
from grazescape.db_connect import *
import traceback
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import FileResponse
from django.views.decorators.csrf import csrf_protect
import time
import json as js


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
    # Render the HTML template index.html with the data in the context variable
    return render(request, 'smartscape_home.html', context=context)


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
    error = ""
    start = time.time()
    print(" ", time.time()-start)
    print(request.POST)

    folder_id = str(uuid.uuid4())
    extents = request.POST.getlist("geometry[extent][]")

    print(extents)
    try:
        geo_data = RasterDataSmartScape(
                extents, None,
                folder_id)
        print("Downloading ", time.time() - start)
        geo_data.load_layers()
        print("Layer loaded ", time.time() - start)
        data = {
            "get_data": "success",
            "folder_id": folder_id
        }
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
    print(request_json)
    folder_id = request_json["folderId"]

    # folder_id = request.POST.get("folderId")
    # trans_id = request.POST.get("transId")
    trans_id = request_json["transId"]
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
    geo_data = RasterDataSmartScape(extents, field_coors_formatted, folder_id)
    print("Create clipping boundary ", time.time() - start)

    geo_data.create_clip()
    print("Clip raster ", time.time() - start)

    geo_data.clip_rasters()
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
    model.get_model_png()
    print("Done ", time.time() - start)

    data = {
        "extent": extents,
        "url": os.path.join(model.file_name, "selection.png"),
        "transId":trans_id
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
    return JsonResponse(return_data, safe=False)


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
    print(request_json)
    trans_id = str(uuid.uuid4())
    folder_id = request_json["folderId"]

    model = SmartScape(request_json, trans_id, folder_id)
    return_data = model.create_model_agr()

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
    print(return_data)
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
    # FileResponse take care of closing file
    response = FileResponse(img)

    return response
