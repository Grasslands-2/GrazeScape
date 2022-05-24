from abc import ABC

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import *
import numpy as np

class PhosphorousLoss(ModelBase):
    def __init__(self, request, active_region, file_name=None):
        super().__init__(request,active_region, file_name)

    def run_model(self,active_region):
        print("running PL loss model!!!!!!!!!!!!!!!!!!!!!!!!!!!1")
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

