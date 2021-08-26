
//------------------------------------------------------------------------------
Ext.define('DSS.components.d3_multiRadar', {
//------------------------------------------------------------------------------
    extend: 'Ext.Component',
	alias: 'widget.multi_radar',
	
	id: 'd3-multi-radar',
	width: 340,
	height: 340,
	//style: 'background: #fff',
	listeners: {
		afterrender: function(self) {
			self.createD3_Elements();
		}
	},
	DSS_values: [
		{v1:1, v2: 0.612, 	t:'Bird Habitat'},
		{v1:1, v2: 0.753, t:'Pest Suppression'},
		{v1:1, v2: 0.811,  t:'N Retention'},
		{v1:1, v2: 0.609,  	t:'Soil Retention'},
		{v1:1, v2: 0.413,  t:'P Retention'},
		{v1:0.881, v2: 1,  	t:'Soil Carbon'},
		{v1:0.954, v2: 1,  t:'Climate Mitigation'},
		{v1:1, v2: 0.717,  t:'Pollinators'},
	],

	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
		});
		
		var tt = 0;
		me.callParent(arguments);
	/*	setInterval(function() {
			var res = [];
			Ext.each(me.DSS_values, function(d,i) {
				res.push({
					v: Math.random() * 0.5 + (Math.cos(tt + i * 0.4) + 1) * 0.25,
					t: d.t
				})
			});
		//	me.animateTo(res);
			tt += 0.5;
		}, 6000)*/
	},

	//--------------------------------------------------------------------------
	createD3_Elements: function() {
		var me = this;
		var w = me.getWidth(), h = me.getHeight();
		const circlePow = 0.8;
		const count = me.DSS_values.length;
		
		var cx = w * 0.5, cy = cx + (h-w);
		
		me['DSS_svg'] = d3.select("#d3-multi-radar")
			.append("svg")
				.attr("width", w)
				.attr("height",h)

		const padded_hw = (w * 0.5) - 30,
			padded_hh = (h * 0.5) - 30;
		
		var root = me.DSS_svg.append('g')
			.attr('transform','translate(' + cx + ',' + cy + ')');
		
		root.append("circle")
			.attr('r', padded_hw)
			.attr('fill', '#fff')
		
		var circularGrid = [];
		for (var i = 0; i <= 8; i++) {
			var g = {
				r: i * 0.125,
				o: (i == 0 || i == 8) ? 1 : 
					(i % 2) ? 0.2 : 0.5
			};
			circularGrid.push(g);
		}
		
		const wedgeSize = Math.PI * 2 / count;
		var wedges = root.selectAll('.d3-wedge-container')
			.data(me.DSS_values)
			.enter()
			.append("g").attr('class','d3-wedge-container')
		
		var arcGenerator = d3.arc()
			.innerRadius(0)
			.padAngle(0.005)
			.cornerRadius(2)
			.padRadius(padded_hw + 10);
		
		var path1 = null, path2 = null;
		wedges.each(function(d, i) {
			var ptx = Math.cos(i * wedgeSize - Math.PI / 2) * d.v1 * padded_hw,
				pty = Math.sin(i * wedgeSize - Math.PI / 2) * d.v1 * padded_hw;
			path1 = (path1 ? path1 + 'L' : 'M') + ptx + ','+ pty;
			
			ptx = Math.cos(i * wedgeSize - Math.PI / 2) * d.v2 * padded_hw,
				pty = Math.sin(i * wedgeSize - Math.PI / 2) * d.v2 * padded_hw;
			path2 = (path2 ? path2 + 'L' : 'M') + ptx + ','+ pty; 
		})
		path1 += "Z"; path2 += "Z";
		
		root.append("path")
			.attr("d", path1)
			.attr("stroke", "#580")
			.attr("stroke-width", 2)
			.attr("fill", 'rgba(130,170,10,0.3)')
			.attr("opacity", '0.5')
		
		root.append("path")
			.attr("d", path2)
			.attr("stroke", "#15a")
			.attr("stroke-width", 2)
			.attr("fill", 'rgba(0,30,200,0.3)')
			.attr("opacity", '0.5')
			
		root.selectAll('.d3-nodes')
			.data(me.DSS_values)
			.enter()
			.append("circle")
				.attr("r", 4)
				.attr("cx", function(d,i) {
					return Math.cos(i * wedgeSize - Math.PI / 2) * d.v1 * padded_hw;
				})
				.attr("cy", function(d,i) {
					return Math.sin(i * wedgeSize - Math.PI / 2) * d.v1 * padded_hw;
				})
				.attr("stroke", "#000")
				.attr("stroke-width", 1)
				.attr("fill", '#6a2')
		        .on("mouseover", function(d) {
		            me.DSS_tooltip
		            	.transition()
		            	.delay(function(d) {
		            		return me.DSS_tooltip.style("opacity") > 0 ? 0 : 600;
		            	})
		                .duration(100)		
		                .style("opacity", 1);		
		            me.DSS_tooltip
		            	.html("<b>" + d.t + ":</b> " + (d.v1 * 100).toFixed(1) + "%")	
		                .style("left", (d3.event.clientX + "px"))
		            	.style("top", (d3.event.clientY + "px"))
		        })
		        .on("mouseout", function(d) {		
		    		me.DSS_tooltip
		    		.transition()		
		            .duration(100)		
		            .style("opacity", 0);	
		        });
		
		root.selectAll('.d3-nodes')
		.data(me.DSS_values)
		.enter()
			.append("circle")
			.attr("r", 4)
			.attr("cx", function(d,i) {
				return Math.cos(i * wedgeSize - Math.PI / 2) * d.v2 * padded_hw;
			})
			.attr("cy", function(d,i) {
				return Math.sin(i * wedgeSize - Math.PI / 2) * d.v2 * padded_hw;
			})
			.attr("stroke", "#000")
			.attr("stroke-width", 1)
			.attr("fill", '#15a')
	        .on("mouseover", function(d) {
	            me.DSS_tooltip
	            	.transition()
	            	.delay(function(d) {
	            		return me.DSS_tooltip.style("opacity") > 0 ? 0 : 600;
	            	})
	                .duration(100)		
	                .style("opacity", 1);		
	            me.DSS_tooltip
	            	.html("<b>" + d.t + ":</b> " + (d.v2 * 100).toFixed(1) + "%")	
	                .style("left", (d3.event.clientX + "px"))
	            	.style("top", (d3.event.clientY + "px"))
	        })
	        .on("mouseout", function(d) {		
        		me.DSS_tooltip
        		.transition()		
                .duration(100)		
                .style("opacity", 0);	
	        });

			
		/*wedges
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
		*/	
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
			.attr("fill", 'rgba(0,0,0,0)');
/*	        .on("mouseover", function(d) {
	            me.DSS_tooltip
	            	.transition()
	            	.delay(function(d) {
	            		return me.DSS_tooltip.style("opacity") > 0 ? 0 : 600;
	            	})
	                .duration(100)		
	                .style("opacity", 1);		
	            me.DSS_tooltip
	            	.html("<b>" + d.t + ":</b> " + (d.v1 * 100).toFixed(1) + "%")	
	                .style("left", (d3.event.clientX + "px"))
	            	.style("top", (d3.event.clientY + "px"))
	        })
	        .on("mouseout", function(d) {		
        		me.DSS_tooltip
        		.transition()		
                .duration(100)		
                .style("opacity", 0);	
	        });*/
		
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

		root.append("g")
			.attr("opacity", 0.25)
			.attr("stroke", '#000')
			.attr("stroke-width", 0.75)
		.selectAll('.d3-radial-grid')
			.data(me.DSS_values)
			.enter()
			.append("line")
			.attr("class", 'd3-radial-grid')
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", function(d,i) {
				var sAngle = i * wedgeSize - (Math.PI / 0.2);
				return Math.sin(sAngle) * (padded_hw + 10);
			})
			.attr("y2", function(d,i) {
				var sAngle = i * wedgeSize - (Math.PI / 0.2);
				return Math.cos(sAngle) * (padded_hw + 10);
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
				return Math.pow(d.r,circlePow) * padded_hw;
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
		
		var c1 = me.DSS_valueWorst, c2 = me.DSS_valuePoor, c3 = me.DSS_valueAccetable, c4 = me.DSS_valueBest;
		
		var colorGrade = d3.scaleLinear()
			.domain([0,0.25, 0.26,0.5, 0.51,0.75, 0.76,1])
			.range([c1,c1, c2,c2, c3,c3, c4,c4])
		
		const wedgeSize = Math.PI * 2 / count;
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
