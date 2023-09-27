DSS.utils.addStyle('.popup-eye { opacity: 0.9; overflow: visible!important;background-color: #f8f7ef; border-radius: .5rem; border: 1px solid #999; box-shadow: 0 6px 6px rgba(0,0,0,0.5);pointer-events:none; }')
DSS.utils.addStyle('.popup-eye:after { transform: rotate(-45deg); overflow: visible!important; display: block; position: absolute; bottom: -0.32rem; left: calc(100px - 0.32rem); content: ""; background-color: #f8f7ef; width: 0.5rem; height: 0.5rem; border-left: 1px solid #999; border-bottom: 1px solid #999; box-shadow: -6px 6px 6px rgba(0,0,0,0.5) }')

DSS.utils.addStyle('path.boundary { fill: #ff00001f; stroke: red;}');
DSS.utils.addStyle('path.boundary:hover { fill: #ff00005f; stroke: red;}');

DSS.utils.addStyle('.layer-menu {margin: 6px;background:rgba(0,0,0,0.4);border-radius: 4px;padding: 0.23rem; color: #27c; font-size: 1.25rem; cursor: pointer; text-shadow: 0 1px 0 rgba(0,0,0,0.5), -1px 0 rgba(0,0,0,0.3), 0 0 6px rgba(0,0,0,0.4)}');
DSS.utils.addStyle('.layer-menu:hover {background:rgba(0,0,0,0.6);color: #48f; text-shadow: 0 2px 2px rgba(0,0,0,0.8), 1px 0 rgba(0,0,0,0.5), -1px 0 rgba(0,0,0,0.5), 0 0 6px rgba(0,0,0,0.4)}');

let canvas = document.createElement('canvas');
let context = canvas.getContext('2d');
//var hatchPattern = new Image();

