from abc import ABC

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import R
from django.conf import settings
import os


class GrassYield(ModelBase):
    def __init__(self, request, file_name=None):
        super().__init__(request, file_name)
        self.model_name = "tidyPastureALLWI.rds"
       # self.model_file_path = os.path.join(settings.MODEL_PATH,
        #                                     self.model_name)
        self.model_file_path = os.path.join(self.model_file_path,"GrazeScape",self.model_name)
        self.grass_type = self.model_parameters['grass_type']
        #self.active_region = self.model_parameters['active_region']
        # self.units = "Dry Mass tons/ac"

    def run_model(self):
        # path to R instance
        grass = ''
        print(self.model_parameters)
        print(self.model_parameters["grass_type"])
        r = R(RCMD=self.r_file_path, use_pandas=True)
        if 'bluegrass' in self.model_parameters["grass_type"].lower():
            grass = "Bluegrass-clover"
        elif 'orchard' in self.model_parameters["grass_type"].lower():
            grass = "Orchardgrass-clover"
        elif 'timothy' in self.model_parameters["grass_type"].lower():
            grass = "Timothy-clover"
        pred = [1, 2, 3]
        # "{}, ".format(grass)
        print("RRRR")
        print(self.model_data_inputs_path)

        slope = self.raster_inputs["slope"].flatten()
        elevation = self.raster_inputs["elevation"].flatten()
        sand = self.raster_inputs["sand"].flatten()
        silt = self.raster_inputs["silt"].flatten()
        clay = self.raster_inputs["clay"].flatten()
        ksat = self.raster_inputs["ksat"].flatten()
        cec = self.raster_inputs["cec"].flatten()
        ph = self.raster_inputs["ph"].flatten()
        om = self.raster_inputs["om"].flatten()
        awc = self.raster_inputs["awc"].flatten()
        total_depth = self.raster_inputs["total_depth"].flatten()

        r.assign("slope", slope)
        r.assign("elevation", elevation)
        r.assign("sand", sand)
        r.assign("silt", silt)
        r.assign("clay", clay)
        r.assign("om", om)
        r.assign("ksat", ksat)
        r.assign("cec", cec)
        r.assign("ph", ph)
        r.assign("awc", awc)
        r.assign("total_depth", total_depth)
        print("assigning om")
        r.assign("om", float(self.model_parameters["om"]))
        print("assigning om done")

        print(r("library(randomForest)"))
        print(r("library(dplyr)"))
        print(r("library(tidymodels)"))
        print(r("library(tidyverse)"))
        print(r("savedRF <- readRDS('" + self.model_file_path + "')"))
        print(r(
            "new_dat <- data.frame(slope=slope, elev=elevation, sand=sand, "
            "silt=silt,   clay=clay,     om=om,   ksat=ksat,    cec=cec,     "
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
        print("Model Results")
        print(pred)
        print("$$$$$$$$$$$$$$$")
        pred = pred * float(self.model_parameters["graze_factor"])
        grass_yield = OutputDataNode("Grass", "Yield (tons/acre)", 'Total Yield (tons/year')
        rotation_avg = OutputDataNode("Rotational Average", "Yield (tons-Dry Matter/ac/year)", "Yield (tons-Dry Matter/year)")
        grass_yield.set_data(pred)
        # convert from tons to lbss
        # rotation_avg.set_data(pred * 2000 * float(self.model_parameters["graze_factor"]))
        rotation_avg.set_data(pred)
        # Remove the three dummy references9
        return [grass_yield, rotation_avg]
