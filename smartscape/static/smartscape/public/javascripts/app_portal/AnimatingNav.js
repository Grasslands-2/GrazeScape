
window.requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function(f){return setTimeout(f, 1000/60)} // simulate calling code 60 
 
window.cancelAnimationFrame = window.cancelAnimationFrame
    || window.mozCancelAnimationFrame
    || function(requestID){clearTimeout(requestID)} //fall back

//------------------------------------------------------------------------------
Ext.define('DSS.app_portal.AnimatingNav', {
//------------------------------------------------------------------------------
	extend: 'Ext.container.Container',
	alias: 'widget.animating_nav',
	
	layout: 'absolute',
	style: 'background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.2)',
	width: 140,
	height: 50,
	liquidLayout: true,
	animated: false,

	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
		});
		
		me.callParent(arguments);
		var c = me.defineNavItems();
		me.addNavItems(c);
	},
	
	//----------------------------------------------------------
	addNavItems: function(c) {
		var me = this;
		
		var pos = 4;
		for (var i = 0; i < c.length; i++) {
			var config = c[i];
			if (i > 0) pos += 15;
			var item = {
				xtype: 'component',
				renderTpl: '<div style="overflow:hidden">{%this.renderContent(out,values)%}</div>',
				y: 4,
				x: pos,
				height: 40,
				padding: '12 16',
				DSS_verbWidth: 90,
				width: 90,
				margin: '0 15',
			    listeners: {
			        click: {
			        	element: 'el',
			        	fn: function(evt) {
			            	var thing = this;
			            	me.clicked(thing);
			            }
			        },
			        afterrender: function(self) {
			        	var me = this;
			        	if (self.DSS_tooltip) {
			        		Ext.tip.QuickTipManager.register({
			        			target: self.el,
			        			text: self.DSS_tooltip,
			    	            defaultAlign: 'b50-t50',
			    	            anchor: true,
			        		});
			        	}
			        }
			    }
				
			};
			Ext.applyIf(config, item);
			var item = Ext.create(config);
			me.add(item);
			if (i > 0 && i < c.length - 1) pos += 15;
			pos += item.width;
		}
		pos += 21; // last padding
		me.setWidth(pos);
	},

	runBarLayout: function() {
		var me = this;
		var runtime = new Date().getTime() - me['DSS_startTime'];
		var frac = runtime / me['DSS_duration'];
		frac = Ext.fx.Easing.ease(frac);
		var done = false;
		if (runtime > me['DSS_duration']) {
			frac = 1;
			done = true
		}
		
		Ext.suspendLayouts();
		var pos = 6;
		var ct = me.items.items.length;
		for (var i = 0; i < ct; i++) {
			var comp = me.items.items[i];
			if (i > 0) pos += 15;
			comp.setX(me.getX() + pos);
			comp.setY(me.getY() + 5);
			if (i < ct - 1) pos += 15;
			desiredWidth = comp['DSS_targetWidth'] * frac + 
				comp['DSS_startWidth'] * (1-frac);
			comp.setWidth(desiredWidth);
			pos += Math.round(desiredWidth);
		}
		pos += 6; // last padding
		me.setWidth(pos);
		Ext.resumeLayouts(true)
		if (!done) {
			requestAnimationFrame(function() {
				me.runBarLayout();
			});
		}
	},
	
	clicked: function(item) {
    	var me = this;
    	item = item.component;
    //	Ext.suspendLayouts();
    	Ext.each(me.items.items, function(els) {
    		if (els == item) return true; // skip self
    		els.removeCls('dss-breadcrumb-active');
    		els['DSS_startWidth'] = els.getWidth();
    		els['DSS_targetWidth'] = els.DSS_verbWidth;
    		els.el.dom.firstChild.textContent = els.DSS_verb;
    	})
        item.addCls('dss-breadcrumb-active');
		item['DSS_startWidth'] = item.getWidth();
    	item['DSS_targetWidth'] = item.DSS_fullWidth
    	me['DSS_duration'] = 750;
    	item.el.dom.firstChild.textContent = item.DSS_fullText
    //	Ext.resumeLayouts(true);
    	
    	requestAnimationFrame(function() {
    		console.log('starting')
        	me['DSS_startTime'] = new Date().getTime();
    		me.runBarLayout()		
    	});
	},
	
	defineNavItems: function() {
		var me = this;
		var config = [{
			html: 'Select Area of Interest',
			id: '2dss-step-1',
			DSS_fullText: 'Select Area of Interest',
			DSS_verb: 'Select',
			width: 205,
			DSS_fullWidth: 205,
			margin: '0 15 0 0',
			cls: 'dss-breadcrumb-active dss-breadcrumb-point',
			style: 'border-bottom-left-radius: 12px; border-top-left-radius: 12px',
			DSS_selectionChanged: function(selected) {
				Ext.getCmp('dss-region-grid').updateState(selected);
				if (selected) {
					DSS_PortalMap.setMode('region');
					Ext.getCmp('dss-launch-summary').animate({duration: 750, to: { left: 760 }});
					Ext.getCmp('dss-region-refinement').animate({duration: 750, to: { left: 380 }});
					Ext.getCmp('dss-region-grid').animate({
						duration: 750, to: { left: 0 }
					});
				}
			}
		},{
			html: 'Refine',
			DSS_tooltip: 'Optionally refine the area of interest',
			DSS_fullText: 'Refine Area of Interest (Optional)',
			DSS_verb: 'Refine',
			DSS_fullWidth: 290,
			cls: 'dss-breadcrumb-point dss-breadcrumb-tail',
			DSS_selectionChanged: function(selected) {
				Ext.getCmp('dss-region-refinement').updateState(selected);
				if (selected) {
					DSS_PortalMap.setMode('refine');
					Ext.getCmp('dss-launch-summary').animate({duration: 750, to: { left: 380 }});
					Ext.getCmp('dss-region-grid').animate({duration: 750, to: { left: -380 }});
					Ext.getCmp('dss-region-refinement').animate({
						duration: 750, to: { left: 0 }
					});
				}
			}
		},{
			html: 'Review',
			DSS_tooltip: 'Review the assumptions used by SmartScape and customise them if desired',
			DSS_fullText: 'Review Assumptions (Optional)',
			DSS_verb: 'Review',
			DSS_fullWidth: 260,
			cls: 'dss-breadcrumb-point dss-breadcrumb-tail',
			DSS_selectionChanged: function(selected) {
				var item = me['DSS_Assumptions'];
				if (!item) {
					item = me['DSS_Assumptions'] = Ext.create('DSS.app_portal.Assumptions');
				}
				if (selected) {
					Ext.defer(function() {
						item.setHeight(1);
						item.animate({
							duration: 750,
							dynamic: true,
							to: {
								height: 520
							}
						}).show().anchorTo(Ext.getCmp('dss-navigator'), 'tc-bc', [0,8])
					}, 50);
				}
				else {
					item.setHidden(true);
				}
			}
		},{
			html: 'Start',
			id: '2DSS-start-smartscape',
			DSS_fullText: 'Start SmartScape',
			DSS_verb: 'Start',
			margin: '0 0 0 15',
			DSS_fullWidth: 170,
			cls: 'dss-breadcrumb-tail',
			style: 'border-top-right-radius: 12px; border-bottom-right-radius: 12px',
			DSS_selectionChanged: function(selected) {
				if (selected) {
					DSS_PortalMap.setMode('refine');
					var cmp = Ext.getCmp('dss-region-grid');
					if (cmp.getX() != -380) {
						cmp.animate({duration: 750, to: { left: -760 }});
					}
					cmp = Ext.getCmp('dss-region-refinement');
					if (cmp.getX() != -380) {
						cmp.animate({duration: 750, to: { left: -380 }});
					}
					Ext.getCmp('dss-launch-summary').animate({
						duration: 750, to: { left: 0 }
					});
				}
			}
		}]
		return config;
	}
	
});

