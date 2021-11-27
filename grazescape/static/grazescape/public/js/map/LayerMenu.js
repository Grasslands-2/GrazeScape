var layersList = 

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
		//console.log(me)
		// menuItem.add({
		// 	xtype: 'menuitem',
		// 	//itemID: 'Ploss',
		// 	text: 'Ploss',
		// 	disabled: false,
		// 	style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px; background-color: #ccc',			
		// 	checked: false,
		// 	//menu: makeOpacityMenu("hillshade", DSS.layer.hillshade, 30),
		// 	//listeners: {
		// 	// afterrender: function(self) {
		// 	// 	self.setChecked(DSS.layer.hillshade.getVisible());
		// 	// }
		// //},
		// handler: function(self) {
		// 	Ext.util.Cookies.set('DSS.layer.ploss_field'+mfieldID+':visible', self.checked ? "0" : "1");                	
		// 	layer.setVisible(self.checked);                    	
		// }
		// })
		}
		
	});
	
	//Ext.create('DSS.map.OutputMenu').show();
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
	//closeAction: Ext.getCmp('layersMenu').destroy(),
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
    				style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px'
                },{
                	xtype: 'slider',
                	itemId: 'dss-slider',
                    padding: '0 10 8 10',
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
		tMen = appendTextureMenu(tMen, DSS.layer.fields_1);
		
		Ext.applyIf(me, {
			defaults: {
				xtype: 'menucheckitem',
				padding: 2,
                hideOnClick: false,
			},
			
			items: [{ //-------------------------------------------
				xtype: 'menuitem',
				text: 'Overlays', 
				disabled: true,
				style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px; background-color: #ccc'
			},{ //-------------------------------------------
				text: 'Crops <i class="fas fa-seedling accent-text text-drp-50"></i>',
                checked: true,
                menu: tMen,//makeOpacityMenu("crop", DSS.layer.fields_1),
                listeners: {
                	afterrender: function(self) {
                		self.setChecked(DSS.layer.fields_1.getVisible());
                	}
                },
                handler: function(self) {
                	Ext.util.Cookies.set("crop:visible", self.checked ? "1" : "0");                	
                	DSS.layer.fields_1.setVisible(self.checked);                    	
                }
			},{ //-------------------------------------------
				text: 'Tainter Creek',
                checked: true,
                menu: makeOpacityMenu("tainterwatershed", DSS.layer.tainterwatershed),
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
                menu: makeOpacityMenu("rullandsCouleewshed", DSS.layer.rullandsCouleewshed),
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
                menu: makeOpacityMenu("kickapoowatershed", DSS.layer.kickapoowatershed),
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
				text: 'Base Layer', disabled: true,
				style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px; background-color: #ccc'
			},{
				xtype: 'radiogroup',
				columns: 1, 
				vertical: true,
				defaults: {
					padding: '2 0',
					group: 'base-layer'
				},
				items: [{ 
					boxLabel: 'Base Layer', 
	                checked: true,
	                text: 'Bing Aerial',
	                DSS_layer: 'bing-aerial',
	                listeners: {
	                	afterrender: function(self) {
	                		self.setValue(DSS.layer.bingAerial.getVisible());
	                	}
	                },
	                handler: function(self, checked) {
	                	DSS.layer.bingAerial.setVisible(checked);
	                	if (checked) Ext.util.Cookies.set("baselayer:visible", "1");	                	
	                }
				},{
					boxLabel: 'Open-Street',
	                DSS_layer: 'bing-aerial',
	                listeners: {
	                	afterrender: function(self) {
	                		self.setValue(DSS.layer.osm.getVisible());
	                	}
	                },
	                handler: function(self, checked) {
	                	DSS.layer.osm.setVisible(checked);
	                	if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
	                }
				}]
			},{//-----------------------------------------------------------------
				xtype: 'menuitem',
				text: 'Model Inputs', disabled: true,
				style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px; background-color: #ccc'
			},
			{
				xtype: 'button',
				text: 'Elevation',
				//bind: 'Call {menuGroups.option}',
					menu: {
						// bind: {
						// 	groups: '{menuGroups}'
						// },
						items:[
							{
								text: 'Northwest',
								//DSS_layer: 'bing-aerial',
								handler: function(self, checked) {
									DSS.layer.DEM_image0.setVisible(false);
									DSS.layer.DEM_image1.setVisible(false);
									DSS.layer.DEM_image2.setVisible(checked);
									DSS.layer.DEM_image3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Northeast',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.DEM_image0.setVisible(false);
									DSS.layer.DEM_image1.setVisible(false);
									DSS.layer.DEM_image2.setVisible(false);
									DSS.layer.DEM_image3.setVisible(checked);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Southwest',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.DEM_image0.setVisible(checked);
									DSS.layer.DEM_image1.setVisible(false);
									DSS.layer.DEM_image2.setVisible(false);
									DSS.layer.DEM_image3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},{
								text: 'Southeast',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.DEM_image0.setVisible(false);
									DSS.layer.DEM_image1.setVisible(checked);
									DSS.layer.DEM_image2.setVisible(false);
									DSS.layer.DEM_image3.setVisible(false);
									
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Remove Elevation',
								//DSS_layer: 'bing-aerial',
								handler: function(self, checked) {
									DSS.layer.DEM_image0.setVisible(false);
									DSS.layer.DEM_image1.setVisible(false);
									DSS.layer.DEM_image2.setVisible(false);
									DSS.layer.DEM_image3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							}
						]
					}
			},
			{
				xtype: 'button',
				text: 'Slope',
				//bind: 'Call {menuGroups.option}',
					menu: {
						// bind: {
						// 	groups: '{menuGroups}'
						// },
						items:[
							{
								text: 'Northwest',
								//DSS_layer: 'bing-aerial',
								handler: function(self, checked) {
									DSS.layer.Slope0.setVisible(false);
									DSS.layer.Slope1.setVisible(false);
									DSS.layer.Slope2.setVisible(checked);
									DSS.layer.Slope3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Northeast',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.Slope0.setVisible(false);
									DSS.layer.Slope1.setVisible(false);
									DSS.layer.Slope2.setVisible(false);
									DSS.layer.Slope3.setVisible(checked);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Southwest',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.Slope0.setVisible(checked);
									DSS.layer.Slope1.setVisible(false);
									DSS.layer.Slope2.setVisible(false);
									DSS.layer.Slope3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},{
								text: 'Southeast',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.Slope0.setVisible(false);
									DSS.layer.Slope1.setVisible(checked);
									DSS.layer.Slope2.setVisible(false);
									DSS.layer.Slope3.setVisible(false);
									
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Remove Slope',
								//DSS_layer: 'bing-aerial',
								handler: function(self, checked) {
									DSS.layer.Slope0.setVisible(false);
									DSS.layer.Slope1.setVisible(false);
									DSS.layer.Slope2.setVisible(false);
									DSS.layer.Slope3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							}
						]
					}
			},
			{
				xtype: 'button',
				text: 'Clay',
				//bind: 'Call {menuGroups.option}',
					menu: {
						// bind: {
						// 	groups: '{menuGroups}'
						// },
						items:[
							{
								text: 'Northwest',
								//DSS_layer: 'bing-aerial',
								handler: function(self, checked) {
									DSS.layer.Clay0.setVisible(false);
									DSS.layer.Clay1.setVisible(false);
									DSS.layer.Clay2.setVisible(checked);
									DSS.layer.Clay3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Northeast',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.Clay0.setVisible(false);
									DSS.layer.Clay1.setVisible(false);
									DSS.layer.Clay2.setVisible(false);
									DSS.layer.Clay3.setVisible(checked);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Southwest',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.Clay0.setVisible(checked);
									DSS.layer.Clay1.setVisible(false);
									DSS.layer.Clay2.setVisible(false);
									DSS.layer.Clay3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},{
								text: 'Southeast',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.Clay0.setVisible(false);
									DSS.layer.Clay1.setVisible(checked);
									DSS.layer.Clay2.setVisible(false);
									DSS.layer.Clay3.setVisible(false);
									
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Remove Clay',
								//DSS_layer: 'bing-aerial',
								handler: function(self, checked) {
									DSS.layer.Clay0.setVisible(false);
									DSS.layer.Clay1.setVisible(false);
									DSS.layer.Clay2.setVisible(false);
									DSS.layer.Clay3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							}
						]
					}
			},
			{
				xtype: 'button',
				text: 'Sand',
				//bind: 'Call {menuGroups.option}',
					menu: {
						// bind: {
						// 	groups: '{menuGroups}'
						// },
						items:[
							{
								text: 'Northwest',
								//DSS_layer: 'bing-aerial',
								handler: function(self, checked) {
									DSS.layer.Sand0.setVisible(false);
									DSS.layer.Sand1.setVisible(false);
									DSS.layer.Sand2.setVisible(checked);
									DSS.layer.Sand3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Northeast',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.Sand0.setVisible(false);
									DSS.layer.Sand1.setVisible(false);
									DSS.layer.Sand2.setVisible(false);
									DSS.layer.Sand3.setVisible(checked);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Southwest',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.Sand0.setVisible(checked);
									DSS.layer.Sand1.setVisible(false);
									DSS.layer.Sand2.setVisible(false);
									DSS.layer.Sand3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},{
								text: 'Southeast',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.Sand0.setVisible(false);
									DSS.layer.Sand1.setVisible(checked);
									DSS.layer.Sand2.setVisible(false);
									DSS.layer.Sand3.setVisible(false);
									
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Remove Sand',
								//DSS_layer: 'bing-aerial',
								handler: function(self, checked) {
									DSS.layer.Sand0.setVisible(false);
									DSS.layer.Sand1.setVisible(false);
									DSS.layer.Sand2.setVisible(false);
									DSS.layer.Sand3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							}
						]
					}
			},
			{
				xtype: 'button',
				text: 'Silt',
				//bind: 'Call {menuGroups.option}',
					menu: {
						// bind: {
						// 	groups: '{menuGroups}'
						// },
						items:[
							{
								text: 'Northwest',
								//DSS_layer: 'bing-aerial',
								handler: function(self, checked) {
									DSS.layer.Silt0.setVisible(false);
									DSS.layer.Silt1.setVisible(false);
									DSS.layer.Silt2.setVisible(checked);
									DSS.layer.Silt3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Northeast',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.Silt0.setVisible(false);
									DSS.layer.Silt1.setVisible(false);
									DSS.layer.Silt2.setVisible(false);
									DSS.layer.Silt3.setVisible(checked);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Southwest',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.Silt0.setVisible(checked);
									DSS.layer.Silt1.setVisible(false);
									DSS.layer.Silt2.setVisible(false);
									DSS.layer.Silt3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},{
								text: 'Southeast',
								//DSS_layer: 'bing-aerial',
								
								handler: function(self, checked) {
									DSS.layer.Silt0.setVisible(false);
									DSS.layer.Silt1.setVisible(checked);
									DSS.layer.Silt2.setVisible(false);
									DSS.layer.Silt3.setVisible(false);
									
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							},
							{
								text: 'Remove Silt',
								//DSS_layer: 'bing-aerial',
								handler: function(self, checked) {
									DSS.layer.Silt0.setVisible(false);
									DSS.layer.Silt1.setVisible(false);
									DSS.layer.Silt2.setVisible(false);
									DSS.layer.Silt3.setVisible(false);
									if (checked) Ext.util.Cookies.set("baselayer:visible", "3");	                	
								}
							}
						]
					}
			},
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

