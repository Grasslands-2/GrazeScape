
//------------------------------------------------------------------------------
var DSS_TransformTypes = Ext.create('Ext.data.Store', {
		
	fields: ['index', 'name', 'controls'],
	data: [{ 
		index: 1, name: 'Continuous Corn', 	
		controls: ['Fertilizer','Tillage','CoverCrops','Contouring'] 
	},{ 
		index: 2, name: 'Cash Grain (50% corn, 50% soy)',
		controls: ['Fertilizer','Tillage','CoverCrops','Contouring'] 
	},{ 
		index: 3, name: 'Dairy Rotation (33% corn, 67% alfalfa)',
		controls: ['Fertilizer','Tillage','CoverCrops','Contouring'] 
	},{ 
		index: 4, name: 'Pasture',
		controls: ['Fertilizer'] 
	},{ 
		index: 5, name: 'Hay',
		controls: ['Fertilizer'] 
	},{ 
		index: 6, name: 'Mixed Grass (C3 / C4)',
		controls: []//'Fertilizer'] 
	},{ 
		index: 7, name: 'No Change',
		controls: ['Fertilizer','Tillage','CoverCrops','Contouring'] 
	}]
});

//------------------------------------------------------------------------------
Ext.define('DSS.components.TransformPopup', {
    extend: 'Ext.window.Window',

    requires: [
    	'DSS.components.Management_Tillage',
    	'DSS.components.Management_Fertilizer',
    	'DSS.components.Management_Contouring',
    	'DSS.components.Management_CoverCrops'
    ],
    
    width: 340,
    layout: {
    	type: 'vbox',
    	align: 'stretch'
    },
    bodyPadding: 16,
	modal: true,
    resizable: false,
	constrainHeader: true, // keep the header from being dragged out of the app body...otherwise may not be able to close it!
    title: 'Transform and Management Options',
    
    //--------------------------------------------------------------------------
    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [{
				xtype: 'component',
				html: 'Rotation / Landcover to Apply',
				style: 'font-size: 16px',
				margin: '0 0 4 0'
				
			},{
				xtype: 'combobox',
				itemId: 'DSS_transformTypes',
				margin: '8 16',
				hideEmptyLabel: true,
				displayField: 'name',
				forceSelection: true,
				store: DSS_TransformTypes,
				valueField: 'index',
				value: 1, // continuous corn?
				listeners: {
					select: {
						fn: function(combo, record, eOpts) {
							me.displayCorrectManagementOptions();
						}
					}
				}
			},{
				xtype: 'component',
				html: 'Choose Management Options',
				margin: '16 0 0 0',
				style: 'font-size: 16px'
			},{
		        xtype: 'container',
		        hidden: true,
		        padding: '8 0 0 48',
		        layout: {
		        	type: 'table',
		        	columns: 2
		        },
		        defaults: {
		        	xtype: 'radio', colspan: 1,name: 'rb'
		        },
		        items: [{
		        	boxLabel: 'Conventional', inputValue: '1', margin: '0 16 0 0'
		        },{ 
		        	boxLabel: 'Eco-Friendly', inputValue: '2' 
		        },{
		        	boxLabel: 'Custom', colspan: 2, inputValue: '3', checked: true, margin: '0 0 0 72'
		        }]	
			},{
				xtype: 'container',
				itemId: 'DSS_managementContainer',
				margin: '8 16',
				height: 128,// fixed height keeps overall window size stable during crop choice changes
				layout: {
					type: 'vbox',
					align: 'stretch'
				}
			},{
				xtype: 'container',
				margin: '16 0 0 0',
				layout: {
					type: 'hbox',
					pack: 'center'
				},
				defaults: {
					xtype: 'button',
					width: 100,
					scale: 'medium',
					margin: '0 4'
				},
				items: [{
					text: 'Cancel',	
					handler: function(self) {
						me.closeWindow(false); // don't save 
					}
				},{
					text: 'Ok / Apply',						
					handler: function(self) {
						me.closeWindow(true); // save 
					}
				}]
			}]
        });

        me.callParent(arguments);
        
		var combo = this.getComponent('DSS_transformTypes');
		if (this.DSS_TransformIn && this.DSS_TransformIn.land_use) {
			combo.setValue(this.DSS_TransformIn.land_use);
		}

        this.displayCorrectManagementOptions();
    },
    
    //--------------------------------------------------------------------------
    closeWindow: function(applyChanges) {
    	
    	var me = this;
    	if (applyChanges) {
    		if (me.DSS_Transform == null) {
    			me.DSS_Transform = {};
    		}
    		var combo = me.getComponent('DSS_transformTypes');
    		me.DSS_Transform['config'] = {
    				land_use: combo.getValue() 
    		};
    		me.DSS_Transform['text'] = combo.getRawValue();
    		
    		var managementOptionsText = '<ul>';
    		var m_options = [];
    		
    		var container = me.getComponent('DSS_managementContainer');
    		
    		var len = container.items.length;
    		for (var idx = 0; idx < len; idx++) {
    			var res = container.items.items[idx].collectChanges();
    			m_options.push(res);
    			managementOptionsText += res.text;
    		}
			managementOptionsText += '</ul>';
			me.DSS_Transform['m_text'] = managementOptionsText;
			me.DSS_Transform.config['options'] = m_options
    	}
    	else {
    		me.DSS_Transform = null;
    	}
    	console.log(me.DSS_Transform);
    	me.doClose()
    },
    
    //--------------------------------------------------------------------------
    displayCorrectManagementOptions: function() {
    	  
    	var me = this;
		var combo = me.getComponent('DSS_transformTypes');
		if (!combo.getValue()) return;
		
		var record = combo.findRecord('index', combo.getValue());
		if (!record) return;
		
		var controls = record.data.controls;
		if (!controls) return;

		var container = me.getComponent('DSS_managementContainer');

		Ext.each(container.items.items, function(item) {
			item['DSS_shouldKeep'] = false;
		})
		
		for (var idx = 0; idx < controls.length; idx++) {
			var found = false,
				desiredXtype = 'DSS.components.Management_' + controls[idx]; 
			Ext.each(container.items.items, function(item) {
				if (Ext.getClass(item).getName() == desiredXtype) {
					item['DSS_shouldKeep'] = found = true;
					return false;
				}
			});
			
			if (!found) {
				container.add(
					Ext.create(desiredXtype, {
						DSS_Transform: me.DSS_TransformIn,
						DSS_shouldKeep: true
					})
				);
			}
		}
		
		var discard = [];
		Ext.each(container.items.items, function(item) {
			if (!item['DSS_shouldKeep']) discard.push(item);
		})
		Ext.each(discard, function(item){
			container.remove(item);
		})
    }

});

