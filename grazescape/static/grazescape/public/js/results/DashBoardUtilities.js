
function populateChartObj(chartObj, scenList, fieldList){
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
                    // each data entry represents a scenario
                    data: [],
                    hidden:false,
                    backgroundColor:  chartColors[field % chartDatasetContainer.colorLength]
                }
                node.chartData.datasets[field] = data1
                node.chartData.chartDataLabelsOri = scenList

                node.chartData.chartDataOri.push([])
            }
        }
        else{
            node = new ChartData()

            node.chartData =  {
                labels : ['Scenarios'],
                datasets: []
            }
            for (let scen in scenList){
                data1 = {
                    label: scenList[scen],
                    // each data entry represents a scenario
                    data: [],
                    backgroundColor:  chartColors[scen % chartDatasetContainer.colorLength]
                }
                node.chartData.datasets[scen] = data1
                node.chartData.chartDataLabelsOri = ['Scenarios']
            }
            node.chartData.chartDataOri = new Array(scenList.length).fill(0)

        }
//        console.log(chartName)
        chartObj[chartName] = node
        chartObj[chartName].chart = null

    }
}

function build_model_request(f, modelChoice){
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
        density: f.get("grazingdensityval"),
//      comes from the the looping var in Dashboard.js
        model_type: modelChoice,
        scen: "Scenario 3"

    }
    model_pack = {
        "farm_id": DSS.activeFarm,
//        "scenario_id": DSS.activeScenario,
        "model_parameters":model_para
    }
    return model_pack
}
function format_chart_data(model_data){

    if(typeof model_data.f_name === "undefined" || typeof model_data.scen === "undefined"){
        return
    }
    let fieldIndex = chartDatasetContainer.indexField(model_data.f_name)
    let scenIndex = chartDatasetContainer.indexScenario(model_data.scen)
    chartTypeField = null
    chartTypeFarm = null

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
            break
        case 'bio':
            break
        case 'econ':
            break
    }
//      field level
    chartTypeField.chartData.datasets[fieldIndex].data[scenIndex] =  model_data.avg
    console.log(chartTypeField.chartData)
    chartTypeField.area[fieldIndex] =  model_data.area
    // creating a backup to pull data from
    chartTypeField.chartData.chartDataOri[fieldIndex][scenIndex] =  model_data.avg

    if(chartTypeField.chart !== null){
        chartTypeField.chart.update()
    }
//      farm level
    //initialize sum and count if they havent been already
    chartTypeFarm.count[scenIndex] = typeof chartTypeFarm.count[scenIndex] === 'undefined' ? model_data.counted_cells:chartTypeFarm.count[scenIndex] + model_data.counted_cells
    chartTypeFarm.sum[scenIndex] = typeof chartTypeFarm.sum[scenIndex] === 'undefined' ? model_data.sum_cells:chartTypeFarm.sum[scenIndex] + model_data.sum_cells
    chartTypeFarm.area[scenIndex] = typeof chartTypeFarm.area[scenIndex] === 'undefined' ? model_data.area:chartTypeFarm.area[scenIndex] + model_data.area

    chartTypeFarm.chartData.datasets[scenIndex].data =[chartTypeFarm.get_avg(scenIndex)]
    // creating a backup to pull data from
    chartTypeFarm.chartData.chartDataOri[scenIndex]=[chartTypeFarm.get_avg(scenIndex)]

    if(chartTypeFarm.chart !== null){
        chartTypeFarm.chart.update()
    }



}
function get_model_data(data){
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
            for (response in responses){
                obj = responses[response];
                if(obj.error){
                    console.log("model did not run")
                    me.stopWorkerAnimation();
                    continue
                }
                console.log("response(obj): " + obj);
                let e = obj.extent;
//              not doing the dem for beta launch
//                pt1 = [e[0],e[3]]
//                pt2 = [e[2],e[3]]
//                pt3 = [e[2],e[1]]
//                pt4 = [e[0],e[1]]
//
//                let p = new ol.geom.Polygon([
//                    [pt1, pt2, pt3, pt4, pt1]
//                ]);
//                validateImageOL(obj, DSS.layer.ModelResult);
//                let s = DSS.layer.ModelBox.getSource();
//                s.clear();
//                s.addFeature(new ol.Feature({
//                    geometry: p
//                }));
//
//                DSS.MapState.showContinuousLegend(obj.palette, obj.values);
                format_chart_data(obj)

            }

            return responses

        },

        failure: function(response, opts) {
            me.stopWorkerAnimation();
        }
    });

	}

