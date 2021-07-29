var geoserverURL = "http://geoserver-dev1.glbrc.org:8080"
//var geoserverURL = "https://geoserver:8443"

class GeoServer{
    constructor() {
    }
//    returns a geojson of the farms
    getScenariosSource(){
        let url = '/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Ascenarios_2&maxFeatures=50&outputFormat=application%2Fjson'
        this.makeRequest(url, "source").then(function(geoJson){
        DSS.layer.scenarios.getSource().clear()
        console.log(geoJson)
        var format = new ol.format.GeoJSON();
        var myGeoJsonFeatures = format.readFeatures(
            geoJson,
            {featureProjection: 'EPSG:3857'}
        );
            DSS.layer.scenarios.getSource().addFeatures(myGeoJsonFeatures)
        })
    }
    getFarmSource(){
        let url = '/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Afarm_2&outputFormat=application%2Fjson'
        this.makeRequest(url, "source").then(function(geoJson){
            DSS.layer.farms_1.getSource().clear()
            console.log(geoJson)
            var format = new ol.format.GeoJSON();
            var myGeoJsonFeatures = format.readFeatures(
                geoJson,
                {featureProjection: 'EPSG:3857'}
            );
           DSS.layer.farms_1.getSource().addFeatures(myGeoJsonFeatures)
        })
    }
    //    returns a geojson of the fields
    getFieldSource(){

        let url = '/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Afield_2&outputFormat=application%2Fjson'
        this.makeRequest(url, "source").then(function(geoJson){
            DSS.layer.fields_1.getSource().clear()
            DSS.layer.fieldsLabels.getSource().clear()
            console.log(geoJson)
            var format = new ol.format.GeoJSON();
            var myGeoJsonFeatures = format.readFeatures(
                geoJson,
                {featureProjection: 'EPSG:3857'}
            );
            DSS.layer.fields_1.getSource().addFeatures(myGeoJsonFeatures)
            DSS.layer.fieldsLabels.getSource().addFeatures(myGeoJsonFeatures)
        })

    }
    //    returns a geojson of the infrastructure
    getInfrastructureSource(){
        let url ='/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Ainfrastructure_2&outputFormat=application%2Fjson'
        this.makeRequest(url, "source").then(function(geoJson){
            DSS.layer.infrastructure.getSource().clear()
            console.log(geoJson)
            var format = new ol.format.GeoJSON();
            var myGeoJsonFeatures = format.readFeatures(
                geoJson,
                {featureProjection: 'EPSG:3857'}
            );
            DSS.layer.infrastructure.getSource().addFeatures(myGeoJsonFeatures)
        })
    }

    makeRequest(url, requestType){
        return new Promise(function(resolve) {
            var csrftoken = Cookies.get('csrftoken');
            $.ajaxSetup({
                    headers: { "X-CSRFToken": csrftoken }
            });
            $.ajax({
                'url' : '/grazescape/geoserver_request',
                'type' : 'POST',
                'data' : {
                    url:url,
                    request_type:requestType
                },
                success: function(responses, opts) {
                    delete $.ajaxSetup().headers
                    resolve(responses.data)
                },

                failure: function(response, opts) {
                    me.stopWorkerAnimation();
                }
            })
        })
    }
}