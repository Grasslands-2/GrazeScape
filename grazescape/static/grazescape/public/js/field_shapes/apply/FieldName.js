Ext.define('DSS.field_shapes.apply.FieldName', {
	extend: 'Ext.Container',
	alias: 'widget.field_shapes_apply_field_name',
	cls: 'restriction-widget',
	margin: '2 0 4 0',
	padding: 2,
	layout: DSS.utils.layout('vbox', 'start', 'center'),
	DSS_sectionHeight: 28,
	items: [
		{
			xtype: 'component',
			x: 0, 
			y: -6,
			width: '100%',
			height: 28,
			cls: 'information accent-text bold',
			html: "Field Name",
		},
		{
			xtype: 'textfield',
			itemId: 'dss-field-name',
			allowBlank: false,
			bind: { value: '{field_name.value}' },
			width: 360,
			padding: 15,
		}
	]
});
