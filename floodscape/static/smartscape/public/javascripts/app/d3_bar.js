
//------------------------------------------------------------------------------
Ext.define('DSS.app.d3_bar', {
//------------------------------------------------------------------------------
    extend: 'Ext.Component',
	alias: 'widget.d3_bar',
	
	id: 'd3-bar',
	style: 'background: none',
	listeners: {
		afterrender: function(self) {
			self.createD3_Elements();
		}
	},
	DSS_values: [
		{v:8, t:'Developed', c:'#8c8895', s: [
			{t: 'Urban', v:2},
			{t: 'Suburban', v:6}
		]},
		{v:34, t:'Row Crops', c:'#f2e75e', s: [
			{t: 'Dairy Rotation', v:12},
			{t: 'Continuous Corn', v:11},
			{t:'Cash Grain', v:11}
		]},
		{v:13, t:'Wetlands / Water', c:'#819fda', s: [
			{t: 'Open Water', v:5},
			{t: 'Wetlands', v:8}
		]},
		{v:22, t:'Grasses',c:'#98bf63', s: [
			{t: 'Pasture', v:5},
			{t: 'Hay', v: 6},
			{t:'C4 Grass',v:4},
			{t: 'C3 Grass', v: 7},
		]},
		{v:19, t:'Woodland', c:'#dc8f50', s: [
			{t: 'Conifer', v:5},
			{t: 'Deciduous', v:8},
			{t:'Mixed', v:6}
		]},
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
		const margin = {t: 20, r: 20, b: 50, l: 40},
			w = me.getWidth(),
			pw = w - margin.l - margin.r,
			h = me.getHeight(),
			ph = h - margin.t - margin.b;

		// sort major bins
		me.DSS_values.sort(function(a,b) {
			return a.v > b.v
		})
		
		// sort any minor bins
		me.DSS_values.forEach(function(d) {
			if (d.s) d.s.sort(function(a,b) {return a.v > b.v})
		})
		
		console.log(me.DSS_values);
		
		//set the charting space
		var x = d3.scaleBand().range([0, pw]).padding(0.05);
		var y = d3.scaleLinear().range([ph, 0]);

		// Scale the range of the data
		x.domain(me.DSS_values.map(function(d) { return d.t }));
		y.domain([0, d3.max(me.DSS_values, function(d) { return d.v; })]);
		
		var svg = d3.select("#d3-bar")
			.append("svg")
			.attr("width", w)
			.attr("height", h)
			.append("g")
				.attr("transform","translate(" + margin.l + "," + margin.t + ")");

		// Add the valueline path.
		var bars = svg.selectAll(".bar")
		  .data(me.DSS_values)
		  .enter()
		  .append("rect");
		
		bars
		  	.attr("class", "bar")
		  	.attr('stroke', '#000')
		  	.attr('fill', function(d) {
		  		return d.c;
		  	})
		  	.attr("x", function(d) { return x(d.t); })
		  	.attr("width", x.bandwidth())
		  	.attr("y", ph)
		  	.attr("height", 0)
		  	.transition()
		  		.duration(750)
		  		.delay(function(d,i,a) {return (a.length - i) * 175 })
		  		.ease(d3.easeBounce)
		  		.attr("y", function(d) { return y(d.v); })
		  		.attr("height",function(d) {return ph - y(d.v); })
		  		
		bars
			.filter(function(d) {
				return d.s
			})
				.append("circle")
				.attr('r', 10)
				.attr('cx', function(d) {
					d = d3.select(this);
					console.log(d, d.node(), d.node().parentNode)
					return 10
				})
				.attr('cy', 10)
				.attr('fill', '#f00')
				.attr('opacity', 0.1);
		
		// Add the x Axis
		svg.append("g")
		  .attr("transform", "translate(0," + ph + ")")
		  .call(d3.axisBottom(x));

		// text label for the x axis
		svg.append("text")             
		  .attr("transform",
		        "translate(" + (pw/2) + " ," + 
		                       (ph + margin.t + 20) + ")")
		  .style("text-anchor", "middle")
		  .text("Landcover");

		// Add the y Axis
		svg.append("g")
		  .call(d3.axisLeft(y));

		// text label for the y axis
		svg.append("text")
		  .attr("transform", "translate(" + -margin.l + "," + (ph/2)+ ")rotate(-90)")
//		  .attr("x", margin.l)
		  //.attr("y", (ph / 2))
		  .attr("dy", "1em")
		  .style("text-anchor", "middle")
		  .text("Value");      
	}
	
});



