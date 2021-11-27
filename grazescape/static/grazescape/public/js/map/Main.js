DSS.utils.addStyle('.popup-eye { opacity: 0.9; overflow: visible!important;background-color: #f8f7ef; border-radius: .5rem; border: 1px solid #999; box-shadow: 0 6px 6px rgba(0,0,0,0.5);pointer-events:none; }')
DSS.utils.addStyle('.popup-eye:after { transform: rotate(-45deg); overflow: visible!important; display: block; position: absolute; bottom: -0.32rem; left: calc(100px - 0.32rem); content: ""; background-color: #f8f7ef; width: 0.5rem; height: 0.5rem; border-left: 1px solid #999; border-bottom: 1px solid #999; box-shadow: -6px 6px 6px rgba(0,0,0,0.5) }')

DSS.utils.addStyle('path.boundary { fill: #ff00001f; stroke: red;}');
DSS.utils.addStyle('path.boundary:hover { fill: #ff00005f; stroke: red;}');

DSS.utils.addStyle('.layer-menu {margin: 6px;background:rgba(0,0,0,0.4);border-radius: 4px;padding: 0.23rem; color: #27c; font-size: 1.25rem; cursor: pointer; text-shadow: 0 1px 0 rgba(0,0,0,0.5), -1px 0 rgba(0,0,0,0.3), 0 0 6px rgba(0,0,0,0.4)}');
DSS.utils.addStyle('.layer-menu:hover {background:rgba(0,0,0,0.6);color: #48f; text-shadow: 0 2px 2px rgba(0,0,0,0.8), 1px 0 rgba(0,0,0,0.5), -1px 0 rgba(0,0,0,0.5), 0 0 6px rgba(0,0,0,0.4)}');

let canvas = document.createElement('canvas');
let context = canvas.getContext('2d');
//var hatchPattern = new Image();

