modelResult = {}
var modelError = false
var modelErrorMessages = []
function populateChartObj(chartObj, scenList, fieldList, allField, allScen){
// need to get a list of scenarios here
//    list of every chart currently in app

    for (chart in chartList){

        chartName = chartList[chart]

        if(chartName.includes('field')){
            node = new ChartData()
            node.chartData =  {
                labels : scenList,
                datasets: [],
                chartDataOri:[],
                chartDataLabelsOri:[]
            }
            for (let field in fieldList){
                data1 = {
                    label: fieldList[field],
                    dbID: allField[field].dbID,
                    // each data entry represents a scenario
                    data: [],
                    hidden:false,
                    backgroundColor:  chartColors[field % chartDatasetContainer.colorLength],
                    minBarLength: 7
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
                    datasets: []
                }
                 for (let scen in scenList){
                    node.sum[scen] = [0];
                }

            }
            else{
                node.chartData =  {
                    labels : ['Scenarios'],
                    datasets: []
                }
            }

            for (let scen in scenList){
                data1 = {
                    label: scenList[scen],
                    dbID: allScen[scen].dbID,

                    // each data entry represents a scenario
                    data: [],
                    backgroundColor:  chartColors[scen % chartDatasetContainer.colorLength],
                    borderColor: chartColors[scen % chartDatasetContainer.colorLength],
                    minBarLength: 7
                }
                node.chartData.datasets[scen] = data1
                node.chartData.chartDataLabelsOri = ['Scenarios']
                node.fieldSum[scen] = []
                node.areaSum[scen] = []
            }
            node.chartData.chartDataOri = new Array(scenList.length).fill(0)

        }
//        else{
//             node = new ChartData()
//            node.chartData =  {
//                labels : scenList,
//                datasets: [],
//                chartDataOri:[],
//                chartDataLabelsOri:[]
//            }
//
//        }
//        console.log(chartName)
        chartObj[chartName] = node
        chartObj[chartName].chart = null

    }
}

