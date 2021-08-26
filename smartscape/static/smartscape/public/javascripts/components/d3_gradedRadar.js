
var pi = Math.PI,
	halfPi = pi / 2,
	tau = 2 * pi,
	epsilon = 1e-6,
	tauEpsilon = tau - epsilon,
	radToDeg = 360.0 / tau,
	degToRad = tau / 360.0;

function polarToCartesian(centerX, centerY, radius, angleInRadians) {

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, r, startAngle, endAngle){

	startAngle -= (halfPi);
	endAngle -= (halfPi);
    var start = polarToCartesian(x, y, r, endAngle);
    var end = polarToCartesian(x, y, r, startAngle);

    var sweepFlag = endAngle > startAngle ? "0" : "1"
    var largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1"
    	
    var d = [
        "M", start.x, start.y, 
        "A", r, r, 0, largeArcFlag, sweepFlag, end.x, end.y
    ].join(" ");

    return d;       
}
//------------------------------------------------------------------------------
Ext.define('DSS.components.d3_gradedRadar', {
//------------------------------------------------------------------------------
    extend: 'Ext.Component',
	alias: 'widget.graded_radar',
	
	id: 'd3-graded-radar',
	width: 340,
	height: 340,
	//style: 'background: #fff',
	listeners: {
		afterrender: function(self) {
			self.createD3_Elements();
		}
	},
	DSS_values: [
		{v:0.4, vo: 0.35, t:'Bird Habitat'},
		{v:0.48, vo: 0.44, t:'Pest Suppression'},
		{v:0.56, vo: 0.50, t:'N Retention'},
		{v:0.59, vo: 0.501, t:'Soil Retention'},
		{v:0.38, vo: 0.245, t:'P Retention'},
		{v:0.1, vo: 0.26, t:'Soil Carbon'},
		{v:0.25, vo: 0.32, t:'Climate Mitigation'},
		{v:0.43, vo: 0.39, t:'Pollinators'},
	],

	DSS_valueWorst: '#d53e4f',
	DSS_valuePoor: '#dc8f50',
	DSS_valueAccetable: '#f6e851',
	DSS_valueBest: '#98bf63',
	DSS_colorGrade: null,
	
	listeners: {
		afterrender: function(self) {
			self.createD3_Elements();
			var res = [];
			Ext.each(self.DSS_values, function(d,i) {
				res.push({
					v: Math.random() * 0.1,
					t: d.t
				})
			});
			self.animateTo(res);
		},
		show: function(self) {
			Ext.defer(function() {
				self.animateTo(self.DSS_values)
			}, 250);
		}
	},
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
		});
		
		me.callParent(arguments);
		me.DSS_colorGrade = me.createColorGrade();
	},

	//--------------------------------------------------------------------------
	createColorGrade: function() {
		var me = this;
		var c1 = me.DSS_valueWorst, c2 = me.DSS_valuePoor, c3 = me.DSS_valueAccetable, c4 = me.DSS_valueBest;
		
		return d3.scaleLinear()
			.domain([0,0.25, 0.26,0.5, 0.51,0.75, 0.76,1])
			.range([c1,c1, c2,c2, c3,c3, c4,c4])
	},

	//--------------------------------------------------------------------------
	createD3_Elements: function() {
		var me = this;
		var w = me.getWidth(), h = me.getHeight();
		const circlePow = 0.8;
		const count = me.DSS_values.length;
		
		me['DSS_svg'] = d3.select("#d3-graded-radar")
			.append("svg")
				.attr("width", w)
				.attr("height",h)

		const padded_hw = (w * 0.5) - 30,
			padded_hh = (h * 0.5) - 30;
		
		var root = me.DSS_svg.append('g')
			.attr('transform','translate(' + (w * 0.5) + ',' +  (h * 0.5) + ')');
		
		root.append("circle")
			.attr('r', padded_hw + 10)
			.attr('fill', '#fff')
		
		var colorGrade = me.DSS_colorGrade;
		
		var circularGrid = [];
		for (var i = 0; i <= 8; i++) {
			var g = {
				r: i * 0.125,
				o: (i == 0 || i == 8) ? 1 : 
					(i % 2) ? 0.1 : 0.5
			};
			circularGrid.push(g);
		}
		
		const wedgeSize = tau / count;
		var wedges = root.selectAll('.d3-wedge-container')
			.data(me.DSS_values)
			.enter()
			.append("g").attr('class','d3-wedge-container')
		
		var arcGenerator = d3.arc()
			.innerRadius(10)
			.padAngle(0.005)
			.cornerRadius(2)
			.padRadius(padded_hw + 10);
		
		wedges
			.append("path")
			.attr("class", 'd3-wedge')
			.attr("d", function(d,i) {
				var sAngle = (i - 0.5) * wedgeSize,
					outer = Math.pow(d.v,circlePow) * padded_hw,
					inner = outer - 10;
				outer = outer > 2 ? outer : 2;
				var path = arcGenerator
					//.innerRadius(inner > 10 ? inner : 10)
					.startAngle(sAngle)
					.endAngle(sAngle + wedgeSize)
					.outerRadius(outer + 10);
				return path();
			})
			.attr("fill", function(d) {
				return colorGrade(d.v)
			})
			.attr("stroke", function(d) {
				const c = colorGrade(d.v)
				return d3.color(c).darker(1).hex()
			})
			.attr("stroke-width", 1)
			
		arcGenerator
			.innerRadius(10)
			.outerRadius(padded_hw + 30);
			
		wedges
			.append("path")
			.attr("id", function(d,i) { 
				return "wedge-arc-" + i
			})
			.attr("class", 'd3-text-wedge')
			.attr("d", function(d,i) {
				var sAngle = (i - 0.5) * wedgeSize;
				var test = Math.cos(i * wedgeSize)

				// flip start/end when we go around the bottom half. This will reorder the text placement
				var path = arcGenerator
					.startAngle(test < 0 ? sAngle + wedgeSize : sAngle)
					.endAngle(test < 0 ? sAngle : sAngle + wedgeSize);
				return path();
			})
			.attr("fill", 'rgba(0,0,0,0)')
	        .on("mouseover", function(d) {
	            me.DSS_tooltip
	            	.transition()
	            	.delay(function(d) {
	            		return me.DSS_tooltip.style("opacity") > 0 ? 0 : 600;
	            	})
	                .duration(100)		
	                .style("opacity", 1);		
	            me.DSS_tooltip
	            	.html("<b>" + d.t + ":</b> " + (d.v * 100).toFixed(1) + "%")	
	                .style("left", (d3.event.clientX + "px"))
	            	.style("top", (d3.event.clientY + "px"))
	        })
	        .on("mouseout", function(d) {		
        		me.DSS_tooltip
        		.transition()		
                .duration(100)		
                .style("opacity", 0);	
	        });
		
		wedges.append("text")
			.attr("class","d3-wedge-text")
			.attr("opacity", 0.8)
			.style('font-size', '14px')
			.attr("dy", function(d,i) {
				var test = Math.cos(i * wedgeSize);
				return test < 0 ? -5 : 13
			})
			.append("textPath")
			.attr("startOffset", '15%')
			.style("text-anchor", "middle")
			.attr("xlink:href", function(d,i) {
				return '#wedge-arc-' + i;
			})
			.text(function(d) {
				return d.t;
			})

		// add on comparison
		root.selectAll('.d3-comparison-marks')
			.data(me.DSS_values)
			.enter()
			.append("path")
				.attr("class", "d3-comparison-marks")
				.attr('transform', function(d,i) {
					var angle = i * wedgeSize - pi;
					return "rotate(" + (angle * radToDeg) + ")"
				})
				.attr("d", function(d,i) {
					var r = (Math.pow(d.vo,circlePow) * padded_hw + 10);
					return "M0," + (r-6) + "l3.5,6 l-3.5,6 l-3.5,-6 Z" 
				})
				.attr("stroke-width", 0.5)
				.attr("stroke", "#000")
				.attr("fill", function(d) {
					return colorGrade(d.vo)
				})
	        .on("mouseover", function(d) {
	            me.DSS_tooltip
	            	.transition()
	            	.delay(function(d) {
	            		return me.DSS_tooltip.style("opacity") > 0 ? 0 : 600;
	            	})
	                .duration(100)		
	                .style("opacity", 1);		
	            me.DSS_tooltip
	            	.html("<b>" + d.t + ":</b> " + (d.vo * 100).toFixed(1) + "%")	
	                .style("left", (d3.event.clientX + "px"))
	            	.style("top", (d3.event.clientY + "px"))
	        })
	        .on("mouseout", function(d) {		
        		me.DSS_tooltip
        		.transition()		
                .duration(100)		
                .style("opacity", 0);	
	        })			
				
		root.selectAll('.d3-comparison-lines')
			.data(me.DSS_values)
			.enter()
			.append("path")
				.attr("class", "d3-comparison-lines")
				.attr("d", function(d,i) {
					var sAngle = (i-0.3) * wedgeSize,
						eAngle = (i+0.3) * wedgeSize;
					return describeArc(0, 0, Math.pow(d.vo,circlePow) * padded_hw + 10, sAngle, eAngle);
					
				})
				.attr("stroke-width", 0.75)
				.attr("stroke", "#000")
				.attr("fill", "none")
				.style("pointer-events","none")


			
		root.append("g")
			.attr("opacity", 0.25)
			.attr("stroke", '#000')
			.attr("stroke-width", 0.75)
		.selectAll('.d3-radial-grid')
			.data(me.DSS_values)
			.enter()
			.append("line")
			.attr("class", 'd3-radial-grid')
			.attr("x1", function(d,i) {
				i -= 0.5;
				var sAngle = i * wedgeSize - halfPi;
				return Math.cos(sAngle) * 10;
			})
			.attr("y1", function(d,i) {
				i -= 0.5;
				var sAngle = i * wedgeSize - halfPi;
				return Math.sin(sAngle) * 10;
			})
			.attr("x2", function(d,i) {
				i -= 0.5;
				var sAngle = i * wedgeSize - halfPi;
				return Math.cos(sAngle) * (padded_hw + 10);
			})
			.attr("y2", function(d,i) {
				i -= 0.5;
				var sAngle = i * wedgeSize - halfPi;
				return Math.sin(sAngle) * (padded_hw + 10);
			});
			
		root.append("g")
			.style("pointer-events","none")
			.attr("fill", "none")
			.attr("stroke", "#333")
		.selectAll('.d3-circular-grid')
			.data(circularGrid)
			.enter()
			.append("circle")
			.attr("class", "d3-circular-grid")
			.attr("r", function(d) {
				return Math.pow(d.r,circlePow) * padded_hw + 10;
			})
			.attr("stroke-width", function(d) {
				return d.o * 0.5 + 0.6;
			})
			.attr("opacity", function(d) {
				return d.o;
			})
			
		// FIXME: acquires an existing one at a wonky delay
		Ext.defer(function() {
			me['DSS_tooltip'] = d3.select(".d3-nav-tooltip");
			console.log(me.DSS_tooltip)
		}, 250);
	},
	
	//-------------------------------------------------------------
	animateTo: function(newData) {
		var me = this;
		const count = newData.length;
		var w = me.getWidth(), h = me.getHeight();
		const circlePow = 0.8;
		const padded_hw = (w * 0.5) - 30,
			padded_hh = (h * 0.5) - 30;
		
		var colorGrade = me.DSS_colorGrade;
		
		const wedgeSize = tau / count;
		var arcGenerator = d3.arc()
			.cornerRadius(2)
			.innerRadius(10)
			.padAngle(0.005)
			.padRadius(padded_hw + 10);
		
		// mouse tooltips are bound here so must be updated
		me.DSS_svg.selectAll('.d3-text-wedge')
			.data(newData);
		
		me.DSS_svg.selectAll('.d3-wedge')
		.data(newData)
		.transition()
		.delay(function(d,i) {
			return i * 50 
		})
		.duration(1000)
		.ease(d3.easeBounce)
		.attr("d", function(d,i) {
			var sAngle = (i - 0.5) * wedgeSize,
				outer = Math.pow(d.v,0.8) * padded_hw;
			outer = outer > 2 ? outer : 2;

			var path = arcGenerator
				.startAngle(sAngle)
				.endAngle(sAngle + wedgeSize)
				.outerRadius(outer + 10);
			return path();
		})
		.attr("fill", function(d) {
			return colorGrade(d.v)
		})
		.attr("stroke", function(d) {
			const c = colorGrade(d.v)
			return d3.color(c).darker(1).hex()
		});
	}
	
});
