DSS.utils.addStyle('.underlined-input { border: none; border-bottom: 1px solid #ddd; display:table; width: 100%; height:100%; padding: 0 0 2px}')   
DSS.utils.addStyle('.underlined-input:hover { border-bottom: 1px solid #7ad;}')
DSS.utils.addStyle('.right-pad { padding-right: 32px }')   

//var for holding onto item to be deleted object
var itemToBeDeleted = {}

function wfsDeleteScenario(feat){
	var formatWFS = new ol.format.WFS();
	var formatGML = new ol.format.GML({
		featureNS: 'http://geoserver.org/GrazeScape_Vector'
		/*'http://geoserver.org/Farms'*/,
		//Geometry: 'geom',
		featureType: 'scenarios_2',
		srsName: 'EPSG:3857'
	});
	console.log(feat)
	node = formatWFS.writeTransaction(null, null, [feat], formatGML);
	console.log(node);
	s = new XMLSerializer();
	str = s.serializeToString(node);
	console.log(str);
	$.ajax('http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'
/*'http://localhost:8081/geoserver/wfs?'*/,{
		type: 'POST',
		dataType: 'xml',
		processData: false,
		contentType: 'text/xml',
		data: str,
		success: function (data) {
			console.log("data deleted successfully!: "+ data);
			DSS.layer.farms_1.getSource().refresh();
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
function selectDeleteScenario(fgid){
	DSS.layer.scenarios.getSource().getFeatures().forEach(function(f) {
		console.log(f);
		var delScenarioFeature = f;
		console.log(delScenarioFeature.values_.gid);
		console.log("from scenario features loop through: " + delScenarioFeature.values_.gid);
		if (delScenarioFeature.values_.gid == fgid){
			//wfsDeleteScenario(delScenarioFeature);
			itemToBeDeleted = delScenarioFeature;
			console.log("scenario selected for termination:")
			console.log(itemToBeDeleted);
			console.log("current active scenario: " + DSS.activeScenario)
			//break;
		//}else{
			//console.log("delete scenario failed")
			////pass
		};
	});
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
									 //console.log(checked);
									 if (checked.length == 2) {
										scenarioToDelete = checked[1].inputValue
										console.log(scenarioToDelete);
										selectDeleteScenario(scenarioToDelete)
									 }else{
										scenarioToDelete = checked[0].inputValue
										console.log(scenarioToDelete);
										selectDeleteScenario(scenarioToDelete)
									}
								 }
							}
					   }
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Delete Scenario',
					formBind: true,
					handler: function() {
						wfsDeleteScenario(itemToBeDeleted);
						this.up('window').destroy();
						if(DSS.activeScenario == itemToBeDeleted.values_.gid){
							getWFSScenarioSP()
							DSS.dialogs.ScenarioPicker = Ext.create('DSS.state.ScenarioPicker'); 
							DSS.dialogs.ScenarioPicker.setViewModel(DSS.viewModel.scenario);	
							DSS.dialogs.ScenarioPicker.show().center().setY(0);
						} 
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
