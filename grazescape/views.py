from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_protect

from django.http import FileResponse
import traceback
import uuid

from django.core.files import File
from django.conf import settings
import os
# Create your views here.
from grazescape.raster_data import RasterData
from grazescape.model_defintions.infra_profile_tool import InfraTrueLength
from grazescape.model_defintions.feed_breakdown import HeiferFeedBreakdown
import json
from grazescape.model_defintions.grass_yield import GrassYield
from grazescape.model_defintions.generic import GenericModel
from grazescape.model_defintions.phosphorous_loss import PhosphorousLoss
from grazescape.model_defintions.crop_yield import CropYield
from grazescape.model_defintions.runoff import Runoff
from grazescape.model_defintions.insecticide import Insecticide
from grazescape.geoserver_connect import GeoServer
from grazescape.db_connect import *
import sys
import time
import sys
import shutil
import math

raster_data = None

def heiferFeedBreakDown(data):
    print(data.POST)
    #data being total pasture, corn, alfalfa, and oat yeilds.  
    #heifer numbers, breed, bred or unbred, days on pasture, average starting weight
    #and weight gain goals
    pastYield = data.POST.get('pastYield')
    cornYield = data.POST.get('cornYield')
    cornSilageYield = data.POST.get('cornSilageYield')
    alfalfaYield = data.POST.get('alfalfaYield')
    oatYield = data.POST.get('oatYield')
    totalheifers = data.POST.get('totalHeifers')
    breed = data.POST.get('heiferBreed')
    bred = data.POST.get('heiferBred')
    daysOnPasture = data.POST.get('heiferDOP')
    asw = data.POST.get('heiferASW')
    wgg = data.POST.get('heiferWGG')
    #print(type(asw))

    toolName = HeiferFeedBreakdown(pastYield,cornYield,cornSilageYield,alfalfaYield,oatYield,totalheifers,
    breed,bred,daysOnPasture,asw,wgg)

    return JsonResponse({"output":toolName.calcFeed()})
    #return JsonResponse({"feed_calc":"finished"})

