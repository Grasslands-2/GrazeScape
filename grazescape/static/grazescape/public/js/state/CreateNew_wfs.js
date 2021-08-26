
DSS.utils.addStyle('.underlined-input { border: none; border-bottom: 1px solid #ddd; display:table; width: 100%; height:100%; padding: 0 0 2px}')   
DSS.utils.addStyle('.underlined-input:hover { border-bottom: 1px solid #7ad;}')
DSS.utils.addStyle('.right-pad { padding-right: 32px }')   

//--------------Geoserver WFS source connection-------------------
//wfs farm layer url for general use
var scenarioObj = {};
var farmUrl = 

function showNewFarm() {
//	DSS.layer.farms_1.getSource().setUrl(
//	geoserverURL + '/geoserver/wfs?'+
//	'service=wfs&'+
//	'?version=2.0.0&'+
//	'request=GetFeature&'+
//	'typeName=GrazeScape_Vector:farm_2&'+
//	//'CQL_filter=id='+DSS.activeFarm+'&'+
//	'outputformat=application/json&'+
//	'srsname=EPSG:3857'
//	);
    geoServer.setFarmSource()
	DSS.layer.farms_1.setOpacity(1);
	console.log(DSS.layer.farms_1.getStyle())
	console.log(DSS.layer.farms_1.getSource())
	DSS.layer.farms_1.getSource().refresh();
	console.log(DSS.activeFarm)
	console.log("show new farm ran");
}
//bring in farm layer table as object for iteration
//bring in farm layer table as object for iteration
//empty array to catch feature objects
farmArrayCNO = [];
scenarioArrayCNO = [];

//define function to populate data array with farm table data
function popfarmArrayCNO(obj) {
	console.log('running popfarmArrayCNO')
	console.log(obj)
	for (i in obj) {
//		console.log(obj[i].properties.id)
		farmArrayCNO.push({
			id: obj[i].properties.id,
			gid: obj[i].properties.gid,
			name: obj[i].properties.farm_name
		})
	};
	for (i in farmArrayCNO){
		if (farmArrayCNO[i].id > highestFarmIdCNO){
			highestFarmIdCNO = farmArrayCNO[i].id
//			console.log(highestFarmIdCNO);
		};
	};
	console.log('popfarmArrayCNO Completed')
}
function popscenarioArrayCNO(obj) {
	console.log('running popscenarioArrayCNO')
	for (i in obj){ 
//		console.log(obj[i].properties.scenario_id)
		scenarioArrayCNO.push({
			id: obj[i].id,
			gid: obj[i].properties.gid,
			name: obj[i].properties.farm_name,
			scenarioId:obj[i].properties.scenario_id
		})
	};
	for (i in scenarioArrayCNO){
		if (scenarioArrayCNO[i].scenarioId > highestScenarioIdCNO){
			highestScenarioIdCNO = scenarioArrayCNO[i].scenarioId
		};
	};
	console.log('popscenarioArrayCNO Completed')
}
//populate data array with farm object data from each farm
//popArray(farmObj);
//var to hold onto largest gid value of current farms before another is added
highestFarmIdCNO = 0;
highestScenarioIdCNO = 0;
//loops through data array gids to find largest value and hold on to it with highestFarmIdCNO

function gethighestFarmIdCNO(){
	console.log('running gethighestFarmIDCNO')
//	getWFSFarmCNO()
	geoServer.getWFSFarmCNO()
	//popfarmArrayCNO(farmObj);
	// for (i in farmArrayCNO){
	// 	if (farmArrayCNO[i].id > highestFarmIdCNO){
	// 		highestFarmIdCNO = farmArrayCNO[i].id
	// 		console.log(highestFarmIdCNO);
	// 	};
	// };
}
function gethighestScenarioIdCNO(){
	console.log('running gethighestScenarioIDCNO')
//	getWFSScenarioCNO()
	geoServer.getWFSScenarioCNO()
	//popscenarioArrayCNO(scenarioObj);
	// for (i in scenarioArrayCNO){
	// 	if (scenarioArrayCNO[i].scenarioId > highestScenarioIdCNO){
	// 		highestScenarioIdCNO = scenarioArrayCNO[i].scenarioId
	// 		console.log(highestScenarioIdCNO);
	// 	};
	// };
}
gethighestFarmIdCNO()
gethighestScenarioIdCNO()

