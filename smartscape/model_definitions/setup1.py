from setuptools import setup, Extension
from Cython.Build import cythonize
from distutils.extension import Extension
from Cython.Distutils import build_ext
import numpy
ext_modules = [
    Extension(
        "test",
        ["test.pyx"],
        extra_compile_args=['/openmp'],
        extra_link_args=['/openmp'],
    )
]
setup(
    name="test",
    cmdclass={"build_ext": build_ext},
    # ext_modules=cythonize("bird_model.pyx"),
    ext_modules=cythonize(ext_modules),
    zip_safe=False,
    include_dirs=[numpy.get_include()]
)