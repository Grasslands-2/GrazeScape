from abc import ABC

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import R
from django.conf import settings
import os
import numpy as np


class Runoff(ModelBase):
    def __init__(self, request, file_name=None):
        super().__init__(request, file_name)
    def get_hyro_letter(self, group_num):
        hyro_dic = {
            1:"C",
            2:'B',
            3:'D',
            4:'A',
            5:'C/D',
            6:'A', #no data
            7:'A/D',
            8:'B/D',
            -9999: 'A' # no data
        }
        return hyro_dic[group_num]


    def run_model(self):
        # path to R instance
        r = R(RCMD=self.r_file_path, use_pandas=True)

        slope = self.raster_inputs["slope_data"].flatten()
        slope_length = self.raster_inputs["slope_length"].flatten()
        sand = self.raster_inputs["sand"].flatten()
        silt = self.raster_inputs["silt"].flatten()
        clay = self.raster_inputs["clay"].flatten()
        k = self.raster_inputs["k"].flatten()
        om = self.raster_inputs["om"].flatten()
        total_depth = self.raster_inputs["total_depth"].flatten()
        ls = self.raster_inputs["ls"].flatten()
        hydgrp = self.raster_inputs["hydgrp"].flatten()
        print("hydro group!!!!!!!!!!!!!!!!!!1")
        print(hydgrp)
        hydrp_letter = []
        for index, grp in enumerate(hydgrp):
            hydrp_letter.append(self.get_hyro_letter(grp))
        print(hydrp_letter)
        hydrp_letter = np.array(hydrp_letter)
        r.assign("slope", slope)
        r.assign("slope_length", slope_length)
        r.assign("sand", sand)
        r.assign("silt", silt)
        r.assign("clay", clay)
        r.assign("k", k)
        r.assign("om", om)
        r.assign("total_depth", total_depth)
        r.assign("ls", ls)
        r.assign("hydgrp", hydrp_letter)
        # r.assign("p_need", 50)
        # r.assign("dm", 0)
        # r.assign("p205", 0)
        # r.assign("manure", 10)
        # r.assign("fert", 5)
        # r.assign("crop", "cc")
        # r.assign("cover", "cc")
        # r.assign("contour", "0")
        # r.assign("tillage", "fc")
        # r.assign("rotational", "NA")
        # r.assign("density", "NA")
        # r.assign("initialP", 35)

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

        r.assign("cc_cn_file",
                 os.path.join(self.model_file_path, "ContCornFFCN.rds"))
        r.assign("cg_cn_file",
                 os.path.join(self.model_file_path, "CornGrainFFCN.rds"))
        r.assign("cso_cn_file",
                 os.path.join(self.model_file_path, "CornSoyOatFFCN.rds"))
        r.assign("dr_cn_file", os.path.join(self.model_file_path,
                                            "drFFCN.rds"))
        r.assign("ps_cn_file", os.path.join(self.model_file_path,
                                            "psFFCN.rds"))
        r.assign("pt_cn_file",
                 os.path.join(self.model_file_path, "ptFFCN.rds"))
        r.assign("dl_cn_file", os.path.join(self.model_file_path,
                                            "dlFFCN.rds"))
        print(r(f"""
            #if (!require(randomForest)) install.packages("randomForest", repos = "http://cran.us.r-project.org")
        #if (!require(tidymodels)) install.packages("tidymodels", repos = "http://cran.us.r-project.org")
        #if (!require(tidyverse)) install.packages("tidyverse", repos = "http://cran.us.r-project.org")
        library(tidyverse)
        library(tidymodels)
        library(randomForest)


        print("loading  models")
        # load erosion models
        # load PI models
       

        # crop = cc, cso ...
        # cover = cc, nc, cgis...
        # tillage = nt, su ... 
        # countour = 0,1
        # rotational = cn, rt 
        # density = hi or lo
        print('Getting user input!!!!!!!!!!!!!!!!!!!!!!!')
        user_input_df <- tibble(crop = c(crop), cover = c(cover), tillage = c(tillage), Contour = c(contour), 
        rotational = c(rotational), density = c(density),initialP = c(initialP))
        print(user_input_df)
        soil_df <- tibble(hydgrp = unlist(hydgrp), slope =  unlist(slope), slopelenusle.r = unlist(slope_length), sand = unlist(sand), silt = unlist(silt), clay = unlist(clay), k = unlist(k),
                           OM = unlist(om), total.depth = unlist(total_depth), LSsurgo = unlist(ls))
        print(soil_df)
        print("getting p needs")
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
        print(full_df)
        print("comparing crop name")
        ##TODO the current output for Erosion and PI are tibbles (data frames) so we need to extract the data point from the tibble 
        # run models for different crops
        
        if (full_df$crop == "cc") {{
            cc_erosion <- readRDS(cc_cn_file);

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
          print('filtering data')
          print(full_df$cover)
          print(full_df$tillage)
          print(full_df$Contour)
          pred_df <- df %>%
            filter(cover == full_df$cover, tillage == full_df$tillage, Contour == full_df$Contour)
          print('done filtering')
          #make erosion prediction
          curve_num <- round(predict(cc_erosion, pred_df),2)


        }} else if (full_df$crop == "cg") {{
        cg_erosion <- readRDS(cg_cn_file)

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

          curve_num <- round(predict(cg_erosion, pred_df),2)


        }} else if (full_df$crop == "cso") {{
        cso_erosion <- readRDS(cso_cn_file)

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

          curve_num <- round(predict(cso_erosion, pred_df),2)


        }} else if (full_df$crop == "dr") {{
        dr_erosion <- readRDS(dr_cn_file)

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

          curve_num <- round(predict(dr_erosion, pred_df),2)


        }} else if (full_df$crop == "ps") {{
        ps_erosion <- readRDS(ps_cn_file)

          tillage <- factor(ps_erosion$preproc$xlevels$tillage)
          Contour <- factor(ps_erosion$preproc$xlevels$Contour)

          level_df <- expand_grid(tillage, Contour)

          df <- full_df %>%
          select(c(initialP:LSsurgo)) %>% 
          slice(rep(1:n(), each=nrow(level_df)))

          df <- cbind(level_df, df)

          pred_df <- df %>%
            filter(tillage == full_df$tillage, Contour == full_df$Contour)

          curve_num <- round(predict(ps_erosion, pred_df),2)


        }} else if (full_df$crop == "pt") {{
        pt_erosion <- readRDS(pt_cn_file)

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

          curve_num <- round(predict(pt_erosion, pred_df),3)


        }} else if (full_df$crop == "dl") {{
        dl_erosion <- readRDS(dl_cn_file)

          density <- factor(dl_erosion$preproc$xlevels$density)

          df <- full_df %>%
              select(c(total_DM_lbs:LSsurgo)) %>% 
              slice(rep(1:n(), each=nrow(level_df)))

          df <- cbind(density, df)

          pred_df <- df %>%
            filter(density == full_df$density)

          curve_num <- round(predict(dl_erosion, pred_df),2)


        }}

        """))

        pred = r.get("curve_num").to_numpy()
        print("Model Results")
        # convert from tons/ac to kg/he
        # pred = pred * 2000 * .453592
        # print(pred)
        rain = OutputDataNode("Runoff", "rain (in)")
        curve = OutputDataNode("Curve Number", "curve number")
        rainfall = []
        # for y in range(0, len(pred) - 1):
        #     rainfall.append(pred[".pred"][y] * 2)
        print(rainfall)
        # rain.set_display_data(np.asarray(rainfall))
        curve.set_display_data(pred)
        return [curve]
