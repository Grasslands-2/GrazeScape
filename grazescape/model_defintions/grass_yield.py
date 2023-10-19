from abc import ABC

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from grazescape.model_defintions.pyper_local import R
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
        self.main_type = None
        self.grass_type = None
        # all regions use the same pasture model
        self.model_name = "tidyPastureALLWInoCec.rds"
        # self.model_name = "tidyPastureALLWI.rds"
        # self.model_file_path = os.path.join(settings.MODEL_PATH,
        #                                     self.model_name)
        self.model_file_path = os.path.join(settings.MODEL_PATH, 'GrazeScape', self.model_name)
        # self.model_file_path2 = os.path.join(settings.MODEL_PATH, 'GrazeScape', active_region)
        # self.fertNrec = pd.read_csv(
        #     r"grazescape/static/grazescape/public/nitrate_tables/NitrogenFertRecs_zjh_edits.csv")
        # self.fertNrec = pd.read_csv(r"grazescape\model_defintions\NmodelInputs_final.csv")
        # self.denitLoss = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/denitr.csv")
        # self.Nvars = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/Nvars.csv")
        self.grass_type = self.model_parameters['grass_type']
        # self.units = "Dry Mass tons/ac"

    @ModelBase.log_start_end
    def run_model(self, manure_results):
        return_data = []
        grass = self.grass_type
        start = time.time()
        if self.main_type:
            grass_yield = OutputDataNode("Grass", "Grass yield (tons-dry-matter/ac/yr)",
                                         'Grass production (tons-dry-matter/yr)', 'Grass yield (tons-dry-matter/ac/yr)',
                                         'Grass production (tons-dry-matter/yr)')
            rotation_avg = OutputDataNode("Rotational Average", "Total dry matter yield (tons/ac/yr)",
                                          "Total dry matter production (tons/yr)",
                                          "Total dry matter yield (tons/ac/yr)", "Total dry matter yield (tons/ac/yr)")
            return_data.append(rotation_avg)

        else:
            grass_yield = OutputDataNode("grass_matrix_" + grass, "Grass yield (tons-dry-matter/ac/yr)",
                                         'Grass production (tons-dry-matter/yr)', 'Grass yield (tons-dry-matter/ac/yr)',
                                         'Grass production (tons-dry-matter/yr)')

        crop_ro = self.model_parameters["crop"] + '-' + self.model_parameters["rotation"]
        return_data.append(grass_yield)

        # path to R instance
        n_loss_h20 = 0

        r = R(RCMD=self.r_file_path, use_pandas=True)

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

        regionRDS = self.active_region + '.rds'
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

        r("library(randomForest)")
        r("library(dplyr)")
        r("library(tidymodels)")
        r("library(tidyverse)")
        r("savedRF <- readRDS('" + self.model_file_path + "')")
        r(
            "new_dat <- data.frame(slope=slope, elev=elevation, sand=sand, "
            "silt=silt,   clay=clay,     om=om,   ksat=ksat,    "  # cec=cec,     
            "ph=ph,  awc=awc,   total.depth=total_depth )")
        r(
            'cropname <- factor(c("Bluegrass-clover", "Orchardgrass-clover",'
            '"Timothy-clover"))')
        r(
            "df_repeated <- new_dat %>% slice(rep(1:n(), each=length(cropname)))")
        r("new_df <- cbind(cropname, df_repeated)")
        r("pred_df <- new_df %>% filter(cropname == '" + grass + "')")
        r("pred <- predict(savedRF, pred_df)")

        pred = r.get("pred").to_numpy()
        pred = pred * float(self.model_parameters["graze_factor"])
        grass_yield.set_data(pred.flatten())
        grass_yield.set_data_alternate(pred.flatten())
        if self.main_type:
            rotation_avg.set_data(pred.flatten())
        del r
        return return_data
