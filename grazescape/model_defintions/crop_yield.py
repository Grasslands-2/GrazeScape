from abc import ABC

from grazescape.model_defintions.model_base import ModelBase
from pyper import R
from django.conf import settings
import os
import numpy as np


class CropYield(ModelBase):
    def __init__(self,request, model_type, file_name=None):
        super().__init__(request, file_name)
        self.model_type = model_type
        # original units are in  [bushels/acre x 10] (to keep values in integer)

        self.units = "Dry Mass tons/ac"

    # overwriting abstract method
    def write_model_input(self, input_raster_dic, model_layer):
        with open(self.model_data_inputs_path, "w") as f:
            for y in range(0, self.bounds):
                for x in range(0, self.bounds):
                    convert_value = input_raster_dic[self.model_type][y][x]
                    convert_value = ((convert_value / 10) * 56 / 2000)
                    f.write(str(convert_value) + "\n")

    def run_model(self):

        return np.loadtxt(self.model_data_inputs_path)


