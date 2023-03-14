var barLabels = []
modelResult = {}
var mfieldID = ''
var modelError = false
var modelErrorMessages = []
var yieldmodelsDataArray = []
var pmanureReturn_array = []
//gathers data for each model run. called in model type switch statments
function gatherArrayForYieldAdjustment(mdobj) {
    yieldmodelsDataArray.push({
        area: mdobj.area,
        cells: mdobj.counted_cells,
        cropRo: mdobj.crop_ro,
        fieldName: mdobj.f_name,
        fieldId: mdobj.field_id,
        grassRo: mdobj.grass_ro,
        scenario: mdobj.scen,
        scenarioId: mdobj.scen_id,
        units:mdobj.units,
        till: mdobj.till,
        altUnits: mdobj.units_alternate,
        yieldType: mdobj.value_type
    })
}
function populateChartObj(scenList, fieldList, allField, allScen){
// need to get a list of scenarios here
//    list of every chart currently in app
    for (chart in chartList){
        chartName = chartList[chart]
        console.log(chartName)
        if(chartName.includes('field')){
            node = new ChartData()
            node.chartData =  {
                labels : scenList,
                datasets: [],
                chartDataOri:[],
                chartDataLabelsOri:[],
            }
            for (let field in fieldList){
                data1 = {
                    label: fieldList[field],
                    dbID: allField[field].dbID,
                    // each data entry represents a scenario
                    data: new Array(scenList.length).fill(null),
                    hidden:false,
                    backgroundColor:  allField[field].color.opa,
//                    backgroundColor:  chartColors[field % chartDatasetContainer.colorLength].opa,
                    minBarLength: 7,
                    toolTip:new Array(scenList.length).fill(null),
                }
                node.chartData.datasets[field] = data1
                node.chartData.chartDataLabelsOri = scenList

                node.chartData.chartDataOri.push([])
            }
        }
        else {
            node = new ChartData()
            if(chartName.includes('runoff_farm')){
//            hard coding the runoff values for now
                node.chartData =  {
                    labels : [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6],
                    datasets: [],
                    toolTip:[]
                }
                 for (let scen in scenList){
                    node.sum[scen] = [0];
                }

            }
            else{
                node.chartData =  {
                    labels : ['Scenarios'],
                    datasets: [],
                    toolTip:[]
                }
            }

            for (let scen in scenList){
                data1 = {
                    label: scenList[scen],
                    dbID: allScen[scen].dbID,
                    compareData: [],
                    // each data entry represents a scenario
                    data: new Array(scenList.length).fill(null),
                    backgroundColor:  allScen[scen].color.opa,
//                    backgroundColor:  chartColors[scen % chartDatasetContainer.colorLength].opa,
                    borderColor: allScen[scen].color.opa,
//                    borderColor: chartColors[scen % chartDatasetContainer.colorLength].opa,
                    minBarLength: 7
                }
                node.chartData.datasets[scen] = data1
                node.chartData.chartDataLabelsOri = ['Scenarios']
                node.fieldSum[scen] = []
                node.areaSum[scen] = []
            }
            node.chartData.chartDataOri = new Array(scenList.length).fill(null)
        }
        chartObj[chartName] = node
        chartObj[chartName].chart = null
        chartObj[chartName].show = false
    }
}

function build_model_request(f, geometry, modelChoice,modelruntime,activeScenario,pManureResults){
    //Try building in a way to get the scenario specific costs data from each fields scenario.
    let runModel = false
    if(f["is_dirty"] == true){
        runModel = true
    }

    let rotation_split = f["rotation"].split("-")
    crop = rotation_split[0]
    rotation = rotation_split.length > 1 ?rotation_split[1]:null
    let density = f["grazingdensityval"]
    let graze_factor = 1
    if (rotation == "cn"){
        graze_factor = 0.65
    }
    else if (rotation == "rt" ){
        graze_factor = parseFloat(f["rotational_freq_val"])
        density = "na"
    }
    model_para = {
        f_name: f["field_name"],
        extent: geometry.bbox,
        field_coors: geometry.geometry.coordinates[0],
        grass_type: f["grass_speciesval"],
        contour: parseInt(f["on_contour"]?1:0),
        soil_p: parseFloat(f["soil_p"]),
        tillage: f["tillage"],
        fert: parseFloat(f["perc_fert_p"]),
        manure: parseFloat(f["perc_manure_p"]),
        fert_n: parseFloat(f["perc_fert_n"]),
        manure_n: parseFloat(f["perc_manure_n"]),
        // crop:crop,
        crop:crop,
        area:parseFloat(f["area"]),
        om: parseFloat(f["om"]),
        crop_cover: f["cover_crop"],
//			doesn't appear to be in the table at this time
        rotation: rotation,
        rotationFreq:"",
        density: density,
//      comes from the the looping var in Dashboard.js
        model_type: modelChoice,
        graze_factor:graze_factor,
        scen: chartDatasetContainer.getScenName(f["scenario_id"]),
        model_run_timestamp: modelruntimeOrig,
        active_scen: activeScenario,
        f_scen: f["scenario_id"],
        land_area: f["area"],
        land_cost: f["land_cost"],
        fert_p_perc:f["perc_fert_p"],
        fert_n_perc:f["perc_fert_n"],
        manure_p_perc:f["perc_manure_p"],
        manure_n_perc:f["perc_manure_n"],
        legume:f["interseeded_clover"],
        active_region: DSS.activeRegion,
        pManureResults: pManureResults,
        //pMcellData: [pMcellData],
        alfalfaMachCost: 0,
        alfalfaMachCostY1: 0,
        alfalfaPestCost: 0,
        alfalfaSeedCost: 0,
        cornMachCost: 0,
        cornPestCost: 0,
        cornSeedCost: 0,
        grassMachCost: 0,
        grassPestCost: 0,
        grassSeedCost: 0,
        oatMachCost: 0,
        oatPestCost: 0,
        oatSeedCost: 0,
        soyMachCost: 0,
        soyPestCost: 0,
        soySeedCost: 0,
        fertNCost: 0,
        fertPCost: 0,
    }
    for(s in scenDupArray){
        if(scenDupArray[s].gid == model_para.f_scen){
            model_para.alfalfaMachCost = scenDupArray[s].alfalfa_mach_cost
            model_para.alfalfaMachCostY1 = scenDupArray[s].alfalfa_mach_year_one
            model_para.alfalfaPestCost = scenDupArray[s].alfalfa_pest_cost
            model_para.alfalfaSeedCost = scenDupArray[s].alfalfa_seed_cost
            model_para.cornMachCost = scenDupArray[s].corn_mach_cost
            model_para.cornPestCost = scenDupArray[s].corn_pest_cost
            model_para.cornSeedCost = scenDupArray[s].corn_seed_cost
            model_para.grassMachCost = scenDupArray[s].grass_mach_cost
            model_para.grassPestCost = scenDupArray[s].grass_pest_cost
            model_para.grassSeedCost = scenDupArray[s].grass_seed_cost
            model_para.oatMachCost = scenDupArray[s].oat_mach_cost
            model_para.oatPestCost = scenDupArray[s].oat_pest_cost
            model_para.oatSeedCost = scenDupArray[s].oat_seed_cost
            model_para.soyMachCost = scenDupArray[s].soy_mach_cost
            model_para.soyPestCost = scenDupArray[s].soy_pest_cost
            model_para.soySeedCost = scenDupArray[s].soy_seed_cost
            model_para.fertNCost = scenDupArray[s].fert_n_cost
            model_para.fertPCost = scenDupArray[s].fert_p_cost
        }
    }
    model_pack = {
        "farm_id": DSS.activeFarm,
        field_id: f["gid"],
        "scenario_id": f["scenario_id"],
        "runModels": runModel,
        "model_parameters":model_para,
        "pManureResults": pManureResults
    }
    return model_pack
}


