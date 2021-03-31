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
import grazescape.raster_data as rd
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
    raster_data = rd.RasterData()
    message = "pickle"
    # http: // localhost: 8000 / grazescape / load_data?load_txt = true
    if request.GET.get("load_txt"):
        print("Raster CSV")
        message = 'csv'
        raster_data.load_raster_csv()
    raster_data.load_raster_pickle()
    print("loaded pickle")
    if 'ls' not in raster_data.get_raster_data():
        print("create ls")
        raster_data.create_ls_file()
    return HttpResponse(message)


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

    extents = request.POST.getlist('extents[]')
    print(request.POST.getlist('model_parameters[initial_p]'))
    model_type = request.POST.get('model')
    values = []
    if model_type == 'grass':
        print("grass")
        model = GrassYield(request)
    elif model_type == 'pl':
        model = PhosphorousLoss(request)
    elif model_type == 'ero':
        model = Erosion(request)
    elif model_type == 'crop':
        print("crop")
        if request.POST.getlist('model_parameters[crop]')[0] == 'corn':
            print("corn")
            model = CropYield(request,"corn_output")
    else:
        model = GenericModel(request, model_type)
        # data = {"error": "Could not find a suitable model"}
        # return JsonResponse(data)
    print("Calculating Extents")
    extents, rounded_extents = model.to_raster_space(extents)
    print("Clipping Extents")
    clipped_rasters, bounds = model.clip_input(extents, raster_data.get_raster_data())
    print("Preparing model input")
    model.write_model_input(clipped_rasters, bounds)
    print("Running model")
    results = model.run_model()
    avg = model.aggregate(results)
    print("Creating png")
    color_ramp = model.get_model_raster(results)
    for cat in color_ramp:
        # palette.append(cat[2])
        values.append(cat[1])
    print(model.file_name)
    palette, values = model.get_legend()
    data = {
        "extent": rounded_extents,
        "model-results": "None",
        "palette": palette,
        "url": model.file_name + ".png",
        "values": values,
        "avg": avg,
        "units": model.get_units()

    }

    print("Displaying model")
    return JsonResponse(data)

def get_image(response):
    print(response.GET.get('file_name'))
    file_name = response.GET.get('file_name')
    file_path = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files','raster_outputs',file_name)

    img = open(file_path, 'rb')

    response = FileResponse(img)

    return response