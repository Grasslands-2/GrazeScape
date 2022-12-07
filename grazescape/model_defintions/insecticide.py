from grazescape.model_defintions.model_base import ModelBase, OutputDataNode

from pyper import R
from django.conf import settings
import os


class Insecticide(ModelBase):
    def __init__(self, request, file_name=None):
        super().__init__(request, file_name)

    def run_model(self):
        crop = self.model_parameters["crop"]
        insect = {"cc": 0.51,
                  "cg": 0.51,
                  "dr": 0.12,
                  "cso": 0.22,
                  "dl": 0,
                  "ps": 0,
                  "pt": 0
                  }
        insect_node = OutputDataNode("insect", "Insecticide Index", "Insecticide Index","Honey bee toxicity","Honey bee toxicity")
        insect_node.set_data(insect[crop])
        return [insect_node]