function format_chart_data(model_data){
    if(typeof model_data.f_name === "undefined" || typeof model_data.scen === "undefined"){
        return
    }
    if(model_data.counted_cells == undefined){
        return
    }
    let fieldIndex = chartDatasetContainer.indexField(model_data.field_id)
    let scenIndex = chartDatasetContainer.indexScenario(model_data.scen_id)
    chartTypeField = null
    chartTypeFarm = null
    if (fieldIndex == undefined || scenIndex == undefined){
        console.log("data is not part of a valid field or scenario")
        return
    }
    //setting up each model run
    modelTypeString = model_data.value_type +'_'+ model_data.crop_ro
    console.log("value type ", model_data.value_type)
    switch (model_data.model_type) {
        case 'yield':
            switch (model_data.value_type){
            case 'Grass':
                chartTypeField = chartObj.grass_yield_field
                chartTypeFarm = chartObj.grass_yield_farm
                if(model_data.scen_id == DSS.activeScenario){
                    gatherArrayForYieldAdjustment(model_data)
                }
                break
            case 'Dry Lot':
//                chartTypeField = chartObj.grass_yield_field
//                chartTypeFarm = chartObj.grass_yield_farm
//                if(model_data.scen_id == DSS.activeScenario){
//                    gatherArrayForYieldAdjustment(model_data)
//                }
                break
            case 'Corn Grain':
                chartTypeField = chartObj.corn_yield_field
                chartTypeFarm = chartObj.corn_yield_farm
                if(model_data.scen_id == DSS.activeScenario){
                    gatherArrayForYieldAdjustment(model_data)
                }
                break
            case 'Corn Silage':
                chartTypeField = chartObj.corn_silage_yield_field
                chartTypeFarm = chartObj.corn_silage_yield_farm
                if(model_data.scen_id == DSS.activeScenario){
                    gatherArrayForYieldAdjustment(model_data)
                }
                break
            case 'Soy':
                chartTypeField = chartObj.soy_yield_field
                chartTypeFarm = chartObj.soy_yield_farm
                if(model_data.scen_id == DSS.activeScenario){
                    gatherArrayForYieldAdjustment(model_data)
                }
                break
            case 'Alfalfa':
                chartTypeField = chartObj.alfalfa_yield_field
                chartTypeFarm = chartObj.alfalfa_yield_farm
                if(model_data.scen_id == DSS.activeScenario){
                    gatherArrayForYieldAdjustment(model_data)
                }
                break
            case 'Oats':
                chartTypeField = chartObj.oat_yield_field
                chartTypeFarm = chartObj.oat_yield_farm
                if(model_data.scen_id == DSS.activeScenario){
                    gatherArrayForYieldAdjustment(model_data)
                }
                break
            case 'Rotational Average':
                chartTypeField = chartObj.rotation_yield_field
                chartTypeFarm = chartObj.rotation_yield_farm
                if(model_data.scen_id == DSS.activeScenario){
                    gatherArrayForYieldAdjustment(model_data)
                }
                break
            case 'insect':
                chartTypeField = chartObj.insecticide_field
                chartTypeFarm = chartObj.insecticide_farm
                break
            case 'econ':
                chartTypeField = chartObj.econ_field
                chartTypeFarm = chartObj.econ_farm
                break
            case 'feed breakdown':
                chartTypeField = chartObj.feed_breakdown
            case 'nitrate':
                chartTypeField = chartObj.nleaching_field
                chartTypeFarm = chartObj.nleaching_farm
                break
            case 'ploss':
            
                chartTypeField = chartObj.ploss_field
                chartTypeFarm = chartObj.ploss_farm
                if(model_data.scen_id == DSS.activeScenario){
                    console.log(model_data.extent)
                    if(model_data.extent !== undefined){
                        DSS.plossBol = false
                        var plextent = model_data.extent
                        DSS.layer.ploss_field = new ol.layer.Image({
                            visible: false,
                            source: new ol.source.ImageStatic({
                            url: '/static/grazescape/public/images/ploss'+ model_data.field_id + '.png',
                            imageExtent: plextent
                            })
                        })
                        DSS.layer.ploss_field.set('name', 'ploss'+ model_data.field_id);
                    }
                }
                break
            case 'ero':
                chartTypeField = chartObj.soil_loss_field
                chartTypeFarm = chartObj.soil_loss_farm
                if(model_data.scen_id == DSS.activeScenario){
                    if(model_data.extent !== undefined){
                        DSS.eroBol = false
                        var plextent = model_data.extent
                        DSS.layer.ero_field = new ol.layer.Image({
                            visible: false,
                            source: new ol.source.ImageStatic({
                            url: '/static/grazescape/public/images/ero'+ model_data.field_id + '.png',
                            imageExtent: plextent
                            })
                        })
                        DSS.layer.ero_field.set('name', 'ero'+ model_data.field_id);
                    }
                }
                break
            case 'nleaching':
                chartTypeField = chartObj.nleaching_field
                chartTypeFarm = chartObj.nleaching_farm
                if(model_data.scen_id == DSS.activeScenario){
                    console.log(model_data.extent)
                    if(model_data.extent !== undefined){
                        DSS.nleachingBol = false
                        var plextent = model_data.extent
                        DSS.layer.nleaching_field = new ol.layer.Image({
                            visible: false,
                            source: new ol.source.ImageStatic({
                            url: '/static/grazescape/public/images/nleaching'+ model_data.field_id + '.png',
                            imageExtent: plextent
                            })
                        })
                        DSS.layer.nleaching_field.set('name', 'nleaching'+ model_data.field_id);
                    }
                }
                break
            case 'Runoff':
                chartTypeFarm = chartObj.runoff_farm
                chartTypeFarm.units = model_data.units
    //              loop through each storm event
                for (let i in model_data.sum_cells){
                    chartTypeFarm.sum[scenIndex][i] = typeof chartTypeFarm.sum[scenIndex][i] === 'undefined' ? model_data.sum_cells[i]:chartTypeFarm.sum[scenIndex][i] + model_data.sum_cells[i]
                }
                chartTypeFarm.count[scenIndex] = typeof chartTypeFarm.count[scenIndex] === 'undefined' ? model_data.counted_cells:chartTypeFarm.count[scenIndex] + model_data.counted_cells
                chartTypeFarm.area[scenIndex] = typeof chartTypeFarm.area[scenIndex] === 'undefined' ? model_data.area:chartTypeFarm.area[scenIndex] + model_data.area

                for (let i in model_data.sum_cells){
                    chartTypeFarm.chartData.datasets[scenIndex].data[i] =  +((chartTypeFarm.sum[scenIndex][i] / chartTypeFarm.count[scenIndex]).toFixed(2))
                }
                chartTypeFarm.chartData.datasets[scenIndex].fill = false
                if(chartTypeFarm.chart !== null){
                    chartTypeFarm.chart.options.scales.y.title.text = chartTypeFarm.units;
                    chartTypeFarm.chart.update()
                }

                return
            case 'Curve Number':
                chartTypeFarm = chartObj.cn_num_farm
    //            have to handle runoff differently because it deals with an array not a single value

                if(model_data.scen_id == DSS.activeScenario){
                    if(model_data.extent !== undefined){
                        DSS.runoffBol = false
                        var plextent = model_data.extent
                        DSS.layer.runoff_field = new ol.layer.Image({
                            visible: false,
                            source: new ol.source.ImageStatic({
                            url: '/static/grazescape/public/images/Curve Number'+ model_data.field_id + '.png',
                            imageExtent: plextent
                            })
                        })
                        DSS.layer.runoff_field.set('name', 'Curve Number'+ model_data.field_id);
                    }
                }
            break
            }
            if(model_data.scen_id == DSS.activeScenario){
                console.log(model_data.extent)
                if(model_data.extent !== undefined){
                    DSS.yieldBol = false
                    var plextent = model_data.extent
                    DSS.layer.yield_field = new ol.layer.Image({
                        visible: false,
                        source: new ol.source.ImageStatic({
                        url: '/static/grazescape/public/images/Rotational Average'+ model_data.field_id + '.png',
                        imageExtent: plextent
                        })
                    })
                    DSS.layer.yield_field.set('name', 'Rotational Average'+ model_data.field_id);
                }
            }
            break;
    }
//      field level
// some charts don't have a field level
    if(chartTypeField !== null){
        chartTypeField.units = model_data.units
        chartTypeField.units_alternate = model_data.units_alternate
        chartTypeField.title = model_data.title
        chartTypeField.title_alternate = model_data.title_alternate
        let chartVal = null
        if(model_data.sum_cells != null){
            //if econ dont do this
            if(chartTypeField == chartObj.econ_field){
                chartVal = +((model_data.sum_cells).toFixed(2))
                chartTypeField.units_alternate_2 = model_data.units_alternate_2
            chartTypeField.show = true
            }else{
            chartVal = +((model_data.sum_cells/model_data.counted_cells).toFixed(2))
            chartTypeField.show = true
            }

        }
        else{
            chartVal = null
        }
        chartTypeField.chartData.datasets[fieldIndex].data[scenIndex] =  chartVal
        chartTypeField.chartData.datasets[fieldIndex].scenDbID = model_data.scen_id
        chartTypeField.chartData.datasets[fieldIndex].cropRo = model_data.crop_ro
        chartTypeField.chartData.datasets[fieldIndex].fieldData = chartVal
        chartTypeField.chartData.datasets[fieldIndex].grassRo = model_data.grass_ro
        chartTypeField.chartData.datasets[fieldIndex].grassType = model_data.grass_type
        chartTypeField.chartData.datasets[fieldIndex].fieldTill = model_data.till
        chartTypeField.area[fieldIndex] =  model_data.area
        chartTypeField.chartData.chartDataOri[fieldIndex][scenIndex] =  chartVal
        chartTypeField.chartData.datasets[fieldIndex].toolTip[scenIndex] = [model_data.crop_ro,model_data.grass_ro, model_data.grass_type, model_data.till] ;

         if(chartTypeField.chart !== null){
            chartTypeField.chart.update()
            chartTypeField.chart.options.scales.y.title.text= chartTypeField.units;
        }
    }
//      farm level
    //initialize sum and count if they havent been already
    let chartVal = null
    let chartCells = null
    let chartArea = null
    if(model_data.sum_cells != null && model_data.crop_ro != 'dl'){
        chartTypeFarm.show = true
        if(chartTypeFarm == chartObj.econ_farm){
            chartVal = model_data.sum_cells * model_data.counted_cells
            chartCells = model_data.counted_cells
            chartArea = model_data.area
            chartTypeFarm.count[scenIndex] = typeof chartTypeFarm.count[scenIndex] === 'undefined' ? model_data.counted_cells:chartTypeFarm.count[scenIndex] + chartCells
            chartTypeFarm.sum[scenIndex] = typeof chartTypeFarm.sum[scenIndex] === 'undefined' ? /*model_data.sum_cells*/chartVal:chartTypeFarm.sum[scenIndex] + chartVal
            chartTypeFarm.area[scenIndex] = typeof chartTypeFarm.area[scenIndex] === 'undefined' ? model_data.area:chartTypeFarm.area[scenIndex] + chartArea

            chartTypeFarm.title = model_data.title
            chartTypeFarm.title_alternate = model_data.title_alternate
            chartTypeFarm.units = model_data.units
            chartTypeFarm.units_alternate = model_data.units_alternate
            chartTypeFarm.units_alternate_2 = model_data.units_alternate_2

            chartTypeFarm.fieldSum[scenIndex][fieldIndex] =  model_data.sum_cells * model_data.counted_cells
            chartTypeFarm.areaSum[scenIndex][fieldIndex] = model_data.area

            chartTypeFarm.chartData.datasets[scenIndex].data =[chartTypeFarm.get_avg(scenIndex),null]
            chartTypeFarm.chartData.chartDataOri[scenIndex]=[chartTypeFarm.get_avg(scenIndex),null]
        }else{
            chartVal = model_data.sum_cells
            chartCells = model_data.counted_cells
            chartArea = model_data.area
            chartTypeFarm.count[scenIndex] = typeof chartTypeFarm.count[scenIndex] === 'undefined' ? model_data.counted_cells:chartTypeFarm.count[scenIndex] + chartCells
            chartTypeFarm.sum[scenIndex] = typeof chartTypeFarm.sum[scenIndex] === 'undefined' ? model_data.sum_cells:chartTypeFarm.sum[scenIndex] + chartVal
            chartTypeFarm.area[scenIndex] = typeof chartTypeFarm.area[scenIndex] === 'undefined' ? model_data.area:chartTypeFarm.area[scenIndex] + chartArea

            chartTypeFarm.title = model_data.title
            chartTypeFarm.title_alternate = model_data.title_alternate

            chartTypeFarm.units = model_data.units
            chartTypeFarm.units_alternate = model_data.units_alternate

            chartTypeFarm.fieldSum[scenIndex][fieldIndex] =  model_data.sum_cells
            chartTypeFarm.areaSum[scenIndex][fieldIndex] = model_data.area

            chartTypeFarm.chartData.datasets[scenIndex].data =[chartTypeFarm.get_avg(scenIndex),null]
            chartTypeFarm.chartData.chartDataOri[scenIndex]=[chartTypeFarm.get_avg(scenIndex),null]
        }
        
        if(chartTypeFarm.chart !== null){
            chartTypeFarm.chart.update()
            chartTypeFarm.chart.options.scales.y.title.text = chartTypeFarm.units;
        }
    }
}
//Updates feed break down when that is not commented out
function runFeedBreakdownUpdate(outputObj){
    DSS.layer.scenarios.getSource().getFeatures().forEach(function(f) {
		var scenarioFeatureDU = f;
		if(DSS.activeScenario === scenarioFeatureDU.values_.gid){
			scenarioFeatureDU.setProperties({
                heifer_dmi_demand_per_season: outputObj.output[0].toFixed(2),
                heifer_pasture_dmi_yield: outputObj.output[1].toFixed(2),
                heifer_crop_dmi_yield: outputObj.output[2].toFixed(2),
                heifer_remained_dmi_demand: outputObj.output[3].toFixed(2)
			});
            wfs_update(scenarioFeatureDU,'scenarios_2');
        }
    })
}
//calcs heifer feed requirements based on heiferscape calcs
function calcHeiferFeedBreakdown(data){
    return new Promise(function(resolve) {
    var csrftoken = Cookies.get('csrftoken');
    $.ajaxSetup({
            headers: { "X-CSRFToken": csrftoken }
        });
    $.ajax({
    'url' : '/grazescape/heiferFeedBreakDown',
    'type' : 'POST',
    'data' : data,
        success: function(responses, opts) {
            //updating the scenario table with outputs from heieferscape calcs
            runFeedBreakdownUpdate(responses)
            var demandColorSwitch = false
            finalDemandOutput = responses.output[3].toFixed(2)
            if(finalDemandOutput < 0){
                demandColorSwitch = true
                finalDemandOutput = Math.abs(finalDemandOutput)
            }
            DMI_Demand_obj = {
                label: 'DMI Demand',
                hidden: false,
                data: [responses.output[0].toFixed(2)],
                minBarLength: 7,
                backgroundColor: "rgb(0, 119, 187)"
            },
            pastYieldTon_obj = {
                label: 'Pasture DM Yield',
                hidden: false,
                data: [responses.output[1].toFixed(2)],
                minBarLength: 7,
                backgroundColor: "rgb(238, 51, 119)"
            }
            cropsYieldTon_obj = {
                label: 'Crops DM Yield',
                hidden: false,
                data: [responses.output[2].toFixed(2)],
                minBarLength: 7,
                backgroundColor: "rgb(238, 119, 51)"
            }
            remainingDemand_obj = {
                label: demandColorSwitch ? "Surplus Feed" : 'Remaining Feed Demand',
                hidden: false,
                data: [finalDemandOutput],
                minBarLength: 7,
                backgroundColor: demandColorSwitch ? "rgb(0,204,0)" : "rgb(255,0,0)"
            }
            chartObj.feed_breakdown.units = "Yield (tons/year)"
            chartObj.feed_breakdown.units_alternate = "Total Yield (tons-Dry Matter/year)"
            chartObj.feed_breakdown.chartData.labels = []
            chartObj.feed_breakdown.chartData.labels = ['Feed Breakdown Outputs']
            chartObj.feed_breakdown.chartData.datasets = []
            chartObj.feed_breakdown.chartData.datasets.push(DMI_Demand_obj,pastYieldTon_obj,cropsYieldTon_obj,remainingDemand_obj)

			resolve([])
		},
		error: function(responses) {
			console.log(responses)
		}
	})}
)}
// calls to the python to run get_model_results function which either collects data from the model results table, or runs the models on the fields, if they are dirty/new
function get_model_data(data){
    return new Promise(function(resolve) {
    var csrftoken = Cookies.get('csrftoken');
    $.ajaxSetup({
            headers: { "X-CSRFToken": csrftoken }
        });
    $.ajax({
    'url' : '/grazescape/get_model_results',
    'type' : 'POST',
    'data' : data,
    'timeout':0,
        success: async function(responses, opts) {
            delete $.ajaxSetup().headers
            if(responses == null){
                resolve([]);
            }
            for (response in responses){
                obj = responses[response];
                if(obj.error || response == null){
                    console.log("model did not run")
                    console.log(obj.error)
                    if(!modelError){
                        alert(obj.error);
                        modelErrorMessages.push(obj.error)
                        modelError = true
                    }
                    continue
                }
                if(responses[response].value_type != "dry lot"){
                    if(obj.value_type == "Rotational Average"){
                        pmanureReturn_array.push([obj.f_name,obj.field_id,obj.area,obj.crop_ro,obj.p_manure_Results,obj.grass_ro])
                    }
                    format_chart_data(obj)
                }
            }
            resolve(responses);
        },

        failure: function(response, opts) {
            me.stopWorkerAnimation();
        },
    });
    })
	}

