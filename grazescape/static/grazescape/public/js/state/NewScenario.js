
//DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')
//--------------Geoserver WFS source connection-------------------
//wfs farm layer url for general use
var scenarioObj = {};
var scenarioUrlNS = 
'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
'service=wfs&'+
'?version=2.0.0&'+
'request=GetFeature&'+
'typeName=GrazeScape_Vector:scenarios_2&' +
//'CQL_filter=farm_id='+DSS.activeFarm+'&'+
'outputformat=application/json&'+
'srsname=EPSG:3857'

fieldUrlNS = 
'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
'service=wfs&'+
'?version=2.0.0&'+
'request=GetFeature&'+
'typeName=GrazeScape_Vector:field_2&' +
'CQL_filter=scenario_id='+DSS.activeScenario+'&'+
'outputformat=application/json&'+
'srsname=EPSG:3857';

infraUrlNS = 
'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
'service=wfs&'+
'?version=2.0.0&'+
'request=GetFeature&'+
'typeName=GrazeScape_Vector:infrastructure_2&' +
'CQL_filter=scenario_id='+DSS.activeScenario+'&'+
'outputformat=application/json&'+
'srsname=EPSG:3857';
//--------------------------------------------
//declaring farm source var
var farms_1Source = new ol.source.Vector({
    url: farmUrl,
    format: new ol.format.GeoJSON()
});
var scenario_1SourceNS = new ol.source.Vector({
    url: scenarioUrlNS,
    format: new ol.format.GeoJSON()
});
var field_1SourceNS = new ol.source.Vector({
    url: fieldUrlNS,
    format: new ol.format.GeoJSON()
});
var infrastructureSourceNS = new ol.source.Vector({
    url: infraUrlNS,
    format: new ol.format.GeoJSON()
});
newScenarioName = ''
//console.log(field_1SourceNS)
//bring in farm layer table as object for iteration
function getWFSFarm() {
	return $.ajax({
		jsonp: false,
		type: 'GET',
		url: farmUrl,
		async: false,
		dataType: 'json',
		success:function(response)
		{
			farmObj = response.features
			console.log(farmObj[0])
		}
	})
}
//bring in farm layer table as object for iteration
function getWFSScenarioNS() {
	return $.ajax({
		jsonp: false,
		type: 'GET',
		url: scenarioUrlNS,
		async: false,
		dataType: 'json',
		success:function(response)
		{
			scenarioObj = response.features
			console.log(scenarioObj)
			popscenarioArrayNS(scenarioObj);
		}
	})
}
fieldArrayNS = []
infraArrayNS = []
//get current field features to copy over to new scenario
async function getWFSFieldsInfraNS(copyScenarioNum,featArray,layerName,layerTitle) {
    console.log("getting wfs fields and infra for new scenario")
	//layerName.setSource(source);
		layerName.getSource().forEachFeature(function(f){
		console.log("current features scenario ID: " + f.values_.scenario_id);
		console.log("Scenario being pulled from: " + copyScenarioNum);
		if(f.values_.scenario_id == copyScenarioNum){
			delete f.id_
			f.geometryName_ = 'geom'
			f.values_.scenario_id = highestScenarioId;
			f.values_.geom = f.values_.geometry;
			delete f.values_.geometry
			console.log(f);
			featArray.push(f);
		}
		//-----------------------------------
		//Figured out that the geom was being taken from geometry in values_!!!!!!
		//We can use this to copy exact geometry, thus creating exact copies of feautres
		
		})
		console.log('featArrayNS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
		console.log(featArray);
		await wfs_new_scenario_features_copy(featArray,layerTitle)
		// for(i in featArray){
		// 	await wfs_new_scenario_features_copy(featArray[i],layerTitle)
		// }
}

//empty array to catch feature objects 
// call getWFSFarm to get farm table object
//getWFSFarm()
//define function to populate data array with farm table data
function popFarmArray(obj) {
	for (i in obj) 
	farmArray.push({
		id: obj[i].properties.id,
		gid: obj[i].properties.gid,
		name: obj[i].properties.farm_name
	});
}
function popscenarioArrayNS(obj) {
	for (i in obj) 
	scenarioArrayNS.push({
		fid: obj[i].id,
		gid: obj[i].properties.gid,
		geom: obj[i].geometry,
		scenarioId:obj[i].properties.scenario_id,
		scenarioName:obj[i].properties.scenario_name,
		scenarioDesp:obj[i].properties.scenario_desp,
		farmId: obj[i].properties.farm_id,
		farmName: obj[i].properties.farm_name,
		lacCows: obj[i].properties.lac_cows,
		dryCows: obj[i].properties.dry_cows,
		heifers: obj[i].properties.heifers,
		youngStock: obj[i].properties.youngstock,
		beefCows: obj[i].properties.beef_cows,
		stockers: obj[i].properties.stockers,
		finishers: obj[i].properties.finishers,
		aveMilkYield: obj[i].properties.ave_milk_yield,
		aveDailyGain: obj[i].properties.ave_daily_gain,
		lacMonthsConfined: obj[i].properties.lac_confined_mos,
		dryMonthsConfined: obj[i].properties.dry_confined_mos,
		beefMonthsConfined: obj[i].properties.beef_confined_mos,
		lacGrazeTime: obj[i].properties.lac_graze_time,
		dryGrazeTime: obj[i].properties.dry_graze_time,
		beefGrazeTime: obj[i].properties.beef_graze_time,
		lacRotateFreq: obj[i].properties.lac_rotate_freq,
		dryRotateFreq: obj[i].properties.dry_rotate_freq,
		beefRotateFreq: obj[i].properties.beef_rotate_freq,
	});
	console.log(scenarioArrayNS)
}
//populate data array with farm object data from each farm
//popArray(farmObj);
//var to hold onto largest id value of current farms before another is added
highestFarmId = 0;
highestScenarioId = 0;
//loops through data array ids to find largest value and hold on to it with highestfarmid

function getHighestFarmId(){
	getWFSFarm()
	popFarmArray(farmObj);
	for (i in farmArray){
		console.log(farmArray[i].id)
		if (farmArray[i].id > highestFarmId){
			highestFarmId = farmArray[i].id
			console.log('hightestFarmId after getHighestFarmId run: ' + highestFarmId)
		};
	};
}
function rerunPopScenarioArrayNS(){
	getWFSScenarioNS();
	//popscenarioArrayNS(scenarioObj);
}
function getHighestScenarioId(){
	getWFSScenarioNS();
	//popscenarioArrayNS(scenarioObj);
	for (i in scenarioArrayNS){
		console.log(scenarioArrayNS[i].scenarioId)
		console.log(highestScenarioId)
		if (scenarioArrayNS[i].scenarioId > highestScenarioId){
			highestScenarioId = scenarioArrayNS[i].scenarioId
			console.log('hightestScenarioId after getHighestScenarioId run: ' + highestScenarioId)
		};
	};
}
//Do we need to call these?  I guess it doesnt hurt in the mean time.
//getHighestFarmId()
//getHighestScenarioId()
//highestFarmId = 0
console.log(highestFarmId);
console.log(highestScenarioId);


//---------------------------------Working Functions-------------------------------
function wfs_new_scenario_features_copy(featsArray,fType) {
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/GrazeScape_Vector',
		Geometry: 'geom',
        featureType: fType,
        srsName: 'EPSG:3857'
    });
    console.log(featsArray)
	//console.log(feat.values_.id)
	//keep in mind formatWFS.writeTransaction needs feat in an [].  
	//feat in this case is actually an array so it works out.
    node = formatWFS.writeTransaction(featsArray, null, null, formatGML);
	node.geom = node.geometry
	console.log(node);
    s = new XMLSerializer();
    str = s.serializeToString(node);
    console.log(str);
    $.ajax('http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?',
	{
        type: 'POST',
        dataType: 'xml',
        processData: false,
        contentType: 'text/xml',
        data: str,
		success: function (response) {
			console.log("uploaded data successfully!: "+ response);
			console.log(response)
			// DSS.layer.fields_1.getSource().refresh();
			// DSS.layer.fieldsLabels.getSource().refresh();
			// DSS.layer.infrastructure.getSource().refresh();
			console.log("copied field or infra over for feat: ");
		},
        error: function (xhr, exception) {
            var msg = "";
            if (xhr.status === 0) {
                msg = "Not connect.\n Verify Network." + xhr.responseText;
            } else if (xhr.status == 404) {
                msg = "Requested page not found. [404]" + xhr.responseText;
            } else if (xhr.status == 500) {
                msg = "Internal Server Error [500]." +  xhr.responseText;
            } else if (exception === "parsererror") {
                msg = "Requested JSON parse failed.";
            } else if (exception === "timeout") {
                msg = "Time out error." + xhr.responseText;
            } else if (exception === "abort") {
                msg = "Ajax request aborted.";
            } else {
                msg = "Error:" + xhr.status + " " + xhr.responseText;
            }
			console.log(msg);
        }
    }).done();
}