var fields_1Source = new ol.source.Vector({
	format: new ol.format.GeoJSON(),
});
//import {getArea, getDistance} from 'ol/sphere';
//------------------------------------------------------------------------------
Ext.define('DSS.map.Main', {
//------------------------------------------------------------------------------

	extend: 'Ext.Container',//Component',
	alias: 'widget.main_map',
	
	style: 'background-color: rgb(75,80,60)',
	
	BING_KEY: 'Anug_v1v0dwJiJPxdyrRWz0BBv_p2sm5XA72OW-ypA064_JoUViwpDXZl3v7KZC1',
	OSM_KEY: /*''fBrGdagAiyuEcYIsxr72'*/'cRFDJdDADPOOqUQsdxJT',
	
	requires: [
		'DSS.map.DrawAndModify',
		'DSS.state.DeleteOperation',
		'DSS.state.ScenarioPicker',
		'DSS.map.BoxModel',
		'DSS.map.LayerMenu',
		'DSS.map.RotationLayer',
		'DSS.field_grid.FieldGrid',
		'DSS.infrastructure_grid.InfrastructureGrid'
	],
	
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	listeners: {
		afterrender: function(self) {
			self.instantiateMap()
		},
		resize: function(self, w, h) {
		}
	},
		
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				flex: 1,
				region: 'center',
				id: 'ol_map',
				listeners: {
					resize: function(self, w, h) {
						me.map.setSize([w,h]);
						AppEvents.triggerEvent('map_resize');
					}
				}
			},
			DSS.FieldGrid,
			DSS.InfraGrid
		]
		});
		me.callParent(arguments);
		
		DSS.LayerButton = Ext.create('Ext.Component', {
			floating: true,
			shadow: false,
			x: 280, // FIXME
			cls: 'layer-menu',
			html: '<i class="fas fa-layer-group"></i>',
			listeners: {
				render: function(c) {
					c.getEl().set({'data-qtip': "Access map layers"});
					c.getEl().on({
						click: function(self) {
							let rect = c.el.dom.getBoundingClientRect();
							if(DSS.activeRegion == "cloverBeltWI"){
								Ext.create('DSS.map.LayerMenuCB').showAt(rect.left-2, rect.top-2);
							}if(DSS.activeRegion == "northeastWI"){
								
								Ext.create('DSS.map.LayerMenuNE').showAt(rect.left-2, rect.top-2);
							}
							if(DSS.activeRegion == "uplandsWI"){
								Ext.create('DSS.map.LayerMenuUL').showAt(rect.left-2, rect.top-2);
							}
							if(DSS.activeRegion == "southWestWI"){
								Ext.create('DSS.map.LayerMenu').showAt(rect.left-2, rect.top-2);
							}
							if(DSS.activeRegion == "redCedarWI"){
								Ext.create('DSS.map.LayerMenu').showAt(rect.left-2, rect.top-2);
							}
							if(DSS.activeRegion == "pineRiverMN"){
								Ext.create('DSS.map.LayerMenu').showAt(rect.left-2, rect.top-2);
							}
						}
					});
				}
			}					
		});
		
		setTimeout(function() {
			DSS.LayerButton.showAt(DSS.LayerButton.x,0);
		}, 100);
		
	},

	//-------------------------------------------------------------------------
	showLayerButton() {
		let me = this;
		DSS.LayerButton.animate({
			to: {
				y: 2
			}
		});
	},

	//-------------------------------------------------------------------------
	hideLayerButton() {
		let me = this;
		DSS.LayerButton.animate({
			to: {
				y: -32
			}
		});
		console.log('layer menu turned off')
	},

	
	// DefaultVisibility is a boolean...(but stored as a "0" or a "1"
	// DefaultOpacity is a decimal, e.g. 0.1 (but stored as "0.1")
	//-------------------------------------------------------------------------
	_cookieInternalHelper: function(key, defaultVisibility, defaultOpacity) {
		const layerVisKey = key + ":visible",
				layerOpacKey = key + ":opacity";
		
		if (Ext.util.Cookies.get(layerVisKey) == null) {
			Ext.util.Cookies.set(layerVisKey, defaultVisibility ? "1" : "0");
		}
		DSS.layer[layerVisKey] = Ext.util.Cookies.get(layerVisKey) == "1" ? true : false;
		
		if (Ext.util.Cookies.get(layerOpacKey) == null) {
			// must be a string...
			Ext.util.Cookies.set(layerOpacKey, "" + defaultOpacity);
		}
		DSS.layer[layerOpacKey] = parseFloat(Ext.util.Cookies.get(layerOpacKey)); 
	},
	
	//-------------------------------------------------------------------------
	manageMapLayerCookies: function() {
		let me = this;
		me._cookieInternalHelper("crop", "1", 0.8);
		me._cookieInternalHelper("inspector", "1", 0.8);
		me._cookieInternalHelper("tainterwatershed", "0", 0.6);
		me._cookieInternalHelper("DEM", "0", 0.6);
		me._cookieInternalHelper("kickapoowatershed", "0", 0.6);
		me._cookieInternalHelper("hillshade", "0", 0.5);
		me._cookieInternalHelper("ploss", "0", 1);
		
		// Visible code is the # of the base layer that is visible...
		if (Ext.util.Cookies.get("baselayer:visible") == null) {
			Ext.util.Cookies.set("baselayer:visible", "1");
		}
		DSS.layer['baselayer:visible'] = Ext.util.Cookies.get('baselayer:visible'); 
	},
	
	//-------------------------------------------------------------------------
	instantiateMap: function() {
		let me = this;
		me.DSS_zoomStyles = {};
		
		for (let idx = 3; idx <= 16; idx++) {
			let sw = Math.floor(Math.sqrt(idx));
			if (sw < 1) sw = 1;
			me.DSS_zoomStyles['style' + idx] = new ol.style.Style({
				image: new ol.style.Circle({
					radius: idx,
					fill: new ol.style.Fill({
						color: 'rgba(32,96,160,0.9)'
					}),
					stroke: new ol.style.Stroke({
						color: 'rgba(255,255,255,0.75)',
						width: sw
					}),
				})
			});
		}
		
		DSS.layer = {};
		me.manageMapLayerCookies();
		//---------------------------------------------------------
		DSS.layer.bingAerial = new ol.layer.Tile({
			visible: true,
			source: new ol.source.BingMaps({
				key: me.BING_KEY,
				imagerySet: 'AerialWithLabelsOnDemand',// can be: Aerial, Road, RoadOnDemand, AerialWithLabels, AerialWithLabelsOnDemand, CanvasDark, OrdnanceSurvey
				//hidpi:true,
				//maxZoom:18,
				//minZoom:11,
			})
		});
		//---------------------------------------------------------
		DSS.layer.bingRoad = new ol.layer.Tile({
			visible: false,
			source: new ol.source.BingMaps({
				key: me.BING_KEY,
				imagerySet: 'Road',  
				maxZoom:18,
				minZoom:11,
			})
		});		
		//--------------------------------------------------------------		
		DSS.layer.osm_hybrid = new ol.layer.Tile({
			visible: true,
			source: new ol.source.TileJSON({
				url: 'https://api.maptiler.com/maps/hybrid/tiles.json?key=' + me.OSM_KEY,
				tileSize: 400,
				crossOrigin: 'anonymous'
			})
		})	;
		//--------------------------------------------------------------	
		DSS.layer.osm_satellite = new ol.layer.Tile({
			visible: false,
			source: new ol.source.TileJSON({
				url: 'https://api.maptiler.com/tiles/satellite/tiles.json?key=' + me.OSM_KEY,
				tileSize: 400,
				crossOrigin: 'anonymous'
			})
		})	;
		//--------------------------------------------------------------	
		DSS.layer.osm_streets = new ol.layer.Tile({
			visible: false,
			source: new ol.source.TileJSON({
				url: 'https://api.maptiler.com/maps/streets/tiles.json?key=' + me.OSM_KEY,
				tileSize: 400,
				crossOrigin: 'anonymous'
			})
		})	;
		DSS.layer.osm_topo = new ol.layer.Tile({
			visible: false,
			//visible: true,
			source: new ol.source.TileJSON({
				url: 'https://api.maptiler.com/maps/topo/tiles.json?key=' + me.OSM_KEY,
				tileSize: 400,
				crossOrigin: 'anonymous'
			})
		})	;
		//---------------------------Region Label Layer-----------------
		let regionLabel = new ol.style.Style({
			text: new ol.style.Text({
				font: '30px Calibri,sans-serif',
				overflow: true,
				fill: new ol.style.Fill({
				  color: 'rgba(0,0,0,1)',
				}),
				stroke: new ol.style.Stroke({
				  color: 'rgba(255, 255, 255, 2.5)',
				  width: 2,
				}),
			  }),
			zIndex: 0
		});
		DSS.layer.regionLabels = new ol.layer.Vector({
			//minZoom: 6,
			title: 'regionLabels',
			visible: true,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: new ol.source.Vector({
				format: new ol.format.GeoJSON(),
				url: '/static/grazescape/public/shapeFiles/region_labels.geojson',
			}),
			style: function(feature, resolution) {
				regionLabel.getText().setText(feature.values_.Name);
				return regionLabel;
			}
		})
		//--------------------------------------------------------------		
		DSS.layer.cloverBeltBorder = new ol.layer.Vector({
			visible: true,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: new ol.source.Vector({
				format: new ol.format.GeoJSON(),
				url: '/static/grazescape/public/shapeFiles/Clover_Belt_Border2.geojson',
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#EE6677',
					width: 4
				}),
				fill: new ol.style.Fill({
					color: 'rgba(32,96,160,0)'
				})
			})
		});

		DSS.layer.redCedarBorder = new ol.layer.Vector({
			visible: true,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: new ol.source.Vector({
				format: new ol.format.GeoJSON(),
				url: '/static/grazescape/public/shapeFiles/redCedarWI.geojson',
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#EE6677',
					width: 4
				}),
				fill: new ol.style.Fill({
					color: 'rgba(32,96,160,0)'
				})
			})
		});
		DSS.layer.pineRiverBorder = new ol.layer.Vector({
			visible: true,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: new ol.source.Vector({
				format: new ol.format.GeoJSON(),
				url: '/static/grazescape/public/shapeFiles/pineRiverMN.geojson',
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#EE6677',
					width: 4
				}),
				fill: new ol.style.Fill({
					color: 'rgba(32,96,160,0)'
				})
			})
		});
		//--------------------------------------------------------------	
		DSS.layer.northeastBorder = new ol.layer.Vector({
			visible: true,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: new ol.source.Vector({
				format: new ol.format.GeoJSON(),
				url: '/static/grazescape/public/shapeFiles/northeastWI_boundaries.geojson',
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#EE6677',
					width: 4
				}),
				fill: new ol.style.Fill({
					color: 'rgba(32,96,160,0)'
				})
			})
		});
		//--------------------------------------------------------------		
		DSS.layer.uplandBorder = new ol.layer.Vector({
			visible: true,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: new ol.source.Vector({
				format: new ol.format.GeoJSON(),
				url: '/static/grazescape/public/shapeFiles/uplandsWI_boundaries.geojson',
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#EE6677',
					width: 4
				}),
				fill: new ol.style.Fill({
					color: 'rgba(32,96,160,0)'
				})
			})
		});
		//--------------------------------------------------------------		
		DSS.layer.swwiBorder = new ol.layer.Vector({
			visible: true,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: new ol.source.Vector({
				format: new ol.format.GeoJSON(),
				url: '/static/grazescape/public/shapeFiles/southWestWI2.geojson',
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#EE6677',
					width: 4
				}),
				fill: new ol.style.Fill({
					color: 'rgba(32,96,160,0)'
				})
			})
		});

		// Utility to reference all the regions, since they are each in their own layers.
		DSS.allRegionLayers = [
			DSS.layer.cloverBeltBorder,
			DSS.layer.redCedarBorder,
			DSS.layer.pineRiverBorder,
			DSS.layer.northeastBorder,
			DSS.layer.uplandBorder,
			DSS.layer.swwiBorder
		];
		
		for(var region of DSS.allRegionLayers) {
			region.getSource().on("addfeature", function() {
				DSS.utils.assignFarmsToRegions()
			})
		}

		//--------------------------------------------------------------		
		DSS.layer.tainterwatershed = new ol.layer.Vector({
			visible: false,//DSS.layer['tainterwatershed:visible'],
			//opacity: DSS.layer['tainterwatershed:opacity'],
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: new ol.source.Vector({
				format: new ol.format.GeoJSON(),
				url: '/static/grazescape/public/shapeFiles/tainterWatershed.geojson',
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#7fff1f',
					width: 4
				})
			})
		});
		//--------------------------------------------------------------
		DSS.layer.kickapoowatershed = new ol.layer.Vector({
			visible: false,//DSS.layer['kickapoowatershed:visible'],
			//opacity: DSS.layer['kickapoowatershed:opacity'],
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: new ol.source.Vector({
				format: new ol.format.GeoJSON(),
				url: '/static/grazescape/public/shapeFiles/kickapoowatershed.geojson',
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#0073ff',
					width: 4
				})
			})
		});
		DSS.layer.rullandsCouleewshed = new ol.layer.Vector({
			visible: DSS.layer['rullandsCouleewshed:visible'],
			opacity: DSS.layer['rullandsCouleewshed:opacity'],
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: new ol.source.Vector({
				format: new ol.format.GeoJSON(),
				url: '/static/grazescape/public/shapeFiles/RullandsCouleeWshed.geojson',
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#fcba03',
					width: 4
				})
			})
		});
		var extent = [ -10168100, 5454227, -10055830, 5318380];

		DSS.layer.hillshade = new ol.layer.Image({
			visible: DSS.layer['hillshade:visible'],
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			opacity: DSS.layer['hillshade:opacity'],
			source: new ol.source.ImageStatic({
				url: '/static/grazescape/public/images/hillshade_high.png',
				imageExtent: extent
			})
		})
		// Left, Bottom, Right, Top
		NEinputextent0 = [-9825688.791937,5501789.532855,-9768598.791937,5571269.532855]
		NEinputextent1 = [-9771028.791937,5514959.532855,-9726558.791937,5571269.532855]
		NEinputextent2 = [-9802208.791937,5448659.532855,-9740698.791937,5517769.532855]

		ULinputextent0 = [-10053557.394437,5334019.484104,-9974111.851099,5410245.208065]
		ULinputextent1 = [-10148009.781571,5236501.745210,-10066003.514031,5344306.838534]
		ULinputextent2 = [-10066691.882767,5283451.447037,-10000615.033866,5344038.557734]
		ULinputextent3 = [-10066500.647774,5236913.636176,-10000596.649961,5283867.854421]
		ULinputextent4 = [-10000868.715991,5236184.341261,-9947751.935464,5290407.799301]

		SWinputextent0 = [ -10168109.314900, 5318375.349200, -10111969.314900, 5386305.349200]
		SWinputextent1 = [ -10111969.314900, 5318375.349200, -10055829.314900, 5386305.349200]
		SWinputextent2 = [ -10168109.314900, 5386305.349200, -10111969.314900, 5454235.349200]
		SWinputextent3 = [ -10111969.314900, 5386305.349200, -10055829.314900, 5454235.349200]
		
		CBinputextent0 = [ -10121877.038627, 5624880.297527, -10071577.038627, 5682010.297527]
		CBinputextent1 = [ -9986457.038627, 5569960.297527, -9932247.038627, 5641430.297527]
		CBinputextent2 = [ -10022377.038627, 5570390.297527, -9986437.038627, 5641140.297527]
		CBinputextent3 = [ -10121877.038627, 5530940.297527, -10053077.038627, 5570930.297527]
		CBinputextent4 = [ -10121877.038627, 5570600.297527, -10071517.038627, 5624960.297527]
		CBinputextent5 = [ -10071587.038627, 5570670.297527, -10021207.038627, 5624890.297527]
		CBinputextent6 = [ -10071667.038627, 5624810.297527, -10022107.038627, 5682010.297527]

		//-------------------SWWI-----------------------------
		//--------------------DEM-----------------------------
		DSS.layer.SWDEM_image0 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/SW_DEM_PNG_1122_0.PNG',
				imageExtent: SWinputextent0,
			})
		}),
		DSS.layer.SWDEM_image1 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/SW_DEM_PNG_1122_1.PNG',
				imageExtent: SWinputextent1,
			})
		}),
		DSS.layer.SWDEM_image2 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/SW_DEM_PNG_1122_2.PNG',
				imageExtent: SWinputextent2,
				
			})
		}),
		DSS.layer.SWDEM_image3 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/SW_DEM_PNG_1122_3.PNG',
				imageExtent: SWinputextent3,
				
			})
		})
		//----------------------------SLOPE----------------------------------------------------
		DSS.layer.SWSlope0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_slopePer_10m_0.PNG',
				imageExtent: SWinputextent0,
			})
		}),
		DSS.layer.SWSlope1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_slopePer_10m_1.PNG',
				imageExtent: SWinputextent1,
			})
		}),
		DSS.layer.SWSlope2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_slopePer_10m_2.PNG',
				imageExtent: SWinputextent2,
				
			})
		}),
		DSS.layer.SWSlope3 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_slopePer_10m_3.PNG',
				imageExtent: SWinputextent3,
				
			})
		})
		
		//-------------------------------------------CLAY---------------------------------------------------
		DSS.layer.SWClay0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_clay_10m_0.PNG',
				imageExtent: SWinputextent0,
			})
		}),
		DSS.layer.SWClay1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_clay_10m_1.PNG',
				imageExtent: SWinputextent1,
			})
		}),
		DSS.layer.SWClay2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_clay_10m_2.PNG',
				imageExtent: SWinputextent2,
				
			})
		}),
		DSS.layer.SWClay3 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_clay_10m_3.PNG',
				imageExtent: SWinputextent3,
				
			})
		})
		//-------------------------------------SILT-------------------------------------------
		DSS.layer.SWSilt0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_silt_10m_0.PNG',
				imageExtent: SWinputextent0,
			})
		}),
		DSS.layer.SWSilt1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_silt_10m_1.PNG',
				imageExtent: SWinputextent1,
			})
		}),
		DSS.layer.SWSilt2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_silt_10m_2.PNG',
				imageExtent: SWinputextent2,
				
			})
		}),
		DSS.layer.SWSilt3 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_silt_10m_3.PNG',
				imageExtent: SWinputextent3,
				
			})
		})
		//-------------------------------------SAND---------------------------------------
		DSS.layer.SWSand0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_sand10m_0.PNG',
				imageExtent: SWinputextent0,
			})
		}),
		DSS.layer.SWSand1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_sand10m_1.PNG',
				imageExtent: SWinputextent1,
			})
		}),
		DSS.layer.SWSand2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_sand10m_2.PNG',
				imageExtent: SWinputextent2,
				
			})
		}),
		DSS.layer.SWSand3 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_sand10m_3.PNG',
				imageExtent: SWinputextent3,
				
			})
		})
		//-------------------NEWI-----------------------------
		//--------------------DEM-----------------------------
		DSS.layer.NEDEM_image0 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_elev_1.png',
				imageExtent: NEinputextent0,
			})
		}),
		DSS.layer.NEDEM_image1 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_elev_2.png',
				imageExtent: NEinputextent1,
			})
		}),
		DSS.layer.NEDEM_image2 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_elev_3.png',
				imageExtent: NEinputextent2,
				
			})
		}),
		//----------------------------SLOPE----------------------------------------------------
		DSS.layer.NESlope0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_slopePer_1.png',
				imageExtent: NEinputextent0,
			})
		}),
		DSS.layer.NESlope1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_slopePer_2.png',
				imageExtent: NEinputextent1,
			})
		}),
		DSS.layer.NESlope2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_slopePer_3.png',
				imageExtent: NEinputextent2,
				
			})
		}),
		//-------------------------------------------CLAY---------------------------------------------------
		DSS.layer.NEClay0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_clay_1.png',
				imageExtent: NEinputextent0,
			})
		}),
		DSS.layer.NEClay1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_clay_2.png',
				imageExtent: NEinputextent1,
			})
		}),
		DSS.layer.NEClay2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_clay_3.png',
				imageExtent: NEinputextent2,
				
			})
		}),
		//-------------------------------------SILT-------------------------------------------
		DSS.layer.NESilt0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_silt_1.png',
				imageExtent: NEinputextent0,
			})
		}),
		DSS.layer.NESilt1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_silt_2.png',
				imageExtent: NEinputextent1,
			})
		}),
		DSS.layer.NESilt2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_silt_3.png',
				imageExtent: NEinputextent2,
				
			})
		}),
		//-------------------------------------SAND---------------------------------------
		DSS.layer.NESand0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_sand_1.png',
				imageExtent: NEinputextent0,
			})
		}),
		DSS.layer.NESand1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_sand_2.png',
				imageExtent: NEinputextent1,
			})
		}),
		DSS.layer.NESand2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/northeastWI_sand_3.png',
				imageExtent: NEinputextent2,
				
			})
		}),
		//-------------------UPLANDS WI-------------------------
		//--------------------DEM-----------------------------
		DSS.layer.ULDEM_image0 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.cloud.google.com/grazescaperasterstorage/ul_elev_1.png',
				imageExtent: ULinputextent0,
			})
		}),
		DSS.layer.ULDEM_image1 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_elev_2.png',
				imageExtent: ULinputextent1,
			})
		}),
		DSS.layer.ULDEM_image2 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_elev_3.png',
				imageExtent: ULinputextent2,
				
			})
		}),
		DSS.layer.ULDEM_image3 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_elev_4.png',
				imageExtent: ULinputextent3,
				
			})
		})
		DSS.layer.ULDEM_image4 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_elev_5.png',
				imageExtent: ULinputextent3,
				
			})
		})
		//----------------------------SLOPE----------------------------------------------------
		DSS.layer.ULSlope0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_slope1.png',
				imageExtent: ULinputextent0,
			})
		}),
		DSS.layer.ULSlope1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_slope2.png',
				imageExtent: ULinputextent1,
			})
		}),
		DSS.layer.ULSlope2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_slope3.png',
				imageExtent: ULinputextent2,
				
			})
		}),
		DSS.layer.ULSlope3 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_slope4.png',
				imageExtent: ULinputextent3,
				
			})
		})
		DSS.layer.ULSlope4 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_slope5.png',
				imageExtent: ULinputextent3,
				
			})
		})
		
		//-------------------------------------------CLAY---------------------------------------------------
		DSS.layer.ULClay0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_clay_1.png',
				imageExtent: ULinputextent0,
			})
		}),
		DSS.layer.ULClay1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_clay_2.png',
				imageExtent: ULinputextent1,
			})
		}),
		DSS.layer.ULClay2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_clay_3.png',
				imageExtent: ULinputextent2,
				
			})
		}),
		DSS.layer.ULClay3 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_clay_4.png',
				imageExtent: ULinputextent3,
				
			})
		})
		DSS.layer.ULClay4 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_clay_5.png',
				imageExtent: ULinputextent3,
				
			})
		})
		//-------------------------------------SILT-------------------------------------------
		DSS.layer.ULSilt0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_silt_1.png',
				imageExtent: ULinputextent0,
			})
		}),
		DSS.layer.ULSilt1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_silt_2.png',
				imageExtent: ULinputextent1,
			})
		}),
		DSS.layer.ULSilt2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_silt_3.png',
				imageExtent: ULinputextent2,
				
			})
		}),
		DSS.layer.ULSilt3 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_silt_4.png',
				imageExtent: ULinputextent3,
				
			})
		})
		DSS.layer.ULSilt4 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_silt_5.png',
				imageExtent: ULinputextent3,
				
			})
		})
		//-------------------------------------SAND---------------------------------------
		DSS.layer.ULSand0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_sand_1.png',
				imageExtent: ULinputextent0,
			})
		}),
		DSS.layer.ULSand1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_sand_2.png',
				imageExtent: ULinputextent1,
			})
		}),
		DSS.layer.ULSand2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_sand_3.png',
				imageExtent: ULinputextent2,
				
			})
		}),
		DSS.layer.ULSand3 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_sand_4.png',
				imageExtent: ULinputextent3,
				
			})
		})
		DSS.layer.ULSand4 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/ul_sand_5.png',
				imageExtent: ULinputextent3,
				
			})
		})
		//-------------------------------Clover Belt DEM-----------------------------------------
		DSS.layer.CBDEM_image0 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_DEM_10m_0.png',
				imageExtent: CBinputextent0,
			})
		})
		DSS.layer.CBDEM_image1 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_DEM_10m_1.png',
				imageExtent: CBinputextent1,
			})
		})
		DSS.layer.CBDEM_image2 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_DEM_10m_2.png',
				imageExtent: CBinputextent2,
			})
		})
		DSS.layer.CBDEM_image3 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_DEM_10m_3.png',
				imageExtent: CBinputextent3,
			})
		})
		DSS.layer.CBDEM_image4 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_DEM_10m_4.png',
				imageExtent: CBinputextent4,
			})
		})
		DSS.layer.CBDEM_image5 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_DEM_10m_clip_5.PNG',
				imageExtent: CBinputextent5,
			})
		})
		DSS.layer.CBDEM_image6 = new ol.layer.Image({
			visible: false,
			opacity: DSS.layer['DEM:opacity'],
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_DEM_10m_clip_6.PNG',
				imageExtent: CBinputextent6,
			})
		})
		//-------------------------------Clover Belt Slope--------------------------------------------------
		DSS.layer.CBSlope0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_slope10m_0.png',
				imageExtent: CBinputextent0,
				
			})
		})
		DSS.layer.CBSlope1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_slope10m_1.png',
				imageExtent: CBinputextent1,
				
			})
		})
		DSS.layer.CBSlope2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_slope10m_2.png',
				imageExtent: CBinputextent2,
				
			})
		})
		DSS.layer.CBSlope3 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_slope10m_3.png',
				imageExtent: CBinputextent3,
				
			})
		})
		DSS.layer.CBSlope4 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_slope10m_4.png',
				imageExtent: CBinputextent4,
				
			})
		})
		DSS.layer.CBSlope5 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_slope10m_5.png',
				imageExtent: CBinputextent5,
				
			})
		})
		DSS.layer.CBSlope6 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_slope10m_6.png',
				imageExtent: CBinputextent6,
				
			})
		})
		//-------------------------------Clover Belt Clay--------------------------------------------------
		DSS.layer.CBClay0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_clay_10m_0.png',
				imageExtent: CBinputextent0,
				
			})
		})
		DSS.layer.CBClay1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_clay_10m_1.png',
				imageExtent: CBinputextent1,
				
			})
		})
		DSS.layer.CBClay2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_clay_10m_2.png',
				imageExtent: CBinputextent2,
				
			})
		})
		DSS.layer.CBClay3 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_clay_10m_3.png',
				imageExtent: CBinputextent3,
				
			})
		})
		DSS.layer.CBClay4 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_clay_10m_4.png',
				imageExtent: CBinputextent4,
				
			})
		})
		DSS.layer.CBClay5 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_clay_10m_5.png',
				imageExtent: CBinputextent5,
				
			})
		})
		DSS.layer.CBClay6 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_clay_10m_6.png',
				imageExtent: CBinputextent6,
				
			})
		})
		//-------------------------------Clover Belt Sand--------------------------------------------------
		DSS.layer.CBSand0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_sand_10m_0.png',
				imageExtent: CBinputextent0,
				
			})
		})
		DSS.layer.CBSand1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_sand_10m_1.png',
				imageExtent: CBinputextent1,
				
			})
		})
		DSS.layer.CBSand2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_sand_10m_2.png',
				imageExtent: CBinputextent2,
				
			})
		})
		DSS.layer.CBSand3 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_sand_10m_3.png',
				imageExtent: CBinputextent3,
				
			})
		})
		DSS.layer.CBSand4 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_sand_10m_4.png',
				imageExtent: CBinputextent4,
				
			})
		})
		DSS.layer.CBSand5 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_sand_10m_5.png',
				imageExtent: CBinputextent5,
				
			})
		})
		DSS.layer.CBSand6 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_sand_10m_6.png',
				imageExtent: CBinputextent6,
				
			})
		})
		//-------------------------------Clover Belt Silt--------------------------------------------------
		DSS.layer.CBSilt0 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_silt_10m_0.png',
				imageExtent: CBinputextent0,
				
			})
		})
		DSS.layer.CBSilt1 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_silt_10m_1.png',
				imageExtent: CBinputextent1,
				
			})
		})
		DSS.layer.CBSilt2 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_silt_10m_2.png',
				imageExtent: CBinputextent2,
				
			})
		})
		DSS.layer.CBSilt3 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_silt_10m_3.png',
				imageExtent: CBinputextent3,
				
			})
		})
		DSS.layer.CBSilt4 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_silt_10m_4.png',
				imageExtent: CBinputextent4,
				
			})
		})
		DSS.layer.CBSilt5 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_silt_10m_5.png',
				imageExtent: CBinputextent5,
				
			})
		})
		DSS.layer.CBSilt6 = new ol.layer.Image({
			visible: false,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/cloverBelt_silt_10m_6.png',
				imageExtent: CBinputextent6,
				
			})
		})
		//----------------------------------------Output Raster Groups-------------------------------------
		DSS.layer.PLossGroup = new ol.layer.Group({
			visible: true,
			layers:[]
		})
		DSS.layer.erosionGroup = new ol.layer.Group({
			visible: false,
			layers:[]
		})
		DSS.layer.nleachingGroup = new ol.layer.Group({
			visible: false,
			layers:[]
		})
		DSS.layer.runoffGroup = new ol.layer.Group({
			visible: false,
			layers:[]
		})
		DSS.layer.yieldGroup = new ol.layer.Group({
			visible: false,
			layers:[]
		})

		//---------------------------------------
		let fieldLabel = new ol.style.Style({
			text: new ol.style.Text({
				font: '12px Calibri,sans-serif',
				overflow: true,
				fill: new ol.style.Fill({
				  color: '#000',
				}),
				stroke: new ol.style.Stroke({
				  color: '#fff',
				  width: 2,
				}),
			  }),
			zIndex: 0
		});
		//------------------------------------------------
		
		DSS['layerSource'] = {};
		DSS.layerSource['fields'] = new ol.source.Vector({
			format: new ol.format.GeoJSON()
		}); 
		
		var scenario_1SourceMain = new ol.source.Vector({});
		var infrastructure_Source = new ol.source.Vector({});
		var farms_1Source = new ol.source.Vector({});
		//-------------------------------------Scenario Style------------------------
		function scenStyle() {
			if( 1 ==1 ){return scenStyle1}
		}
		var scenStyle1 = new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'rgba(255, 255, 255, 1)',
				width: 40,
			})
		})
		//------------------------------------infra styles and layer-----------------------
		var fenceStyle = new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#bfac32',
				width: 4,
			})
		})
		var laneStyle = new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#bd490f',
				width: 4,
			})
		})
		var waterLineStyle = new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#0072fc',
				width: 4,
			})
		})
		var infraDefaultStyle = new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#ff0825',
				width: 4,
			})
		})
		function infraStyle(feature){
			var infraType = feature.get("infra_type");
			//var fenceMat = feature.get('fence_material');
			if(infraType == 'fl'){
				return fenceStyle
			}
			if(infraType == 'll'){
				return laneStyle
			}
			if(infraType == 'wl'){
				return waterLineStyle
			}
			else{
				return infraDefaultStyle
			}
		};

		DEMExtent = [-10177440, 5490396, -10040090, 5310186]
		console.log("setFieldSource in Main")
		geoServer.setFieldSource()
		geoServer.setFarmSource()
		console.log("setFarmSource in Main.js")
		geoServer.setInfrastructureSource()
		geoServer.setScenariosSource()
		
		//-------------------------------------------------------------------------
		DSS.layer.infrastructure = new ol.layer.Vector({
			title: 'infrastructure',
			visible: false,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: infrastructure_Source,
			style: infraStyle		
		});
		//-------------------------------------------------------------------------
		DSS.farms_1_style = function(feature, resolution) {
			let r = 4.0 - resolution / 94.0;
			if (r < 0) r = 0
			else if (r > 1) r = 1
			// value from 3 to 16
			r = Math.round(Math.pow(r, 3) * 13 + 3)
			return me.DSS_zoomStyles['style' + r];
		}
		DSS.layer.farms_1 = new ol.layer.Vector({
			title: 'farms_1',
			visible: false,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: farms_1Source,
			//style: iconStyle
			style: DSS.farms_1_style
		})
		DSS.layer.scenarios = new ol.layer.Vector({
			title: 'scenarios_2',
			visible: true,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: scenario_1SourceMain,
			style:scenStyle
		})

		//---------------------------------Field layers and style work-------------------------------------
		//Field Labels layer.  Might be assumed by main field layer at some point.
		DSS.layer.fieldsLabels = new ol.layer.Vector({
			minZoom: 14,
			title: 'fieldsLabels',
			visible: false,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: fields_1Source,
			style: function(feature, resolution) {
				fieldLabel.getText().setText(feature.values_.field_name);
				return fieldLabel;
			}
		})
		DSS.layer.fields_1 = new ol.layer.Vector({
			// visible: DSS.layer['crop:visible'],
			// opacity: DSS.layer['crop:opacity'],
			visible: false,
			//opacity: 0.8,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: fields_1Source,
			style: function(feature, resolution) {
				if (feature && feature.getProperties()) {
					let rot = feature.getProperties()['rotation']; 
					if (rot && DSS.rotationStyles[rot]) {
						return DSS.rotationStyles[rot];
					}
				}
			}
		});	
		DSS.test_terrian = new ol.layer.Tile({
			source: new ol.source.Stamen({
				layer: 'terrain'//-background' // terrain/ terrain-labels / terrain-lines
			}),
		}),
		DSS.layer.fieldsLabels
		DSS.map.RotationLayer;

		//--------------------------------------------------------------
		me.map = DSS.map = new ol.Map({
			maxTilesLoading: 100,
			interactions : ol.interaction.defaults({doubleClickZoom :false}),
			target: me.down('#ol_map').getEl().dom,
			layers: [
				DSS.layer.bingAerial,
				//DSS.layer.osm_hybrid,
				DSS.layer.osm_satellite,
				DSS.layer.osm_streets,
				DSS.layer.osm_topo,
				DSS.layer.CBDEM_image0,
				DSS.layer.CBDEM_image1,
				DSS.layer.CBDEM_image2,
				DSS.layer.CBDEM_image3,
				DSS.layer.CBDEM_image4,
				DSS.layer.CBDEM_image5,
				DSS.layer.CBDEM_image6,
				DSS.layer.CBSlope0,
				DSS.layer.CBSlope1,
				DSS.layer.CBSlope2,
				DSS.layer.CBSlope3,
				DSS.layer.CBSlope4,
				DSS.layer.CBSlope5,
				DSS.layer.CBSlope6,
				DSS.layer.CBClay0,
				DSS.layer.CBClay1,
				DSS.layer.CBClay2,
				DSS.layer.CBClay3,
				DSS.layer.CBClay4,
				DSS.layer.CBClay5,
				DSS.layer.CBClay6,
				DSS.layer.CBSilt0,
				DSS.layer.CBSilt1,
				DSS.layer.CBSilt2,
				DSS.layer.CBSilt3,
				DSS.layer.CBSilt4,
				DSS.layer.CBSilt5,
				DSS.layer.CBSilt6,
				DSS.layer.CBSand0,
				DSS.layer.CBSand1,
				DSS.layer.CBSand2,
				DSS.layer.CBSand3,
				DSS.layer.CBSand4,
				DSS.layer.CBSand5,
				DSS.layer.CBSand6,
				DSS.layer.SWDEM_image0,
				DSS.layer.SWDEM_image1,
				DSS.layer.SWDEM_image2,
				DSS.layer.SWDEM_image3,
				DSS.layer.SWSlope0,
				DSS.layer.SWSlope1,
				DSS.layer.SWSlope2,
				DSS.layer.SWSlope3,
				DSS.layer.SWClay0,
				DSS.layer.SWClay1,
				DSS.layer.SWClay2,
				DSS.layer.SWClay3,
				DSS.layer.SWSilt0,
				DSS.layer.SWSilt1,
				DSS.layer.SWSilt2,
				DSS.layer.SWSilt3,
				DSS.layer.SWSand0,
				DSS.layer.SWSand1,
				DSS.layer.SWSand2,
				DSS.layer.SWSand3,
				DSS.layer.NEDEM_image0,
				DSS.layer.NEDEM_image1,
				DSS.layer.NEDEM_image2,
				DSS.layer.NESlope0,
				DSS.layer.NESlope1,
				DSS.layer.NESlope2,
				DSS.layer.NEClay0,
				DSS.layer.NEClay1,
				DSS.layer.NEClay2,
				DSS.layer.NESilt0,
				DSS.layer.NESilt1,
				DSS.layer.NESilt2,
				DSS.layer.NESand0,
				DSS.layer.NESand1,
				DSS.layer.NESand2,
				DSS.layer.ULDEM_image0,
				DSS.layer.ULDEM_image1,
				DSS.layer.ULDEM_image2,
				DSS.layer.ULDEM_image3,
				DSS.layer.ULDEM_image4,
				DSS.layer.ULSlope0,
				DSS.layer.ULSlope1,
				DSS.layer.ULSlope2,
				DSS.layer.ULSlope3,
				DSS.layer.ULSlope4,
				DSS.layer.ULClay0,
				DSS.layer.ULClay1,
				DSS.layer.ULClay2,
				DSS.layer.ULClay3,
				DSS.layer.ULClay4,
				DSS.layer.ULSilt0,
				DSS.layer.ULSilt1,
				DSS.layer.ULSilt2,
				DSS.layer.ULSilt3,
				DSS.layer.ULSilt4,
				DSS.layer.ULSand0,
				DSS.layer.ULSand1,
				DSS.layer.ULSand2,
				DSS.layer.ULSand3,
				DSS.layer.ULSand4,
				DSS.layer.northeastBorder,
				DSS.layer.uplandBorder,
				DSS.layer.cloverBeltBorder,
				DSS.layer.redCedarBorder,
				DSS.layer.pineRiverBorder,
				DSS.layer.kickapoowatershed,
				//DSS.layer.rullandsCouleewshed,
				DSS.layer.tainterwatershed,
				DSS.layer.swwiBorder,
				DSS.layer.scenarios,
				DSS.layer.farms_1,
				DSS.layer.regionLabels,
				DSS.layer.fields_1,
				DSS.layer.erosionGroup,
				DSS.layer.nleachingGroup,
				DSS.layer.PLossGroup,
				DSS.layer.runoffGroup,
				DSS.layer.yieldGroup

				],
				//------------------------------------------------------------------------
			view: new ol.View({
//				center: [-9941844.56,5428891.48],
				center: [-10090575.706307484, 5552204.392540871],
				//10000312.33 5506092.31
				//9,941,844.56W 5,428,891.48N m
				zoom: 8,
				maxZoom: 30,
				minZoom: 4,//10,
			//	constrainRotation: false,
			//	rotation: 0.009,
				//constrainOnlyCenter: false,
				//extent:[-10155160, 5323674, -10065237, 5450767]
				//extent:[ -10168100, 5318380, -10055830, 5454227]
				extent:[-10132000, 5353000, -10103000, 5397000]
			})
		});

		me.map.addControl(new ol.control.ScaleLine({
			bar: true, 
			minwidth: 112,
			units: 'us',
//			units: 'metric'
		}));
