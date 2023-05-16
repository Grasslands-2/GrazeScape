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
#from qgis import processing
#from qgis.processing import alg
#from qgis.processing import r
from qgis.core import (
    QgsProcessingParameters,
    QgsProcessingAlgorithm,
     QgsApplication, 
     QgsProcessingFeedback, 
     QgsVectorLayer,
     QgsProcessingOutputFile,
     QgsProcessingOutputFolder
)
# Initialize QGIS Application
qgs = QgsApplication([], False)
QgsApplication.setPrefixPath("C:\OSGeo4W\apps\qgis", True)
QgsApplication.initQgis()
#QgsProcessingOutputFile
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
from django.conf import settings

class InfraTrueLength(QgsProcessingAlgorithm):
    INPUT = 'INPUT'
    OUTPUT = 'OUTPUT'
    def __init__(self,infraextent,infracords,infraId):
        print('Hello from infra profile tool!')
        print(infraId)
        #return('hi from python world')
        self.extents = infraextent
        self.infra_id = infraId
        self.infracords = infracords
        #geo_server_url = "http://grazescape-dev1.glbrc.org:8080"
        geo_server_url = settings.GEOSERVER_URL

        self.geoserver_url = geo_server_url + "/geoserver/ows?service=WCS&version=2.0.1&" \
                             "request=GetCoverage&CoverageId="

        self.extents_string_x = ""
        self.extents_string_y = ""
        print('infraextents!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        print(infraextent)
        if infraextent is not None:
            self.extents_string_x = "&subset=X(" + str(math.floor(float(infraextent[0]))) + "," + str(math.ceil(float(infraextent[2]))) + ")"
            self.extents_string_y = "&subset=Y(" + str(math.floor(float(infraextent[1]))) + "," + str(math.ceil(float(infraextent[3]))) + ")"
        self.crs = "epsg:3857"
        self.layer_dic = {
            "elevation": "InputRasters:TC_DEM"
        }
        self.file_name = "infra_"+ infraId
        self.dir_path = os.path.join(settings.BASE_DIR, 'grazescape',
                                     'data_files', 'raster_inputs',
                                     self.file_name)
        os.makedirs(self.dir_path)

        self.load_dem()
    
    def name(self):
        return "Infra_Profile_Tool"
    def displayName(self):
        return "Running infra profile tool"
    def createInstance(self):
        return type(self)()
    def initAlgorithm(self,config=None):
        self.addParamenter(
            QgsProcessingOutputFile(self.OUTPUT,
            'Output file')
        )

    def processProfile(self, parameters, context, feedback):
        outputFile = self.parameterAsFileOutput(parameters, self.OUTPUT, context)
        process = processing.run(
            {
                'input': 'C:/Users/zjhas/Documents/Ellisas_Rasters_08162021/DEM_10m_NED_3857_countuy_masked.tif',
                'coordinates': parameters['COORDINATES'],
                'file':'',
                '-g':False,
                '-c':False,
                'GRASS_REGION_PARAMETER':None,
                'GRASS_REGION_CELLSIZE_PARAMETER':0,
                'output': 'memory'
            })
        return self.OUTPUT
    def load_dem(self):
        """
        Download data from geoserver
        Returns
        -------

        """
        #processing.algorithmHelp("grass7:r.profile")

        process = processing.run("grass7:r.profile", {'input':'C:/Users/zjhas/Documents/Ellisas_Rasters_08162021/DEM_10m_NED_3857_countuy_masked.tif','output':QgsProcessingOutputFile('C:/Users/zjhas/Documents/Ellisas_Rasters_08162021/profiletest5.txt'),'coordinates':'-10116500,5354750,-10116564,5355735,-10115331,5355468','resolution':None,'null_value':'*','file':'','-g':False,'-c':False,'GRASS_REGION_PARAMETER':None,'GRASS_REGION_CELLSIZE_PARAMETER':0})
        return(process)
        # layer_list = requests.get("http://localhost:8081/geoserver/rest/
        # layers.json")
        # for layer in self.layer_dic:
        #     print("downloading layer ", layer)
        #     url = self.geoserver_url + self.layer_dic[layer]
        #     # + self.extents_string_x + self.extents_string_y
        #     r = requests.get(url)
        #     raster_file_path = os.path.join(self.dir_path, layer + ".tif")
        #     output_file_path = os.path.join(self.dir_path, 'output.csv')
        #     with open(raster_file_path, "wb") as f:
        #         f.write(r.content)
            
        #     print(raster_file_path)

            # process = processing.run("grass7:r.profile", {'input':'C:/Users/zjhas/Documents/Ellisas_Rasters_08162021/DEM_10m_NED_3857_countuy_masked.tif','output':'C:/Users/zjhas/Documents/Ellisas_Rasters_08162021/profiletest5.txt','coordinates':'-10116500,5354750,-10116564,5355735,-10115331,5355468','resolution':None,'null_value':'*','file':'','-g':False,'-c':False,'GRASS_REGION_PARAMETER':None,'GRASS_REGION_CELLSIZE_PARAMETER':0})
            # return(process)
            
            # return(processing.run("grass7:r.profile", {'input':raster_file_path,'coordinates':self.infracords,'resolution':0,'null_value':'-9999','file':'','-g':False,'-c':False,'output':output_file_path,'GRASS_REGION_PARAMETER':self.extents
            # ,'GRASS_REGION_CELLSIZE_PARAMETER':1,'.complete_output':True}))

            #print('RAN PROFILE TOOL!!!')


        #self.geom = self.geom[0]
    def create_clip(self, infraextent):
        """
        Create a shapefile to clip the raster with
        Parameters
        ----------
        field_geom_array

        Returns
        -------

        """
        geom_array_float = []
        for coor in infraextent:
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
                # set all output rasters to have float 32 data type
                # this allows for the use of -9999 as no data value
                # print("clipping raster ", data_name)
                ds_clip = gdal.Warp(os.path.join(self.dir_path, data_name + "-clipped.tif"), image,
                                    cutlineDSName=os.path.join(self.dir_path, self.file_name + ".shp"),
                                    cropToCutline=True, dstNodata=self.no_data,outputType=gc.GDT_Float32)
    
    def calc(self):
        #newID = float(self.infra_id) + 10
        newID = self.infra_id
        print('this is the geom obj')
        print(newID)
        #return(newID)

        # grass.run_command('r.profile',
        #        input = input_map,
        #        output = output_file,
        #        profile = [12244.256,-295112.597,12128.012,-295293.77])
