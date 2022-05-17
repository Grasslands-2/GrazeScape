var regionHighlighter = function(e) {
	let pixel = DSS.map.getEventPixel(e.originalEvent);
	let fs = DSS.map.getFeaturesAtPixel(pixel);
	//console.log(fs)
	hitRegion = false
	if(fs.length > 0){
		hitRegion = true
		if(fs[0].values_.Name == 'CB_WI'){
			//console.log("CB_WI hit")
			DSS.layer.cloverBeltBorder.setStyle(selectStyle)
		}
		if(fs[0].values_.Name == 'SW_WI'){
			//console.log("SW_WI hit")
			DSS.layer.swwiBorder.setStyle(selectStyle)
		}
		if(fs[0].values_.Name == 'NE_WI'){
			console.log("NE_WI hit")
			DSS.layer.northeastBorder.setStyle(selectStyle)
		}
		if(fs[0].values_.Name == 'UL_WI'){
			console.log("UL_WI hit")
			DSS.layer.uplandBorder.setStyle(selectStyle)
		}
	}
	if(fs.length < 1){
		hitRegion = false
		//console.log("no region hit")
		DSS.layer.cloverBeltBorder.setStyle(unslectStyle)
		DSS.layer.swwiBorder.setStyle(unslectStyle)
		DSS.layer.northeastBorder.setStyle(unslectStyle)
		DSS.layer.uplandBorder.setStyle(unslectStyle)
	}
}


const selectStyle = new ol.style.Style({
	// fill: new ol.style.Fill({
	//   color: '#eeeeee',
	// }),
	stroke: new ol.style.Stroke({
	  color: 'rgba(255, 255, 255, 0.7)',
	  width: 6,
	}),
	fill: new ol.style.Fill({
		color: 'rgba(32,96,160,0)'
	})
  });

  const unslectStyle =  new ol.style.Style({
	stroke: new ol.style.Stroke({
		color: '#EE6677',
		width: 4
	}),
	fill: new ol.style.Fill({
		color: 'rgba(32,96,160,0)'
	})
})

function regionPickerFunc() {
	console.log("INSIDE REGIONPICKERFUNC")
	DSS.map.setView(new ol.View({
		center: [-10000312.33,5506092.31],
		zoom: 8,
		maxZoom: 30,
		minZoom: 4,
		constrainOnlyCenter: false,
		//extent:[-10143258, 5510000,-9913236,5702859]
	}))
	//DSS.MapState.removeMapInteractions()
	let lastF = undefined, lastFp = undefined;

	DSS.map.on('pointermove', regionHighlighter)
	DSS.selectRP = new ol.interaction.Select({
		features: new ol.Collection(),
		toggleCondition: ol.events.condition.never,
		layers: [DSS.layer.cloverBeltBorder,DSS.layer.swwiBorder,DSS.layer.northeastBorder,DSS.layer.uplandBorder],
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'rgba(255, 255, 255, 0.7)',
				width: 4
			}),
			fill: new ol.style.Fill({
				color: 'rgba(0,0,0,0)'
			}),
			zIndex: 5
		})
	});
	DSS.map.addInteraction(DSS.selectRP);
	console.log("select is on")
	DSS.selectRP.on('select', async function(f) {
		selectedRegion = f.selected[0]
		console.log('select on happened');
		console.log(selectedRegion);
		DSS.map.un('pointermove', regionHighlighter)
		DSS.layer.cloverBeltBorder.setStyle(unslectStyle)
		DSS.layer.swwiBorder.setStyle(unslectStyle)
		DSS.layer.uplandBorder.setStyle(unslectStyle)
		DSS.layer.northeastBorder.setStyle(unslectStyle)
		//DSS.MapState.removeMapInteractions()
		AppEvents.triggerEvent('hide_region_picker_indicator')
		if(selectedRegion.values_.Name == 'CB_WI'){
			DSS.activeRegion = "cloverBeltWI";
			AppEvents.triggerEvent('hide_region_picker_indicator')

			DSS.layer.cloverBeltBorder.setVisible(true)
			DSS.layer.swwiBorder.setVisible(false)
			DSS.layer.northeastBorder.setVisible(false)
			DSS.layer.uplandBorder.setVisible(false)

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
		}if(selectedRegion.values_.Name == 'SW_WI'){
			DSS.activeRegion = "southWestWI";
			AppEvents.triggerEvent('hide_region_picker_indicator')
			
			DSS.layer.cloverBeltBorder.setVisible(false)
			DSS.layer.swwiBorder.setVisible(true)
			DSS.layer.northeastBorder.setVisible(false)
			DSS.layer.uplandBorder.setVisible(false)
			
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
		}if(selectedRegion.values_.Name == 'NE_WI'){
			DSS.activeRegion = "northeastWI";
			AppEvents.triggerEvent('hide_region_picker_indicator')
			
			DSS.layer.cloverBeltBorder.setVisible(false)
			DSS.layer.swwiBorder.setVisible(false)
			DSS.layer.northeastBorder.setVisible(true)
			DSS.layer.uplandBorder.setVisible(false)
			
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
		if(selectedRegion.values_.Name == 'UL_WI'){
			DSS.activeRegion = "uplandsWI";
			AppEvents.triggerEvent('hide_region_picker_indicator')
			
			DSS.layer.cloverBeltBorder.setVisible(false)
			DSS.layer.swwiBorder.setVisible(false)
			DSS.layer.northeastBorder.setVisible(false)
			DSS.layer.uplandBorder.setVisible(true)
			
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
	})
}
//------------------------------------------------------------------------------
Ext.define('DSS.map.RegionPickerIndicator', {
//------------------------------------------------------------------------------
	extend: 'Ext.button.Segmented', // Ext.container
	alias: 'widget.map_region_picker_indicator',
	
	singleton: true,
	
//	padding: '0 6 6 6',
	floating: true,
	shadow: false,
	hidden: false,
	
	style: 'border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.5); background-color: rgba(0,0,0,0.5)',
	layout: DSS.utils.layout('hbox', 'start'),
	
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		Ext.applyIf(me, {
			defaults: {
 				xtype: 'button',
				toggleGroup: 'region-picker-indicator',
				padding: '4 0 0 0',
				height: 30,
				allowDepress: false,
				frame: false
			},
			items: [
			// 	{
			// 	//xtype: 'component',
			// 	text: 'Pick a Region to Work in! ',
			// 	//tooltip: 'Draw fieldstructure lines',
			// 	width: 200
			// }
		]
		});
		
		me.callParent(arguments);
		
		//me.showAt(400, -38); me.setHidden(true);
		
		AppEvents.registerListener('show_region_picker_indicator', function() {
			let om = Ext.getCmp('ol_map');
			let x = om.getX() + (om.getWidth() - /*me.getWidth()*/258) * 0.5;
			me.setHidden(false);
			me.setX(x);
			me.stopAnimation().animate({
				duration: 300,
				to: {
					y: -4
				}
			})
		})
		AppEvents.registerListener('hide_region_picker_indicator', function() {
			me.stopAnimation().animate({
				duration: 300,
				to: {
					y: -38
				},
				callback: function() {
					me.setHidden(true);
				}
			})
		})
		AppEvents.registerListener('map_resize', function() {
			if (!me.isHidden()) {
				let om = Ext.getCmp('ol_map');
				me.setX(om.getX() + (om.getWidth() - me.getWidth()) * 0.5);
			}
		})
	},
	
});
