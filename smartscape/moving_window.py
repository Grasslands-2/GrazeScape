from osgeo import gdal
from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from django.conf import settings
import os
import numpy as np
from PIL import Image
from osgeo import gdal
from osgeo import gdalconst as gc
import requests
import numpy as np
from pyper import R
import geopandas as gpd
from shapely.geometry import Polygon
import os
import sys
from django.conf import settings
import math
import shutil
import threading
import time
import multiprocessing
import concurrent.futures
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
# import the regressor
from sklearn.ensemble import RandomForestRegressor
import pickle


class MovingWindow:
    """
    Moving window analysis for rasters
    Attributes
    ----------
    padding_size : int
        How many cells to pad the input raster with. Cell is roughly 30 m
    input_data : 2D numpy array
        Values to use the moving window on
    """

    def __init__(self, padding_size, input_data):
        # self.r_path = settings.R_PATH
        self.windowed_raster = None
        self.r_path = "C://Program Files/R/R-4.1.2/bin/x64/R.exe"
        # self.model_path = settings.MODEL_PATH
        self.model_path = "C://Users/mmbay/Work/GrazeScape/grazescape/data_files/input_models"
        self.bird_model = "BirdIndexModel.rds"
        self.padding_size = padding_size
        # we want to make sure our window size is proportional to our padding
        self.window_size = self.padding_size * 2 + 1
        self.no_data = -9999
        self.input_data = input_data
        self.total_window_cells = self.window_size * self.window_size

    def create_window_raster(self):
        padded = np.pad(np.copy(self.input_data), (self.padding_size, self.padding_size),
                        'constant', constant_values=(self.no_data, self.no_data))
        r = np.lib.stride_tricks.sliding_window_view(padded, window_shape=(self.window_size, self.window_size))

        self.windowed_raster = r

    def create_bird_cat(self, rows, cols):
        base = np.empty((rows, cols))
        base.fill(0)
        return {
            1: np.copy(base),
            2: np.copy(base),
            3: np.copy(base),
            4: np.copy(base),
            5: np.copy(base),
            8: np.copy(base),
            9: np.copy(base),
            10: np.copy(base),
            11: np.copy(base),
            12: np.copy(base),
            13: np.copy(base),
            self.no_data: np.copy(base),
        }

    def cal_land_use_per(self, bird_cat):
        for cat in bird_cat:
            if cat != self.no_data:
                print(cat)
                bird_cat[cat] = np.where(bird_cat[cat] != self.no_data, bird_cat[cat]/(self.total_window_cells - bird_cat[self.no_data]) * 100, bird_cat[cat])


        print(bird_cat[self.no_data])
        print(self.total_window_cells)
        return bird_cat

    def run_model_bird(self):
        # self.create_window_raster()
        window_raster = self.windowed_raster
        print("input shape", self.input_data.shape)
        # if center cell is no data make cell no data
        # print(r)
        print("moving window subsets", window_raster.shape)
        # this calculates the center of the window
        index_val = math.floor(self.window_size / 2)
        print("row and col of index", index_val)
        # new_w = window_raster.flatten(2)
        # print(new_w.shape)
        [rows, cols, r, c] = window_raster.shape
        base = np.empty((rows, cols))
        base.fill(-9999)
        print(base.shape)
        # print(base)
        # np.where()
        bird_cat = self.create_bird_cat(rows, cols)
        # print("starting long loop")
        x = 0
        y_count = 0
        x_count = 0
        # TODO look at implementing this loop with cython
        for iy in range(0, base.shape[0]):
            #
            for ix in range(0, base.shape[1]):
                # get index of stored moving window
                b = window_raster[iy, ix]
                # only compute cell index if its no data
                # if b[index_val][index_val] != self.no_data:
                #     # count number of cells in each category for each cell
                #     for y in b:
                #         for x in y:
                #             if bird_cat[x][iy, ix] == self.no_data:
                #
                #                 bird_cat[x][iy, ix] = 1
                #             else:
                #                 bird_cat[x][iy, ix] = 1 + bird_cat[x][iy, ix]

                x_count = x_count + 1
            y_count = y_count + 1
        print("finished long loop")
        print(bird_cat[10])
        bird_cat = self.cal_land_use_per(bird_cat)
        print(bird_cat)
        file_path = "C:/Users/mmbay/Downloads/pythonBird_model.sav"
        model = pickle.load(open(file_path, 'rb'))
        array1 = {
            "forest": bird_cat[11].flatten(),
            "wetland": bird_cat[13].flatten(),
            "water": bird_cat[12].flatten(),
            "lowUrban": bird_cat[2].flatten(),
            "highUrban": bird_cat[1].flatten(),
            "dr": bird_cat[5].flatten(),
            "cc": bird_cat[4].flatten(),
            "cg": bird_cat[3].flatten(),
            "hay": bird_cat[8].flatten(),
            "pasture": bird_cat[9].flatten(),
            "grassland": bird_cat[10].flatten(),
            "ppt": bird_cat[10].flatten(),
            "tmax": bird_cat[10].flatten(),

    }
        # print(array1["ppt"].fill(89))
        # print(array1["ppt"])
        array1["ppt"].fill(110)
        array1["tmax"].fill(25.5)
        data = pd.DataFrame(array1)
        print(data)
        pred = model.predict(data)
        print(pred)


if __name__ == "__main__":
    test_file_path = "C://Users/mmbay/Work/work/grazescape_utilities/Bird Model/landuse-clipped.tif"
    image1 = gdal.Open(test_file_path)
    outdata = image1.GetRasterBand(1).ReadAsArray()
    outdata1 = np.array(
                    [[1, 2, 3, 7, 8, 2],
                     [4, 5, 6, 9, 1, 2],
                     [7, 8, 9, 9, 4, 2],
                     [7, 8, 19, 3, 4, 2],
                     [8, 8, 9, 3, 4, 2],
                     ])
    # outdata = np.array(
    #                 [[8, 8, 8, 8, 8, 8],
    #                  [8, 8, 8, 8, 8, 8],
    #                  [9, 9, 9, 9, 9, 9],
    #                  [9, 9, 9, 9, 9, 9],
    #                  [10, 10, 10, 10, 10, 10],
    #                  ])
    image1.FlushCache()

    band = None
    ds = None

    padding = 1
    # window size is 2 times padding + 1
    window = MovingWindow(padding, outdata)
    window.create_window_raster()
    window.run_model_bird()
    outdata = None

