from abc import ABC, abstractmethod
from PIL import Image
import numpy as np
from pyper import R
from django.conf import settings
import os
import json
import uuid
import grazescape.model_defintions.utilities as ut
import pickle


class ModelBase:

    def __init__(self, request, file_name=None):

        if file_name is None:
            file_name = str(uuid.uuid4())
        self.file_name = file_name
        self.model_data_inputs_path = os.path.join(settings.BASE_DIR,
                                                   'grazescape', 'data_files',
                                                   'raster_outputs',
                                                   file_name + '.csv')

        if not os.path.exists(
                os.path.join(settings.BASE_DIR, 'grazescape', 'data_files',
                             'raster_outputs')):
            os.makedirs(
                os.path.join(settings.BASE_DIR, 'grazescape', 'data_files',
                             'raster_outputs'))
        self.raster_image_file_path = os.path.join(settings.BASE_DIR,
                                                   'grazescape', 'data_files',
                                                   'raster_outputs',
                                                   file_name + ".png")

        self.r_file_path = "C://Program Files/R/R-4.0.5/bin/x64/R.exe"
        # self.r_file_path = "/opt/conda/envs/gscape/bin/R"
        self.model_file_path = os.path.join(settings.BASE_DIR, 'grazescape',
                                            'data_files', 'input_models',
                                            'tidyModels')
        self.color_ramp_hex = []
        self.data_range = []
        self.bounds = {"x": 0, "y": 0}
        self.no_data = -9999
        self.model_parameters = self.parse_model_parameters(request)
        self.raster_inputs = {}

    def parse_model_parameters(self, request):
        # crop, crop cover, rotation, densit
        nutrient_dict = {"ccgcdsnana": {"Pneeds": 65, "grazed_DM_lbs": 196.8,
                                        "grazed_P2O5_lbs": 2.46},
                         "ccgcisnana": {"Pneeds": 65, "grazed_DM_lbs": 196.8,
                                        "grazed_P2O5_lbs": 2.46},
                         "ccncnana": {"Pneeds": 60, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "ccccnana": {"Pneeds": 60, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "cggcdsnana": {"Pneeds": 47.5, "grazed_DM_lbs": 196.8,
                                        "grazed_P2O5_lbs": 2.46},
                         "cggcisnana": {"Pneeds": 47.5, "grazed_DM_lbs": 196.8,
                                        "grazed_P2O5_lbs": 2.46},
                         "cgncnana": {"Pneeds": 50, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "cgccnana": {"Pneeds": 50, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "drgcdsnana": {"Pneeds": 49, "grazed_DM_lbs": 38.4,
                                        "grazed_P2O5_lbs": 0.48},
                         "drgcisnana": {"Pneeds": 49, "grazed_DM_lbs": 38.4,
                                        "grazed_P2O5_lbs": 0.48},
                         "drncnana": {"Pneeds": 49, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "drccnana": {"Pneeds": 49, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "csogcdsnana": {"Pneeds": 46.67,
                                         "grazed_DM_lbs": 64.8,
                                         "grazed_P2O5_lbs": 0.81},
                         "csogcisnana": {"Pneeds": 46.67,
                                         "grazed_DM_lbs": 64.8,
                                         "grazed_P2O5_lbs": 0.81},
                         "csoncnana": {"Pneeds": 46.67, "grazed_DM_lbs": 0,
                                       "grazed_P2O5_lbs": 0},
                         "csoccnana": {"Pneeds": 46.67, "grazed_DM_lbs": 0,
                                       "grazed_P2O5_lbs": 0},
                         "dlntnalo": {"Pneeds": 0, "grazed_DM_lbs": 4802.4,
                                      "grazed_P2O5_lbs": 60.03},
                         "dlntnahi": {"Pneeds": 0, "grazed_DM_lbs": 24009.6,
                                      "grazed_P2O5_lbs": 300.12},
                         "ptntcnhi": {"Pneeds": 40, "grazed_DM_lbs": 3602.4,
                                      "grazed_P2O5_lbs": 45.03},
                         "ptntcnlo": {"Pneeds": 40, "grazed_DM_lbs": 1200,
                                      "grazed_P2O5_lbs": 15},
                         "ptntrtna": {"Pneeds": 40, "grazed_DM_lbs": 2400,
                                      "grazed_P2O5_lbs": 30},
                         "psntnana": {"Pneeds": 15, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         }
        # convert area from sq m to acres
        parameters = {
            "f_name": request.POST.getlist("model_parameters[f_name]")[0],
            "grass_type": request.POST.getlist("model_parameters[grass_type]")[
                0],
            "contour": request.POST.getlist("model_parameters[contour]")[0],
            "soil_p": request.POST.getlist("model_parameters[soil_p]")[0],
            "tillage": request.POST.getlist("model_parameters[tillage]")[0],
            "fert": request.POST.getlist("model_parameters[fert]")[0],
            "manure": request.POST.getlist("model_parameters[manure]")[0],
            "crop": request.POST.getlist("model_parameters[crop]")[0],
            "crop_cover": request.POST.getlist("model_parameters[crop_cover]")[
                0],
            "rotation": request.POST.getlist("model_parameters[rotation]")[0],
            "density": request.POST.getlist("model_parameters[density]")[0],
            "graze_factor": request.POST.getlist("model_parameters[graze_factor]")[0],
            "area": "",
        }
        numeric_para = ["soil_p", "fert", "manure"]
        # soil_p, fert, manure

        for val in parameters:

            #     convert string numeric values to float
            # contour needs to stay a string
            if parameters[val].isnumeric() and val != "contour":
                parameters[val] = float(parameters[val])
            if parameters[val] == "":
                if val in numeric_para:
                    parameters[val] = 0
                else:
                    parameters[val] = "NA"
        area = float(request.POST.getlist("model_parameters[area]")[0]) * 0.000247105
        parameters['area'] = area
        crop_cover = parameters["crop_cover"]
        if crop_cover.lower() == 'na':
            crop_cover = 'nt'
        if parameters["crop"] == "pt" or parameters["crop"] == "ps" or parameters["crop"] == "dl":
            crop_cover = 'nt'
        nutrient_key = parameters["crop"] + crop_cover + \
                       parameters["rotation"] + parameters["density"]
        nutrient_key = nutrient_key.lower()
        try:
            parameters["p_need"] = nutrient_dict[nutrient_key]["Pneeds"]
            parameters["dm"] = nutrient_dict[nutrient_key]["grazed_DM_lbs"]
            parameters["p205"] = nutrient_dict[nutrient_key]["grazed_P2O5_lbs"]
        except KeyError:
            raise KeyError("Invalid key: ", nutrient_key)

        return parameters

    def get_file_name(self):
        return self.file_name

    @abstractmethod
    def run_model(self):
        pass




    def create_color_ramp(self, min_value, max_value, num_cat=9):
        interval_step = (max_value - min_value) / num_cat
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
            return (256, 256, 256)
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
        print("The cell count is ", count)
        return min_val, max_val, sum_val/count, sum_val, count
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

    def get_model_png(self, model, bounds, no_data_array):
        data = model.data
        rows = bounds["y"]
        cols = bounds["x"]
        if model.model_type == 'Runoff':
            sum, count = self.sum_count(data, no_data_array)
            return 0, sum, float(count)


        three_d = np.empty([rows, cols, 4])
        datanm = self.reshape_model_output(data, bounds)
        min_v, max_v, mean, sum, count = self.min_max_avg(datanm, no_data_array)
        color_ramp = self.create_color_ramp(min_v, max_v)
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
        im.save(self.raster_image_file_path)
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
    def __init__(self, model_type, default_units, alternate_units):
        self.model_type = model_type
        self.alternate_units = alternate_units
        self.default_units = default_units
        self.data = []

    def set_data(self, data):
        self.data.append(data)
    def get_model_type(self):
        return self.model_type

