
//------------------------------------------------------------------------------
Ext.define('DSS.field_shapes.apply.FieldName', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.field_shapes_apply_field_name',
	
	cls: 'restriction-widget',
	margin: '2 0 4 0',
	padding: 2,
	
	layout: DSS.utils.layout('vbox', 'start', 'center'),
	
	DSS_sectionHeight: 28,
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				itemId: 'contents',
				layout: 'center',
				padding: '0 0 6 0',
				items: [{
					xtype: 'textfield',
					itemId: 'dss-field-name',
					fieldLabel: 'Field Name',
					allowBlank: false,
					labelWidth: 90,
					labelAlign: 'right',
					bind: { value: '{field_name.value}' },
					minValue: 1,
					maxValue: 200,
					width: 160,
					step: 5
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
});
