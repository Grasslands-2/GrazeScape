from django.conf import settings
import os
import json
import numpy as np
import pickle
import math
# Class for loading and managing raster data from the tainter creek watershed
"""

"""
class RasterData:
    def __init__(self):
        self.is_loaded = False
        self.input_raster_dic = {}
        self.file_dir = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files', 'raster_inputs')

        # self.load_raster_csv()
        self.load_raster_pickle()
    #     load data in a dictionary with filename as key

    def load_raster_csv(self):
        print("Loading data")
        for file in os.listdir(self.file_dir):
            print("Loading file: " + file)
            with open(os.path.join(self.file_dir, file)) as f:
                if '.asc' in file:
                    data = np.loadtxt(f, skiprows = 6)
                    self.input_raster_dic[file.split(".")[0]] = np.array(data)
                elif '.txt' in file:
                    data = json.load(f)
                    # convert ft to meters
                    # if file == "elevation.txt":
                    #     data = data * 0.3048
                    self.input_raster_dic[file.split(".")[0]] = np.array(data)
                else:
                    pass

        self.is_loaded = True
        self.pickle_raster_data()

    def load_raster_pickle(self):
        file_dir = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files', 'raster_inputs', "raster_data.p")
        if not os.path.exists(file_dir):
            self.load_raster_csv()
        self.input_raster_dic = pickle.load(open(os.path.join(self.file_dir, "raster_data.p"), "rb"))
        self.is_loaded = True

    def get_raster_data(self):
        if not self.is_loaded:
            self.load_raster_csv()
        return self.input_raster_dic

    def pickle_raster_data(self):
        file_dir = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files', 'raster_inputs', "raster_data.p")
        pickle.dump(self.input_raster_dic, open(file_dir, "wb"))

    def create_ls_file(self):
        ls_list = []
        with open(os.path.join(settings.BASE_DIR, 'grazescape', 'data_files', 'raster_inputs', "ls.txt"), "w") as f:
            slopes = self.input_raster_dic["slope_data"]
            slope_lengths = self.input_raster_dic["slope_length"]
            for y in range(0, len(self.input_raster_dic["slope_data"])):
                row_ls = []
                for x in range(0, len(self.input_raster_dic["slope_data"][0])):
                    slope = slopes[y][x]
                    slope_length = slope_lengths[y][x]
                    if slope_length < 0:
                        slope_length = 0
                    if 3.0 < slope <= 4:
                        factor = .4
                    elif 1 <= slope <= 3:
                        factor = 0.3
                    elif slope < 1:
                        factor = 0.2
                    else:
                        factor = 0.5
                    ls = 10000 + math.pow(slope, 2)
                    ls1 = slope / (math.pow(ls, 0.5))
                    ls2 = ls1 * 4.56
                    ls3 = math.pow(ls1, 2)
                    ls4 = ls3 * 65.41 + 0.065
                    ls5 = (slope_length * 3.3) / 72.6
                    ls6 = math.pow(ls5, factor)
                    ls_final = (ls2 + ls4) * ls6
                    row_ls.append(ls_final)
                ls_list.append(row_ls)
        ls_list = np.array(ls_list)

        self.input_raster_dic['ls'] = ls_list
        self.pickle_raster_data()
        # ls = (((slope.r / ((10000 + (slope.r ^ 2)) ^ 0.5)) * 4.56) + (slope.r / (10000 + (slope.r ^ 2)) ^ 0.5) ^ 2 * (
        #     65.41) + 0.065) * ((slopelenusle.r * 3.3) / 72.6) ^ (factor)
        # newFloatLayer("ls_dem").init();


if __name__ == '__main__':
    print("hi")
    data = RasterData()
