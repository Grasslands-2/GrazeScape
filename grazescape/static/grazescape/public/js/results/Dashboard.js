//var modelTypes = ['yield', 'ploss','runoff', 'bio']
var modelTypes = ['yield']
//var modelTypes = ['bio']
//list of all the current and future charts
var chartList = ["cost_farm", "cost_field",
    "net_return_farm", "net_return_field",
    "grass_yield_farm", "grass_yield_field",
    "milk_farm", "milk_field",
    "nitrogen_farm",
    "ploss_farm", "ploss_field",
    "soil_loss_farm", "soil_loss_field",
    "bio_farm",
    "cn_num_farm",
    "runoff_farm",
    "compare_farm",
    'corn_yield_farm','corn_yield_field',
    'corn_silage_yield_farm', 'corn_silage_yield_field',
    'soy_yield_farm','soy_yield_field',
    'oat_yield_farm', 'oat_yield_field',
    'alfalfa_yield_farm','alfalfa_yield_field',
    'rotation_yield_farm' , 'rotation_yield_field',
    'insecticide_farm', 'insecticide_field']
// stores references to each chart object. Stores ChartNodes which store the actual chart object and stores the data for each chart
var chartObj = {}
//controls order of how datasets are displayed and with what colors
var chartDatasetContainer = {}
//https://personal.sron.nl/~pault/
var chartColors = [
                '#EE7733', '#0077BB', '#33BBEE', '#EE3377', '#CC3311',
                    '#009988', '#BBBBBB'
            ]
var checkBoxScen = []
var checkBoxField = []
var hiddenData = {
    fields:[],
    scens:[],
}
var scenariosStore = Ext.create('Ext.data.Store', {
    fields: ['name'],
    data : []
});
var demResultsLayers =[]

//var testChartData = {
//    cost_farm_data:{
//        labels: ['Scenario 1','Scenario 2','Scenario 3'],
//        datasets: []
//    },
//    cost_farm_chart:"chart object"
//    }
DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')

