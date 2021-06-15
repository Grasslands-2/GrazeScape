
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
'outputformat=application/json&'+
'srsname=EPSG:3857'
//declaring farm source var
var farms_1Source = new ol.source.Vector({
    url: farmUrl,
    format: new ol.format.GeoJSON()
});
var scenario_1SourceNS = new ol.source.Vector({
    url: scenarioUrlNS,
    format: new ol.format.GeoJSON()
});
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
		url: scenarioUrl,
		async: false,
		dataType: 'json',
		success:function(response)
		{
			scenarioObj = response.features
			console.log(scenarioObj[0])
		}
	})
}
//empty array to catch feature objects 
farmArray = [];
scenarioArray = [];
// call getWFSFarm to get farm table object
//getWFSFarm()
//define function to populate data array with farm table data
function popFarmArray(obj) {
	for (i in obj) 
	farmArray.push({
		id: obj[i].id,
		gid: obj[i].properties.gid,
		name: obj[i].properties.farm_name
	});
}
function popScenarioArrayNS(obj) {
	for (i in obj) 
	scenarioArray.push({
		id: obj[i].id,
		gid: obj[i].properties.gid,
		name: obj[i].properties.farm_name
	});
}
//populate data array with farm object data from each farm
//popArray(farmObj);
//var to hold onto largest gid value of current farms before another is added
highestFarmId = 0;
highestScenarioId = 0;
//loops through data array gids to find largest value and hold on to it with highestfarmid

function getHighestFarmId(){
	getWFSFarm()
	popFarmArray(farmObj);
	for (i in farmArray){
		//console.log(farmArray[i].gid)
		if (farmArray[i].gid > highestFarmId){
			highestFarmId = farmArray[i].gid
		};
	};
}
function getHighestScenarioId(){
	getWFSScenarioNS()
	popScenarioArrayNS(scenarioObj);
	for (i in scenarioArray){
		//console.log(farmArray[i].gid)
		if (scenarioArray[i].gid > highestScenarioId){
			highestScenarioId = scenarioArray[i].gid
		};
	};
}
getHighestFarmId()
getHighestScenarioId()
//highestFarmId = 0
console.log(highestFarmId);
console.log(highestScenarioId);


//---------------------------------Working Functions-------------------------------
function wfs_scenario_insert(feat,geomType,fType) {  
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/GrazeScape_Vector',
		Geometry: 'geom',
        featureType: fType,
        srsName: 'EPSG:3857'
    });
    console.log(feat)
	console.log(feat.values_.id)
    node = formatWFS.writeTransaction([feat], null, null, formatGML);
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
			DSS.layer.farms_1.getSource().refresh();
			DSS.layer.scenarios.getSource().refresh();
			DSS.MapState.removeMapInteractions()
			//getHighestFarmId();
			getHighestScenarioId();
			console.log(highestScenarioId);
			DSS.activeScenario = highestScenarioId;
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
	DSS.layer.scenarios.getSource().forEachFeature(function(f) {
		var newScenarioFeature = f;
		console.log(newScenarioFeature);
		console.log("from scenario features loop through: " + newScenarioFeature.values_.gid);
		for (i in scenarioArray){
			console.log("scenarioArray id: " + scenarioArray[i].gid);
			if(scenarioArray[i].gid === newScenarioFeature.values_.gid){
				console.log(scenarioArray[i].scenarioName);
				newScenarioFeature.setProperties({
					scenario_name:sname,
					scenario_desp:sdescript,
					scenario_id: snewhighID
				});
		var geomType = 'point'
		wfs_scenario_insert(newScenarioFeature, geomType,'scenarios_2')
		console.log("HI! WFS new scenario Insert ran!")
			}
		}
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
								console.log(form.findField('scenario_name').value)
								console.log('this is the scenario picked by the user geom')
								console.log(scenarioArray)
								console.log('highest farm id: '+highestFarmId);
								console.log('highest scenario id: '+highestScenarioId);
								newHighestScenarioId = highestScenarioId + 1
								console.log('new highest scenario id: '+ newHighestScenarioId);
								//getHighestFarmId()
								//getHighestScenarioId()
								createNewScenario(form.findField('scenario_name').getSubmitValue(),
									form.findField('scenario_description').getSubmitValue(),
									newHighestScenarioId
									);
								//gatherScenarioTableData()
								this.up('window').destroy(); 
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
