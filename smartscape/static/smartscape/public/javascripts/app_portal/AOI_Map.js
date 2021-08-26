// AOI Map - Area of Interest Map

var DSS_PortalMap = false;

//------------------------------------------------------------------------------
Ext.define('DSS.app_portal.AOI_Map', {
//------------------------------------------------------------------------------
	extend: 'GeoExt.component.Map',
	alias: 'widget.aoi_map',

	DSS_mapCfg: {
		view: new ol.View({
			center: ol.proj.fromLonLat([-89.565, 44.2]),
			zoom: 6,
		    minZoom: 5,
		    maxZoom: 11
		}),
		layers: [
			new ol.layer.Tile({
				//source: new ol.source.BingMaps({})
				//source: new ol.source.OSM({})
				source: new ol.source.Stamen({
					layer: 'terrain'//-background' // terrain/ terrain-labels / terrain-lines
				})
			})
		],
		loadTilesWhileAnimating: true,
		controls: ol.control.defaults({
			attributionOptions: {
				collapsible: true
			}
		}),
	},
	
	DSS_mode: 'region',
	
	// Default MAP Interaction Styles...styles in DSS_OL below override these
	DSS_layerStyle: new ol.style.Style({
	    stroke: new ol.style.Stroke({
	        color: 'rgba(0, 0, 0, 0.3)',
	        width: 1
	    }),
	    fill: new ol.style.Fill({
		    color: 'rgba(128, 32, 255, 0.3)'
		})
	}),
	DSS_hoverStyle: new ol.style.Style({
	    stroke: new ol.style.Stroke({
	        color: 'rgba(0, 0, 0, 0.5)',
	        width: 1
	    }),
	    fill: new ol.style.Fill({
		    color: 'rgba(200, 32, 200, 0.5)'
		})
	}),
	DSS_clickStyle: new ol.style.Style({
	    stroke: new ol.style.Stroke({
	        color: 'rgba(128, 100, 16, 0.9)',
	        width: 2
	    }),
	    fill: new ol.style.Fill({
		    color: 'rgba(255, 200, 16, 0.5)'
		})
	}),
	
	// Clumsy OL object references
	DSS_OL: {
		region: {
			source: false,
			layer: false,
			hoverTool: false,
			clickTool: false,
			clickStyle: new ol.style.Style({
			    stroke: new ol.style.Stroke({	color: 'rgba(0, 0, 0, 0.5)', width: 2}),
			    fill: new ol.style.Fill({		color: 'rgba(128, 32, 255, 0.5)'})
			}) 
		},
		county: {
			source: false,
			layer: false,
			hoverTool: false,
			clickTool: false,
		},
		watershed: {
			source: false,
			layer: false,
			hoverTool: false,
			clickTool: false,
		}
	},

	//--------------------------------------------------------------------------
    constructor: function(config) {
        var me = this;
        DSS_PortalMap = me;
        
        if (!(me.getMap() instanceof ol.Map)) {
            me.setMap(new ol.Map(me.DSS_mapCfg));
        }

        me.callParent([config]);
    },	
    
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
		});
		
		// FOR DEV
		me.getMap().on('click', function(evt){
		//    console.info(me.getMap().getCoordinateFromPixel(evt.pixel));
		});

		me.callParent(arguments);
		me.initLayer(me.DSS_OL.region, './assets/regions.geojson', me.regionClicked.bind(me), true, true, true, );
		me.initLayer(me.DSS_OL.county, './assets/portal-counties2.geojson', me.countyClicked.bind(me), true);
		me.initLayer(me.DSS_OL.watershed, './assets/portal-watersheds.geojson', me.watershedClicked.bind(me), true);
	},
	
	// region, refine (county, or watershed)
	//--------------------------------------------------------------------------
	setMode: function(modeString) {
		var me = this;
		
		if (modeString === me.DSS_mode) return;
		var autoZoom = Ext.getCmp('dss-portal-auto-zoom').getValue();
		
		if (modeString === 'refine') {
			me.DSS_OL.region.layer.setOpacity(0.1);
			me.DSS_OL.region.clickTool.setActive(false);
			me.DSS_OL.region.hoverTool.setActive(false);
			me.DSS_OL.region.hoverTool.getFeatures().clear();

			me.DSS_OL.county.layer.setOpacity(0.1);
			me.DSS_OL.county.clickTool.setActive(false);
			me.DSS_OL.county.hoverTool.setActive(false);
			me.DSS_OL.county.hoverTool.getFeatures().clear();

			me.DSS_OL.watershed.layer.setOpacity(0.1);
			me.DSS_OL.watershed.clickTool.setActive(false);
			me.DSS_OL.watershed.hoverTool.setActive(false);
			me.DSS_OL.watershed.hoverTool.getFeatures().clear();

			if (autoZoom) {
				var fs = me.DSS_OL.region.clickTool.getFeatures();
				if (fs.getLength() > 0) {
					me.getView().cancelAnimations();
					me.getView().fit(fs.item(0).getGeometry(), {
						padding: [10,10,10,10],
						duration: 750,
						easing: ol.easing.easeOut
					});
				}
			}
		}
		else if (modeString === 'region') {
			me.DSS_OL.region.layer.setOpacity(1.0);
			me.DSS_OL.region.clickTool.setActive(true);
			me.DSS_OL.region.hoverTool.setActive(true);
			
			if (autoZoom) {
				var fs = me.DSS_OL.region.source.getFeatures();
				if (fs.length > 0) {
					var e1 = false;
					for (var i=0; i < fs.length; i++) {
						if (i == 0) {
							e1 = fs[i].getGeometry().getExtent();
						} else {
							e1 = ol.extent.extend(e1, fs[i].getGeometry().getExtent());
						}
					}
					
					if (e1) {
						me.getView().cancelAnimations();
						me.getView().fit(e1, {
							padding: [15,15,15,15],
							duration: 750,
							easing: ol.easing.easeOut
						});
					}
				}
			}			
		}
		else if (modeString === 'county') {
			me.DSS_OL.county.layer.setOpacity(1.0);
			me.DSS_OL.county.clickTool.setActive(true);
			me.DSS_OL.county.hoverTool.setActive(true);
		}
		else if (modeString === 'watershed') {
			me.DSS_OL.watershed.layer.setOpacity(1.0);
			me.DSS_OL.watershed.clickTool.setActive(true);
			me.DSS_OL.watershed.hoverTool.setActive(true);
		}
		me.DSS_mode = modeString;
	},
	
	//--------------------------------------------------------------------------
	regionClicked: function(feature, skipGrid) {
		var me = this;
		// unwrap feature selections if they are packed
		if (feature['selected']) {
			feature = feature.selected.length > 0 ? feature.selected[0] : null; 
		}
		if (feature) {
			var sel = feature.get("OBJECTID");
			
			// update county and watershed options
			var tmp = new ol.source.Vector();
			me.DSS_OL.county.source.forEachFeature(function(f) {
				if (f.get('REGION') == sel) {
					tmp.addFeature(f);
				}
			});		
			me.DSS_OL.county.layer.setSource(tmp);
			me.DSS_OL.county.clickTool.getFeatures().clear();
			
			tmp = new ol.source.Vector();
			me.DSS_OL.watershed.source.forEachFeature(function(f) {
				if (f.get('REGION') == sel) {
					tmp.addFeature(f);
				}
			});		
			me.DSS_OL.watershed.layer.setSource(tmp);
			me.DSS_OL.watershed.clickTool.getFeatures().clear();

			if (!skipGrid) {
				Ext.getCmp('dss-region-grid').setSelection(sel);
			}
		}
	},

	//--------------------------------------------------------------------------
	countyClicked: function(feature) {
		Ext.getCmp('dss-main-view').getProportions(this.getSelected());
		Ext.getCmp('dss-main-view').getRadar(this.getSelected());
	},

	//--------------------------------------------------------------------------
	watershedClicked: function(feature) {
		Ext.getCmp('dss-main-view').getProportions(this.getSelected());
		Ext.getCmp('dss-main-view').getRadar(this.getSelected());
	},

	//--------------------------------------------------------------------------
	initLayer: function(objRef, geojsonFile, clickHandler, bindSource, enableInteractions, singleSelection) {
		var me = this;
		
		// we keep a separate reference and don't directly add it to the layer unless requested b/c
		//	it's the entire set of data that is filtered as needed into an actual working source.
		var source = objRef['source'] = new ol.source.Vector({
			url: geojsonFile,
			format: new ol.format.GeoJSON()
		});
		
		var layer = objRef['layer'] = new ol.layer.Vector({
			style: me.DSS_layerStyle,
			source: bindSource ? source : undefined,
			opacity: enableInteractions ? 1 : 0.1,
			// these potentially reduce performance but looks better
			updateWhileAnimating: true, updateWhileInteracting: true
		})		
		me.getMap().addLayer(layer);
	
		var hoverInteraction = objRef['hoverTool'] = new ol.interaction.Select({
			condition: ol.events.condition.pointerMove,
			layers: [layer],
			style: me.DSS_hoverStyle
		});
		hoverInteraction.setActive(enableInteractions || false);
		me.getMap().addInteraction(hoverInteraction);
	
		var clickInteraction = objRef['clickTool'] = new ol.interaction.Select({
			condition: ol.events.condition.click,
			toggleCondition: singleSelection ? ol.events.condition.never : ol.events.condition.always,
			layers: [layer],
			style: objRef['clickStyle'] || me.DSS_clickStyle,
		});
		clickInteraction.setActive(enableInteractions || false);
		me.getMap().addInteraction(clickInteraction);

		clickInteraction.on('select', function(features) {
			clickHandler(features);
		})
	},
	
	centerOn: function(feature) {
		var me = this;
		var ex = me.getView().calculateExtent(me.getMap().getSize());
		if (ol.extent.containsExtent(ex, feature.getGeometry().getExtent())) return;
		me.getView().cancelAnimations();
        me.getView().animate({
			center: ol.extent.getCenter(feature.getGeometry().getExtent()),
			duration: 500,						
			//easing: ol.easing.easeOut
		});		
	},
	
	selectFeature: function(type, id, clearFirst) {
		var me = this;
		var olRefs = me.DSS_OL[type];
		var fs = olRefs.layer.getSource().getFeatures();
		if (clearFirst) olRefs.clickTool.getFeatures().clear();
		for (var i=0; i < fs.length; i++) {
			var f = fs[i];
			if (f.get('OBJECTID') == id) {
				olRefs.clickTool.getFeatures().push(f);
				if (type === 'region') me.regionClicked(f, true);
				
				if (Ext.getCmp('dss-portal-auto-zoom').getValue()) {
			        me.centerOn(f);
					break;
				}
			}
		}
	},
	
	getSelected: function() {
		var me = this;
		var counties = [];
		var watersheds = [];
		var res = {};
		me.DSS_OL.county.clickTool.getFeatures().forEach(function(item) {
			counties.push(item.get("OBJECTID"));
		});
		me.DSS_OL.watershed.clickTool.getFeatures().forEach(function(item) {
			watersheds.push(item.get("OBJECTID"));
		});
		
		if (counties.length > 0) {
			res['counties'] = counties;
		}
		if (watersheds.length > 0) {
			res['watersheds'] = watersheds;
		}
		return res;
	}
});