//		me.map.addControl(new ol.control.MousePosition({}));
		proj4.defs('urn:ogc:def:crs:EPSG::3071', "+proj=tmerc +lat_0=0 +lon_0=-90 +k=0.9996 +x_0=520000 +y_0=-4480000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
		proj4.defs('EPSG:3071', "+proj=tmerc +lat_0=0 +lon_0=-90 +k=0.9996 +x_0=520000 +y_0=-4480000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
		ol.proj.proj4.register(proj4);	
		
		me.popup = DSS.popupContainer = Ext.create('Ext.Container', {
			minwidth: 200,
			cls: 'popup-eye',
			padding: 8,
			floating: true,
			x: -100, y: -75,
		}).show();
		
		me.overlay = DSS.popupOverlay = new ol.Overlay({
			element: me.popup.getEl().dom,
			autoPan: true,
			offset:[-10,-10],
			autoPanAnimation: {
				duration: 500,
				easing: ol.easing.easeOut
			}
		});
		
		me.map.addOverlay(me.overlay);
		
		me.ol_uid = false;
		
		//-----------------------------------------------------------
		me.map.on('click', function(e) {
			//document.getElementById('info').innerHTML = '';
			let coords = me.map.getEventCoordinate(e.originalEvent);
        var view = me.map.getView();
        var viewResolution = view.getResolution();
		
        console.log(view)
        console.log(viewResolution)
		
        var pixel1 = me.map.getPixelFromCoordinate(coords);
        console.log(pixel1)
			console.log(e, coords, ol.proj.transform(coords, 'EPSG:3857', 'EPSG:3071'));  
			if (DSS.mapClickFunction) DSS.mapClickFunction(e, coords);
		});
	
		//-----------------------------------------------------------
		me.map.on('pointermove', function(e) {
			if (DSS.mouseMoveFunction) {
				DSS.mouseMoveFunction(e);
				return;
			}
		});
		me.drawTools 	= Ext.create('DSS.map.DrawAndModify').instantiate(me.map, fields_1Source);
		
		me.boxModelTool = Ext.create('DSS.map.BoxModel').instantiate(me.map);
		
		me.addMarkerLayer(me.map);
		//me.addWorkAreaMask(me.map);
		me.addSelectionTools(me.map);
		//me.map.addLayer(DSS.layer.fields_1);
		
		me.cropRotationOverlay = Ext.create('DSS.map.RotationLayer').instantiate(me.map);
		me.map.addLayer(DSS.layer.fieldsLabels);
		me.map.addLayer(DSS.layer.infrastructure);
		//Ext.create('DSS.map.LayerMenu')
	},
	
	
	//---------------------------------------------------------------
	addWorkAreaMask: function(map) {
		let spotStyle = new ol.style.Style({
		    stroke: new ol.style.Stroke({
		        color: 'rgba(0, 0, 0, 0.9)',
		        width: 2
		    }),
		    fill: new ol.style.Fill({
			    color: 'rgba(0, 32, 0, 0.8)'
			})
		});

		DSS.layer.mask = new ol.layer.Vector({
			source: new ol.source.Vector(),//{projection: 'EPSG:3071'}),
			style: spotStyle,
			opacity: 0.7,
			// these potentially reduce performance but looks better
			updateWhileAnimating: true, 
			updateWhileInteracting: true
		});	
		
		let multiPoly = [[ 
			[
				[ -10400000, 5100000 ], 
				[ -10400000, 5700000 ], 
				[ -9800000,  5700000 ], 
				[ -9800000,  5100000 ], 
				[ -10400000, 5100000 ] 
			],[ // inner - counter-clockwise
				[ -10168100, 5454227 ], 
				[ -10168100, 5318380 ], 
				[ -10055830, 5318380 ], 
				[ -10055830, 5454227 ], 
				[ -10168100, 5454227 ]
			] 
		]];
		
		var spot = new ol.geom.MultiPolygon(multiPoly);
		DSS.layer.mask.getSource().addFeature(new ol.Feature(spot));
		map.addLayer(DSS.layer.mask);                        
	},
	
	//---------------------------------------------------------------
	addMarkerLayer: function(map) {
		
		let spotStyle = new ol.style.Style({
			image: new ol.style.Circle({
				radius: 14,
			    stroke: new ol.style.Stroke({
			        color: 'white',
			        width: 2
			    }),
			    fill: new ol.style.Fill({
				    color: 'rgba(32, 100, 128, 0.8)'
				})
			})
		});
		
		let markerOverlay = DSS.layer.markers = new ol.layer.Vector({
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: new ol.source.Vector(),
			renderOrder: function(feature1, feature2) {
				let g1 = feature1.getGeometry(), g2 = feature2.getGeometry();
				return g2.getCoordinates()[1] - g1.getCoordinates()[1];
			},
			opacity: 0.9,
			style: function(feature) {
				if (!DSS.markerStyleFunction) {
					return spotStyle;
				}
				else return DSS.markerStyleFunction(feature);
			}
		})
		
		map.addLayer(markerOverlay);
	},
	
	//---------------------------------------------
	addSelectionTools: function(map) {
		const select = DSS.selectionTool = new ol.interaction.Select({
			features: new ol.Collection(),
			toggleCondition: ol.events.condition.never,
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: 'white',
					width: 4
				}),
				fill: new ol.style.Fill({
					color: 'rgba(0,0,0,0)'
				}),
				zIndex: 5
			})
		});
		select.on('select', function(evt) {
			if (DSS.selectionFunction) {
				DSS.selectionFunction(evt);
			}
		});
		
		select.setActive(false);
		map.addInteraction(select);
	}
	
});


