Ext.define('DSS.components.Pest', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pest',

    margin: 8,
    bodyPadding: 8,
	title: 'Pest Supression',
	layout: {
		type: 'hbox',
		align: 'stretch',
		pack: 'start'
	},

	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		var ht = 48, width = 300, labelWidth = 140;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				items: [{
					xtype: 'container',
					height: 32,
					padding: '2 32',
					layout: {
						type: 'hbox',
						align: 'stretch',
						pack: 'middle'
					},
					defaults: {
						xtype: 'container',
						width: 28, height: 24,
					},
					items: [{
						style: 'border: 3px solid #000; border-radius: 2px; background-color: rgb(255,0,0)'
					},{
						style: 'border: 1px solid #999; border-radius: 2px; background-color: rgba(255,190,0,0.2)'
					},{
						style: 'border: 1px solid #999; border-radius: 2px; background-color: rgba(0,240,0,0.2)'
					},{
						style: 'border: 1px solid #999; border-radius: 2px; background-color: rgba(0,178,255,0.2)'
					},{
						width: 120,
						padding: 6,
						html: 'Rating: Critical'
					}]
				},{
					xtype: 'container',
					height: 32,
					items: [{
						xtype: 'slider',
						itemId: 'pest',
						fieldLabel: 'Pesticide Application',
						labelAlign: 'right',
						minValue: 0,
						value: 25,
						maxValue: 25,
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
				itemId: 'pest-details',
				padding: '2 32',
				html: '<b>Details</b><br><i>Adjust pest-suppression impacts...</i>'
			}]
		});
		
		me.callParent(arguments);
	},
	
	//---------------------------------------
	process: function(data) {
		
		var me = this;
		if (me.isHidden()) return data;

		var details = "<b>Details</b><br>";
		
		var pestSlider = me.down('#pest').getValue();
		var pestPerc = (pestSlider * 2 + 50) / 100.0;
		
		var costs = (pestSlider - 12) * 29514;
		data.costs += costs;

		details += "Pesticide application costs: " + Ext.util.Format.currency(costs,undefined,0);
		
		var yieldChange = data['corn'].yield * pestPerc;
		details += "</br>Corn Yield Impact: " + (-1 * (data['corn'].yield - yieldChange)).toFixed(0);
		data['corn'].yield = yieldChange;

		yieldChange = data['soy'].yield * pestPerc;
		details += "<br/>Soybean Yield Impact: " + (-1 * (data['soy'].yield - yieldChange)).toFixed(0);
		data['soy'].yield = yieldChange;

		yieldChange = data['alfalfa'].yield * pestPerc;
		details += "<br/>Alfalfa Yield Impact: " + (-1 * (data['alfalfa'].yield - yieldChange)).toFixed(0);
		data['alfalfa'].yield = yieldChange;
		
		if (data['corn'].yield < 0) data['corn'].yield = 0 
		if (data['soy'].yield < 0) data['soy'].yield = 0 
		if (data['alfalfa'].yield < 0) data['alfalfa'].yield = 0 

		data.pollinationModifier = (-0.248 * pestSlider);
		details += "<br/>Pollinator Impact: " + Ext.util.Format.number(data.pollinationModifier, '0.##');
		
		me.down('#pest-details').setHtml(details);
		
		return data;
	}
	
});
