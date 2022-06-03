var barLabels = []
modelResult = {}
var mfieldID = ''
var modelError = false
var modelErrorMessages = []
var yieldmodelsDataArray = []
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
    console.log(scenList)
    console.log(fieldList)
    console.log(allField)
    console.log(allScen)
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

function build_model_request(f, geometry, modelChoice,modelruntime,activeScenario,){
    let runModel = false
    let split = ""
    console.log(DSS.activeRegion)
    console.log(f)
    if(f["is_dirty"] == true){
        runModel = true
    }
    console.log(runModel)

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
        // at this point fields wont have any holes so just get the first entry
        field_coors: geometry.geometry.coordinates[0],
        grass_type: f["grass_speciesval"],
//            need to convert this to integer
        contour: f["on_contour"]?1:0,
        soil_p: f["soil_p"],
        tillage: f["tillage"],
        fert: f["fertilizerpercent"],
        manure: f["manurepercent"],
        crop:crop,
        area:f["area"],
        om: f["om"],
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
        active_region: DSS.activeRegion,
        alfalfaMachCost: scenarioArray[0].alfalfaMachCost,
        alfalfaMachCostY1: scenarioArray[0].alfalfaMachYearOneCost,
        alfalfaPestCost: scenarioArray[0].alfalfaPestCost,
        alfalfaSeedCost: scenarioArray[0].alfalfaSeedCost,
        cornMachCost: scenarioArray[0].cornMachCost,
        cornPestCost: scenarioArray[0].cornPestCost,
        cornSeedCost: scenarioArray[0].cornSeedCost,
        grassMachCost: scenarioArray[0].grassMachCost,
        grassPestCost: scenarioArray[0].grassPestCost,
        grassSeedCost: scenarioArray[0].grassSeedCost,
        oatMachCost: scenarioArray[0].oatMachCost,
        oatPestCost: scenarioArray[0].oatPestCost,
        oatSeedCost: scenarioArray[0].oatSeedCost,
        soyMachCost: scenarioArray[0].soyMachCost,
        soyPestCost: scenarioArray[0].soyPestCost,
        soySeedCost: scenarioArray[0].soySeedCost,
        fertNCost: scenarioArray[0].fertNCost,
        fertPCost: scenarioArray[0].fertPCost,
    }
    model_pack = {
        "farm_id": DSS.activeFarm,
        field_id: f["gid"],
        "scenario_id": f["scenario_id"],
        "runModels": runModel,
        "model_parameters":model_para
    }
    console.log(model_pack)
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
                    var yieldGroupLayers = DSS.layer.yieldGroup.getLayers().getArray();
                    console.log(yieldGroupLayers);
                    // if(yieldGroupLayers.length == 0){
                    //     yieldGroupLayers.push(DSS.layer.yield_field);
                    // }
                    // else{
                    //     for(l in yieldGroupLayers){
                    //         //console.log(yieldGroupLayers[l].values_.name)
                    //         //console.log(DSS.layer.yield_field.values_.name)
                    //         if(yieldGroupLayers[l].values_.name == DSS.layer.yield_field.values_.name){
                    //             const index = yieldGroupLayers.indexOf(yieldGroupLayers[l]);
                    //             if(index > -1) {
                    //                 yieldGroupLayers.splice(index,1);
                    //                 console.log("SPLICED :" + DSS.layer.yield_field.values_.name)
                    //             }
                    //             yieldGroupLayers.push(DSS.layer.yield_field);
                    //         }
                    //     }
                    // yieldGroupLayers.push(DSS.layer.yield_field);
                    // Ext.ComponentQuery.query('tabpanel[name="mappedResultsTab"]')[0].setDisabled(false)
                    // }
                }
            }
            break;

        case 'ploss':
            if (model_data.value_type == 'ploss'){
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
                        var plossGroupLayers = DSS.layer.PLossGroup.getLayers().getArray();
                        console.log(plossGroupLayers);
                        // if(plossGroupLayers.length == 0){
                        //     plossGroupLayers.push(DSS.layer.ploss_field);
                        // }
                        // else{
                        //     for(l in plossGroupLayers){
                        //         console.log(plossGroupLayers[l].values_.name)
                        //         console.log(DSS.layer.ploss_field.values_.name)
                        //         if(plossGroupLayers[l].values_.name == DSS.layer.ploss_field.values_.name){
                        //             const index = plossGroupLayers.indexOf(plossGroupLayers[l]);
                        //             if(index > -1) {
                        //                 plossGroupLayers.splice(index,1);
                        //                 console.log("SPLICED :" + DSS.layer.ploss_field.values_.name)
                        //             }
                        //             plossGroupLayers.push(DSS.layer.ploss_field);
                        //         }
                        //     }
                        // plossGroupLayers.push(DSS.layer.ploss_field);
                        // Ext.ComponentQuery.query('tabpanel[name="mappedResultsTab"]')[0].setDisabled(false)
                        // }
                    }
                }
            }
            else if (model_data.value_type == 'ero'){
                chartTypeField = chartObj.soil_loss_field
                chartTypeFarm = chartObj.soil_loss_farm
                if(model_data.scen_id == DSS.activeScenario){
                    console.log(model_data.extent)
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
                        var erosionGroupLayers = DSS.layer.erosionGroup.getLayers().getArray();
                        console.log(erosionGroupLayers);
                        // if(erosionGroupLayers.length == 0){
                        //     erosionGroupLayers.push(DSS.layer.ero_field);
                        // }
                        // else{
                        //     for(l in erosionGroupLayers){
                        //         console.log(erosionGroupLayers[l].values_.name)
                        //         console.log(DSS.layer.ero_field.values_.name)
                        //         if(erosionGroupLayers[l].values_.name == DSS.layer.ero_field.values_.name){
                        //             const index = erosionGroupLayers.indexOf(erosionGroupLayers[l]);
                        //             if(index > -1) {
                        //                 erosionGroupLayers.splice(index,1);
                        //                 console.log("SPLICED :" + DSS.layer.ero_field.values_.name)
                        //             }
                        //             erosionGroupLayers.push(DSS.layer.ero_field);
                        //         }
                        //     }
                        // erosionGroupLayers.push(DSS.layer.ero_field);
                        // Ext.ComponentQuery.query('tabpanel[name="mappedResultsTab"]')[0].setDisabled(false)
                        // }
                    }
                }
            }
            break;
        case 'runoff':
            console.log("runoff")
            console.log(model_data)
            if (model_data.value_type == 'Curve Number'){
                chartTypeFarm = chartObj.cn_num_farm
            }