function wfs_scenario_insert(feat,geomType,fType) {
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/GrazeScape_Vector',
		Geometry: 'geom',
        featureType: fType,
        srsName: 'EPSG:3857'
    });
    console.log('wfs_scenario_insert feature: '+feat)
	//console.log(feat.values_.id)
    node = formatWFS.writeTransaction([feat], null, null, formatGML);
	console.log('feature node: '+node);
    s = new XMLSerializer();
    str = s.serializeToString(node);
    console.log('Transaction xml: '+str);
    $.ajax('http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?',
	{
        type: 'POST',
        dataType: 'xml',
        processData: false,
        contentType: 'text/xml',
        data: str,
		success: function (response) {
			console.log("uploaded data successfully!: "+ response);
			//scenarioNumHold = DSS.activeScenario
			//getWFSFieldsInfraNS(scenarioNumHold);
			getWFSFieldsInfraNS(scenarioNumHold,fieldArrayNS,DSS.layer.fields_1,'field_2');
			getWFSFieldsInfraNS(scenarioNumHold,infraArrayNS,DSS.layer.infrastructure,'infrastructure_2')
			farmArray = [];
			scenarioArrayNS = [];
			//The commented out functions might be resourcing fields to the new scenario before it has fields
			DSS.layer.farms_1.getSource().refresh();
			DSS.layer.scenarios.getSource().refresh();
			DSS.MapState.removeMapInteractions()
			//getHighestFarmId();
			scenarioArrayNS = []
			getHighestScenarioId();
			console.log(highestScenarioId);
			DSS.activeScenario = highestScenarioId;
			DSS.scenarioName = feat.values_.scenario_name
			DSS.ApplicationFlow.instance.showManageOperationPage();
			console.log(DSS.activeScenario);
			
		},
        error: function (xhr, exception) {
            var msg = "";
            if (xhr.status === 0) {
                msg = "Not connect.\n Verify Network." + xhr.responseText;
            } else if (xhr.status == 404) {
                msg = "Requested page not found. [404]" + xhr.responseText;
            } else if (xhr.status == 500) {
                msg = "Internal Server Error [500]." +  xhr.responseText;
            } else if (exception === "parsererror") {
                msg = "Requested JSON parse failed.";
            } else if (exception === "timeout") {
                msg = "Time out error." + xhr.responseText;
            } else if (exception === "abort") {
                msg = "Ajax request aborted.";
            } else {
                msg = "Error:" + xhr.status + " " + xhr.responseText;
            }
			console.log(msg);
        }
    }).done();
}
function createNewScenario(sname,sdescript,snewhighID){
	console.log('in createnewscenario')
	//rerunPopScenarioArrayNS();
	console.log('scenarioArrayNS at start of createnewscenario: ');
	console.log(scenarioArrayNS)
	console.log('current active scenario #: '+ DSS.activeScenario);
	DSS.layer.scenarios.getSource().forEachFeature(function(f) {
		var newScenarioFeature = f;
		f.values_.geom = f.values_.geometry;
		console.log(newScenarioFeature.values_.scenario_id)
		//DSS.layer.scenarios.getSource().forEachFeature does always run through all features, so whatever it gets is used as a template.
		//scenario values are hardcoded in below.
		//this isnt the most efficient way to work this, but it works.  revisit later
		console.log("from scenario features loop through: " + newScenarioFeature);
		if(newScenarioFeature.values_.scenario_id == DSS.activeScenario){
			for (i in scenarioArrayNS){
				console.log("scenarioArrayNS scenario_id: " + scenarioArrayNS[i].scenarioId);
				if(scenarioArrayNS[i].scenarioId == DSS.activeScenario){
					console.log('ActiveScenario, scenarios feature scenario_id, and scenarioarray scenarioId line up!!!!!!!!!!!!!!!');
					console.log('Base object for new scenario:')
					console.log(newScenarioFeature)
					newScenarioFeature.setProperties({
						scenario_name:sname,
						scenario_desp:sdescript,
						scenario_id: snewhighID,
						farm_id: DSS.activeFarm,
						farm_name:DSS.farmName,
						lac_cows:scenarioArrayNS[i].lacCows,
						dry_cows: scenarioArrayNS[i].dryCows,
						heifers: scenarioArrayNS[i].heifers,
						youngstock: scenarioArrayNS[i].youngStock,
						beef_cows: scenarioArrayNS[i].beefCows,
						stockers: scenarioArrayNS[i].stockers,
						finishers: scenarioArrayNS[i].finishers,
						ave_milk_yield: scenarioArrayNS[i].aveMilkYield,
						ave_daily_gain:scenarioArrayNS[i].aveDailyGain,
						lac_confined_mos: scenarioArrayNS[i].lacMonthsConfined,
						dry_confined_mos: scenarioArrayNS[i].dryMonthsConfined,
						beef_confined_mos: scenarioArrayNS[i].beefMonthsConfined,
						lac_graze_time: scenarioArrayNS[i].lacGrazeTime,
						dry_graze_time: scenarioArrayNS[i].dryGrazeTime,
						beef_graze_time: scenarioArrayNS[i].beefGrazeTime,
						lac_rotate_freq: scenarioArrayNS[i].lacRotateFreq,
						dry_rotate_freq: scenarioArrayNS[i].dryRotateFreq,
						beef_rotate_freq: scenarioArrayNS[i].beefRotateFreq
					});
					console.log('Object to be inserted:');
					console.log(newScenarioFeature)
					var geomType = 'point'
					wfs_scenario_insert(newScenarioFeature, geomType,'scenarios_2')
					//currently calling getwfsfields here to save runs.  this func will call
					//insert for fields.  can do better job organizing later
					//getWFSFieldsInfraNS();
					console.log("HI! WFS new scenario Insert ran!")
					break;
				}else{}
			}
		}else{}
	})
}

