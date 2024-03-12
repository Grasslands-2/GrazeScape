
DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')

var pastAcreageHS = 0
var cropAcreageHS = 0
Ext.create('Ext.data.Store', {
	storeId: 'rotationFreq',
	fields:['display', 'value'],
	data: [{
		value: '1.2',
		display: 'More than once a day'
	},{ 
		value: '1',
		display: 'Once a day'
	},{ 
		value: '0.95',
		display: 'Every 3 days'
	},{ 
		value:'0.75',
		display: 'Every 7 days'
	},{ 
		value: '0.65',
		display: 'Continuous'
	}]
});
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
		value: 'bred',
		label: 'Bred'
	},{ 
		value: 'non bred',
		label: 'Unbred'
	}]
});
let weightGainStore = Ext.create('Ext.data.Store', {
	storeId: 'weightGainStore',
	fields:[ 'label', 'value'],
	data: [{
		value: 0.7,
		label: '0.7'
	},{
		value: 0.9,
		label: '0.9'
	},{
		value: 1.1,
		label: '1.1'
	},{ 
		value: 1.3,
		label: '1.3'
	},{ 
		value: 1.5,
		label: '1.5'
	},{ 
		value: 1.8,
		label: '1.8'
	},{ 
		value: 2.0,
		label: '2.0'
	},{ 
		value: 2.2,
		label: '2.2'
	}]
});

let rotationFreq = Ext.create('Ext.data.Store', {
	storeId: 'rotationFreqStore',
	fields:[ 'label', 'enum'],
	data: [{
		enum: 1.2,
		label: 'More than once a day'
	},{ 
		enum: 1,
		label: 'Once a day'
	},{ 
		enum: 0.95,
		label: 'Every 3 days'
	},{ 
		enum: 0.75,
		label: 'Every 7 days'
	},{ 
		enum: 0.65,
		label: 'Continuous'
	}]
});