//------------------------------------------------------------------------------
var dashBoardDialog = Ext.define('DSS.results.Dashboard', {
//------------------------------------------------------------------------------

	extend: 'Ext.window.Window',

	alias: 'widget.state_perimeter_dialog',
	alternateClassName: 'DSS.Dashboard',
    id: "dashboardWindow",
//	autoDestroy: true,
//	closeAction: 'destroy',
//    closable: false,
    closeAction: 'method-hide',
	constrain: true,
	modal: false,
	width: '80%',
    height: '80%',
	resizable: true,
//	bodyPadding: 8,
	titleAlign: 'center',
	layout : 'fit',
	plain: true,
//    style: 'background-color: #18bc9c!important',
	title: 'Model Results',
	runModel: false,

	config: {
        // ...
        /**
         * Here's how you document a config option.
         *
         * @cfg {Integer} [numberOfLines=8]
         */
        numberOfLines: 8, // default value of 8

//        ChartData:  {
//                    //          labels: ["Fields","happy"],
//                                datasets: []
//                            },
    },

//	layout: DSS.utils.layout('vbox', 'start', 'stretch'),

	//--------------------------------------------------------------------------
	initComponent: function() {
	    console.log("Opening dialog")
        let chart_height = '25vh'
        let chart_width = '32vw'

        let chart_height_single = '50vh'
        let chart_width_single = '64vw'

        let chart_height_double = '25vh'
        let chart_width_double = '64vw'

		let me = this;
//      this layer contains the active fields from the active farm
		layer = DSS.layer.fields_1
//		setup chart data and bring in scenario data


//        ero is included in pl
        if (this.runModel) {

            chartDatasetContainer = new ChartDatasetContainer()
            scenList = chartDatasetContainer.getScenarioList()
            fieldList = chartDatasetContainer.getFieldList()
            populateChartObj(chartObj,scenList,fieldList)
            console.log("check boxes for compare!")
            compCheckBoxes = compareChartCheckBox()
//            get progress bars


//            need just a slight delay
            setTimeout(() => {
                yield_pb = document.getElementById("yield_pb");
                nut_pb = document.getElementById("nut_pb");
                ero_pb = document.getElementById("ero_pb");
                bio_pb = document.getElementById("bio_pb");
                runoff_pb = document.getElementById("runoff_pb");

                eco_pb = document.getElementById("eco_pb");
                numbFields = fieldList.length
                for (model in modelTypes){
                     switch (modelTypes[model]){
                        case 'yield':
                            yield_pb.max = numbFields
                            break
                        case 'ploss':
                             nut_pb.max = numbFields
                             ero_pb.max = numbFields
                            break
                        case 'runoff':
                            runoff_pb.max = numbFields
                            break
                        case 'bio':
                            bio_pb.max = numbFields
                            break
                    }
                }
                // show progress bars when models run
//                eco_pb.hidden = false
                ero_pb.hidden = false
                bio_pb.hidden = false
                runoff_pb.hidden = false
                yield_pb.hidden = false
                nut_pb.hidden = false
                Ext.getCmp("erosionFarmConvert").setDisabled(true)
                Ext.getCmp("erosionFieldConvert").setDisabled(true)
                Ext.getCmp("yieldFarmConvert").setDisabled(true)
                Ext.getCmp("yieldFieldConvert").setDisabled(true)
                Ext.getCmp("nutrientsFarmConvert").setDisabled(true)
                Ext.getCmp("nutrientsFieldConvert").setDisabled(true)
                Ext.getCmp("nutrientsFieldConvert").setDisabled(true)
                Ext.getCmp("nutrientsFieldConvert").setDisabled(true)
                Ext.getCmp('mainTab').update()
            }, 10);


            console.log("running model")
            layer.getSource().forEachFeature(function(f) {
//                if(f.get("scenario_id") != DSS.activeScenario){
//                    console.log("field is not part of active scenario")
//                    return
//                }

//              for each layer run each model type: yield (grass or crop), ero, pl
                for (model in modelTypes){

//                only running on one field right now for testing
//                    if (f.get("field_name") == "40 ac"){
                        model_request = build_model_request(f, modelTypes[model])
//                        model_data = get_model_data(model_request)
//                            if(f.get("field_name") != "field 2 Drylot"){
//                                continue;
//                            }
                        console.log(model_request)
                        get_model_data(model_request).then(returnData =>{

                            console.log("data loaded")
                            console.log(returnData)
                            if(returnData.length < 1){
                                return
                            }
//                            console.log(returnData[0].model_type)
//                            console.log(modelTypes[model])
//                            progress bar management
                            switch (returnData[0].model_type){
                                case 'yield':
                                    yield_pb.value = yield_pb.value + 1
//                                    yield_pb.hidden = yield_pb.value==yield_pb.max?true:false
                                    if(yield_pb.value==yield_pb.max){
                                        yield_pb.hidden = true
                                        Ext.getCmp("yieldFarmConvert").setDisabled(false)
                                        Ext.getCmp("yieldFieldConvert").setDisabled(false)
                                    }
                                    break
                                case 'ploss':
                                    nut_pb.value = nut_pb.value + 1
//                                    nut_pb.hidden = nut_pb.value==nut_pb.max?true:false
                                    if(nut_pb.value==nut_pb.max){
                                        nut_pb.hidden = true
                                        Ext.getCmp("nutrientsFarmConvert").setDisabled(false)
                                        Ext.getCmp("nutrientsFieldConvert").setDisabled(false)
                                    }

                                    ero_pb.value = ero_pb.value + 1
//                                    ero_pb.hidden = ero_pb.value==ero_pb.max?true:false
                                    if(ero_pb.value==ero_pb.max){
                                        ero_pb.hidden = true
                                        Ext.getCmp("erosionFarmConvert").setDisabled(false)
                                        Ext.getCmp("erosionFieldConvert").setDisabled(false)
                                    }

                                    break
                                case 'runoff':
                                    runoff_pb.value = runoff_pb.value + 1
                                    runoff_pb.hidden = runoff_pb.value==runoff_pb.max?true:false
                                    break
                                case 'bio':
                                    bio_pb.value = bio_pb.value + 1
                                    bio_pb.hidden = bio_pb.value==bio_pb.max?true:false
                                    break
                            }
                            Ext.getCmp('mainTab').update()

                        })
//                      can be multiple models in one run (e.g. ploss and erosion)

//                    }
                }


            }) //iterates through fields to build extents array


        }

            data = {
//                "extent": [*bounds],
//                "palette": palette,
//                "url": model.file_name + ".png",
//                "values": values,
                "avg": 2500,
                "units": "tons",
                "model_type": "yield",
                "value_type": "Grass",
                "f_name": "This is field 1",
                "scen":"Base",
                "counted_cells": 10,
                "sum_cells": 5000,
                "area":4
            }
//            format_chart_data(data)
             data = {
//                "extent": [*bounds],
//                "palette": palette,
//                "url": model.file_name + ".png",
//                "values": values,
                "avg": 2500,
                "units": "tons",
                "model_type": "yield",
                "value_type": "Corn Grain",
                "f_name": "This is field 2",
                "scen":"Other",
                "counted_cells": 10,
                "sum_cells": 8000,
                "area":10
            }
//            format_chart_data(data)
            data = {
//                "extent": [*bounds],
//                "palette": palette,
//                "url": model.file_name + ".png",
//                "values": values,
                "avg": 2700,
                "units": "tons",
                "model_type": "yield",
                "value_type": "Grass",
                "units_alternate":"test1",
                "f_name": "This is field 1",
                "scen":"Other",
                "counted_cells": 10,
                "sum_cells": 5000,
                 "area":10
            }
//            format_chart_data(data)

            data = {
//                "extent": [*bounds],
//                "palette": palette,
//                "url": model.file_name + ".png",
//                "values": values,
                "avg": 2900,
                "units": "tons",
                "model_type": "yield",
                "value_type": "Grass",
                "f_name": "This is field 1",
                "scen":"Base",
                "counted_cells": 10,
                "sum_cells": 7000,
                "area":10
            }
//            format_chart_data(data)


            data = {
//                "extent": [*bounds],
//                "palette": palette,
//                "url": model.file_name + ".png",
//                "values": values,
                "avg": 50000,
                "units": "",
                "model_type": "runoff",
                "value_type": "Runoff",
                "f_name": "field 1",
                "scen":"Scenario 2",
                "counted_cells": 10,
                "sum_cells": [1,2,3,4,5,6,7,8,9,10,11,12],
                "area":10
            }
//            format_chart_data(data)
             data = {
//                "extent": [*bounds],
//                "palette": palette,
//                "url": model.file_name + ".png",
//                "values": values,
                "avg": 50000,
                "units": "",
                "model_type": "runoff",
                "value_type": "Runoff",
                "f_name": "field 2",
                "scen":"Scenario 2",
                "counted_cells": 10,
                "sum_cells": [1,2,3,4,5,6,7,8,9,10,11,12],
                "area":10
            }
//            format_chart_data(data)
//      put new tabs here
//TODO update
        var infrastructure = {

                title: '<i class="fas fa-wrench"></i>  Infrastructure <br/>',
                plain: true,
                tabConfig:{
                    tooltip: "Infrastructure",
//                    cls: "myBar"
                },
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,

//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 2
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="cost_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="net_return_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                    },{
                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    }],
                    scope: this,
                    listeners:{activate: function() {
                        console.log("activated farm")
//                      Add grid here for the cost
//                          if (chartObj["cost_farm"].chart !== null){
//                            chartObj["cost_farm"].chart.destroy()
//                            chartObj["net_return_farm"].chart.destroy()
//                        }

                    }}

                },
//                { xtype: 'panel',
//                    title: '<i class="fas fa-seedling"></i></i>  Field',
//                    border: false,
//                    layout: {
//                        type: 'table',
//                        // The total column count must be specified here
//                        columns: 2
//                    },
//                    defaults: {
//
//                        style: 'padding:10px; ',
//                        border:0,
//                    },
//                    items:[{
//                        xtype: 'container',
//                        html: '<div id="container" ><canvas id="cost_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="net_return_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                    },{
//                        xtype: 'container',
////                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }],
//                    listeners:{activate: function() {
//                        console.log("activated field")
//                        if (chartObj["cost_field"].chart !== null){
//                            chartObj["cost_field"].chart.destroy()
//                            chartObj["net_return_field"].chart.destroy()
//                        }
////                            create_graph(barChartData, 'test units', 'test title', document.getElementById('milk_field').getContext('2d'));
//                    }}
//                }
                ],

            }
            //TODO update
        var erosion = {

                title: '<i class="fas fa-mountain"></i>  Erosion <br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=ero_pb >50%</progress>',
                plain: true,
                tabConfig:{
                    tooltip: "Erosion",
//                    cls: "myBar"
                },
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,

//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'button',
                        text: 'Average Yield',
                        id: 'erosionFarmConvert',
                        tooltip: 'Convert between average yield by area and yearly yield',
                          handler: function(e) {
                            console.log(e)
                            displayAlternate("soil_loss_farm", e.id)
                          }
//                        text: 'Yearly Yield'
                    },
                    {

                        xtype: 'container',
                    },{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="soil_loss_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="net_return_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                    },{
//                        xtype: 'container',
////                        html: '<div id="container"><canvas  id="milk_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],
                    scope: this,
                    listeners:{activate: function() {
                        console.log("activated farm")
                          if (chartObj["soil_loss_farm"].chart !== null){
                            return
                        }
                      chartObj.soil_loss_farm.chart = create_graph(chartObj.soil_loss_farm, 'Soil Loss', document.getElementById('soil_loss_farm').getContext('2d'));


                    }}

                },{ xtype: 'panel',
                    title: '<i class="fas fa-seedling"></i></i>  Field',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'button',
                        text: 'Average Yield',
                        id: 'erosionFieldConvert',
                        tooltip: 'Convert between average yield by area and yearly yield',
                          handler: function(e) {
                            console.log(e)
                            displayAlternate("soil_loss_field", e.id)
                          }
//                        text: 'Yearly Yield'
                    },
                    {

                        xtype: 'container',
                    },{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="soil_loss_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },

                    ],
                    listeners:{activate: function() {
                        console.log("activated field")
                        if (chartObj["soil_loss_field"].chart !== null){
                            return
                        }
                        chartObj.soil_loss_field.chart = create_graph(chartObj.soil_loss_field, 'Soil Loss', document.getElementById('soil_loss_field').getContext('2d'));

                    }}
                }],

            }
            //TODO update
        var yield = {
                title: '<i class="fab fa-pagelines"></i>  Yield <br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=yield_pb >50%</progress>',
                plain: true,
                tabConfig:{
                    tooltip: "Crop Yield",
//                    cls: "myBar"
                },
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,

//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 2
                    },
                    defaults: {

                        style: 'padding:10px; ',
                        border:0,
                    },
                    items:[{
                        xtype: 'button',
                        text: 'Average Yield',
                        id: 'yieldFarmConvert',
                        tooltip: 'Convert between average yield by area and yearly yield',
                          handler: function(e) {
                            console.log(e)
                            displayAlternate("grass_yield_farm", e.id)
                            displayAlternate("corn_yield_farm", e.id)
                            displayAlternate("corn_silage_yield_farm", e.id)
                            displayAlternate("soy_yield_farm", e.id)
                            displayAlternate("oat_yield_farm", e.id)
                            displayAlternate("alfalfa_yield_farm", e.id)
                            displayAlternate("rotation_yield_farm", e.id)
                          }
//                        text: 'Yearly Yield'
                    },
                    {

                        xtype: 'container',
                    },
                    {
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="grass_yield_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="corn_yield_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="corn_silage_yield_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="soy_yield_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="oat_yield_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="alfalfa_yield_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="rotation_yield_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    }],
                    scope: this,
                    listeners:{activate: function() {
                        console.log("activated farm")
                         if (chartObj["grass_yield_farm"].chart !== null){
                            return
                        }
                        chartObj.grass_yield_farm.chart = create_graph(chartObj.grass_yield_farm, 'Grass Yield', document.getElementById('grass_yield_farm').getContext('2d'));
                        chartObj.corn_yield_farm.chart = create_graph(chartObj.corn_yield_farm, 'Corn Grain Yield', document.getElementById('corn_yield_farm').getContext('2d'));
                        chartObj.corn_silage_yield_farm.chart = create_graph(chartObj.corn_silage_yield_farm, 'Corn Silage Yield', document.getElementById('corn_silage_yield_farm').getContext('2d'));
                        chartObj.soy_yield_farm.chart = create_graph(chartObj.soy_yield_farm, 'Soy Yield', document.getElementById('soy_yield_farm').getContext('2d'));
                        chartObj.oat_yield_farm.chart = create_graph(chartObj.oat_yield_farm, 'Oat Yield', document.getElementById('oat_yield_farm').getContext('2d'));
                        chartObj.alfalfa_yield_farm.chart = create_graph(chartObj.alfalfa_yield_farm, 'Alfalfa Yield', document.getElementById('alfalfa_yield_farm').getContext('2d'));
                        chartObj.rotation_yield_farm.chart = create_graph(chartObj.rotation_yield_farm, 'Total Yield', document.getElementById('rotation_yield_farm').getContext('2d'));
//                        create_graph(barChartData, 'test units', 'test title', document.getElementById('milk_farm').getContext('2d'));
                    }}

                },{ xtype: 'panel',
                    title: '<i class="fas fa-seedling"></i></i>  Field',
                    border: false,
                                    scrollable: true,

                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 2
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'button',
                        text: 'Average Yield',
                        id: 'yieldFieldConvert',
                        tooltip: 'Convert between average yield by area and yearly yield',
                          handler: function(e) {
                            console.log(e)
                            displayAlternate("grass_yield_field", e.id)
                            displayAlternate("corn_yield_field", e.id)
                            displayAlternate("corn_silage_yield_field", e.id)
                            displayAlternate("soy_yield_field", e.id)
                            displayAlternate("oat_yield_field", e.id)
                            displayAlternate("alfalfa_yield_field", e.id)
                            displayAlternate("rotation_yield_field", e.id)
                          }
//                        text: 'Yearly Yield'
                    },
                    {

                        xtype: 'container',
                    },{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="grass_yield_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="corn_yield_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="corn_silage_yield_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="soy_yield_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="oat_yield_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="alfalfa_yield_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="rotation_yield_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    }],
                    listeners:{activate: function() {
                        console.log("activated field")
                        if (chartObj["grass_yield_field"].chart !== null){
                            return
                        }
                        chartObj.grass_yield_field.chart = create_graph(chartObj.grass_yield_field, 'Grass Yield', document.getElementById('grass_yield_field').getContext('2d'));
                        chartObj.corn_yield_field.chart = create_graph(chartObj.corn_yield_field, 'Corn Yield', document.getElementById('corn_yield_field').getContext('2d'));
                        chartObj.corn_silage_yield_field.chart = create_graph(chartObj.corn_silage_yield_field, 'Corn Silage', document.getElementById('corn_silage_yield_field').getContext('2d'));
                        chartObj.soy_yield_field.chart = create_graph(chartObj.soy_yield_field, 'Soy Yield', document.getElementById('soy_yield_field').getContext('2d'));
                        chartObj.oat_yield_field.chart = create_graph(chartObj.oat_yield_field, 'Oat Yield', document.getElementById('oat_yield_field').getContext('2d'));
                        chartObj.alfalfa_yield_field.chart = create_graph(chartObj.alfalfa_yield_field, 'Alfalfa Yield', document.getElementById('alfalfa_yield_field').getContext('2d'));
                        chartObj.rotation_yield_field.chart = create_graph(chartObj.rotation_yield_field, 'Total Yield', document.getElementById('rotation_yield_field').getContext('2d'));
//                        te_graph(barChartData, 'test units', 'test title', document.getElementById('milk_field').getContext('2d'));
                    }}
                }],

            }
            //TODO update
        var economics = {

                title: '<i class="fa fa-money fa-lg"></i>  Economics <br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=eco_pb >50%</progress>',
                plain: true,
                disabled:true,
                tabConfig:{
                    tooltip: "Economics",
//                    cls: "myBar"
                },
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,

//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 2
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="cost_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="net_return_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                    },{
                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    }],
                    scope: this,
                    listeners:{activate: function() {
                        console.log("activated farm")
                          if (chartObj["cost_farm"].chart !== null){
                            return
//                            chartObj["cost_farm"].chart.destroy()
//                            chartObj["net_return_farm"].chart.destroy()
                        }
                        chartObj.cost_farm.chart = create_graph(chartObj.cost_farm, 'Cost per Dry Matter Ton', document.getElementById('cost_farm').getContext('2d'));
                        chartObj.net_return_farm.chart = create_graph(chartObj.cost_farm, 'Net Return per Acre', document.getElementById('net_return_farm').getContext('2d'));
//                        create_graph(barChartData, 'test units', 'test title', document.getElementById('milk_farm').getContext('2d'));

                    }}

                },{ xtype: 'panel',
                    title: '<i class="fas fa-seedling"></i></i>  Field',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 2
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="cost_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="net_return_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                    },{
                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    }],
                    listeners:{activate: function() {
                        console.log("activated field")
                        if (chartObj["cost_field"].chart !== null){
                            return
//                            chartObj["cost_field"].chart.destroy()
//                            chartObj["net_return_field"].chart.destroy()
                        }
                        chartObj.cost_field.chart = create_graph(chartObj.cost_field, 'test title', document.getElementById('cost_field').getContext('2d'));
                        chartObj.net_return_field.chart = create_graph(chartObj.net_return_field, 'test title', document.getElementById('net_return_field').getContext('2d'));
//                            create_graph(barChartData, 'test units', 'test title', document.getElementById('milk_field').getContext('2d'));
                    }}
                }],

            }
            //TODO update
        var nutrients = {
                title: '<i class="fas fa-hand-holding-water"></i>  Nutrients <br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=nut_pb >50%</progress>',
                plain: true,
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,
//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'button',
                        text: 'Average Yield',
                        id: 'nutrientsFarmConvert',
                        tooltip: 'Convert between average yield by area and yearly yield',
                          handler: function(e) {
                            console.log(e)
                            displayAlternate("ploss_farm", e.id)
                          }
//                        text: 'Yearly Yield'
                    },
                    {

                        xtype: 'container',
                    },{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="ploss_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="soil_loss_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
//                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="canvas2" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="canvas3" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],
                        listeners:{activate: function() {
                           if (chartObj["ploss_farm"].chart !== null){
//                                chartObj["ploss_farm"].chart.destroy()
//                                chartObj["soil_loss_farm"].chart.destroy()
                                return
                            }
                            chartObj.ploss_farm.chart = create_graph(chartObj.ploss_farm, 'Phosphorous Loss', document.getElementById('ploss_farm').getContext('2d'));
//                            chartObj.soil_loss_farm.chart = create_graph(chartObj.soil_loss_farm, 'test units', 'Soil Loss', document.getElementById('soil_loss_farm').getContext('2d'));
                    }}

                },{ xtype: 'panel',
                    title: '<i class="fas fa-seedling"></i></i>  Field',
                     border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'button',
                        text: 'Average Yield',
                        id: 'nutrientsFieldConvert',
                        tooltip: 'Convert between average yield by area and yearly yield',
                          handler: function(e) {
                            console.log(e)
                            displayAlternate("ploss_field", e.id)
                          }
//                        text: 'Yearly Yield'
                    },
                    {

                        xtype: 'container',
                    },{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="ploss_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="soil_loss_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
//                    },
//                    {
//                        xtype: 'container',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],
                         listeners:{activate: function() {
                            if (chartObj["ploss_field"].chart !== null){
//                                chartObj["ploss_field"].chart.destroy()
//                                chartObj["soil_loss_field"].chart.destroy()
                                return
                            }
                            chartObj.ploss_field.chart = create_graph(chartObj.ploss_field, 'Phosphorous Loss', document.getElementById('ploss_field').getContext('2d'));
//                            chartObj.soil_loss_field.chart = create_graph(chartObj.soil_loss_field, 'test units', 'Soil Loss', document.getElementById('soil_loss_field').getContext('2d'));

                    }}
                }],

            }
            //TODO update
        var bio = {
                title: '<i class="fa fa-leaf"></i>  Insecticide<br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=bio_pb >50%</progress>',
                plain: true,
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
//                scrollable: true,
//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
//                    html: "hiiiiiiiiii"
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="insecticide_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                        },
                    ],
                    listeners:{activate: function() {
                        if (chartObj["insecticide_farm"].chart !== null){
                            return
                        }
                        chartObj.insecticide_farm.chart = create_graph(chartObj.insecticide_farm, 'Honey Bee Toxicity', document.getElementById('insecticide_farm').getContext('2d'));

                    }}

                },
                { xtype: 'panel',
                    title: '<i class="fas fa-seedling"></i></i>  Field',
                     border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[ {xtype: 'container',
                        html: '<div id="container" ><canvas id="insecticide_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                        },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="net_return_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],
                    listeners:{activate: function() {
                        if (chartObj["insecticide_field"].chart !== null){
                            return
                        }
                        chartObj.insecticide_field.chart = create_graph(chartObj.insecticide_field, 'Honey Bee Toxicity', document.getElementById('insecticide_field').getContext('2d'));

                    }}
                }
                ],
            }
            //TODO update
        var runoff = {
                title: '<i class="fas fa-cloud-rain"></i>  Runoff <br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=runoff_pb >50%</progress>',
                plain: true,
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,
//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="runoff_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',

                    },{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="cn_num_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',

                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="canvas2" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="canvas3" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],
                    scope: this,
                    listeners:{activate: function() {
                        console.log("activated farm")
                        if (chartObj["cn_num_farm"].chart !== null){
                            return
                        }
                        chartObj.cn_num_farm.chart = create_graph(chartObj.cn_num_farm, 'Curve Number', document.getElementById('cn_num_farm').getContext('2d'));
                        chartObj.runoff_farm.chart = create_graph_line(chartObj.runoff_farm, 'Runoff', document.getElementById('runoff_farm').getContext('2d'));

                    }}

                },
