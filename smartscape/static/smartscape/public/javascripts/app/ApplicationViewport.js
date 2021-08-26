var DSS_viewport = false;

//------------------------------------------------------------------------------
Ext.define('DSS.app.ApplicationViewport', {
//------------------------------------------------------------------------------
	extend: 'Ext.container.Viewport',
	
	requires: [
	    'DSS.components.MainMap', // likes to be first...
	    'DSS.components.d3_nav', // this also likes to be here even if not used directly in this object
	    'DSS.components.LogoBar',
	    'DSS.app.d3_bar',
	    'DSS.app.herd',
	    'DSS.app.dashboard',
	    'DSS.app.dash_tray',
	    'DSS.app.layerQuery_Checkbox',
	    'DSS.app.layerQuery_Range',
	],

//	minWidth: 640,
//	minHeight: 480,
	style: 'background-color: rgb(198,208,168)',
	
	scrollable: false,
    renderTo: Ext.getBody(),
	layout: 'fit',

	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'mainmap'
			}]
		});
		
		me.callParent(arguments);
		DSS_viewport = me;
		
		me['DSS-bar'] = Ext.create('DSS.app.dashboard', {
			floating: true,
			shadow: false,
			height: me.getHeight(),
			x: 0, y: 0
		}).show();
		
	/*	me['vloof'] = Ext.create('DSS.app.layerQuery_Checkbox', {
			floating: true, shadow: false,
			title: 'WiscLand 2.0',
			dssGroup: 'wl2', // just has to be unique
			dssServerLayer: 'todo',
			dssTabIndex: 80,
			dssCheckboxConfig: [
				{boxLabel: 'Continous Corn', indexValues: [1]},
				{boxLabel: 'Cash Grain', indexValues: [14]},
				{boxLabel: 'Dairy Rotation', indexValues: [15]},
				{boxLabel: 'Hay', 		indexValues: [2]},
				{boxLabel: 'Pasture', 	indexValues: [3]},
				{boxLabel: 'Warm Grass', indexValues: [5]},
				{boxLabel: 'Cool Grass', indexValues: [4]},
				{boxLabel: 'Woodland',	indexValues: [6,7,8]},
				{boxLabel: 'Wetlands',	indexValues: [12345]}, // FIXME
				{boxLabel: 'Developed', indexValues: [12,13], checked: true},
			]
		}).show().center();
		
		me['bloof'] = Ext.create('DSS.app.layerQuery_Range', {
			floating: true, shadow: false,
			title: 'Slope',
			dssServerLayer: 'slope',
			dssTabIndex: 90,
			dssGreaterValue: 5
		}).show().center();
*/
//		Ext.defer(me.addClusterCows, 500);
/*		me['DSS-bar'] = Ext.create('DSS.app.dash_tray', {
			floating: true,
			shadow: false,
			height: me.getHeight(),
			width: me.getWidth(),
			x: 0, y: 0
		}).show();*/
	},
	
	//---------------------------------------------------------------------
	addClusterCows: function() {
		  var count = 200;
	      var features = new Array(count);
	      var c = [-9956500, 5345200];
	      var e = 73000;
	      for (var i = 0; i < count; ++i) {
	        var coordinates = [c[0] + e * 2 * Math.random() - e, 
	        	c[1] + e * 2 * Math.random() - e];
	        features[i] = new ol.Feature(new ol.geom.Point(coordinates));
	        features[i].set('count', Math.floor(Math.random() * count * 1.2 + 100));
	      }

	      var source = new ol.source.Vector({
	        features: features
	      });

	      var clusterSource = new ol.source.Cluster({
	        distance: 900,//parseInt(200, 10),
	        source: source
	      });
	      
	      var styleCache = {};
	      var clusters = new ol.layer.Vector({
	        source: clusterSource,
	    	//updateWhileAnimating: true, 
	    	//updateWhileInteracting: true,	        
	        style: function(feature) {
	          let ar = feature.get('features');
	          let ct = 0;
	          ar.forEach(function(d) {
	        	  if (d.get('count')) {
	        		  ct += d.get('count');
	        	  }
	          })
	          let size = ar.length;
	          var style = styleCache[size];
	          if (!style) {
	            style = new ol.style.Style({
	              image: new ol.style.Circle({
	                radius: 48,
	                stroke: new ol.style.Stroke({
	                  color: '#fff'
	                }),
	                fill: new ol.style.Fill({
	                  color: '#3399CC'
	                })
	              }),
	              text: new ol.style.Text({
	                text: ct.toString(),
	                fill: new ol.style.Fill({
	                  color: '#fff'
	                }),
	              font: '20px sans-serif'
	              })
	            });
	            styleCache[size] = style;
	          }
	          return style;
	        }
	      });

	      var vs = new ol.layer.Vector({
		        source: source,
		    	//updateWhileAnimating: true, 
		    	//updateWhileInteracting: true,	        
		        style: new ol.style.Style({
		             image: new ol.style.Circle({
		                radius: 8,
		                stroke: new ol.style.Stroke({
		                  color: '#fff'
		                }),
		                fill: new ol.style.Fill({
		                  color: '#3399CC'
		                })
		              }),
		        	})
		      });
	      
			globalMap.addLayer(vs)
		globalMap.addLayer(clusters)
	}
		
});