//---------------------------------------------------------------
var CanvasLayer = /*@__PURE__*/(function (Layer) {
	
	function CanvasLayer(options) {
		
		Layer.call(this, options);
		this.features = options.features;
		this.svg = d3.select(document.createElement('div')).append('svg').style('position', 'absolute');
		this.svg.append('path').datum(this.features).attr('class', 'boundary');
	}
	
	if (Layer) CanvasLayer.__proto__ = Layer;
	CanvasLayer.prototype = Object.create(Layer && Layer.prototype);
	CanvasLayer.prototype.constructor = CanvasLayer;
	
	CanvasLayer.prototype.getSourceState = function getSourceState () {
		return "ready";//ol.source.State.READY;
	};

	CanvasLayer.prototype.render = function render(frameState) {
		var width = frameState.size[0];
		var height = frameState.size[1];
		var projection = frameState.viewState.projection;
		var d3Projection = d3.geoMercator().scale(1).translate([0, 0]);
		var d3Path = d3.geoPath().projection(d3Projection);
		
		var pixelBounds = d3Path.bounds(this.features);
		var pixelBoundswidth = pixelBounds[1][0] - pixelBounds[0][0];
		var pixelBoundsHeight = pixelBounds[1][1] - pixelBounds[0][1];
		
		var geoBounds = d3.geoBounds(this.features);
		var geoBoundsLeftBottom = ol.proj.fromLonLat(geoBounds[0], projection);
		var geoBoundsRightTop = ol.proj.fromLonLat(geoBounds[1], projection);
		var geoBoundswidth = geoBoundsRightTop[0] - geoBoundsLeftBottom[0];
		if (geoBoundswidth < 0) {
			geoBoundswidth += ol.extent.getwidth(projection.getExtent());
		}
	    var geoBoundsHeight = geoBoundsRightTop[1] - geoBoundsLeftBottom[1];
	
	    var widthResolution = geoBoundswidth / pixelBoundswidth;
	    var heightResolution = geoBoundsHeight / pixelBoundsHeight;
	    var r = Math.max(widthResolution, heightResolution);
	    var scale = r / frameState.viewState.resolution;
	
	    var center = ol.proj.toLonLat(ol.extent.getCenter(frameState.extent), projection);
	    d3Projection.scale(scale).center(center).translate([width / 2, height / 2]);

	    d3Path = d3Path.projection(d3Projection);
	    d3Path(this.features);
	
	    this.svg.attr('width', width);
	    this.svg.attr('height', height);

	    this.svg.select('path').attr('d', d3Path);

	    return this.svg.node();
	};

	return CanvasLayer;
}(ol.layer.Tile));