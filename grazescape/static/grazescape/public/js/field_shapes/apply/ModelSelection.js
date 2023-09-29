//Used to select which model will be run
//------------------------------------------------------------------------------
Ext.define('DSS.field_shapes.apply.ModelSelection', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.modelSelection',
	
	cls: 'restriction-widget',
	margin: '2 0 4 0',
	padding: 2,
	
	layout: DSS.utils.layout('vbox', 'start', 'center'),
	
	DSS_sectionHeight: 148,
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

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
					html: "Choose Model",
				}]
			},{
				xtype: 'radiogroup',
				itemId: 'contents',
				style: 'padding: 0px; margin: 0px', // fixme: eh...
				hideEmptyLabel: true,
				columns: 1, 
				vertical: true,
				bind: { value: '{modelSelected}' },
				defaults: {
					name: 'modelSelection'
				},
				items: [{boxLabel: 'Grass Yield', inputValue: 'grass'},
					{boxLabel: 'Erosion', inputValue: 'ero'},
					{boxLabel: 'P-Loss', inputValue: 'pl'},
					{boxLabel: 'Crop Yield', inputValue: 'crop'}
				]
			}]
		});
		
		me.callParent(arguments);
	},
	
});
