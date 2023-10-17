from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .filemodels import FileModel
from django.http import FileResponse
import traceback
import uuid
import numpy as np
from grazescape.raster_data import RasterData
from grazescape.model_defintions.infra_profile_tool import InfraTrueLength
from grazescape.model_defintions.econ import Econ
from grazescape.model_defintions.feed_breakdown import HeiferFeedBreakdown
from grazescape.model_defintions.manage_raster_visuals import retreiveRaster
import json
from grazescape.model_defintions.model_base import OutputDataNode
from grazescape.model_defintions.grass_yield import GrassYield
from grazescape.model_defintions.phosphorous_loss import PhosphorousLoss
from grazescape.model_defintions.erosion import Erosion
from grazescape.model_defintions.crop_yield import CropYield
from grazescape.model_defintions.dry_lot import DryLot
from grazescape.model_defintions.calc_manure_p import CalcManureP
from grazescape.model_defintions.runoff import Runoff
from grazescape.model_defintions.nitrate_leach import NitrateLeeching
from grazescape.model_defintions.insecticide import Insecticide
from grazescape.model_defintions.soil_condition_index import SoilIndex

from grazescape.geoserver_connect import GeoServer
from grazescape.multiprocessing_helper import run_parallel
from grazescape.db_connect import *
from grazescape.users import *
from google.cloud import storage
import pandas as pd
import json as js
import geopandas as gpd
import fiona as fiona
import sys
import time
import sys
import shutil
import math
from datetime import datetime
from grazescape.png_handler import PngHandler as pgh
import tracemalloc

credential_path = os.path.join(settings.BASE_DIR, 'keys', 'cals-grazescape-files-63e6-4f2fc53201e6.json')
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credential_path
# time elements
now = datetime.now()
dt_string = now.strftime("%d/%m/%Y%H:%M:%S")

# ------------------------------------------
raster_data = None
eroDatum = []


def uploadindex(request):
    return render(template_name="uploadindex.html", request=request)


def upload_file(request):
    print("FILES")
    files = request.FILES
    print(len(files))
    print(files)
    file1 = request.FILES.get("shapefile0")
    # file2 = request.FILES.get("shapefile2")
    try:
        filename = file1.name
        scenario_id = request.POST.get("scenario_id")
        farm_id = request.POST.get("farm_id")
        print("INSIDEUPLOAD!")
        print("scenario_id: " + scenario_id)
        print("farm_id: " + farm_id)
        # data = ContentFile(base64.b64decode(file), name= file.name)
        # FileModel.objects.create(doc=data)

        # enumeartes the incoming shpfiles file titles.
        for count, file in enumerate(files):
            FileModel.objects.create(doc=request.FILES.get("shapefile" + str(count + 1)))

        filename_fixed = filename[:-3] + 'shx'
        print("IN COORD PULL SHAPEFILE!!!!!!")
        print(filename_fixed)
        print(scenario_id)
        print(farm_id)
        shp_file_name = os.path.join(settings.BASE_DIR, 'media', 'media', filename_fixed)
        # opens uploaded shapefile using GDAL module fiona
        shape = fiona.open(shp_file_name)
        # pulls out coordinates from shapefile fiona read
        coords = [np.array(poly['geometry']['coordinates'])
                  for poly in shape.values()]
        # sends coords to the backend insert function in db_connect.py
        insert_shpfile_coords(scenario_id, farm_id, coords)
        return JsonResponse({"Insert": "Upload Complete upload_file"})

    except:
        print("in upload error handling")
        # message = "The request is not valid.  upload_files"
        # what is the most appropriate way to pass both error status and custom message
        # How do I list all possible error types here (instead of ExpectedError to make the exception handling block as DRY and reusable as possible
        return JsonResponse({'status': 'false'})
        # return('message')


def upload_file_test(request):
    if request.method == "POST":
        post = request.POST
        file_data = request.POST.get("file")
        filetest = request.FILES.get("file")
        # farm_id = request.POST.get("farm_id")
        print(filetest)
        # print(farm_id)
        uploaded_file = request.FILES
        print(file_data)
        # print(uploaded_file.size)
    # return render(request, 'upload.html')
    return JsonResponse({"Insert": "Complete"})


