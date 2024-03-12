
Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'GeoExt': '/assets/javascripts/vendor/geo-ext'
	}
});

var centralSandsCoords = [[
	[-9974444.68, 5525984.17],
	[-10005576.9, 5501770.16],
	[-10012495.2, 5449882.98],
	[-9988281.26, 5408373.24],
	[-9943312.37, 5397995.81],
	[-9908720.92, 5397995.81],
	[-9887966.05, 5432587.26],
	[-9887966.05, 5477556.14],
	[-9905261.78, 5515606.74],
	[-9943312.37, 5529443.32]
]];
var centralSandsFeature = new ol.Feature(new ol.geom.Polygon(centralSandsCoords));

var urbanCorridorCoords = [[ 
	[-9967999.98, 5370159.85],
	[-9988790.85, 5357929.93],
	[-9996128.81, 5333470.08],
	[-9993682.82, 5309010.23],
	[-9971668.96, 5295557.31],
	[-9933756.19, 5288219.36],
	[-9914188.31, 5284550.38],
	[-9889728.46, 5291888.34],
	[-9873829.56, 5301672.28],
	[-9835916.79, 5300449.28],
	[-9807787.97, 5296780.31],
	[-9785774.10, 5305341.25],
	[-9779659.14, 5337139.06],
	[-9798004.03, 5353037.96],
	[-9837139.79, 5367713.87],
	[-9873829.56, 5370159.85],
	[-9917857.29, 5375051.82]
]];
var urbanCorridorFeature = new ol.Feature(new ol.geom.Polygon(urbanCorridorCoords));

var foxValleyCoords = [[ 
	[-9805341.98842241, 5555443.215766609],
	[-9828578.845021103, 5540767.306335855],
	[-9861599.641240299, 5523645.411999975],
	[-9876275.550671054, 5493070.600685905],
	[-9883613.50538643, 5464941.77427696],
	[-9883613.50538643, 5434366.96296289],
	[-9861599.641240299, 5412353.098816759],
	[-9832247.822378792, 5408684.121459071],
	[-9806564.980874972, 5413576.091269322],
	[-9773544.184655776, 5427029.008247512],
	[-9764983.237487836, 5480840.676160277],
	[-9749084.33560452, 5499185.562948719],
	[-9751530.320509646, 5533429.351620478],
	[-9738077.403531455, 5561558.178029423],
	[-9727070.471458388, 5589687.004438368],
	[-9736854.411078893, 5597024.959153744],
	[-9753976.305414772, 5593355.981796056],
	[-9771098.19975065, 5557889.200671734],
]];
var foxValleyFeature = new ol.Feature(new ol.geom.Polygon(foxValleyCoords));

var DriftlessCoords = [[ 
	[-10155117.829855375, 5433143.970510328],
	[-10158786.807213064, 5405015.144101383],
	[-10157563.8147605, 5378109.310145001],
	[-10144110.89778231, 5363433.4007142475],
	[-10141664.912877185, 5356095.445998871],
	[-10149002.867592562, 5330412.604495051],
	[-10145333.890234873, 5314513.702611734],
	[-10129434.988351557, 5303506.770538669],
	[-10084184.267606732, 5304729.762991232],
	[-10032818.584599094, 5305952.755443795],
	[-10004689.75819015, 5314513.702611734],
	[-9985121.878949143, 5332858.589400177],
	[-9966776.992160702, 5363433.4007142475],
	[-9966776.992160702, 5387893.249765504],
	[-9992459.833664522, 5401346.166743695],
	[-10015696.690263214, 5416022.076174448],
	[-10053609.45629266, 5427029.008247514],
	[-10078069.305343919, 5441704.917678268],
	[-10115982.071373366, 5444150.902583393],
]];

var driftlessFeature = new ol.Feature(new ol.geom.Polygon(DriftlessCoords));

var spotStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 0.9)',
        width: 2
    }),
    fill: new ol.style.Fill({
	    color: 'rgba(128, 32, 255, 0.8)'
	})
});

var maskLayer = new ol.layer.Vector({
	source: new ol.source.Vector(),
	style: spotStyle,
	opacity: 0.6,
	// these potentially reduce performance but looks better
	updateWhileAnimating: true, 
	updateWhileInteracting: true
});

