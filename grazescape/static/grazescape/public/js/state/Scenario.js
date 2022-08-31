//const { listenerCount } = require("process");

var farmArray = [];
var farmObj = {};
var scenarioArray = [];
var scenarioObj = {};
var pastAcreage = 0
var cropAcreage = 0
var modelruncounter = 0
var inputFieldObj = {}
var inputInfraObj = {}
var dupname = false
function dupNameCheck(inputName,layer,nameValue){
	
	layer.getSource().forEachFeature(function(f) {
		console.log(String(inputName))
		var nameString = ''
		if(nameValue == "field"){
			nameString = f.values_.field_name
			console.log(nameString)
			if(nameString === String(inputName)){
				console.log("DUP NAME HIT!!!!")
				dupname =  true
			}
		}else{
			nameString = f.values_.infra_name
			console.log(nameString)
			if(nameString === String(inputName)){
				console.log("DUP NAME HIT!!!!")
				dupname =  true
			}
		}
		
	})
}

//---------------Infra Line Styles----------------------------
var InfrastructureSource_loc = new ol.source.Vector({
});
var fenceDrawStyle = new ol.style.Style({
	stroke: new ol.style.Stroke({
		color: '#bfac32',
		width: 4,
	}),
	image: new ol.style.Circle({
		radius: 7,
		fill: new ol.style.Fill({
		  color: '#bfac32',
		}),
	}),
})
var laneDrawStyle = new ol.style.Style({
	stroke: new ol.style.Stroke({
		color: '#bd490f',
		width: 4,
	}),
	image: new ol.style.Circle({
		radius: 7,
		fill: new ol.style.Fill({
		  color: '#bd490f',
		}),
	}),
})
var waterLineDrawStyle = new ol.style.Style({
	stroke: new ol.style.Stroke({
		color: '#0072fc',
		width: 4,
	}),
	image: new ol.style.Circle({
		radius: 7,
		fill: new ol.style.Fill({
		  color: '#0072fc',
		}),
	}),
})
var infraDrawDefaultStyle = new ol.style.Style({
	stroke: new ol.style.Stroke({
		color: '#0072fc',
		width: 4,
	})
})
function infraDrawStyle(infra_typeInput){
	if(infra_typeInput == 'fl'){
		return fenceDrawStyle
	}
	if(infra_typeInput == 'll'){
		return laneDrawStyle
	}
	if(infra_typeInput == 'wl'){
		return waterLineDrawStyle
	}
	else{
		return infraDrawDefaultStyle
	}
};
//---------------------------------

function aswCheck(breedSizeData,aswValueInput){
	console.log(breedSizeData)
	console.log(aswValueInput)
	if(breedSizeData = 'small'){
		if(aswValueInput < 220){
			aswValue = 220
		}else if(aswValueInput > 460){
			aswValue = 460
		}else{
			aswValue = aswValueInput
		}
	}
	if(breedSizeData = 'large'){
		if(aswValueInput < 330){
			aswValue = 330
		}else if(aswValueInput > 670){
			aswValue = 670
		}else{
			aswValue = aswValueInput
		}
	}
	// if(breedSizeData = 'small' && aswValueInput < 220){
	// 	aswValue = 220
	// }else if(breedSizeData = 'small' && aswValueInput > 460){
	// 	aswValue = 460
	// }else if(breedSizeData = 'large' && aswValueInput < 330){
	// 	aswValue = 330
	// }else if(breedSizeData = 'large' && aswValueInput > 670){
	// 	aswValue = 670
	// }else{
	// 	aswValue = aswValueInput
	// }
	console.log(aswValue)
}

function waitForScen(){
	    return new Promise(function(resolve) {
	        console.log(scenarioArray.length == 0)
            if (scenarioArray.length == 0){
                console.log("waiting...")

            }
            console.log("done waiting!!!!!!!!!!!!")
            console.log("2222")
            resolve("done")
	    activateRunModels()
        })
	}
