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
        print("data directory", self.in_dir)
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
        has_slope = False
        has_land = False
        has_stream = False
        print("creating png")
        print(slope1)
        print(slope2)
        print(rows, cols)
        # create empty raster to hold values from above calc
        image1 = gdal.Open(os.path.join(self.geo_folder, "landuse-clipped.tif"))

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
                np.logical_and(datanm_stream > float(stream_dist1), float(stream_dist2) > datanm_stream), -99, datanm_stream
            )
            has_stream = True
            # combine base case with slope
            datanm = np.where(np.logical_and(datanm == -99, datanm_stream == -99), -99, self.no_data)
        #     has_stream = True

        if landuse_par["cashGrain"] or landuse_par["contCorn"] or landuse_par["dairy"]:
            datanm_landuse = self.raster_inputs["landuse"]
            if landuse_par["cashGrain"]:
                cash_grain = 3
                datanm_landuse = np.where(
                    np.logical_and(cash_grain == datanm_landuse, datanm_landuse != self.no_data), -99, datanm_landuse
                )
                has_land = True
            if landuse_par["contCorn"]:
                cont_corn = 4
                print("selecting continous corn")
                datanm_landuse = np.where(
                    np.logical_and(cont_corn == datanm_landuse, datanm_landuse != self.no_data), -99, datanm_landuse
                )
                has_land = True

            if landuse_par["dairy"]:
                dairy = 5
                datanm_landuse = np.where(
                    np.logical_and(dairy == datanm_landuse, datanm_landuse != self.no_data), -99, datanm_landuse
                )
                has_land = True
            datanm = np.where(np.logical_and(datanm == -99, datanm_landuse == -99), -99, self.no_data)

        # need to combine the various possible selection arrays into one
        # todo need to look at making this work with multiple inputs
        # only works for slope and landuse selections
        # datanm = np.where(
        #     np.logical_or(datanm == -99, datanm_landuse == -99), -99, datanm
        # )
        # if there were no selection criteria applied
        # if not has_land and not has_slope and not has_land and not has_stream:
        #     datanm.fill(self.no_data)

        # datanm = np.where(np.logical_and(datanm == -99, datanm_stream == -99), -99, self.no_data)

        # copy datanm so we can use it for just the image
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
        print("done with selection")
        datanm_image = datanm_image * three_d
        datanm_image = datanm_image.astype(np.uint8)
        im = Image.fromarray(datanm_image)
        im.convert('RGBA')
        # saving the final output
        # as a PNG file
        im.save(self.raster_image_file_path)

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

    def run_models(self):
        """
        Create a model aggregate from all the input transformations specified by client
        -------

        """
        mm_to_ac = 0.000247105
        # shutil.copyfile(os.path.join(self.geo_folder, "slope_aoi-clipped.tif"), os.path.join(self.in_dir, "base_aoi.tif"))
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
        print(self.geo_folder)
        trans = self.request_json['trans']
        base_scen = self.request_json['base']
        # region = self.request_json['base']
        region = self.request_json['region']
        aoi_area_total = self.request_json["aoiArea"]
        aoi_extents = self.request_json["aoiExtents"]
        print("area", aoi_area_total)
        print("area", aoi_extents)
        self.in_dir = self.in_dir
        insect = {"contCorn": 0.51,
                  "cornGrain": 0.51,
                  "dairyRotation": 0.12,
                  "pasture": 0
                  }
        file_list = []
        # get each transformation selection output raster
        layer_dic = {}
        layer_area_dic = {}
        base_layer_dic = {}

        # download layers for base case
        base_names = ("contCorn", "cornGrain", "dairyRotation", "hayGrassland", "pastureWatershed")
        model_names_base = ("ero", "pl", "cn")
        model_names_base = ("Erosion", "PI", "CN")
        # contCorn
        # create name of the layer that corresponds to geoserver for base case
        for name in base_names:
            for model in model_names_base:
                if name == "hayGrassland" or name == "pastureWatershed":
                    # medium_GrassYield_southWestWI.tif
                    # pasture_CN_rt_rt_0_0_southWestWI.tif
                    base_layer_dic[name + "_" + model] = "SmartScapeRaster:pasture_" + model + "_rt_rt_0_0_" + region
                else:
                    file_name = name + "_" + \
                                model + "_" + \
                                base_scen["management"]["cover"] + "_" + \
                                base_scen["management"]["tillage"] + "_" + \
                                base_scen["management"]["contour"] + "_" + \
                                base_scen["management"]["fertilizer"] + "_" + \
                                region
                    base_layer_dic[name + "_" + model] = "SmartScapeRaster:" + file_name
        # download corn and soy rasters for yield
        corn = "corn_Yield_" + region
        soy = "soy_Yield_" + region
        base_layer_dic["corn_yield"] = "SmartScapeRaster:" + corn
        base_layer_dic["soy_yield"] = "SmartScapeRaster:" + soy
        base_layer_dic["landuse"] = "SmartScapeRaster:" + region + "_WiscLand_30m"
        base_layer_dic["hyd_letter"] = "SmartScapeRaster:" + region + "_hydgrp_30m"
        base_layer_dic["hayGrassland_Yield"] = "SmartScapeRaster:pasture_Yield_medium_" + region
        base_layer_dic["pastureWatershed_Yield"] = "SmartScapeRaster:pasture_Yield_medium_" + region

        watershed_file_list = []
        # create list of layers to download for each trans
        for tran in trans:
            layer_dic[tran["rank"]] = {}

            # for each trans get the path to the selection raster used
            file = os.path.join(self.data_dir, tran["id"], "selection_output.tif")

            file_list.append(file)
            # watershed_file_list.append(os.path.join(self.data_dir, tran["id"], "landuse_watershed.tif"))
            # open each trans selection to get number of selected cells
            image = gdal.Open(file)
            band = image.GetRasterBand(1)
            arr = band.ReadAsArray()
            unique, counts = np.unique(arr, return_counts=True)
            print(unique)
            print(counts)

            print("trans id ", tran["id"])
            # total_count = np.count_nonzero(arr > -100)
            print("total selected", np.count_nonzero(arr == -99))
            selected_cells = np.count_nonzero(arr == -99)
            total_cells = np.count_nonzero(arr > self.no_data)
            print("total not selected", np.count_nonzero(arr == -88))
            if tran["management"]["rotationType"] == "pasture":
                yield_name = "SmartScapeRaster:pasture_Yield_" + tran["management"]["grassYield"] + "_" + region
                ero_name = "SmartScapeRaster:pasture_Erosion_" + tran["management"]["density"] + "_" + \
                           tran["management"]["fertilizer"] + "_" + region
                ploss_name = "SmartScapeRaster:pasture_PI_" + tran["management"]["density"] + "_" + \
                             tran["management"]["fertilizer"] + "_" + region
                cn_name = "SmartScapeRaster:pasture_CN_" + tran["management"]["density"] + "_" + \
                          tran["management"]["fertilizer"] + "_" + region
                layer_dic[tran["rank"]]["yield"] = yield_name

            else:
                corn = "corn_Yield_" + region
                soy = "soy_Yield_" + region
                layer_dic[tran["rank"]]["corn"] = "SmartScapeRaster:" + corn
                layer_dic[tran["rank"]]["soy"] = "SmartScapeRaster:" + soy

                ero_name = "SmartScapeRaster:" + tran["management"]["rotationType"] + "_Erosion_" + \
                            tran["management"]["cover"] + "_" + tran["management"]["tillage"] + "_" + \
                            tran["management"]["contour"] + "_" + tran["management"]["fertilizer"] + "_" + region
                ploss_name = "SmartScapeRaster:" + tran["management"]["rotationType"] + "_PI_" + \
                            tran["management"]["cover"] + "_" + tran["management"]["tillage"] + "_" + \
                            tran["management"]["contour"] + "_" + tran["management"]["fertilizer"] + "_" + region
                cn_name = "SmartScapeRaster:" + tran["management"]["rotationType"] + "_CN_" + \
                            tran["management"]["cover"] + "_" + tran["management"]["tillage"] + "_" + \
                            tran["management"]["contour"] + "_" + tran["management"]["fertilizer"] + "_" + region
            layer_dic[tran["rank"]]["ero"] = ero_name
            layer_dic[tran["rank"]]["ploss"] = ploss_name
            layer_dic[tran["rank"]]["cn"] = cn_name

            layer_area_dic[tran["rank"]] = {}
            layer_area_dic[tran["rank"]]["area"] = "{:,.0f}".format(tran["area"] *
                                                                    (selected_cells / total_cells) * mm_to_ac)
        print("area", layer_area_dic)
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
        for tran in trans:
            # file = trans[tran]["id"]
            file = os.path.join(self.data_dir, tran["id"])
            print(file)
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
        for tran in trans:
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

        self.download_rasters(geoTransform, image, layer_dic, base_layer_dic)
        # count cells for area that has been selected for the whole aoi
        # this only counts cells from the heierarchy
        # the total area of the selected transformations
        print("Number of selected cells ", np.count_nonzero(arr > 0))
        # cells selected have the hierarchy number
        selected_cells = np.count_nonzero(arr > 0)
        # valid cells are -88 and greater
        total_cells = np.count_nonzero(arr > self.no_data)
        print("total number of cells ", np.count_nonzero(arr > self.no_data))
        area_selected_total = aoi_area_total * np.count_nonzero(arr > 0) / np.count_nonzero(arr > self.no_data)
        print("total area selected by transformations aoi ", area_selected_total)
        print("total area in aoi ", aoi_area_total)

        # open model results raster
        model_list = ["yield", "ero", "ploss", "cn", "insect"]
        # {1:{"yield":"filename", "ero": "filename:}}
        # dic to hold outputs from the models
        model_data = {
            "yield": np.copy(arr),
            "ero": np.copy(arr),
            "ploss": np.copy(arr),
            "cn": np.copy(arr),
            "runoff": np.copy(arr),
            "insect": np.copy(arr),
        }

        print("running transformation models")
        print(layer_dic)
        print(base_layer_dic)
        print(layer_area_dic)
        for layer in layer_dic:
            # yield
            print("layer", layer)
            for model in model_list:
                print("running model ", model)

                if model == "yield" and "yield" not in layer_dic[layer]:
                    for tran in trans:
                        if tran["rank"] == layer:
                            # print(trans)
                            print(tran["management"]["rotationType"])
                            field_yield = self.calculate_yield_field()
                            model_data[model] = np.where(model_data[model] == layer,
                                                         field_yield[tran["management"]["rotationType"]],
                                                         model_data[model])
                            continue
                    continue
                if model == "insect":
                    print("running insect")
                    print(insect[tran["management"]["rotationType"]])
                    model_data[model] = np.where(model_data[model] == layer, insect[tran["management"]["rotationType"]],
                                                 model_data[model])
                    continue
                model_trans_filepath = os.path.join(self.in_dir, layer_dic[layer][model] + ".tif")
                model_image = gdal.Open(model_trans_filepath)
                model_band = model_image.GetRasterBand(1)
                model_arr = model_band.ReadAsArray()

                # arr is the array from the merged tif
                # layer is the rank of the trans
                # if hierarchy matches the trans rank replace that value with the model value
                if model == "cn":
                    cn_final = np.where(model_data[model] == layer, model_arr, model_data[model])
                    # print("sum of cn" , np.sum(cn_final)
                    # only looking at 3 in storm
                    model_data["runoff"] = self.get_runoff_vectorized(cn_final, 3)
                    model_data[model] = cn_final
                else:
                    model_data[model] = np.where(model_data[model] == layer, model_arr, model_data[model])

                model_image = None
                model_band = None
                model_arr = None

        print("done with trans models")

        #   iterate through wiscland layer
        landuse_image = gdal.Open(os.path.join(self.in_dir, "landuse.tif"))
        landuse_arr = landuse_image.GetRasterBand(1).ReadAsArray()
        # create new array where landuse codes are plugged into arr (arr is the raster with rank of the selected cells)
        # and more importantly is has our selected cells
        # selected values are greater than zero
        landuse_arr_sel = np.where(arr > 0, landuse_arr, arr)

        # debugging code and how to output a raster
        # [rows, cols] = landuse_arr_sel.shape
        # driver = gdal.GetDriverByName("GTiff")
        # outdata = driver.Create(os.path.join(self.in_dir, "landuse_replaced.tif"), cols, rows, 1,
        #                         gdal.GDT_Float32)
        # outdata.SetGeoTransform(landuse_image.GetGeoTransform())  ##sets same geotransform as input
        # outdata.SetProjection(landuse_image.GetProjection())  ##sets same projection as input
        # outdata.GetRasterBand(1).WriteArray(landuse_arr_sel)
        # outdata.GetRasterBand(1).SetNoDataValue(-9999)
        # # write to disk
        # outdata.FlushCache()
        # model_image = None
        # model_band = None
        # model_arr = None

        base_data = {
            "yield": np.copy(landuse_arr_sel),
            "ero": np.copy(landuse_arr_sel),
            "ploss": np.copy(landuse_arr_sel),
            "cn": np.copy(landuse_arr_sel),
            "runoff": np.copy(landuse_arr_sel),
            "insect": np.copy(landuse_arr_sel),
        }

        # for model in model_list:
        #     for land_type in watershed_total:
        #         # CN and runoff
        #         base_image = gdal.Open(os.path.join(self.in_dir, "contCorn_" + CN + ".tif"))
        #         base_arr = base_image.GetRasterBand(1).ReadAsArray()
        #         cn_final = np.where(base_data["cn"] == 4, base_arr, base_data["cn"])
        #         base_data["runoff"] = np.where(base_data["runoff"] == 4, self.get_runoff_vectorized(cn_final, 3), base_data["runoff"])
        #         base_data["cn"] = cn_final

        base_image = gdal.Open(os.path.join(self.in_dir, "contCorn_CN.tif"))
        base_arr_corn_cn = base_image.GetRasterBand(1).ReadAsArray()
        cn_final = np.where(base_data["cn"] == 4, base_arr_corn_cn, base_data["cn"])
        base_data["runoff"] = np.where(base_data["runoff"] == 3, self.get_runoff_vectorized(cn_final, 3),
                                       base_data["runoff"])
        base_data["cn"] = cn_final

        base_image = gdal.Open(os.path.join(self.in_dir, "cornGrain_CN.tif"))
        base_arr_corngrain_cn = base_image.GetRasterBand(1).ReadAsArray()
        cn_final = np.where(base_data["cn"] == 3, base_arr_corngrain_cn, base_data["cn"])
        base_data["runoff"] = np.where(base_data["runoff"] == 5, self.get_runoff_vectorized(cn_final, 3),
                                       base_data["runoff"])
        base_data["cn"] = cn_final

        base_image = gdal.Open(os.path.join(self.in_dir, "dairyRotation_CN.tif"))
        base_arr_dairy_cn = base_image.GetRasterBand(1).ReadAsArray()
        cn_final = np.where(base_data["cn"] == 5, base_arr_dairy_cn, base_data["cn"])
        base_data["runoff"] = self.get_runoff_vectorized(cn_final, 3)
        base_data["cn"] = cn_final

        base_cn = np.where(
            np.logical_or(base_data["cn"] == self.no_data, base_data["cn"] < 0),
            0, (base_data["cn"]))
        sum_base_cn = np.sum(base_cn)
        base_runoff = np.where(
            np.logical_or(base_data["runoff"] == self.no_data, base_data["runoff"] < 0),
            0, (base_data["runoff"]))
        sum_base_runoff = np.sum(base_runoff)
        # Ploss
        landuse_ero = np.copy(landuse_arr_sel)
        landuse_yield = np.copy(landuse_arr_sel)

        cont_pl_image = gdal.Open(os.path.join(self.in_dir, "contCorn_PI.tif"))
        cont_pl_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_arr_sel = np.where(landuse_arr_sel == 4, cont_pl_arr, landuse_arr_sel)

        corn_pl_image = gdal.Open(os.path.join(self.in_dir, "cornGrain_PI.tif"))
        corn_pl_arr = corn_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_arr_sel = np.where(landuse_arr_sel == 3, corn_pl_arr, landuse_arr_sel)

        dairy_pl_image = gdal.Open(os.path.join(self.in_dir, "dairyRotation_PI.tif"))
        dairy_pl_arr = dairy_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_arr_sel = np.where(landuse_arr_sel == 5, dairy_pl_arr, landuse_arr_sel)

        landuse_arr_sel = np.where(
            np.logical_or(landuse_arr_sel == self.no_data, landuse_arr_sel < 0),
            0, landuse_arr_sel)
        sum_base = np.sum(landuse_arr_sel)

        # Insect
        # contCorn
        base_data["insect"] = np.where(base_data["insect"] == 4, .51, base_data["insect"])
        # cash grain
        base_data["insect"] = np.where(base_data["insect"] == 3, .51, base_data["insect"])
        # dairy
        base_data["insect"] = np.where(base_data["insect"] == 5, .12, base_data["insect"])

        base_insect = np.where(
            np.logical_or(base_data["insect"] == self.no_data, base_data["insect"] < 0),
            0, (base_data["insect"]))
        sum_base_insect = np.sum(base_insect)



        # Erosion
        # cont_pl_image = gdal.Open(os.path.join(self.in_dir, "cont_er_nc_su_25_50_1.tif"))
        cont_pl_image = gdal.Open(os.path.join(self.in_dir, "contCorn_Erosion.tif"))
        cont_er_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_ero = np.where(landuse_ero == 4, cont_er_arr, landuse_ero)

        # corn_pl_image = gdal.Open(os.path.join(self.in_dir, "corn_er_nc_su_25_50_1.tif"))
        corn_pl_image = gdal.Open(os.path.join(self.in_dir, "cornGrain_Erosion.tif"))
        corn_er_arr = corn_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_ero = np.where(landuse_ero == 3, corn_er_arr, landuse_ero)

        # dairy_pl_image = gdal.Open(os.path.join(self.in_dir, "dairy_er_nc_su_25_50_1.tif"))
        dairy_pl_image = gdal.Open(os.path.join(self.in_dir, "dairyRotation_Erosion.tif"))
        dairy_er_arr = dairy_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_ero = np.where(landuse_ero == 5, dairy_er_arr, landuse_ero)

        # model_value * conversion from ac to value / 30 sq m
        landuse_ero = np.where(
            np.logical_or(landuse_ero == self.no_data, landuse_ero < 0),
            0, landuse_ero)
        sum_base_ero = np.sum(landuse_ero)

        # base yield
        corn_image = gdal.Open(os.path.join(self.in_dir, "corn_yield.tif"))
        corn_arr = corn_image.GetRasterBand(1).ReadAsArray()
        # [bushels/acre x 10] original units and then convert to tons of dry matter / ac
        corn_arr = corn_arr / 10
        alfalfa_yield = corn_arr * 0.0195 * 2000 * (1 - 0.13) / 2000
        silage_yield = ((3.73E-4 * corn_arr * corn_arr) + (3.95E-2 * corn_arr + 6.0036)) * 2000 * (1 - 0.65) / 2000
        corn_arr = corn_arr * 56 * (1 - 0.155) / 2000

        soy_image = gdal.Open(os.path.join(self.in_dir, "soy_yield.tif"))
        soy_arr = soy_image.GetRasterBand(1).ReadAsArray()
        soy_arr = soy_arr * 60 * 0.792 * 0.9008 / (2000 * 10)

        cont_yield = corn_arr
        corn_yield = (corn_arr * .5) + (soy_arr * .5)
        dairy_yield = 1 / 5 * silage_yield + 1 / 5 * corn_arr + 3 / 5 * alfalfa_yield

        landuse_yield = np.where(landuse_yield == 4, cont_yield, landuse_yield)
        landuse_yield = np.where(landuse_yield == 3, corn_yield, landuse_yield)
        landuse_yield = np.where(landuse_yield == 5, dairy_yield, landuse_yield)


        landuse_yield = np.where(
            np.logical_or(landuse_yield == self.no_data, landuse_yield < 0),
            0, landuse_yield)
        sum_base_yield = np.sum(landuse_yield)
        count1 = np.count_nonzero(landuse_yield > 0)
        print("base yield cell count", count1)

        print("Selected yield is", sum_base_yield)
        # example of writing merged to to whole watershed

        # time.sleep(15)
        print("clip")
        watershed_land_use_image = gdal.Open(os.path.join(self.geo_folder, "landuse_aoi-clipped.tif"))
        # watershed_land_use_image = gdal.Open(os.path.join(self.in_dir, "transformation_landuse.tif"))
        watershed_land_use_band = watershed_land_use_image.GetRasterBand(1)
        watershed_land_use = watershed_land_use_band.ReadAsArray()
        print("shape of watershed land use ", watershed_land_use.shape)
        base_data_watershed = {
            "yield": np.copy(watershed_land_use),
            "ero": np.copy(watershed_land_use),
            "ploss": np.copy(watershed_land_use),
            "cn": np.copy(watershed_land_use),
            "runoff": np.copy(watershed_land_use),
            "insect": np.copy(watershed_land_use),
        }


        cont_pl_image = gdal.Open(os.path.join(self.in_dir, "hayGrassland_Yield.tif"))
        hay_yield_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        cont_pl_image = gdal.Open(os.path.join(self.in_dir, "hayGrassland_Erosion.tif"))
        hay_er_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        cont_pl_image = gdal.Open(os.path.join(self.in_dir, "hayGrassland_PI.tif"))
        hay_pl_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        cont_pl_image = gdal.Open(os.path.join(self.in_dir, "hayGrassland_CN.tif"))
        hay_cn_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()

        cont_pl_image = gdal.Open(os.path.join(self.in_dir, "pastureWatershed_Yield.tif"))
        pasture_yield_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        cont_pl_image = gdal.Open(os.path.join(self.in_dir, "pastureWatershed_Erosion.tif"))
        pasture_er_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        cont_pl_image = gdal.Open(os.path.join(self.in_dir, "pastureWatershed_PI.tif"))
        pasture_pl_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        cont_pl_image = gdal.Open(os.path.join(self.in_dir, "pastureWatershed_CN.tif"))
        pasture_cn_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()

        watershed_total = {
            1: {"name": "highUrban", "is_calc": False, "yield": 0, "ero": 2, "pl": 1.34, "cn": 93, "insect": 0.51},
            2: {"name": "lowUrban", "is_calc": False, "yield": 0, "ero": 2, "pl": 0.81, "cn": 85, "insect": 0.51},
            4: {"name": "contCorn", "is_calc": True, "yield": cont_yield, "ero": cont_er_arr, "pl": cont_pl_arr,
                "cn": base_arr_corn_cn, "insect": 0.51},
            3: {"name": "cornGrain", "is_calc": True, "yield": corn_yield, "ero": corn_er_arr, "pl": corn_pl_arr,
                "cn": base_arr_corngrain_cn, "insect": 0.51},
            5: {"name": "dairyRotation", "is_calc": True, "yield": dairy_yield, "ero": dairy_er_arr, "pl": dairy_pl_arr,
                "cn": base_arr_dairy_cn, "insect": 0.12},
            6: {"name": "potVeg", "is_calc": False, "yield": 0, "ero": 0, "pl": 2, "cn": 75, "insect": 0.12},
            7: {"name": "cran", "is_calc": False, "yield": 0, "ero": 0, "pl": 2, "cn": 75, "insect": 0.12},
            8: {"name": "hayGrassland", "is_calc": True, "yield": hay_yield_arr, "ero": hay_er_arr, "pl": hay_pl_arr, "cn": hay_cn_arr, "insect": 0},
            9: {"name": "pasture", "is_calc": True, "yield": pasture_yield_arr, "ero": pasture_er_arr, "pl": pasture_pl_arr, "cn": pasture_cn_arr, "insect": 0},
            10: {"name": "hayGrassland", "is_calc": True, "yield": hay_yield_arr, "ero": hay_er_arr, "pl": hay_pl_arr, "cn": hay_cn_arr, "insect": 0},
            11: {"name": "forest", "is_calc": False, "yield": 0, "ero": 0, "pl": 0.067, "cn": 65, "insect": 0},
            12: {"name": "water", "is_calc": False, "yield": 0, "ero": 0, "pl": 0, "cn": 98, "insect": 0},
            13: {"name": "wetland", "is_calc": False, "yield": 0, "ero": 0, "pl": 0, "cn": 85, "insect": 0},
            14: {"name": "barren", "is_calc": False, "yield": 0, "ero": 0, "pl": 0, "cn": 82, "insect": 0},
            15: {"name": "shrub", "is_calc": False, "yield": 0, "ero": 0, "pl": 0.067, "cn": 72, "insect": 0},
        }

        for land_type in watershed_total:
            # model_data[model] = np.where(model_data[model] == layer, model_arr, model_data[model])
            base_data_watershed["yield"] = np.where(base_data_watershed["yield"] == land_type,
                                                    watershed_total[land_type]["yield"], base_data_watershed["yield"])
            base_data_watershed["ero"] = np.where(base_data_watershed["ero"] == land_type,
                                                  watershed_total[land_type]["ero"], base_data_watershed["ero"])
            base_data_watershed["ploss"] = np.where(base_data_watershed["ploss"] == land_type,
                                                    watershed_total[land_type]["pl"], base_data_watershed["ploss"])
            base_data_watershed["cn"] = np.where(base_data_watershed["cn"] == land_type,
                                                 watershed_total[land_type]["cn"], base_data_watershed["cn"])
            base_data_watershed["insect"] = np.where(base_data_watershed["insect"] == land_type,
                                                     watershed_total[land_type]["insect"],
                                                     base_data_watershed["insect"])
            base_data_watershed["runoff"] = self.get_runoff_vectorized(base_data_watershed["cn"], 3)
        # print(base_data_watershed["yield"])
        model_data_watershed = {
            "yield": np.copy(base_data_watershed["yield"]),
            "ero": np.copy(base_data_watershed["ero"]),
            "ploss": np.copy(base_data_watershed["ploss"]),
            "cn": np.copy(base_data_watershed["cn"]),
            "runoff": np.copy(base_data_watershed["runoff"]),
            "insect": np.copy(base_data_watershed["insect"]),
        }
        # base_test = np.where(
        #     np.logical_or(model_data_watershed["yield"] == self.no_data,  model_data_watershed["yield"] < 0),
        #     0,  model_data_watershed["yield"] * ac_to_m)
        # test_sum = np.sum(base_test)
        # print("sum of yield for base", test_sum)
        #
        # count1 = np.count_nonzero(model_data_watershed["yield"] > 0)
        # print("Whole watershed cell count", count1)
        # model_data_watershed["yield"] = np.where(model_data["yield"] != self.no_data, model_data["yield"],
        #                                          model_data_watershed["yield"])
        # base_test = np.where(
        #     np.logical_or(model_data_watershed["yield"] == self.no_data, model_data_watershed["yield"] < 0),
        #     0, model_data_watershed["yield"] * ac_to_m)
        # test_sum = np.sum(base_test)
        # print("sum of yield for watershed with model", test_sum)
        for model in model_data_watershed:
            # set any negative values to zero
            # if model == "insect":
            #     model_data_watershed[model] = np.where(
            #         np.logical_or(model_data_watershed[model] == self.no_data, model_data_watershed[model] < 0),
            #         0, model_data_watershed[model])
            #
            #     continue
            if model == "runoff":
                model_data_watershed[model] = np.where(
                    model_data[model] > 0, model_data[model],
                    model_data_watershed[model])
            else:
                # replace any cells in the base watershed with model ouputs when the model value exists for that cell
                model_data_watershed[model] = np.where(np.logical_and(model_data[model] != self.no_data, model_data[model] != -88), model_data[model],
                                                       model_data_watershed[model])
            model_data_watershed[model] = np.where(
                np.logical_or(model_data_watershed[model] == self.no_data, model_data_watershed[model] < 0),
                0, model_data_watershed[model])
        # remove zeros from watershed base
        for model in base_data_watershed:
            base_data_watershed[model] = np.where(
                np.logical_or(base_data_watershed[model] == self.no_data, base_data_watershed[model] < 0),
                0, base_data_watershed[model])

        # self.create_tif(base_data_watershed["runoff"], watershed_land_use_image, "zzzbase_watershed_runoff")
        # self.create_tif(model_data_watershed["runoff"], watershed_land_use_image, "zzzmodel_watershed_runoff")
        # self.create_tif(base_data_watershed["cn"], watershed_land_use_image, "zzzbase_watershed_cn")
        # self.create_tif(model_data_watershed["cn"], watershed_land_use_image, "zzzmodel_watershed_cn")
        # self.create_tif(model_data["runoff"], watershed_land_use_image, "zzzmodel_runoff")
        # self.create_tif(model_data["cn"], watershed_land_use_image, "zzzmodel_cn")
        # self.create_tif(model_data["insect"], watershed_land_use_image, "zzzmodel_insect")
        # self.create_tif(sum_base_insect["insect"], watershed_land_use_image, "zzzbase_insect")





        # model = np.where(
        #     np.logical_or(model_data["yield"] == self.no_data, model_data["yield"] < 0),
        #     0, (model_data["yield"] * ac_to_m))
        # test_sum = np.sum(model)
        # print("sum of yield for mdoel", test_sum)

        # base_data_watershed["yield"] = base_data_watershed["yield"].flatten()
        # values, counts = np.unique(base_data_watershed["yield"], return_counts=True)
        # print(values)
        # print(counts)
        # model run
        # we are setting models less than zero to zero (effects mostly ero and ploss)
        # this needs to come after whole watershed calcs so that we can capture no data cells
        model = np.where(
            np.logical_or(model_data["yield"] == self.no_data, model_data["yield"] < 0),
            0, (model_data["yield"]))
        sum_model_yield = np.sum(model)
        model = np.where(
            np.logical_or(model_data["ero"] == self.no_data, model_data["ero"] < 0),
            0, (model_data["ero"]))
        sum_model_ero = np.sum(model)
        model = np.where(
            np.logical_or(model_data["ploss"] == self.no_data, model_data["ploss"] < 0),
            0, (model_data["ploss"]))
        sum_model_ploss = np.sum(model)
        model = np.where(
            np.logical_or(model_data["cn"] == self.no_data, model_data["cn"] < 0),
            0, (model_data["cn"]))
        sum_model_cn = np.sum(model)
        model = np.where(
            np.logical_or(model_data["runoff"] == self.no_data, model_data["runoff"] < 0),
            0, (model_data["runoff"]))
        sum_model_runoff = np.sum(model)
        model = np.where(
            np.logical_or(model_data["insect"] == self.no_data, model_data["insect"] < 0),
            0, (model_data["insect"]))
        sum_model_insect = np.sum(model)
        print(np.sum(model_data_watershed["cn"]))
        print(np.sum(sum_model_cn))

        area_selected = area_selected_total * mm_to_ac
        area_watershed = aoi_area_total * mm_to_ac
        return {
            "base": {
                "ploss": {"total": "{:,.0f}".format(sum_base / selected_cells * area_selected),
                          "total_per_area": str("%.1f" % (sum_base / selected_cells)),
                          "total_watershed": "{:,.0f}".format(np.sum(base_data_watershed["ploss"])/ total_cells * area_watershed),
                          "total_per_area_watershed": str("%.1f" % (np.sum(base_data_watershed["ploss"]) / total_cells)),
                          "units": "Phosphorus Runoff (lb/year)"
                          },
                "ero": {"total": "{:,.0f}".format(sum_base_ero / selected_cells * area_selected),
                        "total_per_area": str("%.1f" % (sum_base_ero / selected_cells)),
                        "total_watershed": "{:,.0f}".format(np.sum(base_data_watershed["ero"])/ total_cells * area_watershed),
                        "total_per_area_watershed": str("%.1f" % (np.sum(base_data_watershed["ero"]) / total_cells)),
                        "units": "Erosion (tons/year)"
                        },
                "yield": {"total": "{:,.0f}".format(sum_base_yield/ selected_cells * area_selected),
                          "total_per_area": str("%.1f" % (sum_base_yield / selected_cells)),
                          "total_watershed": "{:,.0f}".format(np.sum(base_data_watershed["yield"])/ total_cells * area_watershed),
                          "total_per_area_watershed": str("%.1f" % (np.sum(base_data_watershed["yield"]) / total_cells)),
                          "units": "Yield (tons-Dry Matter/year)"
                          },
                "cn": {
                    "total": "{:,.0f}".format(sum_base_cn / selected_cells),
                    "total_per_area": str("%.0f" % (sum_base_cn  / selected_cells)),
                    "total_watershed": "{:,.0f}".format(np.sum(base_data_watershed["cn"])/ total_cells),
                    "total_per_area_watershed": str("%.0f" % (np.sum(base_data_watershed["cn"]) / total_cells)),
                    "units": "Curve Number"
                },
                "insect": {
                    "total": "{:,.0f}".format(sum_base_insect / selected_cells),
                    "total_per_area": str("%.1f" % (sum_base_insect/ selected_cells)),
                    "total_watershed": "{:,.0f}".format(np.sum(base_data_watershed["insect"])/ total_cells),
                    "total_per_area_watershed": str("%.1f" % (np.sum(base_data_watershed["insect"]) / total_cells)),
                    "units": ""
                },
                "runoff": {
                    "total": "{:,.0f}".format(sum_base_runoff / 12 / selected_cells * area_selected),
                    "total_per_area": str("%.1f" % (sum_base_runoff / selected_cells)),
                    "total_watershed": "{:,.0f}".format(np.sum(base_data_watershed["runoff"])/ 12/ total_cells * area_watershed),
                    "total_per_area_watershed": str("%.1f" % (np.sum(base_data_watershed["runoff"]) / total_cells)),
                    "units": ""
                },
            },
            "model": {
                "ploss": {
                    "total": "{:,.0f}".format(sum_model_ploss/ selected_cells * area_selected),
                    "total_per_area": str("%.1f" % (sum_model_ploss / selected_cells)),
                    "total_watershed": "{:,.0f}".format(np.sum(model_data_watershed["ploss"])/ total_cells * area_watershed),
                    "total_per_area_watershed": str("%.1f" % (np.sum(model_data_watershed["ploss"]) / total_cells)),
                    "units": "Phosphorus Runoff (lb/year)"
                },
                "ero": {
                    "total": "{:,.0f}".format(sum_model_ero/ selected_cells * area_selected),
                    "total_per_area": str("%.1f" % (sum_model_ero / selected_cells)),
                    "total_watershed": "{:,.0f}".format(np.sum(model_data_watershed["ero"])/ total_cells * area_watershed),
                    "total_per_area_watershed": str("%.1f" % (np.sum(model_data_watershed["ero"]) / total_cells)),
                    "units": "Erosion (tons/year)"
                },
                "yield": {
                    "total": "{:,.0f}".format(sum_model_yield/ selected_cells * area_selected),
                    "total_per_area": str("%.1f" % (sum_model_yield / selected_cells)),
                    "total_watershed": "{:,.0f}".format(np.sum(model_data_watershed["yield"])/ total_cells * area_watershed),
                    "total_per_area_watershed": str("%.1f" % (np.sum(model_data_watershed["yield"]) / total_cells)),
                    "units": "Yield (tons-Dry Matter/year)"
                },
                "cn": {
                    "total": "{:,.0f}".format(sum_model_cn / selected_cells),
                    "total_per_area": str("%.0f" % (sum_model_cn / selected_cells)),
                    "total_watershed": "{:,.0f}".format(np.sum(model_data_watershed["cn"]) / total_cells),
                    "total_per_area_watershed": str("%.0f" % (np.sum(model_data_watershed["cn"]) / total_cells)),
                    "units": "Curve Number"
                },
                "insect": {
                    "total": "{:,.0f}".format(sum_model_insect / selected_cells),
                    "total_per_area": str("%.1f" % (sum_model_insect / selected_cells)),
                    "total_watershed": "{:,.0f}".format(np.sum(model_data_watershed["insect"])/ total_cells),
                    "total_per_area_watershed": str("%.1f" % (np.sum(model_data_watershed["insect"]) / total_cells)),
                    "units": ""
                },
                "runoff": {
                    "total": "{:,.0f}".format(sum_model_runoff / 12 / selected_cells * area_selected),
                    "total_per_area": str("%.1f" % (sum_model_runoff / selected_cells)),
                    "total_watershed": "{:,.0f}".format(np.sum(model_data_watershed["runoff"])/ 12/ total_cells * area_watershed),
                    "total_per_area_watershed": str("%.1f" % (np.sum(model_data_watershed["runoff"]) / total_cells)),
                    "units": ""
                },
            },
            "land_stats": {
                "area": "{:,.0f}".format(area_selected),
                "area_watershed": "{:,.0f}".format(area_watershed),
                "area_trans": layer_area_dic,
                "model_id": self.in_dir,
            },
            "debugging":{
                "runoff_base":base_data_watershed["runoff"].tolist(),
                "runoff_model":model_data_watershed["runoff"].tolist(),
                "actual_landuse":watershed_land_use.tolist()

            }

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

    def download_rasters(self, geoTransform, image, layer_dic, base_layer_dic):
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
                print("downloading layer ", layer_dic[layer][
                    model])
                url = geoserver_url + layer_dic[layer][
                    model] + extents_string_x + extents_string_y
                raster_file_path = os.path.join(self.in_dir, layer_dic[layer][model] + ".tif")
                self.createNewDownloadThread(url, raster_file_path)
        # use extents of aoi for base, so we get whole area
        for layer in base_layer_dic:
            print("downloading layer ", base_layer_dic[layer])
            url = geoserver_url + base_layer_dic[layer] + extents_string_x + extents_string_y
            raster_file_path = os.path.join(self.in_dir, layer + ".tif")
            self.createNewDownloadThread(url, raster_file_path)
        self.joinThreads()
        print("done writing")

    def calculate_yield_field(self):
        corn_image = gdal.Open(os.path.join(self.in_dir, "corn_yield.tif"))
        corn_arr = corn_image.GetRasterBand(1).ReadAsArray()
        # [bushels/acre x 10] original units and then convert to tons of dry matter / ac
        corn_arr = corn_arr / 10
        alfalfa_yield = corn_arr * 0.0195 * 2000 * (1 - 0.13) / 2000
        silage_yield = ((3.73E-4 * corn_arr * corn_arr) + (3.95E-2 * corn_arr + 6.0036)) * 2000 * (1 - 0.65) / 2000
        corn_arr = corn_arr * 56 * (1 - 0.155) / 2000

        soy_image = gdal.Open(os.path.join(self.in_dir, "soy_yield.tif"))
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
        return {"contCorn": cont_yield,"cashGrain": corn_yield, "dairy": dairy_yield}