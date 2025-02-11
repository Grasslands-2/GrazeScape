from abc import ABC

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from grazescape.model_defintions.pyper_local import R
from django.conf import settings
import os
import numpy as np
import math


class Runoff(ModelBase):
    def __init__(self, request, active_region, file_name=None):
        super().__init__(request, active_region, file_name)

    def get_hyro_letter(self, group_num):
        # see also raster_data.py in create_no_data_array
        hyro_dic = {
            1: 'A',
            1.5: 'A/D',
            2: 'B',
            2.5: 'B/D',
            3: "C",
            3.5: 'C/D',
            4: 'D',
            -9999: 'A'  # no data
        }
        return hyro_dic[group_num]

    def run_model(self, manure_results):
        # path to R instance
        r = R(RCMD=self.r_file_path, use_pandas=True)
        slope = self.raster_inputs["slope"].flatten()
        slope_length = self.raster_inputs["slope_length"].flatten()
        sand = self.raster_inputs["sand"].flatten()
        silt = self.raster_inputs["silt"].flatten()
        clay = self.raster_inputs["clay"].flatten()
        k = self.raster_inputs["k"].flatten()
        om = self.raster_inputs["om"].flatten()
        total_depth = self.raster_inputs["total_depth"].flatten()
        ls = self.raster_inputs["ls"].flatten()
        hydgrp = self.raster_inputs["hydgrp"].flatten()
        hydrp_letter = []
        for index, grp in enumerate(hydgrp):
            hydrp_letter.append(self.get_hyro_letter(grp))
        hydrp_letter = np.array(hydrp_letter)

        ContCornErosion = "cc_erosion_"
        cornGrainErosion = "cg_erosion_"
        cornSoyOatErosion = "cso_erosion_"
        dairyRotationErosion = "dr_erosion_"
        pastureSeedingErosion = "ps_erosion_"
        pastureErosion = "pt_erosion_"
        dryLotErosion = "dl_erosion_"

        ContCornTidyffcn = "cc_ffcn_"
        cornGrainTidyffcn = "cg_ffcn_"
        cornSoyOatTidyffcn = "cso_ffcn_"
        dairyRotationTidyffcn = "dr_ffcn_"
        pastureSeedingTidyffcn = "ps_ffcn_"
        pastureTidyffcn = "pt_ffcn_"
        dryLotTidyffcn = "dl_ffcn_"

        regionRDS = self.active_region + '.rds'

        r.assign("slope", slope)
        r.assign("slope_length", slope_length)
        r.assign("sand", sand)
        r.assign("silt", silt)
        r.assign("clay", clay)
        r.assign("k", k)
        r.assign("total_depth", total_depth)
        r.assign("ls", ls)
        r.assign("hydgrp", hydrp_letter)

        r.assign("p_need", float(manure_results["avg"]["p_needs"]))
        r.assign("manure", float(manure_results["avg"]["man_p_per"]))
        r.assign("dm", float(manure_results["avg"]["grazed_dm"]))
        r.assign("p205", float(manure_results["avg"]["grazed_p205"]))

        # r.assign("manure", self.model_parameters["manure"])
        r.assign("fert", float(self.model_parameters["fert"]))
        r.assign("crop", self.model_parameters["crop"])
        r.assign("cover", self.model_parameters["crop_cover"])
        r.assign("contour", self.model_parameters["contour"])
        r.assign("tillage", self.model_parameters["tillage"])
        r.assign("rotational", self.model_parameters["rotation"])
        r.assign("density", self.model_parameters["density"])
        r.assign("initialP", float(self.model_parameters["soil_p"]))
        r.assign("om", float(self.model_parameters["om"]))

        # r.assign("cc_erosion_file", os.path.join(self.model_file_path, ContCornErosion + regionRDS))
        # r.assign("cg_erosion_file", os.path.join(self.model_file_path, cornGrainErosion + regionRDS))
        # r.assign("cso_erosion_file", os.path.join(self.model_file_path, cornSoyOatErosion + regionRDS))
        # r.assign("dr_erosion_file", os.path.join(self.model_file_path, dairyRotationErosion + regionRDS))
        # r.assign("ps_erosion_file", os.path.join(self.model_file_path, pastureSeedingErosion + regionRDS))
        # r.assign("pt_erosion_file", os.path.join(self.model_file_path, pastureErosion + regionRDS))
        # r.assign("dl_erosion_file", os.path.join(self.model_file_path, dryLotErosion + regionRDS))

        r.assign("cc_cn_file", os.path.join(self.model_file_path, ContCornTidyffcn + regionRDS))
        r.assign("cg_cn_file", os.path.join(self.model_file_path, cornGrainTidyffcn + regionRDS))
        r.assign("cso_cn_file", os.path.join(self.model_file_path, cornSoyOatTidyffcn + regionRDS))
        r.assign("dr_cn_file", os.path.join(self.model_file_path, dairyRotationTidyffcn + regionRDS))
        r.assign("ps_cn_file", os.path.join(self.model_file_path, pastureSeedingTidyffcn + regionRDS))
        r.assign("pt_cn_file", os.path.join(self.model_file_path, pastureTidyffcn + regionRDS))
        r.assign("dl_cn_file", os.path.join(self.model_file_path, dryLotTidyffcn + regionRDS))
        print(r(f"""
            if (!require(randomForest)) install.packages("randomForest", repos = "http://cran.us.r-project.org")
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
        user_input_df <- tibble(crop = c(crop), cover = c(cover), tillage = c(tillage), 
        rotational = c(rotational), density = c(density),initialP = c(initialP), OM = c(om))
        soil_df <- tibble(hydgrp = unlist(hydgrp), slope =  unlist(slope), slopelenusle.r = unlist(slope_length), sand = unlist(sand), silt = unlist(silt), clay = unlist(clay), k = unlist(k),
                           total.depth = unlist(total_depth), LSsurgo = unlist(ls))
        p_needs <- p_need
        grazedManureDM_lbs <- dm
        appliedDM_lbs <-  ((p_needs * (manure/100))/6) * 1000 * 8.4 * (6/100)
        total_DM_lbs <- sum(grazedManureDM_lbs, appliedDM_lbs, na.rm = TRUE)
        # totalP2O5 = grazedP2O5 + P2O5_applied_lbs
        grazedP2O5 <- p205
        P2O5_applied_lbs = (fert + manure)*(p_needs/100) 
        totalP2O5_lbs = sum(grazedP2O5, P2O5_applied_lbs, na.rm = TRUE)

        fert_df <- tibble(total_DM_lbs = total_DM_lbs, totalP2O5_lbs = totalP2O5_lbs)

        #create data frame for models
        crop_df <- user_input_df %>%
          select(where(~!all(is.na(.)))) # remove NAs
        full_df <- bind_cols(crop_df, fert_df, soil_df)
        ##TODO the current output for Erosion and PI are tibbles (data frames) so we need to extract the data point from the tibble 
        # run models for different crops
        
        if (full_df$crop[1] == "cc") {{
          cc_cn <- readRDS(cc_cn_file)

          #create factor levels
          tillage <- factor(cc_cn$preproc$xlevels$tillage)
          cover <- factor(cc_cn$preproc$xlevels$cover)
          level_df <- expand_grid(cover, tillage)

          #remove factor levels from full_df and repeat row as many times as there are level combinations
          df <- full_df %>%
            select(-c(crop, tillage, cover)) %>% 
            slice(rep(1:n(), each=nrow(level_df)))

          #bind all level combinations with df
          df <- cbind(level_df, df)

          #subset all combinations data set to just the user input

          pred_df <- df %>%
            filter(cover == full_df$cover, tillage == full_df$tillage)
          curve_num <- round(predict(cc_cn, pred_df),2)


        }} else if (full_df$crop[1] == "cg") {{
        cg_cn <- readRDS(cg_cn_file)

          cover <- factor(cg_cn$preproc$xlevels$cover)
          tillage <- factor(cg_cn$preproc$xlevels$tillage)
          level_df <- expand_grid(cover, tillage)

          df <- full_df %>%
          select(c(total_DM_lbs:LSsurgo)) %>% 
          slice(rep(1:n(), each=nrow(level_df)))

          df <- cbind(level_df, df)

          pred_df <- df %>%
            filter(cover == full_df$cover, tillage == full_df$tillage)

          curve_num <- round(predict(cg_cn, pred_df),2)


        }} else if (full_df$crop[1] == "cso") {{
        cso_cn <- readRDS(cso_cn_file)

          cover <- factor(cso_cn$preproc$xlevels$cover)
          tillage <- factor(cso_cn$preproc$xlevels$tillage)

          level_df <- expand_grid(cover, tillage)

          df <- full_df %>%
          select(c(total_DM_lbs:LSsurgo)) %>% 
          slice(rep(1:n(), each=nrow(level_df)))

          df <- cbind(level_df, df)

          pred_df <- df %>%
            filter(cover == full_df$cover, tillage == full_df$tillage)

          curve_num <- round(predict(cso_cn, pred_df),2)


        }} else if (full_df$crop[1] == "dr") {{
          dr_cn <- readRDS(dr_cn_file)

          cover <- factor(dr_cn$preproc$xlevels$cover)
          tillage <- factor(dr_cn$preproc$xlevels$tillage)

          level_df <- expand_grid(cover, tillage)

         df <- full_df %>%
          select(c(total_DM_lbs:LSsurgo)) %>% 
          slice(rep(1:n(), each=nrow(level_df)))

          df <- cbind(level_df, df)

          pred_df <- df %>%
            filter(cover == full_df$cover, tillage == full_df$tillage)

          curve_num <- round(predict(dr_cn, pred_df),2)


        }} else if (full_df$crop[1] == "ps") {{
        ps_cn <- readRDS(ps_cn_file)


          tillage <- factor(ps_cn$preproc$xlevels$tillage)

          level_df <- expand_grid(tillage)

          df <- full_df %>%
          select(c(initialP:LSsurgo)) %>% 
          slice(rep(1:n(), each=nrow(level_df)))

          df <- cbind(level_df, df)

          pred_df <- df %>%
            filter(tillage == full_df$tillage)

          curve_num <- round(predict(ps_cn, pred_df),2)


        }} else if (full_df$crop[1] == "pt") {{
        pt_cn <- readRDS(pt_cn_file)

          density <- factor(pt_cn$preproc$xlevels$density)
          rotational <- factor(pt_cn$preproc$xlevels$rotational)

          level_df <- expand_grid(rotational, density)

          df <- full_df %>%
          select(c(initialP:LSsurgo)) %>% 
          slice(rep(1:n(), each=nrow(level_df)))

          df <- cbind(level_df, df) 

          if(full_df$rotational[1] == "rt"){{
            pred_df <- df %>%
              filter(rotational == full_df$rotational, density == "rt")
          }} else{{
            pred_df <- df %>%
              filter(rotational == full_df$rotational,  density ==full_df$density)
          }}

          curve_num <- round(predict(pt_cn, pred_df),3)


        }} else if (full_df$crop[1] == "dl") {{
        dl_cn <- readRDS(dl_cn_file)

          density <- factor(dl_cn$preproc$xlevels$density)
            level_df <- expand_grid(density)
          df <- full_df %>%
              select(c(initialP:LSsurgo)) %>% 
              slice(rep(1:n(), each=nrow(level_df)))

          df <- cbind(density, df)

          pred_df <- df %>%
            filter(density == full_df$density)

          curve_num <- round(predict(dl_cn, pred_df),2)


        }}

        """))

        pred = r.get("curve_num").to_numpy()
        rain_fall = OutputDataNode("Runoff", "Runoff (in)", "Runoff (in)","Storm event runoff (inches)","Storm event runoff (inches)")
        curve = OutputDataNode("Curve Number", "Curve Number", "Curve Number","Composite curve number","Composite curve number")
        curve.set_data(pred.flatten())
        cn_adj = {"A": 0, "B": 0, "C": 0, "D": 0}
        crop = self.model_parameters["crop"]
        cover = self.model_parameters["crop_cover"]
        tillage = self.model_parameters["tillage"]

        if self.model_parameters["contour"] == 1:
            cn_adj = self.get_cn_ad(crop + "_" + cover + "" + tillage)
        for index, ffCN1 in enumerate(pred):
            try:
                ffCN1 = ffCN1[0] + cn_adj[hydrp_letter[index][0]]
            except KeyError:
                print("Invalid key: ", hydrp_letter[index][0])
                print(cn_adj)
                raise

            CNMC3 = min(ffCN1 * math.exp(0.00673 * (100 - ffCN1)), 99)
            if slope[index] > 0.05:
                CNfinal = min((CNMC3 - ffCN1) / 3 * (
                        1 - 2 * math.exp(-13.86 * slope[index])) + ffCN1, 99)
            else:
                CNfinal = ffCN1
            stor = 1000 / CNfinal - 10
            rain = [.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]
            event = []
            for i in rain:
                if i > 0.2 * stor:
                    runoff = math.pow(i - 0.2 * stor, 2) / (i + 0.8 * stor)
                else:
                    runoff = 0
                event.append(round(runoff, 2))
                # CNout(i, 2) = runoff;
            rain_fall.set_data(event)
        del r
        return [curve, rain_fall]

    def get_cn_ad(self, id):
        adj_dic = {"cc_cc_nt": {"A": 0, "B": 0, "C": -1, "D": -1},
                   "cc_cc_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cc_cc_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cc_nc_fc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cc_nc_fm": {"A": -2, "B": -3, "C": -3, "D": -3},
                   "cc_nc_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cc_nc_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cc_nc_sv": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cc_nc_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cc_gcis_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cc_gcis_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cc_gcis_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cc_gcds_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cc_gcds_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cc_gcds_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cg_cc_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cg_cc_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cg_cc_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cg_nc_fc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cg_nc_fm": {"A": -2, "B": -3, "C": -3, "D": -3},
                   "cg_nc_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cg_nc_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cg_nc_sv": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cg_nc_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cg_gcis_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cg_gcis_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cg_gcis_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cg_gcds_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cg_gcds_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cg_gcds_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cso_cc_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cso_cc_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cso_cc_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cso_nc_fc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cso_nc_fm": {"A": -2, "B": -3, "C": -3, "D": -3},
                   "cso_nc_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cso_nc_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cso_nc_sv": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cso_nc_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cso_gcis_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cso_gcis_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cso_gcis_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cso_gcds_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cso_gcds_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "cso_gcds_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_cc_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_cc_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_cc_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_nc_fc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_nc_fm": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_nc_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_nc_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_nc_sv": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_nc_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_gcis_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_gcis_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_gcis_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_gcds_nt": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_gcds_sc": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "dr_gcds_su": {"A": 0, "B": -1, "C": -1, "D": -1},
                   "ps_nc_fc": {"A": 0, "B": 0, "C": 0, "D": 0},
                   "ps_nc_fm": {"A": 0, "B": 0, "C": 0, "D": 0},
                   "ps_nc_nt": {"A": 0, "B": 0, "C": 0, "D": 0},
                   "ps_nc_sc": {"A": 0, "B": 0, "C": 0, "D": 0},
                   "ps_nc_sm": {"A": 0, "B": 0, "C": 0, "D": 0},
                   "ps_nc_su": {"A": 0, "B": 0, "C": 0, "D": 0},
                   "pt_cn_hi": {"A": 0, "B": 0, "C": 0, "D": 0},
                   "pt_cn_lw": {"A": 0, "B": 0, "C": 0, "D": 0},
                   "pt_rt_rt": {"A": 0, "B": 0, "C": 0, "D": 0},
                   "dl_lo": {"A": 0, "B": 0, "C": 0, "D": 0},
                   "dl_hi": {"A": 0, "B": 0, "C": 0, "D": 0},
                   }
        return adj_dic(id)
