from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
import re
import json
from django.http import FileResponse
import traceback
import uuid
from django.core.files import File
from django.conf import settings
import os
credential_path = os.path.join(settings.BASE_DIR,'keys','cals-grazescape-files-63e6-4f2fc53201e6.json')
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credential_path
# Create your views here.
from grazescape.raster_data import RasterData
from grazescape.model_defintions.infra_profile_tool import InfraTrueLength
from grazescape.model_defintions.feed_breakdown import HeiferFeedBreakdown
from grazescape.model_defintions.manage_raster_visuals import retreiveRaster
import json
from grazescape.model_defintions.grass_yield import GrassYield
from grazescape.model_defintions.generic import GenericModel
from grazescape.model_defintions.phosphorous_loss import PhosphorousLoss
from grazescape.model_defintions.crop_yield import CropYield
from grazescape.model_defintions.runoff import Runoff
from grazescape.model_defintions.insecticide import Insecticide
from grazescape.geoserver_connect import GeoServer
from grazescape.db_connect import *
from grazescape.users import *
from google.cloud import storage
import sys
import time
import sys
import shutil
import math
from datetime import datetime
#time elements
now =datetime.now()
dt_string = now.strftime("%d/%m/%Y%H:%M:%S")

#------------------------------------------
raster_data = None

def remove_old_pngs_from_local(model_type,field_id):
    images_folder_path = os.path.join(settings.BASE_DIR,'grazescape','static','grazescape','public','images')
    for filename in os.listdir(images_folder_path):
        print(filename)
        if model_type+field_id in filename:
            os.remove(os.path.join(images_folder_path,filename))
            print("Removed :"+ filename)
        else: 
            pass
def remove_old_pngs_gcs_storage_bucket(model_type,field_id):
    print('hi there')
    """Lists all the blobs in the bucket."""
    # bucket_name = "your-bucket-name"

    storage_client = storage.Client()
    #bucket = storage_client.bucket("dev_container_model_results")

    # Note: Client.list_blobs requires at least package version 1.17.0.
    blobs = storage_client.list_blobs("dev_container_model_results")
    for blob in blobs:
        print(blob.name)
        if str(model_type+field_id) in blob.name:
            try:
                blob.delete()
                print("Blob" + model_type+field_id+" deleted.")
            except:
                print("There was an error")
                pass

# Uploads model results to GCS bucket
def upload_gcs_model_result_blob(model_type,field_id,model_run_timestamp):
    """Uploads a file to the bucket."""
    source_file_name = os.path.join(settings.BASE_DIR,'grazescape','static','grazescape','public','images',model_type + field_id + '_' + model_run_timestamp + ".png")
    # The ID of your GCS object
    destination_blob_name = model_type + field_id + '_' + model_run_timestamp + ".png"
    storage_client = storage.Client()
    bucket = storage_client.bucket("dev_container_model_results")
    blob = bucket.blob(destination_blob_name)
    try:
        blob.upload_from_filename(source_file_name)
        print(
            "File {} uploaded to {}.".format(
                source_file_name, destination_blob_name
            )
        )
    except:
        print("THERE WAS AN ERROR WHILE UPLOADING "+ destination_blob_name)
        pass
# Downloads model results from GCS bucket
def download_gcs_model_result_blob(field_id,scen,active_scen,model_run_timestamp):
    """Downloads a blob from the bucket."""
    model_Types = ['yield', 'ploss','runoff']
    storage_client = storage.Client()
    bucket = storage_client.bucket("dev_container_model_results")
    blobs = storage_client.list_blobs("dev_container_model_results")
    for blob in blobs:
        for model in model_Types:
            if str(model+str(field_id)) in blob.name and str(scen) == str(active_scen):
                print("SCEN ACTIVE SCEN HIT!!!!!!!!")
                model_run_timestamp = blob.name[-17:-4]
                print(model_run_timestamp)
                print(blob.name)
                destination_file_name = os.path.join(settings.BASE_DIR,'grazescape','static','grazescape','public','images',blob.name)
                try:
                    blob.download_to_filename(destination_file_name)
                    print("Blob {} downloaded.".format(field_id))
                except:
                    print("There was an error")
                    pass
# Deletes model results from GCS bucket
def delete_gcs_model_result_blob(field_id):
    model_Types = ['yield', 'ploss','runoff', 'bio']
    storage_client = storage.Client()
    bucket = storage_client.bucket("dev_container_model_results")
    for model in model_Types:
        """Deletes a blob from the bucket."""
        blob = bucket.blob(model+field_id+'.png')
        try:
            blob.delete()
            print("Blob {} deleted.".format(field_id))
        except:
            print("There was an error")
            pass
