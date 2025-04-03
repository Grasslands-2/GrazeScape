DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')
var dupname = false

async function createFieldAP(e,lac,non_lac,beef,crop,rotfreq,tillageInput,soil_pInput,field_nameInput){
	console.log("Called createField from FieldApplyPanel");
	//Starter values for dependant variables
	cropDisp='';
	tillageDisp='';
	grassDisp='Low Yielding';
	grassVal='Bluegrass-clover';
	rotationFreqVal = "0.65";
	rotationFreqdisp = 'Continuous',
	grazeDensityVal = 'lo',
	grazeDensityDisp = 'low'
	//--------------------Setting Display Values------------------
	// if(crop=='pt-cn'){
	// 	cropDisp ='Continuous Pasture';
	// 	grassDisp='Low Yielding';
	// 	grassVal='Bluegrass-clover';
	// 	rotationFreqVal = 0.65;
	// 	rotationFreqdisp = 'Continuous',
	// 	grazeDensityVal = 'lo',
	// 	grazeDensityDisp = 'low'

	// }
	if(crop=='pt' && rotfreq == "0.65"){
		crop='pt-cn'
		cropDisp ='Pasture';
		grassDisp='Medium Yielding';
		grassVal='Timothy-clover';
		rotationFreqVal = rotfreq;
		rotationFreqdisp = 'Continuous',
		grazeDensityVal = 'lo',
		grazeDensityDisp = 'low'

	}
	else if(crop=='pt' && rotfreq != "0.65"){
		crop='pt-rt'
		cropDisp ='Pasture'
		grassDisp='Medium Yielding';
		grassVal='Timothy-clover';
		rotationFreqVal = rotfreq;
		if(rotfreq == 1){
			rotationFreqdisp = 'Once a day'
		}
		else if(rotfreq == "1.2"){
			rotationFreqdisp = 'More than once a day'
		}
		else if(rotfreq == "0.95"){
			rotationFreqdisp = 'Every 3 days'
		}
		else{
			rotationFreqdisp = 'Every 7 days'
		}
		//rotationFreqdisp = 'Continuous';
	}
	else if(crop=='ps'){
		cropDisp ='New Pasture'}
	else if(crop=='dl'){
		cropDisp ='Dry Lot'}
	else if(crop=='cc'){
		cropDisp ='Continuous Corn'}
	else if(crop=='cg'){
		cropDisp ='Cash Grain (corn/soy)'}
	else if(crop=='dr'){
		cropDisp ='Corn Silage to Corn Grain to Alfalfa 3 yrs'}
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
	}
	else if(DSS.activeRegion == "northeastWI"){
		console.log("northeastWI has hit")
		soil_pInput = 36 
	}
	else if(DSS.activeRegion == "uplandsWI"){
		console.log("uplandsWI has hit")
		soil_pInput = 46
	}
	else if(DSS.activeRegion == "southWestWI"){
		console.log("southWestWI has hit")
		soil_pInput = 35
	}
	else if(DSS.activeRegion == "redCedarWI"){
		console.log("redCedarWI has hit")
		soil_pInput = 50
	}
    else if(DSS.activeRegion == "pineRiverMN"){
		console.log("Pine River has hit")
		soil_pInput = 50
	}
	else if(DSS.activeRegion == "eastCentralWI"){
		console.log("southWestWI has hit")
		soil_pInput = 35
	}
	else if(DSS.activeRegion == "southEastWI"){
		console.log("southWestWI has hit")
		soil_pInput = 35
	}
	console.log("active region", DSS.activeRegion, soil_pInput)
	addFieldProps(e,lac,non_lac,beef,crop,tillageInput,soil_pInput,field_nameInput,)
}
async function addFieldProps(e,lac,non_lac,beef,crop,tillageInput,soil_pInput,field_nameInput) {
	fertDefaultArray = await get_field_rot_defaults({"rotation": crop, "legume":true})
	console.log(fertDefaultArray.fertDefaults)
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
			perc_fert_p:0,
			perc_manure_p:0,
			spread_confined_manure_on_pastures: false,
			on_contour: false,
			interseeded_clover: true,
			pasture_grazing_rot_cont:false,
			grass_speciesval: grassVal,
			grass_speciesdisp: grassDisp,
			rotational_freq_val: rotationFreqVal,
			rotational_freq_disp: rotationFreqdisp,
			grazingdensityval: grazeDensityVal,
			grazingdensitydisp: grazeDensityDisp,
			// if crop is  set fert to different levels.
			perc_fert_n:fertDefaultArray.fertDefaults[1],
			perc_fert_p:fertDefaultArray.fertDefaults[2],
			perc_manure_n:fertDefaultArray.fertDefaults[0],
			perc_manure_p:0,
			is_dirty:true,
			land_cost:140
		})
	
	setFeatureAttributes(e.feature)
	addFieldAcreage(e.feature)
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
	rotfreq: {
		is_active: false,
		value: '0.65',
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

function addFieldAcreage(feature) {
    console.log(feature);
    if (
        feature.values_.rotation == "pt-cn" ||
        feature.values_.rotation == "pt-rt"
    ) {
        pastAcreage = pastAcreage + feature.area;
    }
    if (
        feature.values_.rotation == "cc" ||
        feature.values_.rotation == "cg" ||
        feature.values_.rotation == "dr" ||
        feature.values_.rotation == "cso"
    ) {
        cropAcreage = cropAcreage + feature.area;
    }
}
function setFeatureAttributes(feature) {
    console.log(feature);
    console.log(feature.getGeometry().getExtent());
    console.log(feature.getGeometry().getCoordinates()[0]);
    data = {
        extents: feature.getGeometry().getExtent(),
        coordinates: feature.getGeometry().getCoordinates()[0],
        active_region: DSS.activeRegion,
    };
    var csrftoken = Cookies.get("csrftoken");
    $.ajaxSetup({
        headers: { "X-CSRFToken": csrftoken },
    });
    return new Promise(function (resolve) {
        $.ajax({
            url: "/grazescape/get_default_om",
            type: "POST",
            data: data,
            success: function (responses, opts) {
                delete $.ajaxSetup().headers;
                console.log(responses);
                feature.setProperties({ om: responses["om"] });

                DSS.MapState.removeMapInteractions();
                geoServer.wfs_field_insert(feature);
                resolve("done");
            },
            failure: function (response, opts) {
                me.stopWorkerAnimation();
            },
        });
    });
}

//------------------------------------------------------------------------------
Ext.define('DSS.field_shapes.FieldApplyPanel', {
	extend: 'Ext.window.Window',
	alias: 'widget.field_apply_panel',
	id: "fieldApplyPanel",
	constrain: false,
	modal: true,
	width: 500,
	resizable: true,
	bodyPadding: 8,
	autoDestroy: false,
	scrollable: 'y',
	titleAlign: 'center',
	title: "New Field",
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	requires: ['DSS.field_shapes.apply.FieldName'],

	initComponent: function () {
		let me = this;

		if (!DSS['viewModel']) DSS['viewModel'] = {}
		DSS.viewModel.fieldApplyPanel = new Ext.app.ViewModel({
			formulas: {
				tillageValue: {
					bind: '{tillage.value}',
					get: function (value) { return { tillage: value }; },
					set: function (value) { this.set('tillage.value', value); }
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
					value: '',
				},
				rotfreq: {
					is_active: false,
					value: '',
				},
				tillage: {
					is_active: false,
					value: { tillage: 'su' }
				},
				graze_animals: {
					is_active: false,
					dairy_lactating: false,
					dairy_nonlactating: false,
					beef: false
				},
			}
		})

		me.setViewModel(DSS.viewModel.fieldApplyPanel);

		Ext.applyIf(me, {
			items: [
				{
					xtype: 'form',
					url: 'create_field',
					jsonSubmit: true,
					header: false,
					border: false,
					layout: DSS.utils.layout('vbox', 'start', 'stretch'),
					padding: '8 8 8 8',
					activeItem: 2,
					defaults: {
						DSS_parent: me,
					},
					items: [
						{
							xtype: 'field_shapes_apply_field_name'
						},
						{
							xtype: 'container',
							width: '100%',
							layout: 'absolute',
							margin: '8 0 0 0',
							items: [{
								xtype: 'component',
								x: 0, y: -6,
								width: '100%',
								cls: 'information accent-text bold',
								html: "Set Crop / Landcover",
							}]
						},
						{
							xtype: 'radiogroup',
							style: 'padding: 0px; margin: 0px', // fixme: eh...
							columns: 2,
							vertical: true,
							allowBlank: false,
							viewModel: {
								formulas: {
									cropValue: {
										bind: '{crop.value}', // inherited from parent
										get: function (val) {
											let obj = {};
											obj['crop'] = val;
											return obj;
										},
										set: function (val) {
											this.set('crop.value', val['crop']);
										}
									}
								}
							},
							bind: '{cropValue}', // formula from viewModel above
							defaults: {
								name: 'crop',
								listeners: {
									afterrender: function (self) {
										if (self.boxLabelEl) {
											self.boxLabelEl.setStyle('cursor', 'pointer')
										}
									},
								}
							},
							listeners: {
								change: function () {
									selectedType = this.getValue().crop
									CropTypeVar = selectedType
									console.log(CropTypeVar)
									console.log(this)
									if (CropTypeVar == 'pt') {
										console.log('pt hit')
										Ext.getCmp('PTRotFreq').enable()
										Ext.getCmp('PTRotFreqLabel').setHtml("Set Rotatonal Frequency")
									} else {
										Ext.getCmp('PTRotFreq').disable()
										Ext.getCmp('PTRotFreqLabel').setHtml("")
									}
								}
							},
							items: [
								{ boxLabel: 'Pasture', inputValue: 'pt' },
								{ boxLabel: 'Dry Lot', inputValue: 'dl' },
								{ boxLabel: 'Continuous Corn', inputValue: 'cc' },
								{ boxLabel: 'Cash Grain', inputValue: 'cg', boxLabelAttrTpl: 'data-qtip="Two-year rotation: Corn Grain & Soybeans"' },
								{ boxLabel: 'Dairy Rotation 1', inputValue: 'dr', boxLabelAttrTpl: 'data-qtip="Five-year rotation: Corn Grain, Corn Silage, Three years of Alfalfa"' },
								{ boxLabel: 'Dairy Rotation 2', inputValue: 'cso', boxLabelAttrTpl: 'data-qtip="Three-year rotation: Corn Silage, Soybeans, Oats"' }
							]
						},
						{
							xtype: 'container',
							width: '100%',
							layout: 'absolute',
							items: [{
								xtype: 'component',
								id: 'PTRotFreqLabel',
								displayed: false,
								x: 0, y: -6,
								width: '100%',
								height: 7,
								cls: 'information accent-text bold',
								html: "",
							}]
						},
						{
							xtype: 'radiogroup',
							id: 'PTRotFreq',
							padding: 15,
							disabled: true,
							columns: 1,
							style: 'padding: 0px; margin: 0px', // fixme: eh...
							hideEmptyLabel: false,
							vertical: true,
							allowBlank: false,
							html: "Set Rotatonal Frequency",
							html: "",
							viewModel: {
								formulas: {
									rotfreqValue: {
										bind: '{rotfreq.value}', // inherited from parent
										get: function (val) {
											let obj = {};
											obj['rotfreq'] = val;
											return obj;
										},
										set: function (val) {
											this.set('rotfreq.value', val['rotfreq']);
										}
									}
								}
							},
							bind: '{rotfreqValue}', // formula from viewModel above
							defaults: {
								name: 'rotfreq',
								listeners: {
									afterrender: function (self) {
										if (self.boxLabelEl) {
											self.boxLabelEl.setStyle('cursor', 'pointer')
										}
									}
								}
							},
							items: [
								{ boxLabel: 'More than once a day', inputValue: "1.2" },
								{ boxLabel: 'Once a day', inputValue: "1" },
								{ boxLabel: 'Every 3 days', inputValue: "0.95" },
								{ boxLabel: 'Every 7 days', inputValue: "0.75" },
								{ boxLabel: 'Never (Continuous grazing)', inputValue: "0.65" }
							]
						},
						{
							xtype: 'button',
							cls: 'button-text-pad',
							componentCls: 'button-margin',
							text: 'Add Field',
							formBind: true,
							handler: async function () {
								var form = this.up('form').getForm();
								var data = me.viewModel.data;
								dupname = false
								console.log(data)
								if (form.isValid()) {
									DSS.map.removeInteraction(DSS.select);
									console.log(inputFieldObj)
									await dupNameCheck(data.field_name.value, DSS.layer.fields_1, "field")
									if (dupname) {
										alert("You already have a field with that name in this scenario!")
										form.reset()
									} else {
										createFieldAP(inputFieldObj, data.graze_animals.dairy_lactating,
											data.graze_animals.dairy_nonlactating,
											data.graze_animals.beef,
											data.crop.value,
											data.rotfreq.value,
											data.tillage.value.tillage,
											data.soil_p.value,
											data.field_name.value,
											//probably wrong, look up data schema
											data.on_contour);
										data.field_name.value = ''
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
	addModeControl: function () {
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
