from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import FileResponse
from django.core.files import File
from django.conf import settings
import os
# Create your views here.
import grazescape.raster_data_local as rd
from grazescape.raster_data import RasterData
import json
from grazescape.model_defintions.grass_yield import GrassYield
from grazescape.model_defintions.generic import GenericModel
from grazescape.model_defintions.phosphorous_loss import PhosphorousLoss
from grazescape.model_defintions.erosion import Erosion
from grazescape.model_defintions.crop_yield import CropYield

raster_data = None


def load_data(request):
    global raster_data
    print("Loading data!!")
    raster_data = RasterData([-20117712.22501242, 4382245.47625754, 10117334.07055232, 6382523.44235636])
    raster_data.load_layers()
    # raster_data = rd.RasterData()
    # message = "pickle"
    # # http: // localhost: 8000 / grazescape / load_data?load_txt = true
    # if request.GET.get("load_txt"):
    #     print("Raster CSV")
    #     message = 'csv'
    #     raster_data.load_raster_csv()
    # raster_data.load_raster_pickle()
    # print("loaded pickle")
    # if 'ls' not in raster_data.get_raster_data():
    #     print("create ls")
    #     raster_data.create_ls_file()

    return HttpResponse("data loaded")


def index(request):
    context = {

    }
    # Render the HTML template index.html with the data in the context variable
    return render(request, 'index.html', context=context)


def chart(request):
    print(request.GET)
    print(request.POST)
    data = json.loads(request.GET.get('data'))
    labels = json.loads(request.GET.get('labels'))
    print(data)
    print(data[0])
    package = {"data":data,"labels":labels}
    # package = json.dumps(package)
    return render(request, 'chart.html', context={"my_data":package})


@ensure_csrf_cookie
def get_model_results(request):
    global raster_data
    print("running model")
    extents = request.POST.getlist('extents[]')
    print(request.POST)
    model_type = request.POST.get('model_parameters[model_type]')
    values = []
    if model_type == 'grass':
        print("grass")
        if request.POST.getlist('model_parameters[grass_type]')[0].lower() != "":
            model = GrassYield(request)
        else:
            return JsonResponse({"error": "No valid model selected"})
    elif model_type == 'pl':
        model = PhosphorousLoss(request)
    elif model_type == 'ero':
        model = Erosion(request)
    elif model_type == 'crop':
        print("crop")
        if request.POST.getlist('model_parameters[crop]')[0] == 'corn':
            print("corn")
            model = CropYield(request, "corn_output")
    else:
        model = GenericModel(request, model_type)

    field_coors = []
    # format field geometry
    for input in request.POST:
        if "field_coors" in input:
            field_coors.append(request.POST.getlist(input))
    geo_data = RasterData(request.POST.getlist("model_parameters[extent][]"))
    geo_data.load_layers()
    geo_data.create_clip(field_coors)
    clipped_rasters, bounds = geo_data.clip_raster()

    model.bounds["x"] = geo_data.bounds["x"]
    model.bounds["y"] = geo_data.bounds["y"]
    # print("Calculating Extents")
    # extents, rounded_extents = model.to_raster_space(extents)
    # print("Clipping Extents")
    # clipped_rasters, bounds = model.clip_input(extents, raster_data.get_raster_data())



    print("Preparing model input")
    model.write_model_input(clipped_rasters)
    print("Running model")
    results = model.run_model()
    # avg = model.aggregate(results)
    print("Creating png")
    avg = model.get_model_png(results, geo_data.bounds, geo_data.no_data_aray)
    # for cat in color_ramp:
    #     values.append(cat[1])
    print(model.file_name)
    palette, values = model.get_legend()
    data = {
        # "extent": rounded_extents,
        "extent": [*bounds],
        "model-results": "None",
        "palette": palette,
        "url": model.file_name + ".png",
        "values": values,
        "avg": avg,
        "units": model.get_units()
    }
    print(data)


    print("Displaying model")
    return JsonResponse(data)

def get_image(response):
    print(response.GET.get('file_name'))
    file_name = response.GET.get('file_name')
    file_path = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files','raster_outputs',file_name)

    img = open(file_path, 'rb')

    response = FileResponse(img)

    return response


def point_elevations(request):
    global raster_data
    # print("calc distance")
    print(request.POST)
    # print(request.POST.get('points'))
    # print(request.POST.getlist('points'))
    # print(request.POST.getlist('points[]'))
    # print(request.POST.getlist('points[1][]'))
    elevations = raster_data.get_raster_data()['elevation']
    coor_ele = []
    for point in request.POST:
        if "points" in point:

            print(request.POST.getlist(point))
            coor = request.POST.getlist(point)
            local_coor = to_local_space(coor)
            print(elevations[local_coor[1]][local_coor[0]])
            elevation = elevations[local_coor[1]][local_coor[0]]
            # convert from ft to meters
            coor_ele.append([coor[0], coor[1], elevation * 0.3048,coor[2],coor[3]])
    content = {
        "success": True,
        "points": coor_ele
    }
    return JsonResponse(content)


def to_local_space(m_extent):
    # actual values of extents bounding box
    area_extents = [440000, 314000, 455000, 340000]
    m_x1 = int(round(float(m_extent[0]) / 10.0) * 10)
    m_y1 = int(round(float(m_extent[1]) / 10.0) * 10)
    # Checking if bounding box is outside area extents
    if m_x1 < area_extents[0]:
        m_x1 = area_extents[0]
    elif m_x1 > area_extents[2]:
        m_x1 = area_extents[2]
    if m_y1 < area_extents[1]:
        m_y1 = area_extents[1]
    elif m_y1 > area_extents[3]:
        m_y1 = area_extents[3]
    # // re-index
    m_x1 = int((m_x1 - area_extents[0]) / 10)
    m_y1 = int(-(m_y1 - area_extents[3]) / 10)

    return [m_x1, m_y1]
