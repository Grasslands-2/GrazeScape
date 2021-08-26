
var waterStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        width: 1
    }),
    fill: new ol.style.Fill({
	    color: 'rgba(200, 180, 32, 0.4)'
	})
});
  var watershed = new ol.layer.Vector({
	  style: waterStyle,
	  opacity: 0.7,
	  visible: false,

	updateWhileAnimating: true, 
	updateWhileInteracting: true,

        source: new ol.source.Vector({
          url: './assets/huc-10.geojson',//'https://openlayers.org/en/v4.6.5/examples/data/geojson/countries.geojson',
          format: new ol.format.GeoJSON()
        })
      });
  var county = new ol.layer.Vector({
	  style: waterStyle,
	  opacity: 0.7,
	  visible: false,
	updateWhileAnimating: true, 
	updateWhileInteracting: true,

        source: new ol.source.Vector({
          url: './assets/counties.geojson',//'https://openlayers.org/en/v4.6.5/examples/data/geojson/countries.geojson',
          format: new ol.format.GeoJSON()
        })
      });
/*olCustomButton = function(opt_options) {

	var options = opt_options || {};
	
	var button = document.createElement('button');
	button.setAttribute('type', 'button');
	button.appendChild(document.createTextNode('\u21D5'));
	button.title = 'Toggle Map Options';
	
	var this_ = this;
	var toggleDetails = function() {
		var el = Ext.getCmp('footer'); 
		el.setVisible(!el.isVisible());
	};
	
	button.addEventListener('click', toggleDetails, false);
	button.addEventListener('touchstart', toggleDetails, false);
	
	var element = document.createElement('div');
	element.className = 'ol-custom-button ol-unselectable ol-control';
	element.appendChild(button);
	
	ol.control.Control.call(this, {
		element: element,
		target: options.target
	});
};

ol.inherits(olCustomButton, ol.control.Control);
*/      
var globalMap = new ol.Map({
	controls: ol.control.defaults({
		attributionOptions: {
			collapsible: true
		}
	}).extend([
	//	new ol.control.ScaleLine(),
//		new olCustomButton()
	]),
	layers: [
		new ol.layer.Tile({
			source: new ol.source.Stamen({
				layer: 'terrain'//-background' // terrain/ terrain-labels / terrain-lines
			}),
		}),
		watershed,
		county
	],
	view: new ol.View({
//		center: ol.proj.fromLonLat([-89.565, 43.225]),
		zoom: 9
	})
});

globalMap.on("click", function(a) {

	console.log(a.coordinate);
});

var spotStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 0.9)',
        width: 2
    }),
    fill: new ol.style.Fill({
	    color: 'rgba(0, 32, 0, 0.8)'
	})
});

var maskLayer = new ol.layer.Vector({
	source: new ol.source.Vector(),
	style: spotStyle,
	opacity: 0.5,
	// these potentially reduce performance but looks better
	updateWhileAnimating: true, 
	updateWhileInteracting: true
});

var selectionLayer = new ol.layer.Image({
	opacity: 0.7
});



//-----------------------------------------------------
// DSS.components.MainMap
//
//-----------------------------------------------------
Ext.define('DSS.components.MainMap', {
    extend: 'GeoExt.component.Map',
    alias: 'widget.mainmap',
 
	header: false,
	map: globalMap,
	animate: false,
	style: 'background-color: rgb(198,208,168)', // rgb(217,221,183)

	DSS_farmStyleDef: {
		'5': {
			radius: 5,
			fill: new ol.style.Fill({color: '#7fff00af'}),
			stroke: new ol.style.Stroke({color: '#224400bf', width: 2})
		},
		'8': {
			radius: 8,
			fill: new ol.style.Fill({color: '#ffff00af'}),
			stroke: new ol.style.Stroke({color: '#444400bf', width: 2})
		},
		'12': {
			radius: 12,
			fill: new ol.style.Fill({color: '#ff7f00af'}),
			stroke: new ol.style.Stroke({color: '#442200bf', width: 2})
		}
	},
	// Contains the real styles which are scale modified defs from above
	DSS_farmLayerStyle: {
		'5': {},
		'8': {},
		'12': {}
	},

	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
		});
		
		me.callParent(arguments);
		me.addSelectionLayer();
