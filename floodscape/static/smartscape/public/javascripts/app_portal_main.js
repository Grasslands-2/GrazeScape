
Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'GeoExt': '/assets/javascripts/vendor/geo-ext'
	}
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

var emText = 'Climate \nMitigation';
var niText = 'Phosphorus\nRetention';
var scText = 'Soil Carbon';
var bhText = 'Bird   \nHabitat';
var srText = 'Soil\n Retention';
var gbText = 'Nitrogen\n            Retention';
var psText = 'Pest\nSupression   ';
var plText = 'Pollinators';

Ext.create('Ext.data.Store', {
	storeId: 'dss-values',
	fields: ['type','name', 'data1', 'location'],
	data: [
	{type:'sr',name: srText ,data1: 30.1, dataBak: 30.1, data2: 100,location: 'uc', base:0.10442078},
	{type:'ni',name: niText, data1: 91.8, dataBak: 91.8, data2: 100,location: 'uc', base:-31.1382},
	{type:'sc',name: scText, data1: 20.1, dataBak: 30.1, data2: 100,location: 'uc',base:11.103638},
	{type:'bh',name: bhText, data1: 10.9, dataBak: 10.9, data2: 100,location: 'uc',base:0.3476668},
	{type:'ps',name: psText, data1: 15.6, dataBak: 15.6, data2: 100,location: 'uc',base:0.428911},
	{type:'pl',name: plText ,data1: 30.4, dataBak: 30.4, data2: 100,location: 'uc',base:0.094198},
	{type:'em',name: emText, data1: 90.7, dataBak: 90.7, data2: 100,location: 'uc',base:0.000828},
	{type:'gb',name: gbText, data1: 80.5, dataBak: 80.5, data2: 100,location: 'uc', base:310.64678},
	
	{type:'sr',name: srText, data1: 100,  data2:90,location: 'cs'},
	{type:'em',name: emText, data1: 60.7, data2:100,location: 'cs'},
	{type:'sc',name: scText, data1: 17.1, data2:100,location: 'cs'},
	{type:'bh',name: bhText, data1: 48.9, data2:100,location: 'cs'},
	{type:'ps',name: psText, data1: 39.6, data2:100,location: 'cs'},
	{type:'pl',name: plText, data1: 40.4, data2:100,location: 'cs'},
	{type:'ni',name: niText, data1: 25.1, data2: 100, location: 'cs'},
	{type:'gb',name: gbText, data1: 70.5, data2:100,location: 'cs'},
	
	{type:'sr',name: srText, data1: 20.1, data2:100,location: 'd'},
	{type:'em',name: emText, data1: 30.7, data2:100,location: 'd'},
	{type:'sc',name: scText, data1: 80.0, data2:100,location: 'd'},
	{type:'bh',name: bhText, data1: 100.0, data2:78,location: 'd'},
	{type:'ps',name: psText, data1: 100.0, data2:64, location: 'd'},
	{type:'pl',name: plText, data1: 100.0, data2:55, location: 'd'},
	{type:'ni',name: niText, data1: 35.1, data2:100,location: 'd'},
	{type:'gb',name: gbText, data1: 20.5, data2:100,location: 'd'},
	
	{type:'sr',name: srText, data1: 40.1, data2:100,location: 'frv'},
	{type:'em',name: emText, data1: 100.0, data2:78.0, location: 'frv'},
	{type:'sc',name: scText, data1: 32.1, data2:100, location: 'frv'},
	{type:'bh',name: bhText, data1: 34.9, data2:100,location: 'frv'},
	{type:'ps',name: psText, data1: 30.6, data2:100, location: 'frv'},
	{type:'pl',name: plText, data1: 45.4, data2:100, location: 'frv'},
	{type:'ni',name: niText, data1: 100.0, data2:80.0, location: 'frv'},
	{type:'gb',name: gbText, data1: 100.0, data2:90.2,location: 'frv'},
	],

	filters: [{
		property: 'location',
		value: /nope/
		
	}]
});

Ext.create('Ext.data.Store', {
	storeId: 'dss-proportions',
	fields: ['name', 'data1', 'location', 'sub'],
	data: [
	{name: 'Row Crops',		data1: 40.65, 	location: 'uc', sub:{'Continuous Corn':5.05,'Dairy Rotation':16.61,'Cash Grain':18.99}},
	{name: 'Woodland',		data1: 22.55, 	location: 'uc', sub:{'Conifers':1.48,'Deciduous':21.06}},
	{name: 'Wetlands/Water',data1: 11.47, 	location: 'uc', sub:{'Open Water':2.37,'Wetlands':9.1}},
	{name: 'Grasses',		data1: 19.18,	location: 'uc', sub:{'Hay':5.8,'Pasture':8.14,'Cool-Season Grass':1.83,'Warm-Season Grass':3.4}},
	{name: 'Developed',		data1: 6.16, 	location: 'uc', sub:{'Urban':1.76,'Suburban':4.4}},
//	{name: 'Other',			data1: 4, 		location: 'uc'},

	{name: 'Row Crops',		data1: 26.2, 	location: 'cs'},
	{name: 'Woodland',		data1: 26.3, 	location: 'cs'},
	{name: 'Wetlands/Water',data1: 4.8, 	location: 'cs'},
	{name: 'Grasses',		data1: 22.4,	location: 'cs'},
	{name: 'Developed',		data1: 5.3, 	location: 'cs'},

	{name: 'Row Crops',		data1: 22.2, 	location: 'd'},
	{name: 'Woodland',		data1: 38.3, 	location: 'd'},
	{name: 'Wetlands/Water',data1: 4.8, 	location: 'd'},
	{name: 'Grasses',		data1: 22.4,	location: 'd'},
	{name: 'Developed',		data1: 4.3, 	location: 'd'},
	
	{name: 'Row Crops',		data1: 38.2, 	location: 'frv'},
	{name: 'Woodland',		data1: 22.3, 	location: 'frv'},
	{name: 'Wetlands/Water',data1: 9.8, 	location: 'frv'},
	{name: 'Grasses',		data1: 22.4,	location: 'frv'},
	{name: 'Developed',		data1: 7.3, 	location: 'frv'},
	
	],
	
	filters: [{
		property: 'location',
		value: /nope/
	}]

});


