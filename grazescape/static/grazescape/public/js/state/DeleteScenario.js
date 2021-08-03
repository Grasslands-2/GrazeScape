DSS.utils.addStyle('.underlined-input { border: none; border-bottom: 1px solid #ddd; display:table; width: 100%; height:100%; padding: 0 0 2px}')   
DSS.utils.addStyle('.underlined-input:hover { border-bottom: 1px solid #7ad;}')
DSS.utils.addStyle('.right-pad { padding-right: 32px }')

//var for holding onto item to be deleted object
var itemToBeDeleted = {}

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
//	$.ajax(geoserverURL + '/geoserver/wfs?'
///*'http://localhost:8081/geoserver/wfs?'*/,{
//		type: 'POST',
//		dataType: 'xml',
//		processData: false,
//		contentType: 'text/xml',
//		data: str,
//		success: function (data) {
//			console.log("data deleted successfully!: ");
//			cleanDB()
//			console.log(data)
//			//DSS.layer.farms_1.getSource().refresh();
//			getWFSScenarioSP(DSS.activeFarm)
//		},
//		error: function (xhr, exception) {
//			var msg = "";
//			if (xhr.status === 0) {
//				msg = "Not connect.\n Verify Network." + xhr.responseText;
//			} else if (xhr.status == 404) {
//				msg = "Requested page not found. [404]" + xhr.responseText;
//			} else if (xhr.status == 500) {
//				msg = "Internal Server Error [500]." +  xhr.responseText;
//			} else if (exception === "parsererror") {
//				msg = "Requested JSON parse failed.";
//			} else if (exception === "timeout") {
//				msg = "Time out error." + xhr.responseText;
//			} else if (exception === "abort") {
//				msg = "Ajax request aborted.";
//			} else {
//				msg = "Error:" + xhr.status + " " + xhr.responseText;
//			}
//			console.log(msg);
//		}
//	}).done();
}
function selectDeleteScenario(fgid){
	DSS.layer.scenarios.getSource().getFeatures().forEach(function(f) {
		console.log(f);
		var delScenarioFeature = f;
		console.log(delScenarioFeature.values_.scenario_id);
		console.log("from scenario features loop through: " + delScenarioFeature.values_.scenario_id);
		if (delScenarioFeature.values_.scenario_id == fgid){
			itemToBeDeleted = delScenarioFeature;
			console.log("scenario selected for termination:")
			console.log(itemToBeDeleted);
			console.log("current active scenario: " + DSS.activeScenario)
			delArray = [];
			delArray.push(itemToBeDeleted)
			//break;
		//}else{
			//console.log("delete scenario failed")
			////pass
			wfsDeleteItem(delArray,'scenarios_2');
			if(DSS.activeScenario == itemToBeDeleted.values_.scenario_id){
			    console.log("active scneario!!!!")
				getWFSScenarioSP()
				DSS.dialogs.ScenarioPicker = Ext.create('DSS.state.ScenarioPicker');
				DSS.dialogs.ScenarioPicker.setViewModel(DSS.viewModel.scenario);
				DSS.dialogs.ScenarioPicker.show().center().setY(0);
			}
		};
	});
	selectDeleteFieldInfra(fgid,fieldArrayDS,DSS.layer.fields_1,'field_2')
	selectDeleteFieldInfra(fgid,infraArrayDS,DSS.layer.infrastructure,'infrastructure_2')
}
fieldArrayDS = []
infraArrayDS = []
async function selectDeleteFieldInfra(fgid,featArray,layerName,layerString){
	//reSourceFeatures(layerName,layerString,fgid)
	layerName.getSource().getFeatures().forEach(function(f) {
		var delFieldInfraFeature = f;
		console.log('this is fgid')
		console.log(fgid)
		console.log(delFieldInfraFeature);
		console.log("from " + layerName + " loop through: " + delFieldInfraFeature.values_.scenario_id);
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
	
	autoDestroy: false,
	closeAction: 'hide',
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
						Ext.create('Ext.menu.Menu', {
							width: 100,
                            id: "scenarioMenu",
							margin: '0 0 10 0',
							floating: false,  // usually you want this set to True (default)
							renderTo: Ext.getBody(),  // usually rendered by it's containing component
							items: itemsArray,
							listeners:{
								click: function( menu, item, e, eOpts ) {
                                    this.up('window').destroy();
									fieldArrayDS = []
									infraArrayDS = []
									console.log(item.text);
									console.log(item.inputValue);
			 						scenarioToDelete = item.inputValue
									console.log(scenarioToDelete);
									selectDeleteScenario(scenarioToDelete)
									//selectDeleteFieldInfra(item.inputValue,fieldArrayDS,DSS.layer.fields_1,'field_2')
									//selectDeleteFieldInfra(item.inputValue,infrastructureSourceDS,infraArrayDS,DSS.layer.infrastructure,'infrastructure_2')
									alert('Scenario: ' + item.text + ' Deleted')

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
