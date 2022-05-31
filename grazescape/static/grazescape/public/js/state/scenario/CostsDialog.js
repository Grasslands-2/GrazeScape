
DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')

//------------------------------------------------------------------------------
Ext.define('DSS.state.scenario.CostsDialog', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_costs_dialog',
	alternateClassName: 'DSS.CostsDialog',
	autoDestroy: false,
	closeAction: 'hide',
	constrain: true,
	modal: true,
	width: 925,
	resizable: true,
	bodyPadding: 8,
	titleAlign: 'center',
	
	title: 'Adjust Costs of Operation',
	
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		//--------------------------------------------
		// Dairy Container
		//--------------------------------------------
		let dairyContainer = {
			xtype: 'container',
			width: 300,
			height: 550,
			layout: 'fit',
			//items: [
				// {
				// xtype: 'container',
				// itemId: 'dairy-section',
				// cls: 'sub-container',
				// autoScroll: true,
				// layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				// hidden: true,
				
			//}
		//]
		};		
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				cls: 'information accent-text box-underline',
				html: 'Configure the <b>size of the dairy herd</b>',
				margin: '0 32',
			},{
				xtype: 'container',
				layout: DSS.utils.layout('vbox', 'start', 'left'),
				margin: 8,
				defaults: {
					xtype: 'numberfield',
					minValue: 0,
					step: 3,
					labelAlign: 'left',
					labelWidth: 100,
					width: 200,
				},
				items: [
					{
						fieldLabel: 'P Fertilizer per lb',
						value: scenarioArray[0].fertPCost,
						bind: '{costs.fertPCost}'
					},
					{
						fieldLabel: 'N Fertilizer per lb',
						value: scenarioArray[0].fertNCost,
						bind: '{costs.fertNCost}'
					},
					{
						fieldLabel: 'Corn Seed Costs Per Acre',
						value: scenarioArray[0].cornSeedCost,
						bind: '{costs.cornSeedCost}'
					},
					{
						fieldLabel: 'Corn Pesticide Costs Per Acre',
						value: scenarioArray[0].cornPestCost,
						bind: '{costs.cornPestCost}'
					},
					{
						fieldLabel: 'Corn Machinary Costs Per Acre',
						value: scenarioArray[0].cornMachCost,
						bind: '{costs.cornMachCost}'
					},
					{
						fieldLabel: 'Soy Seed Costs Per Acre',
						value: scenarioArray[0].soySeedCost,
						bind: '{costs.soySeedCost}'
					},{
						fieldLabel: 'Soy Pesticide Costs Per Acre',
						value: scenarioArray[0].soyPestCost,
						bind: '{costs.soyPestCost}'
					},
					{
						fieldLabel: 'Soy Machinary Costs Per Acre',
						value: scenarioArray[0].soyMachCost,
						bind: '{costs.soyMachCost}'
					},
					{
						fieldLabel: 'Grass Seed Costs Per Acre',
						value: scenarioArray[0].grassSeedCost,
						bind: '{costs.grassSeedCost}'
					},{
						fieldLabel: 'Grass Pesticide Costs Per Acre',
						value: scenarioArray[0].grassPestCost,
						bind: '{costs.grassPestCost}'
					},
					{
						fieldLabel: 'Grass Machinary Costs Per Acre',
						value: scenarioArray[0].grassMachCost,
						bind: '{costs.grassMachCost}'
					},
					{
						fieldLabel: 'Oat Seed Costs Per Acre',
						value: scenarioArray[0].oatSeedCost,
						bind: '{costs.oatSeedCost}'
					},{
						fieldLabel: 'Oat Pesticide Costs Per Acre',
						value: scenarioArray[0].oatPestCost,
						bind: '{costs.oatPestCost}'
					},
					{
						fieldLabel: 'Oat Machinary Costs Per Acre',
						value: scenarioArray[0].oatMachCost,
						bind: '{costs.oatMachCost}'
					},
					{
						fieldLabel: 'Alfalfa Seed Costs Per Acre',
						value: scenarioArray[0].alfalfaSeedCost,
						bind: '{costs.alfalfaSeedCost}'
					},{
						fieldLabel: 'Alfalfa Pesticide Costs Per Acre',
						value: scenarioArray[0].alfalfaPestCost,
						bind: '{costs.alfalfaPestCost}'
					},
					{
						fieldLabel: 'Alfalfa Machinary Costs Per Acre',
						value: scenarioArray[0].alfalfaMachCost,
						bind: '{costs.alfalfaMachCost}'
					},
				]
			},
			{
				xtype: 'button',
				cls: 'button-text-pad',
				componentCls: 'button-margin',
				text: 'Save Changes',
				handler: async function(self) {
					await runScenarioUpdate();
					//
					//gatherScenarioTableData()
					await geoServer.getWFSScenario('&CQL_filter=gid='+DSS.activeScenario)
					//DSS.layer.scenarios.getSource().refresh()
					console.log("Changes saved")
					this.up('window').close();
				}
			}
		]
		});
		
		me.callParent(arguments);
		
		AppEvents.registerListener("viewport_resize", function(opts) {
			me.center();
		})
	},
	
});
