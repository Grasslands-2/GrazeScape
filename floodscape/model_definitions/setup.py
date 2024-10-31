from setuptools import setup
from Cython.Build import cythonize
from distutils.extension import Extension
from Cython.Distutils import build_ext
import numpy

setup(
    name="bird_model",
    cmdclass={"build_ext": build_ext},
    ext_modules=cythonize("bird_model.pyx", "nitrate_model.pyx"),
    zip_safe=False,
    include_dirs=[numpy.get_include()]
)