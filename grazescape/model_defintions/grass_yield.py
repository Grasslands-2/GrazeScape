from abc import ABC

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import R
from django.conf import settings
import os
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Polygon
import time


class GrassYield(ModelBase):
    def __init__(self, request, active_region, file_name=None):
        super().__init__(request, active_region, file_name)
        self.model_name = "tidyPastureALLWInoCec.rds"
        # self.model_name = "tidyPastureALLWI.rds"
        # self.model_file_path = os.path.join(settings.MODEL_PATH,
        #                                     self.model_name)
        self.model_file_path = os.path.join(settings.MODEL_PATH, 'GrazeScape', self.model_name)
        self.model_file_path2 = os.path.join(settings.MODEL_PATH, 'GrazeScape', active_region)
        self.fertNrec = pd.read_csv(
            r"grazescape/static/grazescape/public/nitrate_tables/NitrogenFertRecs_zjh_edits.csv")
        # self.fertNrec = pd.read_csv(r"grazescape\model_defintions\NmodelInputs_final.csv")
        self.denitLoss = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/denitr.csv")
        self.Nvars = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/Nvars.csv")
        self.grass_type = self.model_parameters['grass_type']
        # self.units = "Dry Mass tons/ac"

    @staticmethod
    def calculate_denitloss(om_average, drain_response_average):
        drain_round = drain_response_average
        if drain_round > 7:
            drain_round = 7
        if drain_round < 1:
            drain_round = 1
        if om_average < 2:
            drain_dict = {1: 3, 2: 9, 3: 20, 4: 3, 5: 13, 6: 20, 7: 6}
        elif 2 <= om_average <= 5:
            drain_dict = {1: 6, 2: 13, 3: 30, 4: 6, 5: 17.5, 6: 30, 7: 10}
        else:
            drain_dict = {1: 8, 2: 17.5, 3: 40, 4: 8, 5: 25, 6: 40, 7: 13}
        return drain_dict[drain_round]

    def Calc_N_Leach(self, yeild_crop_data, fertN, manrN, NfixPct, NH3loss, Nharv_content, grazed_manureN,
                     Denitr_Value, precN, dryN, erosN):
        # print("hello world")
        NH3N = fertN * NH3loss / 100  ## ammonia loss output, lb/ac
        # print("NH3N")
        # print(NH3N)
        harvN = yeild_crop_data * 2000 * Nharv_content  ## harvested N output, lb/ac (crop yield in tons dm, convert to lbs dm) # dry lot yield = 0
        # print("harvN")
        # print(harvN)
        fixN = harvN * NfixPct / 100 + 3  ## N fixation input, lb/ac
        # print("fixN")
        # print(fixN)
        denitN = fertN * Denitr_Value / 100  ## denitrification loss,
        # print("denitN")
        # print(denitN)
        inputsN = fertN + manrN + precN + dryN + fixN + grazed_manureN
        # print("inputsN 1")
        # print(inputsN)
        gasN = 0.01 * inputsN  ## misc gases are estimated as 1% of inputs
        # print("gasN")
        # print(gasN)
        NH3senN = 8  ## ammonia loss at senescence
        runoffN = 0
        # print("inputs", fertN , manrN , precN , dryN , fixN , grazed_manureN)
        # print("outputs", harvN , NH3N , denitN , erosN , gasN , NH3senN , runoffN)
        outputsN = harvN + NH3N + denitN + erosN + gasN + NH3senN + runoffN
        # print("inputsN")
        # print(inputsN)
        # print("outputsN")
        # print(outputsN)
        # if yeild_crop_data > 0:
        #     print("inputs", fertN, manrN, precN, dryN, fixN, grazed_manureN)
        #     print("inputs2", yeild_crop_data, fertN, manrN, NfixPct, NH3loss, Nharv_content, grazed_manureN,
        #              Denitr_Value, precN, dryN, erosN)
        #     print("outputs", harvN, NH3N, denitN, erosN, gasN, NH3senN, runoffN)
        #     print("sum is", inputsN - outputsN)
        leachN = inputsN - outputsN
        # print("LEACHN")
        # print(leachN)
        return leachN

    def run_model(self, request, active_region, manure_results):
        start = time.time()
        grass_yield = OutputDataNode("Grass", "Grass yield (tons-dry-matter/ac/yr)", 'Grass production (tons-dry-matter/yr)','Grass yield (tons-dry-matter/ac/yr)','Grass production (tons-dry-matter/yr)')
        rotation_avg = OutputDataNode("Rotational Average", "Total dry matter yield (tons/ac/yr)", "Total dry matter production (tons/yr)","Total dry matter yield (tons/ac/yr)","Total dry matter yield (tons/ac/yr)")


        nitrate_array = []
        crop_ro = self.model_parameters["crop"] + '-' + self.model_parameters["rotation"]
        return_data = []
        return_data.append(grass_yield)
        return_data.append(rotation_avg)

        # path to R instance
        grass = ''
        n_loss_h20 = 0
        # print("self.model_parameters")
        # print(self.model_parameters)
        # print(self.model_parameters["grass_type"])
        r = R(RCMD=self.r_file_path, use_pandas=True)
        if 'bluegrass' in self.model_parameters["grass_type"].lower():
            grass = "Bluegrass-clover"
        elif 'orchard' in self.model_parameters["grass_type"].lower():
            grass = "Orchardgrass-clover"
        elif 'timothy' in self.model_parameters["grass_type"].lower():
            grass = "Timothy-clover"

        slope = self.raster_inputs["slope"].flatten()
        slope_length = self.raster_inputs["slope_length"].flatten()
        k = self.raster_inputs["k"].flatten()
        ls = self.raster_inputs["ls"].flatten()
        elevation = self.raster_inputs["elevation"].flatten()
        ft_to_m = 0.3048
        elevation = elevation * ft_to_m
        sand = self.raster_inputs["sand"].flatten()
        silt = self.raster_inputs["silt"].flatten()
        clay = self.raster_inputs["clay"].flatten()
        ksat = self.raster_inputs["ksat"].flatten()
        ph = self.raster_inputs["ph"].flatten()
        awc = self.raster_inputs["awc"].flatten()
        total_depth = self.raster_inputs["total_depth"].flatten()

        regionRDS = active_region + '.rds'
        r.assign("slope_length", slope_length)
        r.assign("k", k)
        r.assign("total_depth", total_depth)
        r.assign("ls", ls)
        r.assign("slope", slope)
        r.assign("elevation", elevation)
        r.assign("sand", sand)
        r.assign("silt", silt)
        r.assign("clay", clay)
        r.assign("ksat", ksat)
        r.assign("ph", ph)
        r.assign("awc", awc)
        r.assign("total_depth", total_depth)

        regionRDS = active_region + '.rds'
        r.assign("slope", slope)
        r.assign("slope_length", slope_length)
        r.assign("sand", sand)
        r.assign("silt", silt)
        r.assign("clay", clay)
        r.assign("k", k)
        # r.assign("om", om)
        r.assign("total_depth", total_depth)
        r.assign("ls", ls)

        r.assign("p_need", float(manure_results["avg"]["p_needs"]))
        r.assign("manure", float(manure_results["avg"]["man_p_per"]))
        r.assign("dm", float(manure_results["avg"]["grazed_dm"]))
        r.assign("p205", float(manure_results["avg"]["grazed_p205"]))
        # r.assign("manure", self.model_parameters["manure"])

        r.assign("fert", float(self.model_parameters["fert"]))
        r.assign("crop", self.model_parameters["crop"])
        r.assign("cover", self.model_parameters["crop_cover"])
        r.assign("contour", str(self.model_parameters["contour"]))
        r.assign("tillage", self.model_parameters["tillage"])
        r.assign("rotational", self.model_parameters["rotation"])
        r.assign("density", self.model_parameters["density"])
        r.assign("initialP", float(self.model_parameters["soil_p"]))
        r.assign("om", float(self.model_parameters["om"]))
        print("om value is ", float(self.model_parameters["om"]))
        print("assigning om done")

        print(r("library(randomForest)"))
        print(r("library(dplyr)"))
        print(r("library(tidymodels)"))
        print(r("library(tidyverse)"))
        print(r("savedRF <- readRDS('" + self.model_file_path + "')"))
        print(r(
            "new_dat <- data.frame(slope=slope, elev=elevation, sand=sand, "
            "silt=silt,   clay=clay,     om=om,   ksat=ksat,    "  # cec=cec,     
            "ph=ph,  awc=awc,   total.depth=total_depth )"))
        print(r(
            'cropname <- factor(c("Bluegrass-clover", "Orchardgrass-clover",'
            '"Timothy-clover"))'))
        print(r(
            "df_repeated <- new_dat %>% slice(rep(1:n(), each=length(cropname)))"))
        print(r("new_df <- cbind(cropname, df_repeated)"))
        print(r("pred_df <- new_df %>% filter(cropname == '" + grass + "')"))
        print(r("pred <- predict(savedRF, pred_df)"))
        pred = r.get("pred")

        # print("Model Results")
        # print("$$$$$$$$$$$$$$$")
        pred = pred * float(self.model_parameters["graze_factor"])
        pred2 = np.where(pred < 0.01, .01, pred)
        # print("GRASS PRED Flattened")
        # print(pred2)
        grass_yield.set_data(pred)
        rotation_avg.set_data(pred)

        return return_data
