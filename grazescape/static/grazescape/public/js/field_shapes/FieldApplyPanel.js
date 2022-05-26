DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')
var dupname = false
// function dupNameCheck(inputName){
// 	DSS.layer.fields_1.getSource().forEachFeature(function(f) {
// 		console.log(String(inputName))
// 		console.log(f.values_.field_name)
// 		if(f.values_.field_name === String(inputName)){
// 			console.log("DUP NAME HIT!!!!")
// 			dupname =  true
// 			//dupname = true
// 		}
// 	})
// }

async function createFieldAP(e,lac,non_lac,beef,crop,tillageInput,soil_pInput,field_nameInput){

	//Starter values for dependant variables
	cropDisp='';
	tillageDisp='';
	grassDisp='Low Yielding';
	grassVal='Bluegrass-clover';
	rotationFreqVal = 1;
	rotationFreqdisp = 'Once a day';
	grazeDensityVal = 'lo',
	grazeDensityDisp = 'low'
	//--------------------Setting Display Values------------------
	if(crop=='pt-cn'){
		cropDisp ='Continuous Pasture';
		grassDisp='Low Yielding';
		grassVal='Bluegrass-clover';
		rotationFreqVal = 1
		rotationFreqdisp = 'Once a day',
		grazeDensityVal = 'lo',
		grazeDensityDisp = 'low'

	}
	else if(crop=='pt-rt'){
		cropDisp ='Rotational Pasture'
		grassDisp='Bluegrass-clover';
		grassVal='Bluegrass';

		rotationFreqVal = 1;
		rotationFreqdisp = 'Once a day';
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
	var soil_pInput = 0
	if(DSS.activeRegion == "cloverBeltWI"){
		console.log("Clover Belt has hit")
		soil_pInput = 40 
	}if(DSS.activeRegion == "northeastWI"){
		console.log("northeastWI has hit")
		soil_pInput = 36 
	}if(DSS.activeRegion == "uplandsWI"){
		console.log("uplandsWI has hit")
		soil_pInput = 46
	}if(DSS.activeRegion == "southWestWI"){
		console.log("southWestWI has hit")
		soil_pInput = 35
	}
	addFieldProps(e,lac,non_lac,beef,crop,tillageInput,soil_pInput,field_nameInput)
	// DSS.draw = new ol.interaction.Draw({
	// 	source: source,
	// 	type: 'MultiPolygon',
	// 	geometryName: 'geom'
	// });
	// DSS.map.addInteraction(DSS.draw);
	// console.log("draw is on");
	// var af = parseInt(DSS.activeFarm,10);
	// var as = DSS.activeScenario;
	// console.log('This is the active scenario#: ');
	// setFeatureAttributes(e.feature)
	// addFieldAcreage(e.feature)
	// alert('Field Added!')
}
function addFieldProps(e,lac,non_lac,beef,crop,tillageInput,soil_pInput,field_nameInput) {
	var geometry = e.feature.values_.geom
	fieldArea = ol.sphere.getArea(geometry)
	console.log(fieldArea);
	// get default OM value
	console.log(e)
	console.log(e.feature)
	e.feature.setProperties({
			id: DSS.activeFarm,
			farm_id: DSS.activeFarm,
			scenario_id: DSS.activeScenario,
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
			grazingdensityval: grazeDensityVal,
			grazingdensitydisp: grazeDensityDisp,
			is_dirty:true,
			land_cost:140
		})
	setFeatureAttributes(e.feature)
	addFieldAcreage(e.feature)
	//alert('Field Added!')
}

var fieldData = {
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

//------------------------------------------------------------------------------
Ext.define('DSS.field_shapes.FieldApplyPanel', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.field_apply_panel',
	id: "fieldApplyPanel",
//	autoDestroy: false,
//	closeAction: 'hide',
	constrain: false,
	modal: true,
	width: 500,
	resizable: true,
	bodyPadding: 8,
	//singleton: true,	
    autoDestroy: false,
    scrollable: 'y',
	titleAlign: 'center',
	title: 'Choose your new Fields Name and Crop Rotation',
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	

	
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		if (!DSS['viewModel']) DSS['viewModel'] = {}
		DSS.viewModel.fieldApplyPanel = new Ext.app.ViewModel({
			
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
		
		me.setViewModel(DSS.viewModel.fieldApplyPanel);
		
		Ext.applyIf(me, {
			items: [
				//{
				// xtype: 'component',
				// cls: 'section-title light-text text-drp-20',
				// html: 'Field Shapes <i class="fas fa-draw-polygon fa-fw accent-text text-drp-50"></i>',
				// height: 28
				// },
				{
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
				activeItem: 2,
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
					text: 'Add Field',
					formBind: true,
					handler: async function() {
						var form =  this.up('form').getForm();
						//var data = fieldData;
						var data = me.viewModel.data;
						dupname = false
						console.log(data)
						if(form.isValid()){
							DSS.map.removeInteraction(DSS.select);
							//console.log(e)
							console.log(inputFieldObj)
							// DSS.layer.fields_1.getSource().forEachFeature(function(f) {
							// 	if(f.values_.field_name == data.field_name.value){
							// 		dupname = true
							// 	}
							// })
							await dupNameCheck(data.field_name.value,DSS.layer.fields_1,"field")
							if(dupname){
								alert("You already have a field with that name in this scenario!")
								form.reset()
							}else{
							createFieldAP(inputFieldObj,data.graze_animals.dairy_lactating,
								data.graze_animals.dairy_nonlactating,
								data.graze_animals.beef,
								data.crop.value,
								data.tillage.value.tillage,
								data.soil_p.value,
								data.field_name.value,
								//probably wrong, look up data schema
								data.on_contour);
								data.field_name.value = ''
								//form.reset()
								document.body.style.cursor = "wait";
								Ext.getCmp("btnRunModels").setDisabled(false)
								this.up('window').destroy();
							}
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
