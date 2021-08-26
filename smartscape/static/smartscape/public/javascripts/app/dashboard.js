
//------------------------------------------------------------------------------
Ext.define('DSS.app.dashboard', {
//------------------------------------------------------------------------------
    extend: 'Ext.Container',
	alias: 'widget.dashboard',
	
	layout: {
		type: 'vbox',
		pack: 'start',
		align: 'stretch'
	},
	width: 380, 
//	padding: 8,
//	style: 'background: rgba(32,90,150,0.5); border-right: 1px solid rgba(16,32,100,0.5)',
	style: 'background: rgba(94,98,90,0.5); border-right: 1px solid rgba(42,45,40,0.5)',
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		let style = 'background: #f5f6f4; border: 1px solid #777; border-top-color: #888; border-bottom-color: #666; border-radius: 8px; box-shadow: 0 4px 4px rgba(0,0,0,0.3)';
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				margin: '8 24',//'8 8 0 8',
				height: 70, // a fixed height improves page layout responsiveness unfortunately
				html: '<a href="/"><img id="ddd" src="assets/images/dss-logo-white.png" style="width:100%"></a>',
			},{
				xtype: 'component',
				html: 'Scenario Builder',
				padding: '0 8 8 8',
				style: 'color: #4af; text-shadow: 0 0 1px #000,0 0 1px #000, 0 5px 8px rgba(0,0,0,0.75);font-size: 1.2rem;text-align: center; font-weight: bold'
			},{
				xtype: 'container',
				style: style,
			//	height: 120,
				margin: '0 12 12 12',
				layout: {
					type: 'vbox',
					align: 'middle',
					pack: 'start'
				},
				items: [{
					xtype: 'component',
					margin: '0 8',//'8 8 0 8',
					height: 48,width: 48, // a fixed height improves page layout responsiveness unfortunately
					style: 'opacity: 0.5; background: url("assets/images/cow_icon.png"); background-size: contain',
				},{
					xtype: 'component',
					html: 'Livestock',
					padding: '0 8 8 8',
					style: 'color: #444; font-size: 1.1rem; font-weight: bold'
				},{
					xtype: 'container',
					hidden: false,
					layout: {
						type: 'hbox',
					},
					items: [{
						xtype: 'component',
						html: '<b>Total Livestock:</b></br>18,950',
						style: 'color: #666; font-size: 1rem;text-align: center',
						padding: '16 16 16 0'
					},{
						xtype: 'component',
						html: '<b>Dairy Cows:</b></br>22,410</br><b>Beef Cows:</b></br>3,460',
						style: 'color: #666; font-size: 0.8rem;text-align: center',
						padding: '4 16'
					}]
				},{
					xtype: 'button',
					scale: 'medium',
					width: 120,height: 31,
					text: 'Reallocate',
					margin: 8
				}]
			},{//---------------------------------------------------------------
				xtype: 'container',
				style: style,
			//	height: 120,
				margin: '0 12 12 12',
				layout: {
					type: 'vbox',
					align: 'middle',
					pack: 'start'
				},
				items: [{
					xtype: 'component',
					margin: '0 8',//'8 8 0 8',
					height: 48,width: 48, // a fixed height improves page layout responsiveness unfortunately
					style: 'opacity: 0.5; background: url("assets/images/corn_icon.png"); background-size: contain',
				},{
					xtype: 'component',
					html: 'Landcover',
					padding: '0 8 8 8',
					style: 'color: #444; font-size: 1.1rem; font-weight: bold'
				},{
					xtype: 'button',
					scale: 'medium',
					width: 120,height: 31,
					text: 'Alter',
					margin: 8,
					handler: function(self) {
						Ext.suspendLayouts();
						me.down('#setup').setVisible(true);
						self.setHidden(true);
						Ext.resumeLayouts(true);
					}
				},{
					xtype: 'component',
					hidden: true,
					itemId: 'after-label',
					html: 'Landscape Alteration Steps',
					padding: '4 0 0 0',
					style: 'color: #666; font-size: 0.8rem;'
				},{
					xtype: 'container',
					itemId: 'setup',
					style: 'border-radius: 8px; border: 1px solid #aaa; background: rgba(0,0,0,0.05)',
					padding: '0 16',
					margin: '0 0 8 0',
					hidden: true,
					layout: {
						type: 'vbox',
						align: 'middle',
						pack: 'start'
					},
					items: [{
						xtype: 'component',
						itemId: 'finder-label',
						html: 'Find Land to Transform',
						padding: '4 0 0 0',
						style: 'color: #666; font-size: 0.8rem;'
					},{
						xtype: 'layer_checkbox',
						itemId: 'widget-1',
						margin: '4 2 0 2',
						title: 'WiscLand 2.0',
						dssGroup: 'wl2', // just has to be unique
						dssServerLayer: 'todo',
						dssTabIndex: 80,
						dssCheckboxConfig: [
							{boxLabel: 'Continous Corn', indexValues: [1]},
							{boxLabel: 'Cash Grain', indexValues: [14]},
							{boxLabel: 'Dairy Rotation', indexValues: [15]},
							{boxLabel: 'Hay', 		indexValues: [2]},
							{boxLabel: 'Pasture', 	indexValues: [3]},
							{boxLabel: 'Warm Grass', indexValues: [5]},
							{boxLabel: 'Cool Grass', indexValues: [4]},
							{boxLabel: 'Woodland',	indexValues: [6,7,8]},
							{boxLabel: 'Wetlands',	indexValues: [12345]}, // FIXME
							{boxLabel: 'Developed', indexValues: [12,13], checked: true},
						]
					},{
						xtype: 'layer_range',
						itemId: 'widget-2',
						margin: '4 2 0 2',
						title: 'Slope',
						dssServerLayer: 'slope',
						dssTabIndex: 90,
						dssGreaterValue: 5
					},{
						xtype: 'button',
						itemId: 'hide-button',
						margin: '2 2 8 2',
						width: 128,
						height: 31,
						scale: 'medium',
						text: 'More Criteria  +'
					},{
						xtype: 'component',
						margin: '4',
						itemId: 'special-label',
						html: 'Transform Matched Land',
						style: 'color: #666; font-size: 0.8rem;'
					},{
						xtype: 'button',
						margin: '0 2 8 2',
						width: 64,
						height: 31,
						scale: 'medium',
						text: 'To',
						handler: function(self) {
							Ext.suspendLayouts();
							let parent = self.up();
							parent.add({
								xtype: 'container',
								layout: {
									type: 'hbox',
									align: 'stretch'
								},
								width: 300,
								margin: '8 0 4 2',
								items: [{
									xtype: 'component',
									margin: '4 0',
									html: 'Transform to'
								},{
									xtype: 'component',
									style: 'background: #fff; border-radius: 8px; border: 1px solid #aaa; cursor: pointer',
									margin: '0 4',
									flex: 1,
									padding: '4 8',
									html: 'Continuous Corn'
								}]
							})
							self.setHidden(true);
							parent.down('#hide-button').setHidden(true)
							let w = parent.down("#widget-1");
							if (w) w.setCompact(true);
							w = parent.down("#widget-2");
							if (w) w.setCompact(true);
							parent.down('#special-label').setHidden(true);
							parent.down('#finder-label').setHidden(true);
							me.down('#after-label').setVisible(true);
							me.down('#next-setup').setVisible(true);
							
							Ext.resumeLayouts(true);
						}
					}]
				},{
					xtype: 'container',
					itemId: 'next-setup',
					style: 'border-radius: 8px; border: 1px solid #aaa; background: rgba(0,0,0,0.05)',
					padding: '0 16',
					margin: '0 0 8 0',
					hidden: true,
					layout: {
						type: 'vbox',
						align: 'middle',
						pack: 'start'
					},
					items: [{
						xtype: 'component',
						itemId: 'finder-label',
						html: 'Find More Land to Transform',
						padding: '4 0 0 0',
						style: 'color: #666; font-size: 0.8rem;'
					},{
						xtype: 'layer_checkbox',
						itemId: 'widget-1',
						margin: '4 2 0 2',
						title: 'WiscLand 2.0',
						dssGroup: 'wl2', // just has to be unique
						dssServerLayer: 'todo',
						dssTabIndex: 80,
						dssCheckboxConfig: [
							{boxLabel: 'Continous Corn', indexValues: [1]},
							{boxLabel: 'Cash Grain', indexValues: [14]},
							{boxLabel: 'Dairy Rotation', indexValues: [15]},
							{boxLabel: 'Hay', 		indexValues: [2]},
							{boxLabel: 'Pasture', 	indexValues: [3]},
							{boxLabel: 'Warm Grass', indexValues: [5]},
							{boxLabel: 'Cool Grass', indexValues: [4]},
							{boxLabel: 'Woodland',	indexValues: [6,7,8]},
							{boxLabel: 'Wetlands',	indexValues: [12345]}, // FIXME
							{boxLabel: 'Developed', indexValues: [12,13], checked: true},
						]
					},{
						xtype: 'layer_range',
						itemId: 'widget-2',
						margin: '4 2 0 2',
						title: 'Slope',
						dssServerLayer: 'slope',
						dssTabIndex: 90,
						dssGreaterValue: 5
					},{
						xtype: 'button',
						itemId: 'hide-button',
						margin: '2 2 8 2',
						width: 128,
						height: 31,
						scale: 'medium',
						text: 'More Criteria  +'
					},{
						xtype: 'component',
						margin: '4',
						itemId: 'special-label',
						html: 'Transform Matched Land',
						style: 'color: #666; font-size: 0.8rem;'
					},{
						xtype: 'button',
						margin: '0 2 8 2',
						width: 64,
						height: 31,
						scale: 'medium',
						text: 'To',
						handler: function(self) {
							Ext.suspendLayouts();
							let parent = self.up();
							parent.add({
								xtype: 'container',
								layout: {
									type: 'hbox',
									align: 'stretch'
								},
								width: 300,
								margin: '8 0 4 2',
								items: [{
									xtype: 'component',
									margin: '4 0',
									html: 'Transform to'
								},{
									xtype: 'component',
									style: 'background: #fff; border-radius: 8px; border: 1px solid #aaa; cursor: pointer',
									margin: '0 4',
									flex: 1,
									padding: '4 8',
									html: 'Continuous Corn'
								}]
							})
							self.setHidden(true);
							parent.down('#hide-button').setHidden(true)
							let w = parent.down("#widget-1");
							if (w) w.setCompact(true);
							w = parent.down("#widget-2");
							if (w) w.setCompact(true);
							parent.down('#special-label').setHidden(true);
							parent.down('#finder-label').setHidden(true);
							me.down('#after-label').setVisible(true);
							Ext.resumeLayouts(true);
						}
					}]
				}]
			},{//-----------------------------------------------
				xtype: 'container',
				style: style,
			//	height: 120,
				margin: '0 12 12 12',
				layout: {
					type: 'vbox',
					align: 'middle',
					pack: 'start'
				},
				items: [{
					xtype: 'component',
					margin: '0 8',//'8 8 0 8',
					height: 48,width: 48, // a fixed height improves page layout responsiveness unfortunately
					style: 'opacity: 0.5; background: url("assets/images/cash_icon.png"); background-size: contain',
				},{
					xtype: 'component',
					html: 'Assumptions',
					padding: '0 8 8 8',
					style: 'color: #444; font-size: 1.1rem; font-weight: bold'
				},{
					xtype: 'button',
					scale: 'medium',
					width: 120,height: 31,
					text: 'Refine',
					margin: 8
				}]
			},{
				xtype: 'component',
				flex: 1
			},{
				xtype: 'container',
				height: 56,
				style: 'background: rgba(0,0,0,0.25)',
				padding: 8,
				layout: {
					type: 'hbox',
					align: 'stretch',
					pack: 'start'
				},
				defaults: {
					xtype: 'button', scale: 'medium'
				},
				items: [{
					text: 'New',
					width: 60,
					tabIndex: 100
				},{
					text: 'Load',
					width: 60,
					margin: '0 8',
					tabIndex: 101,
				},{
					text: 'Simulate >>',
					flex: 1,
					tabIndex: 102,
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
});