// Suspect this function is never called.
function validateImageOL(json, layer, tryCount) {
    var me = this;
    tryCount = (typeof tryCount !== 'undefined') ? tryCount : 0;
    Ext.defer(function() {
        var src = new ol.source.ImageStatic({
            url: location.origin + "/grazescape/get_image?file_name=" + json.url,
            crossOrigin: '',
            imageExtent: json.extent,
            projection: 'EPSG:3857',
            imageSmoothing: false
        });

        src.on('imageloadend', function() {
            layer.setSource(src);
            layer.setVisible(true);
        });
        src.on('imageloaderror', function() {
            tryCount++;
            if (tryCount < 5) {
                validateImageOL(json, layer, tryCount);
            }
            else {
                //failed
            }
        });
        src.image_.load();
    }, 50 + tryCount * 50, me);
}
/**
 * Create a new chart js graph with the given element
 * @chart {chartObject} chart - The chartObject instance of the chart to create
 * @inputString {String} title - The title of the chart
 * @inputString {String} inputString - The input acronym
 */
// Creates graphs for each model result for the dashboard

function create_graph(chart,title,element){
    units = chart.units
    data = chart.chartData
    let barchart = new Chart(element, {
        type: 'bar',
        data: data,
        plugins: [ChartDataLabels],
        options: {
            responsive: true,
            //responsive: false,
            //skipNull:true,
            skipNull:false,
            maxBarThickness: 150,
            interaction:{
              mode:"nearest"
              },
//            maintainAspectRatio: false,
            plugins:{
                //ChartDataLabels:
                datalabels:
                {
                    formatter: function(value, context) {
                        if(value !== null){
                            return context.dataset.label;
                        }
                    },
                    anchor: 'start',
                    align: 'end',
                    offset: 10,
                    color: 'black',
                    rotation: -70,
                    font: {
                        weight: 'bold',
                        size: 13
                      },
                    textStrokeColor: 'white',
                    textStrokeWidth: 1
                },
                title:
                {
                    display: true,
                    text: chart.title
                },
                tooltip: {
                    footerFont: {weight: 'normal'},
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ": " + context.dataset.data[context.dataIndex];
                        },
                        footer: function(context) {
                            var dataset = context[0].dataset
                            if(dataset.toolTip == undefined){
                                return;
                            }
                            let tooltipPath = dataset.toolTip[context[0].dataIndex]
                            // all rotations except pasture
                            if(tooltipPath[0] != "pt"){
                                return ["Rotation: " + farmAccMapping(tooltipPath[0]),
                                "Tillage: " + farmAccMapping(tooltipPath[3])]
                            }
                            // pasture
                            else{
                                let grassTypeDisplay = ''
                                if(tooltipPath[2] == 'Bluegrass-clover'){
                                    grassTypeDisplay = 'Low Yielding'
                                }
                                else if(tooltipPath[2] == 'Timothy-clover'){
                                    grassTypeDisplay = 'Medium Yielding'
                                }
                                else{
                                    grassTypeDisplay = 'High Yielding'
                                }
                                return [
                                "Rotation: " + farmAccMapping(tooltipPath[1]),
                                "Grass Type: " + grassTypeDisplay]
                            }
                        }
                    }
                },
                legend: {
                    display: false,
                    position: 'top',
                    test1: "Hi everyone!",
                    onClick: function (event, legendItem, legend){
                        name = legendItem.text
                        if (event.chart.canvas.id.includes('field')){
                            dbID = chartDatasetContainer.fields[legendItem.datasetIndex].dbID
                        }
                        else{
                            dbID = chartDatasetContainer.scenarios[legendItem.datasetIndex].dbID
                        }
                        hideData(event.chart.canvas.id, name, dbID)
                    },
                },

            },
            scales: {
                y: {
                    ticks: {
                        beginAtZero: true,
                        maxTicksLimit:5,
                    },
                    title: {
                    display: true,
                    text: units,
                    font: {
                        size:14,
                        weight: 'bold'
                    }
                  }
                }
            },
        }
    });
    return barchart
}
/**
 * Take an acronym from crop rotation or tillage and convert it to its orginal form
 * @inputString {String} inputString - The input acronym
 */