function popScenarioArray(obj) {
	for (i in obj)
	//console.log(i);
	scenarioArray.push({
		gid: obj[i].properties.gid,
		id: obj[i].properties.scenario_id,
		geom: obj[i].geometry,
		farmName: obj[i].properties.farm_name,
		farmId: obj[i].properties.farm_id,
		scenarioName: obj[i].properties.scenario_name,
		scenarioId: obj[i].properties.scenario_id,
		scenarioDesp: obj[i].properties.scenario_desp,
		lacCows: obj[i].properties.lac_cows,
		dryCows: obj[i].properties.dry_cows,
		heifers: obj[i].properties.heifers,
		youngStock: obj[i].properties.youngstock,
		beefCows: obj[i].properties.beef_cows,
		stockers: obj[i].properties.stockers,
		finishers: obj[i].properties.finishers,
		aveMilkYield: obj[i].properties.ave_milk_yield,
		aveDailyGain: obj[i].properties.ave_daily_gain,
		lacMonthsConfined: obj[i].properties.lac_confined_mos,
		dryMonthsConfined: obj[i].properties.dry_confined_mos,
		beefMonthsConfined: obj[i].properties.beef_confined_mos,
		lacGrazeTime: obj[i].properties.lac_graze_time,
		dryGrazeTime: obj[i].properties.dry_graze_time,
		beefGrazeTime: obj[i].properties.beef_graze_time,
		lacRotateFreq: obj[i].properties.lac_rotate_freq,
		dryRotateFreq: obj[i].properties.dry_rotate_freq,
		percResidual: obj[i].properties.perc_residual_on_pasture,
		pastRotationFreq: obj[i].properties.pasture_rot_freq,
		beefRotateFreq: obj[i].properties.beef_rotate_freq,
		heifersOnPasture: obj[i].properties.heifers_on_pasture,
		heiferBreedSize: obj[i].properties.heifer_breed_size,
		heiferBred: obj[i].properties.heifer_bred_unbred,
		heiferTDWG: obj[i].properties.heifer_target_weight_gain,
		heiferASW: obj[i].properties.heifer_starting_weight,
		heiferDaysOnPasture: obj[i].properties.heifer_days_on_pasture,
		heiferFeedFromPasturePerHeadDay: obj[i].properties.heifer_feed_from_pasture_per_head_day,
		heiferFeedFromPasturePerDayHerd: obj[i].properties.heifer_feed_from_pasture_per_herd_day,
		heiferDMIDemandPerSeason: obj[i].properties.heifer_dmi_demand_per_season,
		cornSeedCost: obj[i].properties.corn_seed_cost,
		cornPestCost: obj[i].properties.corn_pest_cost,
		cornMachCost: obj[i].properties.corn_mach_cost,
		soySeedCost: obj[i].properties.soy_seed_cost,
		soyPestCost: obj[i].properties.soy_pest_cost,
		soyMachCost: obj[i].properties.soy_mach_cost,
		grassSeedCost: obj[i].properties.grass_seed_cost,
		grassPestCost: obj[i].properties.grass_pest_cost,
		grassMachCost: obj[i].properties.grass_mach_cost,
		oatSeedCost: obj[i].properties.oat_seed_cost,
		oatPestCost: obj[i].properties.oat_pest_cost,
		oatMachCost: obj[i].properties.oat_mach_cost,
		alfalfaSeedCost: obj[i].properties.alfalfa_seed_cost,
		alfalfaPestCost: obj[i].properties.alfalfa_pest_cost,
		alfalfaMachCost: obj[i].properties.alfalfa_mach_cost,
		alfalfaMachYearOneCost: obj[i].properties.alfalfa_mach_year_one,
		fertPCost: obj[i].properties.fert_p_cost,
		fertNCost: obj[i].properties.fert_n_cost,
	});
	console.log("gatherTableData for scenarios ran");
	console.log(scenarioArray);
}

// function getWFSScenario() {
        

// }

function gatherScenarioTableData() {
	geoServer.getWFSScenario('&CQL_filter=gid='+DSS.activeScenario)
};


