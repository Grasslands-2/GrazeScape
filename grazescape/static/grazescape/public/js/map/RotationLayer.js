Ext.define('DSS.map.RotationLayer', {
	extend: 'Ext.Base',
	alias: 'widget.rotation_layer',
	
	instantiate: function(map) {
		let me = this;

		DSS['rotationStyles'] = { };

		let canvas = document.createElement('canvas');
		let context = canvas.getContext('2d');
		
		let createPatternLoc = function(imgSrc, cropCode, strokeColor) {
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
		createPatternLoc('/static/grazescape/public/images/continuous_corn.png',	'cc', '#f2f030');
		createPatternLoc('/static/grazescape/public/images/cash_grain.png',			'cg', '#3897b0');

		return me;
	},
});
