// TODO investigate possibly unused component:
//------------------------------------------------------------------------------
Ext.define('DSS.state.operation.InfraShapeMode', {
//------------------------------------------------------------------------------
	extend: 'Ext.button.Segmented', // Ext.container
	alias: 'widget.state_infra_shape_mode',
	
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
				toggleGroup: 'infra-shape-mode',
				padding: '4 0 0 0',
				height: 30,
				allowDepress: false,
				frame: false
			},
			items: [{
				text: 'Draw',
				tooltip: 'Draw infrastructure lines',
				width: 68,
				toggleHandler: function(self, pressed) {

					if (pressed) {
						DSS.MapState.removeMapInteractions();
						DSS.DrawInfraShapes.addModeControl(me);	
						DSS.MapState.deactivateFarmsMapHandlers();
					}
					else {
						DSS.mouseMoveFunction = undefined;
						DSS.mapClickFunction = undefined;
					}
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
			},*/{
				text: 'Delete',
				tooltip: 'Delete Infrastructure LInes',
				width: 78,
				toggleHandler: function(self, pressed) {
					if (pressed) {
						DSS.DeleteInfraShapes.addModeControl(me)
					}
					else {
						DSS.mouseMoveFunction = undefined;
						DSS.mapClickFunction = undefined;
					}
				}
			},{
				html: '<i class="fas fa-search"></i>',
				tooltip: 'Activate Inspector <i class="fas fa-search accent-text"></i> mode',
				width: 48,
				pressed: true,
				toggleHandler: function(self, pressed) {
					if (pressed) {
						DSS.Inspector.addModeControl()
					}
				}
			}]
		});
		
		me.callParent(arguments);
		
		me.showAt(400, -38); me.setHidden(true);
		
		AppEvents.registerListener('show_infra_line_mode', function() {
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
		AppEvents.registerListener('hide_infra_line_mode', function() {
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
