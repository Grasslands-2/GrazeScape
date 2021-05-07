from abc import ABC

from grazescape.model_defintions.model_base import ModelBase
from pyper import R
from django.conf import settings
import os
from grazescape.model_defintions.erosion import Erosion
import numpy as np
import pandas as pd
from pyper import *


class PhosphorousLoss(ModelBase):
    def __init__(self, request, file_name=None):
        super().__init__(request, file_name)
        self.model_name = "ContCorn_NoCoverPI.rds"
        self.model_file_path = os.path.join(self.model_file_path, self.model_name)
        self.units = "PI"
    # overwriting abstract method

    def write_model_input(self, input_raster_dic):
        self.raster_inputs = input_raster_dic
        # Phos model needs erosion model as input

        # model = Erosion(self.model_parameters)
        # model.bounds["x"] = self.bounds["x"]
        # model.bounds["y"] = self.bounds["y"]
        # model.write_model_input(input_raster_dic)
        # results = model.run_model()
        # results = model.reshape_model_output(results)
        # input_raster_dic['erosion'] = results
        # with open(self.model_data_inputs_path, "w") as f:
        #     f.write(
        #         "Erosion,slope,initialP,OM,totalP2O5_lbs,total_DM_lbs,slopelenusle.r,silt,k,"
        #         "total.depth,LSsurgo\n")
        #
        #     for y in range(0, self.bounds["y"]):
        #         for x in range(0, self.bounds["x"]):
        #             f.write(str(input_raster_dic["erosion"][y][x]) + "," +
        #                     str(input_raster_dic["slope_data"][y][x]) + "," +
        #                     str(self.model_parameters.POST.getlist("model_parameters[initial_p]")[0]) + "," +
        #                     str(input_raster_dic["om"][y][x]) + "," +
        #                     str(60) + "," +
        #                     str(0) + "," +
        #                     str(input_raster_dic["slope_length"][y][x]) + "," +
        #                     str(input_raster_dic["silt"][y][x]) + "," +
        #                     str(input_raster_dic["k"][y][x]) + "," +
        #                     str(input_raster_dic["total_depth"][y][x]) + "," +
        #                     str(input_raster_dic["ls"][y][x]) + "\n"
        #                     )
        return

    def run_model(self):
        r = R(RCMD=self.r_file_path, use_pandas=True)

        slope = self.raster_inputs["slope_data"].flatten
        slope_length = self.raster_inputs["slope_length"].flatten
        sand = self.raster_inputs["sand"].flatten
        silt = self.raster_inputs["silt"].flatten
        clay = self.raster_inputs["clay"].flatten
        k = self.raster_inputs["clay"].flatten
        om = self.raster_inputs["om"].flatten
        total_depth = self.raster_inputs["total_depth"].flatten
        ls = self.raster_inputs["ls"].flatten

        slope = np.asarray([[5], [10]]).flatten()
        slope_length = np.asarray([5, 10])
        sand = np.asarray([5, 10])
        silt = np.asarray([5, 10])
        clay = np.asarray([5, 10])
        k = np.asarray([5, 10])
        om = np.asarray([5, 10])
        total_depth = pd.DataFrame([5, 10])
        ls = np.asarray([5, 10])

        r.assign("slope", slope)
        r.assign("slope_length", slope_length)
        r.assign("sand", sand)
        r.assign("silt", silt)
        r.assign("clay", clay)
        r.assign("k", k)
        r.assign("om", om)
        r.assign("total_depth", total_depth)
        r.assign("ls", ls)
        # test 1
        r.assign("p_need", 50)
        r.assign("dm", 0)
        r.assign("p205", 0)
        r.assign("manure", 10)
        r.assign("fert", 5)
        r.assign("crop", "cg")
        r.assign("cover", "cc")
        r.assign("contour", "1")
        r.assign("tillage", "sc")
        r.assign("rotational", "NA")
        r.assign("density", "NA")
        r.assign("initialP", 35)





        print(r(f"""
        #if (!require(randomForest)) install.packages("randomForest", repos = "http://cran.us.r-project.org")
        #if (!require(tidymodels)) install.packages("tidymodels", repos = "http://cran.us.r-project.org")
        #if (!require(tidyverse)) install.packages("tidyverse", repos = "http://cran.us.r-project.org")
        library(tidyverse)
        library(tidymodels)
        library(randomForest)

        # load erosion models
        cc_erosion <- readRDS("tidyModels/ContCornErosion.rds");
        cg_erosion <- readRDS("tidyModels/cornGrainErosion.rds")
        cso_erosion <- readRDS("tidyModels/cornSoyOatErosion.rds")
        dr_erosion <- readRDS("tidyModels/dairyRotationErosion.rds")
        ps_erosion <- readRDS("tidyModels/pastureSeedingErosion.rds")
        pt_erosion <- readRDS("tidyModels/pastureErosion.rds")
        dl_erosion <- readRDS("tidyModels/dryLotErosionErosion.rds")
        # load PI models
        cc_pi <- readRDS("C:/Users/mmbay/PycharmProjects/Work/ModelTesting/tidyModels/ContCornTidyPI.rds")
        cg_pi <- readRDS("C:/Users/mmbay/PycharmProjects/Work/ModelTesting/tidyModels/CornGrain_tidyPI.rds")
        cso_pi <- readRDS("C:/Users/mmbay/PycharmProjects/Work/ModelTesting/tidyModels/CSO_tidyPI.rds")
        dr_pi <- readRDS("C:/Users/mmbay/PycharmProjects/Work/ModelTesting/tidyModels/dairyRot_tidyPI.rds")
        ps_pi <- readRDS("C:/Users/mmbay/PycharmProjects/Work/ModelTesting/tidyModels/pastureSeedingTidyPI.rds")
        pt_pi <- readRDS("C:/Users/mmbay/PycharmProjects/Work/ModelTesting/tidyModels/PasturePI.rds")
        dl_pi <- readRDS("C:/Users/mmbay/PycharmProjects/Work/ModelTesting/tidyModels/DryLot_tidyPI.rds")

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
        soil_df <- tibble(slope =  unlist(slope), slopelenusle.r = unlist(slope_length), sand = unlist(sand), silt = unlist(silt), clay = unlist(clay), k = unlist(k),
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
          erosion <- round(predict(cc_erosion, pred_df),2)

          #bind erosion prediction to prediction data frame
          pi_pred_df <- full_df %>% 
            bind_cols(erosion) %>% 
            mutate(Erosion = .pred)

          #make P Loss prediction
          pi <- round(predict(cc_pi, pi_pred_df),2)
          # P loss prediction bounds
          pi_CI <- predict(cc_pi, pi_pred_df, type = "pred_int")

        }} else if (full_df$crop == "cg") {{
          cover <- factor(cg_erosion$preproc$xlevels$cover)
          tillage <- factor(cg_erosion$preproc$xlevels$tillage)
          Contour <- factor(cg_erosion$preproc$xlevels$Contour)

          level_df <- expand_grid(cover, tillage, Contour)

          df <- full_df %>%
            select(c(slope:totalP2O5_lbs)) %>% 
            slice(rep(1:n(), each=nrow(level_df)))

          df <- cbind(level_df, df)

          pred_df <- df %>%
            filter(cover == levels(full_df$cover), tillage == levels(full_df$tillage), Contour == levels(full_df$Contour))

          erosion <- round(predict(cg_erosion, pred_df),2)

          pi_pred_df <- full_df %>% 
            bind_cols(erosion) %>% 
            mutate(Erosion = .pred)

          pi <- round(predict(cg_pi, pi_pred_df),2)
          pi_CI <- predict(cg_pi, pi_pred_df, type = "pred_int")

        }} else if (full_df$crop == "cso") {{
          cover <- factor(cso_erosion$preproc$xlevels$cover)
          tillage <- factor(cso_erosion$preproc$xlevels$tillage)
          Contour <- factor(cso_erosion$preproc$xlevels$Contour)

          level_df <- expand_grid(cover, tillage, Contour)

          df <- full_df %>%
            select(c(slope:totalP2O5_lbs)) %>% 
            slice(rep(1:n(), each=nrow(level_df)))

          df <- cbind(level_df, df)

          pred_df <- df %>%
            filter(cover == levels(full_df$cover), tillage == levels(full_df$tillage), Contour == levels(full_df$Contour))

          erosion <- round(predict(cso_erosion, pred_df),2)

          pi_pred_df <- full_df %>%
            bind_cols(erosion) %>%
            mutate(Erosion = .pred)

          pi <- round(predict(cso_pi, pi_pred_df),2)
          pi_CI <- predict(cso_pi, pi_pred_df, type = "pred_int")

        }} else if (full_df$crop == "dr") {{

          cover <- factor(dr_erosion$preproc$xlevels$cover)
          tillage <- factor(dr_erosion$preproc$xlevels$tillage)
          Contour <- factor(dr_erosion$preproc$xlevels$Contour)

          level_df <- expand_grid(cover, tillage, Contour)

          df <- full_df %>%
            select(c(slope:totalP2O5_lbs)) %>% 
            slice(rep(1:n(), each=nrow(level_df)))

          df <- cbind(level_df, df)

          pred_df <- df %>%
            filter(cover == levels(full_df$cover), tillage == levels(full_df$tillage), Contour == levels(full_df$Contour))

          erosion <- round(predict(dr_erosion, pred_df),2)

          pi_pred_df <- full_df %>%
            bind_cols(erosion) %>%
            mutate(Erosion = .pred)

          pi <- round(predict(dr_pi, pi_pred_df),2)
          pi_CI <- predict(dr_pi, pi_pred_df, type = "pred_int")

        }} else if (full_df$crop == "ps") {{
          tillage <- factor(ps_erosion$preproc$xlevels$tillage)
          Contour <- factor(ps_erosion$preproc$xlevels$Contour)

          level_df <- expand_grid(tillage, Contour)

          df <- full_df %>%
            select(c(slope:totalP2O5_lbs)) %>% 
            slice(rep(1:n(), each=nrow(level_df)))

          df <- cbind(level_df, df)

          pred_df <- df %>%
            filter(tillage == levels(full_df$tillage), Contour == levels(full_df$Contour))

          erosion <- round(predict(ps_erosion, pred_df),2)

          pi_pred_df <- full_df %>%
            bind_cols(erosion) %>%
            mutate(Erosion = .pred)

          pi <- round(predict(ps_pi, pi_pred_df),2)
          pi_CI <- predict(ps_pi, pi_pred_df, type = "pred_int")

        }} else if (full_df$crop == "pt") {{
          density <- factor(pt_erosion$preproc$xlevels$density)
          rotational <- factor(pt_erosion$preproc$xlevels$rotational)

          level_df <- expand_grid(rotational, density)

          df <- full_df %>%
            select(c(slope:totalP2O5_lbs)) %>% 
            slice(rep(1:n(), each=length(density)))

          df <- cbind(level_df, df) 

          if(full_df$rotational == "rt"){{
            pred_df <- df %>%
              filter(rotational == levels(full_df$rotational), density == "rt")
          }} else{{
            pred_df <- df %>%
              filter(rotational == levels(full_df$rotational),  density == levels(full_df$density))
          }}

          erosion <- round(predict(pt_erosion, pred_df),3)

          pi_pred_df <- pred_df %>%
            bind_cols(erosion) %>%
            mutate(Erosion = .pred)

          pi <- round(predict(pt_pi, pi_pred_df),3)
          pi_CI <- predict(pt_pi, pi_pred_df, type = "pred_int")

        }} else if (full_df$crop == "dl") {{
          density <- factor(dl_erosion$preproc$xlevels$density)

          df <- full_df %>%
            select(c(slope:totalP2O5_lbs)) %>% 
            slice(rep(1:n(), each=length(density)))

          df <- cbind(density, df)

          pred_df <- df %>%
            filter(density == levels(full_df$density))

          erosion <- round(predict(dl_erosion, pred_df),2)

          pi_pred_df <- pred_df %>%
            bind_cols(erosion) %>%
            mutate(Erosion = .pred)

          pi <- round(predict(dl_pi, pi_pred_df),2)
          pi_CI <- predict(dl_pi, pi_pred_df, type = "pred_int")

        }}

          """
                ))

        pred = r.get("pi")
        print(pred)
        return pred