function build_model_request(f, modelChoice, activeScenario){
    if(activeScenario){

        let lac_grass_multi = null
        let hei_grass_multi = null
        let dry_grass_multi = null
        let graze_factor = 1
        console.log(f)
        DSS.layer.scenarios.getSource().forEachFeature(function(g) {
            var scenarioFeature = g;
            if(DSS.activeScenario === scenarioFeature.values_.scenario_id){
                console.log(scenarioFeature);
                lac_grass_multi = scenarioFeature.get("lac_rotate_freq")
                hei_grass_multi = scenarioFeature.get("beef_rotate_freq")
                dry_grass_multi = scenarioFeature.get("dry_rotate_freq")
            }
        })
    //	TODO this needs to be redone once the rotation checkboxes are fixed
        if(f.get("graze_beef_cattle")){
            graze_factor = hei_grass_multi
        }
        if(f.get("graze_dairy_cattle")){
            graze_factor = lac_grass_multi
        }
        if(f.get("graze_dairy_non_lactating")){
            graze_factor = dry_grass_multi
        }
        if(graze_factor == null || graze_factor == undefined){
            graze_factor = 1
        }
        let rotation_split = f.get("rotation").split("-")
        crop = rotation_split[0]
        rotation = rotation_split.length > 1 ?rotation_split[1]:null
        model_para = {
            f_name: f.get("field_name"),
            extent: f.getGeometry().getExtent(),
            // at this point fields wont have any holes so just get the first entry
            field_coors: f.getGeometry().getCoordinates()[0],
            grass_type: f.get("grass_speciesval"),
    //            need to convert this to integer
            contour: f.get("on_contour")?1:0,
            soil_p: f.get("soil_p"),
            tillage: f.get("tillage"),
            fert: f.get("fertilizerpercent"),
            manure: f.get("manurepercent"),
            crop:crop,
            area:f.getGeometry().getArea(),
            crop_cover: f.get("cover_crop"),
    //			doesn't appear to be in the table at this time
            rotation: rotation,
            rotationFreq:"",
            density: f.get("grazingdensityval"),
    //      comes from the the looping var in Dashboard.js
            model_type: modelChoice,
            graze_factor:graze_factor,
            scen: chartDatasetContainer.getScenName(f.get("scenario_id")),
        }
        model_pack = {
            "farm_id": DSS.activeFarm,
            field_id: f.get("gid"),

            "scenario_id": f.get("scenario_id"),
            "isActiveScen": f.get("scenario_id") == DSS.activeScenario,
            "model_parameters":model_para
        }
    }
    else{
        model_para = {
            f_name: f["field_name"],
            model_type: modelChoice,
            scen: chartDatasetContainer.getScenName(f["scenario_id"]),
        }
        model_pack = {
            "farm_id": DSS.activeFarm,
            field_id: f["gid"],
            "scenario_id": f["scenario_id"],
            "isActiveScen": f["scenario_id"] == DSS.activeScenario,
            "model_parameters":model_para
        }

    }
    console.log(model_pack)
    return model_pack
}
function format_chart_data(model_data){
    console.log("Model data")
    console.log(model_data)
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
    switch (model_data.model_type) {
        case 'yield':
            switch (model_data.value_type){
            case 'Grass':
                chartTypeField = chartObj.grass_yield_field
                chartTypeFarm = chartObj.grass_yield_farm
                break
            case 'Corn Grain':
                chartTypeField = chartObj.corn_yield_field
                chartTypeFarm = chartObj.corn_yield_farm
                break
            case 'Corn Silage':
                chartTypeField = chartObj.corn_silage_yield_field
                chartTypeFarm = chartObj.corn_silage_yield_farm
                break
            case 'Soy':
                chartTypeField = chartObj.soy_yield_field
                chartTypeFarm = chartObj.soy_yield_farm
                break
            case 'Alfalfa':
                chartTypeField = chartObj.alfalfa_yield_field
                chartTypeFarm = chartObj.alfalfa_yield_farm
                break
            case 'Oats':
                chartTypeField = chartObj.oat_yield_field
                chartTypeFarm = chartObj.oat_yield_farm
                break
            case 'Rotational Average':
                chartTypeField = chartObj.rotation_yield_field
                chartTypeFarm = chartObj.rotation_yield_farm
                break
            }
            break;

        case 'ploss':

            if (model_data.value_type == 'ploss'){
                chartTypeField = chartObj.ploss_field
                chartTypeFarm = chartObj.ploss_farm

            }
            else if (model_data.value_type == 'ero'){
                chartTypeField = chartObj.soil_loss_field
                chartTypeFarm = chartObj.soil_loss_farm
            }
            break;
        case 'runoff':
            console.log("runoff")
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
                    chartTypeFarm.chart.options.scales.yAxes[ 0 ].scaleLabel.labelString = chartTypeFarm.units;
                    chartTypeFarm.chart.update()
                }
            return
            }

            break
        case 'bio':
            chartTypeField = chartObj.insecticide_field
            chartTypeFarm = chartObj.insecticide_farm
            break
        case 'econ':
            break
    }
//      field level
// some charts don't have a field level
    if(chartTypeField !== null){
        chartTypeField.units = model_data.units
        chartTypeField.units_alternate = model_data.units_alternate
        let chartVal = null
        if(model_data.sum_cells != null){
            console.log("sum not null")
            chartVal = +((model_data.sum_cells/model_data.counted_cells).toFixed(2))
        }
        else{
            console.log(model_data.sum_cells)
            console.log(chartVal)
            chartVal = null
            console.log(chartVal)
        }
        chartTypeField.chartData.datasets[fieldIndex].data[scenIndex] =  chartVal
        chartTypeField.area[fieldIndex] =  model_data.area
        // creating a backup to pull data from
        chartTypeField.chartData.chartDataOri[fieldIndex][scenIndex] =  chartVal
         if(chartTypeField.chart !== null){
            chartTypeField.chart.update()
            chartTypeField.chart.options.scales.yAxes[ 0 ].scaleLabel.labelString = chartTypeField.units;
        }
    }
