//var modelTypes = ['yield', 'ploss','runoff']
var modelTypes = ['yield']
//var modelTypes = ['ploss']
// TODO organize table list into a better format
var chartList = ["cost_farm","net_return_farm","grass_yield_farm",
    "milk_farm","cost_field","net_return_field","grass_yield_field",
    "milk_field","ploss_farm","soil_loss_farm","ploss_field","soil_loss_field",
    "bio_farm","cn_num_farm","runoff_farm","compare",
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

//	autoDestroy: true,
//	closeAction: 'destroy',
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
//            get progress bars


//            need just a slight delay
            setTimeout(() => {
                eco_pb = document.getElementById("eco_pb");
                ero_pb = document.getElementById("ero_pb");
                bio_pb = document.getElementById("bio_pb");
                yield_pb = document.getElementById("yield_pb");
                nut_pb = document.getElementById("nut_pb");
                runoff_pb = document.getElementById("runoff_pb");

                yield_pb.counter = 0
                ero_pb.counter = 0
                nut_pb.counter = 0
                runoff_pb.counter = 0
                bio_pb.counter = 0
                eco_pb.counter = 0
                // show progress bars when models run
//                eco_pb.hidden = false
                ero_pb.hidden = false
                bio_pb.hidden = false
                runoff_pb.hidden = false
                yield_pb.hidden = false
                nut_pb.hidden = false
                Ext.getCmp('mainTab').update()
            }, 10);


            console.log("running model")
            layer.getSource().forEachFeature(function(f) {
//              for each layer run each model type: yield (grass or crop), ero, pl
                for (model in modelTypes){
//                only running on one field right now for testing
//                    if (f.get("field_name") == "40 ac"){
                        model_request = build_model_request(f, modelTypes[model])
                        console.log(model_request)
//                        model_data = get_model_data(model_request)
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
                "f_name": "field2",
                "scen":"Scenario 1",
                "counted_cells": 10,
                "sum_cells": 5000,
                "area":4
            }
            format_chart_data(data)
             data = {
//                "extent": [*bounds],
//                "palette": palette,
//                "url": model.file_name + ".png",
//                "values": values,
                "avg": 2500,
                "units": "tons",
                "model_type": "yield",
                "value_type": "Corn Grain",
                "f_name": "field2",
                "scen":"Scenario 1",
                "counted_cells": 10,
                "sum_cells": 5000,
                "area":4
            }
            format_chart_data(data)
            data = {
//                "extent": [*bounds],
//                "palette": palette,
//                "url": model.file_name + ".png",
//                "values": values,
                "avg": 2700,
                "units": "tons",
                "model_type": "yield",
                "value_type": "Grass",
                "f_name": "field 1",
                "scen":"Scenario 1",
                "counted_cells": 10,
                "sum_cells": 5000,
                 "area":10
            }
            format_chart_data(data)

            data = {
//                "extent": [*bounds],
//                "palette": palette,
//                "url": model.file_name + ".png",
//                "values": values,
                "avg": 2900,
                "units": "tons",
                "model_type": "yield",
                "value_type": "Grass",
                "f_name": "field 1",
                "scen":"Scenario 2",
                "counted_cells": 10,
                "sum_cells": 5000,
                "area":10
            }
            format_chart_data(data)


            data = {
//                "extent": [*bounds],
//                "palette": palette,
//                "url": model.file_name + ".png",
//                "values": values,
                "avg": 5,
                "units": "lbs P/acre",
                "model_type": "ploss",
                "value_type": "ploss",
                "f_name": "field 1",
                "scen":"Scenario 2",
                                "counted_cells": 10,
                "sum_cells": 5000,
                "area":10
            }
            format_chart_data(data)
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
//                        chartObj.cost_farm.chart = create_graph(chartObj.cost_farm.chartData, 'Dollars ($)', 'Cost per Dry Matter Ton', document.getElementById('cost_farm').getContext('2d'));
//                        chartObj.net_return_farm.chart = create_graph(chartObj.cost_farm.chartData, 'Dollars ($)', 'Net Return per Acre', document.getElementById('net_return_farm').getContext('2d'));
//                        create_graph(barChartData, 'test units', 'test title', document.getElementById('milk_farm').getContext('2d'));

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
//                        chartObj.cost_field.chart = create_graph(chartObj.cost_field.chartData, 'test units', 'test title', document.getElementById('cost_field').getContext('2d'));
//                        chartObj.net_return_field.chart = create_graph(chartObj.net_return_field.chartData, 'test units', 'test title', document.getElementById('net_return_field').getContext('2d'));
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
                      chartObj.soil_loss_farm.chart = create_graph(chartObj.soil_loss_farm.chartData, 'Soil Loss', document.getElementById('soil_loss_farm').getContext('2d'));


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
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="soil_loss_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },

                    ],
                    listeners:{activate: function() {
                        console.log("activated field")
                        if (chartObj["soil_loss_field"].chart !== null){
                            return
                        }
                        chartObj.soil_loss_field.chart = create_graph(chartObj.soil_loss_field.chartData, 'Soil Loss', document.getElementById('soil_loss_field').getContext('2d'));

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
                        chartObj.grass_yield_farm.chart = create_graph(chartObj.grass_yield_farm.chartData, 'Grass Yield', document.getElementById('grass_yield_farm').getContext('2d'));
                        chartObj.corn_yield_farm.chart = create_graph(chartObj.corn_yield_farm.chartData, 'Corn Yield', document.getElementById('corn_yield_farm').getContext('2d'));
                        chartObj.corn_silage_yield_farm.chart = create_graph(chartObj.corn_silage_yield_farm.chartData, 'Corn Silage', document.getElementById('corn_silage_yield_farm').getContext('2d'));
                        chartObj.soy_yield_farm.chart = create_graph(chartObj.soy_yield_farm.chartData, 'Soy Yield', document.getElementById('soy_yield_farm').getContext('2d'));
                        chartObj.oat_yield_farm.chart = create_graph(chartObj.oat_yield_farm.chartData, 'Oat Yield', document.getElementById('oat_yield_farm').getContext('2d'));
                        chartObj.alfalfa_yield_farm.chart = create_graph(chartObj.alfalfa_yield_farm.chartData, 'Alfalfa Yield', document.getElementById('alfalfa_yield_farm').getContext('2d'));
                        chartObj.rotation_yield_farm.chart = create_graph(chartObj.rotation_yield_farm.chartData, 'Total Yield', document.getElementById('rotation_yield_farm').getContext('2d'));
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
                        chartObj.grass_yield_field.chart = create_graph(chartObj.grass_yield_field.chartData, 'Grass Yield', document.getElementById('grass_yield_field').getContext('2d'));
                        chartObj.corn_yield_field.chart = create_graph(chartObj.corn_yield_field.chartData, 'Corn Yield', document.getElementById('corn_yield_field').getContext('2d'));
                        chartObj.corn_silage_yield_field.chart = create_graph(chartObj.corn_silage_yield_field.chartData, 'Corn Silage', document.getElementById('corn_silage_yield_field').getContext('2d'));
                        chartObj.soy_yield_field.chart = create_graph(chartObj.soy_yield_field.chartData, 'Soy Yield', document.getElementById('soy_yield_field').getContext('2d'));
                        chartObj.oat_yield_field.chart = create_graph(chartObj.oat_yield_field.chartData, 'Oat Yield', document.getElementById('oat_yield_field').getContext('2d'));
                        chartObj.alfalfa_yield_field.chart = create_graph(chartObj.alfalfa_yield_field.chartData, 'Alfalfa Yield', document.getElementById('alfalfa_yield_field').getContext('2d'));
                        chartObj.rotation_yield_field.chart = create_graph(chartObj.rotation_yield_field.chartData, 'Total Yield', document.getElementById('rotation_yield_field').getContext('2d'));
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
                        chartObj.cost_farm.chart = create_graph(chartObj.cost_farm.chartData, 'Cost per Dry Matter Ton', document.getElementById('cost_farm').getContext('2d'));
                        chartObj.net_return_farm.chart = create_graph(chartObj.cost_farm.chartData, 'Net Return per Acre', document.getElementById('net_return_farm').getContext('2d'));
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
                        chartObj.cost_field.chart = create_graph(chartObj.cost_field.chartData, 'test title', document.getElementById('cost_field').getContext('2d'));
                        chartObj.net_return_field.chart = create_graph(chartObj.net_return_field.chartData, 'test title', document.getElementById('net_return_field').getContext('2d'));
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
                            chartObj.ploss_farm.chart = create_graph(chartObj.ploss_farm.chartData, 'Phosphorous Loss', document.getElementById('ploss_farm').getContext('2d'));
//                            chartObj.soil_loss_farm.chart = create_graph(chartObj.soil_loss_farm.chartData, 'test units', 'Soil Loss', document.getElementById('soil_loss_farm').getContext('2d'));
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
                            chartObj.ploss_field.chart = create_graph(chartObj.ploss_field.chartData, 'Phosphorous Loss', document.getElementById('ploss_field').getContext('2d'));
//                            chartObj.soil_loss_field.chart = create_graph(chartObj.soil_loss_field.chartData, 'test units', 'Soil Loss', document.getElementById('soil_loss_field').getContext('2d'));

                    }}
                }],

            }
            //TODO update
        var bio = {
                title: '<i class="fa fa-leaf"></i>  Insecticide Use<br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=bio_pb >50%</progress>',
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
                        chartObj.insecticide_farm.chart = create_graph(chartObj.insecticide_farm.chartData, 'Insecticide Use', document.getElementById('insecticide_farm').getContext('2d'));

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
                        chartObj.insecticide_field.chart = create_graph(chartObj.insecticide_field.chartData, 'Insecticide Use', document.getElementById('insecticide_field').getContext('2d'));

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
                        columns: 2
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="cn_num_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="runoff_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
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
                        chartObj.cn_num_farm.chart = create_graph(chartObj.cn_num_farm.chartData, 'Soil Loss', document.getElementById('cn_num_farm').getContext('2d'));
                        chartObj.runoff_farm.chart = create_graph(chartObj.runoff_farm.chartData, 'Soil Loss', document.getElementById('runoff_farm').getContext('2d'));

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
                title: '<i class="fa fa-balance-scale  fa-lg"></i>  Compare',
                plain: true,
                disabled:true,
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
                        html: '<div id="container" ><canvas id="compare" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
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
                    collapsible: true,
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
