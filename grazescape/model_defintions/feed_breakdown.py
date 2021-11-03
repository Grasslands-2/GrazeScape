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
import math
from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import R
from django.conf import settings

class HeiferFeedBreakdown():
    def __init__(self,pastYield,cornYield,cornSilageYield,alfalfaYield,oatYield,totalheifers,breed,bred,daysOnPasture,
    asw,wgg):
        self.nutrients = pd.read_csv(r"grazescape\model_defintions\nutrients.csv")
        self.NRC = pd.read_csv(r"grazescape\model_defintions\NRC_2001.csv")
        self.pastYield = float(pastYield)*0.7
        #
        self.cornYield = (float(cornYield) * 56 * (1 - 0.155) / 2000)
        #42.26 is the number of bushels that go into an english ton of DM for corn
        self.cornSilageYield = float(cornSilageYield) * 0.35
        print('new corn silage value for DM!!!!!!!!!!!**&###############*******!!!')
        print(self.cornSilageYield)
        self.alfalfaYield = float(alfalfaYield)
        self.oatYield = float(oatYield)/62.5
        #62.5 is the number of oat bushels in a english tonne
        self.heifers = int(totalheifers)
        self.breed = str(breed)
        self.bred = str(bred)
        self.daysOnPasture = float(daysOnPasture)
        self.asw = float(asw)
        self.wgg = float(wgg)
        print('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        print(self.wgg)
        
    def calcFeed(self):
        #Step 5
        # target_daily_gain must be a float  [0.7,0.9,1.1,1.3,1.5,1.8,2.0,2.2]
        # breed must be a string ["small","large"]
        # bred must be a string ["bred", "non bred"]
        # outside_feed is the percentage of feed ration the user plans to supplement with other feedsources. Must be 10% or higher for a calcuable impact. 
        avg_weight = (self.asw + (self.asw + self.wgg*self.daysOnPasture))/2
        print(avg_weight)
        nrc = self.NRC[self.NRC["Breed"]==self.breed]
        nrc_x= nrc[nrc["Bred"]==self.bred]
        nrc_data = nrc_x[nrc_x["ADG"] == str(self.wgg)]
        heifer = pd.concat([nrc_data[nrc_data["BW"] < str(avg_weight)].tail(1)])
        #print(nrc_x)
        print(nrc_data)
        print(heifer)
        # DMI_Per_Season is the Tons of Dry Matter the herd will eat in a season
        DMI_Per_Season = (eval(heifer["DMI"].tolist()[0])*self.heifers*self.daysOnPasture)/2000

        #DMI_Demand is the total DMI that is needed on hand to make sure the herd is fed for the season.
        DMI_Demand = DMI_Per_Season * 1.20
        print(DMI_Demand)
        pastYieldTon = self.pastYield
        cropsYieldTon = (self.cornYield + self.alfalfaYield + self.oatYield + self.cornSilageYield)
        remainingDemand = DMI_Demand - (pastYieldTon + cropsYieldTon)
        return [DMI_Demand,pastYieldTon,cropsYieldTon,remainingDemand]


