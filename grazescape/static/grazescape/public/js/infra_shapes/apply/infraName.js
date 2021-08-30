
//------------------------------------------------------------------------------
Ext.define('DSS.infra_shapes.apply.infraName', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.infra_shapes_apply_infra_name',
	
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
				width: '100%',
				layout: 'absolute',
				items: [{
					xtype: 'component',
					x: 0, y: -6,
					width: '100%',
					height: 28,
					cls: 'information accent-text bold',
					html: "Infra Label",
				},
					getToggle(me, 'infraName.is_active') // Helper defined in DrawAndApply.js
				]
			},{
				xtype: 'container',
				itemId: 'contents',
				layout: 'center',
				padding: '0 0 4 0',
				items: [{
					xtype: 'textfield',
					itemId: 'dss-infra-name',
					fieldLabel: "Feature Label",
					allowBlank: false,
					labelWidth: 35,
					labelAlign: 'right',
					bind: { value: '{infraName.value}' },
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