function runInfraUpdate(){
	DSS.layer.infrastructure.getSource().forEachFeature(function(f) {
		var infraFeature = f;
		console.log("from infra loop through: " + infraFeature.id_);
		for (i in infraArray){
			console.log("infraArray id: " +infraArray[i].id);
			if(infraArray[i].id === infraFeature.id_){
				console.log(infraArray[i].name);
				infraFeature.setProperties({
					infra_name: infraArray[i].name,
					//farm_id: infraArray[i].owningFarmid,
					infra_type: infraArray[i].infraType,
					infra_type_disp: infraArray[i].infraTypeDisp,
					fence_material: infraArray[i].fenceMaterial,
					fence_material_disp: infraArray[i].fenceMaterialDisp,
					water_pipe: infraArray[i].waterPipe,
					water_pipe_disp: infraArray[i].waterPipeDisp,
					lane_material: infraArray[i].laneMaterialDisp,
					lane_material_disp: infraArray[i].laneMaterialDisp,
					cost_per_foot: infraArray[i].costPerFoot,
				});
				wfs_update(infraFeature,'infrastructure_2');
				break;
			}				
		}				
	})
};
function runFieldUpdate(){
	console.log("IN runFieldUpdate");
    let changedFieldsList = []
    for (field in fieldChangeList){
        changedFieldsList.push(fieldChangeList[field].id)
    }
    console.log(changedFieldsList)
	DSS.layer.fields_1.getSource().forEachFeature(function(f) {
		console.log(f)
		var feildFeature = f;
		console.log("from fields_1 loop through: " + feildFeature.id_);
		for (i in fieldArray){
			console.log("Fieldarray id: " +fieldArray[i].id);
			console.log(fieldArray[i]);
			if(fieldArray[i].id === feildFeature.id_){
				console.log(fieldArray[i].name);
				console.log(fieldArray[i].id);
				let is_dirty = false

				// if our field has been changed we need to run model
				if (changedFieldsList.includes(fieldArray[i].id)){
				    feildFeature.setProperties({is_dirty:true})
				}
				feildFeature.setProperties({
					field_name: fieldArray[i].name,
					soil_p: fieldArray[i].soilP,
					om: fieldArray[i].soilOM,
					rotation: fieldArray[i].rotationVal,
					rotation_disp: fieldArray[i].rotationDisp,
					tillage: fieldArray[i].tillageVal,
					tillage_disp: fieldArray[i].tillageDisp,
					cover_crop: fieldArray[i].coverCropVal,
					cover_crop_disp: fieldArray[i].coverCropDisp,
					on_contour: fieldArray[i].onContour,
					perc_fert_p:fieldArray[i].fertPerc,
					perc_manure_p: fieldArray[i].manuPerc,
					grass_speciesval: fieldArray[i].grassSpeciesVal,
					grass_speciesdisp: fieldArray[i].grassSpeciesDisp,
					interseeded_clover: fieldArray[i].interseededClover,
					grazingdensityval: fieldArray[i].grazeDensityVal,
					grazingdensitydisp: fieldArray[i].grazeDensityDisp,
					spread_confined_manure_on_pastures: fieldArray[i].manurePastures,
					graze_dairy_lactating: fieldArray[i].grazeDairyLactating,
					graze_dairy_non_lactating: fieldArray[i].grazeDairyNonLactating,
					graze_beef_cattle: fieldArray[i].grazeBeefCattle,
					rotational_freq_disp:fieldArray[i].rotationFreqDisp,
					rotational_freq_val:fieldArray[i].rotationFreqVal,
					area: fieldArray[i].area,
					perimeter: fieldArray[i].perimeter,
					fence_type: fieldArray[i].fence_type,
					fence_cost: fieldArray[i].fence_cost,
					fence_unit_cost: fieldArray[i].fence_unit_cost,
					perc_fert_p: fieldArray[i].fertPercP,
					perc_fert_n: fieldArray[i].fertPercN,
					perc_manure_p: fieldArray[i].manuPercP,
					perc_manure_n: fieldArray[i].manuPercN,
				});
				wfs_update(feildFeature,'field_2');
				break;
			}				
		}				
	})
};
async function runScenarioUpdate(){
	aswValue = 0
	
	//await aswCheck(DSS['viewModel'].scenario.data.heifers.breedSize,
	//DSS['viewModel'].scenario.data.heifers.asw)
	//reSourcescenarios()
	console.log('in run scen update')
	DSS.layer.scenarios.getSource().getFeatures().forEach(function(f) {
		console.log(f.values_.gid)
		var scenarioFeature = f;
		if(DSS.activeScenario === scenarioFeature.values_.gid){
			//console.log(scenarioArray[i].scenarioName);
			console.log(scenarioArray[i]);
			scenarioFeature.setProperties({

				//Animal variables commented out for now, until needed by later development
				//ZJH 05252022

				// lac_cows: DSS['viewModel'].scenario.data.dairy.lactating,
				// dry_cows: DSS['viewModel'].scenario.data.dairy.dry,
				// youngstock: DSS['viewModel'].scenario.data.dairy.youngstock,
				// beef_cows: DSS['viewModel'].scenario.data.beef.cows,
				// stockers: DSS['viewModel'].scenario.data.beef.stockers,
				// finishers: DSS['viewModel'].scenario.data.beef.finishers,
				// ave_milk_yield: DSS['viewModel'].scenario.data.dairy.dailyYield,
				// lac_confined_mos: DSS['viewModel'].scenario.data.dairy.lactatingConfined,
				// dry_confined_mos: DSS['viewModel'].scenario.data.dairy.nonLactatingConfined,
				// beef_confined_mos: DSS['viewModel'].scenario.data.beef.confined,
				// lac_graze_time: DSS['viewModel'].scenario.data.dairy.lactatingGrazeTime,
				// dry_graze_time: DSS['viewModel'].scenario.data.dairy.nonLactatingGrazeTime,
				// beef_graze_time: DSS['viewModel'].scenario.data.beef.grazeTime,
				// lac_rotate_freq: DSS['viewModel'].scenario.data.dairy.lactatingRotationFreq,
				// dry_rotate_freq: DSS['viewModel'].scenario.data.dairy.nonLactatingRotationFreq,
				// perc_residual_on_pasture: DSS['viewModel'].scenario.data.percResidualOnPasture,
				// beef_rotate_freq: DSS['viewModel'].scenario.data.beef.rotationFreq,
				// heifers_on_pasture: DSS['viewModel'].scenario.data.heifers.rotationFreqVal,
				// pasture_acreage: DSS['viewModel'].scenario.data.acreage.pasture,
				// crop_acreage: DSS['viewModel'].scenario.data.acreage.crop,
				// pasture_rot_freq: DSS['viewModel'].scenario.data.pastRotationFreq,
				// heifers: DSS['viewModel'].scenario.data.heifers.heifers,
				// heifer_breed_size: DSS['viewModel'].scenario.data.heifers.breedSize,
				// heifer_bred_unbred: DSS['viewModel'].scenario.data.heifers.bred,
				// heifer_target_weight_gain: DSS['viewModel'].scenario.data.heifers.tdwg,
				// heifer_starting_weight: aswValue,
				// heifer_days_on_pasture: DSS['viewModel'].scenario.data.heifers.daysOnPasture,
				// heifer_feed_from_pasture_per_head_day: DSS['viewModel'].scenario.data.heifers.forageFromPasturePerHeadDay,
				// heifer_feed_from_pasture_per_herd_day: DSS['viewModel'].scenario.data.heifers.forageFromPasturePerDayHerd,
				// heifer_dmi_demand_per_season: DSS['viewModel'].scenario.data.heifers.dmiDemandPerSeason,
				corn_seed_cost: DSS['viewModel'].scenario.data.costs.cornSeedCost,
				corn_pest_cost: DSS['viewModel'].scenario.data.costs.cornPestCost,
				corn_mach_cost: DSS['viewModel'].scenario.data.costs.cornMachCost,
				soy_seed_cost: DSS['viewModel'].scenario.data.costs.soySeedCost,
				soy_pest_cost: DSS['viewModel'].scenario.data.costs.soyPestCost,
				soy_mach_cost: DSS['viewModel'].scenario.data.costs.soyMachCost,
				grass_seed_cost: DSS['viewModel'].scenario.data.costs.grassSeedCost,
				grass_pest_cost: DSS['viewModel'].scenario.data.costs.grassPestCost,
				grass_mach_cost: DSS['viewModel'].scenario.data.costs.grassMachCost,
				oat_seed_cost: DSS['viewModel'].scenario.data.costs.oatSeedCost,
				oat_pest_cost: DSS['viewModel'].scenario.data.costs.oatPestCost,
				oat_mach_cost: DSS['viewModel'].scenario.data.costs.oatMachCost,
				alfalfa_seed_cost: DSS['viewModel'].scenario.data.costs.alfalfaSeedCost,
				alfalfa_pest_cost: DSS['viewModel'].scenario.data.costs.alfalfaPestCost,
				alfalfa_mach_cost: DSS['viewModel'].scenario.data.costs.alfalfaMachCost,
				alfalfa_mach_year_one: DSS['viewModel'].scenario.data.costs.alfalfaMachYearOneCost,
				fert_p_cost: DSS['viewModel'].scenario.data.costs.fertPCost,
				fert_n_cost: DSS['viewModel'].scenario.data.costs.fertNCost
			});
			wfs_update(scenarioFeature,'scenarios_2');
		}						
	})
};
function wfs_update(feat,layer) {
    console.log(feat)
    //console.log(geomType)
	console.log('in field update func')
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/GrazeScape_Vector'
		/*'http://geoserver.org/Farms'*/,
		Geometry: 'geom',
        featureType: layer,
        srsName: 'EPSG:3857'
    });
    console.log(feat)
    node = formatWFS.writeTransaction(null, [feat], null, formatGML);
	console.log(node);
    s = new XMLSerializer();
    str = s.serializeToString(node);
	str=str.replace("feature:"+layer,"Farms:"+layer);
	str=str.replace("<Name>geometry</Name>","<Name>geom</Name>");
    geoServer.updateFieldAtt(str,feat )
}

