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
    autoDestroy: false,
    scrollable: 'y',
	titleAlign: 'center',
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: async function() {
		let me = this;
		if(Ext.getCmp('dupCurScen')){
			Ext.getCmp('dupCurScen').setDisabled(true)
		}
		getWFSScenarioSP()
		
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
				},
				{
					xtype: 'component',
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
						DSS.dialogs.ScenarioPicker = Ext.create('DSS.state.NewDupScenario'); 
						DSS.dialogs.ScenarioPicker.show().center().setY(0);
						console.log('This is the scenarioArray: ')
						console.log(scenarioArray)
						console.log(scenDupArray);
						this.up('window').destroy();
					}
				},{ //------------------------------------------
					xtype: 'component',
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
						getWFSScenarioNS();
						console.log('This is the scenarioArray: ')
						console.log(scenarioArray)
						getWFSScenarioSP()
						this.up('window').destroy();
					}
				}
			]
			}]
		});
		
		me.callParent(arguments);
	},
});
