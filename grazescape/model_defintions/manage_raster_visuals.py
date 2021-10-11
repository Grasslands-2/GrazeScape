import os
import sys
#sys.path.append('C:\Users\zjhas\Documents\GrazeScape\python\plugins')
sys.path.append('/python/plugins')
from osgeo import gdal
from osgeo import gdalconst as gc
from osgeo import ogr
import matplotlib.pyplot as plt
import requests
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Polygon
from django.conf import settings
import math
from grazescape.raster_data import RasterData
from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import R
from django.conf import settings
import shutil
from osgeo import gdal
from PIL import Image


class retreiveRaster():
    def __init__(self,layer,extents):
        self.layer = str(layer)
        geo_server_url = settings.GEOSERVER_URL
        self.geoserver_url = geo_server_url + "/geoserver/ows?service=WCS&version=2.0.1&" \
            "request=GetCoverage&CoverageId="
        self.file_name = 'elevation'
        self.dir_path = os.path.join(settings.BASE_DIR, 'grazescape',
            'data_files', 'raster_layers',
            self.file_name)
        print(self.dir_path)
        self.extents = extents
        self.extents_string_x = ""
        self.extents_string_y = ""
        if extents is not None:
            self.extents_string_x = "&subset=X(" + str(math.floor(float(extents[0]))) + "," + str(math.ceil(float(extents[2]))) + ")"
            self.extents_string_y = "&subset=Y(" + str(math.floor(float(extents[1]))) + "," + str(math.ceil(float(extents[3]))) + ")"
        self.crs = "epsg:3857"
        self.no_data = -9999
        self.layer_dic = {
            "elevation": "InputRasters:TC_DEM"
        }
        self.bounds = {"x": 0, "y": 0}
        self.no_data_aray = []
        if os.path.isdir(self.dir_path):
            try:
                shutil.rmtree(self.dir_path)
                print('elevation folder removed')
            except OSError as e:
                print("Error: %s : %s" % (self.dir_path, e.strerror))
        os.makedirs(self.dir_path)
        self.load_layersMR()
        #self.profileTool()
        return None
        
    def load_layersMR(self):
        """
        Download data from geoserver
        Returns
        -------
        """
        for layer in self.layer_dic:
            print("downloading layer ", self.layer_dic[layer])
            url = self.geoserver_url + self.layer_dic[layer] + self.extents_string_x + self.extents_string_y
            r = requests.get(url)
            print('requestURL!!!!!!!!!!!!!************$$$$$$$$$$$$$$$$$$$**************')
            print(r)
            print(self.layer)
            #raster_file_path = os.path.join(self.dir_path, layer + ".png")
            raster_file_path = os.path.join(self.dir_path, layer + ".tif")
            jpg_file_path = os.path.join(self.dir_path, layer + ".jpg")
            
            with open(raster_file_path, "wb") as f:
                f.write(r.content)
            im1 = Image.open(raster_file_path)
            im1.save(jpg_file_path)
            options_list = [
            '-ot Byte',
            '-of JPEG',
            '-b 1','-b 2','-b 3',
            '-scale'
            ]           

            options_string = " ".join(options_list)
                
            gdal.Translate(
                'save_image_path.jpg',
                png_file_path,
                options=options_string
            )