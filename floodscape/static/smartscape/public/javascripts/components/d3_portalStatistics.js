
var pi = Math.PI,
	halfPi = pi / 2,
	tau = 2 * pi,
	epsilon = 1e-6,
	tauEpsilon = tau - epsilon;

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
Ext.define('DSS.components.d3_portalStatistics', {
//------------------------------------------------------------------------------
    extend: 'Ext.Component',
	alias: 'widget.portal_statistics',
	
	id: 'd3-portal-stats',
	width: 364, // 260
	height: 364, // 260
	//style: 'background: #fff',
	/*listeners: {
		afterrender: function(self) {
			self.createD3_Radar();
			self.createD3_Pie();
		}
	},*/
	DSS_values: [
		{v:0.8, t:'Bird Habitat'},
		{v:0.76, t:'Pest Suppression'},
		{v:0.56, t:'N Retention'},
		{v:0.5, t:'Soil Retention'},
		{v:0.29, t:'P Retention'},
		{v:0.2, t:'Soil Carbon'},
		{v:0.25, t:'Climate Mitigation'},
		{v:0.92, t:'Pollinators'},
	],

	DSS_pieValues: [
		{v:22, t:'Grasses',c: d3.color('#98bf63').darker(0.5).hex()},
		{v:39, t:'Row Crops', c: d3.color('#e7ed55').darker(0.5).hex()},
		{v:8, t:'Developed', c:'#948f9f'},
		{v:13, t:'Water', c:'#819ad7'},
		{v:19, t:'Woodland', c: d3.color('#dc8f5f').darker(0.7).hex()},
	],

	DSS_valueWorst: '#d53e4f',
	DSS_valuePoor: '#dc8f50',
	DSS_valueAccetable: '#f6e851',
	DSS_valueBest: '#98bf63',
	
	DSS_pieAngle: 0,
	DSS_colorGrade: null,
	
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
	reveal: function() {
		var me = this;
		
		Ext.defer(function() {
			me.createD3_Pie();
			me.rotatePie(0.03);
			d3.interval(function(elapsed) {
				me.DSS_pieAngle = (elapsed / 14000.0)
				me.rotatePie(me.DSS_pieAngle);
			}, 650);
			Ext.getCmp('dss-main-view').getProportions(undefined, true);
		}, 20);

		Ext.defer(function() {
			me.createD3_Radar();
			Ext.getCmp('dss-main-view').getRadar();
		}, 1200);
		
	},
	
	//--------------------------------------------------------------------------
	createD3_Radar: function() {
		var me = this;
		var w = me.getWidth(), h = me.getHeight();
		const circlePow = 0.8;
		const count = me.DSS_values.length;

		if (!me.DSS_svg) {
			me['DSS_svg'] = d3.select("#d3-portal-stats")
				.append("svg")
					.attr("width", w)
					.attr("height",h)
		}

		var root = me.DSS_svg.append('g')
			.attr('transform','translate(' + (w * 0.5) + ',' +  (h * 0.5) + ')');

		const radar_size = 100;
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
		
		root.append("circle")
			.attr('r', 1)//radar_size + 10)
			.attr('fill', '#fff')
			.transition()
				.duration(1200)
				.attr('r',radar_size + 10)
			
		const wedgeSize = Math.PI * 2 / count;
		var wedges = root.selectAll('.d3-wedge-container')
			.data(me.DSS_values)
			.enter()
			.append("g").attr('class','d3-wedge-container')
				.attr("opacity", 0);
		
		wedges
			.transition()
			.delay(function(d,i) {
				return 2000 + i * 250
			})
			.duration(500)
			.attr("opacity", 1)
		
		var arcGenerator = d3.arc()
			.innerRadius(10)
			.padAngle(0.005)
			.cornerRadius(2)
			.padRadius(radar_size + 10);
		
		wedges
			.append("path")
			.attr("class", 'd3-wedge')
			.attr("d", function(d,i) {
				var sAngle = (i - 0.5) * wedgeSize,
					outer = Math.pow(d.v,circlePow) * radar_size + 10,
					inner = outer - 10;
		
				var path = arcGenerator
					//.innerRadius(inner > 10 ? inner : 10)
					.startAngle(sAngle)
					.endAngle(sAngle + wedgeSize)
					.outerRadius(outer);
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
			.outerRadius(radar_size + 30);
			
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
	        })			
;
		
		wedges.append("text")
			.attr("class","d3-wedge-text")
			.attr("opacity", 0.8)
			.style('font-size', '13px')
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
				return Math.cos(sAngle) * 10;// * (radar_size + 10);
			})
			.attr("y2", function(d,i) {
				i -= 0.5;
				var sAngle = i * wedgeSize - halfPi;
				return Math.sin(sAngle) * 10;//(radar_size + 10);
			})
			.transition()
			.delay(function(d,i) {
				return i * 200 + 600;
			})
			.duration(500)
			.attr("x2", function(d,i) {
				i -= 0.5;
				var sAngle = i * wedgeSize - halfPi;
				return Math.cos(sAngle) * (radar_size + 10);
			})
			.attr("y2", function(d,i) {
				i -= 0.5;
				var sAngle = i * wedgeSize - halfPi;
				return Math.sin(sAngle) * (radar_size + 10);
			})

			
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
				return Math.pow(d.r,circlePow) * radar_size + 10;
			})
			.attr("stroke-width", function(d) {
				return d.o * 0.5 + 0.6;
			})
			.attr("opacity", function(d) {
				return 0;
			})
			.transition()
			.delay(function(d,i) {
				return i * 50 + 900;
			})
			.duration(250)
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
	updateRadarTo: function(newData) {
		var me = this;
		const count = newData.length;
		const circlePow = 0.8;
		const radar_size = 100;//(w * 0.5) - 30,
		
		var colorGrade = me.DSS_colorGrade;
		const wedgeSize = Math.PI * 2 / count;
		var arcGenerator = d3.arc()
			.cornerRadius(2)
			.innerRadius(10)
			.padAngle(0.005)
			.padRadius(radar_size + 10);
		
		// mouse tooltips are bound here so must be updated
		me.DSS_svg.selectAll('.d3-text-wedge')
			.data(newData);
		
		me.DSS_svg.selectAll('.d3-wedge')
		.data(newData)
		.transition()
		.duration(1000)
		.ease(d3.easeBounce)
		.attr("d", function(d,i) {
			var sAngle = (i - 0.5) * wedgeSize,
				outer = Math.pow(d.v,0.8) * radar_size + 10,
				inner = outer - 10;
	
			var path = arcGenerator
				.startAngle(sAngle)
				.endAngle(sAngle + wedgeSize)
				.outerRadius(outer);
			return path();
		})
		.attr("fill", function(d) {
			return colorGrade(d.v)
		})
		.attr("stroke", function(d) {
			const c = colorGrade(d.v)
			return d3.color(c).darker(1).hex()
		});
	},
	
	//--------------------------------------------------------------------------
	createD3_Pie: function() {
		var me = this;
		var w = me.getWidth(), h = me.getHeight();
	
		if (!me.DSS_svg) {
			me['DSS_svg'] = d3.select("#d3-portal-stats")
				.append("svg")
					.attr("width", w)
					.attr("height",h)
		}
		
		const padded_hw = (w * 0.5) - 30,
		padded_hh = (h * 0.5) - 30;
		var inner = padded_hw - 14;

		var pie = me['DSS_d3_pie'] = d3.pie()
			.padAngle(0.015)
			.sortValues(null)
			.value(function(d) {
				return d.v; 
			})(me.DSS_pieValues);
		
		pie.forEach(function(d) {
			d.innerRadius = inner
		});

		var center = 'translate(' + (w * 0.5) + ',' +  (h * 0.5) + ')';
		var root = me.DSS_svg.append('g')
			.attr('transform',center)
			.append('g')
			.attr('class', 'd3-pie-root');
		
		var wedges = root.selectAll('.d3-pie-container')
			.data(pie)
			.enter()
			.append("g")
			.attr('class','d3-pie-container')
			.attr("opacity", 0);
		
		wedges
			.transition()
				.duration(800)
				.ease(d3.easeQuadOut)
				.delay(function(d,i){return i * 200})
				.attr("opacity", 1);			
		
		var arcGenerator = d3.arc()
			.outerRadius(padded_hw+14)
			.cornerRadius(2)
		
		wedges
			.append("path")
			.attr("class", 'd3-pie')
			.attr("d", arcGenerator)
			.attr("fill", function(d) {
				return d.data.c;
			})
			.attr("stroke", function(d) {
				return d3.color(d.data.c).darker(1).hex()
			})
			.attr("stroke-width", 1)
			.each(function(d) {
				this._current = d
			})
			
		arcGenerator
			.outerRadius(padded_hw + 30)
			.padAngle(0)
			.cornerRadius(0)
		
		wedges
			.append("path")
			.attr("class", 'd3-text-pie')
			.attr("d", arcGenerator)
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
	            	.html("<b>" + d.data.t + ":</b> " + d.data.v.toFixed(1) + "%")	
	                .style("left", (d3.event.clientX + "px"))
	            	.style("top", (d3.event.clientY + "px"))
	        })
	        .on("mouseout", function(d) {		
        		me.DSS_tooltip
        		.transition()		
                .duration(100)		
                .style("opacity", 0);	
	        })
			.each(function(d) {
				this._current = d
			})

	wedges
		.append("path")
		.attr("class", 'd3-pie-arc')
		.attr("id", function(d,i) { 
			return "pie-arc-" + i
		})
		.attr("d", function(d) {
			var cen = (d.startAngle + d.endAngle) / 2;
			
			var test = cen - halfPi;
			while (test > pi) test -= tau;
			// flip start/end when we go around the bottom half. This will reorder the text placement
			var a1 = (test < 0) ? cen + 1 : cen - 1,
				a2 = (test < 0) ? cen - 1 : cen + 1;
			
			var path = describeArc(0,0,padded_hw + 10, a1, a2);
			return path;
		})
		.attr("fill", "none")
		.each(function(d) {
			this._current = d
		})
	
		wedges.append("text")
			.attr("class","d3-pie-text")
			.attr("opacity", 0.8)
			.style('font-size', '14px')
			.attr("dy", function(d) {
				var cen = (d.startAngle + d.endAngle) / 2;
				
				var test = cen - halfPi;
				while (test > pi) test -= tau;
				return test < 0 ? -8 : 16
			})
			.append("textPath")
			.attr("startOffset", '50%')
			.style("text-anchor", "middle")
			.attr("xlink:href", function(d,i) {
				return '#pie-arc-' + i;
			})
			.text(function(d) {
				return d.data.t;
			})
			.each(function(d) {
				this._current = d
			})
	},
	
	//-------------------------------------------------------------
	updatePieTo: function(newData, fast) {
		var me = this;
		var w = me.getWidth(), h = me.getHeight();
		duration = fast ? 10 : 1000;
		ease = d3.easeBounce;
		
		const padded_hw = (w * 0.5) - 30,
		padded_hh = (h * 0.5) - 30;
	
		inner = padded_hw - 14;
		
		var pie = me['DSS_d3_pie'] = d3.pie()
			.padAngle(0.015)
			.sortValues(null)
			.value(function(d) {
				return d.v; 
			})(newData);
		
		pie.forEach(function(d) {
			d.innerRadius = inner
//			d.startAngle += offset;
//			d.endAngle += offset;
		});
		
		var arc = d3.arc()
			.outerRadius(padded_hw+14)
			.cornerRadius(2);
		function arcTween(a) {
			var iInterp =  d3.interpolate(this._current, a);
			this._current = iInterp(0);
			return function(t) {
				return arc(iInterp(t));
			}
		}
		
		var containerArc = d3.arc()
			.outerRadius(padded_hw+30);
		function containerArcTween(a) {
			var iInterp =  d3.interpolate(this._current, a);
			this._current = iInterp(0);
			return function(t) {
				return containerArc(iInterp(t));
			}
		}
		
		function pathTween(a) {
			var iInterp =  d3.interpolate(this._current, a);
			this._current = iInterp(0);
			return function(t) {
				var res = iInterp(t);
				var cen = (res.startAngle + res.endAngle) / 2;
				
				var test = cen - halfPi + me.DSS_pieAngle;
				while (test > pi) test -= tau;

				// flip start/end when we go around the bottom half. This will reorder the text placement
				var a1 = (test < 0) ? cen + 1 : cen - 1,
					a2 = (test < 0) ? cen - 1 : cen + 1;
				
				return describeArc(0,0,padded_hw + 10, a1, a2);
			}
		}

		function dyTween(a) {
			var iInterp =  d3.interpolate(this._current, a);
			this._current = iInterp(0);
			return function(t) {
				var res = iInterp(t);
				var cen = (res.startAngle + res.endAngle) / 2;
				
				var test = cen - halfPi + me.DSS_pieAngle;
				while (test > pi) test -= tau;
				
				// flip start/end when we go around the bottom half. This will reorder the text placement
				return test < 0 ? -8 : 16
			}
		}
		
		me.DSS_svg
			.selectAll('.d3-pie')
			.data(pie)
			.transition()
				.duration(duration)
				.ease(ease)
				.attrTween("d", arcTween);
	
		// mouse tooltips are bound here so must be updated
		me.DSS_svg
			.selectAll('.d3-text-pie')
			.data(pie)
			.transition()
				.duration(duration)
				.ease(ease)
				.attrTween("d", containerArcTween);

		me.DSS_svg
			.selectAll(".d3-pie-arc")
			.data(pie)
			.transition()
				.duration(duration)
				.ease(ease)
				.attrTween("d", pathTween);

		me.DSS_svg
			.selectAll(".d3-pie-text")
			.data(pie)
			.transition()
				.duration(duration)
				.ease(ease)
				.attrTween("dy", dyTween);
		
	},

	//-------------------------------------------------------------
	rotatePie: function(ang) {
		var me = this;
		var w = me.getWidth(), h = me.getHeight();
	
		const padded_hw = (w * 0.5) - 30,
		padded_hh = (h * 0.5) - 30;
	
		var duration = 650;
		var ease = d3.easeLinear;
		
		me.DSS_svg
			.selectAll(".d3-pie-root")
			.transition()
			.duration(duration)
			.ease(ease)
			.attr("transform", "rotate(" + (ang * (360.0/tau)) + ")")
		
		var containerArc = d3.arc()
			.outerRadius(padded_hw+30);
		function containerArcTween(a) {
			var iInterp =  d3.interpolate(this._current, a);
			this._current = iInterp(0);
			return function(t) {
				return containerArc(iInterp(t));
			}
		}
		
		function pathTween(a) {
			var iInterp =  d3.interpolate(this._current, a);
			this._current = iInterp(0);
			return function(t) {
				var res = iInterp(t);
				var cen = (res.startAngle + res.endAngle) / 2;
				
				var test = cen - halfPi + me.DSS_pieAngle;
				while (test > pi) test -= tau;

				// flip start/end when we go around the bottom half. This will reorder the text placement
				var a1 = (test < 0) ? cen + 1 : cen - 1,
					a2 = (test < 0) ? cen - 1 : cen + 1;
				
				return describeArc(0,0,padded_hw + 10, a1, a2);
			}
		}

		function dyTween(a) {
			var iInterp =  d3.interpolate(this._current, a);
			this._current = iInterp(0);
			return function(t) {
				var res = iInterp(t);
				var cen = (res.startAngle + res.endAngle) / 2;
				
				var test = cen - halfPi  + me.DSS_pieAngle;
				while (test > pi) test -= tau;
				
				// flip start/end when we go around the bottom half. This will reorder the text placement
				return test < 0 ? -8 : 16
			}
		}
		
		me.DSS_svg
			.selectAll(".d3-pie-arc")
			.transition()
				.duration(250)
				.ease(ease)
				.attrTween("d", pathTween);

		me.DSS_svg
			.selectAll(".d3-pie-text")
			.transition()
				.duration(250)
				.ease(ease)
				.attrTween("dy", dyTween);
		
	},

});
