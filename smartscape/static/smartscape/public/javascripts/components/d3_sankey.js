var sankeyDataClonable = {"nodes":[
	{id:0,"name":"Soybeans", color: d3.color("#7d3").hex()},	// 2
	{id:1,"name":"Corn Grain", color: d3.color("#7d3").brighter(0.2).hex()}, 	// 0
	{id:2,"name":"Corn Stover", color: d3.color("#7d3").brighter(0.3).hex()},	// 1
	{id:3,"name":"Soy Residuals", color: d3.color("#7d3").darker(0.3).hex()},// 3
	{id:4,"name":"Grass", color: d3.color("#7d3").darker(0.6).hex()},		//4
	{id:5,"name":"Alfalfa", color: d3.color("#7d3").darker(0.9).hex()},		// 5
	{id:6,"name":"Corn Silage", color: d3.color("#dd1").brighter(0.2).hex()},	// 6
	{id:7,"name":"Grass Silage", color: d3.color("#dd1").hex()},// 7
	{id:8,"name":"Alfalfa Silage", color: d3.color("#dd1").darker(0.3).hex()},// 8
	{id:9,"name":"Soy Silage", color: d3.color("#dd1").darker(0.6).hex()},	// 9
	{id:10,"name":"Biofuel", color: d3.color("#a3d").brighter(0.5).hex()},		// 10
	{id:11,"name":"Dairy Cows", color: d3.color("#d31").hex()},	// 11
	{id:12,"name":"Beef Cattle", color: d3.color("#d31").darker(0.6).hex()},	//	12
	{id:13,"name":"Commodity Market", color: '#aaa'},// 13
	{id:14,"name":"Milk", color: d3.color("#a3d").hex()},// 14
	{id:15,"name":"Beef", color: d3.color("#a3d").darker(0.6).hex()},// 15
	{id:16,"name":"Manure", color: '#983'},// 16
	],
	"links":[
	{"source":0,"target":10,"value":20.3, link: '#070'},
	{"source":0,"target":13,"value":5.2, link: '#707'},
	{"source":0,"target":9,"value":1.3, link: '#070'},
	{"source":0,"target":11,"value":0.8, link: '#070'},
	{"source":0,"target":12,"value":0.8, link: '#070'},
	
	{"source":1,"target":6,"value":24.3, link: '#070'},
	{"source":1,"target":10,"value":0, link: '#070'},
	{"source":1,"target":13,"value":44.5, link: '#707'},
	{"source":1,"target":11,"value":4.5, link: '#070'},
	{"source":1,"target":12,"value":2.5, link: '#070'},
	{"source":2,"target":6,"value":64.8, link: '#070'},
	{"source":2,"target":11,"value":4.5, link: '#070'},
	{"source":2,"target":12,"value":2.5, link: '#070'},
	
	{"source":3,"target":6,"value":1.1, link: '#070'},
	{"source":3,"target":7,"value":0.2, link: '#070'},
	{"source":3,"target":8,"value":0.3, link: '#070'},
	{"source":3,"target":9,"value":0.8, link: '#070'},
	
	{"source":4,"target":7,"value":11.3, link: '#070'},
	{"source":4,"target":8,"value":7.8, link: '#070'},
	{"source":5,"target":7,"value":9.3, link: '#070'},
	{"source":5,"target":8,"value":14.8, link: '#070'},
	
	{"source":6,"target":11,"value":80.8, link: '#770'},
	{"source":6,"target":12,"value":9.8, link: '#770'},
	{"source":7,"target":11,"value":3.8, link: '#770'},
	{"source":7,"target":12,"value":4.8, link: '#770'},
	{"source":7,"target":13,"value":5.8, link: '#707'},
	{"source":8,"target":11,"value":10.8, link: '#770'},
	{"source":8,"target":12,"value":19.8, link: '#770'},
	{"source":9,"target":11,"value":2.8, link: '#770'},
	{"source":9,"target":12,"value":1.8, link: '#770'},
	
	{"source":11,"target":14,"value":48.2, link: '#811'},
	{"source":12,"target":15,"value":9.3, link: '#811'},
	{"source":11,"target":16,"value":50.2, link: '#811'},
	{"source":12,"target":16,"value":12.3, link: '#811'},
	
	{"source":14,"target":13,"value":28.2, link: '#707'},
	{"source":15,"target":13,"value":2.3, link: '#707'},
	{"source":10,"target":13,"value":20.3, link: '#707'},
	{"source":1,"target":10,"value":0, link: '#070'},
	
]}

var formatNumber = d3.format(",.0f"),
	format = function(d) { return formatNumber(d) + " Mt"; },
	color = d3.scaleOrdinal(d3.schemeCategory10);
	
var sankeyData = {};

