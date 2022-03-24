var selectedInfra = {}
function selectInfraDelete(){
	DSS.MapState.removeMapInteractions()
	AppEvents.triggerEvent('show_infra_draw_mode_indicator')
	document.body.style.cursor = "crosshair";
	//document.body.style.cursor = "url('http://www.rw-designer.com/cursor-extern.php?id=85157.cur'), auto";
	DSS.select = new ol.interaction.Select({
		features: new ol.Collection(),
		toggleCondition: ol.events.condition.never,
		layers: [DSS.layer.infrastructure],
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'white',
				width: 4
			}),
		})
	});
	DSS.map.addInteraction(DSS.select);
	console.log("select is on")
	DSS.select.on('select', function(f) {
		//setTimeout(() => {DSS.map.getView().setZoom(DSS.map.getView().getZoom() + 1)}, 90)
		console.log('select on happened');
		selectedInfra = f.selected[0];
		console.log(selectedInfra);
		DSS.dialogs.InfraDeletePanel = Ext.create('DSS.infra_shapes.DeleteLine'); 		
		DSS.dialogs.InfraDeletePanel.show().center().setY(0);
		// if(confirm('Are you sure you want to delete field '+selectedInfra.values_.infra_name + '?')) {
		// 	console.log("DELETED!")
		// 	deleteInfra(selectedInfra)
		// 	//alert('Infrastructure '+ selectedInfra.values_.infra_name+ ' has been deleted.')
		// 	DSS.MapState.removeMapInteractions()
		// 	AppEvents.triggerEvent('hide_infra_draw_mode_indicator')
		//   } else {
		// 	console.log("NOT DELETED!")
		// 	DSS.MapState.removeMapInteractions()
		//   }
	})
}
// function selectInfra(){
// 	DSS.select = new ol.interaction.Select({
// 		features: new ol.Collection(),
// 			toggleCondition: ol.events.condition.never,
// 			style: new ol.style.Style({
// 				stroke: new ol.style.Stroke({
// 					color: 'white',
// 					width: 4
// 				}),
// 			})
// 		});
// 	DSS.map.addInteraction(DSS.select);
// 	console.log("select is on")
// 	DSS.select.on('select', function(f) {
// 		console.log('select on happened');
// 		selectedInfra = f.selected[0];
// 		console.log(selectedInfra);
// 	});
// }
function deleteInfra(feat){


		var formatWFS = new ol.format.WFS();
		var formatGML = new ol.format.GML({
			featureNS: 'http://geoserver.org/GrazeScape_Vector'
			/*'http://geoserver.org/Farms'*/,
			Geometry: 'geom',
			featureType: 'infrastructure_2',
			srsName: 'EPSG:3857'
		});
		console.log(feat)
		node = formatWFS.writeTransaction(null, null, [feat], formatGML);
		console.log(node);
		s = new XMLSerializer();
		str = s.serializeToString(node);
		console.log(str);
		geoServer.deleteInfra(str, feat)

}

//------------------------------------------------------------------------------
Ext.define('DSS.infra_shapes.DeleteLine', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.Infra_delete',
    alternateClassName: 'DSS.DeleteInfraShapes',
    constrain: false,
	modal: true,
	width: 500,
	resizable: true,
	bodyPadding: 8,
	//singleton: true,	
    autoDestroy: false,
    scrollable: 'y',
	titleAlign: 'center',
	//title: 'Choose your new Fields Name and Crop Rotation',
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				cls: 'section-title light-text text-drp-20',
				html: 'Delete Infrastructure',
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
				items: [{
					xtype: 'component',
					cls: 'information light-text text-drp-20',
					html: 'Are you sure you want to infrastructure line '+selectedInfra.values_.infra_name + '?'//'Would you like to delete this piece of infrastructure?',
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Yes',
					formBind: true,
					handler: function() {
						console.log("DELETED!")
						deleteInfra(selectedInfra)
						alert('Infrastructure '+ selectedInfra.values_.infra_name+ ' has been deleted.')
						DSS.MapState.removeMapInteractions()
						AppEvents.triggerEvent('hide_infra_draw_mode_indicator')
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
						AppEvents.triggerEvent('hide_infra_draw_mode_indicator')
						this.up('window').destroy();
					}
			    }
			]
			}]
		});
		
		me.callParent(arguments);
	},
	
	//--------------------------------------------------------------------------
	addModeControl: function(owner) {
		let me = this;
		let c = DSS_viewport.down('#DSS-mode-controls');
		console.log('delete mode on')
		selectInfra()
		
		
		if (!c.items.has(me)) {
			Ext.suspendLayouts();
				c.removeAll(false);
				c.add(me);
			Ext.resumeLayouts(true);
		}
		me.mouseMoveDeleteHandler(owner);
		me.clickdeleteInfraHandler(owner);
	},
	
    //-------------------------------------------------------------
	mouseMoveDeleteHandler: function() {
		
		DSS.mouseMoveFunction = function(evt) {
			let coordinate  =  DSS.map.getEventCoordinate(evt.originalEvent);
			let fs = DSS.layer.fields_1.getSource().getFeaturesAtCoordinate(coordinate);
			let cursor = '';
			let mouseList = [];
			fs.forEach(function(f) {
				let g = f.getGeometry();
				if (g && g.getType() === "LineString") {
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
	
    //-------------------------------------------------------------
	//No longer in use
    clickdeleteInfraHandler: function(owner) {
    	
    	DSS.mapClickFunction = function(evt) {
			let coordinate  =  DSS.map.getEventCoordinate(evt.originalEvent);
			let fs = DSS.layer.fields_1.getSource().getFeaturesAtCoordinate(coordinate);
			let deleteList = [];
			fs.forEach(function(f) {
				let g = f.getGeometry();
				if (g && g.getType() === "Line") {
					deleteList.push({'f':f, 'f_id': f.getProperties().f_id});
//					deleteList.push(f.getProperties().f_id);
				}
			})
			if (deleteList.length > 0) {
				owner.deleteInfras(deleteList,DSS.activeFarm);
			}
		}		
    },
	
});
