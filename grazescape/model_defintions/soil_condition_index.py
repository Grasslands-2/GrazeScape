from abc import ABC

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from grazescape.model_defintions.pyper_local import *
import numpy as np


class SoilIndex(ModelBase):
    def __init__(self, request, active_region, file_name=None):
        super().__init__(request, active_region, file_name)

    @ModelBase.log_start_end
    def run_model(self, manure_results, ero, placeholder):
        r = R(RCMD=self.r_file_path, use_pandas=True)
        sci_output = OutputDataNode("soil_index", "Soil Condition Index (lb/ac/yr)", "Soil Condition Index (lb/yr)",
                                    "Soil Condition Index (lb/ac/yr)", "Soil Condition Index (lb/yr)")

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
        ContCornTidyploss = "cc_sci_"
        cornGrainTidyploss = "cg_sci_"
        cornSoyOatTidyploss = "cso_sci_"
        dairyRotationTidyploss = "dr_sci_"
        pastureSeedingTidyploss = "ps_sci_"
        pastureTidyploss = "pt_sci_"
        dryLotTidyploss = "dl_sci_"
        regionRDS = self.active_region + '.rds'
        r.assign("cc_sci_file", os.path.join(self.model_file_path, ContCornTidyploss + regionRDS))
        r.assign("cg_sci_file", os.path.join(self.model_file_path, cornGrainTidyploss + regionRDS))
        r.assign("cso_sci_file", os.path.join(self.model_file_path, cornSoyOatTidyploss + regionRDS))
        r.assign("dr_sci_file", os.path.join(self.model_file_path, dairyRotationTidyploss + regionRDS))
        r.assign("ps_sci_file", os.path.join(self.model_file_path, pastureSeedingTidyploss + regionRDS))
        r.assign("pt_sci_file", os.path.join(self.model_file_path, pastureTidyploss + regionRDS))
        r.assign("dl_sci_file", os.path.join(self.model_file_path, dryLotTidyploss + regionRDS))
        r(f"""

            library(tidyverse)
            library(tidymodels)


            # load erosion models
            # cc_erosion <- readRDS("../GrazeScapeModelFiles/southWestWI/erosion/cc_erosion_southWestWI.rds")
            # cg_erosion <- readRDS("../GrazeScapeModelFiles/southWestWI/erosion/cg_erosion_southWestWI.rds")
            # cso_erosion <- readRDS("tidyModels/cornSoyOatErosion.rds")
            # dr_erosion <- readRDS("tidyModels/dairyRotationErosion.rds")
            # ps_erosion <- readRDS("tidyModels/pastureSeedingErosion.rds")
            # pt_erosion <- readRDS("tidyModels/pastureErosion.rds")
            # dl_erosion <- readRDS("tidyModels/dryLotErosionErosion.rds")

            # load SCI models
             #cc_sci <- readRDS("southWestWI/sci/cc_sci_southWestWI.rds")
             #cg_sci <- readRDS("southWestWI/sci/cg_sci_southWestWI.rds")
             #cso_sci <- readRDS("southWestWI/sci/cso_sci_southWestWI.rds")
             #dr_sci <- readRDS("southWestWI/sci/dr_sci_southWestWI.rds")
             #ps_sci <- readRDS("southWestWI/sci/ps_sci_southWestWI.rds")
             #pt_sci <- readRDS("southWestWI/sci/pt_sci_southWestWI.rds")
             #dl_sci <- readRDS("southWestWI/sci/dl_sci_southWestWI.rds")

            # test cc------------------
            # crop = "cc"
            # cover = "nc"
            # tillage = "nt"
            # contour = 0
            # rotational = NA
            # density = NA


            # test pt-----------------------
             # crop = "pt"
             # cover = NA
             # tillage = NA
             # contour = NA
             # rotational = "rt"
             # density = "rt"

            # input/load data
            user_input_df <- tibble(crop = c(crop), cover = c(cover), tillage = c(tillage), Contour = c(contour), 
                                    rotational = c(rotational), density = c(density))

             # test soil vars
            # sand = 10
            # silt = 60
            # clay = 30
            # erosion = 2

            soil_df <- tibble(sand = unlist(sand), silt = unlist(silt), clay = unlist(clay), Erosion = unlist(erosion)) 

            # test fertilizer vars
             # p_need = 60
             # dm = 0
             # manure = 0 #manurePpercent

            p_needs <- p_need
            grazedManureDM_lbs <- dm
            appliedDM_lbs <-  ((p_needs * (manure/100))/6) * 1000 * 8.4 * (6/100)
            total_DM_lbs <- sum(grazedManureDM_lbs, appliedDM_lbs, na.rm = TRUE)
            fert_df <- tibble(total_DM_lbs = total_DM_lbs)
            #create data frame for models
            crop_df <- user_input_df %>%
              select(where(~!all(is.na(.)))) # remove NAs
            full_df <- bind_cols(crop_df, fert_df, soil_df)



            # cc ----------------------------------------------------------------------
            # run models for different crops
            if (full_df$crop == "cc") {{

              cc_sci <- readRDS(cc_sci_file)

              #create factor levels
              cover <- factor(cc_sci$preproc$xlevels$cover)
              tillage <- factor(cc_sci$preproc$xlevels$tillage)
              Contour <- factor(cc_sci$preproc$xlevels$Contour)
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

              #make SCI prediction
              sci <- round(predict(cc_sci, pred_df),2)

            }} else if (full_df$crop == "cg") {{

              cg_sci <- readRDS(cg_sci_file)

              # cg ----------------------------------------------------------------------

              cover <- factor(cg_sci$preproc$xlevels$cover)
              tillage <- factor(cg_sci$preproc$xlevels$tillage)
              Contour <- factor(cg_sci$preproc$xlevels$Contour)
              level_df <- expand_grid(cover, tillage, Contour)

              df <- full_df %>%
                select(-c(crop, tillage, cover, Contour)) %>% 
                slice(rep(1:n(), each=nrow(level_df)))

              df <- cbind(level_df, df)

              pred_df <- df %>%
                filter(cover == full_df$cover, tillage == full_df$tillage, Contour == full_df$Contour)

              sci <- round(predict(cg_sci, pred_df),2)

            }} else if (full_df$crop == "cso") {{

              cso_sci <- readRDS(cso_sci_file)
              # cso ---------------------------------------------------------------------

              cover <- factor(cso_sci$preproc$xlevels$cover)
              tillage <- factor(cso_sci$preproc$xlevels$tillage)
              Contour <- factor(cso_sci$preproc$xlevels$Contour)
              level_df <- expand_grid(cover, tillage, Contour)

              df <- full_df %>%
                select(-c(crop, tillage, cover, Contour)) %>% 
                slice(rep(1:n(), each=nrow(level_df)))

              df <- cbind(level_df, df)

              pred_df <- df %>%
                filter(cover == full_df$cover, tillage == full_df$tillage, Contour == full_df$Contour)

              sci <- round(predict(cso_sci, pred_df),2)

            }} else if (full_df$crop == "dr") {{

              dr_sci <- readRDS(dr_sci_file)

              # dr ----------------------------------------------------------------------

              cover <- factor(dr_sci$preproc$xlevels$cover)
              tillage <- factor(dr_sci$preproc$xlevels$tillage)
              Contour <- factor(dr_sci$preproc$xlevels$Contour)

              level_df <- expand_grid(cover, tillage, Contour)

              df <- full_df %>%
                select(-c(crop, tillage, cover, Contour)) %>% 
                slice(rep(1:n(), each=nrow(level_df)))

              df <- cbind(level_df, df)

              pred_df <- df %>%
                filter(cover == full_df$cover, tillage == full_df$tillage, Contour == full_df$Contour)

              sci <- round(predict(dr_sci, pred_df),2)

            }} else if (full_df$crop == "ps") {{

              ps_sci <- readRDS(ps_sci_file)

              # ps ----------------------------------------------------------------------

              tillage <- factor(ps_sci$preproc$xlevels$tillage)
              Contour <- factor(ps_sci$preproc$xlevels$Contour)

              level_df <- expand_grid(tillage, Contour)

              df <- full_df %>%
                select(-c(crop, tillage, Contour)) %>% 
                slice(rep(1:n(), each=nrow(level_df)))

              df <- cbind(level_df, df)

              pred_df <- df %>%
                filter(tillage == full_df$tillage, Contour == full_df$Contour)

              sci <- round(predict(ps_sci, pred_df),2)

            }} else if (full_df$crop == "pt") {{

              pt_sci <- readRDS(pt_sci_file)

              # pt ----------------------------------------------------------------------

              density <- factor(pt_sci$preproc$xlevels$density)
              rotational <- factor(pt_sci$preproc$xlevels$rotational)

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

              sci <- round(predict(pt_sci, pred_df),3)

            }} else if (full_df$crop == "dl") {{

              dl_sci <- readRDS(dl_sci_file)

              # dl ----------------------------------------------------------------------

              density <- factor(dl_sci$preproc$xlevels$density)

              df <- full_df %>%
                select(-c(crop, density)) %>% 
                slice(rep(1:n(), each=length(density)))

              df <- cbind(density, df)

              pred_df <- df %>%
                filter(density == full_df$density)

              sci <- round(predict(dl_sci, pred_df),2)

            }} 

            pred_df_na_omit <- na_if(pred_df, -9999)
                    print(pred_df_na_omit)
                    print(summary(pred_df_na_omit))



                """)
        sci = r.get("sci").to_numpy()
        ploss = np.where(sci < 0.01, .01, sci)
        sci_output.set_data(ploss.flatten())
        del r

        return [sci_output]

