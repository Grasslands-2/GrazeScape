var geoserverURL = ""

class GeoServer{
    constructor() {
        this.geoFarm_Url = '/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Afarm_2&outputFormat=application%2Fjson'
        this.geoScen_Url = '/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Ascenarios_2&outputFormat=application%2Fjson'
        this.geoField_Url = '/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Afield_2&outputFormat=application%2Fjson'
        this.geoInfra_Url ='/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Ainfrastructure_2&outputFormat=application%2Fjson'
        this.geoUpdate_Url = this.geoScen_Url
    }
//    returns a geojson of the farms
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
    setFarmSource(parameter = ""){
        this.makeRequest(this.geoFarm_Url + parameter, "source_farm").then(function(geoJson){
            DSS.layer.farms_1.getSource().clear()
            var format = new ol.format.GeoJSON();
            var myGeoJsonFeatures = format.readFeatures(
                geoJson.geojson,
                {featureProjection: 'EPSG:3857'}
            );
           DSS.layer.farms_1.getSource().addFeatures(myGeoJsonFeatures)
//           DSS.layer.farms_1.getSource().refresh();
        })
    }
    //    returns a geojson of the fields
    setFieldSource(parameter = ""){
//        let url = '/geoserver/GrazeScape_Vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GrazeScape_Vector%3Afield_2&outputFormat=application%2Fjson' + parameter
        return this.makeRequest(this.geoField_Url + parameter, "source").then(function(geoJson){
            console.log(geoJson)
            geoJson = geoJson.geojson
            DSS.layer.fields_1.getSource().clear()
            DSS.layer.fieldsLabels.getSource().clear()
            var format = new ol.format.GeoJSON();
            var myGeoJsonFeatures = format.readFeatures(
                geoJson,
                {featureProjection: 'EPSG:3857'}
            );
            DSS.layer.fields_1.getSource().addFeatures(myGeoJsonFeatures)
            DSS.layer.fieldsLabels.getSource().addFeatures(myGeoJsonFeatures)
//            DSS.layer.fields_1.getSource().refresh();
//            DSS.layer.fieldsLabels.getSource().refresh();
        })

    }
    //    returns a geojson of the infrastructure
    setInfrastructureSource(parameter = ""){
        console.log(parameter)
        this.makeRequest(this.geoInfra_Url + parameter, "source").then(function(geoJson){
            DSS.layer.infrastructure.getSource().clear()
            geoJson = geoJson.geojson
                        console.log(geoJson)

            var format = new ol.format.GeoJSON();
            var myGeoJsonFeatures = format.readFeatures(
                geoJson,
                {featureProjection: 'EPSG:3857'}
            );
            DSS.layer.infrastructure.getSource().addFeatures(myGeoJsonFeatures)
//            DSS.layer.infrastructure.getSource().refresh();
        })
    }
//    get farms and ten run popfarmArray
    getWFSFarmCNO(){
         this.makeRequest(this.geoFarm_Url, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
            popfarmArrayCNO(geoJson.features)
        })
    }
    getWFSScenarioCNO(){
        this.makeRequest(this.geoScen_Url, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
            popscenarioArrayCNO(geoJson.features);
        })
    }
    getWFSScenarioSP(parameter = ''){
        this.makeRequest(this.geoScen_Url + parameter, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
			let scenObj = geoJson.features
			farmArray = [];
			itemsArray = [];
			popItemsArray(scenObj);
        })

    }
    getWFSScenario(parameter = ''){
        this.makeRequest(this.geoScen_Url + parameter, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
            scenarioObj = geoJson.features
            scenarioArray = [];
            popScenarioArray(scenarioObj);
        })
    }
    insertFarm(payLoad, feat, farmID=null){
        console.log(farmID)
        this.makeRequest(this.geoUpdate_Url, "insert_farm", payLoad, this, farmID).then(function(returnData){
//            let geoJson = returnData.geojson
            let currObj = returnData.current
//            console.log(returnData)
//            geoJson = JSON.parse(geoJson)
            currObj.setFarmSource()
			DSS.MapState.removeMapInteractions()
			DSS.activeFarm = highestFarmIdCNO + 1;
			DSS.activeScenario = highestScenarioIdCNO + 1;
			DSS.scenarioName = feat.values_.scenario_name;
			DSS.farmName = feat.values_.farm_name;
            gatherScenarioTableData()

			DSS.ApplicationFlow.instance.showScenarioPage();
			DSS.MapState.showNewFarm();
			DSS.MapState.showFieldsForFarm();
			DSS.MapState.showInfrasForFarm();
        })
    }
    wfs_field_insert(payLoad, feat, fType){
        let requestType = ""
        if (fType == "farm_2"){
            requestType = "insert_farm"
        }
         this.makeRequest(this.geoUpdate_Url, requestType, payLoad, this).then(function(returnData){
            DSS.MapState.removeMapInteractions()
            console.log(returnData)
            let geoJson = returnData.geojson
            let currObj = returnData.current
//            currObj.setFarmSource()
            currObj.setFieldSource().then(function(){
                console.log("redraw fields")
                DSS.MapState.showNewFarm(DSS.activeFarm);
                DSS.MapState.showFieldsForFarm(DSS.activeFarm);
                DSS.MapState.showInfrasForFarm(DSS.activeFarm);
            })
         })

    }
    updateFieldAtt(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "insert", payLoad).then(function(returnData){
        })

    }
    getWFSfields(parameter = ""){
        this.makeRequest(this.geoField_Url + parameter, "source").then(function(geoJson){
            geoJson = JSON.parse(geoJson.geojson)
            console.log(geoJson)
            fieldObj = geoJson.features
            fieldArray = [];
			console.log(fieldObj[0]);
			popFieldsArray(fieldObj);
			//console.log("PopFieldsArray should have fired if you are reading this")
			//placed data store in call function to make sure it was locally available.
			console.log("creating store")
			Ext.create('Ext.data.Store', {
				storeId: 'fieldStore1',
				alternateClassName: 'DSS.FieldStore',
				fields:[ 'name', 'soilP', 'soilOM', 'rotationVal', 'rotationDisp', 'tillageVal', 'tillageDisp', 'coverCropDisp', 'coverCropVal',
					'onContour','fertPerc','manuPerc','grassSpeciesVal','grassSpeciesDisp','interseededClover', 'pastureGrazingRotCont',
					'grazeDensityVal','grazeDensityDisp','manurePastures', 'grazeDairyLactating',
					'grazeDairyNonLactating', 'grazeBeefCattle', 'area', 'perimeter'],
				data: fieldArray
			});
			//Setting store to just declared store fieldStore1, and reloading the store to the grid
			DSS.field_grid.FieldGrid.setStore(Ext.data.StoreManager.lookup('fieldStore1'));
			DSS.field_grid.FieldGrid.store.reload();
			console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			//console.log('DSS.field_grid.FieldGrid')
			//console.log(DSS.field_grid.FieldGrid);
        })
    }
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
    deleteOperation(payLoad, feat){
         this.makeRequest(this.geoUpdate_Url, "delete", payLoad, this).then(function(returnData){
            let geoJson = returnData.geojson
            let currObj = returnData.current
//            cleanDB()
            currObj.setScenariosSource()
            currObj.setFarmSource()
//            currObj.setFieldSource()
//            currObj.setInfrastructureSource()
            cleanDB()
         })
    }
    wfs_infra_insert(payLoad, feat){
         this.makeRequest(this.geoUpdate_Url, "insert", payLoad, this).then(function(returnData){
            let geoJson = returnData.geojson
            let currObj = returnData.current
//            cleanDB()
//            currObj.setScenariosSource()
//            currObj.setFarmSource()
//            currObj.setFieldSource()
            currObj.setInfrastructureSource()
         })
    }
    deleteField(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "delete", payLoad, this).then(function(returnData){

            let geoJson = returnData.geojson
            let currObj = returnData.current
//            cleanDB()
//            currObj.setScenariosSource()
            currObj.setFieldSource().then(function(){
                console.log("redraw fields")
                DSS.MapState.showNewFarm(DSS.activeFarm);
                DSS.MapState.showFieldsForFarm(DSS.activeFarm);
                DSS.MapState.showInfrasForFarm(DSS.activeFarm);
            })
//            currObj.setInfrastructureSource()
         })

    }
    wfs_scenario_insert(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "insert", payLoad, this).then(function(returnData){

            let geoJson = returnData.geojson
            let currObj = returnData.current
//            cleanDB()
//            currObj.setScenariosSource()
            currObj.setFarmSource()
            currObj.setFieldSource()
//            currObj.setInfrastructureSource()


			//scenarioNumHold = DSS.activeScenario
			// current scenario

			console.log("copying features$$$$$$$$$")
			getWFSFieldsInfraNS(DSS.activeScenario,fieldArrayNS,DSS.layer.fields_1,'field_2');
			getWFSFieldsInfraNS(DSS.activeScenario,infraArrayNS,DSS.layer.infrastructure,'infrastructure_2')
            DSS.activeScenario = highestScenarioId + 1

			farmArray = [];
			scenarioArrayNS = [];
			//The commented out functions might be resourcing fields to the new scenario before it has fields
			//DSS.layer.scenarios.getSource().refresh();
			DSS.MapState.removeMapInteractions()
			scenarioArrayNS = []

			DSS.newScenarioID = null
			DSS.scenarioName = feat.values_.scenario_name
			DSS.ApplicationFlow.instance.showManageOperationPage();
			console.log(DSS.activeScenario);
         })
         }
    copyScenario(scenName, scenDes, payLoad = ""){
        this.makeRequest(this.geoScen_Url, "insert", payLoad, this).then(function(returnData){
            console.log(returnData)
            let geoJson =JSON.parse(returnData.geojson)
            let currObj = returnData.current
            geoJson = geoJson.features
            let maxScenarioId = 0;
            popscenarioArrayNS(geoJson)
            for (let feat in geoJson){
                if(geoJson[feat].properties.scenario_id>maxScenarioId ){
                    maxScenarioId = geoJson[feat].properties.scenario_id
                }
            }
            highestScenarioId = maxScenarioId
            console.log(geoJson)
            console.log(maxScenarioId)
            console.log(scenName)
            console.log(scenDes)

            createNewScenario(scenName,
                scenDes,
                highestScenarioId +1
            );
//            cleanDB()
//            farmObj = geoJson.features
////            currObj.setScenariosSource()
////            currObj.setFarmSource()
////            currObj.setFieldSource()
//            currObj.setInfrastructureSource()

        })

    }
    deleteInfra(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "delete", payLoad, this).then(function(returnData){

            let geoJson = returnData.geojson
            let currObj = returnData.current
//            cleanDB()
//            currObj.setScenariosSource()
//            currObj.setFarmSource()
//            currObj.setFieldSource()
            currObj.setInfrastructureSource()
         })

    }
    wfs_new_scenario_features_copy(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "insert", payLoad, this).then(function(returnData){
            let currObj = returnData.current
            currObj.setFieldSource()
         })

    }
    wfsDeleteItem(payLoad, feat){
        this.makeRequest(this.geoUpdate_Url, "delete", payLoad, this).then(function(returnData){

            let geoJson = returnData.geojson
            let currObj = returnData.current
//            currObj.getWFSScenarioSP('&CQL_filter=farm_id='+DSS.activeFarm)

            currObj.setScenariosSource()
//            currObj.setFarmSource()
            currObj.setFieldSource()
            currObj.setInfrastructureSource()
         })

    }
    makeRequest(url, requestType, payLoad="", currObj = null, featureID = null){
        console.log(url)
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
                    delete $.ajaxSetup().headers
                    resolve({geojson:responses.data, current:currObj})
                },

                failure: function(response, opts) {
                    me.stopWorkerAnimation();
                }
            })
        })
    }
}