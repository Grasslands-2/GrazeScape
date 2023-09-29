var geoserverURL = ""
var scenDupArray = []
class GeoServer{
    constructor() {
        this.geoFarm_Url = '/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Afarm_2&outputFormat=application%2Fjson'
        this.geoScen_Url = '/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Ascenarios_2&outputFormat=application%2Fjson'
        this.geoField_Url = '/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Afield_2&outputFormat=application%2Fjson'
        this.geoInfra_Url ='/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Ainfrastructure_2&outputFormat=application%2Fjson'
        this.geoDEM_Url = '/geoserver/InputRasters/wms?service=WMS&version=1.1.0&request=GetMap&layers=InputRasters%3AsouthWestWI_DEM_10m_2&bbox=-1.01774393149E7%2C5310185.3492%2C-1.00400893149E7%2C5490395.3492&width=585&height=768&srs=EPSG%3A3857&styles=&format=image%2Fjpeg'
        this.geoUpdate_Url =this.geoScen_Url
    }
    DEMExtent = [-10177439.3148999996483326, 5490395.3492000000551343, -10040089.3148999996483326, 5310185.3492000000551343]

    setScenariosSource(parameter = ""){
        this.makeRequest(this.geoScen_Url + parameter, "source").then(function(geoJson){
            DSS.layer.scenarios.getSource().clear()
            var format = new ol.format.GeoJSON();
            var myGeoJsonFeatures = format.readFeatures(
                geoJson.geojson,
                {featureProjection: 'EPSG:3857'}
            );
            DSS.layer.scenarios.getSource().addFeatures(myGeoJsonFeatures)
        })
    }

    setFarmSource(parameter = "") {
        console.log("IN SET FARM!!!")
        console.log(parameter)
        this.makeRequest(this.geoFarm_Url + parameter, "source_farm").then(function (geoJson) {
            DSS.layer.farms_1.getSource().clear()
            var format = new ol.format.GeoJSON();

            var myGeoJsonFeatures = format.readFeatures(
                geoJson.geojson,
                { featureProjection: 'EPSG:3857' }
            );

            console.log("farm features:", myGeoJsonFeatures)
            DSS.layer.farms_1.getSource().addFeatures(myGeoJsonFeatures)

            DSS.utils.assignFarmsToRegions();
            DSS.utils.updateFarmPickerItems();
        })
    }
    setFieldsAfterImport(parameter = ""){
        console.log(parameter)
        //This function returns its value, since it is used in promises inside other functions to refresh fields array
        this.makeRequest(this.geoField_Url + parameter, "source").then(async function(geoJson){
            DSS.layer.fields_1.getSource().clear()
            DSS.layer.fieldsLabels.getSource().clear()
            var FSgeoJson = geoJson.geojson
            var format = new ol.format.GeoJSON();
            var myGeoJsonFeatures = format.readFeatures(
                FSgeoJson,
                {featureProjection: 'EPSG:3857'}
            );
            await DSS.layer.fields_1.getSource().addFeatures(myGeoJsonFeatures)
            DSS.layer.fieldsLabels.getSource().addFeatures(myGeoJsonFeatures)
            await DSS.layer.fields_1.getSource().forEachFeature(function(f) {
                if (f.values_.field_name == "(imported field)"){
                    f.setProperties({
                        area: ol.sphere.getArea(f.values_.geometry)* 0.000247105
                    })
                    console.log(f)
                    wfs_update(f,'field_2');
                }		
            })
            if(fieldZoom == true){
                let ex = ol.extent;
                let extent = DSS.layer.fields_1.getSource().getExtent()
                ex.buffer(extent, 1000, extent);
                console.log("setFieldSource")
                DSS.MapState.zoomToRealExtent(extent)
            }
            updateRunModelsButtonDisabled()
        })
    }
    //    returns a geojson of the fields
    setFieldSource(parameter = ""){
        console.log(parameter)
        //This function returns its value, since it is used in promises inside other functions to refresh fields array
        this.makeRequest(this.geoField_Url + parameter, "source").then(async function(geoJson){
            DSS.layer.fields_1.getSource().clear()
            DSS.layer.fieldsLabels.getSource().clear()
            var FSgeoJson = geoJson.geojson
            var format = new ol.format.GeoJSON();
            var myGeoJsonFeatures = format.readFeatures(
                FSgeoJson,
                {featureProjection: 'EPSG:3857'}
            );
            await DSS.layer.fields_1.getSource().addFeatures(myGeoJsonFeatures)
            DSS.layer.fieldsLabels.getSource().addFeatures(myGeoJsonFeatures)
            if(fieldZoom == true){
                let ex = ol.extent;
                let extent = DSS.layer.fields_1.getSource().getExtent()
                ex.buffer(extent, 1000, extent);
                console.log("setFieldSource")
                DSS.MapState.zoomToRealExtent(extent)
            }
            updateRunModelsButtonDisabled()
        })
    }
    //    returns a geojson of the infrastructure
    setInfrastructureSource(parameter = ""){
        console.log(parameter)
        this.makeRequest(this.geoInfra_Url + parameter, "source").then(function(geoJson){
            DSS.layer.infrastructure.getSource().clear()
            var ISgeoJson = geoJson.geojson

            var format = new ol.format.GeoJSON();
            var myGeoJsonFeatures = format.readFeatures(
                ISgeoJson,
                {featureProjection: 'EPSG:3857'}
            );
            console.log(myGeoJsonFeatures)
            DSS.layer.infrastructure.getSource().addFeatures(myGeoJsonFeatures)
        })
    }

//  Gets data for scenarios and populates the scenarios array. used in Scenario Picker
//  Also used in NewScenario.js to refresh data of current active scenario
    getWFSScenarioSP(parameter = ''){
        this.makeRequest(this.geoScen_Url + parameter, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
			let scenObj = geoJson.features
            console.log(scenObj)
            scenDupArray = []
            scenDupArray = scenObj
            console.log(scenDupArray)
			farmArray = [];
			itemsArray = [];
			popItemsArray(scenObj);
            if(Ext.getCmp('dupCurScen') && scenObj.length > 0){
                Ext.getCmp('dupCurScen').setDisabled(false)
            }
        })
    }
    getWFSScenarioDupS(parameter = ''){
        this.makeRequest(this.geoScen_Url + parameter, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
			let scenObj = geoJson.features
            console.log(scenObj)
        })
    }
