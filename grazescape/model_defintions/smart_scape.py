from abc import ABC
from osgeo import gdal

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import R
from django.conf import settings
import os
import numpy as np
from PIL import Image


class SmartScape(ModelBase):
    def __init__(self, request, model_type, is_smart_scape, file_name=None):
        super().__init__(request, file_name, is_smart_scape)
        self.model_type = model_type
        self.raster_image_file_path = os.path.join(settings.BASE_DIR,
                                                   'smartscape', 'data_files',
                                                   'raster_outputs',
                                                   self.file_name + ".png")
        if not os.path.exists(
                os.path.join(settings.BASE_DIR, 'smartscape', 'data_files',
                             'raster_outputs')):
            os.makedirs(
                os.path.join(settings.BASE_DIR, 'smartscape', 'data_files',
                             'raster_outputs'))
        self.out_dir = os.path.join(settings.BASE_DIR,'smartscape', 'data_files',
                                                   'raster_outputs',self.file_name)
        self.in_dir = os.path.join(settings.BASE_DIR, 'smartscape', 'data_files',
                               'raster_inputs',self.file_name)

    # overwriting abstract method
    # TODO should include data type so we all get one raster
    def run_model(self):
        # slope = self.raster_inputs["slope"].flatten()
        generic = OutputDataNode("smartscape", "", "")
        generic.set_data_smart(self.raster_inputs["slope"])
        return [generic]

    def parse(self, selection, datanm, slope1, slope2):
        para = []
        # return (datanm >float(slope1), float(slope2)>datanm, datanm != self.no_data)
        return (datanm >float(slope1), float(slope2)>datanm, datanm != self.no_data)

    def get_model_png(self, model, bounds, slope1, slope2):
        datanm = model.data
        rows = bounds["y"]
        cols = bounds["x"]
        print("creating png")
        print(rows, cols)
        # create empty 2d array for the png
        three_d = np.empty([rows, cols, 4])
        # create array to display red for selected cells
        three_d[0:rows, 0:cols] = [255, 0, 0, 255]
        # add dimensions to data array so we can convert it to an image
        # selection parameters: 1 if passes 0 otherwise
        print("about to start selecting by slope")
        # https://gis.stackexchange.com/questions/163007/raster-reclassify-using-python-gdal-and-numpy
        # need to separate out no data value; so we will have selected, no selected but within area
        # and no data (should just be values outside of subarea)
        datanm = np.where(np.logical_and(*self.parse("", datanm, slope1, slope2)), 1, 0)
        print(datanm)


        # create raster to hold values
        driver = gdal.GetDriverByName("GTiff")
        outdata = driver.Create(os.path.join(self.in_dir, "output_test1.tif"), cols, rows, 1,
                                gdal.GDT_Float32)
        image1 = gdal.Open(os.path.join(self.in_dir, "landuse-clipped.tif"))

        outdata.SetGeoTransform(
            image1.GetGeoTransform())  ##sets same geotransform as input
        outdata.SetProjection(
            image1.GetProjection())  ##sets same projection as input
        outdata.GetRasterBand(1).WriteArray(datanm)
        outdata.GetRasterBand(1).SetNoDataValue(
            -9999)  ##if you want these values transparent
        outdata.FlushCache()  ##saves to disk!!
        outdata = None
        band = None
        ds = None





        datanm = np.expand_dims(datanm, axis=2)
        print("done selecting by select")
        # datanm = np.where(np.logical_and`(datanm > 40, datanm != self.no_data), 1, 0)
        datanm = datanm * three_d
        # print(datanm)
        datanm = datanm.astype(np.uint8)
        im = Image.fromarray(datanm)

        im.convert('RGBA')
        # im.save(self.raster_image_file_path)
        # im.convert('F')

        # saving the final output
        # as a PNG file
        im.save(self.raster_image_file_path)


