from abc import ABC, abstractmethod
from PIL import Image
import numpy as np
#np.set_printoptions(threshold=np.inf)
from pyper import R
from django.conf import settings
import os
import json as js
import uuid
import grazescape.model_defintions.utilities as ut
import pickle
from pyper import R

eroDatum = []
class ModelBase:

    def __init__(self, request,active_region, file_name=None):
        #request_json = js.loads(request.body)
        field_id = request.POST.getlist("field_id")[0]
        model_run_timestamp = request.POST.get('model_parameters[model_run_timestamp]')
        scenario_id = request.POST.getlist("scenario_id")[0]
        farm_id = request.POST.getlist("farm_id")[0]
        model_type = request.POST.get('model_parameters[model_type]')
        f_name = request.POST.get('model_parameters[f_name]')
        scen = request.POST.get('model_parameters[scen]')
        active_region = request.POST.get('model_parameters[active_region]')
        alfalfaMachCost = request.POST.get("model_parameters[alfalfaMachCost]")
        alfalfaMachCostY1 = request.POST.get("model_parameters[alfalfaMachCostY1]")
        alfalfaPestCost = request.POST.get("model_parameters[alfalfaPestCost]")
        alfalfaSeedCost = request.POST.get("model_parameters[alfalfaSeedCost]")
        cornMachCost = request.POST.get("model_parameters[cornMachCost]")
        cornPestCost = request.POST.get("model_parameters[cornPestCost]")
        cornSeedCost = request.POST.get("model_parameters[cornSeedCost]")
        grassMachCost = request.POST.get("model_parameters[grassMachCost]")
        grassPestCost = request.POST.get("model_parameters[grassPestCost]")
        grassSeedCost = request.POST.get("model_parameters[grassSeedCost]")
        oatMachCost = request.POST.get("model_parameters[oatMachCost]")
        oatPestCost = request.POST.get("model_parameters[oatPestCost]")
        oatSeedCost = request.POST.get("model_parameters[oatSeedCost]")
        soyMachCost = request.POST.get("model_parameters[soyMachCost]")
        soyPestCost = request.POST.get("model_parameters[soyPestCost]")
        soySeedCost = request.POST.get("model_parameters[soySeedCost]")
        fertNCost = request.POST.get("model_parameters[fertNCost]")
        fertPCost = request.POST.get("model_parameters[fertPCost]")
        #field variables
        land_area = request.POST.get("model_parameters[land_area]")
        land_cost = request.POST.get("model_parameters[land_cost]")
        rotation = request.POST.get("model_parameters[rotation_econ]")
        cover_crop = request.POST.get("model_parameters[crop_cover]")
        fert_p_perc = request.POST.get("model_parameters[fert_p_perc]")
        fert_n_perc = request.POST.get("model_parameters[fert_n_perc]")
        manure_p_perc = request.POST.get("model_parameters[manure_p_perc]")
        manure_n_perc = request.POST.get("model_parameters[manure_n_perc]")

        if file_name is None:
            file_name = model_type + field_id +'_' + model_run_timestamp ##+'_'+ str(uuid.uuid1())##
        self.file_name = file_name
        self.field_id = field_id
        self.model_run_timestamp = model_run_timestamp
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
        self.raster_image_file_path = os.path.join(settings.BASE_DIR,'grazescape','static','grazescape','public','images',file_name + ".png")
                                                #    'grazescape', 'data_files',
                                                #    'raster_outputs',
                                                #    file_name + ".png")
        # R_PATH = "C://Program Files/R/R-4.0.5/bin/x64/R.exe"

        # self.r_file_path = R_PATH
        self.r_file_path = settings.R_PATH
        # self.r_file_path = "/opt/conda/envs/gscape/bin/R"

