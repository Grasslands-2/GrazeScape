
//-----------------------------------------------------
// DSS.components.d3_nav
//
//-----------------------------------------------------
Ext.define('DSS.components.d3_nav', {
    extend: 'Ext.Component',
    alias: 'widget.d3_nav',

	id: 'd3-nav',
   
	listeners: {
		afterrender: function(self) {
			self.createD3_Elements();
		},
		resize: function(self) {
			if (self.DSS_svg) {
			// TODO: support resize?
			//	self.doResized();
			}
		}
	},
	DSS_tooltipOffset: [-64,-28],
	DSS_align: 'c', //c = center, r = right, l = left
	DSS_time: false,
	DSS_timer: false,
	DSS_duration: 500.0,
	DSS_containerPad: 5,
	DSS_nodePad: 20, // inner padding around each element
	DSS_nodeSpacing: 10,	//space between nodes
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
		});
		
		me.callParent(arguments);
	},
	
	//--------------------------------------------------------------------------
	roundedPointRect: function(width, height, r, roundLeft, roundRight) {
		if (roundLeft && roundRight) {
			const h = height - r * 2,
			w = width - r * 2;
			return "M0,"+r+" q0,-"+r+" "+r+",-"+r+" h"+w+" q"+r+",0 "+r+","+r+" v"+h+
				" q0,"+r+" -"+r+","+r+" h-"+w+" q-"+r+",0 -"+r+",-"+r+" Z";
		}
		else if (roundLeft) {
			const mh = height / 2,
				w = width - r - (mh/2); // front beak will overflow by 1/2 mh
			return "M0,"+r+" q0,-"+r+" "+r+",-"+r+" h"+w+" l"+mh+","+mh+" l-"+mh+","+mh+
				" h-"+w+" q-"+r+",0 -"+r+",-"+r+" Z";
		}
		else if (roundRight) {
			const mh = height / 2,
				w = width - r + mh/2;// - (mh/2), // back tail will overflow by 1/2mh
				h = height - r * 2;
			return "M"+(mh/2)+","+mh+" l-"+mh+",-"+mh+" h"+w+" q"+r+",0 "+r+","+r+" v"+h+
				" q0,"+r+" -"+r+","+r+" h-"+w+" Z";   
		}
		else {
			const mh = height / 2,
				w = width// - mh;
			return "M"+(mh/2)+","+mh+" l-"+mh+",-"+mh+" h"+w+" l"+mh+","+mh+" l-"+mh+","+mh+
				" h-"+w+" Z";
		}
	},
	
	//--------------------------------------------------------------------------
	enableAll: function() {
		var me = this;
		me.DSS_elements.forEach(function(d) {
			d.disabled = false;
		})
		me.updateNav();
	},
	
	//--------------------------------------------------------------------------
	clickElement: function(id) {
		console.log('called with: '+ id)
		d3.select(id).dispatch('click');
	},
	
	//--------------------------------------------------------------------------
	createD3_Elements: function() {
		var me = this;
		
		me['DSS_svg'] = d3.select("#d3-nav")
			.append("svg")
				.attr("width", me.getWidth())
				.attr("height",me.getHeight());
		
		me.measureNodes();

		const width = me.calcNavWidth(true);
		const cx = (me.DSS_align === "c") ? (me.getWidth() - width) / 2 : 
			(me.DSS_align === "l") ? 20 : (me.getWidth() - width) - 20; // account for shadow

		var defs = me.DSS_svg.append("defs");
		
		var filter = defs.append("filter")
			.attr("id", "nav-shadow")
			.attr("width", "120%")
			.attr("height", "150%");
		filter.append("feGaussianBlur")
			.attr("in", "SourceAlpha")
			.attr("stdDeviation", "4")
			.attr("result", "blur");
		filter.append("feOffset")
			.attr("in", "blur")
			.attr("dx","0")
			.attr("dy","10")
			.attr("result","offsetBlur");
		var transfer = filter.append("feComponentTransfer")
			.attr("in",	"offsetBlur")
			.attr("result","alphaBlur");
		transfer.append("feFuncA")
				.attr("type", "linear")
			.attr("slope", "0.3");

		var merge = filter.append("feMerge");
			merge.append("feMergeNode")
				.attr("in", "alphaBlur");
			merge.append("feMergeNode")
				.attr("in", "SourceGraphic");

		me.DSS_svg
			.append("g")
			.append("rect")
			.attr("transform", "translate(" + cx + ",1)")
			.attr("class", "d3-nav-bg")
			.attr("width", width)
			.attr("height", 48)//me.getHeight()-1) // ? why -1?
			.attr("rx", 18)
			.attr("filter", "url(#nav-shadow");
		
		me.DSS_svg.selectAll("clipPath")
			.data(me.DSS_elements)
			.enter()
			.append("clipPath")
			.attr("id", function(d,i) {
				return 'text-clip-' + i;
			})
			.append("use")
			.attr("xlink:href", function(d,i) {
				return "#path-" + i;
			})
		
		var navs = me.DSS_svg.selectAll('.d3-nav')
			.data(me.DSS_elements)
			.enter()
			.append("g")
			.on("click", function(d, i, nodes) {
				if (d.disabled) return;
				me.DSS_elements.forEach(function(dd) {
					if (d == dd) return;
					dd.DSS_selectionChanged(false)
					dd.active = false;
				})
				d.active = true;
				d.DSS_selectionChanged(true);
				me.DSS_svg.selectAll('text').text(function(dee) {
					return dee.active ? dee.activeText : dee.text;
				});
				me.updateNav();
			})
	        .on("mouseover", function(d) {
	        	if (d.tooltip && !d.active) {
		            me.DSS_tooltip.
		            	transition()
		            	.delay(function(d) {
		            		return me.DSS_tooltip.style("opacity") > 0 ? 0 : 600;
		            	})
		                .duration(100)		
		                .style("opacity", 1);		
		            me.DSS_tooltip.
		            	html(d.disabled ? (d.disabledTooltip || d.tooltip) : d.tooltip)	
		                .style("left", (d3.event.target.parentNode.getBoundingClientRect().x 
		                		+ me.DSS_tooltipOffset[0]) + "px")
		            	.style("top", (d3.event.target.parentNode.getBoundingClientRect().y 
		            			+ me.DSS_tooltipOffset[1]) + "px")
		        }
	        	else {
	        		me.DSS_tooltip.transition()		
	                .duration(100)		
	                .style("opacity", 0);	
	        	}
	        })
	        .on("mouseout", function(d) {		
        		me.DSS_tooltip.transition()		
                .duration(100)		
                .style("opacity", 0);	
	        })			
			.attr("class", function(d) {
				return "d3-nav" + (d.active ? " d3-nav-active" : "") 
					+ (d.disabled ? " d3-nav-disabled" : "")
			})
			.attr("transform", function(d) {
				const res = "translate("+ (d.t_x + cx) +"," + me.DSS_containerPad + ")";
				return res;
			})
		d3.selectAll('.d3-nav')
			.filter(function(d) {
				return d.id;
			})
			.attr("id", function(d) {
				return d.id;
			})


		navs.append("path")
			.data(me.DSS_elements)
			.attr("id", function(d,i) {
				return "path-" + i;
			})
			.attr("class", "d3-nav-rect")
			.attr("d", function(d, i, a) {
				return me.roundedPointRect(d.w, 40, 16, (i == 0), (i == a.length - 1))
			})
			
		navs.append("text")
			.data(me.DSS_elements)
			.attr("clip-path", function(d,i) {
				return "url(#text-clip-" + i +")"
			})
			.attr("x", function(d) {
				return me.DSS_nodePad;
			})
			.attr("y", 19) // TODO: position automatically
			.attr("dy", ".35em")
			.attr("class", "d3-nav-text")
			.text(function(d) {
				return d.active ? d.activeText : d.text
			});
		
		me['DSS_tooltip'] = d3.select("body").append("div")	
		    .attr("class", "d3-nav-tooltip")				
		    .style("opacity", 0);	
	},
	
	//--------------------------------------------------------------------------
	measureNodes: function() {
		
		const me = this;
		me.DSS_svg
			.selectAll('.dummyText')
			.append('g')
			.data(me.DSS_elements)
			.enter()
			.append("text")
			.attr("class", function(d) {
				return "dummyText d3-nav-text" + (d.active ? " d3-nav-active" : "")
			})
			.text(function(d) { 
				return d.active ? d.activeText : d.text
			})
			.each(function(d,i,a) {
				var w = this.getComputedTextLength();
				d['t_w'] = w + me.DSS_nodePad * 2;
				d['w'] = d['w'] || d['t_w']; 
				d['s_w'] = d.w;
				this.remove() // remove them just after displaying them...
			});
	},
	
	//---------------------------------------------------------------------------------
	calcNavWidth: function(doNodeLayout) {
		var me = this;
		var atX = me.DSS_containerPad;
		
		me.DSS_elements.forEach(function(d) {
			if (doNodeLayout) {
				d['t_x'] = atX;
			}
			atX += d.w + me.DSS_nodeSpacing;
		})
		
		return atX + me.DSS_containerPad - me.DSS_nodeSpacing;
	},
	
	//--------------------------------------------------------------------------
	updateNav: function() {
		
		var me = this;
		var svg = me.DSS_svg; 
		
		svg
			.attr("width", me.getWidth())
			.attr("height", me.getHeight());
		
		// set targets
		me.measureNodes();

		if (me.DSS_timer) {
			me.DSS_timer.stop();
		}
	
		me.DSS_timer = d3.timer(function(elapsed) {
			var t = elapsed / me.DSS_duration;
			if (t >= 1) {
				t = 1.0;
				me.DSS_timer.stop();
			}
			else {
				t = Ext.fx.Easing.ease(t);
			}
			
			// compute & set real width
			svg
				.selectAll(".d3-nav-rect")
				.attr("d", function(d, idx, a) { 
					var w = d.w = d.s_w * (1.0 - t) + d.t_w * t;
					return me.roundedPointRect(w, 40, 16, (idx == 0), (idx == a.length - 1))
				})

			var realWidth = me.calcNavWidth();
			const cx = (me.DSS_align === "c") ? (me.getWidth() - realWidth) / 2 : 
				(me.DSS_align === "l") ? 20 : (me.getWidth() - realWidth) - 20;// account for shadow

			var atX = me.DSS_containerPad;
			svg.selectAll('.d3-nav')
				.attr("class", function(d) {
					return "d3-nav" + (d.active ? " d3-nav-active" : "") 
					+ (d.disabled ? " d3-nav-disabled" : "")
				})
				.attr("transform", function(d) {
					d['t_x'] = atX;
					atX += d.w + me.DSS_nodeSpacing;
					return "translate("+ (d.t_x + cx) +"," + me.DSS_containerPad + ")"
				});
				
			
			svg.selectAll('.d3-nav-bg')
				.attr("transform", "translate("+cx+",1)")
				.attr("width", realWidth)
				
		}, 16/*1000.0 / 60.0*/);
	}
	
});