//------------------working variables--------------------
var type = "Point";
var source = farms_1Source;

//------------------------------------------------------------------------------
Ext.define('DSS.state.NewScenario', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_new_scenario',
	
	autoDestroy: false,
	closeAction: 'hide',
	constrain: true,
	modal: true,
	width: 832,
	resizable: false,
	bodyPadding: 8,
	titleAlign: 'center',
	
	title: 'Set up your new Scenario!',
	
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		Ext.applyIf(me, {
			items: [{
					xtype: 'container',
					width: '100%',
					layout: 'absolute',
					items: [{
						xtype: 'component',
						x: 0, y: -6,
						width: '100%',
						height: 28,
						cls: 'information accent-text bold',
						//html: "Choose From the Scenarios Below",
					}],
					
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
						text: 'Create New Scenario',
						formBind: true,
						handler: function() { 
							console.log('new scenario button pushed')
							var form = this.up('form').getForm();
							if (form.isValid()) {
								farmArray = [];
								scenarioArrayNS = [];
								fieldArrayNS = []
								infraArrayNS = []
								getHighestFarmId()
								getHighestScenarioId()
								scenarioNumHold = DSS.activeScenario
								console.log('highest farm id: '+highestFarmId);
								console.log('highest scenario id: '+highestScenarioId);
								highestScenarioId = highestScenarioId + 1
								console.log('new highest scenario id: '+ highestScenarioId);
								createNewScenario(form.findField('scenario_name').getSubmitValue(),
									form.findField('scenario_description').getSubmitValue(),
									highestScenarioId
									);
								//DSS.activeScenario = highestScenarioId;
								this.up('window').destroy();
								// DSS.layer.fields_1.getSource().refresh();
								// DSS.layer.fieldsLabels.getSource().refresh();
								// DSS.layer.infrastructure.getSource().refresh();
								//DSS.activeScenario = highestScenarioId;
								// DSS.scenarioName = newScenarioName
								// DSS.ApplicationFlow.instance.showManageOperationPage();
							}
						}
					}],
				}]
		});
		me.callParent(arguments);
		AppEvents.registerListener("viewport_resize", function(opts) {
		//	me.center();
		})
	},
	
});