//-----------------------------------------------------
// DSS.components.d3_sankey
//
//-----------------------------------------------------
Ext.define('DSS.components.d3_sankey', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.d3_sankey',

    margin: 8,
    bodyPadding: 8,

    layout: 'fit',
	title: 'Biomass Flow',
	resizable: true,
	resizeHandles: 's',
	height: 480,
	minHeight: 360,
	maxHeight: 720,

	listeners: {
		afterrender: function(self) {
			self.doD3();
		},
		resize: function(self) {
			self.doResized();
		}
	},
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				id: 'd3-chart',
			}]
		});
		
		me.callParent(arguments);
		sankeyData = Ext.clone(sankeyDataClonable);
	},
	
	//--------------------------------------------------------------------------
	doD3: function() {
		var me = this;
		me['DSS_svg'] = d3.select("#d3-chart")
			.append("svg")
				.attr("width", Ext.getCmp('d3-chart').getWidth())
				.attr("height",Ext.getCmp('d3-chart').getHeight())
				.attr("class", "sankey-chart");
		
		me.doResized(true);
	},
	
	doResized: function(first) {
		var me = this;
		var w = Ext.getCmp('d3-chart').getWidth(), 
			h = Ext.getCmp('d3-chart').getHeight();
		
		var svg = me.DSS_svg; 
		svg
			.attr("width", w)
			.attr("height", h);
		
		w -= 1;
		h -= 6;
		var sankey = d3.sankey()
			.nodeWidth(15)
			.nodePadding(15)
			.size([w, h]);

		var path = sankey.link();//sankey.link();

		sankey
			.nodes(sankeyData.nodes)
			.links(sankeyData.links)
			.layout(16);

		// Remove elements not present in new data
		const oldLinks = svg.selectAll("g");
		oldLinks.remove();

		const add = svg.append("g")
		var link = add.append("g").selectAll(".link")
			.data(sankeyData.links)
		.enter().append("path")
			.filter(function(d) { return d.value > 0})
			.attr("class", "link")
			.attr("d", path)
			.style("stroke-width", function(d) { return Math.max(1, d.dy); })
			.style("stroke", function(d) { return d.link; })
			.sort(function(a, b) { return b.dy - a.dy; });

		link.append("title")
			.text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

		var node = add.append("g").selectAll(".node")
			.data(sankeyData.nodes)
		.enter().append("g")
			.attr("class", "node")
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.call(d3.drag()
			.subject(function(d) { return d; })
			.on("start", dragstart)
			.on("drag", dragmove)
			.on("end", dragend));

		node.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", sankey.nodeWidth())
			.style("fill", function(d) { return d.color = d.color || color(d.name.replace(/ .*/, "")); })
			.style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
		.append("title")
			.text(function(d) { return d.name + "\n" + format(d.value); });

	  node.append("text")
	  	  .attr("class", "text-shadow")
	      .attr("x", -6)
	      .attr("y", function(d) { return d.dy / 2; })
	      .attr("dy", ".35em")
	      .attr("text-anchor", "end")
	      .attr("transform", null)
	      .text(function(d) { return d.name; })
	    .filter(function(d) { return d.x < w / 2; })
	      .attr("x", 6 + sankey.nodeWidth())
	      .attr("text-anchor", "start");
		  
	  node.append("text")
	      .attr("x", -6)
	      .attr("y", function(d) { return d.dy / 2; })
	      .attr("dy", ".35em")
	      .attr("text-anchor", "end")
	      .attr("transform", null)
	      .text(function(d) { return d.name; })
	    .filter(function(d) { return d.x < w / 2; })
	      .attr("x", 6 + sankey.nodeWidth())
	      .attr("text-anchor", "start");

	  
	  function dragstart(d) { 
		  d['o_dx'] = d.x
		  this.parentNode.appendChild(this); 
		    link.style("stroke-opacity", function(i) {
		    	if (i.source == d || i.target == d) {
		    		i["opacity"] = 0.7;
		    		return i.opacity;// = 0.7
		    	}
		    	i["opacity"] = 0.1;
		    	return i["opacity"];// = 0.1;
		    });
		    node.style("opacity", function(i) {
		    	if (i.sourceLinks.length > 0) console.log(i.sourceLinks[0].opacity)
		    	return Math.max(d3.max(i.sourceLinks, function(lnk) {
		    			return lnk.opacity > 0.5 ? 1 : null;
		    		}) || 0.3,
		    		d3.max(i.targetLinks, function(lnk) {
		    			return lnk.opacity > 0.5 ? 1 : null
		    		}) || 0.3);// || null;
		    });
	  }
	  
	  function dragmove(d) {
	    d3.select(this).attr("transform", "translate(" + (d.x = Math.max(0, Math.min(w - d.dx, d3.event.x)))//d.x 
	    		+ "," + (d.y = Math.max(0, Math.min(h - d.dy, d3.event.y))) + ")");
	    sankey.relayout();
	   link.attr("d", path);
	  }
	  
		function dragend(d) { 
			d.x = d.o_dx;
			d3.select(this).attr("transform", "translate(" + d.x 
					+ "," + d.y + ")")
			sankey.relayout();	    
			link.attr("d",path).style("stroke-opacity", function(i) {
				i.opacity = null;
				return null;
			});
			node.style("opacity", null);
		}
	}
	
});


