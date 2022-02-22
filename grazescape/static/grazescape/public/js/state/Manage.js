
function reSourceFields() {

    geoServer.setFieldSource()
	console.log("reSource Fields ran");
}
function reSourceinfra() {
    geoServer.setInfrastructureSource()
	console.log("reSource Infra ran");
}
function reSourcefarms() {
    geoServer.setFarmSource()
	console.log("setFarmSource in Manage.js within reSourceFarms")
	console.log("reSource Infra ran");
}
function reSourcescenarios() {
    geoServer.setScenariosSource()
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
									DSS.ApplicationFlow.instance.showLandingPage();
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
					html: 'Manage'
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
				{ //------------------------------------------
					xtype: 'component',
					cls: 'information med-text',
					html: 'Scenario: ' + DSS.scenarioName,
				},
				//--------------------Manage current scenario--------------
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Manage Loaded Scenario',
					handler: function(self) {
						//reSourcescenarios()
						gatherScenarioTableData
						runScenarioUpdate();
						geoServer.getWFSScenario('&CQL_filter=gid='+DSS.activeScenario)
						DSS.ApplicationFlow.instance.showManageOperationPage();
						// showFieldsForScenario()
				 		// showInfraForScenario()
						// reSourceFields()
						// reSourceinfra()
						//DSS.layer.scenarios.getSource().refresh();
						//AppEvents.triggerEvent('hide_field_shape_mode')
						DSS.ApplicationFlow.instance.showScenarioPage();
						console.log(DSS.activeScenario);
					}
				},
				//------------------------Load Scenario Button-------------
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Load Different Scenario',
					handler: function(self) {
						DSS.dialogs.ScenarioPicker = Ext.create('DSS.state.ScenarioPicker');
						DSS.dialogs.ScenarioPicker.setViewModel(DSS.viewModel.scenario);		
						DSS.dialogs.ScenarioPicker.show().center().setY(0);
					}
				},
				//---------------------Create New Scenario Button-----------
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Create New Scenario',
					handler: function(self) {
						DSS.dialogs.ScenarioPicker = Ext.create('DSS.state.NewScenario'); 
						DSS.dialogs.ScenarioPicker.setViewModel(DSS.viewModel.scenario);		
						DSS.dialogs.ScenarioPicker.show().center().setY(0);
						reSourcescenarios();
						//getWFSScenarioNS();
						// DSS.layer.scenarios.getSource().refresh();
						console.log('This is the scenarioArray: ')
						console.log(scenarioArray)
					}
				},
				//---------------------Delete Scenarios Button-------------
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Delete Scenario',
					handler: function(self) {

						//getWFSScenario()
						reSourceFields()
						reSourceinfra()
						//console.log(itemsArray);
						getWFSScenarioDS()
						DSS.dialogs.ScenarioPicker = Ext.create('DSS.state.DeleteScenario'); 
						DSS.dialogs.ScenarioPicker.setViewModel(DSS.viewModel.scenario);		
						DSS.dialogs.ScenarioPicker.show().center().setY(0);
						
					}
				}]
			}]
		});
		
		me.callParent(arguments);

//		Ext.create('DSS.controls.ApplicationState', {id: 'crap-state'}).showAt(400,-4);
		
	}

});

