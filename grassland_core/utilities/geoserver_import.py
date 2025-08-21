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
regions = {"cloverBeltWI":"cloverBelt",
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

# print(os.listdir(TIF_DIRECTORY))


base_url = "http://localhost:8080/geoserver/rest/imports"
# base_url = "http://144.92.32.223:8080/geoserver/rest/imports"
# base_url = "http://144.92.32.223:8081/geoserver/rest/imports"
for region in regions:
    # TIF_DIRECTORY = r"/mnt/rclone_geoserver/" + regions[region] + r"/modelOutputs"
    # TIF_DIRECTORY = r"/mnt/rclone_geoserver/" + regions[region] + r"/modelInputs"
    TIF_DIRECTORY = r"/mnt/rclone_geoserver/" + regions[region] + r"/HUC"
    data = {
        "import": {
            "targetWorkspace": {
                "workspace": {
                    # "name": "SmartScapeRaster_" + region
                    "name": "SmartScapeVector"

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






    create_response = requests.post(base_url, json=data, headers=headers, auth=auth)
    if create_response.status_code != 201:
        print("Failed to create import:", create_response.text)
        exit()

    import_id = create_response.json()["import"]["id"]

    # Step 2: Execute Import
    execute_url = f"{base_url}/{import_id}"
    execute_data = {"execute": "true"}
    execute_response = requests.post(execute_url, json=execute_data, headers=headers, auth=auth)

    print("Execute Status Code:", execute_response.status_code)
    print("Execute Response:", execute_response.text)
