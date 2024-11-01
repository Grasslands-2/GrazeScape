
DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')

//  var pastAcreageHS = 0
//  var cropAcreageHS = 0
// let breedSizeStore = Ext.create('Ext.data.Store', {
// 	storeId: 'breedSizeStore',
// 	fields:[ 'label', 'value'],
// 	data: [{
// 		value: 'small',
// 		label: 'Small'
// 	},{ 
// 		value: 'large',
// 		label: 'Large'
// 	}]
// });
// let bredStore = Ext.create('Ext.data.Store', {
// 	storeId: 'bredStore',
// 	fields:[ 'label', 'value'],
// 	data: [{
// 		value: 'Bred',
// 		label: 'Bred'
// 	},{ 
// 		value: 'Unbred',
// 		label: 'Unbred'
// 	}]
// });
// let weightGainStore = Ext.create('Ext.data.Store', {
// 	storeId: 'weightGainStore',
// 	fields:[ 'label', 'value'],
// 	data: [{
// 		value: 1.10,
// 		label: '1.10'
// 	},{ 
// 		value: 1.32,
// 		label: '1.32'
// 	},{ 
// 		value: 1.54,
// 		label: '1.54'
// 	},{ 
// 		value: 1.76,
// 		label: '1.76'
// 	},{ 
// 		value: 1.98,
// 		label: '1.98'
// 	}]
// });

//------------------------------------------------------------------------------
Ext.define('DSS.state.scenario.HeiferScapeDialog', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_heifter_scape_dialog',
	
	autoDestroy: true,
	closeAction: 'hide',
	autoScroll: true,
	constrain: false,
	modal: true,
	width: 800,
	resizable: true,
	bodyPadding: 8,
	titleAlign: 'center',
	
	title: 'Herd Feed Worksheet',
	
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		//--------------------------------------------
		// Dairy Container
		//--------------------------------------------
		let heiferContainer = {
			xtype: 'container',
			layout: 'fit',
			autoDestroy: false,
			items: [{
				xtype: 'container',
				itemId: 'heifer-section',
				cls: 'sub-container',
				autoScroll: true,
				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				hidden: true,
				items: [{
					xtype: 'component',
					cls: 'information accent-text box-underline',
					html: 'Configure the <b>heifer compoent of herd</b>',
					margin: '0 32',
				},{
					xtype: 'container',
					layout: DSS.utils.layout('vbox', 'start', 'middle'),
					margin: 8,
					defaults: {
						xtype: 'numberfield',
						minValue: 0,
						step: 1,
						allowBlank: false,
						labelAlign: 'right',
						labelWidth: 100,
						width: 200,
					},
					items: [
						{
							fieldLabel: 'Heifers',
							bind: '{dairy.heifers}'
						},
						{
							xtype: 'numberfield',
							fieldLabel: 'Heifers On Pasture',
							labelAlign: 'right',
							labelWidth: 148,
							width:300,
							bind: '{dairy.animalsOnPasture}',
							minValue: 1,
							step: 1,
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
							bind: '{heifers.breedSize}',
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
							bind: '{heifers.bred}',
						},{
							fieldLabel: 'Average Starting Weight(lbs)',
							bind: '{heifers.asw}'
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
							bind: '{heifers.tdwg}',
						},{
							fieldLabel: 'Days on Pasture',
							bind: '{heifers.daysOnPasture}'
					}]
				},{
					xtype: 'component',
					cls: 'information accent-text box-underline',
					html: 'Scenario Yield Breakdown',
					margin: '0 32',
				},{
					xtype: 'textfield',
					fieldLabel: 'Acres in Pasture',
					//id:'pastAcreage',
					editable:false,
					autoDestroy: true,
					allowBlank: true,
					labelWidth: 140,
					width: 360,
					labelAlign: 'right',
					bind: '{acreage.pasture}'
					},
					{
					xtype: 'textfield',
					fieldLabel: 'Acres in Crops',
					//id:'cropAcreage',
					editable:false,
					autoDestroy: true,
					allowBlank: true,
					labelWidth: 140,
					width: 360,
					labelAlign: 'right',
					bind: '{acreage.crop}'
					},{
					xtype: 'textfield',
					fieldLabel: 'Total Pasture Feed Available (Tons DMI)',
					//id:'cropAcreage',
					editable:false,
					autoDestroy: true,
					allowBlank: true,
					labelWidth: 140,
					width: 360,
					labelAlign: 'right',
					//bind: '{acreage.crop}'
					},{
					xtype: 'textfield',
					fieldLabel: 'Suffient Feed From Pastures for Heifer Herd?',
					//id:'cropAcreage',
					editable:false,
					autoDestroy: true,
					allowBlank: true,
					labelWidth: 140,
					width: 360,
					labelAlign: 'right',
					value: 'True',
					//bind: '{acreage.crop}'
					},
				{
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
					bind: '{heifers.percNonPasture}',
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
					bind: '{heifers.forageFromPasturePerHeadDay}',
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
					bind: '{heifers.forageFromPasturePerDayHerd}',
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
					bind: '{heifers.dmiDemandPerSeason}',
					minValue: 1,
					step: 0.5,
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Run Heiferscape Model',
					handler: function() { 
						console.log('running Heiferscape models')
					}
				}
				]
			}]
		};
		
		Ext.applyIf(me, {
			items: [
			// 	{
			// 	xtype: 'component',
			// 	padding: 4,
			// 	cls: 'information med-text',
			// 	html: 'Click to manage the types of animals present at this operation'
					
			// },
			{
				xtype: 'container',
				layout: DSS.utils.layout('hbox', 'center'),
				defaults: {
					xtype: 'button',
					margin: '8 4',
					minWidth: 100,
					enableToggle: true
				},
				items: [{//--------------------------------------------------------------------------
					text: 'Heifer Feed Balance',
					toggleHandler: function(self, pressed) {
						let container = me.down("#heifer-section");
						if (pressed) {
							console.log(container.items)
							// var pastAcreageHS = pastAcreage.toFixed(2)
							// var cropAcreageHS = cropAcreage.toFixed(2)
							// //console.log(fieldArray);
							// //console.log(pastAcreage);
							// //console.log(cropAcreage);
							// Ext.getCmp('pastAcreage').setValue(pastAcreageHS)
							// Ext.getCmp('cropAcreage').setValue(cropAcreageHS)
							container.setHeight(0);
							container.setVisible(true)
							container.animate({
								dynamic: true,
								to: {
									width:1000,
									height: 600
								}
							});
						} 
						else {
							// pastAcreage = 0
							// pastAcreage = 0
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
							//container.destroy()
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
					heiferContainer
				]	
			}]
		});
		
		me.callParent(arguments);
		
		AppEvents.registerListener("viewport_resize", function(opts) {
			me.center();
		})
	},
	
});
