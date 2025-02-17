import requests
import os
import configparser
import json
parser = configparser.ConfigParser()
BASE_DIR = "B:\Work\Grasslands\GrazeScape"
filename = os.path.join(BASE_DIR, 'grassland', 'settings', 'app_secret.ini')
parser.read(filename)
if parser.has_section("geoserver"):
    user = parser["geoserver"]["user"]
    password = parser["geoserver"]["password"]
print(user)
print(password)
# GeoServer Configuration

TIF_DIRECTORY = r"/opt/geoserver/gsdata/GeoserverFiles/SmartScape/southEastWI/modelOutputs/"
# print(os.listdir(TIF_DIRECTORY))

# base_url = "http://localhost:8080/geoserver/rest/imports"
base_url = "http://144.92.32.223:8080/geoserver/rest/imports"
# base_url = "http://144.92.32.223:8081/geoserver/rest/imports"

data = {
    "import": {
        "targetWorkspace": {
            "workspace": {
                # "name": "SmartScapeRaster_eastCentralWI"
                "name": "SmartScapeRaster_southEastWI"
            }
        },
        "data": {
            "type": "directory",
            "location": TIF_DIRECTORY
        }
    }
}

headers = {"Content-Type": "application/json"}
auth = (user, password)

create_response = requests.post(base_url, json=data, headers=headers, auth=auth)
if create_response.status_code != 201:
    print("Failed to create import:", create_response.text)
    exit()

import_id = create_response.json()["import"]["id"]
print(f"Import created with ID: {import_id}")

# Step 2: Execute Import
execute_url = f"{base_url}/{import_id}"
execute_data = {"execute": "true"}
execute_response = requests.post(execute_url, json=execute_data, headers=headers, auth=auth)

print("Execute Status Code:", execute_response.status_code)
print("Execute Response:", execute_response.text)