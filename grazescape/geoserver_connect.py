import requests
from django.conf import settings


class GeoServer:

    def __init__(self, request_type, request_url):
        self.url = settings.GEOSERVER_URL
        self.request_url = self.url + request_url
        print(self.request_url)

    def get_source(self):
        print("get source")

    def makeRequest(self, data=""):
        r = requests.post(self.request_url, data=data)
        # print(r)
        return r.text
# url = '/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Afield_2&outputFormat=application%2Fjson'
# g =GeoServer("source", url)
# g.makeRequest()
