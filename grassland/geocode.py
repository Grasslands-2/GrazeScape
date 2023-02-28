import requests
from django.http import JsonResponse
from django.conf import settings

def geocode(request):
    try:
        address = request.GET.get("address")
        geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + settings.GOOGLE_CLOUD_API_KEY
        geocodeResponse = requests.get(geocodeUrl).json()
        return JsonResponse(geocodeResponse)
    except Exception as ex:
        print(ex)
        return JsonResponse({"error_message": str(ex)})