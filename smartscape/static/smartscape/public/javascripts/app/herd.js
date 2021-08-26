
//------------------------------------------------------------------------------
Ext.define('DSS.app.herd', {
//------------------------------------------------------------------------------
    extend: 'Ext.Container',
	alias: 'widget.herd',
	
	layout: {
		type: 'vbox',
		pack: 'start',
		align: 'left'
	},
	padding: 12,
	style: 'background: #fff; border: 1px solid #888; border-radius: 12px',
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		function setListener(changeHandler) {
			return {
				focusenter: function(self) {
					self.setHideTrigger(false)
				},
				focusleave: function(self) {
					self.setHideTrigger(true)
				}
			}
		};
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'numberfield',
				fieldLabel: 'Total Cows',
				labelAlign: 'right',
				labelWidth: 80,
				hideTrigger: true,
				width: 150,
				value: 4000,
				step: 50,
				minValue: 0,
				maxValue: 100000,
				margin: '0 0 8 0',
				listeners: setListener()
			},{
				xtype: 'numberfield',
				fieldLabel: 'Dairy',
				labelAlign: 'right',
				labelWidth: 80,
				hideTrigger: true,
				width: 150,
				value: 3000,
				step: 50,
				minValue: 0,
				maxValue: 100000,
				margin: '0 0 8 16',
				listeners: setListener()
			},{
				xtype: 'numberfield',
				fieldLabel: 'Grass-Fed',
				labelAlign: 'right',
				labelWidth: 80,
				hideTrigger: true,
				width: 150,
				value: 1000,
				step: 50,
				minValue: 0,
				maxValue: 100000,
				margin: '0 0 8 32',
				listeners: setListener()
			},{
				xtype: 'numberfield',
				fieldLabel: 'Conventional',
				labelAlign: 'right',
				labelWidth: 80,
				hideTrigger: true,
				width: 150,
				value: 2000,
				step: 50,
				minValue: 0,
				maxValue: 100000,
				margin: '0 0 8 32',
				listeners: setListener()
			},{
				xtype: 'numberfield',
				fieldLabel: 'Beef',
				labelAlign: 'right',
				labelWidth: 80,
				hideTrigger: true,
				width: 150,
				value: 1000,
				step: 50,
				minValue: 0,
				maxValue: 100000,
				margin: '0 0 8 16',
				listeners: setListener()
			},{
				xtype: 'numberfield',
				fieldLabel: 'Grass-Fed',
				labelAlign: 'right',
				labelWidth: 80,
				hideTrigger: true,
				width: 150,
				value: 300,
				step: 50,
				minValue: 0,
				maxValue: 100000,
				margin: '0 0 8 32',
				listeners: setListener()
			},{
				xtype: 'numberfield',
				fieldLabel: 'Conventional',
				labelAlign: 'right',
				labelWidth: 80,
				hideTrigger: true,
				width: 150,
				value: 700,
				step: 50,
				minValue: 0,
				maxValue: 100000,
				margin: '0 0 8 32',
				listeners: setListener()
			}]
		});
		
		me.callParent(arguments);
	},
	
});



