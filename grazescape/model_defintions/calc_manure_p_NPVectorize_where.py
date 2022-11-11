from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
import math
from pyper import *
import numpy as np
import pandas as pd
import time
def PmanureArrayCollect(y,cell_om,rot_yrs_crop,crop_ro,legume_text,animal_density_text,fertNrecCSV,cover_crop):
  cell_nresponse = y
  fertNrec_Values_Array = getfertNrec_values(rot_yrs_crop,crop_ro,legume_text,animal_density_text,fertNrecCSV,getOMText(cell_om),cell_nresponse,cover_crop)

  return fertNrec_Values_Array
def getRotText(crop,legume_text,animal_density_text):
    if crop == 'pt_rt':
        return crop + '_'+ legume_text
    elif crop == 'pt_cn':
        return crop + '_'+ animal_density_text + '_'+legume_text
    elif crop == 'dl':
        return crop + '_'+ animal_density_text
    else:
        #print("getRotText else hit")
        return crop
def getfertNrec_values(rot_yrs_crop,crop,legume_text,animal_density_text,fertNrec,om_text,cell_nresponse,cover_crop):
    nrecValue_array = []
    
    for i in rot_yrs_crop:
      CropAbbr = ''
      rasterLookUp = ''
    #   print("in raster look")
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
          rasterVal = int(cell_nresponse)
      else:
        #   print("in raster look up else")
          CropAbbr = i
          # print(CropAbbr)
          if i == 'ot' or i == 'as':
              rasterLookUp = 'om'
              rasterVal = om_text
          else: 
              rasterLookUp = 'nResponse'
              rasterVal = int(cell_nresponse)

      #You need to account for rotation, since the legumes and especially SOY can effect the Nrec results
      #Of other crops for that year.
      RotationAbbr = getRotText(crop,legume_text,animal_density_text)
      # print("RotationAbbr: "+RotationAbbr)
      NFertRecs_RotationAbbr = fertNrec[fertNrec["RotationAbbr"] == RotationAbbr]
      # print("NFertRecs_RotationAbbr")
      # print(NFertRecs_RotationAbbr)
      # print("variables")
      # print(CropAbbr)
      # print(rasterLookUp)
      # print(rasterVal)
      # print(cover_crop)
      NFertRecs_CropAbbr = NFertRecs_RotationAbbr[NFertRecs_RotationAbbr["CropAbbr"] == str(CropAbbr)]
      NFertRecs_CoverAbbr = NFertRecs_CropAbbr[NFertRecs_CropAbbr["coverAbbr"] == str(cover_crop)]
    #   print(NFertRecs_CoverAbbr)
      NFertRecs_RasterLookup = NFertRecs_CoverAbbr[NFertRecs_CoverAbbr["rasterLookup"] == rasterLookUp]
    #   print(NFertRecs_RasterLookup)
      NFertRecs_Row = pd.concat([NFertRecs_RasterLookup[NFertRecs_RasterLookup["rasterVals"] == str(rasterVal)]])
    #   print(NFertRecs_Row)
      nrecValue = float(NFertRecs_Row["Nrec"].values[0])
      nManureValue = float(NFertRecs_Row["ManureN"].values[0])
      pNeedsValue = float(NFertRecs_Row["Pneeds"].values[0])
      grazedDMlbs = float(NFertRecs_Row["grazed_DM_lbs"].values[0])
      grazedP2O5lbs = float(NFertRecs_Row["grazed_P2O5_lbs"].values[0])
      NfertRecs_values = [nrecValue,nManureValue,pNeedsValue,grazedDMlbs,grazedP2O5lbs]
      #nrecValue_array.append(NfertRecs_values)

    return (NfertRecs_values)
def getOMText(omraw):
  #print(omraw)
  if omraw < 2:
      OM_fertrecs = '<2'
  elif omraw > 2 and omraw < 5:
      OM_fertrecs = '2-9.9'
  elif omraw > 5 and omraw < 10:
      OM_fertrecs = '2-9.9'
  elif omraw > 10 and omraw < 20:
      OM_fertrecs = '10-20.0'
  return OM_fertrecs

