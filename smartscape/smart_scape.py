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
        # copy datanm so we can use it for just the image
        # TODO there is probably a way to combine this with the raster datanm
        # datanm_image = np.copy(datanm)
        # selected values get 1 and everything else gets a zero
        # datanm_image = np.where(np.logical_and(*self.parse("", datanm_image, slope1, slope2)), 1, 0)
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
                np.logical_and(1 == datanm_landclass, datanm_landclass != self.no_data), -99, datanm_landclass
            )
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
        if np.count_nonzero(datanm_landclass == -99) > 0:
            datanm = np.where(np.logical_and(datanm == -99, datanm_landclass == -99), -99, self.no_data)
        print("selected cells land class", np.count_nonzero(datanm_landclass == -99))

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
        if np.count_nonzero(datanm_farmclass == -99) > 0:
            datanm = np.where(np.logical_and(datanm == -99, datanm_farmclass == -99), -99, self.no_data)
            # datanm = np.where(np.logical_and(datanm == -99, datanm_landclass == -99), -99, self.no_data)

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
        # if np.count_nonzero(datanm_landuse == -99) > 0:
        datanm = np.where(np.logical_and(datanm == -99, datanm_landuse == -99), -99, self.no_data)
        print("selected cells", np.count_nonzero(datanm != self.no_data))
        selected_cells = np.count_nonzero(datanm != self.no_data)
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

    # def createNewRunoffThread(self, type):
    #     download_thread = threading.Thread(target=self.download, args=(link, filelocation))
    #     download_thread.start()
    #     self.threads.append(download_thread)
    def joinThreads(self):
        for thread in self.threads:
            thread.join()

    def check_file_path(self, base_dic):
        counter = 0
        base_length = len(base_dic)
        for f in os.listdir(os.path.join(self.geo_folder, "base")):
            counter = counter + 1
            # try:
            #     f = os.path.join(input_path, f)
            #     if os.stat(f).st_mtime < now - 3600:
            #         shutil.rmtree(f)
            # except OSError as e:
            #     print("Error: %s : %s" % (f, e.strerror))
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
        bird_range = 13
        image = gdal.Open(os.path.join(self.geo_folder, "slope_aoi-clipped.tif"))

        band = image.GetRasterBand(1)
        arr_aoi = band.ReadAsArray()
        # create a new raster with all valid cells set to -88 to be merged with merged.tif later
        # arr_aoi_out = np.where(arr_aoi == self.no_data, arr_aoi, -88)
        # arr_aoi.fill(self.no_data)
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

        # conversion from value / ac to value of cell at 30 m resolution
        # ac_to_m = 900 / 4046.86
        print("starting model aggregation")
        trans = self.request_json['trans']
        base_scen = self.request_json['base']
        # region = self.request_json['base']
        region = self.request_json['region']
        aoi_area_total = self.request_json["aoiArea"]
        aoi_extents = self.request_json["aoiExtents"]

        insect = {"contCorn": 0.51,
                  "cornGrain": 0.51,
                  "dairyRotation": 0.12,
                  "pasture": 0
                  }
        econ_cost = self.calculate_econ(base_scen)
        file_list = []
        # get each transformation selection output raster
        layer_dic = {}
        layer_area_dic = {}
        base_layer_dic = {}

        # download layers for base case
        base_names = ("contCorn", "cornGrain", "dairyRotation", "hayGrassland", "pastureWatershed")
        model_names_base = ("Erosion", "PI", "CN")
        # contCorn
        # create name of the layer that corresponds to geoserver for base case
        for name in base_names:
            for model in model_names_base:
                if name == "hayGrassland" or name == "pastureWatershed":
                    # medium_GrassYield_southWestWI.tif
                    # pasture_CN_rt_rt_0_0_southWestWI.tif
                    base_layer_dic[name + "_" + model] = "pasture_" + model + "_rt_rt_0_0_" + region
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
        base_dir = os.path.join(self.geo_folder, "base")
        while not base_loaded:
            time.sleep(.1)
            base_loaded = self.check_file_path(base_layer_dic)

        watershed_file_list = []
        # create list of layers to download for each trans
        length_trans = len(trans)
        for tran1 in trans:
            tran = trans[tran1]
            print("tran is   ", tran)
            layer_dic[tran["rank"]] = {}

            # for each trans get the path to the selection raster used
            file = os.path.join(self.data_dir, tran["id"], "selection_output.tif")

            file_list.append(file)
            # watershed_file_list.append(os.path.join(self.data_dir, tran["id"], "landuse_watershed.tif"))
            # open each trans selection to get number of selected cells
            image = gdal.Open(file)
            band = image.GetRasterBand(1)
            arr = band.ReadAsArray()
            print("adoption rate ", tran["selection"]["adoptionRate"])

            # total_count = np.count_nonzero(arr > -100)
            selected_cells = np.count_nonzero(arr == -99)
            total_cells = np.count_nonzero(arr > self.no_data)
            if tran["management"]["rotationType"] == "pasture":
                yield_name = "pasture_Yield_" + tran["management"]["grassYield"] + "_" + region
                ero_name = "pasture_Erosion_" + tran["management"]["density"] + "_" + \
                           tran["management"]["fertilizer"] + "_" + region
                ploss_name = "pasture_PI_" + tran["management"]["density"] + "_" + \
                             tran["management"]["fertilizer"] + "_" + region
                cn_name = "pasture_CN_" + tran["management"]["density"] + "_" + \
                          tran["management"]["fertilizer"] + "_" + region
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
                           tran["management"]["contour"] + "_" + tran["management"]["fertilizer"] + "_" + region
                ploss_name = "" + tran["management"]["rotationType"] + "_PI_" + \
                             tran["management"]["cover"] + "_" + tran["management"]["tillage"] + "_" + \
                             tran["management"]["contour"] + "_" + tran["management"]["fertilizer"] + "_" + region
                cn_name = "" + tran["management"]["rotationType"] + "_CN_" + \
                          tran["management"]["cover"] + "_" + tran["management"]["tillage"] + "_" + \
                          tran["management"]["contour"] + "_" + tran["management"]["fertilizer"] + "_" + region
            layer_dic[tran["rank"]]["ero"] = ero_name
            layer_dic[tran["rank"]]["ploss"] = ploss_name
            layer_dic[tran["rank"]]["cn"] = cn_name
            layer_dic[tran["rank"]]["land_id"] = land_id

            layer_area_dic[tran["rank"]] = {}
            layer_area_dic[tran["rank"]]["area"] = "{:,.0f}".format(float(str(tran["areaSelected"]).replace(',', '')))
        # create blank raster that has extents from all transformations
        ds_clip = gdal.Warp(
            # last raster ovrrides it
            os.path.join(self.in_dir, "temp_extents.tif"), file_list,
            dstNodata=-9999,
            outputType=gc.GDT_Float32)
        image = gdal.Open(os.path.join(self.in_dir, "temp_extents.tif"))

        band = image.GetRasterBand(1)
        arr = band.ReadAsArray()
        # print(watershed_file_list)
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
        # so we can compare rasters with same
        # size. Each copy is stored in the transformation's own folder
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
        # create an empty raster with same dimensions as flattend  combined and set all values to no data value
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
        count_total_selected = np.count_nonzero(base > 0)

        # save the base array into a new raster called merged
        driver = gdal.GetDriverByName("GTiff")
        outdata = driver.Create(os.path.join(self.in_dir, "merged.tif"), cols, rows, 1,
                                gdal.GDT_Float32)
        outdata.SetGeoTransform(image.GetGeoTransform())  ##sets same geotransform as input
        outdata.SetProjection(image.GetProjection())  ##sets same projection as input
        outdata.GetRasterBand(1).WriteArray(base)
        outdata.GetRasterBand(1).SetNoDataValue(-9999)  ##if you want these values transparent
        outdata.FlushCache()  ##saves to disk!!
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

        image = gdal.Open(os.path.join(self.in_dir, "trans_with_aoi.tif"))
        band = image.GetRasterBand(1)
        geoTransform = image.GetGeoTransform()
        # arr will be the base array that all model calcs pull from. All valid values have the hierarch of the
        # transformation
        arr = band.ReadAsArray()
        start = time.time()
        self.download_rasters(geoTransform, image, layer_dic, base_layer_dic, base_loaded)
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

        # open model results raster
        model_list = ["yield", "ero", "ploss", "cn", "insect", "econ"]
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
                    "number_cells": 0,
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
            inter_data = 0
            for model in model_list:
                print(model)
                inter_data = 0
                if model == "yield" and "yield" not in layer_dic[layer]:
                    field_yield = self.calculate_yield_field(base_dir)
                    inter_data = np.where(model_data[model] == layer,
                                          field_yield[trans[str(layer)]["management"]["rotationType"]], 0)
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
                    else:
                        inter_data = np.where(model_data[model] == layer, model_arr, 0)
                inter_data = np.sum(np.where(np.logical_or(inter_data == self.no_data, inter_data < 0), 0, inter_data))
                print("the inter data is ", inter_data)
                print(inter_data / cell_count_trans)
                if cell_count_trans > 0:
                    model_data_gross[layer]["selection"][model] = inter_data
                model_image = None
                model_band = None
                model_arr = None
            print("%%%%%%%%%%%%%%%%%%%%%%%%")

        print("done with trans models")

        print(model_data_gross)

        #   iterate through wiscland layer
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

        land_use_selected = np.copy(landuse_arr_sel)
        start = time.time()
        bird_counter = 0
        base_sel_bird = window(plain_landuse, land_use_selected, bird_range, arr, length_trans)
        base_bird_sum = 0
        for val in base_sel_bird[1]:
            # the first index entry is always zero so we ignore it
            if val != 0:
                model_data_gross[bird_counter]["base"]["bird"] = val
                base_bird_sum = base_bird_sum + val
            bird_counter = bird_counter + 1
        print("done with cython ", time.time() - start)
        # replace landuse from base data with new landuse
        for layer in layer_dic:
            plain_landuse = np.where(arr == layer, layer_dic[layer]["land_id"], plain_landuse)
        start = time.time()
        model_sel_bird = window(plain_landuse, land_use_selected, bird_range, arr, length_trans)
        print("done with cython ", time.time() - start)
        bird_counter = 0
        for val in model_sel_bird[1]:
            if val != 0:
                model_data_gross[bird_counter]["selection"]["bird"] = val
            bird_counter = bird_counter + 1

        base_data = {
            "yield": np.copy(landuse_arr_sel),
            "ero": np.copy(landuse_arr_sel),
            "ploss": np.copy(landuse_arr_sel),
            "cn": np.copy(landuse_arr_sel),
            "runoff": np.copy(landuse_arr_sel),
            "insect": np.copy(landuse_arr_sel),
            "econ": np.copy(landuse_arr_sel),
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

        watershed_land_use_image = gdal.Open(os.path.join(self.geo_folder, "landuse_aoi-clipped.tif"))
        watershed_land_use_band = watershed_land_use_image.GetRasterBand(1)
        watershed_land_use = watershed_land_use_band.ReadAsArray()

        start = time.time()
        base_watershed_bird = window(watershed_land_use, watershed_land_use, bird_range, arr, length_trans)
        base_watershed_bird_sum = base_watershed_bird[0]
        base_watershed_bird_sum_base_value = base_watershed_bird[0]
        bird_counter = 0
        for val in base_watershed_bird[1]:
            if val != 0:
                # model_data_gross[layer]["base_watershed"]["bird"] = model_data_gross[layer]["base_watershed"][
                #                                                         "bird"] + val
                base_watershed_bird_sum = base_watershed_bird_sum + val
            bird_counter = bird_counter + 1
        print("done with cython ", time.time() - start)
        # model_data_gross[layer]["base_watershed"]["bird"] = model_data_gross[layer]["base_watershed"][
        #                                                         "bird"] / total_cells

        start = time.time()
        model_watershed_bird = window(plain_landuse, watershed_land_use, bird_range, arr, length_trans)
        model_data_gross[1]["base_watershed"]["bird"] = model_watershed_bird[0]
        print("done with cython ", time.time() - start)
        bird_counter = 0
        for val in model_watershed_bird[1]:
            if val != 0:
                model_data_gross[bird_counter]["selection_watershed"]["bird"] = val
            bird_counter = bird_counter + 1
        base_data_watershed = {
            "yield": np.copy(watershed_land_use),
            "ero": np.copy(watershed_land_use),
            "ploss": np.copy(watershed_land_use),
            "cn": np.copy(watershed_land_use),
            "runoff": np.copy(watershed_land_use),
            "insect": np.copy(watershed_land_use),
            "econ": np.copy(watershed_land_use),
        }

        watershed_total = {
            1: {"name": "highUrban", "is_calc": False, "yield": 0, "ero": 2, "ploss": 1.34, "cn": 93, "insect": 0.51,
                "bird": 0, "econ": 0},
            2: {"name": "lowUrban", "is_calc": False, "yield": 0, "ero": 2, "ploss": 0.81, "cn": 85, "insect": 0.51,
                "bird": 0, "econ": 0},
            4: {"name": "contCorn", "is_calc": True, "yield": cont_yield, "ero": cont_er_arr, "ploss": cont_pl_arr,
                "cn": base_arr_corn_cn, "insect": 0.51, "bird": 0, "econ": econ_cost["contCorn"]},
            3: {"name": "cornGrain", "is_calc": True, "yield": corn_yield, "ero": corn_er_arr, "ploss": corn_pl_arr,
                "cn": base_arr_corngrain_cn, "insect": 0.51, "bird": 0, "econ": econ_cost["cornGrain"]},
            5: {"name": "dairyRotation", "is_calc": True, "yield": dairy_yield, "ero": dairy_er_arr,
                "ploss": dairy_pl_arr,
                "cn": base_arr_dairy_cn, "insect": 0.12, "bird": 0, "econ": econ_cost["dairyRotation"]},
            6: {"name": "potVeg", "is_calc": False, "yield": 0, "ero": 0, "ploss": 2, "cn": 75, "insect": 0.12,
                "bird": 0,
                "econ": econ_cost["contCorn"]},
            7: {"name": "cran", "is_calc": False, "yield": 0, "ero": 0, "ploss": 2, "cn": 75, "insect": 0.12, "bird": 0,
                "econ": econ_cost["contCorn"]},
            8: {"name": "hayGrassland", "is_calc": True, "yield": hay_yield_arr, "ero": hay_er_arr, "ploss": hay_pl_arr,
                "cn": hay_cn_arr, "insect": 0, "bird": 0, "econ": econ_cost["pasture"]},
            9: {"name": "pasture", "is_calc": True, "yield": pasture_yield_arr, "ero": pasture_er_arr,
                "ploss": pasture_pl_arr, "cn": pasture_cn_arr, "insect": 0, "bird": 0, "econ": econ_cost["pasture"]},
            10: {"name": "hayGrassland", "is_calc": True, "yield": hay_yield_arr, "ero": hay_er_arr,
                 "ploss": hay_pl_arr,
                 "cn": hay_cn_arr, "insect": 0, "bird": 0, "econ": 0},
            11: {"name": "forest", "is_calc": False, "yield": 0, "ero": 0, "ploss": 0.067, "cn": 65, "insect": 0,
                 "bird": 0, "econ": 0},
            12: {"name": "water", "is_calc": False, "yield": 0, "ero": 0, "ploss": 0, "cn": 98, "insect": 0, "bird": 0,
                 "econ": 0},
            13: {"name": "wetland", "is_calc": False, "yield": 0, "ero": 0, "ploss": 0, "cn": 85, "insect": 0,
                 "bird": 0,
                 "econ": 0},
            14: {"name": "barren", "is_calc": False, "yield": 0, "ero": 0, "ploss": 0, "cn": 82, "insect": 0, "bird": 0,
                 "econ": 0},
            15: {"name": "shrub", "is_calc": False, "yield": 0, "ero": 0, "ploss": 0.067, "cn": 72, "insect": 0,
                 "bird": 0, "econ": 0},
        }
        selec_arr = [3, 4, 5, 6, 7, 8, 9, 10]
        # calc data for base run

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
        model_list_runoff = ["yield", "ero", "ploss", "cn", "insect", "econ", "runoff"]
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

            base_data_watershed["runoff"] = self.get_runoff_vectorized(base_data_watershed["cn"], 3)

        model_data_watershed = {
            "yield": np.copy(base_data_watershed["yield"]),
            "ero": np.copy(base_data_watershed["ero"]),
            "ploss": np.copy(base_data_watershed["ploss"]),
            "cn": np.copy(base_data_watershed["cn"]),
            "runoff": np.copy(base_data_watershed["runoff"]),
            "insect": np.copy(base_data_watershed["insect"]),
            "econ": np.copy(base_data_watershed["econ"]),
        }
        # zero out the cells in the model that are selected because we already have that data
        for model in model_data_watershed:
            if model == "runoff":
                model_data_watershed[model] = np.where(
                    model_data[model] > 0, 0,
                    model_data_watershed[model])
            else:
                # replace any cells in the base watershed with model outputs when the model value exists for that cell
                model_data_watershed[model] = np.where(
                    np.logical_and(model_data[model] != self.no_data, model_data[model] != -88), 0,
                    model_data_watershed[model])

            inter_data = np.where(
                np.logical_or(model_data_watershed[model] == self.no_data, model_data_watershed[model] < 0),
                0, model_data_watershed[model])
            inter_data = np.sum(inter_data)
            model_data_gross[1]["selection_watershed"][model] = inter_data

        model_data_gross[1]["selection_watershed"]["total_cells"] = total_cells
        # remove zeros from watershed base
        for model in base_data_watershed:
            base_data_watershed[model] = np.where(
                np.logical_or(base_data_watershed[model] == self.no_data, base_data_watershed[model] < 0),
                0, base_data_watershed[model])
        print(model_data_gross)
        # self.create_tif(base_data_watershed["runoff"], watershed_land_use_image, "zzzbase_watershed_runoff")
        # self.create_tif(model_data_watershed["runoff"], watershed_land_use_image, "zzzmodel_watershed_runoff")
        # self.create_tif(base_data_watershed["cn"], watershed_land_use_image, "zzzbase_watershed_cn")
        # self.create_tif(model_data_watershed["cn"], watershed_land_use_image, "zzzmodel_watershed_cn")
        # self.create_tif(model_data["runoff"], watershed_land_use_image, "zzzmodel_runoff")
        # self.create_tif(model_data["cn"], watershed_land_use_image, "zzzmodel_cn")
        # self.create_tif(model_data["insect"], watershed_land_use_image, "zzzmodel_insect")
        # self.create_tif(sum_base_insect["insect"], watershed_land_use_image, "zzzbase_insect")

        # # we are setting models less than zero to zero (effects mostly ero and ploss)
        # # this needs to come after whole watershed calcs so that we can capture no data cells
        # model = np.where(
        #     np.logical_or(model_data["yield"] == self.no_data, model_data["yield"] < 0),
        #     0, (model_data["yield"]))
        # sum_model_yield = np.sum(model)
        # model = np.where(
        #     np.logical_or(model_data["ero"] == self.no_data, model_data["ero"] < 0),
        #     0, (model_data["ero"]))
        # sum_model_ero = np.sum(model)
        # model = np.where(
        #     np.logical_or(model_data["ploss"] == self.no_data, model_data["ploss"] < 0),
        #     0, (model_data["ploss"]))
        # sum_model_ploss = np.sum(model)
        # model = np.where(
        #     np.logical_or(model_data["cn"] == self.no_data, model_data["cn"] < 0),
        #     0, (model_data["cn"]))
        # sum_model_cn = np.sum(model)
        # model = np.where(
        #     np.logical_or(model_data["runoff"] == self.no_data, model_data["runoff"] < 0),
        #     0, (model_data["runoff"]))
        # sum_model_runoff = np.sum(model)
        # model = np.where(
        #     np.logical_or(model_data["insect"] == self.no_data, model_data["insect"] < 0),
        #     0, (model_data["insect"]))
        # sum_model_insect = np.sum(model)
        # model = np.where(
        #     np.logical_or(model_data["econ"] == self.no_data, model_data["econ"] < 0),
        #     0, (model_data["econ"]))
        # sum_model_econ = np.sum(model)
        # print(np.sum(model_data_watershed["cn"]))
        # print(np.sum(sum_model_cn))

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

        sum_model_yield_watershed = 0
        sum_model_ero_watershed = 0
        sum_model_ploss_watershed = 0
        sum_model_cn_watershed = 0
        sum_model_runoff_watershed = 0
        sum_model_insect_watershed = 0
        sum_model_econ_watershed = 0
        sum_model_bird_watershed = 0
        for trans_layer in model_data_gross:
            print(trans_layer)
            # print(trans)
            tran = trans[str(trans_layer)]
            trans_adpotion = int(tran["selection"]["adoptionRate"]) / 100
            base_adpotion = 1 - trans_adpotion
            print("adoption rate ", trans_adpotion)
            print("base adoption rate ", base_adpotion)

            sum_model_yield = sum_model_yield + (model_data_gross[trans_layer]["selection"]["yield"] * trans_adpotion + model_data_gross[trans_layer]["base"]["yield"] * base_adpotion)
            sum_model_ero = sum_model_ero + (model_data_gross[trans_layer]["selection"]["ero"] * trans_adpotion + model_data_gross[trans_layer]["base"]["ero"] * base_adpotion)
            sum_model_ploss = sum_model_ploss + (model_data_gross[trans_layer]["selection"]["ploss"] * trans_adpotion + model_data_gross[trans_layer]["base"]["ploss"] * base_adpotion)
            sum_model_cn = sum_model_cn + (model_data_gross[trans_layer]["selection"]["cn"] * trans_adpotion + model_data_gross[trans_layer]["base"]["cn"] * base_adpotion)
            sum_model_runoff = sum_model_runoff + (model_data_gross[trans_layer]["selection"]["runoff"] * trans_adpotion + model_data_gross[trans_layer]["base"]["runoff"] * base_adpotion)
            sum_model_insect = sum_model_insect + (model_data_gross[trans_layer]["selection"]["insect"] * trans_adpotion + model_data_gross[trans_layer]["base"]["insect"] * base_adpotion)
            sum_model_econ = sum_model_econ + (model_data_gross[trans_layer]["selection"]["econ"] * trans_adpotion + model_data_gross[trans_layer]["base"]["econ"] * base_adpotion)
            sum_model_bird = sum_model_bird + (model_data_gross[trans_layer]["selection"]["bird"] * trans_adpotion + model_data_gross[trans_layer]["base"]["bird"] * base_adpotion)
            print(model_data_gross[trans_layer]["selection"]["bird"])
            print(model_data_gross[trans_layer]["base"]["bird"])
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
            sum_model_bird_watershed = sum_model_bird_watershed + model_data_gross[trans_layer]["selection_watershed"][
                "bird"]
        print("model yield sum ", sum_model_yield)
        sum_model_yield_watershed = sum_model_yield_watershed + sum_model_yield
        sum_model_ero_watershed = sum_model_ero_watershed + sum_model_ero
        sum_model_ploss_watershed = sum_model_ploss_watershed + sum_model_ploss
        sum_model_cn_watershed = sum_model_cn_watershed + sum_model_cn
        sum_model_runoff_watershed = sum_model_runoff_watershed + sum_model_runoff
        sum_model_insect_watershed = sum_model_insect_watershed + sum_model_insect
        sum_model_econ_watershed = sum_model_econ_watershed + sum_model_econ
        print(sum_model_bird_watershed)
        print(model_data_gross[1]["base_watershed"]["bird"])
        sum_model_bird_watershed = sum_model_bird_watershed + model_data_gross[1]["base_watershed"]["bird"] + sum_model_bird

        print(sum_model_bird_watershed)

        # sum_base_yield =sum_base_yield
        # sum_base_ero =sum_base_ero
        # sum_base_ploss =sum_base_ploss
        # sum_base_cn =sum_base_cn
        # sum_base_runoff =sum_base_runoff
        # sum_base_insect =sum_base_insect
        # sum_base_econ =sum_base_econ
        #
        # sum_base_yield_watershed =sum_base_yield_watershed
        # sum_base_ero_watershed =sum_base_ero_watershed
        # sum_base_ploss_watershed =sum_base_ploss_watershed
        # sum_base_cn_watershed =sum_base_cn_watershed
        # sum_base_runoff_watershed =sum_base_runoff_watershed
        # sum_base_insect_watershed =sum_base_insect_watershed
        # sum_base_econ_watershed =sum_base_econ_watershed
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
                    "total": "{:,.2f}".format(base_econ * area_selected),
                    "total_per_area": str("%.2f" % base_econ),
                    "total_watershed": "{:,.2f}".format(base_econ_water * area_watershed),
                    "total_per_area_watershed": str("%.2f" % base_econ_water),
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
                    "total": "{:,.2f}".format(model_econ * area_selected),
                    "total_per_area": str("%.2f" % model_econ),
                    "total_watershed": "{:,.2f}".format(model_econ_water * area_watershed),
                    "total_per_area_watershed": str("%.2f" % model_econ_water),
                    "units": "Erosion (tons/year)"
                },
                "yield": {
                    "total": "{:,.2f}".format(sum_model_yield / selected_cells * area_selected),
                    "total_per_area": str("%.2f" % (sum_model_yield / selected_cells)),
                    "total_watershed": "{:,.2f}".format(
                        sum_model_yield_watershed / total_cells * area_watershed),
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

    def convert_to_units_per_acre(self, value):
        return

    def get_model_stats(self):
        """
        Get statistics from selected cells and all cells in selected area for baseline and model runs
        Returns
        -------

        """
        return 1

    def get_runoff_vectorized(self, cn, rain):

        # CNMC3 = min(cn * math.exp(0.00673 * (100 - cn)), 99)
        # if slope > 0.05:
        #     CNfinal = min((CNMC3 - cn) / 3 * (
        #             1 - 2 * math.exp(-13.86 * slope)) + cn, 99)
        # else:
        #     CNfinal = cn
        #
        stor = (1000 / cn) - 10
        # rain = [.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]
        # for now we are just going to use 3 in of runoff
        # rain = [3]
        # event = []
        # for i in rain:
        #     if i > 0.2 * stor:
        #         runoff = math.pow(i - 0.2 * stor, 2) / (i + 0.8 * stor)
        #     else:
        #         runoff = 0
        #     event.append(round(runoff, 2))
        # return event[0]
        event = np.where(rain > 0.2 * stor,
                         np.power(rain - 0.2 * stor, 2) / (rain + 0.8 * stor),
                         0)

        return event

    def download_rasters(self, geoTransform, image, layer_dic, base_layer_dic, base_loaded,
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
                if model != "land_id":
                    print("downloading layer ", layer_dic[layer][
                        model])
                    url = geoserver_url + workspace + layer_dic[layer][
                        model] + extents_string_x + extents_string_y
                    raster_file_path = os.path.join(self.in_dir, layer_dic[layer][model] + ".tif")
                    self.createNewDownloadThread(url, raster_file_path)
        # use extents of aoi for base, so we get whole area
        if not base_loaded:
            for layer in base_layer_dic:
                print("downloading layer ", base_layer_dic[layer])
                url = geoserver_url + workspace + base_layer_dic[layer] + extents_string_x + extents_string_y
                raster_file_path = os.path.join(self.in_dir, layer + ".tif")
                self.createNewDownloadThread(url, raster_file_path)
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
        corn_arr = None
        soy_arr = None
        return {"contCorn": cont_yield, "cornGrain": corn_yield, "dairyRotation": dairy_yield}

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
                         "csogcdsnana": {"Pneeds": 46.67, "Nneeds": 60,
                                         "grazed_DM_lbs": 64.8,
                                         "grazed_P2O5_lbs": 0.81},
                         "csogcisnana": {"Pneeds": 46.67, "Nneeds": 60,
                                         "grazed_DM_lbs": 64.8,
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
