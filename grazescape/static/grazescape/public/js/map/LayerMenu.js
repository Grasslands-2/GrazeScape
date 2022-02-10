var soilColorArray = ['rgba(0,0,0,1)','rgba(51,51,51,1)','rgba(102,102,102,1)','rgba(153,153,153,1)','rgba(204,204,204,1)','rgba(255,255,255,1)']
var soilValueArray =['0',20,40,60,80,'100']
//[0,20,40,60,80,100]

var DEMColorArray = ['rgba(0,0,0,1)','rgba(51,51,51,1)','rgba(102,102,102,1)','rgba(153,153,153,1)','rgba(204,204,204,1)','rgba(255,255,255,1)']
var DEMValueArray =['600',770,940,1110,1280,'1450']
var slopeValueArray =['0',20,50,80,130,'180+']
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
											DEM0Source = DSS.layer.SWDEM_image0.getSource()
											DEM1Source = DSS.layer.SWDEM_image1.getSource()
											DEM2Source = DSS.layer.SWDEM_image2.getSource()
											DEM3Source = DSS.layer.SWDEM_image3.getSource()
											console.log(DEM2Source.getState())
											DSS.layer.SWDEM_image2.setVisible(checked)
											DSS.MapState.showContinuousLegend(DEMColorArray, DEMValueArray,'Elev ft');
											DEM2Source.on('imageloadend', function(){
												DSS.layer.SWDEM_image3.setVisible(checked);
												DEM3Source.on('imageloadend', function(){
													DSS.layer.SWDEM_image0.setVisible(checked);
													DEM0Source.on('imageloadend', function(){
														DSS.layer.SWDEM_image1.setVisible(checked);
													})
												})
											})
											DEMBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.SWDEM_image2.setVisible(checked)
											DSS.layer.SWDEM_image3.setVisible(checked)
											DSS.layer.SWDEM_image0.setVisible(checked)
											DSS.layer.SWDEM_image1.setVisible(checked)
											DSS.MapState.showContinuousLegend(DEMColorArray, DEMValueArray,'Elev ft');
										}
										//console.log(dss.layer.SWDEM_image2.getSource())
									}else{
										DSS.layer.SWDEM_image2.setVisible(false)
										DSS.layer.SWDEM_image3.setVisible(false)
										DSS.layer.SWDEM_image0.setVisible(false)
										DSS.layer.SWDEM_image1.setVisible(false)
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
											Slope0Source = DSS.layer.SWSlope0.getSource()
											Slope1Source = DSS.layer.SWSlope1.getSource()
											Slope2Source = DSS.layer.SWSlope2.getSource()
											Slope3Source = DSS.layer.SWSlope3.getSource()
											console.log(Slope2Source.getState())
											DSS.layer.SWSlope2.setVisible(checked)
											DSS.MapState.showContinuousLegend(DEMColorArray, slopeValueArray,'% Slope');
											Slope2Source.on('imageloadend', function(){
												console.log('HI FROM Slope IMAGE 2')
												DSS.layer.SWSlope3.setVisible(checked);
												Slope3Source.on('imageloadend', function(){
													DSS.layer.SWSlope0.setVisible(checked);
													Slope0Source.on('imageloadend', function(){
														DSS.layer.SWSlope1.setVisible(checked);
													})
												})
											})
											SlopeBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.SWSlope2.setVisible(checked)
											DSS.layer.SWSlope3.setVisible(checked)
											DSS.layer.SWSlope0.setVisible(checked)
											DSS.layer.SWSlope1.setVisible(checked)
											DSS.MapState.showContinuousLegend(DEMColorArray, slopeValueArray,'% Slope');
										}
										//console.log(dss.layer.SWSlope_image2.getSource())
									}else{
										DSS.layer.SWSlope2.setVisible(false)
										DSS.layer.SWSlope3.setVisible(false)
										DSS.layer.SWSlope0.setVisible(false)
										DSS.layer.SWSlope1.setVisible(false)
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
											Clay0Source = DSS.layer.SWClay0.getSource()
											Clay1Source = DSS.layer.SWClay1.getSource()
											Clay2Source = DSS.layer.SWClay2.getSource()
											Clay3Source = DSS.layer.SWClay3.getSource()
											console.log(Clay2Source.getState())
											DSS.layer.SWClay2.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray,'Soil %');
											Clay2Source.on('imageloadend', function(){
												console.log('HI FROM Clay IMAGE 2')
												DSS.layer.SWClay3.setVisible(checked);
												Clay3Source.on('imageloadend', function(){
													DSS.layer.SWClay0.setVisible(checked);
													Clay0Source.on('imageloadend', function(){
														DSS.layer.SWClay1.setVisible(checked);
													})
												})
											})
											ClayBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.SWClay2.setVisible(checked)
											DSS.layer.SWClay3.setVisible(checked)
											DSS.layer.SWClay0.setVisible(checked)
											DSS.layer.SWClay1.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray,'Soil %');
										}
										//console.log(dss.layer.SWClay_image2.getSource())
									}else{
										DSS.layer.SWClay2.setVisible(false)
										DSS.layer.SWClay3.setVisible(false)
										DSS.layer.SWClay0.setVisible(false)
										DSS.layer.SWClay1.setVisible(false)
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
											Silt0Source = DSS.layer.SWSilt0.getSource()
											Silt1Source = DSS.layer.SWSilt1.getSource()
											Silt2Source = DSS.layer.SWSilt2.getSource()
											Silt3Source = DSS.layer.SWSilt3.getSource()
											console.log(Silt2Source.getState())
											DSS.layer.SWSilt2.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray,'Soil %');
											Silt2Source.on('imageloadend', function(){
												console.log('HI FROM Silt IMAGE 2')
												DSS.layer.SWSilt3.setVisible(checked);
												Silt3Source.on('imageloadend', function(){
													DSS.layer.SWSilt0.setVisible(checked);
													Silt0Source.on('imageloadend', function(){
														DSS.layer.SWSilt1.setVisible(checked);
													})
												})
											})
											SiltBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.SWSilt2.setVisible(checked)
											DSS.layer.SWSilt3.setVisible(checked)
											DSS.layer.SWSilt0.setVisible(checked)
											DSS.layer.SWSilt1.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray,'Soil %');
										}
										//console.log(dss.layer.SWSilt_image2.getSource())
									}else{
										DSS.layer.SWSilt2.setVisible(false)
										DSS.layer.SWSilt3.setVisible(false)
										DSS.layer.SWSilt0.setVisible(false)
										DSS.layer.SWSilt1.setVisible(false)
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
											Sand0Source = DSS.layer.SWSand0.getSource()
											Sand1Source = DSS.layer.SWSand1.getSource()
											Sand2Source = DSS.layer.SWSand2.getSource()
											Sand3Source = DSS.layer.SWSand3.getSource()
											console.log(Sand2Source.getState())
											DSS.layer.SWSand2.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray,'Soil %');
											Sand2Source.on('imageloadend', function(){
												console.log('HI FROM Sand IMAGE 2')
												DSS.layer.SWSand3.setVisible(checked);
												Sand3Source.on('imageloadend', function(){
													DSS.layer.SWSand0.setVisible(checked);
													Sand0Source.on('imageloadend', function(){
														DSS.layer.SWSand1.setVisible(checked);
														SandBool = true
													})
												})
											})
											SandBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.SWSand2.setVisible(checked)
											DSS.layer.SWSand3.setVisible(checked)
											DSS.layer.SWSand0.setVisible(checked)
											DSS.layer.SWSand1.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray,'Soil %');
										}
										//console.log(dss.layer.SWSand_image2.getSource())
									}else{
										DSS.layer.SWSand2.setVisible(false)
										DSS.layer.SWSand3.setVisible(false)
										DSS.layer.SWSand0.setVisible(false)
										DSS.layer.SWSand1.setVisible(false)
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
										DSS.layer.SWDEM_image0.setVisible(false);
										DSS.layer.SWDEM_image1.setVisible(false);
										DSS.layer.SWDEM_image2.setVisible(false);
										DSS.layer.SWDEM_image3.setVisible(false);
										DSS.layer.SWSlope0.setVisible(false);
										DSS.layer.SWSlope1.setVisible(false);
										DSS.layer.SWSlope2.setVisible(false);
										DSS.layer.SWSlope3.setVisible(false);
										DSS.layer.SWClay0.setVisible(false);
										DSS.layer.SWClay1.setVisible(false);
										DSS.layer.SWClay2.setVisible(false);
										DSS.layer.SWClay3.setVisible(false);
										DSS.layer.SWSand0.setVisible(false);
										DSS.layer.SWSand1.setVisible(false);
										DSS.layer.SWSand2.setVisible(false);
										DSS.layer.SWSand3.setVisible(false);
										DSS.layer.SWSilt0.setVisible(false);
										DSS.layer.SWSilt1.setVisible(false);
										DSS.layer.SWSilt2.setVisible(false);
										DSS.layer.SWSilt3.setVisible(false);
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
						DSS.layer.SWDEM_image0.setOpacity(val)
						DSS.layer.SWDEM_image1.setOpacity(val)
						DSS.layer.SWDEM_image2.setOpacity(val)
						DSS.layer.SWDEM_image3.setOpacity(val)
						DSS.layer.SWSlope0.setOpacity(val)
						DSS.layer.SWSlope1.setOpacity(val)
						DSS.layer.SWSlope2.setOpacity(val)
						DSS.layer.SWSlope3.setOpacity(val)
						DSS.layer.SWClay0.setOpacity(val)
						DSS.layer.SWClay1.setOpacity(val)
						DSS.layer.SWClay2.setOpacity(val)
						DSS.layer.SWClay3.setOpacity(val)
						DSS.layer.SWSand0.setOpacity(val)
						DSS.layer.SWSand1.setOpacity(val)
						DSS.layer.SWSand2.setOpacity(val)
						DSS.layer.SWSand3.setOpacity(val)
						DSS.layer.SWSilt0.setOpacity(val)
						DSS.layer.SWSilt1.setOpacity(val)
						DSS.layer.SWSilt2.setOpacity(val)
						DSS.layer.SWSilt3.setOpacity(val)
						//Ext.util.Cookies.set(key + ":opacity", "" + val);
					}	                		
				}
			},
			{//-----------------------------------------------------------------
				xtype: 'menuitem',
				text: 'Base Layers', disabled: true,
				style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px; background-color: #ccc'
			},
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
		]
		});
		
		me.callParent(arguments);
	},

});