// Slightly different in how ScenarioMenu is handled
    getWFSScenarioDS(parameter = ''){
        this.makeRequest(this.geoScen_Url + parameter, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
			let scenObj = geoJson.features
			farmArray = [];
			itemsArray = [];
			popItemsArrayDS(scenObj);
        })
    }
// Simular to first 2 examples.  This does not blank out the farm array.  Used in Scenario.js
    getWFSScenario(parameter = ''){
        return this.makeRequest(this.geoScen_Url + parameter, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
            scenarioObj = geoJson.features
            console.log(scenarioObj)
            scenarioArray = [];
            popScenarioArray(scenarioObj);
        })
    }
    getWFSScenarioModelRuns(parameter = ''){
        return new Promise(function(resolve) {
            geoServer.makeRequest(geoServer.geoScen_Url + parameter, "source").then(function(geoJson){
            
                geoJson = JSON.parse(geoJson.geojson)
                scenarioObj = geoJson.features
                console.log(scenarioObj)
                resolve(scenarioObj)
            })
        })
    }
// Used to insert new farms into geoserver. if statements handle if the new farm or scenario is coming in
    insertFarm(payLoad){
        return this.makeRequest(this.geoUpdate_Url, "insert_farm", payLoad, this)
            .then(function(returnData){
                var farmGeojsonString = String(returnData.geojson)
                DSS.MapState.removeMapInteractions()
                var fgid = farmGeojsonString.substring(farmGeojsonString.indexOf('farm_2.') + 7,farmGeojsonString.lastIndexOf('"/>'));
                var intFgid = parseInt(fgid);
                console.log(intFgid);
                return intFgid;
            });
    }
