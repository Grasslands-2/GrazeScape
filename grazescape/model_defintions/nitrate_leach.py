from abc import ABC
import os
import sys
import csv

sys.path.append('/grazescape/model_defintions')
from osgeo import gdal
from osgeo import gdalconst as gc
from osgeo import ogr
import matplotlib.pyplot as plt
import requests
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Polygon
from django.conf import settings
from pyper import R
from django.conf import settings

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import *
import numpy as np
import math


# you need to cycle through each crop from each
def getOMText(omraw, text_needed):
    if omraw <= 2:
        OM_denitloss = '<2'
        OM_fertrecs = '<2'
    elif 2 < omraw <= 10:
        OM_denitloss = '2-5.0'
        OM_fertrecs = '2-9.9'
    elif 10 < omraw:
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
        return crop + '_' + legume_text
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
class NitrateLeeching(ModelBase):
    def __init__(self, request, file_name=None):
        super().__init__(request, file_name)
        self.fertNrec = pd.read_csv(r"grazescape\model_defintions\NitrogenFertRecs_zjh_edits.csv")
        self.denitLoss = pd.read_csv(r"grazescape\model_defintions\denitr.csv")
        self.Nvars = pd.read_csv(r"grazescape\model_defintions\Nvars.csv")
        # original units are in  [bushels/acre x 10]
        # (to keep values in integer)
        # self.units = "Dry Mass tons/ac"
        # list of CropYieldDataNode
        # self.crop_list = []



    def run_model(self, active_region, manure_results, ero, yield_result):
        nitrate = OutputDataNode("nleaching", "Nitrate-N leaching (lb/ac/yr)", "Nitrate-N leaching (lb/yr)",
                                 "Nitrate-N leaching (lb/ac/yr)", "Nitrate-N leaching (lb/yr)")
        nitrate_water = OutputDataNode("nwater", "Total Nitrogen Loss To Water (lb/ac/yr)",
                                       "Total Nitrogen Loss To Water (lb/yr)",
                                       "Total Nitrogen Loss To Water (lb/ac/yr)",
                                       "Total Nitrogen Loss To Water (lb/yr)")
        yield_dic = {}
        for res in yield_result:
            if res.model_type == "Corn Grain":
                yield_dic["cn"] = res
            elif res.model_type == "Soy":
                yield_dic["sb"] = res
            elif res.model_type == "Corn Silage":
                yield_dic["cs"] = res
            elif res.model_type == "Alfalfa":
                yield_dic["af"] = res
            elif res.model_type == "Oats":
                yield_dic["ot"] = res
            elif res.model_type == "Grass":
                yield_dic["pt"] = res
            elif res.model_type == "Dry Lot":
                yield_dic["dl"] = res
        return_data = [nitrate, nitrate_water]
        crop_ro = self.model_parameters["crop"]
        # initial storage for crop data
        print("Start Nitrate Combo")
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

        rotation_avg = OutputDataNode("Rotational Average", "Total dry matter yield (tons/ac/yr)",
                                      "Total dry matter production (tons/yr)", "Total dry matter yield (tons/ac/yr)",
                                      "Total dry matter production (tons/yr)")
        return_data.append(rotation_avg)
        flat_corn = self.raster_inputs["corn"].flatten()
        flat_soy = self.raster_inputs["soy"].flatten()
        # todo get rid of this loop by using vectors
        # for y in range(0, len(flat_corn)):
        leached_N_Total = 0
        n_loss_h20 = 0

        # [bushels/acre x 10] original units
        corn_yield_raw = flat_corn / 10
        soy_yield_raw = flat_soy / 10
        om = float(self.model_parameters["om"])
        ero = ero.flatten()
        ero = np.where(drain_class_flattened != self.no_data, ero, 0)
        print("count of non nodata cells", np.count_nonzero(drain_class_flattened != self.no_data))
        cell_count = np.count_nonzero(drain_class_flattened != self.no_data)

        erosN = np.sum(ero / cell_count) * om * 2

        print("om", om)
        print("drain_class", drain_class_flattened)
        print("corn", flat_corn)
        print("ero", np.sum(ero / cell_count))
        print("erosN", erosN)

        print("om", np.shape(om))
        print("drain_class", np.shape(drain_class_flattened))
        print("corn", np.shape(flat_corn))

        calculate_denitloss_vector = np.vectorize(self.calculate_denitloss)
        Calc_N_Leach_Vector = np.vectorize(self.Calc_N_LeachCalc_N_Leach)
        Denitr_Value = np.where(drain_class_flattened != self.no_data,
                                calculate_denitloss_vector(om, drain_class_flattened), drain_class_flattened)
        print("denitloss", Denitr_Value)
        NvarsRot = self.Nvars[self.Nvars['RotationAbbr'] == getRotText_Value]
        NvarsCover = NvarsRot[NvarsRot["cover"] == cover_crop]
        # Nvar variabels can be collected on a crop year basis not by cell.
        corn_yield = corn_yield_raw
        corn_yield_tonDMac = corn_yield_raw * 56 * (1 - 0.155) / 2000

        soy_yield = soy_yield_raw
        soy_yield_tonDMac = soy_yield * 60 * 0.792 * 0.9008 / 2000

        # cont corn
        if crop_ro == "cc":
            # corn_yield = corn_yield_raw
            # corn_yield_tonDMac = corn_yield * 56 * (1 - 0.155) / 2000
            # rotation_avg_tonDMac = corn_yield_tonDMac
            yield_crop_data = yield_dic["cn"].alternate_data
            fertN = PctFertN * float(manure_results["cn"]["n_rec"])
            manrN = PctManrN * float(manure_results["cn"]["n_man"])
            Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == "cn"]])
            NfixPct = float(Nvars_Row["NfixPct"].values[0])
            NH3loss = float(Nvars_Row["NH3loss"].values[0])
            Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
            grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])

            leachN_Calced = np.where(drain_class_flattened != self.no_data,
                                     Calc_N_Leach_Vector(yield_crop_data, fertN, manrN, NfixPct, NH3loss,
                                                         Nharv_content, grazed_manureN, Denitr_Value, precN, dryN,
                                                         erosN),
                                     0)
            leachN_avg = np.sum(leachN_Calced) / cell_count
            print("leaching for rotation", leachN_avg)
            # rotation avg is not less than zero
            if leachN_avg < 0:
                leachN_Calced = np.where(drain_class_flattened != self.no_data, 0, self.no_data)

            n_loss_h20 = n_loss_h20 + (leachN_Calced + (erosN + precN))
            nitrate_water.set_data(n_loss_h20)

            leached_N_Total = leached_N_Total + leachN_Calced
            nitrate.set_data(leached_N_Total)

        elif crop_ro == "dl":

            yield_crop_data = 0
            # fertN = PctFertN * float(cellpmanurelist[5])
            # manrN = PctManrN * float(cellpmanurelist[0])
            fertN = PctFertN * float(manure_results["dl"]["n_rec"])
            manrN = PctManrN * float(manure_results["dl"]["n_man"])
            # print("RIGHT BEFORE NvarsCover")
            Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == "dl" + '_' + animal_density_text]])
            NfixPct = float(Nvars_Row["NfixPct"].values[0])
            NH3loss = float(Nvars_Row["NH3loss"].values[0])
            Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
            grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
            leachN_Calced = np.where(drain_class_flattened != self.no_data,
                                     Calc_N_Leach_Vector(yield_crop_data, fertN, manrN, NfixPct, NH3loss,
                                                         Nharv_content, grazed_manureN, Denitr_Value, precN, dryN,
                                                         erosN),
                                     0)
            leachN_avg = np.sum(leachN_Calced) / cell_count
            print("leaching for rotation", leachN_avg)
            # rotation avg is not less than zero
            if leachN_avg < 0:
                leachN_Calced = np.where(drain_class_flattened != self.no_data, 0, self.no_data)
            leached_N_Total = leached_N_Total + leachN_Calced

            n_loss_h20 = n_loss_h20 + (leachN_Calced + (erosN + precN))
            nitrate_water.set_data([n_loss_h20])

            nitrate.set_data([leached_N_Total])
        #     cash grain
        elif crop_ro == "cg":

            rotation_avg_tonDMac = 0.5 * corn_yield_tonDMac + 0.5 * soy_yield_tonDMac

            corn.set_data(corn_yield)

            soy.set_data(soy_yield)
            corn_DM_yield = corn_yield_tonDMac
            soy_DM_yield = soy_yield_tonDMac
            for i in rot_yrs_crop:
                if i == 'cn':
                    yield_crop_data = yield_dic["cn"].alternate_data
                    fertN = PctFertN * float(manure_results["cn"]["n_rec"])
                    manrN = PctManrN * float(manure_results["cn"]["n_man"])
                    Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == i]])
                    NfixPct = float(Nvars_Row["NfixPct"].values[0])
                    NH3loss = float(Nvars_Row["NH3loss"].values[0])
                    Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
                    grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
                    print("fert N cn", fertN)
                    print("man N cn", manrN)
                else:
                    yield_crop_data = yield_dic["sb"].alternate_data
                    fertN = PctFertN * float(manure_results["sb"]["n_rec"])
                    manrN = PctManrN * float(manure_results["sb"]["n_man"])
                    Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == i]])
                    NfixPct = float(Nvars_Row["NfixPct"].values[0])
                    NH3loss = float(Nvars_Row["NH3loss"].values[0])
                    Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
                    grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
                    print("fert N sb", fertN)
                    print("man N sb", manrN)
                leachN_Calced = np.where(drain_class_flattened != self.no_data,
                                         Calc_N_Leach_Vector(yield_crop_data, fertN, manrN, NfixPct, NH3loss,
                                                             Nharv_content, grazed_manureN, Denitr_Value, precN, dryN,
                                                             erosN),
                                         0)
                leachN_avg = np.sum(leachN_Calced) / cell_count
                print("leaching for rotation", leachN_avg)
                # rotation avg is not less than zero
                if leachN_avg < 0:
                    leachN_Calced = np.where(drain_class_flattened != self.no_data, 0, self.no_data)
                leached_N_Total = leached_N_Total + leachN_Calced

                n_loss_h20 = n_loss_h20 + (leachN_Calced + (erosN + precN))
            nitrate_water.set_data(n_loss_h20 / 2)

            leached_N_Total = leached_N_Total / 2

            nitrate.set_data([leached_N_Total])

        #     corn silage to corn grain to alfalfa x 3
        elif crop_ro == "dr":
            print("dairy rotation")

            for i in rot_yrs_crop:
                print(i)
                if i == 'cn':
                    # print("CN")
                    yield_crop_data = yield_dic["cn"].alternate_data
                    # fertN = PctFertN * float(cellpmanurelist[5])
                    # manrN = PctManrN * float(cellpmanurelist[0])
                    fertN = PctFertN * float(manure_results["cn"]["n_rec"])
                    manrN = PctManrN * float(manure_results["cn"]["n_man"])
                    Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == i]])
                    NfixPct = float(Nvars_Row["NfixPct"].values[0])
                    NH3loss = float(Nvars_Row["NH3loss"].values[0])
                    Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
                    grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])

                elif i == 'cs':
                    # print("CN")
                    yield_crop_data = yield_dic["cs"].alternate_data
                    fertN = PctFertN * float(manure_results["cs"]["n_rec"])
                    manrN = PctManrN * float(manure_results["cs"]["n_man"])

                    Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == i]])
                    NfixPct = float(Nvars_Row["NfixPct"].values[0])
                    NH3loss = float(Nvars_Row["NH3loss"].values[0])
                    Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
                    grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
                else:
                    yield_crop_data = yield_dic["af"].alternate_data
                    if i == "as":
                        fertN = PctFertN * float(manure_results["as"]["n_rec"])
                        manrN = PctManrN * float(manure_results["as"]["n_man"])
                    elif i == "af":
                        fertN = PctFertN * float(manure_results["af"]["n_rec"])
                        manrN = PctManrN * float(manure_results["af"]["n_man"])
                        print("af manure", fertN, manrN)

                    Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == i]])
                    NfixPct = float(Nvars_Row["NfixPct"].values[0])
                    NH3loss = float(Nvars_Row["NH3loss"].values[0])
                    Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
                    grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])

                leachN_Calced = np.where(drain_class_flattened != self.no_data,
                                         Calc_N_Leach_Vector(yield_crop_data, fertN, manrN, NfixPct, NH3loss,
                                                             Nharv_content, grazed_manureN, Denitr_Value, precN, dryN,
                                                             erosN),
                                         0)
                leachN_avg = np.sum(leachN_Calced) / cell_count
                print("leaching for rotation", leachN_avg)
                # rotation avg is not less than zero
                if leachN_avg < 0:
                    leachN_Calced = np.where(drain_class_flattened != self.no_data, 0, self.no_data)
                n_loss_h20 = n_loss_h20 + (leachN_Calced + (erosN + precN))
                leached_N_Total = leached_N_Total + leachN_Calced

            nitrate_water.set_data(n_loss_h20 / 5)
            leached_N_Total = leached_N_Total / 5

            nitrate.set_data([leached_N_Total])

        elif crop_ro == "cso":

            for i in rot_yrs_crop:
                if i == 'cs':
                    # print("CS")
                    yield_crop_data = yield_dic["cs"].alternate_data
                    fertN = PctFertN * float(manure_results["cs"]["n_rec"])
                    manrN = PctManrN * float(manure_results["cs"]["n_man"])
                    # print("fert N cs", fertN, PctFertN, float(manure_results["cs"]["n_rec"]))
                    # print("man N cs", manrN, PctManrN, float(manure_results["cs"]["n_man"]))
                elif i == 'sb':
                    # print("SB")
                    yield_crop_data = yield_dic["sb"].alternate_data
                    fertN = PctFertN * float(manure_results["sb"]["n_rec"])
                    manrN = PctManrN * float(manure_results["sb"]["n_man"])
                    # print("fert N sb", fertN, PctFertN, float(manure_results["sb"]["n_rec"]))
                    # print("man N sb", manrN, PctManrN, float(manure_results["sb"]["n_man"]))
                else:
                    yield_crop_data = yield_dic["ot"].alternate_data
                    fertN = PctFertN * float(manure_results["ot"]["n_rec"])
                    manrN = PctManrN * float(manure_results["ot"]["n_man"])
                    # print("fert N ot", fertN, PctFertN, float(manure_results["ot"]["n_rec"]))
                    # print("man N ot", manrN, PctManrN, float(manure_results["ot"]["n_man"]))
                Nvars_Row = pd.concat([NvarsCover[NvarsCover["CropAbbr"] == i]])
                NfixPct = float(Nvars_Row["NfixPct"].values[0])
                NH3loss = float(Nvars_Row["NH3loss"].values[0])
                Nharv_content = float(Nvars_Row["Nharv_content"].values[0])
                grazed_manureN = float(Nvars_Row["grazedManureN"].values[0])
                leachN_Calced = np.where(drain_class_flattened != self.no_data,
                                         Calc_N_Leach_Vector(yield_crop_data, fertN, manrN, NfixPct, NH3loss,
                                                             Nharv_content, grazed_manureN, Denitr_Value, precN, dryN,
                                                             erosN),
                                         0)
                leachN_avg = np.sum(leachN_Calced) / cell_count
                print("leaching for rotation", leachN_avg)
                if leachN_avg < 0:
                    leachN_Calced = np.where(drain_class_flattened != self.no_data, 0, self.no_data)
                leached_N_Total = leached_N_Total + leachN_Calced
                n_loss_h20 = n_loss_h20 + (leachN_Calced + (erosN + precN))

            nitrate_water.set_data(n_loss_h20 / 3)
            leached_N_Total = leached_N_Total / 3
            nitrate.set_data([leached_N_Total])

        rotation_avg.set_data(rotation_avg_tonDMac)

        return return_data
