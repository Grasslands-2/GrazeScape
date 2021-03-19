from django.conf import settings
import os
import json
import numpy as np


# Class for loading and managing raster data from the tainter creek watershed
"""

"""
class RasterData:
    def __init__(self):
        self.is_loaded = False
        self.input_raster_dic = {}
        self.get_raster_inputs()

    #     load data in a dictionary with filename as key
    def get_raster_inputs(self):
        print("Loading data")
        file_dir = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files', 'raster_inputs')
        for file in os.listdir(file_dir):
            print("Loading file: " + file)
            with open(os.path.join(file_dir, file)) as f:
                data = json.load(f)
                self.input_raster_dic[file.split(".")[0]] = np.array(data)
        self.is_loaded = True

    def get_raster_data(self):
        if not self.is_loaded:
            self.get_raster_inputs()
        return self.input_raster_dic