//      farm level
    //initialize sum and count if they havent been already
    let chartVal = null
    let chartCells = null
    let chartArea = null
    if(model_data.sum_cells != null){
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



        chartTypeFarm.chartData.datasets[scenIndex].data =[chartTypeFarm.get_avg(scenIndex)]
        // creating a backup to pull data from
        chartTypeFarm.chartData.chartDataOri[scenIndex]=[chartTypeFarm.get_avg(scenIndex)]

        if(chartTypeFarm.chart !== null){
            chartTypeFarm.chart.update()
            //    set units on graph directly so it displays
            chartTypeFarm.chart.options.scales.yAxes[ 0 ].scaleLabel.labelString = chartTypeFarm.units;

    }

    }




}
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
        success: function(responses, opts) {
            console.log(responses)
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
                let e = obj.extent;
//              not doing the dem for beta launch
                console.log("@@@@@@@@@@@@@@@@")
                console.log(responses[response].value_type)
//                only display erosion on the map
                if (responses[response].value_type == 'ero'&&responses[response].scen_id==DSS.activeScenario){
                    console.log("There is erosion")
                    pt1 = [e[0],e[3]]
                    pt2 = [e[2],e[3]]
                    pt3 = [e[2],e[1]]
                    pt4 = [e[0],e[1]]

                    let p = new ol.geom.Polygon([
                        [pt1, pt2, pt3, pt4, pt1]
                    ]);
                    modelResult = new ol.layer.Image({
                        updateWhileAnimating: true,
                        updateWhileInteracting: true,
                        source: new ol.source.ImageStatic({
                            imageSmoothing: false,
                            projection: 'EPSG:3857',
                            // Something is required here or there will be an exception whilst trying to draw this layer
                            imageExtent: [
                                44240,328120,
                                448350,335420
                            ],
                        })
                    });
                    //DSS.map.addLayer(modelResult)
//                    validateImageOL(obj, DSS.layer.ModelResult);
                    validateImageOL(obj, modelResult);
                    //DSS.map.addLayer(modelResult)
                    // let s = DSS.layer.ModelBox.getSource();
                    // s.clear();
                    // s.addFeature(new ol.Feature({
                    //     geometry: p
                    // }));
                    //DSS.MapState.showContinuousLegend(obj.palette, obj.values);
                }

                if(responses[response].value_type != "dry lot"){
                    format_chart_data(obj)
                }
            }
            resolve(responses);
        },

        failure: function(response, opts) {
            me.stopWorkerAnimation();
        }
    });
    })

	}
function removeModelResults(){
        console.log(modelResult)
        console.log(DSS.map.getLayers())
        DSS.map.removeLayer(modelResult)
		//Ext.getCmp("btnRemoveModelResults").setDisabled(true)
    }

//---------------------------------------------------------------------------------
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