//		me.addMapMask();
	    
	    me.addFarmPoints();
	},
	
	//-------------------------------------------------------
	addMapMask: function() {
		var me = this;
		
	    globalMap.addLayer(maskLayer);
		
		var obj = Ext.Ajax.request({
			url: location.href + '/getMask',
			jsonData: {},
			timeout: 25000, // in milliseconds
			
			success: function(response, opts) {
				var obj = JSON.parse(response.responseText);
				
				var wiscShape = [[[ -10386119.03, 5718818.89], [ -10361125.6, 5785863.2], [ -10320490.3, 5819331.2], [ -10299367.7, 5927583.6], [ -10199243.9, 5949269.5], [ -10098444.0, 6002718.9], [ -10025701.6, 5984168.8], [ -10026046.8, 5905463.8], [ -9996085.6, 5872983.3], [ -9781992.5, 5806509.8], [ -9732830.8, 5754163.7], [ -9720238.6, 5705702.4], [ -9685264.4, 5733462.3], [ -9633541.9, 5723042.8], [ -9618686.6, 5674922.5], [ -9694399.0, 5535205.4], [ -9739825.5, 5354089.5], [ -9725338.8, 5278820.7], [ -9740111.2, 5207977.7], [ -9774872.3, 5191421.5], [ -10092039.2, 5193754.7], [ -10164096.0, 5238621.9], [ -10189178.7, 5288738.1], [ -10204203.5, 5424168.1], [ -10373481.24, 5565986.85 ], [ -10386119.0, 5718818.8] ] ]	    
				var spot = new ol.geom.Polygon(wiscShape);
				var c = [obj.x, obj.y,
					obj.x + obj.w, obj.y + obj.h]
		
			    spot.appendLinearRing(new ol.geom.LinearRing([
			        [c[0], c[3]],
			        [c[0], c[1]],
			        [c[2], c[1]],
			        [c[2], c[3]],
			        [c[0], c[3]]
			    ]));
			    
			    maskLayer.getSource().addFeature(new ol.Feature(spot));
			    
			    globalMap.getView().setCenter([obj.x + obj.w / 2, obj.y + obj.h / 2]);
			},
			
			failure: function(respose, opts) {
			}
		});
	},
	
	//--------------------------------------------------------------------------
	addSelectionLayer: function(selDef) {
		var me = this;
	//	selectionLayer = new ol.layer.Image({
//			opacity: 0.5
//		});
		globalMap.addLayer(selectionLayer);
	},

	//--------------------------------------------------------------------------
	addFarmPoints: function() {
		
		var me = this;
		var source =  new ol.source.Vector({
			url: location.href + '/getFarmPoints',
			format: new ol.format.GeoJSON()
		});

		function onViewChange(evt) {
			var t = evt.target;
			var z = t.getZoom();

			let def5 = me.DSS_farmStyleDef['5'],
				def8 = me.DSS_farmStyleDef['8'],
				def12 = me.DSS_farmStyleDef['12']; 

			// roughly scale zoom such that we end up with 0.25x to 3x
			let scale = (z - 6) * 0.15;
			if (scale < 0) scale = 0;
			if (scale > 3) scale = 3;
			scale = Math.pow(scale, 4) + 0.25;
			
			me.DSS_farmLayerStyle['5'] = new ol.style.Style({
				image: new ol.style.Circle({
					radius: def5.radius * scale, fill: def5.fill, stroke: def5.stroke
				})
			});
			me.DSS_farmLayerStyle['8'] = new ol.style.Style({
				image: new ol.style.Circle({
					radius: def8.radius * scale, fill: def8.fill, stroke: def8.stroke
				})
			})
			me.DSS_farmLayerStyle['12'] = new ol.style.Style({
				image: new ol.style.Circle({
					radius: def12.radius * scale, fill: def12.fill, stroke: def12.stroke
				})
			})
		}
		// establish starting style
		onViewChange({target: globalMap.getView()});
		
		// refresh style based on scale change
		globalMap.getView().on('change:resolution', onViewChange);
		
		var layer = new ol.layer.Vector({
			//opacity: 0.7,
			style: function(f) {
				// lookup the right style to use
				let ct = f.get("count");
				if (ct < 150) ct = 5
				else if (ct >= 1000) ct = 12
				else ct = 8;
				
				return me.DSS_farmLayerStyle[ct]
			},
			source: source,
			// these potentially reduce performance but looks better
			updateWhileAnimating: true, updateWhileInteracting: true
		})		
		me.getMap().addLayer(layer);
		/*
		var obj = Ext.Ajax.request({
			url: location.href + '/getFarmPoints',
			jsonData: {},
			timeout: 25000, // in milliseconds
			
			success: function(response, opts) {
				var obj = JSON.parse(response.responseText);
				console.log(obj);
			},
			
			failure: function(response, opts) {
				console.log(response);
			}
		});*/
	},
	
	//-----------------------------------------------------------------------
	addTips: function() {
		
		var el = Ext.dom.Query.select('.ol-custom-button')[0];
        Ext.tip.QuickTipManager.register({
            target: el,
            text: 'Toggle Map Controls'
        });
	}
	
});

