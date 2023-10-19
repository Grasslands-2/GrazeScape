var selectedField = {}
function selectFieldDelete(){
	DSS.MapState.removeMapInteractions()
	AppEvents.triggerEvent('show_field_draw_mode_indicator')
	document.body.style.cursor = "crosshair";
	DSS.select = new ol.interaction.Select({
		features: new ol.Collection(),
		toggleCondition: ol.events.condition.never,
		layers: [DSS.layer.fields_1],
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'white',
				width: 4
			}),
			fill: new ol.style.Fill({
				color: 'rgba(0,0,0,0)'
			}),
			image: new ol.style.Icon({
				src: '/static/grazescape/public/images/eraser-icon-23413.png'
			}),
			zIndex: 5
		})
	});
	DSS.map.addInteraction(DSS.select);
	console.log("select is on")
	DSS.select.on('select', function(f) {
		console.log('select on happened');
		selectedField = f.selected[0];
		console.log(selectedField);
		DSS.dialogs.FieldDeletePanel = Ext.create('DSS.field_shapes.Delete'); 		
		DSS.dialogs.FieldDeletePanel.show().center().setY(100);
	})
}

function deleteField(feat){
		var formatWFS = new ol.format.WFS();
		var formatGML = new ol.format.GML({
			featureNS: 'http://geoserver.org/GrazeScape_Vector'
			/*'http://geoserver.org/Farms'*/,
			Geometry: 'geom',
			featureType: 'field_2',
			srsName: 'EPSG:3857'
		});
		console.log(feat)
		node = formatWFS.writeTransaction(null, null, [feat], formatGML);
		console.log(node);
		s = new XMLSerializer();
		str = s.serializeToString(node);
		console.log(str);

		geoServer.deleteField(str, feat)
}

Ext.define('DSS.field_shapes.Delete', {
	extend: 'Ext.window.Window',
	alias: 'widget.field_delete',
    alternateClassName: 'DSS.DeleteFieldShapes',
    constrain: false,
	modal: true,
	width: 500,
	resizable: true,
	bodyPadding: 8,
    autoDestroy: true,
    scrollable: 'y',
	titleAlign: 'center',
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	initComponent: function() {
		let me = this;

		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				cls: 'section-title light-text text-drp-20',
				html: 'Delete Field',
				height: 35
			},{
				xtype: 'container',
				style: 'background-color: #666; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); border-top-color:rgba(255,255,255,0.25); border-bottom-color:rgba(0,0,0,0.3); box-shadow: 0 3px 6px rgba(0,0,0,0.2)',
				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				margin: '8 4',
				padding: '2 8 10 8',
				defaults: {
					DSS_parent: me,
				},
				items: [
				{
					xtype: 'component',
					cls: 'information light-text text-drp-20',
					html: 'Would you like to delete field \''+selectedField.values_.field_name + '\'?',
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Yes',
					formBind: true,
					handler: async function() {
						console.log("DELETED!")
						await deleteField(selectedField)
						DSS.MapState.removeMapInteractions()
						AppEvents.triggerEvent('hide_field_draw_mode_indicator')
						
						if(DSS.field_grid.FieldGrid.store){
							console.log("running update")
						    fieldChangeList = []
						    fieldChangeList = Ext.getCmp("fieldTable").getStore().getUpdatedRecords()
							console.log(fieldChangeList)
							AppEvents.triggerEvent('hide_field_grid')
							AppEvents.triggerEvent('hide_infra_grid')
							DSS.field_grid.FieldGrid.store.clearData();
							selectInteraction.getFeatures().clear()
							DSS.map.removeInteraction(selectInteraction);
							selectedFields = []
							await runFieldUpdate()
							setTimeout(async function(){
								DSS.MapState.destroyLegend();
								DSS.MapState.removeMapInteractions();
								//Running gatherTableData before showing grid to get latest
								pastAcreage = 0
								cropAcreage = 0
								await gatherTableData();
								AppEvents.triggerEvent('show_field_grid');
								AppEvents.triggerEvent('hide_field_shape_mode');
								AppEvents.triggerEvent('hide_infra_line_mode');
							}, 3000);
						}
						this.up('window').destroy();
					}
			    },
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'No',
					formBind: true,
					handler: function() {
						console.log("NOT DELETED!")
						DSS.MapState.removeMapInteractions()
						AppEvents.triggerEvent('hide_field_draw_mode_indicator')
						this.up('window').destroy();
					}
			    }
			]
			}]
		});
		
		me.callParent(arguments);
	},
	
	addModeControl: function(owner) {
		let me = this;
		let c = DSS_viewport.down('#DSS-mode-controls');
		console.log('delete mode on')
		selectFieldDelete()
		
		
		if (!c.items.has(me)) {
			Ext.suspendLayouts();
				c.removeAll(false);
				c.add(me);
			Ext.resumeLayouts(true);
		}
		me.mouseMoveDeleteHandler(owner);
		me.clickDeleteFieldHandler(owner);
	},
	
	mouseMoveDeleteHandler: function() {
		
		DSS.mouseMoveFunction = function(evt) {
			let coordinate  =  DSS.map.getEventCoordinate(evt.originalEvent);
			let fs = DSS.layer.fields_1.getSource().getFeaturesAtCoordinate(coordinate);
			let cursor = '';
			let mouseList = [];
			fs.forEach(function(f) {
				let g = f.getGeometry();
				if (g && g.getType() === "MultiPolygon") {
					cursor = 'pointer';
					mouseList.push(f);
					
					let extent = g.getExtent();
					let center = ol.extent.getCenter(extent);
					center[1] += (ol.extent.getHeight(extent) / 2);
					center = g.getClosestPoint(center);
				}
			})
			DSS.map.getViewport().style.cursor = cursor;
		}		
	},
	
    clickDeleteFieldHandler: function(owner) {
    	
    	DSS.mapClickFunction = function(evt) {
			let coordinate  =  DSS.map.getEventCoordinate(evt.originalEvent);
			let fs = DSS.layer.fields_1.getSource().getFeaturesAtCoordinate(coordinate);
			let deleteList = [];
			fs.forEach(function(f) {
				let g = f.getGeometry();
				if (g && g.getType() === "Polygon") {
					deleteList.push({'f':f, 'f_id': f.getProperties().f_id});
				}
			})
			if (deleteList.length > 0) {
				owner.deleteFields(deleteList,DSS.activeFarm);
			}
		}		
    },
	
});
