
DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')

scenarioPickerArray = [];
var scenarioUrl = 
'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
'service=wfs&'+
'?version=2.0.0&'+
'request=GetFeature&'+
'typeName=GrazeScape_Vector:scenarios_2&' +
//'CQL_filter=farm_id='+DSS.activeFarm+'&&'+'scenario_id='+DSS.activeScenario+'&'+
'outputformat=application/json&'+
'srsname=EPSG:3857'
var scenario_1Source = new ol.source.Vector({
    url: scenarioUrl,
    format: new ol.format.GeoJSON()
});
function getWFSScenarioSP() {
    console.log("getting wfs scenarios")
	return $.ajax({
		jsonp: false,
		type: 'GET',
		url: scenarioUrl,
		async: false,
		dataType: 'json',
		success:function(response)
		{
			responseObj = response
			farmObj = response.features
			console.log(responseObj);
			farmArray = [];
			itemsArray = [];
			console.log(farmObj[0]);
			//popScenarioArray(farmObj);
			popItemsArray(farmObj);
			console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			console.log(response);
		}
	})
}

function popScenarioArray(obj) {

	for (i in obj)
	scenarioPickerArray.push({
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
	//DSS.farmstructure_grid.farmstructureGrid.store.reload(farmArray);
}
itemsArray = []
function popItemsArray(obj){
	for (i in obj)
	itemsArray.push({
		boxLabel:obj[i].properties.scenario_name,
		inputValue:obj[i].properties.gid,
	})
}
getWFSScenarioSP()

console.log(scenarioPickerArray);
console.log(itemsArray);

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
					items:[

				{
					xtype: 'radiogroup',
					itemId: 'contents',
					style: 'padding: 0px; margin: 0px',
					//hideEmptyLabel: true,
					columns: 1, 
					vertical: true,
					allowBlank: false,
					//bind: { value: '{modelSelected}' },
					defaults: {
						name: 'scenarioSelection'
					},
					items: itemsArray,
					listeners: {
						change: {
							 fn: function(){
								 var checked = this.getChecked()
								 console.log(checked);
								 if (checked.length == 2) {
									DSS.activeScenario = checked[1].inputValue
									console.log(DSS.activeScenario);
								 }else{
									 DSS.activeScenario = checked[0].inputValue
									console.log(DSS.activeScenario);
								}
							 }
						}
				   }
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Select Scenario',
					formBind: true,
					handler: function() {
						gatherScenarioTableData()
						getWFSScenarioSP()
						//console.log('this is the scenario picked by the user')
						//console.log(scenarioArray)
						this.up('window').destroy(); 
						
					}
			    }],
			}]
		});
		me.callParent(arguments);
		AppEvents.registerListener("viewport_resize", function(opts) {
			me.center();
		})
	},
	
});
