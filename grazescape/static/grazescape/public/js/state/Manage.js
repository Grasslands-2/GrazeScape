
function reSourceFields() {
    geoServer.setFieldSource('&CQL_filter=farm_id='+DSS.activeFarm)
	console.log("reSource Fields ran");
}
function reSourceinfra() {
    geoServer.setInfrastructureSource('&CQL_filter=far,_id='+DSS.activeFarm)
	console.log("reSource Infra ran");
}
function reSourcefarms() {
    geoServer.setFarmSource()
	console.log("setFarmSource in Manage.js within reSourceFarms")
	console.log("reSource Infra ran");
}
function reSourcescenarios() {
    geoServer.setScenariosSource('&CQL_filter=farm_id='+DSS.activeFarm)
	console.log("reSource scenarios ran");
}
//------------------------------------------------------------------------------
Ext.define('DSS.state.Manage', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
    alternateClassName: 'DSS.OperationManage',
	alias: 'widget.operation_manage',

	requires: [
		'DSS.state.ScenarioPicker',
		'DSS.state.DeleteScenario',
		'DSS.state.NewScenario',
		'DSS.state.operation.InfraShapeMode',
		'DSS.state.operation.FieldShapeMode',
		'DSS.state.Scenario',
		
	],
	
	layout: DSS.utils.layout('vbox', 'center', 'stretch'),
	cls: 'section',

	statics: {
		get: function() {
			let def = {
					xtype: 'operation_manage'
			};
			
			return def;
		}
	},
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;
		DSS.activeScenario = null
		console.log("in manage")
		itemsArray = []
		getWFSScenarioSP()
		
		Ext.applyIf(me, {
			defaults: {
				margin: '1rem',
			},
			items: [{
				xtype: 'container',
				layout: DSS.utils.layout('hbox', 'start', 'begin'),
				items: [{
					xtype: 'component',
					cls: 'back-button',
					tooltip: 'Back',
					html: '<i class="fas fa-reply"></i>',
					listeners: {
						render: function(c) {
							c.getEl().getFirstChild().el.on({
								click: function(self) {
//									reSourceFields()
//									reSourceinfra()
									reSourcefarms()
									reSourcescenarios()
									DSS.ApplicationFlow.instance.showFarmPickerPage();
									DSS.layer.fields_1.setVisible(false)
									DSS.layer.infrastructure.setVisible(false);
									DSS.layer.fieldsLabels.setVisible(false);
									//DSS.layer.fields_1.getSource().refresh();

									DSS.viewModel.scenario = !DSS['viewModel']
									DSS['viewModel'] = {}
									DSS.viewModel.scenario = {}
									DSS.dialogs = {}
									console.log("back to square 1")
									DSS.activeScenario = null;
									DSS.activeFarm = null;
									// console.log(DSS.activeFarm)
									// console.log(DSS.activeScenario)
								}
							});
						}
					}					
				},{
					xtype: 'component',
					flex: 1,
					cls: 'section-title accent-text right-pad',
					html: 'Farm Manage'
				},
			]
			},{ 
				xtype: 'container',
				layout: DSS.utils.layout('vbox', 'center', 'stretch'),
				items: [
				{ //------------------------------------------
					xtype: 'component',
					cls: 'information med-text',
					html: 'Farm: ' + DSS.farmName,
				},
				// { //------------------------------------------
				// 	xtype: 'component',
				// 	cls: 'information med-text',
				// 	html: 'Scenario: ' + DSS.scenarioName,
				// },
				
				//---------------------Create New Scenario Button-----------
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Create New Blank Scenario',
					handler: function(self) {
						DSS.dialogs.ScenarioPicker = Ext.create('DSS.state.NewScenario'); 
						DSS.dialogs.ScenarioPicker.setViewModel(DSS.viewModel.scenario);		
						DSS.dialogs.ScenarioPicker.show().center().setY(0);
						reSourcescenarios();
						reSourceFields()
						getWFSScenarioNS();
						// DSS.layer.scenarios.getSource().refresh();
						console.log('This is the scenarioArray: ')
						console.log(scenarioArray)
						getWFSScenarioSP()
						//DSS.ApplicationFlow.instance.showScenarioPage();
					}
				},
				
//				myMask

			
				
				// {
				// 	xtype: 'button',
				// 	cls: 'button-text-pad',
				// 	componentCls: 'button-margin',
				// 	text: 'Edit a Scenario',
				// 	handler: function(self) {
				// 		reSourcescenarios()
				// 		DSS.dialogs.ScenarioPicker = Ext.create('DSS.state.ScenarioPicker');
				// 		DSS.dialogs.ScenarioPicker.setViewModel(DSS.viewModel.scenario);		
				// 		DSS.dialogs.ScenarioPicker.show().center().setY(0);
				// 	}
				// },
				
			//------------------------Load Scenario Button-------------
			{
				xtype: 'container',
				width: '100%',
				layout: 'absolute',
				items: [{
					xtype: 'component',
					x: 0, y: -6,
					width: '100%',
					height: 28,
					cls: 'information accent-text bold',
					html: "Work with an existing Scenario",
				}],
				
			},
			Ext.create('Ext.menu.Menu', {
				width: 80,
				id: "scenarioMenu",
				margin: '0 0 10 0',
				floating: false,  // usually you want this set to True (default)
				renderTo: Ext.getBody(),  // usually rendered by it's containing component
				items: itemsArray,
				listeners:{
					click: function( menu, item, e, eOpts ) {
						console.log(item.text);
						console.log(item.inputValue);
						DSS.activeScenario = item.inputValue;
						DSS.scenarioName = item.text
						DSS.ApplicationFlow.instance.showScenarioPage();
						scenarioPickerArray = []
						DSS.MapState.showFieldsForScenario();
						DSS.MapState.showInfraForScenario();
						DSS.layer.fields_1.setVisible(true);
						DSS.layer.fields_1.getSource().refresh();
						DSS.layer.fieldsLabels.getSource().refresh();
						DSS.layer.infrastructure.setVisible(true);
						DSS.layer.fieldsLabels.setVisible(true);
						
						console.log("SCENARIO PICKER DONE")
					}
				}
			}),]
			},//---------------------Delete Scenarios Button-------------
			{
				xtype: 'button',
				cls: 'button-text-pad',
				componentCls: 'button-margin',
				text: 'Delete a Scenario',
				handler: function(self) {
					reSourcescenarios()
					//getWFSScenario()
					reSourceFields()
					reSourceinfra()
					//console.log(itemsArray);
					//getWFSScenarioDS()
					DSS.dialogs.ScenarioPicker = Ext.create('DSS.state.DeleteScenario'); 
					DSS.dialogs.ScenarioPicker.setViewModel(DSS.viewModel.scenario);		
					DSS.dialogs.ScenarioPicker.show().center().setY(0);
					
				}
			}]
		});
		
		me.callParent(arguments);

//		Ext.create('DSS.controls.ApplicationState', {id: 'crap-state'}).showAt(400,-4);
		
	}

});

