from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
import math
import numpy as np
import pandas as pd
import time
import csv
import os


def getRotText(crop, legume_text, animal_density_text):
    if crop == 'pt_rt':
        return crop + '_' + legume_text
    elif crop == 'pt_cn':
        return crop + '_' + animal_density_text + '_' + legume_text
    elif crop == 'dl':
        return crop + '_' + animal_density_text
    else:
        return crop


def getOMText(omraw):
    if omraw <= 2:
        OM_fertrecs = '<2'
    elif 2 < omraw <= 10:
        OM_fertrecs = '2-9.9'
    elif omraw > 10:
        OM_fertrecs = '10-20.0'

    return OM_fertrecs


def getRotYers(crop):
    if crop == 'pt':
        rot_yrs = 1
        rot_yrs_crop = ['pt']
    if crop == 'pt_rt':
        rot_yrs = 1
        rot_yrs_crop = ['pt_rt']
    if crop == 'pt_cn':
        rot_yrs = 1
        rot_yrs_crop = ['pt_cn']
    if crop == 'dl':
        rot_yrs = 1
        rot_yrs_crop = ['dl']
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
        # 'af','af','af' is redundent and wasting time.  stream line it with a conditional
        rot_yrs_crop = ['cs', 'cn', 'as', 'af', 'af']
    return [rot_yrs, rot_yrs_crop]


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


