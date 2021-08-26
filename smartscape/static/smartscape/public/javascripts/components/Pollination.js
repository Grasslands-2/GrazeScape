Ext.define('DSS.components.Pollination', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pollination',

    margin: 8,
    bodyPadding: 8,
	title: 'Pollination Services',
	layout: {
		type: 'hbox',
		align: 'stretch',
		pack: 'start'
	},

	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		var ht = 48, width = 300, labelWidth = 120;
		
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
						style: 'border: 1px solid #999; border-radius: 2px; background-color: rgba(255,0,0,0.2)'
					},{
						style: 'border: 1px solid #999; border-radius: 2px; background-color: rgba(255,190,0,0.2)'
					},{
						style: 'border: 3px solid #000; border-radius: 2px; background-color: rgb(0,240,0)'
					},{
						style: 'border: 1px solid #999; border-radius: 2px; background-color: rgba(0,178,255,0.2)'
					},{
						width: 120,
						padding: 6,
						html: 'Rating: Normal'
					}]
				},{
					xtype: 'container',
					height: 32,
					items: [{
						xtype: 'slider',
						itemId: 'pollination',
						fieldLabel: 'Impact',
						labelAlign: 'right',
						minValue: -25,
						value: 0,
						maxValue: 10,
						labelWidth: 60,
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
				itemId: 'pollination-details',
				padding: '2 32',
				html: '<b>Details</b><br><i>Adjust pollinator impacts...</i>'
			}]
		});
		
		me.callParent(arguments);
	},
	
	//---------------------------------------
	process: function(data) {
		
		var me = this;
		if (me.isHidden()) return data;

		var details = "<b>Details</b><br>";
		
		var pollPerc = me.down('#pollination').getValue() / 100.0;
		
		pollPerc += (data.pollinationModifier / 100.0);
		
		var yieldChange = data['soy'].yield * pollPerc;
		
		if (data.pollinationModifier < -0.01 || data.pollinationModifier > 0.01) {
			details += "<b>Pesticide Application Impact to Pollinators:</b> " +
			Ext.util.Format.number(data.pollinationModifier, '0.##') + '<br/>';
		}
		details += "Soybean Yield Impact: " + yieldChange.toFixed(0);
		data['soy'].yield += yieldChange;
		
		if (data['soy'].yield < 0) data['soy'].yield = 0 
		
		me.down('#pollination-details').setHtml(details);
		
		return data;
	}
	
});
