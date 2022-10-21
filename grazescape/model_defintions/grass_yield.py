from abc import ABC

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import R
from django.conf import settings
import os
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
        return 'pt_rt' + '_'+ legume_text
    elif crop == 'pt-cn':
        return 'pt_cn' + '_'+ animal_density_text + '_'+legume_text
    elif crop == 'dl':
        return crop + '_' + legume_text
    else:
        #print("getRotText else hit")
        return crop
        
def getRotYers(crop):
    # print("in getRotYers")
    if crop == 'pt':
        rot_yrs = 1
        rot_yrs_crop = ['pt']
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
    # print("RotationAbbr: "+RotationAbbr)
    NFertRecs_RotationAbbr = fertNrec[fertNrec["RotationAbbr"] == RotationAbbr]
    # print(NFertRecs_RotationAbbr)
    for i in rot_yrs_crop:
        # print("in the rot years crop loop")
        # print("rot_yrs_crop[i]: "+ i)
        
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
        # print(CropAbbr)
        # print(rasterLookUp)
        # print(rasterVal)
        NFertRecs_CropAbbr = NFertRecs_RotationAbbr[NFertRecs_RotationAbbr["CropAbbr"] == str(CropAbbr)]
        # print(NFertRecs_CropAbbr)
        NFertRecs_RasterLookup = NFertRecs_CropAbbr[NFertRecs_CropAbbr["rasterLookup"] == rasterLookUp]
        # print(NFertRecs_RasterLookup)
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
class GrassYield(ModelBase):
    def __init__(self, request,active_region, file_name=None):
        super().__init__(request,active_region, file_name)
        self.model_name = "tidyPastureALLWInoCec.rds"
        #self.model_name = "tidyPastureALLWI.rds"
        # self.model_file_path = os.path.join(settings.MODEL_PATH,
        #                                     self.model_name)
        self.model_file_path = os.path.join(settings.MODEL_PATH,'GrazeScape',self.model_name)
        self.model_file_path2 = os.path.join(settings.MODEL_PATH,'GrazeScape',active_region)
        self.fertNrec = pd.read_csv(r"grazescape\static\grazescape\public\nitrate_tables\NitrogenFertRecs_zjh_edits.csv")
        #self.fertNrec = pd.read_csv(r"grazescape\model_defintions\NmodelInputs_final.csv")
        self.denitLoss = pd.read_csv(r"grazescape\static\grazescape\public\nitrate_tables\denitr.csv")
        self.Nvars = pd.read_csv(r"grazescape\static\grazescape\public\nitrate_tables\Nvars.csv")
        self.grass_type = self.model_parameters['grass_type']
        # self.units = "Dry Mass tons/ac"

    def run_model(self,active_region):
        grass_yield = OutputDataNode("Grass", "Yield (tons/acre)", 'Total Yield (tons/year')
        rotation_avg = OutputDataNode("Rotational Average", "Yield (tons-Dry Matter/ac/year)", "Yield (tons-Dry Matter/year)")
        nitrate = OutputDataNode("nleaching", "Nitrate Leaching (lb/acre/year)", "Nitrate Leaching (lb/year)")
        erosion = OutputDataNode("ero", "Soil Erosion (tons/acre/year)", "Soil Erosion (tons of soil/year")
        pl = OutputDataNode("ploss", "Phosphorus Runoff (lb/acre/year)", "Phosphorus Runoff (lb/year)")           
        
        nitrate_array = []
        crop_ro = self.model_parameters["crop"] + '-' + self.model_parameters["rotation"]
        return_data = []
        return_data.append(erosion)
        return_data.append(pl)
        return_data.append(grass_yield)
        return_data.append(rotation_avg)
        return_data.append(nitrate)
        # path to R instance
        grass = ''
        # print("self.model_parameters")
        # print(self.model_parameters)
        # print(self.model_parameters["grass_type"])
        r = R(RCMD=self.r_file_path, use_pandas=True)
        if 'bluegrass' in self.model_parameters["grass_type"].lower():
            grass = "Bluegrass-clover"
        elif 'orchard' in self.model_parameters["grass_type"].lower():
            grass = "Orchardgrass-clover"
        elif 'timothy' in self.model_parameters["grass_type"].lower():
            grass = "Timothy-clover"
        pred = [1, 2, 3]
        # "{}, ".format(grass)
        # print("RRRR")
        # print(self.model_data_inputs_path)

        slope = self.raster_inputs["slope"].flatten()
        slope_length = self.raster_inputs["slope_length"].flatten()
        k = self.raster_inputs["k"].flatten()
        ls = self.raster_inputs["ls"].flatten()
        elevation = self.raster_inputs["elevation"].flatten()
        sand = self.raster_inputs["sand"].flatten()
        silt = self.raster_inputs["silt"].flatten()
        clay = self.raster_inputs["clay"].flatten()
        ksat = self.raster_inputs["ksat"].flatten()
        #cec = self.raster_inputs["cec"].flatten()
        ph = self.raster_inputs["ph"].flatten()
        om = self.raster_inputs["om"].flatten()
        awc = self.raster_inputs["awc"].flatten()
        total_depth = self.raster_inputs["total_depth"].flatten()

        regionRDS = active_region + '.rds'
        r.assign("slope_length", slope_length)
        r.assign("k", k)
        # r.assign("om", om)
        r.assign("total_depth", total_depth)
        r.assign("ls", ls)

        r.assign("slope", slope)
        r.assign("elevation", elevation)
        r.assign("sand", sand)
        r.assign("silt", silt)
        r.assign("clay", clay)
        r.assign("om", om)
        r.assign("ksat", ksat)
        #r.assign("cec", cec)
        r.assign("ph", ph)
        r.assign("awc", awc)
        r.assign("total_depth", total_depth)
        # print("assigning om")
        r.assign("om", float(self.model_parameters["om"]))
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

        r.assign("p_need", self.model_parameters["p_need"])
        r.assign("dm", self.model_parameters["dm"])
        r.assign("p205", self.model_parameters["p205"])
        r.assign("manure", self.model_parameters["manure"])
        r.assign("fert", self.model_parameters["fert"])
        r.assign("crop", self.model_parameters["crop"])
        r.assign("cover", self.model_parameters["crop_cover"])
        r.assign("contour", self.model_parameters["contour"])
        r.assign("tillage", self.model_parameters["tillage"])
        r.assign("rotational", self.model_parameters["rotation"])
        r.assign("density", self.model_parameters["density"])
        r.assign("initialP", self.model_parameters["soil_p"])
        r.assign("om", float(self.model_parameters["om"]))
        print("assigning om done")

        print(r("library(randomForest)"))
        print(r("library(dplyr)"))
        print(r("library(tidymodels)"))
        print(r("library(tidyverse)"))
        print(r("savedRF <- readRDS('" + self.model_file_path + "')"))
        print(r(
            "new_dat <- data.frame(slope=slope, elev=elevation, sand=sand, "
            "silt=silt,   clay=clay,     om=om,   ksat=ksat,    " #cec=cec,     
            "ph=ph,  awc=awc,   total.depth=total_depth )"))
        print(r(
            'cropname <- factor(c("Bluegrass-clover", "Orchardgrass-clover",'
            '"Timothy-clover"))'))
        print(r(
            "df_repeated <- new_dat %>% slice(rep(1:n(), each=length(cropname)))"))
        print(r("new_df <- cbind(cropname, df_repeated)"))
        print(r("pred_df <- new_df %>% filter(cropname == '" + grass + "')"))
        print(r("pred <- predict(savedRF, pred_df)"))
        pred = r.get("pred")
        
        print("Model Results")
        print("$$$$$$$$$$$$$$$")
        pred = pred * float(self.model_parameters["graze_factor"])
        pred2 = np.where(pred < 0.01, .01, pred)
        print("GRASS PRED Flattened")
        print(pred2)
        grass_yield.set_data(pred)
        rotation_avg.set_data(pred)
        #print(self.model_parameters["om"])
        # r.assign("om", 2.56)
        print("MODEL PATH 2 ")
        print(self.model_file_path2)
        print(regionRDS)
        r.assign("cc_erosion_file", os.path.join(self.model_file_path2,ContCornErosion + regionRDS))
        r.assign("cg_erosion_file", os.path.join(self.model_file_path2,cornGrainErosion + regionRDS))
        r.assign("cso_erosion_file", os.path.join(self.model_file_path2,cornSoyOatErosion + regionRDS))
        r.assign("dr_erosion_file", os.path.join(self.model_file_path2,dairyRotationErosion + regionRDS))
        r.assign("ps_erosion_file", os.path.join(self.model_file_path2,pastureSeedingErosion + regionRDS))
        r.assign("pt_erosion_file", os.path.join(self.model_file_path2,pastureErosion + regionRDS))
        r.assign("dl_erosion_file", os.path.join(self.model_file_path2,dryLotErosion + regionRDS))

        r.assign("cc_pi_file", os.path.join(self.model_file_path2,ContCornTidyploss + regionRDS))
        r.assign("cg_pi_file", os.path.join(self.model_file_path2,cornGrainTidyploss + regionRDS))
        r.assign("cso_pi_file", os.path.join(self.model_file_path2,cornSoyOatTidyploss + regionRDS))
        r.assign("dr_pi_file", os.path.join(self.model_file_path2,dairyRotationTidyploss + regionRDS))
        r.assign("ps_pi_file", os.path.join(self.model_file_path2,pastureSeedingTidyploss + regionRDS))
        r.assign("pt_pi_file", os.path.join(self.model_file_path2,pastureTidyploss + regionRDS))
        r.assign("dl_pi_file", os.path.join(self.model_file_path2,dryLotTidyploss + regionRDS))
        

        print("running PL loss model!!!!!!!!!!!!!!!!!!!!!!!!!!!1")

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
       
        
        
        # print("ERO BEFORE tonumpy")
        # print(r.get("erosion"))
        # print(r.get("final_pi"))
        ero = r.get("erosion").to_numpy()
        ploss = r.get("final_pi").to_numpy()
        pl.P2O5_fert = r.get("P2O5_fert")
        pl.N_fert = r.get("N_fert")
        ero=  np.where(ero < 0.01, .01, ero)
        ploss=  np.where(ploss < 0.01, .01, ploss)
        erosion.set_data(ero)
        pl.set_data(ploss)

        rot_yrs_crop = []
        # print("CROP_RO")
        # print(crop_ro)
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
        # print("LENGTHS")
        # print(pred2)
        # print(drain_class_flattened)
        # print(nResponse_flattened)
        # print(om_flattened)
        getRotText_Value = getRotText(crop_ro,legume_text,animal_density_text)
        # print(len(pred2))
        # print(len(drain_class_flattened))
        for y in range(0, len(pred2)):
          leached_N_Total = 0
        #   print(pred2[y][0])
          if drain_class_flattened[y] < 0:
            nitrate_array.append(-9999)
            nitrate.set_data([-9999])
        #   if pred2[y][0] < 0:
        #     nitrate_array.append(pred2[y][0])
          else:
            cell_om = om_flattened[y] / 10
            cell_drain_class = drain_class_flattened[y]
            cell_nresponse = nResponse_flattened[y]
            cell_erosion = ero[y][0]
            erosN = cell_erosion * cell_om * 2
            OM_texts_denit = getOMText(cell_om,"denitr")
            # print("Starting denitr")
            # print(cell_drain_class)
            denitlossDC = self.denitLoss[self.denitLoss["DrainClass_num"] == cell_drain_class]
            # print(denitlossDC)
            Denitr_Row = pd.concat([denitlossDC[denitlossDC["OM"] == OM_texts_denit]])
            # print(Denitr_Row)
            Denitr_Value = float(Denitr_Row["Denitr"].values[0])
            fertNrec_Values_Array = getNFertRecs(rot_yrs_crop,crop_ro,legume_text,animal_density_text,self.fertNrec,getOMText(cell_om,"Nrec"),cell_nresponse)
            Nvars_Row = pd.concat([self.Nvars[self.Nvars['RotationAbbr'] == getRotText_Value]])
            # print(NvarsRot)
            # NvarsCover = NvarsRot[NvarsRot["cover"] == cover_crop]
            # print(NvarsCover)
            #Nvar variabels can be collected on a crop year basis not by cell.

            yeild_crop_data = pred2[y][0]
            fertN = PctFertN * fertNrec_Values_Array[0][0]
            manrN = PctManrN * fertNrec_Values_Array[0][1] ## actual manure N applied in lb/ac
            # Nvars_Row = pd.concat([NvarsCover[NvarsCover["RotationAbbr"] == getRotText_Value]])
            # print(Nvars_Row)
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
            #print(leached_N_Total)
            nitrate.set_data(leached_N_Total)
            nitrate_array.append(leached_N_Total)
        print(len(nitrate.data))
        print(len(pl.data))
        print(nitrate.data)
        print(pl.data)
        return return_data
