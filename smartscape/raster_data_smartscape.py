"""
This class will manage retrieving data from geoserver and manage the clipping of extents to fields
Author: Matthew Bayles
Created: November 2021
Python Version: 3.9.2
"""

import geopandas as gpd
import pandas as pd
from shapely.geometry import Polygon
import os
from django.conf import settings
from grazescape.raster_data import RasterData


class RasterDataSmartScape(RasterData):
    """
    Child class of RasterData. Specifically used to handel raster requests for SmartScape
    Attributes
    ----------
    dir_path : str
        The path to the directory to store the downloaded rasters
    layer_dic : str
        dict of local layer names and their names on geoserver
    """
    def __init__(self, extents, field_geom_array, field_id):
        """
        Constructor.
        Parameters
        ----------
        extents : list of floats
            Extents of the area of interest to download.
        field_geom_array : list of list of floats
            The coordinates of a clip
        field_id
            The id of the folder to store the rasters
        """
        super().__init__(extents, field_geom_array, field_id)
        self.file_name = field_id
        self.dir_path = os.path.join(settings.BASE_DIR, 'grazescape',
                                     'data_files', 'raster_inputs',
                                     self.file_name)
        self.dir_path = os.path.join(settings.BASE_DIR, 'smartscape',
                                     'data_files', 'raster_inputs',
                                     self.file_name)
        self.layer_dic = {
            "slope": "SmartScapeRaster:southWestWI_slopePer_30m",
            "landuse": "SmartScapeRaster:southWestWI_WiscLand_30m",

        }
        self.field_geom_array = field_geom_array
        if not os.path.exists(self.dir_path):
            os.makedirs(self.dir_path)

    def create_no_data_array(self, raster_data_dic):
        """
        Override parent function as we don't need this functionality in smartscape
        """
        return

    def create_clip(self):
        """
        Create a shapefile to clip the raster with.
        Parameters
        ----------
        field_geom_array : list of list of lists of doubles
            coordinates of the clip to be created; each outer list indicates a new polygon to create.
        """
        poly_list = []
        field_geom_array = self.field_geom_array
        # create polygon for each selection
        for poly in field_geom_array:
            geom_array_float = []
            # for coor in poly:
            #     geom_array_float.append([float(coor[0]), float(coor[1])])
            poly_list.append(Polygon(poly))
        df = pd.DataFrame({'geometry': poly_list})
        crs = {'init': self.crs}
        polygon = gpd.GeoDataFrame(df, crs=crs, geometry='geometry')
        print(polygon)
        polygon.to_file(filename=os.path.join(self.dir_path, self.file_name +".shp"), driver="ESRI Shapefile")
