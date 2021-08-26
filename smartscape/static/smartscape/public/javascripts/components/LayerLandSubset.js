

// TODO: determine sensible units of area
// NOTE: none of them will likely be exact matches
//------------------------------------------------------------------------------
var DSS_GridSizes = Ext.create('Ext.data.Store', {
		
	fields: ['size', 'name'],
	data: [
		{ 'size': 5, 'name': '2 Hectares'}, // the real value should be 4.7
		{ 'size': 7, 'name': '10 Acres'}, // the real value should be 6.7 x 6.7 cells at 30 m (rounded up)
		{ 'size': 13, 'name': '40 Acres'}, // the real value should be 13.4
		{ 'size': 21, 'name': '100 Acres'},// real value is 21.2 x 21.2
		{ 'size': 33, 'name': '1 sq km'},// real value is 33.3333
		{ 'size': 38, 'name': '0.5 sq Miles'},// real value is 37.9
		{ 'size': 54, 'name': '1 sq Mile'},// real value is 53.7
	]
});

//--------------------------------------------------------------------------
Ext.define('DSS.components.LayerLandSubset', {
    extend: 'DSS.components.LayerBase',
    alias: 'widget.layer_subset',

    DSS_seed: 12345,
    
    title: 'Subset of Selection',
    
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
						fieldLabel: 'Proportion',
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
					},{
						xtype: 'button', 
						text: 'Reshuffle',
						width: 80,
						tooltip: {
							text: 'Select a different fraction of the land'
						},
						handler: function(button, evt) {
							var res = Math.random();
							res *= 32767.0;
							res = Math.floor(res);
							
							me.DSS_Seed = res;
							me.DSS_browser.valueChanged();
						}
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
			name: 'proceduralFraction',
			fraction: me.down('#DSS_FractionOfLand').getValue(),
			gridCellSize: scale,
			seed: this.DSS_Seed
		};
			
        return selectionDef;		
	},
	
});