# Used to set up heifer feed break down calculations
def field_png_lookup(request):
    print("POST!!!!!!!!!!!")
    print(request.POST.getlist('model_field[]')[0])
    try:
        # starts_with = 'ploss791'
        starts_with = request.POST.getlist('model_field[]')[0]
        print(starts_with)
        source_folder = os.path.join(settings.BASE_DIR, 'grazescape', 'static', 'grazescape', 'public', 'images')
        for file in os.listdir(source_folder):
            if file.startswith(starts_with):
                print("FOUND MODELFILE!!!!!!!")
                filestr = str(file)
                print(filestr)
                return (JsonResponse([filestr], safe=False))
    except AttributeError:
        pass
    # Downloads model results from GCS bucket


@csrf_protect
@login_required
def heiferFeedBreakDown(data):
    print(data.POST)
    # data being total pasture, corn, alfalfa, and oat yeilds.
    # heifer numbers, breed, bred or unbred, days on pasture, average starting weight
    # and weight gain goals
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
    print(cornSilageYield)

    toolName = HeiferFeedBreakdown(pastYield, cornYield, cornSilageYield, alfalfaYield, oatYield, totalheifers,
                                   breed, bred, daysOnPasture, asw, wgg)

    return JsonResponse({"output": toolName.calcFeed()})


# Runs true length for infra.  Uses DEM to get a profile of the traveled path to use to calculate the
# distance over the terrian.
@ensure_csrf_cookie
@csrf_protect
@login_required
def run_InfraTrueLength(data):
    infraextent = data.POST.getlist('extents[]')
    infracords = data.POST.getlist('cords[]')
    infraId = data.POST.get('infraID')
    infraLengthXY = data.POST.get('infraLengthXY')
    toolName = InfraTrueLength(infraextent, infracords, infraId, infraLengthXY)
    return JsonResponse({"output": toolName.profileTool()})


# Cleans data
@login_required
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
    # get_users()
    return JsonResponse({"clean": "finished"})


@csrf_protect
@login_required
def index(request):
    current_user = request.user
    print(current_user.id)
    farm_ids = get_user_farms(current_user.id)
    print(farm_ids)
    print(current_user.id)
    print(request)
    print(request.user)
    print(request.user.id)
    context = {
        "param": {"farm_ids": farm_ids}
    }
    # Render the HTML template index.html with the data in the context variable
    return render(request, 'index.html', context=context)


# Downloads raster from Geoserver
@ensure_csrf_cookie
@login_required
def download_rasters(request):
    field_id = request.POST.getlist("field_id")[0]
    active_region = request.POST.getlist("active_region")[0]
    field_coors = []
    if db_has_field(field_id):
        clear_yield_values(field_id)
    for input in request.POST:
        if "field_coors" in input:
            field_coors.append(request.POST.getlist(input))
    geo_data = RasterData(request.POST.getlist("extent[]"),
                          field_coors, field_id, active_region, True)
    return JsonResponse({"download": "finished"})


# Makes post requests to WEI geoserver
@login_required
@csrf_protect
def outside_geojson_coord_pull(request):
    scenario_id = request.POST.get("scenario_id")
    farm_id = request.POST.get("farm_id")
    file_data = request.POST.get("file_data")
    print(file_data)
    # Sends data to the insert json coords function in db_connect.py
    insert_json_coords(scenario_id, farm_id, file_data)
    return JsonResponse({"Insert": "Complete outside_geojson_coord_pull"})


