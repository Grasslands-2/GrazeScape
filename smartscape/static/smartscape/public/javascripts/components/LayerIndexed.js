//-----------------------------------------------------
// DSS.components.LayerIndexed
//
//-----------------------------------------------------
Ext.define('DSS.components.LayerIndexed', {
    extend: 'DSS.components.LayerBase',
    alias: 'widget.layer_indexed',
    
	title: 'Title',
	
	DSS_columns: 4,			// num checkbox columns
	DSS_serverLayer: false, // 'cdl_2012' for example
	DSS_indexConfig: [{ 	// straight-up checkbox item configs, example
		boxLabel: 'Corn', 		name: "lt", indexValues: [1], checked: true
	},{
		boxLabel: 'Urban', 		name: "lt", indexValues: [10,11]
	}],
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				padding: '0 0 0 24',
				layout: 'fit',
				items: [{
					xtype: 'checkboxgroup',
					vertical: true,
					itemId: 'options',
					columns: me.DSS_columns,
					listeners: {
						change: function(self, newVal, oldVal) {
							me.DSS_browser.valueChanged();
						}
					},
					items: me.DSS_indexConfig
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
	//--------------------------------------------------------------------------
	configureSelection: function() {
		
		var me = this;
		if (me.isHidden()) return false;
		
		var selectionDef = { 
				name: me.DSS_serverLayer,
				type: 'indexed',
				matchValues: []
			};
			
		var addedElement = false;
        var cont = me.down('#options');
        for (var i = 0; i < cont.items.length; i++) {
        	var item = cont.items.items[i];
        	if (item.getValue()) {
        		addedElement = true;
        		var elements = item.indexValues;
        		selectionDef.matchValues = selectionDef.matchValues.concat(elements);
        	}
        }
        
        if (!addedElement) return false;
        console.log(selectionDef)
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
