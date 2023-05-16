from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
import math
import numpy as np
import pandas as pd
import time
import csv


def getRotText(crop, legume_text, animal_density_text):
    if crop == 'pt_rt':
        return crop + '_' + legume_text
    elif crop == 'pt_cn':
        return crop + '_' + animal_density_text + '_' + legume_text
    elif crop == 'dl':
        return crop + '_' + animal_density_text
    else:
        return crop


def getfertNrec_values(rot_yrs_crop, crop, legume_text, animal_density_text, fertNrec, om_text, cell_nresponse,
                       cover_crop, manure_n_perc):
    nrecValue = 0
    nManureValue = 0
    pNeedsValue = 0
    grazedDMlbs = 0
    grazedP2O5lbs = 0
    manurePpercent = 0
    n_fert_values = {"avg": {
        "n_rec": nrecValue,
        "n_man": nManureValue,
        "p_needs": pNeedsValue,
        "grazed_dm": grazedDMlbs,
        "grazed_p205": grazedP2O5lbs,
        "man_p_per": manurePpercent,
    }}
    for i in rot_yrs_crop:
        if i == 'pt_rt':
            CropAbbr = i + '_' + legume_text
            rasterLookUp = 'om'
            rasterVal = om_text
        elif i == 'pt_cn':
            CropAbbr = i + '_' + animal_density_text + '_' + legume_text
            rasterLookUp = 'om'
            rasterVal = om_text
        elif i == 'dl':
            CropAbbr = i + '_' + animal_density_text
            rasterLookUp = 'nResponse'
            rasterVal = int(float(cell_nresponse))
        else:
            CropAbbr = i
            if i == 'ot' or i == 'as':
                rasterLookUp = 'om'
                rasterVal = om_text
            else:
                rasterLookUp = 'nResponse'
                rasterVal = int(float(cell_nresponse))
        RotationAbbr = getRotText(crop, legume_text, animal_density_text)
        NFertRecs_RotationAbbr = fertNrec[fertNrec["RotationAbbr"] == RotationAbbr]
        NFertRecs_CropAbbr = NFertRecs_RotationAbbr[NFertRecs_RotationAbbr["CropAbbr"] == str(CropAbbr)]
        NFertRecs_CoverAbbr = NFertRecs_CropAbbr[NFertRecs_CropAbbr["coverAbbr"] == str(cover_crop)]
        NFertRecs_RasterLookup = NFertRecs_CoverAbbr[NFertRecs_CoverAbbr["rasterLookup"] == rasterLookUp]
        NFertRecs_Row = pd.concat([NFertRecs_RasterLookup[NFertRecs_RasterLookup["rasterVals"] == str(rasterVal)]])

        # alfalfa has two rotation years

        nrecValue = float(NFertRecs_Row["Nrec"].values[0])
        nManureValue = float(NFertRecs_Row["ManureN"].values[0])
        pNeedsValue = float(NFertRecs_Row["Pneeds"].values[0])
        grazedDMlbs = float(NFertRecs_Row["grazed_DM_lbs"].values[0])
        grazedP2O5lbs = float(NFertRecs_Row["grazed_P2O5_lbs"].values[0])
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
        }
        n_fert_values["avg"] = {
            "n_rec": nrecValue + n_fert_values["avg"]["n_rec"],
            "n_man": nManureValue + n_fert_values["avg"]["n_man"],
            "p_needs": pNeedsValue + n_fert_values["avg"]["p_needs"],
            "grazed_dm": grazedDMlbs + n_fert_values["avg"]["grazed_dm"],
            "grazed_p205": grazedP2O5lbs + n_fert_values["avg"]["grazed_p205"],
            "man_p_per": manurePpercent + n_fert_values["avg"]["man_p_per"],
        }
    for val in n_fert_values["avg"]:
        n_fert_values["avg"][val] = n_fert_values["avg"][val] / len(rot_yrs_crop)

    return n_fert_values


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
        self.fertNrec = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/NmodelInputs_final_grazed.csv")
        self.denitLoss = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/denitr.csv")
        self.Nvars = pd.read_csv(r"grazescape/static/grazescape/public/nitrate_tables/Nvars.csv")

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
        values, counts = np.unique(self.raster_inputs["Nresponse"], return_counts=True)
        # we are going to take the dominate nresponse value from each field
        for i in range(1, len(values)):

            if counts[i] > max_val:
                max_val = counts[i]
                max_index = i
        cell_nresponse = str(values[max_index])



        rot_yrs_crop = getRotYers(crop_ro)[1]


        nitrate_inputs = getfertNrec_values(rot_yrs_crop, crop_ro, legume_text, animal_density_text,
                                            self.fertNrec, getOMText(float(self.model_parameters["om"])),
                                            cell_nresponse,
                                            cover_crop, manure_n_perc)


        return nitrate_inputs
