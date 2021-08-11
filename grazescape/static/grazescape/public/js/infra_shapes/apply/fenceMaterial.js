
DSS.utils.addStyle('.hover {cursor: pointer}');

//------------------------------------------------------------------------------
Ext.define('DSS.infra_shapes.apply.fenceMaterial', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.infra_shapes_apply_fence_material',
	
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
		
		let rbName = "fenceMaterial";
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				width: '100%',
				layout: 'absolute',
				//disabled: true,
				items: [{
					xtype: 'component',
					x: 0, y: -6,
					width: '100%',
					height: 28,
					cls: 'information accent-text bold',
					html: "Set Fence Material",
				},
					getToggle(me, 'fenceMaterial.is_active') // Helper defined in DrawAndApply.js
				]
			},{
				xtype: 'radiogroup',
				itemId: 'contents',
				style: 'padding: 0px; margin: 0px', // fixme: eh...
				hideEmptyLabel: true,
				columns: 1, 
				//disabled: true,
				vertical: true,
				viewModel: {
					formulas: {
						fenceMaterialValue: {
							bind: '{fenceMaterial.value}', // inherited from parent
							get: function(val) {
								let obj = {};
								obj[rbName] = val;
								return obj;
							},
							set: function(val) {
								this.set('fenceMaterial.value', val[rbName]);
							}
						}
					}
				},
				listeners:{
					change: function(self) {
							if(this.inputValue == 'fl'){
								//this.setDisabled(true);
								console.log('hi from fence material after render')
							}
				},
				bind: '{fenceMaterialValue}', // formula from viewModel above
				defaults: {
					name: rbName,
					//listeners: {
						// afterrender: function(self) {
						// 	if(DSS.infra_shapes.apply.infraType.inputValue != 'fl'){
						// 		this.setDisabled(true);
						// 		console.log('hi from fence material after render')
						// 	}
						// 	else{
						// 		if ( self.boxLabelEl) {
						// 			self.boxLabelEl.setStyle('cursor', 'pointer')
						// 		}
						// 	}
						// }
					}
				//	boxLabelCls: 'hover'
				},
				items: [{
					boxLabel: 'High Tensile Electric, 1 Strand', inputValue: 'hte1',
				},{ 
				 	boxLabel: 'Electric - High Tensile', inputValue: 'hte',
				},{ 
					boxLabel: 'Pasture Paddock', inputValue: 'pp',
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
});
