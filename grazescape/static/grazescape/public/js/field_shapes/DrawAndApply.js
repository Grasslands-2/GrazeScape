var fields_1Source_loc = new ol.source.Vector({
	url:'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:field_1&' +
	'outputformat=application/json&'+
	'srsname=EPSG:3857'
	/*'http://localhost:8081/geoserver/wfs?'+
		'service=wfs&'+
		'?version=2.0.0&'+
		'request=GetFeature&'+
		'typeName=Farms:field_1&' +
		'outputformat=application/json&'+
		'srsname=EPSG:3857'*/,
	format: new ol.format.GeoJSON()
});

function wfs_field_insert(feat,geomType) {  
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/GrazeScape_Vector'
		/*'http://geoserver.org/Farms'*/,
		Geometry: 'geom',
        featureType: 'field_1',
        srsName: 'EPSG:3857'
    });
    console.log(feat)
    node = formatWFS.writeTransaction([feat], null, null, formatGML);
	console.log(node);
    s = new XMLSerializer();
    str = s.serializeToString(node);
    console.log(str);
    $.ajax('http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'
	/*'http://localhost:8081/geoserver/wfs?'*/,{
        type: 'POST',
        dataType: 'xml',
        processData: false,
        contentType: 'text/xml',
        data: str,
		success: function (data) {
			console.log("uploaded data successfully!: "+ data);
			DSS.layer.fields_1.getSource().refresh();
			DSS.layer.farms_1.getSource().refresh();
		},
        error: function (xhr, exception) {
            var msg = "";
            if (xhr.status === 0) {
                msg = "Not connect.\n Verify Network." + xhr.responseText;
            } else if (xhr.status == 404) {
                msg = "Requested page not found. [404]" + xhr.responseText;
            } else if (xhr.status == 500) {
                msg = "Internal Server Error [500]." +  xhr.responseText;
            } else if (exception === "parsererror") {
                msg = "Requested JSON parse failed.";
            } else if (exception === "timeout") {
                msg = "Time out error." + xhr.responseText;
            } else if (exception === "abort") {
                msg = "Ajax request aborted.";
            } else {
                msg = "Error:" + xhr.status + " " + xhr.responseText;
            }
			console.log(msg);
        }
    })
	.done();
	//console.log("Field wrote to Geoserver")
	DSS.MapState.showFieldsForFarm(DSS.activeFarm);
	DSS.layer.fields_1.getSource().refresh();
}
function createField(lac,non_lac,beef,crop,tillageInput,soil_pInput,field_nameInput){
	
	DSS.draw = new ol.interaction.Draw({
		source: source,
		type: 'MultiPolygon',
		geometryName: 'geom'
	});
	DSS.map.addInteraction(DSS.draw);
	console.log("draw is on");
	//console.log(DSS.activeFarm);
	var af = parseInt(DSS.activeFarm,10)

	DSS.draw.on('drawend', function (e,) {
		e.feature.setProperties({
			id: af,
			owner_id: af,
			field_name: field_nameInput,
			soil_p: soil_pInput,
			om: 10,
			rotation: 'PS',
			graze_beef_cattle: beef,
			graze_dairy_lactating: lac,
			graze_dairy_non_lactating: non_lac,
			cover_crop: crop,
			tillage: tillageInput,
			on_contour: false
		})
		var geomType = 'polygon'
		
		DSS.MapState.removeMapInteractions()
		wfs_field_insert(e.feature, geomType)
		console.log("HI! WFS feild Insert ran!")
	})     
}
//------------------working variables--------------------
var type = "Polygon";
var source = fields_1Source_loc

