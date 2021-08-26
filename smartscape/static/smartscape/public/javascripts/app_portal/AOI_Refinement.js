// AOI Refinement - Area of Interest Refinement

//------------------------------------------------------------------------------
Ext.define('DSS.app_portal.AOI_Refinement', {
//------------------------------------------------------------------------------
	extend: 'Ext.panel.Panel',
	alias: 'widget.aoi_refinement',
	
	title: 'Region Refinement Tools',
	
	layout: {
		type: 'vbox',
		pack: 'start',
		align: 'stretch'
	},
	bodyPadding: 8,
	
	width: 380,
	height: 195,

	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				html: 'The Area of Interest can optionally be further restricted by choosing counties or watersheds that overlap this Region.' +
					'<br/><br/>Note that SmartScape will restrict landscape changes and computed outcomes to the sub-areas you select.'
			},{				
				xtype: 'container',
				flex: 1,
				padding: '16 8 9 4',
				layout: {
					type: 'hbox',
					pack: 'center',
				},
				defaults: {
					xtype: 'button',
					cls: 'ext-landing-button',
					margin: '0 4 10 0',
					scale: 'medium',
					toggleGroup: 'rbc',
				},
				items: [{
					width: 150,
					text: 'Restrict by County',
					toggleHandler: function(btn, state) {
						btn.addCls('ext-landing-button'); // eh?
						if (state) {
							btn.setText('Done Choosing')
							DSS_PortalMap.setMode('county');
						} else {
							btn.setText('Restrict by County')
							DSS_PortalMap.setMode('refine');
						}
					}
				},{
					width: 170,
					text: 'Restrict by Watershed',
					toggleHandler: function(btn, state) {
						btn.addCls('ext-landing-button'); // eh?
						if (state) {
							btn.setText('Done Choosing')
							DSS_PortalMap.setMode('watershed');
						} else {
							btn.setText('Restrict by Watershed')
							DSS_PortalMap.setMode('refine');
						}
					}
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
	//----------------------------------------------------------
	updateState: function(selected) {
		var me = this;
		if (selected) {
		}
		else {
			Ext.each(Ext.ComponentQuery.query('button', me), function(item) {
				if (item['pressed']) {
					item.toggle(false);
				}
			});
		}
	}

	
});
