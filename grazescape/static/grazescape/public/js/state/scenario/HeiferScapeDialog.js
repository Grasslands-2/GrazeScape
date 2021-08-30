
DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')

// var pastAcreageHS = 0
// var cropAcreageHS = 0
let breedSizeStore = Ext.create('Ext.data.Store', {
	storeId: 'breedSizeStore',
	fields:[ 'label', 'value'],
	data: [{
		value: 'small',
		label: 'Small'
	},{ 
		value: 'large',
		label: 'Large'
	}]
});
let bredStore = Ext.create('Ext.data.Store', {
	storeId: 'bredStore',
	fields:[ 'label', 'value'],
	data: [{
		value: 'Bred',
		label: 'Bred'
	},{ 
		value: 'Unbred',
		label: 'Unbred'
	}]
});
let weightGainStore = Ext.create('Ext.data.Store', {
	storeId: 'weightGainStore',
	fields:[ 'label', 'value'],
	data: [{
		value: 1.10,
		label: '1.10'
	},{ 
		value: 1.32,
		label: '1.32'
	},{ 
		value: 1.54,
		label: '1.54'
	},{ 
		value: 1.76,
		label: '1.76'
	},{ 
		value: 1.98,
		label: '1.98'
	}]
});

//------------------------------------------------------------------------------
Ext.define('DSS.state.scenario.HeiferScapeDialog', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_heifter_scape_dialog',
	
	autoDestroy: false,
	closeAction: 'hide',
	constrain: true,
	modal: true,
	width: 832,
	resizable: false,
	bodyPadding: 8,
	titleAlign: 'center',
	
	title: 'Heifer Scape!',
	
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		//--------------------------------------------
		// Dairy Container
		//--------------------------------------------
		let dairyContainer = {
			xtype: 'container',
			layout: 'fit',
			items: [{
				xtype: 'container',
				itemId: 'heifer-section',
				cls: 'sub-container',
				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				hidden: true,
				items: [{
					xtype: 'component',
					cls: 'information accent-text box-underline',
					html: 'Configure the <b>size of the dairy herd</b>',
					margin: '0 32',
				},{
					xtype: 'container',
					layout: DSS.utils.layout('vbox', 'start', 'middle'),
					margin: 8,
					defaults: {
						xtype: 'numberfield',
						minValue: 0,
						allowBlank: false,
						labelAlign: 'right',
						labelWidth: 100,
						width: 200,
					},
					items: [
						{
						xtype: 'textfield',
						fieldLabel: 'Acres in Pasture',
						id:'pastAcreage',
						editable:false,
						allowBlank: true,
						labelWidth: 140,
						width: 360,
						labelAlign: 'right',
						value:""
						},
						{
						xtype: 'textfield',
						fieldLabel: 'Acres in Crops',
						id:'cropAcreage',
						editable:false,
						allowBlank: true,
						labelWidth: 140,
						width: 360,
						labelAlign: 'right',
						value:""
						},
						{
						xtype: 'combo',
						fieldLabel: 'Breed Size',
						labelWidth: 140,
						width: 360,
						labelAlign: 'right',
						mode: 'remote',
						triggerAction: 'all',
						store: 'breedSizeStore',
						displayField: 'label',
						valueField: 'value',
						bind: '{heifer.breedSize}',
						},{
						xtype: 'combo',
						fieldLabel: 'Bred or Unbred',
						labelWidth: 140,
						width: 360,
						labelAlign: 'right',
						mode: 'remote',
						triggerAction: 'all',
						store: 'bredStore',
						displayField: 'label',
						valueField: 'value',
						bind: '{heifer.bred}',
						},{
						fieldLabel: 'Average Starting Weight(lbs)',
						bind: '{heifer.asw}'
						},{
						xtype: 'combo',
						fieldLabel: 'Target Daily Wieght Gain(lbs/day)',
						labelWidth: 140,
						width: 360,
						labelAlign: 'right',
						mode: 'remote',
						triggerAction: 'all',
						store: 'weightGainStore',
						displayField: 'label',
						valueField: 'value',
						bind: '{heifer.tdwg}',
						},{
						fieldLabel: 'Days on Pasture',
						bind: '{heifer.daysOnPasture}'
					}]
				},{//----------------------------------------------------------------
					xtype: 'component',
					cls: 'information accent-text box-underline',
					html: 'Specify the <b>Pasture Non-Pasture Feed Break Down</b>',
					margin: '0 32',
				},{
					xtype: 'numberfield',
					width: 200,
					margin: '8 82',
					fieldLabel: '% dry matter form sources besides pasture ',
					labelAlign: 'right',
					labelWidth: 148,
					bind: '{heifer.percNonPasture}',
					minValue: 1,
					step: 0.5,
				},
				{
					xtype: 'numberfield',
					width: 200,
					margin: '8 82',
					fieldLabel: 'Adjusted lbs/head/day of forage from pasture',
					labelAlign: 'right',
					labelWidth: 148,
					maxValue: 100,
					minValue: 0,
					value:0,
					bind: '{heifer.forageFromPasturePerHeadDay}',
					minValue: 1,
					step: 0.5,
				},
				{
					xtype: 'numberfield',
					width: 200,
					margin: '8 82',
					fieldLabel: 'Adjusted lbs/day for herd of forage from pasture',
					labelAlign: 'right',
					labelWidth: 148,
					maxValue: 100,
					minValue: 0,
					value:0,
					bind: '{heifer.forageFromPasturePerDayHerd}',
					minValue: 1,
					step: 0.5,
				},
				{
					xtype: 'numberfield',
					width: 200,
					margin: '8 82',
					fieldLabel: 'Total DMI demand for grazing season (tons)',
					labelAlign: 'right',
					labelWidth: 148,
					maxValue: 100,
					minValue: 0,
					value:0,
					bind: '{heifer.dmiDemandPerSeason}',
					minValue: 1,
					step: 0.5,
				}
				]
			},{
				xtype: 'button',
				cls: 'button-text-pad',
				componentCls: 'button-margin',
				text: 'Run Heiferscape Model',
				handler: function() { 
					console.log('running Heiferscape models')
				}
			}]
		};
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				padding: 4,
				cls: 'information med-text',
				html: 'Click to manage the types of animals present at this operation'
					
			},{
				xtype: 'container',
				layout: DSS.utils.layout('hbox', 'center'),
				defaults: {
					xtype: 'button',
					margin: '8 4',
					minWidth: 100,
					enableToggle: true
				},
				items: [{//--------------------------------------------------------------------------
					text: 'Pasture-Heifer Balance',
					toggleHandler: function(self, pressed) {
						let container = me.down("#heifer-section");
						if (pressed) {
							console.log(container.items)
							var pastAcreageHS = pastAcreage.toFixed(2)
							var cropAcreageHS = cropAcreage.toFixed(2)
							//console.log(fieldArray);
							//console.log(pastAcreage);
							//console.log(cropAcreage);
							Ext.getCmp('pastAcreage').setValue(pastAcreageHS)
							Ext.getCmp('cropAcreage').setValue(cropAcreageHS)
							container.setHeight(0);
							container.setVisible(true)
							container.animate({
								dynamic: true,
								to: {
									height: 550
								}
							});
						} 
						else {
							pastAcreage = 0
							pastAcreage = 0
							me.setHeight(null)
							container.animate({
								dynamic: true,
								to: {
									height: 0
								},
								callback: function() {
									container.setVisible(false);
								}
							});
						}
					}
				},]
			},{//------------------------------------------------------------------
				xtype: 'container',
				layout: DSS.utils.layout('hbox', 'center'),
//				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				defaults: {
					width: 400,
				},
				items: [
					dairyContainer
				]	
			}]
		});
		
		me.callParent(arguments);
		
		AppEvents.registerListener("viewport_resize", function(opts) {
			me.center();
		})
	},
	
});
