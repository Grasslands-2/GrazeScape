Ext.define('DSS.app.layerQuery_Checkbox', {
    extend: 'DSS.app.layerQuery_Base',
    alias: 'widget.layer_checkbox',

    dssColumns: 2,
    dssGroup: 'must be set and unique',
    dssCheckboxConfig: [
    	{ boxLabel: 'Option 1',indexValues: [1] },
    	// example: maps multiple server indices to this checkbox
    	{ boxLabel: 'Option 2', indexValues: [2,3], checked: true }, 
    ],
    
    dssChoicesFinder: 'dss-options',
    
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'checkboxgroup',
				padding: '2 4 2 16',
				itemId: me.dssChoicesFinder,
				hideEmptyLabel: true,
				preventMark: true,
				columns: me.dssColumns,
				vertical: true,
				defaults: {
					name: me.dssGroup
				},
				items: me.dssCheckboxConfig,
				listeners: {
					change: function(self, newVal, oldVal) {
						console.log(self, me);
						me.updateNote();
						// TODO:
						//me.DSS_browser.valueChanged();
					}
				},
				
			}]
		});
		
		me.callParent(arguments);
	},
	
	//--------------------------------------------------------------------------
	updateNote: function() {
		let me = this;
		
        let ctrl = me.down('#' + me.dssChoicesFinder),
        	counter = 0;
        Ext.each(ctrl.items.items, function(d){
        	if (d.getValue()) {
        		counter++;
        	}
        });
        let text = " active";
        
        if (counter === 1) text = " option " + text
        else text = " options " + text;
        me.setNote(counter + text);
	},
	
	//TODO: update query somehow
	

});
