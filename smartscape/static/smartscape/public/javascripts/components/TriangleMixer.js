
//------------------------------------------------------------------------------
Ext.define('DSS.components.TriangleMixer', {
//------------------------------------------------------------------------------
    extend: 'Ext.Component',
	alias: 'widget.triangle_mixer',
	
	id: 'd3-mixer',
	width: 270,
	height: 233,

	listeners: {
		afterrender: function(self) {
			self.createD3_Elements();
		}
	},
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
		});
		
		me.callParent(arguments);
	},

	// id to be used here: 		.attr("filter", "url(#your-id");
	// w, h something like: 	120%, 150%
	// blur something like: 	4 (std deviations...)
	// offX, offY is in pixels
	// opacity something like: 	0 to 1
	//--------------------------------------------------------------------------
	addShadowElement: function(id, w, h, blur, offX, offY, opacity) {
		var me = this;
		
		var defs = me.DSS_svg.select("defs");
		var filter = defs.append("filter")
			.attr("id", id)
			.attr("width", w)
			.attr("height", h);
		filter.append("feGaussianBlur")
			.attr("in", "SourceAlpha")
			.attr("stdDeviation", blur)
			.attr("result", "blur");
		filter.append("feOffset")
			.attr("in", "blur")
			.attr("dx",offX)
			.attr("dy",offY)
			.attr("result","offsetBlur");
		
		var transfer = filter.append("feComponentTransfer")
			.attr("in",	"offsetBlur")
			.attr("result","alphaBlur");
		transfer.append("feFuncA")
			.attr("type", "linear")
			.attr("slope", opacity);
	
		var merge = filter.append("feMerge");
			merge.append("feMergeNode")
				.attr("in", "alphaBlur");
			merge.append("feMergeNode")
				.attr("in", "SourceGraphic");
	},
	
	//--------------------------------------------------------------------------
	outlineText: function(root, anchor, outlineClr, outlineWidth, strokeClr, text, x, y, dx, dy) {
		root.append('text')
			.attr('text-anchor', anchor)
			.attr('stroke', outlineClr)
			.attr('stroke-width', outlineWidth)
			.attr('font-size', "16px")
			.attr('x', x)
			.attr('dx', dx)
			.attr('y', y)
			.attr('dy', dy)
			.text(text)
	
		root.append('text')
			.attr('text-anchor', anchor)
			.attr('fill', strokeClr)
			.attr('font-size', "16px")
			.attr('x', x)
			.attr('dx', dx)
			.attr('y', y)
			.attr('dy', dy)
			.text(text)
	},

	//--------------------------------------------------------------------------
	createD3_Elements: function() {
		var me = this;
		var w = me.getWidth(), h = me.getHeight();
		
		me['DSS_svg'] = d3.select("#d3-mixer")
			.append("svg")
				.attr("width", w)
				.attr("height",h)

		
		var defs = me.DSS_svg.append("defs");
		me.addShadowElement('button-shadow', '160%', '160%', 1.5, 0, 4, 0.3);
		
		defs.append("clipPath")
			.attr("id", "shape-clip")
			.append("use")
			.attr("xlink:href", "#triangle-path");
			
		var root = me.DSS_svg.append('g')
			.attr('transform','translate(' + (w * 0.5) + ',' +  (h * 0.6) + ')scale(0.88,0.88)');
		
		var triangleRoot = root.append('g')
			.attr('transform','scale(2.5,2.5)')
			.attr("clip-path","url(#shape-clip)");

		var backHex = [];
		var side1 = -0.5, side2 = 0.5;
		var colorLeft = d3.scaleLinear()
			.domain([-3,-1,1])
			.range(['#207ca3','#3e836b','#00ba04'])
			.interpolate(d3.interpolateHcl);
		var colorRight = d3.scaleLinear()
			.domain([-3,-1,1])
			.range(['#207ca3','#787e48','#c29e11'])
			.interpolate(d3.interpolateHcl);
		
		for (var y = -3; y <= 2; y++) {
			var colorLtoR = d3.scaleLinear()
				.domain([side1,side2])
				.range([colorLeft(y),colorRight(y)])
				.interpolate(d3.interpolateHcl);
				
			for (var x = side1; x <= side2; x += 1.0) {
				backHex.push({
					t:'translate(' + (x * 20) + ',' + (y * (11.5 + 5.75))+ ')',
					col: colorLtoR(x)
				})
			}
			side1 -= 0.5; side2 += 0.5;
		}
		triangleRoot.selectAll('.d3-hex-back')
			.data(backHex)
			.enter()
			.append("path")
			.attr("class", "d3-hex-back")
			.attr("d", "m0,-11.5 l-10,5.75 l0,11.5 l10,5.75 l10,-5.75 l0,-11.5 z")
			.attr('transform', function(d) {
				return d.t
			})
			.attr("fill", function(d) {
				return d.col;
			})
			.attr("opacity", 0.5)

		var grid = [];
		for (var i = -5; i <=5; i++) {
			var x = -50 + i * 0.5 * 10, 
				y = (86.60254 / 3) + i * 0.8666 * 10;
			grid.push({
				x1: x,
				y1: y,
				x2: 0.866 * 100,
				y2: -0.5 * 100,
				major: i==0
			})
			
			x = 50 + i * -0.5 * 10; 
			y = (86.60254 / 3) + i * 0.8666 * 10;
			grid.push({
				x1: x,
				y1: y,
				x2: -0.866 * 100,
				y2: -0.5 * 100,
				major: i==0
			})
			
			x = 0 + i * 10;
			y = -(86.60254 * (2.0/3.0));
			grid.push({
				x1: x,
				y1: y,
				x2: 0,
				y2: 100,
				major: i==0
			})
		}

		triangleRoot.selectAll('.d3-grids')
			.data(grid)
			.enter()
			.append("path")
		//	.attr("clip-path", "url(#shape-clip)")
			.attr("class","d3-grids")
			.attr("stroke-width", 0.33)
			.attr("stroke", function(d) {
				if (d.major) {
					return "rgba(0,0,0,0.3)"
				}
				else {
					return "rgba(0,0,0,0.1)"
				}
			})
			.attr("d", function(d, i, a) {
				var res = "M" + d.x1 + "," + d.y1 + " l" + d.x2 + "," + d.y2
				return res
			})

		triangleRoot
			.append("path")
			.attr("id", "triangle-path")
			.attr("d", "m0,-57.735 l-50,86.60254 l100,0 z")
			.attr("fill", "none")
			.attr("stroke-width", 0.33)
			.attr("stroke", "rgba(0,0,0,0.5)")

		var circle = [{
			x: 0,
			y: 0,
			dx: 0,
			dy: 0,
		}];
		
		var overlayRoot = me.DSS_svg.append('g')
			.attr('transform','translate(' + (w * 0.5) + ',' +  (h * 0.6) + ')scale(0.88,0.88)');
		
		var draggable = overlayRoot
			.selectAll('circle')
			.data(circle)
			.enter()
			.append("g")
				.attr("transform", "translate(0,0)")
				.attr("cursor", "move")
				.attr("filter", "url(#button-shadow")
				.call(d3.drag()
					.subject(function(d) { 
						return d; 
					})
					.on("start", dragstart)
					.on("drag", dragmove)
					.on("end", dragend));


		draggable
			.append("circle")
			.attr("class", "d3-circle-knob")
			.attr("fill", "rgb(71,110,156)")
			.attr("stroke", "#fff")
			.attr("r", 16);
		draggable
		.append("circle")
		.attr("fill", "#fff")
		.attr("r", 1.5)
		
		  function dragstart(d) {
			  event.preventDefault()
			  draggable.select('.d3-circle-knob').attr('opacity', 0.7);
		  }
		  
		  function dragmove(d) {
		    
			  d.x = d.x + d3.event.dx;
			  d.y = d.y + d3.event.dy

			// convert coords with a given triangle...and test point..
		    var X1 = 0, Y1 = -144;
		    var X2 = -124, Y2 = 72;
		    var X3 = 124, Y3 = 72; 
		    var X4 = d.x, Y4 = d.y;
		    
		    //to UVW barycentric coords, ie, a tuple that represents the ratio(proportion) of each triangle
		    //	point that, taken together, would yield the test point.
		    var U = ((X4 * Y2) - (X4 * Y3) - (X2 * Y4) + (X2 * Y3) + (X3 * Y4) - (X3 * Y2)) /
		       ((X1 * Y2) - (X1 * Y3) - (X2 * Y1) + (X2 * Y3) + (X3 * Y1) - (X3 * Y2));

		    var V = ((X1 * Y4) - (X1 * Y3) - (X4 * Y1) + (X4 * Y3) + (X3 * Y1) - (X3 * Y4)) /
		       ((X1 * Y2) - (X1 * Y3) - (X2 * Y1) + (X2 * Y3) + (X3 * Y1) - (X3 * Y2));

		    var W = ((X1 * Y2) - (X1 * Y4) - (X2 * Y1) + (X2 * Y4) + (X4 * Y1) - (X4 * Y2)) /
		       ((X1 * Y2) - (X1 * Y3) - (X2 * Y1) + (X2 * Y3) + (X3 * Y1) - (X3 * Y2));
		    
		    // first-pass clip to constrain to interior
		    if (U < 0) U = 0;
		    else if (U > 1) U = 1;
		    if (V < 0) V = 0;
		    else if (V > 1) V = 1;
		    if (W < 0) W = 0;
		    else if (W > 1) W = 1;
		   
		    // second pass renormalize since bary-coord sum must be 1 if inside/on triangle
		    var sum = U+V+W; 
		    if (sum > 1) {
		    	sum = 1.0 / sum;
		    	U *= sum;
		    	V *= sum;
		    	W *= sum;
		    }
		    // snap by rounding (optional)
		    U = Math.round(U * 54) / 54.0;
		    V = Math.round(V * 54) / 54.0;
		    W = Math.round(W * 54) / 54.0;
		    
		    //convert back to cartesian
		    d.dx = X1 * U + X2 * V + X3 * W;
		    d.dy = Y1 * U + Y2 * V + Y3 * W;
		    
		    d3.select(this).attr("transform", "translate(" + d.dx 
		    		+ "," + d.dy + ")");
   
		    // reweight the graph. Equal weightings should amount to 100%
		    var max = U > V ? U : V;
		    max = max > W ? max : W;
		    
		    U = U / max;
		    V = V / max;
		    W = W / max;

			var radarData = Ext.data.StoreManager.lookup('dss-values');
			
			var rec = radarData.findRecord("type", 'pl');
			if (rec) rec.set('data1', rec.get('dataBak') * V)
			
			rec = radarData.findRecord("type", 'bh');
			if (rec) rec.set('data1', rec.get('dataBak') * V)
			
			rec = radarData.findRecord("type", 'ps');
			if (rec) rec.set('data1', rec.get('dataBak') * V)
			
			rec = radarData.findRecord("type", 'ni');
			if (rec) rec.set('data1', rec.get('dataBak') * W)
			
			rec = radarData.findRecord("type", 'sr');
			if (rec) rec.set('data1', rec.get('dataBak') * W)
			
			rec = radarData.findRecord("type", 'sc');
			if (rec) rec.set('data1', rec.get('dataBak') * W)

			rec = radarData.findRecord("type", 'gb');
			if (rec) rec.set('data1', rec.get('dataBak') * W)
			
			rec = radarData.findRecord("type", 'em');
			if (rec) rec.set('data1', rec.get('dataBak') * U)
		  }
		  
		function dragend(d) { 
			draggable.select('.d3-circle-knob').attr('opacity', 1);
			
			// fix real value to whatever the snap was so the internal values don't
			//	drift so far away from the clamped representation...
			d.x = d.dx;
			d.y = d.dy;
		}

		me.outlineText(overlayRoot, 'middle', 'rgba(240,240,230,0.5)', 5, '#333', "Air", 0, -h * 0.65, 0, '.35em');
		me.outlineText(overlayRoot, 'start', 'rgba(240,240,230,0.5)', 5, '#333', "Water", -w * 0.5, h * 0.38, '.35em', 0);
		me.outlineText(overlayRoot, 'end', 'rgba(240,240,230,0.5)', 5, '#333', "Soil", w * 0.5, h * 0.38, '-.35em', 0);
	}
	
});
