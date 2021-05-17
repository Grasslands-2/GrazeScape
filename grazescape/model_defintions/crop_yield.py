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
        self.raster_inputs = input_raster_dic
        # with open(self.model_data_inputs_path, "w") as f:


    def run_model(self):
#         }, {
#         value: 'dl',
#         display: 'Dry Lot'
#
#     }, {
#     value: 'cc',
#     display: 'Continuous Corn'
        #
        # }, {
        # value: 'cg',
        # display: 'Cash Grain (cg/sb)'
        # }, {
        # value: 'dr',
        # display: 'Corn Silage to Corn Grain to Alfalfa(3x)'
        # }, {
        # value: 'cso',
        # display: 'Corn Silage to Soybeans to Oats'
        # }]
        crop = self.model_parameters["crop"]
        if crop == "cc":
            self.units = ""
            self.display_units = ""
            conver_factor = 0
        for y in range(0, self.bounds):
            for x in range(0, self.bounds):
                convert_value = self.raster_inputs[self.model_type][y][x]
                # [bushels/acre x 10] original units
                # converting to  tons of dry matter
                convert_value = ((convert_value / 10) * 56 / 2000)
                self.raster_inputs[y][x] = convert_value
                # f.write(str(convert_value) + "\n")
        return np.loadtxt(self.model_data_inputs_path)


