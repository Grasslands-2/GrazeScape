
var regionsList = [
	{text: "Ridge and Valley", regionCode: "SW_WI"}, 
	{text: "Clover Belt", regionCode: "CB_WI"},
	{text: "Driftless", regionCode: "UL_WI"},
	{text: "Northeast", regionCode: "NE_WI"},
	{text: "Red Cedar", regionCode: "redCedarWI"}, 
	{text: "Pine River", regionCode: "pineRiverMN"},
	{text: "East Central", regionCode: "eastCentralWI"},
	{text: "Southeast", regionCode: "southEastWI"}
];

//------------------------------------------------------------------------------
Ext.define('DSS.state.RegionPickerPanel', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.region_picker_panel',

	layout: DSS.utils.layout('vbox', 'center', 'stretch'),
	cls: 'section',

	DSS_singleText: '"Start by Choosing the Region you want to work in."',
					
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		Ext.applyIf(me, {
			defaults: {
				margin: '1rem',
			},
			items: [{
				xtype: 'component',
				x: 0, y: -6,
				width: '100%',
				height: 50,
				cls: 'section-title accent-text',
				html: "Welcome to GrazeScape!",
			},{
				xtype: 'component',
				cls: 'section-title accent-text',
				html: 'Region Selection'
			},
            {
				xtype: 'container',
				width: '100%',
				layout: 'absolute',
					items: [{
						xtype: 'component',
						x: 0, y: -6,
						width: '100%',
						height: 75,
						cls: 'information med-text',
						html: "Please choose to work in one of the regions below, or click on the region on the map.",
					}],
			},
				Ext.create('Ext.menu.Menu', {
					width: 100,
					id: "RegionMenu",
					margin: '0 0 10 0',
					floating: false,  // usually you want this set to True (default)
					renderTo: Ext.getBody(),  // usually rendered by it's containing component
					items: regionsList,
					listeners:{
						click: async function( menu, item, e, eOpts ) {
							console.log("Clicked RegionPickerPanel option");
							console.log(item);

							await DSS.utils.selectRegion(item.regionCode);
						}
					}
				}),
			]
		});
		
		me.callParent(arguments);
	}

});
