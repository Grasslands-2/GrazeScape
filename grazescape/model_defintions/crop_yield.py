import numpy as np
import pandas as pd
from grazescape.model_defintions.model_base import ModelBase, OutputDataNode


class CropYield(ModelBase):
    def __init__(self, request, active_region, file_name=None):
        super().__init__(request, active_region, file_name)

    @ModelBase.log_start_end
    def run_model(self, manure_results):

        crop_ro = self.model_parameters["crop"]
        return_data = []
        if crop_ro == "cc":
            corn = OutputDataNode("Corn Grain", "Corn grain yield [bu/ac/yr]", "Corn grain production [bu/yr]",
                                  "Corn grain yield [bushels/ac/yr]", "Corn grain production [bushels/yr]")

            return_data.append(corn)
        elif crop_ro == "cg":
            corn = OutputDataNode("Corn Grain", "Corn grain yield [bu/ac/yr]", "Corn grain production [bu/yr]",
                                  "Corn grain yield [bushels/ac/yr]", "Corn grain production [bushels/yr]")
            soy = OutputDataNode("Soy", "Soybean yield (bushels/ac/yr)", "Soybean production (bu/yr)",
                                 'Soybean yield (bushels/ac/yr)', "Soybean production (bushels/yr)")
            return_data.append(corn)
            return_data.append(soy)
        elif crop_ro == "dr":
            silage = OutputDataNode("Corn Silage", "Corn silage yield (tons/ac/yr)", "Corn silage production (tons/yr)",
                                    "Corn silage yield (tons/ac/yr)", "Corn silage production (tons/yr)")
            corn = OutputDataNode("Corn Grain", "Corn grain yield [bu/ac/yr]", "Corn grain production [bu/yr]",
                                  "Corn grain yield [bushels/ac/yr]", "Corn grain production [bushels/yr]")
            alfalfa = OutputDataNode("Alfalfa", "Alfalfa yield (tons/ac/yr)", "Alfalfa production (tons/yr)",
                                     "Alfalfa yield (tons/ac/yr)", "Alfalfa production (tons/yr)")
            return_data.append(silage)
            return_data.append(corn)
            return_data.append(alfalfa)
        elif crop_ro == "cso":
            silage = OutputDataNode("Corn Silage", "Corn silage yield (tons/ac/yr)", "Corn silage production (tons/yr)",
                                    "Corn silage yield (tons/ac/yr)", "Corn silage production (tons/yr)")
            soy = OutputDataNode("Soy", "Soybean yield (bushels/ac/yr)", "Soybean production (bu/yr)",
                                 'Soybean yield (bushels/ac/yr)', "Soybean production (bushels/yr)")
            oats = OutputDataNode("Oats", "Oat yield (bushels/ac/yr)", "Oat production (bu/yr)",
                                  "Oat yield (bushels/ac/yr)", "Oat production (bushels/yr)")
            return_data.append(silage)
            return_data.append(soy)
            return_data.append(oats)

        else:
            raise Exception("Invalid crop rotation selected")
        rotation_avg = OutputDataNode("Rotational Average", "Total dry matter yield (tons/ac/yr)",
                                      "Total dry matter production (tons/yr)", "Total dry matter yield (tons/ac/yr)",
                                      "Total dry matter production (tons/yr)")
        return_data.append(rotation_avg)

        flat_corn = self.raster_inputs["corn"].flatten()
        flat_soy = self.raster_inputs["soy"].flatten()
        # [bushels/acre x 10] original units
        corn_yield_raw = flat_corn / 10
        soy_yield_raw = flat_soy / 10

        # Nvar variabels can be collected on a crop year basis not by cell.
        corn_yield = corn_yield_raw
        corn_yield_tonDMac = corn_yield_raw * 56 * (1 - 0.155) / 2000

        soy_yield = soy_yield_raw
        soy_yield_tonDMac = soy_yield * 60 * 0.792 * 0.9008 / 2000

        # cont corn
        if crop_ro == "cc":
            corn.set_data(corn_yield)
            corn.set_data_alternate(corn_yield_tonDMac)
            rotation_avg_tonDMac = corn_yield_tonDMac
        elif crop_ro == "dl":
            pass
        elif crop_ro == "cg":
            rotation_avg_tonDMac = 0.5 * corn_yield_tonDMac + 0.5 * soy_yield_tonDMac
            corn.set_data(corn_yield)
            corn.set_data_alternate(corn_yield_tonDMac)
            soy.set_data(soy_yield)
            soy.set_data_alternate(soy_yield_tonDMac)
        #     corn silage to corn grain to alfalfa x 3
        elif crop_ro == "dr":
            silage_yield = 3.73E-4 * (corn_yield_raw * corn_yield_raw) + 3.95E-2 * corn_yield_raw + 6.0036
            silage_yield_tonDMac = silage_yield * 2000 * (1 - 0.65) / 2000

            corn_yield = corn_yield_raw
            corn_yield_tonDMac = corn_yield * 56 * (
                    1 - 0.155) / 2000
            alfalfa_yield = corn_yield_raw * 0.0195
            alfalfa_yield_tonDMac = alfalfa_yield * 2000 * (1 - 0.13) / 2000

            rotation_avg_tonDMac = \
                1 / 5 * silage_yield_tonDMac + 1 / 5 * corn_yield_tonDMac + 3 / 5 * alfalfa_yield_tonDMac
            silage.set_data(silage_yield)
            silage.set_data_alternate(silage_yield_tonDMac)
            corn.set_data(corn_yield)
            corn.set_data_alternate(corn_yield_tonDMac)
            alfalfa.set_data(alfalfa_yield)
            alfalfa.set_data_alternate(alfalfa_yield_tonDMac)
        elif crop_ro == "cso":
            silage_yield = 3.73E-4 * (corn_yield_raw * corn_yield_raw) + 3.95E-2 * corn_yield_raw + 6.0036
            silage_yield_tonDMac = silage_yield * 2000 * (
                    1 - 0.65) / 2000
            soy_yield = soy_yield_raw
            soy_yield_tonDMac = soy_yield * 60 * 0.792 * 0.9008 / 2000
            oat_yield = corn_yield_raw * 0.42
            oat_yield_tonDMac = oat_yield * 32 * (1 - 0.14) / 2000
            rotation_avg_tonDMac = 1 / 3 * silage_yield_tonDMac + 1 / 3 * soy_yield_tonDMac + 1 / 3 * oat_yield_tonDMac
            silage.set_data(silage_yield)
            silage.set_data_alternate(silage_yield_tonDMac)
            soy.set_data(soy_yield)
            soy.set_data_alternate(soy_yield_tonDMac)
            oats.set_data(oat_yield)
            oats.set_data_alternate(oat_yield_tonDMac)
        rotation_avg.set_data(rotation_avg_tonDMac)
        return return_data

