import uuid
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from smartscape.raster_data_smartscape import RasterDataSmartScape
from grazescape.model_defintions.grass_yield import GrassYield
from grazescape.model_defintions.generic import GenericModel
from grazescape.model_defintions.smart_scape import SmartScape
from grazescape.model_defintions.phosphorous_loss import PhosphorousLoss
from grazescape.model_defintions.crop_yield import CropYield
from grazescape.model_defintions.runoff import Runoff
from grazescape.model_defintions.insecticide import Insecticide
from grazescape.geoserver_connect import GeoServer
from grazescape.db_connect import *
import traceback
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import FileResponse
from django.views.decorators.csrf import csrf_protect
import time

@login_required
def index(request):

    # if request.user.is_athenticated:
    user_name = request.user.username
    context = {
        "user_info": {"user_name": user_name}
    }
    # Render the HTML template index.html with the data in the context variable
    return render(request, 'smartscape_home.html', context=context)

# download rasters in background
@login_required
def get_selection_raster(request):
    data = {}
    error = ""
    start = time.time()
    print(" ",time.time()-start)
    print(request.POST)
    # field_id = "smartscape1"
    field_id = str(uuid.uuid4())
    extents = request.POST.getlist("geometry[extent][]")

    # extents = [-10118831.03520702, 5369618.99185455, -10114083.11978821,
    #               5376543.89851876]
    print(extents)
    field_coors = []
    # format field geometry
    # for input in request.POST:
    #     if "field_coors" in input:
    #         field_coors.append(request.POST.getlist(input))
    # print(field_coors)
    try:
        geo_data = RasterDataSmartScape(
                extents, None,
                field_id)
        print("Downloading ", time.time() - start)
        # os.makedirs(geo_data.dir_path)

        geo_data.load_layers()
        print("Layer loaded ", time.time() - start)

        # geo_data.create_clip(field_coors)
        # print("Clip raster ", time.time() - start)

        # geo_data.clip_rasters()
        # print("done clipping ", time.time() - start)
        data = {
            "get_data": "success",
            "folder_id": field_id
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
        # error = "Unexpected error:", sys.exc_info()[0]
        # error = "Unexpected error"
    print(error)
    return JsonResponse(data, safe=False)


# get the raster with selection criteria applied
def get_selection_criteria_raster(request):
    start = time.time()
    print(" ", time.time()-start)
    # print(request.POST)
    field_id = request.POST.get("folderId")
    # print(field_id)
    scenario_id = 1
    farm_id = 1

    f_name = "smartscape"
    model_type = "generic"
    scen = "smartscape"
    extents = request.POST.getlist("geometry[extent][]")
    field_coors_len = request.POST.getlist("geometry[field_coors_len]")[0]
    slope1 = request.POST.get("selectionCrit[slope][slope1]")
    slope2 = request.POST.get("selectionCrit[slope][slope2]")
    print(field_coors_len)

    # print(slope1, slope2)
    # extents = [-10118831.03520702, 5369618.99185455, -10114083.11978821,
    #               5376543.89851876]
    # print(extents)
    field_coors = []
    # format field geometry
    for x in range(int(field_coors_len)):
        sub_field_coors = []
        for input in request.POST:
            if "geometry[field_coors]["+str(x)+"]" in input:
                sub_field_coors.append(request.POST.getlist(input))
        field_coors.append(sub_field_coors)
    print("Printing field coordinates")
    # print(field_coors)
    try:
        geo_data = RasterDataSmartScape(extents, field_coors, field_id)
        print("Create clipping boundary ", time.time() - start)

        geo_data.create_clip(field_coors)
        print("Clip raster ", time.time() - start)

        geo_data.clip_rasters()
        print("done clipping ", time.time() - start)

        clipped_rasters, bounds = geo_data.get_clipped_rasters()
        # geo_data.clean()
        if model_type == 'yield':
            crop_ro = request.POST.getlist("model_parameters[crop]")[0]
            if crop_ro == 'pt' or crop_ro == 'ps':
                model = GrassYield(request)
            elif crop_ro == 'dl':
                data = {
                    # overall model type crop, ploss, bio, runoff
                    "model_type": model_type,
                    # specific model for runs with multiple models like corn silage
                    "value_type": "dry lot",
                    "f_name": f_name,
                    "scen": scen,
                    "scen_id": scenario_id,
                    "field_id": field_id
                }
                return JsonResponse([data], safe=False)
                # pass
            else:
                model = CropYield(request)
        elif model_type == 'ploss':
            model = PhosphorousLoss(request)
        elif model_type == 'runoff':
            model = Runoff(request)
        elif model_type == 'bio':
            model = Insecticide(request)
        else:
            model = SmartScape(request, model_type, True, "field_"+ field_id)

        model.bounds["x"] = geo_data.bounds["x"]
        model.bounds["y"] = geo_data.bounds["y"]
        model.raster_inputs = clipped_rasters
        # loop here to build a response for all the model types
        results = model.run_model()
        # result will be a OutputDataNode+
        return_data = []
        area = 1234
        for result in results:
            if result.model_type == "insect":
                sum = result.data[0]
                avg = sum
                count = 1
                palette = []
                values_legend = []
            elif result.model_type == "smartscape":
                print("Creating png", time.time() - start)
                model.get_model_png(result, geo_data.bounds, slope1, slope2)
                sum = 0
                avg = 0
                count = 1
                palette = []
                values_legend = []
                print("Done ", time.time() - start)
            # regular model run
            else:
                avg, sum, count = model.get_model_png(result, geo_data.bounds,
                                                      geo_data.no_data_aray)
                palette, values_legend = model.get_legend()


            # dealing with rain fall data
            if type(sum) is not list:
                sum = round(sum, 2)
            # erosion and ploss should not be less than zero
            if model_type == 'ploss' and sum < 0:
                sum = 0
            data = {
                "extent": extents,
                "palette": palette,
                "url": model.file_name + ".png",
                "values": values_legend,
                "units": result.default_units,
                "units_alternate": result.alternate_units,
                # overall model type crop, ploss, bio, runoff
                "model_type": model_type,
                # specific model for runs with multiple models like corn silage
                "value_type": result.get_model_type(),
                "f_name": f_name,
                "scen": scen,
                "avg": round(avg, 2),
                "area": round(area, 2),
                "counted_cells": count,
                "sum_cells": sum,
                "scen_id": scenario_id,
                "field_id": field_id,
                # "crop_ro": model.model_parameters["crop"],
                # "grass_ro": model.model_parameters["rotation"],
                # "grass_type": model.model_parameters["grass_type"],
                # "till": model.model_parameters["tillage"]

            }
            # if db_has_field(field_id, scenario_id, farm_id):
            #     update_field_results(field_id, scenario_id, farm_id, data,
            #                          False)
            # else:
            #     update_field_results(field_id, scenario_id, farm_id, data,
            #                          True)
            # update_field_dirty(field_id, scenario_id, farm_id)
            return_data.append(data)

        return JsonResponse(return_data, safe=False)
    except KeyError as e:
        error = str(e) + " while running models for field " + f_name
    except ValueError as e:
        error = str(e) + " while running models for field " + f_name
    except TypeError as e:
        print("type error")
        error = str(e) + " while running models for field " + f_name
    except FileNotFoundError as e:
        error = str(e)
    except Exception as e:
        error = str(e) + " while running models for field " + f_name
        print(type(e).__name__)
        print(traceback.format_exc())
        traceback.print_exc()
        # error = "Unexpected error:", sys.exc_info()[0]
        # error = "Unexpected error"
    print(error)
    # data = {
    #     # overall model type crop, ploss, bio, runoff
    #     "model_type": model_type,
    #     # specific model for runs with multiple models like corn silage
    #     "value_type": "dry lot",
    #     "f_name": f_name,
    #     "scen": scen,
    #     "scen_id": scenario_id,
    #     "field_id": field_id,
    #     "error": error
    # }
    # data = {
    #     # overall model type crop, ploss, bio, runoff
    #     "model_type": "test1",
    # }
    return JsonResponse(return_data, safe=False)
@login_required
@csrf_protect
def get_image(response):
    file_name = response.GET.get('file_name')
    file_path = os.path.join(settings.BASE_DIR, 'smartscape', 'data_files',
                             'raster_outputs', file_name)

    img = open(file_path, 'rb')

    response = FileResponse(img)

    return response