// used to insert fields into geoserver
    wfs_field_insert(feat){
        var formatWFS = new ol.format.WFS();
        var formatGML = new ol.format.GML({
            featureNS: 'http://geoserver.org/GrazeScape_Vector',
            Geometry: 'geom',
            featureType: 'field_2',
            srsName: 'EPSG:3857'
        });
        var node = formatWFS.writeTransaction([feat], null, null, formatGML);
        var serializer = new XMLSerializer();
        var payLoad = serializer.serializeToString(node);

        let requestType = ""

        this.makeRequest(this.geoUpdate_Url, requestType, payLoad, this).then(function(returnData){
            DSS.MapState.removeMapInteractions()
            console.log(returnData)
            console.log("wfs_field_insert")

            console.log("redraw fields")
            DSS.MapState.showFieldsForScenario();
            DSS.MapState.showInfraForScenario();
            DSS.MapState.zoomToActiveFarm()
            document.body.style.cursor = "default";
        });
    }
    //Used to insert new infra after it is drawn
    wfs_infra_insert(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "insert", payLoad, this).then(function(returnData){
           let geoJson = returnData.geojson
           let currObj = returnData.current
           currObj.setInfrastructureSource('&CQL_filter=scenario_id='+DSS.activeScenario)
           DSS.MapState.zoomToActiveFarm()
        })
   }
    //used to update the field attributes used in scenario.js and dashboardutiliites.js
    updateFieldAtt(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "insert", payLoad).then(function(returnData){
        })
    }
    //Used to populate the fields grid for a scenario
    getWFSfields(parameter = ""){
        this.makeRequest(this.geoField_Url + parameter, "source").then(async function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
            fieldObj = geoJson.features
            fieldArray = [];
			await popFieldsArray(fieldObj);
			Ext.create('Ext.data.Store', {
				storeId: 'fieldStore1',
				alternateClassName: 'DSS.FieldStore',
				fields:[ 'name', 'soilP', 'soilOM', 'rotationVal', 'rotationDisp', 'tillageVal', 
	'tillageDisp', 'coverCropDisp', 'coverCropVal',
		'onContour','fertPercP','manuPercP','fertPercN','manuPercN','grassSpeciesVal','grassSpeciesDisp',
		'interseededClover','grazeDensityVal','grazeDensityDisp','manurePastures', 'grazeDairyLactating',
		'grazeDairyNonLactating', 'grazeBeefCattle','area', 'perimeter','fence_type',
        'fence_cost','fence_unit_cost','rotationFreqVal','rotationFreqDisp','landCost'],
		sorters: ['name'],
	data: fieldArray
			});
			DSS.field_grid.FieldGrid.setStore(Ext.data.StoreManager.lookup('fieldStore1'));
			DSS.field_grid.FieldGrid.store.reload();
            // DSS.Field_Summary_Table.setStore(Ext.data.StoreManager.lookup('fieldStore1'));
			// DSS.Field_Summary_Table.store.reload();
        })
    }
    //Used to populate the infra grid for a scenario
    getWFSinfra(parameter = ""){
        this.makeRequest(this.geoInfra_Url + parameter, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
            infraObj = geoJson.features
            infraArray = [];
			console.log(infraObj[0]);
			popInfraArray(infraObj);
			//placed data store in call function to make sure it was locally available.
			Ext.create('Ext.data.Store', {
				storeId: 'infraStore1',
				alternateClassName: 'DSS.infraStore',
				fields:['name','infraType','infraTypeDisp','fenceMaterial','fenceMaterialDisp','waterPipe',
				'waterPipeDisp','laneMaterial','laneMaterialDisp', 'costPerFoot','laneWidth','totalCost'],
                sorters: ['name'],
				data: infraArray
			});
			//Setting store to just declared store fieldStore1, and reloading the store to the grid
			DSS.infrastructure_grid.InfrastructureGrid.setStore(Ext.data.StoreManager.lookup('infraStore1'));
			DSS.infrastructure_grid.InfrastructureGrid.store.reload();
        })
    }
    //used to delete a farm from geoserver.  Used several times in DeleteOperation.js to remove everthing assocaited with deleted farm
    deleteOperation(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "delete", payLoad, this).then(function(){})
    }
    //used to delete fields
    deleteField(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "delete", payLoad, this).then(async function(returnData){
            let geoJson = returnData.geojson
            let currObj = returnData.current
            console.log("deleteField")
            await DSS.MapState.showFieldsForScenario();
            await DSS.MapState.showInfraForScenario();
            DSS.MapState.zoomToActiveFarm()
         })
    }
    //inserts new scenario based on current active scenario 
    wfs_scenario_insert(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "insert", payLoad, this).then(async function(returnData){
            var geojsonString = String(returnData.geojson)
            //This var holds onto the old activeScenario number, so that it can be referenced for copying over fields and infra
            var copyScenarioNum = parseInt(DSS.activeScenario)
            var fgid = geojsonString.substring(geojsonString.indexOf('scenarios_2.') + 12,geojsonString.lastIndexOf('"/>'));
                var intFgid = parseInt(fgid);
            DSS.activeScenario = intFgid
			farmArray = [];
			DSS.MapState.removeMapInteractions()
			DSS.newScenarioID = null
            DSS.farmName = feat.values_.farm_name;
			DSS.scenarioName = feat.values_.scenario_name
			await getWFSFieldsInfraNS(copyScenarioNum,fieldArrayNS,DSS.layer.fields_1,'field_2');
            await wfs_new_scenario_features_copy(fieldArrayNS,'field_2')
            console.log("DONE WITH NEW SCENARIO COPY AND INSERT!!!!!!!!")
            DSS.MapState.showFieldsForScenario();
            DSS.MapState.showInfraForScenario();
            await geoServer.setScenariosSource('&CQL_filter=farm_id='+DSS.activeFarm)
            //Placed here to change the window to manage the new scenario once everything is ready to go.
            DSS.ApplicationFlow.instance.showScenarioPage();
         })
    }
    //ALL THIS DOES IS GET A GEOSJSON WIth THE CURRENT SCENS AND GET THE HIGHEST SCENARIOID #
    //AND POPULATE scenarioArrayNS
    copyScenario(scenName, scenDes, payLoad = ""){
        this.makeRequest(this.geoScen_Url, "source", payLoad, this).then(async function(returnData){
            let geoJson =JSON.parse(returnData.geojson)
            let currObj = returnData.current
            geoJson = geoJson.features
            let maxScenarioId = 0;
            await popScenarioArrayNS(geoJson)
            for (let feat in geoJson){
                if(geoJson[feat].properties.scenario_id>maxScenarioId ){
                    maxScenarioId = geoJson[feat].properties.scenario_id
                    console.log(maxScenarioId)
                }
            }
            highestScenarioId = maxScenarioId
            await createNewScenario(scenName,scenDes,highestScenarioId +1);
        })

    }
    //deletes infra from geoserver
    deleteInfra(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "delete", payLoad, this).then(function(returnData){
            let geoJson = returnData.geojson
            let currObj = returnData.current
            console.log (currObj)
            currObj.setInfrastructureSource('&CQL_filter=scenario_id='+DSS.activeScenario)
            DSS.MapState.zoomToActiveFarm()
         })
    }
    // Copies features from active scneario to new scneario when a new scenario is created
    async wfs_new_scenario_features_copy(payLoad, feat){
       await this.makeRequest(this.geoUpdate_Url, "insert", payLoad, this).then(function(returnData){
            let currObj = returnData.current
            console.log (returnData.current)
            console.log (returnData.geojson)
            console.log ("wfs_new_scenario_features_copy")
         })
    }
    //used in delete scneario to delete assocaited fields and infra
    wfsDeleteItem(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "delete", payLoad, this).then(function(returnData){
            console.log(feat)
            geoServer.setScenariosSource()
            if(feat = 'scenarios_2'){
                getWFSScenarioSP()
            }
         })
    }
    //Function that hits geoserver with ajax request.
    makeRequest(url, requestType, payLoad="", currObj = null, featureID = null){
        //console.log("MAKEREQUEST")
        //console.log(url)
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
                    request_type:requestType,
                    pay_load:payLoad,
                    feature_id:featureID
                },
                success: function(responses, opts) {
                    console.log(responses)
                    delete $.ajaxSetup().headers
                    resolve({geojson:responses.data, current:currObj})
                },

                failure: function(response, opts) {
                    console.log(responses)
                    me.stopWorkerAnimation();
                }
            })
        })
    }
}
