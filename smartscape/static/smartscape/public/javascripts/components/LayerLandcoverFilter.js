//-----------------------------------------------------
// DSS.components.LayerLandcoverFilter
//
//-----------------------------------------------------
Ext.define('DSS.components.LayerLandcoverFilter', {
    extend: 'DSS.components.LayerBase',
    alias: 'widget.layer_landcoverFilter',
    
	title: 'Title',
	
	DSS_columns: 2,			// num checkbox columns
	DSS_serverLayer: false, // 'cdl_2012' for example
	DSS_closable: false,	// filter must always be active with the current design
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		var subs = [];
		Ext.each(me.DSS_groups, function(item, idx) {
			subs.push({
				xtype: 'checkboxgroup',
				padding: '0 0 0 16',
				flex: 1,
				vertical: true,
				itemId: 'total_options' + idx,
				columns: 1,
				listeners: {
					change: function(self, newVal, oldVal) {
						me.DSS_browser.valueChanged();
					}
				},
				items: item.DSS_subItems
			})
		});
		
		var subDef = {
			xtype: 'container',
			margin: '-6 0 0 0',
			layout: {
				type: 'hbox',
				align: 'stretch'
			},
			items: subs
		};
 
		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				padding: '0 0 0 24',
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				items: [{
					xtype: 'checkboxgroup',
					vertical: true,
					itemId: 'options',
					columns: me.DSS_columns,
					items: me.DSS_groups,
					listeners: {
						afterrender: function(self) {
							Ext.each(self.items.items, function(item) {
								item.mon(item, 'change', function(seeself, newVal, oldVal) {
									me.toggleSubs(me.down('#'+seeself.inputValue), newVal);
								})
							})
						}
					}
				},
					subDef
				]
			}]
		});
		
		me.callParent(arguments);
	},
	
	//--------------------------------------------------------------------------
	toggleSubs: function(subs, value) {
		var me = this;
		Ext.each(subs.items.items, function(item, idx) {
        	item.setValue(value)
		});
		
	},
	
	//--------------------------------------------------------------------------
	configureSelection: function() {
		
		var me = this;
		
		var selectionDef = { 
				name: me.DSS_serverLayer,
				type: 'indexed',
				matchValues: []
			};
			
		var addedElement = false;
		var me = this;
		
		Ext.each(me.DSS_groups, function(item, idx) {
	        var cont = me.down('#total_options' + idx);
	        for (var i = 0; i < cont.items.length; i++) {
	        	var item = cont.items.items[i];
	        	if (item.getValue()) {
	        		addedElement = true;
	        		var elements = item.indexValues;
	        		selectionDef.matchValues = selectionDef.matchValues.concat(elements);
	        	}
	        }
		});
        
        return selectionDef;		
	},
	
	//--------------------------------------------------------------------------
	fromQuery: function(queryStep) {
		var me = this,
			cont = me.down('#options');
		
        for (var i = 0; i < cont.items.length; i++) {
        	var item = cont.items.items[i];
        	item.setValue(false);
        	
    		for (var t = 0; t < item.indexValues.length; t++) {
    			Ext.each(queryStep.matchValues, function(val) {
        			if (item.indexValues[t] == val) {
        				item.setValue(true);
        			}
        		})
        	} 
        }
	}

});