class CalcManureP(ModelBase):
    def __init__(self, request, file_name=None):
        super().__init__(request, file_name)
        # C:\Users\zjhas\Documents\GrazeScape\grazescape\static\grazescape\public
        # self.fertNrec = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/NmodelInputs_final_grazed.csv")
        # self.denitLoss = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/denitr.csv")
        # self.Nvars = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/Nvars.csv")
        self.nrec_dict = None
        self.load_nrec()

    def get_sand_string(self, sand_mean):
        if sand_mean <= 90:
            return '<90'
        elif sand_mean > 90:
            return '>90'

    def get_om_mn(self, om):
        if om <= 3:
            return '<3'
        elif om > 3:
            return '>3'

    def load_nrec(self):
        print(self.active_region)
        output_dict = {}
        if self.active_region == "pineRiverMN":

            csv_filename = os.path.join("grazescape", "static", "grazescape", "public", "nitrate_tables",
                                        "MN_Nitrogen.csv")
            nitrate_define_char = "sand_percent"
            nitrate_define_char2 = "om_percent"
        else:
            csv_filename = os.path.join("grazescape", "static", "grazescape", "public", "nitrate_tables",
                                        "WI_Nitrogen.csv")
            nitrate_define_char = "rasterVals"

        print(csv_filename)
        with open(csv_filename) as f:
            reader = csv.DictReader(f)
            for row in reader:
                cover = row["coverAbbr"]
                if self.active_region == "pineRiverMN":
                    dict_key = row["RotationAbbr"] + "_" + row["CropAbbr"] + "_" + cover + "_" + row[nitrate_define_char] + "_" + row[nitrate_define_char2]
                else:

                    dict_key = row["RotationAbbr"] + "_" + row["CropAbbr"] + "_" + cover + "_" + row[nitrate_define_char]
                # dict_key = row["RotationAbbr"] + "_" + row["CropAbbr"] + "_" + cover + "_" + row["sand_percent"]
                dict_key = dict_key.replace(" ", "")
                print(dict_key)
                output_dict[dict_key] = {"fertN": row["FertN"], "ManureN": row["ManureN"],
                                         "Pneeds": row["Pneeds"],
                                         "grazedManureN": row["grazedManureN"],
                                         "NfixPct": row["NfixPct"],
                                         "Nharv_content": row["Nharv_content"],
                                         "NH3loss": row["NH3loss"],
                                         "grazed_DM_lbs": row["grazed_DM_lbs"],
                                         "grazed_P2O5_lbs": row["grazed_P2O5_lbs"],

                                         }
        self.nrec_dict = output_dict

    def getfertNrec_values(self, rot_yrs_crop, crop, legume_text, animal_density_text, om_text, cell_nresponse,
                           cover_crop, manure_n_perc, sand_string, om_mn_string, mn):
        nrecValue = 0
        nManureValue = 0
        pNeedsValue = 0
        grazedDMlbs = 0
        grazedP2O5lbs = 0
        manurePpercent = 0
        grazedManureN = 0
        NfixPct = 0
        Nharv_content = 0
        NH3loss = 0
        n_fert_values = {"avg": {
            "n_rec": nrecValue,
            "n_man": nManureValue,
            "p_needs": pNeedsValue,
            "grazed_dm": grazedDMlbs,
            "grazed_p205": grazedP2O5lbs,
            "man_p_per": manurePpercent,
            "grazedManureN": grazedManureN,
            "NfixPct": NfixPct,
            "Nharv_content": Nharv_content,
            "NH3loss": NH3loss,
        }}
        crop_key = crop + "_" + animal_density_text + "_" + legume_text + "_" + cover_crop + "_" + cell_nresponse + "_" + om_text
        print("crop_key", crop_key)
        for i in rot_yrs_crop:
            if mn:
                print("in minnesota")
                print(i)

                if i == 'pt_rt':
                    crop_key = f"{crop}_{legume_text}_{crop}_{legume_text}_NA_NA_NA"
                elif i == 'pt_cn':
                    crop_key = f"{crop}_{animal_density_text}_{legume_text}_{crop}_{animal_density_text}_{legume_text}_NA_NA_NA"
                elif i == 'dl':
                    crop_key = f"{crop}_{animal_density_text}_{crop}_{animal_density_text}_NA_NA_NA"

                elif crop == "cg" and i != 'sb':
                    crop_key = f"{crop}_{i}_{cover_crop}_{sand_string}_NA"
                elif crop == "cc":
                    crop_key = f"{crop}_{i}_{cover_crop}_{sand_string}_NA"
                elif crop == "cso" and i == "cs":
                    crop_key = f"{crop}_{i}_{cover_crop}_{sand_string}_NA"
                elif crop == "cso" and i == "ot":
                    crop_key = f"{crop}_{i}_{cover_crop}_NA_{om_mn_string}"

                # all dr and cso (only soy bean)
                else:
                    crop_key = f"{crop}_{i}_{cover_crop}_NA_NA"
            else:
                print("wisconsin")
                print(i)
                if i == 'pt_rt':
                    crop_key = crop + "_" + legume_text + "_" + crop + "_" + legume_text + "_" + cover_crop + "_" + om_text
                elif i == 'pt_cn':
                    crop_key = crop + "_" + animal_density_text + "_" + legume_text + "_" + crop + "_" + animal_density_text + "_" + legume_text + "_" + cover_crop + "_" + om_text

                elif i == 'dl':
                    crop_key = crop + "_" + animal_density_text + "_" + cover_crop + "_" + cell_nresponse
                else:
                    if i == 'ot' or i == 'as':
                        crop_key = crop + "_" + i + "_" + cover_crop + "_" + om_text
                    else:
                        crop_key = crop + "_" + i + "_" + cover_crop + "_" + cell_nresponse

            # alfalfa has two rotation years
            print("crop_key for rotation", i, crop_key)
            print(self.nrec_dict[crop_key])
            nrecValue = float(self.nrec_dict[crop_key]["fertN"])
            nManureValue = float(self.nrec_dict[crop_key]["ManureN"])
            pNeedsValue = float(self.nrec_dict[crop_key]["Pneeds"])
            grazedDMlbs = float(self.nrec_dict[crop_key]["grazed_DM_lbs"])
            grazedP2O5lbs = float(self.nrec_dict[crop_key]["grazed_P2O5_lbs"])

            grazedManureN = float(self.nrec_dict[crop_key]["grazedManureN"])
            NfixPct = float(self.nrec_dict[crop_key]["NfixPct"])
            Nharv_content = float(self.nrec_dict[crop_key]["Nharv_content"])
            NH3loss = float(self.nrec_dict[crop_key]["NH3loss"])

            ManureN_total = nManureValue
            appliedManureN = ManureN_total * manure_n_perc / 0.4
            manureP = appliedManureN / 3
            manurePpercent = 0
            if crop != "dl":
                manurePpercent = 100 * (manureP / pNeedsValue)

            n_fert_values[i] = {
                "n_rec": nrecValue,
                "n_man": nManureValue,
                "p_needs": pNeedsValue,
                "grazed_dm": grazedDMlbs,
                "grazed_p205": grazedP2O5lbs,
                "man_p_per": manurePpercent,

                "grazedManureN": grazedManureN,
                "NfixPct": NfixPct,
                "Nharv_content": Nharv_content,
                "NH3loss": NH3loss,
            }
            n_fert_values["avg"] = {
                "n_rec": nrecValue + n_fert_values["avg"]["n_rec"],
                "n_man": nManureValue + n_fert_values["avg"]["n_man"],
                "p_needs": pNeedsValue + n_fert_values["avg"]["p_needs"],
                "grazed_dm": grazedDMlbs + n_fert_values["avg"]["grazed_dm"],
                "grazed_p205": grazedP2O5lbs + n_fert_values["avg"]["grazed_p205"],
                "man_p_per": manurePpercent + n_fert_values["avg"]["man_p_per"],

                "grazedManureN": grazedManureN + n_fert_values["avg"]["grazedManureN"],
                "NfixPct": NfixPct + n_fert_values["avg"]["NfixPct"],
                "Nharv_content": Nharv_content + n_fert_values["avg"]["Nharv_content"],
                "NH3loss": NH3loss + n_fert_values["avg"]["NH3loss"],
            }
        for val in n_fert_values["avg"]:
            n_fert_values["avg"][val] = n_fert_values["avg"][val] / len(rot_yrs_crop)

        return n_fert_values

    def run_model(self):
        start = time.time()
        if self.model_parameters["crop"] == "pt" or self.model_parameters["crop"] == "dl":
            cover_crop = 'nc'
        else:
            cover_crop = self.model_parameters["crop_cover"]
        legume = self.model_parameters["legume"]
        animal_density = self.model_parameters["density"]
        animal_density_text = getAnimaleDensity(animal_density)
        legume_text = getLegumeTest(legume)
        manure_n_perc = float(self.model_parameters["manure_n_perc"]) / 100
        if self.model_parameters["crop"] == "pt":
            crop_ro = self.model_parameters["crop"] + '_' + self.model_parameters["rotation"]
        else:
            crop_ro = self.model_parameters["crop"]

        max_val = 0
        max_index = -1
        nresponse_string = ""
        # nresponse is only for wisconsin
        if self.active_region != "pineRiverMN":
            values, counts = np.unique(self.raster_inputs["Nresponse"], return_counts=True)
            print("values", values, counts)
            for i in range(1, len(values)):

                if counts[i] > max_val:
                    max_val = counts[i]
                    max_index = i
            cell_nresponse = values[max_index]
            nresponse_string = "{:.0f}".format(cell_nresponse)

        sand_count = np.count_nonzero(self.raster_inputs["sand"] != self.no_data)
        sand_values = np.where(self.raster_inputs["sand"] == self.no_data, 0, self.raster_inputs["sand"])
        sand_values_sum = np.sum(sand_values)
        sand_mean = sand_values_sum/sand_count
        # sand_mean = np.sum(self.raster_inputs["sand"])
        # print("sand_count", sand_count)
        # print("sand_count", sand_values)
        # print("sand_mean", sand_values_sum/sand_count)

        sand_string = self.get_sand_string(sand_mean)
        om_mn_string = self.get_om_mn(sand_mean)
        # we are going to take the dominate nresponse value from each field

        rot_yrs_crop = getRotYers(crop_ro)[1]
        om_value = getOMText(float(self.model_parameters["om"]))

        nitrate_inputs = self.getfertNrec_values(rot_yrs_crop, crop_ro, legume_text, animal_density_text, om_value,
                                                 nresponse_string, cover_crop, manure_n_perc, sand_string, om_mn_string,
                                                 self.active_region == "pineRiverMN")
        return nitrate_inputs
