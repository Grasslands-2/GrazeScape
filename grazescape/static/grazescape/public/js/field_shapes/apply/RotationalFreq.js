
DSS.utils.addStyle('.hover {cursor: pointer}');

//------------------------------------------------------------------------------
Ext.define('DSS.field_shapes.apply.RotationalFreq', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.field_shapes_apply_rot_freq',
	
	cls: 'restriction-widget',
	margin: '2 0 4 0',
	padding: 2,
	
	layout: DSS.utils.layout('vbox', 'start', 'center'),
	
	DSS_sectionHeight: 150,
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;
		
		let rbName = "crop";
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				width: '100%',
				layout: 'absolute',
				items: [{
					xtype: 'component',
					x: 0, y: -6,
					width: '100%',
					height: 7,
					cls: 'information accent-text bold',
					//html: "Set Rotatonal Frequency",
				},
					//getToggle(me, 'crop.is_active') // Helper defined in DrawAndApply.js
				]
			},{
				xtype: 'radiogroup',
				//itemId: 'contents',
				id: 'PTRotFreq',
				disabled: true,
				padding: 15,
				columns: 1, 
				style: 'padding: 0px; margin: 0px', // fixme: eh...
				hideEmptyLabel: false,
				vertical: true,
				allowBlank: false,
				html: "Set Rotatonal Frequency",
				viewModel: {
					formulas: {
						rotfreqValue: {
							bind: '{rotfreq.value}', // inherited from parent
							get: function(val) {
								let obj = {};
								obj[rbName] = val;
								return obj;
							},
							set: function(val) {
								this.set('rotfreq.value', val[rbName]);
							}
						}
					}
				},
				bind: '{rotfreqValue}', // formula from viewModel above
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
					boxLabel: 'More then once a day', inputValue: '1.2',
				},{
					boxLabel: 'Once a day', inputValue: '1',
				},{ 
					boxLabel: 'Every 3 days', inputValue: '0.95',
				},{
					boxLabel: 'Every 7 days',	inputValue: '0.75',
				},{
					boxLabel: 'Continuous',	inputValue: '0.65',
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
});
