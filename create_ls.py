import os
from osgeo import gdal
import numpy as np
import math
from osgeo import grass
# https://gis.stackexchange.com/questions/164853/reading-modifying-and-writing-a-geotiff-with-gdal-in-python
file = r"C:\Users\zjhas\Documents\making_ls_raster"
slope_tiff = gdal.Open("TC_Slope_Perc_0719_v2.tif")
slope_length_tiff = gdal.Open("TC_slopelenus_0719_v3.tif")

band_slope = slope_tiff.GetRasterBand(1)
band_slope_length = slope_length_tiff.GetRasterBand(1)

arr_slope = np.asarray(band_slope.ReadAsArray(), dtype=np.float64)
arr_slope_length = np.asarray(band_slope_length.ReadAsArray(), dtype=np.float64)

[cols, rows] = arr_slope.shape
# arr_min = arr.min()
# arr_max = arr.max()
# arr_mean = int(arr.mean())
# arr_out = numpy.where((arr < 10000), 999, arr)

# def trueDist(coords,input):
#     grass.run_command('r.profile',
#                input = input_map,
#                output = output_file,
#                profile = [12244.256,-295112.597,12128.012,-295293.77]

ls_list = []
# slopes = self.input_raster_dic["slope"]
# slope_lengths = self.input_raster_dic["slope_length"]
print(arr_slope.shape)
print(arr_slope_length.shape)
sum = 0
total_values=0
for y in range(0, len(arr_slope)):
    if y % 1000 == 0:
        print(y)

    row_ls = []
    for x in range(0, len(arr_slope[0])):
        slope = arr_slope[y][x]
        slope_length = arr_slope_length[y][x]
        if slope > 10000 or slope_length == 15:
            ls_final = -9999
            row_ls.append(ls_final)
            continue
        if slope_length < 0:
            slope_length = 0
        if 3.0 < slope <= 4:
            factor = .4
        elif 1 <= slope <= 3:
            factor = 0.3
        elif slope < 1:
            factor = 0.2
        else:
            factor = 0.5
        # print(slope)
        ls = 10000 + (slope*slope)
        ls1 = slope / (math.pow(ls, 0.5))
        ls2 = ls1 * 4.56
        ls3 = ls1 * ls1
        ls4 = ls3 * 65.41 + 0.065
        ls5 = (slope_length * 3.3) / 72.6
        ls6 = math.pow(ls5, factor)
        ls_final = (ls2 + ls4) * ls6
        sum = ls_final + sum
        total_values = total_values + 1
        row_ls.append(ls_final)
    ls_list.append(row_ls)
ls_list = np.array(ls_list)

# print(ls_list)
print(ls_list.max())
print(ls_list.mean())
print(sum/total_values)
#
#
#
#
#
#
#
#
driver = gdal.GetDriverByName("GTiff")
outdata = driver.Create("LS_10m.tif", rows, cols, 1, gdal.GDT_Float32)
outdata.SetGeoTransform(slope_tiff.GetGeoTransform())##sets same geotransform as input
outdata.SetProjection(slope_tiff.GetProjection())##sets same projection as input
outdata.GetRasterBand(1).WriteArray(ls_list)
outdata.GetRasterBand(1).SetNoDataValue(-9999)##if you want these values transparent
outdata.FlushCache() ##saves to disk!!
outdata = None
band=None
