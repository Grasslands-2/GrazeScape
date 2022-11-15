from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
import math
from pyper import *
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Polygon

def getOMText(omraw,text_needed):
        #print(omraw)
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
def getRotText(crop,legume_text,animal_density_text):
    if crop == 'pt-rt':
        return crop + '_'+ legume_text
    elif crop == 'pt-cn':
        return crop + '_'+ animal_density_text + '_'+legume_text
    elif crop == 'dl':
        return crop + '_' + legume_text
    else:
        #print("getRotText else hit")
        return crop
        
def getRotYers(crop):
    # print("in getRotYers")
    if crop == 'pt-rt':
        rot_yrs = 1
        rot_yrs_crop = ['pt_rt']
    if crop == 'pt-cn':
        rot_yrs = 1
        rot_yrs_crop = ['pt_cn']
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
        rot_yrs_crop = ['cs','cn','af','af','af']
    return [rot_yrs,rot_yrs_crop]
def getNFertRecs(rot_yrs_crop,crop,legume_text,animal_density_text,fertNrec,om_text,cell_nresponse):
    nrecValue_array = []
    RotationAbbr = getRotText(crop,legume_text,animal_density_text)
    #print("RotationAbbr: "+RotationAbbr)
    NFertRecs_RotationAbbr = fertNrec[fertNrec["RotationAbbr"] == RotationAbbr]
    # print(NFertRecs_RotationAbbr)
    for i in rot_yrs_crop:
        #print("in the rot years crop loop")
        #print("rot_yrs_crop[i]: "+ i)
        
        CropAbbr = ''
        rasterLookUp = ''
        #print("in raster look")
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
            rasterVal = cell_nresponse
        else:
            #print("in raster look up else")
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
        
        NFertRecs_CropAbbr = NFertRecs_RotationAbbr[NFertRecs_RotationAbbr["CropAbbr"] == str(CropAbbr)]
        #print(NFertRecs_CropAbbr)
        NFertRecs_RasterLookup = NFertRecs_CropAbbr[NFertRecs_CropAbbr["rasterLookup"] == rasterLookUp]
        #print(NFertRecs_RasterLookup)
        # print("rasterVal")
        # print(rasterVal)
        NFertRecs_Row = pd.concat([NFertRecs_RasterLookup[NFertRecs_RasterLookup["rasterVals"] == str(rasterVal)]])
        #FertN is the same as recN in the old code.  
        nrecValue = float(NFertRecs_Row["Nrec"].values[0])
        nManureValue = float(NFertRecs_Row["ManureN"].values[0])
        NfertRecs_values = [nrecValue,nManureValue]
        # print(NfertRecs_values)
        #print(nrecValue)
        nrecValue_array.append(NfertRecs_values)
        #Start here to bring in Nmanure into calcs.
        #print(nrecValue_array)
    return (nrecValue_array)
def get_region_precip(active_region):
  if(active_region == 'cloverBeltWI'):
    return 38
  elif(active_region == 'southWestWI'):
    return 44
  elif(active_region == 'uplandsWI'):
    return 43
  elif(active_region == 'northeastWI'):
    return 35
def Calc_N_Leach(yeild_crop_data,fertN,manrN,Nvars_Row,NfixPct,NH3loss,Nharv_content,grazed_manureN,Denitr_Value,precN,dryN,erosN):
  #print("hello world")
  NH3N = fertN * NH3loss / 100  ## ammonia loss output, lb/ac
  #print("NH3N")
  #print(NH3N)
  harvN = yeild_crop_data * 2000 * Nharv_content  ## harvested N output, lb/ac (crop yield in tons dm, convert to lbs dm) # dry lot yield = 0
  #print("harvN")
  #print(harvN)
  fixN = harvN * NfixPct / 100 + 3  ## N fixation input, lb/ac
  #print("fixN")
  #print(fixN)
  denitN = fertN * Denitr_Value / 100  ## denitrification loss,
  #print("denitN")
  #print(denitN)
  inputsN = fertN + manrN + precN + dryN + fixN + grazed_manureN
  #print("inputsN 1")
  #print(inputsN)
  gasN = 0.01 * inputsN  ## misc gases are estimated as 1% of inputs
  #print("gasN")
  #print(gasN)
  NH3senN = 8  ## ammonia loss at senescence
  runoffN = 0
  outputsN = harvN + NH3N + denitN + erosN + gasN + NH3senN + runoffN
  #print("inputsN 2")
  #print(inputsN)
  #print("outputsN")
  #print(outputsN)
  leachN = inputsN - outputsN
  #print("LEACHN")
  #print(leachN)
  return leachN
