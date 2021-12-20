from osgeo import gdal
from osgeo import gdalconst as gc
import requests
import numpy as np
import geopandas as gpd
import pandas as pd
from shapely.geometry import Polygon
import os
from django.conf import settings
import math
import shutil
from grazescape.raster_data import RasterData

"""
This class will manage retrieving data from geoserver and manage the clipping of extents to fields
Created by Matthew Bayles 2021
"""


class RasterDataSmartScape(RasterData):
    """

    Parameters
    ----------
    data_layer String name of the layer to retrieve from geoserver
    extents array x and y coordinates of the extents of the field in a 1d array
    """
    def __init__(self, extents, field_geom_array, field_id):
        super().__init__(extents, field_geom_array, field_id)

        self.dir_path = os.path.join(settings.BASE_DIR, 'smartscape',
                                     'data_files', 'raster_inputs',
                                     self.file_name)
        self.layer_dic = {
            "slope": "SmartScapeRaster:southWestWI_slopePer_30m",
            "landuse": "SmartScapeRaster:southWestWI_WiscLand_30m",
        }
        if not os.path.exists(self.dir_path):
            os.makedirs(self.dir_path)

    def create_no_data_array(self, raster_data_dic):
        print("hi")

    def create_clip(self, field_geom_array):
        """
        Create a shapefile to clip the raster with
        Parameters
        ----------
        field_geom_array

        Returns
        -------

        """
        poly_list = []
        # create polygon for each selection
        for poly in field_geom_array:
            # print(poly)
            geom_array_float = []
            for coor in poly:
                geom_array_float.append([float(coor[0]), float(coor[1])])
            poly_list.append(Polygon(geom_array_float))
        df = pd.DataFrame({'geometry':poly_list})
        crs = {'init': self.crs}
        polygon = gpd.GeoDataFrame(df, crs=crs, geometry='geometry')
        print(polygon)
        polygon.to_file(filename=os.path.join(self.dir_path, self.file_name +".shp"), driver="ESRI Shapefile")
        return polygon.total_bounds
