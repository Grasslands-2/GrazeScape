var fields_1Source_loc = ""

function wfs_field_insert(feat,geomType) {
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/GrazeScape_Vector'
		/*'http://geoserver.org/Farms'*/,
		Geometry: 'geom',
        featureType: 'field_2',
        srsName: 'EPSG:3857'
    });
    console.log(feat)
    node = formatWFS.writeTransaction([feat], null, null, formatGML);
	console.log(node);
    s = new XMLSerializer();
    str = s.serializeToString(node);
    console.log(str);

    geoServer.wfs_field_insert(str, feat)

}
function addFieldAcreage(feature){
	console.log(feature)
	if(feature.values_.rotation == 'pt-cn'|| feature.values_.rotation == 'pt-rt'){
		pastAcreage = pastAcreage + feature.area
	}
	if(feature.values_.rotation == 'cc'|| feature.values_.rotation =='cg' || feature.values_.rotation =='dr' || feature.values_.rotation =='cso'){
		cropAcreage = cropAcreage + feature.area
	}

}
function setFeatureAttributes(feature,af,as){
    console.log(feature.getGeometry().getExtent())
    console.log(feature.getGeometry().getCoordinates()[0])
    data = {
        'extents':feature.getGeometry().getExtent(),
        'coordinates':feature.getGeometry().getCoordinates()[0]
    }
    var csrftoken = Cookies.get('csrftoken');
    $.ajaxSetup({
        headers: { "X-CSRFToken": csrftoken }
    });
    return new Promise(function(resolve) {
    $.ajax({
        'url' : '/grazescape/get_default_om',
        'type' : 'POST',
        'data' : data,
        success: function(responses, opts) {
            delete $.ajaxSetup().headers
            console.log(responses)
            feature.setProperties({"om":responses['om']})

            var geomType = 'polygon'

            DSS.MapState.removeMapInteractions()
            wfs_field_insert(feature, geomType)
            resolve('done')
        },
        failure: function(response, opts) {
            me.stopWorkerAnimation();
        }
    })
    })
}
async function createField(lac,non_lac,beef,crop,tillageInput,soil_pInput,field_nameInput){

	//Starter values for dependant variables
	cropDisp='';
	tillageDisp='';
	grassDisp='';
	grassVal='';
	//--------------------Setting Display Values------------------
	if(crop=='pt-cn'){
		cropDisp ='Continuous Pasture';
		grassDisp='Bluegrass-clover';
		grassVal='Bluegrass';
	}
	else if(crop=='pt-rt'){
		cropDisp ='Rotational Pasture'
		grassDisp='Bluegrass-clover';
		grassVal='Bluegrass';
		rotationFreqVal = '1'
		rotationFreqdisp = 'Once a day'
	}
	else if(crop=='ps'){
		cropDisp ='New Pasture'}
	else if(crop=='dl'){
		cropDisp ='Dry Lot'}
	else if(crop=='cc'){
		cropDisp ='Continuous Corn'}
	else if(crop=='cg'){
		cropDisp ='Cash Grain (cg/sb)'}
	else if(crop=='dr'){
		cropDisp ='Corn Silage to Corn Grain to Alfalfa(3x)'}
	else if(crop=='cso'){
		cropDisp ='Corn Silage to Soybeans to Oats'}

	if(tillageInput=='nt'){
		tillageDisp = 'No-Till'}
	else if(tillageInput=='su'){
		tillageDisp = 'Spring Cultivation'}
	else if(tillageInput=='sc'){
		tillageDisp = 'Spring Chisel + Disk'}
	else if(tillageInput=='sn'){
		tillageDisp = 'Spring Chisel No Disk'}
	else if(tillageInput=='sv'){
		tillageDisp = 'Spring Vertical'}
	else if(tillageInput=='smb'){
		tillageDisp = 'Spring Moldboard Plow'}
	else if(tillageInput=='fc'){
		tillageDisp = 'Fall Chisel + Disk'}
	else if(tillageInput=='fm'){
		tillageDisp = 'Fall Moldboard Plow'}

//-------------------Now for the actual function-----------------

	DSS.draw = new ol.interaction.Draw({
		source: source,
		type: 'MultiPolygon',
		geometryName: 'geom'
	});
	DSS.map.addInteraction(DSS.draw);
	console.log("draw is on");
	//console.log(DSS.activeFarm);
	var af = parseInt(DSS.activeFarm,10);
	var as = DSS.activeScenario;
	console.log('This is the active scenario#: ');

	DSS.draw.on('drawend', function (e,) {
		fieldArea = e.feature.values_.geom.getArea();
		console.log(fieldArea);
        // get default OM value
        console.log(e)
        e.feature.setProperties({
                id: af,
                farm_id: af,
                scenario_id: as,
                field_name: field_nameInput,
                soil_p: soil_pInput,
                rotation: crop,
                rotation_disp: cropDisp,
                graze_beef_cattle: beef,
                graze_dairy_lactating: lac,
                graze_dairy_non_lactating: non_lac,
                tillage: tillageInput,
                tillage_disp:tillageDisp,
                cover_crop:'nc',
                cover_crop_disp:'No Cover',
                rotational_density:0,
                area:fieldArea * 0.000247105,
                //this changes the square meters to acres
                fertilizerpercent:0,
                manurepercent:0,
                spread_confined_manure_on_pastures: false,
                on_contour: false,
                interseeded_clover: false,
                pasture_grazing_rot_cont:false,
				grass_speciesval: grassVal,
		 		grass_speciesdisp: grassDisp,
				rotational_freq_val: rotationFreqVal,
				rotational_freq_disp: rotationFreqdisp,
                is_dirty:true
            })
        setFeatureAttributes(e.feature)
		addFieldAcreage(e.feature)
		alert('Field Added!')
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
					dairy_lactating: false,
					dairy_nonlactating: false,
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
				height: 28
				},{
				//xtype: 'container',
				xtype: 'form',
				url: 'create_field', // brought in for form test
				jsonSubmit: true,// brought in for form test
				header: false,// brought in for form test
				border: false,// brought in for form test
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
				},
				// {
				// 	xtype: 'field_shapes_apply_graze_animals'
				// },
				{
					xtype: 'field_shapes_apply_landcover'
				},
				// {
				// 	xtype: 'field_shapes_apply_tillage'
				// },
				// {
				// 	xtype: 'field_shapes_apply_soil_p'
				// }
				,/*{
					xtype: 'field_shapes_apply_fertilizer'
				}*/
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Draw Field',
					formBind: true,
					handler: function() {
						var form =  this.up('form').getForm();
						var data = me.viewModel.data;
						if(form.isValid()){
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
							//data.field_name.value.setValue('')
							form.reset()
						}
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