//------------------------------------------------------------------------------
Ext.define('DSS.map.Main', {
//------------------------------------------------------------------------------

	extend: 'Ext.Container',//Component',
	alias: 'widget.main_map',
	
	style: 'background-color: rgb(75,80,60)',
	
	BING_KEY: 'Au_ohpV01b_LnpbMExJmpmUnamgty20v7Cpl1GvNmwzZPOezhtzegaNM0MNaSPoa',
	OSM_KEY: '8UmAwNixnmOYWs2lqUpR',
	
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
		//	let mapSize = self.down('#ol_map').getSize();
		//	self.map.setSize([mapSize.width, mapSize.height]);
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
						DSS.MapState.mapResize();
						
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
							Ext.create('DSS.map.LayerMenu').showAt(rect.left-2, rect.top-2);
							//Ext.getCmp('layersMenu').showAt(rect.left-2, rect.top-2);
						}
					});
				}
			}					
		});
		
		setTimeout(function() {
			DSS.LayerButton.showAt(DSS.LayerButton.x,0);
			//Ext.getCmp('DSS.map.LayerMenu').destroy()
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
		//Ext.getCmp('DSS.map.LayerMenu').destroy()
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
		me._cookieInternalHelper("tainterwatershed", "1", 0.6);
		me._cookieInternalHelper("kickapoowatershed", "1", 0.6);
		me._cookieInternalHelper("hillshade", "0", 0.5);
		
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
		
		// Cookie-based settings persistence, when available
		me.manageMapLayerCookies();
		
		//---------------------------------------------------------
		DSS.layer.bingAerial = new ol.layer.Tile({
			visible: DSS.layer['baselayer:visible'] == "1" ? true : false,
			source: new ol.source.BingMaps({
				key: me.BING_KEY,
				imagerySet: 'AerialWithLabels',// can be: Aerial, Road, RoadOnDemand, AerialWithLabels, AerialWithLabelsOnDemand, CanvasDark, OrdnanceSurvey
				hidpi:true,
				maxZoom:18,
				minZoom:11,
			})
		});
		//---------------------------------------------------------
		DSS.layer.bingRoad = new ol.layer.Tile({
			visible: DSS.layer['baselayer:visible'] == "2" ? true : false,
			source: new ol.source.BingMaps({
				key: me.BING_KEY,
				imagerySet: 'Road',  
				maxZoom:18,
				minZoom:11,
			})
		});		
		//--------------------------------------------------------------		
		DSS.layer.osm = new ol.layer.Tile({
			visible: DSS.layer['baselayer:visible'] == "3" ? true : false,
			source: new ol.source.TileJSON({
				url: 'https://api.maptiler.com/tiles/satellite/tiles.json?key=' + me.OSM_KEY,
				tileSize: 256,
				crossOrigin: 'anonymous'
			})
		})	;	
		//--------------------------------------------------------------		
		DSS.layer.tainterwatershed = new ol.layer.Vector({
			visible: DSS.layer['tainterwatershed:visible'],
			opacity: DSS.layer['tainterwatershed:opacity'],
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
			visible: DSS.layer['kickapoowatershed:visible'],
			opacity: DSS.layer['kickapoowatershed:opacity'],
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
		var mrextent = [-10135469.3149,5405765.3492,-10135319.3149,5406075.3492];

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
		inputextent0 = [ -10168109.314900, 5318375.349200, -10111969.314900, 5386305.349200]
		inputextent1 = [ -10111969.314900, 5318375.349200, -10055829.314900, 5386305.349200]
		inputextent2 = [ -10168109.314900, 5386305.349200, -10111969.314900, 5454235.349200]
		inputextent3 = [ -10111969.314900, 5386305.349200, -10055829.314900, 5454235.349200]
		//--------------------DEM-----------------------------
		DSS.layer.DEM_image0 = new ol.layer.Image({
			visible: false,
			opacity: 0.7,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/SW_DEM_PNG_1122_0.PNG',
				imageExtent: inputextent0,
			})
		}),
		DSS.layer.DEM_image1 = new ol.layer.Image({
			visible: false,
			opacity: 0.7,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/SW_DEM_PNG_1122_1.PNG',
				imageExtent: inputextent1,
			})
		}),
		DSS.layer.DEM_image2 = new ol.layer.Image({
			visible: false,
			opacity: 0.7,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/SW_DEM_PNG_1122_2.PNG',
				imageExtent: inputextent2,
				
			})
		}),
		DSS.layer.DEM_image3 = new ol.layer.Image({
			visible: false,
			opacity: 0.7,
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/SW_DEM_PNG_1122_3.PNG',
				imageExtent: inputextent3,
				
			})
		})
		//----------------------------SLOPE----------------------------------------------------
		DSS.layer.Slope0 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_slopePer_10m_0.PNG',
				imageExtent: inputextent0,
			})
		}),
		DSS.layer.Slope1 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_slopePer_10m_1.PNG',
				imageExtent: inputextent1,
			})
		}),
		DSS.layer.Slope2 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_slopePer_10m_2.PNG',
				imageExtent: inputextent2,
				
			})
		}),
		DSS.layer.Slope3 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_slopePer_10m_3.PNG',
				imageExtent: inputextent3,
				
			})
		})
		//-------------------------------------------CLAY---------------------------------------------------
		DSS.layer.Clay0 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_clay_10m_0.PNG',
				imageExtent: inputextent0,
			})
		}),
		DSS.layer.Clay1 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_clay_10m_1.PNG',
				imageExtent: inputextent1,
			})
		}),
		DSS.layer.Clay2 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_clay_10m_2.PNG',
				imageExtent: inputextent2,
				
			})
		}),
		DSS.layer.Clay3 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_clay_10m_3.PNG',
				imageExtent: inputextent3,
				
			})
		})
		//-------------------------------------SILT-------------------------------------------
		DSS.layer.Silt0 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_silt_10m_0.PNG',
				imageExtent: inputextent0,
			})
		}),
		DSS.layer.Silt1 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_silt_10m_1.PNG',
				imageExtent: inputextent1,
			})
		}),
		DSS.layer.Silt2 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_silt_10m_2.PNG',
				imageExtent: inputextent2,
				
			})
		}),
		DSS.layer.Silt3 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_silt_10m_3.PNG',
				imageExtent: inputextent3,
				
			})
		})
		//-------------------------------------SAND---------------------------------------
		DSS.layer.Sand0 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_sand10m_1.PNG',
				imageExtent: inputextent0,
			})
		}),
		DSS.layer.Sand1 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_sand10m_1.PNG',
				imageExtent: inputextent1,
			})
		}),
		DSS.layer.Sand2 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_sand10m_1.PNG',
				imageExtent: inputextent2,
				
			})
		}),
		DSS.layer.Sand3 = new ol.layer.Image({
			visible: false,
			
			source:
			new ol.source.ImageStatic({
				url: 'https://storage.googleapis.com/grazescaperasterstorage/southWestWI_sand10m_1.PNG',
				imageExtent: inputextent3,
				
			})
		})
		//var DEMExtent = [-10120149.3149, 5378545.3492, -10119939.3149, 5378745.3492]
		//var DEMExtent = [ -10168100, 5318380, -10055830, 5454227];
		//var DEMExtent = [ -10168109.314900, 5318375.349200, -10111969.314900, 5386305.349200];
		// DSS.layer.DEMGroup = new ol.layer.Group({
		// 	layers:[
		// 		DSS.layer.DEM_image0 = new ol.layer.Image({
		// 			source:
		// 			new ol.source.ImageStatic({
		// 				url: 'https://storage.googleapis.com/grazescaperasterstorage/SW_DEM_PNG_1122_0.PNG',
		// 				imageExtent: [ -10168109.314900, 5318375.349200, -10111969.314900, 5386305.349200],
		// 				projection: 'EPSG:3857',
						
		// 			})
		// 		}),
		// 		DSS.layer.DEM_image1 = new ol.layer.Image({
		// 			source:
		// 			new ol.source.ImageStatic({
		// 				url: 'https://storage.googleapis.com/grazescaperasterstorage/SW_DEM_PNG_1122_1.PNG',
		// 				imageExtent: [ -10111969.314900, 5318375.349200, -10055829.314900, 5386305.349200],
		// 				projection: 'EPSG:3857',
						
		// 			})
		// 		}),
		// 		DSS.layer.DEM_image2 = new ol.layer.Image({
		// 			source:
		// 			new ol.source.ImageStatic({
		// 				url: 'https://storage.googleapis.com/grazescaperasterstorage/SW_DEM_PNG_1122_2.PNG',
		// 				imageExtent: [ -10168109.314900, 5386305.349200, -10111969.314900, 5454235.349200],
		// 				projection: 'EPSG:3857',
		// 			})
		// 		}),
		// 		DSS.layer.DEM_image3 = new ol.layer.Image({
					
		// 			source:
		// 			new ol.source.ImageStatic({
		// 				url: 'https://storage.googleapis.com/grazescaperasterstorage/SW_DEM_PNG_1122_3.PNG',
		// 				imageExtent: [ -10111969.314900, 5386305.349200, -10055829.314900, 5454235.349200],
		// 				projection: 'EPSG:3857',
		// 			})
		// 		})
		// 	]
		// })
		var pointStyle = new ol.style.Style({
			image: new ol.style.Circle({
			  radius: 7,
			  stroke: new ol.style.Stroke({
					color: 'orange',
					width: 1
			  }),
			  fill: new ol.style.Fill({
					color: '#ffe4b3'
			  })
			})
		});
		var getText = function(feature, resolution) {
			var text =feature.get('field_name');
			return text;
		}
		var createTextStyle = function(feature,resolution){
			return new ol.style.Text({
				text: getText(feature, resolution),
				font: '12px Calibri,sans-serif',
				overflow: true,
				fill: new ol.style.Fill({
				  color: '#000',
				}),
				stroke: new ol.style.Stroke({
				  color: '#fff',
				  width: 3,
				}),
			  })
		}

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
		let defaultFieldStyle = new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'rgba(255,200,32,0.8)',
				width: 5
			}),
			fill: new ol.style.Fill({
				color: 'rgba(0,0,0,0.5)',
			}),
			zIndex: 0
		});
		
		DSS['layerSource'] = {};
		DSS.layerSource['fields'] = new ol.source.Vector({
			format: new ol.format.GeoJSON()
		}); 
		
		var scenario_1SourceMain = new ol.source.Vector({});
		var infrastructure_Source = new ol.source.Vector({});
		var farms_1Source = new ol.source.Vector({});
		//var DEMSource = new ol.source.ImageStatic({});
		//var DEMSource = new ol.source.ImageWMS({});
		
		//var fields_1Source = new ol.source.Vector({});

		// var fields_1Source = new ol.source.Vector({
		// 	format: new ol.format.GeoJSON(),
		// 	url: function(extent) {
		// 		return geoserverURL + '/geoserver/wfs?'+
		// 		'service=wfs&'+
		// 		'?version=2.0.0&'+
		// 		'request=GetFeature&'+
		// 		'typeName=GrazeScape_Vector:field_2&' +
		// 		//'CQL_filter=scenario_id='+DSS.activeScenario+'&'+
		// 		'outputformat=application/json&'+
		// 		'srsname=EPSG:3857';
		// 	},
		// });
		//-------------------------------------Scenario Style------------------------
		function scenStyle() {
			if( 1 ==1 ){return scenStyle1}
		}
		var scenStyle1 = new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'rgba(255, 255, 255, 1)',
				width: 10,
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
		function infraStyle(feature, resolution){
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
		geoServer.setFieldSource()
		geoServer.setFarmSource()
//		geoServer.setInfrastructureSource()
		geoServer.setScenariosSource()
		//geoServer.setDEMSource()

		
		//-------------------------------------------------------------------------
		DSS.layer.infrastructure = new ol.layer.Vector({
			title: 'infrastructure',
			visible: true,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: infrastructure_Source,
			style: infraStyle		
		});
		//-------------------------------------------------------------------------
		DSS.layer.farms_1 = new ol.layer.Vector({
			title: 'farms_1',
			visible: true,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: farms_1Source,
			style: function(feature, resolution) {
				let r = 1.0 - resolution / 94.0;
				if (r < 0) r = 0
				else if (r > 1) r = 1
				// value from 3 to 16
				r = Math.round(Math.pow(r, 3) * 13 + 3)
				return me.DSS_zoomStyles['style' + r];
			}
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
			visible: true,
			updateWhileAnimating: true,
			updateWhileInteracting: true,
			source: fields_1Source,
//			source: '',
			style: function(feature, resolution) {
				fieldLabel.getText().setText(feature.values_.field_name);
				return fieldLabel;
			}
		})
		DSS.layer.fields_1 = new ol.layer.Vector({
			visible: DSS.layer['crop:visible'],
			opacity: DSS.layer['crop:opacity'],
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
      //		set sources of the major layers
//        geoServer.setFieldSource()
//		geoServer.setFarmSource()
//		geoServer.setInfrastructureSource()
//		geoServer.setScenariosSource()

		DSS.layer.fieldsLabels
		DSS.map.RotationLayer;


		//--------------------------------------------------------------
		me.map = DSS.map = new ol.Map({
			maxTilesLoading: 100,
			target: me.down('#ol_map').getEl().dom,
			layers: [
				DSS.layer.osm,
				DSS.layer.DEM_image0,
				DSS.layer.DEM_image1,
				DSS.layer.DEM_image2,
				DSS.layer.DEM_image3,
				DSS.layer.Slope0,
				DSS.layer.Slope1,
				DSS.layer.Slope2,
				DSS.layer.Slope3,
				DSS.layer.Clay0,
				DSS.layer.Clay1,
				DSS.layer.Clay2,
				DSS.layer.Clay3,
				DSS.layer.Silt0,
				DSS.layer.Silt1,
				DSS.layer.Silt2,
				DSS.layer.Silt3,
				DSS.layer.Sand0,
				DSS.layer.Sand1,
				DSS.layer.Sand2,
				DSS.layer.Sand3,
				DSS.layer.kickapoowatershed,
				DSS.layer.rullandsCouleewshed,
				DSS.layer.tainterwatershed,
				DSS.layer.scenarios,
				DSS.layer.farms_1,
				],
				//------------------------------------------------------------------------


			view: new ol.View({
				center: [-10112582,5392087],
				zoom: 12,
				maxZoom: 18,
				minZoom: 8,//10,
			//	constrainRotation: false,
			//	rotation: 0.009,
				constrainOnlyCenter: false,
				//extent:[-10155160, 5323674, -10065237, 5450767]
				extent:[ -10168100, 5318380, -10055830, 5454227]
			})
		});

		me.map.addControl(new ol.control.ScaleLine({
			bar: true, 
			minwidth: 112,
			units: 'us',
//			units: 'metric'
		}));
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
		//const demVal = DSS.layer.DEM_image.getFeatureInfo
		var value = {};
		// const demVal = DEMSource.getFeatureInfoUrl(
		// 	e.coordinate,
		// 	viewResolution,
		// 	'EPSG:3857',
		// 	{'INFO_FORMAT': 'application/json'}
		//    );
		//    if(demVal){
		//  	 fetch(demVal)
		// // 	  response = fetch(demVal)
		//  	  //console.log(demVal)
		// // 	  console.log(response)
		// // 	  value = response.getElementById("featureInfo").innerHTML;
		// // 	  console.log(value);
		// 	//   var value =  	''
		// 	   .then(response => response.json())
		// 	   .then((out) => {
		// 		console.log('Output: ', out.features[0].properties.GRAY_INDEX);
		// 		value = out.features[0].properties.GRAY_INDEX
		// 		console.log(value)
		// }).catch(err => console.error(err));
		// 	   //.then((html) => console.log(html)
		// 	// 	value = html;
		// 	//document.getElementById('info').innerHTML = html;
		// 	 //  );
			 
		// }
        //var source = DSS.layer.untiled.get('visible') ? DSS.layer.untiled.getSource() : tiled.getSource();
        console.log(view)
        console.log(viewResolution)
		//console.log(demVal.getElementByClass("featureInfo"))
		
		//console.log(demVal)




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
		me.addWorkAreaMask(me.map);
		me.addSelectionTools(me.map);
		//me.map.addLayer(DSS.layer.fields_1);
		
		me.cropRotationOverlay = Ext.create('DSS.map.RotationLayer').instantiate(me.map);
		me.map.addLayer(DSS.layer.fieldsLabels);
		me.map.addLayer(DSS.layer.infrastructure);
		//Ext.create('DSS.map.LayerMenu')
	},
	
	
	//---------------------------------------------------------------
	addWorkAreaMask: function(map) {
		let me = this;
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
	    //console.log(spot);
		DSS.layer.mask.getSource().addFeature(new ol.Feature(spot));
		map.addLayer(DSS.layer.mask);                        
	},
	
	//---------------------------------------------------------------
	addMarkerLayer: function(map) {
		
		let spotStyle = new ol.style.Style({
			image: new ol.style.Circle({
				radius: 8,
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