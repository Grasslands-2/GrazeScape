from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
import math
from pyper import *
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Polygon


def getOMText(omraw, text_needed):
    # print(omraw)
    if omraw <= 2:
        OM_denitloss = '<2'
        OM_fertrecs = '<2'
    elif 2 < omraw < 5:
        OM_denitloss = '2-5.0'
        OM_fertrecs = '2-9.9'
    elif 5 < omraw < 10:
        OM_denitloss = '>5'
        OM_fertrecs = '2-9.9'
    elif 10 < omraw < 20:
        OM_denitloss = '>5'
        OM_fertrecs = '10-20.0'
    # return [OM_denitloss,OM_fertrecs]
    if text_needed == "denitr":
        return OM_denitloss
    else:
        return OM_fertrecs


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


def getRotText(crop, legume_text, animal_density_text):
    if crop == 'pt-rt':
        return crop + '_' + legume_text
    elif crop == 'pt-cn':
        return crop + '_' + animal_density_text + '_' + legume_text
    elif crop == 'dl':
        return crop + '-' + animal_density_text
    else:
        # print("getRotText else hit")
        return crop


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
        rot_yrs_crop = ['cn']
    if crop == 'cg':
        rot_yrs = 2
        rot_yrs_crop = ['cn', 'sb']
    if crop == 'cso':
        rot_yrs = 3
        rot_yrs_crop = ['cs', 'sb', 'ot']
    if crop == 'dr':
        rot_yrs = 5
        rot_yrs_crop = ['cs', 'cn', 'as', 'af', 'af']
    if crop == 'dl':
        rot_yrs = 1
        rot_yrs_crop = ['dl']
    return [rot_yrs, rot_yrs_crop]


def get_region_precip(active_region):
    if active_region == 'cloverBeltWI':
        return 38
    elif active_region == 'southWestWI':
        return 44
    elif active_region == 'uplandsWI':
        return 43
    elif active_region == 'northeastWI':
        return 35


