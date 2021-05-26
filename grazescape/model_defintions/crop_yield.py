from abc import ABC

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import R
from django.conf import settings
import os
import numpy as np


class CropYield(ModelBase):
    def __init__(self, request, file_name=None):
        super().__init__(request, file_name)
        # original units are in  [bushels/acre x 10] (to keep values in integer)
        # self.units = "Dry Mass tons/ac"
        # list of CropYieldDataNode
        self.crop_list = []

    def run_model(self):
        # conversion rate between lb/ac to kg/ha
        lbac2kgha = 1.12085
        crop_ro = self.model_parameters["crop"]
        return_data = []

        # initial storage for crop data
        if crop_ro == "cc":
            corn = OutputDataNode("Corn Grain", "bushels/ac", "kg-Dry Matter/ha")
            return_data.append(corn)
        elif crop_ro == "cg":
            corn = OutputDataNode("Corn Grain", "bushels/ac", "kg-Dry Matter/ha")
            soy = OutputDataNode("Soy", "bushels/ac", "kg-Dry Matter/ha")
            return_data.append(corn)
            return_data.append(soy)
        elif crop_ro == "dr":
            silage = OutputDataNode("Corn Silage",
                                       "tons/ac (65% moisture)", "kg-Dry Matter/ha")
            corn = OutputDataNode("Corn Grain", "bushels/ac", "kg-Dry Matter/ha")
            alfalfa = OutputDataNode("Alfalfa",
                                        "tons/ac (13% moisture)", "kg-Dry Matter/ha")
            return_data.append(silage)
            return_data.append(corn)
            return_data.append(alfalfa)

        elif crop_ro == "cso":
            silage = OutputDataNode("Corn Silage",
                                       "tons/ac (65% moisture)", "kg-Dry Matter/ha")
            soy = OutputDataNode("Soy", "bushels/ac", "kg-Dry Matter/ha")
            oats = OutputDataNode("Oats", "bushels/ac", "kg-Dry Matter/ha")
            return_data.append(silage)
            return_data.append(soy)
            return_data.append(oats)
        else:
            raise Exception("Invalid crop rotation selected")

        rotation_avg = OutputDataNode("Rotational Average", "kg-Dry Matter/ha")
        rotation_avg.has_display_data = False

        for y in range(0, self.bounds):
            for x in range(0, self.bounds):
                # [bushels/acre x 10] original units
                corn_yield_raw = self.raster_inputs["corn"][y][x]/10
                soy_yield_raw = self.raster_inputs["soy"][y][x]/10

                # cont corn
                if crop_ro == "cc":
                    corn_yield = corn_yield_raw
                    corn_yield_kgDMha = corn_yield * 56 * lbac2kgha * (1 - 0.155)
                    rotation_avg_kgDMha = corn_yield_kgDMha

                    corn.add_display_data(corn_yield)
                    corn.add_data(corn_yield_kgDMha)

                #     cash grain
                elif crop_ro == "cg":
                    corn_yield = corn_yield_raw
                    corn_yield_kgDMha = corn_yield * 56 * lbac2kgha * (
                                1 - 0.155)

                    soy_yield = soy_yield_raw
                    soy_yield_kgDMha = soy_yield*60*lbac2kgha*0.792*0.9008

                    rotation_avg_kgDMha = 0.5*corn_yield_kgDMha + 0.5*soy_yield_kgDMha

                    corn.add_display_data(corn_yield)
                    corn.add_data(soy_yield_kgDMha)

                    soy.add_display_data(soy_yield)
                    soy.add_data(soy_yield_kgDMha)

                #     corn silage to corn grain to alfalfa x 3
                elif crop_ro == "dr":
                    silage_yield = 3.73E-4 * corn_yield_raw ^ 2 + 3.95E-2 * corn_yield_raw + 6.0036
                    silage_yield_kgDMha = silage_yield*2000*lbac2kgha*(1-0.65)

                    corn_yield = corn_yield_raw
                    corn_yield_kgDMha = corn_yield * 56 * lbac2kgha * (
                                1 - 0.155)
                    alfalfa_yield = corn_yield_raw*0.0195
                    alfalfa_yield_kgDMha = alfalfa_yield*2000*lbac2kgha*(1-0.13)

                    rotation_avg_kgDMha = 1/5*silage_yield_kgDMha + 1/5*corn_yield_kgDMha + 3/5*alfalfa_yield_kgDMha

                    silage.add_display_data(silage_yield)
                    silage.add_data(silage_yield_kgDMha)

                    corn.add_display_data(corn_yield)
                    corn.add_data(corn_yield_kgDMha)

                    alfalfa.add_display_data(alfalfa_yield)
                    alfalfa.add_data(alfalfa_yield_kgDMha)

                # corn silage to soybeans to oats
                elif crop_ro == "cso":
                    silage_yield = 3.73E-4 * corn_yield_raw ^ 2 + 3.95E-2 * corn_yield_raw + 6.0036
                    silage_yield_kgDMha = silage_yield * 2000 * lbac2kgha * (
                                1 - 0.65)

                    soy_yield = soy_yield_raw
                    soy_yield_kgDMha = soy_yield * 60 * lbac2kgha * 0.792 * 0.9008

                    oat_yield = corn_yield_raw*0.42
                    oat_yield_kgDMha = oat_yield*32*lbac2kgha*(1-0.14)

                    rotation_avg_kgDMha = 1/3*silage_yield_kgDMha + 1/3*soy_yield_kgDMha + 1/3*oat_yield_kgDMha

                    silage.add_display_data(silage_yield)
                    silage.add_data(silage_yield_kgDMha)

                    soy.add_display_data(soy_yield)
                    soy.add_data(soy_yield_kgDMha)

                    oats.add_display_data(oat_yield)
                    oats.add_data(oat_yield_kgDMha)
                rotation_avg.add_display_data(rotation_avg_kgDMha)
        return return_data





