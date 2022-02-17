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

    def parse(self, selection, datanm, slope1, slope2):
        """
        Parse transformation parameters

        Parameters
        ----------
        selection : dict
            Dictionary of transformation parameters
        datanm : numpy array
            array of values to transform on, such as slope and land type
        slope1 : temp
        slope2 : temp

        Returns
        -------
        boolean
            returns a boolean for each comparison

        """
        return datanm > float(slope1), float(slope2) > datanm, datanm != self.no_data

    def get_model_png(self):
        """
        Create display png and raster indicating no data, selected, and unselected cells
        Parameters
        ----------

        """
        datanm = self.raster_inputs["slope"]
        # create an array with all true values so that and-ing it with actual data will work
        datanm.fill(-99)
        datanm_landuse = datanm
        datanm_stream = datanm
        rows = self.bounds["y"]
        cols = self.bounds["x"]
        slope1 = self.request_json["selectionCrit"]["selection"]["slope1"]
        slope2 = self.request_json["selectionCrit"]["selection"]["slope2"]
        stream_dist1 = self.request_json["selectionCrit"]["selection"]["streamDist1"]
        stream_dist2 = self.request_json["selectionCrit"]["selection"]["streamDist2"]
        landuse_par = self.request_json["selectionCrit"]["selection"]["landCover"]
        has_slope = False
        has_land = False
        has_stream = False
        print("creating png")

        # print(rows, cols)
        # create empty 2d array for the png
        three_d = np.empty([rows, cols, 4])
        # create array to display red for selected cells
        # three_d[0:rows, 0:cols] = [255, 0, 0, 255]
        # three_d[0:rows, 0:cols] = [37, 175, 198, 255]
        # three_d[0:rows, 0:cols] = [238, 119, 51, 255]
        # black
        three_d[0:rows, 0:cols] = [0, 0, 0, 255]
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
            datanm = self.raster_inputs["slope"]
            datanm = np.where(
                np.logical_and(datanm > float(slope1), float(slope2) > datanm), -99, datanm
            )
            has_slope = True
        if stream_dist1 is not None and stream_dist2 is not None:
            datanm_stream = self.raster_inputs["stream_dist"]
            datanm_stream = np.where(
                np.logical_and(datanm_stream > float(stream_dist1), float(stream_dist2) > datanm_stream), -99,
                datanm_stream
            )
            has_stream = True
            # combine base case with slope
            datanm = np.where(np.logical_and(datanm == -99, datanm_stream == -99), -99, self.no_data)
            has_stream = True

        if landuse_par["cashGrain"] or landuse_par["contCorn"] or landuse_par["dairy"]:
            datanm_landuse = self.raster_inputs["landuse"]
            if landuse_par["cashGrain"]:
                cash_grain = 4
                datanm_landuse = np.where(
                    np.logical_and(cash_grain == datanm_landuse, datanm_landuse != self.no_data), -99, datanm_landuse
                )
                has_land = True
            if landuse_par["contCorn"]:
                cont_corn = 3
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
        if not has_land and not has_slope and not has_land and not has_stream:
            datanm.fill(self.no_data)

        datanm = np.where(np.logical_and(datanm == -99, datanm_stream == -99), -99, self.no_data)

        # copy datanm so we can use it for just the image
        datanm_image = np.copy(datanm)
        # selected values get 1 and everything else gets a zero
        datanm_image = np.where(
            np.logical_and(datanm_image == -99, datanm_image == -99), 1, 0
        )
        # set non selected but still in bounds to -88
        # datanm = np.where(
        #     np.logical_and(datanm != self.no_data, datanm != -99),
        #     -88, datanm)

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
        print("done selecting by select")
        datanm_image = datanm_image * three_d
        datanm_image = datanm_image.astype(np.uint8)
        im = Image.fromarray(datanm_image)
        im.convert('RGBA')
        # saving the final output
        # as a PNG file
        im.save(self.raster_image_file_path)

    def create_model_agr(self):
        """
        Create a model aggregate from all the input transformations specified by client
        -------

        """
        m_to_acre = 0.000247105
        print("starting model aggregation")
        # # data from client
        # trans = {5: {"id": "field_4bdb7c8a-6e49-416e-a9de-d82de164e0da", "rank": 5},
        #          6: {"id": "field_077161f4-04b3-4306-8c83-3d60a3611c73", "rank": 6},
        #          4: {"id": "field_a6ba8bc6-0c91-4d2d-b2b7-3123b87befd3", "rank": 4}}
        # dir_path = os.path.dirname(os.path.realpath(__file__))
        trans = self.request_json['trans']
        base_scen = self.request_json['base']
        region = "southWestWI"
        dir_path = self.in_dir

        file_list = []
        # get each transformation selection output raster
        layer_dic = {
            # "cont_pi_nc_su_25_50_1": "SmartScapeRaster:contCorn_PI_nc_su_1_25_50_southWestWI",
            # "cont_er_nc_su_25_50_1": "SmartScapeRaster:contCorn_Erosion_nc_su_1_25_50_southWestWI",
            # "corn_pi_nc_su_25_50_1": "	SmartScapeRaster:cornGrain_PI_nc_su_1_25_50_southWestWI",
            # "corn_er_nc_su_25_50_1": "	SmartScapeRaster:cornGrain_Erosion_nc_su_1_25_50_southWestWI",
            # "dairy_pi_nc_su_25_50_1": "SmartScapeRaster:dairyRotation_PI_nc_su_1_25_50_southWestWI",
            # "dairy_er_nc_su_25_50_1": "SmartScapeRaster:dairyRotation_Erosion_nc_su_1_25_50_southWestWI",
            # "landuse": "SmartScapeRaster:southWestWI_WiscLand_30m",
            # "pasture_pi_rt_rt_0_0": "SmartScapeRaster:pasture_PI_rt_rt_0_0_southWestWI",
            # "pasture_er_rt_rt_0_0": "SmartScapeRaster:pasture_Erosion_rt_rt_0_0_southWestWI",
        }
        base_layer_dic = {}

        # download layers for base case
        base_names = ("contCorn", "cornGrain", "dairyRotation")
        model_names_base = ("Erosion", "PI", "CN")
        # contCorn
        for name in base_names:
            for model in model_names_base:
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
        # base_layer_dic["slope"] = "SmartScapeRaster:" + region + "_slopePer_30m"
        base_layer_dic["hyd_letter"] = "SmartScapeRaster:" + region + "_hydgrp_30m"

        # create list of layers to download for each trans
        for tran in trans:
            # for each trans get the path to the selection raster used
            file = os.path.join(self.data_dir, tran["id"], "selection_output.tif")
            file_list.append(file)
            #       for right now we are only supporting transforming to pasture or pasture seedling
            #       yield
            #       medium_GrassYield_southWestWI.tif
            yield_name = "pasture_Yield_medium_" + region
            ero_name = "pasture_Erosion_" + tran["management"]["density"] + "_" + \
                       tran["management"]["fertilizer"] + "_" + region
            ploss_name = "pasture_PI_" + tran["management"]["density"] + "_" + \
                         tran["management"]["fertilizer"] + "_" + region
            cn_name = "pasture_CN_" + tran["management"]["density"] + "_" + \
                      tran["management"]["fertilizer"] + "_" + region
            # cn_adjustment = tran["management"]["rotationType"] + "_" + tran["management"]["density"]
            insect = {"cc": 0.51,
                      "cg": 0.51,
                      "dr": 0.12,
                      "cso": 0.22,
                      "dl": 0,
                      "ps": 0,
                      "pt": 0
                      }
            layer_dic[tran["rank"]] = {}
            layer_dic[tran["rank"]]["yield"] = yield_name
            layer_dic[tran["rank"]]["ero"] = ero_name
            layer_dic[tran["rank"]]["ploss"] = ploss_name
            layer_dic[tran["rank"]]["cn"] = cn_name
            # layer_dic[tran["rank"]]["cn_adjustments"] = cn_adjustment

        # print(layer_dic)
        # print(base_layer_dic)
        # create blank raster that has extents from all transformations
        ds_clip = gdal.Warp(
            # os.path.join(dir_path, "test-joined.tif"), ["slope-clipped.tif", "landuse-clipped.tif"],
            # last raster ovrrides it
            os.path.join(dir_path, "temp_extents.tif"), file_list,
            dstNodata=-9999,
            outputType=gc.GDT_Float32)
        image = gdal.Open(os.path.join(dir_path, "temp_extents.tif"))

        band = image.GetRasterBand(1)
        arr = band.ReadAsArray()

        arr.fill(-9999)
        [rows, cols] = arr.shape
        driver = gdal.GetDriverByName("GTiff")
        # create new tif same size as temp_extents.tif but set all values to no data values
        outdata = driver.Create(os.path.join(dir_path, "raster_base_projection.tif"), cols, rows, 1,
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
                # os.path.join(dir_path, "test-joined.tif"), ["slope-clipped.tif", "landuse-clipped.tif"],
                # last raster ovrrides it
                os.path.join(file, "burned.tif"),
                [os.path.join(dir_path, "raster_base_projection.tif"), os.path.join(file, "selection_output.tif")],
                dstNodata=-9999,
                outputType=gc.GDT_Float32)
            ds_clip.FlushCache()
            ds_clip = None
        # create an empty raster with same dimensions as flattend  combined and set all values to no data value
        base = np.empty([rows * cols])
        base.fill(-9999)
        # take each raster and convert it to array and then take max(higher priority) from array and combine to
        # create a master raster with overlapping values being determined from hierarchy
        for tran in trans:
            # print(tran)
            file = os.path.join(self.data_dir, tran["id"])

            image1 = gdal.Open(os.path.join(file, "burned.tif"))
            band = image1.GetRasterBand(1)
            arr = band.ReadAsArray()
            # flatten the array to make comparison easier between rasters
            arr = arr.flatten()
            # values, counts = np.unique(arr, return_counts=True)
            # print(np.bincount(arr.flatten()))
            # replace select value with rank of trans
            datanm = np.where(arr == -99, tran["rank"], arr)
            # print(np.bincount(datanm.flatten()))
            # values, counts = np.unique(datanm, return_counts=True)
            # larger values have higher priority
            base = np.maximum(base, datanm)
            # close file
            image1 = None
        # checking values were combined
        # values, counts = np.unique(base, return_counts=True)
        # print(values)
        # print(counts)
        # put the array back into the raster shape
        base = np.reshape(base, [rows, cols])
        # save the base array into a new raster called merged
        driver = gdal.GetDriverByName("GTiff")
        outdata = driver.Create(os.path.join(dir_path, "merged.tif"), cols, rows, 1,
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

        image = gdal.Open(os.path.join(dir_path, "merged.tif"))

        band = image.GetRasterBand(1)
        # arr will be the base array that all model calcs pull from. All valid values have the hierarch of the
        # transformation
        arr = band.ReadAsArray()
        geoTransform = image.GetGeoTransform()
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
        outdata = None
        band = None
        ds = None
        image = None
        geoserver_url = geo_server_url + "/geoserver/ows?service=WCS&version=2.0.1&" \
                                         "request=GetCoverage&CoverageId="

        # download raster model outputs
        for layer in layer_dic:
            for model in layer_dic[layer]:
                print("downloading layer ", model)
                url = geoserver_url + "SmartScapeRaster:" + layer_dic[layer][
                    model] + extents_string_x + extents_string_y
                r = requests.get(url)
                # print(url)
                raster_file_path = os.path.join(dir_path, layer_dic[layer][model] + ".tif")
                with open(raster_file_path, "wb") as f:
                    f.write(r.content)
        for layer in base_layer_dic:
            print("downloading layer ", layer)
            url = geoserver_url + base_layer_dic[layer] + extents_string_x + extents_string_y
            r = requests.get(url)
            raster_file_path = os.path.join(dir_path, layer + ".tif")
            with open(raster_file_path, "wb") as f:
                f.write(r.content)
        print("done writing")
        # open model results raster

        model_list = ["yield", "ero", "ploss", "cn"]
        # {1:{"yield":"filename", "ero": "filename:}}
        # dic to hold outputs from the models
        model_data = {
            "yield": np.copy(arr),
            "ero": np.copy(arr),
            "ploss": np.copy(arr),
            "cn": np.copy(arr),
            "runoff": np.copy(arr),
        }
        # slope_image = gdal.Open(os.path.join(dir_path, "slope.tif"))
        # slope_arr = slope_image.GetRasterBand(1).ReadAsArray()
        hyd_letter_image = gdal.Open(os.path.join(dir_path, "hyd_letter.tif"))
        hyd_letter_arr = hyd_letter_image.GetRasterBand(1).ReadAsArray()
        get_runoff_vectorized = np.vectorize(self.calc_runoff)
        print("running transformation models")
        for layer in layer_dic:
            # yield
            for model in model_list:
                model_trans_filepath = os.path.join(dir_path, layer_dic[layer][model] + ".tif")
                model_image = gdal.Open(model_trans_filepath)
                model_band = model_image.GetRasterBand(1)
                model_arr = model_band.ReadAsArray()
                # arr is the array from the merged tif
                # layer is the rank of the trans
                # data_yield = np.where(data_yield == layer, model_arr, data_yield)
                # if hierarchy matches the trans rank replace that value witht the model value
                if model == "cn":
                    cn_final = np.where(model_data[model] == layer, model_arr, model_data[model])
                    # cn_final = np.where(model_data[model] == layer, cn_inter, model_data[model])

                    model_data["runoff"] = get_runoff_vectorized(cn_final)
                    model_data[model] = cn_final
                else:
                    model_data[model] = np.where(model_data[model] == layer, model_arr, model_data[model])

                model_image = None
                model_band = None
                model_arr = None
        # for layer in layer_dic:
        #     model_trans_filepath = os.path.join(dir_path, layer_dic[layer]["cn"] + ".tif")
        #     model_image = gdal.Open(model_trans_filepath)
        #     model_band = model_image.GetRasterBand(1)
        #     model_arr = model_band.ReadAsArray()

        print("done with trans models")
        #   iterate through wiscland layer
        landuse_image = gdal.Open(os.path.join(dir_path, "landuse.tif"))
        landuse_arr = landuse_image.GetRasterBand(1).ReadAsArray()
        # create new array where landuse codes are plugged into arr (arr is the raster with rank of the selected cells)
        # selected values are greater than zero
        landuse_arr_sel = np.where(arr > 0, landuse_arr, arr)

        [rows, cols] = landuse_arr_sel.shape
        driver = gdal.GetDriverByName("GTiff")
        outdata = driver.Create(os.path.join(dir_path, "landuse_replaced.tif"), cols, rows, 1,
                                gdal.GDT_Float32)
        outdata.SetGeoTransform(landuse_image.GetGeoTransform())  ##sets same geotransform as input
        outdata.SetProjection(landuse_image.GetProjection())  ##sets same projection as input
        outdata.GetRasterBand(1).WriteArray(landuse_arr_sel)
        outdata.GetRasterBand(1).SetNoDataValue(-9999)
        # write to disk
        outdata.FlushCache()
        model_image = None
        model_band = None
        model_arr = None

        base_data = {
            "yield": np.copy(landuse_arr_sel),
            "ero": np.copy(landuse_arr_sel),
            "ploss": np.copy(landuse_arr_sel),
            "cn": np.copy(landuse_arr_sel),
            "runoff": np.copy(landuse_arr_sel),
            "insect": np.copy(landuse_arr_sel),
        }
        # base run
        # for model in model_names_base:
        #     for name in base_names:
        #         print(name + "_" + model)
        #         # base_image = gdal.Open(os.path.join(dir_path, "contCorn_PI.tif"))

        #         if model == "CN":
        #             print("runoff")
        base_image = gdal.Open(os.path.join(dir_path, "contCorn_CN.tif"))
        base_arr = base_image.GetRasterBand(1).ReadAsArray()
        cn_final = np.where(base_data["cn"] == 3, base_arr, base_data["cn"])
        # cn_id = "cc" + "_" + base_scen["management"]["cover"] + "_" + base_scen["management"]["tillage"]
        # cn_adj = get_cn_adjusted_vector(hyd_letter_arr, cn_id)
        # cn_final = np.where(base_data["cn"] == 3, cn_inter + cn_adj, base_data["cn"])
        base_data["runoff"] = get_runoff_vectorized(cn_final)
        base_data["cn"] = cn_final

        base_image = gdal.Open(os.path.join(dir_path, "cornGrain_CN.tif"))
        base_arr = base_image.GetRasterBand(1).ReadAsArray()
        cn_final = np.where(base_data["cn"] == 4, base_arr, base_data["cn"])
        # cn_id = "cg" + "_" + base_scen["management"]["cover"] + "_" + base_scen["management"]["tillage"]
        # cn_adj = get_cn_adjusted_vector(hyd_letter_arr, cn_id)
        # cn_final = np.where(base_data["cn"] == 4, cn_inter + cn_adj, base_data["cn"])
        base_data["runoff"] = get_runoff_vectorized(cn_final)
        base_data["cn"] = cn_final

        base_image = gdal.Open(os.path.join(dir_path, "dairyRotation_CN.tif"))
        base_arr = base_image.GetRasterBand(1).ReadAsArray()
        cn_final = np.where(base_data["cn"] == 5, base_arr, base_data["cn"])
        # cn_id = "dr" + "_" + base_scen["management"]["cover"] + "_" + base_scen["management"]["tillage"]
        # cn_adj = get_cn_adjusted_vector(hyd_letter_arr, cn_id)
        # cn_final = np.where(base_data["cn"] == 5, cn_inter + cn_adj, base_data["cn"])
        base_data["runoff"] = get_runoff_vectorized(cn_final)
        base_data["cn"] = cn_final

        base_cn = np.where(
            np.logical_or(base_data["cn"] == self.no_data, base_data["cn"] < 0),
            0, (base_data["cn"] * 900 / 4046.86))
        sum_base_cn = np.sum(base_cn)
        print("sum of cn for base", sum_base_cn)
        base_runoff = np.where(
            np.logical_or(base_data["runoff"] == self.no_data, base_data["runoff"] < 0),
            0, (base_data["runoff"] * 900 / 4046.86))
        sum_base_runoff = np.sum(base_runoff)



        landuse_ero = np.copy(landuse_arr_sel)
        landuse_yield = np.copy(landuse_arr_sel)

        cont_pl_image = gdal.Open(os.path.join(dir_path, "contCorn_PI.tif"))
        cont_pl_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_arr_sel = np.where(landuse_arr_sel == 3, cont_pl_arr, landuse_arr_sel)

        corn_pl_image = gdal.Open(os.path.join(dir_path, "cornGrain_PI.tif"))
        corn_pl_arr = corn_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_arr_sel = np.where(landuse_arr_sel == 4, corn_pl_arr, landuse_arr_sel)

        dairy_pl_image = gdal.Open(os.path.join(dir_path, "dairyRotation_PI.tif"))
        dairy_pl_arr = dairy_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_arr_sel = np.where(landuse_arr_sel == 5, dairy_pl_arr, landuse_arr_sel)

        # contCorn
        base_data["insect"] = np.where(base_data["insect"] == 3, .51, base_data["insect"])
        # cash grain
        base_data["insect"] = np.where(base_data["insect"] == 4, .51, base_data["insect"])
        # dairy
        base_data["insect"] = np.where(base_data["insect"] == 5, .12, base_data["insect"])

        base_insect = np.where(
            np.logical_or(base_data["insect"] == self.no_data, base_data["insect"] < 0),
            0, (base_data["insect"] * 900 / 4046.86))
        sum_base_insect = np.sum(base_insect)
        # [rows, cols] = landuse_arr_sel.shape
        # driver = gdal.GetDriverByName("GTiff")
        # outdata = driver.Create(os.path.join(dir_path, "pl_base_case.tif"), cols, rows, 1,
        #                         gdal.GDT_Float32)
        # outdata.SetGeoTransform(landuse_image.GetGeoTransform())  ##sets same geotransform as input
        # outdata.SetProjection(landuse_image.GetProjection())  ##sets same projection as input
        # outdata.GetRasterBand(1).WriteArray(landuse_arr_sel)
        # outdata.GetRasterBand(1).SetNoDataValue(-9999)
        # base case
        count_selected = np.count_nonzero(landuse_arr_sel > -88)
        print("number of selected cells")
        print(count_selected)
        # each cell is 30 x 30 m (900 sq m) and then convert to acres
        area_selected = count_selected * 900 * 0.000247105
        # model_value * conversion from ac to value / 30 sq m
        landuse_arr_sel = np.where(
            np.logical_or(landuse_arr_sel == self.no_data, landuse_arr_sel < 0),
            0, (landuse_arr_sel * 900 / 4046.86))
        sum_base = np.sum(landuse_arr_sel)

        # cont_pl_image = gdal.Open(os.path.join(dir_path, "cont_er_nc_su_25_50_1.tif"))
        cont_pl_image = gdal.Open(os.path.join(dir_path, "contCorn_Erosion.tif"))
        cont_pl_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_ero = np.where(landuse_ero == 3, cont_pl_arr, landuse_ero)

        # corn_pl_image = gdal.Open(os.path.join(dir_path, "corn_er_nc_su_25_50_1.tif"))
        corn_pl_image = gdal.Open(os.path.join(dir_path, "cornGrain_Erosion.tif"))
        corn_pl_arr = corn_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_ero = np.where(landuse_ero == 4, corn_pl_arr, landuse_ero)

        # dairy_pl_image = gdal.Open(os.path.join(dir_path, "dairy_er_nc_su_25_50_1.tif"))
        dairy_pl_image = gdal.Open(os.path.join(dir_path, "dairyRotation_Erosion.tif"))
        dairy_pl_arr = dairy_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_ero = np.where(landuse_ero == 5, dairy_pl_arr, landuse_ero)



        # CN

        # Runoff

        # [rows, cols] = landuse_ero.shape
        # driver = gdal.GetDriverByName("GTiff")
        # outdata = driver.Create(os.path.join(dir_path, "ero_base_case.tif"), cols, rows, 1,
        #                         gdal.GDT_Float32)
        # outdata.SetGeoTransform(landuse_image.GetGeoTransform())  # sets same geotransform as input
        # outdata.SetProjection(landuse_image.GetProjection())  # sets same projection as input
        # outdata.GetRasterBand(1).WriteArray(landuse_ero)
        # outdata.GetRasterBand(1).SetNoDataValue(-9999)

        # base case
        count_selected = np.count_nonzero(landuse_ero > -88)
        print("number of selected cells")
        print(count_selected)
        # each cell is 30 x 30 m (900 sq m) and then convert to acres
        area_selected = count_selected * 900 * 0.000247105
        # model_value * conversion from ac to value / 30 sq m
        landuse_ero = np.where(
            np.logical_or(landuse_ero == self.no_data, landuse_ero < 0),
            0, (landuse_ero * 900 / 4046.86))
        sum_base_ero = np.sum(landuse_ero)

        # base yield
        corn_image = gdal.Open(os.path.join(dir_path, "corn_yield.tif"))
        corn_arr = corn_image.GetRasterBand(1).ReadAsArray()
        # [bushels/acre x 10] original units and then convert to tons of dry matter / ac
        corn_arr = corn_arr / 10
        alfalfa_yield = corn_arr * 0.0195 * 2000 * (1 - 0.13) / 2000
        silage_yield = ((3.73E-4 * corn_arr * corn_arr) + (3.95E-2 * corn_arr + 6.0036)) * 2000 * (1 - 0.65) / 2000
        corn_arr = corn_arr * 56 * (1 - 0.155) / 2000

        soy_image = gdal.Open(os.path.join(dir_path, "soy_yield.tif"))
        soy_arr = soy_image.GetRasterBand(1).ReadAsArray()
        soy_arr = soy_arr * 60 * 0.792 * 0.9008 / (2000 * 10)

        cont_yield = corn_arr
        corn_yield = (corn_arr * .5) + (soy_arr * .5)
        dairy_yield = 1 / 5 * silage_yield + 1 / 5 * corn_arr + 3 / 5 * alfalfa_yield

        landuse_yield = np.where(landuse_yield == 3, cont_yield, landuse_yield)
        landuse_yield = np.where(landuse_yield == 4, corn_yield, landuse_yield)
        landuse_yield = np.where(landuse_yield == 5, dairy_yield, landuse_yield)

        landuse_yield = np.where(
            np.logical_or(landuse_yield == self.no_data, landuse_yield < 0),
            0, (landuse_yield * 900 / 4046.86))
        sum_base_yield = np.sum(landuse_yield)

        # model run
        # we are setting models less than zero to zero (effects mostly ero and ploss)
        model = np.where(
            np.logical_or(model_data["yield"] == self.no_data, model_data["yield"] < 0),
            0, (model_data["yield"] * 900 / 4046.86))
        sum_model_yield = np.sum(model)
        model = np.where(
            np.logical_or(model_data["ero"] == self.no_data, model_data["ero"] < 0),
            0, (model_data["ero"] * 900 / 4046.86))
        sum_model_ero = np.sum(model)
        model = np.where(
            np.logical_or(model_data["ploss"] == self.no_data, model_data["ploss"] < 0),
            0, (model_data["ploss"] * 900 / 4046.86))
        sum_model_ploss = np.sum(model)
        model = np.where(
            np.logical_or(model_data["cn"] == self.no_data, model_data["cn"] < 0),
            0, (model_data["cn"] * 900 / 4046.86))
        sum_model_cn = np.sum(model)
        print("The sum of cn for model is ", sum_model_cn)
        model = np.where(
            np.logical_or(model_data["runoff"] == self.no_data, model_data["runoff"] < 0),
            0, (model_data["runoff"] * 900 / 4046.86))
        sum_model_runoff = np.sum(model)

        # datanm_ero = np.where(
        #     np.logical_or(datanm_ero == self.no_data, datanm_ero < 0),
        #     0, (datanm_ero * 900 / 4046.86))
        # sum_model_ero = np.sum(datanm_ero)
        # sum_model = 0
        # sum_model_ero = 0
        return {
            "base": {
                "ploss": {"total": str("%.1f" % sum_base),
                          "total_per_area": str("%.1f" % (sum_base / area_selected)),
                          "units": "Phosphorus Runoff (lb/year)"
                          },
                "ero": {"total": str("%.1f" % sum_base_ero),
                        "total_per_area": str("%.1f" % (sum_base_ero / area_selected)),
                        "units": "Erosion (tons/year)"
                        },
                "yield": {"total": str("%.1f" % sum_base_yield),
                          "total_per_area": str("%.1f" % (sum_base_yield / area_selected)),
                          "units": "Yield (tons-Dry Matter/year)"
                          },
                "cn": {
                    "total": str("%.1f" % sum_base_cn),
                    "total_per_area": str("%.1f" % (sum_base_cn / area_selected)),
                    "units": "Curve Number"
                },
                "insect": {
                    "total": str("%.1f" % sum_base_insect),
                    "total_per_area": str("%.1f" % (sum_base_insect / area_selected)),
                    "units": ""
                },
                "runoff": {
                    "total": str("%.1f" % sum_base_runoff),
                    "total_per_area": str("%.1f" % (sum_base_runoff / area_selected)),
                    "units": ""
                },
            },
            "model": {
                "ploss": {
                    "total": str("%.1f" % sum_model_ploss),
                    "total_per_area": str("%.1f" % (sum_model_ploss / area_selected)),
                    "units": "Phosphorus Runoff (lb/year)"
                },
                "ero": {
                    "total": str("%.1f" % sum_model_ero),
                    "total_per_area": str("%.1f" % (sum_model_ero / area_selected)),
                    "units": "Erosion (tons/year)"
                },
                "yield": {
                    "total": str("%.1f" % sum_model_yield),
                    "total_per_area": str("%.1f" % (sum_model_yield / area_selected)),
                    "units": "Yield (tons-Dry Matter/year)"
                },
                "cn": {
                    "total": str("%.1f" % sum_model_cn),
                    "total_per_area": str("%.1f" % (sum_model_cn / area_selected)),
                    "units": "Curve Number"
                },
                "insect": {
                    "total": str("%.1f" % 0),
                    "total_per_area": str("%.1f" % (0 / area_selected)),
                    "units": ""
                },
                "runoff": {
                    "total": str("%.1f" % sum_model_runoff),
                    "total_per_area": str("%.1f" % (sum_model_runoff / area_selected)),
                    "units": ""
                },
            },

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

    def calc_runoff(self, cn):

        # CNMC3 = min(cn * math.exp(0.00673 * (100 - cn)), 99)
        # if slope > 0.05:
        #     CNfinal = min((CNMC3 - cn) / 3 * (
        #             1 - 2 * math.exp(-13.86 * slope)) + cn, 99)
        # else:
        #     CNfinal = cn
        #
        stor = 1000 / cn - 10
        rain = [.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]
        event = []
        for i in rain:
            if i > 0.2 * stor:
                runoff = math.pow(i - 0.2 * stor, 2) / (i + 0.8 * stor)
            else:
                runoff = 0
            event.append(round(runoff, 2))
            # CNout(i, 2) = runoff;
        return event[5]