class DryLot(ModelBase):
    def __init__(self, request, active_region, file_name=None):
        super().__init__(request, active_region, file_name)
        # C:\Users\zjhas\Documents\GrazeScape\grazescape\static\grazescape\public
        self.fertNrec = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/NmodelInputs_final_grazed.csv")
        # self.fertNrec = pd.read_csv(r"grazescape\model_defintions\NmodelInputs_final.csv")
        self.denitLoss = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/denitr.csv")
        self.Nvars = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/Nvars.csv")
        # original units are in  [bushels/acre x 10]0
        # (to keep values in integer)
        # self.units = "Dry Mass tons/ac"
        # list of CropYieldDataNode
        self.crop_list = []
        self.test_counter = 0

    @staticmethod
    def calculate_denitloss(om_average, drain_response_average):
        drain_round = drain_response_average
        if drain_round > 7:
            drain_round = 7
        if drain_round < 1:
            drain_round = 1
        if om_average < 2:
            drain_dict = {1: 3, 2: 9, 3: 20, 4: 3, 5: 13, 6: 20, 7: 6}
        elif 2 <= om_average <= 5:
            drain_dict = {1: 6, 2: 13, 3: 30, 4: 6, 5: 17.5, 6: 30, 7: 10}
        else:
            drain_dict = {1: 8, 2: 17.5, 3: 40, 4: 8, 5: 25, 6: 40, 7: 13}
        return drain_dict[drain_round]

    def Calc_N_Leach(self, yeild_crop_data, fertN, manrN, NfixPct, NH3loss, Nharv_content, grazed_manureN,
                     Denitr_Value, precN, dryN, erosN):
        # print("hello world")
        # self.test_counter = self.test_counter + 1
        NH3N = fertN * NH3loss / 100  ## ammonia loss output, lb/ac
        # print("NH3N")
        # print(NH3N)
        harvN = yeild_crop_data * 2000 * Nharv_content  ## harvested N output, lb/ac (crop yield in tons dm, convert to lbs dm) # dry lot yield = 0
        # print("harvN")
        # print(harvN)
        fixN = harvN * NfixPct / 100 + 3  ## N fixation input, lb/ac
        # print("fixN")
        # print(fixN)
        denitN = fertN * Denitr_Value / 100  ## denitrification loss,
        # print("denitN")
        # print(denitN)
        inputsN = fertN + manrN + precN + dryN + fixN + grazed_manureN
        # print("inputsN 1")
        # print(inputsN)
        gasN = 0.01 * inputsN  ## misc gases are estimated as 1% of inputs
        # print("gasN")
        # print(gasN)
        NH3senN = 8  ## ammonia loss at senescence
        runoffN = 0
        outputsN = harvN + NH3N + denitN + erosN + gasN + NH3senN + runoffN
        # if yeild_crop_data > 0:
        #     print("inputs", fertN, manrN, precN, dryN, fixN, grazed_manureN)
        #     print("inputs2", yeild_crop_data, fertN, manrN, NfixPct, NH3loss, Nharv_content, grazed_manureN,
        #           Denitr_Value, precN, dryN, erosN)
        #     print("outputs", harvN, NH3N, denitN, erosN, gasN, NH3senN, runoffN)
        #     print("sum is", inputsN - outputsN)
        # print("inputsN 2")
        # print(inputsN)
        # print("outputsN")
        # print(outputsN)
        leachN = inputsN - outputsN
        # print("LEACHN")
        # print(leachN)
        return leachN

    def run_model(self, request, active_region, manure_results):
        # print("SELF IN CROP")
        # print(self.model_parameters)
        crop_ro = self.model_parameters["crop"]
        return_data = []
        dry_lot_yield = OutputDataNode("Dry Lot", "","","Dry Lot","")
        erosion = OutputDataNode("ero", "Soil loss (tons/ac/yr)", "Soil loss (tons/yr)","Soil loss (tons/ac/yr)","Soil loss (tons/yr)")
        pl = OutputDataNode("ploss", "P runoff (lb/ac/yr)", "P runoff (lb/yr)","Phosphorus runoff (lb/ac/yr)","Phosphorus runoff (lb/yr)")
        nitrate = OutputDataNode("nleaching", "Nitrate-N leaching (lb/ac/yr)", "Nitrate-N leaching (lb/yr)","Nitrate-N leaching (lb/ac/yr)","Nitrate-N leaching (lb/yr)")
        return_data.append(erosion)
        return_data.append(pl)
        return_data.append(nitrate)
        return_data.append(dry_lot_yield)


        # _______________START OF NUTRIENT MODELS!!!__________________________________

        print("running PL loss model!!!!!!!!!!!!!!!!!!!!!!!!!!!1")
        # print(self)
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

        r.assign("p_need", float(manure_results["avg"]["p_needs"]))
        r.assign("manure", float(manure_results["avg"]["man_p_per"]))
        r.assign("dm", float(manure_results["avg"]["grazed_dm"]))
        r.assign("p205", float(manure_results["avg"]["grazed_p205"]))

        r.assign("fert", float(self.model_parameters["fert"]))
        r.assign("crop", self.model_parameters["crop"])
        r.assign("cover", self.model_parameters["crop_cover"])
        r.assign("contour", self.model_parameters["contour"])
        r.assign("tillage", self.model_parameters["tillage"])
        r.assign("rotational", self.model_parameters["rotation"])
        r.assign("density", self.model_parameters["density"])
        r.assign("initialP", float(self.model_parameters["soil_p"]))

        r.assign("om", float(self.model_parameters["om"]))
        print("ploss modal para variables")
        print(self.model_file_path)
        print(self.model_parameters["fert"])
        print(self.model_parameters["crop"])
        print(self.model_parameters["crop_cover"])
        print(self.model_parameters["contour"])
        print(self.model_parameters["tillage"])
        print(self.model_parameters["rotation"])
        print(self.model_parameters["density"])
        print(self.model_parameters["soil_p"])
        print(os.path.join(self.model_file_path, ContCornErosion + regionRDS))
        # print(self.model_parameters["om"])
        # r.assign("om", 2.56)
        # print("MODEL PATH")
        # print(self.model_file_path)
        # print(regionRDS)

        r.assign("cc_erosion_file", os.path.join(self.model_file_path, ContCornErosion + regionRDS))
        r.assign("cg_erosion_file", os.path.join(self.model_file_path, cornGrainErosion + regionRDS))
        r.assign("cso_erosion_file", os.path.join(self.model_file_path, cornSoyOatErosion + regionRDS))
        r.assign("dr_erosion_file", os.path.join(self.model_file_path, dairyRotationErosion + regionRDS))
        r.assign("ps_erosion_file", os.path.join(self.model_file_path, pastureSeedingErosion + regionRDS))
        r.assign("pt_erosion_file", os.path.join(self.model_file_path, pastureErosion + regionRDS))
        r.assign("dl_erosion_file", os.path.join(self.model_file_path, dryLotErosion + regionRDS))

        r.assign("cc_pi_file", os.path.join(self.model_file_path, ContCornTidyploss + regionRDS))
        r.assign("cg_pi_file", os.path.join(self.model_file_path, cornGrainTidyploss + regionRDS))
        r.assign("cso_pi_file", os.path.join(self.model_file_path, cornSoyOatTidyploss + regionRDS))
        r.assign("dr_pi_file", os.path.join(self.model_file_path, dairyRotationTidyploss + regionRDS))
        r.assign("ps_pi_file", os.path.join(self.model_file_path, pastureSeedingTidyploss + regionRDS))
        r.assign("pt_pi_file", os.path.join(self.model_file_path, pastureTidyploss + regionRDS))
        r.assign("dl_pi_file", os.path.join(self.model_file_path, dryLotTidyploss + regionRDS))

        print(r(f"""
                #if (!require(randomForest)) install.packages("randomForest", repos = "http://cran.us.r-project.org")
                #if (!require(tidymodels)) install.packages("tidymodels", repos = "http://cran.us.r-project.org")
                #if (!require(tidyverse)) install.packages("tidyverse", repos = "http://cran.us.r-project.org")
                library(tidyverse)
                library(tidymodels)
                library(randomForest)
                # load erosion models



                # input/load data
                user_input_df <- tibble(crop = c(crop), cover = c(cover), tillage = c(tillage), Contour = c(contour), rotational = c(rotational), density = c(density))

                soil_df <- tibble(slope = unlist(slope), slopelenusle.r = unlist(slope_length), sand = unlist(sand), silt = unlist(silt), clay = unlist(clay), k = unlist(k),
                                  OM = unlist(om), initialP = unlist(initialP), total.depth = unlist(total_depth), LSsurgo = unlist(ls))

                p_needs <- p_need
                grazedManureDM_lbs <- dm
                appliedDM_lbs <-  ((p_needs * (manure/100))/6) * 1000 * 8.4 * (6/100)
                total_DM_lbs <- sum(grazedManureDM_lbs, appliedDM_lbs, na.rm = TRUE)
                grazedP2O5 <- p205
                P2O5_applied_lbs = (fert + manure)*(p_needs/100) 
                totalP2O5_lbs = sum(grazedP2O5, P2O5_applied_lbs, na.rm = TRUE)

                fert_df <- tibble(total_DM_lbs = total_DM_lbs, totalP2O5_lbs = totalP2O5_lbs)

                #create data frame for models
                crop_df <- user_input_df %>%
                  select(where(~!all(is.na(.)))) # remove NAs
                full_df <- bind_cols(crop_df, fert_df, soil_df)


                # run models for different crops
                if (full_df$crop == "cc") {{

                  cc_erosion <- readRDS(cc_erosion_file)

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

                }} else if (full_df$crop == "cg") {{

                  cg_erosion <- readRDS(cg_erosion_file)

                  cover <- factor(cg_erosion$preproc$xlevels$cover)
                  tillage <- factor(cg_erosion$preproc$xlevels$tillage)
                  Contour <- factor(cg_erosion$preproc$xlevels$Contour)

                  level_df <- expand_grid(cover, tillage, Contour)

                  df <- full_df %>%
                    select(-c(crop, tillage, cover, Contour)) %>% 
                    slice(rep(1:n(), each=nrow(level_df)))

                  df <- cbind(level_df, df)

                  pred_df <- df %>%
                    filter(cover == full_df$cover, tillage == full_df$tillage, Contour == full_df$Contour)

                  erosion <- round(predict(cg_erosion, pred_df),2)

                }} else if (full_df$crop == "cso") {{

                  cso_erosion <- readRDS(cso_erosion_file)

                  cover <- factor(cso_erosion$preproc$xlevels$cover)
                  tillage <- factor(cso_erosion$preproc$xlevels$tillage)
                  Contour <- factor(cso_erosion$preproc$xlevels$Contour)

                  level_df <- expand_grid(cover, tillage, Contour)

                  df <- full_df %>%
                    select(-c(crop, tillage, cover, Contour)) %>% 
                    slice(rep(1:n(), each=nrow(level_df)))

                  df <- cbind(level_df, df)

                  pred_df <- df %>%
                    filter(cover == full_df$cover, tillage == full_df$tillage, Contour == full_df$Contour)

                  erosion <- round(predict(cso_erosion, pred_df),2)

                }} else if (full_df$crop == "dr") {{

                  dr_erosion <- readRDS(dr_erosion_file)

                  cover <- factor(dr_erosion$preproc$xlevels$cover)
                  tillage <- factor(dr_erosion$preproc$xlevels$tillage)
                  Contour <- factor(dr_erosion$preproc$xlevels$Contour)

                  level_df <- expand_grid(cover, tillage, Contour)

                  df <- full_df %>%
                    select(-c(crop, tillage, cover, Contour)) %>% 
                    slice(rep(1:n(), each=nrow(level_df)))

                  df <- cbind(level_df, df)

                  pred_df <- df %>%
                    filter(cover == full_df$cover, tillage == full_df$tillage, Contour == full_df$Contour)

                  erosion <- round(predict(dr_erosion, pred_df),2)

                }} else if (full_df$crop == "ps") {{

                  ps_erosion <- readRDS(ps_erosion_file)

                  tillage <- factor(ps_erosion$preproc$xlevels$tillage)
                  Contour <- factor(ps_erosion$preproc$xlevels$Contour)

                  level_df <- expand_grid(tillage, Contour)

                  df <- full_df %>%
                    select(-c(crop, tillage, Contour)) %>% 
                    slice(rep(1:n(), each=nrow(level_df)))

                  df <- cbind(level_df, df)

                  pred_df <- df %>%
                    filter(tillage == full_df$tillage, Contour == full_df$Contour)
                  erosion <- round(predict(ps_erosion, pred_df),2)

                }} else if (full_df$crop == "pt") {{

                  pt_erosion <- readRDS(pt_erosion_file)
                  pt_erosion
                  density <- factor(pt_erosion$preproc$xlevels$density)
                  rotational <- factor(pt_erosion$preproc$xlevels$rotational)

                  level_df <- expand_grid(rotational, density)

                  df <- full_df %>%
                    select(-c(crop, density, rotational)) %>% 
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

                }} else if (full_df$crop == "dl") {{

                  dl_erosion <- readRDS(dl_erosion_file)

                  density <- factor(dl_erosion$preproc$xlevels$density)

                  df <- full_df %>%
                    select(-c(crop, density)) %>% 
                    slice(rep(1:n(), each=length(density)))

                  df <- cbind(density, df)

                  pred_df <- df %>%
                      filter(density == full_df$density)
                    erosion <- round(predict(dl_erosion, pred_df),2)

                }} 

                  """
        ))


        ero = r.get("erosion").to_numpy()
        print("ero", ero)
        print("done with erosion!!!!!!")

        r.assign("erosion", ero.flatten())

        print("ero", np.shape(ero.flatten()))
        print("slope", np.shape(slope))
        r.assign("slope_length", slope_length)
        r.assign("k", k)
        r.assign("total_depth", total_depth)
        r.assign("ls", ls)
        r.assign("slope", slope)
        # r.assign("elevation", elevation)
        r.assign("sand", sand)
        r.assign("silt", silt)
        r.assign("clay", clay)
        # r.assign("ksat", ksat)
        # r.assign("ph", ph)
        # r.assign("awc", awc)
        r.assign("total_depth", total_depth)
        r.assign("slope", slope)
        r.assign("slope_length", slope_length)
        r.assign("sand", sand)
        r.assign("silt", silt)
        r.assign("clay", clay)
        r.assign("k", k)
        # r.assign("om", om)
        r.assign("total_depth", total_depth)
        r.assign("ls", ls)

        r.assign("p_need", float(manure_results["avg"]["p_needs"]))
        r.assign("manure", float(manure_results["avg"]["man_p_per"]))
        r.assign("dm", float(manure_results["avg"]["grazed_dm"]))
        r.assign("p205", float(manure_results["avg"]["grazed_p205"]))
        # r.assign("manure", self.model_parameters["manure"])

        r.assign("fert", float(self.model_parameters["fert"]))
        r.assign("crop", self.model_parameters["crop"])
        r.assign("cover", self.model_parameters["crop_cover"])
        r.assign("contour", str(self.model_parameters["contour"]))
        r.assign("tillage", self.model_parameters["tillage"])
        r.assign("rotational", self.model_parameters["rotation"])
        r.assign("density", self.model_parameters["density"])
        r.assign("initialP", float(self.model_parameters["soil_p"]))
        r.assign("om", float(self.model_parameters["om"]))

        print(r(f"""

                    library(tidyverse)
                    library(tidymodels)
                    print(crop)
                    print(cover)
                    print(tillage)
                    print(contour)
                    print(rotational)
                    print(density)
                    print(initialP)
                    print(om)

                    # input/load data
                    user_input_df <- tibble(crop = c(crop), cover = c(cover), tillage = c(tillage), Contour = c(contour), 
                                            rotational = c(rotational), density = c(density), initialP = c(initialP), OM = c(om))
                    user_input_df

                    soil_df <- tibble(slope =  unlist(slope), slopelenusle.r = unlist(slope_length),  
                                      silt = unlist(silt), k = unlist(k), total.depth = unlist(total_depth), LSsurgo = unlist(ls),
                                      Erosion = unlist(erosion)) 
                    head(soil_df)

                    p_needs <- p_need
                    grazedManureDM_lbs <- dm
                    appliedDM_lbs <-  ((p_needs * (manure/100))/6) * 1000 * 8.4 * (6/100)
                    total_DM_lbs <- sum(grazedManureDM_lbs, appliedDM_lbs, na.rm = TRUE)
                    grazedP2O5 <- p205
                    P2O5_applied_lbs = (fert + manure)*(p_needs/100) 
                    totalP2O5_lbs = sum(grazedP2O5, P2O5_applied_lbs, na.rm = TRUE)

                    fert_df <- tibble(total_DM_lbs = total_DM_lbs, totalP2O5_lbs = totalP2O5_lbs)
                    #create data frame for models
                    crop_df <- user_input_df %>%
                      select(where(~!all(is.na(.)))) # remove NAs
                    full_df <- bind_cols(crop_df, fert_df, soil_df)



                    # cc ----------------------------------------------------------------------
                    # run models for different crops
                    if (full_df$crop == "cc") {{

                      cc_pi <- readRDS(cc_pi_file)

                      #create factor levels
                      tillage <- factor(c("fc", "fm", "nt", "sc", "sn", "su", "sv"))
                      cover <- factor(c("cc", "gcds", "gcis", "nc"))
                      Contour <- factor(c("0", "1"))
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

                      #make P Loss prediction
                      pi <- round(predict(cc_pi, pred_df),2)

                    }} else if (full_df$crop == "cg") {{

                      cg_pi <- readRDS(cg_pi_file)

                    # cg ----------------------------------------------------------------------

                      cover <- factor(c("cc", "gcds", "gcis", "nc"))
                      tillage <- factor(c("fc", "fm", "nt", "sc", "sn", "su", "sv"))
                      Contour <- factor(c("0", "1"))
                      level_df <- expand_grid(cover, tillage, Contour)

                      df <- full_df %>%
                        select(-c(crop, tillage, cover, Contour)) %>% 
                        slice(rep(1:n(), each=nrow(level_df)))

                      df <- cbind(level_df, df)

                      pred_df <- df %>%
                        filter(cover == full_df$cover, tillage == full_df$tillage, Contour == full_df$Contour)

                      pi <- round(predict(cg_pi, pred_df),2)

                    }} else if (full_df$crop == "cso") {{

                      cso_pi <- readRDS(cso_pi_file)
                    # cso ---------------------------------------------------------------------

                      cover <- factor(c("cc", "gcds", "gcis", "nc"))
                      tillage <- factor(c("fc", "fm", "nt", "sc", "sn", "su", "sv"))
                      Contour <- factor(c("0", "1"))
                      level_df <- expand_grid(cover, tillage, Contour)

                      df <- full_df %>%
                        select(-c(crop, tillage, cover, Contour)) %>% 
                        slice(rep(1:n(), each=nrow(level_df)))

                      df <- cbind(level_df, df)

                      pred_df <- df %>%
                        filter(cover == full_df$cover, tillage == full_df$tillage, Contour == full_df$Contour)

                      pi <- round(predict(cso_pi, pred_df),2)

                    }} else if (full_df$crop == "dr") {{

                      dr_pi <- readRDS(dr_pi_file)

                    # dr ----------------------------------------------------------------------

                      cover <- factor(c("cc", "gcds", "gcis", "nc"))
                      tillage <- factor(c("fc", "fm", "nt", "sc", "sn", "su", "sv"))
                      Contour <- factor(c("0", "1"))

                      level_df <- expand_grid(cover, tillage, Contour)

                      df <- full_df %>%
                        select(-c(crop, tillage, cover, Contour)) %>% 
                        slice(rep(1:n(), each=nrow(level_df)))

                      df <- cbind(level_df, df)

                      pred_df <- df %>%
                        filter(cover == full_df$cover, tillage == full_df$tillage, Contour == full_df$Contour)

                      pi <- round(predict(dr_pi, pred_df),2)

                    }} else if (full_df$crop == "ps") {{

                      ps_pi <- readRDS(ps_pi_file)

                    # ps ----------------------------------------------------------------------

                      tillage <- factor(c("fc", "fm", "nt", "sc", "sn", "su"))
                      Contour <- factor(c("0", "1"))

                      level_df <- expand_grid(tillage, Contour)

                      df <- full_df %>%
                        select(-c(crop, tillage, Contour)) %>% 
                        slice(rep(1:n(), each=nrow(level_df)))

                      df <- cbind(level_df, df)

                      pred_df <- df %>%
                        filter(tillage == full_df$tillage, Contour == full_df$Contour)

                      pi <- round(predict(ps_pi, pred_df),2)

                    }} else if (full_df$crop == "pt") {{

                      pt_pi <- readRDS(pt_pi_file)

                    # pt ----------------------------------------------------------------------

                      density <- factor(c("hi", "lo", "rt"))
                      rotational <- factor(c("cn", "rt"))

                      level_df <- expand_grid(rotational, density)

                      df <- full_df %>%
                        select(-c(crop, density, rotational)) %>% 
                        slice(rep(1:n(), each=nrow(level_df)))

                      df <- cbind(level_df, df) 

                      if(full_df$rotational == "rt"){{
                        pred_df <- df %>%
                          filter(rotational == full_df$rotational, density == "rt")
                      }} else{{
                        pred_df <- df %>%
                          filter(rotational == full_df$rotational,  density == full_df$density)
                      }}

                      pi <- round(predict(pt_pi, pred_df),3)

                    }} else if (full_df$crop == "dl") {{

                      dl_pi <- readRDS(dl_pi_file)

                    # dl ----------------------------------------------------------------------

                      density <- factor(c("hi", "lo"))

                      df <- full_df %>%
                        select(-c(crop, density)) %>% 
                        slice(rep(1:n(), each=length(density)))

                      df <- cbind(density, df)

                      pred_df <- df %>%
                        filter(density == full_df$density)

                      pi <- round(predict(dl_pi, pred_df),2)

                    }}




        """))


        ploss = r.get("pi").to_numpy()
        print(ploss)
        # with np.printoptions(threshold=np.inf):
        #     print("ploss ", ploss)

        ero = np.where(ero < 0.01, .01, ero)
        ploss = np.where(ploss < 0.01, .01, ploss)
        erosion.set_data(ero)
        pl.set_data(ploss)

        # _________YIELD NITRATE COMBO BEGINS!!!______________________________

        # initial storage for crop data
        print("Start Nitrate Combo")
        rot_yrs_crop = []
        rot_yrs_crop = getRotYers(crop_ro)[1]
        legume = self.model_parameters["legume"]
        legume_text = getLegumeTest(legume)

        animal_density = self.model_parameters["density"]
        animal_density_text = getAnimaleDensity(animal_density)
        print(rot_yrs_crop, legume_text, animal_density_text)
        cover_crop = self.model_parameters["crop_cover"]
        PctFertN = float(self.model_parameters["fert_n_perc"]) / 100
        PctManrN = float(self.model_parameters["manure_n_perc"]) / 100
        # Pneeds = self.model_parameters["p_need"]
        print(PctFertN, PctManrN)
        precip = get_region_precip(active_region)
        precN = 0.5 * precip * 0.226  ## precipitation N inputs in lb/ac
        dryN = precN  ## assume dry deposition is equal to precipitation, lb/ac

        drain_class_flattened = self.raster_inputs["drain_class"].flatten()

        getRotText_Value = getRotText(crop_ro, legume_text, animal_density_text)

        rotation_avg = OutputDataNode("Rotational Average", "Total dry matter yield (tons/ac/yr)", "Total dry matter production (tons/yr)","Total dry matter yield (tons/ac/yr)","Total dry matter production (tons/yr)")
        return_data.append(rotation_avg)
        flat_corn = self.raster_inputs["corn"].flatten()

        leached_N_Total = 0

        # [bushels/acre x 10] original units
        corn_yield_raw = flat_corn * 0
        # soy_yield_raw = flat_soy / 10
        om = float(self.model_parameters["om"])
        ero = ero.flatten()
        ero = np.where(drain_class_flattened != self.no_data, ero, 0)
        print("count of non nodata cells", np.count_nonzero(drain_class_flattened != self.no_data))
        cell_count = np.count_nonzero(drain_class_flattened != self.no_data)

        np.where(ploss > self.no_data, ploss, 0)
        print("ploss average", np.sum(ploss) /cell_count)

        erosN = np.sum(ero/ cell_count) * om * 2

        print("om", om)
        print("drain_class", drain_class_flattened)
        print("corn", flat_corn)
        print("ero", np.sum(ero/ cell_count))
        print("erosN", erosN)

        print("om", np.shape(om))
        print("drain_class", np.shape(drain_class_flattened))
        print("corn", np.shape(flat_corn))

        calculate_denitloss_vector = np.vectorize(self.calculate_denitloss)
        Calc_N_Leach_Vector = np.vectorize(self.Calc_N_Leach)
        Denitr_Value = np.where(drain_class_flattened != self.no_data,
                                calculate_denitloss_vector(om, drain_class_flattened), drain_class_flattened)
        print("denitloss", Denitr_Value)
        print("denitloss", getRotText_Value)
        print("manure_results", manure_results)
        NvarsRot = self.Nvars[self.Nvars['RotationAbbr'] == getRotText_Value]
        NvarsCover = NvarsRot[NvarsRot["cover"] == "na"]
        corn_yield = corn_yield_raw
        corn_yield_tonDMac = corn_yield_raw

        print(NvarsRot)
        print(NvarsCover)
        print(NvarsCover)

        # cont corn
        # corn_yield = corn_yield_raw
        # corn_yield_tonDMac = corn_yield * 56 * (1 - 0.155) / 2000
        # rotation_avg_tonDMac = corn_yield_tonDMac
        dry_lot_yield.set_data(corn_yield)
        rotation_avg_tonDMac = corn_yield_tonDMac
        yeild_crop_data = corn_yield_tonDMac
        fertN = PctFertN * float(manure_results["dl"]["n_rec"])
        manrN = PctManrN * float(manure_results["dl"]["n_man"])
        Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == getRotText_Value]])

        NfixPct = float(Nvars_Row["NfixPct"].values[0])
        NH3loss = float(Nvars_Row["NH3loss"].values[0])
        Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
        grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])

        leachN_Calced = np.where(drain_class_flattened != self.no_data,
                                 Calc_N_Leach_Vector(yeild_crop_data, fertN, manrN, NfixPct, NH3loss,
                                                     Nharv_content, grazed_manureN, Denitr_Value, precN, dryN,
                                                     erosN),
                                 0)
        leachN_avg = np.sum(leachN_Calced) / cell_count
        print("leaching for rotation", leachN_avg)
        # rotation avg is not less than zero
        if leachN_avg < 0:
            leachN_Calced = np.where(drain_class_flattened != self.no_data, 0, self.no_data)
        leached_N_Total = leached_N_Total + leachN_Calced

        nitrate.set_data(leached_N_Total)

        rotation_avg.set_data(rotation_avg_tonDMac)
        print("length of data")
        print(len(rotation_avg.data))
        print(len(nitrate.data))
        print("Yield and Nitrate finished")
        return return_data
