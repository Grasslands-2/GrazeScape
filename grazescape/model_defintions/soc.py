#!/usr/bin/env python3
"""
Methods to calculate soil organic carbon (SOC) metrics.
-------------------------------------------------
Author: Matthew Bayles
Date Created: 2025-11-24
Description:
    -
"""
import logging
from grazescape.model_defintions.model_base import ModelBase, OutputDataNode

logger = logging.getLogger(__name__)

from django.conf import settings
import os


class SOC(ModelBase):
    def __init__(self, request, file_name=None):
        super().__init__(request, file_name)
        self.HA_TO_AC = 0.404686

    def run_model(self):

        rot_type = None
        cover = None
        tillage = None
        density = None


        rot_type = self.model_parameters["crop"]
        if rot_type != "pt":
            density = "nana"
            cover = self.model_parameters["crop_cover"]
            tillage = self.model_parameters["tillage"]
        else:
            
            if self.model_parameters["rotation"] == "rt":
                density = "rtrt"
            else:
                density = "cn"
                density = density + self.model_parameters["density"]
            cover = "nc"
            tillage = "na"
        logger.info("density: %s", density)
        soc_string = rot_type + cover + tillage + density
        soc_string = soc_string.replace("_", "")
        logger.info("SOC string: %s", soc_string)
        
        
        soc_lookup_data = {
            "ccncsnnana": ("continuous corn, no cover, spring chisel no disk", -0.77),
            "ccccntnana": ("continuous corn, cover, no till", -0.5),
            "ccccsnnana": ("continuous corn, cover, spring chisel no disk", -0.49),
            "ccccsunana": ("continuous corn, cover, spring cultivation", -0.55),
            "ccgcdsntnana": ("cont corn baled stalks to grazed cover crop, no till", -0.3),
            "ccgcdsscnana": ("cont corn baled stalks to grazed cover crop, spring chisel disk", -0.4),
            "ccgcdssunana": ("cont corn baled stalks to grazed cover crop, spring cultivation", -0.5),
            "ccgcisntnana": ("cont corn baled stalks interseeded grazed cover crop, no-till", -0.3),
            "ccgcisscnana": ("cont corn baled stalks interseeded grazed cover crop, spring chisel disk", -0.4),
            "ccgcissunana": ("cont corn baled stalks interseeded grazed cover crop, spring cultivation", -0.5),
            "ccncfcnana": ("continuous corn, no cover, fall chisel", -0.8),
            "ccncfmnana": ("continuous corn, no cover, fall MB plow", -0.85),
            "ccncntnana": ("continuous corn, no cover, no till", -0.65),
            "ccncsunana": ("continuous corn, no cover, spring cultivation", -0.75),
            "ccncsvnana": ("continuous corn, no cover, spring vertical till", -0.75),
            "cgncfcnana": ("cash grain, no cover, fall chisel", -0.79),
            "cgncfmnana": ("cash grain, no cover, fall moldboard plow", -0.85),
            "cgncntnana": ("cash grain, no cover, no till", -0.65),
            "cgncsnnana": ("cash grain, no cover, spring chisel no disk", -0.75),
            "cgncsunana": ("cash grain, no cover, spring cultivation", -0.75),
            "cgncsvnana": ("cash grain, no cover, spring vertical till", -0.75),
            "csoccntnana": ("corn silage-soy-oats, cover, no till", -0.7),
            "csoccsnnana": ("corn silage-soy-oats, cover, spring chisel", -0.75),
            "csoccsunana": ("corn silage-soy-oats, cover, no till, spring cultivation", -0.8),
            "csogcdsntnana": ("corn silage-soy-oats, to grazed cover, no till", -0.7),
            "csogcdsscnana": ("corn silage-soy-oats, to grazed cover, spring chisel disk", -0.75),
            "csogcdssunana": ("corn silage-soy-oats, to grazed cover, no till, spring cultivation", -0.8),
            "csogcisntnana": ("corn silage-soy-oats, interseeded grazed cover, no till", -0.7),
            "csogcisscnana": ("corn silage-soy-oats, interseeded grazed cover, spring chisel disk", -0.75),
            "csogcissunana": ("corn silage-soy-oats, interseeded grazed cover, no till, spring cultivation", -0.8),
            "csoncfcnana": ("corn silage-soy-oats, no cover, fall chisel", -0.85),
            "csoncfmnana": ("corn silage-soy-oats, no cover, fall moldboard plow", -0.95),
            "csoncntnana": ("corn silage-soy-oats, no cover, no till", -0.75),
            "csoncsnnana": ("corn silage-soy-oats, no cover, spring chisel, no disk", -0.8),
            "csoncsunana": ("corn silage-soy-oats, no cover, spring cultivation", -0.8),
            "csoncsvnana": ("corn silage-soy-oats, no cover, spring vertical tilllage", -0.8),
            "cgccntnana": ("cash grain, cover, no till", -0.9),
            "cgccsnnana": ("cash grain, cover, spring chisel no disk", -0.5),
            "cgccsunana": ("cash grain, cover, spring cultivation", -0.55),
            "cggcdsntnana": ("cash grain to grazed cover, no till", -0.3),
            "cggcdsscnana": ("cash grain to grazed cover, spring chisel disk", -0.4),
            "cggcdssunana": ("cash grain to grazed over, spring cultivation", -0.5),
            "cggcisntnana": ("cash grain, interseeded grazed cover, no till", -0.3),
            "cggcisscnana": ("cash grain, interseeded grazed cover, spring chisel disk", -0.4),
            "cggcissunana": ("cash grain, interseeded grazed cover, spring cultivation", -0.5),
            "drncfcnana": ("dairy rotation, no cover, fall chisel", -0.68),
            "drncfmnana": ("dairy rotation, no cover, fall moldboard plow", -0.75),
            "drncntnana": ("dairy rotation, no cover, no till", -0.55),
            "drncsmnana": ("dairy rotation, no cover, spring vertical tillage", -0.7),
            "drncsnnana": ("dairy rotation, no cover, spring chisel no disk", -0.7),
            "drncsunana": ("dairy rotation, no cover, spring cultivation", -0.7),
            "drccscnana": ("dairy rotation, cover, spring chisel disk", -0.6),
            "drccntnana": ("dairy rotation, cover, no till", -0.45),
            "drccsunana": ("dairy rotation, cover, spring cultivation", -0.65),
            "drgcdsntnana": ("dairy rotation to grazed cover, no till", -0.2),
            "drgcdsscnana": ("dairy rotation to grazed cover, spring chisel disk", -0.35),
            "drgcdssunana": ("dairy rotation to grazed cover, spring cultivation", -0.45),
            "drgcisntnana": ("dairy rotation, interseeded grazed cover, no till", -0.2),
            "drgcisscnana": ("dairy rotation, interseeded grazed cover, spring chisel disk", -0.35),
            "drgcissunana": ("dairy rotation, interseeded grazed cover, spring cultivation", -0.45),
            "ptncnartrt": ("pasture, rotational", 0.12),
            # "psncfcnana": ("pasture seeding, fall chisel", 0.05),
            # "psncfmnana": ("pasture seeding, fall MB plow", 0.05),
            # "psncntnana": ("pasture seeding, no till", 0.05),
            # "psncscnana": ("pasture seeding, spring chisel disk", 0.05),
            # "psncsnnana": ("pasture seeding, spring chisel no disk", 0.05),
            # "psncsunana": ("pasture seeding, spring cultivation", 0.05),
            "ptncnacnhi": ("pasture, continuous, high density", 0),
            "ptncnacnlo": ("pasture, continuous, low density", -0.23),
            "dlncanhicn": ("dry lot, 10 AU per acre", -0.05),
            "dlncanlocn": ("dry lot, 2 AU per acre", -0.05),
        }
        # return soc_lookup_data[soc_string][1]
        data = soc_lookup_data[soc_string][1] * self.HA_TO_AC
        soc_node = OutputDataNode("soc", "SOC change (Mg/ac/yr)", "SOC change (Mg/yr)", "SOC change (Mg/ac/yr)", "SOC change (Mg/yr)")
        soc_node.set_data(data)
        return [soc_node]
