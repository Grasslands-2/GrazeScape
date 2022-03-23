

//------------------------------------------------------------------------------
Ext.define('DSS.state.operation.InfraDrawModeIndicator', {
//------------------------------------------------------------------------------
	extend: 'Ext.button.Segmented', // Ext.container
	alias: 'widget.state_infra_draw_mode_indicator',
	
	singleton: true,
	
//	padding: '0 6 6 6',
	floating: true,
	shadow: false,
	hidden: false,
	
	style: 'border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.5); background-color: rgba(0,0,0,0.5)',
	layout: DSS.utils.layout('hbox', 'start'),
	
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		Ext.applyIf(me, {
			defaults: {
 				xtype: 'button',
				toggleGroup: 'infra-draw-mode-indicator',
				padding: '4 0 0 0',
				height: 30,
				allowDepress: false,
				frame: false
			},
			items: [{
				text: 'Exit Infrastructure Edit Mode',
				//tooltip: 'Draw infrastructure lines',
				width: 200,
				handler: function(self) {
					DSS.MapState.removeMapInteractions()
					AppEvents.triggerEvent('hide_infra_draw_mode_indicator')
				}
			},/*{
				text: 'Split',
				tooltip: 'Split field shapes',
				width: 64,
				toggleHandler: function(self, pressed) {
					if (pressed) {
						DSS.SplitFieldShapes.addModeControl();
					}
				}
			},{
				text: 'Join',
				tooltip: 'Merge adjacent field shapes',
				width: 64,
				toggleHandler: function(self, pressed) {
					if (pressed) {
						DSS.JoinFieldShapes.addModeControl();
					}
				}
			},*/]
		});
		
		me.callParent(arguments);
		
		me.showAt(400, -38); me.setHidden(true);
		
		AppEvents.registerListener('show_infra_draw_mode_indicator', function() {
			let om = Ext.getCmp('ol_map');
			let x = om.getX() + (om.getWidth() - /*me.getWidth()*/258) * 0.5;
			me.setHidden(false);
			me.setX(x);
			me.stopAnimation().animate({
				duration: 300,
				to: {
					y: -4
				}
			})
		})
		AppEvents.registerListener('hide_infra_draw_mode_indicator', function() {
			me.stopAnimation().animate({
				duration: 300,
				to: {
					y: -38
				},
				callback: function() {
					me.setHidden(true);
				}
			})
		})
		AppEvents.registerListener('map_resize', function() {
			if (!me.isHidden()) {
				let om = Ext.getCmp('ol_map');
				me.setX(om.getX() + (om.getWidth() - me.getWidth()) * 0.5);
			}
		})
	},
	
});
