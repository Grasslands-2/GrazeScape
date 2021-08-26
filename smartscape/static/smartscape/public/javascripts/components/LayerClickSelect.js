//-----------------------------------------------------
// DSS.components.LayerClickSelect
//
//-----------------------------------------------------
Ext.define('DSS.components.LayerClickSelect', {
    extend: 'DSS.components.LayerBase',
    alias: 'widget.layer_click_select',
    
	title: 'County',
	DSS_serverLayer: 'counties',
	DSS_vectorLayer: false, // open layers vector map layer, usually created with GEOJson
	DSS_vectorId: 'OBJECTID', // unique feature identifier in GEOJson that links to DSS_serverLayer
	DSS_startChoosingButton: 'Start Choosing',
	DSS_stopChoosingButton: 'Stop Choosing',
	
	DSS_hoverInteraction: false,
	DSS_clickInteraction: false,
	DSS_hoverStyle: false, // set to a new ol.style.Style
	DSS_clickStyle: false,
	
	//--------------------------------------------------------------------------
	configInteractionStyles: function() {
		
		var me = this;
		me.DSS_hoverStyle = new ol.style.Style({
		    stroke: new ol.style.Stroke({
		        color: 'rgba(0, 0, 0, 0.9)',
		        width: 2
		    }),
		    fill: new ol.style.Fill({
			    color: 'rgba(255, 200, 64, 0.5)'
			})
		});
		
		me.DSS_clickStyle = new ol.style.Style({
		    stroke: new ol.style.Stroke({
		        color: 'rgba(128, 64, 0, 0.7)',
		        width: 2
		    }),
		    fill: new ol.style.Fill({
			    color: 'rgba(255, 64, 0, 0.4)'
			})
		});
	},
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;

		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				layout: DSS.utils.layout('hbox', 'center', 'stretch'),
				padding: '0 0 0 32',
				items: [{
					xtype: 'button',
					itemId: 'dss-choice-toggle',
					scale: 'medium',
					text: me.DSS_startChoosingButton,
					width: 142,
					margin: 4,
					toggleGroup: me.DSS_serverLayer,
					toggleHandler: function(self, state) {
						if (state) {
							me.DSS_browser.cancelClickActionsForAllBut(me);
							
							self.setText(me.DSS_stopChoosingButton);
							me.DSS_vectorLayer.setVisible(true);
							globalMap.addInteraction(me.DSS_clickInteraction);
							me.DSS_hoverInteraction.setMap(globalMap);
						}
						else {
							self.setText(me.DSS_startChoosingButton);
							
							me.DSS_vectorLayer.setVisible(false);
							globalMap.removeInteraction(me.DSS_clickInteraction);
							me.DSS_hoverInteraction.setMap(null);
						}
					}
				},{
					xtype: 'button',
					scale: 'medium',
					text: 'Clear Selection',
					width: 142,
					margin: 4,
					handler: function(self) {
						me.DSS_clickInteraction.getFeatures().clear();
						me.DSS_browser.valueChanged();
						me.updateSelectionCount();
					}
				}]
			},{
				xtype: 'component',
				itemId: 'DSS-selection-count',
				style: 'color: #444; text-align: center',
				margin: '2 32',
				listeners: {
					afterrender: function() {
						me.updateSelectionCount();
					}
				}
			}]
		});
		
		me.callParent(arguments);
		me.configInteractionStyles();
		me.createInteractions();
	},
	
	//-----------------------------------------------------------------------
	updateSelectionCount: function() {
		var me = this;
		var count = me.DSS_clickInteraction.getFeatures().getLength();
		me.getComponent('DSS-selection-count').setHtml('Features Selected: ' + count);
	},
	
	//-----------------------------------------------------------------------
	cancelClickSelection: function() {
		var me = this;
		
		var toggle = me.down('#dss-choice-toggle');
		toggle.toggle(false)
		
	},
	//-----------------------------------------------------------------------
	createInteractions: function() {
		
		var me = this;
		me.DSS_hoverInteraction = new ol.interaction.Select({
			condition: ol.events.condition.pointerMove,
			layers: [me.DSS_vectorLayer],
			style: me.DSS_hoverStyle
		});
		globalMap.addInteraction(me.DSS_hoverInteraction);
		
		me.DSS_clickInteraction = new ol.interaction.Select({
			condition: ol.events.condition.click,
			toggleCondition: ol.events.condition.always,
			layers: [me.DSS_vectorLayer],
			style: me.DSS_clickStyle,
		});
		me.DSS_clickInteraction.on('select', function() {
			me.updateSelectionCount();
			me.DSS_browser.valueChanged();
		})
		//globalMap.addInteraction(me.DSS_clickInteraction);
		//me.DSS_clickInteraction.setMap(null);
	},
	
	//--------------------------------------------------------------------------
	configureSelection: function() {

		var me = this;
		if (me.isHidden()) {return false;}
		
		var queryLayer = { 
			name: me.DSS_serverLayer,
			type: 'indexed',
			matchValues: []
		};
		
		var added = false;
		me.DSS_clickInteraction.getFeatures().forEach(function(item) {
			queryLayer.matchValues.push(item.get(me.DSS_vectorId));
			added = true;
		});
		
		// TODO: logically speaking, active widgets with no selection should cause no pixel selection...
		//	however, it also doesn't feel exactly right...
		if (!added) return false;
		
        return queryLayer;
	},
	
	//--------------------------------------------------------------------------
	fromQuery: function(queryStep) {
		var me = this;
		var ar = me.DSS_vectorLayer.getSource().getFeatures();
		
		me.DSS_clickInteraction.getFeatures().clear();
		Ext.each(queryStep.matchValues, function(val) {
			Ext.each(ar, function(feat) {
				if (feat.get(me.DSS_vectorId) == val) {
					me.DSS_clickInteraction.getFeatures().push(feat);
					return false;
				}
			})
		})
		
		me.updateSelectionCount();
	}
	
});
