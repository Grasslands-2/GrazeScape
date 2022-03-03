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


//	return $.ajax({
//		jsonp: false,
//		type: 'GET',
//		url: farmUrl,
//		async: false,
//		dataType: 'json',
//		success:function(response)
//		{
//			farmObj = response.features
//			console.log(farmObj[0])
//		}
//	})
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
            //console.log("current features scenario ID: " + f.values_.scenario_id);
            if(f.values_.scenario_id == copyScenarioNum){
				console.log("current features scenario ID: " + f.values_.scenario_id);
                //delete f.id_
                f.geometryName_ = 'geom'
                f.values_.scenario_id = DSS.activeScenario;
                f.values_.geom = f.values_.geometry;
                //delete f.values_.geometry
                f.values_.is_dirty = true
                //console.log(f);
                //featArray.push(f);
				wfs_new_scenario_features_copy([f],layerTitle)
            }
		//-----------------------------------
		//Figured out that the geom was being taken from geometry in values_!!!!!!
		//We can use this to copy exact geometry, thus creating exact copies of feautres
		
		})
		// console.log('featArrayNS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
		// console.log(featArray);
		// if(featArray.length > 0){
		// 	await wfs_new_scenario_features_copy(featArray,layerTitle)
		// }
}

//empty array to catch feature objects 
//define function to populate data array with farm table data
function popFarmArray(obj) {
	for (i in obj) 
	farmArray.push({
		id: obj[i].properties.id,
		gid: obj[i].properties.gid,
		name: obj[i].properties.farm_name
	});
}
// function popScenarioArray(obj) {
// 	for (i in obj) 
// 	scenarioArray.push({
// 		fid: obj[i].id,
// 		gid: obj[i].properties.gid,
// 		geom: obj[i].geometry,
// 		scenarioId:obj[i].properties.scenario_id,
// 		scenarioName:obj[i].properties.scenario_name,
// 		scenarioDesp:obj[i].properties.scenario_desp,
// 		farmId: obj[i].properties.farm_id,
// 		farmName: obj[i].properties.farm_name,
// 		lacCows: obj[i].properties.lac_cows,
// 		dryCows: obj[i].properties.dry_cows,
// 		heifers: obj[i].properties.heifers,
// 		youngStock: obj[i].properties.youngstock,
// 		beefCows: obj[i].properties.beef_cows,
// 		stockers: obj[i].properties.stockers,
// 		finishers: obj[i].properties.finishers,
// 		aveMilkYield: obj[i].properties.ave_milk_yield,
// 		aveDailyGain: obj[i].properties.ave_daily_gain,
// 		lacMonthsConfined: obj[i].properties.lac_confined_mos,
// 		dryMonthsConfined: obj[i].properties.dry_confined_mos,
// 		beefMonthsConfined: obj[i].properties.beef_confined_mos,
// 		lacGrazeTime: obj[i].properties.lac_graze_time,
// 		dryGrazeTime: obj[i].properties.dry_graze_time,
// 		beefGrazeTime: obj[i].properties.beef_graze_time,
// 		lacRotateFreq: obj[i].properties.lac_rotate_freq,
// 		dryRotateFreq: obj[i].properties.dry_rotate_freq,
// 		beefRotateFreq: obj[i].properties.beef_rotate_freq,
// 	});
// 	console.log(scenarioArray)
// }
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
			console.log('hightestFarmId after getHighestFarm run: ' + highestFarmId)
		};
	};
}
//function rerunPopScenarioArrayNS(){
//	getWFSScenarioNS();
//}
function getHighestScenarioId(){
	getWFSScenarioNS();
	for (i in scenarioArray){
		console.log(scenarioArray[i].scenarioId)
		console.log(highestScenarioId)
		if (scenarioArray[i].scenarioId > highestScenarioId){
			highestScenarioId = scenarioArray[i].scenarioId
			console.log('hightestScenarioId after getHighestScenario run: ' + highestScenarioId)
		};
	};
}
//Do we need to call these?  I guess it doesnt hurt in the mean time.


//---------------------------------Working Functions-------------------------------
async function wfs_new_scenario_features_copy(featsArray,fType,geomType) {
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
				})
				var geomType = 'point'
				wfs_scenario_insert(newScenarioFeature, geomType,'scenarios_2')
				console.log("HI! WFS new scenario Insert ran with a brand new farm!!")
			}else{}
		})
		
	}else{
	DSS.layer.scenarios.getSource().getFeatures().forEach(function(f) {
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
						beef_rotate_freq: scenarioArray[i].beefRotateFreq
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
					listeners:{show: function() {

					 console.log("i'm showing!!!!!!!!!!!!!!")
					}},
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
						handler: async function() { 
							console.log('new scenario button pushed')
							var form = this.up('form').getForm();
							if (form.isValid()) {
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