function create_graph(chart,title,element){
    units = chart.units
    data = chart.chartData
    let barchart = new Chart(element, {
        type: 'bar',
        data: data,
//        data:
//        {
//          x axis labels (scenarios)
//        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
////        labels: ['Red', 'Blue'],
//        datasets: [{
//              label of dataset
//            label: '# of Votes',
//          each entry in data is the average from a scenario
//            data: [12, 19, 3, 5, 2, 3],
//            backgroundColor: [
//                'rgba(247, 148, 29, 1)',
//                'rgba(29, 48, 58, 1)',
//                'rgba(140, 156, 70, 1)',
//                'rgba(51, 72, 86, 1)',
//                'rgba(196, 213, 76, 1)',
//                'rgba(117, 76, 41, 1)'
//            ],
//            borderColor: [
//                'rgba(247, 148, 29, 1)',
//                'rgba(29, 48, 58, 1)',
//                'rgba(140, 156, 70, 1)',
//                'rgba(51, 72, 86, 1)',
//                'rgba(196, 213, 76, 1)',
//                'rgba(117, 76, 41, 1)'
//            ],
//            borderWidth: 1
//        }]
//    },/
        options: {
            responsive: true,
//            maintainAspectRatio: false,
            legend: {
                position: 'top',
                test1: "Hi everyone!",
                onClick: function (event, legendItem, legend){
                    console.log(event, legendItem, legend)
                    name = legendItem.text
                    console.log(event.path[0].id)
                    if (event.path[0].id.includes('field')){
                        dbID = chartDatasetContainer.fields[legendItem.datasetIndex].dbID
                    }
                    else{
                        dbID = chartDatasetContainer.scenarios[legendItem.datasetIndex].dbID

                    }

                    hideData(event.path[0].id, name, dbID)

                },
            },
            title: {
                display: true,
                text: title
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        maxTicksLimit:5,
                    },
                    scaleLabel: {
                    display: true,
                    labelString: units
                  }
                }]
            },

        }
    });
    return barchart
}
function create_graph_line(chart,title,element){
    units = chart.units
    data = chart.chartData
    let barchart = new Chart(element, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
//            maintainAspectRatio: false,
            legend: {
                position: 'top',
                onClick: function (event, legendItem, legend){
                    console.log(event, legendItem, legend)
                    name = legendItem.text
                    console.log(event.path[0].id)
                    if (event.path[0].id.includes('field')){
                        dbID = chartDatasetContainer.fields[legendItem.datasetIndex].dbID
                    }
                    else{
                        dbID = chartDatasetContainer.scenarios[legendItem.datasetIndex].dbID

                    }
                    hideData(event.path[0].id, name,dbID)

                },
            },
            title: {
                display: true,
                text: title
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        maxTicksLimit:5,
                    },
                    scaleLabel: {
                    display: true,
                    labelString: units
                  }
                }],
                xAxes:[{
                    scaleLabel:{
                        display:true,
                        labelString: "Rain Event [in]"
                    }

                }]
            }
        }
    });
    return barchart
}
function create_graph_radar(chart,title,element){
    data = chart.chartData
    let barchart = new Chart(element, {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
//            maintainAspectRatio: false,

            title: {
                display: true,
                text: title
            },
             scale: {

                beginAtZero: true,
                min:0,
                    ticks: {
                        beginAtZero: true,
                        min:0,
//                        maxTicksLimit:5,
                    },


            },
            legend: {
                position: 'top',
                onClick: function (event, legendItem, legend){
                    console.log(event, legendItem, legend)
                    name = legendItem.text
                    console.log(event.path[0].id)
                    if (event.path[0].id.includes('field')){
                        dbID = chartDatasetContainer.fields[legendItem.datasetIndex].dbID
                    }
                    else{
                        dbID = chartDatasetContainer.scenarios[legendItem.datasetIndex].dbID

                    }
                    hideData(event.path[0].id, name,dbID)

                },
            },
            tooltips: {
                callbacks: {
                  label: function(tooltipItem, data) {
                    console.log(tooltipItem, data)
                    var dataset = data.datasets[tooltipItem.datasetIndex];
                    var index = tooltipItem.index;
                    console.log(dataset.label)
                    console.log(dataset.data[index])
                    return dataset.label + ": " + dataset.data[index];

              }
            }
          },
          plugins: {
              datalabels: {
                formatter: function(value, context) {
                    console.log("************************************************")
                  return 'line1\nline2\n' + value;
    //              return context.chart.data.labels[context.dataIndex];
                }
              }
          }


        }
    });
    return barchart
}

// name of the chart and the name of the field or scenario
function hideData(chartName, datasetName,dbID){
    console.log("Check box clicked!!!!!!!!!!!!!!!!!1")
    console.log(chartName)
    console.log(datasetName)
    console.log(dbID)
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
        console.log('farm')
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
                chartObj[chartLoop].chart.update()
            }
        }
    }
}

