from abc import ABC

from grazescape.model_defintions.model_base import ModelBase
from pyper import R
from django.conf import settings
import os


class Erosion(ModelBase):
    def __init__(self, request, file_name=None):
        super().__init__(request, file_name)
        self.model_name = "ContCorn_NoCoverErosion.rds"
        self.model_file_path = os.path.join( self.model_file_path, self.model_name)
        self.units = "tons of soil / acre"
    # overwriting abstract method
    def write_model_input(self, input_raster_dic):
        with open(self.model_data_inputs_path, "w") as f:
            # dummy references to get model to run. Are removed later
            # TODO ask Elissa about ways to remove these
            print(self.model_parameters)
            print(self.model_parameters.POST.getlist("model_parameters[contour]"))
            f.write(
                "slope,total_DM_lbs,slopelenusle.r,sand,silt,clay,k\n")
            for y in range(0, self.bounds["y"]):
                for x in range(0, self.bounds["x"]):
                    f.write(str(input_raster_dic["slope_data"][y][x]) + "," +
                            # constant will be provided value later
                            "0" + "," +
                            str(input_raster_dic["slope_length"][y][x]) + "," +
                            str(input_raster_dic["sand"][y][x]) + "," +
                            str(input_raster_dic["silt"][y][x]) + "," +
                            str(input_raster_dic["clay"][y][x]) + "," +
                            str(input_raster_dic["k"][y][x]) + "\n"

                            )

    def run_model(self):
        # path to R instance
        r = R(RCMD=self.r_file_path, use_pandas=True)
        tillage = self.model_parameters.POST.getlist("model_parameters[tillage]")[0]
        contour = self.model_parameters.POST.getlist("model_parameters[contour]")[0]

        print("RRRR")
        print(self.model_data_inputs_path)
        # print(r("install.packages('randomForest')"))
        r("library(randomForest)")
        r("library(dplyr)")

        r("savedRF <- readRDS('" + self.model_file_path + "')")
        r("new_dat <- read.csv('" + self.model_data_inputs_path + "')")

        r('tillage <- factor(c("fm","nt","sn","su","sv","fc"))')
        r('Contour <- factor(c("0", "1"))')
        r("df_repeated <- new_dat %>% slice(rep(1:n(), each=length(tillage)))")
        r("new_df <- cbind(tillage, df_repeated)")
        r('pred_df <- new_df %>% filter(tillage == "' + tillage + '")')

        r("df_repeated <- pred_df %>% slice(rep(1:n(), each=length(Contour)))")
        r("new_df <- cbind(Contour, df_repeated)")
        r('pred_df <- new_df %>% filter(Contour =="'+contour+'")')
        r("pred <- predict(savedRF, newdata = pred_df)")

        pred = r.get("pred")
        print("Model Results")
        # Remove the three dummy references
        return pred

