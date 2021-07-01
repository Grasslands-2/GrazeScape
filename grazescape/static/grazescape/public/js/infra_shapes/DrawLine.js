var InfrastructureSource_loc = new ol.source.Vector({
	url:'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:infrastructure_2&' +
	'outputformat=application/json&'+
	'srsname=EPSG:3857',
	format: new ol.format.GeoJSON()
});

function wfs_infra_insert(feat,geomType) {  
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/GrazeScape_Vector'
		/*'http://geoserver.org/Farms'*/,
		Geometry: 'geom',
        featureType: 'infrastructure_2',
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
			DSS.MapState.removeMapInteractions()
			console.log("uploaded data successfully!: "+ data);
			DSS.layer.infrastructure.getSource().refresh();
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
	//console.log("Infra wrote to Geoserver")
	DSS.MapState.showInfrasForFarm(DSS.activeFarm);
	DSS.layer.infrastructure.getSource().refresh();
}
function createinfra(infra_nameInput,
infra_typeInput,
fence_materialInput,
water_pipeInput,
lane_materialInput){
	infra_typeDisp = '';
	fence_materialDisp = '';
	water_pipeDisp = '';
	lane_materialDisp = '';
	costPerFoot = 0;

	console.log(infra_nameInput);
	//---------------Setting Infra Values-----------------------
	if(infra_typeInput == 'fl') {infra_typeDisp = 'Fencing'
		if(fence_materialInput == 'hte1') {
			fence_materialDisp = 'High Tensile Electric, 1 Strand'
			costPerFoot = 0.84}
		else if(fence_materialInput == 'hte'){ 
			fence_materialDisp = 'Electric - High Tensile'
			costPerFoot = 1.81}
		else if(fence_materialInput == 'pp'){ 
			fence_materialDisp = 'Pasture Paddock'
			costPerFoot = 0.37}
		}
	else if (infra_typeInput == 'wl') {infra_typeDisp = 'Water Line'
		if(water_pipeInput == 'sup') {
			water_pipeDisp = 'Surface HDPE or PVC Pipe'
			costPerFoot = 1.17;}
		else if(water_pipeInput == 'sbp'){ 
			water_pipeDisp = 'Shallow Buried HDPE or PVC Pipe'
			costPerFoot = 2.31;}
		}
	else if(infra_typeInput == 'll'){ infra_typeDisp = 'Lane Line'
		if(lane_materialInput == 're') {
			lane_materialDisp = 'Raised Earth Walkway'
			costPerFoot = 0.16}
		else if(lane_materialInput == 'gw') {
			lane_materialDisp = 'Gravel Walkway'
			costPerFoot = 0.37}
		else if(lane_materialInput == 'gg') {
			lane_materialDisp = 'Gravel over Geotextile'
			costPerFoot = 0.56}
		else if(lane_materialInput == 'ggr'){ 
			lane_materialDisp = 'Gravel Over Graded Rock'
			costPerFoot = 0.96}
		if(lane_materialInput == 'ggrg'){ 
			lane_materialDisp = 'Gravel Over Graded Rock and Geotextile'
			costPerFoot = 1.33}
		}

	//-------------------Now for the actual function-----------------

	DSS.draw = new ol.interaction.Draw({
		source: source,
		type: 'LineString',
		geometryName: 'geom'
	});
	DSS.snap = new ol.interaction.Snap({
		source:DSS.layer.fields_1.getSource()
	});
	DSS.map.addInteraction(DSS.draw);
	DSS.map.addInteraction(DSS.snap);
	console.log("draw is on");
	//console.log(DSS.activeFarm);
	var af = parseInt(DSS.activeFarm,10)
	var as = DSS.activeScenario;

	DSS.draw.on('drawend', function (e,) {
		e.feature.setProperties({
			id: af,
			farm_id: af,
			scenario_id: as,
			infra_name: infra_nameInput,
			infra_type: infra_typeInput,
			infra_type_disp: infra_typeDisp,
			fence_material: fence_materialInput,
			fence_material_disp: fence_materialDisp,
			water_pipe: water_pipeInput,
			water_pipe_disp: water_pipeDisp,
			lane_material: lane_materialInput,
			lane_material_disp:lane_materialDisp,
			cost_per_foot: costPerFoot

		})
		var geomType = 'Line'
		
		DSS.MapState.removeMapInteractions()
		wfs_infra_insert(e.feature, geomType)
		console.log("HI! WFS infra Insert ran!")
	})     
}
//------------------working variables--------------------
var type = "Line";
var source = InfrastructureSource_loc

//------------------------------------------------------------------------------
Ext.define('DSS.infra_shapes.DrawLine', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.infra_drawline',
    alternateClassName: 'DSS.DrawInfraShapes',
    singleton: true,	
	
    autoDestroy: false,
    
    scrollable: 'y',

	requires: [
		//'DSS.ApplicationFlow.activeFarm',
		'DSS.infra_shapes.apply.infraName',
		'DSS.infra_shapes.apply.infraType',
		'DSS.infra_shapes.apply.fenceMaterial',
		'DSS.infra_shapes.apply.waterPipe',
		'DSS.infra_shapes.apply.laneMaterial'
	],
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		if (!DSS['viewModel']) DSS['viewModel'] = {}
		DSS.viewModel.drawLine = new Ext.app.ViewModel({
			data: {
				infraName: {
					is_active: true,
					value: '',
				},
				infraType: {
					is_active: true,
					value: '',
				},
				fenceMaterial: {
					is_active: false,
					value: '',
				},
				waterPipe: {
					is_active: false,
					value: '',
				},
				laneMaterial: {
					is_active: false,
					value: '',
				}
			}
		})
		
		me.setViewModel(DSS.viewModel.drawLine);
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				cls: 'section-title light-text text-drp-20',
				html: 'infrastructure Lines <i class="fas fa-draw-polygon fa-fw accent-text text-drp-50"></i>',
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
					html: 'Infrastructure Options',
				},{
					xtype: 'infra_shapes_apply_infra_name'
				},{
					xtype: 'infra_shapes_apply_infra_type'
				},{
					xtype: 'infra_shapes_apply_fence_material'
				},{
					xtype: 'infra_shapes_apply_lane_material'
				},{
					xtype: 'infra_shapes_apply_water_pipe'
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Draw Infrastructure',
					formBind: true,
					handler: function() { 
						var data = me.viewModel.data;
						DSS.map.removeInteraction(DSS.select);
						//console.log(DSS.activeFarm);

						createinfra(
							data.infraName.value,
							data.infraType.value,
							data.fenceMaterial.value,
							data.waterPipe.value,
							data.laneMaterial.value
						);
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