def outside_shpfile_coord_pull(filename, scenario_id, farm_id):
    filename_fixed = filename[:-3] + 'shx'
    print("IN COORD PULL SHAPEFILE!!!!!!")
    print(filename_fixed)
    print(scenario_id)
    print(farm_id)
    try:
        shp_file_name = os.path.join(settings.BASE_DIR, 'media', 'media', filename_fixed)
        shape = fiona.open(shp_file_name)
        print("FIONA SCHEMA!!!!!!")
        # print(shape.schema)
        coords = [np.array(poly['geometry']['coordinates'])
                  for poly in shape.values()]
        insert_shpfile_coords(scenario_id, farm_id, coords)
        return JsonResponse({"Insert": "shp Coord pull Complete"})
    except:
        print("I will print this line of code if an error is encountered outside_shpfile_coord_pull")
        message = "The request is not valid."
        return JsonResponse({'status': 'false', 'message': message}, status=500)
    # scenario_id = request.POST.get("scenario_id")
    # farm_id = request.POST.get("farm_id")
    # file_data = request.POST.get("file_data")
    # file_data = os.path.join(settings.BASE_DIR,'grazescape','static','grazescape','public','shapeFiles','TestField.shp')
    # readfile = gpd.read_file(os.path.join(settings.BASE_DIR,'grazescape','static','grazescape','public','shapeFiles','TestField.dbf'))


def geoserver_request(request):
    request_type = request.POST.get("request_type")
    # print("GEOSERVER REQUEST TYPE")
    # print(request_type)
    # print(request.POST)
    pay_load = request.POST.get("pay_load")
    url = request.POST.get("url")
    feature_id = request.POST.get("feature_id")
    # feature_id = 9999
    print("GEOSERVER feature_id")
    print(feature_id)
    current_user = request.user
    farm_ids = get_user_farms(current_user.id)
    # farm_2 = False
    # if "farm_2" in str(url):
    #     print("URL HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    # farm_2 = True
    geo = GeoServer(request_type, url)
    result = geo.makeRequest(pay_load)
    # LIMIT RETURN TO FRONT END TO ONLY FEATUERES OWNED BY USER
    if request_type == "source":
        input_dict = json.loads(result)
        features = input_dict["features"]
        output_dict = [x for x in features if x["properties"]['farm_id'] in farm_ids]
        input_dict["features"] = output_dict
        output_json = json.dumps(input_dict)
        result = output_json
    if "field_2" in pay_load and request_type == "delete":
        payloadstr = str(pay_load)
        resultdel = re.search('fid="field_2.(.*)"/>', payloadstr)

        # PngHandler seems to be missing from PngHandler script ask Matt about that
        png_handler = pgh
        try:
            png_handler.delete_gcs_model_result_blob(resultdel.group(1))
        except:
            print(
                "png_handler.delete_gcs_model_result_blob(resultdel.group(1)) failed likely due to no png in cloud for this field")
    # if request_type == "insert_farm" and feature_id != "" and "farm_2" in url :
    # if "farm_2" in str(url):

    if request_type == "insert_farm":


        resultstr = str(result)
        if "farm_2" in resultstr:
            pattern = 'farm_2.(.*?)"/>'
            feature_id = re.search(pattern, resultstr).group(1)
            # feature_id = 9675

            # pull gid from the results text.  Also, find a way to limit the update_user_farms to only farm_2 inserts
            # currently gettin scenarios_2 as well.  After you get this right you should be able to see new farm
            # once you have that figured out you can find out how to see your farms when you open the app.
            # print(request.POST)
            update_user_farms(request.user.id, feature_id)

    if request_type == "source_farm":

        input_dict = json.loads(result)
        # current_user = request.user
        features = input_dict["features"]
        # farm_ids = get_user_farms(current_user.id)
        # Filter python objects with list comprehensions

        output_dict = [x for x in features if x["properties"]['gid'] in farm_ids]
        input_dict["features"] = output_dict
        # Transform python object back into json
        output_json = json.dumps(input_dict)
        result = output_json

    return JsonResponse({"data": result}, safe=False)


# Gets OM from OM raster layer
@login_required
def get_default_om(request):
    field_id = str(uuid.uuid4())
    active_region = request.POST.getlist("active_region")[0]
    extents = request.POST.getlist("extents[]")
    field_coors = []
    for coor in request.POST:
        if "coordinates" in coor:
            field_coors.append(request.POST.getlist(coor))

    geo_data = RasterData(extents, field_coors, field_id, active_region, True, True)

    clipped_rasters, bounds = geo_data.get_clipped_rasters()
    om = clipped_rasters["om"].flatten()
    sum = 0
    count = 0
    for val in om:
        if val != geo_data.no_data:
            sum = sum + val
            count = count + 1
    avg_val = sum / count
    if avg_val > 20:
        avg_val = 20
    return JsonResponse({"om": round(avg_val, 2)}, safe=False)


