from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
import math


class CropYield(ModelBase):
    def __init__(self, request, file_name=None):
        super().__init__(request, file_name)
        # original units are in  [bushels/acre x 10]0
        # (to keep values in integer)
        # self.units = "Dry Mass tons/ac"
        # list of CropYieldDataNode
        self.crop_list = []

    def run_model(self):
        # conversion rate between lb/ac to kg/ha
        print('CROP YEILD MODEL PARAS!!!!!!')
        print(self.model_parameters)
        crop_ro = self.model_parameters["crop"]
        return_data = []
        print("crop rotation!!!!!!")
        print(crop_ro)
        # initial storage for crop data
        if crop_ro == "cc":
            corn = OutputDataNode("Corn Grain", "Yield (bushels/ac)",
                                  "Yield (bushels/year)")
            return_data.append(corn)
        elif crop_ro == "cg":
            corn = OutputDataNode("Corn Grain", "Yield (bushels/ac)",
                                  "Yield (bushels/year)")
            soy = OutputDataNode("Soy", "Yield (bushels/ac)", "Total Yield (bushels/year)")
            return_data.append(corn)
            return_data.append(soy)
        elif crop_ro == "dr":
            silage = OutputDataNode("Corn Silage",
                                    "Yield (tons/ac)", "Total Yield (tons/year)")
            corn = OutputDataNode("Corn Grain", "Yield (bushels/ac)",
                                  "Total Yield (bushels/year)")
            alfalfa = OutputDataNode("Alfalfa",
                                     "Yield (tons/ac)", "Total Yield (tons/year)")
            return_data.append(silage)
            return_data.append(corn)
            return_data.append(alfalfa)

        elif crop_ro == "cso":
            silage = OutputDataNode("Corn Silage",
                                    "Yield (tons/ac)", "Total Yield (tons/year)")
            soy = OutputDataNode("Soy", "Yield (bushels/ac)", "Total Yield (bushels/year)")
            oats = OutputDataNode("Oats", "Yield (bushels/ac)", "Total Yield (bushels/year)")
            return_data.append(silage)
            return_data.append(soy)
            return_data.append(oats)
        else:
            raise Exception("Invalid crop rotation selected")

        rotation_avg = OutputDataNode("Rotational Average",
                                      "𝗬𝗶𝗲𝗹𝗱 (tons-Dry Matter/ac)",
                                      "Total Yield (tons-Dry Matter/year)")
        return_data.append(rotation_avg)
        
        for y in range(0, self.bounds["y"]):
            for x in range(0, self.bounds["x"]):
                # [bushels/acre x 10] original units
                corn_yield_raw = self.raster_inputs["corn"][y][x] / 10
                soy_yield_raw = self.raster_inputs["soy"][y][x] / 10

                # cont corn
                if crop_ro == "cc":
                    corn_yield = corn_yield_raw
                    corn_yield_tonDMac = corn_yield * 56 * (1 - 0.155) / 2000
                    rotation_avg_tonDMac = corn_yield_tonDMac

                    corn.set_data(corn_yield)
                    # corn.set_alternate_data(corn_yield_tonDMac)

                #     cash grain
                elif crop_ro == "cg":
                    corn_yield = corn_yield_raw
                    corn_yield_tonDMac = corn_yield * 56 * (
                            1 - 0.155) / 2000

                    soy_yield = soy_yield_raw
                    soy_yield_tonDMac = soy_yield * 60 * 0.792 * 0.9008 / 2000

                    rotation_avg_tonDMac = 0.5 * corn_yield_tonDMac + 0.5 * soy_yield_tonDMac

                    corn.set_data(corn_yield)
                    # corn.set_alternate_data(soy_yield_tonDMac)

                    soy.set_data(soy_yield)
                    # soy.set_alternate_data(soy_yield_tonDMac)

                #     corn silage to corn grain to alfalfa x 3
                elif crop_ro == "dr":
                    silage_yield = 3.73E-4 * math.pow(corn_yield_raw,
                                                      2) + 3.95E-2 * corn_yield_raw + 6.0036
                    silage_yield_tonDMac = silage_yield * 2000 * (1 - 0.65) / 2000

                    corn_yield = corn_yield_raw
                    corn_yield_tonDMac = corn_yield * 56 * (
                            1 - 0.155) / 2000
                    alfalfa_yield = corn_yield_raw * 0.0195
                    alfalfa_yield_tonDMac = alfalfa_yield * 2000 * (1 - 0.13) / 2000

                    rotation_avg_tonDMac = 1 / 5 * silage_yield_tonDMac + 1 / 5 * corn_yield_tonDMac + 3 / 5 * alfalfa_yield_tonDMac

                    silage.set_data(silage_yield)
                    # silage.set_alternate_data(silage_yield_tonDMac)


                    corn.set_data(corn_yield)
                    # corn.set_alternate_data(corn_yield_tonDMac)

                    alfalfa.set_data(alfalfa_yield)
                    # alfalfa.set_alternate_data(alfalfa_yield_tonDMac)

                # corn silage to soybeans to oats
                elif crop_ro == "cso":
                    silage_yield = 3.73E-4 * math.pow(corn_yield_raw,
                                                      2) + 3.95E-2 * corn_yield_raw + 6.0036
                    silage_yield_tonDMac = silage_yield * 2000 * (
                            1 - 0.65) /2000

                    soy_yield = soy_yield_raw
                    soy_yield_tonDMac = soy_yield * 60 * 0.792 * 0.9008 / 2000

                    oat_yield = corn_yield_raw * 0.42
                    oat_yield_tonDMac = oat_yield * 32 * (1 - 0.14) / 2000

                    rotation_avg_tonDMac = 1 / 3 * silage_yield_tonDMac + 1 / 3 * soy_yield_tonDMac + 1 / 3 * oat_yield_tonDMac

                    silage.set_data(silage_yield)
                    # silage.set_alternate_data(silage_yield_tonDMac)

                    soy.set_data(soy_yield)
                    # soy.set_alternate_data(soy_yield)

                    oats.set_data(oat_yield)
                    # oats.set_alternate_data(oat_yield)
                rotation_avg.set_data(rotation_avg_tonDMac)
                # rotation_avg.set_alternate_data(rotation_avg_tonDMac)
        return return_data
