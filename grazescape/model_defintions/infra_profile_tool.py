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
from itertools import cycle
#from qgis import processing
#from qgis.processing import alg
#from qgis.processing import r
from qgis.core import (
     QgsApplication, 
     QgsProcessingFeedback, 
     QgsVectorLayer,
     QgsProcessingOutputFile,
     QgsProcessingOutputFolder
)
# Initialize QGIS Application
qgs = QgsApplication([], False)
#QgsApplication.setPrefixPath("C:\OSGeo4W\apps\qgis", True)
QgsApplication.initQgis()
QgsProcessingOutputFile
for alg in QgsApplication.processingRegistry().algorithms():
        print(alg.id(), "->", alg.displayName())
import processing 
from processing.core.Processing import Processing
Processing.initialize()
# from qgis.gui import *
# import qgis.utils
#import grass.script as grass
from grazescape.raster_data import RasterData
from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import R
from django.conf import settings

class InfraTrueLength():
    def __init__(self,infraextent,infracords,infraId,infraLengthXY):
        print('Hello from infra profile tool!')
        #return('hi from python world')
        geo_server_url = settings.GEOSERVER_URL
        self.geoserver_url = geo_server_url + "/geoserver/ows?service=WCS&version=2.0.1&" \
            "request=GetCoverage&CoverageId="
        self.file_name = "infra_" + infraId
        self.dir_path = os.path.join(settings.BASE_DIR, 'grazescape',
            'data_files', 'raster_inputs',
            self.file_name)
        print(self.dir_path)
        self.extents = infraextent
        self.infra_id = str(infraId)
        self.infraLengthXY = infraLengthXY
        self.infracords = infracords
        self.cordstring = ''
        for i in self.infracords:
            self.cordstring = self.cordstring + i + ','
        self.cordstring = self.cordstring[:-1]
        print('NEW COORDSTRING!!!!!!!!!!!!!!@!@$$$$$$$$$$$$$#@!!!!!!!!!!!!')
        print(self.cordstring)
        self.extents_string_x = ""
        self.extents_string_y = ""
        print('infraextents!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        print(infraextent)
        if infraextent is not None:
            self.extents_string_x = "&subset=X(" + str(math.floor(float(infraextent[0]))) + "," + str(math.ceil(float(infraextent[2]))) + ")"
            self.extents_string_y = "&subset=Y(" + str(math.floor(float(infraextent[1]))) + "," + str(math.ceil(float(infraextent[3]))) + ")"
        self.crs = "epsg:3857"
        self.no_data = -9999
        self.layer_dic = {
            "elevation": "InputRasters:TC_DEM"
        }
        self.bounds = {"x": 0, "y": 0}
        self.no_data_aray = []
        # self.addOutput(QgsProcessingOutputFile(
        #     'NUMBEROFFEATURES',
        #         self.tr('Number of features processed')
        # ))
        # os.makedirs(self.dir_path)
        os.makedirs(self.dir_path)
        self.load_layersIP()
        self.profileTool()
    def load_layersIP(self):
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
            r = requests.get(url)
            raster_file_path = os.path.join(self.dir_path, layer + ".tif")
            with open(raster_file_path, "wb") as f:
                f.write(r.content)


    def profileTool(self):
        """
        Download data from geoserver
        Returns
        -------

        """
        #processing.algorithmHelp("grass7:r.profile")
        output_file_path = os.path.join(self.dir_path, 'output.txt')
        print('RAN PROFILE TOOL!!!')
       
        processing.run("grass7:r.profile", {'input':self.dir_path + '/elevation.tif','output':self.dir_path + '/output3.txt','coordinates':self.cordstring,'resolution':None,'null_value':'*','file':'','-g':False,'-c':False,'GRASS_REGION_PARAMETER':None,'GRASS_REGION_CELLSIZE_PARAMETER':0})

        f = open(self.dir_path + '/output3.txt', 'r')
        content = f.read()
        contentArray = content.splitlines()
        profileValues = []
        profileTotal = 0
        totaltriside = 0
        for i in contentArray:
            lineoutput = i.split(' ')[2]
            print(lineoutput)
            if lineoutput != "*":
                profileValues.append(float(lineoutput))
        print(profileValues)
        #valcycle = cycle(profileValues)
        #nextelem = next(valcycle)
        for index, elem in enumerate(profileValues):
            if (index+1 < len(profileValues)):
                curr_el = elem
                next_el = profileValues[index + 1]
                triside1 = abs(curr_el - next_el)
                totaltriside = totaltriside + triside1
                #hypoth = (math.sqrt(pow(triside1,2) + pow(10,2)) - 10) * 3.28084
                print(triside1)
                print(totaltriside)
                #profileTotal = profileTotal + hypoth
        profileTotal = math.sqrt(pow(totaltriside,2) + pow(float(self.infraLengthXY),2)) - float(self.infraLengthXY)
        print(profileTotal)
        profileTotalFT = profileTotal * 3.28084
        return profileTotalFT
