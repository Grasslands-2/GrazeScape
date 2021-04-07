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
        self.units = "PI"
    # overwriting abstract method

    def write_model_input(self, input_raster_dic, bounds):
        # Phos model needs erosion model as input
        model = Erosion(self.model_parameters)
        model.write_model_input(input_raster_dic, bounds)
        results = model.run_model()
        results = model.reshape_model_output(results, bounds)
        input_raster_dic['erosion'] = results
        with open(self.model_data_inputs_path, "w") as f:
            f.write(
                "Erosion,slope,initialP,OM,totalP2O5_lbs,total_DM_lbs,slopelenusle.r,silt,k,"
                "total.depth,LSsurgo\n")

            for y in range(0, bounds["y"]):
                for x in range(0, bounds["x"]):
                    f.write(str(input_raster_dic["erosion"][y][x]) + "," +
                            str(input_raster_dic["slope_data"][y][x]) + "," +
                            str(self.model_parameters.POST.getlist("model_parameters[initial_p]")[0]) + "," +
                            str(input_raster_dic["om"][y][x]) + "," +
                            str(60) + "," +
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
        tillage = self.model_parameters.POST.getlist("model_parameters[tillage]")[0]
        contour = self.model_parameters.POST.getlist("model_parameters[contour]")[0]
        print(self.model_data_inputs_path)
        # print(r("install.packages('randomForest')"))
        print(r("library(randomForest)"))
        print(r("library(dplyr)"))

        print(r("savedRF <- readRDS('" + self.model_file_path + "')"))
        print(r("new_dat <- read.csv('" + self.model_data_inputs_path + "')"))

        print(r('tillage <- factor(c("fm","nt","sn","su","sv","fc"))'))
        print(r('Contour <- factor(c("0", "1"))'))

        print(r("df_repeated <- new_dat %>% slice(rep(1:n(), each=length(tillage)))"))
        print(r("new_df <- cbind(tillage, df_repeated)"))
        print(r('pred_df <- new_df %>% filter(tillage == "' + tillage + '")'))

        print(r("df_repeated <- pred_df %>% slice(rep(1:n(), each=length(Contour)))"))
        print(r("new_df <- cbind(Contour, df_repeated)"))
        print(r('pred_df <- new_df %>% filter(Contour =="'+contour+'")'))
        print(r("pred <- predict(savedRF, newdata = pred_df)"))

        pred = r.get("pred")
        print("Model Results")
        print(pred)
        return pred

