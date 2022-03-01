var geoserverURL = ""

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
//    returns a geojson of the Scenarios
    setScenariosSource(parameter = ""){
        this.makeRequest(this.geoScen_Url + parameter, "source").then(function(geoJson){
            DSS.layer.scenarios.getSource().clear()
            var format = new ol.format.GeoJSON();
            var myGeoJsonFeatures = format.readFeatures(
                geoJson.geojson,
                {featureProjection: 'EPSG:3857'}
            );
            DSS.layer.scenarios.getSource().addFeatures(myGeoJsonFeatures)
//            DSS.layer.scenarios.getSource().refresh();
        })
    }
//    returns a geojson of the farms
    setFarmSource(parameter = ""){
        console.log("IN SET FARM!!!")
        this.makeRequest(this.geoFarm_Url + parameter, "source_farm").then(function(geoJson){
            console.log(geoJson)
            DSS.layer.farms_1.getSource().clear()
            var format = new ol.format.GeoJSON();
           
            var myGeoJsonFeatures = format.readFeatures(
                geoJson.geojson,
                {featureProjection: 'EPSG:3857'}
            );
           console.log(myGeoJsonFeatures)
           DSS.layer.farms_1.getSource().addFeatures(myGeoJsonFeatures)
           //DSS.layer.farms_1.getSource().refresh();
           //DSS.layer.farms_1.setOpacity(1);
        })
    }
    //    returns a geojson of the fields
    setFieldSource(parameter = ""){
        //console.log(parameter)
        //This function returns its value, since it is used in promises inside other functions to refresh fields array
        this.makeRequest(this.geoField_Url + parameter, "source").then(async function(geoJson){
            //console.log(geoJson.geojson)
            geoJson = geoJson.geojson
            DSS.layer.fields_1.getSource().clear()
            DSS.layer.fieldsLabels.getSource().clear()
            var format = new ol.format.GeoJSON();
            var myGeoJsonFeatures = format.readFeatures(
                geoJson,
                {featureProjection: 'EPSG:3857'}
            );
            console.log(myGeoJsonFeatures)
            DSS.layer.fields_1.getSource().addFeatures(myGeoJsonFeatures)
            DSS.layer.fieldsLabels.getSource().addFeatures(myGeoJsonFeatures)
            // DSS.layer.fields_1.getSource().refresh();
            // DSS.layer.fieldsLabels.getSource().refresh();
        })
    }
    //    returns a geojson of the infrastructure
    setInfrastructureSource(parameter = ""){
        console.log(parameter)
        this.makeRequest(this.geoInfra_Url + parameter, "source").then(function(geoJson){
            DSS.layer.infrastructure.getSource().clear()
            geoJson = geoJson.geojson
                        //console.log(geoJson)

            var format = new ol.format.GeoJSON();
            var myGeoJsonFeatures = format.readFeatures(
                geoJson,
                {featureProjection: 'EPSG:3857'}
            );
            DSS.layer.infrastructure.getSource().addFeatures(myGeoJsonFeatures)
//            DSS.layer.infrastructure.getSource().refresh();
        })
    }
//    get farms and then run popfarmArray Currently not being used as of 02042022
    getWFSFarmCNO(){
         this.makeRequest(this.geoFarm_Url, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
            popfarmArrayCNO(geoJson.features)
        })
    }
//  gets scenario for create new operation.  Currently not being used as of 02042022
    getWFSScenarioCNO(){
        this.makeRequest(this.geoScen_Url, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
            popScenarioArrayCNO(geoJson.features);
        })
    }
//  Gets data for scenarios and populates the scenarios array. used in Scenario Picker
//  Also used in NewScenario.js to refresh data of current active scenario
    getWFSScenarioSP(parameter = ''){
        this.makeRequest(this.geoScen_Url + parameter, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
			let scenObj = geoJson.features
			farmArray = [];
			itemsArray = [];
			popItemsArray(scenObj);
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
        this.makeRequest(this.geoScen_Url + parameter, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
            scenarioObj = geoJson.features
            scenarioArray = [];
            popScenarioArray(scenarioObj);
        })
    }
