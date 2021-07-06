
DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')
//DSS.scenarioName = ''
//local functions to make sure selected scenario infra and fields only draw
function showFieldsForScenario() {
    	
	DSS.layer.fields_1.getSource().setUrl(
	'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:field_2&'+
	'CQL_filter=scenario_id='+DSS.activeScenario+'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857'
	);
	console.log(DSS.layer.fields_1.getStyle())
	DSS.layer.fields_1.getSource().refresh();
	console.log("showfieldsforfarm ran");
}

//----------------------------------------
function showInfraForScenario() {
	
	DSS.layer.infrastructure.getSource().setUrl(
	'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:infrastructure_2&'+
	'CQL_filter=scenario_id='+DSS.activeScenario+'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857');
	console.log(DSS.layer.infrastructure.getStyle())
	DSS.layer.infrastructure.getSource().refresh();
	console.log("showInfrasforfarm ran");
}
//-------------------------------------------------------
scenarioPickerArray = [];
function getWFSScenarioSP(farm) {
	scenarioPickerArray = [];
	console.log(DSS.activeFarm);
	var scenarioUrlSP = 
	'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:scenarios_2&' +
	'CQL_filter=farm_id='+DSS.activeFarm+'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857'
    console.log("getting wfs scenarios")
	return $.ajax({
		jsonp: false,
		type: 'GET',
		url: scenarioUrlSP,
		async: false,
		dataType: 'json',
		success:function(response)
		{
			responseObj = response
			scenObj = response.features
			console.log(responseObj);
			farmArray = [];
			itemsArray = [];
			console.log(scenObj[0]);
			popScenarioArraySP(scenObj);
			popItemsArray(scenObj);
			console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			console.log(response);
		}
	})
}

function popScenarioArraySP(obj) {
	for (i in obj)
	DSS.scenarioName = obj[i].properties.scenario_name;
	scenarioPickerArray.push({
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
	console.log(scenarioPickerArray);
	//DSS.scenarioName = scenarioPickerArray[0].scenarioName
	//DSS.farmstructure_grid.farmstructureGrid.store.reload(farmArray);
}
itemsArray = []

function popItemsArray(obj){
	for (i in obj)
	itemsArray.push({
		text:obj[i].properties.scenario_name,
		inputValue:obj[i].properties.gid,
		itemFid: obj[i].id
	})
	console.log(itemsArray);
}
getWFSScenarioSP(DSS.activeFarm)
//console.log("Picker array and items array!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
//console.log(scenarioPickerArray);


//------------------------------------------------------------------------------
Ext.define('DSS.state.ScenarioPicker', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_scenario_picker',
	
	autoDestroy: false,
	closeAction: 'hide',
	constrain: true,
	modal: true,
	width: 832,
	resizable: false,
	bodyPadding: 8,
	titleAlign: 'center',
	
	title: 'Pick The Scenario You Want to Edit',
	
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;
		getWFSScenarioSP()

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
						html: "Choose From the Scenarios Below",
					}],
					
				},
				Ext.create('Ext.menu.Menu', {
					width: 100,
					margin: '0 0 10 0',
					floating: false,  // usually you want this set to True (default)
					renderTo: Ext.getBody(),  // usually rendered by it's containing component
					items: itemsArray,
					listeners:{
						click: function( menu, item, e, eOpts ) {
							console.log(item.text);
							console.log(item.inputValue);
							DSS.activeScenario = item.inputValue;
							DSS.scenarioName = item.text;
							showFieldsForScenario()
				 			showInfraForScenario()
							DSS.ApplicationFlow.instance.showManageOperationPage();
							scenarioPickerArray = []
							this.up('window').destroy();
						}
					}
				})
			]
		});
		
		me.callParent(arguments);
		AppEvents.registerListener("viewport_resize", function(opts) {
			me.center();
		})
	},
	
});
