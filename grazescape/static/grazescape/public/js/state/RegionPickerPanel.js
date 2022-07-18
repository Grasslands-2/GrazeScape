
var regionsList = [{text: "Kickapoo Valley"}, {text: "Cloverbelt"},{text: "Uplands"},{text: "Northeast"}]
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
						click: async function( menu, item, e, eOpts ) {
							//this.up('window').destroy();
							//console.log(item.text);
							DSS.mouseMoveFunction = DSS.MapState.mouseoverFarmHandler();
							DSS.mapClickFunction = DSS.MapState.clickActivateFarmHandler();
							console.log(DSS.map.getView())
							if(item.text == "Cloverbelt"){
								DSS.activeRegion = "cloverBeltWI";
								DSS.map.un('pointermove', regionHighlighter)
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.layer.regionLabels.setVisible(false)
								DSS.layer.farms_1.setVisible(true)
								DSS.ApplicationFlow.instance.showFarmPickerPage();
								DSS.map.removeInteraction(DSS.selectRP);
								let view = new ol.View({
									center: [-10030031,5610033],
									zoom: 8,
									maxZoom: 30,
									minZoom: 8,
									constrainOnlyCenter: false,
									extent:[-10221386, 5467295, -9843661, 5750901]
								})
								let extent = [-10221386, 5467295, -9843661, 5750901]
								await DSS.MapState.zoomToRealExtentRP(extent,view)
							}
							if(item.text == "Kickapoo Valley"){
								DSS.activeRegion = "southWestWI";
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.map.un('pointermove', regionHighlighter)
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.layer.regionLabels.setVisible(false)
								DSS.layer.farms_1.setVisible(true)
								DSS.ApplicationFlow.instance.showFarmPickerPage();
								DSS.map.removeInteraction(DSS.selectRP);
								let view = new ol.View({
									center: [-10106698,5391875],
									zoom: 6,
									maxZoom: 30,
									minZoom: 6,
									constrainOnlyCenter: false,
									extent:[-10258162, 5258487, -9967076, 5520900]
								})
								let extent = [-10258162, 5258487, -9967076, 5520900]
								await DSS.MapState.zoomToRealExtentRP(extent,view)
							}
							if(item.text == "Northeast"){
								DSS.activeRegion = "northeastWI";
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.map.un('pointermove', regionHighlighter)
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.layer.regionLabels.setVisible(false)
								DSS.layer.farms_1.setVisible(true)
								DSS.ApplicationFlow.instance.showFarmPickerPage();
								DSS.map.removeInteraction(DSS.selectRP);
								let view = new ol.View({
									center: [-9786795,5508847],
									zoom: 6,
									maxZoom: 30,
									minZoom: 6,
									constrainOnlyCenter: false,
									extent:[-9861119, 5428671, -9706548, 5591254]
								})
								let extent = [-9841119, 5448671, -9726548, 5571254]
								await DSS.MapState.zoomToRealExtentRP(extent,view)
							}
							if(item.text == "Uplands"){
								DSS.activeRegion = "uplandsWI";
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.map.un('pointermove', regionHighlighter)
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.layer.regionLabels.setVisible(false)
								DSS.layer.farms_1.setVisible(true)
								DSS.ApplicationFlow.instance.showFarmPickerPage();
								DSS.map.removeInteraction(DSS.selectRP);
								let view = new ol.View({
									center: [-10039400,5305041],
									zoom: 6,
									maxZoom: 30,
									minZoom: 6,
									constrainOnlyCenter: false,
									extent:[-10247529, 5226215, -9938170, 5420242]
								})
								let extent = [-10247529, 5226215, -9938170, 5420242]
								await DSS.MapState.zoomToRealExtentRP(extent,view)
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
