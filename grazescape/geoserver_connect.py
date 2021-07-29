import requests
class GeoServer:

    def __init__(self, request_type, request_url):
        self.url = "http://geoserver-dev1.glbrc.org:8080"
        self.request_url = self.url + request_url

    def get_source(self):
        print("get source")

    def makeRequest(self):
        r = requests.post(self.request_url)
        print(r)
        print(r.text)
        return r.text
# url = '/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Afield_2&outputFormat=application%2Fjson'
# g =GeoServer("source", url)
# g.makeRequest()