//Sets up labeling for chart bars.
function farmAccMapping(inputString){
    let mapping = {
     'nt':'No-Till',
     'su':'Spring Cultivation',
     'sc':'Spring Chisel + Disk',
     'sn':'Spring Chisel No Disk',
     'sv':'Spring Vertical',
     'fc':'Fall Chisel + Disk',
     'fm':'Fall Moldboard Plow',
     'cn':'Continuous Pasture',
     'rt':'Rotational Pasture',
     'dl':'Dry Lot',
     'cc':'Continuous Corn',
     'cg':'Cash Grain',
     'dr':'Corn Silage to Corn Grain to Alfalfa 3 yrs',
     'cso':'Corn Silage to Soybeans to Oats'
     }
     return mapping[inputString]
}
//used to create line graph for runoff graph
function create_graph_line(chart,title,element){
    units = chart.units
    data = chart.chartData
    let barchart = new Chart(element, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
//            maintainAspectRatio: false,
            plugins:{
                title:{
                    display: true,
                    text: title
                },
                legend: {
                    position: 'top',
                    onClick: function (event, legendItem, legend){
                        name = legendItem.text
                        if (event.chart.canvas.id.includes('field')){
                            dbID = chartDatasetContainer.fields[legendItem.datasetIndex].dbID
                        }
                        else{
                            dbID = chartDatasetContainer.scenarios[legendItem.datasetIndex].dbID
                        }
                        hideData(event.chart.canvas.id, name, dbID)
                    },
                },

            },


            scales: {
                y: {
                    ticks: {
                        beginAtZero: true,
                        maxTicksLimit:5,
                    },
                    title: {
                    display: true,
                    text: units
                  }
                },
                x:{
                    title:{
                        display:true,
                        text: "Rain Event [in]"
                    }
                }
            }
        }
    });
    return barchart
}
//Used to create radar graph
function create_graph_radar(chart,title,element){
    data = chart.chartData
    let barchart = new Chart(element, {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
             scales: {
                r: {
                    title: {
                    display: true,
                  },
                min:0,
                }
            },
          plugins: {
            title: {
                display: true,
                text: title
            },
            legend: {
                position: 'top',
                onClick: function (event, legendItem, legend){
                        name = legendItem.text
                        if (event.chart.canvas.id.includes('field')){
                            dbID = chartDatasetContainer.fields[legendItem.datasetIndex].dbID
                        }
                        else{
                            dbID = chartDatasetContainer.scenarios[legendItem.datasetIndex].dbID
                        }
                        hideData(event.chart.canvas.id, name, dbID)
                },
            },
             tooltip: {
               footerFont: {weight: 'normal'},
                callbacks: {
                  label: function(context) {
                        return [context.label + ": " + context.dataset.data[context.dataIndex]]
                    },
                    footer: function(context) {
                        tip = []
                        for (let val in context){
                            console.log(context[val])
                            console.log(context[val].dataset)
                            console.log(context[val].dataset.compareData[context[val].dataIndex])
                            data = context[val].dataset.compareData[context[val].dataIndex]
                            tip.push("Original Value: "  + data)
                        }
                      return tip
                }
            }
          },
          }
        }
    });
    return barchart
}
// name of the chart and the name of the field or scenario
function hideData(chartName, datasetName,dbID){
    let activeTab = Ext.getCmp("mainTab").getActiveTab()
    let mainTabLength = Ext.getCmp("mainTab").items.length
    Ext.getCmp("mainTab").setActiveTab(mainTabLength - 1)
    Ext.getCmp("mainTab").setActiveTab(activeTab)
    let chartType = null
    hide = true
    // turn off fields
    if (chartName.includes('field')){
        chartType = "field"
        if(hiddenData.fields.includes(dbID)){
            hide = false
            let index = hiddenData.fields.indexOf(dbID);
            hiddenData.fields.splice(index, 1);
            let fieldIndex = chartDatasetContainer.indexField(dbID)
            chkBox = Ext.getCmp("checkBox_field_"+fieldIndex)
            chkBox.suspendEvents(false)
            chkBox.setValue(true);
            chkBox.resumeEvents()
        }
        else{
            hiddenData.fields.push(dbID)
            let fieldIndex = chartDatasetContainer.indexField(dbID)
            chkBox = Ext.getCmp("checkBox_field_"+fieldIndex)
            chkBox.suspendEvents(false)
            chkBox.setValue(false);
            chkBox.resumeEvents()
        }
    }
    // turn off scen / farm
    else{
        chartType = 'farm'
//        turn on checkbox if it is off
        if(hiddenData.scens.includes(dbID)){
            hide = false
            let index = hiddenData.scens.indexOf(dbID);
            hiddenData.scens.splice(index, 1);

            let scenIndex = chartDatasetContainer.indexScenario(dbID)
            console.log("checkBox_scen_"+scenIndex)
            chkBox = Ext.getCmp("checkBox_scen_"+scenIndex)
            chkBox.suspendEvents(false)
            chkBox.setValue(true);
            chkBox.resumeEvents()

        }
//        turn off checkbox it is off
        else{
            hiddenData.scens.push(dbID)
            let scenIndex = chartDatasetContainer.indexScenario(dbID)
            chkBox = Ext.getCmp("checkBox_scen_"+scenIndex)
            chkBox.suspendEvents(false)
            chkBox.setValue(false);
            chkBox.resumeEvents()

        }
    }

    for (let chartLoop in chartObj){
//    deal with farm and field charts separately
        if(chartLoop.includes(chartType)){
            // this will turn off fields and scenarios on their respective charts
            for(let data in chartObj[chartLoop].chartData.datasets){
                if(chartObj[chartLoop].chartData.datasets[data].dbID == dbID){

//                    chartObj[chartLoop].chartData.datasets[data].hidden = chartObj[chartLoop].chartData.datasets[data].hidden?false:true
                    chartObj[chartLoop].chartData.datasets[data].hidden = !chartObj[chartLoop].chartData.datasets[data].hidden

                     if(chartObj[chartLoop].chart !== null){
                        chartObj[chartLoop].chart.update()
                    }
                }
            }
        }
        scenVis = []
//        have to remove data from the field list
        if(chartType === 'farm' && chartLoop.includes('field')){
            chartObj[chartLoop].chartData.labels = []
             for(let scen in chartDatasetContainer.scenarios){
//                set labels
                scenVis[scen] = false
                if(!hiddenData.scens.includes(chartDatasetContainer.scenarios[scen].dbID )){
                    chartObj[chartLoop].chartData.labels.push(chartDatasetContainer.scenarios[scen].name)
                    scenVis[scen] = true
                }
            }
            for(let dataEntry in chartObj[chartLoop].chartData.datasets){
                chartObj[chartLoop].chartData.datasets[dataEntry].data = []
                for (let scenV in scenVis){
                    if(scenVis[scenV]){
                        data1 = chartObj[chartLoop].chartData.chartDataOri[dataEntry][scenV]
                        chartObj[chartLoop].chartData.datasets[dataEntry].data.push(data1)
                    }
                }

            }
            if(chartObj[chartLoop].chart !== null){
                console.log(chartLoop)
                console.log(chartObj[chartLoop])
                chartObj[chartLoop].chart.update()
            }
        }
    }
}
// toggle between displaying data between yearly total vs total per area
function displayAlternate(chartName, btnId){
    chartDatasets = chartObj[chartName].chartData.datasets
    chartData = chartObj[chartName]
//    btnObject = Ext.getCmp(btnId)
    divideArea = true
//    switch back to yield by area
    if(chartData.useAlternate){
//        btnObject.setText('Average Yield')
        chartData.chart.options.scales.y.title.text = chartData.units;
        chartData.chart.options.plugins.title.text = chartData.title
        chartData.useAlternate = false
        divideArea = true
//        conv = 1/area
    }
    else{
//        btnObject.setText('Average Yield / Area')
        chartData.chart.options.scales.y.title.text= chartData.units_alternate;
        chartData.chart.options.plugins.title.text = chartData.title_alternate
        //chartData.defaults.plugins.title.text = chartData.title_alternate
        chartData.useAlternate = true
//        conv = area
        divideArea = false
    }
    for (data in chartDatasets){
        if(chartData.area[data]!= undefined){
            for(set in chartDatasets[data].data){
                // if we don't catch null then we will have null arithmetic which will causes zeros to appear on graph
                if(chartDatasets[data].data[set] == undefined || chartDatasets[data].data[set] == null){
                    continue
                }
                if(divideArea){
                    chartDatasets[data].data[set] = +((chartDatasets[data].data[set]/chartData.area[data]).toFixed(2))
                }
                else{
                    chartDatasets[data].data[set] = +((chartDatasets[data].data[set] * chartData.area[data]).toFixed(2))
                }
            }
        }
    }
    chartData.chart.update()
}
// toggle between displaying data between yearly total vs total per area vs total per dm TON
function displayAlternateEcon(chartName,oldValue,newValue){
    fieldYieldDatasets = chartObj.rotation_yield_field.chartData.datasets
    farmYieldDatasets = chartObj.rotation_yield_farm.chartData.datasets
    chartDatasets = chartObj[chartName].chartData.datasets
    chartData = chartObj[chartName]

//    btnObject = Ext.getCmp(btnId)
    divideArea = true
//    switch back to yield by area
    if(newValue == 'a'){
//        btnObject.setText('Average Yield')
        chartData.chart.options.scales.y.title.text = chartData.units;
        chartData.useAlternate = false
        //divideArea = true
//        conv = 1/area
    }
    if (newValue == 't'){
//        btnObject.setText('Average Yield / Area')
        chartData.chart.options.scales.y.title.text= chartData.units_alternate;
        chartData.chart.options.title = chartData.title_alternate
        chartData.useAlternate = true
//        conv = area
        //divideArea = false
    }
    if (newValue == 'd'){
        //        btnObject.setText('Average Yield / Area')
                chartData.chart.options.scales.y.title.text= "Costs (dollars/Tons DM)";
                chartData.useAlternate = true
        //        conv = area
                //divideArea = false
            }
    //where recalc goes
    if(chartName = "econ_field"){
        for(set in chartDatasets){
           for(yset in fieldYieldDatasets){
               if(chartDatasets[set].dbID == fieldYieldDatasets[yset].dbID){
                   let yieldDataPerAcre = fieldYieldDatasets[yset].fieldData
                   for(value in chartDatasets[set].data){
                      let acreage = chartData.area[set]
                      if(chartDatasets[set].data[value] !== null){
                        if(oldValue == 'a' && newValue == 't'){
                            console.log("a and t")
                           chartDatasets[set].data[value] = ((chartDatasets[set].data[value] * acreage)).toFixed(2)
                           console.log(chartDatasets[set].data[value])
                        }
                        if(oldValue == 'a' && newValue == 'd'){
                            console.log("a and d")
                            chartDatasets[set].data[value] = (chartDatasets[set].data[value] / yieldDataPerAcre).toFixed(2)
                            console.log(chartDatasets[set].data[value])
                        }
                        if(oldValue == 't' && newValue == 'a'){
                            console.log("t and a")
                            chartDatasets[set].data[value] = (chartDatasets[set].data[value] / acreage).toFixed(2)
                            console.log(chartDatasets[set].data[value])
                        }
                        if(oldValue == 't' && newValue == 'd'){
                            console.log("t and d")
                            chartDatasets[set].data[value] = ((chartDatasets[set].data[value] / acreage) / yieldDataPerAcre).toFixed(2)
                            console.log(chartDatasets[set].data[value])
                        }
                        if(oldValue == 'd' && newValue == 'a'){
                            console.log("d and a")
                            chartDatasets[set].data[value] = (chartDatasets[set].data[value] * yieldDataPerAcre).toFixed(2)
                            console.log(chartDatasets[set].data[value])
                        }
                        if(oldValue == 'd' && newValue == 't'){
                            console.log("d and t")
                            chartDatasets[set].data[value] = ((chartDatasets[set].data[value] * yieldDataPerAcre) * acreage).toFixed(2)
                            console.log(chartDatasets[set].data[value])
                        }
                    }
                    }
               }
           }
        }
    }
    if(chartName = "econ_farm"){
        for(set in chartDatasets){
           for(yset in farmYieldDatasets){
               if(chartDatasets[set].dbID == farmYieldDatasets[yset].dbID){
                   console.log("field match")
                   let yieldDataPerAcre = chartObj.rotation_yield_farm.sum[set]/chartObj.rotation_yield_farm.count[set]
                   for(value in chartDatasets[set].data){
                      let v = chartDatasets[set].data[value]
                      acreage = chartObj.rotation_yield_farm.area[set]
                      console.log(chartDatasets[set].data[value])
                      console.log(acreage)
                      console.log(yieldDataPerAcre)
                       if(chartDatasets[set].data[value] !== null){
                            if(oldValue == 'a' && newValue == 't'){
                                console.log("a and t")
                               chartDatasets[set].data[value] = ((chartDatasets[set].data[value] * acreage)).toFixed(2)
                               console.log(chartDatasets[set].data[value])
                            }
                            if(oldValue == 'a' && newValue == 'd'){
                                console.log("a and d")
                                chartDatasets[set].data[value] = (chartDatasets[set].data[value] / yieldDataPerAcre).toFixed(2)
                                console.log(chartDatasets[set].data[value])
                            }
                            if(oldValue == 't' && newValue == 'a'){
                                console.log("t and a")
                                chartDatasets[set].data[value] = (chartDatasets[set].data[value] / acreage).toFixed(2)
                                console.log(chartDatasets[set].data[value])
                            }
                            if(oldValue == 't' && newValue == 'd'){
                                console.log("t and d")
                                chartDatasets[set].data[value] = ((chartDatasets[set].data[value] / acreage) / yieldDataPerAcre).toFixed(2)
                                console.log(chartDatasets[set].data[value])
                            }
                            if(oldValue == 'd' && newValue == 'a'){
                                console.log("d and a")
                                chartDatasets[set].data[value] = (chartDatasets[set].data[value] * yieldDataPerAcre).toFixed(2)
                                console.log(chartDatasets[set].data[value])
                            }
                            if(oldValue == 'd' && newValue == 't'){
                                console.log("d and t")
                                chartDatasets[set].data[value] = ((chartDatasets[set].data[value] * yieldDataPerAcre) * acreage).toFixed(2)
                                console.log(chartDatasets[set].data[value])
                            }
                        }
                    }
               }
           }
        }
    }
    chartData.chart.update()
}
// organzies all fields and scenarios so that they show in order and with the same colors
//across charts
function compareChartCheckBox(){
    // display values for the compare tab and the corresponding charts
//    chart variable type, chart name, if the value is by area, checked
    boxes = {yieldVar :[
        ["Grass Yield / Area",'grass_yield_farm', false, false ] ,
        ["Grass Yield Total",'grass_yield_farm', true, false ] ,
        ["Corn Yield / Area",'corn_yield_farm', false, false ],
        ["Corn Yield Total",'corn_yield_farm', true, false],
        ["Corn Silage Yield / Area  ",'corn_silage_yield_farm', false, false ],
        ["Corn Silage Yield Total",'corn_silage_yield_farm', true, false],
        ["Soy Yield / Area",'soy_yield_farm', false, false ],
        ["Soy Yield Total",'soy_yield_farm', true, false],
        ["Oat Yield / Area",'oat_yield_farm', false, false ],
        ["Oat Yield Total",'oat_yield_farm', true, false],
        ["Alfalfa Yield / Area",'alfalfa_yield_farm', false, false ],
        ["Alfalfa Yield Total",'alfalfa_yield_farm', true, false],
        ["Rotation Yield / Area",'rotation_yield_farm', false, false ],
        ["Rotation Yield Total",'rotation_yield_farm', true, false],
        ],
    erosionVar : [
        ["Soil Erosion / Area  ",'soil_loss_farm', false, false],
        ["Soil Erosion Total",'soil_loss_farm', true, false]
    ],
    nutrientsVar : [
        ["Phosphorus Runoff / Area  " , 'ploss_farm', false, false],
        ["Phosphorus Runoff Total" , 'ploss_farm', true, false],
//        ["Nitrogen Leaching",'nitrogen_farm']

    ],
    runoffVar : [["Curve Number",'cn_num_farm', false, false] ,
        ["Runoff from 1 in storm","runoff_farm", false, false],
        ["Runoff from 3 in storm","runoff_farm", false, false],
        ["Runoff from 5 in storm","runoff_farm", false, false]
     ],
     insectVar: [["Honey Bee Toxicity", 'insecticide_farm', false, false]],
     costVar:  [
        ["Farm Production Costs  " , 'econ_farm', false, false]],
     infraVar : [
//     "Total Fence Length", "Total Fence Cost",
//     "Total Water Line Distance", "Total Water Line Cost", "Total Lane Distance",
//     "Total Lane Cost", "Total Water Tanks Cost"
     ]
    }
    checkBoxReturn = {}
    for (group in boxes){
        for(box in boxes[group]){
            checkBox = {
                boxLabel: boxes[group][box][0],
//                id: "checkBox_field_"+100,
                checked: boxes[group][box][3],
//                store chart name for later lookup when populating the radar chart
                name: boxes[group][box][0],
                chartType: boxes[group][box][1],
                total:boxes[group][box][2]
            }
            if( checkBoxReturn[group] === undefined){
                checkBoxReturn[group] = [checkBox]
                continue
            }
            checkBoxReturn[group].push(checkBox)
        }
    }
    return checkBoxReturn
}
function populateRadarChart(){
    console.log("Populate radar chart")
//    get scenario db id
    let baseScen = Ext.getCmp('scenCombobox').getValue()
    let datasets = chartObj.compare_farm.chartData.datasets
    console.log(datasets)
//    set backcolor of chart datasets to be translucent
    for (data in datasets){
        datasets[data].data = []
    }
    if(baseScen == null || baseScen == undefined){
        return
    }
    chartObj.compare_farm.title = "Base Scenario - " + chartDatasetContainer.getScenName(baseScen)
    let baseIndex = chartDatasetContainer.indexScenario(baseScen)
    chartObj.compare_farm.chartData.labels = []
    let checkYield = Ext.getCmp('checkYield').getChecked()
    let checkErosion = Ext.getCmp('checkErosion').getChecked()
    let checkNutrients = Ext.getCmp('checkNutrients').getChecked()
    let checkRunoff = Ext.getCmp('checkRunoff').getChecked()
    let checkInsecticide = Ext.getCmp('checkInsecticide').getChecked()
    let checkCosts = Ext.getCmp('checkCosts').getChecked()
    checkBoxArr = []
//  combine all the checkbox section into one array
    checkBoxArr = checkYield.concat(checkErosion,checkNutrients,checkRunoff,checkInsecticide,checkCosts)
    checkBoxArr.concat(checkYield)
    if(checkBoxArr.length<0){
        return
    }
//    set base scenario to have value of 1
//    for(val in checkBoxArr.length){
    chartObj.compare_farm.chartData.chartDataOri = []
    for(let i = 0; i < checkBoxArr.length + 1; i++){
        chartObj.compare_farm.chartData.chartDataOri[i] = []
    }
    if(checkBoxArr.length > 9){
        console.log("too many boxes")
        alert("Please only select 8 variable to display")
        return
    }
    let i = 0
    for (let check in checkBoxArr){
        // each checkbox is an entry in the array
        let name = checkBoxArr[check].getName()
        let type = checkBoxArr[check].chartType
        let isTotal = checkBoxArr[check].total

        let scenBaseVal = chartObj[type].chartData.datasets[baseIndex].data[0]
        if(name.indexOf("1 in storm")>0){
            scenBaseVal = chartObj[type].chartData.datasets[baseIndex].data[1]
        }
        else if(name.indexOf("3 in storm")>0){
            scenBaseVal = chartObj[type].chartData.datasets[baseIndex].data[5]
        }
        else if(name.indexOf("5 in storm")>0){
            scenBaseVal = chartObj[type].chartData.datasets[baseIndex].data[9]
        }

        if(isTotal&& chartObj[type].useAlternate != true){
            scenBaseVal = (scenBaseVal * chartObj[type].area[baseIndex]).toFixed(2)
        }

        if(scenBaseVal == undefined){
            continue
        }
        chartObj.compare_farm.chartData.labels.push(checkBoxArr[check].getName())
        scen_data = chartObj[type].chartData.datasets
        let j = 0
//      loop through each scenario
        for (let data in scen_data){
            let currentData = scen_data[data].data[0]
            if(name.indexOf("1 in storm")>0){
                currentData = scen_data[data].data[1]
            }
            else if(name.indexOf("3 in storm")>0){
                currentData = scen_data[data].data[5]
            }
            else if(name.indexOf("5 in storm")>0){
                currentData = scen_data[data].data[9]
            }
            if (isTotal && chartObj[type].useAlternate != true){
                currentData = (currentData * chartObj[type].area[data]).toFixed(2)
            }
//            set the active scenario to 1. Avoids issues of infinity if the base scenario has a zero
            if(baseScen == chartObj.compare_farm.chartData.datasets[data].dbID){
                chartObj.compare_farm.chartData.datasets[data].data[i]  = 1
            }
            else{
                chartObj.compare_farm.chartData.datasets[data].data[i] = +((currentData / scenBaseVal).toFixed(2))
//                if both datasets have a zero then we got infinity instead of 1
                if (currentData == scenBaseVal){
                    chartObj.compare_farm.chartData.datasets[data].data[i] = 1
                }

            }
            chartObj.compare_farm.chartData.datasets[data].compareData[i] = currentData
            chartObj.compare_farm.chartData.chartDataOri[data][i]  = currentData
            j++
        }
        i++
    }
    //    check each checkbox group for checked boxes (max 8)
    datasets = chartObj.compare_farm.chartData.datasets
//    set backcolor of chart datasets to be translucent
    for (data in datasets){
        datasets[data].backgroundColor = chartDatasetContainer.getColorScen(datasets[data].dbID).trans
    }
     if(chartObj.compare_farm.chart !== null){
        chartObj.compare_farm.chart.options.plugins.title.text = chartObj.compare_farm.title
        chartObj.compare_farm.chart.update()
     }
}
// Retrieves all scenarios associated with active farm
function retrieveScenariosGeoserver(){
	let fieldUrl1 = '/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:scenarios_2&' +
	'CQL_filter=farm_id='+DSS.activeFarm+'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';

    let scenList = []
    let scenIdList = []
    return geoServer.makeRequest(fieldUrl1,"","", geoServer).then(function(returnData){
        let responses =JSON.parse(returnData.geojson)
        for(response in responses.features){
            let scen = responses.features[response].properties.scenario_name
            let scenID = responses.features[response].properties.gid
            scenList.push(scen)
            scenIdList.push(scenID)
        }
        return {scenList, scenIdList}
    })
}
// collects fields data for the ChartDatasetContainer class
function retrieveFieldsGeoserver(){
    let fieldUrl1 =
	'/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:field_2&' +
	'CQL_filter=farm_id='+DSS.activeFarm +
	'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';

    let fieldList = []
    let fieldIdList = []
    let scenIdList = []
    let geomList = []
    return geoServer.makeRequest(fieldUrl1,"","", geoServer).then(function(returnData){
            let responses =JSON.parse(returnData.geojson)
            console.log(responses)
            for(response in responses.features){
                let field = responses.features[response].properties.field_name
                let fieldID = responses.features[response].properties.gid
                let scenID = responses.features[response].properties.scenario_id
                let geom = responses.features[response].geometry.coordinates[0][0]
                fieldList.push(field)
                fieldIdList.push(fieldID)
                scenIdList.push(scenID)
                geomList.push(geom)
            }
            return {fieldList, fieldIdList,scenIdList, geomList}
        })


}
// collects farm data for the ChartDatasetContainer class
function retrieveFarmGeoserver(){
    let fieldUrl1 =
	'/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:farm_2&' +
	'CQL_filter=gid='+DSS.activeFarm+
	'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';

    let farmName = ''
    return geoServer.makeRequest(fieldUrl1,"","", geoServer).then(function(returnData){
        let responses =JSON.parse(returnData.geojson)
        for(response in responses.features){
                farmName = responses.features[response].properties.farm_name

            }
        return farmName
    })
}
// collects fields data for the ChartDatasetContainer class
function retrieveAllFieldsFarmGeoserver(){
    let fieldUrl1 ='/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:field_2&' +
	'CQL_filter=gid='+DSS.activeFarm+
	'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';
    let field_dic = {}
    return geoServer.makeRequest(fieldUrl1,"","", geoServer).then(function(returnData){
        let responses =JSON.parse(returnData.geojson)
            for(response in responses.features){
                let field = responses.features[response].properties.field_name
                let fieldID = responses.features[response].properties.gid
                field_dic[fieldID] = field
            }
            return field_dic
    })
}
// get all the data for each field in active farm
function retrieveAllFieldsDataGeoserver(){
    let fieldUrl1 =
	'/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:field_2&' +
	'CQL_filter=farm_id='+DSS.activeFarm+
	'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';
    let responsesField = []
    return geoServer.makeRequest(fieldUrl1,"","", geoServer).then(function(returnData){
        let responses =JSON.parse(returnData.geojson)
        for(response in responses.features){
            let field = responses.features[response].properties.field_name
            responsesField.push(responses.features[response])
        }
        return responsesField

    })
}
//runs the print summary in the dashboard
function downloadSummaryCSV(chartObj){
    var refinedData = []
    var fieldkeys = ["rotation_yield_field","alfalfa_yield_field","corn_silage_yield_field","corn_yield_field","grass_yield_field","oat_yield_field","econ_field","insecticide_field","nleaching_field","ploss_field","soil_loss_field"]
    var farmkeys = ["rotation_yield_farm","alfalfa_yield_farm","corn_silage_yield_farm","corn_yield_farm","grass_yield_farm","oat_yield_farm","econ_farm","insecticide_farm","nleaching_farm","ploss_farm","soil_loss_farm"]

    refinedData.push(["All data shown as per acre"])
    refinedData.push([""])
    refinedData.push(["Field Results Results"])
    refinedData.push([""])
    fieldtitlearray = ["Field Names"]
    scentitlearray = ["Field Scenarios"]
    areatitlearray = ["Field Area(ac)"]
    rotfieldchart = chartObj.rotation_yield_field.chartData
    for(i in rotfieldchart.datasets){
        fieldtitlearray.push(rotfieldchart.datasets[i].label)
    }
    for(s in rotfieldchart.datasets){
        for(d in rotfieldchart.datasets[s].data){
            if(rotfieldchart.datasets[s].data[d] !== null){
                scentitlearray.push(rotfieldchart.chartDataLabelsOri[d])
            }
        }
    }
    for(a in chartObj.rotation_yield_field.area){
        areatitlearray.push(chartObj.rotation_yield_field.area[a])
    }
    refinedData.push(fieldtitlearray)
    refinedData.push(scentitlearray)
    refinedData.push(areatitlearray)
    refinedData.push([""])

    for(m in fieldkeys){
        resultsArray = []
        resultsArray.push(fieldkeys[m])
        charttext = fieldkeys[m]

        Object.entries(chartObj).forEach(([key,values])=> {
        if(String(key) == String(fieldkeys[m])){

            for(i in values.chartData.datasets){
                if(values.chartData.datasets[i].data.every(d => d === null)){
                    resultsArray.push("NA")
                }else{
                for(d in values.chartData.datasets[i].data){
                    if(values.chartData.datasets[i].data[d] !== null){
                        resultsArray.push(values.chartData.datasets[i].data[d])
                    }
                }}
            }
        refinedData.push(resultsArray)}
    })}

    refinedData.push([""])
    refinedData.push([""])
    refinedData.push(["Scenario Results"])

    farmtitlearray = ["Scenario Names"]
    areatitlearray = ["Scenario Area(ac)"]
    rotfarmchart = chartObj.rotation_yield_farm.chartData
    for(i in rotfarmchart.datasets){
        farmtitlearray.push(rotfarmchart.datasets[i].label)
    }
    for(a in chartObj.rotation_yield_farm.area){
        areatitlearray.push(chartObj.rotation_yield_farm.area[a])
    }
    refinedData.push(farmtitlearray)
    refinedData.push(areatitlearray)
    refinedData.push([""])

    for(m in farmkeys){
        resultsArray = []
        resultsArray.push(farmkeys[m])
        charttext = farmkeys[m]
        Object.entries(chartObj).forEach(([key,values])=> {
        if(String(key) == String(farmkeys[m])){

            for(i in values.chartData.datasets){
                if(values.chartData.datasets[i].data.every(d => d === null)){
                    resultsArray.push("NA")
                }else{
                for(d in values.chartData.datasets[i].data){
                    if(values.chartData.datasets[i].data[d] !== null){
                        resultsArray.push(values.chartData.datasets[i].data[d])
                    }
                }}
            }
        refinedData.push(resultsArray)}

    })}

    let csvContent = ''
    refinedData.forEach(row => {
        csvContent += row.join(',') + '\n'
      })
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' })
    const objUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', objUrl)
    link.setAttribute('download', 'File.csv')
    link.textContent = 'Click to Download'

    Ext.getCmp('downloadSummaryCSV').setHref(link)
}