class CropYield(ModelBase):
    def __init__(self, request,active_region, file_name=None):
        super().__init__(request,active_region, file_name)
        #C:\Users\zjhas\Documents\GrazeScape\grazescape\static\grazescape\public
        self.fertNrec = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/NmodelInputs_final_grazed.csv")
        #self.fertNrec = pd.read_csv(r"grazescape\model_defintions\NmodelInputs_final.csv")
        self.denitLoss = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/denitr.csv")
        self.Nvars = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/Nvars.csv")
        # original units are in  [bushels/acre x 10]0
        # (to keep values in integer)
        # self.units = "Dry Mass tons/ac"
        # list of CropYieldDataNode
        self.crop_list = []
        

    def run_model(self,request,active_region,manure_p_perc):
        print("SELF IN CROP")
        print(self.model_parameters)
        nitrate_array = []
        crop_ro = self.model_parameters["crop"]
        return_data = []
        if crop_ro == "cc":
            corn = OutputDataNode("Corn Grain", "Yield (bushels/ac)",
                                  "Yield (bushels/year)")
            erosion = OutputDataNode("ero", "Soil Erosion (tons/acre/year)", "Soil Erosion (tons of soil/year")
            pl = OutputDataNode("ploss", "Phosphorus Runoff (lb/acre/year)", "Phosphorus Runoff (lb/year)")           
            nitrate = OutputDataNode("nleaching", "Nitrate Leaching (lb/acre/year)", "Nitrate Leaching (lb/year)")
            return_data.append(erosion)
            return_data.append(pl)
            return_data.append(nitrate)
            return_data.append(corn)
        elif crop_ro == "cg":
            corn = OutputDataNode("Corn Grain", "Yield (bushels/ac)",
                                  "Yield (bushels/year)")
            soy = OutputDataNode("Soy", "Yield (bushels/ac)", "Total Yield (bushels/year)")
            return_data.append(corn)
            return_data.append(soy)
            erosion = OutputDataNode("ero", "Soil Erosion (tons/acre/year)", "Soil Erosion (tons of soil/year")
            pl = OutputDataNode("ploss", "Phosphorus Runoff (lb/acre/year)", "Phosphorus Runoff (lb/year)")           
            nitrate = OutputDataNode("nleaching", "Nitrate Leaching (lb/acre/year)", "Nitrate Leaching (lb/year)")
            return_data.append(erosion)
            return_data.append(pl)
            return_data.append(nitrate)
        elif crop_ro == "dr":
            silage = OutputDataNode("Corn Silage",
                                    "Yield (tons/ac)", "Total Yield (tons/year)")
            corn = OutputDataNode("Corn Grain", "Yield (bushels/ac)",
                                  "Total Yield (bushels/year)")
            alfalfa = OutputDataNode("Alfalfa",
                                     "Yield (tons/ac)", "Total Yield (tons/year)")
            return_data.append(silage)
            return_data.append(corn)
            return_data.append(alfalfa)
            erosion = OutputDataNode("ero", "Soil Erosion (tons/acre/year)", "Soil Erosion (tons of soil/year")
            pl = OutputDataNode("ploss", "Phosphorus Runoff (lb/acre/year)", "Phosphorus Runoff (lb/year)")           
            nitrate = OutputDataNode("nleaching", "Nitrate Leaching (lb/acre/year)", "Nitrate Leaching (lb/year)")
            return_data.append(erosion)
            return_data.append(pl)
            return_data.append(nitrate)

        elif crop_ro == "cso":
            silage = OutputDataNode("Corn Silage",
                                    "Yield (tons/ac)", "Total Yield (tons/year)")
            soy = OutputDataNode("Soy", "Yield (bushels/ac)", "Total Yield (bushels/year)")
            oats = OutputDataNode("Oats", "Yield (bushels/ac)", "Total Yield (bushels/year)")
            return_data.append(silage)
            return_data.append(soy)
            return_data.append(oats)
            erosion = OutputDataNode("ero", "Soil Erosion (tons/acre/year)", "Soil Erosion (tons of soil/year")
            pl = OutputDataNode("ploss", "Phosphorus Runoff (lb/acre/year)", "Phosphorus Runoff (lb/year)")           
            nitrate = OutputDataNode("nleaching", "Nitrate Leaching (lb/acre/year)", "Nitrate Leaching (lb/year)")
            return_data.append(erosion)
            return_data.append(pl)
            return_data.append(nitrate)
        else:
            raise Exception("Invalid crop rotation selected")
        