//                { xtype: 'panel',
//                    title: '<i class="fas fa-seedling"></i></i>  Field',
//                     border: false,
//                    layout: {
//                        type: 'table',
//                        // The total column count must be specified here
//                        columns: 2
//                    },
//                    defaults: {
//
//                    style: 'padding:10px; ',
//                    border:0,
//                },
//                    items:[{
//                        xtype: 'container',
//                        html: '<div id="container" ><canvas id="cost_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="net_return_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }],
//                }
                ],

            }
        var compare =  {
                title: '<i class="fa fa-balance-scale  fa-lg"></i>  Compare Scenarios',
                plain: true,
                id: "compareTab",
                disabled:false,

                tabBar : {
                    layout: {
                        pack: 'center',
                           background_color: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,
//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Select Data',
                    border: false,
                    scrollable:true,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {
                        style: 'padding:10px; ',
                        border:0,
                    },
                    items:[{
                            xtype: 'combobox',
                            id: 'scenCombobox',
                            fieldLabel: 'Choose Base Scenario',
                            store: scenariosStore,
                            forceSelection: true,
                            queryMode: 'local',
                            displayField: 'name',
                            valueField: 'name',
                            listeners:{change: function() {
                                populateRadarChart()
                            }},
                        },{
                        title: "Yield",
                        xtype: 'panel',
                        width: chart_width,
                        collapsible: true,
                        items:[,
                        {
                         id: 'checkYield',
                           xtype: 'checkboxgroup',
                            layout: {
                                type: 'table',
                                // The total column count must be specified here
                                columns: 2
                            },
                            listeners:{change: function(box, newVal, oldVal, e) {
                                populateRadarChart()
                            }},
                            items:compCheckBoxes.yieldVar
                        }]
                    },
                    {
                        title: "Erosion",
                        xtype: 'panel',

                        width: chart_width,
                        collapsible: true,
                        items:[{
                              id: 'checkErosion',
                      xtype: 'checkboxgroup',
                            layout: {
                                type: 'table',
                                // The total column count must be specified here
                                columns: 2
                            },
                            listeners:{change: function(box, newVal, oldVal, e) {
                                populateRadarChart()
                            }},
                            items:compCheckBoxes.erosionVar
                        }]
                    },{
                        title: "Nutrients",
                        xtype: 'panel',

                        width: chart_width,
                        collapsible: true,
                        items:[{
                            xtype: 'checkboxgroup',
                         id: 'checkNutrients',
                           layout: {
                                type: 'table',
                                // The total column count must be specified here
                                columns: 2
                            },
                            listeners:{change: function(box, newVal, oldVal, e) {
                                populateRadarChart()
                            }},
                            items:compCheckBoxes.nutrientsVar
                        }]
                    },{
                        title: "Runoff",
                        xtype: 'panel',

                        width: chart_width,
                        collapsible: true,
                        items:[{
                            xtype: 'checkboxgroup',
                         id: 'checkRunoff',
                           layout: {
                                type: 'table',
                                // The total column count must be specified here
                                columns: 1
                            },
                            listeners:{change: function(box, newVal, oldVal, e) {
                                populateRadarChart()
                            }},
                            items:compCheckBoxes.runoffVar
                        }]
                    },{
                        title: "Insecticide",
                        xtype: 'panel',

                        width: chart_width,
                        collapsible: true,
                        items:[{
                          id: 'checkInsecticide',
                          xtype: 'checkboxgroup',
                            layout: {
                                type: 'table',
                                // The total column count must be specified here
                                columns: 1
                            },
                            listeners:{change: function(box, newVal, oldVal, e) {
                                populateRadarChart()
                            }},
                            items:compCheckBoxes.insectVar
                        }]
                    },{
                        title: "Infrastructure",
                        xtype: 'panel',
                        width: chart_width,
                        collapsible: true,
                        items:[{
                            xtype: 'checkboxgroup',
                        id: 'checkInfrastructure',
                            layout: {
                                type: 'table',
                                // The total column count must be specified here
                                columns: 1
                            },
                            listeners:{change: function(box, newVal, oldVal, e) {
                                populateRadarChart()
                            }},
                            items:compCheckBoxes.infraVar
                        }]
                    },
                    ],
                    scope: this,
                    listeners:{activate: function() {
                        console.log("activated data select")
                        Ext.getCmp("scenCombobox").setValue(scenariosStore.getAt('0').get('name'))
//                        Ext.getCmp('scenCombobox').setValue(scenariosStore.getAt('0').get('name'));

                    }}
                },
                { xtype: 'panel',
                    title: '<i class="fas fa-seedling"></i></i>  Comparison',
                     border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="compare_farm" style = "width:'+chart_width_single+';height:'+chart_height_single+';"></canvas></div>',
                    },

                    ],
                   scope: this,
                    listeners:{activate: function() {
                        console.log("activated farm")
                          if (chartObj["compare_farm"].chart !== null){

                            chartObj.compare_farm.chart.update()

                            return
                        }
//                        chartObj.compare_farm.chartData.labels = ['Grass yield', 'Corn Yield', 'Soil Loss', "Phosphorus runof", "3 in Storm Event"]
//                        chartObj.compare_farm.chartData.datasets[0].data = [1,1,1,1,1]
//                        chartObj.compare_farm.chartData.datasets[0].fill = true
//                        chartObj.compare_farm.chartData.datasets[1].data = [1.3,.8,1.1,1.5,2]
//                        chartObj.compare_farm.chartData.datasets[1].fill = true
//                        chartObj.compare_farm.chartData.datasets[2].data = [1.6,.9,1.25,1.2,.9]
//                        chartObj.compare_farm.chartData.datasets[2].fill = true
                        chartObj.compare_farm.chart = create_graph_radar(chartObj.compare_farm, chartObj.compare_farm.title, document.getElementById('compare_farm').getContext('2d'));


                    }}
                }
                ],

            }
        var summary =  { title: '<i class="fas fa-book-open  fa-lg"></i>  Summary',
            disabled:true,
            plain: true,
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,
//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 2
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="sum_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="canvas1" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="canvas2" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="canvas3" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],

                },{ xtype: 'panel',
                    title: '<i class="fas fa-seedling"></i></i>  Field',
                     border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 2
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="sum_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="net_return_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],
                }],




            }
        var options = {

                title: '<i class="fas fa-globe"></i>  Options',
                plain: true,
                tabConfig:{
                    tooltip: "Control options and visibility of charts",
//                    cls: "myBar"
                },
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,

//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-tasks"></i>  Data Selection',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 2
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },


                items:[{
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Scenario',
//                    collapsible: true,
                    labelAlign: 'top',
                    defaultType: 'checkboxfield',
                    items:checkBoxScen,


                },{
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Field',
                    labelAlign: 'top',
                    defaultType: 'checkboxfield',
                    items: checkBoxField,

                },{
                    xtype: 'buttongroup',
                    items: [{
                        text: 'Select All',
                         handler: function() {
                            for (let scen in chartDatasetContainer.scenarios){
                                Ext.getCmp("checkBox_scen_"+scen).setValue(true);

                            }
                        }

                    },
                    {
                        text: 'Deselect All',
                        handler: function() {
                            for (let scen in chartDatasetContainer.scenarios){
                                Ext.getCmp("checkBox_scen_"+scen).setValue(false);

                            }
                        }

                    }]
                },{

                    xtype: 'buttongroup',
                    items: [{
                        text: 'Select All',
                         handler: function() {
                            for (let field in chartDatasetContainer.fields){
                                Ext.getCmp("checkBox_field_"+field).setValue(true);
                            }
                        }
                        },
                    {
                        text: 'Deselect All',
                        handler: function() {
                            for (let field in chartDatasetContainer.fields){
                                Ext.getCmp("checkBox_field_"+field).setValue(false);
                            }
                        }

                    }]


                }],
                scope: this,
                listeners:{activate: function() {

                }}

                },
