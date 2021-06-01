var chartData
var modelTypes = ['yield', 'pl']
var chartList = ["cost_farm","net_return_farm","dry_matter_farm",
    "milk_farm","cost_field","net_return_field","dry_matter_field",
    "milk_field","ploss_farm","soil_loss_farm","ploss_field","soil_loss_field",
    "bio_farm","cn_num","runoff","compare"]
var chartObj = {}

//var win = window,
//    doc = document,
//    docElem = doc.documentElement,
//    body = doc.getElementsByTagName('body')[0],
//    width = win.innerWidth || docElem.clientWidth || body.clientWidth,
//    height = win.innerHeight|| docElem.clientHeight|| body.clientHeight;
//var chart_width
//var chart_height
// making chart data a global for simplicity
var testChartData = {
    cost_farm_data:{
        labels: ['Scenario 1','Scenario 2','Scenario 3'],
        datasets: []
    },
    cost_farm_chart:"chart object"
    }
DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')

//------------------------------------------------------------------------------
var dashBoardDialog = Ext.define('DSS.results.Dashboard', {
//------------------------------------------------------------------------------

	extend: 'Ext.window.Window',
	alias: 'widget.state_perimeter_dialog',
	alternateClassName: 'DSS.Dashboard',

	autoDestroy: true,
	closeAction: 'destroy',
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
        populateChartObj(chartObj)
//        ero is included in pl
        if (this.runModel) {
            console.log("running model")
            layer.getSource().forEachFeature(function(f) {
//              for each layer run each model type: yield (grass or crop), ero, pl
                console.log(f.get("field_name"))
                for (model in modelTypes){
//                only running on one field right now for testing
                    if (f.get("field_name") == "40 ac"){
                        model_request = build_model_request(f, modelTypes[model])
                        console.log(model_request)
//                        model_data = get_model_data(model_request)
////                        can be multiple models in one run (e.g. ploss and erosion)
//                           for (data in model_data) {
//                              format_chart_data(model_data[data])
//
//                           }
                    }
                }


            }) //iterates through fields to build extents array

//            var test_data = [{
////                        "extent": [*bounds],
////                        "palette": palette,
////                        "url": model.file_name + ".png",
////                        "values": values,
//                "avg": 6,
//                "units": "test units",
//                "model_type": 'yield',
//                "crop_type": 'grass',
//                "f_name":'field 1'
//            },
//            {
////                        "extent": [*bounds],
////                        "palette": palette,
////                        "url": model.file_name + ".png",
////                        "values": values,
//                "avg": 7,
//                "units": "test units",
//                "model_type": 'yield',
//                "crop_type": 'grass',
//                "f_name":'field 2'
//            }]

//            model_data = test_data
        }
        data1 = {
                    label: 'field 1',
                    data: [5,3,7,10],
                    backgroundColor: [ 'rgba(247, 148, 29, 1)','rgba(247, 148, 29, 1)','rgba(247, 148, 29, 1)'],
                    borderWidth: 1
                }
                data2 = {
                    label: 'field 2',
                    data: [20,30,50],
                    backgroundColor: ['rgba(29, 48, 58, 1)', 'rgba(29, 48, 58, 1)','rgba(29, 48, 58, 1)'],
                    borderWidth: 1
                }
                data3 = {
                    label: 'field 3',
                    data: [20,30,50],
                    backgroundColor: ['rgba(29, 48, 58, 1)', 'rgba(29, 48, 58, 1)','rgba(29, 48, 58, 1)'],
                    borderWidth: 1
                }
                data4 = {
                    label: 'field 4',
                    data: [20,30,50],
                    backgroundColor: ['rgba(29, 48, 58, 1)', 'rgba(29, 48, 58, 1)','rgba(29, 48, 58, 1)'],
                    borderWidth: 1
                }
                data5 = {
                    label: 'field 5',
                    data: [20,30,50],
                    backgroundColor: ['rgba(29, 48, 58, 1)', 'rgba(29, 48, 58, 1)','rgba(29, 48, 58, 1)'],
                    borderWidth: 1
                }
                data6 = {
                    label: 'field 6',
                    data: [20,30,50],
                    backgroundColor: ['rgba(29, 48, 58, 1)', 'rgba(29, 48, 58, 1)','rgba(29, 48, 58, 1)'],
                    borderWidth: 1
                }
//              chartObj.cost_farm_data = {}
//              chartObj.cost_farm_data.labels = ['Scenario 1','Scenario 2','Scenario 3']
//              chartObj.cost_farm_data.datasets = []
              chartObj.cost_farm_data.datasets.push(data1)
              chartObj.cost_farm_data.datasets.push(data2)
//              testChartData.datasets.push(data3)
//              testChartData.datasets.push(data4)
//              testChartData.datasets.push(data5)
//              testChartData.datasets.push(data6)





//		Main tab panel
        let tabs = Ext.create('Ext.tab.Panel', {
            plain: true,
            tabPosition: 'left',

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

            items: [ {

                title: '<i class="fas fa-globe"></i>  Overview ',
                plain: true,
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
                        html: '<div id="container"><canvas  id="dry_matter_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="milk_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    }],
                    scope: this,
                    listeners:{activate: function() {
                        console.log(testChartData)
                        console.log("activated")
                        chartObj.cost_farm_chart = create_graph(chartObj.cost_farm_data, 'test units', 'test title', document.getElementById('cost_farm').getContext('2d'));
                        create_graph(barChartData, 'test units', 'test title', document.getElementById('net_return_farm').getContext('2d'));
                        create_graph(barChartData, 'test units', 'test title', document.getElementById('dry_matter_farm').getContext('2d'));
                        create_graph(barChartData, 'test units', 'test title', document.getElementById('milk_farm').getContext('2d'));

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
                        html: '<div id="container"><canvas  id="dry_matter_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    }],
                    listeners:{activate: function() {
                        create_graph(barChartData, 'test units', 'test title', document.getElementById('cost_field').getContext('2d'));
                            create_graph(barChartData, 'test units', 'test title', document.getElementById('net_return_field').getContext('2d'));
                            create_graph(barChartData, 'test units', 'test title', document.getElementById('dry_matter_field').getContext('2d'));
                            create_graph(barChartData, 'test units', 'test title', document.getElementById('milk_field').getContext('2d'));}}
                }],

            },



            {

                title: '<i class="fa fa-money fa-lg"></i>  Economics <br/> <progress class = "progres_bar" value="50" max="100" id=eco_p1 >50%</progress>',
                plain: true,
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
                        html: '<div id="container"><canvas  id="dry_matter_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="milk_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    }],
                    scope: this,
                    listeners:{activate: function() {
                        console.log(testChartData)
                        console.log("activated")
                        chartObj.cost_farm_chart = create_graph(chartObj.cost_farm_data, 'test units', 'test title', document.getElementById('cost_farm').getContext('2d'));
                        create_graph(barChartData, 'test units', 'test title', document.getElementById('net_return_farm').getContext('2d'));
                        create_graph(barChartData, 'test units', 'test title', document.getElementById('dry_matter_farm').getContext('2d'));
                        create_graph(barChartData, 'test units', 'test title', document.getElementById('milk_farm').getContext('2d'));

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
                        html: '<div id="container"><canvas  id="dry_matter_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    }],
                    listeners:{activate: function() {
                        create_graph(barChartData, 'test units', 'test title', document.getElementById('cost_field').getContext('2d'));
                            create_graph(barChartData, 'test units', 'test title', document.getElementById('net_return_field').getContext('2d'));
                            create_graph(barChartData, 'test units', 'test title', document.getElementById('dry_matter_field').getContext('2d'));
                            create_graph(barChartData, 'test units', 'test title', document.getElementById('milk_field').getContext('2d'));}}
                }],

            },{
                title: '<i class="fas fa-mountain"></i>  Soils <br/> <progress class = "progres_bar" value="50" max="100" id=soil_pb >50%</progress>',
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
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="soil_loss_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
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
                            chartObj.ploss_farm_chart = create_graph(barChartData, 'test units', 'test title', document.getElementById('ploss_farm').getContext('2d'));
                            chartObj.soil_loss_farm_chart = create_graph(barChartData, 'test units', 'test title', document.getElementById('soil_loss_farm').getContext('2d'));
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
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="soil_loss_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="dry_matter_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],
                             listeners:{activate: function() {
                            chartObj.ploss_field_chart = create_graph(barChartData, 'test units', 'test title', document.getElementById('ploss_field').getContext('2d'));
                            chartObj.soil_loss_field_chart = create_graph(barChartData, 'test units', 'test title', document.getElementById('soil_loss_field').getContext('2d'));

                    }}
                }],

            },{
                title: '<i class="fa fa-leaf fa-lg"></i>  Biodiversity<br/> <progress class = "progres_bar" value="50" max="100" id=bio_pb >50%</progress>',
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
                    html: "hiiiiiiiiii"
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container1" ><canvas id="bio_farm" style = "width:'+chart_width_single+';height:'+chart_height_single+';"></canvas></div>',
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
                    listeners:{activate: function() {
                        chartObj.bio_farm = create_graph(barChartData, 'test units', 'test title', document.getElementById('bio_farm').getContext('2d'));

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
//                    },
////                    {
////                        xtype: 'container',
////                        html: '<div id="container"><canvas  id="net_return_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
////                    },{
////                        xtype: 'container',
////                        html: '<div id="container"><canvas  id="dry_matter_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
////                    },{
////                        xtype: 'container',
////                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
////                    }
//                    ],
//                }
                ],
            },{
                title: '<i class="fa fa-tint  fa-lg"></i>  Runoff <br/> <progress class = "progres_bar" value="50" max="100" id=runoff_pb >50%</progress>',
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
                        html: '<div id="container" ><canvas id="cn_num" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="runoff" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },
//                    {
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
//                        html: '<div id="container"><canvas  id="dry_matter_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }],
//                }
                ],

            },{
                title: '<i class="fa fa-balance-scale  fa-lg"></i>  Compare',
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
//                        html: '<div id="container"><canvas  id="dry_matter_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }],
//                }
                ],

            },
            { title: '<i class="fas fa-book-open  fa-lg"></i>  Summary',
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
//                        html: '<div id="container"><canvas  id="dry_matter_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],
                }],




            }]

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