#_______________START OF NUTRIENT MODELS!!!__________________________________


        # print("running PL loss model!!!!!!!!!!!!!!!!!!!!!!!!!!!1")
        # #print(self)
        # r = R(RCMD=self.r_file_path, use_pandas=True)

        # slope = self.raster_inputs["slope"].flatten()
        # slope_length = self.raster_inputs["slope_length"].flatten()
        # sand = self.raster_inputs["sand"].flatten()
        # silt = self.raster_inputs["silt"].flatten()
        # clay = self.raster_inputs["clay"].flatten()
        # k = self.raster_inputs["k"].flatten()
        # # print(slope)
        # # om = self.raster_inputs["om"].flatten()
        # total_depth = self.raster_inputs["total_depth"].flatten()
        # ls = self.raster_inputs["ls"].flatten()
        # newpath = self.model_file_path.replace("/","\\")
        # print(newpath)
        # ContCornErosion = "cc_erosion_"
        # cornGrainErosion = "cg_erosion_"
        # cornSoyOatErosion = "cso_erosion_"
        # dairyRotationErosion = "dr_erosion_"
        # pastureSeedingErosion = "ps_erosion_"
        # pastureErosion = "pt_erosion_"
        # dryLotErosion = "dl_erosion_"

        # ContCornTidyploss = "cc_ploss_"
        # cornGrainTidyploss = "cg_ploss_"
        # cornSoyOatTidyploss = "cso_ploss_"
        # dairyRotationTidyploss = "dr_ploss_"
        # pastureSeedingTidyploss = "ps_ploss_"
        # pastureTidyploss = "pt_ploss_"
        # dryLotTidyploss = "dl_ploss_"

        # regionRDS = active_region + '.rds'
        # r.assign("slope", slope)
        # r.assign("slope_length", slope_length)
        # r.assign("sand", sand)
        # r.assign("silt", silt)
        # r.assign("clay", clay)
        # r.assign("k", k)
        # # r.assign("om", om)
        # r.assign("total_depth", total_depth)
        # r.assign("ls", ls)
        # print("ploss modal para variables")
        # print(manure_p_perc)
        # print(self.model_parameters["fert"])
        # print(self.model_parameters["crop"])
        # print(self.model_parameters["crop_cover"])
        # print(self.model_parameters["contour"])
        # print(self.model_parameters["tillage"])
        # print(self.model_parameters["rotation"])
        # print(self.model_parameters["density"])
        # print(self.model_parameters["soil_p"])
        # print(os.path.join(self.model_file_path,ContCornErosion + regionRDS))
        # print(os.path.join(newpath,ContCornErosion + regionRDS))
        # print(os.path.join(newpath,ContCornTidyploss + regionRDS))
        # r.assign("p_need", manure_p_perc[1])
        # r.assign("manure", manure_p_perc[2])
        # r.assign("dm", manure_p_perc[3])
        # r.assign("p205", manure_p_perc[4])
        # # r.assign("manure", self.model_parameters["manure"])
        # r.assign("fert", float(self.model_parameters["fert"]))
        # r.assign("crop", self.model_parameters["crop"])
        # r.assign("cover", self.model_parameters["crop_cover"])
        # r.assign("contour", int(self.model_parameters["contour"]))
        # r.assign("tillage", self.model_parameters["tillage"])
        # r.assign("rotational", self.model_parameters["rotation"])
        # r.assign("density", self.model_parameters["density"])
        # r.assign("initialP", float(self.model_parameters["soil_p"]))
        # r.assign("om", self.model_parameters["om"])
        # #print(float(self.model_parameters["om"]))
        # # r.assign("om", 2.56)
        # # print("MODEL PATH")
        # # print(self.model_file_path)
        # # print(regionRDS)
        # r.assign("cc_erosion_file", os.path.join(self.model_file_path,ContCornErosion + regionRDS))
        # r.assign("cg_erosion_file", os.path.join(self.model_file_path,cornGrainErosion + regionRDS))
        # r.assign("cso_erosion_file", os.path.join(self.model_file_path,cornSoyOatErosion + regionRDS))
        # r.assign("dr_erosion_file", os.path.join(self.model_file_path,dairyRotationErosion + regionRDS))
        # r.assign("ps_erosion_file", os.path.join(self.model_file_path,pastureSeedingErosion + regionRDS))
        # r.assign("pt_erosion_file", os.path.join(self.model_file_path,pastureErosion + regionRDS))
        # r.assign("dl_erosion_file", os.path.join(self.model_file_path,dryLotErosion + regionRDS))

        # r.assign("cc_pi_file", os.path.join(self.model_file_path,ContCornTidyploss + regionRDS))
        # r.assign("cg_pi_file", os.path.join(self.model_file_path,cornGrainTidyploss + regionRDS))
        # r.assign("cso_pi_file", os.path.join(self.model_file_path,cornSoyOatTidyploss + regionRDS))
        # r.assign("dr_pi_file", os.path.join(self.model_file_path,dairyRotationTidyploss + regionRDS))
        # r.assign("ps_pi_file", os.path.join(self.model_file_path,pastureSeedingTidyploss + regionRDS))
        # r.assign("pt_pi_file", os.path.join(self.model_file_path,pastureTidyploss + regionRDS))
        # r.assign("dl_pi_file", os.path.join(self.model_file_path,dryLotTidyploss + regionRDS))
        print("running PL loss model!!!!!!!!!!!!!!!!!!!!!!!!!!!1")
        #print(self)
        r = R(RCMD=self.r_file_path, use_pandas=True)

        slope = self.raster_inputs["slope"].flatten()
        slope_length = self.raster_inputs["slope_length"].flatten()
        sand = self.raster_inputs["sand"].flatten()
        silt = self.raster_inputs["silt"].flatten()
        clay = self.raster_inputs["clay"].flatten()
        k = self.raster_inputs["k"].flatten()
        # om = self.raster_inputs["om"].flatten()
        total_depth = self.raster_inputs["total_depth"].flatten()
        ls = self.raster_inputs["ls"].flatten()
        # print(slope)
        # print(sand)

        ContCornErosion = "cc_erosion_"
        cornGrainErosion = "cg_erosion_"
        cornSoyOatErosion = "cso_erosion_"
        dairyRotationErosion = "dr_erosion_"
        pastureSeedingErosion = "ps_erosion_"
        pastureErosion = "pt_erosion_"
        dryLotErosion = "dl_erosion_"

        ContCornTidyploss = "cc_ploss_"
        cornGrainTidyploss = "cg_ploss_"
        cornSoyOatTidyploss = "cso_ploss_"
        dairyRotationTidyploss = "dr_ploss_"
        pastureSeedingTidyploss = "ps_ploss_"
        pastureTidyploss = "pt_ploss_"
        dryLotTidyploss = "dl_ploss_"

        regionRDS = active_region + '.rds'
        r.assign("slope", slope)
        r.assign("slope_length", slope_length)
        r.assign("sand", sand)
        r.assign("silt", silt)
        r.assign("clay", clay)
        r.assign("k", k)
        # r.assign("om", om)
        r.assign("total_depth", total_depth)
        r.assign("ls", ls)
        print("PLOSS AND ERO RASTERS")
        print("slope")
        print(slope)
        print("slope_length")
        print(slope_length)
        print("sand")
        print(sand)
        print("silt")
        print(silt)
        print("clay")
        print(clay)
        print("k")
        print(k)
        print("total_depth")
        print(total_depth)
        print("ls")
        print(ls)

        r.assign("p_need", float(manure_p_perc[1]))
        r.assign("manure", float(manure_p_perc[2]))
        r.assign("dm", float(manure_p_perc[3]))
        r.assign("p205", float(manure_p_perc[4]))
        # r.assign("p_need", 60.0)
        # r.assign("manure", 0.0)
        # r.assign("dm", 0.0)
        # r.assign("p205", 0.0)
        # r.assign("manure", self.model_parameters["manure"])
        # r.assign("fert", 0.0)
        r.assign("fert", float(self.model_parameters["fert"]))
        r.assign("crop", self.model_parameters["crop"])
        r.assign("cover", self.model_parameters["crop_cover"])
        r.assign("contour", int(self.model_parameters["contour"]))
        r.assign("tillage", self.model_parameters["tillage"])
        r.assign("rotational", self.model_parameters["rotation"])
        r.assign("density", self.model_parameters["density"])
        r.assign("initialP", float(self.model_parameters["soil_p"]))
        r.assign("om", float(self.model_parameters["om"]))
        print("ploss modal para variables")
        print(self.model_file_path)
        print(manure_p_perc)
        print(self.model_parameters["fert"])
        print(self.model_parameters["crop"])
        print(self.model_parameters["crop_cover"])
        print(self.model_parameters["contour"])
        print(self.model_parameters["tillage"])
        print(self.model_parameters["rotation"])
        print(self.model_parameters["density"])
        print(self.model_parameters["soil_p"])
        print(os.path.join(self.model_file_path,ContCornErosion + regionRDS))
        #print(self.model_parameters["om"])
        # r.assign("om", 2.56)
        # print("MODEL PATH")
        # print(self.model_file_path)
        # print(regionRDS)
        r.assign("cc_erosion_file", os.path.join(self.model_file_path,ContCornErosion + regionRDS))
        r.assign("cg_erosion_file", os.path.join(self.model_file_path,cornGrainErosion + regionRDS))
        r.assign("cso_erosion_file", os.path.join(self.model_file_path,cornSoyOatErosion + regionRDS))
        r.assign("dr_erosion_file", os.path.join(self.model_file_path,dairyRotationErosion + regionRDS))
        r.assign("ps_erosion_file", os.path.join(self.model_file_path,pastureSeedingErosion + regionRDS))
        r.assign("pt_erosion_file", os.path.join(self.model_file_path,pastureErosion + regionRDS))
        r.assign("dl_erosion_file", os.path.join(self.model_file_path,dryLotErosion + regionRDS))

        r.assign("cc_pi_file", os.path.join(self.model_file_path,ContCornTidyploss + regionRDS))
        r.assign("cg_pi_file", os.path.join(self.model_file_path,cornGrainTidyploss + regionRDS))
        r.assign("cso_pi_file", os.path.join(self.model_file_path,cornSoyOatTidyploss + regionRDS))
        r.assign("dr_pi_file", os.path.join(self.model_file_path,dairyRotationTidyploss + regionRDS))
        r.assign("ps_pi_file", os.path.join(self.model_file_path,pastureSeedingTidyploss + regionRDS))
        r.assign("pt_pi_file", os.path.join(self.model_file_path,pastureTidyploss + regionRDS))
        r.assign("dl_pi_file", os.path.join(self.model_file_path,dryLotTidyploss + regionRDS))


        r(f"""
        #if (!require(randomForest)) install.packages("randomForest", repos = "http://cran.us.r-project.org")
        #if (!require(tidymodels)) install.packages("tidymodels", repos = "http://cran.us.r-project.org")
        #if (!require(tidyverse)) install.packages("tidyverse", repos = "http://cran.us.r-project.org")
        library(tidyverse)
        library(tidymodels)
        library(randomForest)
        # load erosion models
        # load PI models
       
        # crop = cc, cso ...
        # cover = cc, nc, cgis...
        # tillage = nt, su ... 
        # countour = 0,1
        # rotational = cn, rt 
        # density = hi or lo
        user_input_df <- tibble(crop = c(crop), cover = c(cover), tillage = c(tillage), Contour = c(contour), 
        rotational = c(rotational), density = c(density),initialP = c(initialP), OM = c(om))
        soil_df <- tibble(slope =  unlist(slope), slopelenusle.r = unlist(slope_length), sand = unlist(sand), silt = unlist(silt), clay = unlist(clay), k = unlist(k),
                           total.depth = unlist(total_depth), LSsurgo = unlist(ls))
        p_needs <- p_need
        grazedManureDM_lbs <- dm
        appliedDM_lbs <-  ((p_needs * (manure/100))/6) * 1000 * 8.4 * (6/100)
        total_DM_lbs <- sum(grazedManureDM_lbs, appliedDM_lbs, na.rm = TRUE)
        # totalP2O5 = grazedP2O5 + P2O5_applied_lbs
        grazedP2O5 <- p205
        P2O5_applied_lbs = (fert + manure)*(p_needs/100) 
        totalP2O5_lbs = sum(grazedP2O5, P2O5_applied_lbs, na.rm = TRUE)
        #P2O5_fert <- (fert)*(p_needs/100)
       # N_fert <- 0
        #We will need manure N at some point for a future nitrate leeching model.
        #(fertN)*(n_needs/100)
        fert_df <- tibble(total_DM_lbs = total_DM_lbs, totalP2O5_lbs = totalP2O5_lbs)
        #create data frame for models
        crop_df <- user_input_df %>%
          select(where(~!all(is.na(.)))) # remove NAs
        full_df <- bind_cols(crop_df, fert_df, soil_df)
        ##TODO the current output for Erosion and PI are tibbles (data frames) so we need to extract the data point from the tibble 
        # run models for different crops
        if (full_df$crop == "cc") {{
            cc_erosion <- readRDS(cc_erosion_file);
            cc_pi <- readRDS(cc_pi_file)
          #create factor levels
          tillage <- factor(cc_erosion$preproc$xlevels$tillage)
          cover <- factor(cc_erosion$preproc$xlevels$cover)
          Contour <- factor(cc_erosion$preproc$xlevels$Contour)
          level_df <- expand_grid(cover, tillage, Contour)
          #remove factor levels from full_df and repeat row as many times as there are level combinations
          df <- full_df %>%
            select(-c(crop, tillage, cover, Contour)) %>% 
            slice(rep(1:n(), each=nrow(level_df)))
          #bind all level combinations with df
          df <- cbind(level_df, df)
          #subset all combinations data set to just the user input
          pred_df <- df %>%
            filter(cover == full_df$cover, tillage == full_df$tillage, Contour == full_df$Contour)
          #make erosion prediction
          erosion <- round(predict(cc_erosion, pred_df),2)
          #bind erosion prediction to prediction data frame
          pi_pred_df <- full_df %>% 
            bind_cols(erosion) %>% 
            mutate(Erosion = .pred)
          #make P Loss prediction
         final_pi <- round(predict(cc_pi, pi_pred_df),2)
          # P loss prediction bounds
          pi_CI <- predict(cc_pi, pi_pred_df, type = "pred_int")
        }} else if (full_df$crop == "cg") {{
        cg_erosion <- readRDS(cg_erosion_file)
                cg_pi <- readRDS(cg_pi_file)
          cover <- factor(cg_erosion$preproc$xlevels$cover)
          tillage <- factor(cg_erosion$preproc$xlevels$tillage)
          Contour <- factor(cg_erosion$preproc$xlevels$Contour)
          level_df <- expand_grid(cover, tillage, Contour)
          df <- full_df %>%
  select(c(total_DM_lbs:LSsurgo)) %>% 
  slice(rep(1:n(), each=nrow(level_df)))
          df <- cbind(level_df, df)
          pred_df <- df %>%
            filter(cover == full_df$cover, tillage == full_df$tillage, Contour == full_df$Contour)
          erosion <- round(predict(cg_erosion, pred_df),2)
          pi_pred_df <- full_df %>% 
            bind_cols(erosion) %>% 
            mutate(Erosion = .pred)
         final_pi <- round(predict(cg_pi, pi_pred_df),2)
          pi_CI <- predict(cg_pi, pi_pred_df, type = "pred_int")
        }} else if (full_df$crop == "cso") {{
        cso_erosion <- readRDS(cso_erosion_file)
        cso_pi <- readRDS(cso_pi_file)
          cover <- factor(cso_erosion$preproc$xlevels$cover)
          tillage <- factor(cso_erosion$preproc$xlevels$tillage)
          Contour <- factor(cso_erosion$preproc$xlevels$Contour)
          level_df <- expand_grid(cover, tillage, Contour)
          df <- full_df %>%
  select(c(total_DM_lbs:LSsurgo)) %>% 
  slice(rep(1:n(), each=nrow(level_df)))
          df <- cbind(level_df, df)
          pred_df <- df %>%
            filter(cover == full_df$cover, tillage == full_df$tillage, Contour == full_df$Contour)
          erosion <- round(predict(cso_erosion, pred_df),2)
          pi_pred_df <- full_df %>%
            bind_cols(erosion) %>%
            mutate(Erosion = .pred)
         final_pi <- round(predict(cso_pi, pi_pred_df),2)
          pi_CI <- predict(cso_pi, pi_pred_df, type = "pred_int")
        }} else if (full_df$crop == "dr") {{
        dr_erosion <- readRDS(dr_erosion_file)
        dr_pi <- readRDS(dr_pi_file)
          cover <- factor(dr_erosion$preproc$xlevels$cover)
          tillage <- factor(dr_erosion$preproc$xlevels$tillage)
          Contour <- factor(dr_erosion$preproc$xlevels$Contour)
          level_df <- expand_grid(cover, tillage, Contour)
         df <- full_df %>%
  select(c(total_DM_lbs:LSsurgo)) %>% 
  slice(rep(1:n(), each=nrow(level_df)))
          df <- cbind(level_df, df)
          pred_df <- df %>%
            filter(cover == full_df$cover, tillage == full_df$tillage, Contour == full_df$Contour)
          erosion <- round(predict(dr_erosion, pred_df),2)
          pi_pred_df <- full_df %>%
            bind_cols(erosion) %>%
            mutate(Erosion = .pred)
         final_pi <- round(predict(dr_pi, pi_pred_df),2)
          pi_CI <- predict(dr_pi, pi_pred_df, type = "pred_int")
        }} else if (full_df$crop == "ps") {{
        ps_erosion <- readRDS(ps_erosion_file)
        ps_pi <- readRDS(ps_pi_file)
          tillage <- factor(ps_erosion$preproc$xlevels$tillage)
          Contour <- factor(ps_erosion$preproc$xlevels$Contour)
          level_df <- expand_grid(tillage, Contour)
          df <- full_df %>%
          select(c(initialP:LSsurgo)) %>% 
          slice(rep(1:n(), each=nrow(level_df)))
          df <- cbind(level_df, df)
          pred_df <- df %>%
            filter(tillage == full_df$tillage, Contour == full_df$Contour)
          erosion <- round(predict(ps_erosion, pred_df),2)
          pi_pred_df <- full_df %>%
            bind_cols(erosion) %>%
            mutate(Erosion = .pred)
         final_pi <- round(predict(ps_pi, pi_pred_df),2)
          pi_CI <- predict(ps_pi, pi_pred_df, type = "pred_int")
        }} else if (full_df$crop == "pt") {{
        pt_erosion <- readRDS(pt_erosion_file)
        pt_pi <- readRDS(pt_pi_file)
          density <- factor(pt_erosion$preproc$xlevels$density)
          rotational <- factor(pt_erosion$preproc$xlevels$rotational)
          level_df <- expand_grid(rotational, density)
          df <- full_df %>%
          select(c(initialP:LSsurgo)) %>% 
          slice(rep(1:n(), each=nrow(level_df)))
          df <- cbind(level_df, df) 
          if(full_df$rotational == "rt"){{
            pred_df <- df %>%
              filter(rotational == full_df$rotational, density == "rt")
          }} else{{
            pred_df <- df %>%
              filter(rotational == full_df$rotational,  density ==full_df$density)
          }}
          erosion <- round(predict(pt_erosion, pred_df),3)
          pi_pred_df <- pred_df %>%
            bind_cols(erosion) %>%
            mutate(Erosion = .pred)
         final_pi <- round(predict(pt_pi, pi_pred_df),3)
          pi_CI <- predict(pt_pi, pi_pred_df, type = "pred_int")
        }} else if (full_df$crop == "dl") {{
        dl_erosion <- readRDS(dl_erosion_file)
        dl_pi <- readRDS(dl_pi_file)
 density <- factor(dl_erosion$preproc$xlevels$density)
    level_df <- expand_grid(density)
        df <- full_df %>%
          select(c(initialP:LSsurgo)) %>% 
          slice(rep(1:n(), each=nrow(level_df)))
        
        df <- cbind(density, df)
        
        pred_df <- df %>%
          filter(density == full_df$density)
        erosion <- round(predict(dl_erosion, pred_df),2)
        
        pi_pred_df <- pred_df %>%
          bind_cols(erosion) %>%
          mutate(Erosion = .pred)
        
        final_pi <- round(predict(dl_pi, pi_pred_df),2)
        pi_CI <- predict(dl_pi, pi_pred_df, type = "pred_int")
        }}
          """
                )
        
        print(r.get("p_need"))
        print(r.get("manure"))
        print(r.get("dm"))
        print(r.get("p205"))
        print(r.get("fert"))
        print(r.get("crop"))
        print(r.get("cover"))
        print(r.get("contour"))
        print(r.get("tillage"))
        print(r.get("rotational"))
        print(r.get("density"))
        print(r.get("initialP"))
        print(r.get("om"))
        # print(r.get("pi_pred_df$Erosion"))
        # print(r.get("pi_pred_df$cover"))
        # print(r.get("pi_pred_df$tillage"))
        # print(r.get("pi_pred_df$Contour"))
        # print(r.get("pi_pred_df$initialP"))
        # print(r.get("pi_pred_df$total_DM_lbs"))
        # print(r.get("pi_pred_df$slope"))
        # print(r.get("pi_pred_df$slopelenusle.r"))
        # print(r.get("pi_pred_df$LSsurgo"))
        # print(r.get("pi_pred_df$total.depth"))
        # print(r.get("pi_pred_df$OM"))
        # print(r.get("pi_pred_df$silt"))
        # print(r.get("pi_pred_df$k"))

        

        # print(r.get("cc_pi_file"))
        # print(r.get("cc_pi"))
        # print(r.get("cc_pi$fit"))
        # print(r.get("cc_pi$spec"))
        

        # print(r.get("full_df$crop"))
        # print(r.get("cc_erosion"))
        # print(r.get("cc_erosion_file"))
        # print(r.get("tillage"))
        # print(r.get("cover"))
        # print(r.get("Contour"))
        # print(r.get("full_df"))
        
        # print(r.get("cc_pi"))
        # print(r.get("cc_pi_file"))
        
        # print(r.get("user_input_df"))
        # print(r.get("rotational"))
        # print(r.get("soil_df"))
        # print(r.get("p_needs"))
        # print(r.get("grazedManureDM_lbs"))
        # print(r.get("appliedDM_lbs"))
        # print(r.get("total_DM_lbs"))
        # print(r.get("full_df$crop"))
        # print(r.get("cc_pi"))
        # print(r.get("final_pi"))
        # print(r.get("fert_df"))
        # print(r.get("full_df"))
        # print(r.get("tillage"))
        # print(r.get("cover"))
        # print(r.get("Contour"))
        # print(r.get("level_df"))
        # print(r.get("df"))
        # print(r.get("pi_pred_df"))
        # print(r.get("cc_erosion_file"))
        # print(r.get("cg_erosion_file"))
        # print(r.get("cso_erosion_file"))
        # print(r.get("cc_pi_file"))

        ero = r.get("erosion").to_numpy()
        ploss = r.get("final_pi").to_numpy()
        pl.P2O5_fert = r.get("P2O5_fert")
        pl.N_fert = r.get("N_fert")
        ero=  np.where(ero < 0.01, .01, ero)
        ploss=  np.where(ploss < 0.01, .01, ploss)
        erosion.set_data(ero)
        pl.set_data(ploss)
