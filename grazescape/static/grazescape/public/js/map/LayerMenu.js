var soilColorArray = ['rgba(0,0,0,1)','rgba(51,51,51,1)','rgba(102,102,102,1)','rgba(153,153,153,1)','rgba(204,204,204,1)','rgba(255,255,255,1)']
var soilValueArray =[0,20,40,60,80,100]
//[0,20,40,60,80,100]

var DEMColorArray = ['rgba(0,0,0,1)','rgba(51,51,51,1)','rgba(102,102,102,1)','rgba(153,153,153,1)','rgba(204,204,204,1)','rgba(255,255,255,1)']
var DEMValueArray =[600,770,940,1110,1280,1450]
var DEMBool = false
var SlopeBool = false
var ClayBool = false
var SiltBool = false
var SandBool = false


function downloadRaster(layer){
	var extents = DSS.map.getView().calculateExtent(DSS.map.getSize())
	console.log(extents)
	geoServer.makeRasterRequest(layer,extents)
	console.log('Ran DEM pull from frontend')
	// DSS.layer.DEM_image.setSource('/data_files/raster_layers/elevation/elevation.tif')
	// DSS.layer.DEM_image.setVisible(self.checked);
	//DSS.layer.DEM_image.getSource().refresh()
}
function newLayerItems(mfieldID){
	console.log('Hello world!!!')
	DSS.map.getLayers().forEach(async function (layer){
		console.log(layer);
		if(layer.values_.name == 'DSS.layer.ploss_field_'+ mfieldID){
			varploss_field_layer = layer
		
		var menuItem = Ext.ComponentQuery.query('radiogroup')
		console.log(menuItem)
		console.log(this)
		}
		
	});
}
//------------------------------------------------------------------------------
Ext.define('DSS.map.LayerMenu', {
//------------------------------------------------------------------------------
	extend: 'Ext.menu.Menu',
	alias: 'widget.map_layer_menu',
	alternateClassName: 'DSS.LayerMenu',
	header: {
		style: 'background: rgba(200,200,200,0.9)',
		padding: 2
	},
	//closeAction: DSS.MapState.destroyLegend(),//Ext.getCmp('layersMenu').destroy(),
	closable: true,
	//collapsible: true,
	plain: true,
	width: 160,
	//--------------------------------------------------------------------------
	initComponent: function() {
		
		let me = this;
		
		let makeOpacityMenu = function(key, openLayersLayer, minValue) {
			minValue = minValue || 20;
			return {
                width: 150,
                plain: true,
            	listeners: {
            		show: function(menu) {
            			menu.down('#dss-slider').setValue(openLayersLayer.getOpacity() * 100, false);
            			menu.setY(menu.getY() - 29);
            			menu.setX(menu.getX() - 20);
            		},
            	},                    
                items: [{
    				xtype: 'menuitem',
    				text: 'Opacity', disabled: true,
    				style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 3px'
                },{
                	xtype: 'slider',
                	itemId: 'dss-slider',
                    padding: '0 8 6 8',
                	hideEmptyLabel: true,
                	increment: 10,
                	value: 60,
                	minValue: minValue, 
                	maxValue: 100,
                	listeners: {
                		focusleave: function(self) {
                			console.log("leave!")
                		},
                		dragstart: function(slider) {
                			
                		},
                		change: function(slider, newValue, thumb, eOpts) {
                			const val = newValue / 100.0;
                			openLayersLayer.setOpacity(val)
                        	Ext.util.Cookies.set(key + ":opacity", "" + val);
                		}	                		
                	}
                }]
            }			
		};
		let matrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);
		let appendTextureMenu = function(baseMenu) {
		
			baseMenu.items.push({
				xtype: 'menuitem',
				text: 'Pattern Scale', disabled: true,
				style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px',
			},{
            	xtype: 'slider',
            	itemId: 'dss-slider2',
                padding: '0 10 8 10',
            	hideEmptyLabel: true,
            	decimalPrecision: 2,
            	keyIncrement: 0.05,
            	increment: 0.05,
            	value: matrix.a,
            	minValue: 0.2,
            	maxValue: 2,
            	listeners: {
            		change: function(slider, newValue, thumb, eOpts) {
            			matrix.a = matrix.d = newValue;
            			Ext.Object.eachValue(DSS.rotationStyles, function(val) {
            				val.getFill().getColor().setTransform(matrix);
            			});
            			DSS.layer.fields_1.changed();
            		}	                		
            	}
			},{
				xtype: 'menuitem',
				text: 'Pattern Offset X', disabled: true,
				style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px'
			},{
            	xtype: 'slider',
            	itemId: 'dss-slider3',
                padding: '0 10 8 10',
            	hideEmptyLabel: true,
            	keyIncrement: 5,
            	increment: 5,
            	value: matrix.e,
            	minValue: 0, 
            	maxValue: 200,
            	listeners: {
            		change: function(slider, newValue, thumb, eOpts) {
            			matrix.e = newValue;
            			Ext.Object.eachValue(DSS.rotationStyles, function(val) {
            				val.getFill().getColor().setTransform(matrix);
            			});
            			DSS.layer.fields_1.changed();
            		}	                		
            	}
			},{
				xtype: 'menuitem',
				text: 'Pattern Offset Y', disabled: true,
				style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px'
			},{
            	xtype: 'slider',
            	itemId: 'dss-slider4',
                padding: '0 10 8 10',
            	hideEmptyLabel: true,
            	keyIncrement: 5,
            	increment: 5,
            	value: matrix.f,
            	minValue: 0, 
            	maxValue: 100,
            	listeners: {
            		change: function(slider, newValue, thumb, eOpts) {
            			matrix.f = newValue;
            			Ext.Object.eachValue(DSS.rotationStyles, function(val) {
            				val.getFill().getColor().setTransform(matrix);
            			});
            			DSS.layer.fields_1.changed();
            		}	                		
            	}
				
			});
			return baseMenu;
		};
		
		let tMen = makeOpacityMenu("crop", DSS.layer.fields_1);
		//tMen = appendTextureMenu(tMen, DSS.layer.fields_1);
		
		Ext.applyIf(me, {
			defaults: {
				xtype: 'menucheckitem',
				padding: 2,
                hideOnClick: false,
			},
			items: [
			// 	{ //-------------------------------------------
			// 	xtype: 'menuitem',
			// 	text: 'Overlays', 
			// 	disabled: true,
			// 	style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px; background-color: #ccc'
			// },
			// { //-------------------------------------------
			// 	text: 'Fields <i class="fas fa-seedling accent-text text-drp-50"></i>',
            //     checked: true,
            //     menu: tMen,//makeOpacityMenu("crop", DSS.layer.fields_1),
            //     listeners: {
            //     	afterrender: function(self) {
            //     		self.setChecked(DSS.layer.fields_1.getVisible());
            //     	}
            //     },
            //     handler: function(self) {
            //     	Ext.util.Cookies.set("crop:visible", self.checked ? "1" : "0");                	
            //     	DSS.layer.fields_1.setVisible(self.checked);                    	
            //     }
			// },
			{ //-------------------------------------------
				xtype: 'menuitem',
				text: 'Watersheds', 
				disabled: true,
				style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px; background-color: #ccc'
			},{ //-------------------------------------------
				text: 'Tainter Creek',
                checked: true,
                //menu: makeOpacityMenu("tainterwatershed", DSS.layer.tainterwatershed),
                listeners: {
                	afterrender: function(self) {
                		self.setChecked(DSS.layer.tainterwatershed.getVisible());
                	}
                },
                handler: function(self) {
                	Ext.util.Cookies.set("tainterwatershed:visible", self.checked ? "1" : "0");                	
                	DSS.layer.tainterwatershed.setVisible(self.checked);                    	
                }
			},{ //-------------------------------------------
				text: 'Rulland Coulee',
                checked: true,
                //menu: makeOpacityMenu("rullandsCouleewshed", DSS.layer.rullandsCouleewshed),
                listeners: {
                	afterrender: function(self) {
                		self.setChecked(DSS.layer.rullandsCouleewshed.getVisible());
                	}
                },
                handler: function(self) {
                	Ext.util.Cookies.set("rullandsCouleewshed:visible", self.checked ? "1" : "0");                	
                	DSS.layer.rullandsCouleewshed.setVisible(self.checked);                    	
                }
			},{ //-------------------------------------------
				text: 'Kickapoo',
                checked: true,
                //menu: makeOpacityMenu("kickapoowatershed", DSS.layer.kickapoowatershed),
                listeners: {
                	afterrender: function(self) {
                		self.setChecked(DSS.layer.kickapoowatershed.getVisible());
                	}
                },
                handler: function(self) {
                	Ext.util.Cookies.set("kickapoowatershed:visible", self.checked ? "1" : "0");                	
                	DSS.layer.kickapoowatershed.setVisible(self.checked);                    	
                }
			},
			// { //-------------------------------------------
			// 	text: 'Hillshade',					
            //     checked: false,
            //     menu: makeOpacityMenu("hillshade", DSS.layer.hillshade, 30),
            //     listeners: {
            //     	afterrender: function(self) {
            //     		self.setChecked(DSS.layer.hillshade.getVisible());
            //     	}
            //     },
            //     handler: function(self) {
            //     	Ext.util.Cookies.set("hillshade:visible", self.checked ? "1" : "0");                	
            //     	DSS.layer.hillshade.setVisible(self.checked);                    	
            //     }
			// },
			{//-----------------------------------------------------------------
				xtype: 'menuitem',
				text: 'Model Input Overlays', disabled: true,
				style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px; background-color: #ccc'
			},
			{
				xtype: 'radiogroup',
					columns: 1, 
					vertical: true,
					collapsible: true,
					defaults: {
						padding: '2 0',
						group: 'input-layer'
					},
					items: [
						{
							boxLabel: 'Elevation',
							listeners:{change: function(checked)
								{
									if(this.checked){
										if(DEMBool == false){
											DSS.MapState.destroyLegend();
											DEM0Source = DSS.layer.DEM_image0.getSource()
											DEM1Source = DSS.layer.DEM_image1.getSource()
											DEM2Source = DSS.layer.DEM_image2.getSource()
											DEM3Source = DSS.layer.DEM_image3.getSource()
											console.log(DEM2Source.getState())
											DSS.layer.DEM_image2.setVisible(checked)
											DSS.MapState.showContinuousLegend(DEMColorArray, DEMValueArray);
											DEM2Source.on('imageloadend', function(){
												console.log('HI FROM DEM IMAGE 2')
												DSS.layer.DEM_image3.setVisible(checked);
												DEM3Source.on('imageloadend', function(){
													DSS.layer.DEM_image0.setVisible(checked);
													DEM0Source.on('imageloadend', function(){
														DSS.layer.DEM_image1.setVisible(checked);
													})
												})
											})
											DEMBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.DEM_image2.setVisible(checked)
											DSS.layer.DEM_image3.setVisible(checked)
											DSS.layer.DEM_image0.setVisible(checked)
											DSS.layer.DEM_image1.setVisible(checked)
											DSS.MapState.showContinuousLegend(DEMColorArray, DEMValueArray);
										}
										//console.log(dss.layer.DEM_image2.getSource())
									}else{
										DSS.layer.DEM_image2.setVisible(false)
										DSS.layer.DEM_image3.setVisible(false)
										DSS.layer.DEM_image0.setVisible(false)
										DSS.layer.DEM_image1.setVisible(false)
									}
								}
							}
						},{
							boxLabel: 'Slope',
							listeners:{change: function(checked)
								{
									if(this.checked){
										if(SlopeBool == false){
											DSS.MapState.destroyLegend();
											Slope0Source = DSS.layer.Slope0.getSource()
											Slope1Source = DSS.layer.Slope1.getSource()
											Slope2Source = DSS.layer.Slope2.getSource()
											Slope3Source = DSS.layer.Slope3.getSource()
											console.log(Slope2Source.getState())
											DSS.layer.Slope2.setVisible(checked)
											DSS.MapState.showContinuousLegend(DEMColorArray, DEMValueArray);
											Slope2Source.on('imageloadend', function(){
												console.log('HI FROM Slope IMAGE 2')
												DSS.layer.Slope3.setVisible(checked);
												Slope3Source.on('imageloadend', function(){
													DSS.layer.Slope0.setVisible(checked);
													Slope0Source.on('imageloadend', function(){
														DSS.layer.Slope1.setVisible(checked);
													})
												})
											})
											SlopeBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.Slope2.setVisible(checked)
											DSS.layer.Slope3.setVisible(checked)
											DSS.layer.Slope0.setVisible(checked)
											DSS.layer.Slope1.setVisible(checked)
											DSS.MapState.showContinuousLegend(DEMColorArray, DEMValueArray);
										}
										//console.log(dss.layer.Slope_image2.getSource())
									}else{
										DSS.layer.Slope2.setVisible(false)
										DSS.layer.Slope3.setVisible(false)
										DSS.layer.Slope0.setVisible(false)
										DSS.layer.Slope1.setVisible(false)
									}
								}
							}
						},
						{
							boxLabel: 'Clay',
							listeners:{change: function(checked)
								{
									if(this.checked){
										if(ClayBool == false){
											DSS.MapState.destroyLegend();
											Clay0Source = DSS.layer.Clay0.getSource()
											Clay1Source = DSS.layer.Clay1.getSource()
											Clay2Source = DSS.layer.Clay2.getSource()
											Clay3Source = DSS.layer.Clay3.getSource()
											console.log(Clay2Source.getState())
											DSS.layer.Clay2.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray);
											Clay2Source.on('imageloadend', function(){
												console.log('HI FROM Clay IMAGE 2')
												DSS.layer.Clay3.setVisible(checked);
												Clay3Source.on('imageloadend', function(){
													DSS.layer.Clay0.setVisible(checked);
													Clay0Source.on('imageloadend', function(){
														DSS.layer.Clay1.setVisible(checked);
													})
												})
											})
											ClayBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.Clay2.setVisible(checked)
											DSS.layer.Clay3.setVisible(checked)
											DSS.layer.Clay0.setVisible(checked)
											DSS.layer.Clay1.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray);
										}
										//console.log(dss.layer.Clay_image2.getSource())
									}else{
										DSS.layer.Clay2.setVisible(false)
										DSS.layer.Clay3.setVisible(false)
										DSS.layer.Clay0.setVisible(false)
										DSS.layer.Clay1.setVisible(false)
									}
								}
							}
						},
						{
							boxLabel: 'Silt',
							//DSS_layer: 'bing-aerial',
							listeners:{change: function(checked)
								{
									if(this.checked){
										if(SiltBool == false){
											DSS.MapState.destroyLegend();
											Silt0Source = DSS.layer.Silt0.getSource()
											Silt1Source = DSS.layer.Silt1.getSource()
											Silt2Source = DSS.layer.Silt2.getSource()
											Silt3Source = DSS.layer.Silt3.getSource()
											console.log(Silt2Source.getState())
											DSS.layer.Silt2.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray);
											Silt2Source.on('imageloadend', function(){
												console.log('HI FROM Silt IMAGE 2')
												DSS.layer.Silt3.setVisible(checked);
												Silt3Source.on('imageloadend', function(){
													DSS.layer.Silt0.setVisible(checked);
													Silt0Source.on('imageloadend', function(){
														DSS.layer.Silt1.setVisible(checked);
													})
												})
											})
											SiltBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.Silt2.setVisible(checked)
											DSS.layer.Silt3.setVisible(checked)
											DSS.layer.Silt0.setVisible(checked)
											DSS.layer.Silt1.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray);
										}
										//console.log(dss.layer.Silt_image2.getSource())
									}else{
										DSS.layer.Silt2.setVisible(false)
										DSS.layer.Silt3.setVisible(false)
										DSS.layer.Silt0.setVisible(false)
										DSS.layer.Silt1.setVisible(false)
									}
								}
							}
						},
						{
							boxLabel: 'Sand',
							//DSS_layer: 'bing-aerial',
							listeners:{change: function(checked)
								{
									console.log(checked);
									if(this.checked){
									console.log(SandBool)
										if(SandBool == false){
											DSS.MapState.destroyLegend();
											Sand0Source = DSS.layer.Sand0.getSource()
											Sand1Source = DSS.layer.Sand1.getSource()
											Sand2Source = DSS.layer.Sand2.getSource()
											Sand3Source = DSS.layer.Sand3.getSource()
											console.log(Sand2Source.getState())
											DSS.layer.Sand2.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray);
											Sand2Source.on('imageloadend', function(){
												console.log('HI FROM Sand IMAGE 2')
												DSS.layer.Sand3.setVisible(checked);
												Sand3Source.on('imageloadend', function(){
													DSS.layer.Sand0.setVisible(checked);
													Sand0Source.on('imageloadend', function(){
														DSS.layer.Sand1.setVisible(checked);
														SandBool = true
													})
												})
											})
											SandBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.Sand2.setVisible(checked)
											DSS.layer.Sand3.setVisible(checked)
											DSS.layer.Sand0.setVisible(checked)
											DSS.layer.Sand1.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray);
										}
										//console.log(dss.layer.Sand_image2.getSource())
									}else{
										DSS.layer.Sand2.setVisible(false)
										DSS.layer.Sand3.setVisible(false)
										DSS.layer.Sand0.setVisible(false)
										DSS.layer.Sand1.setVisible(false)
									}
								}
							}
						},{ 
							boxLabel: 'No Input Overlay', 
							text: 'No Overlay',
							DSS_layer: 'bing-aerial',
							listeners:{change: function(checked)
								{
									if(this.checked){
										console.log(this.checked)
										DSS.MapState.destroyLegend();
										DSS.layer.DEM_image0.setVisible(false);
										DSS.layer.DEM_image1.setVisible(false);
										DSS.layer.DEM_image2.setVisible(false);
										DSS.layer.DEM_image3.setVisible(false);
										DSS.layer.Slope0.setVisible(false);
										DSS.layer.Slope1.setVisible(false);
										DSS.layer.Slope2.setVisible(false);
										DSS.layer.Slope3.setVisible(false);
										DSS.layer.Clay0.setVisible(false);
										DSS.layer.Clay1.setVisible(false);
										DSS.layer.Clay2.setVisible(false);
										DSS.layer.Clay3.setVisible(false);
										DSS.layer.Sand0.setVisible(false);
										DSS.layer.Sand1.setVisible(false);
										DSS.layer.Sand2.setVisible(false);
										DSS.layer.Sand3.setVisible(false);
										DSS.layer.Silt0.setVisible(false);
										DSS.layer.Silt1.setVisible(false);
										DSS.layer.Silt2.setVisible(false);
										DSS.layer.Silt3.setVisible(false);
									}
								}
							}
						},
					]
			},
			{
				xtype: 'menuitem',
				text: 'Overlay Opacity', disabled: false,
				style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px'
			},{
				xtype: 'slider',
				itemId: 'dss-slider',
				padding: '0 10 8 10',
				hideEmptyLabel: true,
				increment: 10,
				value: 60,
				minValue: 0, 
				maxValue: 100,
				listeners: {
					focusleave: function(self) {
						console.log("leave!")
					},
					dragstart: function(slider) {
						
					},
					change: function(slider, newValue, thumb, eOpts) {
						const val = newValue / 100.0;
						DSS.layer.DEM_image0.setOpacity(val)
						DSS.layer.DEM_image1.setOpacity(val)
						DSS.layer.DEM_image2.setOpacity(val)
						DSS.layer.DEM_image3.setOpacity(val)
						DSS.layer.Slope0.setOpacity(val)
						DSS.layer.Slope1.setOpacity(val)
						DSS.layer.Slope2.setOpacity(val)
						DSS.layer.Slope3.setOpacity(val)
						DSS.layer.Clay0.setOpacity(val)
						DSS.layer.Clay1.setOpacity(val)
						DSS.layer.Clay2.setOpacity(val)
						DSS.layer.Clay3.setOpacity(val)
						DSS.layer.Sand0.setOpacity(val)
						DSS.layer.Sand1.setOpacity(val)
						DSS.layer.Sand2.setOpacity(val)
						DSS.layer.Sand3.setOpacity(val)
						DSS.layer.Silt0.setOpacity(val)
						DSS.layer.Silt1.setOpacity(val)
						DSS.layer.Silt2.setOpacity(val)
						DSS.layer.Silt3.setOpacity(val)
						//Ext.util.Cookies.set(key + ":opacity", "" + val);
					}	                		
				}
			},
			{//-----------------------------------------------------------------
				xtype: 'menuitem',
				text: 'Base Layers', disabled: true,
				style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px; background-color: #ccc'
			},
		// 	{ //-------------------------------------------
		// 		xtype: 'menucheckitem',
		// 		padding: 2,
        //         hideOnClick: false,
		// 		text: 'Base Map',
        //         checked: true,
        //         //menu: makeOpacityMenu("kickapoowatershed", DSS.layer.kickapoowatershed),
        //         // listeners:{
		// 		// 	afterrender: function(self) {
		// 		// 		self.setChecked(DSS.layer.osm_hybrid.getVisible());
		// 		// 	},
		// 		// },
		// 		handler: function(self){
		// 			DSS.layer.osm_hybrid.setVisible(self.checked);             	
        //     },
		// },
			{
				xtype: 'radiogroup',
				columns: 1, 
				vertical: true,
				defaults: {
					padding: '2 0',
					group: 'base-layer'
				},
				items: [
				{
					boxLabel: 'Hybrid',
					listeners:{change: function(checked)
						{
							if(this.checked){
								console.log(this.checked)
								DSS.layer.osm_hybrid.setVisible(true);
								DSS.layer.osm_streets.setVisible(false);
								DSS.layer.osm_topo.setVisible(false);
								DSS.layer.osm_satelite.setVisible(false);
								DSS.layer.bingAerial.setVisible(false);
							}
						}
					}
				},
				{
					boxLabel: 'Streets',
					listeners:{change: function(checked)
						{
							if(this.checked){
								console.log(this.checked)
								DSS.layer.osm_streets.setVisible(true);
								DSS.layer.osm_hybrid.setVisible(false);
								DSS.layer.osm_topo.setVisible(false);
								DSS.layer.osm_satelite.setVisible(false);
								DSS.layer.bingAerial.setVisible(false);
							}
						}
					}
				},
				{
					boxLabel: 'Topo',
					listeners:{change: function(checked)
						{
							if(this.checked){
								console.log(this.checked)
								DSS.layer.osm_topo.setVisible(true);
								DSS.layer.osm_hybrid.setVisible(false);
								DSS.layer.osm_streets.setVisible(false);
								DSS.layer.osm_satelite.setVisible(false);
								DSS.layer.bingAerial.setVisible(false);
							}
						}
					}
				},
				{
					boxLabel: 'Satelite',
					listeners:{change: function(checked)
						{
							if(this.checked){
								console.log(this.checked)
								DSS.layer.osm_satelite.setVisible(true);
								DSS.layer.osm_topo.setVisible(false);
								DSS.layer.osm_hybrid.setVisible(false);
								DSS.layer.osm_streets.setVisible(false);
								DSS.layer.bingAerial.setVisible(false);  
							}
						}
					}
				},
				{ 
					boxLabel: 'No Base Map', 
	                text: 'Bing Aerial',
	                DSS_layer: 'bing-aerial',
					listeners:{change: function(checked)
						{
							if(this.checked){
								console.log(this.checked)
								DSS.layer.bingAerial.setVisible(true);
								DSS.layer.osm_satelite.setVisible(false);
								DSS.layer.osm_topo.setVisible(false);
								DSS.layer.osm_hybrid.setVisible(false);
								DSS.layer.osm_streets.setVisible(false);
							}
						}
					}
				},
			]
			},
			// {
			// 	text: 'Elevation',
			// 	xtype: 'menucheckitem',
			// 	hideOnClick: false,
			// 	checked:false,
			// 	//id:'nwel',
			// 	listeners:{
			// 		afterrender: function(self) {
			// 			self.setChecked(DSS.layer.DEM_image2.getVisible());
			// 		},
			// 	},
			// 	handler: function(self){
			// 		//consider setting up a boolean to hold onto is the DEM has been 
			// 		//loaded previously.  If so, just turn on all the layers
			// 		if(DEMBool == false){
			// 			DSS.MapState.destroyLegend();
			// 			DEM0Source = DSS.layer.DEM_image0.getSource()
			// 			DEM1Source = DSS.layer.DEM_image1.getSource()
			// 			DEM2Source = DSS.layer.DEM_image2.getSource()
			// 			DEM3Source = DSS.layer.DEM_image3.getSource()
			// 			console.log(DEM2Source.getState())
			// 			DSS.layer.DEM_image2.setVisible(self.checked)
			// 			DSS.MapState.showContinuousLegend(DEMColorArray, DEMValueArray);
			// 			DEM2Source.on('imageloadend', function(){
			// 				console.log('HI FROM DEM IMAGE 2')
			// 				DSS.layer.DEM_image3.setVisible(self.checked);
			// 				DEM3Source.on('imageloadend', function(){
			// 					DSS.layer.DEM_image0.setVisible(self.checked);
			// 					DEM0Source.on('imageloadend', function(){
			// 						DSS.layer.DEM_image1.setVisible(self.checked);
			// 					})
			// 				})
			// 			})
			// 			DEMBool = true
			// 		}else{
			// 			console.log('second time')
			// 			DSS.MapState.destroyLegend();
			// 			DSS.layer.DEM_image2.setVisible(self.checked)
			// 			DSS.layer.DEM_image3.setVisible(self.checked)
			// 			DSS.layer.DEM_image0.setVisible(self.checked)
			// 			DSS.layer.DEM_image1.setVisible(self.checked)
			// 			DSS.MapState.showContinuousLegend(DEMColorArray, DEMValueArray);
			// 		}
			// 		//console.log(dss.layer.DEM_image2.getSource())
			// 	}
			// },
			// {
			// 	text: 'Slope',
			// 	xtype: 'menucheckitem',
			// 	hideOnClick: false,
			// 	checked:false,
			// 	//id:'nwel',
			// 	listeners:{
			// 		afterrender: function(self) {
			// 			self.setChecked(DSS.layer.Slope2.getVisible());
			// 		},
			// 	},
			// 	handler: function(self){
			// 		//consider setting up a boolean to hold onto is the Slope has been 
			// 		//loaded previously.  If so, just turn on all the layers
			// 		if(SlopeBool == false){
			// 			DSS.MapState.destroyLegend();
			// 			Slope0Source = DSS.layer.Slope0.getSource()
			// 			Slope1Source = DSS.layer.Slope1.getSource()
			// 			Slope2Source = DSS.layer.Slope2.getSource()
			// 			Slope3Source = DSS.layer.Slope3.getSource()
			// 			console.log(Slope2Source.getState())
			// 			DSS.layer.Slope2.setVisible(self.checked)
			// 			DSS.MapState.showContinuousLegend(DEMColorArray, DEMValueArray);
			// 			Slope2Source.on('imageloadend', function(){
			// 				console.log('HI FROM Slope IMAGE 2')
			// 				DSS.layer.Slope3.setVisible(self.checked);
			// 				Slope3Source.on('imageloadend', function(){
			// 					DSS.layer.Slope0.setVisible(self.checked);
			// 					Slope0Source.on('imageloadend', function(){
			// 						DSS.layer.Slope1.setVisible(self.checked);
			// 					})
			// 				})
			// 			})
			// 			SlopeBool = true
			// 		}else{
			// 			console.log('second time')
			// 			DSS.MapState.destroyLegend();
			// 			DSS.layer.Slope2.setVisible(self.checked)
			// 			DSS.layer.Slope3.setVisible(self.checked)
			// 			DSS.layer.Slope0.setVisible(self.checked)
			// 			DSS.layer.Slope1.setVisible(self.checked)
			// 			DSS.MapState.showContinuousLegend(DEMColorArray, DEMValueArray);
			// 		}
			// 		//console.log(dss.layer.Slope_image2.getSource())
			// 	}
			// },
			// {
			// 	text: 'Clay',
			// 	xtype: 'menucheckitem',
			// 	hideOnClick: false,
			// 	checked:false,
			// 	//id:'nwel',
			// 	listeners:{
			// 		afterrender: function(self) {
			// 			self.setChecked(DSS.layer.Clay2.getVisible());
			// 		},
			// 	},
			// 	handler: function(self){
			// 		//consider setting up a boolean to hold onto is the Clay has been 
			// 		//loaded previously.  If so, just turn on all the layers
			// 		if(ClayBool == false){
			// 			DSS.MapState.destroyLegend();
			// 			Clay0Source = DSS.layer.Clay0.getSource()
			// 			Clay1Source = DSS.layer.Clay1.getSource()
			// 			Clay2Source = DSS.layer.Clay2.getSource()
			// 			Clay3Source = DSS.layer.Clay3.getSource()
			// 			console.log(Clay2Source.getState())
			// 			DSS.layer.Clay2.setVisible(self.checked)
			// 			DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray);
			// 			Clay2Source.on('imageloadend', function(){
			// 				console.log('HI FROM Clay IMAGE 2')
			// 				DSS.layer.Clay3.setVisible(self.checked);
			// 				Clay3Source.on('imageloadend', function(){
			// 					DSS.layer.Clay0.setVisible(self.checked);
			// 					Clay0Source.on('imageloadend', function(){
			// 						DSS.layer.Clay1.setVisible(self.checked);
			// 					})
			// 				})
			// 			})
			// 			ClayBool = true
			// 		}else{
			// 			console.log('second time')
			// 			DSS.MapState.destroyLegend();
			// 			DSS.layer.Clay2.setVisible(self.checked)
			// 			DSS.layer.Clay3.setVisible(self.checked)
			// 			DSS.layer.Clay0.setVisible(self.checked)
			// 			DSS.layer.Clay1.setVisible(self.checked)
			// 			DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray);
			// 		}
			// 		//console.log(dss.layer.Clay_image2.getSource())
			// 	}
			// },
			// {
			// 	text: 'Silt',
			// 	xtype: 'menucheckitem',
			// 	hideOnClick: false,
			// 	checked:false,
			// 	//id:'nwel',
			// 	listeners:{
			// 		afterrender: function(self) {
			// 			self.setChecked(DSS.layer.Silt2.getVisible());
			// 		},
			// 	},
			// 	handler: function(self){
			// 		//consider setting up a boolean to hold onto is the Silt has been 
			// 		//loaded previously.  If so, just turn on all the layers
			// 		if(SiltBool == false){
			// 			DSS.MapState.destroyLegend();
			// 			Silt0Source = DSS.layer.Silt0.getSource()
			// 			Silt1Source = DSS.layer.Silt1.getSource()
			// 			Silt2Source = DSS.layer.Silt2.getSource()
			// 			Silt3Source = DSS.layer.Silt3.getSource()
			// 			console.log(Silt2Source.getState())
			// 			DSS.layer.Silt2.setVisible(self.checked)
			// 			DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray);
			// 			Silt2Source.on('imageloadend', function(){
			// 				console.log('HI FROM Silt IMAGE 2')
			// 				DSS.layer.Silt3.setVisible(self.checked);
			// 				Silt3Source.on('imageloadend', function(){
			// 					DSS.layer.Silt0.setVisible(self.checked);
			// 					Silt0Source.on('imageloadend', function(){
			// 						DSS.layer.Silt1.setVisible(self.checked);
			// 					})
			// 				})
			// 			})
			// 			SiltBool = true
			// 		}else{
			// 			console.log('second time')
			// 			DSS.MapState.destroyLegend();
			// 			DSS.layer.Silt2.setVisible(self.checked)
			// 			DSS.layer.Silt3.setVisible(self.checked)
			// 			DSS.layer.Silt0.setVisible(self.checked)
			// 			DSS.layer.Silt1.setVisible(self.checked)
			// 			DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray);
			// 		}
			// 		//console.log(dss.layer.Silt_image2.getSource())
			// 	}
			// },
			// {
			// 	text: 'Sand',
			// 	xtype: 'menucheckitem',
			// 	hideOnClick: false,
			// 	checked:false,
			// 	//id:'nwel',
			// 	listeners:{
			// 		afterrender: function(self) {
			// 			self.setChecked(DSS.layer.Sand2.getVisible());
			// 		},
			// 	},
			// 	handler: function(self){
			// 		//consider setting up a boolean to hold onto is the Sand has been 
			// 		//loaded previously.  If so, just turn on all the layers
			// 		if(SandBool == false){
			// 			DSS.MapState.destroyLegend();
			// 			Sand0Source = DSS.layer.Sand0.getSource()
			// 			Sand1Source = DSS.layer.Sand1.getSource()
			// 			Sand2Source = DSS.layer.Sand2.getSource()
			// 			Sand3Source = DSS.layer.Sand3.getSource()
			// 			console.log(Sand2Source.getState())
			// 			DSS.layer.Sand2.setVisible(self.checked)
			// 			DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray);
			// 			Sand2Source.on('imageloadend', function(){
			// 				console.log('HI FROM Sand IMAGE 2')
			// 				DSS.layer.Sand3.setVisible(self.checked);
			// 				Sand3Source.on('imageloadend', function(){
			// 					DSS.layer.Sand0.setVisible(self.checked);
			// 					Sand0Source.on('imageloadend', function(){
			// 						DSS.layer.Sand1.setVisible(self.checked);
			// 					})
			// 				})
			// 			})
			// 			SandBool = true
			// 		}else{
			// 			console.log('second time')
			// 			DSS.MapState.destroyLegend();
			// 			DSS.layer.Sand2.setVisible(self.checked)
			// 			DSS.layer.Sand3.setVisible(self.checked)
			// 			DSS.layer.Sand0.setVisible(self.checked)
			// 			DSS.layer.Sand1.setVisible(self.checked)
			// 			DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray);
			// 		}
			// 		//console.log(dss.layer.Sand_image2.getSource())
			// 	}
			// },


			//----------------------------------------------------------------
			//Kept 2 examples of the old button based method. One Slope, One Soil 01022022 ZJH
			//----------------------------------------------------------------
			// {
			// 	xtype: 'button',
			// 	text: 'Slope',
			// 	name: 'Slope',
			// 	//bind: 'Call {menuGroups.option}',
			// 	menu: {
			// 		defaults:{
			// 			xtype: 'menucheckitem',
			// 			hideOnClick: false,
			// 			checked:false,
			// 		},
			// 		items: [{
			// 			text: 'Northwest',
			// 			listeners:{
			// 				afterrender: function(self) {
			// 					self.setChecked(DSS.layer.Slope2.getVisible());
			// 				},
			// 			},
			// 			handler: function(self){
			// 				DSS.layer.Slope2.setVisible(self.checked);
			// 			}
			// 		},
			// 		{
			// 			text: 'Northeast',
			// 			listeners:{
			// 				afterrender: function(self) {
			// 					self.setChecked(DSS.layer.Slope3.getVisible());
			// 				},
			// 			},
			// 			handler: function(self){
			// 				DSS.layer.Slope3.setVisible(self.checked);
			// 			}
			// 		},
			// 		{
			// 			text: 'Southwest',
			// 			listeners:{
			// 				afterrender: function(self) {
			// 					self.setChecked(DSS.layer.Slope0.getVisible());
			// 				},
			// 			},
			// 			handler: function(self){
			// 				DSS.layer.Slope0.setVisible(self.checked);
			// 			}
			// 		},
			// 		{
			// 			text: 'Southeast',
			// 			listeners:{
			// 				afterrender: function(self) {
			// 					self.setChecked(DSS.layer.Slope1.getVisible());
			// 				},
			// 			},
			// 			handler: function(self){
			// 				DSS.layer.Slope1.setVisible(self.checked);
			// 			}
			// 		}]
			// 	}
			// },
			// {
			// 	xtype: 'button',
			// 	text: 'Clay',
			// 	name: 'Clay',
			// 	//bind: 'Call {menuGroups.option}',
			// 	menu: {
			// 		defaults:{
			// 			xtype: 'menucheckitem',
			// 			hideOnClick: false,
			// 			checked:false,
			// 		},
			// 		items: [{
			// 			text: 'Northwest',
			// 			listeners:{
			// 				afterrender: function(self) {
			// 					self.setChecked(DSS.layer.Clay2.getVisible());
								
			// 				},
			// 			},
			// 			handler: function(self){
			// 				DSS.layer.Clay2.setVisible(self.checked);
			// 					DSS.MapState.showContinuousLegend(soilColorArray, soilValueArray);
			// 			}
			// 		},
			// 		{
			// 			text: 'Northeast',
			// 			listeners:{
			// 				afterrender: function(self) {
			// 					self.setChecked(DSS.layer.Clay3.getVisible());
								
			// 				},
			// 			},
			// 			handler: function(self){
			// 				DSS.layer.Clay3.setVisible(self.checked);
			// 					DSS.MapState.showContinuousLegend(soilColorArray, soilValueArray);
			// 			}
			// 		},
			// 		{
			// 			text: 'Southwest',
			// 			listeners:{
			// 				afterrender: function(self) {
			// 					self.setChecked(DSS.layer.Clay0.getVisible());
								
			// 				},
			// 			},
			// 			handler: function(self){
			// 				DSS.layer.Clay0.setVisible(self.checked);
			// 					DSS.MapState.showContinuousLegend(soilColorArray, soilValueArray);
			// 			}
			// 		},
			// 		{
			// 			text: 'Southeast',
			// 			listeners:{
			// 				afterrender: function(self) {
			// 					self.setChecked(DSS.layer.Clay1.getVisible());
								
			// 				},
			// 			},
			// 			handler: function(self){
			// 				DSS.layer.Clay1.setVisible(self.checked);
			// 					DSS.MapState.showContinuousLegend(soilColorArray, soilValueArray);
			// 			}
			// 		}]
			// 	}
			// },
			
			
			// {
			// 	xtype: 'button',
			// 	text: 'Remove Overlays',
			// 	handler: function() {
			// 		DSS.MapState.destroyLegend();
			// 		DSS.layer.DEM_image0.setVisible(false);
			// 		DSS.layer.DEM_image1.setVisible(false);
			// 		DSS.layer.DEM_image2.setVisible(false);
			// 		DSS.layer.DEM_image3.setVisible(false);
			// 		DSS.layer.Slope0.setVisible(false);
			// 		DSS.layer.Slope1.setVisible(false);
			// 		DSS.layer.Slope2.setVisible(false);
			// 		DSS.layer.Slope3.setVisible(false);
			// 		DSS.layer.Clay0.setVisible(false);
			// 		DSS.layer.Clay1.setVisible(false);
			// 		DSS.layer.Clay2.setVisible(false);
			// 		DSS.layer.Clay3.setVisible(false);
			// 		DSS.layer.Sand0.setVisible(false);
			// 		DSS.layer.Sand1.setVisible(false);
			// 		DSS.layer.Sand2.setVisible(false);
			// 		DSS.layer.Sand3.setVisible(false);
			// 		DSS.layer.Silt0.setVisible(false);
			// 		DSS.layer.Silt1.setVisible(false);
			// 		DSS.layer.Silt2.setVisible(false);
			// 		DSS.layer.Silt3.setVisible(false);
			// 		Ext.ComponentQuery.query('menucheckitem[text=Elevation]')[0].setChecked(false);
			// 		Ext.ComponentQuery.query('menucheckitem[text=Slope]')[0].setChecked(false);
			// 		Ext.ComponentQuery.query('menucheckitem[text=Clay]')[0].setChecked(false);
			// 		Ext.ComponentQuery.query('menucheckitem[text=Silt]')[0].setChecked(false);
			// 		Ext.ComponentQuery.query('menucheckitem[text=Sand]')[0].setChecked(false);
			// 	}
			// }


			//items:[
						// 	{
						// 		text: 'Northwest',
						// 		//DSS_layer: 'bing-aerial',
						// 		handler: function(self, checked) {
						// 			DSS.layer.DEM_image0.setVisible(false);
						// 			DSS.layer.DEM_image1.setVisible(false);
						// 			DSS.layer.DEM_image2.setVisible(checked);
						// 			DSS.layer.DEM_image3.setVisible(false);
						// 			if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
						// 		}
						// 	},
						// 	{
						// 		text: 'Northeast',
						// 		//DSS_layer: 'bing-aerial',
								
						// 		handler: function(self, checked) {
						// 			DSS.layer.DEM_image0.setVisible(false);
						// 			DSS.layer.DEM_image1.setVisible(false);
						// 			DSS.layer.DEM_image2.setVisible(false);
						// 			DSS.layer.DEM_image3.setVisible(checked);
						// 			if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
						// 		}
						// 	},
						// 	{
						// 		text: 'Southwest',
						// 		//DSS_layer: 'bing-aerial',
								
						// 		handler: function(self, checked) {
						// 			DSS.layer.DEM_image0.setVisible(checked);
						// 			DSS.layer.DEM_image1.setVisible(false);
						// 			DSS.layer.DEM_image2.setVisible(false);
						// 			DSS.layer.DEM_image3.setVisible(false);
						// 			if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
						// 		}
						// 	},{
						// 		text: 'Southeast',
						// 		//DSS_layer: 'bing-aerial',
								
						// 		handler: function(self, checked) {
						// 			DSS.layer.DEM_image0.setVisible(false);
						// 			DSS.layer.DEM_image1.setVisible(checked);
						// 			DSS.layer.DEM_image2.setVisible(false);
						// 			DSS.layer.DEM_image3.setVisible(false);
									
						// 			if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
						// 		}
						// 	},
						// 	{
						// 		text: 'Remove Elevation',
						// 		//DSS_layer: 'bing-aerial',
						// 		handler: function(self, checked) {
						// 			DSS.layer.DEM_image0.setVisible(false);
						// 			DSS.layer.DEM_image1.setVisible(false);
						// 			DSS.layer.DEM_image2.setVisible(false);
						// 			DSS.layer.DEM_image3.setVisible(false);
						// 			if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
						// 		}
						// 	}
						// ]

			// {
			// 	xtype: 'radiogroup',
			// 	columns: 1, 
			// 	vertical: true,
			// 	collapsible: true,
			// 	defaults: {
			// 		padding: '2 0',
			// 		group: 'input-layer'
			// 	},
			// 	items: [{
			// 		boxLabel: 'Elevation1',
	        //         //DSS_layer: 'bing-aerial',
	        //         listeners: {
	        //         	afterrender: function(self) {
	        //         		self.setValue(DSS.layer.DEM_image0.getVisible());
	        //         	}
	        //         },
	        //         handler: function(self, checked) {
	        //         	DSS.layer.DEM_image0.setVisible(checked);
	        //         	if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
	        //         }
			// 	},{
			// 		boxLabel: 'Elevation2',
	        //         //DSS_layer: 'bing-aerial',
	        //         listeners: {
	        //         	afterrender: function(self) {
	        //         		self.setValue(DSS.layer.DEM_image1.getVisible());
	        //         	}
	        //         },
	        //         handler: function(self, checked) {
	        //         	DSS.layer.DEM_image1.setVisible(checked);
	        //         	if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
	        //         }
			// 	},
			// 	{
			// 		boxLabel: 'Elevation3',
	        //         //DSS_layer: 'bing-aerial',
	        //         listeners: {
	        //         	afterrender: function(self) {
	        //         		self.setValue(DSS.layer.DEM_image2.getVisible());
	        //         	}
	        //         },
	        //         handler: function(self, checked) {
	        //         	DSS.layer.DEM_image2.setVisible(checked);
	        //         	if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
	        //         }
			// 	},
			// 	{
			// 		boxLabel: 'Elevation4',
	        //         //DSS_layer: 'bing-aerial',
	        //         listeners: {
	        //         	afterrender: function(self) {
	        //         		self.setValue(DSS.layer.DEM_image3.getVisible());
	        //         	}
	        //         },
	        //         handler: function(self, checked) {
	        //         	DSS.layer.DEM_image3.setVisible(checked);
	        //         	if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
	        //         }
			// 	},
			// 	{
			// 		boxLabel: 'Elevation1',
	        //         //DSS_layer: 'bing-aerial',
	        //         listeners: {
	        //         	afterrender: function(self) {
	        //         		self.setValue(DSS.layer.DEM_image0.getVisible());
	        //         	}
	        //         },
	        //         handler: function(self, checked) {
	        //         	DSS.layer.DEM_image0.setVisible(false);
			// 			DSS.layer.DEM_image1.setVisible(false);
			// 			DSS.layer.DEM_image2.setVisible(false);
			// 			DSS.layer.DEM_image3.setVisible(false);
	        //         	if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
	        //         }
			// 	}]
			// }
		]
		});
		
		me.callParent(arguments);
	},

});