//---------------------------------------------------------------------------------
function validateImageOL(json, layer, tryCount) {
    var me = this;
    tryCount = (typeof tryCount !== 'undefined') ? tryCount : 0;
    Ext.defer(function() {
        var src = new ol.source.ImageStatic({
            url: "http://localhost:8000/grazescape/get_image?file_name=" + json.url,
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

function create_graph(data,title,element){
    units = data.units
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
                onClick: function (event, legendItem, legend){
                    console.log(event, legendItem, legend)
                    name = legendItem.text
                    console.log(event.path[0].id)

                    hideData(event.path[0].id, name)

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
            }
        }
    });
    return barchart
}

// name of the chart and the name of the field or scenario
function hideData(chartName, datasetName){

    let chartType = null
    hide = true
    // turn off fields
    if (chartName.includes('field')){
        console.log('field')
        chartType = "field"
        if(hiddenData.fields.includes(datasetName)){
            hide = false
            let index = hiddenData.fields.indexOf(datasetName);
            hiddenData.fields.splice(index, 1);

            let fieldIndex = chartDatasetContainer.indexField(datasetName)

            chkBox = Ext.getCmp("checkBox_field_"+fieldIndex)
            chkBox.suspendEvents(false)
            chkBox.setValue(true);
            chkBox.resumeEvents()
        }
        else{
            hiddenData.fields.push(datasetName)

            let fieldIndex = chartDatasetContainer.indexField(datasetName)

            chkBox = Ext.getCmp("checkBox_field_"+fieldIndex)
            chkBox.suspendEvents(false)
            chkBox.setValue(false);
            chkBox.resumeEvents()

        }
    }
    // turn off scen
    else{
        console.log('farm')
        chartType = 'farm'
        if(hiddenData.scens.includes(datasetName)){
            hide = false
            let index = hiddenData.scens.indexOf(datasetName);
            hiddenData.scens.splice(index, 1);

            let scenIndex = chartDatasetContainer.indexScenario(datasetName)

            chkBox = Ext.getCmp("checkBox_scen_"+scenIndex)
            chkBox.suspendEvents(false)
            chkBox.setValue(true);
            chkBox.resumeEvents()

        }
        else{
            hiddenData.scens.push(datasetName)
            let scenIndex = chartDatasetContainer.indexScenario(datasetName)
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
                if(chartObj[chartLoop].chartData.datasets[data].label == datasetName){

//                    chartObj[chartLoop].chartData.datasets[data].hidden = chartObj[chartLoop].chartData.datasets[data].hidden?false:true
                    chartObj[chartLoop].chartData.datasets[data].hidden = !chartObj[chartLoop].chartData.datasets[data].hidden

                     if(chartObj[chartLoop].chart !== null){
                        chartObj[chartLoop].chart.update()
                    }
                }

            }
        }
        scenVis = []
        if(chartType === 'farm' && chartLoop.includes('field')){
            console.log("turn off scenario",chartLoop)
            chartObj[chartLoop].chartData.labels = []
             for(let scen in chartDatasetContainer.scenarios){
//                set labels
                scenVis[scen] = false
                if(!hiddenData.scens.includes(chartDatasetContainer.scenarios[scen].name )){
                    console.log('pushing',chartDatasetContainer.scenarios[scen].name )
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
        btnObject.setText('Average Yield / Area')
        chartData.useAlternate = false
        divideArea = false
//        conv = 1/area

    }
    else{
        btnObject.setText('Average Yield')
        chartData.useAlternate = true
//        conv = area
        divideArea = true
    }
    for (data in chartDatasets){
        console.log(chartData)
        if(chartData.area[data]!= undefined){
        console.log(chartData.area[data])
            for(set in chartDatasets[data].data){
                if(divideArea){
                    chartDatasets[data].data[set] = chartDatasets[data].data[set]/chartData.area[data]
                }
                else{
                    chartDatasets[data].data[set] = chartDatasets[data].data[set] * chartData.area[data]
                }
            }
        }
    }
    chartData.chart.update()
}
// organzies all fields and scenarios so that they show in order and with the same colors
//across charts
class ChartDatasetContainer{
    constructor() {
        this.fields = []
        this.scenarios = []
        this.colorIndex = 0
        this.chartColors = [
                '#EE7733', '#0077BB', '#33BBEE', '#EE3377', '#CC3311',
                    '#009988', '#BBBBBB'
            ]
        this.colorLength = chartColors.length
        this.getFields()
        this.getScenarios()
    }
    getFields(){
        // get every field associated with active scenario
//        probably replace this with sql query
        layer.getSource().forEachFeature(function(f) {
            console.log(f.get("field_name"))
        })

        let fieldList = ['field 3', 'field2', 'field 1', '1', '2']
        for (let scen in fieldList){
            this.addSet(fieldList[scen],'field')
        }
        return fieldList
    }
    getScenarios(){
        // get every scenario from active user
        //        probably replace this with sql query

        let scenList = ['Scenario 2','Scenario 1','Scenario 3']
        for (let scen in scenList){
            this.addSet(scenList[scen], 'scen')
        }
        return scenList
    }
//    sort fields alphabetically(so they show in same order on each graph) and choose color.
// Also retrieves scenario and field list from db and creates checkboxes for the options page
//@ param FieldNode
// return index of field
    addSet(setName, type){
        let sets = null
        if (type == "field"){
            sets  = this.fields
        }
        else if (type == "scen"){
            sets  = this.scenarios
        }
        if (sets.length < 1){
            let currField = new DatasetNode(setName, this.getColor())
            sets.push(currField)
            return
        }
        let currField = new DatasetNode(setName, this.getColor())
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
//    get index of field
    indexField(myField){
//        find field if it exists otherwise create a new entry
        for (let field in this.fields){
            if (this.fields[field].name == myField){
                return field
            }
        }
//        return this.addSet(myField, "field")
    }
    indexScenario(myScenario){
        for (let scen in this.scenarios){
            if (this.scenarios[scen].name== myScenario){
                return scen
            }
        }
//        return this.addSet(myScenario, "scen")
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
            let checkBox = {
                boxLabel  : this.fields[field].name,
                    id: "checkBox_field_"+counter,
                    checked: true,
                    name: 'field',
                     listeners:{change: function(box, newVal, oldVal, e) {
                        hideData(box.name, box.boxLabel)
                    }}
            }
            counter = counter + 1
            checkBoxField.push(checkBox)

        }
        return field_list

    }
    getScenarioList(){
        let scen_list = []
        let counter = 0

        for (let scen in this.scenarios){
            scen_list.push(this.scenarios[scen].name)
            let checkBox = {
                boxLabel  : this.scenarios[scen].name,
                    id: "checkBox_scen_"+counter,
                    checked: true,
                    name: 'farm',
                    listeners:{change: function(box, newVal, oldVal, e) {
                        hideData(box.name, box.boxLabel)
                    }}

            }
            counter = counter + 1
            checkBoxScen.push(checkBox)
        }
        return scen_list
    }

}
// node for field and scenario attributes
class DatasetNode{
    constructor(name, color) {
        this.name = name
        this.color = color
    }
}

// contains all data for chart. Contains running sum for farm scale charts and
// the field averages
class ChartData{
    constructor() {
        this.units = ''
        this.title = ''
        this.model_type = ''
        this.sum = []
        this.count = []
        this.area = []
        this.chartData = null
        this.chart = null
        this.useAlternate = false
    }
    get_avg(scenIndex){
        return this.sum[scenIndex] / this.count[scenIndex]
    }

    hideField(fieldName){

    }
    hideScenario(scenarioName){

    }
}