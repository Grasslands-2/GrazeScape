var farmArray = [];
var farmObj = {};

farmUrl = 'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
'service=wfs&'+
'?version=2.0.0&'+
'request=GetFeature&'+
'typeName=GrazeScape_Vector:farm_1&' +
'outputformat=application/json&'+
'srsname=EPSG:3857';

var farms_1Source = new ol.source.Vector({
	format: new ol.format.GeoJSON(),
	url: farmUrl
});
var farms_1Layer = new ol.layer.Vector({
	title: 'fields_1',
	source: farms_1Source
});

function getWFSfarm() {
    console.log("getting wfs farms")
	return $.ajax({
		jsonp: false,
		type: 'GET',
		url: farmUrl,
		async: false,
		dataType: 'json',
		success:function(response)
		{
			responseObj = response
			farmObj = response.features
			console.log(responseObj);
			farmArray = [];
			console.log(farmObj[0]);
			popfarmArray(farmObj);
			//placed data store in call function to make sure it was locally available.	
			/*Ext.create('Ext.data.Store', {
				storeId: 'farmStore1',
				alternateClassName: 'DSS.farmStore',
				fields:['name','farmType','farmTypeDisp','fenceMaterial','fenceMaterialDisp','waterPipe',
				'waterPipeDisp','laneMaterial','laneMaterialDisp', 'costPerFoot','laneWidth','totalCost'],
				data: farmArray
			});
			//Setting store to just declared store fieldStore1, and reloading the store to the grid
			DSS.farmstructure_grid.farmstructureGrid.setStore(Ext.data.StoreManager.lookup('farmStore1'));
			DSS.farmstructure_grid.farmstructureGrid.store.reload();*/
			console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			console.log(response);
			//console.log('DSS.farmstructure_grid.farmstructureGrid')
			//console.log(DSS.farmstructure_grid.farmstructureGrid);
		}
	})
}

function popfarmArray(obj) {

	for (i in obj)
	//console.log(i);
	farmArray.push({
		id: obj[i].id,
		name: obj[i].properties.farm_name,
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
		beefRotateFreq: obj[i].properties.beef_rotate_freq,
	});
	//DSS.farmstructure_grid.farmstructureGrid.store.reload(farmArray);
}

function gatherfarmTableData() {
	//redeclaring farmUrl to only show filtered fields
	farmUrl = 
	'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:farm_1&' +
	'CQL_filter=gid='+DSS.activeFarm+'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';
	//--------------------------------------------
	getWFSfarm();
	console.log("gatherTableData for farms ran");
	console.log(farmArray);
};

var infrastructure_Source = new ol.source.Vector({
	url: 'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:Infrastructure&' +
	'outputformat=application/json&'+
	'srsname=EPSG:3857',
	format: new ol.format.GeoJSON()
});