#for Zach local
        #self.r_file_path = "C://Program Files/R/R-4.0.5/bin/x64/R.exe"
        #self.r_file_path = "/opt/conda/envs/gscape/bin/R"
    
        try:
            r = R(RCMD=self.r_file_path, use_pandas=True)
        except FileNotFoundError as e:
            raise FileNotFoundError("R file path is incorrect")
        # if active_region == "cloverBeltWI":
        #     self.model_file_path = os.path.join(settings.MODEL_PATH,'GrazeScape','cloverBeltWI')
        # else:
        #     self.model_file_path = os.path.join(settings.MODEL_PATH,'GrazeScape','southWestWI')
        if active_region == "cloverBeltWI":
            self.model_file_path = os.path.join(settings.MODEL_PATH,'GrazeScape','cloverBeltWI')
        if active_region == "southWestWI":
            self.model_file_path = os.path.join(settings.MODEL_PATH,'GrazeScape','southWestWI')
        if active_region == "uplandsWI":
            self.model_file_path = os.path.join(settings.MODEL_PATH,'GrazeScape','uplandsWI')
        if active_region == "northeastWI":
            self.model_file_path = os.path.join(settings.MODEL_PATH,'GrazeScape','northeastWI')
        #Local Set up                  
        # if active_region == "cloverBeltWI":
        #     self.model_file_path = os.path.join(settings.BASE_DIR, 'grazescape',
        #                                     'data_files', 'input_models',
        #                                     'CloverBelt_tidyModels')
        # else:
        #     self.model_file_path = os.path.join(settings.BASE_DIR, 'grazescape',
        #                                         'data_files', 'input_models',
        #                                         'tidyModels')
        #this could be where you point the models towards cloverBelt tidy models versions.
        self.color_ramp_hex = []
        self.data_range = []
        self.bounds = {"x": 0, "y": 0}
        self.no_data = -9999
        self.model_parameters = self.parse_model_parameters(request)
        self.raster_inputs = {}

    def parse_model_parameters(self, request):
        # request_json = js.loads(request.body)
        # field_id = str(request_json["field_id"])# field_id = request.POST.getlist("field_id")[0]
        # model_run_timestamp = request_json["model_parameters"]["model_run_timestamp"]# model_run_timestamp = request.POST.get('model_parameters[model_run_timestamp]')
        # scenario_id = request_json["scenario_id"]# scenario_id = request.POST.getlist("scenario_id")[0]
        # farm_id = request_json["farm_id"]# farm_id = request.POST.getlist("farm_id")[0]
        # model_type = request_json["model_parameters"]["model_type"]# model_type = request.POST.get('model_parameters[model_type]')
        # f_name = request_json["model_parameters"]["f_name"]# f_name = request.POST.get('model_parameters[f_name]')
        # scen = request_json["model_parameters"]["scen"]# scen = request.POST.get('model_parameters[scen]')
        # active_region = request_json["model_parameters"]["active_region"]# active_region = request.POST.get('model_parameters[active_region]')
        # grassType = request_json["model_parameters"]["grass_type"]
        # contour = request_json["model_parameters"]["contour"]
        # soil_p = request_json["model_parameters"]["soil_p"]
        # tillage = request_json["model_parameters"]["tillage"]
        # fert = request_json["model_parameters"]["fert"]
        # manure = request_json["model_parameters"]["manure"]
        # fertN = request_json["model_parameters"]["fert_n"]
        # om = request_json["model_parameters"]["om"]
        # area = request_json["model_parameters"]["land_area"]
        # legume = request_json["model_parameters"]["legume"]
        # alfalfaMachCost = request_json["model_parameters"]["alfalfaMachCost"]
        # alfalfaMachCostY1 = request_json["model_parameters"]["alfalfaMachCostY1"]
        # alfalfaPestCost = request_json["model_parameters"]["alfalfaPestCost"]
        # alfalfaSeedCost = request_json["model_parameters"]["alfalfaSeedCost"]
        # cornMachCost = request_json["model_parameters"]["cornMachCost"]
        # cornPestCost = request_json["model_parameters"]["cornPestCost"]
        # cornSeedCost = request_json["model_parameters"]["cornSeedCost"]
        # grassMachCost = request_json["model_parameters"]["grassMachCost"]
        # grassPestCost = request_json["model_parameters"]["grassPestCost"]
        # grassSeedCost = request_json["model_parameters"]["grassSeedCost"]
        # oatMachCost = request_json["model_parameters"]["oatMachCost"]
        # oatPestCost = request_json["model_parameters"]["oatPestCost"]
        # oatSeedCost = request_json["model_parameters"]["oatSeedCost"]
        # soyMachCost = request_json["model_parameters"]["soyMachCost"]
        # soyPestCost = request_json["model_parameters"]["soyPestCost"]
        # soySeedCost = request_json["model_parameters"]["soySeedCost"]
        # fertNCost = request_json["model_parameters"]["fertNCost"]
        # fertPCost = request_json["model_parameters"]["fertPCost"]
        # #field variables
        # land_area = request_json["model_parameters"]["land_area"]
        # land_cost = request_json["model_parameters"]["land_cost"]
        # rotation = request_json["model_parameters"]["rotation"]
        # cover_crop = request_json["model_parameters"]["crop_cover"]
        # fert_p_perc = request_json["model_parameters"]["fert_p_perc"]
        # fert_n_perc = request_json["model_parameters"]["fert_n_perc"]
        # manure_p_perc = request_json["model_parameters"]["manure_p_perc"]
        # manure_n_perc = request_json["model_parameters"]["manure_n_perc"]
        # manure_n = request_json["model_parameters"]["manure_n"]
        # crop = request_json["model_parameters"]["crop"]
        # density = request_json["model_parameters"]["density"]
        # graze_factor = request_json["model_parameters"]["graze_factor"]
        # crop, crop cover, rotation, densit
        #add Nneeds to these rotational averages when Elissa gets them to you.
        nutrient_dict = {"ccgcdsnana": {"Pneeds": 65,"Nneeds": 120,"grazed_DM_lbs": 196.8,
                                        "grazed_P2O5_lbs": 2.46},
                         "ccgcisnana": {"Pneeds": 65,"Nneeds": 120, "grazed_DM_lbs": 196.8,
                                        "grazed_P2O5_lbs": 2.46},
                         "ccncnana": {"Pneeds": 60,"Nneeds": 120, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "ccccnana": {"Pneeds": 60,"Nneeds": 120, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "cggcdsnana": {"Pneeds": 47.5,"Nneeds": 60, "grazed_DM_lbs": 196.8,
                                        "grazed_P2O5_lbs": 2.46},
                         "cggcisnana": {"Pneeds": 47.5,"Nneeds": 60, "grazed_DM_lbs": 196.8,
                                        "grazed_P2O5_lbs": 2.46},
                         "cgncnana": {"Pneeds": 50,"Nneeds": 60, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "cgccnana": {"Pneeds": 50,"Nneeds": 60, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "drgcdsnana": {"Pneeds": 49,"Nneeds": 52, "grazed_DM_lbs": 38.4,
                                        "grazed_P2O5_lbs": 0.48},
                         "drgcisnana": {"Pneeds": 49,"Nneeds": 52, "grazed_DM_lbs": 38.4,
                                        "grazed_P2O5_lbs": 0.48},
                         "drncnana": {"Pneeds": 49,"Nneeds": 52, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "drccnana": {"Pneeds": 49,"Nneeds": 52, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "csogcdsnana": {"Pneeds": 46.67,"Nneeds": 60,
                                         "grazed_DM_lbs": 64.8,
                                         "grazed_P2O5_lbs": 0.81},
                         "csogcisnana": {"Pneeds": 46.67,"Nneeds": 60,
                                         "grazed_DM_lbs": 64.8,
                                         "grazed_P2O5_lbs": 0.81},
                         "csoncnana": {"Pneeds": 46.67,"Nneeds": 60, "grazed_DM_lbs": 0,
                                       "grazed_P2O5_lbs": 0},
                         "csoccnana": {"Pneeds": 46.67,"Nneeds": 60, "grazed_DM_lbs": 0,
                                       "grazed_P2O5_lbs": 0},
                         "dlntnalo": {"Pneeds": 0,"Nneeds": 0, "grazed_DM_lbs": 4802.4,
                                      "grazed_P2O5_lbs": 60.03},
                         "dlntnahi": {"Pneeds": 0,"Nneeds": 0, "grazed_DM_lbs": 24009.6,
                                      "grazed_P2O5_lbs": 300.12},
                         "ptntcnhi": {"Pneeds": 40,"Nneeds": 2, "grazed_DM_lbs": 3602.4,
                                      "grazed_P2O5_lbs": 45.03},
                         "ptntcnlo": {"Pneeds": 40,"Nneeds": 2, "grazed_DM_lbs": 1200,
                                      "grazed_P2O5_lbs": 15},
                         "ptntrtna": {"Pneeds": 40,"Nneeds": 2, "grazed_DM_lbs": 2400,
                                      "grazed_P2O5_lbs": 30},
                         "psntnana": {"Pneeds": 15,"Nneeds": 2, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         }
        # convert area from sq m to acres
        print('REQUEST RIGHT BEFORE PUT INTO PARAS')
        print(request.POST)
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
            "om": request.POST.getlist("model_parameters[om]")[0],
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
            #field variables
            "land_area": request.POST.getlist("model_parameters[land_area]")[0],
            "land_cost": request.POST.getlist("model_parameters[land_cost]")[0],
            #"rotation_econ": request.POST.getlist("model_parameters[rotation_econ]"),
            "fert_p_perc": request.POST.getlist("model_parameters[fert_p_perc]")[0],
            "fert_n_perc": request.POST.getlist("model_parameters[fert_n_perc]")[0],
            "manure_p_perc": request.POST.getlist("model_parameters[manure_p_perc]")[0],
            "manure_n_perc": request.POST.getlist("model_parameters[manure_n_perc]")[0],
        }
        # parameters = {
        #     "field_id": field_id,
        #     "model_run_timestamp": model_run_timestamp,
        #     "scenario_id":scenario_id,
        #     "farm_id":farm_id,
        #     "model_type": model_type,
        #     "scen": scen,
        #     "active_region": active_region,
        #     "f_name": f_name,
        #     "grass_type": grassType,
        #     "contour": contour,
        #     "soil_p": soil_p,
        #     "tillage": tillage,
        #     "fert": fert,
        #     "manure": manure,
        #     "fertN": fertN,
        #     "manureN": manure_n,
        #     "crop": crop,
        #     "crop_cover": cover_crop,
        #     "rotation": rotation,
        #     "density": density,
        #     "graze_factor": graze_factor,
        #     "area": "",
        #     "om": om,
        #     "legume": legume,
        #     "rotation": rotation,
        #     "cover_crop": cover_crop,
        #     "alfalfaMachCost": alfalfaMachCost,
        #     "alfalfaMachCostY1": alfalfaMachCostY1,
        #     "alfalfaPestCost": alfalfaPestCost,
        #     "alfalfaSeedCost": alfalfaSeedCost,
        #     "cornMachCost": cornMachCost,
        #     "cornPestCost": cornPestCost,
        #     "cornSeedCost": cornSeedCost,
        #     "grassMachCost": grassMachCost,
        #     "grassPestCost": grassPestCost,
        #     "grassSeedCost": grassSeedCost,
        #     "oatMachCost": oatMachCost,
        #     "oatPestCost": oatPestCost,
        #     "oatSeedCost": oatSeedCost,
        #     "soyMachCost": soyMachCost,
        #     "soyPestCost": soyPestCost,
        #     "soySeedCost": soySeedCost,
        #     "fertNCost": fertNCost,
        #     "fertPCost": fertPCost,
        #     #field variables
        #     "land_area": land_area,
        #     "land_cost": land_cost,
        #     #"rotation_econ": request.POST.getlist("model_parameters[rotation_econ]"),
        #     "fert_p_perc": fert_p_perc,
        #     "fert_n_perc": fert_n_perc,
        #     "manure_p_perc": manure_p_perc,
        #     "manure_n_perc": manure_n_perc,
        # }
        print("MODEL PARAMS IN MODEL_BASE!!!!!")
        print(parameters)
        numeric_para = ["soil_p", "fert", "manure"]
        # soil_p, fert, manure

        for val in parameters:
            #     convert string numeric values to float
            # contour needs to stay a string
            # if parameters[val].isnumeric() and val != "contour":
            #     parameters[val] = float(parameters[val])
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
        density = 'na'
        # ignore animal density if the field is not a pasture or a dry lot
        if parameters["crop"] == "pt" or parameters["crop"] == "dl":
            density = parameters["density"]
        print("parameters[rotation]")
        print(parameters["crop"])
        print(crop_cover)
        print(parameters["rotation"])
        print(density)
        # nutrient_key = parameters["crop"] + crop_cover + parameters["rotation"] + density
        nutrient_key = parameters["crop"] + crop_cover + 'na' + density
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
        #interval_step = 1.875
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
    def get_ero_datum(self,result,bounds):
        data = result.data
        erodatanm = self.reshape_model_output(data, bounds)
        return erodatanm
    def get_model_png(self, result, bounds, no_data_array):
        file_name = result.model_type + self.field_id + '_' + self.model_run_timestamp
        raster_image_file_path = os.path.join(settings.BASE_DIR,'grazescape','static','grazescape','public','images',file_name + ".png")
        data = result.data
        rows = bounds["y"]
        cols = bounds["x"]
        if result.model_type == 'Runoff':
            sum, count = self.sum_count(data, no_data_array)
            return 0, sum, float(count)
        three_d = np.empty([rows, cols, 4])
        datanm = self.reshape_model_output(data, bounds)
        # if result.model_type == 'ero':
        #     print("ERO data before color assignment Length!")
        #     print(data)
        #     print("ERO data before color assignment Length!")
        #     print(len(data[0]))
        #     print("ERO datanm before color assignment!")
        #     print(datanm)
        min_v, max_v, mean, sum, count = self.min_max_avg(datanm, no_data_array)
        color_ramp = self.create_color_ramp(min_v, max_v,result)
        #print("ERO datanm[y][x] before color assignment!")
        for y in range(0, rows):
            for x in range(0, cols):
                #if(result.model_type == 'ero'):
                    #print("")
                    # print("ERO datanm[y][x] before color assignment!")
                    # print(x)
                    # print(y)
                    # print(datanm[y][x])
                    
                    # print("ERO data[y][x] before color assignment!")
                    # print(data[y][x])
                
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
    def __init__(self, model_type, default_units, alternate_units):
        self.model_type = model_type
        self.alternate_units = alternate_units
        self.default_units = default_units
        self.data = []
        self.P2O5_fert = None
        self.N_fert = None

    def set_data(self, data):
        self.data.append(data)

    def get_model_type(self):
        return self.model_type

    def set_data_smart(self, data):
        self.data = data