var globalMap = new ol.Map({
	controls: ol.control.defaults({
		attributionOptions: {
			collapsible: true
		}
	}),
	layers: [
		new ol.layer.Tile({
			source: new ol.source.Stamen({
				layer: 'terrain'//-background' // terrain/ terrain-labels / terrain-lines
			})
		}),
		maskLayer
	],
	view: new ol.View({
		center: ol.proj.fromLonLat([-89.565, 44.2]),
		zoom: 6,
        minZoom: 3,
        maxZoom: 9
	})
});

globalMap.on('click', function(evt){
    console.info(globalMap.getCoordinateFromPixel(evt.pixel));
});



Ext.require([
    'GeoExt.component.Map',
    'Ext.panel.Panel',
    'Ext.Viewport'
]);

Ext.define('Ext.chart.theme.Custom', {
    extend: 'Ext.chart.theme.Base',
    singleton: true,
    alias: 'chart.theme.custom',
    config: {
		legend: {
			label: {
				fontSize: 13,
				fontWeight: 'default',
				fontFamily: 'default',
				fillStyle: 'black'
			}
		}
    }
});		

var niText = 'Net\n    Income';
var scText = 'Soil\nCarbon  ';
var bhText = 'Bird  \nHabitat  ';
var srText = 'Soil  \nRetention  ';
var gbText = '  Gross\n  Biofuel';
Ext.create('Ext.data.Store', {
	storeId: 'dss-values',
	fields: ['name', 'data1', 'location'],
	data: [
	{name: niText, data1: 90.1, location: 'uc'},
	{name: gbText, data1: 80.5, location: 'uc'},
	{name: 'Emissions',data1: 90.7, location: 'uc'},
	{name: srText ,data1: 30.1, location: 'uc'},
	{name: scText, data1: 20.1, location: 'uc'},
	{name: bhText, data1: 10.9, location: 'uc'},
	{name: 'Pest Supression',data1: 15.6, location: 'uc'},
	{name: '     Pollinators',data1: 30.4, location: 'uc'},
	
	{name: niText, data1: 25.1, location: 'cs'},
	{name:  gbText, data1: 70.5, location: 'cs'},
	{name: 'Emissions',data1: 60.7, location: 'cs'},
	{name: srText, data1: 28.1, location: 'cs'},
	{name: scText,data1: 17.1, location: 'cs'},
	{name: bhText, data1: 28.9, location: 'cs'},
	{name: 'Pest Supression',data1: 19.6, location: 'cs'},
	{name: '     Pollinators',data1: 40.4, location: 'cs'},
	
	{name: niText,data1: 35.1, location: 'd'},
	{name:  gbText, data1: 20.5, location: 'd'},
	{name: 'Emissions',data1: 30.7, location: 'd'},
	{name: srText, data1: 20.1, location: 'd'},
	{name: scText,data1: 80.0, location: 'd'},
	{name: bhText, data1: 100.0, location: 'd'},
	{name: 'Pest Supression',data1: 100.0, location: 'd'},
	{name: '     Pollinators',data1: 100.0, location: 'd'},
	
	{name: niText,data1: 100.0, location: 'frv'},
	{name:  gbText, data1: 100.0, location: 'frv'},
	{name: 'Emissions',data1: 100.0, location: 'frv'},
	{name: srText, data1: 40.1, location: 'frv'},
	{name: scText,data1: 32.1, location: 'frv'},
	{name: bhText, data1: 34.9, location: 'frv'},
	{name: 'Pest Supression',data1: 30.6, location: 'frv'},
	{name: '     Pollinators',data1: 45.4, location: 'frv'},
	],

	filters: [{
		property: 'location',
		value: /nope/
		
	}]
});

