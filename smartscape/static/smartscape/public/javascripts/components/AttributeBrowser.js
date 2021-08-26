//-----------------------------------------------------
// DSS.components.AttributeBrowser
//
//-----------------------------------------------------
Ext.define('DSS.components.AttributeBrowser', {
    extend: 'Ext.container.Container',
    alias: 'widget.attributebrowser',
 
    requires: [
        'DSS.components.LayerBase',
        'DSS.components.LayerIndexed',
        'DSS.components.LayerLandcoverFilter',
        'DSS.components.LayerFloat',
        'DSS.components.LayerFarmInteraction',
        'DSS.components.LayerLandSubset',
        'DSS.components.LayerCriticalMass',
        'DSS.components.LayerClickSelect',
        'DSS.components.LayerDrawShape',
    ],
    
    padding: 4,
	style: 'background: rgba(48,64,96,0.8); border: 1px solid #256;border-radius: 16px; box-shadow: 0 10px 10px rgba(0,0,0,0.4)' ,
//	resizable: 'true',
//	resizeHandles: 's',
	layout: {
		type: 'vbox',
		align: 'center',
		//pack: 'center'
	},
	
	id: 'DSS_attributeFixMe',
	DSS_Layers: [],
	DSS_Processing: false,
	DSS_TimeoutId: false,
	
	listeners: {
		afterrender: function(me) {
			//------------------------------------------------------------
			Ext.suspendLayouts();
			//------------------------------------------------------------
			var lt/* = Ext.create('DSS.components.LayerIndexed', {
				title: 'Landcover Type',
				DSS_serverLayer: 'cdl_2012',
				DSS_indexConfig: [
					{boxLabel: 'Corn', 		name: "lt", indexValues: [1]},
					{boxLabel: 'Soy', 		name: "lt", indexValues: [16]},
					{boxLabel: 'Alfalfa', 	name: "lt", indexValues: [17]},
					{boxLabel: 'Grass', 	name: "lt", indexValues: [6]},
					{boxLabel: 'Grains', 	name: "lt", indexValues: [2]},
					{boxLabel: 'Wetlands', 	name: "lt", indexValues: [8]},
					{boxLabel: 'Developed', name: "lt", indexValues: [10,11], checked: true},
					{boxLabel: 'Woodland',	name: "lt", indexValues: [7]}
				],
			});
			DSS.Layers.add(lt);*/

/*			lt = Ext.create('DSS.components.LayerIndexed', {
				title: 'Wisc Land',
				DSS_serverLayer: 'wisc_land',
				DSS_columns: 3,
				hidden: true,
				DSS_indexConfig: [
					{boxLabel: 'Cont. Corn', name: "wl", indexValues: [1]},
					{boxLabel: 'Cash Grain', name: "wl", indexValues: [14]},
					{boxLabel: 'Dairy Rotn', name: "wl", indexValues: [15]},
					{boxLabel: 'Other Crops', name: "wl", indexValues: [16]},
					{boxLabel: 'Grass', 	name: "wl", indexValues: [2,3,4,5]},
					{boxLabel: 'Hay', 		name: "wl", indexValues: [2]},
					{boxLabel: 'Pasture', 	name: "wl", indexValues: [3]},
					{boxLabel: 'Warm Grass', name: "wl", indexValues: [5]},
					{boxLabel: 'Cool Grass', name: "wl", indexValues: [4]},
					{boxLabel: 'Wetlands', 	name: "wl", indexValues: [10]},
					{boxLabel: 'Shrubland', name: "wl", indexValues: [17]},
					{boxLabel: 'Developed', name: "wl", indexValues: [12,13], checked: true},
					{boxLabel: 'Woodland',	name: "wl", indexValues: [6,7,8]},
					{boxLabel: 'Conifers',	name: "wl", indexValues: [6]},
					{boxLabel: 'Deciduous',	name: "wl", indexValues: [7]},
				],
			});
			me.addLayer(lt);
*/			
			//----------------------------------------------------------
			lt = Ext.create('DSS.components.LayerIndexed', {
				title: 'Landcover Type (WiscLand 2.0)',
				DSS_serverLayer: 'wisc_land',
				DSS_active: false,
				hidden: true,
				DSS_columns: 2,
				DSS_indexConfig: [
					{boxLabel: 'Continuous Corn', name: "wl", indexValues: [1]},
					{boxLabel: 'Cash Grain', name: "wl", indexValues: [14]},
					{boxLabel: 'Dairy Rotation', name: "wl", indexValues: [15]},
					{boxLabel: 'Other Crops',	name: "wl", indexValues: [16]},
					{boxLabel: 'Hay', 		name: "wl", indexValues: [2]},
					{boxLabel: 'Pasture', 	name: "wl", indexValues: [3]},
					{boxLabel: 'Warm-Season Grass', name: "wl", indexValues: [5]},
					{boxLabel: 'Cool-Season Grass', name: "wl", indexValues: [4]},
					{boxLabel: 'Developed', name: "wl", indexValues: [12,13], checked: true},
					{boxLabel: 'Woodland',	name: "wl", indexValues: [6,7,8]},
					{boxLabel: 'Wetland',	name: "wl", indexValues: [10]},
					{boxLabel: 'Barren/Scrub',	name: "wl", indexValues: [11,17]},
				],
			});
			me.addLayer(lt);

			//----------------------------------------------------------
			me.addLayer(Ext.create('DSS.components.LayerFloat', {
				title: 'Slope',
				hidden: true,
				DSS_shortTitle: 'Slope',
				DSS_serverLayer: 'slope',
				DSS_layerUnit: ' (degrees)',
				DSS_greaterThanValue: 5
			}));

			//----------------------------------------------------------
			me.addLayer(Ext.create('DSS.components.LayerFloat', {
				title: 'Distance to Streams / Surface Water',
				hidden: true,
				DSS_shortTitle: 'Distance',
				DSS_serverLayer: 'dist_to_water',
				DSS_lessThanValue: 120,
				DSS_greaterThanValue: null,
				DSS_maxValue: 5250,
				DSS_stepSize: 30
			}));

		/*	//----------------------------------------------------------
			me.addLayer(Ext.create('DSS.components.LayerFloat', {
				title: 'Distance to Rivers',
				hidden: true,
				DSS_shortTitle: 'Distance',
				DSS_serverLayer: 'rivers',
				DSS_greaterThanValue: 90,
				DSS_maxValue: 5250,
				DSS_stepSize: 30
			}));
	*/
			//----------------------------------------------------------
			me.addLayer(Ext.create('DSS.components.LayerIndexed', {
				title: 'Land Capability Class',
				hidden: true,
				DSS_serverLayer: 'lcc', DSS_columns: 2,
				DSS_indexConfig: [
					{boxLabel: 'Cropland I (Best)', 	name: "lcc", indexValues: [1], checked: true},
					{boxLabel: 'Cropland II', 	name: "lcc", indexValues: [2]},
					{boxLabel: 'Cropland III', 	name: "lcc", indexValues: [3]},
					{boxLabel: 'Cropland IV', 	name: "lcc", indexValues: [4]},
					{boxLabel: 'Marginal I', 	name: "lcc", indexValues: [5]},
					{boxLabel: 'Marginal II', 	name: "lcc", indexValues: [6]},
					{boxLabel: 'Marginal III', 	name: "lcc", indexValues: [7]},
					{boxLabel: 'Marginal IV (Worst)', 	name: "lcc", indexValues: [8]},
				],
			}));
			
			//----------------------------------------------------------
			me.addLayer(Ext.create('DSS.components.LayerIndexed', {
				title: 'Land Capability Subclass',
				hidden: true,
				DSS_serverLayer: 'lcs', DSS_columns: 2,
				DSS_indexConfig: [
					{boxLabel: 'Erosion Prone', 	name: "lcs", indexValues: [1], checked: true},
					{boxLabel: 'Saturated Soils', 	name: "lcs", indexValues: [2]},
					{boxLabel: 'Poor Soil Texture', name: "lcc", indexValues: [3]},
				],
			}));
			
			//----------------------------------------------------------
			me.addLayer(Ext.create('DSS.components.LayerFloat', {
				title: 'Distance to Public Lands',
				hidden: true,
				DSS_shortTitle: 'Distance',
				DSS_serverLayer: 'public_land',
				DSS_lessThanValue: 180,
				DSS_maxValue: 5250,
				DSS_stepSize: 30
			}));
			
			me.addLayer(Ext.create('DSS.components.LayerClickSelect', {
				title: 'Watershed (HUC-10)',
				hidden: true,
				DSS_serverLayer: 'huc-10',
				DSS_vectorLayer: watershed
			}));
			
			me.addLayer(Ext.create('DSS.components.LayerClickSelect', {
				title: 'County',
				hidden: true,
				DSS_serverLayer: 'counties',
				DSS_vectorLayer: county
			}));
			
			me.addLayer(Ext.create('DSS.components.LayerFarmInteraction', {
				hidden: true
			}))
			
			me.addLayer(Ext.create('DSS.components.LayerCriticalMass', {
				hidden: true
			}))
			
			me.addLayer(Ext.create('DSS.components.LayerLandSubset', {
				hidden: true
			}))

		/*	me.addLayer(Ext.create('DSS.components.LayerDrawShape', {
				hidden: true
			}));
		*/	
			
			var val = true;
			//----------------------------------------------------------
			lt = Ext.create('DSS.components.LayerLandcoverFilter', {
				title: 'Restrict Selection to',
				DSS_serverLayer: 'wisc_land',
				DSS_active: true,
				DSS_columns: 3,
				DSS_groups: [
					{boxLabel: 'All row crops', name: 'lctf', inputValue: 'total_options0', checked: val,
						DSS_subItems: [
							{boxLabel: 'Continuous Corn', name: "wl", indexValues: [1], margin: '-2 0', checked: val},
							{boxLabel: 'Cash Grain', name: "wl", indexValues: [14], margin: '-2 0', checked: val},
							{boxLabel: 'Dairy Rotation', name: "wl", indexValues: [15], margin: '-2 0', checked: val}
						]
					},
					{boxLabel: 'All grasses', name: 'lctf', inputValue: 'total_options1',
						DSS_subItems: [
							{boxLabel: 'Hay', 		name: "wl", indexValues: [2], margin: '-2 0'},
							{boxLabel: 'Pasture', 	name: "wl", indexValues: [3], margin: '-2 0'},
							{boxLabel: 'Warm Grass', name: "wl", indexValues: [5], margin: '-2 0'},
							{boxLabel: 'Cool Grass', name: "wl", indexValues: [4], margin: '-2 0'}
						]
					},
					{boxLabel: 'Other', name: 'lctf', inputValue: 'total_options2',
						DSS_subItems: [
							{boxLabel: 'Other', name: "wl", indexValues: [6,7,8,9,10,12,13,11,16,17], margin: '-2 0'},
						]
					},
				]
			});
			me.addLayer(lt);
			
			
			//------------------------------------------------------------
			Ext.resumeLayouts(true);
			//------------------------------------------------------------
			Ext.defer(function() {
				me.valueChanged();
			}, 1500);
		}
	},
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		me['DSS_layerMenu'] = Ext.create('Ext.menu.Menu', {
			padding: 8,
			style: 'border-radius: 8px; background: rgba(48,64,96,0.8); border: 1px solid #256; box-shadow: 0 8px 8px rgba(0,0,0,0.4)',
			width: 320,
			shadow: false,
			header: {
				style: 'color: #fff; font-weight: bold; text-shadow: 1px 1px 1px #000',
				padding: '0 4 4 8',
				title: 'Available Characteristics',
			},
			tools: [{
				iconCls: 'inverted-close-icon',
				callback: function(owner, tool) {
					owner.hide();
				}
			}],
			bodyStyle: 'border-radius: 4px; border: 1px solid #ddd',
			plain: true,
			defaults: {
				hideOnClick: false,
				padding: 2,
				style: 'border-bottom: 1px solid #eee;',
				handler: function(self,evt) {
					self.setVisible(false);
					self.DSS_menuLink.setVisible(true);
					me.valueChanged();
					var hide = true;
					Ext.each(me.DSS_layerMenu.items.items, function(item) {
						if (item.isVisible()) {
							hide = false; return false;
						}
					});
					if (hide) {
						me.DSS_layerMenu.close()
						me.getComponent('DSS-add-layer-tool').setVisible(false);
					}
				}
			}
		});
		
		Ext.applyIf(me, {
			items:[{
				xtype: 'component',
				style: 'color: #fff; font-size: 1.1em; font-weight: bold; text-shadow: 1px 1px 1px #000',
				html: 'Match Land by Characteristics',
				width: '100%',
				padding: '2 0 2 8'
			},{
				xtype: 'container',
				itemId: 'DSS_findLandByAttr',
				flex: 1,
				width: 350,
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				scrollable: 'vertical',
			},{
				xtype: 'tool',
				itemId: 'DSS-add-layer-tool',
				margin: '2 0 0 0',
				hidden: true,
				iconCls: 'inverted-plus-icon',
				tooltip: 'Choose other landscape characteristics to match on...',
				callback: function(owner, self, evt) {
					me.DSS_layerMenu.showBy(self, 'l-bl', [0,16]);
				}
				
			}]
		});
		
		me.callParent(arguments);
	},
	
	addLayer: function(layer) {
		var me = this;
		me.DSS_Layers.push(layer);
		layer.DSS_browser = me;
		me.getComponent('DSS_findLandByAttr').add(layer);
		
		me['DSS_layerMenu'].add({
			xtype: 'menuitem',
			hidden: !layer.hidden,
			text: '+ ' + layer.title,
			DSS_menuLink: layer
		})
		if (layer.hidden) {
			me.getComponent('DSS-add-layer-tool').setVisible(true);
		}
	},
		
	layerHidden: function(layer) {
		var me = this;
		Ext.each(me.DSS_layerMenu.items.items, function(item) {
			if (item.DSS_menuLink == layer) {
				item.setVisible(true);
				me.getComponent('DSS-add-layer-tool').setVisible(true);
				me.valueChanged();
				return false;
			}
		})
	},
	
	//------------------------------------------------------------
	deferValueUpdates: function() {
		var me = this;
		if (me.DSS_TimeoutId) clearTimeout(me.DSS_TimeoutId);
		me.processing = true;
	},

	//------------------------------------------------------------
	flushValueUpdates: function() {
		var me = this;
		if (me.DSS_TimeoutId) clearTimeout(me.DSS_TimeoutId);
		me.processing = false;
		me.DSS_TimeoutId = setTimeout(me.executeUpdate.bind(me), 10)
	},
	
	//------------------------------------------------------------
	valueChanged: function() {
		var me = this;
		if (me.DSS_TimeoutId) clearTimeout(me.DSS_TimeoutId);
		me.DSS_TimeoutId = setTimeout(me.executeUpdate.bind(me), 300)
	},
	
	//------------------------------------------------------------
	executeUpdate: function() {
		var me = this;
		if (!me.processing) {
			me.processing = true;
//			me.getSelectionParms();
		}
		else {
			if (me.DSS_TimeoutId) clearTimeout(me.DSS_TimeoutId);
			me.DSS_TimeoutId = setTimeout(me.executeUpdate.bind(me), 300)
		}
		Ext.getCmp('dss-selection-loading').animate({
			duration: 100,
			to: {
				opacity: 1
			}
		});
	},
	
	//------------------------------------------------------------
	getSelectionParms: function() {
		var me = this;
		var queryData = me.getCurrentQuery()
		
		var obj = Ext.Ajax.request({
			url: location.href + '/createSelection',
			jsonData: {
				queryLayers: queryData,
				// FIXME: what the?
				/*first: {
					queryLayers: [{
						"name":"dist_to_water","type":"continuous","lessThanTest":"<=","greaterThanTest":">=","lessThanValue":120
					}]
				},
				second: {
					queryLayers: queryData
				}*/
			},
			timeout: 25000, // in milliseconds
			
			success: function(response, opts) {
				var obj = JSON.parse(response.responseText);
				// grrrr, mangle
				var b = obj.bounds;
				obj.bounds = [b.x, b.y, b.x+b.w, b.y+b.h];
				
				var area = (obj.selectedPixels * 30.0 * 30.0) / 1000000.0;
				// then convert from km sqr to acres (I know, wasted step, just go from 30x30 meters to acres)
				area *= 247.105;
		    
				var totalAreaPerc = (obj.selectedPixels / obj.totalPixels) * 100.0;
				
				var area = Ext.util.Format.number(area, '0,000.#'), 
					perc = Ext.util.Format.number(totalAreaPerc, '0.###');
					
				Ext.getCmp('yes-dss-selected-stats').setHtml(area + ' acres<br/>' + perc + '%');
				Ext.getCmp('yes-dss-selected-stats2').setHtml('---<br/>--');
				DSS_viewport.positionStatistics(true);
				me.validateImageOL(obj);			
			},
			
			failure: function(respose, opts) {
				alert("Query failed, request timed out?");
				me.processing = false;
				Ext.getCmp('dss-selection-loading').animate({
					duration: 100,
					to: {
						opacity: 0
					}
				});
			}
		});
	},
	showOcclusion: function(firstQueries, secondQuery) {
		var me = this;
		Ext.getCmp('dss-selection-loading').animate({
			duration: 100,
			to: {
				opacity: 1
			}
		});
		
		var obj = Ext.Ajax.request({
			url: location.href + '/showOcclusion',
			jsonData: {
				first:  firstQueries,
				second: secondQuery
			},
			timeout: 25000, // in milliseconds
			
			success: function(response, opts) {
				var obj = JSON.parse(response.responseText);
				
				// grrrr, mangle
				var b = obj.bounds;
				obj.bounds = [b.x, b.y, b.x+b.w, b.y+b.h];
				
				if (obj.selectedPixelsFirst) {
					var diff = obj.selectedPixelsSecond - obj.occludedSecondPixels;
					// convert from km sqr to acres (I know, wasted step, just go from 30x30 meters to acres)
					var area = ((diff * 30.0 * 30.0) / 1000000.0) * 247.105;
					var totalAreaPerc = (diff / obj.totalPixels) * 100.0;
					
					var occArea = ((obj.occludedSecondPixels * 30.0 * 30.0) / 1000000.0) * 247.105;
					var totalOccPerc = obj.occludedSecondPixels / obj.selectedPixelsSecond * 100.0;
					
					var area = Ext.util.Format.number(area, '0,000.#'), 
						perc = Ext.util.Format.number(totalAreaPerc, '0.###');
					Ext.getCmp('yes-dss-selected-stats').setHtml(area + ' acres<br/>' + perc + '%');
					
					area = Ext.util.Format.number(occArea, '0,000.#'), 
					perc = Ext.util.Format.number(totalOccPerc, '0.###');
					Ext.getCmp('yes-dss-selected-stats2').setHtml(area + ' acres<br/>' + perc + '%');
				}
				else {
					// convert from km sqr to acres (I know, wasted step, just go from 30x30 meters to acres)
					var area = ((obj.selectedPixels * 30.0 * 30.0) / 1000000.0) * 247.105;
					var totalAreaPerc = (obj.selectedPixels / obj.totalPixels) * 100.0;
					var area = Ext.util.Format.number(area, '0,000.#'), 
						perc = Ext.util.Format.number(totalAreaPerc, '0.###');
					Ext.getCmp('yes-dss-selected-stats').setHtml(area + ' acres<br/>' + perc + '%');
					Ext.getCmp('yes-dss-selected-stats2').setHtml('---<br/>--');
				}
				me.validateImageOL(obj);			
			},
			
			failure: function(respose, opts) {
				alert("Query failed, request timed out?");
				me.processing = false;
				Ext.getCmp('dss-selection-loading').animate({
					duration: 100,
					to: {
						opacity: 0
					}
				});
			}
		});
	},
	
	//---------------------------------------------------------------------------------
	validateImageOL: function(json, tryCount) {
		var me = this;
		tryCount = (typeof tryCount !== 'undefined') ? tryCount : 0;
		
		Ext.defer(function() {
				
			var src = new ol.source.ImageStatic({
				url: json.url,
				crossOrigin: '',
				projection: 'EPSG:3857',
				imageExtent: json.bounds
			});			
			src.on('imageloadend', function() { // IMAGELOADEND: 'imageloadend',

				selectionLayer.setSource(src);
				me.processing = false;
				Ext.getCmp('dss-selection-loading').animate({
					duration: 250,
					to: {
						opacity: 0
					}
				});
			});
			src.on('imageloaderror', function() { // IMAGELOADERROR: 'imageloaderror'
				tryCount++;
				if (tryCount < 20) {
					me.validateImageOL(json, tryCount);
				}
				else {
					//failed
					me.processing = false;
					Ext.getCmp('dss-selection-loading').animate({
						duration: 250,
						to: {
							opacity: 0
						}
					});
				}
			});
			src.M.load(); // EVIL internal diggings...M is the secret internal ol.Image
		}, 50 + tryCount * 50, me); //  
	},
	
	//---------------------------------------------------------------------------------
	cancelClickActionsForAllBut: function(layer) {
		var me = this;
		Ext.each(me.DSS_Layers, function(test) {
			if (layer.getId() != test.getId()) {
				if (test.cancelClickSelection) {
					test.cancelClickSelection();
				}
			} 
			else {
			}
		})
	},
	
	//---------------------------------------------------------------------------------
	getCurrentQuery: function() {
		var me = this,
			queryData = [];
		Ext.each(me.DSS_Layers, function(layer) {
			var result = layer.configureSelection();
			if (result) queryData.push(result);
		})
		return queryData;
	},
	
	//---------------------------------------------------------------------------------
	configureFromQuery: function(query, runQuery) {
		var me = this;
		
		Ext.suspendLayouts();
		me.deferValueUpdates();

		// hide all
		Ext.each(me.DSS_Layers, function(layer) {
			layer.setVisible(false);
			me.layerHidden(layer);
		});
		
		// show needed
		Ext.each(query, function(queryStep) {
			Ext.each(me.DSS_Layers, function(layer) {
				if (queryStep.name == layer.DSS_serverLayer) {
					layer.setVisible(true);
					layer.fromQuery(queryStep);
					return false;
				}
			})
		})
		Ext.resumeLayouts(true);
		if (!runQuery) return;
		
		me.flushValueUpdates();
	}
	
});
