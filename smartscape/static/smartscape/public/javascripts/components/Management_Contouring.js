//------------------------------------------------------------------------------
Ext.create('Ext.data.Store', {
	storeId: 'dss-contouring',
	fields: ['index', 'name'],
	data: [{ 
		index: 0, name: 'None', 	
	},{ 
		index: 1, name: 'On contour', 	
	},{ 
		index: 3, name: 'Strip crop',
	}]
});	

//------------------------------------------------------------------------------
Ext.define('DSS.components.Management_Contouring', {
	extend: 'Ext.container.Container',
	padding: '0 0 8 0',
	width: '100%',
	layout: 'fit',
	
	DSS_optionType: 'contouring',
	DSS_label: 'Contouring',
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'combobox',
				itemId: 'dss-data',
				fieldLabel: me.DSS_label,
				labelAlign: 'right',
				labelWidth: 80,
				displayField: 'name',
				forceSelection: true,
				store: 'dss-contouring',
				valueField: 'index',
				value: 0, // none
			}]
		});
		
		me.callParent(arguments);
		
		this.setFromTransform(this.DSS_Transform);
	},
	
	//--------------------------------------------------------------------------
	setFromTransform: function(tr) {
		var me = this;
		
		if (tr && tr.options) {
			Ext.each(tr.options, function(o) {
				if (o.type === me.DSS_optionType) {
					var field = me.getComponent('dss-data');
					field.setValue(o.value);
				}
			})
		}
	},
	
	//--------------------------------------------------------------------------
	collectChanges: function() {
		var me = this,
			res = {type: me.DSS_optionType};
		
		var field = this.getComponent('dss-data');
		res['value'] = field.getValue()
		
		var store = Ext.data.StoreManager.lookup('dss-contouring');
		var rec = store.findRecord('index', res.value);
		
		res['text'] = '<li>' + me.DSS_label + ': ' + rec.get('name') + '</li>';
		
		return res;
	}
	
});