# This gets the model results from the model results table
def get_P_Manure_Results(request, clipped_rasters):
    try:
        P_Manure_Model = CalcManureP(request)
        P_Manure_Model.raster_inputs = clipped_rasters
        p_Manure_Results = P_Manure_Model.run_model()
        return p_Manure_Results
    except KeyError as e:
        error = str(e) + " while running models for field "
    except ValueError as e:
        error = str(e) + " while running models for field "
    except TypeError as e:
        print("type error")
        error = str(e) + " while running models for field "
    except FileNotFoundError as e:
        error = str(e)

    except Exception as e:
        error = str(e) + " while running models for field "
        print(type(e).__name__)
        traceback.print_exc()
    print(error)
    data = {
        # overall model type crop, ploss, bio, runoff
        "error": error
    }
    # return JsonResponse([data], safe=False)
    return []


def get_model_results(request):
    print("starting model request")
    tracemalloc.start()
    start = time.time()
    png_handler = pgh()
    field_id = request.POST.getlist("field_id")[0]  # str(request_json["field_id"])
    scenario_id = request.POST.getlist("scenario_id")[0]  # request_json["scenario_id"]
    farm_id = request.POST.getlist("farm_id")[0]
    model_type = request.POST.get('model_parameters[model_type]')
    f_name = request.POST.get('model_parameters[f_name]')
    scen = request.POST.get('model_parameters[scen]')
    field_scen_id = request.POST.get('model_parameters[f_scen]')
    model_run_timestamp = request.POST.get('model_parameters[model_run_timestamp]')
    active_scen = request.POST.get('model_parameters[active_scen]')
    active_region = request.POST.get('model_parameters[active_region]')
    field_coors = []

    png_handler.remove_old_pngs_from_local(field_id)
    for input in request.POST:
        if "field_coors" in input:
            field_coors.append(request.POST.getlist(input))
    geo_data = RasterData(request.POST.getlist('model_parameters[extent][]'), field_coors, field_id, active_region,
                          False)

    clipped_rasters, bounds = geo_data.get_clipped_rasters()
    print("done downloading ", time.time() - start)
    p_manure_Results = get_P_Manure_Results(request, clipped_rasters)
    is_grass = False
    model_grass1 = None
    model_grass2 = None
    try:
        field_exists = db_has_field(field_id)

        crop_ro = request.POST.get('model_parameters[crop]')
        if crop_ro == 'pt' or crop_ro == 'ps':
            # create models for each of our grass types
            model_yield_blue = GrassYield(request, active_region)
            model_yield_orch = GrassYield(request, active_region)
            model_yield_tim = GrassYield(request, active_region)
            print("model parameters", model_yield_blue.model_parameters)
            # figure out which model the user has actually selected
            if 'bluegrass' in model_yield_blue.model_parameters["grass_type"].lower():
                model_yield_blue.main_type = True
                model_yield = model_yield_blue
                model_grass1 = model_yield_orch
                model_grass2 = model_yield_tim
            elif 'orchard' in model_yield_blue.model_parameters["grass_type"].lower():
                model_yield_orch.main_type = True
                model_yield = model_yield_orch
                model_grass1 = model_yield_blue
                model_grass2 = model_yield_tim
            elif 'timothy' in model_yield_blue.model_parameters["grass_type"].lower():
                model_yield_tim.main_type = True
                model_yield = model_yield_tim
                model_grass1 = model_yield_orch
                model_grass2 = model_yield_blue

            model_yield_blue.grass_type = "Bluegrass-clover"
            model_yield_orch.grass_type = "Orchardgrass-clover"
            model_yield_tim.grass_type = "Timothy-clover"
            model_grass1.raster_inputs = clipped_rasters
            model_grass2.raster_inputs = clipped_rasters
            is_grass = True
        elif crop_ro == 'dl':
            model_yield = DryLot(request, active_region)
        else:
            model_yield = CropYield(request, active_region)
        model_rain = Runoff(request, active_region)
        model_rain.raster_inputs = clipped_rasters
        model_insect = Insecticide(request)
        model_insect.raster_inputs = clipped_rasters
        model_econ = Econ(request)
        model_econ.raster_inputs = clipped_rasters

        model_ero = Erosion(request, active_region)
        model_ero.raster_inputs = clipped_rasters
        model_phos = PhosphorousLoss(request, active_region)
        model_phos.raster_inputs = clipped_rasters
        model_nit = NitrateLeeching(request, active_region)
        model_nit.raster_inputs = clipped_rasters
        model_sci = SoilIndex(request, active_region)
        model_sci.raster_inputs = clipped_rasters

        model_yield.bounds["x"] = geo_data.bounds["x"]
        model_yield.bounds["y"] = geo_data.bounds["y"]

        model_yield.raster_inputs = clipped_rasters
        # loop here to build a response for all the model types
        print("models start running ", time.time() - start)
        results = []
        if model_type == 'yield':
            results = run_parallel(model_yield, model_rain, model_ero, model_phos, model_nit, p_manure_Results,
                                   model_sci, model_grass1, model_grass2)

            econ_results = model_econ.run_model()
            insect_results = model_insect.run_model()
            results.append(econ_results[0])
            results.append(insect_results[0])

        return_data = []
        # convert area from sq meters to acres
        area = float(request.POST.get('model_parameters[area]'))
        # probably use threads here and use numpy in the png creation
        print("models done running ", time.time() - start)
        for result in results:

            if result.model_type == "insect" or result.model_type == "econ":
                sum = result.data[0]
                avg = sum
                count = 1
                palette = []
                values_legend = []

            else:

                avg, sum, count = model_yield.get_model_png(result, geo_data.bounds, geo_data.no_data_aray)
                palette, values_legend = model_yield.get_legend()
                # this part takes about 45% of the total time

            # dealing with rain fall data
            if type(sum) is not list:
                sum = round(sum, 2)
            if "grass_matrix_Bluegrass-clover" == result.model_type or \
                    "grass_matrix_Orchardgrass-clover" == result.model_type or \
                    "grass_matrix_Timothy-clover" == result.model_type:
                data = {"model_type": result.model_type, "avg": round(avg, 2), "type": "grassMatrix","f_name": f_name,"scen": scen,}
                return_data.append(data)
                continue
            if "Grass" == result.model_type:
                data = {"model_type": "grass_matrix_" + model_yield.model_parameters["grass_type"],
                        "avg": round(avg, 2), "type": "grassMatrix", "f_name": f_name,"scen": scen,}
                return_data.append(data)

            data = {
                "extent": [*bounds],
                "palette": palette,
                "url": model_yield.file_name + '_' + model_run_timestamp + ".png",
                "values": values_legend,
                "units": result.default_units,
                "units_alternate": result.alternate_units,
                "title": result.default_title,
                "title_alternate": result.alternate_title,
                # "units_alternate_2": result.alternate_units_2,
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
                "crop_ro": model_yield.model_parameters["crop"],
                "grass_ro": model_yield.model_parameters["rotation"],
                "grass_type": model_yield.model_parameters["grass_type"],
                "till": model_yield.model_parameters["tillage"],
                "model_run_timestamp": model_run_timestamp,
                "p_manure_Results": p_manure_Results
            }

            return_data.append(data)
        print("Results Loop Done ", time.time() - start)
        # update_field_dirty(field_id, scenario_id, farm_id)
        # png_handler.remove_pngs(field_id, model_run_timestamp)

        # png_handler.upload_gcs_model_result_blob(field_id, model_run_timestamp)
        print("done with models ", time.time() - start)
        return JsonResponse(return_data, safe=False)
    except KeyError as e:
        error = str(e) + " while running models for field " + f_name
        traceback.print_exc()

    except ValueError as e:
        error = str(e) + " while running models for field " + f_name
        print("type error")
        traceback.print_exc()
    except TypeError as e:
        traceback.print_exc()
        error = str(e) + " while running models for field " + f_name
    except FileNotFoundError as e:
        error = str(e)
        traceback.print_exc()
    except Exception as e:
        print("start of error **********************")
        error = str(e) + " while running models for field " + f_name
        print(type(e).__name__)

        traceback.print_exc()
        print("end of error*************************")
    finally:
        print("start of error **********************")
        # print(type(e).__name__)

        traceback.print_exc()
        print("end of error*************************")
        snapshot = tracemalloc.take_snapshot()
        top_stats = snapshot.statistics('lineno')

        print("[ Top 10 ]")
        for stat in top_stats[:10]:
            print(stat)
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


