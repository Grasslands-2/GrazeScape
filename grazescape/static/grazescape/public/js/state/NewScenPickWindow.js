function getWFSScenarioDupS(){
	geoServer.getWFSScenarioDupS()
}

//------------------------------------------------------------------------------
Ext.define('DSS.state.NewScenPickWindow', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_new_scen_pick_window',
	requires: [
		'DSS.state.ScenarioPicker',
		'DSS.state.DeleteScenario',
		'DSS.state.NewScenario',
		'DSS.state.NewDupScenario',
		'DSS.state.Scenario'
		
	],
    alternateClassName: 'DSS.NewScenPickWindow',
    constrain: false,
	modal: true,
	width: 500,
	resizable: true,
	bodyPadding: 8,
	//singleton: true,	
    autoDestroy: false,
    scrollable: 'y',
	titleAlign: 'center',
	//title: 'Choose your new Fields Name and Crop Rotation',
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: async function() {
		let me = this;
		if(Ext.getCmp('dupCurScen')){
			Ext.getCmp('dupCurScen').setDisabled(true)
		}
		getWFSScenarioSP()
		// await getWFSScenarioDupS()
		// scenDupArray = []
		// for(s in scenServerObj){
		// 	scenPropertiesArray.push(scenServerObj[s].properties)
		// }
		// console.log(scenDupArray)
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				cls: 'section-title accent-text right-pad',
				html: 'Create a New Scenario',
				height: 35
			},{
				xtype: 'container',
				style: 'background-color: #BBBBBB; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); border-top-color:rgba(255,255,255,0.25); border-bottom-color:rgba(0,0,0,0.3); box-shadow: 0 3px 6px rgba(0,0,0,0.2)',
				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				margin: '8 4',
				padding: '2 8 10 8',
				defaults: {
					DSS_parent: me,
				},
				items: [
				// {
				// 	xtype: 'component',
				// 	cls: 'information light-text text-drp-20',
				// 	html: 'Would you like to delete field '+selectedField.values_.field_name + '?',
				// },
				{
					xtype: 'component',
					cls: 'information-scenlabel',
					x: 0, y: -6,
					width: '100%',
					height: 50,
					style:{
								fontsize: 45,
								color: '#4477AA'
							},
					html: "Duplicate an existing scenario or create a blank scenario.",
				},{ //------------------------------------------
					xtype: 'component',
					//id: 'scenIDpanel',
					cls: 'information',
					html: 'Duplicating a current scenario allows you to transfer all fields from an existing scenario to your new one.',
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					id: 'dupCurScen',
					disabled: true,
					componentCls: 'button-margin',
					text: 'Duplicate a Scenario',
					handler: function(self) {
						
						//getWFSScenarioSP
						//geoServer.getWFSScenario('&CQL_filter=gid='+DSS.activeScenario)
						//gatherScenarioTableData()
						DSS.dialogs.ScenarioPicker = Ext.create('DSS.state.NewDupScenario'); 
						//DSS.dialogs.ScenarioPicker.setViewModel(DSS.viewModel.scenario);		
						DSS.dialogs.ScenarioPicker.show().center().setY(0);
						//reSourcescenarios();
						//getWFSScenarioSP()
						console.log('This is the scenarioArray: ')
						console.log(scenarioArray)
						console.log(scenDupArray);
						//DSS.ApplicationFlow.instance.showScenarioPage();
						this.up('window').destroy();
					}
				},{ //------------------------------------------
					xtype: 'component',
					//id: 'scenIDpanel',
					cls: 'information',
					html: 'Creating an entirely blank scenario could make your model results harder to compare across scenarios.',
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Create Blank Scenario',
					handler: function(self) {
						DSS.activeScenario = null
						DSS.scenarioName = ''
						DSS.dialogs.ScenarioPicker = Ext.create('DSS.state.NewScenario'); 
						DSS.dialogs.ScenarioPicker.setViewModel(DSS.viewModel.scenario);		
						DSS.dialogs.ScenarioPicker.show().center().setY(0);
						reSourcescenarios();
						//reSourceFields()
						getWFSScenarioNS();
						// DSS.layer.scenarios.getSource().refresh();
						console.log('This is the scenarioArray: ')
						console.log(scenarioArray)
						getWFSScenarioSP()
						//DSS.ApplicationFlow.instance.showScenarioPage();
						this.up('window').destroy();
					}
				}
			]
			}]
		});
		
		me.callParent(arguments);
	},
	
	//--------------------------------------------------------------------------
	// addModeControl: function(owner) {
	// 	let me = this;
	// 	let c = DSS_viewport.down('#DSS-mode-controls');
	// 	console.log('delete mode on')
	// 	selectFieldDelete()
		
		
	// 	if (!c.items.has(me)) {
	// 		Ext.suspendLayouts();
	// 			c.removeAll(false);
	// 			c.add(me);
	// 		Ext.resumeLayouts(true);
	// 	}
	// 	me.mouseMoveDeleteHandler(owner);
	// 	me.clickDeleteFieldHandler(owner);
	// },
	
    //-------------------------------------------------------------
	// mouseMoveDeleteHandler: function() {
		
	// 	DSS.mouseMoveFunction = function(evt) {
	// 		let coordinate  =  DSS.map.getEventCoordinate(evt.originalEvent);
	// 		let fs = DSS.layer.fields_1.getSource().getFeaturesAtCoordinate(coordinate);
	// 		let cursor = '';
	// 		let mouseList = [];
	// 		fs.forEach(function(f) {
	// 			let g = f.getGeometry();
	// 			if (g && g.getType() === "MultiPolygon") {
	// 				cursor = 'pointer';
	// 				mouseList.push(f);
					
	// 				let extent = g.getExtent();
	// 				let center = ol.extent.getCenter(extent);
	// 				center[1] += (ol.extent.getHeight(extent) / 2);
	// 				center = g.getClosestPoint(center);
	// 			}
	// 		})
	// 		DSS.map.getViewport().style.cursor = cursor;
	// 	}		
	// },
	
    //-------------------------------------------------------------
//     clickDeleteFieldHandler: function(owner) {
    	
//     	DSS.mapClickFunction = function(evt) {
// 			let coordinate  =  DSS.map.getEventCoordinate(evt.originalEvent);
// 			let fs = DSS.layer.fields_1.getSource().getFeaturesAtCoordinate(coordinate);
// 			let deleteList = [];
// 			fs.forEach(function(f) {
// 				let g = f.getGeometry();
// 				if (g && g.getType() === "Polygon") {
// 					deleteList.push({'f':f, 'f_id': f.getProperties().f_id});
// //					deleteList.push(f.getProperties().f_id);
// 				}
// 			})
// 			if (deleteList.length > 0) {
// 				owner.deleteFields(deleteList,DSS.activeFarm);
// 			}
// 		}		
//     },
	
});