def getRotYers(crop):
  # print("in getRotYers")
    if crop == 'pt':
        rot_yrs = 1
        rot_yrs_crop = ['pt']
    if crop == 'pt_rt':
        rot_yrs = 1
        rot_yrs_crop = ['pt_rt']
    if crop == 'pt_cn':
        rot_yrs = 1
        rot_yrs_crop = ['pt_cn']
    if crop == 'dl':
        rot_yrs = 1
        rot_yrs_crop = ['dl']
    if crop == 'cc':
        rot_yrs = 1
        rot_yrs_crop = ['cn']
    if crop == 'cg':
        rot_yrs = 2
        rot_yrs_crop = ['cn','sb']
    if crop == 'cso':
        rot_yrs = 3
        rot_yrs_crop = ['cs','sb','ot']
    if crop == 'dr':
        rot_yrs = 5
        # 'af','af','af' is redundent and wasting time.  stream line it with a conditional
        rot_yrs_crop = ['cs','cn','as','af','af']
    return [rot_yrs,rot_yrs_crop]
def getAnimaleDensity(animal_density):
    if animal_density == 'lo':
        return 'lo'
    else:
        return 'hi'
def getLegumeTest(legume):
    if legume == 'true':
        return "lg"
    else: 
        return "nl"
class CalcManureP(ModelBase):
    def __init__(self, request, file_name=None):
      super().__init__(request, file_name)
      self.fertNrec = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/NmodelInputs_final_grazed.csv")
      self.denitLoss = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/denitr.csv")
      self.Nvars = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/Nvars.csv")
    def run_model(self):
      print("Calc Manure P Running!")
      start = time.time()
    #   print(self.model_parameters["crop"])
      index = 0
      Pneeds_total = 0
      ManureN_total = 0
      grazedDMlbs_total = 0
      grazedp205_total = 0
      cover_crop = ''
      if self.model_parameters["crop"] == "pt" or self.model_parameters["crop"] == "dl":
        cover_crop = 'nc'
      else:
        cover_crop = self.model_parameters["crop_cover"]
      fertNrec_Values_Array_Flat = []
      legume = self.model_parameters["legume"]
      animal_density = self.model_parameters["density"]
      animal_density_text = getAnimaleDensity(animal_density)
      legume_text = getLegumeTest(legume)
      PctManrN = self.model_parameters["manure_n_perc"]/100
      crop_ro = ''
      if self.model_parameters["crop"] == "pt":
        crop_ro = self.model_parameters["crop"] + '_' + self.model_parameters["rotation"]
      else: 
        crop_ro = self.model_parameters["crop"]
      # om_flattened = self.raster_inputs["om"].flatten()
      cell_om = float(self.model_parameters["om"])/10
      nResponse_flattened = self.raster_inputs["Nresponse"].flatten()
      rot_yrs_crop = getRotYers(crop_ro)[1]
      array_counter = 0
      fertNrecCSV =self.fertNrec
      # VrtizedPmanureCellResults = np.vectorize(PmanureArrayCollect)

      # npwheretestarray = np.where(nResponse_flattened > 0,getfertNrec_values(rot_yrs_crop,crop_ro,legume_text,animal_density_text,fertNrecCSV,getOMText(cell_om),nResponse_flattened,cover_crop),nResponse_flattened)
      # print("npwheretestarray")
      # print(len(npwheretestarray))
      # print(npwheretestarray)

      for y in np.nditer(nResponse_flattened):
        index +=1
        if y < 0:
          fertNrec_Values_Array_Flat.append([y,y,y,y,y])
    #fertNrec_Values_Array_Flat.append([nResponse_flattened[y],nResponse_flattened[y],nResponse_flattened[y],nResponse_flattened[y],nResponse_flattened[y]])
        else:
          PmanureCellResults = PmanureArrayCollect(y,cell_om,rot_yrs_crop,crop_ro,legume_text,animal_density_text,fertNrecCSV,cover_crop)
          ManureN_total = ManureN_total + PmanureCellResults[1]
          Pneeds_total = Pneeds_total + PmanureCellResults[2]
          grazedDMlbs_total = grazedDMlbs_total + PmanureCellResults[3]          
          grazedp205_total = grazedp205_total + PmanureCellResults[4]
          fertNrec_Values_Array_Flat.append(PmanureCellResults)
        array_counter += 1
      Pneeds = Pneeds_total/index
      ManureN = (ManureN_total/index) * PctManrN
      grazedDMlbs = grazedDMlbs_total/index
      grazedp205 = grazedp205_total/index
      appliedManureN = ManureN/0.4
      manureP = appliedManureN/3
      manurePpercent = 100*(manureP/Pneeds)
      return_data = [ManureN,Pneeds,manurePpercent,grazedDMlbs,grazedp205,fertNrec_Values_Array_Flat]
      print("p mamnure finished")
      end = time.time()
      print(end - start)
      return return_data