Ext.create('Ext.data.Store', {
	storeId: 'dss-proportions',
	fields: ['name', 'data1', 'location'],
	data: [
	{name: 'Row Crops',		data1: 32.2, 	location: 'uc'},
	{name: 'Woodland',		data1: 24.3, 	location: 'uc'},
	{name: 'Grasses',		data1: 22.4,	location: 'uc'},
	{name: 'Wetlands/Water',data1: 8.8, 	location: 'uc'},
	{name: 'Developed',		data1: 8.3, 	location: 'uc'},
	{name: 'Other',			data1: 4, 		location: 'uc'},

	{name: 'Row Crops',		data1: 26.2, 	location: 'cs'},
	{name: 'Woodland',		data1: 26.3, 	location: 'cs'},
	{name: 'Grasses',		data1: 22.4,	location: 'cs'},
	{name: 'Wetlands/Water',data1: 4.8, 	location: 'cs'},
	{name: 'Developed',		data1: 5.3, 	location: 'cs'},
	{name: 'Other',			data1: 6, 		location: 'cs'},

	{name: 'Row Crops',		data1: 22.2, 	location: 'd'},
	{name: 'Woodland',		data1: 38.3, 	location: 'd'},
	{name: 'Grasses',		data1: 22.4,	location: 'd'},
	{name: 'Wetlands/Water',data1: 4.8, 	location: 'd'},
	{name: 'Developed',		data1: 4.3, 	location: 'd'},
	{name: 'Other',			data1: 4, 		location: 'd'},
	
	{name: 'Row Crops',		data1: 38.2, 	location: 'frv'},
	{name: 'Woodland',		data1: 22.3, 	location: 'frv'},
	{name: 'Grasses',		data1: 22.4,	location: 'frv'},
	{name: 'Wetlands/Water',data1: 9.8, 	location: 'frv'},
	{name: 'Developed',		data1: 7.3, 	location: 'frv'},
	{name: 'Other',			data1: 3, 		location: 'frv'},
	
	],
	
	filters: [{
		property: 'location',
		value: /nope/
	}]

});

//-------------------------------------------------------------
var treeStore = Ext.create('Ext.data.Store', {
	storeId: 'dss-areas',
	fields: ['name', 'value', 'img', 'desc', 'feature'],
	data: [{ 
		name: 'Central Sands', value: 'cs', img: 'assets/images/other_5.gif',
		desc: "The remnants of an ancient lake, the area is characterised by sand and p'taters",
		feature: centralSandsFeature
	},{ 
		name: 'Driftless', value: 'd', img: 'assets/images/other_6.gif',
		desc: "The driftless area escaped glaciation during the last ice age and is characterized by steep, forested ridges, deeply-carved river valleys, and cold-water trout streams.",
		feature: driftlessFeature
	},{ 
		name: 'Fox River Valley', value: 'frv', img: 'assets/images/other_4.gif',
		desc: "Some special risks and opportunities here...",
		feature: foxValleyFeature
	},{ 
		name: 'Urban Corridor', value: 'uc', img: 'assets/images/other_2.gif',
		desc: "A mix of comparatively densely populated areas and glaciated bits. It'd be nice to have a train to get us to and fro.",
		feature: urbanCorridorFeature
	}]
});

Ext.draw.sprite.Text.prototype.originalUpdatePlainBBox = Ext.draw.sprite.Text.prototype.updatePlainBBox;

Ext.draw.sprite.Text.prototype.updatePlainBBox = function(plain, useOldSize) {
	var me = this;
	me.originalUpdatePlainBBox(plain, useOldSize);
	//if (me.config && me.config.padding) {
		plain.x += 0;//me.config.padding.width;
		plain.height += -0;//me.config.padding.height;
//	}
}
//-------------------------------------------------------------
// Sample Radar
var radarDef = {
	xtype: 'polar',
	itemId: 'DSS-gurf',
	theme: 'custom',
	flex: 3,
	title: 'Current Conditions',
//	bodyStyle: 'border-bottom: 0',
	innerPadding: 4,
	header: {
		style: 'border-left: 1px solid #aaa; border-top: 1px solid #aaa; border-right: 1px solid #aaa'
	},
	insetPadding: {
		top: 25,
		left: 40,
		right: 40,
		bottom: 25
	},
	animation: {
		duration: 250
	},
	store: 'dss-values',
	series: [{
		type: 'radar',
		title: 'Default',
		angleField: 'name',
		radiusField: 'data1',
		marker: {radius: 4, fillOpacity: 0.7},
		highlight: {fillStyle: '#FFF',strokeStyle: '#000'},
		tooltip: {
			trackMouse: false,
			renderer: function(toolTip, record, ctx) {
				toolTip.setHtml(record.get('name') + ': ' + record.get('data1'));
			}
		},			
		style: {fillOpacity: .3}
	}],
	axes: [{
		type: 'numeric',
		position: 'radial',
		fields: 'data1',
		style: {
			minStepSize: 10,
			estStepSize: 10
		},
		minimum: 0,
		maximum: 100,
		grid: true,
		label: {
			 font: '12px Helvetica',
			 color: '#333'
		}
	}, {
		type: 'category',
		position: 'angular',
		fields: 'name',
		style: {
			estStepSize: 1,
			strokeStyle: 'rgba(0,0,0,0)'
		},
		grid: true,
		label: {
			 font: '12px Helvetica',
			 color: '#333',
			 padding: '0px 28px'
		}
	}]
};

