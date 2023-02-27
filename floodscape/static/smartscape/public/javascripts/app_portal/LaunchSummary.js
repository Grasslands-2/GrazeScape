
//------------------------------------------------------------------------------
Ext.define('DSS.app_portal.LaunchSummary', {
//------------------------------------------------------------------------------
	extend: 'Ext.panel.Panel',
	alias: 'widget.launch_summary',
	
	//height: 140,
	title: 'Start SmartScape Confirmation',
	
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
				html: 'SmartScape will now launch with your Area of Interest and Value choices. ' + 
					'<br/></br>Note that exploring scenarios in a different region will require coming back to this page.'
			},{				
				xtype: 'container',
				flex: 1,
				padding: '16 4',
				layout: 'center',
				items: [{
					xtype: 'button',
					margin: '6 4 10 0',
					scale: 'medium',
					cls: 'ext-landing-button',
					width: 190,
					text: 'Start SmartScape',
					handler: function() {
						location.href ="./app"
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
		}
	}

	
});
