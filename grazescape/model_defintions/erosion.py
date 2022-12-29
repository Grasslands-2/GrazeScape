from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import *
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Polygon

class Erosion(ModelBase):
    def __init__(self, request, active_region, file_name=None):
        super().__init__(request,active_region, file_name)

    def run_model(self, active_region, manure_results, ero):
        r = R(RCMD=self.r_file_path, use_pandas=True)
        pl = OutputDataNode("ploss", "P runoff (lb/ac/yr)", "P runoff (lb/yr)", "Phosphorus runoff (lb/ac/yr)",
                            "Phosphorus runoff (lb/yr)")

        slope = self.raster_inputs["slope"].flatten()
        slope_length = self.raster_inputs["slope_length"].flatten()
        k = self.raster_inputs["k"].flatten()
        ls = self.raster_inputs["ls"].flatten()
        elevation = self.raster_inputs["elevation"].flatten()
        sand = self.raster_inputs["sand"].flatten()
        silt = self.raster_inputs["silt"].flatten()
        clay = self.raster_inputs["clay"].flatten()
        ksat = self.raster_inputs["ksat"].flatten()
        ph = self.raster_inputs["ph"].flatten()
        awc = self.raster_inputs["awc"].flatten()
        total_depth = self.raster_inputs["total_depth"].flatten()

        r.assign("slope_length", slope_length)
        r.assign("k", k)
        r.assign("total_depth", total_depth)
        r.assign("ls", ls)
        r.assign("slope", slope)
        r.assign("elevation", elevation)
        r.assign("sand", sand)
        r.assign("silt", silt)
        r.assign("clay", clay)
        r.assign("ksat", ksat)
        r.assign("ph", ph)
        r.assign("awc", awc)
        r.assign("total_depth", total_depth)
        r.assign("slope", slope)
        r.assign("slope_length", slope_length)
        r.assign("sand", sand)
        r.assign("silt", silt)
        r.assign("clay", clay)
        r.assign("k", k)
        r.assign("total_depth", total_depth)
        r.assign("ls", ls)

        r.assign("p_need", float(manure_results["avg"]["p_needs"]))
        r.assign("manure", float(manure_results["avg"]["man_p_per"]))
        r.assign("dm", float(manure_results["avg"]["grazed_dm"]))
        r.assign("p205", float(manure_results["avg"]["grazed_p205"]))

        r.assign("fert", float(self.model_parameters["fert"]))
        r.assign("crop", self.model_parameters["crop"])
        r.assign("cover", self.model_parameters["crop_cover"])
        r.assign("contour", str(self.model_parameters["contour"]))
        r.assign("tillage", self.model_parameters["tillage"])
        r.assign("rotational", self.model_parameters["rotation"])
        r.assign("density", self.model_parameters["density"])
        r.assign("initialP", float(self.model_parameters["soil_p"]))
        r.assign("om", float(self.model_parameters["om"]))
