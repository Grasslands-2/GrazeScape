
//------------------------------------------------------------------------------
Ext.define('DSS.map.RotationLayer', {
//------------------------------------------------------------------------------
	extend: 'Ext.Base',
	alias: 'widget.rotation_layer',
	
	//-------------------------------------------------------------------------
	instantiate: function(map) {
		let me = this;
		console.log("init rotation layer &&&&&&&&&&&&&&&&&&&777")
		DSS['rotationStyles'] = { };
		

		let canvas = document.createElement('canvas');
		let context = canvas.getContext('2d');
		
		let createPatternLoc = function(imgSrc, cropCode, strokeColor) {
			//console.log('inside createPattern')
			let img = new Image();
			img.onload = function() {
				let pattern = context.createPattern(img, 'repeat');
				context.fillStyle = pattern;
				DSS.rotationStyles[cropCode] = new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: strokeColor,
						width: 1
					}),
					fill: new ol.style.Fill({
						color: pattern
					}),
					zIndex: 0
				});
			}
			img.src = imgSrc;			
		};
		
		createPatternLoc('/static/grazescape/public/images/dairy_rotation_1.png', 	'dr', '#a19');
		createPatternLoc('/static/grazescape/public/images/dairy_rotation_2.png', 	'cso', '#319');
		createPatternLoc('/static/grazescape/public/images/pasture2.png', 			'ps', '#380');
		createPatternLoc('/static/grazescape/public/images/pasture.png', 			'pt-rt', '#380');
		createPatternLoc('/static/grazescape/public/images/pasture.png', 			'pt-cn', '#380');
		createPatternLoc('/static/grazescape/public/images/dry_lot.png', 			'dl', '#a11');
		createPatternLoc('/static/grazescape/public/images/continuous_corn.png',		'cc', '#770');
		createPatternLoc('/static/grazescape/public/images/cash_grain.png',			'cg', '#ffcc33');

		console.log(DSS['rotationStyles']);
		
		// DSS.layer.fields_1 = new ol.layer.Vector({
		// 	visible: DSS.layer['crop:visible'],
		// 	opacity: DSS.layer['crop:opacity'],
		// 	updateWhileAnimating: true,
		// 	updateWhileInteracting: true,
		// 	source: geoServer.setFieldSource(),
		// 	style: function(feature, resolution) {
		// 		if (feature && feature.getProperties()) {
		// 			let rot = feature.getProperties()['rotation']; 
		// 			if (rot && DSS.rotationStyles[rot]) {
		// 				return DSS.rotationStyles[rot];
		// 			}
		// 		}
		// 	}
		// });	

		//map.addLayer(DSS.layer.fields_1);
		return me;
	},

});
