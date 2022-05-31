DSS.newScenarioID = null
//DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')
//--------------Geoserver WFS source connection-------------------
//wfs farm layer url for general use
var scenarioObj = {};
var scenarioUrlNS = 
fieldUrlNS = ""
infraUrlNS = ""
newScenarioName = ''
function getWFSFarm() {
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
			popScenarioArray(scenarioObj);
		}
	})
}
fieldArrayNS = []
infraArrayNS = []
//get current field features to copy over to new scenario
async function getWFSFieldsInfraNS(copyScenarioNum,featArray,layerName,layerTitle) {
    console.log("getting wfs fields and infra for new scenario")
	//layerName.setSource(source);
	console.log("Scenario being pulled from: " + copyScenarioNum);
		await layerName.getSource().getFeatures().forEach(async function(f){
            console.log("current features scenario ID: " + f.values_.scenario_id);
            if(f.values_.scenario_id == copyScenarioNum){
				console.log("current features scenario ID: " + f.values_.scenario_id);
                //delete f.id_
                f.geometryName_ = 'geom'
                f.values_.scenario_id = DSS.activeScenario;
                f.values_.geom = f.values_.geometry;
                //delete f.values_.geometry
                f.values_.is_dirty = true
                //console.log(f);
                featArray.push(f);
				//wfs_new_scenario_features_copy([f],layerTitle)
            }
		//-----------------------------------
		//Figured out that the geom was being taken from geometry in values_!!!!!!
		//We can use this to copy exact geometry, thus creating exact copies of feautres
		
		})
}

function popFarmArray(obj) {
	for (i in obj) 
	farmArray.push({
		id: obj[i].properties.id,
		gid: obj[i].properties.gid,
		name: obj[i].properties.farm_name
	});
}

highestFarmId = 0;
highestScenarioId = 0;
//loops through data array ids to find largest value and hold on to it with highestfarmid


//---------------------------------Working Functions-------------------------------
async function wfs_new_scenario_features_copy(featsArray,fType) {
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/GrazeScape_Vector',
		Geometry: 'geom',
        featureType: fType,
        srsName: 'EPSG:3857'
    });
    console.log(featsArray)
	console.log(fType)
	//console.log(feat.values_.id)
	//keep in mind formatWFS.writeTransaction needs feat in an [].  
	//feat in this case is actually an array so it works out.
    node = formatWFS.writeTransaction(featsArray, null, null, formatGML);
	node.geom = node.geometry
	console.log(node);
    s = new XMLSerializer();
    str = s.serializeToString(node);

    await geoServer.wfs_new_scenario_features_copy(str, featsArray)

}

