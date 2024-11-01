DSS.utils.addStyle('.underlined-input { border: none; border-bottom: 1px solid #ddd; display:table; width: 100%; height:100%; padding: 0 0 2px}')   
DSS.utils.addStyle('.underlined-input:hover { border-bottom: 1px solid #7ad;}')
DSS.utils.addStyle('.right-pad { padding-right: 32px }')

//var for holding onto item to be deleted object
var itemToBeDeleted = {}
scenarioDeleteArray = [];
function getWFSScenarioDS() {
	scenarioDeleteArray = [];
	geoServer.getWFSScenarioDS('&CQL_filter=farm_id='+DSS.activeFarm)
}

itemsArrayDS = []

function popItemsArrayDS(obj){
    Ext.getCmp("scenarioMenuDS").removeAll()
	for (i in obj){
		if(obj[i].properties.gid !== DSS.activeScenario)
		// Ext.ComponentQuery.query('Menu[name=scenarioMenu]')[0].add({
        //     text:obj[i].properties.scenario_name,
        //     inputValue:obj[i].properties.scenario_id,
        //     itemFid: obj[i].id
        Ext.getCmp("scenarioMenuDS").add({
            text:obj[i].properties.scenario_name,
            inputValue:obj[i].properties.gid,
            itemFid: obj[i].id
        })
    }
	console.log(itemsArrayDS);

}

function wfsDeleteItem(featsArray,layerString){
	var formatWFS = new ol.format.WFS();
	var formatGML = new ol.format.GML({
		featureNS: 'http://geoserver.org/GrazeScape_Vector'
		/*'http://geoserver.org/Farms'*/,
		//Geometry: 'geom',
		featureType: layerString,
		srsName: 'EPSG:3857'
	});
	console.log(featsArray)
	node = formatWFS.writeTransaction(null, null, featsArray, formatGML);
	console.log(node);
	s = new XMLSerializer();
	str = s.serializeToString(node);
	console.log(str);
	geoServer.wfsDeleteItem(str, featsArray)
}
async function selectDeleteScenario(fgid){
	console.log("in selectDeleteScenario")
	DSS.layer.scenarios.getSource().getFeatures().forEach(async function(f) {
		var delScenarioFeature = f;
		console.log(delScenarioFeature.values_.gid);
		if (delScenarioFeature.values_.gid == fgid){
		    console.log(fgid)
			itemToBeDeleted = delScenarioFeature;
			delArray = [];
			delArray.push(itemToBeDeleted)
			console.log(delArray)
			await deleteOperation(delArray,'scenarios_2');
			geoServer.setScenariosSource()
			delItemArrays = await gatherdeleteFeaturesScen(fgid)
			console.log(delItemArrays)
			await deleteOperation(delItemArrays[1],'infrastructure_2');
			await deleteOperation(delItemArrays[0],'field_2');
            if(feat = 'scenarios_2'){
                getWFSScenarioSP()
            }
			//await wfsDeleteItem(delArray,'scenarios_2');
		};
	});
	//await getWFSScenarioSP
	// await selectDeleteFieldInfra(fgid,fieldArrayDS,DSS.layer.fields_1,'field_2')
	// await selectDeleteFieldInfra(fgid,infraArrayDS,DSS.layer.infrastructure,'infrastructure_2')
	await DSS.ApplicationFlow.instance.showManageOperationPage();
}
fieldArrayDS = []
infraArrayDS = []
async function selectDeleteFieldInfra(fgid,featArray,layerName,layerString){
	//reSourceFeatures(layerName,layerString,fgid)
	layerName.getSource().getFeatures().forEach(function(f) {
		var delFieldInfraFeature = f;
		console.log(delFieldInfraFeature)
		console.log('this is fgid')
		console.log(fgid)
		console.log("from " + layerName + " loop through: " + delFieldInfraFeature.values_.gid);
		if (delFieldInfraFeature.values_.scenario_id == fgid){
			//itemToBeDeleted = delFieldInfraFeature;
			//console.log("feature selected for termination: ")
			console.log(delFieldInfraFeature);
			featArray.push(delFieldInfraFeature);
			
		};
	});
	console.log('Features to be deleted in '+layerString + ': ')
	console.log(featArray)
	// for(i in featArray){
	// 	//featArray.remove(featArray[i]);
	// }
	await wfsDeleteItem(featArray,layerString,fgid);
}

//------------------------------------------------------------------------------
Ext.define('DSS.state.DeleteScenario', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_delete_scenario',
	id: "scenarioDeleter",
	
	//autoDestroy: false,
	//closeAction: 'hide',
	constrain: true,
	modal: true,
	width: 832,
	resizable: false,
	bodyPadding: 8,
	titleAlign: 'center',
	
	title: 'Pick The Scenario You Want to Delete',
	
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		
		let me = this;
        getWFSScenarioDS()
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
					name:'scenarioMenuForm',
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
						Ext.create('Ext.menu.Menu', {
							width: 100,
                            id: "scenarioMenuDS",
							name:"scenarioMenuDS",
							margin: '0 0 10 0',
							floating: false,  // usually you want this set to True (default)
							renderTo: Ext.getBody(),  // usually rendered by it's containing component
							items: itemsArrayDS,
							listeners:{
								click: async function( menu, item, e, eOpts ) {
									fieldArrayDS = []
									infraArrayDS = []
									console.log(item.text);
									console.log(item.inputValue);
			 						scenarioToDelete = item.inputValue
									console.log(scenarioToDelete);
									selectDeleteScenario(scenarioToDelete)
									this.up('window').destroy();
									//selectDeleteFieldInfra(item.inputValue,fieldArrayDS,DSS.layer.fields_1,'field_2')
									//selectDeleteFieldInfra(item.inputValue,infrastructureSourceDS,infraArrayDS,DSS.layer.infrastructure,'infrastructure_2')
									alert('Scenario: ' + item.text + ' Deleted')
									geoServer.setScenariosSource('&CQL_filter=farm_id='+DSS.activeFarm)
									//geoServer.setFieldSource('&CQL_filter=scenario_id='+DSS.activeScenario)
									//geoServer.setInfrastructureSource('&CQL_filter=scenario_id='+DSS.activeScenario)
									//DSS.ApplicationFlow.instance.showManageOperationPage();
								}
							}
						}),
					],
			}]
		});
		me.callParent(arguments);
		AppEvents.registerListener("viewport_resize", function(opts) {
			me.center();
		})
	},
	
});
