
DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')
Ext.define('CurrencyField', {
	extend: 'Ext.form.field.Number',
	alias: 'widget.currencyfield',
	currency: '$', //change to the symbol you would like to display.
	listeners: {
		render: function (cmp) {
			cmp.showCurrency(cmp);
		},
		blur: function (cmp) {
			cmp.showCurrency(cmp);
		},
		focus: function (cmp) {
			cmp.setRawValue(cmp.valueToRaw(cmp.getValue()));
		}
	},
	showCurrency: function (cmp) {
		cmp.setRawValue(Ext.util.Format.currency(cmp.valueToRaw(cmp.getValue()), cmp.currency, 0, true));
	},
	valueToRaw: function (value) {
		return value.toString().replace(/[^0-9.]/g, '');
	},
	rawToValue: function (value) {
		return Ext.util.Format.round(this.valueToRaw(value), 0);
	}
});
// END Currency Component
//------------------------------------------------------------------------------
Ext.define('DSS.state.scenario.CostsDialog', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_costs_dialog',
	alternateClassName: 'DSS.CostsDialog',
	autoDestroy: false,
	closeAction: 'hide',
	//constrain: true,
	modal: true,
	width: 500,
	resizable: true,
	bodyPadding: 8,
	titleAlign: 'center',
	scrollable: true,
	
	title: 'Adjust Costs of Operation',
	
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		//--------------------------------------------
		// Dairy Container
		//--------------------------------------------
			
		Ext.applyIf(me, {
			items: [
			// 	{
			// 	xtype: 'component',
			// 	cls: 'information accent-text box-underline',
			// 	//html: 'Configure the <b>size of the dairy herd</b>',
			// 	margin: '0 32',
			// },
			{
				xtype: 'container',
				//layout: DSS.utils.layout('hbox', 'start', 'left'),
				height: 700,
				width: 150,
				//scrollable: true,
				//autoHeight: true,
				//margin: 8,
				layout: {
					type: 'vbox',       // Arrange child items vertically
					align: 'stretch',    // Each takes up full width
					padding: 5
				},
				//width: undefined,
				// layout: {
				// 	type: 'hbox',
				// 	align: 'stretch'
				// },
				// defaults: {
				// 	xtype: 'numberfield',
				// 	minValue: 0,
				// 	step: 3,
				// 	labelAlign: 'left',
				// 	labelWidth: 100,
				// 	width: 200,
				// },
				items: [
					{
						xtype: 'fieldcontainer',
						flex: 1,
						height: 75,
						defaults: {
							xtype: 'numberfield',
							minValue: 0,
							step: 3,
							labelAlign: 'left',
							labelWidth: 250,
							width: 350,
						},
						items: [{
							fieldLabel: 'P Fertilizer per lb',
							value: scenarioArray[0].fertPCost,
							bind: '{costs.fertPCost}'
						},
						{
							fieldLabel: 'N Fertilizer per lb',
							value: scenarioArray[0].fertNCost,
							bind: '{costs.fertNCost}'
						},
					]
					},
					{
						xtype: 'fieldcontainer',
						flex: 1,
						height: 100,
						defaults: {
							xtype: 'numberfield',
							minValue: 0,
							step: 3,
							labelAlign: 'left',
							labelWidth: 250,
							width: 350,
						},
						items: [{
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
					]
					},
					{
						xtype: 'fieldcontainer',
						flex: 1,
						height: 100,
						defaults: {
							xtype: 'numberfield',
							minValue: 0,
							step: 3,
							labelAlign: 'left',
							labelWidth: 250,
							width: 350,
						},
						items: [ {
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
					]
					},
					{
						xtype: 'fieldcontainer',
						flex: 1,
						height: 100,
						defaults: {
							xtype: 'currencyfield',
							minValue: 0,
							step: 3,
							labelAlign: 'left',
							labelWidth: 250,
							width: 350,
						},
						items: [ {
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
					]
					},
					{
						xtype: 'fieldcontainer',
						flex: 1,
						height: 100,
						defaults: {
							xtype: 'numberfield',
							minValue: 0,
							step: 3,
							labelAlign: 'left',
							labelWidth: 250,
							width: 350,
						},
						items: [ {
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
					]
					},
					{
						xtype: 'fieldcontainer',
						flex: 1,
						height: 100,
						defaults: {
							xtype: 'numberfield',
							minValue: 0,
							step: 3,
							labelAlign: 'left',
							labelWidth: 250,
							width: 350,
						},
						items: [ {
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
						{
							fieldLabel: 'Alfalfa Machinary Costs First Year',
							value: scenarioArray[0].alfalfaMachYearOneCost,
							bind: '{costs.alfalfaMachYearOneCost}'
						},
					]
					},
					
				]
			},
			{
				xtype: 'button',
				cls: 'button-text-pad',
				componentCls: 'button-margin',
				text: 'Save Changes',
				handler: async function(self) {
					await runScenarioUpdate()
					//
					//await gatherScenarioTableData()
					setTimeout(function(){
						geoServer.getWFSScenario('&CQL_filter=gid='+DSS.activeScenario)},1000)
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
