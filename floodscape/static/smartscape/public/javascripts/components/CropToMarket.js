Ext.define('DSS.components.CropToMarket', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.crop2market',

    margin: 8,
    bodyPadding: 8,
	title: 'Reserve Biomatter for Market',
	layout: {
		type: 'hbox',
		align: 'stretch',
		pack: 'start'
	},

	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		var ht = 32, width = 300, labelWidth = 120;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				items: [{
					xtype: 'container',
					height: ht,
					items: [{
						xtype: 'slider',
						itemId: 'corn',
						maxValue: 150,
						fieldLabel: 'Corn Grain',
						labelAlign: 'right',
						labelWidth: labelWidth,
						width: width,
						listeners: {
							change: function(self) {
								me.DSS_CalculatorContainer.calculateResults();
							}
						}
					}]
				},{
					xtype: 'container',
					height: ht,
					hidden: true,
					items: [{
						xtype: 'slider',
						itemId: 'stover',
						maxValue: 150,
						fieldLabel: 'Corn Stover',
						labelAlign: 'right',
						labelWidth: labelWidth,
						width: width,
						listeners: {
							change: function(self) {
								me.DSS_CalculatorContainer.calculateResults();
							}
						}
					}]
				},{
					xtype: 'container',
					height: ht,
					items: [{
						xtype: 'slider',
						itemId: 'soy',
						maxValue: 150,
						fieldLabel: 'Soybeans',
						labelAlign: 'right',
						labelWidth: labelWidth,
						width: width,
						listeners: {
							change: function(self) {
								me.DSS_CalculatorContainer.calculateResults();
							}
						}
					}]
				},{
					xtype: 'container',
					height: ht,
					hidden: true,
					items: [{
						xtype: 'slider',
						itemId: 'residue',
						maxValue: 150,
						fieldLabel: 'Soybean Residue',
						labelAlign: 'right',
						labelWidth: labelWidth,
						width: width,
						listeners: {
							change: function(self) {
								me.DSS_CalculatorContainer.calculateResults();
							}
						}
					}]
				},{
					xtype: 'container',
					height: ht,
					items: [{
						xtype: 'slider',
						itemId: 'grass',
						maxValue: 150,
						fieldLabel: 'Grass',
						labelAlign: 'right',
						labelWidth: labelWidth,
						width: width,
						listeners: {
							change: function(self) {
								me.DSS_CalculatorContainer.calculateResults();
							}
						}
					}]
				},{
					xtype: 'container',
					height: ht,
					items: [{
						xtype: 'slider',
						itemId: 'alfalfa',
						maxValue: 150,
						fieldLabel: 'Alfalfa',
						labelAlign: 'right',
						labelWidth: labelWidth,
						width: width,
						listeners: {
							change: function(self) {
								me.DSS_CalculatorContainer.calculateResults();
							}
						}
					}]
				}]
			},{ //------------------------------
				xtype: 'container',
				itemId: 'market-details',
				padding: '2 32',
				html: '<b>Details</b><br><i>Commit some resources to a market use...</i>'
			}]
		});
		
		me.callParent(arguments);
	},
	
	//---------------------------------------
	process: function(data) {
		
		var me = this;
		if (me.isHidden()) return data;
		
		var details = "<b>Details</b><br>";
		
		var corn = me.down('#corn').getValue() * 1000;
		var stover = me.down('#stover').getValue() * 1000;
		var soy = me.down('#soy').getValue() * 1000;
		var residue = me.down('#residue').getValue() * 1000;
		var grass = me.down('#grass').getValue() * 1000;
		var alfalfa = me.down('#alfalfa').getValue() * 1000;
		
		data['corn'].yield 		-= corn;
		data['stover'].yield 	-= stover;
		data['soy'].yield 		-= soy;
		data['residue'].yield 	-= residue;
		data['grass'].yield 	-= grass;
		data['alfalfa'].yield 	-= alfalfa;
		
		if (data['corn'].yield < 0) {
			corn += data['corn'].yield;
			data['corn'].yield = 0;
			details += "<br><b>Insufficient Corn (tons):</b> " + corn.toFixed(0); 
		} else if (data['corn'].yield < 1000) {
			details += "<br><b>Corn Yield Warning - Remaining:</b> " + data['corn'].yield.toFixed(0); 
		}
		
		if (data['stover'].yield < 0) {
			stover += data['stover'].yield;
			data['stover'].yield = 0;
			details += "<br><b>Insufficient Stover (tons):</b> " + stover.toFixed(0); 
		} else if (data['stover'].yield < 1000) {
			details += "<br><b>stover Yield Warning - Remaining:</b> " + data['stover'].yield.toFixed(0); 
		}
		
		if (data['soy'].yield < 0) {
			soy += data['soy'].yield;
			data['soy'].yield = 0;
			details += "<br><b>Insufficient Soy (tons):</b> " + soy.toFixed(0); 
		}
		if (data['residue'].yield < 0) {
			residue += data['residue'].yield;
			data['residue'].yield = 0;
			details += "<br><b>Insufficient residue (tons):</b> " + residue.toFixed(0); 
		}
		if (data['grass'].yield < 0) {
			grass += data['grass'].yield;
			data['grass'].yield = 0;
			details += "<br><b>Insufficient grass (tons):</b> " + grass.toFixed(0); 
		}
		if (data['alfalfa'].yield < 0) {
			alfalfa += data['alfalfa'].yield;
			data['alfalfa'].yield = 0;
			details += "<br><b>Insufficient alfalfa (tons):</b> " + alfalfa.toFixed(0); 
		}
		
		var grossIncome = data['corn'].price * corn 
			+ data['stover'].price * stover
			+ data['soy'].price * soy
			+ data['residue'].price * residue
			+ data['grass'].price * grass
			+ data['alfalfa'].price * alfalfa;

		details += "<br>Reserved Biomass market value: " + Ext.util.Format.currency(grossIncome, undefined,0);
		
		me.down('#market-details').setHtml(details);
		
		data.grossIncome += grossIncome

		return data;
	}
	
});