function displayAlternate(chartName, btnId){
    chartDatasets = chartObj[chartName].chartData.datasets
    chartData = chartObj[chartName]
    console.log(chartObj[chartName])
    btnObject = Ext.getCmp(btnId)
    divideArea = true


//    switch back to yield by area
    if(chartData.useAlternate){
        btnObject.setText('Average Yield')
        console.log("Switching to Yield per area@@@@@@@@@@@@@@@@@@@@@2")
        chartData.chart.options.scales.yAxes[ 0 ].scaleLabel.labelString = chartData.units;

        chartData.useAlternate = false
        divideArea = true
//        conv = 1/area

    }
    else{
        btnObject.setText('Average Yield / Area')
        chartData.chart.options.scales.yAxes[ 0 ].scaleLabel.labelString = chartData.units_alternate;
        console.log("Switching to Yield  Total &&&&&&&&&&&&&&&&&&&&")

        chartData.useAlternate = true
//        conv = area
        divideArea = false
    }
    for (data in chartDatasets){
        console.log(chartData)
        if(chartData.area[data]!= undefined){
        console.log(chartData.area[data])
            for(set in chartDatasets[data].data){
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
    console.log(checkBoxReturn)
    return checkBoxReturn
}
function populateRadarChart(){
    console.log("Populate radar chart")
    let baseScen = Ext.getCmp('scenCombobox').getValue()
//    console.log(baseScen)
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

//    console.log(checkYield)
//  combine all the checkbox section into one array
    checkBoxArr = checkYield.concat(checkErosion,checkNutrients,checkRunoff,checkInsecticide)
    checkBoxArr.concat(checkYield)
//    console.log(checkBoxArr)
//    console.log(checkBoxArr.length)
//    set base scenario to have value of 1

    if(checkBoxArr.length > 9){
        console.log("too many boxes")
        return
    }
//    for (let i = 0; i < checkBoxArr.length; i++ ){
//        chartObj.compare_farm.chartData.datasets[0].data[i] = 1
//
//    }
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
            console.log("5 in storm!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            scenBaseVal = chartObj[type].chartData.datasets[baseIndex].data[9]

        }

        if(isTotal&& chartObj[type].useAlternate != true){
            scenBaseVal = scenBaseVal * chartObj[type].area[baseIndex]
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

            console.log("$$$$$$$$$$$")
//            console.log(data)
//            console.log(scen_data[data])
//            console.log(scen_data[data].data[0])
//            console.log(scen_data[0].data[data])
//            each data series on a scenario chart only has one entry
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
            console.log(scenBaseVal)
            console.log(currentData)
            if (isTotal && chartObj[type].useAlternate != true){
                currentData = currentData * chartObj[type].area[data]
            }
//            if (currentData == undefined){
//                currentData = scenBaseVal
//            }
//            if (scenBaseVal == undefined){
//                scenBaseVal = currentData
//            }
//            if(scenBaseVal == 0){
//                scenBaseVal = 1
//            }
            console.log(scenBaseVal)
            console.log(currentData)
//            if (data != scenIndex){
            chartObj.compare_farm.chartData.datasets[data].data[i] = +((currentData / scenBaseVal).toFixed(2))
//                chartObj.compare_farm.chartData.datasets[j].data[i] = 2
            j++
//            }
        }
        i++
    }

//    let checkInfrastructur = Ext.getCmp('checkInfrastructur').getChecked()
//    console.log(baseScen, scenIndex,checkBoxCounter )
    //    check each checkbox group for checked boxes (max 8)
     if(chartObj.compare_farm.chart !== null){
        chartObj.compare_farm.chart.options.title.text = chartObj.compare_farm.title
        chartObj.compare_farm.chart.update()

     }

}
// Retrieves all scenarios associated with active farm
function retrieveScenariosGeoserver(){

//    DSS.activeFarm = 1
	let fieldUrl1 =
	'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
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

	$.ajax({
		jsonp: false,
		type: 'GET',
		url: fieldUrl1,
		async: false,
		dataType: 'json',
		success:function(responses)
		{
            for(response in responses.features){
                let scen = responses.features[response].properties.scenario_name
                let scenID = responses.features[response].properties.scenario_id
                scenList.push(scen)
                scenIdList.push(scenID)
            }

		}
	})
	console.log(scenList)
	console.log(scenIdList)
//	only for testing before merging
//	scenIdList = [40, 35]
//	scenList = ["Base", "Other"]
    console.log(scenList)
	return {scenList, scenIdList}
}
function retrieveFieldsGeoserver(){
//    DSS.activeScenario = 40
//    DSS.activeFarm = 1

    let fieldUrl1 =
	'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:field_2&' +
//	'CQL_filter=farm_id='+DSS.activeFarm+' AND scenario_id='+DSS.activeScenario +
	'CQL_filter=farm_id='+DSS.activeFarm +
	'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';
    console.log("getting wfs fields")
    let fieldList = []
    let fieldIdList = []
	$.ajax({
		jsonp: false,
		type: 'GET',
		url: fieldUrl1,
		async: false,
		dataType: 'json',
		success:function(responses)
		{
			console.log(responses)
            for(response in responses.features){
                let field = responses.features[response].properties.field_name
                console.log(field)
                let fieldID = responses.features[response].properties.gid
                fieldList.push(field)
                fieldIdList.push(fieldID)
                console.log(fieldList)
            }

		}
	})
    console.log(fieldList)
    console.log(fieldIdList)
    console.log(fieldList)
    return {fieldList, fieldIdList}
}
function retrieveFarmGeoserver(){
// DSS.activeScenario = 40
//    DSS.activeFarm = 1

    let fieldUrl1 =
	'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:farm_2&' +
	'CQL_filter=id='+DSS.activeFarm+
	'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';
    console.log("getting wfs farm")
    let farmName = ''

	$.ajax({
		jsonp: false,
		type: 'GET',
		url: fieldUrl1,
		async: false,
		dataType: 'json',
		success:function(responses)
		{
			console.log(responses)
            for(response in responses.features){
                farmName = responses.features[response].properties.farm_name

            }

		}
	})
    return farmName
}
function retrieveAllFieldsFarmGeoserver(){
// DSS.activeScenario = 40
//    DSS.activeFarm = 1

    let fieldUrl1 =
	'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:field_2&' +
	'CQL_filter=id='+DSS.activeFarm+
	'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';
    console.log("getting wfs farm")
    let fieldList = []
    let fieldIdList = []
    let field_dic = {}
	$.ajax({
		jsonp: false,
		type: 'GET',
		url: fieldUrl1,
		async: false,
		dataType: 'json',
		success:function(responses)
		{
			console.log(responses)
            for(response in responses.features){
                let field = responses.features[response].properties.field_name
                console.log(field)
                let fieldID = responses.features[response].properties.gid
//                fieldList.push(field)
//                fieldIdList.push(fieldID)
//                console.log(fieldList)
                field_dic[fieldID] = field
            }

		}
	})
    return field_dic
}
function retrieveAllFieldsDataGeoserver(){
// DSS.activeScenario = 40
//    DSS.activeFarm = 1

    let fieldUrl1 =
	'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:field_2&' +
	'CQL_filter=id='+DSS.activeFarm+
	'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';
    console.log("getting wfs farm")
    let fieldList = []
    let fieldIdList = []
    let field_dic = {}
    let responsesField = []
	$.ajax({
		jsonp: false,
		type: 'GET',
		url: fieldUrl1,
		async: false,
		dataType: 'json',
		success:function(responses)
		{
			console.log(responses)
            for(response in responses.features){
                let field = responses.features[response].properties.field_name
                responsesField.push(responses.features[response].properties)
            }

		}
	})
    return responsesField
}
function printSummary(){
    var pdf = new jsPDF();
    scenName = chartDatasetContainer.getScenName(DSS.activeScenario)
    let mainTabLength = Ext.getCmp("mainTab").items.length
    let mainTabs = Ext.getCmp("mainTab").items.items
    for (let mainTab in mainTabs ){
        Ext.getCmp("mainTab").setActiveTab(parseFloat(mainTab))
        subTabs = mainTabs[parseFloat(mainTab)].items.items
        for(let subTab in subTabs){
            console.log(subTab)
            Ext.getCmp("mainTab").items.items[parseFloat(mainTab)].setActiveTab(parseFloat(subTab))
        }
    }
////    make the summary tab the active tab when done.
//// TODO probably should get some kind of ref to the sum tab instead of hardcoded value
    Ext.getCmp("mainTab").setActiveTab(9)

//
    var pdf = new jsPDF()
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
            pdf.addPage(imgData,'landscape')
            pdf.addImage(imgData, 'JPEG', 0, 0);
        }
        pdf.save(chartDatasetContainer.farmName + "_Charts.pdf");
    }, 1000);
    let type = "csv";
