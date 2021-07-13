from abc import ABC

from grazescape.model_defintions.model_base import ModelBase
from pyper import R
from django.conf import settings
import os
import numpy as np

class GenericModel(ModelBase):
    def __init__(self,request, model_type, file_name=None):
        super().__init__(request, file_name)
        self.model_type = model_type

    # overwriting abstract method
    # TODO should include data type so we all get one raster
    def write_model_input(self, input_raster_dic):
        with open(self.model_data_inputs_path, "w") as f:
            # for raster in input_raster_dic:
            for y in input_raster_dic["ls"]:
                for x in y:
                    f.write(str(x) + "\n")

    def run_model(self):

        return np.loadtxt(self.model_data_inputs_path)


