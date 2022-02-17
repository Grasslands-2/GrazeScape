"""
This class will manage retrieving data from geoserver and manage the clipping of extents to fields
Author: Matthew Bayles
Created: November 2021
Python Version: 3.9.2
"""

import geopandas as gpd
import pandas as pd
from shapely.geometry import Polygon
import os
from django.conf import settings
from grazescape.raster_data import RasterData
from osgeo import gdal
from osgeo import gdalconst as gc
import requests
import numpy as np
import geopandas as gpd
from shapely.geometry import Polygon
import os
from django.conf import settings
import math
import shutil

class RasterDataSmartScape:
    """
    Child class of RasterData. Specifically used to handel raster requests for SmartScape
    Attributes
    ----------
    dir_path : str
        The path to the directory to store the downloaded rasters
    layer_dic : str
        dict of local layer names and their names on geoserver
    """
    def __init__(self, extents, field_geom_array, field_id):
        """
        Constructor.
        Parameters
        ----------
        extents : list of floats
            Extents of the area of interest to download.
        field_geom_array : list of list of floats
            The coordinates of a clip
        field_id
            The id of the folder to store the rasters
        """
        self.file_name = field_id

        self.dir_path = os.path.join(settings.BASE_DIR, 'smartscape',
                                     'data_files', 'raster_inputs',
                                     self.file_name)
        self.layer_dic = {
            "slope": "SmartScapeRaster:southWestWI_slopePer_30m",
            "landuse": "SmartScapeRaster:southWestWI_WiscLand_30m",
            "stream_dist": "SmartScapeRaster:southWestWI_distanceToWaterWays",

        }
        self.extents = extents
        self.field_id = field_id
        geo_server_url = settings.GEOSERVER_URL

        self.geoserver_url = geo_server_url + "/geoserver/ows?service=WCS&version=2.0.1&" \
                             "request=GetCoverage&CoverageId="
        self.field_geom_array = field_geom_array
        self.extents_string_x = ""
        self.extents_string_y = ""
        self.bounds = {"x": 0, "y": 0}
        self.no_data_aray = []

        if extents is not None:
            self.extents_string_x = "&subset=X(" + str(math.floor(float(extents[0]))) + "," + str(math.ceil(float(extents[2]))) + ")"
            self.extents_string_y = "&subset=Y(" + str(math.floor(float(extents[1]))) + "," + str(math.ceil(float(extents[3]))) + ")"
        self.crs = "epsg:3857"

        self.no_data = -9999
        if not os.path.exists(self.dir_path):
            os.makedirs(self.dir_path)

    def create_no_data_array(self, raster_data_dic):
        """
        Override parent function as we don't need this functionality in smartscape
        """
        return

    def create_clip(self):
        """
        Create a shapefile to clip the raster with.
        Parameters
        ----------
        field_geom_array : list of list of lists of doubles
            coordinates of the clip to be created; each outer list indicates a new polygon to create.
        """
        poly_list = []
        field_geom_array = self.field_geom_array
        # create polygon for each selection
        for poly in field_geom_array:
            geom_array_float = []
            # for coor in poly:
            #     geom_array_float.append([float(coor[0]), float(coor[1])])
            poly_list.append(Polygon(poly))
        df = pd.DataFrame({'geometry': poly_list})
        crs = {'init': self.crs}
        polygon = gpd.GeoDataFrame(df, crs=crs, geometry='geometry')
        print(polygon)
        polygon.to_file(filename=os.path.join(self.dir_path, self.file_name +".shp"), driver="ESRI Shapefile")

    def check_raster_data(self, raster_dic):
        raster_dic_key_list = [*raster_dic.keys()]
        raster_shape = raster_dic[raster_dic_key_list[0]].shape
        for raster in raster_dic_key_list:
            if raster_shape != raster_dic[raster].shape:
                raise ValueError(raster +
                                 " dimensions do not match other rasters")

        self.bounds["y"], self.bounds["x"] = raster_shape

    def load_layers(self):
        """
        Download data from geoserver
        Returns
        -------

        """
        # layer_list = requests.get("http://localhost:8081/geoserver/rest/
        # layers.json")

        for layer in self.layer_dic:

            print("downloading layer ", layer)
            url = self.geoserver_url + self.layer_dic[layer] + self.extents_string_x + self.extents_string_y
            print(url)
            r = requests.get(url)
            raster_file_path = os.path.join(self.dir_path, layer + ".tif")
            print("done downloading")
            print("raster_file_path", raster_file_path)
            with open(raster_file_path, "wb") as f:
                f.write(r.content)
            print("done writing")

    def clip_rasters(self):
        """
        Clip raster and return a rectangular array

        Returns array of values of the raster
        -------

        """
        raster_data_dic = {}
        bounds = 0
        for file in os.listdir(self.dir_path):
            if '.tif' in file:
                data_name = file.split(".")[0]
                image = gdal.Open(os.path.join(self.dir_path, file))
                # band = image.GetRasterBand(1)
                # arr1 = np.asarray(band.ReadAsArray())

                # set all output rasters to have float 32 data type
                # this allows for the use of -9999 as no data value
                # print("clipping raster ", data_name)
                ds_clip = gdal.Warp(os.path.join(self.dir_path, data_name + "-clipped.tif"), image,
                                    cutlineDSName=os.path.join(self.dir_path, self.file_name + ".shp"),
                                    cropToCutline=True, dstNodata=self.no_data, outputType=gc.GDT_Float32)
        print("done clipping")

    def get_clipped_rasters(self):
        raster_data_dic = {}
        bounds = 0
        for file in os.listdir(self.dir_path):
            if '-clipped.tif' in file:
                data_name = file.split(".")[0]
                data_name = data_name.split("-")[0]
                # print("file paths!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                # print(os.path.join(self.dir_path, file))
                # ds_clip = gdal.Open(os.path.join(self.dir_path, data_name + "_clipped.tif"))
                ds_clip = gdal.Open(os.path.join(self.dir_path, file))
                geoTransform = ds_clip.GetGeoTransform()
                minx = geoTransform[0]
                maxy = geoTransform[3]
                maxx = minx + geoTransform[1] * ds_clip.RasterXSize
                miny = maxy + geoTransform[5] * ds_clip.RasterYSize
                bounds = [minx, miny, maxx, maxy]
                band = ds_clip.GetRasterBand(1)
                arr = np.asarray(band.ReadAsArray())
                raster_data_dic[data_name] = arr
        self.check_raster_data(raster_data_dic)
        self.create_no_data_array(raster_data_dic)
        return raster_data_dic, bounds