//    filename = chartDatasetContainer.farmName + "_model_data.csv"
//    let file_name = "GrazeScape_Summary.csv"

    let fieldUrl_results =
	'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:field_model_results&' +
	'CQL_filter=farm_id='+DSS.activeFarm+
	'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';
    console.log("getting wfs fields");
    let fieldList = []
    let fieldIdList = []
	$.ajax({
		jsonp: false,
		type: 'GET',
		url: fieldUrl_results,
		async: false,
		dataType: 'json',
		success:function(responses){
            let csvMain = []

		    let csvHeader = Object.keys(responses.features[0].properties)
		    let csvText = ""

//		    csvMain.push(csvHeader)
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
//                console.log(response)
                let field_att_list = []
                console.log("################################")
                for(col of Object.keys(responses.features[response].properties)){
                    let cell_count = responses.features[response].properties["cell_count"]
                    if(col == "cell_count" || col == "farm_id"){
//                            field_att_list.push("place holder")
//                            csvText = csvText + responses.features[response].properties[col] + ","
//                            csvText = csvText + responses.features[response].properties[col] + ","

                            continue
                        }
                    else if(col== "field_id" ){
                        field_att_list.push(chartDatasetContainer.getFieldName(responses.features[response].properties[col]))
//                        field_att_list.push("Test field 1")
                        csvText = csvText + chartDatasetContainer.allFields[responses.features[response].properties[col]] + ","

                    }
                    else if(col== "scenario_id" ){
                        field_att_list.push(chartDatasetContainer.getScenName(responses.features[response].properties[col]))
//                        field_att_list.push("Test field 1")
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

		}
	})


    let fieldUrl2 =
	'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:infrastructure_2&' +
	'CQL_filter=farm_id='+DSS.activeFarm+
	'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';
    $.ajax({
		jsonp: false,
		type: 'GET',
		url: fieldUrl2,
		async: false,
		dataType: 'json',
		success:function(responses){
            let csvMain = []

		    let csvHeader = Object.keys(responses.features[0].properties)
		    let csvText = ""

//		    csvMain.push(csvHeader)
		    let index = csvHeader.indexOf("gid");
            if (index > -1) csvHeader.splice(index, 1);
            index = csvHeader.indexOf("id");
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
//                console.log(response)
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

		}
	})



}
class ChartDatasetContainer{
    constructor() {
        this.fields = []
        this.scenarios = []
        this.farmName = retrieveFarmGeoserver()
        this.farmID = DSS.activeFarm

//        this.fieldsDBID = []
//        this.scenDBID = []
        this.colorIndex = 0
        this.chartColors = [
                '#EE7733', '#0077BB', '#33BBEE', '#EE3377', '#CC3311',
                    '#009988', '#BBBBBB'
            ]
        this.colorLength = chartColors.length
        this.getFields()
        this.getScenarios()
        this.allFields = retrieveAllFieldsFarmGeoserver
        this.setCheckBoxes()

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
                        console.log(box)
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
        let counter = 0
        let {fieldList, fieldIdList} = retrieveFieldsGeoserver()
        console.log(fieldList)
        // get every field associated with active scenario
//        probably replace this with sql query
//        layer.getSource().forEachFeature(function(f) {
//            console.log(f.get("field_name"))
//        })

//        let fieldList = ['field 3', 'field2', 'field 1', '1', '2']
//        fieldList.sort()
//        let fieldList = ['1', '2']
        for (let scen in fieldList){
            this.addSet(fieldList[scen],'field',fieldIdList[scen])

        }
        return fieldList
    }
    getScenarios(){
        // get every scenario from active user
        //         replace this with sql query
        let counter = 0
        let {scenList, scenIdList} = retrieveScenariosGeoserver()
        console.log(scenList)
        console.log(scenIdList)
//        let scenList = ['Scenario 2','Scenario 1','Scenario 3']
//        scenList.sort()
        for (let scen in scenList){
            this.addSet(scenList[scen], 'scen',scenIdList[scen])
            // populating scenario picker combobox for the compare chart
            scenariosStore.loadData([[scenList[scen],scenIdList[scen]]],true)
            scenariosStore.sort('name', 'ASC');

        }
        return scenList
    }
//    sort fields alphabetically(so they show in same order on each graph) and choose color.
//@ param setName Name of scenario
//@ type field or scen
//@ id primary key of the scenario or field
// return index of field
    addSet(setName, type, id){
        let sets = null
        if (type == "field"){
            sets  = this.fields
        }
        else if (type == "scen"){
            sets  = this.scenarios
        }
        if (sets.length < 1){
            let currField = new DatasetNode(setName, this.getColor(), id)
            sets.push(currField)
            return
        }
        let currField = new DatasetNode(setName, this.getColor(), id)
        var found = false
//        sort alphabetically
        for (let set in sets){

            if (setName < sets[set].name){
                sets.splice(set,0,currField)
                return set
            }
        }

        sets.splice(sets.length,0,currField)
        return sets.length

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
//    getDBIdScen(myScenario){
//        for (let scen in this.scenarios){
//            if (this.scenarios[scen].name== myScenario){
//                return this.scenarios[scen].dbID
//            }
//        }
//    }
//    getDBIdfield(myField){
//        for (let field in this.fields){
//            if (this.fields[field].name == myField){
//                return this.fields[field].dbID
//            }
//        }
//    }
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
                return this.scenarios[scen].name
            }
        }
    }

    getColor(index){
        this.chartColors[index%this.colorLength]
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

        for (let scen in this.scenarios){
            scen_list.push(this.scenarios[scen].name)

        }
        return scen_list
    }

}
// node for field and scenario attributes
class DatasetNode{
    constructor(name, color, dbID) {
        this.name = name
        this.color = color
        this.dbID = dbID
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
