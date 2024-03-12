
//------------------------------------------------------------------------------
Ext.define('DSS.app_portal.ValuesAssessment', {
//------------------------------------------------------------------------------
	extend: 'Ext.panel.Panel',
	alias: 'widget.values_assessment',

	floating: true,
	width: 380,
	height: 1,
	layout: 'fit',
	bodyPadding: '8 24',
	bodyStyle: 'background: rgb(240,240,234)',
	title: 'Set Personal Values',
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				layout: {
					type: 'vbox',
					//align: 'center',
				},
				defaults: {
					xtype: 'slider',
					width: 300,
					minValue: 0,
					maxValue: 100,
					margin: '2 32 2 0',
					labelAlign: 'right',
					labelWidth: 120,
					increment: 5,
					value: 10
				},
				items: [{
					xtype: 'component',
					width: '100%',
					margin: '0 0 4 0',
					html: 'Please adjust your preferences on the triangle below regarding how much importance you place to each of the axes shown to the right.'
				},{
					xtype: 'component',
					width: 200,
					style: 'cursor:move',
					hidden: true,
					height: 160,
					margin: '0 0 0 48',
					html: '<img id="ddd" src="assets/images/triangle_selector.png" style="width:100%; opacity: 0.9">'
				},{
					xtype: 'triangle_mixer',
					//hidden: true
				},{
					fieldLabel: 'Net Income'
				},{
					fieldLabel: 'Gross Biofuel'
				},{
					fieldLabel: 'Emissions'
				},{
					fieldLabel: 'Soil Retention'
				},{
					fieldLabel: 'Soil Carbon'
				},{
					fieldLabel: 'Bird Habitat'
				},{
					fieldLabel: 'Pest Supression'
				},{
					fieldLabel: 'Pollination Services'
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
});
