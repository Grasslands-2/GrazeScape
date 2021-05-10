from osgeo import gdal
from osgeo import gdalconst as gc
import matplotlib.pyplot as plt
import requests
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Polygon
import io
import os
import uuid
from django.conf import settings
import math


"""
This class will manage retrieving data from geoserver and manage the clipping of extents to fields
Created by Matthew Bayles 2021
"""


class RasterData:

    def __init__(self, extents):
        """

        Parameters
        ----------
        data_layer String name of the layer to retrieve from geoserver
        extents array x and y coordinates of the extents of the field in a 1d array
        """
        print("creating")
        print(extents)
        # self.data_layer = data_layer
        self.extents = extents
        self.geoserver_url = "http://localhost:8081/geoserver/ows?service=WCS&version=2.0.1&" \
                        "request=GetCoverage&CoverageId="
        self.file_name = str(uuid.uuid4())
        self.dir_path = os.path.join(settings.BASE_DIR, 'grazescape', 'data_files', 'raster_inputs',self.file_name)
        if not os.path.exists(self.dir_path):
            os.makedirs(self.dir_path)
        self.extents_string_x = ""
        self.extents_string_y = ""
        if extents is not None:
            self.extents_string_x = "&subset=X(" + str(math.floor(float(extents[0]))) + "," + str(math.ceil(float(extents[2]))) + ")"
            self.extents_string_y = "&subset=Y(" + str(math.floor(float(extents[1]))) + "," + str(math.ceil(float(extents[3]))) + ")"
        self.crs = "epsg:3857"

        self.no_data = -9999
        self.layer_dic = {
          "elevation": "InputRasters:TC_DEM",
          "slope_data": "InputRasters:TC_Slope",
          "sand": "InputRasters:TC_sand_10m",
          "silt": "InputRasters:TC_silt_10m",
          "clay": "InputRasters:TC_clay_10m",
          "k": "InputRasters:TC_k_10m",
          "ksat": "InputRasters:TC_ksat_10m",
          "om": "InputRasters:TC_om_10m",
          "cec": "InputRasters:TC_cec_10m",
          "ph": "InputRasters:TC_ph_10m",
          "total_depth": "InputRasters:TC_totaldepth_10m",
          "slope_length": "InputRasters:TC_slopelenusler_10m",
          "awc": "InputRasters:TC_awc_10m",
          "ls": "InputRasters:LS_10m"
        }
        # self.layer_dic = {"corn_yield": "InputRasters:awc"}
        self.bounds = {"x": 0, "y": 0}

    def load_layers(self):
        """
        Download data from geoserver
        Returns
        -------

        """
        # layer_list = requests.get("http://localhost:8081/geoserver/rest/layers.json")
        for layer in self.layer_dic:
            url = self.geoserver_url + self.layer_dic[layer] + self.extents_string_x + self.extents_string_y
            print(url)
            r = requests.get(url)

            raster_file_path = os.path.join(self.dir_path, layer + ".tif")
            with open(raster_file_path, "wb") as f:
                f.write(r.content)

    def create_clip(self, field_geom_array):
        """
        Create a shapefile to clip the raster with
        Parameters
        ----------
        field_geom_array

        Returns
        -------

        """
        geom_array_float = []
        for coor in field_geom_array:
            print(coor)
            geom_array_float.append([float(coor[0]), float(coor[1])])
        polygon_geom = Polygon(geom_array_float)

        crs = {'init': self.crs}
        polygon = gpd.GeoDataFrame(index=[0], crs=crs, geometry=[polygon_geom])
        polygon.to_file(filename=os.path.join(self.dir_path, self.file_name + ".shp"), driver="ESRI Shapefile")
        print(polygon.total_bounds)
        return polygon.total_bounds
    def clip_raster(self):
        """
        Clip raster and return a rectangular array

        Returns array of values of the raster
        -------

        """
        raster_data_dic = {}
        bounds = 0
        for file in os.listdir(self.dir_path):
            print("Loading file: " + file)
            print("no data value")
            if '.tif' in file:
                data_name = file.split(".")[0]
                image = gdal.Open(os.path.join(self.dir_path, file))
                band = image.GetRasterBand(1)
                # arr1 = np.asarray(band.ReadAsArray())
                print(band.GetNoDataValue())

                # set all output rasters to have float 32 data type
                # this allows for the use of -9999 as no data value
                ds_clip = gdal.Warp(os.path.join(self.dir_path, file + "_clipped.tif"), image,
                                    cutlineDSName=os.path.join(self.dir_path, self.file_name + ".shp"),
                                    cropToCutline=True, dstNodata=self.no_data,outputType=gc.GDT_Float32 )
                geoTransform = ds_clip.GetGeoTransform()
                minx = geoTransform[0]
                maxy = geoTransform[3]
                maxx = minx + geoTransform[1] * ds_clip.RasterXSize
                miny = maxy + geoTransform[5] * ds_clip.RasterYSize
                bounds = [minx, miny, maxx, maxy]

                band = ds_clip.GetRasterBand(1)
                arr = pd.DataFrame(band.ReadAsArray())
                raster_data_dic[data_name] = arr
        self.check_raster_data(raster_data_dic)
        return raster_data_dic, bounds

    def check_raster_data(self, raster_dic):
        print(raster_dic.keys())
        # raster_shape = raster_dic[next(raster_dic_it)].shape

        # print(next(raster_shape))
        raster_dic_key_list = [*raster_dic.keys()]
        raster_shape = raster_dic[raster_dic_key_list[0]].shape
        print(raster_shape)
        for raster in raster_dic_key_list:
            print(raster)
            print(raster_dic[raster].shape)
            if raster_shape != raster_dic[raster].shape:
                raise Exception("Raster dimensions do not match")
        self.bounds["y"], self.bounds["x"] = raster_shape
