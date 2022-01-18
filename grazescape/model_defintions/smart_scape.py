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
        # create an array with all true values so that anding it with actual data will work
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

        print(rows, cols)
        # create empty 2d array for the png
        three_d = np.empty([rows, cols, 4])
        # create array to display red for selected cells
        three_d[0:rows, 0:cols] = [255, 0, 0, 255]
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
                np.logical_and(datanm_stream > float(stream_dist1), float(stream_dist2) > datanm_stream), -99, datanm_stream
            )
            has_stream = True
            datanm = np.where(np.logical_and(datanm == -99, datanm_stream == -99), -99, self.no_data)

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
        if not has_land and not has_slope and not has_land:
            datanm.fill(self.no_data)
        # elif not has_land and has_slope:
        #     datanm_landuse = datanm
        # datanm = np.where(
        #     np.logical_and(datanm == -99, np.logical_and(datanm_landuse == -99, datanm_stream == -99)), -99, self.no_data
        # )
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
        base = self.request_json['base']
        file_list = []
        # get each transformation selection output raster
        for tran in trans:
            file = os.path.join(self.data_dir, tran["id"], "selection_output.tif")

            file_list.append(file)
        # print(dir_path)
        # create blank raster from all transformations
        # path to model output
        dir_path = self.in_dir
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
        # take each transform raster and burn it into a copy of the blank
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
        # take each raster and convert it to array and then take max from array and combine
        for tran in trans:
            print(tran)
            file = os.path.join(self.data_dir, tran["id"])

            image1 = gdal.Open(os.path.join(file, "burned.tif"))
            band = image1.GetRasterBand(1)
            arr = band.ReadAsArray()
            # flatten the array to make comparison easier between rasters
            arr = arr.flatten()
            values, counts = np.unique(arr, return_counts=True)
            print(values)
            print(counts)
            # print(np.bincount(arr.flatten()))
            # replace select value with rank of trans
            datanm = np.where(arr == -99, tran["rank"], arr)
            # print(np.bincount(datanm.flatten()))
            values, counts = np.unique(datanm, return_counts=True)
            print(values)
            print(counts)
            # larger values have higher priority
            base = np.maximum(base, datanm)
            # close file
            image1 = None
        # checking values were combined
        values, counts = np.unique(base, return_counts=True)
        print(values)
        print(counts)
        base = np.reshape(base, [rows, cols])

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

        geoserver_url = geo_server_url + "/geoserver/ows?service=WCS&version=2.0.1&" \
                                         "request=GetCoverage&CoverageId="
        layer_dic = {
                    "cont_pi_nc_su_25_50_1": "SmartScapeRaster:contCorn_PI_nc_su_1_25_50_southWestWI",
                     "corn_pi_nc_su_25_50_1": "	SmartScapeRaster:cornGrain_PI_nc_su_1_25_50_southWestWI",
                     "dairy_pi_nc_su_25_50_1": "SmartScapeRaster:dairyRotation_PI_nc_su_1_25_50_southWestWI",
                    "landuse": "SmartScapeRaster:southWestWI_WiscLand_30m",
                    "pasture_pi_rt_rt_0_0": "SmartScapeRaster:pasture_PI_rt_rt_0_0_southWestWI", }
        for layer in layer_dic:
            print("downloading layer ", layer)
            url = geoserver_url + layer_dic[layer] + extents_string_x + extents_string_y
            r = requests.get(url)
            raster_file_path = os.path.join(dir_path, layer + ".tif")
            print("done downloading")
            print("raster_file_path", raster_file_path)
            with open(raster_file_path, "wb") as f:
                f.write(r.content)
        print("done writing")
        # open model results raster
        model_image = gdal.Open(os.path.join(dir_path, "pasture_pi_rt_rt_0_0.tif"))
        model_band = model_image.GetRasterBand(1)
        model_arr = model_band.ReadAsArray()
        # for this run only one transformation with rank of 1
        datanm1 = np.where(arr == 1, model_arr, arr)
        # print(datanm1)
        [rows, cols] = datanm1.shape
        driver = gdal.GetDriverByName("GTiff")
        outdata = driver.Create(os.path.join(dir_path, "pasture_output.tif"), cols, rows, 1,
                                gdal.GDT_Float32)
        outdata.SetGeoTransform(model_image.GetGeoTransform())  ##sets same geotransform as input
        outdata.SetProjection(model_image.GetProjection())  ##sets same projection as input
        outdata.GetRasterBand(1).WriteArray(datanm1)
        outdata.GetRasterBand(1).SetNoDataValue(-9999)
        # write to disk
        outdata.FlushCache()
        model_image = None
        model_band = None
        model_arr = None

    #   iterate through wiscland layer
        landuse_image = gdal.Open(os.path.join(dir_path, "landuse.tif"))
        landuse_arr = landuse_image.GetRasterBand(1).ReadAsArray()
        # create new array where landuse codes are plugged into arr
        landuse_arr_sel = np.where(arr == 1, landuse_arr, arr)

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
        # get ploss rasters for base
        cont_pl_image = gdal.Open(os.path.join(dir_path, "cont_pi_nc_su_25_50_1.tif"))
        cont_pl_arr = cont_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_arr_sel = np.where(landuse_arr_sel == 3, cont_pl_arr, landuse_arr_sel)

        corn_pl_image = gdal.Open(os.path.join(dir_path, "corn_pi_nc_su_25_50_1.tif"))
        corn_pl_arr = corn_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_arr_sel = np.where(landuse_arr_sel == 4, corn_pl_arr, landuse_arr_sel)

        dairy_pl_image = gdal.Open(os.path.join(dir_path, "dairy_pi_nc_su_25_50_1.tif"))
        dairy_pl_arr = dairy_pl_image.GetRasterBand(1).ReadAsArray()
        landuse_arr_sel = np.where(landuse_arr_sel == 5, dairy_pl_arr, landuse_arr_sel)

        [rows, cols] = landuse_arr_sel.shape
        driver = gdal.GetDriverByName("GTiff")
        outdata = driver.Create(os.path.join(dir_path, "pl_base_case.tif"), cols, rows, 1,
                                gdal.GDT_Float32)
        outdata.SetGeoTransform(landuse_image.GetGeoTransform())  ##sets same geotransform as input
        outdata.SetProjection(landuse_image.GetProjection())  ##sets same projection as input
        outdata.GetRasterBand(1).WriteArray(landuse_arr_sel)
        outdata.GetRasterBand(1).SetNoDataValue(-9999)
        # base case
        count_selected = np.count_nonzero(landuse_arr_sel > -88)
        print("number of selected cells")
        print(count_selected)
        # each cell is 30 x 30 m (900 sq m) and then convert to acres
        area_selected = count_selected * 900 * 0.000247105
        # model_value * conversion from ac to value / 30 sq m
        landuse_arr_sel = np.where(
            np.logical_or(landuse_arr_sel == self.no_data, landuse_arr_sel < 0),
            0, (landuse_arr_sel * 900/4046.86))
        sum_base = np.sum(landuse_arr_sel)

        # model run
        datanm1 = np.where(
            np.logical_or(datanm1 == self.no_data, datanm1 < 0),
            0, (datanm1 * 900/4046.86))
        sum_model = np.sum(datanm1)
        return {
            "base":
                {"ploss":{"total":str("%.0f" % sum_base), "total_per_area":str("%.0f" % (sum_base/area_selected)), "units":"Phosphorus Runoff (lb/year)"}},
            "model":{"ploss":{"total":str("%.0f" % sum_model), "total_per_area":str("%.0f" % (sum_model/area_selected)), "units":"Phosphorus Runoff (lb/year)"}}

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