//highestFarmIdCNO = 0
console.log(highestFarmIdCNO);
console.log(highestScenarioIdCNO);


//---------------------------------Working Functions-------------------------------
function wfs_farm_insert(feat,geomType,fType) {  
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/GrazeScape_Vector'
		/*'http://geoserver.org/Farms'*/,
		//Geometry: 'geom',
        featureType: fType,
        srsName: 'EPSG:3857'
    });
    console.log(feat)
	//console.log(feat.values_.id)
    node = formatWFS.writeTransaction([feat], null, null, formatGML);
	console.log(node);
    s = new XMLSerializer();
    str = s.serializeToString(node);
    console.log(str);
    geoServer.insertFarm(str, feat)
//    $.ajax(geoserverURL + '/geoserver/wfs?'
//	/*'http://localhost:8081/geoserver/wfs?'*/,{
//        type: 'POST',
//        dataType: 'xml',
//        processData: false,
//        contentType: 'text/xml',
//        data: str,
//		success: function (response) {
//			console.log("uploaded data successfully!: ");
//			console.log(response)
//			// DSS.layer.farms_1.getSource().refresh();
//			// DSS.layer.scenarios.getSource().refresh();
//			DSS.MapState.removeMapInteractions()
//			console.log(highestFarmIdCNO);
//			DSS.activeFarm = highestFarmIdCNO + 1;
//			DSS.activeScenario = highestScenarioIdCNO + 1;
//			DSS.scenarioName = feat.values_.scenario_name;
//			DSS.farmName = feat.values_.farm_name;
//			console.log("Current active farm!: " + DSS.activeFarm);
//			console.log("Current active Scenario!: " + DSS.activeScenario);
//			DSS.ApplicationFlow.instance.showScenarioPage();
//			//DSS.ApplicationFlow.instance.showManageOperationPage();
//			//commented out to go straight to scneario page using showscenariopage

//			DSS.layer.farms_1.getSource().refresh();
//			DSS.layer.scenarios.getSource().refresh();
//			DSS.MapState.showNewFarm();
//			DSS.MapState.showFieldsForFarm();
//			DSS.MapState.showInfrasForFarm();
//
//			//reSourcescenarios()
//
//		},
//        error: function (xhr, exception) {
//            var msg = "";
//            if (xhr.status === 0) {
//                msg = "Not connect.\n Verify Network." + xhr.responseText;
//            } else if (xhr.status == 404) {
//                msg = "Requested page not found. [404]" + xhr.responseText;
//            } else if (xhr.status == 500) {
//                msg = "Internal Server Error [500]." +  xhr.responseText;
//            } else if (exception === "parsererror") {
//                msg = "Requested JSON parse failed.";
//            } else if (exception === "timeout") {
//                msg = "Time out error." + xhr.responseText;
//            } else if (exception === "abort") {
//                msg = "Ajax request aborted.";
//            } else {
//                msg = "Error:" + xhr.status + " " + xhr.responseText;
//            }
//			console.log(msg);
//        }
//    }).done();
}
function createFarm(fname,fowner,faddress,sname,sdescript){

	let me = this;
	DSS.MapState.removeMapInteractions()
	DSS.mapClickFunction = undefined;
	DSS.mouseMoveFunction = undefined;
	DSS.draw = new ol.interaction.Draw({
		//source: source,
		type: 'Point',
		geometryName: 'geom'
	});
	DSS.map.addInteraction(DSS.draw);
	console.log("draw is on");
	console.log(DSS.draw);
	DSS.draw.on('drawend', function (e) {

		console.log(e)
		//DSS.map.getView().fit(e);
		e.feature.setProperties({
			//plugs in highestFarmIdCNO and gives it an id +1 to make sure its unique
			id: highestFarmIdCNO + 1,
			farm_name: fname,
			farm_owner: fowner,
			farm_addre: faddress,
			scenario_id: highestScenarioIdCNO + 1,
			farm_name: fname,
			farm_owner: fowner,
			farm_id: highestFarmIdCNO + 1,
			farm_addre: faddress,
			scenario_name: sname,
			scenario_desp: sdescript
		})
		var geomType = 'point'
		wfs_farm_insert(e.feature, geomType,'farm_2')
		wfs_farm_insert(e.feature, geomType,'scenarios_2')
		console.log("HI! WFS farm Insert ran!")

		//DSS.layer.farms_1.getSource().refresh();
		//DSS.layer.scenarios.getSource().refresh();
		//reSourcescenarios()
		//showNewFarm()
	})     
}


