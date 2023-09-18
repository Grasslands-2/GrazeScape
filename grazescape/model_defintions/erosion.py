from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import *
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Polygon


class Erosion(ModelBase):
    def __init__(self, request, active_region, file_name=None):
        super().__init__(request, active_region, file_name)

    @ModelBase.log_start_end
    def run_model(self, manure_results):
        r = R(RCMD=self.r_file_path, use_pandas=True)
        erosion = OutputDataNode("ero", "Soil loss (tons/ac/yr)", "Soil loss (tons/yr)", "Soil loss (tons/ac/yr)",
                                 "Soil loss (tons/yr)")

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

        regionRDS = self.active_region + '.rds'
        ContCornErosion = "cc_erosion_"
        cornGrainErosion = "cg_erosion_"
        cornSoyOatErosion = "cso_erosion_"
        dairyRotationErosion = "dr_erosion_"
        pastureSeedingErosion = "ps_erosion_"
        pastureErosion = "pt_erosion_"
        dryLotErosion = "dl_erosion_"
        r.assign("cc_erosion_file", os.path.join(self.model_file_path, ContCornErosion + regionRDS))
        r.assign("cg_erosion_file", os.path.join(self.model_file_path, cornGrainErosion + regionRDS))
        r.assign("cso_erosion_file", os.path.join(self.model_file_path, cornSoyOatErosion + regionRDS))
        r.assign("dr_erosion_file", os.path.join(self.model_file_path, dairyRotationErosion + regionRDS))
        r.assign("ps_erosion_file", os.path.join(self.model_file_path, pastureSeedingErosion + regionRDS))
        r.assign("pt_erosion_file", os.path.join(self.model_file_path, pastureErosion + regionRDS))
        r.assign("dl_erosion_file", os.path.join(self.model_file_path, dryLotErosion + regionRDS))


        r(f"""
            #if (!require(randomForest)) install.packages("randomForest", repos = "http://cran.us.r-project.org")
            #if (!require(tidymodels)) install.packages("tidymodels", repos = "http://cran.us.r-project.org")
            #if (!require(tidyverse)) install.packages("tidyverse", repos = "http://cran.us.r-project.org")
            library(tidyverse)
            library(tidymodels)
            library(parallel)

            library(randomForest)
            # load erosion models

            # Define the function to be parallelized




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
              # input_model = dr_erosion
              #  predict_parallel <- function(data) {{
              #     return(predict(input_model, data))
              #   }}
              #clusterExport(cl, c("predict_parallel","input_model"), envir=environment())
              #erosion <- parLapply(cl,pred_df,  predict_parallel(pred_df,input_model))
            # clusterExport(cl, "input_model")

              #erosion <- parLapply(cl, pred_df, predict, dr_erosion)



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
                      pred_df_na_omit <- na_if(pred_df, -9999)
                    print(pred_df_na_omit)
                    print(summary(pred_df_na_omit))
              """
                )
        ero = r.get("erosion").to_numpy()
        ero = ero.flatten()
        # ero = np.where(ero < 0.01, .01, ero)
        erosion.set_data(ero)
        return [erosion]