//------------------------------------------------------------------------------
Ext.define('DSS.field_shapes.DrawAndApply', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.field_draw_apply',
    alternateClassName: 'DSS.DrawFieldShapes',
    singleton: true,	
	
    autoDestroy: false,
    
    scrollable: 'y',

	requires: [
		//'DSS.ApplicationFlow.activeFarm',
		'DSS.field_shapes.apply.FieldName',
		'DSS.field_shapes.apply.SoilP',
		'DSS.field_shapes.apply.Landcover',
		'DSS.field_shapes.apply.Tillage',
		'DSS.field_shapes.apply.SpreadManure',
		'DSS.field_shapes.apply.Fertilizer',
		'DSS.field_shapes.apply.GrazeAnimals',
	],
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		if (!DSS['viewModel']) DSS['viewModel'] = {}
		DSS.viewModel.drawAndApply = new Ext.app.ViewModel({
			formulas: {
				tillageValue: { 
					bind: '{tillage.value}',
					get: function(value) { return {tillage: value }; 			},
					set: function(value) { this.set('tillage.value', value); 	}
				}
			},
			data: {
				field_name: {
					is_active: true,
					value: '',
				},
				soil_p: {
					is_active: true,
					value: 35,
				},
				crop: {
					is_active: true,
					value: 'ps',
				},
				tillage: {
					is_active: false,
					value: {tillage: 'su'}
				},
				graze_animals: {
					is_active: false,
					dairy_lactating: true,
					dairy_nonlactating: true,
					beef: false
				},
				/*fertilizer: {
					is_active: false,
					extRecs: 100, // %
					canManurePastures: true
				}*/
			}
		})
		
		me.setViewModel(DSS.viewModel.drawAndApply);
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				cls: 'section-title light-text text-drp-20',
				html: 'Field Shapes <i class="fas fa-draw-polygon fa-fw accent-text text-drp-50"></i>',
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
					html: 'Add Field Options',
				},{
					xtype: 'field_shapes_apply_field_name'
				},{
					xtype: 'field_shapes_apply_graze_animals'
				},{
					xtype: 'field_shapes_apply_landcover'
				},{
					xtype: 'field_shapes_apply_tillage'
				},{
					xtype: 'field_shapes_apply_soil_p'
				},/*{
					xtype: 'field_shapes_apply_fertilizer'
				}*/
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Draw Field',
					formBind: true,
					handler: function() { 
						var data = me.viewModel.data;
						DSS.map.removeInteraction(DSS.select);
						//console.log(DSS.activeFarm);

						createField(data.graze_animals.dairy_lactating,
							data.graze_animals.dairy_nonlactating,
							data.graze_animals.beef,
							data.crop.value,
							data.tillage.value.tillage,
							data.soil_p.value,
							data.field_name.value,
							//probably wrong, look up data schema
							data.on_contour);
					}
			    }]
			}]
		});
		me.callParent(arguments);
	},
	
	//--------------------------------------------------------------------------
	addModeControl: function() {
		let me = this;
		let c = DSS_viewport.down('#DSS-mode-controls');
		
		if (!c.items.has(me)) {
			Ext.suspendLayouts();
				c.removeAll(false);
				c.add(me);
			Ext.resumeLayouts(true);
		}
	}
	
});

//TODO: move to a better place...
let getToggle = function(owner, stateRef, activatedHandler, deactivatedHandler) {
	
	return {
		xtype: 'component',
		style: 'right: 1px; top: 2px',
		cls: 'accent-text fa-hover',
		html: '<i class="fas fa-plus-circle"></i>',
		listeners: {
			afterrender: function(c) {
				let vm = owner.lookupViewModel();
				let active = vm.get(stateRef) ;
				c.addCls(active ? 'to-close' : 'to-add')
				
				let ct = owner.down('#contents');
				let ht = owner.DSS_sectionHeight;
				ct.setHeight(active ? ht : 0);
				
				c.getEl().getFirstChild().el.on({
					click: function(self) {
						if (c.hasCls('to-add')) {
							c.removeCls('to-add')
							c.addCls('to-close');
							vm.set(stateRef, true);
							ct.animate({
								duration: 300,
								dynamic: true,
								to: {
									height: ht
								}
							});
							if (typeof activatedHandler === 'function') {
								activatedHandler.call()
							}
						}
						else {
							c.addCls('to-add')
							c.removeCls('to-close');
							vm.set(stateRef, false);
							ct.animate({
								duration: 300,
								dynamic: true,
								to: {
									height: 0
								}
							});
							if (typeof deactivatedHandler === 'function') {
								deactivatedHandler.call()
							}
						}	
					}
				});
			}
		}					
	}	
}

