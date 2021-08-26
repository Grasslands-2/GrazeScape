//------------------------------------------------------------------------------
Ext.define('DSS.components.OpacitySlider', {
//------------------------------------------------------------------------------
	extend: 'Ext.menu.Menu',
	alias: 'widget.opacity_slider',
	
	OL_Layer: null, // set to the open layers layer to control... can be an array
	
	// MIN value of 0 is not properly supported. Handling for flowlines will need some
	//	work if this is changed due to them being handled as an array where both
	//	opacities are adjusted at the same time...but one layer is normally toggled as not visible.
	//	When sliding up from zero, there'd have to be code to determine which layer should
	//	be made visible...since sliding to zero would've made both layers invisible.
	minValue: 20, 
	maxValue: 100,
	value: 80,
	increment: 10,
	plain: true,
	bodyPadding: 4,
	
	//--------------------------------------------------------------------------
	initComponent: function() {
	
		var me = this;
		me.value = me.OL_Layer.opacity * 100.0;
		
		if (!me.items) me.items = [];
		me.items.push({
			xtype: 'slider',
			itemId: 'slider',
			hideEmptyLabel: true,
			margin: 0,
			width: 140,
			minValue: me.minValue,
			maxValue: me.maxValue,
			value: me.value,
			increment: me.increment,
			listeners: {
				change: function(slider, newVal) {
					me.value = newVal;
					if (newVal == 0) {
						me.OL_Layer.setVisibility(false);
					}
					else {
						if (me.minValue == 0) {
							me.OL_Layer.setVisibility(true);
						}
						me.OL_Layer.setOpacity(newVal / 100.0);
					}
				}
			}
		});

		me.listeners = Ext.applyIf(me.listeners || {}, {
			show: function(me) {
				me.down('#slider').setValue(me.OL_Layer.getOpacity() * 100.0, false);
			}
		});

		me.callParent(arguments);
	},
	
});
	
function getLegendChip(color, text, listeners) {
	
	return {
		xtype: 'container',
		margin: '0 8',
		width: 140,
		layout: 'hbox',
	//	style: 'background-color: #fff; border-radius: 5px',
		items: [{
			xtype: 'container',
			style: 'background-color: ' + color + ';border-radius: 3px;' 
				+ (listeners ? 'cursor: pointer' : ''), 
			height: 16, width: 16,
			margin: '3 3',
			listeners: listeners
		},{
			xtype: 'container',
			html: text,
			margin: '2 6'
		}]
	}	
};

//-----------------------------------------------------
// DSS.components.SelectionStatistics
//
//-----------------------------------------------------
Ext.define('DSS.components.SelectionStatistics', {
    extend: 'Ext.container.Container',
    alias: 'widget.selectionStatistics',
 
    padding: 6,
    width: 380, height: 100, 
	style: 'background: rgba(48,64,96,0.8); border: 1px solid #256;border-radius: 16px; box-shadow: 0 10px 10px rgba(0,0,0,0.4)' ,
	layout: 'fit',
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items:[{
				xtype: 'container',
				style: 'background: #f5f5f5; border-radius: 12px; border: 1px solid #ccc',
				layout: {
					type: 'table',
					columns: 2
				},
				items: [
					getLegendChip('#5a79ee','Matched Land', {
						element: 'el',
			            click: function(self) {
							Ext.create('DSS.components.OpacitySlider', {
								OL_Layer: selectionLayer
							}).showBy(self.target, 'bl-tr?', [-4,4])
			            }
					})
				,{
					xtype: 'container',
					layout: 'vbox',
					itemId: 'dss-conflict-statistics',
					items: [
						getLegendChip('#d73171','Match Conflicts'),
						getLegendChip('#40495a','Matched in Other')
					]
				},{
					xtype: 'container',
					layout: 'hbox',
					width: 180,
					padding: '0 4',
					items: [{
						xtype: 'container',
						html: '<b>Matched:<br/>% Area:</b>',
						width: 60,
						style: 'text-align: right'
					},{
						xtype: 'container',
						id: 'yes-dss-selected-stats',
						width: 112,
						padding: '0 0 0 4',
						html: '--<br/>--'
					}]
				},{
					xtype: 'container',
					layout: 'hbox',
					width: 180,
					padding: '0 4',
					items: [{
						xtype: 'container',
						html: '<b>Conflicting:<br/>% Area:</b>',
						width: 70,
						style: 'text-align: right'
					},{
						xtype: 'container',
						id: 'yes-dss-selected-stats2',
						width: 115,
						padding: '0 0 0 4',
						html: '--<br/>--'
					}]
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
});
