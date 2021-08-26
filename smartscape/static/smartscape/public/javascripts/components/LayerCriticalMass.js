
//--------------------------------------------------------------------------
Ext.define('DSS.components.LayerCriticalMass', {
    extend: 'DSS.components.LayerBase',
    alias: 'widget.layer_critical_mass',

    title: 'Critical Mass Re-Selector',
    
    //--------------------------------------------------------------------------
    initComponent: function() {
    	
        var me = this;

        Ext.applyIf(me, {
            items: [{
				xtype: 'container',
				padding: '8 0 0 20',
				layout: 'vbox',
				items: [{
					xtype: 'container',
					layout: 'hbox',
					items: [{
						xtype: 'combobox',
						itemId: 'DSS_CellScales',
						width: 200,
						fieldLabel: 'Approx Scale',
						labelAlign: 'right',
						labelWidth: 90,
						labelPad: 5,
						displayField: 'name',
						forceSelection: true,
						store: DSS_GridSizes,
						valueField: 'size',
						value: 21, // 100 acres?
						listeners: {
							change: function(self, newVal, oldVal) {
								me.DSS_browser.valueChanged();
							}
						},
					}]
				},{
					xtype: 'container',
					layout: 'hbox',
					padding: '8 0',
					items: [{
						xtype: 'numberfield',
						itemId: 'DSS_FractionOfLand',
						width: 160,
						labelAlign: 'right',
						labelWidth: 90,
						labelPad: 5,
						fieldLabel: 'C.M.',
						decimalPrecision: 0,
						step: 5,
						value: 50,
						minValue: 1,
						maxValue: 99,
						enableKeyEvents: true,
						listeners: {
							change: function(self, newVal, oldVal) {
								me.DSS_browser.valueChanged();
							}
						},
					},{
						xtype: 'label',
						width: 50,
						margin: '3 0 0 3',
						text: '%'
					}]
				}]
            }]
        });

        me.callParent(arguments);
    },
	
	//--------------------------------------------------------------------------
	configureSelection: function() {
		
		var me = this;
		if (me.isHidden()) return false;
		
    	var scale = 21;
		var combo = me.down('#DSS_CellScales');
		if (combo.getValue()) {
			scale = combo.getValue();
		}
		var selectionDef = { 
			name: 'criticalMass',
			fraction: me.down('#DSS_FractionOfLand').getValue(),
			gridCellSize: scale,
		};
			
        return selectionDef;		
	},
	
});

