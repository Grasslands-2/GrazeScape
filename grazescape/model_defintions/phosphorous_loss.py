from abc import ABC

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from grazescape.model_defintions.nitrateLeach import NitrateLeeching
from pyper import *
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Polygon

def getOMText(omraw,text_needed):
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
def getRotYers(crop):
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
def getNFertRecs(rot_yrs_crop,crop,legume_text,animal_density_text,fertNrec,om_text,cell_nresponse):
    print("in getNFertRecs")
    nrecValue_array = []
    RotationAbbr = getRotText(crop,legume_text,animal_density_text)
    print("RotationAbbr: "+RotationAbbr)
    NFertRecs_RotationAbbr = fertNrec[fertNrec["RotationAbbr"] == RotationAbbr]
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
            rasterVal = cell_nresponse
        else:
            print("in raster look up else")
            CropAbbr = i
            print(CropAbbr)
            if i == 'ot' or i == 'as':
                rasterLookUp = 'om'
                rasterVal = om_text
            else: 
                rasterLookUp = 'nResponse'
                rasterVal = str(cell_nresponse)

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
def get_region_precip(active_region):
  if(active_region == 'cloverBeltWI'):
    return 38
  elif(active_region == 'southWestWI'):
    return 44
  elif(active_region == 'uplandsWI'):
    return 43
  elif(active_region == 'northeastWI'):
    return 35
class PhosphorousLoss(ModelBase):
    def __init__(self, request, active_region, file_name=None):
        super().__init__(request,active_region, file_name)
        self.fertNrec = pd.read_csv(r"grazescape\model_defintions\NitrogenFertRecs_zjh_edits.csv")
        self.denitLoss = pd.read_csv(r"grazescape\model_defintions\denitr.csv")
        self.Nvars = pd.read_csv(r"grazescape\model_defintions\Nvars.csv")

    def run_model(self,active_region):

        print("running PL loss model!!!!!!!!!!!!!!!!!!!!!!!!!!!1")
        print(self)
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
        print(self.model_parameters["om"])
        # r.assign("om", 2.56)


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
        erosion = OutputDataNode("ero", "Soil Erosion (tons/acre/year)", "Soil Erosion (tons of soil/year")
        pl = OutputDataNode("ploss", "Phosphorus Runoff (lb/acre/year)", "Phosphorus Runoff (lb/year)")
        ero = r.get("erosion").to_numpy()
        print("END ERO AND PLOSS MODELS")
        rows = self.bounds["y"]
        cols = self.bounds["x"]
        erodatanm = self.reshape_model_output(ero, self.bounds)
        # print("ERO datanm[y][x] In ERO model")
        # for y in range(0, rows):
        #     for x in range(0, cols):
        #           print(x)
        #           print(y)
        #           print(erodatanm[y][x])

        
#__________NITRATE MODEL BEGINS!!!!!__________________________________
#         print('NITRATE LEECHING MODEL PARAS!!!!!!')
#         print(self.model_parameters)
#         #print(erodatanm)
#         # user defined variables
#         crop_ro = self.model_parameters["crop"]
#         print(crop_ro)
#         rot_yrs = 0
#         rot_yrs_crop = []
        
#         rot_yrs = getRotYers(crop_ro)[0]
#         rot_yrs_crop = getRotYers(crop_ro)[1]
#         print("rot_yrs: ")
#         print(rot_yrs)
#         print("rot_yrs_crop: ")
#         print(rot_yrs_crop)
#         legume = self.model_parameters["legume"]
#         legume_text = getLegumeTest(legume)

#         animal_density = self.model_parameters["density"]
#         animal_density_text = getAnimaleDensity(animal_density)

#         cover_crop = self.model_parameters["crop_cover"]
#         PctFertN = self.model_parameters["fert_n_perc"]
#         PctManrN = self.model_parameters["manure_n_perc"]
#         Pneeds = self.model_parameters["p_need"]
#         precip = get_region_precip(active_region)
#         precN = 0.5 * precip * 0.226  ## precipitation N inputs in lb/ac
#         dryN = precN  ## assume dry deposition is equal to precipitation, lb/ac
#         # raster defined variables
#         om_raster = self.raster_inputs["om"].flatten()
#         drain_class = self.raster_inputs["drain_class"].flatten()
#         Nresponse = self.raster_inputs["Nresponse"].flatten()
#         #place holder for raster gathered value
#         #om_raw = 1
        
#         #place holder for raster gathered value
        
#         #drain_class_raw = 1

#         #place holder for raster gathered value
#         #nResponse_raw = 1
        