//------------------------------------------------------------------------------
Ext.define('DSS.state.scenario.AnimalDialog', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_animal_dialog',
	
	autoDestroy: false,
	closeAction: 'hide',
	constrain: true,
	modal: true,
	width: 925,
	resizable: true,
	bodyPadding: 8,
	titleAlign: 'center',
	
	title: 'Configure Animals',
	
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
			items: [{
				xtype: 'container',
				itemId: 'dairy-section',
				cls: 'sub-container',
				autoScroll: true,
				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				hidden: true,
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
						value: 20,
						minValue: 0,
						step: 1,
						labelAlign: 'left',
						labelWidth: 100,
						width: 250,
					},
					items: [{
						fieldLabel: 'Lactating Cows',
						bind: '{dairy.lactating}'
					},{
						fieldLabel: 'Dry Cows',
						bind: '{dairy.dry}'
					},
					// {
					// 	fieldLabel: 'Heifers',
					// 	bind: '{dairy.heifers}'
					// },
					{
						fieldLabel: 'Youngstock',
						bind: '{dairy.youngstock}'
					}]
				},{//----------------------------------------------------------------
					xtype: 'component',
					cls: 'information accent-text box-underline',
					html: 'Specify the <b>average daily milk yield</b>',
					margin: '0 32',
				},{
					xtype: 'numberfield',
					width: 200,
					margin: '0 32',
					fieldLabel: 'Milk Yield (lb/day/Cow)',
					labelAlign: 'left',
					labelWidth: 100,
					bind: '{dairy.dailyYield}',
					minValue: 0,
					step: 0.5,
				},{ //------------------------------------------------------------
					xtype: 'component',
					cls: 'information accent-text box-underline',
					html: 'How are the <b>lactating</b> cattle managed?',
					margin: '0 32',
				},{
					xtype: 'container',
					itemId: 'lactating-cattle',
					layout: DSS.utils.layout('vbox', 'start', 'left'),
					margin: 8,
					items: [	{
						xtype: 'numberfield',
						fieldLabel: 'Animals On Pasture',
						labelAlign: 'left',
						labelWidth: 100,
						width: 250,
						bind: '{dairy.animalsOnPasture}',
						minValue: 1,
						step: 1,
						},
						{
						xtype: 'container',
						width: undefined,
						layout: DSS.utils.layout('hbox', 'left'),
						items: [
							{
							xtype: 'component',
							itemId: 'grazed-display',
							cls: 'information',
							padding: 4,
							margin: '0 4',
							width: 32,
							style: 'border: 1px solid rgba(0,0,0,0.1); background-color: white; border-radius: 2px',
						},
						{
							xtype: 'slider',
							width: 190,
							minValue: 0,
							maxValue: 12,
							bind: '{dairy.lactatingConfined}',
							step: 1,
							listeners: {
								change: function(slider, newValue) {
									slider.up().down('#grazed-display').update('' + (12 - newValue));
									slider.up().down('#confined-display').update('' + newValue);
									Ext.each(
										Ext.ComponentQuery.query('[dssID=if-grazed]', me.down('#lactating-cattle')),
										function(item) {
											item.setDisabled(newValue == 12);
										}
									);
								}
							},
							tipText: function(thumb)  {
								const v = thumb.slider.getValue();
								return 12 - v + " / " + v;
							}
						},{
							xtype: 'component',
							itemId: 'confined-display',
							cls: 'information',
							padding: 4,margin: '0 4',
							width: 32,
							style: 'border: 1px solid rgba(0,0,0,0.1); background-color: white; border-radius: 2px',
						}]
					},{
						xtype: 'container',
						width: undefined,
						layout: DSS.utils.layout('hbox', 'left'),
						items: [{
							xtype: 'component',
							width: 64,
							cls: 'information med-text bold',
							html: 'Pastured'
						},{
							xtype: 'component',
							cls: 'information-compact med-text',
							width: 130,
							html: 'Period (mo / yr)'
						},{
							xtype: 'component',
							width: 64,
							cls: 'information med-text bold',
							html: 'Confined',
							labelAlign: 'right'
						}]
					},{
						xtype: 'numberfield',
						dssID: 'if-grazed',
						bind: '{dairy.lactatingGrazeTime}',
						minValue: 0,
						maxValue: 12,
						step: 1,
						labelAlign: 'left',
						labelWidth: 100,
						width: 250,
						fieldLabel: 'Grazing Time (h/d)',
						maxValue: 24
					},
					{
						xtype: 'numberfield',
						step: 1,
						allowBlank: false,
						labelAlign: 'left',
						labelWidth: 100,
						width: 250,
						fieldLabel: 'Target % Dairy Pasture Residual',
						bind: '{percResidualOnPasture}',
						value: 30,
						maxValue: 50,
						minValue: 10
					},
					{
						xtype: 'combo',
						fieldLabel: 'Dairy Rotational Frequency',
						labelAlign: 'left',
						labelWidth: 100,
						width: 250,
						mode: 'remote',
						triggerAction: 'all',
						store: 'rotationFreqStore',
						displayField: 'label',
						valueField: 'value',
						bind: '{rotationFreqVal}',
					},]
				},
				// { //------------------------------------------------------------
				// 	xtype: 'component',
				// 	cls: 'information accent-text box-underline',
				// 	html: 'How are the <b>non-lactating</b> cattle managed?',
				// 	margin: '0 32',
				// },
				// {
				// 	xtype: 'container',
				// 	itemId: 'non-lactating-cattle',
				// 	layout: DSS.utils.layout('vbox', 'start', 'left'),
				// 	margin: 8,
				// 	items: [
				// 		{
				// 		xtype: 'numberfield',
				// 		fieldLabel: 'Animals On Pasture',
				// 		labelAlign: 'left',
				// 		labelWidth: 100,
				// 		width: 250,
				// 		bind: '{heifers.animalsOnPasture}',
				// 		minValue: 1,
				// 		step: 1,
				// 		},
				// 		{
				// 		xtype: 'combo',
				// 		fieldLabel: 'Breed Size',
				// 		labelAlign: 'left',
				// 		labelWidth: 100,
				// 		width: 250,
				// 		mode: 'remote',
				// 		triggerAction: 'all',
				// 		store: 'breedSizeStore',
				// 		displayField: 'label',
				// 		valueField: 'value',
				// 		bind: '{heifers.breedSize}',
				// 		// listeners:{ 
				// 		// 	change: function(){
				// 		// 		selectedType = Ext.getCmp('bredDropDown').getValue()
				// 		// 		console.log(selectedType)
				// 		// 		if(selectedType == 'small'){
				// 		// 			console.log(Ext.getCmp('bredDropDown'))
				// 		// 			Ext.getCmp('asw').setBind(220)
				// 		// 			// Ext.getCmp('asw').setMinValue(220)
				// 		// 			// Ext.getCmp('asw').setMaxValue(460)
									
				// 		// 		}else if (selectedType == 'large'){
				// 		// 			console.log(Ext.getCmp('asw'))
				// 		// 			Ext.getCmp('asw').setBind(330)
									
				// 		// 			// Ext.getCmp('asw').setMinValue(330)
				// 		// 			// Ext.getCmp('asw').setMaxValue(670)
				// 		// 		}
				// 		// 	}
				// 		// }
				// 		},
				// 		{
				// 		xtype: 'combo',
				// 		fieldLabel: 'Bred or Unbred',
				// 		labelAlign: 'left',
				// 		labelWidth: 100,
				// 		width: 250,
				// 		mode: 'remote',
				// 		triggerAction: 'all',
				// 		store: 'bredStore',
				// 		displayField: 'label',
				// 		valueField: 'value',
				// 		bind: '{heifers.bred}',
				// 		},{
				// 		//id: 'asw',
				// 		fieldLabel: 'Average Starting Weight(lbs)',
				// 		bind: '{heifers.asw}',
				// 		},{
				// 		xtype: 'combo',
				// 		fieldLabel: 'Target Daily Wieght Gain(lbs/day)',
				// 		labelAlign: 'left',
				// 		labelWidth: 100,
				// 		width: 250,
				// 		mode: 'remote',
				// 		triggerAction: 'all',
				// 		store: 'weightGainStore',
				// 		displayField: 'label',
				// 		valueField: 'value',
				// 		bind: '{heifers.tdwg}',
				// 		},
				// 		{
				// 		xtype: 'container',
				// 		width: undefined,
				// 		layout: DSS.utils.layout('hbox', 'left'),
				// 		items: [{
				// 			xtype: 'component',
				// 			itemId: 'grazed-display',
				// 			cls: 'information',
				// 			padding: 4,margin: '0 4',
				// 			width: 32,
				// 			style: 'border: 1px solid rgba(0,0,0,0.1); background-color: white; border-radius: 2px',
				// 		},{
				// 			xtype: 'slider',
				// 			width: 170,
				// 			minValue: 0,
				// 			maxValue: 12,
				// 			bind: '{dairy.nonLactatingConfined}',
				// 			step: 1,
				// 			listeners: {
				// 				change: function(slider, newValue) {
				// 					slider.up().down('#grazed-display').update('' + (12 - newValue));
				// 					slider.up().down('#confined-display').update('' + newValue);
				// 					Ext.each(
				// 						Ext.ComponentQuery.query('[dssID=if-grazed]', me.down('#non-lactating-cattle')),
				// 						function(item) {
				// 							item.setDisabled(newValue == 12);
				// 						}
				// 					);
				// 				}
				// 			},
				// 			tipText: function(thumb)  {
				// 				const v = thumb.slider.getValue();
				// 				return 12 - v + " / " + v;
				// 			}
				// 		},{
				// 			xtype: 'component',
				// 			itemId: 'confined-display',
				// 			cls: 'information',
				// 			padding: 4,margin: '0 4',
				// 			width: 32,
				// 			style: 'border: 1px solid rgba(0,0,0,0.1); background-color: white; border-radius: 2px',
				// 		}]
				// 	},{
				// 		xtype: 'container',
				// 		width: undefined,
				// 		layout: DSS.utils.layout('hbox', 'left'),
				// 		items: [{
				// 			xtype: 'component',
				// 			width: 64,
				// 			cls: 'information med-text bold',
				// 			html: 'Pastured'
				// 		},{
				// 			xtype: 'component',
				// 			cls: 'information-compact med-text',
				// 			width: 180,
				// 			html: 'Period (mo / yr)'
				// 		},{
				// 			xtype: 'component',
				// 			width: 64,
				// 			cls: 'information med-text bold',
				// 			html: 'Confined'
				// 		}]
				// 	},{
				// 		xtype: 'numberfield',
				// 		dssID: 'if-grazed',
				// 		bind: '{dairy.nonLactatingGrazeTime}',
				// 		minValue: 0,
				// 		maxValue: 12,
				// 		step: 1,
				// 		labelAlign: 'left',
				// 		labelWidth: 100,
				// 		width: 250,
				// 		fieldLabel: 'Grazing Time (h/d)',
				// 		maxValue: 24
				// 	}]
				// }
			]
			}]
		};
		
		//------------------------------------------------------------------
		// Beef Container
		//------------------------------------------------------------------
		let beefContainer = {
			xtype: 'container',
			width: 300,
			height: 500,
			layout: 'fit',
			items: [{
				xtype: 'container',
				itemId: 'beef-section',
				cls: 'sub-container',
				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				hidden: true,
				items: [{
					xtype: 'component',
					cls: 'information accent-text box-underline',
					html: 'Configure the <b>size of the beef herd</b>',
					margin: '0 32',
				},{
					xtype: 'container',
					layout: DSS.utils.layout('vbox', 'start', 'left'),
					margin: 8,
					defaults: {
						xtype: 'numberfield',
						minValue: 0,
						step: 10,
						labelAlign: 'left',
						labelWidth: 100,
						width: 250,
					},
					items: [{
						fieldLabel: 'Beef Cows',
						bind: '{beef.cows}'
					},{
						fieldLabel: 'Stockers',
						bind: '{beef.stockers}'
					},{
						fieldLabel: 'Finishers',
						bind: '{beef.finishers}'
					}]
				},{//----------------------------------------------------------------
					xtype: 'component',
					cls: 'information accent-text box-underline',
					html: 'Specify the <b>average daily weight gain</b>',
					margin: '0 32',
				},{
					xtype: 'numberfield',
					margin: '0 32',
					fieldLabel: 'Daily Gain (lb/day/AU)',
					labelAlign: 'left',
					labelWidth: 100,
					width: 200,
					bind: '{beef.dailyGain}',
					minValue: 0.25,
					step: 0.25,
				},{ //-------------------------------------------------------------
					xtype: 'component',
					cls: 'information accent-text box-underline',
					html: 'How are the <b>beef</b> cattle managed?',
					margin: '0 32',
				},{
					xtype: 'container',
					itemId: 'beef-cattle',
					layout: DSS.utils.layout('vbox', 'start', 'left'),
					margin: 8,
					items: [{
						xtype: 'container',
						width: undefined,
						layout: DSS.utils.layout('hbox', 'left'),
						items: [{
							xtype: 'component',
							itemId: 'grazed-display',
							cls: 'information',
							padding: 4,margin: '0 4',
							width: 32,
							style: 'border: 1px solid rgba(0,0,0,0.1); background-color: white; border-radius: 2px',
						},{
							xtype: 'slider',
							width: 190,
							minValue: 0,
							maxValue: 12,
							bind: '{beef.confined}',
							step: 1,
							listeners: {
								change: function(slider, newValue) {
									slider.up().down('#grazed-display').update('' + (12 - newValue));
									slider.up().down('#confined-display').update('' + newValue);
									Ext.each(
										Ext.ComponentQuery.query('[dssID=if-grazed]', me.down('#beef-cattle')),
										function(item) {
											item.setDisabled(newValue == 12);
										}
									);
								}
							},
							tipText: function(thumb)  {
								const v = thumb.slider.getValue();
								return 12 - v + " / " + v;
							}
						},{
							xtype: 'component',
							itemId: 'confined-display',
							cls: 'information',
							padding: 4,margin: '0 4',
							width: 32,
							style: 'border: 1px solid rgba(0,0,0,0.1); background-color: white; border-radius: 2px',
						}]
					},{
						xtype: 'container',
						width: undefined,
						layout: DSS.utils.layout('hbox', 'center'),
						items: [{
							xtype: 'component',
							width: 64,
							cls: 'information med-text bold',
							html: 'Pastured'
						},{
							xtype: 'component',
							cls: 'information-compact med-text',
							width: 130,
							html: 'Period (mo / yr)'
						},{
							xtype: 'component',
							width: 64,
							cls: 'information med-text bold',
							html: 'Confined'
						}]
					},{
						xtype: 'numberfield',
						dssID: 'if-grazed',
						bind: '{beef.grazeTime}',
						minValue: 0,
						maxValue: 12,
						step: 1,
						labelAlign: 'left',
						labelWidth: 100,
						width: 250,
						fieldLabel: 'Grazing Time (h/d)',
						maxValue: 24
					},
					{
						xtype: 'numberfield',
						step: 1,
						allowBlank: false,
						labelAlign: 'left',
						labelWidth: 100,
						width: 250,
						fieldLabel: 'Target % Beef Pasture Residual',
						bind: '{percResidualOnPasture}',
						value: 30,
						maxValue: 50,
						minValue: 10
					},
					{
						xtype: 'combo',
						fieldLabel: 'Beef Rotational Frequency',
						labelAlign: 'left',
						labelWidth: 100,
						width: 250,
						mode: 'remote',
						triggerAction: 'all',
						store: 'rotationFreqStore',
						displayField: 'label',
						valueField: 'value',
						bind: '{rotationFreqVal}',
					},
					// {
					// 	xtype: 'combo',
					// 	dssID: 'if-grazed',
					// 	fieldLabel: 'Rotational Frequency',
					// 	labelAlign: 'left',
					// 	labelWidth: 100,
					// 	width: 250,
					// 	mode: 'remote',
					// 	triggerAction: 'all',
					// 	store: 'rotationFreqStore',
					// 	displayField: 'label',
					// 	valueField: 'enum',
					// 	bind: '{beef.rotationFreq}',
					// }
				]
				}]
			}]
		};
		//-----------------------------------------------------
		//Heifer Section
		//-----------------------------------------------------
		let heiferContainer = {
			xtype: 'container',
			layout: 'fit',
			width: 300,
			height: 350,
			items: [{
				xtype: 'container',
				itemId: 'heifer-section',
				cls: 'sub-container',
				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				hidden: true,
				items: [{
					xtype: 'component',
					cls: 'information accent-text box-underline',
					html: 'Configure the <b>size of the heifer herd</b>',
					margin: '0 32',
				},{
					xtype: 'container',
					layout: DSS.utils.layout('vbox', 'start', 'left'),
					margin: 8,
					defaults: {
						xtype: 'numberfield',
						minValue: 0,
						step: 1,
						allowBlank: false,
						labelAlign: 'left',
						labelWidth: 130,
						width: 270,
					},
					items: [
						{
							fieldLabel: 'Heifers',
							bind: '{heifers.heifers}'
						},
						{
							xtype: 'combo',
							fieldLabel: 'Breed Size',
							//labelWidth: 140,
							//width: 360,
							//labelAlign: 'left',
							mode: 'remote',
							triggerAction: 'all',
							store: 'breedSizeStore',
							displayField: 'label',
							valueField: 'value',
							bind: '{heifers.breedSize}',
						},{
							xtype: 'combo',
							fieldLabel: 'Bred or Unbred',
							//labelWidth: 140,
							//width: 360,
							labelAlign: 'left',
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
							//labelWidth: 140,
							//width: 360,
							labelAlign: 'left',
							mode: 'remote',
							triggerAction: 'all',
							store: 'weightGainStore',
							displayField: 'label',
							valueField: 'value',
							bind: '{heifers.tdwg}',
						},{
							fieldLabel: 'Days on Pasture',
							bind: '{heifers.daysOnPasture}'
						},
						{
							xtype: 'numberfield',
							step: 1,
							allowBlank: false,
							labelAlign: 'left',
							// labelWidth: 100,
							// width: 250,
							fieldLabel: 'Target % Heifer Pasture Residual',
							bind: '{percResidualOnPasture}',
							value: 30,
							maxValue: 50,
							minValue: 10
						},
						{
							xtype: 'combo',
							fieldLabel: 'Heifer Rotational Frequency',
							labelAlign: 'left',
							// labelWidth: 100,
							// width: 250,
							mode: 'remote',
							triggerAction: 'all',
							store: 'rotationFreqStore',
							displayField: 'label',
							valueField: 'value',
							bind: '{rotationFreqVal}',
						},
						// {
						// 	fieldLabel: 'Target % Pasture Residual',
						// 	bind: '{heifers.percRisidual}',
						// 	value: 30,
        				// 	maxValue: 50,
       					// 	minValue: 10
						// }
					]
				}]
			}]
		};
		
		Ext.applyIf(me, {
			items: [
				// {
				// 	xtype: 'numberfield',
				// 	step: 1,
				// 	allowBlank: false,
				// 	labelAlign: 'left',
				// 	labelWidth: 100,
				// 	width: 250,
				// 	layout: 'fit',
				// 	fieldLabel: 'Target % Pasture Residual',
				// 	bind: '{percResidualOnPasture}',
				// 	value: 30,
				// 	maxValue: 50,
				// 	minValue: 10
				// },
				// {
				// 	xtype: 'combo',
				// 	fieldLabel: 'Pasture Rotational Frequency',
				// 	labelAlign: 'left',
				// 	labelWidth: 100,
				// 	width: 250,
				// 	layout: 'fit',
				// 	mode: 'remote',
				// 	triggerAction: 'all',
				// 	store: 'rotationFreqStore',
				// 	displayField: 'label',
				// 	valueField: 'value',
				// 	bind: '{rotationFreqVal}',
				// },
				{
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
				items: [{ //--------------------------------------------------------------------------
					text: 'Heifers',
					toggleHandler: function(self, pressed) {
						let container = me.down("#heifer-section");
						if (pressed) {
							container.setHeight(0);
							container.setVisible(true)
							container.animate({
								dynamic: true,
								to: {
									height: 300
								}
							});
						} 
						else {
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
				},
					{//--------------------------------------------------------------------------
					text: 'Dairy',
					toggleHandler: function(self, pressed) {
						let container = me.down("#dairy-section");
						if (pressed) {
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
				},{ //--------------------------------------------------------------------------
					text: 'Beef',
					toggleHandler: function(self, pressed) {
						let container = me.down("#beef-section");
						if (pressed) {
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
				}]
			},{//------------------------------------------------------------------
				xtype: 'container',
				layout: DSS.utils.layout('hbox', 'center'),
//				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				defaults: {
					width: 400,
				},
				items: [
					heiferContainer,
					dairyContainer,
					beefContainer
				]	
			}]
		});
		
		me.callParent(arguments);
		
		AppEvents.registerListener("viewport_resize", function(opts) {
			me.center();
		})
	},
	
});
