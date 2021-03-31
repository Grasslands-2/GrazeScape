from abc import ABC

from grazescape.model_defintions.model_base import ModelBase
from pyper import R
from django.conf import settings
import os


class GrassYield(ModelBase):
    def __init__(self, request,file_name=None):
        super().__init__(request, file_name)
        self.model_name = "Grass_pred_noAWC.rds"
        self.model_file_path = os.path.join( self.model_file_path, self.model_name)
        print(self.model_parameters.POST.getlist('model_parameters[grass_type]'))
        print(self.model_parameters.POST.getlist('model_parameters[grass_type]')[0].lower())
        self.grass_type = self.model_parameters.POST.getlist('model_parameters[grass_type]')[0].lower()
        self.units = "tons/ac"
    # overwriting abstract method
    def write_model_input(self, input_raster_dic, bounds):


        with open(self.model_data_inputs_path, "w") as f:
            # dummy references to get model to run. Are removed later
            # TODO ask Elissa about ways to remove these
            f.write(
                "slope,elev,sand,silt,clay,om,ksat,cec,ph,total.depth\n")
            for y in range(0, bounds["y"]):
                for x in range(0, bounds["x"]):
                    f.write(str(input_raster_dic["slope_data"][y][x]) + "," +
                            str(input_raster_dic["elevation"][y][x] * 0.3048) + "," +
                            str(input_raster_dic["sand"][y][x]) + "," +
                            str(input_raster_dic["silt"][y][x]) + "," +
                            str(input_raster_dic["clay"][y][x]) + "," +
                            str(input_raster_dic["om"][y][x]) + "," +
                            str(input_raster_dic["k"][y][x]) + "," +
                            str(input_raster_dic["cec"][y][x]) + "," +
                            str(input_raster_dic["ph"][y][x]) + "," +
                            # str(.2) + "," +
                            str(input_raster_dic["total_depth"][y][x]) + "\n"
                            # str(75) + ", " +
                            # str(.15) + "\n"
                            )

    def run_model(self):
        # path to R instance
        grass = ''
        r = R(RCMD=self.r_file_path, use_pandas=True)
        if 'bluegrass' in self.grass_type:
            grass = "Bluegrass-clover"
        elif 'orchard' in self.grass_type:
            grass = "Orchardgrass-clover"
        elif 'timothy' in self.grass_type:
            grass = "Timothy-clover"
        pred = [1,2,3]
            # "{}, ".format(grass)
        print("RRRR")
        print(self.model_data_inputs_path)
        print(r("library(randomForest)"))
        print(r("library(dplyr)"))
        print(r("savedRF <- readRDS('" + self.model_file_path + "')"))
        print(r("new_dat <- read.csv('" + self.model_data_inputs_path + "')"))
        print(r('cropname <- factor(c("Bluegrass-clover", "Orchardgrass-clover","Timothy-clover"))'))
        print(r("df_repeated <- new_dat %>% slice(rep(1:n(), each=length(cropname)))"))
        print(r("new_df <- cbind(cropname, df_repeated)"))
        print(r("pred_df <- new_df %>% filter(cropname == '" + grass + "')"))
        print(r("pred <- predict(savedRF, pred_df)"))
        pred = r.get("pred")
        print("Model Results")
        print(pred)
        # Remove the three dummy references
        return pred


if __name__ == '__main__':
    model = GrassYield()
    print(model.get_file_name())