# Used to set up heifer feed break down calculations 
@csrf_protect
@login_required
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
    print(cornSilageYield)

    toolName = HeiferFeedBreakdown(pastYield,cornYield,cornSilageYield,alfalfaYield,oatYield,totalheifers,
    breed,bred,daysOnPasture,asw,wgg)

    return JsonResponse({"output":toolName.calcFeed()})
#Runs true length for infra.  Uses DEM to get a profile of the traveled path to use to calculate the 
#distance over the terrian.
@ensure_csrf_cookie
@csrf_protect
@login_required
def run_InfraTrueLength(data):
    infraextent = data.POST.getlist('extents[]')
    infracords =  data.POST.getlist('cords[]')
    infraId = data.POST.get('infraID')
    infraLengthXY = data.POST.get('infraLengthXY')
    toolName = InfraTrueLength(infraextent,infracords,infraId,infraLengthXY)
    return JsonResponse({"output":toolName.profileTool()})
#Cleans data 
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
    return JsonResponse({"clean":"finished"})

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
    return JsonResponse({"download":"finished"})
#Makes post requests to WEI geoserver
@login_required
@csrf_protect
def geoserver_request(request):
    request_type = request.POST.get("request_type")
    pay_load = request.POST.get("pay_load")
    url = request.POST.get("url")
    #feature_id = request.POST.get("feature_id")
    feature_id = 9999
    #farm_2 = False
    # if "farm_2" in str(url):
    #     print("URL HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        #farm_2 = True
    geo = GeoServer(request_type, url)
    result = geo.makeRequest(pay_load)
    if "field_2" in pay_load and request_type == "delete":
        payloadstr = str(pay_load)
        resultdel = re.search('fid="field_2.(.*)"/>', payloadstr)
        print(resultdel.group(1))
        delete_gcs_model_result_blob(resultdel.group(1))
    #if request_type == "insert_farm" and feature_id != "" and "farm_2" in url :
    #if "farm_2" in str(url):
    if request_type == "insert_farm" and feature_id != "":
        
        #print("URL HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        
        #if request_type == "insert_farm":
        print('IN INSERT FARM!!!!!#######################!')
        #print(str(url))
    #if "farm_2" in str(url):
        #print('IN INSERT FARM!!!!!! MAKEREQUEST RESULTS RIGHT HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        print(result)
        
        resultstr = str(result)
        if "farm_2" in resultstr:
            pattern = 'farm_2.(.*?)"/>'
            feature_id = re.search(pattern,resultstr).group(1)
            print(feature_id)
        #feature_id = 9675

        #pull gid from the results text.  Also, find a way to limit the update_user_farms to only farm_2 inserts
        #currently gettin scenarios_2 as well.  After you get this right you should be able to see new farm
        #once you have that figured out you can find out how to see your farms when you open the app.
        #print(request.POST)
            update_user_farms(request.user.id, feature_id)

    if request_type == "source_farm":
        print("source Farm result!!!!!!!!")
        print(result)
        input_dict = json.loads(result)
        current_user = request.user
        #print("\n \n")
        features = input_dict["features"]
        farm_ids = get_user_farms(current_user.id)
        # Filter python objects with list comprehensions
        #print(features[0]["properties"])
        output_dict = [x for x in features if x["properties"]['gid'] in farm_ids]
        input_dict["features"] = output_dict
        # Transform python object back into json
        output_json = json.dumps(input_dict)
        result = output_json
        # print("source Farm result!!!!!!!!")
        # print(result)
    return JsonResponse({"data": result}, safe=False)
