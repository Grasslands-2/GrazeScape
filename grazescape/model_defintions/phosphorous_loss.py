from abc import ABC

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import *
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Polygon


class PhosphorousLoss(ModelBase):
    def __init__(self, request, active_region, file_name=None):
        super().__init__(request, active_region, file_name)

    def run_model(self, manure_results, ero, placeholder):
        r = R(RCMD=self.r_file_path, use_pandas=True)
        pl = OutputDataNode("ploss", "P runoff (lb/ac/yr)", "P runoff (lb/yr)","Phosphorus runoff (lb/ac/yr)","Phosphorus runoff (lb/yr)")

        slope = self.raster_inputs["slope"].flatten()
        slope_length = self.raster_inputs["slope_length"].flatten()
        k = self.raster_inputs["k"].flatten()
        ls = self.raster_inputs["ls"].flatten()
        elevation = self.raster_inputs["elevation"].flatten()
        sand = self.raster_inputs["sand"].flatten()
        silt = self.raster_inputs["silt"].flatten()
        clay = self.raster_inputs["clay"].flatten()
        ksat = self.raster_inputs["ksat"].flatten()
        ph = self.raster_inputs["ph"].flatten()
        awc = self.raster_inputs["awc"].flatten()
        total_depth = self.raster_inputs["total_depth"].flatten()

        r.assign("slope_length", slope_length)
        r.assign("k", k)
        r.assign("total_depth", total_depth)
        r.assign("ls", ls)
        r.assign("slope", slope)
        r.assign("elevation", elevation)
        r.assign("sand", sand)
        r.assign("silt", silt)
        r.assign("clay", clay)
        r.assign("ksat", ksat)
        r.assign("ph", ph)
        r.assign("awc", awc)
        r.assign("total_depth", total_depth)
        r.assign("slope", slope)
        r.assign("slope_length", slope_length)
        r.assign("sand", sand)
        r.assign("silt", silt)
        r.assign("clay", clay)
        r.assign("k", k)
        r.assign("total_depth", total_depth)
        r.assign("ls", ls)

        r.assign("p_need", float(manure_results["avg"]["p_needs"]))
        r.assign("manure", float(manure_results["avg"]["man_p_per"]))
        r.assign("dm", float(manure_results["avg"]["grazed_dm"]))
        r.assign("p205", float(manure_results["avg"]["grazed_p205"]))

        r.assign("fert", float(self.model_parameters["fert"]))
        r.assign("crop", self.model_parameters["crop"])
        r.assign("cover", self.model_parameters["crop_cover"])
        r.assign("contour", str(self.model_parameters["contour"]))
        r.assign("tillage", self.model_parameters["tillage"])
        r.assign("rotational", self.model_parameters["rotation"])
        r.assign("density", self.model_parameters["density"])
        r.assign("initialP", float(self.model_parameters["soil_p"]))
        r.assign("om", float(self.model_parameters["om"]))

        r.assign("erosion", ero.data)
        ContCornTidyploss = "cc_ploss_"
        cornGrainTidyploss = "cg_ploss_"
        cornSoyOatTidyploss = "cso_ploss_"
        dairyRotationTidyploss = "dr_ploss_"
        pastureSeedingTidyploss = "ps_ploss_"
        pastureTidyploss = "pt_ploss_"
        dryLotTidyploss = "dl_ploss_"
        regionRDS = self.active_region + '.rds'
        r.assign("cc_pi_file", os.path.join(self.model_file_path, ContCornTidyploss + regionRDS))
        r.assign("cg_pi_file", os.path.join(self.model_file_path, cornGrainTidyploss + regionRDS))
        r.assign("cso_pi_file", os.path.join(self.model_file_path, cornSoyOatTidyploss + regionRDS))
        r.assign("dr_pi_file", os.path.join(self.model_file_path, dairyRotationTidyploss + regionRDS))
        r.assign("ps_pi_file", os.path.join(self.model_file_path, pastureSeedingTidyploss + regionRDS))
        r.assign("pt_pi_file", os.path.join(self.model_file_path, pastureTidyploss + regionRDS))
        r.assign("dl_pi_file", os.path.join(self.model_file_path, dryLotTidyploss + regionRDS))
        r(f"""

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




                """)

        ploss = r.get("pi").to_numpy()
        ploss = ploss.flatten()
        print("ploss", ploss)
        ploss = np.where(ploss < 0.01, .01, ploss)
        pl.set_data(ploss)
        return [pl]