function activateRunModels(){
	console.log(DSS.layer.fields_1.getSource().getFeatures().length)
	if(DSS.layer.fields_1.getSource().getFeatures().length > 0){
		console.log("Fields Layer more then 0")
		Ext.getCmp("btnRunModels").setDisabled(false)
	}else{
		console.log("Fields Layer more is Empty")
		Ext.getCmp("btnRunModels").setDisabled(true)
	}
}

//------------------------------------------------------------------------------
Ext.define('DSS.state.Scenario', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
    alternateClassName: 'DSS.StateScenario',
	alias: 'widget.state_scenario',

	requires: [
		'DSS.state.ScenarioPicker',
		'DSS.state.scenario.CropNutrientMode',
		'DSS.state.scenario.AnimalDialog',
		'DSS.state.scenario.PerimeterDialog',
		'DSS.state.operation.InfraDrawModeIndicator',
		'DSS.state.operation.FieldDrawModeIndicator',
		'DSS.field_shapes.FieldApplyPanel',
		'DSS.infra_shapes.InfraApplyPanel',
		'DSS.field_shapes.Delete',
		'DSS.infra_shapes.DeleteLine',
		'DSS.field_shapes.GeoJSONFieldUpload',
		'DSS.state.scenario.CostsDialog'
	],
	
	layout: DSS.utils.layout('vbox', 'center', 'stretch'),
	cls: 'section',

	statics: {
		get: function() {
			let def = {
					xtype: 'state_scenario'
			};
			
			return def;
		}
	},
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;
		if(Ext.getCmp("CostDialog")){
			Ext.getCmp("CostDialog").destroy()
			console.log("cost dialog destroyed")
		}
		//DSS.MapState.hideFieldsandInfra()

		Ext.applyIf(me, {
			defaults: {
				margin: '1rem',
			},
			items: [{
				xtype: 'container',
				layout: DSS.utils.layout('hbox', 'start', 'begin'),
				items: [{
					xtype: 'component',
					cls: 'back-button',
					tooltip: 'Back',
					html: '<i class="fas fa-reply"></i>',
					listeners: {
						render: function(c) {
							c.getEl().getFirstChild().el.on({
								click: async function(self) {
									// if (DSS['viewModel'].scenario.data ==null){
									// 	console.log("No viewModel")
									// 	await me.initViewModel();
									// }
									await gatherScenarioTableData
									//await runScenarioUpdate();
									geoServer.getWFSScenario('&CQL_filter=gid='+DSS.activeScenario)
									//geoServer.getWFSScenario()
									DSS.ApplicationFlow.instance.showManageOperationPage();
									//resetting model result layers
									//DSS.layer.PLossGroup.setVisible(false);
									DSS.MapState.destroyLegend();
									DSS.layer.erosionGroup.setVisible(false);
									DSS.layer.yieldGroup.setVisible(false);
									DSS.MapState.hideFieldsandInfra()
									AppEvents.triggerEvent('hide_field_grid')
									AppEvents.triggerEvent('hide_infra_grid')
									DSS.layer.PLossGroup.values_.layers.array_ = [];
									DSS.layer.erosionGroup.values_.layers.array_ = [];
									DSS.layer.yieldGroup.values_.layers.array_ = [];
								}
							});
						}
					}					
				},{
					xtype: 'component',
					flex: 1,
					cls: 'section-title accent-text right-pad',
					// TODO: Dynamic name...
					html: 'Scenario Design'
				}]
			},{ 
				xtype: 'container',
				layout: DSS.utils.layout('vbox', 'center', 'stretch'),
				items: [{ //------------------------------------------
					xtype: 'component',
					cls: 'information med-text',
					html: 'Farm: ' + DSS.farmName,
				},
				{ //------------------------------------------
					xtype: 'component',
					cls: 'information med-text',
					html: 'Scenario: ' + DSS.scenarioName,
				},
				{//------------------------------------------
					xtype: 'component',
					cls: 'information',
					html: 'Draw or Delete Fields<br>and Infrastructure'
				},
				{
					xtype: 'button',
					name:'Fields',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Add/Delete Fields',
					allowDepress: false,
						menu: {
							defaults:{
							xtype: 'button',
							cls: 'button-text-pad',
							componentCls: 'button-margin',
							hideOnClick: true,
						},
						items: [{
							text: 'Place a Field',
							//id:'nwel',
							listeners:{
								afterrender: function(self) {
									//self.setChecked(DSS.layer.DEM_image2.getVisible());
								},
							},
							handler: function(self){
								self.setActiveCounter(0)
								self.setActive(false)
								var af = parseInt(DSS.activeFarm,10);
								var as = DSS.activeScenario;
								AppEvents.triggerEvent('hide_field_grid')
								AppEvents.triggerEvent('hide_infra_grid')
								
								DSS.MapState.removeMapInteractions();
								//turns off clickActivateFarmHandler in mapstatetools needed for clean field drawing
								DSS.mapClickFunction = undefined;
								DSS.mouseMoveFunction = undefined;
								
								DSS.draw = new ol.interaction.Draw({
									source: source,
									type: 'MultiPolygon',
									geometryName: 'geom',
									style:new ol.style.Style({
										stroke: new ol.style.Stroke({
											color: '#bfac32',
											width: 4,
										}),
										fill: new ol.style.Fill({
											color: 'rgba(255, 255, 255, 0.5)'
										}),
										image: new ol.style.Icon({
											anchor: [0, 1],
											//size: [96,96],
											scale: 0.03,
											src: '/static/grazescape/public/images/pencil-png-653.png'
										}),
									})
								});
								DSS.map.addInteraction(DSS.draw);
								AppEvents.triggerEvent('hide_infra_draw_mode_indicator')
								AppEvents.triggerEvent('show_field_draw_mode_indicator')
								document.body.style.cursor = 'none'
								console.log("draw is on");
								console.log(self)
								DSS.draw.on('drawend', function (e) {
									console.log(e)
									document.body.style.cursor = 'default'
									fieldArea = e.feature.values_.geom.getArea();
									console.log(fieldArea);
									AppEvents.triggerEvent('hide_field_draw_mode_indicator')
									DSS.MapState.removeMapInteractions()
									DSS.dialogs.FieldApplyPanel = Ext.create('DSS.field_shapes.FieldApplyPanel'); 			
									DSS.dialogs.FieldApplyPanel.show().center().setY(100);
									inputFieldObj = e
								})     
							}
						},
						{
							text: 'Delete a Field',
							handler: function(self){
								self.setActiveCounter(0)
								console.log('delete field mode on')
								AppEvents.triggerEvent('hide_infra_draw_mode_indicator')
								selectFieldDelete()
							}
						},
						{
							text: 'Upload GeoJSON',
							handler: function(self) {
								DSS.dialogs.GeoJSONFieldUpload = Ext.create('DSS.field_shapes.GeoJSONFieldUpload'); 				
								DSS.dialogs.GeoJSONFieldUpload.show().center().setY(100);
							}
						},
						{
							text: 'Upload Shapefile',
							handler: function(self) {
								console.log("Upload Shapefiles clicked")
								DSS.dialogs.ShpFileFieldUpload = Ext.create('DSS.field_shapes.ShpFileFieldUpload'); 				
								DSS.dialogs.ShpFileFieldUpload.show().center().setY(100);
							}
						},
					]
				},
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
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					name:'Infrastructure',
					text: 'Add/Delete Infrastructure',
					allowDepress: false,
						menu: {
							defaults:{
							xtype: 'button',
							cls: 'button-text-pad',
							componentCls: 'button-margin',
							hideOnClick: true,
						},
						items: [{
							text: 'Place Infrastructure',
							//id:'nwel',
							listeners:{
								afterrender: function(self) {
									//self.setChecked(DSS.layer.DEM_image2.getVisible());
								},
							},
							handler: function(self){
								self.setActiveCounter(0)
								self.setActive(false)
								AppEvents.triggerEvent('hide_field_grid')
								AppEvents.triggerEvent('hide_infra_grid')
								DSS.MapState.removeMapInteractions();
								//turns off clickActivateFarmHandler in mapstatetools needed for clean field drawing
								DSS.mapClickFunction = undefined;
								DSS.mouseMoveFunction = undefined;
								
								DSS.draw = new ol.interaction.Draw({
									source: source,
									type: 'LineString',
									geometryName: 'geom',
									style:new ol.style.Style({
										stroke: new ol.style.Stroke({
											color: '#0072fc',
											width: 4,
										}),
										image: new ol.style.Icon({
											anchor: [0, 1],
											//size: [96,96],
											scale: 0.03,
											src: '/static/grazescape/public/images/pencil-png-653.png'
										}),
										// image: new ol.style.Circle({
										// 	radius: 7,
										// 	fill: new ol.style.Fill({
										// 	  color: '#bd490f',
										// 	}),
										// }),
									})
								});
								DSS.map.addInteraction(DSS.draw);
								AppEvents.triggerEvent('hide_field_draw_mode_indicator')
								AppEvents.triggerEvent('show_infra_draw_mode_indicator')
								document.body.style.cursor = 'none'
								console.log("draw is on");
								console.log(self)
								
								DSS.draw.on('drawend', function (e) {
									document.body.style.cursor = 'default'
									infraLength = e.feature.values_.geom.getLength() * 3.28084;
									console.log(infraLength);
									AppEvents.triggerEvent('hide_infra_draw_mode_indicator')
									DSS.MapState.removeMapInteractions()
									DSS.dialogs.InfraApplyPanel = Ext.create('DSS.infra_shapes.InfraApplyPanel'); 	
									DSS.dialogs.InfraApplyPanel.show().center().setY(100);
									inputInfraObj = e
								})     
							}
						},
						{
							text: 'Delete Infrastructure',
							handler: function(self){
								self.setActiveCounter(0)
								console.log('delete infra mode on')
								AppEvents.triggerEvent('hide_field_draw_mode_indicator')
								selectInfraDelete()
							},
						}
					]
				},
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
			},




// 				{
// 					xtype: 'button',
// 					cls: 'button-text-pad',
// 					componentCls: 'button-margin',
// 					text: 'Field Shapes',
// //					allowDepress:
// 					toggleGroup: 'manage-operation',
// 					toggleHandler: function(self, pressed) {
// 						if (pressed) {
// 							AppEvents.triggerEvent('show_field_shape_mode')
// 							DSS.MapState.removeMapInteractions()
// 							AppEvents.triggerEvent('hide_field_grid')
// 							AppEvents.triggerEvent('hide_infra_grid')
// 						}
// 						else {
// 							AppEvents.triggerEvent('hide_field_shape_mode');
// 							AppEvents.triggerEvent('hide_infra_line_mode');
// 							// use DSS.Inspector.addModeControl() to turn the mode
// 							// back to inspector
// 							DSS.Inspector.addModeControl()
// 							//----------------------------------
// 							DSS.MapState.removeMapInteractions()
// 						}
// 					//	DSS.ApplicationFlow.instance.showNewOperationPage();
// 					}
// 				},
				//-----------------------------------------------------
// 				

//{
// 					xtype: 'button',
// 					cls: 'button-text-pad',
// 					componentCls: 'button-margin',
// 					text: 'Infrastructure Lines',
// //					allowDepress:
// 					toggleGroup: 'manage-operation',
// 					toggleHandler: function(self, pressed) {
// 						if (pressed) {
// 							AppEvents.triggerEvent('show_infra_line_mode')
// 							DSS.MapState.removeMapInteractions()
// 							AppEvents.triggerEvent('hide_field_grid')
// 							AppEvents.triggerEvent('hide_infra_grid')
// 						}
// 						else {
// 							AppEvents.triggerEvent('hide_field_shape_mode');
// 							AppEvents.triggerEvent('hide_infra_line_mode');
// 							// use DSS.Inspector.addModeControl() to turn the mode
// 							// back to inspector
// 							DSS.Inspector.addModeControl()
// 							//----------------------------------
// 							DSS.MapState.removeMapInteractions()
// 						}
// 					}
// 				},
				//------------------------------------------
				{
					xtype: 'component',
					cls: 'information',
					html: 'Edit Scenario Attributes'
				},
				
				// {
				// 	xtype: 'button',
				// 	cls: 'button-text-pad',
				// 	componentCls: 'button-margin',
				// 	text: 'Feed Worksheet',
				// 	handler: function(self) {
				// 		DSS.dialogs.HeiferScapeDialog = Ext.create('DSS.state.scenario.HeiferScapeDialog'); 
				// 		DSS.dialogs.HeiferScapeDialog.setViewModel(DSS.viewModel.scenario);
				// 		pastAcreage = 0
				// 		pastAcreage = 0
				// 		gatherTableData();
				// 		AppEvents.triggerEvent('hide_field_grid')
				// 		AppEvents.triggerEvent('hide_infra_grid')
				// 		AppEvents.triggerEvent('hide_field_shape_mode');
				// 		AppEvents.triggerEvent('hide_infra_line_mode');
				// 		DSS.dialogs.HeiferScapeDialog.show().center().setY(100);
				// 	}
				// },
				// {
				// 	xtype: 'button',
				// 	cls: 'button-text-pad',
				// 	componentCls: 'button-margin',
				// 	text: 'Animals',
				// 	handler: async function(self) {
				// 		//await getWFSScenario()
						
				// 		//if (!DSS.dialogs) DSS.dialogs = {};
				// 		//if (!DSS.dialogs.AnimalDialog) 
				// 		{
				// 			DSS.dialogs.AnimalDialog = Ext.create('DSS.state.scenario.AnimalDialog'); 
				// 			DSS.dialogs.AnimalDialog.setViewModel(DSS.viewModel.scenario);		
				// 		}
				// 		AppEvents.triggerEvent('hide_field_grid')
				// 		AppEvents.triggerEvent('hide_infra_grid')
				// 		AppEvents.triggerEvent('hide_field_shape_mode');
				// 		AppEvents.triggerEvent('hide_infra_line_mode');
				// 		DSS.dialogs.AnimalDialog.show().center().setY(100);
				// 	}
				// }, 
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					toggleGroup: 'create-scenario',
					allowDepress: true,
					text: 'Edit Field Attributes',
					toggleHandler: function(self, pressed) {
						if (pressed) {
							DSS.MapState.destroyLegend();
							//console.log(DSS.field_grid.FieldGrid.getView()); 
							DSS.MapState.removeMapInteractions();
							//Running gatherTableData before showing grid to get latest
							pastAcreage = 0
							cropAcreage = 0
							gatherTableData();
							AppEvents.triggerEvent('show_field_grid');
							AppEvents.triggerEvent('hide_field_shape_mode');
							AppEvents.triggerEvent('hide_infra_line_mode');
						}
						else {
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
							runFieldUpdate()
						}
					}
				},
				//-------------------------------------------------------
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					toggleGroup: 'create-scenario',
					allowDepress: true,
					text: 'Edit Infrastructure Attributes',
					toggleHandler: function(self, pressed) {
						if (pressed) {
							DSS.MapState.destroyLegend();
							DSS.MapState.removeMapInteractions();
							gatherInfraTableData();
							AppEvents.triggerEvent('show_infra_grid');
							AppEvents.triggerEvent('hide_field_shape_mode');
							AppEvents.triggerEvent('hide_infra_line_mode');
						}
						else {
							AppEvents.triggerEvent('hide_field_grid')
							AppEvents.triggerEvent('hide_infra_grid')
							DSS.infrastructure_grid.InfrastructureGrid.store.clearData();
							runInfraUpdate()
							console.log(infraArray);
						}
					}
				},
				//--------------------------------------------------------
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Edit Scenario Costs',
					allowDepress: false,
					handler: function(self) {
					if(Ext.getCmp("CostDialog")){
						DSS.dialogs.CostsDialog = Ext.getCmp("CostDialog").show()
						DSS.dialogs.CostsDialog.setViewModel(DSS.viewModel.scenario);	 				
						DSS.dialogs.CostsDialog.show().center().setY(25);
						console.log("cost dialog destroyed")
					}else{
					// setTimeout(() => {
						DSS.dialogs.CostsDialog = Ext.create('DSS.state.scenario.CostsDialog');
						DSS.dialogs.CostsDialog.setViewModel(DSS.viewModel.scenario);	 				
						DSS.dialogs.CostsDialog.show().center().setY(25);
					}
					//}, 1000);
					}
					
				},
				// {
				// 	xtype: 'button',
				// 	cls: 'button-text-pad',
				// 	componentCls: 'button-margin',
				// 	text: 'run econ model',
				// 	allowDepress: false,
				// 	handler: function(self) {
				// 		//console.log(fieldArray)
				// 		econPact = {
				// 			"fieldCount": fieldArray.length,
				// 			"fieldArray": fieldArray,
				// 			"scenArray": scenarioArray
				// 		}
				// 		console.log(econPact)
				// 		//run econ model calcs
				// 		run_econ_model(econPact)
				// 	}
				// },
				//------------------------------------------
				// {
				// 	xtype: 'button',
				// 	cls: 'button-text-pad',
				// 	componentCls: 'button-margin',
				// 	toggleGroup: 'create-scenario',
				// 	allowDepress: false,
				// 	text: 'Save Edits',
				// 	handler: function() {
				// 		//DSS.layer.scenarios.getSource().refresh();
				// 		runScenarioUpdate();
				// 		runFieldUpdate();
				// 		runInfraUpdate();	
				// 	},
				// },
						
				// {//------------------------------------------
				// 	xtype: 'component',
				// 	height: 32
				// },
				{
					xtype: 'component',
					cls: 'information',
					html: 'Run Models, and View Results'
				},
				// {//------------------------------------------
				// 	xtype: 'component',
				// 	cls: 'information med-text',
				// 	html: 'Run Simulations'
				// },
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					id: "btnRunModels",
					text: 'Run Models',
					disabled:true,
					handler: async function(self) {
						getWFSScenarioSP()
						if(fieldArray.length <1 ){
							gatherTableData();
							console.log("Field Array was empty. Running gatherTableData")
						}
						//DSS.layer.PLossGroup.setVisible(false);
						DSS.layer.erosionGroup.setVisible(false);
						DSS.layer.yieldGroup.setVisible(false);
						DSS.layer.PLossGroup.values_.layers.array_ = [];
						DSS.layer.erosionGroup.values_.layers.array_ = [];
						DSS.layer.yieldGroup.values_.layers.array_ = [];
						console.log("running update")
						fieldChangeList = []
						fieldChangeList = Ext.getCmp("fieldTable").getStore().getUpdatedRecords()
						AppEvents.triggerEvent('hide_field_grid')
						AppEvents.triggerEvent('hide_infra_grid')
						DSS.infrastructure_grid.InfrastructureGrid.store.clearData();
						DSS.field_grid.FieldGrid.store.clearData();
						await runFieldUpdate()
						await runInfraUpdate()
//						cleanDB()
						//DSS.DrawFieldShapes.addModeControl()
						if (DSS['viewModel'].scenario.data != null){
                            console.log("updating scenario data")
						    runScenarioUpdate();
                            console.log("done updating scenario data")
						}
                        Ext.getCmp("btnOpenDashboard").setDisabled(false)

                        Ext.getCmp("btnRunModels").setDisabled(true)
						//Ext.getCmp("btnRemoveModelResults").setDisabled(false)
//                        if dashboard hasnt been opened before
                        if (!Ext.getCmp("dashboardWindow")) {
//                            Ext.getCmp("btnRunModels").setDisabled(true)
                            let dash = Ext.create('DSS.results.Dashboard', {
//                                numberOfLines: 20,
                                runModel:true,
                                // any other option you like...
                            });
//                            DSS.dialogs.Dashboard.setViewModel(DSS.viewModel.scenario);
                            Ext.getCmp("btnRunModels").setText("Rerun Models")
                            Ext.getCmp("dashboardWindow").show().center();
							//Ext.create('DSS.map.OutputMenu').showAt(10,10);
                        }
                        else{
							getWFSScenarioSP()
							console.log("rerunning update")
//                            close model to destroy it to rerun models
                            console.log("destroy dashboard")
                            modelError = false
                            modelErrorMessages = []
                            chartObj = {}
//                            reset global vars
                            //controls order of how datasets are displayed and with what colors
                            chartDatasetContainer = {}
                            //https://personal.sron.nl/~pault/
                            checkBoxScen = []
                            checkBoxField = []
                            hiddenData = {
                                fields:[],
                                scens:[],
                            }
                            scenariosStore = Ext.create('Ext.data.Store', {
                                fields: ['name','dbID'],
                                data : []
                            });
                            Ext.getCmp("dashboardContainer").destroy()
                            Ext.getCmp("dashboardWindow").destroy()
							DSS.MapState.destroyLegend();
							DSS.layer.yieldGroup.setVisible(false);
							DSS.layer.erosionGroup.setVisible(false);
							DSS.layer.runoffGroup.setVisible(false);
							DSS.layer.PLossGroup.setVisible(false);
							DSS.layer.PLossGroup.values_.layers.array_ = [];
							DSS.layer.erosionGroup.values_.layers.array_ = [];
							DSS.layer.yieldGroup.values_.layers.array_ = [];
							DSS.layer.runoffGroup.values_.layers.array_ = [];
                            let dash = Ext.create('DSS.results.Dashboard', {
//                                numberOfLines: 20,

                                runModel:true,
                                // any other option you like...
                            });
//                            DSS.dialogs.Dashboard.setViewModel(DSS.viewModel.scenario);
                            Ext.getCmp("dashboardWindow").show().center();
                        }
					}
				},
				 {
				 	xtype: 'button',
				 	cls: 'button-text-pad',
				 	componentCls: 'button-margin',
				 	text: 'View Results',
				 	id: "btnOpenDashboard",
				 	disabled:true,
//				 	disabled: false,
				 	handler: function(self) {
		                Ext.getCmp("dashboardWindow").show()
						// DSS.MapState.destroyLegend();
            			// DSS.layer.yieldGroup.setVisible(false);
						// DSS.layer.erosionGroup.setVisible(false);
						// DSS.layer.runoffGroup.setVisible(false);
						// DSS.layer.PLossGroup.setVisible(false);
						// DSS.layer.PLossGroup.values_.layers.array_ = [];
						// DSS.layer.erosionGroup.values_.layers.array_ = [];
						// DSS.layer.yieldGroup.values_.layers.array_ = [];
						// DSS.layer.runoffGroup.values_.layers.array_ = [];
				 	}
				 }
				]
			}]
		});
		
		me.callParent(arguments);
		//DSS.Inspector.addModeControl()
		DSS.MapState.disableFieldDraw();
		DSS.draw.setActive(false);
		DSS.modify.setActive(false);
		//DSS.fieldStyleFunction = undefined;	DSS.layer.fields_1.changed();
