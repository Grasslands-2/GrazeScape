import requests
import os
import configparser
parser = configparser.ConfigParser()
BASE_DIR = "B:\Work\Grasslands\GrazeScape"
filename = os.path.join(BASE_DIR, 'grassland', 'settings', 'app_secret.ini')
parser.read(filename)
if parser.has_section("geoserver_local"):
    user = parser["geoserver_local"]["user"]
    password = parser["geoserver_local"]["password"]
print(user)
print(password)
# GeoServer Configuration
GEOSERVER_URL = "http://your-geoserver-url/geoserver"
GEOSERVER_USER = "admin"
GEOSERVER_PASSWORD = "geoserver"
WORKSPACE = "your_workspace"  # Ensure this workspace exists
TIF_DIRECTORY = "path/to/your/tif/files"