/*Ext.draw.sprite.Text.prototype.originalUpdatePlainBBox = Ext.draw.sprite.Text.prototype.updatePlainBBox;

Ext.draw.sprite.Text.prototype.updatePlainBBox = function(plain, useOldSize) {
	var me = this;
	me.originalUpdatePlainBBox(plain, useOldSize);
	//if (me.config && me.config.padding) {
		plain.x += 0;//me.config.padding.width;
		plain.height += -0;//me.config.padding.height;
//	}
}*/
var pieDef = {
	xtype: 'polar',
	itemId: 'dss-pie',
	innerPadding: 20,
	bodyStyle: 'background: transparent',
	background: 'transparent',
	height: 180,
	hidden: true,
	header: false,
	border: false,
	insetPadding: {
		top: 30,
		left: 35,
		right: 35,
		bottom: 0
	},
	animation: {
		duration: 300
	},
	store: 'dss-proportions',
	interactions: ['rotate', 'itemhighlight'],
	sprites: [{
		type: 'text',
		x: 4,
		y: 16,
		text: 'Landcover Proportions',
		fontSize: 14,
		fontWeight: 'bold',
		fillStyle: '#356'
	},{
		type: 'line',
		fromX: 3,
		fromY: 18,
		toX: 102,
		toY: 18,
		strokeStyle: '#467'
	},{
		type: 'line',
		fromX: 106,
		fromY: 18,
		toX: 159,
		toY: 18,
		strokeStyle: '#467'
	}],
   series: {
	   colors: ['#f3e45c','#f3a05a','#6f9fdc','#a4b85c','#b7b7b7','#bf8a9a'],
       type: 'pie3d',
       highlight: true,
       angleField: 'data1',
       rotation: 2.0,
       label: {
           field: 'name',
           display: 'rotate',//'rotate',
           color: '#333',
			 font: '12px Helvetica'
       },
       tooltip: {
           renderer: function(tip, item) {
        	   var t = '<u><b>' + item.get('name') + ':</b> ' + Ext.util.Format.number(item.get('data1'), '0.0#%</u>');
        	   var sub = item.get('sub');
        	   Ext.Object.each(sub, function(key, value) {
        		  t += '<br/>&nbsp;&nbsp;&nbsp;' + key + ": " + Ext.util.Format.number(value, '0.0#%');
        	   });
               tip.update(t);
           }
       },
       donut: 40,
       thickness: 10,
       distortion: 0.45
   }		
}

//-------------------------------------------------------------
//Sample Radar
var radarDef = {
	xtype: 'polar',
	itemId: 'dss-radar',
	theme: 'custom',
	border: false,
	hidden: true,
//	height: 250,
	padding: '48 0',
	flex: 1,
	bodyStyle: 'background: transparent',
	background: 'transparent',
	innerPadding: 15,
	header: false,
	insetPadding: {
		top: 45,
		left: 50,
		right: 50,
		bottom: 25
	},
	animation: {
		duration: 250
	},
	store: 'dss-values',
	sprites: [{
		type: 'text',
		x: 4,
		y: 16,
		text: 'Current Conditions',
		fontSize: 14,
		fontWeight: 'bold',
		fillStyle: '#356'
	},{
		type: 'line',
		fromX: 4,
		fromY: 18,
		toX: 133,
		toY: 18,
		strokeStyle: '#467'
	}],
	series: [{
		type: 'radar',
		title: 'Selected',
		angleField: 'name',
		radiusField: 'data1',
		marker: {radius: 4, fillOpacity: 0.7},
		highlight: {fillStyle: '#FFF',strokeStyle: '#000'},
		tooltip: {
			trackMouse: false,
			renderer: function(toolTip, record, ctx) {
				toolTip.setHtml(record.get('name') + ': ' + Ext.util.Format.number(record.get('data1'), '0.0#%'));
			}
		},			
		style: {fillOpacity: .3}
	},{
		type: 'radar',
		title: 'Baseline',
		angleField: 'name',
		radiusField: 'data2',
		marker: {radius: 4, fillOpacity: 0.7},
		highlight: {fillStyle: '#FFF',strokeStyle: '#000'},
		tooltip: {
			trackMouse: false,
			renderer: function(toolTip, record, ctx) {
				toolTip.setHtml(record.get('name') + ': ' + Ext.util.Format.number(record.get('data2'), '0.0#%'));
			}
		},			
		style: {fillOpacity: .3}
	}],
	axes: [{
		type: 'numeric',
		position: 'radial',
		fields: ['data1','data2'],
		style: {
			minStepSize: 10,
			estStepSize: 10
		},
		minimum: 0,
		maximum: 100,
		grid: {
			strokeStyle: '#ccc'
		},
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
			strokeStyle: 'rgba(255,0,0,0)'
		},
		grid: {
			strokeStyle: '#bbb'
		},
		label: {
			 font: '12px Helvetica',
			 color: '#333',
			 padding: '0px 28px'
		}
	}]
};


Ext.tip.QuickTipManager.init(); // Instantiate the QuickTipManager


Ext.application({
    name: 'DSS',
    views: [
        'PortalViewport'
    ],
    mainView: 'DSS.view.PortalViewport',
    
	init: function() {
		Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
	},	
});
