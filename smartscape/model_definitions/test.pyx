from __future__ import print_function
import numpy as np
from osgeo import gdal
import math
cimport numpy
cimport cython
cimport openmp
from cython.parallel import prange
from cython.parallel cimport parallel
@cython.boundscheck(False) # turn off bounds-checking for entire function
@cython.wraparound(False)  # turn off negative index wrapping for entire function
def test1():
    print("hello")
    num_threads = openmp.omp_get_num_threads()
    # print(num_threads)
    openmp.omp_set_num_threads(10)
    num_threads = openmp.omp_get_num_threads()
    print(num_threads)

    cdef int i
    cdef int j
    cdef int n = 30
    cdef int sum = 0
    cdef numpy.ndarray[numpy.double_t, ndim=2] output = np.zeros((30,30))

    #
    # cdef int num_threads
    #
    # openmp.omp_set_dynamic(10)
    #
    # with nogil, parallel():
    #     # openmp.omp_set_num_threads(10)
    #     num_threads = openmp.omp_get_num_threads()
    #     with gil:
    #         print(num_threads)
    for i in prange(n, nogil=True):
        for j in prange(n):
            sum += 1
            output[i,j] = 1

    print(sum)