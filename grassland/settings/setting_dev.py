"""
Django settings for grassland project.
Generated by 'django-admin startproject' using Django 3.1.5.
For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/
For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/
"""

from pathlib import Path
import os
import configparser
from grassland.settings.settings import *
if parser.has_section("captcha_google") and parser.has_section("postgresql"):
    params = parser.items("captcha_google")
    GOOGLE_RECAPTCHA_SECRET_KEY = params[0][1]
    params = parser.items("postgresql")
    db_name = params[1][1]
    db_user = params[2][1]
    db_pass = params[3][1]
    db_host = params[0][1]
    # db_port = params[4][1]
else:
    raise Exception(
        'Section {0} not found in the {1} file'.format("captcha_google", filename))

SECRET_KEY = 'r59hzdx*6!+et=7=_cs-ysj3f1z!pfsizixsuj4)055-+d@c&r'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

GEOSERVER_URL = "http://geoserver:8080"
#container R path.
R_PATH = "/opt/conda/envs/gscape/bin/R"
MODEL_PATH = "/tmp/GrazeScape/grazescape/data_files/input_models"

GCS_BUCKET_NAME = "dev_container_model_results"