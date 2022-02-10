from abc import ABC

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import R
from django.conf import settings
import os
import numpy as np


class GenericModel(ModelBase):
    def __init__(self,request, model_type, is_smart_scape, file_name=None ):
        super().__init__(request, file_name, is_smart_scape)
        self.model_type = model_type

    # overwriting abstract method
    # TODO should include data type so we all get one raster
    def run_model(self):
        slope = self.raster_inputs["slope"].flatten()
        generic = OutputDataNode("Generic", "", "")
        generic.set_data(slope)
        return [generic]