def run_InfraTrueLength(data):
    print('here is the data')
    print('POST in VIEWS!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    print(data.POST)
    #infraId = []
    infraextent = data.POST.getlist('extents[]')
    infracords =  data.POST.getlist('infraCords[]')
    infraId = data.POST.get('infraId')
    print(infraId)
    print('infraextents in VIEWS!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    print(infraextent)
    print('infracords in VIEWS!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    print(infracords)
    toolName = InfraTrueLength(infraextent,infracords,infraId)

    print('run_infraTrueLength')
    #print(data)
    #return InfraTrueLength.featid.calc()
    return JsonResponse({"trueInfraDist":toolName.calc(),
    "output":toolName.calc()})

def clean_data(request):
    print("cleaning data")
    input_path = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files',
                              'raster_inputs')
    output_path = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files',
                               'raster_outputs')
    now = time.time()
    #
    for f in os.listdir(input_path):
        try:
            f = os.path.join(input_path, f)
            if os.stat(f).st_mtime < now - 3600:
                shutil.rmtree(f)
        except OSError as e:
            print("Error: %s : %s" % (f, e.strerror))
    for f in os.listdir(output_path):
        try:
            f = os.path.join(output_path, f)
            if os.stat(f).st_mtime < now - 3600:
                os.remove(os.path.join(output_path, f))
        except OSError as e:
            print("Error: %s : %s" % (f, e.strerror))
    clean_db()
    return JsonResponse({"clean":"finished"})


@csrf_protect
def index(request):
    context = {
        "my_color": {"test1":1234}
    }
    # Render the HTML template index.html with the data in the context variable
    return render(request, 'index.html', context=context)


@ensure_csrf_cookie
def download_rasters(request):
    field_id = request.POST.getlist("field_id")[0]
    field_coors = []

    for input in request.POST:
        if "field_coors" in input:
            field_coors.append(request.POST.getlist(input))
    geo_data = RasterData(request.POST.getlist("extent[]"),
                          field_coors, field_id, True)
    return JsonResponse({"download":"finished"})

@csrf_protect
def geoserver_request(request):
    request_type = request.POST.get("request_type")
    pay_load = request.POST.get("pay_load")
    url = request.POST.get("url")
    print(url)
    geo = GeoServer(request_type, url)
    result = geo.makeRequest(pay_load)
    return JsonResponse({"data": result}, safe=False)


def get_default_om(request):
    print(request.POST)
    field_id = file_name = str(uuid.uuid4())
    extents = request.POST.getlist("extents[]")
    print("the extents are ", extents)
    field_coors = []
    for coor in request.POST:
        if "coordinates" in coor:
            field_coors.append(request.POST.getlist(coor))
    print(field_coors)

    geo_data = RasterData(extents, field_coors, field_id, True, True)

    clipped_rasters, bounds = geo_data.get_clipped_rasters()
    print(clipped_rasters)
    om = clipped_rasters["om"].flatten()
    sum = 0
    count = 0
    for val in om:
        if val != geo_data.no_data:
            sum = sum + val
            count = count + 1
    print("average om is ", round(sum / count,2))
    return JsonResponse({"om": round(sum / count,2)}, safe=False)


@csrf_protect
def get_model_results(request):
    field_id = request.POST.getlist("field_id")[0]
    scenario_id = request.POST.getlist("scenario_id")[0]
    farm_id = request.POST.getlist("farm_id")[0]
    model_type = request.POST.get('model_parameters[model_type]')
    f_name = request.POST.get('model_parameters[f_name]')
    scen = request.POST.get('model_parameters[scen]')
    db_has_field(field_id, scenario_id, farm_id)

    if request.POST.getlist("runModels")[0] == 'false':
        print("not active scenario")
        return JsonResponse(get_values_db(field_id,scenario_id,farm_id,request), safe=False)
    field_coors = []
    # format field geometry
    for input in request.POST:
        if "field_coors" in input:
            field_coors.append(request.POST.getlist(input))
    try:
        geo_data = RasterData(request.POST.getlist("model_parameters[extent][]"), field_coors, field_id, False)
        # geo_data.load_layers()
        # geo_data.create_clip(field_coors)
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
        # elif model_type == 'ero':
        #     model = Erosion(request)
        elif model_type == 'runoff':
            model = Runoff(request)
        elif model_type == 'bio':
            model = Insecticide(request)
        else:
            model = GenericModel(request, model_type)

        model.bounds["x"] = geo_data.bounds["x"]
        model.bounds["y"] = geo_data.bounds["y"]

        model.raster_inputs = clipped_rasters
        # loop here to build a response for all the model types
        results = model.run_model()
        # result will be a OutputDataNode
        return_data = []
        # convert area from sq meters to acres
        area = float(request.POST.getlist("model_parameters[area]")[0])
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", area)
        for result in results:
            if result.model_type == "insect":
                sum = result.data[0]
                avg = sum
                count = 1
                palette = []
                values_legend = []
            else:
                avg, sum, count = model.get_model_png(result, geo_data.bounds, geo_data.no_data_aray)
                palette, values_legend = model.get_legend()
            # dealing with rain fall data
            if type(sum) is not list:
                sum = round(sum, 2)
            # erosion and ploss should not be less than zero
            if model_type == 'ploss' and sum < 0:
                sum = 0
            data = {
                "extent": [*bounds],
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
                "crop_ro": model.model_parameters["crop"],
                "grass_ro": model.model_parameters["rotation"],
                "grass_type": model.model_parameters["grass_type"],
                "till": model.model_parameters["tillage"]

            }
            if db_has_field(field_id, scenario_id, farm_id):
                update_field_results(field_id, scenario_id, farm_id, data, False)
            else:
                update_field_results(field_id, scenario_id, farm_id, data, True)
            update_field_dirty(field_id, scenario_id, farm_id)
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
        traceback.print_exc()
        # error = "Unexpected error:", sys.exc_info()[0]
        # error = "Unexpected error"
    print(error)
    data = {
        # overall model type crop, ploss, bio, runoff
        "model_type": model_type,
        # specific model for runs with multiple models like corn silage
        "value_type": "dry lot",
        "f_name": f_name,
        "scen": scen,
        "scen_id": scenario_id,
        "field_id": field_id,
        "error": error
    }
    return JsonResponse([data], safe=False)
@csrf_protect
def get_image(response):
    file_name = response.GET.get('file_name')
    file_path = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files','raster_outputs',file_name)

    img = open(file_path, 'rb')

    response = FileResponse(img)

    return response