function printSummary(){
    // TODO suspect this block can go
    var pdf = new jsPDF();
    pdf.setFontSize(22);
    pdf.text(20, 20, 'This is a title');
    pdf.setFontSize(16);
    pdf.text(20, 30, 'This is some normal sized text underneath.');
    pdf.addPage("letter",'landscape');
    // ---

    let activeTab = Ext.getCmp("mainTab").getActiveTab()
    scenName = chartDatasetContainer.getScenName(DSS.activeScenario)
    let mainTabs = Ext.getCmp("mainTab").items.items
    for (let mainTab in mainTabs ){
        if(mainTab == 0){
            continue
        }
        Ext.getCmp("mainTab").setActiveTab(parseFloat(mainTab))
        subTabs = mainTabs[parseFloat(mainTab)].items.items
        for(let subTab in subTabs){
            console.log(subTab)
            Ext.getCmp("mainTab").items.items[parseFloat(mainTab)].setActiveTab(parseFloat(subTab))
        }
    }
    // make the summary tab the active tab when done.
    Ext.getCmp("mainTab").setActiveTab(activeTab)

    var pdf = new jsPDF({
        orientation: 'l',
        unit: 'px',
        format: 'letter',
    });
    pdf.deletePage(1);
    
    fieldTotals = 0
    
    setTimeout(() => {
        noChartDataList = []
        chartObjList = Object.keys(chartObj)
        for(i in chartObj){
            if(i.includes("_field")){
                fieldTotals = 0
                fieldDataSets = chartObj[i].chartData.datasets
                if(fieldDataSets == 'undefined'){
                    continue
                }
                for(f in fieldDataSets){
                    if(fieldDataSets[f].fieldData === null){
                        fieldTotals += 1
                    }
                }
                if(fieldTotals == fieldDataSets.length){
                    noChartDataList.push(i)
                }
            }
            if(i.includes("_farm")){
                farmTotals = 0
                farmDataSets = chartObj[i].chartData.datasets
                if(farmDataSets == 'undefined'){
                    continue
                }
                for(f in farmDataSets){
                    farmDataArray = farmDataSets[f].data
                    for(fd in farmDataArray){
                        if(farmDataArray[fd] === null){
                            farmTotals += 1
                        }
                    }
                }
                if(farmTotals == farmDataArray.length){
                    noChartDataList.push(i)
                }
            }
        }

        let lastPage;
        for (chart in chartList){
            chartPresent = true
            canvas = document.getElementById(chartList[chart])
            if(canvas == null){
                continue
            }
            if(noChartDataList.includes(canvas.id)){
                continue
            }
            fieldTotals = 0
            var newCanvas = canvas.cloneNode(true);
            var ctx = newCanvas.getContext('2d');
            ctx.fillStyle = "#FFF";
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
            ctx.drawImage(canvas, 0, 0);
            var imgData = newCanvas.toDataURL("image/jpeg");
            var pdfWidth = pdf.internal.pageSize.width;
            const scaleFactor = pdfWidth / newCanvas.width * 0.8;
            pdf.addPage("letter",'landscape');
            pdf.addImage(imgData, 'JPEG', 
                pdfWidth * 0.1 , 
                0, 
                newCanvas.width * scaleFactor, 
                newCanvas.height * scaleFactor);
        }
        pdf.save(chartDatasetContainer.farmName + "_Report.pdf");
    }, 1000);

    // TODO suspect can delete below this point
    // What does this code do?
    let type = "csv";

    let fieldUrl_results =
	 '/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:field_model_results&' +
	'CQL_filter=gid='+DSS.activeFarm+
	'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';
    
     geoServer.makeRequest(fieldUrl_results,"","", geoServer).then(function(returnData){
        let responses =JSON.parse(returnData.geojson)
            let csvMain = []

		    let csvHeader = Object.keys(responses.features[0].properties)
		    let csvText = ""
		    let index = csvHeader.indexOf("cell_count");
            if (index > -1) csvHeader.splice(index, 1);
            index = csvHeader.indexOf("farm_id");
            if (index > -1) csvHeader.splice(index, 1);
            for (head in csvHeader){
		        csvText = csvText + csvHeader[head] + ","
		    }
            csvText = csvText + "\n"
            for(response of Object.keys(responses.features)){
                let field_att_list = []
                for(col of Object.keys(responses.features[response].properties)){
                    let cell_count = responses.features[response].properties["cell_count"]
                    if(col == "cell_count" || col == "farm_id"){
                            continue
                        }
                    else if(col== "field_id" ){
                        field_att_list.push(chartDatasetContainer.getFieldName(responses.features[response].properties[col]))
                        csvText = csvText + chartDatasetContainer.allFields[responses.features[response].properties[col]] + ","
                    }
                    else if(col== "scenario_id" ){
                        field_att_list.push(chartDatasetContainer.getScenName(responses.features[response].properties[col]))
                        csvText = csvText + chartDatasetContainer.getScenName(responses.features[response].properties[col]) + ","
                    }
                    else if(col == "area"){
                        field_att_list.push(responses.features[response].properties[col])
                        csvText = csvText + responses.features[response].properties[col] + ","
                    }
                    else{
                        field_att_list.push(responses.features[response].properties[col]/ cell_count)
                        csvText = csvText + (responses.features[response].properties[col] / cell_count) + ","
                    }
                }
                field_att_list.push("\n")
                csvText = csvText + "\n"

                csvMain.push(field_att_list)
            }

            data = csvText
            filename = chartDatasetContainer.farmName + "_model_data.csv"
            type = "csv"
            var file = new Blob([data], {type: type});
            if (window.navigator.msSaveOrOpenBlob) // IE10+
                window.navigator.msSaveOrOpenBlob(file, filename);
            else { // Others
                var a = document.createElement("a"),
                        url = URL.createObjectURL(file);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function() {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 0);
            }
	})
    let fieldUrl2 =
	 '/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:infrastructure_2&' +
	'CQL_filter=gid='+DSS.activeFarm+
	'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';
	     geoServer.makeRequest(fieldUrl2,"","", geoServer).then(function(returnData){
        let responses =JSON.parse(returnData.geojson)
            let csvMain = []
//            no infrastructure
            if(responses.features[0] == undefined){
                return
            }
		    let csvHeader = Object.keys(responses.features[0].properties)
		    let csvText = ""

		    let index = csvHeader.indexOf("gid");
            if (index > -1) csvHeader.splice(index, 1);
            index = csvHeader.indexOf("id");
            if (index > -1) csvHeader.splice(index, 1);
            index = csvHeader.indexOf("farm_id");
            if (index > -1) csvHeader.splice(index, 1);
            for (head in csvHeader){
		        csvText = csvText + csvHeader[head] + ","
		    }
            csvText = csvText + "\n"

            for(response of Object.keys(responses.features)){
                let field_att_list = []
                for(col of Object.keys(responses.features[response].properties)){
                    if(col == "gid" || col == "farm_id"|| col == "id"){
                            continue
                        }
                    else if(col== "field_id" ){
                        csvText = csvText + chartDatasetContainer.allFields[responses.features[response].properties[col]] + ","
                    }
                    else if(col== "scenario_id" ){
                        csvText = csvText + chartDatasetContainer.getScenName(responses.features[response].properties[col]) + ","
                    }
                    else if(col == "area"){
                        csvText = csvText + responses.features[response].properties[col] + ","
                    }
                    else{
                        csvText = csvText + (responses.features[response].properties[col]) + ","
                    }
                }
                field_att_list.push("\n")
                csvText = csvText + "\n"

                csvMain.push(field_att_list)
            }

            data = csvText
            filename = chartDatasetContainer.farmName + "_infrastructure.csv"
            type = "csv"
            var file = new Blob([data], {type: type});
            if (window.navigator.msSaveOrOpenBlob) // IE10+
                window.navigator.msSaveOrOpenBlob(file, filename);
            else { // Others
                var a = document.createElement("a"),
                        url = URL.createObjectURL(file);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function() {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 0);
            }
	})
}
//Download rasters for model runs
function downloadRasters(fieldIter){
    return new Promise(function(resolve) {
        layer = DSS.layer.fields_1
        let downloadCount = 0
        let numFields = fieldIter.length
        for(item in fieldIter){
            f = fieldIter[item].properties
//            if(f["is_dirty"] == false){
//                downloadCount = downloadCount + 1
//                 if(downloadCount==numFields){
//                    console.log(downloadCount, numFields)
//                    console.log("All files downloaded")
//                    resolve(downloadCount)
//                }
//                continue
//            }
            geometry = fieldIter[item]
            model_para = {
                f_name: f["field_name"],
                field_id: f["gid"],
                extent: geometry.bbox,
                // at this point fields wont have any holes so just get the first entry
                field_coors: geometry.geometry.coordinates[0],
                active_region: DSS.activeRegion
            }

            downloadRastersRequest(model_para).then(function(value){
                downloadCount = downloadCount + 1
                if(downloadCount==numFields){
                    console.log("All files downloaded11")
                    resolve(downloadCount)
                }
            })
        }
    })
}
//Sends request to python to download rasters from Geoserver
function downloadRastersRequest(data){
    return new Promise(function(resolve) {
        var csrftoken = Cookies.get('csrftoken');
        $.ajaxSetup({
                headers: { "X-CSRFToken": csrftoken }
        });
        $.ajax({
            'url' : '/grazescape/download_rasters',
            'type' : 'POST',
            'data' : data,
            success: function(responses, opts) {
                delete $.ajaxSetup().headers
                resolve(responses)
            },

            failure: function(response, opts) {
                me.stopWorkerAnimation();
            }
        })
    })
}
class ChartDatasetContainer{
    constructor() {
        this.fields = []
        this.scenarios = []
        this.farmName = ""
//        arrow function keeps 'this' of calling function
         retrieveFarmGeoserver().then(returnData =>{
            this.farmName =  returnData
         })
        this.farmID = DSS.activeFarm

        this.colorIndex = 0
        this.getScenarios().then(returnData =>{
            this.scenarios.sort(function(a, b){return a.dbID - b.dbID})

            for(let scen in this.scenarios){
                 if(this.scenarios[scen].dbID == DSS.activeScenario){
                    var first = this.scenarios[scen]
                    this.scenarios.sort(function(x,y){ return x.dbID == first.dbID ? -1 : y.dbID == first.dbID ? 1 : 0; });
                 }
             }
            //End addition
            this.getFields().then(returnData =>{
                populateChartObj(this.getScenarioList(), this.getFieldList(),this.fields, this.scenarios)
                this.setCheckBoxes()
            })
        })
        this.allFields
        retrieveAllFieldsFarmGeoserver().then(returnData =>{
            this.allFields = returnData
        })
    }
    setCheckBoxes(){
        let counter = 0
        for(let scen in this.scenarios){
            let checkBox = {
                boxLabel  : this.scenarios[scen].name,
                    id: "checkBox_scen_"+counter,
                    checked: true,
                    name: 'farm',
                    dbID: this.scenarios[scen].dbID,
                    listeners:{change: function(box, newVal, oldVal, e) {
                        hideData(box.name, box.boxLabel,box.dbID)
                    }}
            }
            counter = counter + 1
            checkBoxScen.push(checkBox)
        }
        counter = 0
        for(let field in this.fields){
            let checkBox = {
                    boxLabel  : this.fields[field].name,
                    id: "checkBox_field_"+counter,
                    checked: true,
                    name: 'field',
                    dbID: this.fields[field].dbID,
                     listeners:{change: function(box, newVal, oldVal, e) {
                        hideData(box.name, box.boxLabel, box.dbID)
                    }}
            }
            counter = counter + 1
            checkBoxField.push(checkBox)
        }
    }