function wfs_scenario_insert(feat,geomType,fType) {
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/GrazeScape_Vector',
		Geometry: 'geom',
        featureType: fType,
        srsName: 'EPSG:3857'
    });
    console.log('wfs_scenario_ins feature: ')
	console.log(feat)
	//console.log(feat.values_.id)
    node = formatWFS.writeTransaction([feat], null, null, formatGML);
	console.log('feature node: '+node);
    s = new XMLSerializer();
    str = s.serializeToString(node);
    console.log(node);
    geoServer.wfs_scenario_insert(str, feat)
}
function createNewScenario(sname,sdescript){
	console.log('in createnewscen')
	console.log('scenarioArray at start of createnewscen: ');
	console.log(scenarioArray)
	console.log('current active scenario #: '+ DSS.activeScenario);
	if (typeof DSS.activeScenario == 'undefined' || DSS.activeScenario == null){
		console.log("in active scenario undefined if");
		//set up the active farm geom to be the geom for this new scenario
		DSS.layer.farms_1.getSource().getFeatures().forEach(function(f) {
			var newScenarioFeature = f;
			f.values_.geom = f.values_.geometry;
			if(newScenarioFeature.values_.gid == DSS.activeFarm){
				console.log("found actuve farm object!");
				newScenarioFeature.setProperties({
					scenario_name:sname,
					scenario_desp:sdescript,
					//scenario_id: 9999,
					//scenario_id: snewhighID,
					farm_id: DSS.activeFarm,
					farm_name:DSS.farmName,
					corn_seed_cost: 80.5,
					corn_pest_cost: 55.64,
					corn_mach_cost: 123,
					soy_seed_cost: 54,
					soy_pest_cost: 40,
					soy_mach_cost: 62,
					grass_seed_cost: 25.15,
					grass_pest_cost: 2.62,
					grass_mach_cost: 17.05,
					oat_seed_cost: 30,
					oat_pest_cost: 20,
					oat_mach_cost: 63.5,
					alfalfa_seed_cost: 60,
					alfalfa_pest_cost: 32,
					alfalfa_mach_cost: 136.5,
				})
				var geomType = 'point'
				wfs_scenario_insert(newScenarioFeature, geomType,'scenarios_2')
				console.log("HI! NEW BLANK SCENARIO CREATED!!!!!!")
			}else{}
		})
		
	}else{
	DSS.layer.scenarios.getSource().getFeatures().forEach(function(f) {
		console.log(f.values_.gid)
	//DSS.layer.scenarios.getSource().forEachFeature(function(f) {
		var newScenarioFeature = f;
		f.values_.geom = f.values_.geometry;
		if(newScenarioFeature.values_.gid == DSS.activeScenario){
			console.log("Hit NEW SCENRIO GID")
			console.log(newScenarioFeature.values_.gid)
			for (i in scenarioArray){
				console.log("scenarioArray gid: " + scenarioArray[i].gid);
				if(scenarioArray[i].gid == DSS.activeScenario){
					console.log('ActiveScenario, scenarios feature scenario_id, and scenarioarray scenarioId line up!!!!!!!!!!!!!!!');
					console.log('Base object for new scenario:')
					console.log(newScenarioFeature)
					newScenarioFeature.setProperties({
						scenario_name:sname,
						scenario_desp:sdescript,
						//scenario_id: 9999,
						//scenario_id: snewhighID,
						//geom: scenarioArray[i].geom,
						//geometry: scenarioArray[i].geom,
						farm_id: DSS.activeFarm,
						farm_name:DSS.farmName,
						lac_cows:scenarioArray[i].lacCows,
						dry_cows: scenarioArray[i].dryCows,
						heifers: scenarioArray[i].heifers,
						youngstock: scenarioArray[i].youngStock,
						beef_cows: scenarioArray[i].beefCows,
						stockers: scenarioArray[i].stockers,
						finishers: scenarioArray[i].finishers,
						ave_milk_yield: scenarioArray[i].aveMilkYield,
						ave_daily_gain:scenarioArray[i].aveDailyGain,
						lac_confined_mos: scenarioArray[i].lacMonthsConfined,
						dry_confined_mos: scenarioArray[i].dryMonthsConfined,
						beef_confined_mos: scenarioArray[i].beefMonthsConfined,
						lac_graze_time: scenarioArray[i].lacGrazeTime,
						dry_graze_time: scenarioArray[i].dryGrazeTime,
						beef_graze_time: scenarioArray[i].beefGrazeTime,
						lac_rotate_freq: scenarioArray[i].lacRotateFreq,
						dry_rotate_freq: scenarioArray[i].dryRotateFreq,
						beef_rotate_freq: scenarioArray[i].beefRotateFreq,
						// corn_seed_cost: scenarioArray[i].cornSeedCost,
						// corn_pest_cost: scenarioArray[i].cornPestCost,
						// corn_mach_cost: scenarioArray[i].cornMachCost,
						// soy_seed_cost: scenarioArray[i].soySeedCost,
						// soy_pest_cost: scenarioArray[i].soyPestCost,
						// soy_mach_cost: scenarioArray[i].soyMachCost,
						// grass_seed_cost: scenarioArray[i].grassSeedCost,
						// grass_pest_cost: scenarioArray[i].grassPestCost,
						// grass_mach_cost: scenarioArray[i].grassMachCost,
						// oat_seed_cost: scenarioArray[i].oatSeedCost,
						// oat_pest_cost: scenarioArray[i].oatPestCost,
						// oat_mach_cost: scenarioArray[i].oatMachCost,
						// alfalfa_seed_cost: scenarioArray[i].alfalfaSeedCost,
						// alfalfa_pest_cost: scenarioArray[i].alfalfaPestCost,
						// alfalfa_mach_cost: scenarioArray[i].alfalfaMachCost,
					});
					console.log('Object to be inserted:');
					console.log(newScenarioFeature)
					var geomType = 'point'
					wfs_scenario_insert(newScenarioFeature, geomType,'scenarios_2')
					console.log("HI! WFS new scenario Insert ran!")
					break;
				}else{}
			}
		}else{}
	})}
}



//------------------working variables--------------------
//+