//            have to handle runoff differently because it deals with an array not a single value
            else if (model_data.value_type == 'Runoff'){

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
            }
            if(model_data.scen_id == DSS.activeScenario){
                console.log(model_data.extent)
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
                    var runoffGroupLayers = DSS.layer.runoffGroup.getLayers().getArray();
                    console.log(runoffGroupLayers);
                    // if(runoffGroupLayers.length == 0){
                    //     runoffGroupLayers.push(DSS.layer.runoff_field);
                    // }
                    // else{
                    //     for(l in runoffGroupLayers){
                    //         console.log(runoffGroupLayers[l].values_.name)
                    //         console.log(DSS.layer.runoff_field.values_.name)
                    //         if(runoffGroupLayers[l].values_.name == DSS.layer.runoff_field.values_.name){
                    //             const index = runoffGroupLayers.indexOf(runoffGroupLayers[l]);
                    //             if(index > -1) {
                    //                 runoffGroupLayers.splice(index,1);
                    //                 console.log("SPLICED :" + DSS.layer.runoff_field.values_.name)
                    //             }
                    //             runoffGroupLayers.push(DSS.layer.runoff_field);
                    //         }
                    //     }
                    // runoffGroupLayers.push(DSS.layer.runoff_field);
                    // Ext.ComponentQuery.query('tabpanel[name="mappedResultsTab"]')[0].setDisabled(false)
                    // }
                }
            }
                break
        case 'bio':
            chartTypeField = chartObj.insecticide_field
            chartTypeFarm = chartObj.insecticide_farm
            break
        case 'econ':
            chartTypeField = chartObj.econ_field
            chartTypeFarm = chartObj.econ_farm
            break
        case 'feed breakdown':
            chartTypeField = chartObj.feed_breakdown
    }