#_________YIELD NITRATE COMBO BEGINS!!!______________________________

# initial storage for crop data
        
        rot_yrs_crop = []
        rot_yrs_crop = getRotYers(crop_ro)[1]
        legume = self.model_parameters["legume"]
        legume_text = getLegumeTest(legume)

        animal_density = self.model_parameters["density"]
        animal_density_text = getAnimaleDensity(animal_density)

        cover_crop = self.model_parameters["crop_cover"]
        PctFertN = self.model_parameters["fert_n_perc"]/100
        PctManrN = self.model_parameters["manure_n_perc"]/100
        #Pneeds = self.model_parameters["p_need"]
        precip = get_region_precip(active_region)
        precN = 0.5 * precip * 0.226  ## precipitation N inputs in lb/ac
        dryN = precN  ## assume dry deposition is equal to precipitation, lb/ac
        om_flattened = self.raster_inputs["om"].flatten()
        nResponse_flattened = self.raster_inputs["Nresponse"].flatten()
        drain_class_flattened = self.raster_inputs["drain_class"].flatten()
        #print("drain_class_flattened")
        #print(drain_class_flattened)
        getRotText_Value = getRotText(crop_ro,legume_text,animal_density_text)



        rotation_avg = OutputDataNode("Rotational Average",
                                      "𝗬𝗶𝗲𝗹𝗱 (tons-Dry Matter/ac)",
                                      "Total Yield (tons-Dry Matter/year)")
        return_data.append(rotation_avg)
        flat_corn = self.raster_inputs["corn"].flatten()
        flat_soy = self.raster_inputs["soy"].flatten()
        
        for y in range(0, len(flat_corn)):
          leached_N_Total = 0
          if flat_corn[y] < 0:
            if crop_ro == "cc":
              corn.set_data(flat_corn[y])
              rotation_avg.set_data(flat_corn[y])
              nitrate_array.append(flat_corn[y])
              nitrate.set_data([flat_corn[y]])
            elif crop_ro == "dl":
              nitrate_array.append(flat_corn[y])
              nitrate.set_data([flat_corn[y]])
            elif crop_ro == "cg":
              corn.set_data(flat_corn[y])
              soy.set_data(flat_corn[y])
              rotation_avg.set_data(flat_corn[y])
              nitrate_array.append(flat_corn[y])
              nitrate.set_data([flat_corn[y]])
            elif crop_ro == "dr":
              silage.set_data(flat_corn[y])
              corn.set_data(flat_corn[y])
              alfalfa.set_data([flat_corn[y]])
              rotation_avg.set_data(flat_corn[y])
              nitrate_array.append(flat_corn[y])
              nitrate.set_data([flat_corn[y]])
            elif crop_ro == "cso":
              silage.set_data(flat_corn[y])
              soy.set_data(flat_corn[y])
              oats.set_data([flat_corn[y]])
              rotation_avg.set_data(flat_corn[y])
              nitrate_array.append(flat_corn[y])
              nitrate.set_data([flat_corn[y]])
          else:
          #[bushels/acre x 10] original units
            corn_yield_raw = flat_corn[y] / 10
            soy_yield_raw = flat_soy[y] / 10
            cell_om = float(self.model_parameters["om"])
            cell_drain_class = drain_class_flattened[y]
            cell_nresponse = nResponse_flattened[y]
            cell_erosion = ero[y][0]
            erosN = cell_erosion * cell_om * 2
            OM_texts_denit = getOMText(cell_om,"denitr")
            # cellpmanurelist = manure_p_perc[5][y]
            cellpmanurelist = request.POST.getlist('model_parameters[pMcellData][0]['+str(y)+'][]')
            # print("Starting denitr")
            # print(cell_drain_class)
            denitlossDC = self.denitLoss[self.denitLoss["DrainClass_num"] == cell_drain_class]
            # print(denitlossDC)
            Denitr_Row = pd.concat([denitlossDC[denitlossDC["OM"] == OM_texts_denit]])
            # print(Denitr_Row)
            Denitr_Value = float(Denitr_Row["Denitr"].values[0])
            #fertNrec_Values_Array = getNFertRecs(rot_yrs_crop,crop_ro,legume_text,animal_density_text,self.fertNrec,getOMText(cell_om,"Nrec"),cell_nresponse)
            NvarsRot = self.Nvars[self.Nvars['RotationAbbr'] == getRotText_Value]
            NvarsCover = NvarsRot[NvarsRot["cover"] == cover_crop]
            #Nvar variabels can be collected on a crop year basis not by cell.

            # cont corn
            if crop_ro == "cc":
              corn_yield = corn_yield_raw
              corn_yield_tonDMac = corn_yield * 56 * (1 - 0.155) / 2000
              rotation_avg_tonDMac = corn_yield_tonDMac

              corn.set_data(corn_yield)
              yeild_crop_data = corn_yield_tonDMac
              fertN = PctFertN * float(cellpmanurelist[0])
              manrN = PctManrN * float(cellpmanurelist[1])
              # fertN = PctFertN * manure_p_perc[5][y][0]#fertNrec_Values_Array[0][0]
              # manrN = PctManrN * manure_p_perc[5][y][1]#fertNrec_Values_Array[0][1] ## actual manure N applied in lb/ac
              Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == "cn"]])
              NfixPct = float(Nvars_Row["NfixPct"].values[0])
              NH3loss = float(Nvars_Row["NH3loss"].values[0])
              Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
              grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
              leachN_Calced = Calc_N_Leach(yeild_crop_data,fertN,manrN,Nvars_Row,NfixPct,NH3loss,Nharv_content,grazed_manureN,Denitr_Value,precN,dryN,erosN)
              # if leachN_Calced < 0:
              #   leachN_Calced = 0
              leached_N_Total = [leachN_Calced]
              if leached_N_Total[0] < 0:
                leached_N_Total[0] = 0
              nitrate.set_data(leached_N_Total)

            elif crop_ro == "dl":
              #print("INSIDE DL")
              #corn_DM_yield = corn_yield_tonDMac_array[y]
              #print("CN")
              yeild_crop_data = corn_yield_tonDMac
              fertN = PctFertN * float(cellpmanurelist[0])
              manrN = PctManrN * float(cellpmanurelist[1])
              # fertN = PctFertN * manure_p_perc[5][y][0]#fertNrec_Values_Array[0][0]
              # manrN = PctManrN * manure_p_perc[5][y][1]#fertNrec_Values_Array[0][1] ## actual manure N applied in lb/ac
              #print("RIGHT BEFORE NvarsCover")
              Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == "dl"+ '_' + animal_density_text]])
              NfixPct = float(Nvars_Row["NfixPct"].values[0])
              NH3loss = float(Nvars_Row["NH3loss"].values[0])
              Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
              grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
              leachN_Calced = Calc_N_Leach(yeild_crop_data,fertN,manrN,Nvars_Row,NfixPct,NH3loss,Nharv_content,grazed_manureN,Denitr_Value,precN,dryN,erosN)
              # if leachN_Calced < 0:
              #   leachN_Calced = 0
              leached_N_Total = [leachN_Calced]
              if leached_N_Total[0] < 0:
                leached_N_Total[0] = 0
              nitrate.set_data(leached_N_Total)
            #     cash grain
            elif crop_ro == "cg":
              corn_yield = corn_yield_raw
              corn_yield_tonDMac = corn_yield * 56 * (
                      1 - 0.155) / 2000

              soy_yield = soy_yield_raw
              soy_yield_tonDMac = soy_yield * 60 * 0.792 * 0.9008 / 2000

              rotation_avg_tonDMac = 0.5 * corn_yield_tonDMac + 0.5 * soy_yield_tonDMac

              corn.set_data(corn_yield)
              #corn_yield_tonDMac_array.append(corn_yield_tonDMac)
              # corn.set_alternate_data(soy_yield_tonDMac)

              soy.set_data(soy_yield)
              #soy_yield_tonDMac_array.append(soy_yield_tonDMac)
              # soy.set_alternate_data(soy_yield_tonDMac)
              #print("INSIDE CG")
              corn_DM_yield = corn_yield_tonDMac
              soy_DM_yield = soy_yield_tonDMac
              yeild_crop_data = 0
              for i in rot_yrs_crop:
                if i == 'cn':
                  #print("CN")
                  yeild_crop_data = corn_DM_yield
                  fertN = PctFertN * float(cellpmanurelist[0])
                  manrN = PctManrN * float(cellpmanurelist[1])
                  # fertN = PctFertN * manure_p_perc[5][y][0]#fertNrec_Values_Array[0][0]
                  # manrN = PctManrN * manure_p_perc[5][y][1]#fertNrec_Values_Array[0][1] ## actual manure N applied in lb/ac
                  #print("RIGHT BEFORE NvarsCover")
                  Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == i]])
                  NfixPct = float(Nvars_Row["NfixPct"].values[0])
                  NH3loss = float(Nvars_Row["NH3loss"].values[0])
                  Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
                  grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
                  leachN_Calced = Calc_N_Leach(yeild_crop_data,fertN,manrN,Nvars_Row,NfixPct,NH3loss,Nharv_content,grazed_manureN,Denitr_Value,precN,dryN,erosN)
                  # if leachN_Calced < 0:
                  #   leachN_Calced = 0
                  leached_N_Total = leached_N_Total + leachN_Calced
                else:
                  yeild_crop_data = soy_DM_yield
                  fertN = PctFertN * float(cellpmanurelist[0])
                  manrN = PctManrN * float(cellpmanurelist[1])
                  # fertN = PctFertN * manure_p_perc[5][y][0]#fertNrec_Values_Array[0][0]
                  # manrN = PctManrN * manure_p_perc[5][y][1]#fertNrec_Values_Array[0][1] ## actual manure N applied in lb/ac
                  #print("RIGHT BEFORE NvarsCover")
                  Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == i]])
                  NfixPct = float(Nvars_Row["NfixPct"].values[0])
                  NH3loss = float(Nvars_Row["NH3loss"].values[0])
                  Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
                  grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
                  #print("RIGHT BEFORE fertN")
                  leachN_Calced = Calc_N_Leach(yeild_crop_data,fertN,manrN,Nvars_Row,NfixPct,NH3loss,Nharv_content,grazed_manureN,Denitr_Value,precN,dryN,erosN)
                  # if leachN_Calced < 0:
                  #   leachN_Calced = 0
                  leached_N_Total = leached_N_Total + leachN_Calced
              leached_N_Total = [leached_N_Total /2]
              if leached_N_Total[0] < 0:
                leached_N_Total[0] = 0
              nitrate.set_data(leached_N_Total)
                
            #     corn silage to corn grain to alfalfa x 3
            elif crop_ro == "dr":
              silage_yield = 3.73E-4 * math.pow(corn_yield_raw,
                                                2) + 3.95E-2 * corn_yield_raw + 6.0036
              silage_yield_tonDMac = silage_yield * 2000 * (1 - 0.65) / 2000

              corn_yield = corn_yield_raw
              corn_yield_tonDMac = corn_yield * 56 * (
                      1 - 0.155) / 2000
              alfalfa_yield = corn_yield_raw * 0.0195
              alfalfa_yield_tonDMac = alfalfa_yield * 2000 * (1 - 0.13) / 2000

              rotation_avg_tonDMac = 1 / 5 * silage_yield_tonDMac + 1 / 5 * corn_yield_tonDMac + 3 / 5 * alfalfa_yield_tonDMac

              silage.set_data(silage_yield)
              #silage_yield_tonDMac_array.append(silage_yield_tonDMac)
              # silage.set_alternate_data(silage_yield_tonDMac)


              corn.set_data(corn_yield)
              #corn_yield_tonDMac_array.append(corn_yield_tonDMac)
              # corn.set_alternate_data(corn_yield_tonDMac)

              alfalfa.set_data(alfalfa_yield)
              #alfalfa_yield_tonDMac_array.append(alfalfa_yield_tonDMac)
              # alfalfa.set_alternate_data(alfalfa_yield_tonDMac)
          # corn silage to soybeans to oats
          #print("INSIDE DR")
              corn_DM_yield = corn_yield_tonDMac
              silage_DM_yield = silage_yield_tonDMac
              alfalfa_DM_yield = alfalfa_yield_tonDMac
              for i in rot_yrs_crop:
                if i == 'cn':
                  #print("CN")
                  yeild_crop_data = corn_DM_yield
                  fertN = PctFertN * float(cellpmanurelist[0])
                  manrN = PctManrN * float(cellpmanurelist[1])
                  # fertN = PctFertN * manure_p_perc[5][y][0]#fertNrec_Values_Array[0][0]
                  # manrN = PctManrN * manure_p_perc[5][y][1]#fertNrec_Values_Array[0][1] ## actual manure N applied in lb/ac
                  #print("RIGHT BEFORE NvarsCover")
                  Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == i]])
                  NfixPct = float(Nvars_Row["NfixPct"].values[0])
                  NH3loss = float(Nvars_Row["NH3loss"].values[0])
                  Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
                  grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
                  leachN_Calced = Calc_N_Leach(yeild_crop_data,fertN,manrN,Nvars_Row,NfixPct,NH3loss,Nharv_content,grazed_manureN,Denitr_Value,precN,dryN,erosN)
                  # if leachN_Calced < 0:
                  #   leachN_Calced = 0
                  leached_N_Total = leached_N_Total + leachN_Calced
                elif i == 'cs':
                  #print("CN")
                  yeild_crop_data = silage_DM_yield
                  fertN = PctFertN * float(cellpmanurelist[0])
                  manrN = PctManrN * float(cellpmanurelist[1])
                  # fertN = PctFertN * manure_p_perc[5][y][0]#fertNrec_Values_Array[0][0]
                  # manrN = PctManrN * manure_p_perc[5][y][1]#fertNrec_Values_Array[0][1] ## actual manure N applied in lb/ac
                  
                  #print("RIGHT BEFORE NvarsCover")
                  Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == i]])
                  NfixPct = float(Nvars_Row["NfixPct"].values[0])
                  NH3loss = float(Nvars_Row["NH3loss"].values[0])
                  Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
                  grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
                  leachN_Calced = Calc_N_Leach(yeild_crop_data,fertN,manrN,Nvars_Row,NfixPct,NH3loss,Nharv_content,grazed_manureN,Denitr_Value,precN,dryN,erosN)
                  # if leachN_Calced < 0:
                  #   leachN_Calced = 0
                  leached_N_Total = leached_N_Total + leachN_Calced
                else:
                  yeild_crop_data = alfalfa_DM_yield
                  fertN = PctFertN * float(cellpmanurelist[0])
                  manrN = PctManrN * float(cellpmanurelist[1])
                  # fertN = PctFertN * manure_p_perc[5][y][0]#fertNrec_Values_Array[0][0]
                  # manrN = PctManrN * manure_p_perc[5][y][1]#fertNrec_Values_Array[0][1] ## actual manure N applied in lb/ac
                  #print("RIGHT BEFORE NvarsCover")
                  Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == i]])
                  NfixPct = float(Nvars_Row["NfixPct"].values[0])
                  NH3loss = float(Nvars_Row["NH3loss"].values[0])
                  Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
                  grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
                  #print("RIGHT BEFORE fertN")
                  leachN_Calced = Calc_N_Leach(yeild_crop_data,fertN,manrN,Nvars_Row,NfixPct,NH3loss,Nharv_content,grazed_manureN,Denitr_Value,precN,dryN,erosN)
                  # if leachN_Calced < 0:
                  #   leachN_Calced = 0
                  leached_N_Total = leached_N_Total + leachN_Calced
              leached_N_Total = [leached_N_Total / 5]
              if leached_N_Total[0] < 0:
                leached_N_Total[0] = 0
              nitrate.set_data(leached_N_Total)

            elif crop_ro == "cso":
              silage_yield = 3.73E-4 * math.pow(corn_yield_raw,
                                                2) + 3.95E-2 * corn_yield_raw + 6.0036
              silage_yield_tonDMac = silage_yield * 2000 * (
                      1 - 0.65) /2000

              soy_yield = soy_yield_raw
              soy_yield_tonDMac = soy_yield * 60 * 0.792 * 0.9008 / 2000

              oat_yield = corn_yield_raw * 0.42
              oat_yield_tonDMac = oat_yield * 32 * (1 - 0.14) / 2000

              rotation_avg_tonDMac = 1 / 3 * silage_yield_tonDMac + 1 / 3 * soy_yield_tonDMac + 1 / 3 * oat_yield_tonDMac

              silage.set_data(silage_yield)
              #silage_yield_tonDMac_array.append(silage_yield_tonDMac)
              # silage.set_alternate_data(silage_yield_tonDMac)

              soy.set_data(soy_yield)
              #soy_yield_tonDMac_array.append(soy_yield_tonDMac)
              # soy.set_alternate_data(soy_yield)

              oats.set_data(oat_yield)
              #oat_yield_tonDMac_array.append(oat_yield_tonDMac)
              # oats.set_alternate_data(oat_yield)
         
              silage_DM_yield = silage_yield_tonDMac
              soy_DM_yield = soy_yield_tonDMac
              oat_DM_yield = oat_yield_tonDMac
              for i in rot_yrs_crop:
                if i == 'cs':
                  #print("CS")
                  yeild_crop_data = silage_DM_yield
                  fertN = PctFertN * manure_p_perc[5][y][0]#fertNrec_Values_Array[0][0]
                  manrN = PctManrN * manure_p_perc[5][y][1]#fertNrec_Values_Array[0][1] ## actual manure N applied in lb/ac
                  #print("RIGHT BEFORE NvarsCover")
                  Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == i]])
                  NfixPct = float(Nvars_Row["NfixPct"].values[0])
                  NH3loss = float(Nvars_Row["NH3loss"].values[0])
                  Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
                  grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
                  leachN_Calced = Calc_N_Leach(yeild_crop_data,fertN,manrN,Nvars_Row,NfixPct,NH3loss,Nharv_content,grazed_manureN,Denitr_Value,precN,dryN,erosN)
                  # if leachN_Calced < 0:
                  #   leachN_Calced = 0
                  leached_N_Total = leached_N_Total + leachN_Calced
                elif i == 'sb':
                  #print("SB")
                  yeild_crop_data = silage_DM_yield
                  fertN = PctFertN * float(cellpmanurelist[0])
                  manrN = PctManrN * float(cellpmanurelist[1])
                  # fertN = PctFertN * manure_p_perc[5][y][0]#fertNrec_Values_Array[0][0]
                  # manrN = PctManrN * manure_p_perc[5][y][1]#fertNrec_Values_Array[0][1] ## actual manure N applied in lb/ac
                  #print("RIGHT BEFORE NvarsCover")
                  Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == i]])
                  NfixPct = float(Nvars_Row["NfixPct"].values[0])
                  NH3loss = float(Nvars_Row["NH3loss"].values[0])
                  Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
                  grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
                  leachN_Calced = Calc_N_Leach(yeild_crop_data,fertN,manrN,Nvars_Row,NfixPct,NH3loss,Nharv_content,grazed_manureN,Denitr_Value,precN,dryN,erosN)
                  # if leachN_Calced < 0:
                  #   leachN_Calced = 0
                  leached_N_Total = leached_N_Total + leachN_Calced
                else:
                  yeild_crop_data = oat_DM_yield
                  fertN = PctFertN * float(cellpmanurelist[0])
                  manrN = PctManrN * float(cellpmanurelist[1])
                  # fertN = PctFertN * manure_p_perc[5][y][0]#fertNrec_Values_Array[0][0]
                  # manrN = PctManrN * manure_p_perc[5][y][1]#fertNrec_Values_Array[0][1] ## actual manure N applied in lb/ac
                  #print("RIGHT BEFORE NvarsCover")
                  Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == i]])
                  NfixPct = float(Nvars_Row["NfixPct"].values[0])
                  NH3loss = float(Nvars_Row["NH3loss"].values[0])
                  Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
                  grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
                  #print("RIGHT BEFORE fertN")
                  leachN_Calced = Calc_N_Leach(yeild_crop_data,fertN,manrN,Nvars_Row,NfixPct,NH3loss,Nharv_content,grazed_manureN,Denitr_Value,precN,dryN,erosN)
                  # if leachN_Calced < 0:
                  #   leachN_Calced = 0
                  leached_N_Total = leached_N_Total + leachN_Calced
              leached_N_Total = [leached_N_Total / 3]
              if leached_N_Total[0] < 0:
                leached_N_Total[0] = 0
              nitrate.set_data(leached_N_Total)
            rotation_avg.set_data(rotation_avg_tonDMac)
            #rotation_avg_tonDMac_array.append(rotation_avg_tonDMac)
            # #return_data.append(nitrate_array)
           
          nitrate_array.append(leached_N_Total)
        # print(len(nitrate.data))
        # print(len(pl.data))
        # print(nitrate.data)
        # print(pl.data)
        print("Yield and Nitrate finished")
        return return_data