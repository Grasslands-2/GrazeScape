from abc import ABC

from grazescape.model_defintions.model_base import ModelBase
from pyper import R
from django.conf import settings
import os
from grazescape.model_defintions.erosion import Erosion


class PhosphorousLoss(ModelBase):
    def __init__(self, request, file_name=None):
        super().__init__(request, file_name)
        self.model_name = "ContCorn_NoCoverPI.rds"
        self.model_file_path = os.path.join(self.model_file_path, self.model_name)

    # overwriting abstract method

    def write_model_input(self, input_raster_dic, bounds):
        # Phos model needs erosion model as input
        model = Erosion(self.model_parameters)
        model.write_model_input(input_raster_dic,bounds)
        results = model.run_model()
        results = model.reshape_model_output(results,bounds)
        input_raster_dic['erosion'] = results

        with open(self.model_data_inputs_path, "w") as f:
            f.write(
                "PI,Erosion,tillage,slope,Contour,initialP,OM,totalP2O5_lbs,total_DM_lbs,slopelenusle.r,silt,k,"
                "total.depth,LSsurgo\n")
            for y in range(0, bounds["y"]):
                for x in range(0, bounds["x"]):
                    f.write(str(0) + ", " +
                            str(input_raster_dic["erosion"][y][x]) + "," +
                            str(self.model_parameters.POST.getlist("model_parameters[tillage]")[0]) + "," +
                            str(input_raster_dic["slope_data"][y][x]) + "," +
                            str(self.model_parameters.POST.getlist("model_parameters[contour]")[0]) + "," +
                            str(self.model_parameters.POST.getlist("model_parameters[intial_p]")[0]) + "," +
                            str(input_raster_dic["om"][y][x]) + "," +
                            str(0) + "," +
                            str(0) + "," +
                            str(input_raster_dic["slope_length"][y][x]) + "," +
                            str(input_raster_dic["silt"][y][x]) + "," +
                            str(input_raster_dic["k"][y][x]) + "," +
                            str(input_raster_dic["total_depth"][y][x]) + "," +
                            str(input_raster_dic["ls"][y][x]) + "\n"
                            )

    def run_model(self):
        # path to R instance
        r = R(RCMD=self.r_file_path, use_pandas=True)
        print("RRRR")
        print(self.model_data_inputs_path)
        # print(r("install.packages('randomForest')"))
        r("library(randomForest)")
        r("savedRF <- readRDS('" + self.model_file_path + "')")
        r("grass <- read.csv('" + self.model_data_inputs_path + "')")
        r("new_dat <- data.frame(grass)")
        r("new_dat$cropname <- as.factor(new_dat$cropname)")
        r("pred <- predict(savedRF, new_dat)")
        pred = r.get("pred")
        print("Model Results")
        print(pred)
        return