//------------------------------------------------------------------------------
Ext.define('DSS.state.NewDupScenario', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_new_dup_scenario',
	
	autoDestroy: true,
	closeAction: 'hide',
	constrain: true,
	modal: true,
	width: 832,
	resizable: false,
	bodyPadding: 8,
	titleAlign: 'center',
	
	title: 'Set up your new duplicate Scenario.',
	
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;
		console.log(scenDupArray)
		console.log(itemsArrayStore)
		
		if(Ext.getCmp("scenarioMenuNewDup")){
			Ext.getCmp("scenarioMenuNewDup").destroy()
			Ext.getCmp('scenDupIDpanel').destroy()
			//Ext.getCmp('itemsArrayStore').destroy()
		}
		DSS.activeScenario = null
		DSS.scenarioName = ''
		geoServer.getWFSScenario()
		DSS.MapState.reSourceFeatsToFarm();
		var itemsArrayStore = Ext.create('Ext.data.Store', {
			data: scenDupArray,
			id:'itemsArrayStore',
			storeId: 'itemsArrayStore',
		});
		Ext.applyIf(me, {
			items: [
				{
					xtype: 'component',
					x: 0, y: -6,
					width: '100%',
					height: 28,
					cls: 'information accent-text bold',
					html: "Choose From the Scenarios Below",
				},
					{
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
					listeners:{show: function() {

					 console.log("i'm showing!!!!!!!!!!!!!!")
					}},
					items: [
						Ext.create('Ext.grid.GridPanel', {
							title: 'Available Scenarios to Duplicate',
							id: "scenarioMenuNewDup",
							store: Ext.data.StoreManager.lookup('itemsArrayStore'),
							columns: [{
								text: '<b>Name</b>',
								dataIndex: 'scenario_name',
								flex: 1
							}, 
							{
								text: '<b>Description</b>',
								dataIndex: 'scenario_desp',
								flex: 2
							}
						],
								listeners:{
								select: async function( menu, item, e, eOpts ) {
									fieldZoom = true
									geoServer.getWFSScenario()
									console.log(item)
									DSS.activeScenario = item.data.gid;
									DSS.scenarioName = item.data.scenario_name;
									Ext.getCmp('scenDupIDpanel').setHtml('"'+item.data.scenario_name+'"');
									scenarioPickerArray = []
								}
						},
						
							//height: 300,
							width: 500,
							renderTo: Ext.getBody()
						}),
					{ //------------------------------------------
						xtype: 'component',
						//id: 'scenIDpanel',
						cls: 'information',
						html: 'Scenario to be Duplicated: ',
					},
					{ //------------------------------------------
						xtype: 'component',
						id: 'scenDupIDpanel',
						cls: 'information-scenlabel',
						style:{
							fontsize: 45,
							color: '#EE6677'
						},
						html: DSS.scenarioName,
					},
					{
						fieldLabel: "New Scenario's Name",
						name: 'scenario_name',
						allowBlank: false,
						margin: '12 0',
						padding: 4,
					},{
						fieldLabel: "New Scenario's Description",
						name: 'scenario_description',
						allowBlank: false,
						margin: '12 0',
						padding: 4,
					},{
						xtype: 'button',
						disabled: true,
						cls: 'button-text-pad',
						componentCls: 'button-margin',
						text: 'Create New Scenario',
						formBind: true,
						handler: async function() { 
							console.log('new scenario button pushed')
							var form = this.up('form').getForm();
							if (form.isValid() && DSS.activeScenario  !== null) {
								//fieldZoom = true
								//DSS.layer.scenarios.getSource().refresh();
								farmArray = [];
								scenarioArrayNS = scenarioArray
								//scenarioArray = [];
								fieldArrayNS = []
								infraArrayNS = []
								scenarioNumHold = DSS.activeScenario
								let scenName = form.findField('scenario_name').getSubmitValue()
								let scenDes = form.findField('scenario_description').getSubmitValue()
								//createNewScenario kicks off process to copy scenario data, and associated fields and infra
								await createNewScenario(scenName,scenDes)
								//This is used to make sure								
								//geoServer.setScenariosSource('&CQL_filter=farm_id='+DSS.activeFarm)
								//getWFSScenarioSP()
								//DSS.ApplicationFlow.instance.showScenarioPage();
								this.up('window').destroy();
							}else{
								alert("Please Select a Scenario to Duplicate!")
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
