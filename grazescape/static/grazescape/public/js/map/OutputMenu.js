
Ext.define('DSS.map.OutputMenu', {
//------------------------------------------------------------------------------
	extend: 'Ext.menu.Menu',
	alias: 'widget.map_output_menu',
	alternateClassName: 'DSS.OutputMenu',
	id: 'OutputMenu',
	header: {
		style: 'background: rgba(200,200,200,0.9)',
		padding: 2
	},
	//closeAction: Ext.getCmp('layersMenu').destroy(),
	closable: true,
	plain: true,
	width: 160,
	//--------------------------------------------------------------------------
	initComponent: function() {
		
		let me = this;
		
		// let makeOpacityMenu = function(key, openLayersLayer, minValue) {
		// 	minValue = minValue || 20;
		// 	return {
        //         width: 150,
        //         plain: true,
        //     	listeners: {
        //     		show: function(menu) {
        //     			menu.down('#dss-slider').setValue(openLayersLayer.getOpacity() * 100, false);
        //     			menu.setY(menu.getY() - 29);
        //     			menu.setX(menu.getX() - 20);
        //     		},
        //     	},                    
        //         items: [{
    	// 			xtype: 'menuitem',
    	// 			text: 'Opacity', disabled: true,
    	// 			style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px'
        //         },{
        //         	xtype: 'slider',
        //         	itemId: 'dss-slider',
        //             padding: '0 10 8 10',
        //         	hideEmptyLabel: true,
        //         	increment: 10,
        //         	value: 60,
        //         	minValue: minValue, 
        //         	maxValue: 100,
        //         	listeners: {
        //         		focusleave: function(self) {
        //         			console.log("leave!")
        //         		},
        //         		dragstart: function(slider) {
                			
        //         		},
        //         		change: function(slider, newValue, thumb, eOpts) {
        //         			const val = newValue / 100.0;
        //         			openLayersLayer.setOpacity(val)
        //                 	Ext.util.Cookies.set(key + ":opacity", "" + val);
        //         		}	                		
        //         	}
        //         }]
        //     }			
		// };
		// let matrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);
		// let appendTextureMenu = function(baseMenu) {
		
		// 	baseMenu.items.push({
		// 		xtype: 'menuitem',
		// 		text: 'Pattern Scale', disabled: true,
		// 		style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px',
		// 	},{
        //     	xtype: 'slider',
        //     	itemId: 'dss-slider2',
        //         padding: '0 10 8 10',
        //     	hideEmptyLabel: true,
        //     	decimalPrecision: 2,
        //     	keyIncrement: 0.05,
        //     	increment: 0.05,
        //     	value: matrix.a,
        //     	minValue: 0.2,
        //     	maxValue: 2,
        //     	listeners: {
        //     		change: function(slider, newValue, thumb, eOpts) {
        //     			matrix.a = matrix.d = newValue;
        //     			Ext.Object.eachValue(DSS.rotationStyles, function(val) {
        //     				val.getFill().getColor().setTransform(matrix);
        //     			});
        //     			DSS.layer.fields_1.changed();
        //     		}	                		
        //     	}
		// 	},{
		// 		xtype: 'menuitem',
		// 		text: 'Pattern Offset X', disabled: true,
		// 		style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px'
		// 	},{
        //     	xtype: 'slider',
        //     	itemId: 'dss-slider3',
        //         padding: '0 10 8 10',
        //     	hideEmptyLabel: true,
        //     	keyIncrement: 5,
        //     	increment: 5,
        //     	value: matrix.e,
        //     	minValue: 0, 
        //     	maxValue: 200,
        //     	listeners: {
        //     		change: function(slider, newValue, thumb, eOpts) {
        //     			matrix.e = newValue;
        //     			Ext.Object.eachValue(DSS.rotationStyles, function(val) {
        //     				val.getFill().getColor().setTransform(matrix);
        //     			});
        //     			DSS.layer.fields_1.changed();
        //     		}	                		
        //     	}
		// 	},{
		// 		xtype: 'menuitem',
		// 		text: 'Pattern Offset Y', disabled: true,
		// 		style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px'
		// 	},{
        //     	xtype: 'slider',
        //     	itemId: 'dss-slider4',
        //         padding: '0 10 8 10',
        //     	hideEmptyLabel: true,
        //     	keyIncrement: 5,
        //     	increment: 5,
        //     	value: matrix.f,
        //     	minValue: 0, 
        //     	maxValue: 100,
        //     	listeners: {
        //     		change: function(slider, newValue, thumb, eOpts) {
        //     			matrix.f = newValue;
        //     			Ext.Object.eachValue(DSS.rotationStyles, function(val) {
        //     				val.getFill().getColor().setTransform(matrix);
        //     			});
        //     			DSS.layer.fields_1.changed();
        //     		}	                		
        //     	}
				
		// 	});
		// 	return baseMenu;
		// };
		
		// let tMen = makeOpacityMenu("crop", DSS.layer.fields_1);
		// tMen = appendTextureMenu(tMen, DSS.layer.fields_1);
		
		Ext.applyIf(me, {
			//Id: 'layersMenu',
			//itemId: 'layersMenu',
			//ItemId: 'layermenu',
			defaults: {
				xtype: 'menucheckitem',
				padding: 2,
                hideOnClick: false,
			},
			
			items: [
				{
						xtype: 'menucheckitem',
						//itemID: 'Ploss',
						text: 'Ploss',
						disabled: false,
						//style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px; background-color: #ccc',			
						checked: true,
						//menu: makeOpacityMenu("hillshade", DSS.layer.hillshade, 30),
						listeners: {
						 afterrender: function(self) {
						 	self.setChecked(DSS.layer.ploss_field.getVisible());
						 }
					},
					handler: function(self) {
						console.log('ploss clicked')
						DSS.map.getLayers().forEach(function (layer){
							console.log(layer);
							if(layer.values_.name == 'DSS.layer.ploss_field_'+ mfieldID){
								console.log(layer);
							}
						})
						Ext.util.Cookies.set('DSS.layer.ploss_field:visible', self.checked ? "0" : "1");                	
						DSS.layer.ploss_field.setVisible(self.checked);
				}
			}]
		});
		
		me.callParent(arguments);
	},

});