//------------------working variables--------------------
var type = "Point";
//var source = farms_1Source;

//---------------------------Create New Farm Container, and component declaration---------------
Ext.define('DSS.state.CreateNew_wfs', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.operation_create',

	layout: DSS.utils.layout('vbox', 'center', 'stretch'),
	cls: 'section',

	DSS_singleText: '"Start by creating a new operation"',
					
	//--------------------------------------------------------------------------
	initComponent: function(map) {
		let me = this;

		Ext.applyIf(me, {
			defaults: {
				margin: '2rem',
			},
			items: [{
				xtype: 'container',
				layout: DSS.utils.layout('hbox', 'start', 'begin'),
				items: [{
					xtype: 'component',
					cls: 'back-button',
					tooltip: 'Back',
					html: '<i class="fas fa-reply"></i>',
					listeners: {
						render: function(c) {
							c.getEl().getFirstChild().el.on({
								click: function(self) {
									DSS.ApplicationFlow.instance.showLandingPage();
								}
							});
						}
					}					
				},{
					xtype: 'component',
					flex: 1,
                    itemId: 'create_farm',
					cls: 'section-title accent-text right-pad',
					html: 'Create New',
				}]
			},
            { 
				xtype: 'component',
				cls: 'information',
				html: 'Fill in operation info in the form below, then select operation location on map'
			},{
				xtype: 'form',
				url: 'create_operation',
				jsonSubmit: true,
				header: false,
				border: false,
				layout: DSS.utils.layout('vbox', 'center', 'stretch'),
				margin: '8 0',
				defaults: {
					xtype: 'textfield',
					labelAlign: 'right',
					labelWidth: 70,
					triggerWrapCls: 'underlined-input',
				},
				items: [{
					fieldLabel: 'Operation',
					name: 'operation',
					allowBlank: false,
					value: me.DSS_operation,
					margin: '10 0',
					padding: 4,
				},{
					fieldLabel: 'Owner',
					name: 'owner',
					allowBlank: false,
					margin: '10 0',
					padding: 4,
				},{
					fieldLabel: 'Address',
					name: 'address',
                    allowBlank: false,
					margin: '12 0',
					padding: 4,
            	},{
					fieldLabel: 'Scenario Name',
					name: 'scenario_name',
                    allowBlank: false,
					margin: '12 0',
					padding: 4,
            	},{
					fieldLabel: 'Scenario Description',
					name: 'scenario_description',
                    allowBlank: false,
					margin: '12 0',
					padding: 4,
            	},{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Place Operation',
					formBind: true,
					handler: function() { 
						var form = this.up('form').getForm();
						if (form.isValid()) {
							// DSS.MapState.removeMapInteractions()
							// DSS.mapClickFunction = undefined;
							// DSS.mouseMoveFunction = undefined;
							gethighestFarmIdCNO();
							gethighestScenarioIdCNO();
							createFarm(form.findField('operation').getSubmitValue(),
							form.findField('owner').getSubmitValue(),
							form.findField('address').getSubmitValue(),
							form.findField('scenario_name').getSubmitValue(),
							form.findField('scenario_description').getSubmitValue());
							//showNewFarm()
						}
			        }
				}],
			}]
		});	
		me.callParent(arguments);
	},
	//------------------------------------------------------------------
});