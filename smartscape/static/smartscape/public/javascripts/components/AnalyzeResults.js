//-----------------------------------------------------
// DSS.components.AnalyzeResults
//
//-----------------------------------------------------
Ext.define('DSS.components.AnalyzeResults', {
    extend: 'Ext.container.Container',
    alias: 'widget.analyze_results',
 
    requires: [
	    'DSS.components.d3_gradedRadar',
	    'DSS.components.d3_multiRadar',
    ],
    id: 'dss-analyze-results',
    
    padding: 4,
	style: 'background: rgba(48,64,96,0.8); border: 1px solid #256;border-radius: 16px; box-shadow: 0 10px 10px rgba(0,0,0,0.4)' ,
//	style: 'background: rgba(220,230,220,0.8); border: 1px solid #256;border-radius: 16px; box-shadow: 0 10px 10px rgba(0,0,0,0.4)' ,
//	resizable: 'true',
	width: 380,
//	minHeight: 380,
	layout: {
		type: 'vbox',
		align: 'stretch',
		//pack: 'center'
	},
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		function widget(label, value, unit, mapImg) {
			return {
				xtype: 'container',
				layout: DSS.utils.layout('hbox','start','center'),
				items: [{
					xtype: 'component',
					html: label + ':',
					width: 140,
					cls: 'dss-model-link',
					listeners: {
			            element: 'el',
			            click: function() {
			            	Ext.create("Ext.window.Window", {
			            		width: 420, height: 450, layout: 'fit', //modal: true, 
			            		title: 'About the Model',
			            		bodyPadding: 8,
			            		bodyStyle: 'font-size: 15px',
			            		items: [{
			            			xtype: 'component',
			            			html: '<h2>Pollinator Index</h2>The pollination potential model estimates an index of flower visitation by bees that varies from 0, for few flower visitors, to 1, for many visitors. The index is derived from an empirical statistical equation. The inputs to the model are the proportions of grassland and forest within a 1000 meter radius of focal location. The model was derived from a study by Bennett and Issacs (2014), who measured bee visitation to soybean fields along a landscape gradient in Michigan.  This pollination potential model explained 64% of the variation in bee visitation observations.<br><br>Bennett, A. B., & Isaacs, R. (2014). Landscape composition influences pollinators and pollination services in perennial biofuel plantings. Agriculture, Ecosystems & Environment, 193, 1-8.<br><br><a href="http://www.sciencedirect.com/science/article/pii/S0167880914002229">Link</a>'
			            		}]
			            	}).show().center()
			            }
					}
				},{
					xtype: 'component',
					html: Ext.util.Format.number(value, '0,000.##'),
					width: 130,
					padding: 2,
					margin: '2 4',
					style: 'text-align: right; color: #333; background: #fff; border: 1px solid #ccc; border-radius: 4px'
				},{
					xtype: 'component',
					html: unit,
					width: 32,
					margin: '2 4 2 0',
					style: 'color: #888; font-size: 12px'
				},{
					xtype: 'button',
					width: 28, height: 24,
					toggleHandler: function(self, pressed) {
						if (pressed) {
							Ext.getCmp('dss-selection-loading').animate({
								duration: 100,
								to: {
									opacity: 1
								}
							});
							self.setIconCls('dss-map-icon-pressed')
							var res = {
								url: '/assets/images/dev/' + mapImg + ".png",
								bounds: [
									-10062652.65061, 5278060.469521415,
									-9878152.65061, 5415259.640662575
								]
							}
							Ext.getCmp('DSS_attributeFixMe').validateImageOL(res)
						}
						else {
							self.setIconCls('dss-map-icon')
						}
					},
					toggleGroup: 'mapper',
					iconCls: 'dss-map-icon',
					tooltip: 'Map the results' 
				}]
			}
		};
		Ext.applyIf(me, {
			items:[{
				xtype: 'component',
				style: 'color: #fff; font-size: 1.1em; font-weight: bold; text-shadow: 1px 1px 1px #000',
				html: 'Analyze Results',
				padding: '2 0 2 8'
			},{
				xtype: 'container',
				style: 'background: #f3f3f3; border-radius: 4px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; border: 1px solid #ccc',
				flex: 1,
				layout: {
					type: 'vbox',
					align: 'center'
				},
				items: [{
					xtype: 'container',
					padding: 4,
					layout: DSS.utils.layout('hbox','start','center'),
					defaults: {
						xtype: 'button',
						scale: 'medium',
						width: 96,
						height: 30,
						margin: 2,
						toggleGroup: 'dss-a',
						allowDepress: false
					},
					items: [{
						text: 'Relative',
						pressed: true,
						toggleHandler: function(self, pressed) {
							Ext.getCmp('d3-multi-radar').setVisible(pressed);
						}
					},{
						text: 'Graded',
						toggleHandler: function(self, pressed) {
							Ext.getCmp('d3-graded-radar').setVisible(pressed);
						}
					}]
				},{
					xtype: 'graded_radar',
					hidden: true
				},{
					xtype: 'multi_radar',
				},{
					xtype: 'container',
					padding: '8 0',
					layout: DSS.utils.layout('vbox',undefined, 'stretch'),
					items: [
						widget('Pollinators', 0.374, '0 to 1', 'pollinator'),
						widget('Bird Habitat', 0.431, '0 to 1', 'habitat_index'),
						widget('Pest Supression', 0.23, '0 to 1', 'pest'),
						widget('Nitrogen Retention', 9494.4,'lb/yr', 'net_income'),
						widget('Soil Retention', 12453850.8,'ton/yr', 'soil_loss'),
						widget('Phosphorus Retention', 11034.83,'lb/yr', 'p_loss_epic'),
						widget('Soil Carbon', 480049.83,'ton/yr', 'soc'),
						widget('Climate Mitigation', 23560.83,'ton/yr', 'nitrous_oxide'),
					]
				}]

			}]
		});
		
		me.callParent(arguments);
	},
		
});