var pieDef = {
	xtype: 'polar',
	innerPadding: 20,
//	bodyStyle: 'border-top: 0',
	title: 'Landcover Proportions',
	header: {
		style: 'border-left: 1px solid #aaa; border-right: 1px solid #aaa'
	},
	flex: 2,
	//theme: 'category1',
	insetPadding: {
		top: 15,
		left: 45,
		right: 35,
		bottom: 0
	},
	animation: {
		duration: 300
	},
	store: 'dss-proportions',
	interactions: ['rotate', 'itemhighlight'],
		   series: {
			   colors: ['#f3e45c','#a4b85c','#f3a05a','#6f9fdc','#b7b7b7','#bf8a9a'],
		       type: 'pie3d',
		       highlight: true,
		       angleField: 'data1',
		       label: {
		           field: 'name',
		           display: 'rotate',//'rotate',
		           color: '#333',
					 font: '12px Helvetica'
		       },
		       donut: 40,
		       thickness: 10,
		       distortion: 0.45
		   }		
}
Ext.application({
	name: 'DSS',
	
	init: function() {
		Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
	},	
	launch: function() {
				
		var logoBG = "background: #F0F2F0;background: -webkit-linear-gradient(to top, #afbfaf, #ddc, #eee) fixed; background: linear-gradient(to top, #afbfaf, #ddc,  #eee) fixed;";
		
		Ext.create('Ext.Viewport', {
			minHeight: 640,minWidth: 660,
			renderTo: Ext.getBody(),
			style: logoBG,
			autoScroll: true,
			layout: {
				type: 'vbox',
				align: 'middle'
			},
			defaults: {
				xtype: 'container',
			},
			items: [{
				width: 310, height: 70,
				margin: '16 0',
				html: '<a href="/assets/wip/landing_bs.html"><img src="assets/images/dss_logo.png" style="width:100%"></a>',
			/*},{
				html: 'Choose an Area of Interest to Explore',
				margin: '24 8 0 8',
				style: 'color: #333; font-size: 18px; font-weight: bold'
			*/
			},{
				flex: 20,
				margin: 8,
				maxHeight: 520,
				maxWidth: 960,
				width: '100%',
				layout: {
					type: 'hbox',
					pack: 'start',
					align: 'stretch',
				},
				items: [{
					xtype: 'container',
					margin: '0 8 0 0',
					width: 440,
					layout: {
						type: 'vbox',
						pack: 'start',
						align: 'stretch'
					},
					items: [{
						xtype: 'container',
						style: 'border: 1px solid #ccc; border-radius: 2px; background-color: #fff',
						flex: 1,
						layout: {
							type: 'vbox',
							align: 'middle'
						},
						items: [{
							xtype: 'container',
							id: 'dss-map-logo',
							hidden: true,
							flex: 2,
							padding: '0 0 0 24',
							width: '75%',
							html: '<img style="background-size: cover; width: 100%" src="assets/images/other_4.gif">'
						},{
							xtype: 'grid',
							id: 'dss-area-grid',
							height: 140, width: '100%',
							store: 'dss-areas',
							header: {
							//	style: 'border-top: 1px #ccc solid'
							},
							title: 'Choose an Area of Interest to Explore',//'Available Areas',
							hideHeaders: true,
							columns:[{
								dataIndex: 'name', flex: 1
							}],
							listeners: {
								viewready: function(self) {
									self.getSelectionModel().select(3);
								},
								selectionchange: function(self, recs) {
									Ext.getCmp('dss-map-logo').update(
										'<img style="background-size: contain; width: 100%" src="' + recs[0].get('img') + '">'
									);
									var chartData = Ext.data.StoreManager.lookup('dss-values');
									chartData.setFilters(new Ext.util.Filter({
										property: 'location',
										value: recs[0].get('value')
									}))
									chartData = Ext.data.StoreManager.lookup('dss-proportions');
									chartData.setFilters(new Ext.util.Filter({
										property: 'location',
										value: recs[0].get('value')
									}))
									Ext.getCmp('dss-description').update('<b>About the ' + recs[0].get('name') + '</b><br/>' + recs[0].get('desc'))
								    maskLayer.getSource().clear();
								    maskLayer.getSource().addFeature(recs[0].get('feature'));
								}
							}
						},{
							xtype: 'gx_map',
							width: '100%',
							flex: 2,
							map: globalMap,
							animate: false,
							style: 'background-color: rgb(198,208,168)' // rgb(217,221,183)
						},{
							xtype: 'container',
							id: 'dss-description',
							hidden: true,
							padding: '8 16',
							width: '100%',
							height: 100,
							style: 'color: #777'
						},{
							xtype: 'panel',
							id: 'dss-refine-area',
							title: 'Refine Area of Interest (optional)',
							collapsible: true,
							collapsed: true,
							width: '100%',
							layout: {
								type: 'vbox',
								pack: 'center',
								align: 'stretch'
							},
							items: [{
								xtype: 'container',
								layout: 'hbox',
								padding: 4,
								items: [{
									xtype: 'container',
									html: 'Counties',
									width: 80,
									padding: '4 2',
									style: 'text-align: right'
								},{
									xtype: 'button',
									scale: 'small',
									text: 'Choose',
									width: 80,
									margin: '2 4'
								},{
									xtype: 'button',
									scale: 'small',
									text: 'Clear',
									width: 80,
									margin: '2 4'
								}]
							},{
								xtype: 'container',
								layout: 'hbox',
								padding: 4,
								items: [{
									xtype: 'container',
									html: 'Watersheds',
									width: 80,
									padding: '4 2',
									style: 'text-align: right'
								},{
									xtype: 'button',
									scale: 'small',
									text: 'Choose',
									width: 80,
									margin: '2 4'
								},{
									xtype: 'button',
									scale: 'small',
									text: 'Clear',
									width: 80,
									margin: '2 4'
								}]
							}]
						}]
					},{
						xtype: 'container',
						layout: {
							type: 'hbox',
							pack: 'end',
							align: 'stretch'
						},
						items: [{
							xtype: 'button',
							scale: 'medium',
							text: 'Back',
							margin: '4 6 0 0',
							width: 100
						},{
							xtype: 'button',
							scale: 'medium',
							text: 'Next',
							margin: '4 8 0 6',
							width: 100,
							handler: function() {
								location.href = '/app';
							}
							
						}]
					}]
				},{
					xtype: 'container',
					flex: 1,
					layout: {
						type: 'vbox',
						align: 'stretch',
						pack: 'start'
					},
					items: [radarDef, pieDef]
				}]
			},{
				flex: 1,
			},{
				padding: 8,
				width: '100%',
				style: 'background-color: #404740; background: -webkit-linear-gradient(to bottom, #404740, #282728);background: linear-gradient(to bottom, #404740, #282728); color: #ddd; text-shadow: 0 0 1px #00000050; font-size: 14px; border-top: 1px solid #00000050;',
				layout: {
					type: 'vbox',
					align: 'middle'
				},
				defaults: {
					xtype: 'container'
				},
				items: [{
					width: 480, height: 90,
					margin: -12,
					html: '<a href="https://energy.wisc.edu"><img src="assets/images/wei-logo.png" style="width: 60%"></a>' + 
					'<a href="http://gratton.entomology.wisc.edu"><img src="assets/images/gratton-logo.png" style="width: 40%"></a>',
				},{
					margin: 8,
					html: '&copy;2019 wei.wisc.edu'
				}]
			}]
		});
		
		var img = Ext.create('Ext.Img', {
			src: 'assets/images/focus-arrow-icon.png',
			floating: true,
			style:'opacity:0',
			shadow: false,
			width: 64,
			height: 64,
			x: 50,
			y: 50
		}).showBy(Ext.getCmp('dss-area-grid'), 'r-tl', [0,18]);
		Ext.defer(function() {
			img.animate({
				from: {
					x: img.getX() - 32,
					opacity: 0
				},
				to: {
					x: img.getX(),
					opacity: 1
				}
			})
		}, 2000);
		Ext.defer(function() {
			img.setStyle({opacity: 0});
			img.showBy(Ext.getCmp('dss-refine-area'), 'r-tl', [0,18]);
			img.animate({
				from: {
					x: img.getX() - 32,
					opacity: 0
				},
				to: {
					x: img.getX(),
					opacity: 1
				}
			})
		}, 6000);
	}
	
});