//      field level
// some charts don't have a field level
    if(chartTypeField !== null){
        chartTypeField.units = model_data.units
        chartTypeField.units_alternate = model_data.units_alternate
        let chartVal = null
        if(model_data.sum_cells != null){
            //if econ dont do this
            if(chartTypeField == chartObj.econ_field){
                console.log(chartTypeField)
                console.log(model_data.sum_cells)
                console.log(model_data.counted_cells)
                chartVal = +((model_data.sum_cells).toFixed(2))
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
        //Tomorrow Morning.  add the modal_data values in toolTip into this level of the datasets objects.  Then you can refrence them to build ajdust yields table
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
    if(model_data.sum_cells != null){
        chartTypeFarm.show = true
        if(chartTypeFarm == chartObj.econ_farm){
            console.log(model_data)
            console.log(model_data.sum_cells)
            console.log(model_data.counted_cells)
            chartVal = model_data.sum_cells * model_data.counted_cells
            console.log(chartVal)
            chartCells = model_data.counted_cells
            chartArea = model_data.area
            chartTypeFarm.count[scenIndex] = typeof chartTypeFarm.count[scenIndex] === 'undefined' ? model_data.counted_cells:chartTypeFarm.count[scenIndex] + chartCells
            chartTypeFarm.sum[scenIndex] = typeof chartTypeFarm.sum[scenIndex] === 'undefined' ? /*model_data.sum_cells*/chartVal:chartTypeFarm.sum[scenIndex] + chartVal
            chartTypeFarm.area[scenIndex] = typeof chartTypeFarm.area[scenIndex] === 'undefined' ? model_data.area:chartTypeFarm.area[scenIndex] + chartArea


            chartTypeFarm.units = model_data.units
            chartTypeFarm.units_alternate = model_data.units_alternate

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
			console.log(scenarioArray[i]);
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
	console.log('data coming into ajax call')
	console.log(data)
    $.ajaxSetup({
            headers: { "X-CSRFToken": csrftoken }
        });
    $.ajax({
    'url' : '/grazescape/heiferFeedBreakDown',
    'type' : 'POST',
    'data' : data,
        success: function(responses, opts) {
			console.log('hit heiferFeedBreakDown tool')
			console.log(responses)
            //updating the scenario table with outputs from heieferscape calcs
            runFeedBreakdownUpdate(responses)
            var demandColorSwitch = false
            finalDemandOutput = responses.output[3].toFixed(2)
            console.log(responses.output[3].toFixed(2))
            if(finalDemandOutput < 0){
                demandColorSwitch = true
                finalDemandOutput = Math.abs(finalDemandOutput)
            }
            console.log("ChartObj!!!!!!!!!!!!!!!!&&&*&**&*(((***************")
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
            console.log(chartObj)

			resolve([])
		},
		error: function(responses) {
			console.log('python tool call error')
			console.log(responses)
		}
	})}
)}
// calls to the python to run get_model_results function which either collects data from the model results table, or runs the models on the fields, if they are dirty/new
function get_model_data(data){
    console.log(data)
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
            console.log(responses)
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
                let e = obj.extent;
                if(responses[response].value_type != "dry lot"){
                    //console.log(obj)
                    format_chart_data(obj)
                }
            }
            resolve(responses);
        },

        failure: function(response, opts) {
            me.stopWorkerAnimation();
        },
        //timeout:50
    });
    })
	}
    // function run_econ_model(data){
    //     return new Promise(function(resolve) {
    //     var csrftoken = Cookies.get('csrftoken');
    //     $.ajaxSetup({
    //             headers: { "X-CSRFToken": csrftoken }
    //         });
    //     $.ajax({
    //     'url' : '/grazescape/run_econ_model',
    //     'type' : 'POST',
    //     'data' : data,
    //     'timeout':0,
    //         success: async function(responses, opts) {
    //             console.log(responses)
    //             delete $.ajaxSetup().headers
    //             // if(responses == null){
    //             //     resolve([]);
    //             // }
    //             // for (response in responses){
    //             //     obj = responses[response];
    //             //     if(obj.error || response == null){
    //             //         console.log("model did not run")
    //             //         console.log(obj.error)
    //             //         if(!modelError){
    //             //             alert(obj.error);
    //             //             modelErrorMessages.push(obj.error)
    //             //             modelError = true
    //             //         }
    //             //         continue
    //             //     }
    //             //     let e = obj.extent;
    //             // }
    //             resolve(responses);
    //         },
    
    //         failure: function(response, opts) {
    //             console.log(responses)
    //             me.stopWorkerAnimation();
    //         },
    //         //timeout:50
    //     });
    //     })
    // }