//        having trouble getting the promise to work. Just using a timeout for now
        setTimeout(() => {
            console.log("calling model setup")
            waitForScen().then(function(value){
                console.log("promise done")
                me.initViewModel();

            })
            }, 1500);
			activateRunModels()
        },
	

	//-----------------------------------------------------------------------------
	initViewModel: function() {
		console.log("IM INSIDE INITVIEWMODEL!!!!!!!")
		// if (DSS && DSS.viewModel && DSS.viewModel.scenario)
		// return;
		
		// if (!DSS['viewModel'])
		console.log("No View Model")
		DSS['viewModel'] = {}
		DSS.dialogs = {}
//		gatherScenarioTableData()
		//console.log('in animal view model')
		//console.log('this is the farms beef cows: ')
		//console.log(scenarioArray[0].beefCows)
		DSS.viewModel.scenario = new Ext.app.ViewModel({
			formulas: {
				tillageValue: { 
					bind: '{tillage.value}',
					get: function(value) { return {tillage: value }; 			},
					set: function(value) { this.set('tillage.value', value); 	}
				}
			},
			data: {
				//percResidualOnPasture: scenarioArray[0].percResidual,
				//pastRotationFreq: scenarioArray[0].pastRotationFreq,
				dairy: {
					// counts
					lactating: scenarioArray[0].lacCows,
					dry: scenarioArray[0].dryCows,
					youngstock: scenarioArray[0].youngStock,
					// milk yield
					dailyYield: scenarioArray[0].aveMilkYield,
					// lactating cows / confinement in months / grazing
					lactatingConfined: scenarioArray[0].lacMonthsConfined,
					lactatingGrazeTime: scenarioArray[0].lacGrazeTime,
					lactatingRotationFreq: scenarioArray[0].lacRotateFreq,
					// non-lactating cows / confinement / grazing
					nonLactatingConfined: scenarioArray[0].dryMonthsConfined,
					nonLactatingGrazeTime: scenarioArray[0].dryGrazeTime,
					nonLactatingRotationFreq: scenarioArray[0].dryRotateFreq,
				},
				beef: {
					cows: scenarioArray[0].beefCows,
					stockers: scenarioArray[0].stockers,
					finishers: scenarioArray[0].finishers,
					// average weight gain
					dailyGain: scenarioArray[0].aveDailyGain,
					// confinement in months / grazing
					confined: scenarioArray[0].beefMonthsConfined,
					grazeTime: scenarioArray[0].beefGrazeTime,
					rotationFreq: scenarioArray[0].beefRotateFreq,
				},
				heifers: {
					heifers: scenarioArray[0].heifers,
					animalsOnPasture: scenarioArray[0].heifersOnPasture,
					breedSize: scenarioArray[0].heiferBreedSize,
					bred: scenarioArray[0].heiferBred,
					tdwg:scenarioArray[0].heiferTDWG,
					asw:scenarioArray[0].heiferASW,
					daysOnPasture:scenarioArray[0].heiferDaysOnPasture,
					forageFromPasturePerHeadDay:scenarioArray[0].heiferFeedFromPasturePerHeadDay,
					forageFromPasturePerDayHerd:scenarioArray[0].heiferFeedFromPasturePerDayHerd,
					dmiDemandPerSeason:scenarioArray[0].heiferDMIDemandPerSeason,
				},
				acreage: {
					pasture:scenarioArray[0].pasture_acreage,
					crop:scenarioArray[0].crop_acreage
				},
				costs:{
					fertPCost: scenarioArray[0].fertPCost,
					fertNCost: scenarioArray[0].fertNCost,
					cornSeedCost: scenarioArray[0].cornSeedCost,
					cornPestCost: scenarioArray[0].cornPestCost,
					cornMachCost: scenarioArray[0].cornMachCost,
					soySeedCost: scenarioArray[0].soySeedCost,
					soyPestCost: scenarioArray[0].soyPestCost,
					soyMachCost: scenarioArray[0].soyMachCost,
					grassSeedCost: scenarioArray[0].grassSeedCost,
					grassPestCost: scenarioArray[0].grassPestCost,
					grassMachCost: scenarioArray[0].grassMachCost,
					oatSeedCost: scenarioArray[0].oatSeedCost,
					oatPestCost: scenarioArray[0].oatPestCost,
					oatMachCost: scenarioArray[0].oatMachCost,
					alfalfaSeedCost: scenarioArray[0].alfalfaSeedCost,
					alfalfaPestCost: scenarioArray[0].alfalfaPestCost,
					alfalfaMachCost: scenarioArray[0].alfalfaMachCost,
					alfalfaMachYearOneCost: scenarioArray[0].alfalfaMachYearOneCost,
				}
			}
		})
		//console.log(DSS['viewModel'].scenario.data.dairy.dry);
	}
});

