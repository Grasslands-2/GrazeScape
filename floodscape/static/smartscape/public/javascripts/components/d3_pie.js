
//------------------------------------------------------------------------------
Ext.define('DSS.components.d3_pie', {
//------------------------------------------------------------------------------
    extend: 'Ext.Component',
	alias: 'widget.graded_pie',
	
	id: 'd3-pie',
	width: 364,
	height: 364,
	style: 'background: none',
	listeners: {
		afterrender: function(self) {
			self.createD3_Elements();
		}
	},
	DSS_values: [
		{v:8, t:'Developed', c:'#8c8895'},
		{v:34, t:'Row Crops', c:'#f2e75e'},
		{v:13, t:'Wetlands / Water', c:'#819fda'},
		{v:22, t:'Grasses',c:'#98bf63'},
		{v:19, t:'Woodland', c:'#dc8f50'},
	],

	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
		});
		
		me.callParent(arguments);
	},

	//--------------------------------------------------------------------------
	createD3_Elements: function() {
		var me = this;
		var w = me.getWidth(), h = me.getHeight();
		
		const total = d3.sum(me.DSS_values, function(d) {return d.v});
		
		me['DSS_svg'] = d3.select("#d3-pie")
			.append("svg")
				.attr("width", w)
				.attr("height",h)
				.style("pointer-events","none")

		const padded_hw = (w * 0.5) - 30,
			padded_hh = (h * 0.5) - 30;
		
		var root = me.DSS_svg.append('g')
			.attr('transform','translate(' + (w * 0.5) + ',' +  (h * 0.5) + ')');
		
		var wedges = root.selectAll('.d3-wedge-container')
			.data(me.DSS_values)
			.enter()
			.append("g")
			.attr('class','d3-wedge-container')
;
		
		var arcGenerator = d3.arc()
			.innerRadius(padded_hw - 14)
			.outerRadius(padded_hw+14)
			.padAngle(0.02)
			.cornerRadius(2)
			.padRadius(padded_hw + 10);
		
		var ang = 0;
		wedges
			.append("path")
			.attr("class", 'd3-wedge')
			.attr("d", function(d) {
				var eAng = (d.v / total) * Math.PI * 2;
		
				var path = arcGenerator
					.startAngle(ang)
					.endAngle(ang + eAng);

				ang += eAng;
				return path();
			})
			.attr("fill", function(d) {
				return d.c;
			})
			.attr("stroke", function(d) {
				return d3.color(d.c).darker(1).hex()
			})
			.attr("stroke-width", 1)
			
		arcGenerator
			.innerRadius(padded_hw - 14)
			.outerRadius(padded_hw + 30);
		
		ang = 0;
		wedges
			.append("path")
			.attr("id", function(d,i) { 
				return "pie-arc-" + i
			})
			.attr("class", 'd3-text-wedge')
			.attr("d", function(d) {
				var eAng = (d.v / total) * Math.PI * 2;
				var test = Math.cos(ang + eAng * 0.5) // check center

				// flip start/end when we go around the bottom half. This will reorder the text placement
				var path = arcGenerator
					.startAngle(test < 0 ? ang + eAng : ang)
					.endAngle(test < 0 ? ang : ang + eAng);
				ang += eAng;
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
	            	.html("<b>" + d.t + ":</b> " + d.v.toFixed(1) + "%")	
	                .style("left", (d3.event.clientX + "px"))
	            	.style("top", (d3.event.clientY + "px"))
	        })
	        .on("mouseout", function(d) {		
        		me.DSS_tooltip
        		.transition()		
                .duration(100)		
                .style("opacity", 0);	
	        });
		
		ang = 0;
		wedges.append("text")
			.attr("class","d3-wedge-text")
			.attr("opacity", 0.8)
			.style('font-size', '14px')
			.attr("dy", function(d) {
				var eAng = (d.v / total) * Math.PI * 2;

				var test = Math.cos(ang + eAng * 0.5);
				ang += eAng
				return test < 0 ? -4 : 10
			})
			.append("textPath")
			.attr("startOffset", function(d) {
				var len = ((d.v / total) / Math.PI * 2)
					* Math.PI * 2 * (padded_hw + 20) // get arc length 
					+ 2 * (padded_hw + 20); // plus length of wedge sides
				console.log(len);
				var frac = (padded_hw + 20) * 2 / len;
				console.log(frac)
				return '20%'//((d.v / total));//frac;
			})
			.style("text-anchor", "middle")
			.attr("xlink:href", function(d,i) {
				return '#pie-arc-' + i;
			})
			.text(function(d) {
				return d.t;
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
		const padded_hw = (w * 0.5) - 30,
			padded_hh = (h * 0.5) - 30;
		
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
				outer = Math.pow(d.v,0.8) * padded_hw + 10,
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
		});
	}
	
});