var fields_1Source = new ol.source.Vector({
	url:/*'http://localhost:8081/geoserver/wfs?'+
		'service=wfs&'+
		'?version=2.0.0&'+
		'request=GetFeature&'+
		'typeName=Farms:field_1&' +
		'outputformat=application/json&'+
		'srsname=EPSG:3857'*/
		'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
		'service=wfs&'+
		'?version=2.0.0&'+
		'request=GetFeature&'+
		'typeName=GrazeScape_Vector:field_1&' +
		'outputformat=application/json&'+
		'srsname=EPSG:3857',
	format: new ol.format.GeoJSON()
});
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
					owner_id: infraArray[i].owningFarmid,
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
				wfs_update(infraFeature,'Infrastructure');
				break;
			}				
		}				
	})
};
function runFieldUpdate(){
	DSS.layer.fields_1.getSource().forEachFeature(function(f) {
		var feildFeature = f;
		console.log("from fields_1 loop through: " + feildFeature.id_);
		for (i in fieldArray){
			console.log("Fieldarray id: " +fieldArray[i].id);
			if(fieldArray[i].id === feildFeature.id_){
				console.log(fieldArray[i].name);
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
					interseededclover: fieldArray[i].interseededClover,
					grazingdensityval: fieldArray[i].grazeDensityVal,
					area: fieldArray[i].area,
					perimeter: fieldArray[i].perimeter,
					fence_type: fieldArray[i].fence_type,
					fence_cost: fieldArray[i].fence_cost,
					fence_unit_cost: fieldArray[i].fence_unit_cost
				});
				wfs_update(feildFeature,'field_1');
				break;
			}				
		}				
	})
};
function runFarmUpdate(){
	console.log(DSS['viewModel'].scenario.data.dairy.dry);
	DSS.layer.farms_1.getSource().forEachFeature(function(f) {
		var farmFeature = f;
		console.log("from farm loop through: " + farmFeature.id_);
		for (i in farmArray){
			console.log("farmArray id: " +farmArray[i].id);
			if(farmArray[i].id === farmFeature.id_){
				console.log(farmArray[i].name);
				farmFeature.setProperties({
					lac_cows: DSS['viewModel'].scenario.data.dairy.lactating,
					dry_cows: DSS['viewModel'].scenario.data.dairy.dry,
					heifers: DSS['viewModel'].scenario.data.dairy.heifers,
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
					beef_rotate_freq: DSS['viewModel'].scenario.data.beef.rotationFreq,
				});
				wfs_update(farmFeature,'farm_1');
				break;
			}				
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
    }).done();
}

//------------------------------------------------------------------------------
Ext.define('DSS.state.Scenario', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
    alternateClassName: 'DSS.StateScenario',
	alias: 'widget.state_scenario',

	requires: [
		'DSS.state.scenario.CropNutrientMode',
		'DSS.state.scenario.AnimalDialog',
		'DSS.state.scenario.PerimeterDialog'
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
								click: function(self) {
									runFarmUpdate();
									DSS.ApplicationFlow.instance.showManageOperationPage();
								}
							});
						}
					}					
				},{
					xtype: 'component',
					flex: 1,
					cls: 'section-title accent-text right-pad',
					// TODO: Dynamic name...
					html: '"Baseline"'
				}]
			},{ 
				xtype: 'container',
				layout: DSS.utils.layout('vbox', 'center', 'stretch'),
				items: [{//------------------------------------------
					xtype: 'component',
					cls: 'information med-text',
					html: 'Configure animals and grazing'
				},{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Animals',
					handler: function(self) {
						
						//if (!DSS.dialogs) DSS.dialogs = {};
						//if (!DSS.dialogs.AnimalDialog) 
						{
							DSS.dialogs.AnimalDialog = Ext.create('DSS.state.scenario.AnimalDialog'); 
							DSS.dialogs.AnimalDialog.setViewModel(DSS.viewModel.scenario);		

						}
						DSS.dialogs.AnimalDialog.show().center().setY(0);
					}
				},{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Fencing Calculator',
					handler: function(self) {
						if (!DSS.dialogs) DSS.dialogs = {};
						if (!DSS.dialogs.PerimeterDialog) {
							DSS.dialogs.PerimeterDialog = Ext.create('DSS.state.scenario.PerimeterDialog');
							DSS.dialogs.PerimeterDialog.setViewModel(DSS.viewModel.scenario);

						}
						DSS.dialogs.PerimeterDialog.show().center().setY(0);
					}
				},{//------------------------------------------
					xtype: 'component',
					cls: 'information med-text',
					html: 'Assign crops and nutrients'
				},{
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
							gatherTableData();
							AppEvents.triggerEvent('show_field_grid');
						}
						else {
							AppEvents.triggerEvent('hide_field_grid')
							DSS.field_grid.FieldGrid.store.clearData();
							runFieldUpdate()
							console.log(fieldArray);
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
						}
						else {
							AppEvents.triggerEvent('hide_infra_grid')
							DSS.infrastructure_grid.InfrastructureGrid.store.clearData();
							runInfraUpdate()
							console.log(fieldArray);
						}
					}
				},
				//------------------------------------------
				{
					xtype: 'component',
					cls: 'information med-text',
					html: 'Update Field Data'
				},{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					toggleGroup: 'create-scenario',
					allowDepress: false,
					text: 'Update Attributes',
					handler: function() {
						runFieldUpdate();
						runInfraUpdate();
						runFarmUpdate();
					},
				},
						
				{//------------------------------------------
					xtype: 'component',
					height: 32
				},{//------------------------------------------
					xtype: 'component',
					cls: 'information med-text',
					html: 'Run simulations'
				},{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Run Models',
					handler: function(self) {
						console.log("compute hi")
						//DSS.DrawFieldShapes.addModeControl()
						DSS.ModelRunTools.addModeControl()
						console.log()
						runFarmUpdate();
					}
				}]
			}]
		});
		
		me.callParent(arguments);
		DSS.Inspector.addModeControl()
		DSS.MapState.disableFieldDraw();
		DSS.draw.setActive(false);
		DSS.modify.setActive(false);
		DSS.fieldStyleFunction = undefined;	DSS.layer.fields_1.changed();

		me.initViewModel();
	},
	
	
	//-----------------------------------------------------------------------------
	initViewModel: function() {
		//gatherfarmTableData()
		/*if (DSS && DSS.viewModel && DSS.viewModel.scenario)
		return;
		
		if (!DSS['viewModel'])*/ 
		DSS['viewModel'] = {}
		DSS.dialogs = {}
		gatherfarmTableData()
		console.log('in animal view model')
		console.log('this is the farms beef cows: ')
		console.log(farmArray[0].beefCows)
		DSS.viewModel.scenario = new Ext.app.ViewModel({
			formulas: {
				tillageValue: { 
					bind: '{tillage.value}',
					get: function(value) { return {tillage: value }; 			},
					set: function(value) { this.set('tillage.value', value); 	}
				}
			},
			data: {
				dairy: {
					// counts
					lactating: farmArray[0].lacCows,
					dry: farmArray[0].dryCows,
					heifers: farmArray[0].heifers,
					youngstock: farmArray[0].youngStock,
					// milk yield
					dailyYield: farmArray[0].aveMilkYield,
					// lactating cows / confinement in months / grazing
					lactatingConfined: farmArray[0].lacMonthsConfined,
					lactatingGrazeTime: farmArray[0].lacGrazeTime,
					lactatingRotationFreq: farmArray[0].lacRotateFreq,
					// non-lactating cows / confinement / grazing
					nonLactatingConfined: farmArray[0].dryMonthsConfined,
					nonLactatingGrazeTime: farmArray[0].dryGrazeTime,
					nonLactatingRotationFreq: farmArray[0].dryRotateFreq,
				},
				beef: {
					cows: farmArray[0].beefCows,
					stockers: farmArray[0].stockers,
					finishers: farmArray[0].finishers,
					// average weight gain
					dailyGain: farmArray[0].aveDailyGain,
					// confinement in months / grazing
					confined: farmArray[0].beefMonthsConfined,
					grazeTime: farmArray[0].beefGrazeTime,
					rotationFreq: farmArray[0].beefRotateFreq,
				}
			}
		})
		//console.log(DSS['viewModel'].scenario.data.dairy.dry);
	}
});

