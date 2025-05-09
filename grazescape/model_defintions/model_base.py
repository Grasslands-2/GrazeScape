from abc import ABC, abstractmethod
from PIL import Image
import numpy as np
from django.conf import settings
import os
import functools
import time


class ModelBase:

    def __init__(self, request, active_region, file_name=None):
        # request_json = js.loads(request.body)
        field_id = request.POST.getlist("field_id")[0]
        model_run_timestamp = request.POST.get('model_parameters[model_run_timestamp]')
        model_type = request.POST.get('model_parameters[model_type]')
        active_region = request.POST.get('model_parameters[active_region]')
        self.scenario_id = request.POST.getlist("scenario_id")[0]
        # print("file name is ", file_name)
        if file_name is None:
            file_name = model_type + field_id
        self.file_name = file_name
        self.field_id = field_id
        self.model_run_timestamp = model_run_timestamp
        self.model_data_inputs_path = os.path.join(settings.BASE_DIR,
                                                   'grazescape', 'data_files',
                                                   'raster_outputs',
                                                   file_name + '.csv')
        self.file_name = "field_" + field_id
        self.dir_path = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files', 'raster_outputs', self.file_name)
        if not os.path.exists(self.dir_path):
            os.makedirs(self.dir_path)

        self.r_file_path = settings.R_PATH

        # try:
        #     r = R(RCMD=self.r_file_path)
        # except FileNotFoundError as e:
        #     raise FileNotFoundError("R file path is incorrect")
        # del r
        self.active_region = active_region
        if active_region == "cloverBeltWI":
            self.model_file_path = os.path.join(settings.MODEL_PATH, 'GrazeScape', 'cloverBeltWI')
        if active_region == "southWestWI":
            self.model_file_path = os.path.join(settings.MODEL_PATH, 'GrazeScape', 'southWestWI')
        if active_region == "uplandsWI":
            self.model_file_path = os.path.join(settings.MODEL_PATH, 'GrazeScape', 'uplandsWI')
        if active_region == "northeastWI":
            self.model_file_path = os.path.join(settings.MODEL_PATH, 'GrazeScape', 'northeastWI')
        if active_region == "redCedarWI":
            self.model_file_path = os.path.join(settings.MODEL_PATH, 'GrazeScape', 'redCedarWI')
        if active_region == "pineRiverMN":
            self.model_file_path = os.path.join(settings.MODEL_PATH, 'GrazeScape', 'pineRiverMN')
        if active_region == "eastCentralWI":
            self.model_file_path = os.path.join(settings.MODEL_PATH, 'GrazeScape', 'eastCentralWI')
        if active_region == "southEastWI":
            self.model_file_path = os.path.join(settings.MODEL_PATH, 'GrazeScape', 'southEastWI')

        self.color_ramp_hex = []
        self.data_range = []
        self.bounds = {"x": 0, "y": 0}
        self.no_data = -9999
        self.model_parameters = self.parse_model_parameters(request)
        self.raster_inputs = {}

    def log_start_end(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start = time.time()
            # print(f"Function '{func}' started.")
            result = func(*args, **kwargs)
            end = time.time() - start

            print(f"Function '{func}' ended.", end)
            return result

        return wrapper

    def parse_model_parameters(self, request):
        om = float(request.POST.getlist("model_parameters[om]")[0])
        if om > 20:
            om = 20
        parameters = {
            "f_name": request.POST.getlist("model_parameters[f_name]")[0],
            "grass_type": request.POST.getlist("model_parameters[grass_type]")[
                0],
            "contour": request.POST.getlist("model_parameters[contour]")[0],
            "soil_p": float(request.POST.getlist("model_parameters[soil_p]")[0]),
            "tillage": request.POST.getlist("model_parameters[tillage]")[0],
            "fert": request.POST.getlist("model_parameters[fert]")[0],
            "manure": request.POST.getlist("model_parameters[manure]")[0],
            "fertN": request.POST.getlist("model_parameters[fert_n]")[0],
            "manureN": request.POST.getlist("model_parameters[manure_n]")[0],
            "crop": request.POST.getlist("model_parameters[crop]")[0],
            "crop_cover": request.POST.getlist("model_parameters[crop_cover]")[0],
            "rotation": request.POST.getlist("model_parameters[rotation]")[0],
            "density": request.POST.getlist("model_parameters[density]")[0],
            "graze_factor": request.POST.getlist("model_parameters[graze_factor]")[0],
            "area": request.POST.getlist("model_parameters[land_area]")[0],
            "om": om,
            "legume": request.POST.getlist("model_parameters[legume]")[0],
            "alfalfaMachCost": request.POST.getlist("model_parameters[alfalfaMachCost]")[0],
            "alfalfaMachCostY1": request.POST.getlist("model_parameters[alfalfaMachCostY1]")[0],
            "alfalfaPestCost": request.POST.getlist("model_parameters[alfalfaPestCost]")[0],
            "alfalfaSeedCost": request.POST.getlist("model_parameters[alfalfaSeedCost]")[0],
            "cornMachCost": request.POST.getlist("model_parameters[cornMachCost]")[0],
            "cornPestCost": request.POST.getlist("model_parameters[cornPestCost]")[0],
            "cornSeedCost": request.POST.getlist("model_parameters[cornSeedCost]")[0],
            "grassMachCost": request.POST.getlist("model_parameters[grassMachCost]")[0],
            "grassPestCost": request.POST.getlist("model_parameters[grassPestCost]")[0],
            "grassSeedCost": request.POST.getlist("model_parameters[grassSeedCost]")[0],
            "oatMachCost": request.POST.getlist("model_parameters[oatMachCost]")[0],
            "oatPestCost": request.POST.getlist("model_parameters[oatPestCost]")[0],
            "oatSeedCost": request.POST.getlist("model_parameters[oatSeedCost]")[0],
            "soyMachCost": request.POST.getlist("model_parameters[soyMachCost]")[0],
            "soyPestCost": request.POST.getlist("model_parameters[soyPestCost]")[0],
            "soySeedCost": request.POST.getlist("model_parameters[soySeedCost]")[0],
            "fertNCost": request.POST.getlist("model_parameters[fertNCost]")[0],
            "fertPCost": request.POST.getlist("model_parameters[fertPCost]")[0],
            # field variables
            "land_area": request.POST.getlist("model_parameters[land_area]")[0],
            "land_cost": request.POST.getlist("model_parameters[land_cost]")[0],
            # "rotation_econ": request.POST.getlist("model_parameters[rotation_econ]"),
            "fert_p_perc": request.POST.getlist("model_parameters[fert_p_perc]")[0],
            "fert_n_perc": request.POST.getlist("model_parameters[fert_n_perc]")[0],
            "manure_p_perc": request.POST.getlist("model_parameters[manure_p_perc]")[0],
            "manure_n_perc": request.POST.getlist("model_parameters[manure_n_perc]")[0],
        }

        numeric_para = ["soil_p", "fert", "manure"]
        # soil_p, fert, manure

        for val in parameters:
            if parameters[val] == "":
                if val in numeric_para:
                    parameters[val] = 0
                else:
                    parameters[val] = "NA"
        area = float(request.POST.getlist("model_parameters[area]")[0]) * 0.000247105
        parameters['area'] = area
        return parameters

    def get_file_name(self):
        return self.file_name

    @abstractmethod
    @log_start_end
    def run_model(self):
        pass

    # creates realtive to the field color ramp.
    # Tomorrow morning you will find a way to set up conditionals for each model type
    # to make sure they show on a fixed scale, and not a relative to themselves scale
    def create_color_ramp(self, min_value, max_value, result, num_cat=9):
        if result.model_type == "ero" or result.model_type == "ploss":
            min_value = 0
            max_value = 15
        else:
            min_value = min_value
            max_value = max_value
        interval_step = (max_value - min_value) / num_cat
        # interval_step = 1.875
        cate_value = min_value
        cat_list = []
        self.color_ramp_hex = [
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
        color_ramp = [(32, 68, 132),
                      (62, 117, 178),
                      (144, 185, 228),
                      (210, 240, 250),
                      (252, 255, 216),
                      (255, 218, 160),
                      (235, 145, 89),
                      (210, 92, 52),
                      (165, 45, 24)
                      ]
        counter = 0
        self.data_range.append(float(min_value))
        while counter < num_cat:
            cat_list.append(
                [cate_value, cate_value + interval_step, color_ramp[counter]])
            cate_value = cate_value + interval_step
            self.data_range.append(float(cate_value))
            counter = counter + 1
        # TODO hardcoding this for the beta specifically to erosion!
        self.data_range = []
        return cat_list

    def calculate_color(self, color_ramp, value):
        if value == self.no_data:
            return 256, 256, 256
        for index, val in enumerate(color_ramp):
            if val[1] >= value:
                return val[2]
        return color_ramp[-1][2]

    def reshape_model_output(self, data, bounds):
        data = np.reshape(data, (bounds["y"], bounds["x"]))

        return data

    def min_max_avg(self, data, no_data_array):
        # todo update this
        min_val = float('inf')
        max_val = self.no_data
        sum_val = 0
        count = 0
        for y in range(0, self.bounds["y"]):
            for x in range(0, self.bounds["x"]):
                # skip if array value is no data
                if no_data_array[y][x] != 1:
                    if data[y][x] > max_val:
                        max_val = data[y][x]
                    if data[y][x] < min_val:
                        min_val = data[y][x]
                    sum_val = sum_val + data[y][x]
                    count = count + 1
        print(min_val, max_val, sum_val / count, sum_val, count)
        return min_val, max_val, sum_val / count, sum_val, count

    def sum_count(self, data, no_data_array):
        # todo update this
        sum_val = [0] * 12
        count = 0
        valid_count = 0
        for y in range(0, self.bounds["y"]):
            for x in range(0, self.bounds["x"]):
                # skip if array value is no data
                if no_data_array[y][x] != 1:
                    for i in range(0, len(sum_val)):
                        sum_val[i] = sum_val[i] + data[count][i]
                    valid_count = valid_count + 1
                    count = count + 1
        sum_val = [float(round(elem, 2)) for elem in sum_val]
        return sum_val, valid_count

    def get_model_png(self, result, bounds, no_data_array):
        # file_name = result.model_type + self.field_id + '_' + self.model_run_timestamp
        raster_image_file_path = os.path.join(self.dir_path, self.file_name + "_" + result.model_type + ".png")
        data = result.data
        rows = bounds["y"]
        cols = bounds["x"]
        if result.model_type == 'Runoff':
            # print("rainfall", data)
            sum, count = self.sum_count(data, no_data_array)
            return 0, sum, float(count)
        three_d = np.empty([rows, cols, 4])
        datanm = self.reshape_model_output(data, bounds)
        min_v, max_v, mean, sum, count = self.min_max_avg(datanm, no_data_array)
        # we only want images of these models. The rest are yield models
        # if result.model_type in ["ero", "ploss", "nleaching", "Rotational Average", "Curve Number"]:

        color_ramp = self.create_color_ramp(min_v, max_v, result)
        for y in range(0, rows):
            for x in range(0, cols):
                color = self.calculate_color(color_ramp, datanm[y][x])
                three_d[y][x][0] = color[0]
                three_d[y][x][1] = color[1]
                three_d[y][x][2] = color[2]
                three_d[y][x][3] = 255
                if no_data_array[y][x] == 1:
                    three_d[y][x][3] = 0
        three_d = three_d.astype(np.uint8)
        im = Image.fromarray(three_d)
        im.convert('RGBA')
        im.save(raster_image_file_path)
        return float(mean), float(sum), float(count)

    def get_legend(self):
        return self.color_ramp_hex, self.data_range


class OutputDataNode:
    """
    This class stores the output yield values of our various models

    For crop data we want to maintain two different datasets. One with the
    familiar units such as bushels / acre and one with standardized units of
    kg of dry matter / hec
    """

    def __init__(self, model_type, default_units, alternate_units, default_title, alternate_title):
        self.model_type = model_type
        self.alternate_units = alternate_units
        self.default_units = default_units
        self.default_title = default_title
        self.alternate_title = alternate_title
        self.alternate_data = []
        self.data = []
        self.P2O5_fert = None
        self.N_fert = None

    def set_data(self, data):
        self.data.append(data)

    def set_data_alternate(self, data):
        self.alternate_data.append(data)

    def get_model_type(self):
        return self.model_type

    def set_data_smart(self, data):
        self.data = data
