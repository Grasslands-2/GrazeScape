"""
Class for handling and formatting data for SmartScape transformations
Author: Matthew Bayles
Created: November 2021
Python Version: 3.9.2
"""
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
from smartscape.model_definitions.bird_model import window
import csv

Ft_To_Meters = 0.3048


class SmartScape:
    """
    Child of ModelBase that is specific for running SmartScape.
    Attributes
    ----------
    raster_image_file_path : str
        File path for the output png of the transformation selection.
    bounds : list of dict
        List of x and y bounds, each of which is a dict of min and max coordinates
    raster_inputs : dic
        dictionary of 2d arrays representing raster values
    no_data : int
        no data value to applied across all rasters

    in_dir : str
        File path for input files.
    """

    def __init__(self, request_json, file_name, geo_folder):
        """
        Constructor.
        Parameters
        ----------
        request_json : request object formatted as json
            The json object from the client
        file_name : str
            File name of the transformation. Used for creating folders for transformation input and output
        geo_folder : str
            The folder where previously downloaded input rasters reside
        """
        self.file_name = file_name
        self.raster_image_file_path = os.path.join(settings.BASE_DIR,
                                                   'smartscape', 'data_files',
                                                   'raster_inputs',
                                                   self.file_name, "selection.png")
        self.bounds = {"x": 0, "y": 0}
        self.raster_inputs = {}
        self.no_data = -9999
        self.data_dir = os.path.join(settings.BASE_DIR, 'smartscape', 'data_files', 'raster_inputs')
        self.in_dir = os.path.join(settings.BASE_DIR, 'smartscape', 'data_files',
                                   'raster_inputs', self.file_name)
        if not os.path.exists(self.in_dir):
            os.makedirs(self.in_dir)
        self.geo_folder = os.path.join(settings.BASE_DIR, 'smartscape', 'data_files',
                                       'raster_inputs', geo_folder)
        self.request_json = request_json
        self.threads = []
        self.nrec_dict = {}
        self.region = None
        self.rotation_types = {"pasture": ["pasture"], "corn": ["corn"], "corn_grain": ["corn", "soy"],
                               "dairy": ["silage", "alfalfa", "corn"]}

    def create_tif(self, input_array, base_tiff, file_name):
        [rows, cols] = input_array.shape
        driver = gdal.GetDriverByName("GTiff")
        outdata = driver.Create(os.path.join(self.in_dir, file_name + ".tif"), cols, rows, 1,
                                gdal.GDT_Float32)
        outdata.SetGeoTransform(base_tiff.GetGeoTransform())  ##sets same geotransform as input
        outdata.SetProjection(base_tiff.GetProjection())  ##sets same projection as input
        outdata.GetRasterBand(1).WriteArray(input_array)
        outdata.GetRasterBand(1).SetNoDataValue(-9999)
        # write to disk
        outdata.FlushCache()
        outdata = None

    def get_model_png(self):
        """
        Create display png and raster indicating no data, selected, and unselected cells
        Parameters
        ----------

        """
        datanm_slope = self.raster_inputs["slope"]
        # create an array with all true values so that and-ing it with actual data will work
        datanm = np.copy(datanm_slope)
        datanm.fill(-99)
        datanm_landuse = datanm
        datanm_stream = datanm
        rows = self.bounds["y"]
        cols = self.bounds["x"]
        slope1 = self.request_json["selectionCrit"]["selection"]["slope1"]
        slope2 = self.request_json["selectionCrit"]["selection"]["slope2"]
        stream_dist1 = self.request_json["selectionCrit"]["selection"]["streamDist1"]
        stream_dist2 = self.request_json["selectionCrit"]["selection"]["streamDist2"]
        use_ft = self.request_json["selectionCrit"]["selection"]["useFt"]
        landuse_par = self.request_json["selectionCrit"]["selection"]["landCover"]
        land_class = self.request_json["selectionCrit"]["selection"]["landClass"]
        farm_class = self.request_json["selectionCrit"]["selection"]["farmClass"]

        has_slope = False
        has_land = False
        has_stream = False

        # create empty raster to hold values from above calc
        image1 = gdal.Open(os.path.join(self.geo_folder, "landuse-clipped.tif"))
        band = image1.GetRasterBand(1)
        arr_landuse = band.ReadAsArray()

        image1 = gdal.Open(os.path.join(self.geo_folder, "landuse_aoi-clipped.tif"))
        band = image1.GetRasterBand(1)
        arr_total_valid_cells = band.ReadAsArray()
        total_cells = np.count_nonzero(arr_total_valid_cells != self.no_data)

        driver = gdal.GetDriverByName("GTiff")
        outdata = driver.Create(os.path.join(self.in_dir, "landuse_watershed.tif"), cols, rows, 1,
                                gdal.GDT_Float32)
        # set metadata to an existing raster
        outdata.SetGeoTransform(
            image1.GetGeoTransform())  ##sets same geotransform as input
        outdata.SetProjection(
            image1.GetProjection())  ##sets same projection as input
        outdata.GetRasterBand(1).WriteArray(self.raster_inputs["landuse"])
        outdata.GetRasterBand(1).SetNoDataValue(self.no_data)
        # write to disk
        outdata.FlushCache()
        outdata = None
        band = None
        ds = None

        if use_ft:
            stream_dist1 = float(stream_dist1) * Ft_To_Meters
            stream_dist2 = float(stream_dist2) * Ft_To_Meters

        # print(rows, cols)
        # create empty 2d array for the png
        three_d = np.empty([rows, cols, 4])
        # create array to display red for selected cells
        # three_d[0:rows, 0:cols] = [255, 0, 0, 255]
        # three_d[0:rows, 0:cols] = [37, 175, 198, 255]
        # three_d[0:rows, 0:cols] = [238, 119, 51, 255]
        # black
        three_d[0:rows, 0:cols] = [162, 6, 157, 255]
        # selection parameters: 1 if passes 0 otherwise
        print("about to start selecting by slope")
        # https://gis.stackexchange.com/questions/163007/raster-reclassify-using-python-gdal-and-numpy
        # need to separate out no data value; so we will have selected, no selected but within area
        # and no data (should just be values outside of subarea)
        # set selected to -99
        if slope1 is not None and slope2 is not None:
            datanm_slope = self.raster_inputs["slope"]
            datanm_slope = np.where(
                np.logical_and(datanm_slope > float(slope1), float(slope2) > datanm_slope), -99, datanm_slope
            )
            has_slope = True
            datanm = np.where(np.logical_and(datanm == -99, datanm_slope == -99), -99, self.no_data)
            # self.create_tif(datanm_slope, image1, "zzzslope_selection")

        if stream_dist1 is not None and stream_dist2 is not None:
            datanm_stream = self.raster_inputs["stream_dist"]
            datanm_stream = np.where(
                np.logical_and(datanm_stream > float(stream_dist1), float(stream_dist2) > datanm_stream), -99,
                datanm_stream
            )
            has_stream = True
            # combine base case with slope
            datanm = np.where(np.logical_and(datanm == -99, datanm_stream == -99), -99, self.no_data)
        #     has_stream = True
        print("selecting by landclass")
        datanm_landclass = self.raster_inputs["land_class"]
        print(land_class)
        if land_class["land1"]:
            datanm_landclass = np.where(
                np.logical_and(1 == datanm_landclass, datanm_landclass != self.no_data), -99, datanm_landclass)
        if land_class["land2"]:
            datanm_landclass = np.where(
                np.logical_and(2 == datanm_landclass, datanm_landclass != self.no_data), -99, datanm_landclass
            )
        if land_class["land3"]:
            datanm_landclass = np.where(
                np.logical_and(3 == datanm_landclass, datanm_landclass != self.no_data), -99, datanm_landclass
            )
        if land_class["land4"]:
            datanm_landclass = np.where(
                np.logical_and(4 == datanm_landclass, datanm_landclass != self.no_data), -99, datanm_landclass
            )
        if land_class["land5"]:
            datanm_landclass = np.where(
                np.logical_and(5 == datanm_landclass, datanm_landclass != self.no_data), -99, datanm_landclass
            )
        if land_class["land6"]:
            datanm_landclass = np.where(
                np.logical_and(6 == datanm_landclass, datanm_landclass != self.no_data), -99, datanm_landclass
            )
        if land_class["land7"]:
            datanm_landclass = np.where(
                np.logical_and(7 == datanm_landclass, datanm_landclass != self.no_data), -99, datanm_landclass
            )
        if land_class["land8"]:
            datanm_landclass = np.where(
                np.logical_and(8 == datanm_landclass, datanm_landclass != self.no_data), -99, datanm_landclass
            )

        datanm_farmclass = self.raster_inputs["farm_class"]
        if farm_class["prime"]:
            datanm_farmclass = np.where(
                np.logical_and(1 == datanm_farmclass, datanm_farmclass != self.no_data), -99, datanm_farmclass
            )
        if farm_class["stateFarm"]:
            datanm_farmclass = np.where(
                np.logical_and(2 == datanm_farmclass, datanm_farmclass != self.no_data), -99, datanm_farmclass
            )
        if farm_class["notPrime"]:
            datanm_farmclass = np.where(
                np.logical_and(3 == datanm_farmclass, datanm_farmclass != self.no_data), -99, datanm_farmclass
            )
        if farm_class["prime1"]:
            datanm_farmclass = np.where(
                np.logical_and(4 == datanm_farmclass, datanm_farmclass != self.no_data), -99,
                datanm_farmclass
            )
        if farm_class["prime2"]:
            datanm_farmclass = np.where(
                np.logical_and(5 == datanm_farmclass, datanm_farmclass != self.no_data), -99,
                datanm_farmclass
            )
        if farm_class["prime3"]:
            datanm_farmclass = np.where(
                np.logical_and(6 == datanm_farmclass, datanm_farmclass != self.no_data), -99,
                datanm_farmclass
            )

        datanm_landuse = self.raster_inputs["landuse"]
        if landuse_par["cashGrain"]:
            datanm_landuse = np.where(
                np.logical_and(3 == datanm_landuse, datanm_landuse != self.no_data), -99, datanm_landuse
            )
        if landuse_par["contCorn"]:
            datanm_landuse = np.where(
                np.logical_and(4 == datanm_landuse, datanm_landuse != self.no_data), -99, datanm_landuse
            )
        if landuse_par["dairy"]:
            datanm_landuse = np.where(
                np.logical_and(5 == datanm_landuse, datanm_landuse != self.no_data), -99, datanm_landuse
            )
        if landuse_par["potato"]:
            datanm_landuse = np.where(
                np.logical_and(6 == datanm_landuse, datanm_landuse != self.no_data), -99, datanm_landuse
            )
        if landuse_par["cranberry"]:
            datanm_landuse = np.where(
                np.logical_and(7 == datanm_landuse, datanm_landuse != self.no_data), -99, datanm_landuse
            )
        if landuse_par["hay"]:
            datanm_landuse = np.where(
                np.logical_and(8 == datanm_landuse, datanm_landuse != self.no_data), -99, datanm_landuse
            )
        if landuse_par["pasture"]:
            datanm_landuse = np.where(
                np.logical_and(9 == datanm_landuse, datanm_landuse != self.no_data), -99, datanm_landuse
            )
        if landuse_par["grasslandIdle"]:
            datanm_landuse = np.where(
                np.logical_and(10 == datanm_landuse, datanm_landuse != self.no_data), -99, datanm_landuse
            )
        land_class_selected = any(val is True for val in land_class.values())
        farm_class_selected = any(val is True for val in farm_class.values())
        print("land selected and farm selected", land_class_selected, farm_class_selected)
        if land_class_selected:
            datanm = np.where(np.logical_and(datanm == -99, datanm_landclass == -99), -99, self.no_data)
        print("selected cells land class", np.count_nonzero(datanm_landclass == -99))
        if farm_class_selected:
            datanm = np.where(np.logical_and(datanm == -99, datanm_farmclass == -99), -99, self.no_data)
        print("selected cells farmclass", np.count_nonzero(datanm_farmclass == -99))
        datanm = np.where(np.logical_and(datanm == -99, datanm_landuse == -99), -99, self.no_data)

        selected_cells = np.count_nonzero(datanm != self.no_data)
        print("selected cells", selected_cells)
        datanm_image = np.copy(datanm)
        # selected values get 1 and everything else gets a zero
        datanm_image = np.where(
            np.logical_and(datanm_image == -99, datanm_image == -99), 1, 0
        )
        # set non selected but still in bounds to -88
        datanm = np.where(
            np.logical_and(self.raster_inputs["landuse"] != self.no_data, datanm != -99), -88, datanm)

        # create empty raster to hold values from above calc
        driver = gdal.GetDriverByName("GTiff")
        outdata = driver.Create(os.path.join(self.in_dir, "selection_output.tif"), cols, rows, 1,
                                gdal.GDT_Float32)
        image1 = gdal.Open(os.path.join(self.geo_folder, "landuse-clipped.tif"))
        # set metadata to an existing raster
        outdata.SetGeoTransform(
            image1.GetGeoTransform())  ##sets same geotransform as input
        outdata.SetProjection(
            image1.GetProjection())  ##sets same projection as input
        outdata.GetRasterBand(1).WriteArray(datanm)
        outdata.GetRasterBand(1).SetNoDataValue(self.no_data)
        # write to disk
        outdata.FlushCache()
        outdata = None
        band = None
        ds = None

        # add dimensions to data array so we can convert it to a RGBA image
        datanm_image = np.expand_dims(datanm_image, axis=2)
        datanm_image = datanm_image * three_d
        datanm_image = datanm_image.astype(np.uint8)
        im = Image.fromarray(datanm_image)
        im.convert('RGBA')
        # saving the final output
        # as a PNG file
        im.save(self.raster_image_file_path)
        return selected_cells / total_cells

    def download(self, link, filelocation):
        r = requests.get(link, stream=True)
        with open(filelocation, 'wb') as f:
            for chunk in r.iter_content(1024):
                if chunk:
                    f.write(chunk)

    def createNewDownloadThread(self, link, filelocation):
        download_thread = threading.Thread(target=self.download, args=(link, filelocation))
        download_thread.start()
        self.threads.append(download_thread)

    def joinThreads(self):
        for thread in self.threads:
            thread.join()

    def check_file_path(self, base_dic):
        counter = 0
        base_length = len(base_dic)
        for f in os.listdir(os.path.join(self.geo_folder, "base")):
            counter = counter + 1
        if base_length != counter:
            return False
        return True

    def run_models(self):
        """
        Create a model aggregate from all the input transformations specified by client
        -------

        """
        start = time.time()
        mm_to_ac = 0.000247105
        bird_window_size = 13

        # conversion from value / ac to value of cell at 30 m resolution
        # ac_to_m = 900 / 4046.86
        print("starting model aggregation")
        trans = self.request_json['trans']
        base_scen = self.request_json['base']
        region = self.request_json['region']
        self.region = region
        aoi_area_total = self.request_json["aoiArea"]

        insect = {"contCorn": 0.51,
                  "cornGrain": 0.51,
                  "dairyRotation": 0.12,
                  "pasture": 0
                  }
        econ_cost = self.calculate_econ(base_scen)
        self.load_nrec()
        # file_list = []
        # get each transformation selection output raster
        base_dir = os.path.join(self.geo_folder, "base")

        # download om and Nresponse
        # southWestWI_drainClass_30m
        # southWestWI_nResponse_30m
        file_list = []
        for tran1 in trans:
            tran = trans[tran1]
            file = os.path.join(self.data_dir, tran["id"], "selection_output.tif")
            file_list.append(file)
        # download layers for base case
        # create dictionary of base raster file names
        self.create_download_extents_boundary(file_list, trans)

        self.create_base_layers_dic(base_scen, region)
        layer_area_dic, layer_dic = self.create_trans_layers_dic(trans, region)
        # create list of layers to download for each trans
        length_trans = len(trans)
        # trans_with_aoi has our transformation order in the same bounds as our aoi
        image = gdal.Open(os.path.join(self.in_dir, "trans_with_aoi.tif"))
        band = image.GetRasterBand(1)
        geoTransform = image.GetGeoTransform()
        # arr will be the base array that all model calcs pull from. All valid values have the hierarch of the
        # transformation
        arr = band.ReadAsArray()
        start = time.time()
        print(layer_dic)
        # calculate the p value for our input rasters

        self.download_rasters(geoTransform, image, layer_dic)
        # count cells for area that has been selected for the whole aoi
        # this only counts cells from the heierarchy
        # the total area of the selected transformations
        print("down with download at ", time.time() - start)
        # cells selected have the hierarchy number
        selected_cells = np.count_nonzero(arr > 0)
        print("Number of selected cells ", selected_cells)
        # valid cells are -88 and greater
        total_cells = np.count_nonzero(arr > self.no_data)
        print("total number of cells ", np.count_nonzero(arr > self.no_data))
        area_selected_total = aoi_area_total * np.count_nonzero(arr > 0) / np.count_nonzero(arr > self.no_data)
        print("total area selected by transformations aoi ", area_selected_total)
        print("total area in aoi ", aoi_area_total)
        om_filepath = os.path.join(self.geo_folder, "om_aoi-clipped.tif")
        om_image = gdal.Open(om_filepath)
        om_array = om_image.GetRasterBand(1).ReadAsArray()
        # open model results raster
        model_list = ["ploss", "cn", "insect", "econ", "nitrate"]
        # {1:{"yield":"filename", "ero": "filename:}}
        # dic to hold outputs from the models
        model_data = {
            "yield": np.copy(arr),
            "ero": np.copy(arr),
            "ploss": np.copy(arr),
            "cn": np.copy(arr),
            "runoff": np.copy(arr),
            "insect": np.copy(arr),
            "bird": np.copy(arr),
            "econ": np.copy(arr),
            "nitrate": np.copy(arr),
        }
        model_base_data = np.copy(arr)
        result_type = ["base", "selection", "selection_watershed", "base_watershed"]
        model_data_gross = {}
        for tran1 in trans:
            tran = trans[tran1]
            result_list = {}
            for result in result_type:
                model = {
                    "yield": 0,
                    "ero": 0,
                    "ploss": 0,
                    "cn": 0,
                    "runoff": 0,
                    "insect": 0,
                    "bird": 0,
                    "econ": 0,
                    "nitrate": 0,
                    "total_cells": 0
                }
                result_list[result] = model
            model_data_gross[tran["rank"]] = result_list

        # layer holds the file names for each transformation
        for layer in layer_dic:
            cell_count_trans = np.count_nonzero(model_base_data == layer)
            model_data_gross[layer]["selection"]["number_cells"] = cell_count_trans
            print("cell count for the transformation is ", cell_count_trans)
            print("The layer number is ", layer)
            for model in model_list:
                print(model)
                if model == "nitrate":
                    print("nitrate!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

                    ero_filepath = os.path.join(self.in_dir, layer_dic[layer]["ero"] + ".tif")
                    ero_image = gdal.Open(ero_filepath)
                    ero_arr = ero_image.GetRasterBand(1).ReadAsArray()
                    om = np.where(
                        np.logical_and(model_data[model] == layer, om_array != self.no_data), om_array, 0
                    )
                    print("om ", om)
                    print("layer dic  ", layer_dic[layer])
                    print("soy" in layer_dic[layer])
                    # tranformation is a row crop
                    if "soy" in layer_dic[layer]:
                        field_yield = self.calculate_yield_field(base_dir)
                        inter_data_yield = np.where(model_data["yield"] == layer,
                                                    field_yield[trans[str(layer)]["management"]["rotationType"]], 0)
                    # pasture
                    else:
                        yield_filepath = os.path.join(self.in_dir, layer_dic[layer]["yield"] + ".tif")
                        yield_image = gdal.Open(yield_filepath)
                        yield_arr = yield_image.GetRasterBand(1).ReadAsArray()
                        # modify pasture yield by rot freq
                        print("pasture modifier ", float(trans[str(layer)]["management"]["rotFreq"]))
                        yield_arr = yield_arr * float(trans[str(layer)]["management"]["rotFreq"])
                        inter_data_yield = np.where(model_data["yield"] == layer, yield_arr, 0)
                    inter_data_ero = np.where(model_data["ero"] == layer, ero_arr, 0)
                    inter_data_yield = np.sum(
                        np.where(np.logical_or(inter_data_yield == self.no_data, inter_data_yield < 0), 0,
                                 inter_data_yield))
                    inter_data_ero = np.sum(
                        np.where(np.logical_or(inter_data == self.no_data, inter_data_ero < 0), 0, inter_data_ero))
                    if cell_count_trans > 0:
                        model_data_gross[layer]["selection"]["yield"] = inter_data_yield
                        model_data_gross[layer]["selection"]["ero"] = inter_data_ero
                    inter_data_yield = inter_data_yield / cell_count_trans
                    inter_data_ero = inter_data_ero / cell_count_trans
                    tran = trans[str(layer)]
                    n_parameters = self.get_nitrate_params(tran, model_data[model], layer)
                    inter_data = self.nitrate_calc(n_parameters, tran, inter_data_yield, inter_data_ero, om, layer,
                                                   model_data, cell_count_trans)

                elif model == "econ":
                    inter_data = np.where(model_data[model] == layer,
                                          econ_cost[trans[str(layer)]["management"]["rotationType"]], 0)
                elif model == "insect":
                    inter_data = np.where(model_data[model] == layer,
                                          insect[trans[str(layer)]["management"]["rotationType"]], 0)
                # arr is the array from the merged tif
                # layer is the rank of the trans
                # if hierarchy matches the trans rank replace that value with the model value
                else:
                    model_trans_filepath = os.path.join(self.in_dir, layer_dic[layer][model] + ".tif")
                    model_image = gdal.Open(model_trans_filepath)
                    model_band = model_image.GetRasterBand(1)
                    model_arr = model_band.ReadAsArray()

                    if model == "cn":
                        cn_final = np.where(model_data[model] == layer, model_arr, 0)
                        # only looking at 3 in storm
                        inter_data = self.get_runoff_vectorized(cn_final, 3)
                        inter_data = np.sum(
                            np.where(np.logical_or(inter_data == self.no_data, inter_data < 0), 0, inter_data))
                        if cell_count_trans > 0:
                            model_data_gross[layer]["selection"]["runoff"] = inter_data
                        inter_data = cn_final
                    elif model == "ploss":
                        model_trans_filepath1 = os.path.join(self.in_dir, layer_dic[layer]["ploss2"] + ".tif")
                        print(model_trans_filepath1)
                        model_image = gdal.Open(model_trans_filepath1)
                        model_band = model_image.GetRasterBand(1)
                        model_arr_ploss_2 = model_band.ReadAsArray()
                        inter_data1 = np.where(model_data[model] == layer, model_arr, 0)
                        inter_data2 = np.where(model_data[model] == layer, model_arr_ploss_2, 0)
                        # extrapolate out
                        if "200" in layer_dic[layer][model] and "150" in layer_dic[layer]["ploss2"]:
                            x_star = layer_dic[layer]["manure_outbounds"]

                            inter_data = inter_data2 + (x_star - 150) / (200 - 150) * (inter_data1 - inter_data2)
                        # average
                        else:
                            inter_data = (inter_data1 + inter_data2) / 2

                    else:
                        inter_data = np.where(model_data[model] == layer, model_arr, 0)
                inter_data = np.sum(np.where(np.logical_or(inter_data == self.no_data, inter_data < 0), 0, inter_data))
                if cell_count_trans > 0:
                    model_data_gross[layer]["selection"][model] = inter_data
                print("the inter data is ", inter_data)
                print(inter_data / cell_count_trans)
                model_image = None
                model_band = None
                model_arr = None
            print("%%%%%%%%%%%%%%%%%%%%%%%%")

        print("done with trans models")

        print(model_data_gross)

        #   iterate through wiscland layer
        # current land use
        landuse_image = gdal.Open(os.path.join(base_dir, "landuse.tif"))
        landuse_arr = landuse_image.GetRasterBand(1).ReadAsArray()
        cont_pl_image = gdal.Open(os.path.join(base_dir, "hayGrassland_Yield.tif"))
        hay_yield_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        cont_pl_image = gdal.Open(os.path.join(base_dir, "hayGrassland_Erosion.tif"))
        hay_er_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        cont_pl_image = gdal.Open(os.path.join(base_dir, "hayGrassland_PI.tif"))
        hay_pl_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        cont_pl_image = gdal.Open(os.path.join(base_dir, "hayGrassland_CN.tif"))
        hay_cn_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()

        cont_pl_image = gdal.Open(os.path.join(base_dir, "pastureWatershed_Yield.tif"))
        pasture_yield_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        cont_pl_image = gdal.Open(os.path.join(base_dir, "pastureWatershed_Erosion.tif"))
        pasture_er_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        cont_pl_image = gdal.Open(os.path.join(base_dir, "pastureWatershed_PI.tif"))
        pasture_pl_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        cont_pl_image = gdal.Open(os.path.join(base_dir, "pastureWatershed_CN.tif"))
        pasture_cn_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()

        # original landuse
        plain_landuse = np.copy(landuse_arr)
        # create new array where landuse codes are plugged into arr (arr is the raster with rank of the selected cells)
        # and more importantly is has our selected cells
        # selected values are greater than zero
        landuse_arr_sel = np.where(arr > 0, landuse_arr, arr)

        start = time.time()

        base_bird_sum = 0

        print("done with cython ", time.time() - start)
        # replace landuse from base data with new landuse
        for layer in layer_dic:
            plain_landuse = np.where(arr == layer, layer_dic[layer]["land_id"], plain_landuse)

        base_data = {
            "yield": np.copy(landuse_arr_sel),
            "ero": np.copy(landuse_arr_sel),
            "ploss": np.copy(landuse_arr_sel),
            "cn": np.copy(landuse_arr_sel),
            "runoff": np.copy(landuse_arr_sel),
            "insect": np.copy(landuse_arr_sel),
            "econ": np.copy(landuse_arr_sel),
            "nitrate": np.copy(landuse_arr_sel),
        }
        base_image = gdal.Open(os.path.join(base_dir, "contCorn_CN.tif"))
        base_arr_corn_cn = base_image.GetRasterBand(1).ReadAsArray()
        base_image = gdal.Open(os.path.join(base_dir, "cornGrain_CN.tif"))
        base_arr_corngrain_cn = base_image.GetRasterBand(1).ReadAsArray()
        base_image = gdal.Open(os.path.join(base_dir, "dairyRotation_CN.tif"))
        base_arr_dairy_cn = base_image.GetRasterBand(1).ReadAsArray()
        cont_pl_image = gdal.Open(os.path.join(base_dir, "contCorn_PI.tif"))
        cont_pl_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        corn_pl_image = gdal.Open(os.path.join(base_dir, "cornGrain_PI.tif"))
        corn_pl_arr = corn_pl_image.GetRasterBand(1).ReadAsArray()
        dairy_pl_image = gdal.Open(os.path.join(base_dir, "dairyRotation_PI.tif"))
        dairy_pl_arr = dairy_pl_image.GetRasterBand(1).ReadAsArray()
        # Erosion
        cont_pl_image = gdal.Open(os.path.join(base_dir, "contCorn_Erosion.tif"))
        cont_er_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        corn_pl_image = gdal.Open(os.path.join(base_dir, "cornGrain_Erosion.tif"))
        corn_er_arr = corn_pl_image.GetRasterBand(1).ReadAsArray()
        dairy_pl_image = gdal.Open(os.path.join(base_dir, "dairyRotation_Erosion.tif"))
        dairy_er_arr = dairy_pl_image.GetRasterBand(1).ReadAsArray()

        field_yield = self.calculate_yield_field(base_dir)
        cont_yield = field_yield["contCorn"]
        corn_yield = field_yield["cornGrain"]
        dairy_yield = field_yield["dairyRotation"]
        print("base scenario info", base_scen)
        # calculate base case parameters for nitrate
        n_parameters = self.get_nitrate_params_base(base_scen, base_data["nitrate"], total_cells)
        print("base n parameters", n_parameters)

        watershed_land_use_image = gdal.Open(os.path.join(self.geo_folder, "landuse_aoi-clipped.tif"))
        watershed_land_use_band = watershed_land_use_image.GetRasterBand(1)
        watershed_land_use = watershed_land_use_band.ReadAsArray()
        # need to fill in holes for erosion model inputs for nitrate model
        # print("valid cells", np.count_nonzero())
        pasture_er_arr = np.where(np.logical_and(watershed_land_use != self.no_data, pasture_er_arr == self.no_data), 0, pasture_er_arr)
        cont_er_arr = np.where(np.logical_and(watershed_land_use != self.no_data, cont_er_arr == self.no_data), 0, cont_er_arr)
        corn_er_arr = np.where(np.logical_and(watershed_land_use != self.no_data, corn_er_arr == self.no_data), 0, corn_er_arr)
        dairy_er_arr = np.where(np.logical_and(watershed_land_use != self.no_data, dairy_er_arr == self.no_data), 0, dairy_er_arr)
        pasture_yield_arr = np.where(np.logical_and(watershed_land_use != self.no_data, pasture_yield_arr == self.no_data), 0, pasture_yield_arr)

        base_nitrate_data = self.nitrate_calc_base(n_parameters, base_scen,
                                                   pasture_yield_arr, cont_yield, corn_yield, dairy_yield,
                                                   pasture_er_arr, cont_er_arr, corn_er_arr, dairy_er_arr,
                                                   om, total_cells, watershed_land_use)
        # handling bird model for base conditions
        start = time.time()
        base_watershed_bird = window(watershed_land_use, watershed_land_use, bird_window_size, arr, length_trans)
        base_watershed_bird_sum = base_watershed_bird[0]
        base_watershed_bird_sum_base_value = base_watershed_bird[0]
        bird_counter = 0
        for val in base_watershed_bird[1]:
            if val != 0:
                base_watershed_bird_sum = base_watershed_bird_sum + val
                model_data_gross[bird_counter]["base"]["bird"] = val
                base_bird_sum = base_bird_sum + val
            bird_counter = bird_counter + 1
        print("done with cython ", time.time() - start)
        print("base watershed sum", base_watershed_bird_sum)
        # handling bird model for model conditions
        start = time.time()
        model_watershed_bird = window(plain_landuse, watershed_land_use, bird_window_size, arr, length_trans)
        model_data_gross[1]["base_watershed"]["bird"] = model_watershed_bird[0]
        print("done with cython ", time.time() - start)
        bird_counter = 0
        for val in model_watershed_bird[1]:
            if val != 0:
                model_data_gross[bird_counter]["selection_watershed"]["bird"] = val
                model_data_gross[bird_counter]["selection"]["bird"] = val
            bird_counter = bird_counter + 1
        base_data_watershed = {
            "yield": np.copy(watershed_land_use),
            "ero": np.copy(watershed_land_use),
            "ploss": np.copy(watershed_land_use),
            "cn": np.copy(watershed_land_use),
            "runoff": np.copy(watershed_land_use),
            "insect": np.copy(watershed_land_use),
            "econ": np.copy(watershed_land_use),
            "nitrate": np.copy(watershed_land_use),
        }
        watershed_total = {
            1: {"name": "highUrban", "is_calc": False, "yield": 0, "ero": 2, "ploss": 1.34, "cn": 93, "insect": 0.51,
                "bird": 0, "econ": 0, "nitrate": 0},
            2: {"name": "lowUrban", "is_calc": False, "yield": 0, "ero": 2, "ploss": 0.81, "cn": 85, "insect": 0.51,
                "bird": 0, "econ": 0, "nitrate": 0},
            4: {"name": "contCorn", "is_calc": True, "yield": cont_yield, "ero": cont_er_arr, "ploss": cont_pl_arr,
                "cn": base_arr_corn_cn, "insect": 0.51, "bird": 0, "econ": econ_cost["contCorn"],
                "nitrate": base_nitrate_data["corn"]},
            3: {"name": "cornGrain", "is_calc": True, "yield": corn_yield, "ero": corn_er_arr, "ploss": corn_pl_arr,
                "cn": base_arr_corngrain_cn, "insect": 0.51, "bird": 0, "econ": econ_cost["cornGrain"],
                "nitrate": base_nitrate_data["cash_grain"]},
            5: {"name": "dairyRotation", "is_calc": True, "yield": dairy_yield, "ero": dairy_er_arr,
                "ploss": dairy_pl_arr,
                "cn": base_arr_dairy_cn, "insect": 0.12, "bird": 0, "econ": econ_cost["dairyRotation"],
                "nitrate": base_nitrate_data["dairy"]},
            6: {"name": "potVeg", "is_calc": False, "yield": 0, "ero": 0, "ploss": 2, "cn": 75, "insect": 0.12,
                "bird": 0,
                "econ": econ_cost["contCorn"], "nitrate": 0},
            7: {"name": "cran", "is_calc": False, "yield": 0, "ero": 0, "ploss": 2, "cn": 75, "insect": 0.12, "bird": 0,
                "econ": econ_cost["contCorn"], "nitrate": 0},
            8: {"name": "hayGrassland", "is_calc": True, "yield": hay_yield_arr, "ero": hay_er_arr, "ploss": hay_pl_arr,
                "cn": hay_cn_arr, "insect": 0, "bird": 0, "econ": econ_cost["pasture"], "nitrate":0 },
            9: {"name": "pasture", "is_calc": True, "yield": pasture_yield_arr, "ero": pasture_er_arr,
                "ploss": pasture_pl_arr, "cn": pasture_cn_arr, "insect": 0, "bird": 0, "econ": econ_cost["pasture"],
                "nitrate": base_nitrate_data["pasture"]},
            10: {"name": "hayGrassland", "is_calc": True, "yield": hay_yield_arr, "ero": hay_er_arr,
                 "ploss": hay_pl_arr, "cn": hay_cn_arr, "insect": 0, "bird": 0, "econ": 0, "nitrate": 0},
            11: {"name": "forest", "is_calc": False, "yield": 0, "ero": 0, "ploss": 0.067, "cn": 65, "insect": 0,
                 "bird": 0, "econ": 0, "nitrate": 0},
            12: {"name": "water", "is_calc": False, "yield": 0, "ero": 0, "ploss": 0, "cn": 98, "insect": 0, "bird": 0,
                 "econ": 0, "nitrate": 0},
            13: {"name": "wetland", "is_calc": False, "yield": 0, "ero": 0, "ploss": 0, "cn": 85, "insect": 0,
                 "bird": 0, "econ": 0, "nitrate": 0},
            14: {"name": "barren", "is_calc": False, "yield": 0, "ero": 0, "ploss": 0, "cn": 82, "insect": 0, "bird": 0,
                 "econ": 0, "nitrate": 0},
            15: {"name": "shrub", "is_calc": False, "yield": 0, "ero": 0, "ploss": 0.067, "cn": 72, "insect": 0,
                 "bird": 0, "econ": 0, "nitrate": 0},
        }
        # only land use that can be selected
        selec_arr = [3, 4, 5, 6, 7, 8, 9, 10]
        # calc data for base run
        # plugging results from our base case values into our base data. Only values that can be selected will change
        # so we don't need to worry about other land use codes.
        for land in selec_arr:
            cn_final = np.where(base_data["cn"] == land, watershed_total[land]["cn"], base_data["cn"])
            base_data["runoff"] = np.where(base_data["runoff"] == land, self.get_runoff_vectorized(cn_final, 3),
                                           base_data["runoff"])
            base_data["cn"] = cn_final
            base_data["ero"] = np.where(base_data["ero"] == land, watershed_total[land]["ero"], base_data["ero"])
            base_data["insect"] = np.where(base_data["insect"] == land, watershed_total[land]["insect"],
                                           base_data["insect"])
            base_data["yield"] = np.where(base_data["yield"] == land, watershed_total[land]["yield"],
                                          base_data["yield"])
            base_data["ploss"] = np.where(base_data["ploss"] == land, watershed_total[land]["ploss"],
                                          base_data["ploss"])
            base_data["econ"] = np.where(base_data["econ"] == land, watershed_total[land]["econ"], base_data["econ"])
            base_data["nitrate"] = np.where(base_data["nitrate"] == land, watershed_total[land]["nitrate"],
                                            base_data["nitrate"])
        model_list_runoff = ["yield", "ero", "ploss", "cn", "insect", "econ", "runoff", "nitrate"]
        for layer in layer_dic:
            for model in model_list_runoff:
                inter_data = np.where(model_data[model] == layer, base_data[model], 0)
                inter_data = np.sum(np.where(np.logical_or(inter_data == self.no_data, inter_data < 0), 0, inter_data))
                model_data_gross[layer]["base"][model] = inter_data

        base_cn = np.where(
            np.logical_or(base_data["cn"] == self.no_data, base_data["cn"] < 0),
            0, (base_data["cn"]))
        sum_base_cn = np.sum(base_cn)
        base_runoff = np.where(
            np.logical_or(base_data["runoff"] == self.no_data, base_data["runoff"] < 0),
            0, (base_data["runoff"]))
        sum_base_runoff = np.sum(base_runoff)
        base_data["ero"] = np.where(
            np.logical_or(base_data["ero"] == self.no_data, base_data["ero"] < 0),
            0, base_data["ero"])
        sum_base_ero = np.sum(base_data["ero"])
        base_data["insect"] = np.where(
            np.logical_or(base_data["insect"] == self.no_data, base_data["insect"] < 0),
            0, (base_data["insect"]))
        sum_base_insect = np.sum(base_data["insect"])
        landuse_yield = np.where(
            np.logical_or(base_data["yield"] == self.no_data, base_data["yield"] < 0),
            0, base_data["yield"])
        sum_base_yield = np.sum(landuse_yield)
        landuse_arr_sel = np.where(
            np.logical_or(base_data["ploss"] == self.no_data, base_data["ploss"] < 0),
            0, base_data["ploss"])
        sum_base = np.sum(landuse_arr_sel)
        landuse_arr_sel = np.where(
            np.logical_or(base_data["econ"] == self.no_data, base_data["econ"] < 0),
            0, base_data["econ"])
        sum_base_econ = np.sum(landuse_arr_sel)
        landuse_arr_sel = np.where(
            np.logical_or(base_data["nitrate"] == self.no_data, base_data["nitrate"] < 0),
            0, base_data["nitrate"])
        sum_base_nitrate = np.sum(landuse_arr_sel)
        # for each land type in the region we are going to replace cells (the land codes)
        # in the base case with model outputs for each model (the base model not the transformed model)
        # In this instance we do need to look at every possible land use code
        for land_type in watershed_total:
            base_data_watershed["yield"] = np.where(base_data_watershed["yield"] == land_type,
                                                    watershed_total[land_type]["yield"], base_data_watershed["yield"])
            base_data_watershed["ero"] = np.where(base_data_watershed["ero"] == land_type,
                                                  watershed_total[land_type]["ero"], base_data_watershed["ero"])
            base_data_watershed["ploss"] = np.where(base_data_watershed["ploss"] == land_type,
                                                    watershed_total[land_type]["ploss"], base_data_watershed["ploss"])
            base_data_watershed["cn"] = np.where(base_data_watershed["cn"] == land_type,
                                                 watershed_total[land_type]["cn"], base_data_watershed["cn"])
            base_data_watershed["insect"] = np.where(base_data_watershed["insect"] == land_type,
                                                     watershed_total[land_type]["insect"],
                                                     base_data_watershed["insect"])
            base_data_watershed["econ"] = np.where(base_data_watershed["econ"] == land_type,
                                                   watershed_total[land_type]["econ"],
                                                   base_data_watershed["econ"])
            base_data_watershed["nitrate"] = np.where(base_data_watershed["nitrate"] == land_type,
                                                      watershed_total[land_type]["nitrate"],
                                                      base_data_watershed["nitrate"])
            base_data_watershed["runoff"] = self.get_runoff_vectorized(base_data_watershed["cn"], 3)
        # copy the base condition model files, so we can eventually replace the selected cells.
        model_data_watershed = {
            "yield": np.copy(base_data_watershed["yield"]),
            "ero": np.copy(base_data_watershed["ero"]),
            "ploss": np.copy(base_data_watershed["ploss"]),
            "cn": np.copy(base_data_watershed["cn"]),
            "runoff": np.copy(base_data_watershed["runoff"]),
            "insect": np.copy(base_data_watershed["insect"]),
            "econ": np.copy(base_data_watershed["econ"]),
            "nitrate": np.copy(base_data_watershed["nitrate"]),
        }
        for model in model_data_watershed:
            # replace base cells with transformed cells
            if model == "runoff":
                model_data_watershed[model] = np.where(
                    model_data[model] > 0, 0,
                    model_data_watershed[model])
            else:
                # replace any cells in the base watershed with model outputs when the model value exists for that cell
                model_data_watershed[model] = np.where(
                    np.logical_and(model_data[model] != self.no_data, model_data[model] != -88), 0,
                    model_data_watershed[model])
            # zero out bad cells
            inter_data = np.where(
                np.logical_or(model_data_watershed[model] == self.no_data, model_data_watershed[model] < 0),
                0, model_data_watershed[model])
            inter_data = np.sum(inter_data)
            #
            # put all data in first trans because already calculated the data for each trans
            model_data_gross[1]["selection_watershed"][model] = inter_data

        model_data_gross[1]["selection_watershed"]["total_cells"] = total_cells
        # remove zeros from watershed base
        for model in base_data_watershed:
            base_data_watershed[model] = np.where(
                np.logical_or(base_data_watershed[model] == self.no_data, base_data_watershed[model] < 0),
                0, base_data_watershed[model])
        print(model_data_gross)
        area_selected = area_selected_total * mm_to_ac
        area_watershed = aoi_area_total * mm_to_ac

        # combine everything together
        sum_model_yield = 0
        sum_model_ero = 0
        sum_model_ploss = 0
        sum_model_cn = 0
        sum_model_runoff = 0
        sum_model_insect = 0
        sum_model_econ = 0
        sum_model_bird = 0
        sum_model_nitrate = 0

        sum_model_yield_watershed = 0
        sum_model_ero_watershed = 0
        sum_model_ploss_watershed = 0
        sum_model_cn_watershed = 0
        sum_model_runoff_watershed = 0
        sum_model_insect_watershed = 0
        sum_model_econ_watershed = 0
        sum_model_bird_watershed = 0
        sum_model_nitrate_watershed = 0

        layer_count = 0
        trans_adoption_total = 0
        base_adoption_total = 0
        for trans_layer in model_data_gross:
            layer_count = layer_count + 1
            print(trans_layer)
            tran = trans[str(trans_layer)]
            trans_adpotion = int(tran["selection"]["adoptionRate"]) / 100
            base_adpotion = 1 - trans_adpotion
            trans_adoption_total = trans_adoption_total + trans_adpotion
            base_adoption_total = base_adoption_total + base_adpotion

            print("adoption rate ", trans_adpotion)
            print("base adoption rate ", base_adpotion)

            sum_model_yield = sum_model_yield + (model_data_gross[trans_layer]["selection"]["yield"] * trans_adpotion +
                                                 model_data_gross[trans_layer]["base"]["yield"] * base_adpotion)
            sum_model_ero = sum_model_ero + (model_data_gross[trans_layer]["selection"]["ero"] * trans_adpotion +
                                             model_data_gross[trans_layer]["base"]["ero"] * base_adpotion)
            sum_model_ploss = sum_model_ploss + (model_data_gross[trans_layer]["selection"]["ploss"] * trans_adpotion +
                                                 model_data_gross[trans_layer]["base"]["ploss"] * base_adpotion)
            sum_model_cn = sum_model_cn + (model_data_gross[trans_layer]["selection"]["cn"] * trans_adpotion +
                                           model_data_gross[trans_layer]["base"]["cn"] * base_adpotion)
            sum_model_runoff = sum_model_runoff + (
                    model_data_gross[trans_layer]["selection"]["runoff"] * trans_adpotion +
                    model_data_gross[trans_layer]["base"]["runoff"] * base_adpotion)
            sum_model_insect = sum_model_insect + (
                    model_data_gross[trans_layer]["selection"]["insect"] * trans_adpotion +
                    model_data_gross[trans_layer]["base"]["insect"] * base_adpotion)
            sum_model_econ = sum_model_econ + (model_data_gross[trans_layer]["selection"]["econ"] * trans_adpotion +
                                               model_data_gross[trans_layer]["base"]["econ"] * base_adpotion)
            sum_model_bird = sum_model_bird + (model_data_gross[trans_layer]["selection"]["bird"] * trans_adpotion +
                                               model_data_gross[trans_layer]["base"]["bird"] * base_adpotion)
            sum_model_nitrate = sum_model_nitrate + (
                    model_data_gross[trans_layer]["selection"]["nitrate"] * trans_adpotion +
                    model_data_gross[trans_layer]["base"]["nitrate"] * base_adpotion)

            # These are really just the base scenario values with zero values where the model results will go
            sum_model_yield_watershed = sum_model_yield_watershed + \
                                        model_data_gross[trans_layer]["selection_watershed"]["yield"]
            sum_model_ero_watershed = sum_model_ero_watershed + model_data_gross[trans_layer]["selection_watershed"][
                "ero"]
            sum_model_ploss_watershed = sum_model_ploss_watershed + \
                                        model_data_gross[trans_layer]["selection_watershed"]["ploss"]
            sum_model_cn_watershed = sum_model_cn_watershed + model_data_gross[trans_layer]["selection_watershed"]["cn"]
            sum_model_runoff_watershed = sum_model_runoff_watershed + \
                                         model_data_gross[trans_layer]["selection_watershed"]["runoff"]
            sum_model_insect_watershed = sum_model_insect_watershed + \
                                         model_data_gross[trans_layer]["selection_watershed"]["insect"]
            sum_model_econ_watershed = sum_model_econ_watershed + model_data_gross[trans_layer]["selection_watershed"][
                "econ"]
            sum_model_nitrate_watershed = sum_model_nitrate_watershed + \
                                          model_data_gross[trans_layer]["selection_watershed"][
                                              "nitrate"]

        sum_model_yield_watershed = sum_model_yield_watershed + sum_model_yield
        sum_model_ero_watershed = sum_model_ero_watershed + sum_model_ero
        sum_model_ploss_watershed = sum_model_ploss_watershed + sum_model_ploss
        sum_model_cn_watershed = sum_model_cn_watershed + sum_model_cn
        sum_model_runoff_watershed = sum_model_runoff_watershed + sum_model_runoff
        sum_model_insect_watershed = sum_model_insect_watershed + sum_model_insect
        sum_model_econ_watershed = sum_model_econ_watershed + sum_model_econ
        sum_model_nitrate_watershed = sum_model_nitrate_watershed + sum_model_nitrate

        # the base bird value for the watershed is different then the model bird value for the watershed
        # base_watershed_bird_sum_base_value
        sum_model_bird_watershed = sum_model_bird_watershed + model_data_gross[1]["base_watershed"]["bird"] * (
                trans_adoption_total / layer_count) + base_watershed_bird_sum_base_value * (
                                           base_adoption_total / layer_count) + sum_model_bird

        def check_ero_pl(value):
            return value if value >= 0.1 else 0.1

        print("sum of the ploss ", np.sum(model_data_watershed["ploss"]))
        base_ero = check_ero_pl(sum_base_ero / selected_cells)
        base_ero_water = check_ero_pl(np.sum(base_data_watershed["ero"]) / total_cells)

        model_ero = check_ero_pl(sum_model_ero / selected_cells)
        model_ero_water = check_ero_pl(sum_model_ero_watershed / total_cells)

        base_pl = check_ero_pl(sum_base / selected_cells)
        base_pl_water = check_ero_pl(np.sum(base_data_watershed["ploss"]) / total_cells)

        model_pl = check_ero_pl(sum_model_ploss / selected_cells)
        model_pl_water = check_ero_pl(sum_model_ploss_watershed / total_cells)

        base_econ = check_ero_pl(sum_base_econ / selected_cells)
        base_econ_water = check_ero_pl(np.sum(base_data_watershed["econ"]) / total_cells)

        model_econ = check_ero_pl(sum_model_econ / selected_cells)
        model_econ_water = check_ero_pl(sum_model_econ_watershed / total_cells)

        print("time to run models ", time.time() - start)
        return {
            "base": {
                "ploss": {"total": "{:,.2f}".format(base_pl * area_selected),
                          "total_per_area": str("%.2f" % base_pl),
                          "total_watershed": "{:,.2f}".format(base_pl_water * area_watershed),
                          "total_per_area_watershed": str("%.2f" % base_pl_water),
                          "units": "Phosphorus Runoff (lb/year)"
                          },
                "ero": {"total": "{:,.2f}".format(base_ero * area_selected),
                        "total_per_area": str("%.2f" % base_ero),
                        "total_watershed": "{:,.2f}".format(base_ero_water * area_watershed),
                        "total_per_area_watershed": str("%.2f" % base_ero_water),
                        "units": "Erosion (tons/year)"
                        },
                "econ": {
                    "total": "{:,.0f}".format(base_econ * area_selected),
                    "total_per_area": str("%.0f" % base_econ),
                    "total_watershed": "{:,.0f}".format(base_econ_water * area_watershed),
                    "total_per_area_watershed": str("%.0f" % base_econ_water),
                    "units": ""
                },
                "yield": {"total": "{:,.2f}".format(sum_base_yield / selected_cells * area_selected),
                          "total_per_area": str("%.2f" % (sum_base_yield / selected_cells)),
                          "total_watershed": "{:,.2f}".format(
                              np.sum(base_data_watershed["yield"]) / total_cells * area_watershed),
                          "total_per_area_watershed": str(
                              "%.2f" % (np.sum(base_data_watershed["yield"]) / total_cells)),
                          "units": "Yield (tons-Dry Matter/year)"
                          },
                "cn": {
                    "total": "{:,.1f}".format(sum_base_cn / selected_cells),
                    "total_per_area": str("%.1f" % (sum_base_cn / selected_cells)),
                    "total_watershed": "{:,.1f}".format(np.sum(base_data_watershed["cn"]) / total_cells),
                    "total_per_area_watershed": str("%.1f" % (np.sum(base_data_watershed["cn"]) / total_cells)),
                    "units": "Curve Number"
                },
                "insect": {
                    "total": "{:,.2f}".format(sum_base_insect / selected_cells),
                    "total_per_area": str("%.2f" % (sum_base_insect / selected_cells)),
                    "total_watershed": "{:,.2f}".format(np.sum(base_data_watershed["insect"]) / total_cells),
                    "total_per_area_watershed": str("%.2f" % (np.sum(base_data_watershed["insect"]) / total_cells)),
                    "units": ""
                },
                "runoff": {
                    "total": "{:,.2f}".format(sum_base_runoff / 12 / selected_cells * area_selected),
                    "total_per_area": str("%.2f" % (sum_base_runoff / selected_cells)),
                    "total_watershed": "{:,.2f}".format(
                        np.sum(base_data_watershed["runoff"]) / 12 / total_cells * area_watershed),
                    "total_per_area_watershed": str("%.2f" % (np.sum(base_data_watershed["runoff"]) / total_cells)),
                    "units": ""
                },
                "bird": {
                    "total": "{:,.2f}".format(0),
                    "total_per_area": "{:,.2f}".format(base_bird_sum / selected_cells),
                    "total_watershed": "{:,.2f}".format(0),
                    "total_per_area_watershed": "{:,.2f}".format(base_watershed_bird_sum / total_cells)
                },
                "nitrate": {
                    "total": "{:,.2f}".format(sum_base_nitrate / selected_cells * area_selected),
                    "total_per_area": "{:,.2f}".format(sum_base_nitrate / selected_cells),
                    "total_watershed": "{:,.2f}".format(
                        np.sum(base_data_watershed["nitrate"]) / total_cells * area_watershed),
                    "total_per_area_watershed": "{:,.2f}".format(np.sum(base_data_watershed["nitrate"]) / total_cells)
                }
            },
            "model": {
                "ploss": {
                    "total": "{:,.2f}".format(model_pl * area_selected),
                    "total_per_area": str("%.2f" % model_pl),
                    "total_watershed": "{:,.2f}".format(model_pl_water * area_watershed),
                    "total_per_area_watershed": str("%.2f" % model_pl_water),
                    "units": "Phosphorus Runoff (lb/year)"
                },
                "ero": {
                    "total": "{:,.2f}".format(model_ero * area_selected),
                    "total_per_area": str("%.2f" % model_ero),
                    "total_watershed": "{:,.2f}".format(model_ero_water * area_watershed),
                    "total_per_area_watershed": str("%.2f" % model_ero_water),
                    "units": "Erosion (tons/year)"
                },
                "econ": {
                    "total": "{:,.0f}".format(model_econ * area_selected),
                    "total_per_area": str("%.0f" % model_econ),
                    "total_watershed": "{:,.0f}".format(model_econ_water * area_watershed),
                    "total_per_area_watershed": str("%.0f" % model_econ_water),
                    "units": "Erosion (tons/year)"
                },
                "yield": {
                    "total": "{:,.2f}".format(sum_model_yield / selected_cells * area_selected),
                    "total_per_area": str("%.2f" % (sum_model_yield / selected_cells)),
                    "total_watershed": "{:,.2f}".format(sum_model_yield_watershed / total_cells * area_watershed),
                    "total_per_area_watershed": str("%.2f" % (sum_model_yield_watershed / total_cells)),
                    "units": "Yield (tons-Dry Matter/year)"
                },
                "cn": {
                    "total": "{:,.1f}".format(sum_model_cn / selected_cells),
                    "total_per_area": str("%.1f" % (sum_model_cn / selected_cells)),
                    "total_watershed": "{:,.1f}".format(sum_model_cn_watershed / total_cells),
                    "total_per_area_watershed": str("%.1f" % (sum_model_cn_watershed / total_cells)),
                    "units": "Curve Number"
                },
                "insect": {
                    "total": "{:,.2f}".format(sum_model_insect / selected_cells),
                    "total_per_area": str("%.2f" % (sum_model_insect / selected_cells)),
                    "total_watershed": "{:,.2f}".format(sum_model_insect_watershed / total_cells),
                    "total_per_area_watershed": str("%.2f" % (sum_model_insect_watershed / total_cells)),
                    "units": ""
                },

                "runoff": {
                    "total": "{:,.2f}".format(sum_model_runoff / 12 / selected_cells * area_selected),
                    "total_per_area": str("%.2f" % (sum_model_runoff / selected_cells)),
                    "total_watershed": "{:,.2f}".format(
                        sum_model_runoff_watershed / 12 / total_cells * area_watershed),
                    "total_per_area_watershed": str("%.2f" % (sum_model_runoff_watershed / total_cells)),
                    "units": ""
                },
                "bird": {
                    "total": "{:,.2f}".format(0),
                    "total_per_area": "{:,.2f}".format(sum_model_bird / selected_cells),
                    "total_watershed": "{:,.2f}".format(0),
                    "total_per_area_watershed": "{:,.2f}".format(sum_model_bird_watershed / total_cells)
                },
                "nitrate": {
                    "total": "{:,.2f}".format(sum_model_nitrate / selected_cells * area_selected),
                    "total_per_area": "{:,.2f}".format(sum_model_nitrate / selected_cells),
                    "total_watershed": "{:,.2f}".format(sum_model_nitrate_watershed / total_cells * area_watershed),
                    "total_per_area_watershed": "{:,.2f}".format(sum_model_nitrate_watershed / total_cells)
                }
            },
            "land_stats": {
                "area": "{:,.0f}".format(area_selected),
                "area_calc": area_selected,
                "area_watershed": "{:,.0f}".format(area_watershed),
                "area_watershed_calc": area_watershed,
                "area_trans": layer_area_dic,
                "model_id": self.in_dir,
            },
            # "debugging": {
            #     "runoff_ base": base_data_watershed["runoff"].tolist(),
            #     "runoff_model": model_data_watershed["runoff"].tolist(),
            #     "actual_landuse": watershed_land_use.tolist()
            #
            # }

        }

    def get_runoff_vectorized(self, cn, rain):
        cn = np.where(cn < 1, 1, cn)
        stor = (1000 / cn) - 10
        event = np.where(rain > 0.2 * stor,
                         np.power(rain - 0.2 * stor, 2) / (rain + 0.8 * stor),
                         0)

        return event

    def create_base_layers_dic(self, base_scen, region):
        base_names = ("contCorn", "cornGrain", "dairyRotation", "hayGrassland", "pastureWatershed")
        model_names_base = ("Erosion", "PI", "CN")
        base_layer_dic = {}
        for name in base_names:
            for model in model_names_base:
                if name == "hayGrassland" or name == "pastureWatershed":
                    base_layer_dic[name + "_" + model] = "pasture_" + model + "_cn_lo_0_0_" + region
                else:
                    file_name = name + "_" + \
                                model + "_" + \
                                base_scen["management"]["cover"] + "_" + \
                                base_scen["management"]["tillage"] + "_" + \
                                base_scen["management"]["contour"] + "_" + \
                                base_scen["management"]["fertilizer"] + "_" + \
                                region
                    base_layer_dic[name + "_" + model] = "" + file_name
        # download corn and soy rasters for yield
        corn = "corn_Yield_" + region
        soy = "soy_Yield_" + region
        base_layer_dic["corn_yield"] = "" + corn
        base_layer_dic["soy_yield"] = "" + soy
        base_layer_dic["landuse"] = "" + region + "_WiscLand_30m"
        base_layer_dic["hyd_letter"] = "" + region + "_hydgrp_30m"
        base_layer_dic["hayGrassland_Yield"] = "pasture_Yield_medium_" + region
        base_layer_dic["pastureWatershed_Yield"] = "pasture_Yield_medium_" + region
        # check that all files needed are downloaded
        base_loaded = self.check_file_path(base_layer_dic)
        while not base_loaded:
            time.sleep(.1)
            base_loaded = self.check_file_path(base_layer_dic)

    def create_trans_layers_dic(self, trans, region):
        layer_dic = {}
        # file_list = []
        layer_area_dic = {}
        # download om, drainclass, and nresponse
        image = gdal.Open(os.path.join(self.in_dir, "trans_with_aoi.tif"))
        band = image.GetRasterBand(1)
        # geoTransform = image.GetGeoTransform()
        arr = band.ReadAsArray()
        # layer_dic_om = {"0": {
        #     "om": region + "_om_30m",
        #     "drainClass": region + "_drainClass_30m",
        #     "nResponse": region + "_nResponse_30m",
        # }}

        print("starting p calc")
        # self.download_rasters(geoTransform, image, layer_dic_om)
        # based on the available rasters for smartscape
        phos_choices = {"0": [0, 100], "100": [0], "150": [0], "200": [0], "25": [50], "50": [50]}

        for tran1 in trans:
            tran = trans[tran1]
            layer_rank = tran1
            n_parameters = self.get_nitrate_params(tran, arr, layer_rank)
            manure_p_bounds = self.calc_p(tran, n_parameters["nirate_inputs"])
            phos_fert = tran["management"]["phos_fertilizer"]

            if phos_fert == "default":
                phos_fert = phos_choices[manure_p_bounds[0]][0]

            # second value comes from user input
            # phos_fert will only be 0 50 or 100
            manure_p = str(manure_p_bounds[0]) + "_" + str(phos_fert)
            manure_p2 = str(manure_p_bounds[1]) + "_" + str(phos_fert)
            # we don't have a 50_0 option
            # if manure_p_bounds[0] == "50":
            #     manure_p = manure_p_bounds[0] + "_50"
            # if manure_p_bounds[1] == "50":
            #     manure_p2 = manure_p_bounds[1] + "_50"

            print(manure_p_bounds)
            print("manure1 ", manure_p)
            print("manure1 ", manure_p2)
            print("tran is   ", tran)
            layer_dic[tran["rank"]] = {}
            # for each trans get the path to the selection raster used
            # file = os.path.join(self.data_dir, tran["id"], "selection_output.tif")
            # file_list.append(file)

            if tran["management"]["rotationType"] == "pasture":
                yield_name = "pasture_Yield_" + tran["management"]["grassYield"] + "_" + region
                ero_name = "pasture_Erosion_" + tran["management"]["density"] + "_" + \
                           manure_p + "_" + region
                ploss_name = "pasture_PI_" + tran["management"]["density"] + "_" + \
                             manure_p + "_" + region
                ploss_name2 = "pasture_PI_" + tran["management"]["density"] + "_" + \
                              manure_p2 + "_" + region
                cn_name = "pasture_CN_" + tran["management"]["density"] + "_" + \
                          manure_p + "_" + region
                layer_dic[tran["rank"]]["yield"] = yield_name
                land_id = 9

            else:
                if tran["management"]["rotationType"] == "contCorn":
                    land_id = 4
                elif tran["management"]["rotationType"] == "cornGrain":
                    land_id = 3
                elif tran["management"]["rotationType"] == "dairyRotation":
                    land_id = 5
                corn = "corn_Yield_" + region
                soy = "soy_Yield_" + region
                layer_dic[tran["rank"]]["corn"] = "" + corn
                layer_dic[tran["rank"]]["soy"] = "" + soy

                ero_name = "" + tran["management"]["rotationType"] + "_Erosion_" + \
                           tran["management"]["cover"] + "_" + tran["management"]["tillage"] + "_" + \
                           tran["management"]["contour"] + "_" + manure_p + "_" + region
                ploss_name = "" + tran["management"]["rotationType"] + "_PI_" + \
                             tran["management"]["cover"] + "_" + tran["management"]["tillage"] + "_" + \
                             tran["management"]["contour"] + "_" + manure_p + "_" + region
                ploss_name2 = "" + tran["management"]["rotationType"] + "_PI_" + \
                              tran["management"]["cover"] + "_" + tran["management"]["tillage"] + "_" + \
                              tran["management"]["contour"] + "_" + manure_p2 + "_" + region
                cn_name = "" + tran["management"]["rotationType"] + "_CN_" + \
                          tran["management"]["cover"] + "_" + tran["management"]["tillage"] + "_" + \
                          tran["management"]["contour"] + "_" + manure_p + "_" + region
            layer_dic[tran["rank"]]["ero"] = ero_name
            layer_dic[tran["rank"]]["ploss"] = ploss_name
            layer_dic[tran["rank"]]["ploss2"] = ploss_name2
            layer_dic[tran["rank"]]["cn"] = cn_name
            layer_dic[tran["rank"]]["land_id"] = land_id
            layer_dic[tran["rank"]]["manure_outbounds"] = manure_p_bounds[2]

            layer_area_dic[tran["rank"]] = {}
            layer_area_dic[tran["rank"]]["area"] = "{:,.0f}".format(float(str(tran["areaSelected"]).replace(',', '')))
        return layer_area_dic, layer_dic

    def create_download_extents_boundary(self, file_list, trans):
        image = gdal.Open(os.path.join(self.geo_folder, "slope_aoi-clipped.tif"))
        band = image.GetRasterBand(1)
        arr_aoi = band.ReadAsArray()
        # create a new raster with all valid cells set to -88 to be merged with merged.tif later
        arr_aoi = np.where(arr_aoi != self.no_data, -88, arr_aoi)
        [rows, cols] = arr_aoi.shape
        driver = gdal.GetDriverByName("GTiff")
        outdata = driver.Create(os.path.join(self.in_dir, "base_aoi.tif"), cols, rows, 1,
                                gdal.GDT_Float32)
        outdata.SetGeoTransform(image.GetGeoTransform())  ##sets same geotransform as input
        outdata.SetProjection(image.GetProjection())  ##sets same projection as input
        outdata.GetRasterBand(1).WriteArray(arr_aoi)
        outdata.GetRasterBand(1).SetNoDataValue(-9999)
        # write to disk
        outdata.FlushCache()
        outdata = None
        band = None
        ds = None

        ds_clip = gdal.Warp(
            # last raster ovrrides it
            os.path.join(self.in_dir, "temp_extents.tif"), file_list,
            dstNodata=-9999,
            outputType=gc.GDT_Float32)
        image = gdal.Open(os.path.join(self.in_dir, "temp_extents.tif"))
        band = image.GetRasterBand(1)
        arr = band.ReadAsArray()
        # get full watershed

        # fill the blank raster with no data values
        arr.fill(self.no_data)
        [rows, cols] = arr.shape
        driver = gdal.GetDriverByName("GTiff")
        outdata = driver.Create(os.path.join(self.in_dir, "raster_base_projection.tif"), cols, rows, 1,
                                gdal.GDT_Float32)
        outdata.SetGeoTransform(image.GetGeoTransform())  ##sets same geotransform as input
        outdata.SetProjection(image.GetProjection())  ##sets same projection as input
        outdata.GetRasterBand(1).WriteArray(arr)
        outdata.GetRasterBand(1).SetNoDataValue(-9999)
        # write to disk
        outdata.FlushCache()
        outdata = None
        band = None
        ds = None
        # take each transform raster and burn it into a copy of the blank raster(raster_base_projection.tif)
        # so we can compare rasters with same size.
        # Each copy is stored in the transformation's own folder
        for tran1 in trans:
            tran = trans[tran1]
            # file = trans[tran]["id"]
            file = os.path.join(self.data_dir, tran["id"])
            ds_clip = gdal.Warp(
                # os.path.join(self.in_dir, "test-joined.tif"), ["slope-clipped.tif", "landuse-clipped.tif"],
                # last raster ovrrides it
                os.path.join(file, "burned.tif"),
                [os.path.join(self.in_dir, "raster_base_projection.tif"), os.path.join(file, "selection_output.tif")],
                dstNodata=-9999,
                outputType=gc.GDT_Float32)
            ds_clip.FlushCache()
            ds_clip = None
        # create an empty raster with same dimensions as raster_base_projection and set all values to no data value
        base = np.empty([rows * cols])
        base.fill(-9999)
        # take each raster and convert it to array and then take max(higher priority) from array and combine to
        # create a master raster with overlapping values being determined from hierarchy (user input)
        for tran1 in trans:
            tran = trans[tran1]
            file = os.path.join(self.data_dir, tran["id"])
            image1 = gdal.Open(os.path.join(file, "burned.tif"))
            band = image1.GetRasterBand(1)
            arr = band.ReadAsArray()
            # flatten the array to make comparison easier between rasters
            arr = arr.flatten()
            # replace select value with rank of trans
            datanm = np.where(arr == -99, tran["rank"], arr)
            # larger values have higher priority
            base = np.maximum(base, datanm)
            # close file
            image1 = None
        # put the array back into the raster shape
        base = np.reshape(base, [rows, cols])
        # save the base array into a new raster called merged
        driver = gdal.GetDriverByName("GTiff")
        outdata = driver.Create(os.path.join(self.in_dir, "merged.tif"), cols, rows, 1,
                                gdal.GDT_Float32)
        outdata.SetGeoTransform(image.GetGeoTransform())  # sets same geotransform as input
        outdata.SetProjection(image.GetProjection())  # sets same projection as input
        outdata.GetRasterBand(1).WriteArray(base)
        outdata.GetRasterBand(1).SetNoDataValue(-9999)  # if you want these values transparent
        outdata.FlushCache()  # saves to disk!!
        outdata = None
        band = None
        ds = None
        image = None

        # burn out combined trans raster into the aoi raster so they are the same size
        # also we have to have the transformations in a known area
        ds_clip = gdal.Warp(
            # last raster ovrrides it
            os.path.join(self.in_dir, "trans_with_aoi.tif"),
            [os.path.join(self.in_dir, "base_aoi.tif"), os.path.join(self.in_dir, "merged.tif")],
            dstNodata=-9999,
            # dstSRS="EPSG:3071",
            outputType=gc.GDT_Float32)
        ds_clip.FlushCache()
        ds_clip = None
        return

    def get_nitrate_params(self, tran, input_arr, layer_id):
        print(layer_id)
        nrec_output = {}
        layer_id = float(layer_id)
        om_filepath = os.path.join(self.geo_folder, "om_aoi-clipped.tif")
        drain_class_filepath = os.path.join(self.geo_folder, "drainClass_aoi-clipped.tif")
        nresponse_filepath = os.path.join(self.geo_folder, "nResponse_aoi-clipped.tif")
        print(om_filepath)
        print(drain_class_filepath)
        om_image = gdal.Open(om_filepath)
        om_array = om_image.GetRasterBand(1).ReadAsArray()

        drain_image = gdal.Open(drain_class_filepath)
        drain_class_array = drain_image.GetRasterBand(1).ReadAsArray()
        nresponse_image = gdal.Open(nresponse_filepath)
        nresponse_array = nresponse_image.GetRasterBand(1).ReadAsArray()

        # nresponse_array = nresponse_array + 1

        nrec = {"contCorn": "continuouscorn",  # corn
                "cornGrain": "cashgrain",  # corn soy
                "dairyRotation": "dairyrotation",  # silage, corn, alfalfa
                "pasture": "pasture",
                }
        density_nrec = {"cn_hi": "cont_high", "cn_lo": "cont_low", "rt_rt": "rotational"}
        # print(tran)
        cell_count_trans = np.count_nonzero(input_arr == float(layer_id))
        print("cell count for transition ", cell_count_trans)
        om_average = np.sum(np.where(
            np.logical_and(input_arr == layer_id, om_array != self.no_data
                           ), om_array, 0
        )) / cell_count_trans
        # cant average

        # cant average
        # drain_response_average = np.sum(np.where(
        #     np.logical_and(input_arr == layer_id, drain_class_array != self.no_data
        #                    ), drain_class_array, 0
        # )) / cell_count_trans
        calculate_denitloss_vector = np.vectorize(self.calculate_denitloss)
        denitloss = np.sum(np.where(
            np.logical_and(input_arr == layer_id, drain_class_array != self.no_data
                           ), calculate_denitloss_vector(om_average, drain_class_array), 0)) / cell_count_trans

        calc_nresponse_level_vector = np.vectorize(self.calc_nresponse_level)
        nresponse_average = np.sum(np.where(
            np.logical_and(input_arr == layer_id, nresponse_array != self.no_data
                           ), calc_nresponse_level_vector(nresponse_array), 0)) / cell_count_trans

        print("average om ", om_average)
        print("nresponse_average ", nresponse_average)

        om_average = self.calc_om_level(om_average)
        nresponse_average = self.calc_nresponse_level(nresponse_average)
        # calculate dentriloss
        # print(self.nrec_dict)
        nresponse_col = str(nresponse_average)
        om_col = str(om_average)
        print("average nResponse ", nresponse_col)
        print("average om ", om_col)

        # need to do this step for each component of the rotation
        # get parameters and  average
        # pasture
        cover = tran["management"]["cover"]
        rotation_type = nrec[tran["management"]["rotationType"]]
        nrec_trans_pasture_values = {}

        nrec_trans_cont_values = {}

        nrec_trans_corn_values = {}
        nrec_trans_soy_values = {}

        nrec_trans_corn_values = {}
        nrec_trans_silage_values = {}
        nrec_trans_alfalfa_values = {}
        nrec_trans_alfalfa_seed_values = {}
        # print("crop type", tran["management"]["rotationType"])
        if tran["management"]["rotationType"] == "pasture":
            if tran["management"]["legume"] == "false":
                legume = "nolegume"
            else:
                legume = "legume"
            cover = "NA"
            density = density_nrec[tran["management"]["density"]]
            # pasture only uses om
            nrec_trans = rotation_type + "_" + density + "_" + legume + "_" + tran["management"][
                "rotationType"] + "_" + cover + "_" + "om" + "_" + om_col
            print("pasture nrec code", nrec_trans)
            nrec_trans_pasture_values = self.nrec_dict[nrec_trans]

            for value in nrec_trans_pasture_values:
                nrec_output[value] = float(nrec_trans_pasture_values[value])

        elif tran["management"]["rotationType"] == "contCorn":
            # corn
            # nrec_trans = nrec[tran["management"]["rotationType"]] + "_" + tran["management"]["cover"]

            nrec_trans = rotation_type + "_" + "corngrain" + "_" + cover + "_" + "nResponse" + "_" + nresponse_col
            nrec_trans_cont_values = self.nrec_dict[nrec_trans]

            for value in nrec_trans_cont_values:
                nrec_output[value] = float(nrec_trans_cont_values[value])
        elif tran["management"]["rotationType"] == "cornGrain":
            nrec_trans_corn = rotation_type + "_" + "corngrain" + "_" + cover + "_" + "nResponse" + "_" + nresponse_col
            nrec_trans_soy = rotation_type + "_" + "soybeans" + "_" + cover + "_" + "nResponse" + "_" + nresponse_col
            nrec_trans_corn_values = self.nrec_dict[nrec_trans_corn]
            nrec_trans_soy_values = self.nrec_dict[nrec_trans_soy]

            for value in nrec_trans_corn_values:
                nrec_output[value] = (
                        0.5 * float(nrec_trans_corn_values[value]) + 0.5 * float(nrec_trans_soy_values[value]))

        elif tran["management"]["rotationType"] == "dairyRotation":
            nrec_trans_corn = rotation_type + "_" + "corngrain" + "_" + cover + "_" + "nResponse" + "_" + nresponse_col
            nrec_trans_silage = rotation_type + "_" + "cornsilage" + "_" + cover + "_" + "nResponse" + "_" + nresponse_col
            nrec_trans_alfalfa = rotation_type + "_" + "alfalfa" + "_" + cover + "_" + "nResponse" + "_" + nresponse_col
            nrec_trans_alfalfa_seed = rotation_type + "_" + "alfalfaseedingspring" + "_" + cover + "_" + "om" + "_" + om_col

            nrec_trans_corn_values = self.nrec_dict[nrec_trans_corn]
            nrec_trans_silage_values = self.nrec_dict[nrec_trans_silage]
            nrec_trans_alfalfa_values = self.nrec_dict[nrec_trans_alfalfa]
            nrec_trans_alfalfa_seed_values = self.nrec_dict[nrec_trans_alfalfa_seed]

            for value in nrec_trans_corn_values:
                nrec_output[value] = (1 / 5 * float(nrec_trans_corn_values[value]) + 1 / 5 * float(
                    nrec_trans_silage_values[value]) + 2 / 5 * float(nrec_trans_alfalfa_values[value]) + 1 / 5 * float(
                    nrec_trans_alfalfa_seed_values[value]))
        nrec_output["denitLoss"] = denitloss
        return {"nirate_inputs": nrec_output,
                # "denitLoss": denitloss,
                "nrec_trans_pasture_values": nrec_trans_pasture_values,
                "nrec_trans_cont_values": nrec_trans_cont_values,
                "nrec_trans_corn_values": nrec_trans_corn_values,
                "nrec_trans_soy_values": nrec_trans_soy_values,
                "nrec_trans_silage_values": nrec_trans_silage_values,
                "nrec_trans_alfalfa_values": nrec_trans_alfalfa_values,
                "nrec_trans_alfalfa_seed_values": nrec_trans_alfalfa_seed_values,
                }

    def get_nitrate_params_base(self, tran, input_arr, total_cells):
        nrec_output = {}
        om_filepath = os.path.join(self.geo_folder, "om_aoi-clipped.tif")
        drain_class_filepath = os.path.join(self.geo_folder, "drainClass_aoi-clipped.tif")
        nresponse_filepath = os.path.join(self.geo_folder, "nResponse_aoi-clipped.tif")
        print(om_filepath)
        print(drain_class_filepath)
        om_image = gdal.Open(om_filepath)
        om_array = om_image.GetRasterBand(1).ReadAsArray()

        drain_image = gdal.Open(drain_class_filepath)
        drain_class_array = drain_image.GetRasterBand(1).ReadAsArray()
        nresponse_image = gdal.Open(nresponse_filepath)
        nresponse_array = nresponse_image.GetRasterBand(1).ReadAsArray()

        # nresponse_array = nresponse_array + 1

        nrec = {"contCorn": "continuouscorn",  # corn
                "cornGrain": "cashgrain",  # corn soy
                "dairyRotation": "dairyrotation",  # silage, corn, alfalfa
                "pasture": "pasture",
                }
        density_nrec = {"cn_hi": "cont_high", "cn_lo": "cont_low", "rt_rt": "rotational"}
        # print(tran)
        print(total_cells)
        om_average = np.sum(np.where(om_array != self.no_data, om_array, 0)) / total_cells
        # cant average

        # cant average
        # drain_response_average = np.sum(np.where(
        #     np.logical_and(input_arr == layer_id, drain_class_array != self.no_data
        #                    ), drain_class_array, 0
        # )) / cell_count_trans
        calculate_denitloss_vector = np.vectorize(self.calculate_denitloss)
        denitloss = np.sum(np.where(
            drain_class_array != self.no_data, calculate_denitloss_vector(om_average, drain_class_array),
            0)) / total_cells

        calc_nresponse_level_vector = np.vectorize(self.calc_nresponse_level)
        nresponse_average = np.sum(
            np.where(nresponse_array != self.no_data, calc_nresponse_level_vector(nresponse_array), 0)) / total_cells

        print("average om ", om_average)
        print("nresponse_average ", nresponse_average)

        om_average = self.calc_om_level(om_average)
        nresponse_average = self.calc_nresponse_level(nresponse_average)
        # calculate dentriloss
        # print(self.nrec_dict)
        nresponse_col = str(nresponse_average)
        om_col = str(om_average)
        print("average nResponse ", nresponse_col)
        print("average om ", om_col)

        # need to do this step for each component of the rotation
        # get parameters and  average

        # print("crop type", tran["management"]["rotationType"])
        # if tran["management"]["rotationType"] == "pasture":
        # if tran["management"]["legume"] == "false":
        # base settings we nave no legume
        legume = "nolegume"
        # else:
        #     legume = "legume"
        rotation_type = "pasture"
        cover = "NA"
        density = "rotational"
        # density = density_nrec[tran["management"]["density"]]
        # pasture only uses om
        nrec_trans = rotation_type + "_" + density + "_" + legume + "_" + rotation_type + "_" + cover + "_" + "om" \
                     + "_" + om_col
        # print(nrec_trans)
        nrec_trans_pasture_values = self.nrec_dict[nrec_trans]

        for value in nrec_trans_pasture_values:
            nrec_output[value] = float(nrec_trans_pasture_values[value])
        # print(self.nrec_dict)
        # elif tran["management"]["rotationType"] == "contCorn":
        # corn
        rotation_type = "continuouscorn"
        cover = tran["management"]["cover"]
        nrec_trans = rotation_type + "_" + "corngrain" + "_" + cover + "_" + "nResponse" + "_" + nresponse_col
        nrec_trans_cont_values = self.nrec_dict[nrec_trans]

        for value in nrec_trans_cont_values:
            nrec_output[value] = float(nrec_trans_cont_values[value])

        # elif tran["management"]["rotationType"] == "cornGrain":
        rotation_type = "cashgrain"
        nrec_trans_corn = rotation_type + "_" + "corngrain" + "_" + cover + "_" + "nResponse" + "_" + nresponse_col
        nrec_trans_soy = rotation_type + "_" + "soybeans" + "_" + cover + "_" + "nResponse" + "_" + nresponse_col
        nrec_trans_corn_values = self.nrec_dict[nrec_trans_corn]
        nrec_trans_soy_values = self.nrec_dict[nrec_trans_soy]

        for value in nrec_trans_corn_values:
            nrec_output[value] = (
                    0.5 * float(nrec_trans_corn_values[value]) + 0.5 * float(nrec_trans_soy_values[value]))

        # elif tran["management"]["rotationType"] == "dairyRotation":
        rotation_type = "dairyrotation"
        nrec_trans_corn_dairy = rotation_type + "_" + "corngrain" + "_" + cover + "_" + "nResponse" + "_" + nresponse_col
        nrec_trans_silage = rotation_type + "_" + "cornsilage" + "_" + cover + "_" + "nResponse" + "_" + nresponse_col
        nrec_trans_alfalfa = rotation_type + "_" + "alfalfa" + "_" + cover + "_" + "nResponse" + "_" + nresponse_col
        nrec_trans_alfalfa_seed = rotation_type + "_" + "alfalfaseedingspring" + "_" + cover + "_" + "om" + "_" + om_col

        nrec_trans_corn_dairy_values = self.nrec_dict[nrec_trans_corn_dairy]
        nrec_trans_silage_values = self.nrec_dict[nrec_trans_silage]
        nrec_trans_alfalfa_values = self.nrec_dict[nrec_trans_alfalfa]
        nrec_trans_alfalfa_seed_values = self.nrec_dict[nrec_trans_alfalfa_seed]

        for value in nrec_trans_corn_values:
            nrec_output[value] = (1 / 5 * float(nrec_trans_corn_values[value]) + 1 / 5 * float(
                nrec_trans_silage_values[value]) + 2 / 5 * float(nrec_trans_alfalfa_values[value]) + 1 / 5 * float(
                nrec_trans_alfalfa_seed_values[value]))
        nrec_output["denitLoss"] = denitloss
        return {"nirate_inputs": nrec_output,
                # "denitLoss": denitloss,
                "nrec_trans_pasture_values": nrec_trans_pasture_values,
                "nrec_trans_cont_values": nrec_trans_cont_values,
                "nrec_trans_corn_values": nrec_trans_corn_values,
                "nrec_trans_soy_values": nrec_trans_soy_values,
                "nrec_trans_silage_values": nrec_trans_silage_values,
                "nrec_trans_alfalfa_values": nrec_trans_alfalfa_values,
                "nrec_trans_alfalfa_seed_values": nrec_trans_alfalfa_seed_values,
                "nrec_trans_corn_dairy_values": nrec_trans_corn_dairy_values
                }

    @staticmethod
    def calculate_denitloss(om_average, drain_response_average):
        drain_round = drain_response_average
        if drain_round > 7:
            drain_round = 7
        if drain_round < 1:
            drain_round = 1
        if om_average < 2:
            drain_dict = {1: 3, 2: 9, 3: 20, 4: 3, 5: 13, 6: 20, 7: 6}
        elif 2 <= om_average <= 5:
            drain_dict = {1: 6, 2: 13, 3: 30, 4: 6, 5: 17.5, 6: 30, 7: 10}
        else:
            drain_dict = {1: 8, 2: 17.5, 3: 40, 4: 8, 5: 25, 6: 40, 7: 13}
        return drain_dict[drain_round]

    def calc_p(self, tran, nrec_trans):
        nrec = nrec_trans["fertN"]
        pneeds = nrec_trans["Pneeds"]
        print(float(tran["management"]["nitrogen"]))
        manure_n = nrec * float(tran["management"]["nitrogen"]) / 100
        applied_manure_n = (manure_n / 0.4) / 3
        manure_percent = (applied_manure_n / pneeds) * 100
        print("Manure Percent", manure_percent)

        return self.calc_manure_level(manure_percent)

    @staticmethod
    def calc_manure_level(manure):
        # 50_50 is not reachable get rid of it
        if manure < 75:
            return ["0", "100", 0]
        # elif 12.5 <= manure < 37.5:
        #     return ["25", "50"]
        # elif 50 <= manure < 125:
        #     return ["100", "100", 0]
        elif 75 <= manure < 125:
            return ["100", "150", 0]
        # p is outside of bounds so we will to interpolate
        elif 125 <= manure <= 175:
            return ["150", "200", 0]
        elif 125 <= manure:
            return ["200", "150", manure]

        else:
            return ["0", "50", 0]

    @staticmethod
    def calc_om_level(om):
        if om < 2:
            return "<2"
        elif 2 < om < 9.9:
            return "2-9.9"
        elif 10 < om < 20:
            return "10-20"
        elif om >= 20:
            return ">20"
        else:
            return ">20"

    @staticmethod
    def calc_nresponse_level(nresponse):
        if nresponse < 1:
            return 1
        elif nresponse < 2:
            return 2
        elif nresponse >= 2:
            return 3

    def load_nrec(self):

        csv_filename = os.path.join("smartscape", "NmodelInputs_final.csv")
        output_dict = {}

        # fertNrec_soil1	fertNrec_soil2	fertNrec_soil3	fertNrec_om1	fertNrec_om2 fertNrec_om3
        with open(csv_filename) as f:
            reader = csv.DictReader(f)
            for row in reader:
                # print(row["RotationAbbr"], " ", row["cover"].split("or"))
                cover = row["coverAbbr"]

                dict_key = row["RotationName"] + "_" + row["CropName"] + "_" + cover + "_" + row["rasterLookup"] + \
                           "_" + row["rasterVals"]
                dict_key = dict_key.replace(" ", "")
                # print(dict_key)
                # NfixPct  # (Ninputs tab)
                # NH3loss  # (Ninputs tab)

                output_dict[dict_key] = {"fertN": row["fertN"], "ManureN": row["ManureN"], "Pneeds": row["Pneeds"],
                                         "grazedManureN": row["grazedManureN"],
                                         "NfixPct": row["NfixPct"],
                                         "Nharv_content": row["Nharv_content"],
                                         "NH3loss": row["NH3loss"],

                                         }
        print("$$$$$$")
        # print(output_dict)
        self.nrec_dict = output_dict

    #
    def download_rasters(self, geoTransform, image, layer_dic,
                         workspace="SmartScapeRaster:"):
        minx = geoTransform[0]
        maxy = geoTransform[3]
        maxx = minx + geoTransform[1] * image.RasterXSize
        miny = maxy + geoTransform[5] * image.RasterYSize
        extents = [minx, miny, maxx, maxy]
        if extents is not None:
            extents_string_x = "&subset=X(" + str(math.floor(float(extents[0]))) + "," + str(
                math.ceil(float(extents[2]))) + ")"
            extents_string_y = "&subset=Y(" + str(math.floor(float(extents[1]))) + "," + str(
                math.ceil(float(extents[3]))) + ")"
        geo_server_url = settings.GEOSERVER_URL

        geoserver_url = geo_server_url + "/geoserver/ows?service=WCS&version=2.0.1&" \
                                         "srsName=EPSG:3071&request=GetCoverage&CoverageId="
        for layer in layer_dic:
            for model in layer_dic[layer]:
                if model != "land_id" and model != "manure_outbounds":
                    print("downloading layer ", layer_dic[layer][
                        model])
                    url = geoserver_url + workspace + layer_dic[layer][
                        model] + extents_string_x + extents_string_y
                    raster_file_path = os.path.join(self.in_dir, layer_dic[layer][model] + ".tif")
                    self.createNewDownloadThread(url, raster_file_path)
        # use extents of aoi for base, so we get whole area
        # if not base_loaded:
        #     for layer in base_layer_dic:
        #         print("downloading layer ", base_layer_dic[layer])
        #         url = geoserver_url + workspace + base_layer_dic[layer] + extents_string_x + extents_string_y
        #         raster_file_path = os.path.join(self.in_dir, layer + ".tif")
        #         self.createNewDownloadThread(url, raster_file_path)
        self.joinThreads()

    def calculate_yield_field(self, base_dir):
        corn_image = gdal.Open(os.path.join(base_dir, "corn_yield.tif"))
        corn_arr = corn_image.GetRasterBand(1).ReadAsArray()
        # [bushels/acre x 10] original units and then convert to tons of dry matter / ac
        corn_arr = corn_arr / 10
        alfalfa_yield = corn_arr * 0.0195 * 2000 * (1 - 0.13) / 2000
        silage_yield = ((3.73E-4 * corn_arr * corn_arr) + (3.95E-2 * corn_arr + 6.0036)) * 2000 * (1 - 0.65) / 2000
        corn_arr = corn_arr * 56 * (1 - 0.155) / 2000

        soy_image = gdal.Open(os.path.join(base_dir, "soy_yield.tif"))
        soy_arr = soy_image.GetRasterBand(1).ReadAsArray()
        soy_arr = soy_arr * 60 * 0.792 * 0.9008 / (2000 * 10)

        cont_yield = corn_arr
        corn_yield = (corn_arr * .5) + (soy_arr * .5)
        dairy_yield = 1 / 5 * silage_yield + 1 / 5 * corn_arr + 3 / 5 * alfalfa_yield

        # landuse_yield = np.where(landuse_yield == 4, cont_yield, landuse_yield)
        # landuse_yield = np.where(landuse_yield == 3, corn_yield, landuse_yield)
        # landuse_yield = np.where(landuse_yield == 5, dairy_yield, landuse_yield)

        corn_image = None
        soy_image = None
        # corn_arr = None
        # soy_arr = None
        # return each crop type separately too for nitrate
        return {"contCorn": cont_yield,
                "cornGrain": corn_yield,
                "dairyRotation": dairy_yield,
                "soy": soy_arr,
                "silage": silage_yield,
                "alfalfa": alfalfa_yield,
                "corn": cont_yield,
                }

    def calculate_econ(self, scen):

        nutrient_dict = {"ccgcdsnana": {"Pneeds": 65, "Nneeds": 120, "grazed_DM_lbs": 196.8,
                                        "grazed_P2O5_lbs": 2.46},
                         "ccgcisnana": {"Pneeds": 65, "Nneeds": 120, "grazed_DM_lbs": 196.8,
                                        "grazed_P2O5_lbs": 2.46},
                         "ccncnana": {"Pneeds": 60, "Nneeds": 120, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "ccccnana": {"Pneeds": 60, "Nneeds": 120, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "cggcdsnana": {"Pneeds": 47.5, "Nneeds": 60, "grazed_DM_lbs": 196.8,
                                        "grazed_P2O5_lbs": 2.46},
                         "cggcisnana": {"Pneeds": 47.5, "Nneeds": 60, "grazed_DM_lbs": 196.8,
                                        "grazed_P2O5_lbs": 2.46},
                         "cgncnana": {"Pneeds": 50, "Nneeds": 60, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "cgccnana": {"Pneeds": 50, "Nneeds": 60, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "drgcdsnana": {"Pneeds": 49, "Nneeds": 52, "grazed_DM_lbs": 38.4,
                                        "grazed_P2O5_lbs": 0.48},
                         "drgcisnana": {"Pneeds": 49, "Nneeds": 52, "grazed_DM_lbs": 38.4,
                                        "grazed_P2O5_lbs": 0.48},
                         "drncnana": {"Pneeds": 49, "Nneeds": 52, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "drccnana": {"Pneeds": 49, "Nneeds": 52, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         "csogcdsnana": {"Pneeds": 46.67, "Nneeds": 60, "grazed_DM_lbs": 64.8,
                                         "grazed_P2O5_lbs": 0.81},
                         "csogcisnana": {"Pneeds": 46.67, "Nneeds": 60, "grazed_DM_lbs": 64.8,
                                         "grazed_P2O5_lbs": 0.81},
                         "csoncnana": {"Pneeds": 46.67, "Nneeds": 60, "grazed_DM_lbs": 0,
                                       "grazed_P2O5_lbs": 0},
                         "csoccnana": {"Pneeds": 46.67, "Nneeds": 60, "grazed_DM_lbs": 0,
                                       "grazed_P2O5_lbs": 0},
                         "dlntnalo": {"Pneeds": 0, "Nneeds": 0, "grazed_DM_lbs": 4802.4,
                                      "grazed_P2O5_lbs": 60.03},
                         "dlntnahi": {"Pneeds": 0, "Nneeds": 0, "grazed_DM_lbs": 24009.6,
                                      "grazed_P2O5_lbs": 300.12},
                         "ptntcnhi": {"Pneeds": 40, "Nneeds": 2, "grazed_DM_lbs": 3602.4,
                                      "grazed_P2O5_lbs": 45.03},
                         "ptntcnlo": {"Pneeds": 40, "Nneeds": 2, "grazed_DM_lbs": 1200,
                                      "grazed_P2O5_lbs": 15},
                         "ptntrtna": {"Pneeds": 40, "Nneeds": 2, "grazed_DM_lbs": 2400,
                                      "grazed_P2O5_lbs": 30},
                         "psntnana": {"Pneeds": 15, "Nneeds": 2, "grazed_DM_lbs": 0,
                                      "grazed_P2O5_lbs": 0},
                         }
        rotation_types = {"contCorn": {"cost": 0, "rot_type": "cc"},
                          "cornGrain": {"cost": 0, "rot_type": "cg"},
                          "dairyRotation": {"cost": 0, "rot_type": "dr"},
                          "pasture": {"cost": 0, "rot_type": "pt"}}
        for rot in rotation_types:
            if rot == "pasture":
                if scen["management"]["density"] == "default":
                    pt_rt = "rtna"
                else:
                    pt_rt = scen["density"]["cover"].replace("_", "")
                nutrient_type = rotation_types[rot]["rot_type"] + "nt" + pt_rt
                seed_cost = scen["econ"]["pastSeed"]
                pest_cost = scen["econ"]["pastPest"]
                mach_cost = scen["econ"]["pastMach"]
            else:
                nutrient_type = rotation_types[rot]["rot_type"] + scen["management"]["cover"] + "nana"
                if rot == "contCorn":
                    seed_cost = scen["econ"]["cornSeed"]
                    pest_cost = scen["econ"]["cornPest"]
                    mach_cost = scen["econ"]["cornMach"]
                elif rot == "cornGrain":
                    seed_cost = 1 / 2 * (scen["econ"]["cornSeed"] * scen["econ"]["soySeed"])
                    pest_cost = 1 / 2 * (scen["econ"]["cornPest"] * scen["econ"]["soyPest"])
                    mach_cost = 1 / 2 * (scen["econ"]["cornMach"] * scen["econ"]["soyMach"])
                elif rot == "dairyRotation":
                    seed_cost = 1 / 5 * (2 * scen["econ"]["cornSeed"] + scen["econ"]["alfaSeed"])
                    pest_cost = 1 / 5 * (2 * scen["econ"]["cornPest"] + 3 * scen["econ"]["alfaPest"])
                    mach_cost = 1 / 5 * (2 * scen["econ"]["cornMach"] + 2 * scen["econ"]["alfaMach"] +
                                         scen["econ"]["alfaFirstYear"])

            p_needs = float(nutrient_dict[nutrient_type]["Pneeds"])
            n_needs = float(nutrient_dict[nutrient_type]["Nneeds"])

            fert = float(scen["management"]["fertilizer"].split("_")[1])
            P2O5_fert = (fert) * (p_needs / 100)
            n_fert = (fert) * (n_needs / 100)
            cost_p2 = P2O5_fert * float(scen["econ"]["p2o5"])
            cost_n = n_fert * float(scen["econ"]["nFert"])
            land_cost = 140
            rotation_types[rot]["cost"] = cost_p2 + float(seed_cost) + float(pest_cost) + float(
                mach_cost) + land_cost  # + cost_n
        return {"contCorn": rotation_types["contCorn"]["cost"],
                "cornGrain": rotation_types["cornGrain"]["cost"],
                "dairyRotation": rotation_types["dairyRotation"]["cost"],
                "pasture": rotation_types["pasture"]["cost"],
                }

    def nitrate_calc(self, n_parameters, tran, inter_data_yield, inter_data_ero, om, layer, model_data,
                     cell_count_trans):
        # print("hello")
        # print("n parameters are ", n_parameters)
        nitrate_sum_dict = {}
        for n_par in n_parameters:
            # print("calc nitrate for ", n_par)
            if n_par == "nirate_inputs" or n_parameters[n_par] == {}:
                continue
            # print("calc nitrate for ", n_par)
            nitrate_sum_dict[n_par] = {}
            nrec_trans = n_parameters[n_par]
            # print(nrec_trans)
            nrec = float(nrec_trans["fertN"])
            manure_allow = float(nrec_trans["ManureN"])
            # in percent so divide to get decimal
            manrN = float(manure_allow) * float(tran["management"]["nitrogen"]) / 100
            fertN = float(nrec) * float(tran["management"]["nitrogen_fertilizer"]) / 100
            NH3loss = float(nrec_trans["NH3loss"])
            grazed_manureN = float(nrec_trans["grazedManureN"])
            denitLoss = float(n_parameters["nirate_inputs"]["denitLoss"])
            precip_dict = {"southWestWI": 43, "CloverBeltWI": 38, "northeastWI": 35, "uplandsWI": 44}
            precip = precip_dict[self.region]
            precN = 0.5 * precip * 0.226
            dryN = precN
            NfixPct = float(nrec_trans["NfixPct"])
            Nharv_content = float(nrec_trans["Nharv_content"])
            # print("trouble inputs", Nharv_content, inter_data_yield)
            harvN = inter_data_yield * 2000 * Nharv_content
            fixN = harvN * NfixPct / 100 + 3  ## N fixation input, lb/ac
            NH3_N = fertN * NH3loss / 100  ## ammonia loss output, lb/ac
            denitN = fertN * denitLoss / 100  ## denitrification loss,
            erosN = inter_data_ero * om * 2  ## note that OM is in units of % ## erosion from models = tons/acre
            grazed_manureN  # (Ninputs tab)
            inputsN = fertN + manrN + precN + dryN + fixN + grazed_manureN
            gasN = 0.01 * inputsN  ## misc gases are estimated as 1% of inputs
            NH3senN = 8  ## ammonia loss at senescence
            runoffN = 0
            outputsN = harvN + NH3_N + denitN + erosN + gasN + NH3senN + runoffN
            # print("input")
            # print("manure_allow", manure_allow)
            # print("nrec", nrec)
            # print("fertN", fertN)
            # print("manrN", manrN)
            # print("precN", precN)
            # print("dryN", dryN)
            # print("fixN", np.sum(np.where(model_data["nitrate"] == layer, fixN, 0)) / cell_count_trans)
            # print("grazed_manureN", grazed_manureN)

            # print(fertN , manrN , precN , dryN , fixN , grazed_manureN)
            def get_value(model, layer, value, cell_cout):
                return np.sum(np.where(model == layer, value, 0)) / cell_cout

            # print("output")
            # print("harvN", harvN)
            # print("NH3_N", NH3_N)
            # print("denitN", denitN)
            # print("erosN", get_value(model_data["nitrate"], layer, erosN, cell_count_trans))
            # print("gasN", get_value(model_data["nitrate"], layer, gasN, cell_count_trans))
            # print("NH3senN", NH3senN)
            # print("runoffN", runoffN)
            # print(harvN , NH3_N , denitN , erosN , gasN , NH3senN , runoffN)
            leach = inputsN - outputsN
            # print("leacing ", leach)
            inter_data = np.where(model_data["nitrate"] == layer, leach, 0)
            inter_data_sum = np.sum(inter_data)
            if inter_data_sum < 0:
                inter_data_sum = 0
            nitrate_sum_dict[n_par]["inter_data_sum"] = inter_data_sum
        # average rotations

        # rot_total_data = rot_total_data + inter_data
        # inter_data = np.sum(np.where(np.logical_or(inter_data == self.no_data, inter_data < 0), 0, inter_data))

        total_leach = 0
        print(len(nitrate_sum_dict))
        if len(nitrate_sum_dict) == 2:
            total_leach = 0.5 * nitrate_sum_dict["nrec_trans_corn_values"]["inter_data_sum"] + \
                          0.5 * nitrate_sum_dict["nrec_trans_soy_values"]["inter_data_sum"]
        elif len(nitrate_sum_dict) == 4:
            total_leach = 0.2 * nitrate_sum_dict["nrec_trans_corn_values"]["inter_data_sum"] + \
                          0.2 * nitrate_sum_dict["nrec_trans_silage_values"]["inter_data_sum"] + \
                          0.2 * nitrate_sum_dict["nrec_trans_alfalfa_values"]["inter_data_sum"] + \
                          0.4 * nitrate_sum_dict["nrec_trans_alfalfa_seed_values"]["inter_data_sum"]
        else:
            for val in nitrate_sum_dict:
                total_leach = nitrate_sum_dict[val]["inter_data_sum"]
        print("total leaching ", total_leach)
        print("cell count ", cell_count_trans)
        print("leaching ", total_leach / cell_count_trans)
        print("leaching dict", nitrate_sum_dict)
        return total_leach

    def nitrate_calc_base(self, n_parameters, base_scen,
                          pasture_yield_arr, cont_yield, corn_yield, dairy_yield,
                          pasture_er_arr, cont_er_arr, corn_er_arr, dairy_er_arr,
                          om, total_cells, watershed_land_use):
        # print("hello")
        total_cells2_classify = np.where(
                np.logical_and(watershed_land_use != self.no_data, dairy_er_arr != self.no_data), 1, self.no_data
            )

        total_cells2 = np.count_nonzero(total_cells2_classify > 0)
        # print("cell totals", total_cells, total_cells2, total_cells-total_cells2)
        print("n parameters are ", n_parameters)
        nitrate_sum_dict = {}
        for n_par in n_parameters:
            # print("calc nitrate for ", n_par)
            if n_par == "nirate_inputs" or n_parameters[n_par] == {}:
                continue
            nitrate_sum_dict[n_par] = {}
            nrec_trans = n_parameters[n_par]
            nrec = float(nrec_trans["fertN"])
            manure_allow = float(nrec_trans["ManureN"])
            # in percent so divide to get decimal
            manrN = float(manure_allow) * float(base_scen["management"]["nitrogen"]) / 100
            fertN = float(nrec) * float(base_scen["management"]["nitrogen_fertilizer"]) / 100
            # print("calc nitrate for ", n_par)
            # print(nrec_trans)
            # print("nitrogen", base_scen["management"]["nitrogen"])
            # print("nitrogen_fertilizer", base_scen["management"]["nitrogen_fertilizer"])
            NH3loss = float(nrec_trans["NH3loss"])
            grazed_manureN = float(nrec_trans["grazedManureN"])
            denitLoss = float(n_parameters["nirate_inputs"]["denitLoss"])
            precip_dict = {"southWestWI": 43, "CloverBeltWI": 38, "northeastWI": 35, "uplandsWI": 44}
            precip = precip_dict[self.region]
            precN = 0.5 * precip * 0.226
            dryN = precN
            NfixPct = float(nrec_trans["NfixPct"])
            Nharv_content = float(nrec_trans["Nharv_content"])
            if n_par == "nrec_trans_pasture_values":
                harvN = pasture_yield_arr * 2000 * Nharv_content
                erosN = pasture_er_arr * om * 2  ## note that OM is in units of % ## erosion from models = tons/acre
                manrN = 0
                fertN = 0
            elif n_par == "nrec_trans_cont_values":
                harvN = cont_yield * 2000 * Nharv_content
                erosN = cont_er_arr * om * 2  ## note that OM is in units of % ## erosion from models = tons/acre
            elif n_par == "nrec_trans_corn_values" or n_par == "nrec_trans_soy_values":
                harvN = corn_yield * 2000 * Nharv_content
                erosN = corn_er_arr * om * 2  ## note that OM is in units of % ## erosion from models = tons/acre
            elif n_par == "nrec_trans_corn_dairy_values" or n_par == "nrec_trans_silage_values" or n_par == "nrec_trans_alfalfa_values" or n_par == "nrec_trans_alfalfa_seed_values":
                harvN = dairy_yield * 2000 * Nharv_content
                erosN = dairy_er_arr * om * 2  ## note that OM is in units of % ## erosion from models = tons/acre

            fixN = harvN * NfixPct / 100 + 3  ## N fixation input, lb/ac
            NH3_N = fertN * NH3loss / 100  ## ammonia loss output, lb/ac
            denitN = fertN * denitLoss / 100  ## denitrification loss,
            grazed_manureN  # (Ninputs tab)
            inputsN = fertN + manrN + precN + dryN + fixN + grazed_manureN
            gasN = 0.01 * inputsN  ## misc gases are estimated as 1% of inputs
            NH3senN = 8  ## ammonia loss at senescence
            runoffN = 0
            outputsN = harvN + NH3_N + denitN + erosN + gasN + NH3senN + runoffN
            # print("input")
            # print("manure_allow", manure_allow)
            # print("nrec", nrec)
            # print("fertN", fertN)
            # print("manrN", manrN)
            # print("precN", precN)
            # print("dryN", dryN)
            # print("fixN", np.sum(np.where(fixN != self.no_data, fixN, 0)) / total_cells)
            # print("grazed_manureN", grazed_manureN)

            # print(fertN , manrN , precN , dryN , fixN , grazed_manureN)
            def get_value(value, cell_cout, watershed_land_use):
                return np.sum(np.where(watershed_land_use != self.no_data, value, 0)) / cell_cout

            # print("output")
            # print("harvN", get_value(harvN, total_cells, watershed_land_use))
            # print("NH3_N", NH3_N)
            # print("denitN", denitN)
            # print("erosN", get_value(erosN, total_cells, watershed_land_use))
            # print("gasN", get_value(gasN, total_cells, watershed_land_use))
            # print("NH3senN", NH3senN)
            # print("runoffN", runoffN)
            # print(harvN , NH3_N , denitN , erosN , gasN , NH3senN , runoffN)
            leach = inputsN - outputsN
            # print("leacing ", leach)
            # each rotation shouldn't go below zero
            inter_data = np.where(leach != self.no_data, leach, 0)
            # inter_data_sum = np.sum(inter_data)
            # if inter_data_sum < 0:
            #     inter_data_sum = 0
            nitrate_sum_dict[n_par]["inter_data_sum"] = inter_data
        leach_cash_grain = 0.5 * nitrate_sum_dict["nrec_trans_corn_values"]["inter_data_sum"] + \
                           0.5 * nitrate_sum_dict["nrec_trans_soy_values"]["inter_data_sum"]
        leach_dairy = 0.2 * nitrate_sum_dict["nrec_trans_corn_dairy_values"]["inter_data_sum"] + \
                      0.2 * nitrate_sum_dict["nrec_trans_silage_values"]["inter_data_sum"] + \
                      0.2 * nitrate_sum_dict["nrec_trans_alfalfa_values"]["inter_data_sum"] + \
                      0.4 * nitrate_sum_dict["nrec_trans_alfalfa_seed_values"]["inter_data_sum"]
        leach_pasture = nitrate_sum_dict["nrec_trans_pasture_values"]["inter_data_sum"]
        leach_corn = nitrate_sum_dict["nrec_trans_cont_values"]["inter_data_sum"]
        # print("total leaching ", total_leach)
        # print("cell count ", total_cells)
        print("leaching hay", get_value(leach_pasture, total_cells, watershed_land_use))
        print("leaching corn", get_value(leach_corn, total_cells, watershed_land_use))
        print("leaching cash grain", get_value(leach_cash_grain, total_cells, watershed_land_use))
        print("leaching dairy", get_value(leach_dairy, total_cells, watershed_land_use))
        # print("leaching ", total_leach / total_cells)
        # print("leaching dict", nitrate_sum_dict)
        return {
            "pasture": leach_pasture,
            "corn": leach_corn,
            "cash_grain": leach_cash_grain,
            "dairy": leach_dairy,
        }
