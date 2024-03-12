
//------------------------------------------------------------------------------
Ext.define('DSS.view.PortalViewport', {
//------------------------------------------------------------------------------
	extend: 'Ext.container.Viewport',
    renderTo: Ext.getBody(),
	
    id: 'dss-main-view',
    
	requires: [
		'DSS.app_portal.Footer',
		'DSS.app_portal.AOI_Map',
		'DSS.app_portal.AOI',
		'DSS.app_portal.AOI_Refinement',
		'DSS.app_portal.LaunchSummary',
		//'DSS.app_portal.Assumptions',
		'DSS.components.TriangleMixer',
		'DSS.app_portal.ValuesAssessment',
		'DSS.components.d3_nav',
		'DSS.components.d3_portalStatistics'		
	],

	// most desktops/tablets support 1024x768 but Nexus 7 (2013) is a bit smaller so target that if at all possible
	minWidth: 750,
	minHeight: 720,
	style: "background: #F0F2F0;background: -webkit-linear-gradient(to top, #a1b3a1, #ddc, #edefea) fixed; background: linear-gradient(to top, #a1b3a1, #ddc,  #edefea) fixed;",

	autoScroll: true,
	layout: {
		type: 'vbox',
		align: 'middle'
	},
	defaults: {
		xtype: 'container',
	},
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				width: 310, height: 70,
				margin: '16 0 8 0',
				html: '<a href="/assets/wip/landing_bs.html"><img src="assets/images/dss_logo.png" style="width:100%"></a>',
			},{
				xtype: 'd3_nav',
				itemId: 'dss-navigator',
				width: 720, height: 68,
				DSS_elements: [{
					text: 'Select',
					active: true,
					activeText: 'Select an Area of Interest',
					tooltip: 'Select an area of interest',
					DSS_selectionChanged: function(selected) {
						Ext.getCmp('dss-region-grid').updateState(selected);
						if (selected) {
							DSS_PortalMap.setMode('region');
							Ext.getCmp('dss-region-grid').animate({
								duration: 500, to: { left: 0 }
							});
							Ext.getCmp('dss-region-refinement').animate({duration: 500, to: { left: 380 }});
							Ext.getCmp('dss-launch-summary').animate({duration: 500, to: { left: 760 }});
						}
					}
				},{
					text: 'Refine',
					disabled: true,
					activeText: 'Refine Area of Interest (optional)',
					tooltip: 'Optionally refine the area of interest by choosing a county or a watershed',
					disabledTooltip: 'Select an Area of Interest to proceed',
					DSS_selectionChanged: function(selected) {
						Ext.getCmp('dss-region-refinement').updateState(selected);
						if (selected) {
							Ext.getCmp('dss-region-refinement').animate({
								dynamic: true,duration: 500, to: { left: 0 }
							});
							Ext.getCmp('dss-region-grid').animate({dynamic: true,duration: 500, to: { left: -380 }});
							Ext.getCmp('dss-launch-summary').animate({dynamic: true,duration: 500, to: { left: 380 }});
							DSS_PortalMap.setMode('refine');
						}
					}
				},{
					text: 'Values',
					disabled: true,
					activeText: 'Set Personal Values (optional)',
					tooltip: 'Tell SmartScape about your values if desired',
					disabledTooltip: 'Select an Area of Interest to proceed',
					DSS_selectionChanged: function(selected) {
						var item = me['DSS_ValuesAssessment'];
						if (!item) {
							item = me['DSS_ValuesAssessment'] = Ext.create('DSS.app_portal.ValuesAssessment',
									{height: 1});
						}
						if (selected) {
							Ext.defer(function() {
								//item.setHeight(1);
								item.animate({
									duration: 500,
									dynamic: true,
									to: {
										height: 520
									}
								//}).show().anchorTo(me.down('#dss-navigator'), 'tc-bc', [0,8])
								}).show().anchorTo(me.down('#dss-action-side'), 'tl-tl', [0,0])
							}, 50);
							var pie = me.down('#dss-radar').setVisible(true);
							Ext.getCmp('d3-portal-stats').setHidden(true);
							Ext.getCmp('dss-selected-info').setHidden(true);
							Ext.getCmp('dss-portal-title').setHidden(true);
						}
						else {
							if (item.isVisible()) {
								item.animate({
									duration: 500,
									dynamic: true,
									to: {
										height: 0
									},
									callback: function() {
										item.setHidden()
									}
								})
							}
							Ext.getCmp('dss-selected-info').setVisible(true);
							Ext.getCmp('d3-portal-stats').setVisible(true);
							Ext.getCmp('dss-portal-title').setVisible(true);
							var pie = me.down('#dss-radar').setVisible(false);
						}
					}
				},{
					text: 'Start',
					disabled: true,
					activeText: 'Start SmartScape',
					tooltip: 'Start the SmartScape application with the chosen Area of Interest',
					disabledTooltip: 'Select an Area of Interest to proceed',
					DSS_selectionChanged: function(selected) {
						if (selected) {
							DSS_PortalMap.setMode('refine');
							var cmp = Ext.getCmp('dss-region-grid');
							if (cmp.getX() != -380) {
								cmp.animate({duration: 500, to: { left: -760 }});
							}
							cmp = Ext.getCmp('dss-region-refinement');
							if (cmp.getX() != -380) {
								cmp.animate({duration: 500, to: { left: -380 }});
							}
							Ext.getCmp('dss-launch-summary').animate({
								duration: 500, to: { left: 0 }
							});
							me.down('#dss-stats').animate({
								to: {
									opacity: 0
								},
								callback: function() {
									me.down('#dss-stats').setHidden(true)
								}
								
							})
							me.down('#dss-action-widget').animate({
								duration: 1250,
								delay: 750,
								to: {
									x: me.down('#dss-action-side').getX() + 380/2
								}
							});
						}
						else {
							me.down('#dss-stats').setVisible(true)
							me.down('#dss-stats').animate({
								delay: 500,
								to: {
									opacity: 1
								}
							})
							me.down('#dss-action-widget').animate({
								duration: 500,
								to: {
									x: me.down('#dss-action-side').getX()
								}
							});
						}
					}
				}],
			},{
				margin: '0 8 8 8',
				itemId: 'dss-action-side',
				height: 520,
				width: 760,
				layout: 'absolute',
				items: [{
					xtype: 'container',
					itemId: 'dss-action-widget',
					//x: 0,
					x: (760 - 380) / 2,
					width: 380,
					height: 520,
					layout: {
						type: 'vbox',
						pack: 'start',
						align: 'stretch'
					},
					items: [{
						xtype: 'container',
					//	style: 'border: 1px solid #ccc; border-radius: 2px;',// background-color: #fff',
						flex: 1,
						layout: {
							type: 'vbox',
							align: 'stretch',
							pack: 'middle',
						},
						items: [{
							xtype: 'container',
							margin: '0 0 4 0',
							id: 'dss-action-holder',
						//	style: 'overflow: hidden',
							layout: 'absolute',
							style: 'background: rgba(255,255,255,0.5); border-bottom-left-radius: 12px;border-bottom-right-radius: 12px',
							minHeight: 200, maxHeight: 200,
							maxWidth: 380,
							defaults: {
								bodyStyle: 'background: transparent',
								border: 0
							},
							items: [{
								id: 'dss-region-grid',
								xtype: 'aoi',
								onActivated: function() {
									var stats = me.down('#dss-stats');
									if (stats.isHidden()) {
										var pie = me.down('#dss-pie');
										var radar = me.down('#dss-radar');
										
										stats.setX(me.getWidth() + 1);
										stats.setVisible(true);
										stats.animate({
											delay: 50,
											duration: 750,
											to: {
												x: me.down('#dss-action-side').getX() + 388
											}
										})
										me.down('#dss-action-widget').animate({
											duration: 750,
											to: {
												x: me.down('#dss-action-side').getX()
											}
										});
										me.down('#dss-navigator').enableAll();
										Ext.defer(function() {
										/*	Ext.getCmp('d3-portal-stats').animate({
												duration: 2000,
												from: {opacity: 0},
												to: {opacity: 1}
											})*/
											Ext.getCmp('d3-portal-stats').reveal();
										},1000);
										
									}
								},
								maxWidth: 380,
								x: 0,
								y: 0
							},{
								id: 'dss-region-refinement',
								xtype: 'aoi_refinement',
								maxWidth: 380,
								x: 380,
								y: 0
							},{
								id: 'dss-launch-summary',
								xtype: 'launch_summary',
								maxWidth: 380,
								x: 760,
								y: 0
							}]
						},{
							xtype: 'checkbox',
							hidden: true,
							id: 'dss-portal-auto-zoom',
							margin: '4 16',
							boxLabel: 'Map Auto-Zoom + Auto-Pan' ,
							checked: true,
						},{
							xtype: 'aoi_map',
							id: 'dss-portal-map',
							flex: 1
						}]
					}]
				},{
					xtype: 'container',
					itemId: 'dss-stats',
					style: 'background: rgba(255,255,255,0.5); border-radius: 8px',
					hidden: true,
					padding: 8,
					width: 380, height: 520,
					layout: {
						type: 'vbox',
						align: 'stretch',
						pack: 'start'
					},
					items: [{
						xtype: 'component',
						style: 'color: #346; font-size: 16px; font-weight: bold',
						id: 'dss-selected-region',
//						margin: 8,
						html: 'Region: '
					},{
						xtype: 'component',
						id: 'dss-selected-info',
						style: 'color: #333',
						margin: '4 16',
						minHeight: 100//4//
					},{
						xtype: 'component',
						id: 'dss-portal-title',
						style: 'color: #346; font-size: 14px; font-weight: bold',
						html: 'Modeled Outcome within Landcover Proportion'
					},{
						xtype: 'portal_statistics',
					//	hidden: true
					},
						pieDef, 
						radarDef,
					{
						xtype: 'component',
						id: 'dss-hidden-pad',
						height: 1
					}]
				}]
			},{
				flex: 1,
			},{
				xtype: 'footer'
			}]
		});
		
		me.callParent(arguments);
		me['dss-help-tool'] = Ext.create('Ext.panel.Tool', {
			type: 'help',
			floating: true,
			shadow: false,
			callback: function() {
				Ext.defer(me.doFakeArrow, 200);
			}
		}).show().anchorTo(me, 'tr-tr', [-16,16]);
		
	},
	
	//------------------------------------------------------------------
	getProportions: function(selected, fast) {
    	var me = this;
		var obj = Ext.Ajax.request({
			url: '/app/getLandcoverProportions',
			jsonData: selected || {},
			timeout: 10000,
			scope: me,
			
			success: function(response, opts) {
				if (response.responseText != '') {
					var obj = JSON.parse(response.responseText);
					Ext.getCmp('d3-portal-stats').updatePieTo(obj, fast);
					var chartData = Ext.data.StoreManager.lookup('dss-proportions');
					for (var i = 0; i < obj.length; i++) {
						var rec = chartData.findRecord("name", obj[i].type);
						if (rec) {
							rec.set('data1', obj[i].val, {commit:true});
							rec.set('sub', obj[i].sub, {commit:true});
						}
					}
				}
			},
			failure: function(response, opts) {
				console.log(response);
			}
		});
		
	},
	
	//------------------------------------------------------------------
	getRadar: function(selected) {
    	var me = this;
    	
    	
    	function rescale(val, baseline) {
    		var max = val;
    		if (baseline > max) {
    			max = baseline;
    		}
    		// Fix negative value problem
    		if (val < 0 & baseline < 0){
    			val = -val;
    			baseline = -baseline;
    			
    			var max = val;
    			if (baseline > max) {
    				max = baseline;
    			}
    		}
    		else if (val < 0){
    			max = baseline - 2 * val;
    			val = -val;
    			baseline = max;
    		}
    		else if (baseline < 0){
    			max = val - 2 * baseline;
    			baseline = -baseline;
    			val = max;
    		}
			return {val: val/max * 100.0, base: baseline / max * 100.0};
    	}
    	
    	function grade(val, bad, ok, good, great) {
    		if (val <= bad) {
    			return val / bad * 0.25
    		}
    		else if (val <= ok) {
    			return (val - bad) / (ok - bad) * 0.25 + 0.25
    		}
    		else if (val <= good) {
    			return (val - bad) / (good) * 0.25 + 0.5
    		}
    		else if (val <= great) {
    			return (val - bad) / (great) * 0.25 + 0.75
    		}
    		return 1
    	}
		var obj = Ext.Ajax.request({
			url: '/app/getRadarData',
			jsonData: selected || {},
			timeout: 10000,
			scope: me,
			
			success: function(response, opts) {
				if (response.responseText != '') {
					var obj = JSON.parse(response.responseText);
					
					var radarData = Ext.data.StoreManager.lookup('dss-values');
					
					var values = [
						{v:grade(obj.bh, 0.2, 0.3, 0.45, 1.0), t:'Bird Habitat'},
						{v:grade(obj.ps, 0.23, 0.4, 0.6, 1.0), t:'Pest Suppression'},
						{v:1 - grade(obj.ni, -25, 90, 180, 400), t:'N Retention'},
						{v:grade(obj.sl, 0.04, 0.1, 0.24, 2.0), t:'Soil Retention'},
						{v:grade(obj.gb, 200, 410, 700, 2000), t:'P Retention'},
						{v:grade(obj.sc, 5, 11, 16, 60), t:'Soil Carbon'},
						{v:grade(0.008 - obj.em, .0069, .0072, .0073, .0082), t:'Emissions'},
						{v: grade(obj.pl, 0.1, 0.15, 0.25, 1.0), t:'Pollinators'}
					];
					Ext.getCmp('d3-portal-stats').updateRadarTo(values);
	
					var rec = radarData.findRecord("type", 'pl');
					if (rec) {
						var v = rescale(obj.pl, rec.get('base'))
						rec.set('data1', v.val)
						rec.set('data2', v.base);
						rec.set('dataBak', v.val)
					}
					
					rec = radarData.findRecord("type", 'bh');
					if (rec) {
						var v = rescale(obj.bh, rec.get('base'))
						rec.set('data1', v.val)
						rec.set('data2', v.base);
						rec.set('dataBak', v.val)
					}
					
					rec = radarData.findRecord("type", 'ps');
					if (rec) {
						var v = rescale(obj.ps, rec.get('base'))
						rec.set('data1', v.val)
						rec.set('data2', v.base);
						rec.set('dataBak', v.val)
					}
					
					rec = radarData.findRecord("type", 'ni');
					if (rec) {
						var v = rescale(obj.ni, rec.get('base'))
						rec.set('data1', v.val)
						rec.set('data2', v.base);
						rec.set('dataBak', v.val)
					}
					
					rec = radarData.findRecord("type", 'sr');
					if (rec) {
						var v = rescale(obj.sl, rec.get('base'))
						rec.set('data1', v.val)
						rec.set('data2', v.base);
						rec.set('dataBak', v.val)
					}
					
					rec = radarData.findRecord("type", 'sc');
					if (rec) {
						var v = rescale(obj.sc, rec.get('base'))
						rec.set('data1', v.val)
						rec.set('data2', v.base);
						rec.set('dataBak', v.val)
					}

					rec = radarData.findRecord("type", 'gb');
					if (rec) {
						var v = rescale(obj.gb, rec.get('base'))
						rec.set('data1', v.val)
						rec.set('data2', v.base);
						rec.set('dataBak', v.val)
					}
					
					rec = radarData.findRecord("type", 'em');
					if (rec) {
						var v = rescale(obj.em, rec.get('base'))
						rec.set('data1', v.val)
						rec.set('data2', v.base);
						rec.set('dataBak', v.val)
					}
					radarData.commitChanges();
				}
			},
			failure: function(response, opts) {
				console.log(response);
			}
		});
	},
	
	//------------------------------------------------------------------
	doFakeArrow: function() {
		var img = Ext.create('Ext.Img', {
			src: 'assets/images/focus-arrow-icon.png',
			floating: true,
			shadow: false,
			style:'opacity:0',
			width: 32,
			height: 32,
		}).showBy(Ext.getCmp('dss-step-1'), 'r-tl', [16,18]); //dss-action-holder')
		
		img.animate({
			duration: 1000,
			from: {
				x: img.getX() - 32,
			},
			to: {
				x: img.getX(),
				opacity: 1
			}
		})
		
		Ext.defer(function() {
			img.animate({
				duration: 1000,
				to: {
					x: Ext.getCmp('dss-action-holder').getX() - 24,
					y: Ext.getCmp('dss-action-holder').getY()
				}
			});
			
		}, 1500);
		Ext.defer(function() {
			img.animate({
				duration: 1000,
				to: {
					y: Ext.getCmp('dss-action-holder').getY() + 110
				}
			});
			
		}, 3000);
		Ext.defer(function() {
			img.animate({
				duration: 1000,
				to: {
					opacity: 0,
					x: img.getX() - 32
				}
			});
			
		}, 5000);
	}
});

