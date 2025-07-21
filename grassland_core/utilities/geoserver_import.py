import requests
import os
import configparser
import json
parser = configparser.ConfigParser()
BASE_DIR = "B:\Work\Grasslands\GrazeScape"
filename = os.path.join(BASE_DIR, 'grassland', 'settings', 'app_secret.ini')
parser.read(filename)
# if parser.has_section("geoserver"):
if parser.has_section("geoserver_local"):
    user = parser["geoserver_local"]["user"]
    password = parser["geoserver_local"]["password"]
print(user)
print(password)
# GeoServer Configuration
region = {"cloverBeltWI":"cloverBelt",
    "eastCentralWI":"eastCentralWI",
    "northeastWI":"northeast",
    "pineRiverMN":"pineRiverMN",
    "redCedarWI":"redCedar",
    "southEastWI":"southEastWI",
    "southWestWI":"ridgeValley",
    "uplandsWI":"uplands",
}
# TIF_DIRECTORY = r"/opt/geoserver/gsdata/GeoserverFiles/SmartScape/southEastWI/modelOutputs/"
# TIF_DIRECTORY = r"/opt/geoserver/gsdata/GeoserverFiles/SmartScape/eastCentralWI/modelOutputs/"
TIF_DIRECTORY = r"/mnt/rclone_geoserver/" + region["redCedarWI"] + r"/modelOutputs"
# print(os.listdir(TIF_DIRECTORY))

base_url = "http://localhost:8080/geoserver/rest/imports"
# base_url = "http://144.92.32.223:8080/geoserver/rest/imports"
# base_url = "http://144.92.32.223:8081/geoserver/rest/imports"

data = {
    "import": {
        "targetWorkspace": {
            "workspace": {
                "name": "SmartScapeRaster_" + "redCedarWI"

            }
        },
        "data": {
            "type": "directory",
            "location": TIF_DIRECTORY
        }
    }
}

print(data)

headers = {"Content-Type": "application/json"}
auth = (user, password)






# create_response = requests.post(base_url, json=data, headers=headers, auth=auth)
# if create_response.status_code != 201:
#     print("Failed to create import:", create_response.text)
#     exit()

# import_id = create_response.json()["import"]["id"]



import_id = 2
print(f"Import created with ID: {import_id}")


# Step 2: Execute Import
execute_url = f"{base_url}/{import_id}"
execute_data = {"execute": "true"}
execute_response = requests.post(execute_url, json=execute_data, headers=headers, auth=auth)

print("Execute Status Code:", execute_response.status_code)
print("Execute Response:", execute_response.text)



# # Set these
# region = "uplandsWI"
# region_folder = "uplands"
# workspace = f"SmartScapeRaster_{region}"
# store_name = f"{region_folder}_store"
# mount_path = f"/mnt/rclone_geoserver/{region_folder}/modelOutputs"

# # 1. Create ImageMosaic coverage store
# store_url = f"http://localhost:8080/geoserver/rest/workspaces/{workspace}/coveragestores"
# store_payload = {
#     "coverageStore": {
#         "name": store_name,
#         "type": "ImageMosaic",
#         "enabled": True,
#         "url": "file:" + quote(mount_path),
#         "workspace": workspace
#     }
# }

# r1 = requests.post(store_url, json=store_payload, headers=headers, auth=auth)
# print("Create store:", r1.status_code, r1.text)

# # 2. Publish the layer
# layer_url = f"http://localhost:8080/geoserver/rest/workspaces/{workspace}/coveragestores/{store_name}/coverages"
# layer_payload = {
#     "coverage": {
#         "name": store_name,
#         "nativeName": store_name,
#         "title": f"{region} Mosaic Layer",
#         "srs": "EPSG:32616"  # Or your correct EPSG code
#     }
# }

# r2 = requests.post(layer_url, json=layer_payload, headers=headers, auth=auth)
# print("Publish layer:", r2.status_code, r2.text)