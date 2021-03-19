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
from grazescape.model_run import *
import grazescape.raster_data as rd
from grazescape.model_defintions.grass_yield import GrassYield
raster_data= None
def load_data(request):
    print("Loading data!!")
    global raster_data
    raster_data = rd.RasterData()
    return HttpResponse('')
def index(request):
    print("hello world")
    context = {
        'num_books': "d",
        'num_instances': "d",
        'num_instances_available': "d",
        'num_authors': "d",
    }
    # import requests module
    import requests

    # # Making a get request
    # response = requests.get('http://localhost:9000/get_model_data')
    #
    # # print response
    # print(response)
    #
    # # print json content
    # print(response.json())


    # Render the HTML template index.html with the data in the context variable
    return render(request, 'index.html', context=context)
@ensure_csrf_cookie
def get_model_results(request):
    global raster_data

    extents = request.POST.getlist('extents[]')
    print(extents)
    # # extents, rounded_extents = to_raster_space(extents = [445971.32902102446, 326947.92331442796, 449571.5308751964, 331080.5252420306])
    # extents, rounded_extents = to_raster_space(extents)
    # # raster_data = get_raster_inputs()
    # # raster = rd.RasterData()
    # # raster_data = raster.get_raster_data()
    # clipped_raster, bounds = clip_input(extents, raster_data.get_raster_data())
    # file_path = write_model_input(clipped_raster)
    # print(clipped_raster)
    # results = run_r(file_path)
    #
    # color_ramp, output_name = get_model_raster(results, bounds)
    palette = [
        "#204484",
        "#3e75b2",
        "#90b9e4",
        "#d2f0fa",
        "#fcffd8",
        "#ffdaa0",
        "#eb9159",
        "#d25c34",
        "#a52d18"
    ]
    values = []


    model = GrassYield()
    extents, rounded_extents = model.to_raster_space(extents)
    clipped_rasters, bounds = model.clip_input(extents,raster_data.get_raster_data())
    model.write_model_input(clipped_rasters)
    results = model.run_model()
    color_ramp = model.get_model_raster(results, bounds)
    for cat in color_ramp:
        # palette.append(cat[2])
        values.append(cat[1])
    print(model.file_name)
    palette, values = model.get_legend()
    data = {
        "extent":rounded_extents,
        "model-results":"None",
        "palette":palette,
        "url":model.file_name + ".png",
        "values":values
    }
    return JsonResponse(data)

def get_image(response):
    print(response.GET.get('file_name'))
    file_name = response.GET.get('file_name')
    file_path = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files','raster_outputs',file_name)

    img = open(file_path, 'rb')

    response = FileResponse(img)

    return response