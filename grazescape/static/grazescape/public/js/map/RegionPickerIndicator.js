var regionHighlighter = function(e) {
	let pixel = DSS.map.getEventPixel(e.originalEvent);
	let fs = DSS.map.getFeaturesAtPixel(pixel);
	const regionLayers = [
		DSS.layer.cloverBeltBorder,
		DSS.layer.swwiBorder,
		DSS.layer.northeastBorder,
		DSS.layer.uplandBorder,
		DSS.layer.redCedarBorder,
		DSS.layer.pineRiverBorder,
		DSS.layer.eastCentralBorder,
		DSS.layer.southEastBorder
	]
	let regionToHighlight = null;

	if(fs.length > 0){
        let region_name = fs[0].get("Name") || fs[0].get("NAME");
		if(region_name == 'CB_WI'){
			regionToHighlight = DSS.layer.cloverBeltBorder;
		}
		else if(region_name == 'SW_WI'){
			regionToHighlight = DSS.layer.swwiBorder;
		}
		else if(region_name == 'NE_WI'){
			regionToHighlight = DSS.layer.northeastBorder;
		}
		else if(region_name == 'UL_WI'){
			regionToHighlight = DSS.layer.uplandBorder;
		}
		else if(region_name == 'redCedarWI'){
			regionToHighlight = DSS.layer.redCedarBorder;
		}
		else if(region_name == 'pineRiverMN'){
			regionToHighlight = DSS.layer.pineRiverBorder;
		}
		else if(region_name == 'eastCentralWI'){
			regionToHighlight = DSS.layer.eastCentralBorder;
		} 
		else if(region_name == 'southEastWI'){
			regionToHighlight = DSS.layer.southEastBorder;
		} 
		else {
			return;
		}
	}

	for (const layer of regionLayers) {
		if(layer == regionToHighlight) {
			layer.setStyle(selectStyle);
		} else {
			layer.setStyle(unslectStyle);
		}
	}
}

const selectStyle = new ol.style.Style({
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
			items: []
		});
		
		me.callParent(arguments);
		
		AppEvents.registerListener('show_region_picker_indicator', function() {
			let om = Ext.getCmp('ol_map');
			let x = om.getX() + (om.getWidth() - 258) * 0.5;
			me.setHidden(false);
			me.setX(x);
			me.stopAnimation().animate({
				duration: 300,
				to: {
					y: -4
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