    getFields(){
        return new Promise(resolve =>{
            retrieveFieldsGeoserver().then(results =>{
                let {fieldList, fieldIdList, scenIdList,geomList} = results
                for (let scen in fieldList){
                    this.addSet(fieldList[scen] /*+ " ("+ this.getScenName(scenIdList[scen])+ ")" */,'field',fieldIdList[scen], scen, geomList[scen],scenIdList[scen])
                }
                resolve()
            })
        })
    }

    getScenarios(){
        return new Promise(resolve =>{
        // get every scenario from active user
            retrieveScenariosGeoserver().then(results =>{
            let {scenList, scenIdList} =  results
                for (let scen in scenList){
                    this.addSet(scenList[scen], 'scen',scenIdList[scen], scen,"",scenIdList[scen])
                    // populating scenario picker combobox for the compare chart
                    scenariosStore.loadData([[scenList[scen],scenIdList[scen]]],true)
                    scenariosStore.sort('name', 'ASC');
                }
            resolve()
            })
        })
    }

    // fields that are the same across scenarios should have the same color
    // right now we are looking at geometry to tie fields between scenarios
    fieldDuplicate(geom, index,scenId,type){
        let foundMatch = true
        // loop through all fields
        for(let field in this.fields){
            // loop through all fields' geometry
            foundMatch = true
            for(let point in this.fields[field].geom){
                if(geom[point] == undefined){
                    foundMatch = false
                    break
                }
                if(geom[point][0] != this.fields[field].geom[point][0] ||geom[point][1] != this.fields[field].geom[point][1]){
                    foundMatch = false
                    break
                }
            }
        }
        if(scenId === DSS.activeScenario && type === 'field'){
            return chartColorsAS[index % chartColorsAS.length]
        }
        if(scenId != DSS.activeScenario && type === 'field'){
            return chartColors[index % chartColors.length]
        }
        if(scenId === DSS.activeScenario && type === 'scen'){
            return chartColorsAS[index % chartColorsAS.length]
        }
        if(scenId != DSS.activeScenario && type === 'scen'){
            return chartColors[index % chartColors.length]
        }
    }

//    sort fields alphabetically(so they show in same order on each graph) and choose color.
//@ param setName Name of scenario
//@ type field or scen
//@ id primary key of the scenario or field
// return index of field
    addSet(setName, type, id, index, geom="",scenId){
        let sets = null
        if (type == "field"){
            sets  = this.fields
            console.log(this.fields)
        }
        else if (type == "scen"){
            sets  = this.scenarios
        }
        let color = this.fieldDuplicate(geom, index,scenId,type)
        let currField = new DatasetNode(setName, color, id, geom)
        if (sets.length < 1){
            sets.push(currField)
            return
        }
//        sort alphabetically
        for (let set in sets){
            if (setName < sets[set].name){
                sets.splice(set,0,currField)
                return
            }
        }
        // add value onto the end if its last alphabetically
        sets.splice(sets.length,0,currField)
        return

    }
//    get index of field by name
    indexField(dbId){
        for (let field in this.fields){
            if (this.fields[field].dbID == dbId){
                return field
            }
        }
    }
//    get index of scenario by name
    indexScenario(dbId){
        for (let scen in this.scenarios){
            if (this.scenarios[scen].dbID== dbId){
                return scen
            }
        }
    }

//get field name from db id
    getFieldName(fieldID){
        for (let field in this.fields){
            if (this.fields[field].dbID == fieldID){
                return this.fields[field].name
            }
        }
    }
//    get scenario name from db id
    getScenName(scenId){
        for (let scen in this.scenarios){
            if (this.scenarios[scen].dbID== scenId){
                console.log(this.scenarios)
                return this.scenarios[scen].name
            }
        }
    }