#Gets OM from OM raster layer
@login_required
def get_default_om(request):
    print(request.POST)
    field_id = file_name = str(uuid.uuid4())
    active_region = request.POST.getlist("active_region")[0]
    extents = request.POST.getlist("extents[]")
    print("the extents are ", extents)
    field_coors = []
    for coor in request.POST:
        if "coordinates" in coor:
            field_coors.append(request.POST.getlist(coor))
    print(field_coors)

    geo_data = RasterData(extents, field_coors, field_id, active_region,True, True)

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
#This gets the model results from the model results table
@login_required
@csrf_protect
def get_model_results(request):
    field_id = request.POST.getlist("field_id")[0]
    scenario_id = request.POST.getlist("scenario_id")[0]
    farm_id = request.POST.getlist("farm_id")[0]
    model_type = request.POST.get('model_parameters[model_type]')
    f_name = request.POST.get('model_parameters[f_name]')
    scen = request.POST.get('model_parameters[scen]')
    field_scen_id = request.POST.get('model_parameters[f_scen]')
    model_run_timestamp = request.POST.get('model_parameters[model_run_timestamp]')
    active_scen = request.POST.get('model_parameters[active_scen]')
    active_region = request.POST.get('model_parameters[active_region]')
    print('ACTIVE REGION IN GET MODEL RESULTS!!!!!!')
    print(active_region)
    print(request)
    db_has_field(field_id)
    if request.POST.getlist("runModels")[0] == 'false':
        print("not active scenario")
        download_gcs_model_result_blob(field_id,field_scen_id,active_scen,model_run_timestamp)
        """Downloads a blob from the bucket."""
        # model_Types = ['yield', 'ploss','runoff']
        storage_client = storage.Client()
        # bucket = storage_client.bucket("dev_container_model_results")
        blobs = storage_client.list_blobs("dev_container_model_results")
        for blob in blobs:
            if str(field_scen_id) == str(active_scen) and str(field_id) in blob.name:
                #namestring = blob.name
                print("SCEN ACTIVE SCEN HIT!!!!!!!!")
                # print(field_id)
                model_run_timestamp = blob.name[-17:-4]
                #runtimecollect = True
                print(model_run_timestamp)
            #print(blob.name)
            # for model in model_Types:
            #     if str(model+str(field_id)) in blob.name:
            #         destination_file_name = os.path.join(settings.BASE_DIR,'grazescape','static','grazescape','public','images',blob.name)
            #         blob = bucket.blob(model+field_id+'.png')
            #         try:
            #             blob.download_to_filename(destination_file_name)
            #             print("Blob {} downloaded.".format(field_id))
            #         except:
            #             print("There was an error while downloading from GCS")
            #             pass
        return JsonResponse(get_values_db(field_id,scenario_id,farm_id,request,model_run_timestamp), safe=False)
    field_coors = []
    if model_type == 'ploss':
        remove_old_pngs_from_local('ploss',field_id)
    if model_type == 'yield':
        remove_old_pngs_from_local('yield',field_id)
    if model_type == 'runoff':
        remove_old_pngs_from_local('runoff',field_id)
    # format field geometry
    for input in request.POST:
        if "field_coors" in input:
            field_coors.append(request.POST.getlist(input))
    try:
        geo_data = RasterData(request.POST.getlist("model_parameters[extent][]"), field_coors, field_id, active_region, False)
        clipped_rasters, bounds = geo_data.get_clipped_rasters()
        # geo_data.clean()
        if model_type == 'yield':
            #call row yeilds nulling function here!!!
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
            model = GenericModel(request, model_type)

        model.bounds["x"] = geo_data.bounds["x"]
        model.bounds["y"] = geo_data.bounds["y"]

        model.raster_inputs = clipped_rasters
        # loop here to build a response for all the model types
        results = model.run_model()
        if model_type == 'ploss':
            print("PLOSS RESULTS HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*************$$$$$$$")
            print(results)
        # result will be a OutputDataNode
        return_data = []
        # convert area from sq meters to acres
        area = float(request.POST.getlist("model_parameters[area]")[0])
        for result in results:
            if result.model_type == "insect":
                sum = result.data[0]
                avg = sum
                count = 1
                palette = []
                values_legend = []
            else:
                print(geo_data.bounds)
                print(result)
                avg, sum, count = model.get_model_png(result, geo_data.bounds, geo_data.no_data_aray)
                palette, values_legend = model.get_legend()
                if result.model_type == 'ero':
                #model_type == 'ero':
                    print('UPLOADING ERO FOR FIELD: '+field_id)
                    remove_old_pngs_gcs_storage_bucket("ero",field_id)
                    upload_gcs_model_result_blob("ero",field_id,model_run_timestamp)
                if result.model_type == 'ploss':
                    print('UPLOADING PLOSS FOR FIELD: '+field_id)
                    remove_old_pngs_gcs_storage_bucket("ploss",field_id)
                    upload_gcs_model_result_blob("ploss",field_id,model_run_timestamp)
                    #If you want to break out yield results by type, you will have to do if statements
                    #like if result.model_type == 'grass_yeild'/'soy_yield'/ ext ext
                if model_type == 'yield':
                    print('UPLOADING YIELD FOR FIELD: '+field_id)
                    remove_old_pngs_gcs_storage_bucket('yield',field_id)
                    upload_gcs_model_result_blob('yield',field_id,model_run_timestamp)
                if model_type == 'runoff':
                    print('UPLOADING RUNOFF FOR FIELD: '+field_id)
                    remove_old_pngs_gcs_storage_bucket('runoff',field_id)
                    upload_gcs_model_result_blob('runoff',field_id,model_run_timestamp)
            # dealing with rain fall data
            if type(sum) is not list:
                sum = round(sum, 2)
            # erosion and ploss should not be less than zero
            if model_type == 'ploss' and sum < 0:
                sum = 0
            data = {
                "extent": [*bounds],
                "palette": palette,
                "url": model.file_name + '_' + model_run_timestamp + ".png",
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
                "till": model.model_parameters["tillage"],
                "model_run_timestamp": model_run_timestamp
            }
            if db_has_field(field_id):
            # if db_has_field(field_id, scenario_id, farm_id):
                # if model_type == 'ploss':
                #     download_gcs_model_result_blob(field_id)
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
#Used to update the model results table when yields are adjusted.
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
    if data.get("crop_ro") == 'pt': #grass
        data2['value_type'] = str(data['value_type'][0])
        data2['sum_cells'] = str(data['sum_cells'][0])
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
        data2['value_type'] = 'Rotational Average'
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
    if data.get("crop_ro") == 'cc': #corn
        data2['value_type'] = str(data['value_type'][0])
        data2['sum_cells'] = str(data['sum_cells'][0])
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
        data2['value_type'] = 'Rotational Average'
        data2['sum_cells'] = str(float(data['sum_cells'][0]) * 56 * 0.855 / 2000)
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
    if data.get("crop_ro") == 'cg': #corn, soy
        data2['value_type'] = str(data['value_type'][0])
        data2['sum_cells'] = str(data['sum_cells'][0])
        corn_yield_kgDMha = float(data['sum_cells'][0]) * 56 * (1 - 0.155) / 2000
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
        data2['value_type'] = str(data['value_type'][1])
        data2['sum_cells'] = str(data['sum_cells'][1])
        soy_yield_kgDMha = float(data['sum_cells'][1]) * 60 * 0.792 * 0.9008 / 2000
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
        rotation_avg_cg = 0.5 * corn_yield_kgDMha + 0.5 * soy_yield_kgDMha
        data2['sum_cells'] =str(rotation_avg_cg)
        data2['value_type'] = 'Rotational Average'
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
    if data.get("crop_ro") == 'dr': #corn, silage, alfalfa
        data2['value_type'] = str(data['value_type'][0])
        data2['sum_cells'] = str(data['sum_cells'][0])
        corn_yield_kgDMha = float(data['sum_cells'][0]) * 56 * (1 - 0.155) / 2000
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
        data2['value_type'] = str(data['value_type'][1])
        data2['sum_cells'] = str(data['sum_cells'][1])
        silage_yield_kgDMha = float(data['sum_cells'][1]) * 2000 * (1 - 0.65) / 2000
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
        data2['value_type'] = str(data['value_type'][2])
        data2['sum_cells'] = str(data['sum_cells'][2])
        alfalfa_yield_kgDMha = float(data['sum_cells'][2]) * 2000 * (1 - 0.13) / 2000
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
        rotation_avg_dr = 1 / 5 * silage_yield_kgDMha + 1 / 5 * corn_yield_kgDMha + 3 / 5 * alfalfa_yield_kgDMha
        data2['sum_cells'] =str(rotation_avg_dr)
        data2['value_type'] = 'Rotational Average'
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
    if data.get("crop_ro") == 'cso': #soy, silage, oats
        data2['value_type'] = str(data['value_type'][0])
        data2['sum_cells'] = str(data['sum_cells'][0])
        soy_yield_kgDMha = float(data['sum_cells'][0]) * 60 * 0.792 * 0.9008 / 2000
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
        data2['value_type'] = str(data['value_type'][1])
        data2['sum_cells'] = str(data['sum_cells'][1])
        silage_yield_kgDMha = float(data['sum_cells'][1]) * 2000 * (1 - 0.65) / 2000
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
        data2['value_type'] = str(data['value_type'][2])
        data2['sum_cells'] = str(data['sum_cells'][2])
        oat_yield_kgDMha = float(data['sum_cells'][2]) * 32 * (1 - 0.14) / 2000
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
        rotation_avg_cso = 1 / 3 * silage_yield_kgDMha + 1 / 3 * soy_yield_kgDMha + 1 / 3 * oat_yield_kgDMha
        data2['sum_cells'] =str(rotation_avg_cso)
        data2['value_type'] = 'Rotational Average'
        update_field_results(data2["field_id"],data2['scen_id'],data2['farm_id'],data2,False)
    else: print('No fields were updated')
    return JsonResponse({"Adjustements":"finished"})

@csrf_protect
def get_image(response):
    file_name = response.GET.get('file_name')
    file_path = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files','raster_outputs',file_name)

    img = open(file_path, 'rb')

    response = FileResponse(img)

    return response