# Used to update the model results table when yields are adjusted.
@login_required
@csrf_protect
def adjust_field_yields(yield_data):
    print('INSIDE ADJUST FIELD YIELDS!!!!!!!&&&&&&$$$$$$&&&#&&#&#&#&#&#&#&')
    data = {
        "area": yield_data.POST.get('area'),
        "value_type": yield_data.POST.getlist('yieldTypes[]'),
        "f_name": yield_data.POST.get('name'),
        "scen": yield_data.POST.get('scenName'),
        "counted_cells": yield_data.POST.get('cellCount'),
        "sum_cells": yield_data.POST.getlist('cellSums[]'),
        "farm_id": yield_data.POST.get('farmId'),
        "scen_id": yield_data.POST.get('scenId'),
        "field_id": yield_data.POST.get('id'),
        "crop_ro": yield_data.POST.get('rotationVal1'),
        "grass_ro": yield_data.POST.get('rotationVal2'),
        "grass_type": yield_data.POST.get('grassType'),
        "till": yield_data.POST.get('till'),
    }
    data2 = {
        "area": yield_data.POST.get('area'),
        "value_type": yield_data.POST.getlist('yieldTypes[]'),
        "f_name": yield_data.POST.get('name'),
        "scen": yield_data.POST.get('scenName'),
        "counted_cells": yield_data.POST.get('cellCount'),
        "sum_cells": yield_data.POST.getlist('cellSums[]'),
        "farm_id": yield_data.POST.get('farmId'),
        "scen_id": yield_data.POST.get('scenId'),
        "field_id": yield_data.POST.get('id'),
        "crop_ro": yield_data.POST.get('rotationVal1'),
        "grass_ro": yield_data.POST.get('rotationVal2'),
        "grass_type": yield_data.POST.get('grassType'),
        "till": yield_data.POST.get('till'),
    }
    if data.get("crop_ro") == 'pt':  # grass
        data2['value_type'] = str(data['value_type'][0])
        data2['sum_cells'] = str(data['sum_cells'][0])
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
        data2['value_type'] = 'Rotational Average'
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
    if data.get("crop_ro") == 'cc':  # corn
        data2['value_type'] = str(data['value_type'][0])
        data2['sum_cells'] = str(data['sum_cells'][0])
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
        data2['value_type'] = 'Rotational Average'
        data2['sum_cells'] = str(float(data['sum_cells'][0]) * 56 * 0.855 / 2000)
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
    if data.get("crop_ro") == 'cg':  # corn, soy
        data2['value_type'] = str(data['value_type'][0])
        data2['sum_cells'] = str(data['sum_cells'][0])
        corn_yield_tonDMac = float(data['sum_cells'][0]) * 56 * (1 - 0.155) / 2000
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
        data2['value_type'] = str(data['value_type'][1])
        data2['sum_cells'] = str(data['sum_cells'][1])
        soy_yield_tonDMac = float(data['sum_cells'][1]) * 60 * 0.792 * 0.9008 / 2000
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
        rotation_avg_cg = 0.5 * corn_yield_tonDMac + 0.5 * soy_yield_tonDMac
        data2['sum_cells'] = str(rotation_avg_cg)
        data2['value_type'] = 'Rotational Average'
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
    if data.get("crop_ro") == 'dr':  # corn, silage, alfalfa
        data2['value_type'] = str(data['value_type'][0])
        data2['sum_cells'] = str(data['sum_cells'][0])
        corn_yield_tonDMac = float(data['sum_cells'][0]) * 56 * (1 - 0.155) / 2000
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
        data2['value_type'] = str(data['value_type'][1])
        data2['sum_cells'] = str(data['sum_cells'][1])
        silage_yield_tonDMac = float(data['sum_cells'][1]) * 2000 * (1 - 0.65) / 2000
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
        data2['value_type'] = str(data['value_type'][2])
        data2['sum_cells'] = str(data['sum_cells'][2])
        alfalfa_yield_tonDMac = float(data['sum_cells'][2]) * 2000 * (1 - 0.13) / 2000
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
        rotation_avg_dr = 1 / 5 * silage_yield_tonDMac + 1 / 5 * corn_yield_tonDMac + 3 / 5 * alfalfa_yield_tonDMac
        data2['sum_cells'] = str(rotation_avg_dr)
        data2['value_type'] = 'Rotational Average'
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
    if data.get("crop_ro") == 'cso':  # soy, silage, oats
        data2['value_type'] = str(data['value_type'][0])
        data2['sum_cells'] = str(data['sum_cells'][0])
        soy_yield_tonDMac = float(data['sum_cells'][0]) * 60 * 0.792 * 0.9008 / 2000
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
        data2['value_type'] = str(data['value_type'][1])
        data2['sum_cells'] = str(data['sum_cells'][1])
        silage_yield_tonDMac = float(data['sum_cells'][1]) * 2000 * (1 - 0.65) / 2000
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
        data2['value_type'] = str(data['value_type'][2])
        data2['sum_cells'] = str(data['sum_cells'][2])
        oat_yield_tonDMac = float(data['sum_cells'][2]) * 32 * (1 - 0.14) / 2000
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
        rotation_avg_cso = 1 / 3 * silage_yield_tonDMac + 1 / 3 * soy_yield_tonDMac + 1 / 3 * oat_yield_tonDMac
        data2['sum_cells'] = str(rotation_avg_cso)
        data2['value_type'] = 'Rotational Average'
        update_field_results(data2["field_id"], data2['scen_id'], data2['farm_id'], data2, False)
    else:
        print('No fields were updated')
    return JsonResponse({"Adjustements": "finished"})


