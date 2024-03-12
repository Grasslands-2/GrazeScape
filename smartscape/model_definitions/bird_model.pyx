#This file needs to be compiled on a linux machine with Python 3.9 in order to run on the server
#https://cython.readthedocs.io/en/latest/src/quickstart/build.html
#cython: boundscheck=False, wraparound=False, nonecheck=False
from __future__ import print_function
import numpy as np
from osgeo import gdal
import math
cimport numpy
cimport cython
@cython.boundscheck(False) # turn off bounds-checking for entire function
@cython.wraparound(False)  # turn off negative index wrapping for entire function
def window(numpy.ndarray[numpy.float32_t, ndim=2] input_data,
                                                  numpy.ndarray[numpy.float32_t, ndim=2] selection, int padding_size,
                                                 numpy.ndarray[numpy.float32_t, ndim=2] selected_landuse,int num_tr ans):
    results_holder = []
    cdef int count
    for count in range(num_trans + 1):
        results_holder.append(0)
    window_size = padding_size * 2 + 1
    no_data = -9999
    total_window_cells = window_size * window_size
    # add no data cells to pad out input raster depending on the size of the computation block
    padded = np.pad(np.copy(input_data), (padding_size, padding_size),
                    'constant', constant_values=(-9999, -9999))
    cdef numpy.ndarray[numpy.float32_t, ndim=4] window_raster = \
    np.lib.stride_tricks.sliding_window_view(padded, window_shape=(window_size, window_size))
    # cdef numpy.ndarray[numpy.float32_t, ndim=4] window_raster = create_window_raster(input_array)
    # window_raster = create_window_raster()
    # get the center
    cdef int index_val = math.floor(window_size / 2)
    cdef int rows = window_raster.shape[0]
    cdef int cols = window_raster.shape[1]
    cdef int rows2 = window_raster.shape[2]
    cdef int cols2 = window_raster.shape[3]


    cdef numpy.ndarray[numpy.double_t, ndim=2] arr_ag = np.zeros((rows,cols))
    cdef numpy.ndarray[numpy.double_t, ndim=2] arr_grass = np.zeros((rows,cols))
    cdef numpy.ndarray[numpy.double_t, ndim=2] arr_9999 = np.zeros((rows,cols))
    cdef numpy.ndarray[numpy.double_t, ndim=2] arr_is_9999 = np.zeros((rows,cols))
    cdef numpy.ndarray[numpy.double_t, ndim=2] arr_index = np.zeros((rows,cols))

    cdef double ag_per
    cdef double grass_per
    cdef double calc_lambda
    cdef double inner1, inner2, inner3, outer
    cdef int iy, ix
    cdef int land_code
    cdef int num_1, num_2, num_3
    cdef double bb, cc
    cdef int valid_cells
    cdef numpy.ndarray[numpy.float32_t, ndim=2] b

    cdef double index_sum = 0
    cdef double index_count = 0

    for iy in range(rows):
        for ix in range(cols):
            b = window_raster[iy, ix]
            bb = b[index_val][index_val]

            if  bb != no_data:
                for iy2 in range(rows2):
                    for ix2 in range(cols2):
                        bb = b[iy2,ix2]
                        if bb == -9999:
                            arr_9999[iy, ix] = arr_9999[iy, ix] + 1
                        # these are land use codes
                        elif 3 <= bb <= 7:
                            arr_ag[iy, ix] = arr_ag[iy, ix]+ 1
                        elif 8 <= bb <= 10:
                            arr_grass[iy, ix] = arr_grass[iy, ix] + 1
            else:
                arr_is_9999[iy, ix] = 1
    for iy in range(rows):
        for ix in range(cols):
            # check if center cell is valid
            cc = selection[iy, ix]
            if arr_is_9999[iy, ix] != 1:
                # only calc if the center cell is valid
                if cc > 0:
                    index_count = index_count + 1
                    valid_cells = total_window_cells - arr_9999[iy, ix]
                    ag_per = arr_ag[iy, ix]/valid_cells
                    grass_per = arr_grass[iy, ix]/valid_cells
                    calc_lambda = - 4.47 + (2.95 * ag_per) + (5.17  * grass_per)
                    inner1 = math.exp(calc_lambda)
                    inner2 = (1/inner1) + 1
                    inner3 = 1/inner2
                    arr_index[iy, ix] = inner3 / 0.67

                    land_code = int(selected_landuse[iy, ix])
                    if land_code> 0:
                        results_holder[land_code] = results_holder[land_code] + arr_index[iy, ix]
                    else:
                        index_sum = index_sum + inner3 / 0.67

    return [index_sum,results_holder]
