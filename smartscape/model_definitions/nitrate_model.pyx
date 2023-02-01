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
def window(numpy.ndarray[numpy.float32_t, ndim=2] landuse,
                                                  numpy.ndarray[numpy.float32_t, ndim=2] drainClass,
                                                  numpy.ndarray[numpy.float32_t, ndim=2] n_response,
                                                  numpy.ndarray[numpy.float32_t, ndim=2] om,
                                                  numpy.ndarray[numpy.float32_t, ndim=2] selected_landuse,
                                                  int num_trans):
    print("starting window")
    results_holder = []
    cdef int count
    for count in range(num_trans + 1):
        results_holder.append(0)
    print(results_holder)
    no_data = -9999


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
            # do something with data
            if  bb != no_data:
                for iy2 in range(rows2):
                    for ix2 in range(cols2):
                        bb = b[iy2,ix2]
                        if bb == -9999:
                            arr_9999[iy, ix] = arr_9999[iy, ix] + 1
                        elif 3 <= bb <= 7:
                            arr_ag[iy, ix] = arr_ag[iy, ix]+ 1
                        elif 8 <= bb <= 10:
                            arr_grass[iy, ix] = arr_grass[iy, ix] + 1
            else:
                arr_is_9999[iy, ix] = 1

    print("results new ", results_holder)
    print("results old ", index_sum)
    print(index_count)
    return [index_sum,results_holder]
