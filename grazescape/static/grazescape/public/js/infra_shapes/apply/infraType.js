
//------------------------------------------------------------------------------
Ext.define('DSS.infra_shapes.apply.infraType', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.infra_shapes_apply_infra_type',
	
	cls: 'restriction-widget',
	margin: '2 0 4 0',
	padding: 2,
	
	layout: DSS.utils.layout('vbox', 'start', 'center'),
	
	DSS_sectionHeight: 75,
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		let rbName = "infraType";
		
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
					html: "Infrastructure Type",
				},
					getToggle(me, 'infraType.is_active') // Helper defined in DrawAndApply.js
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
						infraTypeValue: {
							bind: '{infraType.value}', // inherited from parent
							get: function(val) {
								let obj = {};
								obj[rbName] = val;
								return obj;
							},
							set: function(val) {
								this.set('infraType.value', val[rbName]);
							}
						}
					}
				},
				bind: '{infraTypeValue}', // formula from viewModel above
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
					boxLabel: 'Fencing', inputValue: 'fl',
				},{ 
					boxLabel: 'Water Line', inputValue: 'wl',
				},{ 
					boxLabel: 'Lane Lines', inputValue: 'll',
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
});