// Used to insert new farms into geoserver. if statements handle if the new farm or scenario is coming in
    insertFarm(payLoad, feat, fType){
        this.makeRequest(this.geoUpdate_Url, "insert_farm", payLoad, this).then(function(returnData){
            //console.log(returnData.current);
            var farmGeojsonString = String(returnData.geojson)
            console.log(farmGeojsonString);
            let currObj = returnData.current
            currObj.setFarmSource()
			DSS.MapState.removeMapInteractions()
            var fgid = farmGeojsonString.substring(farmGeojsonString.indexOf('farm_2.') + 7,farmGeojsonString.lastIndexOf('"/>'));
            var intFgid = parseInt(fgid);
            console.log(intFgid);
            // DSS.activeFarm = highestFarmIdCNO + 1
            DSS.activeFarm = intFgid
            DSS.farmName = feat.values_.farm_name;
            DSS.scenarioName = ''//feat.values_.scenario_name;
            DSS.ApplicationFlow.instance.showManageOperationPage();
            //DSS.ApplicationFlow.instance.showScenarioPage();

            // var formatWFS = new ol.format.WFS();
            // var formatGML = new ol.format.GML({
            //     featureNS: 'http://geoserver.org/GrazeScape_Vector',
            //     featureType: 'scenarios_2',
            //     srsName: 'EPSG:3857'
            // });
            // feat.setProperties({farm_id:DSS.activeFarm})
            // console.log(feat)

            // node = formatWFS.writeTransaction([feat], null, null, formatGML);
            // console.log(node);
            // s = new XMLSerializer();
            // str = s.serializeToString(node);
            // console.log(str);
            // //geoServer.insertFarm(str, feat,fType)
            // geoServer.makeRequest(geoServer.geoUpdate_Url, "insert_farm", str, this).then(function(returnData){
            //     var scenGeojsonString = String(returnData.geojson)
            //     var sgid = scenGeojsonString.substring(scenGeojsonString.indexOf('scenarios_2.') + 12,scenGeojsonString.lastIndexOf('"/>'));
            //     console.log(intSgid);
            //     var intSgid = parseInt(sgid);
            //     console.log(intSgid);
            //     DSS.activeScenario = sgid
            //     DSS.MapState.showNewFarm(DSS.activeFarm);
            //     gatherScenarioTableData();
            //     runScenarioUpdate();
            //     DSS.ApplicationFlow.instance.showScenarioPage();
            //     showInfraForScenario()
            //     showFieldsForScenario()
            //     // DSS.MapState.showFieldsForFarm();
            //     // DSS.MapState.showInfrasForFarm();
            //     // DSS.layer.fields_1.setVisible(true);
		    //     // DSS.layer.infrastructure.setVisible(true);
		    //     // DSS.layer.fieldsLabels.setVisible(true);
		    //     //console.log("HI! WFS farm Insert ran!")
            // })

           
        })
    }
