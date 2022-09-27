from abc import ABC
import os
import sys
import csv
sys.path.append('/grazescape/model_defintions')
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
from pyper import R
from django.conf import settings

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import *
import numpy as np
import math

    #you need to cycle through each crop from each 

class NitrateLeeching(ModelBase):
    def __init__(self, request, file_name=None):
        super().__init__(request, file_name)
        print('NITRATE LEECHING INIT!!!!!!')
        self.fertNrec = pd.read_csv(r"grazescape\model_defintions\NitrogenFertRecs_zjh_edits.csv")
        self.denitLoss = pd.read_csv(r"grazescape\model_defintions\denitr.csv")
        self.Nvars = pd.read_csv(r"grazescape\model_defintions\Nvars.csv")
        print('NITRATE Tables read in!!!!!!')
        # original units are in  [bushels/acre x 10]
        # (to keep values in integer)
        # self.units = "Dry Mass tons/ac"
        # list of CropYieldDataNode
        #self.crop_list = []
    def getOMText(self,omraw,text_needed):
        print(omraw)
        
        if omraw < 2:
            OM_denitloss = '<2'
            OM_fertrecs = '<2'
        elif omraw > 2 and omraw < 5:
            OM_denitloss = '2-5.0'
            OM_fertrecs = '2-9.9'
        elif omraw > 5 and omraw < 10:
            OM_denitloss = '>5'
            OM_fertrecs = '2-9.9'
        elif omraw > 10 and omraw < 20:
            OM_denitloss = '>5'
            OM_fertrecs = '10-20.0'
        #return [OM_denitloss,OM_fertrecs]
        if text_needed == "denitr":
            return OM_denitloss
        else: return OM_fertrecs
    def getAnimaleDensity(self,animal_density):
        if animal_density == 'lo':
            return 'lo'
        else:
            return 'hi'
    def getLegumeTest(self,legume):
        if legume == 'true':
            return "lg"
        else: 
            return "nl"
    def getRotText(self,crop,legume_text,animal_density_text):
        print("in getRotText")
        print(crop)
        if crop == 'pt-rt':
            return crop + '_'+ legume_text
        elif crop == 'pt-cn':
            return crop + '_'+ animal_density_text + '_'+legume_text
        elif crop == 'dl':
            return crop + '_' + legume_text
        else:
            print("getRotText else hit")
            return str(crop)
    def getRotYers(self,crop):
        print("in getRotYers")
        if crop == 'pt-rt':
            rot_yrs = 1
            rot_yrs_crop = ['pt_rt']
        if crop == 'pt-cn':
            rot_yrs = 1
            rot_yrs_crop = ['pt_cn']
        if crop == 'cc':
            rot_yrs = 1
            rot_yrs_crop = ['cc']
        if crop == 'cg':
            rot_yrs = 2
            rot_yrs_crop = ['cn','sb']
        if crop == 'cso':
            rot_yrs = 3
            rot_yrs_crop = ['cs','sb','ot']
        if crop == 'dr':
            rot_yrs = 5
            rot_yrs_crop = ['cs','cc','af','af','af']
        return [rot_yrs,rot_yrs_crop]
    def getNFertRecs(self,rot_yrs_crop,crop,legume_text,animal_density_text,fertNrec,om_text,nResponse_raw):
        print("in getNFertRecs")
        nrecValue_array = []
        RotationAbbr = self.getRotText(crop,legume_text,animal_density_text)
        print("RotationAbbr: "+RotationAbbr)
        NFertRecs_RotationAbbr = self.fertNrec[self.fertNrec["RotationAbbr"] == RotationAbbr]
        print(NFertRecs_RotationAbbr)
        for i in rot_yrs_crop:
            print("in the rot years crop loop")
            print("rot_yrs_crop[i]: "+ i)
            
            CropAbbr = ''
            rasterLookUp = ''
            print("in raster look")
            if i == 'pt_rt':
                CropAbbr = i + '_' + legume_text
                rasterLookUp = 'om'
                rasterVal = om_text
            elif i == 'pt_cn':
                CropAbbr = i + '_' + animal_density_text + '_' + legume_text
                rasterLookUp = 'om'
                rasterVal = om_text
            elif i == 'dl':
                CropAbbr = i + '_' + animal_density_text
                rasterLookUp = 'nResponse'
                rasterVal = nResponse_raw
            else:
                print("in raster look up else")
                CropAbbr = i
                print(CropAbbr)
                if i == 'ot' or i == 'as':
                    rasterLookUp = 'om'
                    rasterVal = om_text
                else: 
                    rasterLookUp = 'nResponse'
                    rasterVal = str(nResponse_raw)

            #You need to account for rotation, since the legumes and especially SOY can effect the Nrec results
            #Of other crops for that year.
            
            NFertRecs_CropAbbr = NFertRecs_RotationAbbr[NFertRecs_RotationAbbr["CropAbbr"] == str(CropAbbr)]
            print(NFertRecs_CropAbbr)
            NFertRecs_RasterLookup = NFertRecs_CropAbbr[NFertRecs_CropAbbr["rasterLookup"] == rasterLookUp]
            print(NFertRecs_RasterLookup)
            print(rasterVal)
            NFertRecs_Row = pd.concat([NFertRecs_RasterLookup[NFertRecs_RasterLookup["rasterVals"] == rasterVal]])
            #NFertRecs_Row = NFertRecs_RasterLookup[NFertRecs_RasterLookup["rasterVals"]== rasterVal]
            print(NFertRecs_Row)
            nrecValue = str(NFertRecs_Row["Nrec"].values[0])
            print(nrecValue)
            nrecValue_array.append(str(NFertRecs_Row["Nrec"].values[0]))
            print(nrecValue_array)
        return (nrecValue_array)
    def run_model(self):
        print('NITRATE LEECHING MODEL PARAS!!!!!!')
        print(self.model_parameters)
        # user defined variables
        crop_ro = self.model_parameters["crop"]
        rot_yrs = 0
        rot_yrs_crop = []
        
        rot_yrs = self.getRotYers(crop_ro)[0]
        rot_yrs_crop = self.getRotYers(crop_ro)[1]
        print("rot_yrs: ")
        print(rot_yrs)
        print("rot_yrs_crop: ")
        print(rot_yrs_crop)
        legume = self.model_parameters["legume"]
        legume_text = self.getLegumeTest(legume)

        animal_density = self.model_parameters["density"]
        animal_density_text = self.getAnimaleDensity(animal_density)

        cover_crop = self.model_parameters["crop_cover"]
        PctFertN = self.model_parameters["fert_n_perc"]
        PctManrN = self.model_parameters["manure_n_perc"]
        Pneeds = self.model_parameters["p_need"]
        # raster defined variables
        om_raster = self.raster_inputs["om"].flatten()
        drain_class = self.raster_inputs["drain_class"].flatten()
        Nresponse = self.raster_inputs["Nresponse"].flatten()
        #place holder for raster gathered value
        om_raw = 1
        
        #place holder for raster gathered value
        
        drain_class_raw = 1

        #place holder for raster gathered value
        nResponse_raw = 1
        
        #Model result defined variables
        #erosion = self.erodatmn[0]

        for y in range(0, self.bounds["y"]):
            for x in range(0, self.bounds["x"]):
                # [bushels/acre x 10] original units
                print(self.raster_inputs["om"][y][x] / 10)
                print(self.raster_inputs["drain_class"][y][x])
                print(self.raster_inputs["Nresponse"][y][x])

        
        #fetched variables from csvs
        #self.fertNrec = pd.read_csv(r"grazescape\model_defintions\NitrogenFertRecs_zjh_edits.csv")
        
        fertNrec_Values_Array = self.getNFertRecs(rot_yrs_crop,crop_ro,legume_text,animal_density_text,self.fertNrec,self.getOMText(om_raw,"Nrec"),nResponse_raw)
        # for i in range(0, rot_yrs-1):
        #     fertNrec_Value = self.getNFertRecs(i,rot_yrs_crop,crop_ro,legume_text,animal_density_text,self.fertNrec,self.getOMText(om_raw,"Nrec"),nResponse_raw)
        #     print("in for loop through rot_yrs")
        #     print(i)  
        #     print("Nrec VALUE: " + fertNrec_Value)
        print(fertNrec_Values_Array)
        #used for denitloss
        print("start denitlossDC read")
        #print(self.denitLoss)
        OM_texts_denit = self.getOMText(om_raw,"denitr")
        denitlossDC = self.denitLoss[self.denitLoss["DrainClass_num"] == drain_class_raw]
        print(denitlossDC)
        Denitr_Row = pd.concat([denitlossDC[denitlossDC["OM"] == OM_texts_denit]])
        #Denitr_Row = denitlossDC[denitlossDC["OM"] == OM_texts]
        print(Denitr_Row)
        #Denitr_Value = eval(Denitr_Row["Denitr"])
        print(Denitr_Row["Denitr"][0])
        Denitr_Value = Denitr_Row["Denitr"][0]
        #Denitr_Value = (eval(Denitr_Row["Denitr"][1]))
        print("DENITR VALUE: " + str(Denitr_Value))
        
        #used for NfixPct and NH3loss
        for i in range(0, rot_yrs-1):
            NvarsRot = self.Nvars[self.Nvars['RotationAbbr'] == self.getRotText(crop_ro,legume_text,animal_density_text)]
            NvarsCover = NvarsRot[NvarsRot["cover"] == cover_crop]
            #Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == rot_yrs_crop[i]]])
            Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == rot_yrs_crop[i]]])
            NfixPct = str(Nvars_Row["NfixPct"].values[0])
            NH3loss = str(Nvars_Row["NH3loss"].values[0])
            Nharv_content = str(Nvars_Row["Nharv_content"].values[0])
            grazed_manureN = str(Nvars_Row["grazedManureN"].values[0])
            print("NfixPct VALUE: " + NfixPct)
            print("NH3loss VALUE: " + NH3loss)
            print("Nharv_content VALUE: " + Nharv_content)
            print("grazed_manureN VALUE: " + grazed_manureN)
        #NfixPct # (Nvars.csv)
        #NH3loss # (Nvars.csv)
        #Nharv_content # (Nvars.csv)
        #grazed_manureN # (Ninputs tab)
#fish out the variables from the tables by filtering with the the variables from the model paras

        #variable calcs
        return "Nitrate Ran"
        