#         #Model result defined variables
#         #erosion = self.erodatmn[0]
#         for i in range(0, rot_yrs-1):
#             NvarsRot = self.Nvars[self.Nvars['RotationAbbr'] == getRotText(crop_ro,legume_text,animal_density_text)]
#             NvarsCover = NvarsRot[NvarsRot["cover"] == cover_crop]
#             #Nvar variabels can be collected on a crop year basis not by cell.
#             Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == rot_yrs_crop[i]]])
#             NfixPct = str(Nvars_Row["NfixPct"].values[0])
#             NH3loss = str(Nvars_Row["NH3loss"].values[0])
#             Nharv_content = str(Nvars_Row["Nharv_content"].values[0])
#             grazed_manureN = str(Nvars_Row["grazedManureN"].values[0])
#             print("NfixPct VALUE: " + NfixPct)
#             print("NH3loss VALUE: " + NH3loss)
#             print("Nharv_content VALUE: " + Nharv_content)
#             print("grazed_manureN VALUE: " + grazed_manureN)
#             print("ERO datanm[y][x] In nitrate model")
#             ## NEED TO GET CROP YIELD!!!!!
#             #harvN = cropYield * 2000 * Nharv_content  ## harvested N output, lb/ac (crop yield in tons dm, convert to lbs dm) # dry lot yield = 0
#             for y in range(0, self.bounds["y"]):
#                 for x in range(0, self.bounds["x"]):
#                     # print(x)
#                     # print(y)
#                     cell_om = self.raster_inputs["om"][y][x] / 10
#                     cell_drain_class = self.raster_inputs["drain_class"][y][x]
#                     cell_nresponse = self.raster_inputs["Nresponse"][y][x]
#                     cell_erosion = erodatanm[y][x]
#                     OM_texts_denit = getOMText(cell_om,"denitr")
#                     #fertNrec_Values_Array array of lbs per acre based on crop, in the order of rotation years
                    
#                     fertNrec_Values_Array = getNFertRecs(rot_yrs_crop,crop_ro,legume_text,animal_density_text,self.fertNrec,getOMText(cell_om,"Nrec"),cell_nresponse)
#                     fertN = PctFertN * float(fertNrec_Values_Array[i])
#                     manrN = PctManrN * float(fertNrec_Values_Array[i])  ## actual manure N applied in lb/ac
#                     #getting denitr for cell based on drain class raster and om raster
#                     denitlossDC = self.denitLoss[self.denitLoss["DrainClass_num"] == cell_drain_class]
#                     Denitr_Row = pd.concat([denitlossDC[denitlossDC["OM"] == OM_texts_denit]])
#                     Denitr_Value = Denitr_Row["Denitr"][0]
#                     print("DENITR VALUE: " + str(Denitr_Value))
#                     erosN = cell_erosion * cell_om * 2
#                     print(erosN)
#         # print("ERO datanm[y][x] In nitrate model")
#         # for y in range(0, self.bounds["y"]):
#         #     for x in range(0, self.bounds["x"]):
#         #         # print(x)
#         #         # print(y)
#         #         cell_om = self.raster_inputs["om"][y][x] / 10
#         #         cell_drain_class = self.raster_inputs["drain_class"][y][x]
#         #         cell_nresponse = self.raster_inputs["Nresponse"][y][x]
#         #         cell_erosion = erodatanm[y][x]
                

        
#         #fetched variables from csvs
#         #self.fertNrec = pd.read_csv(r"grazescape\model_defintions\NitrogenFertRecs_zjh_edits.csv")
        
#         #fertNrec_Values_Array = getNFertRecs(rot_yrs_crop,crop_ro,legume_text,animal_density_text,self.fertNrec,getOMText(cell_om,"Nrec"),cell_nresponse)
#         # for i in range(0, rot_yrs-1):
#         #     fertNrec_Value = getNFertRecs(i,rot_yrs_crop,crop_ro,legume_text,animal_density_text,self.fertNrec,getOMText(cell_om,"Nrec"),cell_nresponse)
#         #     print("in for loop through rot_yrs")
#         #     print(i)  
#         #     print("Nrec VALUE: " + fertNrec_Value)
#         print(fertNrec_Values_Array)
#         #used for denitloss
#         print("start denitlossDC read")
#         #print(self.denitLoss)
        
        
        
#         #used for NfixPct and NH3loss
#         for i in range(0, rot_yrs-1):
#             NvarsRot = self.Nvars[self.Nvars['RotationAbbr'] == getRotText(crop_ro,legume_text,animal_density_text)]
#             NvarsCover = NvarsRot[NvarsRot["cover"] == cover_crop]
#             #Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == rot_yrs_crop[i]]])
#             Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == rot_yrs_crop[i]]])
#             NfixPct = str(Nvars_Row["NfixPct"].values[0])
#             NH3loss = str(Nvars_Row["NH3loss"].values[0])
#             Nharv_content = str(Nvars_Row["Nharv_content"].values[0])
#             grazed_manureN = str(Nvars_Row["grazedManureN"].values[0])
#             print("NfixPct VALUE: " + NfixPct)
#             print("NH3loss VALUE: " + NH3loss)
#             print("Nharv_content VALUE: " + Nharv_content)
#             print("grazed_manureN VALUE: " + grazed_manureN)
#         #NfixPct # (Nvars.csv)
#         #NH3loss # (Nvars.csv)
#         #Nharv_content # (Nvars.csv)
#         #grazed_manureN # (Ninputs tab)
# #fish out the variables from the tables by filtering with the the variables from the model paras








        #variable calcs
        #return "Nitrate Ran"
        ploss = r.get("final_pi").to_numpy()
        pl.P2O5_fert = r.get("P2O5_fert")
        pl.N_fert = r.get("N_fert")
        ero=  np.where(ero < 0.01, .01, ero)
        ploss=  np.where(ploss < 0.01, .01, ploss)
        # if np.sum(ero) < 0:
        #     ero = np.array([0])
        # print(np.sum(ploss))
        # if np.sum(ploss) < 0:
        #     for index, value in enumerate(ploss):
        #         ploss[index] = 0
        # ploss = np.array([-999999999999990])
        erosion.set_data(ero)
        pl.set_data(ploss)
        return [erosion, pl]
        #return [pl, erosion]

