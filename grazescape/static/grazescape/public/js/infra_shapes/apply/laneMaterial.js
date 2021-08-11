
DSS.utils.addStyle('.hover {cursor: pointer}');

//------------------------------------------------------------------------------
Ext.define('DSS.infra_shapes.apply.laneMaterial', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.infra_shapes_apply_lane_material',
	
	cls: 'restriction-widget',
	margin: '2 0 4 0',
	padding: 2,
	
	layout: DSS.utils.layout('vbox', 'start', 'center'),
	
	DSS_sectionHeight: 150,

	requires: [
		'DSS.infra_shapes.apply.infraType',
	],
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;
		
		let rbName = "laneMaterial";
		
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
					html: "Set Lane Material",
				},
					getToggle(me, 'laneMaterial.is_active') // Helper defined in DrawAndApply.js
				]
			},{
				xtype: 'radiogroup',
				itemId: 'contents',
				style: 'padding: 0px; margin: 0px', // fixme: eh...
				hideEmptyLabel: true,
				columns: 1, 
				vertical: true,
				viewModel: {
					formulas: {
						laneMaterialValue: {
							bind: '{laneMaterial.value}', // inherited from parent
							get: function(val) {
								let obj = {};
								obj[rbName] = val;
								return obj;
							},
							set: function(val) {
								this.set('laneMaterial.value', val[rbName]);
							}
						}
					}
				},
				bind: '{laneMaterialValue}', // formula from viewModel above
				defaults: {
					name: rbName,
					listeners: {
						afterrender: function(self) {
							if ( self.boxLabelEl) {
								self.boxLabelEl.setStyle('cursor', 'pointer')
							}
						}
					}
				//	boxLabelCls: 'hover'
				},
				items: [{
					boxLabel: 'Raised Earth Walkway', inputValue: 're',
				},{ 
					boxLabel: 'Gravel Walkway', inputValue: 'gw',
				},{ 
					boxLabel: 'Gravel over Geotextile', inputValue: 'gg',
				},{ 
					boxLabel: 'Gravel Over Graded Rock', inputValue: 'ggr',
				},{ 
					boxLabel: 'Gravel Over Graded Rock <br>and Geotextile', inputValue: 'ggrg',
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
});
