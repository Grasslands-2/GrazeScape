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
Ext.define('DSS.map.LayerMenuUL', {
//------------------------------------------------------------------------------
	extend: 'Ext.menu.Menu',
	alias: 'widget.map_layer_menu',
	alternateClassName: 'DSS.LayerMenuUL',
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
											DEM0Source = DSS.layer.ULDEM_image0.getSource()
											DEM1Source = DSS.layer.ULDEM_image1.getSource()
											DEM2Source = DSS.layer.ULDEM_image2.getSource()
											DEM3Source = DSS.layer.ULDEM_image3.getSource()
											DEM4Source = DSS.layer.ULDEM_image4.getSource()
											console.log(DEM0Source.getState())
											DSS.layer.ULDEM_image0.setVisible(checked)
											DSS.MapState.showContinuousLegend(DEMColorArray, DEMValueArray,'Elev ft');
											DEM0Source.on('imageloadend', function(){
												DSS.layer.ULDEM_image1.setVisible(checked);
												DEM1Source.on('imageloadend', function(){
													DSS.layer.ULDEM_image2.setVisible(checked);
													DEM2Source.on('imageloadend', function(){
														DSS.layer.ULDEM_image3.setVisible(checked);
														DEM3Source.on('imageloadend', function(){
															DSS.layer.ULDEM_image4.setVisible(checked);
														})
													})
												})
											})
											DEMBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.ULDEM_image0.setVisible(checked)
											DSS.layer.ULDEM_image1.setVisible(checked)
											DSS.layer.ULDEM_image2.setVisible(checked)
											DSS.layer.ULDEM_image3.setVisible(checked)
											DSS.layer.ULDEM_image4.setVisible(checked)
											DSS.MapState.showContinuousLegend(DEMColorArray, DEMValueArray,'Elev ft');
										}
										//console.log(dss.layer.SWDEM_image2.getSource())
									}else{
										DSS.layer.ULDEM_image0.setVisible(false)
										DSS.layer.ULDEM_image1.setVisible(false)
										DSS.layer.ULDEM_image2.setVisible(false)
										DSS.layer.ULDEM_image3.setVisible(false)
										DSS.layer.ULDEM_image4.setVisible(false)
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
											Slope0Source = DSS.layer.ULSlope0.getSource()
											Slope1Source = DSS.layer.ULSlope1.getSource()
											Slope2Source = DSS.layer.ULSlope2.getSource()
											Slope3Source = DSS.layer.ULSlope3.getSource()
											Slope4Source = DSS.layer.ULSlope4.getSource()
											console.log(Slope0Source.getState())
											DSS.layer.ULSlope0.setVisible(checked)
											DSS.MapState.showContinuousLegend(DEMColorArray, slopeValueArray,'% Slope');
											Slope0Source.on('imageloadend', function(){
												DSS.layer.ULSlope1.setVisible(checked);
												Slope1Source.on('imageloadend', function(){
													DSS.layer.ULSlope2.setVisible(checked);
													Slope2Source.on('imageloadend', function(){
														DSS.layer.ULSlope3.setVisible(checked);
														Slope3Source.on('imageloadend', function(){
															DSS.layer.ULSlope4.setVisible(checked);
														})
													})
												})
											})
											SlopeBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.ULSlope0.setVisible(checked)
											DSS.layer.ULSlope1.setVisible(checked)
											DSS.layer.ULSlope2.setVisible(checked)
											DSS.layer.ULSlope3.setVisible(checked)
											DSS.layer.ULSlope4.setVisible(checked)
											DSS.MapState.showContinuousLegend(DEMColorArray, slopeValueArray,'% Slope');
										}
										//console.log(dss.layer.SWSlope2.getSource())
									}else{
										DSS.layer.ULSlope0.setVisible(false)
										DSS.layer.ULSlope1.setVisible(false)
										DSS.layer.ULSlope2.setVisible(false)
										DSS.layer.ULSlope3.setVisible(false)
										DSS.layer.ULSlope4.setVisible(false)
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
											Clay0Source = DSS.layer.ULClay0.getSource()
											Clay1Source = DSS.layer.ULClay1.getSource()
											Clay2Source = DSS.layer.ULClay2.getSource()
											Clay3Source = DSS.layer.ULClay3.getSource()
											Clay4Source = DSS.layer.ULClay4.getSource()
											console.log(Clay0Source.getState())
											DSS.layer.ULClay0.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray,'Soil %');
											Clay0Source.on('imageloadend', function(){
												DSS.layer.ULClay1.setVisible(checked);
												Clay1Source.on('imageloadend', function(){
													DSS.layer.ULClay2.setVisible(checked);
													Clay2Source.on('imageloadend', function(){
														DSS.layer.ULClay3.setVisible(checked);
														Clay3Source.on('imageloadend', function(){
															DSS.layer.ULClay4.setVisible(checked);
														})
													})
												})
											})
											ClayBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.ULClay0.setVisible(checked)
											DSS.layer.ULClay1.setVisible(checked)
											DSS.layer.ULClay2.setVisible(checked)
											DSS.layer.ULClay3.setVisible(checked)
											DSS.layer.ULClay4.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray,'Soil %');
										}
										//console.log(dss.layer.SWClay2.getSource())
									}else{
										DSS.layer.ULClay0.setVisible(false)
										DSS.layer.ULClay1.setVisible(false)
										DSS.layer.ULClay2.setVisible(false)
										DSS.layer.ULClay3.setVisible(false)
										DSS.layer.ULClay4.setVisible(false)
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
											Silt0Source = DSS.layer.ULSilt0.getSource()
											Silt1Source = DSS.layer.ULSilt1.getSource()
											Silt2Source = DSS.layer.ULSilt2.getSource()
											Silt3Source = DSS.layer.ULSilt3.getSource()
											Silt4Source = DSS.layer.ULSilt4.getSource()
											console.log(Silt0Source.getState())
											DSS.layer.ULSilt0.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray,'Soil %');
											Silt0Source.on('imageloadend', function(){
												DSS.layer.ULSilt1.setVisible(checked);
												Silt1Source.on('imageloadend', function(){
													DSS.layer.ULSilt2.setVisible(checked);
													Silt2Source.on('imageloadend', function(){
														DSS.layer.ULSilt3.setVisible(checked);
														Silt3Source.on('imageloadend', function(){
															DSS.layer.ULSilt4.setVisible(checked);
														})
													})
												})
											})
											SiltBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.ULSilt0.setVisible(checked)
											DSS.layer.ULSilt1.setVisible(checked)
											DSS.layer.ULSilt2.setVisible(checked)
											DSS.layer.ULSilt3.setVisible(checked)
											DSS.layer.ULSilt4.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray,'Soil %');
										}
										//console.log(dss.layer.SWSilt2.getSource())
									}else{
										DSS.layer.ULSilt0.setVisible(false)
										DSS.layer.ULSilt1.setVisible(false)
										DSS.layer.ULSilt2.setVisible(false)
										DSS.layer.ULSilt3.setVisible(false)
										DSS.layer.ULSilt4.setVisible(false)
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
											Sand0Source = DSS.layer.ULSand0.getSource()
											Sand1Source = DSS.layer.ULSand1.getSource()
											Sand2Source = DSS.layer.ULSand2.getSource()
											Sand3Source = DSS.layer.ULSand3.getSource()
											Sand4Source = DSS.layer.ULSand4.getSource()
											console.log(Sand0Source.getState())
											DSS.layer.ULSand0.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray,'Soil %');
											Sand0Source.on('imageloadend', function(){
												DSS.layer.ULSand1.setVisible(checked);
												Sand1Source.on('imageloadend', function(){
													DSS.layer.ULSand2.setVisible(checked);
													Sand2Source.on('imageloadend', function(){
														DSS.layer.ULSand3.setVisible(checked);
														Sand3Source.on('imageloadend', function(){
															DSS.layer.ULSand4.setVisible(checked);
														})
													})
												})
											})
											SandBool = true
										}else{
											console.log('second time')
											DSS.MapState.destroyLegend();
											DSS.layer.ULSand0.setVisible(checked)
											DSS.layer.ULSand1.setVisible(checked)
											DSS.layer.ULSand2.setVisible(checked)
											DSS.layer.ULSand3.setVisible(checked)
											DSS.layer.ULSand4.setVisible(checked)
											DSS.MapState.showContinuousLegend(soilColorArray,soilValueArray,'Soil %');
										}
										//console.log(dss.layer.SWSand2.getSource())
									}else{
										DSS.layer.ULSand0.setVisible(false)
										DSS.layer.ULSand1.setVisible(false)
										DSS.layer.ULSand2.setVisible(false)
										DSS.layer.ULSand3.setVisible(false)
										DSS.layer.ULSand4.setVisible(false)
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
										DSS.layer.ULDEM_image0.setVisible(false);
										DSS.layer.ULDEM_image1.setVisible(false);
										DSS.layer.ULDEM_image2.setVisible(false);
										DSS.layer.ULDEM_image3.setVisible(false);
										DSS.layer.ULDEM_image4.setVisible(false);
										DSS.layer.ULSlope0.setVisible(false);
										DSS.layer.ULSlope1.setVisible(false);
										DSS.layer.ULSlope2.setVisible(false);
										DSS.layer.ULSlope3.setVisible(false);
										DSS.layer.ULSlope4.setVisible(false);
										DSS.layer.ULClay0.setVisible(false);
										DSS.layer.ULClay1.setVisible(false);
										DSS.layer.ULClay2.setVisible(false);
										DSS.layer.ULClay3.setVisible(false);
										DSS.layer.ULClay4.setVisible(false);
										DSS.layer.ULSand0.setVisible(false);
										DSS.layer.ULSand1.setVisible(false);
										DSS.layer.ULSand2.setVisible(false);
										DSS.layer.ULSand3.setVisible(false);
										DSS.layer.ULSand4.setVisible(false);
										DSS.layer.ULSilt0.setVisible(false);
										DSS.layer.ULSilt1.setVisible(false);
										DSS.layer.ULSilt2.setVisible(false);
										DSS.layer.ULSilt3.setVisible(false);
										DSS.layer.ULSilt4.setVisible(false);
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
						DSS.layer.ULDEM_image0.setOpacity(val)
						DSS.layer.ULDEM_image1.setOpacity(val)
						DSS.layer.ULDEM_image2.setOpacity(val)
						DSS.layer.ULDEM_image3.setOpacity(val)
						DSS.layer.ULDEM_image4.setOpacity(val)
						DSS.layer.ULSlope0.setOpacity(val)
						DSS.layer.ULSlope1.setOpacity(val)
						DSS.layer.ULSlope2.setOpacity(val)
						DSS.layer.ULSlope3.setOpacity(val)
						DSS.layer.ULSlope4.setOpacity(val)
						DSS.layer.ULClay0.setOpacity(val)
						DSS.layer.ULClay1.setOpacity(val)
						DSS.layer.ULClay2.setOpacity(val)
						DSS.layer.ULClay3.setOpacity(val)
						DSS.layer.ULClay4.setOpacity(val)
						DSS.layer.ULSand0.setOpacity(val)
						DSS.layer.ULSand1.setOpacity(val)
						DSS.layer.ULSand2.setOpacity(val)
						DSS.layer.ULSand3.setOpacity(val)
						DSS.layer.ULSand4.setOpacity(val)
						DSS.layer.ULSilt0.setOpacity(val)
						DSS.layer.ULSilt1.setOpacity(val)
						DSS.layer.ULSilt2.setOpacity(val)
						DSS.layer.ULSilt3.setOpacity(val)
						DSS.layer.ULSilt4.setOpacity(val)
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
								DSS.layer.bingAerial.setVisible(true);
								DSS.layer.osm_streets.setVisible(false);
								DSS.layer.osm_topo.setVisible(false);
								DSS.layer.osm_satellite.setVisible(false);
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
								DSS.layer.bingAerial.setVisible(false);
								DSS.layer.osm_topo.setVisible(false);
								DSS.layer.osm_satellite.setVisible(false);
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
								DSS.layer.bingAerial.setVisible(false);
								DSS.layer.osm_streets.setVisible(false);
								DSS.layer.osm_satellite.setVisible(false);
							}
						}
					}
				},
				{
					boxLabel: 'Satellite',
					listeners:{change: function(checked)
						{
							if(this.checked){
								console.log(this.checked)
								DSS.layer.osm_satellite.setVisible(true);
								DSS.layer.osm_topo.setVisible(false);
								DSS.layer.bingAerial.setVisible(false);
								DSS.layer.osm_streets.setVisible(false);
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
								DSS.layer.osm_satellite.setVisible(false);
								DSS.layer.osm_topo.setVisible(false);
								DSS.layer.bingAerial.setVisible(false);
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