//validates images?  Not sure, Havent worked with 
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
    //console.log(element)
    //console.log(chartObj)
    //console.log(data)
    let barchart = new Chart(element, {
        type: 'bar',
        data: data,
        plugins: [ChartDataLabels],
        options: {
            responsive: true,
            skipNull:true,
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
                        //console.log(data)
                        //console.log(value)
                        //console.log(chartObj)
                        //console.log(context)
                        //console.log(context.dataset)
                        if(value !== null){
                            return context.dataset.label//"hi there!"//context.chart.data.datasets[context.dataIndex].label
                        ;}//context.dataset.label
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
                    text: title
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
                                return [
                                "Rotation: " + farmAccMapping(tooltipPath[1]),
                                "Grass Type: " + tooltipPath[2]]
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
     'dr':'Corn Silage to Corn Grain to Alfalfa(3x)',
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
                         console.log(context)
                        return [context.label + ": " + context.dataset.data[context.dataIndex]]
                    },
                    footer: function(context) {

                        console.log(context)
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
        console.log('field')
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
        chartData.useAlternate = false
        divideArea = true
//        conv = 1/area
    }
    else{
//        btnObject.setText('Average Yield / Area')
        chartData.chart.options.scales.y.title.text= chartData.units_alternate;
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
     infraVar : [
//     "Total Fence Length", "Total Fence Cost",
//     "Total Water Line Distance", "Total Water Line Cost", "Total Lane Distance",
//     "Total Lane Cost", "Total Water Tanks Cost"
     ]
    }
    checkBoxReturn = {}
    for (group in boxes){
        console.log(group)
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
    console.log("scen index is ", baseIndex, baseScen)
    chartObj.compare_farm.chartData.labels = []
    let checkBoxCounter = 0
    let checkYield = Ext.getCmp('checkYield').getChecked()
    let checkErosion = Ext.getCmp('checkErosion').getChecked()
    let checkNutrients = Ext.getCmp('checkNutrients').getChecked()
    let checkRunoff = Ext.getCmp('checkRunoff').getChecked()
    let checkInsecticide = Ext.getCmp('checkInsecticide').getChecked()
    checkBoxArr = []
//  combine all the checkbox section into one array
    checkBoxArr = checkYield.concat(checkErosion,checkNutrients,checkRunoff,checkInsecticide)
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
        console.log(name, type, isTotal)
        console.log(type)

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

        console.log("scenario base value is ", scenBaseVal)
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
    console.log(datasets)
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
    console.log("getting wfs scenarios")
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
    console.log("getting wfs fields")
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
    console.log("getting wfs farm")
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
    console.log("getting wfs farm")
    let fieldList = []
    let fieldIdList = []
    let field_dic = {}
    return geoServer.makeRequest(fieldUrl1,"","", geoServer).then(function(returnData){
        let responses =JSON.parse(returnData.geojson)
            for(response in responses.features){
                let field = responses.features[response].properties.field_name
                console.log(field)
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
    console.log("getting wfs farm")
    let fieldList = []
    let fieldIdList = []
    let field_dic = {}
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
function printSummary(){
    var pdf = new jsPDF();
    let activeTab = Ext.getCmp("mainTab").getActiveTab()
    scenName = chartDatasetContainer.getScenName(DSS.activeScenario)
    let mainTabLength = Ext.getCmp("mainTab").items.length
    let mainTabs = Ext.getCmp("mainTab").items.items
    for (let mainTab in mainTabs ){
        console.log(mainTab)
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
////    make the summary tab the active tab when done.
    Ext.getCmp("mainTab").setActiveTab(activeTab)

//
    var pdf = new jsPDF('l', 'in', 'letter')
//    var pdf = new jsPDF({
//            unit:'px',
//            format:'a4'
//        });;
    setTimeout(() => {
        for (chart in chartList){
            canvas = document.getElementById(chartList[chart])
            console.log(canvas)
            if(canvas == null){
                continue
            }
//            if(chartList[chart]) == ""){
//                continue
//            }
            var newCanvas = canvas.cloneNode(true);
            var ctx = newCanvas.getContext('2d');
            ctx.fillStyle = "#FFF";
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
            ctx.drawImage(canvas, 0, 0);
            var imgData = newCanvas.toDataURL("image/jpeg");
//            pdf.addImage(imgData, 'JPEG', 0, 0);
            pdf.addImage(imgData, 'JPEG', 0, 0,8, 4.4);
            pdf.addPage(imgData,'landscape')
        }
        pdf.save(chartDatasetContainer.farmName + "_Charts.pdf");
    }, 1000);
    let type = "csv";
//    filename = chartDatasetContainer.farmName + "_model_data.csv"
//    let file_name = "GrazeScape_Summary.csv"

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
    console.log("getting wfs fields");
    let fieldList = []
    let fieldIdList = []
     geoServer.makeRequest(fieldUrl_results,"","", geoServer).then(function(returnData){
        let responses =JSON.parse(returnData.geojson)
            let csvMain = []

		    let csvHeader = Object.keys(responses.features[0].properties)
		    let csvText = ""
		    let index = csvHeader.indexOf("cell_count");
            if (index > -1) csvHeader.splice(index, 1);
            index = csvHeader.indexOf("farm_id");
            if (index > -1) csvHeader.splice(index, 1);
//            index = csvHeader.indexOf("scenario_id");
//            if (index > -1) csvHeader.splice(index, 1);
            for (head in csvHeader){
		        csvText = csvText + csvHeader[head] + ","
		    }
            csvText = csvText + "\n"
            for(response of Object.keys(responses.features)){
                let field_att_list = []
                console.log("################################")
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

//		}
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
                console.log("################################")
                for(col of Object.keys(responses.features[response].properties)){
                    let cell_count = responses.features[response].properties["cell_count"]
                    if(col == "gid" || col == "farm_id"|| col == "id"){
//                            field_att_list.push("place holder")
//                            csvText = csvText + responses.features[response].properties[col] + ","
//                            csvText = csvText + responses.features[response].properties[col] + ","

                            continue
                        }
                    else if(col== "field_id" ){
//                        field_att_list.push("Test field 1")
                        csvText = csvText + chartDatasetContainer.allFields[responses.features[response].properties[col]] + ","
                    }
                    else if(col== "scenario_id" ){
//                        field_att_list.push("Test field 1")
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
        console.log(fieldIter)
        layer = DSS.layer.fields_1
        let downloadCount = 0
        let numFields = fieldIter.length
        for(item in fieldIter){
            f = fieldIter[item].properties
            if(f["is_dirty"] == false){
                downloadCount = downloadCount + 1
                 if(downloadCount==numFields){
                    console.log(downloadCount, numFields)
                    console.log("All files downloaded")
                    resolve(downloadCount)
                }
                continue
            }
            geometry = fieldIter[item]
            model_para = {
                f_name: f["field_name"],
                field_id: f["gid"],
                extent: geometry.bbox,
                // at this point fields wont have any holes so just get the first entry
                field_coors: geometry.geometry.coordinates[0],
                active_region: DSS.activeRegion
            }

            console.log("MODEL PARAS!!!!!!!!!!!!!!!")
            console.log(model_para)
            downloadRastersRequest(model_para).then(function(value){
                downloadCount = downloadCount + 1
                console.log(downloadCount)
                console.log(value)
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
                console.log(responses)
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
            //added by ZJH to reorder this.scenarios
            this.scenarios.sort(function(a, b){return a.dbID - b.dbID})

            for(let scen in this.scenarios){
                 console.log(this.scenarios[scen])
                 
                 if(this.scenarios[scen].dbID == DSS.activeScenario){
                    console.log("Active Scenario Hit")
                    var first = this.scenarios[scen]
                    this.scenarios.sort(function(x,y){ return x.dbID == first.dbID ? -1 : y.dbID == first.dbID ? 1 : 0; });
                    console.log(this.scenarios)
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
        console.log(this.scenarios)
        for(let scen in this.scenarios){
            let checkBox = {
                boxLabel  : this.scenarios[scen].name,
                    id: "checkBox_scen_"+counter,
                    checked: true,
                    name: 'farm',
                    dbID: this.scenarios[scen].dbID,
                    listeners:{change: function(box, newVal, oldVal, e) {
                        console.log(box)
                        hideData(box.name, box.boxLabel,box.dbID)
                    }}
            }
            counter = counter + 1
//            Ext.getCmp('fieldScen').add(checkBox)
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
//            Ext.getCmp('fieldLegend').add(checkBox)
        }
    }
    getFields(){
        return new Promise(resolve =>{
            let counter = 0
            retrieveFieldsGeoserver().then(results =>{
                console.log(results)
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
            let counter = 0
            retrieveScenariosGeoserver().then(results =>{
            let {scenList, scenIdList} =  results
                console.log(scenList)
                console.log(scenIdList)
        //        let scenList = ['Scenario 2','Scenario 1','Scenario 3']
        //        scenList.sort()
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
        let match = null
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
            // if(foundMatch){
            //     match = this.fields[field]
            // }
        }
        // if (match != null){
        //     return match.color
        // }
        if(scenId === DSS.activeScenario && type === 'field'){
            console.log('HIT ACTIVE SCENARIO AND FIELD')
            console.log(index)
            console.log(geom)
            console.log(scenId)
            console.log(type)
            return chartColorsAS[index % chartColorsAS.length]
        }
        if(scenId != DSS.activeScenario && type === 'field'){
            console.log(index)
            console.log(geom)
            console.log(scenId)
            console.log(type)
            return chartColors[index % chartColors.length]
        }
        if(scenId === DSS.activeScenario && type === 'scen'){
            console.log('HIT ACTIVE SCENARIO AND SCENARIO')
            console.log(index)
            console.log(geom)
            console.log(scenId)
            console.log(type)
            return chartColorsAS[index % chartColorsAS.length]
        }
        if(scenId != DSS.activeScenario && type === 'scen'){
            console.log(index)
            console.log(geom)
            console.log(scenId)
            console.log(type)
            return chartColors[index % chartColors.length]
        }
    }
//    sort fields alphabetically(so they show in same order on each graph) and choose color.
//@ param setName Name of scenario
//@ type field or scen
//@ id primary key of the scenario or field
// return index of field
    addSet(setName, type, id, index, geom="",scenId){
        console.log(type)
        console.log(scenId)
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
        var found = false
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
        let counter = 0
        for (let field in this.fields){
            field_list.push(this.fields[field].name)
        }
        return field_list

    }
    getScenarioList(){
        let scen_list = []
        console.log(this.scenarios)
        let scenariosList2 = this.scenarios
        for (let scen in this.scenarios){
            console.log(this.scenarios[scen])
            //if(this.scenarios[scen].dbID == DSS.activeScenario){
            //    scen_list.unshift(this.scenarios[scen].name)
            //}else{
            scen_list.push(this.scenarios[scen].name)
           // }
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

    hideField(fieldName){

    }
    hideScenario(scenarioName){

    }
}
