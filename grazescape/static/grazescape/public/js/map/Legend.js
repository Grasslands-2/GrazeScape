
//------------------------------------------------------------------------------
Ext.define('DSS.map.Legend', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.map_legend',

	layout: 'absolute',

	width: 60,
	height: 270,
	//layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	floating: true,
	shadow: false,
	margin: 8,
	DSS_colors: [], // for continuous;
	DSS_values: [],
	DSS_label: 'Legend',
	
	DSS_keys: false, // for categorical
	
	style: 'opacity: 0.8;background-color: rgba(0,0,0,0.5); border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; box-shadow: 0 6px 8px rgba(0,0,0,0.2); pointer-events: none',
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;
		//total usable height for legend elements
		let usableHeight = 235//me.height - 12 * 2;
		//total usable width for legend elements
		let usableWidth = me.width - 6 * 2;
		//chipheight is how much much vertical space a legend chip can take up
		let chipHeight = 0;
		//atX and atY determine where each chip is drawn
		let atX = 6, atY = 0;
		//the color array and values array for each call is ran through one at a time, and the atx and aty are adjust
		//as each one is called.
		let elements = [];
		if (me.DSS_colors) {
			chipHeight = usableHeight / me.DSS_colors.length;
			atY = usableHeight - chipHeight + 25;
			Ext.each(me.DSS_colors, function(it) {
				elements.push({
					xtype: 'component',
					style: 'border: 1px solid rgba(0,0,0,0.25); border-bottom-color: rgba(0,0,0,0.5); background-color:' + it,
					x: atX,
					y: atY,
					width: usableWidth,
					height: chipHeight
				});
				atY -= chipHeight;
			})
	
			atY = /*3*/usableHeight + 18;
			Ext.each(me.DSS_values, function(it) {
				let fmt = '0.0#'
				if (it < 1) {fmt += "#"}
				else if (it > 999) fmt = "0";
				else if (it > 99) fmt = "0.#";
				else if (typeof it === 'string') fmt = "0";
				
				elements.push({
					xtype: 'component',
					style: 'color: white; text-shadow: 1px 0 0 black, -1px 0 0 black, 0 1px 0 black, 0 -1px 0 rgba(0,0,0,0.5), 0 2px 4px black; text-align: right; font-weight: bold',
					x: atX,
					y: atY,
					width: usableWidth-2,
					height: chipHeight,
					html: it//Ext.util.Format.number(it, fmt)
				});
				atY -= chipHeight;
			})
		}
		else {
			chipHeight = usableHeight / me.DSS_keys.length;
			atY = 12;
			Ext.each(me.DSS_keys, function(it) {
				elements.push({
					xtype: 'component',
					style: 'cursor: pointer; border: 1px solid rgba(0,0,0,0.25); border-bottom-color: rgba(0,0,0,0.5); background-color:' + it.color,
					x: atX,
					y: atY,
					width: usableWidth,
					height: chipHeight,
					autoEl: {
						tag: 'div',
						'data-qtip': it.label
					}
				});
				atY += chipHeight;
			})
		}
		elements.push({
			xtype: 'component',
			//cls: 'button-text-pad',
			//componentCls: 'button-margin',
			style: 'color: white; text-shadow: 1px 0 0 black, -1px 0 0 black, 0 1px 0 black, 0 -1px 0 rgba(0,0,0,0.5), 0 2px 4px black; text-align: right; font-weight: bold',
			html: me.DSS_label,
			width: "95%",
			height: 15
		})
		
		Ext.applyIf(me, {
			// items:[{
			// 		xtype: 'component',
			// 		cls: 'section-title light-text text-drp-10',
			// 		html: 'LEgEnD',
			// 		},{
			// 		xtype: 'form',
			// 		//url: 'create_field', // brought in for form test
			// 		//jsonSubmit: true,// brought in for form test
			// 		//header: false,// brought in for form test
			// 		//border: false,// brought in for form test
			// 		//style: 'background-color: #666; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); border-top-color:rgba(255,255,255,0.25); border-bottom-color:rgba(0,0,0,0.3); box-shadow: 0 3px 6px rgba(0,0,0,0.2)',
			// 		//layout: DSS.utils.layout('vbox', 'start', 'stretch'),
			// 		//margin: '8 4',
			// 		//padding: '2 8 10 8',
			// 		// defaults: {
			// 		// 	DSS_parent: me,
			// 		// },
			// 		items: [elements]
				items: elements
			//}]
		});
		me.callParent(arguments);
	}})
