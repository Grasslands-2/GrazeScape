DSS.utils.addStyle('.information-scenlabel { padding: 0.5rem 0 0.25rem 0; font-size: 1.1rem; text-align: center; font-weight: bold}')
fieldArrayDO = [];
infraArrayDO = [];
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
function activateScenButtons(){
	Ext.getCmp('editCurScen').setDisabled(false)
	Ext.getCmp('delCurScen').setDisabled(false)
	//Ext.getCmp('dupCurScen').setDisabled(false)
	//Ext.getCmp('delCurScen').setDisabled(false)
}
function deactivateScenButtons(){
	Ext.getCmp('editCurScen').setDisabled(true)
	//Ext.getCmp('dupCurScen').setDisabled(true)
	Ext.getCmp('delCurScen').setDisabled(true)
}
var fieldZoom = false
async function gatherdeleteFeaturesScen(scenIDToDelete){
	fieldArrayDI = [];
	infraArrayDI = [];
	console.log(scenIDToDelete)
	DSS.layer.fields_1.getSource().forEachFeature(function(f) {
		if(f.values_.scenario_id == scenIDToDelete){
			fieldArrayDI.push(f)
		}
	})
	DSS.layer.infrastructure.getSource().forEachFeature(function(i) {
		if(i.values_.scenario_id == scenIDToDelete){
			infraArrayDI.push(i)
		}
	})
	console.log(fieldArrayDI)
	console.log(infraArrayDI)
	return [fieldArrayDI,infraArrayDI]
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
		'DSS.state.NewDupScenario',
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
		DSS.scenarioName = ''
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
									fieldZoom = false
									reSourcefarms()
									reSourcescenarios()
									DSS.ApplicationFlow.instance.showFarmPickerPage();
									DSS.MapState.hideFieldsandInfra()
									DSS.viewModel.scenario = !DSS['viewModel']
									DSS['viewModel'] = {}
									DSS.viewModel.scenario = {}
									DSS.dialogs = {}
									console.log("back to square 1")
									DSS.activeScenario = null;
									DSS.activeFarm = null;
									DSS.scenarioName = ''
								}
							});
						},
						focusleave: function(self){
							console.log('lost focus')
						}
					}					
				},{
					xtype: 'component',
					flex: 1,
					cls: 'section-title accent-text right-pad',
					html: 'Scenario Management'
				},
				
			]
			},
			{ 
				xtype: 'container',
				layout: DSS.utils.layout('vbox', 'center', 'stretch'),
				items: [
				{ //------------------------------------------
					xtype: 'component',
					cls: 'information',
					html: 'Farm: '+ DSS.farmName.bold(),
				},
			]
		},
		{
			xtype: 'button',
			cls: 'button-text-pad-large',
			//id: 'dupCurScen',
			//disabled: true,
			//padding: 1,
			height: 30,
			//margin: '4 2 2 4',
			componentCls: 'button-margin-large',
			text: '<p style="font-size:15px;"> Create New Scenario</p>',
			handler: function(self) {
				DSS.dialogs.NewScenPickWindow = Ext.create('DSS.state.NewScenPickWindow'); 				
				DSS.dialogs.NewScenPickWindow.show().center().setY(100);
			}
		},
			{ //------------------------------------------
				xtype: 'component',
				cls: 'information',
				html: 'Or',
			},
			{
				xtype: 'container',
				width: '100%',
				layout: 'absolute',
				items: [{
					xtype: 'component',
					x: 0, y: -6,
					width: '100%',
					height: 30,
					cls: 'information',
					html: "Select and edit an existing scenario",
				}],
				
			},{ 
				xtype: 'container',
				layout: DSS.utils.layout('vbox', 'center', 'stretch'),
				items: [
			Ext.create('Ext.menu.Menu', {
				width: 80,
				//height: 140,
				scrollable: true,
				id: "scenarioMenu",
				margin: '0 0 10 0',
				floating: false,  // usually you want this set to True (default)
				renderTo: Ext.getBody(),  // usually rendered by it's containing component
				items: itemsArray,
				listeners:{
					click: async function( menu, item, e, eOpts ) {
						let menuItems = Ext.getCmp("scenarioMenu").items.items
						let selectedItemID = item.id
						for(i in menuItems){
							if(menuItems[i].id == item.id){
								menuItems[i].setStyle({
									backgroundColor: '#EE6677'//'#4477AA',
								});
							}else{
								menuItems[i].setStyle({
									backgroundColor: 'white',
								});
							}
						}
						fieldZoom = true
						console.log(Ext.getCmp("scenarioMenu").items.items);
						console.log(item.id)
						//console.log(item.inputValue);
						DSS.activeScenario = item.inputValue;
						DSS.scenarioName = item.text
						// item.setStyle({
						// 	backgroundColor: '#4477AA',
						// });
						//Ext.getCmp('scenIDpanel').setHtml('"'+ DSS.scenarioName+'"');
						scenarioPickerArray = []
						DSS.MapState.showFieldsForScenario();
						DSS.MapState.showInfraForScenario();
						DSS.layer.fields_1.setVisible(true);
						DSS.layer.fields_1.getSource().refresh();
						DSS.layer.fieldsLabels.getSource().refresh();
						DSS.layer.infrastructure.setVisible(true);
						DSS.layer.fieldsLabels.setVisible(true);
						console.log('choose scenario menu')
						activateScenButtons()
					}
				}
			})]
			},
//Create new Scenario button
			

			{
					xtype: 'button',
					cls: 'button-text-pad',
					id: 'editCurScen',
					disabled: true,
					componentCls: 'button-margin',
					text: 'Edit Selected Scenario',
					handler: function(self) {
						//reSourcescenarios()
						DSS.ApplicationFlow.instance.showScenarioPage();
					}
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Delete Selected Scenario',
					id: 'delCurScen',
					disabled: true,
					handler: async function(self) {
						if(confirm('Are you sure you want to delete scenario ' + DSS.scenarioName)) {
							console.log("DELETED!")
							await selectDeleteScenario(DSS.activeScenario)
							DSS.MapState.hideFieldsandInfra()
							geoServer.setScenariosSource('&CQL_filter=farm_id='+DSS.activeFarm)
							} else {
							console.log("NOT DELETED!")
						}
					}
				},
		]
		});
		
		me.callParent(arguments);
	}
});

