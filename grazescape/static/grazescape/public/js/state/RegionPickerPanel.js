
var regionsList = [{text: "Kickapoo Valley"}, {text: "Cloverbelt"}]
DSS.activeRegion = "southWestWI";
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
				cls: 'information accent-text bold',
				html: "Welcome to GrazeScape!",
			},{
				xtype: 'component',
				cls: 'information med-text',
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
						cls: 'information accent-text bold',
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
						click: function( menu, item, e, eOpts ) {
							//this.up('window').destroy();
							//console.log(item.text);
							console.log(DSS.map.getView())
							if(item.text == "Cloverbelt"){
								DSS.activeRegion = "cloverBeltWI";
								console.log(DSS.activeRegion);
								DSS.map.un('pointermove', regionHighlighter)
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.layer.regionLabels.setVisible(false)
								DSS.layer.farms_1.setVisible(true)
								DSS.ApplicationFlow.instance.showFarmPickerPage();
								DSS.map.removeInteraction(DSS.selectRP);
								DSS.map.setView(new ol.View({
									center: [-10030031,5610033],
									zoom: 8,
									maxZoom: 30,
									minZoom: 8,
									constrainOnlyCenter: false,
									extent:[-10221386, 5467295, -9843661, 5750901]
								}))
							}
							else{
								DSS.activeRegion = "southWestWI";
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.map.un('pointermove', regionHighlighter)
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.layer.regionLabels.setVisible(false)
								DSS.layer.farms_1.setVisible(true)
								DSS.ApplicationFlow.instance.showFarmPickerPage();
								DSS.map.removeInteraction(DSS.selectRP);
								DSS.map.setView(new ol.View({
									center: [-10106698,5391875],
									zoom: 8,
									maxZoom: 30,
									minZoom: 8,
									constrainOnlyCenter: false,
									extent:[-10258162, 5258487, -9967076, 5520900]
								}))
							}
							DSS.map.removeInteraction(DSS.selectRP);
						}
					}
				}),
			]
		});
		
		me.callParent(arguments);
	}

});