//                { xtype: 'panel',
//                    title: '<i class="fas fa-seedling"></i></i>  Field',
//                    border: false,
//                    layout: {
//                        type: 'table',
//                        // The total column count must be specified here
//                        columns: 2
//                    },
//                    defaults: {
//
//                    style: 'padding:10px; ',
//                    border:0,
//                },
//                    items:[{
//
//                    },{
//                        xtype: 'container',
//                    },{
//                        xtype: 'container',
//                    },{
//                        xtype: 'container',
//                    }],
//                    listeners:{activate: function() {
//                        }}
//                }
                ],

            }

//		Main tab panel
        let tabs = Ext.create('Ext.tab.Panel', {
            plain: true,
            tabPosition: 'left',
            id: 'mainTab',
            tabBar : {
                    layout: {
                        pack: 'start',
                            //background: '#C81820',
                     },
//                     title: 'Custom Title',
//                    tooltip: 'A button tooltip',
                    margin: '20 0 0 0'
                 },

            height: '99%',
            width:'100%',
            tabRotation: 0,
            titleRotation:2,
//            background is apparently an image
            style: 'border-radius: 8px; background-color: #377338;box-shadow: 0 3px 6px rgba(0,0,0,0.2)',

            items: [
            yield,
            erosion,
            nutrients,
            runoff,
            bio,
            economics,
            infrastructure,
            compare,
            summary,
            options,
           ]
        })

		Ext.applyIf(me, {

		    items: [{
				xtype: 'container',
				style: 'background-color: #E2EAAC; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); border-top-color:rgba(255,255,255,0.25); border-bottom-color:rgba(0,0,0,0.3); box-shadow: 0 3px 6px rgba(0,0,0,0)',
				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				margin: '2 2',
				padding: '10 8 10 8',
//				height: '80%',
				defaults: {
					DSS_parent: me,
				},
				items: [{
                        xtype: 'component',
                        cls: 'information accent-text text-drp-20',
//                        html: 'Fence Settings',
                    },
                        tabs

                ]
			}]

		});

		me.callParent(arguments);

		AppEvents.registerListener("viewport_resize", function(opts) {
			me.center();
		})
	},
           listeners:{activate: function() {
//		                 populate this for each chart

            }
           }


});