// used to insert fields into geoserver
    wfs_field_insert(payLoad, feat, fType){
        let requestType = ""
        //Not sure why this is if statement is here.  this function never handles farms
        if (fType == "farm_2"){
            requestType = "insert_farm"
        }
         this.makeRequest(this.geoUpdate_Url, requestType, payLoad, this).then(function(returnData){
            DSS.MapState.removeMapInteractions()
            console.log(returnData)
            let geoJson = returnData.geojson
            let currObj = returnData.current
            console.log("wfs_field_insert")
            currObj.setFieldSource().then(function(){
                console.log("redraw fields")
                DSS.MapState.showFieldsForScenario();
                DSS.MapState.showInfraForScenario();
            })
         })

    }
    //Used to insert new infra after it is drawn
    wfs_infra_insert(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "insert", payLoad, this).then(function(returnData){
           let geoJson = returnData.geojson
           let currObj = returnData.current
           currObj.setInfrastructureSource('&CQL_filter=scenario_id='+DSS.activeScenario)
        })
   }
    //used to update the field attributes used in scenario.js and dashboardutiliites.js
    updateFieldAtt(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "insert", payLoad).then(function(returnData){
        })
    }
    //Used to populate the fields grid for a scenario
    getWFSfields(parameter = ""){
        this.makeRequest(this.geoField_Url + parameter, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
            fieldObj = geoJson.features
            fieldArray = [];
			popFieldsArray(fieldObj);
			Ext.create('Ext.data.Store', {
				storeId: 'fieldStore1',
				alternateClassName: 'DSS.FieldStore',
				fields:[ 'name', 'soilP', 'soilOM', 'rotationVal', 'rotationDisp', 'tillageVal', 'tillageDisp', 'coverCropDisp', 'coverCropVal',
					'onContour','fertPerc','manuPerc','grassSpeciesVal','grassSpeciesDisp','interseededClover', 'pastureGrazingRotCont',
					'grazeDensityVal','grazeDensityDisp','manurePastures', 'grazeDairyLactating',
					'grazeDairyNonLactating', 'grazeBeefCattle', 'area', 'perimeter'],
				data: fieldArray
			});
			DSS.field_grid.FieldGrid.setStore(Ext.data.StoreManager.lookup('fieldStore1'));
			DSS.field_grid.FieldGrid.store.reload();
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
				data: infraArray
			});
			//Setting store to just declared store fieldStore1, and reloading the store to the grid
			DSS.infrastructure_grid.InfrastructureGrid.setStore(Ext.data.StoreManager.lookup('infraStore1'));
			DSS.infrastructure_grid.InfrastructureGrid.store.reload();
        })
    }
    //used to delete a farm from geoserver.  Used several times in DeleteOperation.js to remove everthing assocaited with deleted farm
    deleteOperation(payLoad, feat){
         this.makeRequest(this.geoUpdate_Url, "delete", payLoad, this).then(function(returnData){
            let geoJson = returnData.geojson
            let currObj = returnData.current
            currObj.setScenariosSource()
            currObj.setFarmSource()
            cleanDB()
         })
    }
    //used to delete fields
    deleteField(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "delete", payLoad, this).then(function(returnData){
            let geoJson = returnData.geojson
            let currObj = returnData.current
            console.log("deleteField")
            currObj.setFieldSource().then(function(){
                console.log("redraw fields")
                DSS.MapState.showNewFarm(DSS.activeFarm);
                DSS.MapState.showFieldsForFarm(DSS.activeFarm);
                DSS.MapState.showInfrasForFarm(DSS.activeFarm);
            })
         })
    }
    //inserts new scenario based on current active scenario 
    wfs_scenario_insert(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "insert", payLoad, this).then(async function(returnData){
            var geojsonString = String(returnData.geojson)
            //This var holds onto the old activeScenario number, so that it can be referenced for copying over fields and infra
            var copyScenarioNum = parseInt(DSS.activeScenario)
            console.log(geojsonString);
            var fgid = geojsonString.substring(geojsonString.indexOf('scenarios_2.') + 12,geojsonString.lastIndexOf('"/>'));
                var intFgid = parseInt(fgid);
            console.log(intFgid);
            DSS.activeScenario = intFgid
			farmArray = [];
			DSS.MapState.removeMapInteractions()
			DSS.newScenarioID = null
            DSS.farmName = feat.values_.farm_name;
			DSS.scenarioName = feat.values_.scenario_name
			console.log(DSS.activeScenario);
            console.log(copyScenarioNum);
            console.log(fieldArrayNS);
            console.log("copying features$$$$$$$$$")
			getWFSFieldsInfraNS(copyScenarioNum,fieldArrayNS,DSS.layer.fields_1,'field_2');
			getWFSFieldsInfraNS(copyScenarioNum,infraArrayNS,DSS.layer.infrastructure,'infrastructure_2')
            //DSS.ApplicationFlow.instance.showScenarioPage();
            //gatherScenarioTableData();
            //runScenarioUpdate();
            // showInfraForScenario()
            // showFieldsForScenario()
            //DSS.ApplicationFlow.instance.showScenarioPage();
            // geoServer.setFieldSource('&CQL_filter=scenario_id='+DSS.activeScenario)
            // DSS.layer.fields_1.getSource().refresh();
	        // DSS.layer.fields_1.setVisible(true);
	        // DSS.layer.fieldsLabels.setVisible(true);
            // geoServer.setInfrastructureSource('&CQL_filter=scenario_id='+DSS.activeScenario)
	        // DSS.layer.infrastructure.getSource().refresh();
	        // DSS.layer.infrastructure.setVisible(true);
            // geoServer.setScenariosSource()
            //DSS.layer.scenarios.getSource().refresh();
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
         })
    }
    // Copies features from active scneario to new scneario when a new scenario is created
    wfs_new_scenario_features_copy(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "insert", payLoad, this).then(function(returnData){
            let currObj = returnData.current
            console.log ("wfs_new_scenario_features_copy")
            //currObj.setFieldSource()
         })

    }
    //used in delete scneario to delete assocaited fields and infra
    wfsDeleteItem(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "delete", payLoad, this).then(function(returnData){
            // let geoJson = returnData.geojson
            // let currObj = returnData.current
            // currObj.setScenariosSource()
            // console.log ("wfsDeleteItem")
            // currObj.setFieldSource('&CQL_filter=scenario_id='+DSS.activeScenario)
            // currObj.setInfrastructureSource('&CQL_filter=scenario_id='+DSS.activeScenario)
            geoServer.setScenariosSource()
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