    getColorScen(scenId){
       for (let scen in this.scenarios){
            if (this.scenarios[scen].dbID== scenId){
                return this.scenarios[scen].color
            }
        }
    }

//    get list of all fields in scen and populate checkbox for legend
    getFieldList(){
        let field_list = []
        for (let field in this.fields){
            field_list.push(this.fields[field].name)
        }
        return field_list
    }

    getScenarioList(){
        let scen_list = []
        for (let scen in this.scenarios){
            scen_list.push(this.scenarios[scen].name)
        }
        return scen_list
    }
}
// node for field and scenario attributes
class DatasetNode{
    constructor(name, color, dbID, geom = "") {
        this.name = name
        this.color = color
        this.dbID = dbID
        this.geom = geom
    }
}

// contains all data for chart. Contains running sum for farm scale charts and
// the field averages
class ChartData{
    constructor() {
        this.units = ''
        this.units_alternate = ''
        this.title = ''
        this.title_alternate = ''
        this.model_type = ''
        this.sum = []
        this.count = []
        this.area = []
        this.chartData = null
        this.chart = null
        this.useAlternate = false

        this.fieldSum = []
        this.areaSum = []
    }

    get_avg(scenIndex){
        return +((this.sum[scenIndex] / this.count[scenIndex]).toFixed(2))
    }
}
