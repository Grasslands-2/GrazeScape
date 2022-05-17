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

"""
This class will manage retrieving data from geoserver and manage the clipping of extents to fields
Created by Matthew Bayles 2021
"""


class RasterData:

    def __init__(self, extents, field_geom_array, field_id, active_region, first_time,
                 only_om=False):
        """

        Parameters
        ----------
        data_layer String name of the layer to retrieve from geoserver
        extents array x and y coordinates of the extents of the field in a 1d array
        """
        # self.data_layer = data_layer
        self.extents = extents
        self.field_id = field_id
        self.active_region = active_region

        geo_server_url = settings.GEOSERVER_URL

        self.geoserver_url = geo_server_url + "/geoserver/ows?service=WCS&version=2.0.1&" \
                             "request=GetCoverage&CoverageId="

        # self.file_name = str(uuid.uuid4())
        self.file_name = "field_" + field_id
        self.dir_path = os.path.join(settings.BASE_DIR, 'grazescape',
                                     'data_files', 'raster_inputs',
                                     self.file_name)

        self.extents_string_x = ""
        self.extents_string_y = ""
        if extents is not None:
            self.extents_string_x = "&subset=X(" + str(math.floor(float(extents[0]))) + "," + str(math.ceil(float(extents[2]))) + ")"
            self.extents_string_y = "&subset=Y(" + str(math.floor(float(extents[1]))) + "," + str(math.ceil(float(extents[3]))) + ")"
        self.crs = "epsg:3857"

        self.no_data = -9999
        if self.active_region == "cloverBeltWI":
            self.layer_dic = {
                "elevation": "InputRasters:cloverBelt_DEM_10m_v2",
                "slope": "InputRasters:cloverBelt_slope_10m_v2",
                "sand": "InputRasters:cloverBelt_sand_10m_v2",
                "silt": "InputRasters:cloverBelt_silt_10m_v2",
                "clay": "InputRasters:cloverBelt_clay_10m_v2",
                "k": "InputRasters:cloverBelt_kfact_10m_v2",
                "ksat": "InputRasters:cloverBelt_ksat_10m_v2",
                "om": "InputRasters:cloverBelt_om_10m_v2",
                #"cec": "InputRasters:cloverBelt_cec_10m_v2",
                "ph": "InputRasters:cloverBelt_ph_10m_v2",
                "total_depth": "InputRasters:cloverBelt_depth_10m_v2",
                "slope_length": "InputRasters:cloverBelt_slopelen_10m_v2",
                "awc": "InputRasters:cloverBelt_awc_10m_v2",
                "ls": "InputRasters:cloverBelt_LS_10m_v2",
                "corn": "InputRasters:cloverBelt_corn_10m_v2",
                "soy": "InputRasters:cloverBelt_soy_10m_v2",
                "hydgrp":"InputRasters:cloverBelt_hydgrp_10m_v2",
            }
        # else:
        #     self.layer_dic = {
        #         "elevation": "InputRasters:southWestWI_DEM_10m_2",
        #         "slope": "InputRasters:southWestWI_slopePer_10m_2",
        #         "sand": "InputRasters:southWestWI_sand10m",
        #         "silt": "InputRasters:southWestWI_silt_10m",
        #         "clay": "InputRasters:southWestWI_clay_10m_2",
        #         "k": "InputRasters:southWestWI_kfact_10m",
        #         "ksat": "InputRasters:southWestWI_ksat_10m",
        #         "om": "InputRasters:southWestWI_om_10m",
        #         #"cec": "InputRasters:southWestWI_cec_10m",
        #         "ph": "InputRasters:southWestWI_ph_10m_2",
        #         "total_depth": "InputRasters:southWestWI_depth_10m",
        #         "slope_length": "InputRasters:southWestWI_slopelen_10m",
        #         "awc": "InputRasters:southWestWI_awc_10m",
        #         "ls": "InputRasters:southWestWI_LS_10m_2",
        #         "corn": "InputRasters:southWestWIcorn_10m2",
        #         "soy": "InputRasters:southWestWIsoy_10m2",
        #         "hydgrp":"InputRasters:southWestWI_hydgrp_10m",
        #     }
        if self.active_region == "southWestWI":
            self.layer_dic = {
                "elevation": "InputRasters:southWestWI_DEM_10m_2",
                "slope": "InputRasters:southWestWI_slopePer_10m_2",
                "sand": "InputRasters:southWestWI_sand10m",
                "silt": "InputRasters:southWestWI_silt_10m",
                "clay": "InputRasters:southWestWI_clay_10m_2",
                "k": "InputRasters:southWestWI_kfact_10m",
                "ksat": "InputRasters:southWestWI_ksat_10m",
                "om": "InputRasters:southWestWI_om_10m",
                #"cec": "InputRasters:southWestWI_cec_10m",
                "ph": "InputRasters:southWestWI_ph_10m_2",
                "total_depth": "InputRasters:southWestWI_depth_10m",
                "slope_length": "InputRasters:southWestWI_slopelen_10m",
                "awc": "InputRasters:southWestWI_awc_10m",
                "ls": "InputRasters:southWestWI_LS_10m_2",
                "corn": "InputRasters:southWestWIcorn_10m2",
                "soy": "InputRasters:southWestWIsoy_10m2",
                "hydgrp":"InputRasters:southWestWI_hydgrp_10m",
            }
        if self.active_region == "northeastWI":
            self.layer_dic = {
                "elevation": "InputRasters:northeastWI_DEM_10m_2",
                "slope": "InputRasters:northeastWI_slopePer_10m_2",
                "sand": "InputRasters:northeastWI_sand10m",
                "silt": "InputRasters:northeastWI_silt_10m",
                "clay": "InputRasters:northeastWI_clay_10m_2",
                "k": "InputRasters:northeastWI_kfact_10m",
                "ksat": "InputRasters:northeastWI_ksat_10m",
                "om": "InputRasters:northeastWI_om_10m",
                #"cec": "InputRasters:northeastWI_cec_10m",
                "ph": "InputRasters:northeastWI_ph_10m_2",
                "total_depth": "InputRasters:northeastWI_depth_10m",
                "slope_length": "InputRasters:northeastWI_slopelen_10m",
                "awc": "InputRasters:northeastWI_awc_10m",
                "ls": "InputRasters:northeastWI_LS_10m_2",
                "corn": "InputRasters:northeastWIcorn_10m2",
                "soy": "InputRasters:northeastWIsoy_10m2",
                "hydgrp":"InputRasters:northeastWI_hydgrp_10m",
            }
        if self.active_region == "uplandsWI":
            self.layer_dic = {
                "elevation": "InputRasters:uplandsWI_DEM_10m_2",
                "slope": "InputRasters:uplandsWI_slopePer_10m_2",
                "sand": "InputRasters:uplandsWI_sand10m",
                "silt": "InputRasters:uplandsWI_silt_10m",
                "clay": "InputRasters:uplandsWI_clay_10m_2",
                "k": "InputRasters:uplandsWI_kfact_10m",
                "ksat": "InputRasters:uplandsWI_ksat_10m",
                "om": "InputRasters:uplandsWI_om_10m",
                #"cec": "InputRasters:uplandsWI_cec_10m",
                "ph": "InputRasters:uplandsWI_ph_10m_2",
                "total_depth": "InputRasters:uplandsWI_depth_10m",
                "slope_length": "InputRasters:uplandsWI_slopelen_10m",
                "awc": "InputRasters:uplandsWI_awc_10m",
                "ls": "InputRasters:uplandsWI_LS_10m_2",
                "corn": "InputRasters:uplandsWIcorn_10m2",
                "soy": "InputRasters:uplandsWIsoy_10m2",
                "hydgrp":"InputRasters:uplandsWI_hydgrp_10m",
            }
         # self.layer_dic = {"corn_yield": "InputRasters:awc"}
        self.bounds = {"x": 0, "y": 0}
        self.no_data_aray = []
        if first_time:
            # delete raster data if it already exists
            if self.field_already_loaded():
                self.clean()
            # if not os.path.exists(self.dir_path):
            os.makedirs(self.dir_path)
            self.load_layers(only_om)
            self.create_clip(field_geom_array)
            self.clip_rasters()

    def field_already_loaded(self):
        """

        Returns True if raster data has already been loaded for the field
        -------

        """
        return os.path.exists(self.dir_path)

    def load_layers(self, only_om):
        """
        Download data from geoserver
        Returns
        -------

        """
        # layer_list = requests.get("http://localhost:8081/geoserver/rest/
        # layers.json")

        for layer in self.layer_dic:
            if only_om:
                if layer != "om":
                    continue
            print("downloading layer ", layer)
            url = self.geoserver_url + self.layer_dic[layer] + self.extents_string_x + self.extents_string_y
            r = requests.get(url)
            raster_file_path = os.path.join(self.dir_path, layer + ".tif")
            print("done downloading")
            print("raster_file_path", raster_file_path)
            with open(raster_file_path, "wb") as f:
                f.write(r.content)
            print("done writing")

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
            geom_array_float.append([float(coor[0]), float(coor[1])])
        polygon_geom = Polygon(geom_array_float)

        crs = {'init': self.crs}
        polygon = gpd.GeoDataFrame(index=[0], crs=crs, geometry=[polygon_geom])
        polygon.to_file(filename=os.path.join(self.dir_path, self.file_name + ".shp"), driver="ESRI Shapefile")
        return polygon.total_bounds

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
                                    cropToCutline=True, dstNodata=self.no_data,outputType=gc.GDT_Float32)
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

    def create_no_data_array(self, raster_data_dic):
        print("creating no data array")
        first_entry = [*raster_data_dic.keys()][0]
        size = raster_data_dic[first_entry].shape
        self.no_data_aray = np.zeros(size)
        for y in range(0, self.bounds["y"]):
            for x in range(0, self.bounds["x"]):
                for val in raster_data_dic:
                    # the hydgrp has a no data value and a NA value mapped to 6
                    raster_val = raster_data_dic[val][y][x]
                    # slope max 65
                    if val == "slope" and (raster_val == 0 or raster_val == self.no_data):
                        raster_data_dic[val][y][x] = 0.5
                    elif val == "slope" and raster_val > 65:
                        raster_data_dic[val][y][x] = 65
                    # two nodata values for curve number see get_hyro_letter in runoff.py
                    elif val == 'hydgrp' and raster_data_dic[val][y][x] == 6:
                        self.no_data_aray[y][x] = 1
                        break
                    elif raster_data_dic[val][y][x] == self.no_data:
                        self.no_data_aray[y][x] = 1
                        break
                    #For later once you have models working in Clover_belt
                    elif self.active_region == 'cloverBeltWI' and val == 'om' and raster_val > 20:
                        self.no_data_aray[y][x] = 1
                        break

    def check_raster_data(self, raster_dic):
        raster_dic_key_list = [*raster_dic.keys()]
        raster_shape = raster_dic[raster_dic_key_list[0]].shape
        for raster in raster_dic_key_list:
            if raster_shape != raster_dic[raster].shape:
                raise ValueError(raster +
                                 " dimensions do not match other rasters")

        self.bounds["y"], self.bounds["x"] = raster_shape

    def clean(self):
        shutil.rmtree(self.dir_path)
