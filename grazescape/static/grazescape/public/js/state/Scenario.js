var farmArray = [];
var farmObj = {};
var scenarioArray = [];
var scenarioObj = {};
var pastAcreage = 0
var cropAcreage = 0
//scenarioUrl = geoserverURL + '/geoserver/wfs?'+
//'service=wfs&'+
//'?version=2.0.0&'+
//'request=GetFeature&'+
//'typeName=GrazeScape_Vector:scenarios_2&' +
////'CQL_filter=scenario_id='+DSS.activeScenario+'&'+
//'outputformat=application/json&'+
//'srsname=EPSG:3857';
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
		heiferDMIDemandPerSeason: obj[i].properties.heifer_dmi_demand_per_season
	});
	console.log("gatherTableData for scenarios ran");
	console.log(scenarioArray);
}

function getWFSScenario() {
        geoServer.getWFSScenario('&CQL_filter=scenario_id='+DSS.activeScenario)

}

function gatherScenarioTableData() {
	getWFSScenario();
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
    let changedFieldsList = []
    for (field in fieldChangeList){
        changedFieldsList.push(fieldChangeList[field].id)
    }
    console.log(changedFieldsList)
	DSS.layer.fields_1.getSource().forEachFeature(function(f) {
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
					fertilizerpercent:fieldArray[i].fertPerc,
					manurepercent: fieldArray[i].manuPerc,
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
				});
				wfs_update(feildFeature,'field_2');
				break;
			}				
		}				
	})
};
async function runScenarioUpdate(){
	aswValue = 0
	await aswCheck(DSS['viewModel'].scenario.data.heifers.breedSize,
	DSS['viewModel'].scenario.data.heifers.asw)
	//reSourcescenarios()
	DSS.layer.scenarios.getSource().getFeatures().forEach(function(f) {
		var scenarioFeature = f;
		if(DSS.activeScenario === scenarioFeature.values_.scenario_id){
			//console.log(scenarioArray[i].scenarioName);
			console.log(scenarioArray[i]);
			scenarioFeature.setProperties({
				lac_cows: DSS['viewModel'].scenario.data.dairy.lactating,
				dry_cows: DSS['viewModel'].scenario.data.dairy.dry,
				youngstock: DSS['viewModel'].scenario.data.dairy.youngstock,
				beef_cows: DSS['viewModel'].scenario.data.beef.cows,
				stockers: DSS['viewModel'].scenario.data.beef.stockers,
				finishers: DSS['viewModel'].scenario.data.beef.finishers,
				ave_milk_yield: DSS['viewModel'].scenario.data.dairy.dailyYield,
				lac_confined_mos: DSS['viewModel'].scenario.data.dairy.lactatingConfined,
				dry_confined_mos: DSS['viewModel'].scenario.data.dairy.nonLactatingConfined,
				beef_confined_mos: DSS['viewModel'].scenario.data.beef.confined,
				lac_graze_time: DSS['viewModel'].scenario.data.dairy.lactatingGrazeTime,
				dry_graze_time: DSS['viewModel'].scenario.data.dairy.nonLactatingGrazeTime,
				beef_graze_time: DSS['viewModel'].scenario.data.beef.grazeTime,
				lac_rotate_freq: DSS['viewModel'].scenario.data.dairy.lactatingRotationFreq,
				dry_rotate_freq: DSS['viewModel'].scenario.data.dairy.nonLactatingRotationFreq,
				perc_residual_on_pasture: DSS['viewModel'].scenario.data.percResidualOnPasture,
				beef_rotate_freq: DSS['viewModel'].scenario.data.beef.rotationFreq,
				heifers_on_pasture: DSS['viewModel'].scenario.data.heifers.rotationFreqVal,
				pasture_acreage: DSS['viewModel'].scenario.data.acreage.pasture,
				crop_acreage: DSS['viewModel'].scenario.data.acreage.crop,
				pasture_rot_freq: DSS['viewModel'].scenario.data.pastRotationFreq,
				heifers: DSS['viewModel'].scenario.data.heifers.heifers,
				heifer_breed_size: DSS['viewModel'].scenario.data.heifers.breedSize,
				heifer_bred_unbred: DSS['viewModel'].scenario.data.heifers.bred,
				heifer_target_weight_gain: DSS['viewModel'].scenario.data.heifers.tdwg,
				heifer_starting_weight: aswValue,
				heifer_days_on_pasture: DSS['viewModel'].scenario.data.heifers.daysOnPasture,
				heifer_feed_from_pasture_per_head_day: DSS['viewModel'].scenario.data.heifers.forageFromPasturePerHeadDay,
				heifer_feed_from_pasture_per_herd_day: DSS['viewModel'].scenario.data.heifers.forageFromPasturePerDayHerd,
				heifer_dmi_demand_per_season: DSS['viewModel'].scenario.data.heifers.dmiDemandPerSeason,
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
		Geom: 'geom',
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
//    console.log(str);
    geoServer.updateFieldAtt(str,feat )
//    $.ajax(geoserverURL + '/geoserver/wfs?'
//	/*'http://localhost:8081/geoserver/wfs?'*/,{
//        type: 'POST',
//        dataType: 'xml',
//        processData: false,
//        contentType: 'text/xml',
//		data: str,
//		success: function (data) {
//			console.log("uploaded data successfully!: "+ data);
//		},
//        error: function (xhr, exception) {
//            var msg = "";
//            if (xhr.status === 0) {
//                msg = "Not connect.\n Verify Network." + xhr.responseText;
//            } else if (xhr.status == 404) {
//                msg = "Requested page not found. [404]" + xhr.responseText;
//            } else if (xhr.status == 500) {
//                msg = "Internal Server Error [500]." +  xhr.responseText;
//            } else if (exception === "parsererror") {
//                msg = "Requested JSON parse failed.";
//            } else if (exception === "timeout") {
//                msg = "Time out error." + xhr.responseText;
//            } else if (exception === "abort") {
//                msg = "Ajax request aborted.";
//            } else {
//                msg = "Error:" + xhr.status + " " + xhr.responseText;
//            }
//			console.log(msg);
//        }
//    }).done();
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
		'DSS.state.operation.InfraShapeMode',
		'DSS.state.operation.FieldShapeMode'
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
									gatherScenarioTableData
									runScenarioUpdate();
									geoServer.getWFSScenario('&CQL_filter=scenario_id='+DSS.activeScenario)
									DSS.ApplicationFlow.instance.showManageOperationPage();
									//resetting model result layers
									DSS.layer.PLossGroup.setVisible(false);
									DSS.layer.PLossGroup.values_.layers.array_ = [];
									console.log(DSS.layer.PLossGroup);
								}
							});
						}
					}					
				},{
					xtype: 'component',
					flex: 1,
					cls: 'section-title accent-text right-pad',
					// TODO: Dynamic name...
					html: 'Scenario Management'
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
				},{//------------------------------------------
					xtype: 'component',
					cls: 'information med-text',
					html: 'Edit Fields and Infrastructure'
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Field Shapes',
//					allowDepress:
					toggleGroup: 'manage-operation',
					toggleHandler: function(self, pressed) {
						if (pressed) {
							AppEvents.triggerEvent('show_field_shape_mode')
							DSS.MapState.removeMapInteractions()
							AppEvents.triggerEvent('hide_field_grid')
							AppEvents.triggerEvent('hide_infra_grid')
						}
						else {
							AppEvents.triggerEvent('hide_field_shape_mode');
							AppEvents.triggerEvent('hide_infra_line_mode');
							// use DSS.Inspector.addModeControl() to turn the mode
							// back to inspector
							DSS.Inspector.addModeControl()
							//----------------------------------
							DSS.MapState.removeMapInteractions()
						}
					//	DSS.ApplicationFlow.instance.showNewOperationPage();
					}
				},
				//-----------------------------------------------------
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Infrastructure Lines',
//					allowDepress:
					toggleGroup: 'manage-operation',
					toggleHandler: function(self, pressed) {
						if (pressed) {
							AppEvents.triggerEvent('show_infra_line_mode')
							DSS.MapState.removeMapInteractions()
							AppEvents.triggerEvent('hide_field_grid')
							AppEvents.triggerEvent('hide_infra_grid')
						}
						else {
							AppEvents.triggerEvent('hide_field_shape_mode');
							AppEvents.triggerEvent('hide_infra_line_mode');
							// use DSS.Inspector.addModeControl() to turn the mode
							// back to inspector
							DSS.Inspector.addModeControl()
							//----------------------------------
							DSS.MapState.removeMapInteractions()
						}
					}
				},
				{//------------------------------------------
					xtype: 'component',
					cls: 'information med-text',
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
				// 		DSS.dialogs.HeiferScapeDialog.show().center().setY(0);
				// 	}
				// },
				// {
				// 	xtype: 'button',
				// 	cls: 'button-text-pad',
				// 	componentCls: 'button-margin',
				// 	text: 'Animals',
				// 	handler: async function(self) {
				// 		await getWFSScenario()
						
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
				// 		DSS.dialogs.AnimalDialog.show().center().setY(0);
				// 	}
				// },
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					toggleGroup: 'create-scenario',
					allowDepress: true,
					text: 'Field Attributes',
					toggleHandler: function(self, pressed) {
						if (pressed) {
							//console.log(DSS.field_grid.FieldGrid.getView()); 
							DSS.MapState.removeMapInteractions();
							//Running gatherTableData before showing grid to get latest
							pastAcreage = 0
							pastAcreage = 0
							gatherTableData();
							AppEvents.triggerEvent('show_field_grid');
							AppEvents.triggerEvent('hide_field_shape_mode');
							AppEvents.triggerEvent('hide_infra_line_mode');
						}
						else {
						    console.log("running update")
						    fieldChangeList = []
						    fieldChangeList = Ext.getCmp("fieldTable").getStore().getUpdatedRecords()

							AppEvents.triggerEvent('hide_field_grid')
							AppEvents.triggerEvent('hide_infra_grid')
							DSS.field_grid.FieldGrid.store.clearData();
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
					text: 'Infrastructure Attributes',
					toggleHandler: function(self, pressed) {
						if (pressed) {
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
				//------------------------------------------
				,{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					toggleGroup: 'create-scenario',
					allowDepress: false,
					text: 'Save Edits',
					handler: function() {
						//DSS.layer.scenarios.getSource().refresh();
						runScenarioUpdate();
						runFieldUpdate();
						runInfraUpdate();	
					},
				},
						
				{//------------------------------------------
					xtype: 'component',
					height: 32
				},{//------------------------------------------
					xtype: 'component',
					cls: 'information med-text',
					html: 'Run Simulations'
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					id: "btnRunModels",
					text: 'Run Models',
					handler: function(self) {
//						cleanDB()
						//DSS.DrawFieldShapes.addModeControl()
						console.log()
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
                            demResultsLayers =[]
                            Ext.getCmp("dashboardContainer").destroy()
                            Ext.getCmp("dashboardWindow").destroy()
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
				// {
				// 	xtype: 'button',
				// 	cls: 'button-text-pad',
				// 	componentCls: 'button-margin',
				// 	id: "btnRemoveModelResults",
				// 	disabled:true,
				// 	text: 'Remove Model Results',
				// 	handler: function(self) {
				// 		removeModelResults()
				// 		// DSS.map.removeLayer(modelResult)
				// 		// Ext.getCmp("btnRemoveModelResults").setDisabled(true)
				// 	}
				// }
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

				 	}
				 }
				]
			}]
		});
		
		me.callParent(arguments);
		DSS.Inspector.addModeControl()
		DSS.MapState.disableFieldDraw();
		DSS.draw.setActive(false);
		DSS.modify.setActive(false);
		DSS.fieldStyleFunction = undefined;	DSS.layer.fields_1.changed();
//        having trouble getting the promise to work. Just using a timeout for now
        setTimeout(() => {
            console.log("calling model setup")
            waitForScen().then(function(value){
                console.log("promise done")
                me.initViewModel();

            })
            }, 500);
        },
	

	//-----------------------------------------------------------------------------
	initViewModel: function() {
		/*if (DSS && DSS.viewModel && DSS.viewModel.scenario)
		return;
		
		if (!DSS['viewModel'])*/ 
		DSS['viewModel'] = {}
		DSS.dialogs = {}
//		gatherScenarioTableData()
		console.log('in animal view model')
		console.log('this is the farms beef cows: ')
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
				percResidualOnPasture: scenarioArray[0].percResidual,
				pastRotationFreq: scenarioArray[0].pastRotationFreq,
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
				}
			}
		})
		//console.log(DSS['viewModel'].scenario.data.dairy.dry);
	}
});

