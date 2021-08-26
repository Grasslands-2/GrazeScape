
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

	// requires: [
	// 	'DSS.infra_shapes.apply.fenceMaterial',
	// 	'DSS.infra_shapes.apply.waterPipe',
	// 	'DSS.infra_shapes.apply.laneMaterial'
	// ],
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var selectedType = '';
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
				listeners:{
					change: function(){
						selectedType = this.getValue().infraType
						 if(selectedType == 'wl'){
						 	console.log('water lines')
						 }else if(selectedType == 'll'){
						 	console.log('lane lines')
						 }else if(selectedType == 'fl'){
						 	console.log('fence lines')
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
						},

					}
				},
				items: [{ 
					boxLabel: 'Water Line', inputValue: 'wl',
				},{ 
					boxLabel: 'Lane Line', inputValue: 'll',
				},{
					boxLabel: 'Fencing', inputValue: 'fl',
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
});