@csrf_protect
def get_image(response):
    file_name = response.GET.get('file_name')
    file_path = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files', 'raster_outputs', file_name)
    img = open(file_path, 'rb')
    response = FileResponse(img)
    return response


def get_results_image(response):
    file_name = response.GET.get('file_name')
    file_path = os.path.join(settings.BASE_DIR, 'grazescape', 'static', 'grazescape', 'public', 'images', file_name)
    # img = open(file_path, 'r')
    response = FileResponse(file_path)
    return response


def get_field_rot_defaults(response):
    default_table = pd.read_csv(r"grazescape/static/grazescape/public/default_reference_tables/fertilzerDefaults.csv")
    rotation = response.POST.get("rotation")
    legumeBol = response.POST.get("legume")
    legume = ''
    if (legumeBol == 'true'):
        legume = 'yes'
    else:
        legume = 'no'
    print(response.POST)
    print(legume)
    if (rotation == "pt-cn" or rotation == "pt-rt"):
        default_table_DF = default_table[default_table["rotation"] == "pt"]
        default_table_row = pd.concat([default_table_DF[default_table["legume"] == legume]])
        manureN = float(default_table_row["manureN"])
        fertN = float(default_table_row["fertN"])
        fertP = float(default_table_row["fertP"])
        return JsonResponse({"fertDefaults": [manureN, fertN, fertP]})
    else:
        default_table_row = pd.concat([default_table[default_table["rotation"] == rotation]])
        manureN = float(default_table_row["manureN"])
        fertN = float(default_table_row["fertN"])
        fertP = float(default_table_row["fertP"])
        return JsonResponse({"fertDefaults": [manureN, fertN, fertP]})
    # default_table_row = default_table[default_table["rotation"] ==rotation]
    # # img = open(file_path, 'r')
    # response = FileResponse(file_path)
    # return response
