//const { stringify } = require("querystring")
// const path = require('path');
// const fs = require('fs');
// ploss scale bar values
var pLossColorArray = ["#204484","#3e75b2","#90b9e4","#d2f0fa","#fcffd8","#ffdaa0","#eb9159","#d25c34","#a52d18"]
var pLossValueArray =[0,1.5,3,4.5,6,7.5,9.6,11.2,12.8,15]
DSS.plossBol = false
DSS.erosionBol = false
DSS.yieldBol = false
// unique model time stamp holder
var modelruntime = ''
//This function gathers the yield data from the active scnearios fields for the yield adjustment table
function gatherYieldTableData() {
    fieldYieldArray = []
	var chartObjyieldarray = chartObj.rotation_yield_field.chartData.datasets

	for(field in chartObjyieldarray){
        if(chartObjyieldarray[field].toolTip[0] !== null){
            fieldYieldArray.push({
                id: chartObjyieldarray[field].dbID,
                name: chartObjyieldarray[field].label.slice(0,-3),
                rotationVal1: chartObjyieldarray[field].toolTip[0][0],
                rotationVal2: chartObjyieldarray[field].toolTip[0][1],
                grassType: chartObjyieldarray[field].toolTip[0][2],
                dMYieldAc: chartObjyieldarray[field].data[0]
            })
        }
	}
    //setting array values for each yield value
    var grassdataarray = chartObj.grass_yield_field.chartData.datasets
    var corndataarray = chartObj.corn_yield_field.chartData.datasets
    var silagedataarray = chartObj.corn_silage_yield_field.chartData.datasets
    var soydataarray = chartObj.soy_yield_field.chartData.datasets
    var oatdataarray = chartObj.oat_yield_field.chartData.datasets
    var alfalfadataarray = chartObj.alfalfa_yield_field.chartData.datasets
    //Loop through fields and pull yield data from each
    for(i in fieldYieldArray){
        var fieldID = fieldYieldArray[i].id
        for(g in grassdataarray){
            if (grassdataarray[g].dbID == fieldID){
                fieldYieldArray[i].grassYieldTonsAc = grassdataarray[g].data[0]
            }
        }
        for(c in corndataarray){
            if (corndataarray[c].dbID == fieldID){
                fieldYieldArray[i].cornGrainBrusdAc = corndataarray[c].data[0]
            }
        }
        for(s in silagedataarray){
            if (silagedataarray[s].dbID == fieldID){
                fieldYieldArray[i].cornSilageTonsAc = silagedataarray[s].data[0]
            }
        }
        for(so in soydataarray){
            if (soydataarray[so].dbID == fieldID){
                fieldYieldArray[i].soyGrainBrusAc = soydataarray[so].data[0]
            }
        }
        for(o in oatdataarray){
            if (oatdataarray[o].dbID == fieldID){
                fieldYieldArray[i].oatYieldBrusAc = oatdataarray[o].data[0]
            }
        }
        for(a in alfalfadataarray){
            if (alfalfadataarray[a].dbID == fieldID){
                fieldYieldArray[i].alfalfaYieldTonsAc = alfalfadataarray[a].data[0]
            }
        }
        rotationValSum = fieldYieldArray[i].rotationVal1 + fieldYieldArray[i].rotationVal2
        switch(rotationValSum){
            case 'ptcn': fieldYieldArray[i].rotationDisp = 'Continuous Pasture'
            break;
            case 'ptrt': fieldYieldArray[i].rotationDisp = 'Rotational Pasture'
            break;
            case 'dl': fieldYieldArray[i].rotationDisp = 'Dry Lot'
            break;
            case 'cc': fieldYieldArray[i].rotationDisp = 'Continuous Corn'
            break;
            case 'cg': fieldYieldArray[i].rotationDisp = 'Cash Grain'
            break;
            case 'dr': fieldYieldArray[i].rotationDisp = 'Silage/Corn/Alfalfa(3x)'
            break;
            case 'cso': fieldYieldArray[i].rotationDisp = 'Silage/Soy Beans/Oats'
            break;
            default: fieldYieldArray[i].rotationDisp = 'No Rotation'
        }
    }
    console.log(fieldYieldArray)
}; 
    
var fieldYieldArray = [];
var modelTypes = ['yield', 'ploss','runoff', 'bio']
//list of all the current and future charts
var chartList = [
//    "cost_farm", "cost_field",
//    "net_return_farm", "net_return_field",
    "grass_yield_farm", "grass_yield_field",
//    "milk_farm", "milk_field",
//    "nitrogen_farm",
    "ploss_farm", "ploss_field",
    "soil_loss_farm", "soil_loss_field",
//    "bio_farm",
    "cn_num_farm",
    "runoff_farm",
    "compare_farm",
    'corn_yield_farm','corn_yield_field',
    'corn_silage_yield_farm', 'corn_silage_yield_field',
    'soy_yield_farm','soy_yield_field',
    'oat_yield_farm', 'oat_yield_field',
    'alfalfa_yield_farm','alfalfa_yield_field',
    'rotation_yield_farm' , 'rotation_yield_field',
    'insecticide_farm', 'insecticide_field',
    'feed_breakdown',
    //'crop_feed_breakdown'
]
var chartColors = [
            {trans:'rgba(238, 119, 51,.2)', opa:'rgb(238, 119, 51)'},
             {trans:'rgba(0, 119, 187,.2)',opa:'rgb(0, 119, 187)'},
             {trans:'rgba(51, 187, 238,.2)',opa:'rgb(51, 187, 238)'},
             {trans:'rgba(238, 51, 119,.2)',opa:'rgb(238, 51, 119)'},
             {trans:'rgba(204, 51, 17,.2)',opa:'rgb(204, 51, 17)'},
             {trans:'rgba(0, 153, 136,.2)',opa:'rgb(0, 153, 136)'},
             {trans:'rgba(187, 187, 187,.2)',opa:'rgb(187, 187, 187)'}
        ]
// stores references to each chart object. Stores ChartNodes which store the actual chart object and stores the data for each chart
var chartObj = {}
//controls order of how datasets are displayed and with what colors
var chartDatasetContainer = {}
//https://personal.sron.nl/~pault/

var checkBoxScen = []
var checkBoxField = []
var hiddenData = {
    fields:[],
    scens:[],
}
var scenariosStore = Ext.create('Ext.data.Store', {
    fields: ['name','dbID'],
    data : []
});

DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')

//------------------------------------------------------------------------------
var dashBoardDialog = Ext.define('DSS.results.Dashboard', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_perimeter_dialog',
    requires: [
		'DSS.map.LayerMenu',
        'DSS.map.OutputMenu'
	],
    name: "dashboardWindow",
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
    maximizable:true,
    minimizable:true,
//	bodyPadding: 8,
	titleAlign: 'center',
	layout : 'fit',
	plain: true,
//    style: 'background-color: #18bc9c!important',
	title: 'Model Results',
	runModel: true,
    listeners:{
        "destroy": function(){
            DSS.MapState.destroyLegend();
        },
        "hide": function(){
            DSS.MapState.destroyLegend();
        },
        "close": function(){
            DSS.MapState.destroyLegend();
        },
        "minimize": function (window, opts) {
            window.collapse();
            window.setWidth(150);
            window.setHeight(150)
        }
    },
    tools: [{
        type: 'restore',
        handler: function (evt, toolEl, owner, tool) {
            var window = owner.up('window');
            window.setWidth(300);
            window.setHeight(300);
        }
    }],


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

	//--------------------------------------------------------------------------
	initComponent: function() {

	    console.log("Opening dialog")
        let chart_height = '25vh'
        let chart_width = '32vw'

        let chart_height_single = '50vh'
        let chart_width_single = '58vw'

        let chart_height_double = '50vh'
        let chart_width_double = '58vw'

		let me = this;
		layer = DSS.layer.fields_1
//
        if (this.runModel) {
            //assign model run timestamp
            modelruntime = String(new Date().valueOf())
			console.log(modelruntime)
            modelruntimeOrig = modelruntime
            fieldChangeList = fieldChangeList.flat()
            chartDatasetContainer = new ChartDatasetContainer()
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
            createDashBoard(me)
        }
        async function createDashBoard(dashboard){

            layerList = []
            await layer.getSource().forEachFeature(function(f) {
                layerList.push(f)
            })
            let fieldIter = await retrieveAllFieldsDataGeoserver()
            fieldIter = await fieldIter
            let download = await downloadRasters(fieldIter)
            download = await download
            console.log("download done")
            console.log("running model")

            numbFields = fieldIter.length
            totalFields = numbFields * modelTypes.length
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
                    case 'Feedoutput':
                        runoff_pb.max = numbFields
                        break
                    case 'bio':
                        bio_pb.max = numbFields
                        break
                }
            }
            console.log(fieldIter)
//            get parameters for the active scenario fields from the layer display
//          if fields arent in the active scenario then use the values from the database
//          we have to do it this because the inactive layers don't store the geographic properities that are needed to calculate area and extents for running the models
//          while the inactive fields are just retrieving their models results from the db
            for(item in fieldIter){
                f = fieldIter[item]
                console.log(f)

//              for each layer run each model type: yield (grass or crop), ero, pl
                for (model in modelTypes){
                    model_request = build_model_request(f.properties, f, modelTypes[model],modelruntime,DSS.activeScenario,DSS.activeRegion)
                    get_model_data(model_request).then(returnData =>{
                        console.log("RETURN DATA HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                        console.log(returnData[0])
                        console.log(f)
                        console.log(f.properties.is_dirty)
                        console.log(returnData[0].model_run_timestamp)
                        if(f.properties.is_dirty == false && returnData[0].model_run_timestamp != modelruntimeOrig){
                            modelruntime = returnData[0].model_run_timestamp
                            console.log("MODELRUNTIME CHANGED TO OLD VALUE");
                            console.log(returnData[0])
                            console.log(modelruntime);
                        }
                        //modelruntime = returnData[0].model_run_timestamp
//                      no model results with that particular field
                        switch (returnData[0].model_type){
                            case 'yield':
                                yield_pb.value = yield_pb.value + 1
                                if(yield_pb.value==yield_pb.max){
                                    yield_pb.hidden = true
                                    Ext.getCmp("yieldTab").setDisabled(false)
                                    Ext.getCmp("yieldFarmConvert").setDisabled(false)
                                    Ext.getCmp("yieldFieldConvert").setDisabled(false)
                                    console.log("LOOK FOR CHARTOBJ!!!%^%^%&^*&^*%^&*^&*%*&%&^%^&%*&^&^(*^&*%*^%^*^&*^*&%^&%^^&*^&(^*^%^&%&*^&*^&*%&^$^&%&*^")
                                    console.log(chartObj)
                                    let scenIndexAS = chartDatasetContainer.indexScenario(DSS.activeScenario)
                                    console.log(scenIndexAS)

                                    // var heiferFeedData = {
                                    //     pastYield: (chartObj.grass_yield_farm.sum[scenIndexAS]/chartObj.grass_yield_farm.count[scenIndexAS])*chartObj.grass_yield_farm.area[scenIndexAS],
                                    //     cornYield:(chartObj.corn_yield_farm.sum[scenIndexAS]/chartObj.corn_yield_farm.count[scenIndexAS])*chartObj.corn_yield_farm.area[scenIndexAS],
                                    //     cornSilageYield: (chartObj.corn_silage_yield_farm.sum[scenIndexAS]/chartObj.corn_silage_yield_farm.count[scenIndexAS])*chartObj.corn_silage_yield_farm.area[scenIndexAS],
                                    //     oatYield: (chartObj.oat_yield_farm.sum[scenIndexAS]/chartObj.oat_yield_farm.count[scenIndexAS])*chartObj.oat_yield_farm.area[scenIndexAS],
                                    //     alfalfaYield: (chartObj.alfalfa_yield_farm.sum[scenIndexAS]/chartObj.alfalfa_yield_farm.count[scenIndexAS])*chartObj.alfalfa_yield_farm.area[scenIndexAS],
                                    //     totalHeifers: DSS['viewModel'].scenario.data.heifers.heifers,
                                    //     heiferBreed: DSS['viewModel'].scenario.data.heifers.breedSize,
                                    //     heiferBred: DSS['viewModel'].scenario.data.heifers.bred,
                                    //     heiferDOP: DSS['viewModel'].scenario.data.heifers.daysOnPasture,
                                    //     heiferASW: DSS['viewModel'].scenario.data.heifers.asw,
                                    //     heiferWGG: DSS['viewModel'].scenario.data.heifers.tdwg
                                    // }
                                    // for (const prop in heiferFeedData){
                                    //     if (heiferFeedData[prop] == undefined || isNaN(heiferFeedData[prop] && typeof(heiferFeedData) !== 'string')){
                                    //         heiferFeedData[prop] = 0
                                    //     }
                                    // }
                                    // console.log(heiferFeedData)
                                    //calcHeiferFeedBreakdown(heiferFeedData)
                                    //gatherYieldTableData()
                                    //Ext.getCmp("feedTab").setDisabled(false)      

                                }
                                break
                            case 'ploss':
                                nut_pb.value = nut_pb.value + 1
                                if(nut_pb.value==nut_pb.max){
                                    nut_pb.hidden = true
                                    Ext.getCmp("nutrientsFarmConvert").setDisabled(false)
                                    Ext.getCmp("nutrientsFieldConvert").setDisabled(false)
                                    Ext.getCmp("nutTab").setDisabled(false)
                                }
                                ero_pb.value = ero_pb.value + 1
                                if(ero_pb.value==ero_pb.max){
                                    ero_pb.hidden = true
                                    Ext.getCmp("eroTab").setDisabled(false)
                                    Ext.getCmp("erosionFarmConvert").setDisabled(false)
                                    Ext.getCmp("erosionFieldConvert").setDisabled(false)
                                }
                                break
                            case 'runoff':
                                runoff_pb.value = runoff_pb.value + 1
                                if(runoff_pb.value == runoff_pb.max){
                                    runoff_pb.hidden =true
                                    Ext.getCmp("runoffTab").setDisabled(false)
                                }
                                break
                            case 'bio':
                                bio_pb.value = bio_pb.value + 1
                                if(bio_pb.value == bio_pb.max){
                                    bio_pb.hidden = true
                                    Ext.getCmp("bioTab").setDisabled(false)
                                }
                                break
                        }
                        totalFields = totalFields - 1
                        if(totalFields == 0){
                            Ext.getCmp("btnRunModels").setDisabled(false)
                            Ext.getCmp("compareTab").setDisabled(false)
                            Ext.getCmp("compareTabBtn").setDisabled(false)
                            console.log(f)
                            if(document.getElementById("modelSpinner") != null){
                              document.getElementById("modelSpinner").style.display = "none";
                            }
                            delete $.ajaxSetup().headers
                            Ext.ComponentQuery.query('tabpanel[name="mappedResultsTab"]')[0].setDisabled(false)
                        }
                        // if(f.properties.scenario_id == DSS.activeScenario){
                        //     var plextent = f.bbox
                        //     DSS.layer.ploss_field = new ol.layer.Image({
                        //         visible: true,
                        //         updateWhileAnimating: true,
                        //         updateWhileInteracting: true,
                        //         source: new ol.source.ImageStatic({
                        //         url: '/static/grazescape/public/images/ploss'+ f.properties.gid + '.png',
                        //         imageExtent: plextent
                        //         })
                        //     })
                        //     DSS.layer.ploss_field.set('name', 'DSS.layer.ploss_field_'+ f.properties.gid);
                        //     var plossGroupLayers = DSS.layer.PLossGroup.getLayers().getArray();
                        //     console.log(plossGroupLayers);
                        //     plossGroupLayers.push(DSS.layer.ploss_field);
                            
                        // }
                        Ext.getCmp('mainTab').update()
                    })
                }
            }
        }
//      put new tabs here
//TODO update
        var infrastructure = {

                title: '<i class="fas fa-wrench"></i>  Infrastructure <br/>',
                plain: true,
                disabled:true,

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
                id:"eroTab",
                disabled:true,
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
                        xtype: 'radiogroup',
                        id: 'erosionFarmConvert',
                        vertical: true,
                        columns:2,
                        items: [
                            {
                                boxLabel  : 'Erosion / Area',
                                inputValue: 'a',
                                checked:true
                            }, {
                                boxLabel  : 'Total Erosion',
                                inputValue: 't',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue, eOpts) {
                            displayAlternate("soil_loss_farm", e.id)
                         }},
                    },
                    {
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
                    id: 'eroFieldTab',
//                    disabled: true,
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
                        xtype: 'radiogroup',
                        id: 'erosionFieldConvert',
                        vertical: true,
                        columns:2,
                        items: [
                            {
                                boxLabel  : 'Erosion / Area',
                                inputValue: 'a',
                                checked:true
                            }, {
                                boxLabel  : 'Total Erosion',
                                inputValue: 't',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue, eOpts) {
                            displayAlternate("soil_loss_field", e.id)
                         }},
                    },
                    {
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
                id:"yieldTab",
                disabled:true,
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
                        columns: 1
                    },
                    defaults: {

                        style: 'padding:10px; ',
                        border:0,
                    },
                    items:[
                    {
                        xtype: 'radiogroup',
                        id: 'yieldFarmConvert',
                        vertical: true,
                        columns:2,
                        items: [
                            {
                                boxLabel  : 'Yield / Area',
                                inputValue: 'a',
                                checked:true
                            }, {
                                boxLabel  : 'Total Yield',
                                inputValue: 't',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue, eOpts) {
                            displayAlternate("grass_yield_farm", e.id)
                            displayAlternate("corn_yield_farm", e.id)
                            displayAlternate("corn_silage_yield_farm", e.id)
                            displayAlternate("soy_yield_farm", e.id)
                            displayAlternate("oat_yield_farm", e.id)
                            displayAlternate("alfalfa_yield_farm", e.id)
                            displayAlternate("rotation_yield_farm", e.id)
                            console.log(chartObj)
                         }},
                    },
//                    {
//
//                        xtype: 'container',
//                    },
                    {
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="rotation_yield_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="grass_yield_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="corn_yield_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="corn_silage_yield_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="soy_yield_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="oat_yield_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="alfalfa_yield_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
                    ],
                    scope: this,
                    listeners:{activate: async function() {
                        console.log("activated farm")
                        if(!chartObj.grass_yield_farm.show){document.getElementById('grass_yield_farm').style.display="none"};
                        if(!chartObj.corn_yield_farm.show){document.getElementById('corn_yield_farm').style.display="none"}
                        if(!chartObj.corn_silage_yield_farm.show){document.getElementById('corn_silage_yield_farm').style.display="none"}
                        if(!chartObj.soy_yield_farm.show){document.getElementById('soy_yield_farm').style.display="none"}
                        if(!chartObj.oat_yield_farm.show){document.getElementById('oat_yield_farm').style.display="none"}
                        if(!chartObj.alfalfa_yield_farm.show){document.getElementById('alfalfa_yield_farm').style.display="none"}
                        if(!chartObj.rotation_yield_farm.show){document.getElementById('rotation_yield_farm').style.display="none"}

                         if (chartObj["rotation_yield_farm"].chart !== null){
                         return
                        }
                        //------------------------------------
                        //This bit of code is used to clean up datasets in order to ensure they will chart
                        var farmYeildChartArray = [chartObj.grass_yield_farm,chartObj.corn_yield_farm,chartObj.corn_silage_yield_farm,
                            chartObj.soy_yield_farm,chartObj.oat_yield_farm,chartObj.alfalfa_yield_farm,chartObj.rotation_yield_farm]
                        for (chart in farmYeildChartArray){
                            console.log(farmYeildChartArray[chart])
                            if(chart == "grass_yield_farm"||"corn_yield_farm"||"corn_silage_yield_farm"||"soy_yield_farm"||"oat_yield_farm"||"alfalfa_yield_farm"||"rotation_yield_farm")
                            {
                                console.log("Yield Chart Hit")
                                for(i in farmYeildChartArray[chart].chartData.datasets){
                                    console.log(farmYeildChartArray[chart].chartData.datasets[i].data)
                                    if(farmYeildChartArray[chart].chartData.datasets[i].data.length > 2){
                                        farmYeildChartArray[chart].chartData.datasets[i].data = [null,null];
                                        console.log("found bad chart input")
                                    }
                                }
                            }
                        }
                        //--------------------------------------------
                        chartObj.grass_yield_farm.chart = create_graph(chartObj.grass_yield_farm, 'Grass Yield', document.getElementById('grass_yield_farm').getContext('2d'));
                        chartObj.corn_yield_farm.chart = create_graph(chartObj.corn_yield_farm, 'Corn Grain Yield', document.getElementById('corn_yield_farm').getContext('2d'));
                        chartObj.corn_silage_yield_farm.chart = create_graph(chartObj.corn_silage_yield_farm, 'Corn Silage Yield', document.getElementById('corn_silage_yield_farm').getContext('2d'));
                        chartObj.soy_yield_farm.chart = create_graph(chartObj.soy_yield_farm, 'Soy Yield', document.getElementById('soy_yield_farm').getContext('2d'));
                        chartObj.oat_yield_farm.chart = create_graph(chartObj.oat_yield_farm, 'Oat Yield', document.getElementById('oat_yield_farm').getContext('2d'));
                        chartObj.alfalfa_yield_farm.chart = create_graph(chartObj.alfalfa_yield_farm, 'Alfalfa Yield', document.getElementById('alfalfa_yield_farm').getContext('2d'));
                        chartObj.rotation_yield_farm.chart = create_graph(chartObj.rotation_yield_farm, 'Total Yield', document.getElementById('rotation_yield_farm').getContext('2d'));
                    }
                }
                //-------------------------Yield Field Tab-------------------------------------
                },{ xtype: 'panel',
                    title: '<i class="fas fa-seedling"></i></i>  Field',
                    border: false,
                    id: 'yieldFieldTab',
//                    disabled: true,
                                    scrollable: true,

                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[
                        {
                        xtype: 'button',
                        cls: 'button-text-pad',
                        componentCls: 'button-margin',
                        text: 'Manually Adjust Yields',
                        handler: async function(self) {
                            console.log(chartObj)
                            console.log(fieldYieldArray)
                            await gatherYieldTableData()
                            {
                                DSS.dialogs.YieldAdjustment = Ext.create('DSS.results.YieldAdjustment'); 
                                DSS.dialogs.YieldAdjustment.setViewModel(DSS.viewModel.scenario);		
                            }
                            DSS.dialogs.YieldAdjustment.show().center().setY(0);
                        }
                    },
                    {
                        xtype: 'radiogroup',
                        id: 'yieldFieldConvert',
                        vertical: true,
                        columns:2,
                        items: [
                            {
                                boxLabel  : 'Yield / Area',
                                inputValue: 'a',
                                checked:true
                            }, {
                                boxLabel  : 'Total Yield',
                                inputValue: 't',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue, eOpts) {
                            displayAlternate("grass_yield_field", e.id)
                            displayAlternate("corn_yield_field", e.id)
                            displayAlternate("corn_silage_yield_field", e.id)
                            displayAlternate("soy_yield_field", e.id)
                            displayAlternate("oat_yield_field", e.id)
                            displayAlternate("alfalfa_yield_field", e.id)
                            displayAlternate("rotation_yield_field", e.id)
                         }},
                    },
                    //---------------------------------------------------------------------------------------------------- 
                    {
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="rotation_yield_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="grass_yield_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="corn_yield_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="corn_silage_yield_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="soy_yield_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="oat_yield_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="alfalfa_yield_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
                    ],
                    listeners:{activate: function() {
                        console.log("activated field")
                        if(!chartObj.grass_yield_field.show){document.getElementById('grass_yield_field').style.display="none"};
                        if(!chartObj.corn_yield_field.show){document.getElementById('corn_yield_field').style.display="none"}
                        if(!chartObj.corn_silage_yield_field.show){document.getElementById('corn_silage_yield_field').style.display="none"}
                        if(!chartObj.soy_yield_field.show){document.getElementById('soy_yield_field').style.display="none"}
                        if(!chartObj.oat_yield_field.show){document.getElementById('oat_yield_field').style.display="none"}
                        if(!chartObj.alfalfa_yield_field.show){document.getElementById('alfalfa_yield_field').style.display="none"}
                        if(!chartObj.rotation_yield_field.show){document.getElementById('rotation_yield_field').style.display="none"}
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


                    },
                }
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
//                        html: '<div id="container" ><canvas id="cost_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="net_return_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                    },{
                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    }],
                    scope: this,
                    listeners:{activate: function() {
//                        console.log("activated farm")
//                          if (chartObj["cost_farm"].chart !== null){
//                            return
////                            chartObj["cost_farm"].chart.destroy()
////                            chartObj["net_return_farm"].chart.destroy()
//                        }
//                        chartObj.cost_farm.chart = create_graph(chartObj.cost_farm, 'Cost per Dry Matter Ton', document.getElementById('cost_farm').getContext('2d'));
//                        chartObj.net_return_farm.chart = create_graph(chartObj.cost_farm, 'Net Return per Acre', document.getElementById('net_return_farm').getContext('2d'));
////                        create_graph(barChartData, 'test units', 'test title', document.getElementById('milk_farm').getContext('2d'));

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
//                        html: '<div id="container" ><canvas id="cost_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="net_return_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                    },{
                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    }],
                    listeners:{activate: function() {
//                        console.log("activated field")
//                        if (chartObj["cost_field"].chart !== null){
//                            return
////                            chartObj["cost_field"].chart.destroy()
////                            chartObj["net_return_field"].chart.destroy()
//                        }
//                        chartObj.cost_field.chart = create_graph(chartObj.cost_field, 'test title', document.getElementById('cost_field').getContext('2d'));
//                        chartObj.net_return_field.chart = create_graph(chartObj.net_return_field, 'test title', document.getElementById('net_return_field').getContext('2d'));
//                            create_graph(barChartData, 'test units', 'test title', document.getElementById('milk_field').getContext('2d'));
                    }}
                }],

            }
            //TODO update
        var nutrients = {
                title: '<i class="fas fa-hand-holding-water"></i>  Nutrients <br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=nut_pb >50%</progress>',
                plain: true,
                id:"nutTab",
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
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'radiogroup',
                        id: 'nutrientsFarmConvert',
                        vertical: true,
                        columns:2,
                        items: [
                            {
                                boxLabel  : 'Nutrients / Area',
                                inputValue: 'a',
                                checked:true
                            }, {
                                boxLabel  : 'Total Nutrients',
                                inputValue: 't',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue, eOpts) {
                            displayAlternate("ploss_farm", e.id)
                         }},
                    },
                   {
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
                                return
                            }
                            chartObj.ploss_farm.chart = create_graph(chartObj.ploss_farm, 'Phosphorous Loss', document.getElementById('ploss_farm').getContext('2d'));
                    }}

                },{ xtype: 'panel',
                    title: '<i class="fas fa-seedling"></i></i>  Field',
                     border: false,
//                   disabled: true,
                    id: 'nutFieldTab',
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
                        xtype: 'radiogroup',
                        id: 'nutrientsFieldConvert',
                        vertical: true,
                        columns:2,
                        items: [
                            {
                                boxLabel  : 'Nutrients / Area',
                                inputValue: 'a',
                                checked:true
                            }, {
                                boxLabel  : 'Total Nutrients',
                                inputValue: 't',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue, eOpts) {
                            displayAlternate("ploss_field", e.id)
                         }},
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

            var feedoutput = {
                title: '<i class="fab fa-pagelines"></i> Feed Breakdown<br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=bio_pb >50%</progress>',
                plain: true,
                id:"feedTab",
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
                        html: '<div id="container" ><canvas id="feed_breakdown" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                        },
                    ],
                    listeners:{activate: function() {
                        if (chartObj["feed_breakdown"].chart !== null){
                            return
                        }
                        //console.log(heifer_feed_breakdown_data)
                        chartObj.feed_breakdown.chart = create_graph(chartObj.feed_breakdown, 'Heifer Feeding Break Down', document.getElementById('feed_breakdown').getContext('2d'));

                    }}

                }],
            }



//------------------------------------------------------------------------------------------


        var bio = {
                title: '<i class="fa fa-leaf"></i>  Insecticide<br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=bio_pb >50%</progress>',
                plain: true,
                id:"bioTab",
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
                     id: 'insectFieldTab',
//                    disabled: true,
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
                id:"runoffTab",
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

                ],

            }
        var compare =  {
                title: '<i class="fa fa-balance-scale  fa-lg"></i>  Compare Scenarios',
                plain: true,
                id: "compareTab",
                disabled:true,
                tabConfig:{
                    tooltip: "Compare scenarios using a radar chart",
//                    cls: "myBar"
                },

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
                            valueField: 'dbID',
                            listeners:{change: function() {
                                console.log("changing base scenario")
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
                    },
                    // {
                    //     title: "Feed Breakdown",
                    //     xtype: 'panel',

                    //     width: chart_width,
                    //     collapsible: true,
                    //     items:[{
                    //       id: 'checkInsecticide',
                    //       xtype: 'checkboxgroup',
                    //         layout: {
                    //             type: 'table',
                    //             // The total column count must be specified here
                    //             columns: 1
                    //         },
                    //         listeners:{change: function(box, newVal, oldVal, e) {
                    //             populateRadarChart()
                    //         }},
                    //         items:compCheckBoxes.insectVar
                    //     }]
                    // },
                    {
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
//                        Ext.getCmp("scenCombobox").setValue(scenariosStore.getAt('0').get('name'))
//                        Ext.getCmp('scenCombobox').setValue(scenariosStore.getAt('0').get('name'));

                    }}
                },
                { xtype: 'panel',
                    title: '<i class="fas fa-seedling"></i></i>  Comparison',
                     border: false,
                     scrollable: true,

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
                        html: '<div id="container" ><canvas id="compare_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },

                    ],
                   scope: this,
                    listeners:{activate: function() {
                        console.log("activated farm")
                          if (chartObj["compare_farm"].chart !== null){

                            chartObj.compare_farm.chart.update()

                            return
                        }
                        chartObj.compare_farm.chart = create_graph_radar(chartObj.compare_farm, chartObj.compare_farm.title, document.getElementById('compare_farm').getContext('2d'));


                    }}
                }
                ],

            }
        var summary =  { title: '<i class="fas fa-book-open  fa-lg"></i>  Summary Report',
            disabled:true,
            plain: true,
            tabConfig:{
                    tooltip: "Download a report of model outputs, infrastructure and chart images",
//                    cls: "myBar"
                },
            id: "compareTabBtn",
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
                        text: 'Download Summary Report',
                        id: 'downloadSummaryBtn',
                        tooltip: 'Download charts and csv',
                          handler: function(e) {
                            console.log(e)
                            printSummary()
                          }
//                        text: 'Yearly Yield'
                    }
                    ],

                }]
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
                listeners:{activate: function() {
                    console.log("options")
                    if(Ext.getCmp('fieldLegend').items.length<1){

                        Ext.getCmp('fieldLegend').add(checkBoxField)
                        Ext.getCmp('scenLegend').add(checkBoxScen)
                    }
                }},

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
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Scenario',
                    columns: 1,
                     vertical: true,
                    id: 'scenLegend',
//                    collapsible: true,
                    labelAlign: 'top',
                    defaultType: 'checkboxfield',
                    items:checkBoxScen,


                },{
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Field',
                    columns: 1,
                     vertical: true,
                    id: 'fieldLegend',
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
                ],

            }
            var outputLayers =  { 
            title: 'Mapped Results',
            disabled:true,
            id:"mappedResultsTab",
            name:"mappedResultsTab",
            plain: true,
            tabConfig:{
                    tooltip: "Turn output layers on and off, on the map",
//                    cls: "myBar"
                },
            id: "layersBtn",
            tabBar : {
                layout: {
                    pack: 'center',
                        background: '#C81820',
                    }
                },
            xtype: 'tabpanel',
            style: 'background-color: #377338;',
            defaults: {
                border:false,
                bodyBorder: false,
            },
            scrollable: true,
            listeners:{activate: function() {
                console.log("MAPPED RESULTS ACTIVATED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                var layerslengtharray = DSS.layer.PLossGroup.getLayers().getArray().length
                //Check to see if models were run and thus if there are new pngs to work with.
                if(layerslengtharray < 1){
                    console.log("No pngs ")
                    console.log(modelruntime)
                    //DSS.map.removeLayer(DSS.layer.PLossGroup);
                    //DSS.map.addLayer(DSS.layer.PLossGroup)
                    var fArray = []
                    var fExtents = []
                    DSS.layer.fields_1.getSource().getFeatures().forEach(function(f) {
                        console.log(f)
                        fArray.push(f);
                    })
                    console.log(fArray);
                    for(i in fArray){
                        fExtents = fArray[i].values_.geometry.extent_
                        for(e in fExtents){
                            fExtents[e] = fExtents[e].toFixed(4)
                        }
                        fExtentsNum = fExtents.map(Number);
                        var fId = fArray[i].values_.gid
                        console.log(fExtentsNum)
                        console.log(fId)
                        DSS.layer.ploss_field = new ol.layer.Image({
                            visible: false,
                            opacity: 0,
                            updateWhileAnimating: true,
                            updateWhileInteracting: true,
                            source: new ol.source.ImageStatic({
                            url: '/static/grazescape/public/images/ploss'+ String(fId) + '_' + modelruntime + '.png',
                            imageExtent: fExtentsNum
                            })
                        })
                        DSS.layer.ploss_field.set('name', 'ploss'+ String(fId));
                        var plossGroupLayers = DSS.layer.PLossGroup.getLayers().getArray();
                        if(plossGroupLayers.length == 0){
                            plossGroupLayers.push(DSS.layer.ploss_field);
                        }
                        else{
                            for(l in plossGroupLayers){
                                console.log(plossGroupLayers[l].values_.name)
                                console.log(DSS.layer.ploss_field.values_.name)
                                if(plossGroupLayers[l].values_.name == DSS.layer.ploss_field.values_.name){
                                    const index = plossGroupLayers.indexOf(plossGroupLayers[l]);
                                    if(index > -1) {
                                        plossGroupLayers.splice(index,1);
                                        console.log("SPLICED :" + DSS.layer.ploss_field.values_.name)
                                    }
                                    plossGroupLayers.push(DSS.layer.ploss_field);
                                }
                            }
                        plossGroupLayers.push(DSS.layer.ploss_field);
                        }
                        //--------------------Runoff_---------------------------------------
                        DSS.layer.runoff_field = new ol.layer.Image({
                            visible: false,
                            updateWhileAnimating: true,
                            updateWhileInteracting: true,
                            source: new ol.source.ImageStatic({
                            url: '/static/grazescape/public/images/runoff'+ String(fId) + '_' + modelruntime + '.png',
                            imageExtent: fExtentsNum
                            })
                        })
                        DSS.layer.runoff_field.set('name', 'runoff'+ String(fId));
                        var erosionGroupLayers =DSS.layer.erosionGroup.getLayers().getArray();
                        if(erosionGroupLayers.length == 0){
                            erosionGroupLayers.push(DSS.layer.runoff_field);
                        }
                        else{
                            for(l in erosionGroupLayers){
                                console.log(erosionGroupLayers[l].values_.name)
                                console.log(DSS.layer.runoff_field.values_.name)
                                if(erosionGroupLayers[l].values_.name == DSS.layer.runoff_field.values_.name){
                                    const index = erosionGroupLayers.indexOf(erosionGroupLayers[l]);
                                    if(index > -1) {
                                        erosionGroupLayers.splice(index,1);
                                        console.log("SPLICED :" + DSS.layer.runoff_field.values_.name)
                                    }
                                    erosionGroupLayers.push(DSS.layer.runoff_field);
                                }
                            }
                        erosionGroupLayers.push(DSS.layer.runoff_field);
                        }
                    //--------------------Yield_---------------------------------------
                        DSS.layer.yield_field = new ol.layer.Image({
                            visible: false,
                            updateWhileAnimating: true,
                            updateWhileInteracting: true,
                            source: new ol.source.ImageStatic({
                            url: '/static/grazescape/public/images/yield'+ String(fId) + '_' + modelruntime + '.png',
                            imageExtent: fExtentsNum
                            })
                        })
                        DSS.layer.yield_field.set('name', 'yield'+ String(fId));
                        var yieldGroupLayers = DSS.layer.yieldGroup.getLayers().getArray();
                        if(yieldGroupLayers.length == 0){
                            yieldGroupLayers.push(DSS.layer.yield_field);
                        }
                        else{
                            for(l in yieldGroupLayers){
                                console.log(yieldGroupLayers[l].values_.name)
                                console.log(DSS.layer.yield_field.values_.name)
                                if(yieldGroupLayers[l].values_.name == DSS.layer.yield_field.values_.name){
                                    const index = yieldGroupLayers.indexOf(yieldGroupLayers[l]);
                                    if(index > -1) {
                                        yieldGroupLayers.splice(index,1);
                                        console.log("SPLICED :" + DSS.layer.yield_field.values_.name)
                                    }
                                    yieldGroupLayers.push(DSS.layer.yield_field);
                                }
                            }
                        yieldGroupLayers.push(DSS.layer.yield_field);
                        }
                    }
                    //---------------------------------------------------------------------------
                    DSS.map.removeLayer(DSS.layer.PLossGroup);
				    DSS.map.addLayer(DSS.layer.PLossGroup)
                    //DSS.layer.PLossGroup.setVisible(true)
                    DSS.layer.PLossGroup.getLayers().forEach(function(layer){
                        //layer.setVisible(true)
                        var extents = layer.values_.source.imageExtent_
                        //Use this form when you have unique model run ids.
                        layer.setSource(new ol.source.ImageStatic({
                            url: '/static/grazescape/public/images/'+ layer.values_.name + '_'+ modelruntime + '.png',
                            imageExtent: extents
                        }))
                        layer.getSource().changed();
                    })
                    DSS.map.removeLayer(DSS.layer.erosionGroup);
                    DSS.map.addLayer(DSS.layer.erosionGroup)
                    DSS.layer.erosionGroup.getLayers().forEach(function(layer){
                        layer.setVisible(true)
                        var extents = layer.values_.source.imageExtent_
                        //Use this form when you have unique model run ids.
                        layer.setSource(new ol.source.ImageStatic({
                            url: '/static/grazescape/public/images/'+ layer.values_.name + '_'+ modelruntime + '.png',
                            imageExtent: extents
                        }))
                        layer.getSource().changed();
                    })
                    DSS.map.removeLayer(DSS.layer.yieldGroup);
                    DSS.map.addLayer(DSS.layer.yieldGroup)
                    DSS.layer.yieldGroup.getLayers().forEach(function(layer){
                        layer.setVisible(true)
                        var extents = layer.values_.source.imageExtent_
                        //Use this form when you have unique model run ids.
                        layer.setSource(new ol.source.ImageStatic({
                            url: '/static/grazescape/public/images/'+ layer.values_.name + '_'+ modelruntime + '.png',
                            imageExtent: extents
                        }))
                        layer.getSource().changed();
                    })
                    Ext.ComponentQuery.query('window[name="dashboardWindow"]')[0].setHeight('30%')
                }else{
                    console.log("PNGs present")
                    DSS.map.removeLayer(DSS.layer.PLossGroup);
                    DSS.map.addLayer(DSS.layer.PLossGroup)
                    DSS.layer.PLossGroup.getLayers().forEach(function(layer){
                        layer.setVisible(true)
                        console.log(layer)
                        var extents = layer.values_.source.imageExtent_
                        //Use this form when you have unique model run ids.
                        layer.setSource(new ol.source.ImageStatic({
                            url: '/static/grazescape/public/images/'+ layer.values_.name + '_'+ modelruntime + '.png',
                            imageExtent: extents
                        }))
                        layer.getSource().changed();
                    })
                    DSS.map.removeLayer(DSS.layer.erosionGroup);
                    DSS.map.addLayer(DSS.layer.erosionGroup)
                    DSS.layer.erosionGroup.getLayers().forEach(function(layer){
                        layer.setVisible(true)
                        var extents = layer.values_.source.imageExtent_
                        //Use this form when you have unique model run ids.
                        layer.setSource(new ol.source.ImageStatic({
                            url: '/static/grazescape/public/images/'+ layer.values_.name + '_'+ modelruntime + '.png',
                            imageExtent: extents
                        }))
                        layer.getSource().changed();
                    })
                    DSS.map.removeLayer(DSS.layer.yieldGroup);
                    DSS.map.addLayer(DSS.layer.yieldGroup)
                    DSS.layer.yieldGroup.getLayers().forEach(function(layer){
                        layer.setVisible(true)
                        var extents = layer.values_.source.imageExtent_
                        //Use this form when you have unique model run ids.
                        layer.setSource(new ol.source.ImageStatic({
                            url: '/static/grazescape/public/images/'+ layer.values_.name + '_'+ modelruntime + '.png',
                            imageExtent: extents
                        }))
                        layer.getSource().changed();
                    })
                    Ext.ComponentQuery.query('window[name="dashboardWindow"]')[0].setHeight('30%')
                }
            },
            deactivate: function() {
                Ext.ComponentQuery.query('window[name="dashboardWindow"]')[0].setHeight('80%');
                DSS.MapState.destroyLegend();
                DSS.layer.PLossGroup.getLayers().forEach(function(layer){
                    layer.setVisible(false)
                    //layer.setSource(null)
                })
                DSS.layer.erosionGroup.getLayers().forEach(function(layer){
                    layer.setVisible(false)
                    //layer.setSource(null)
                })
                DSS.layer.yieldGroup.getLayers().forEach(function(layer){
                    layer.setVisible(false)
                    //layer.setSource(null)
                })
            }},
//                inner tabs for farm and field scale
            items:[
            {
				xtype: 'radiogroup',
                title: '<i class="fas fa-warehouse"></i>  Farm',
					columns: 1, 
					vertical: true,
					collapsible: true,
					defaults: {
						padding: '2 0',
						group: 'input-layer'
					},
					items: [
						{
							boxLabel: 'Phosphorus Loss',
							listeners:{change: async function()
                                //you will have to look into .on functions for the group layer to get
                                //the layers to show up when the radio buttions are clicked.
								{
									if(this.checked){
										console.log('Erosion clicked')
                                        DSS.MapState.showContinuousLegend(pLossColorArray, pLossValueArray);
                                        DSS.layer.PLossGroup.setVisible(true);
                                        DSS.layer.PLossGroup.setVisible(false);
                                        await DSS.layer.PLossGroup.getLayers().forEach(function(layer){
                                            layer.setVisible(true)
                                            layer.getSource().on('imageloadend', function(){
                                                layer.setOpacity(1);
                                                yourLayer.getSource().changed();
                                                //DSS.map.render()
                                            })
                                            layer.getSource().refresh();
                                        })
                                        DSS.layer.PLossGroup.setVisible(true);
									}
									else{
										DSS.layer.PLossGroup.setVisible(false);
									}
                                    // var center = DSS.map.getView().getCenter();
                                    // DSS.map.getView().setCenter([center[0] + 5, center[1] +  + 5]);
                                    // DSS.map.updateSize()
								}
							}
						},
                        {
							boxLabel: 'Erosion',
							listeners:{change: async function(checked)
								{
									if(this.checked){
										console.log('Erosion clicked')
                                        DSS.MapState.showContinuousLegend(pLossColorArray, pLossValueArray);
                                        DSS.layer.erosionGroup.setVisible(true);
                                        DSS.layer.erosionGroup.setVisible(false);
                                        await DSS.layer.erosionGroup.getLayers().forEach(function(layer){
                                            layer.getSource().changed();
                                            layer.getSource().refresh();
                                        })
                                        DSS.layer.erosionGroup.setVisible(true);
									}
									else{
										DSS.layer.erosionGroup.setVisible(false);
									}
								}
							}
						},
						{
							boxLabel: 'Yield',
							listeners:{change: async function(checked)
								{
									if(this.checked){
										console.log('Yield clicked')
                                        //DSS.MapState.showContinuousLegend(pLossColorArray, pLossValueArray);
                                        DSS.MapState.destroyLegend();
                                        console.log(DSS.layer.yieldGroup)
                                        DSS.layer.yieldGroup.setVisible(true);
                                        DSS.layer.yieldGroup.setVisible(false);
                                        await DSS.layer.yieldGroup.getLayers().forEach(function(layer){
                                            layer.getSource().changed();
                                            layer.getSource().refresh();
                                        })
                                        DSS.layer.yieldGroup.setVisible(true);
									}
									else{
										DSS.layer.yieldGroup.setVisible(false);
									}
								}
							}
						},
						{ 
							boxLabel: 'No Output Overlay', 
							listeners:{change: function(checked)
								{
									if(this.checked){
										console.log(this.checked)
										DSS.MapState.destroyLegend();
										DSS.layer.yieldGroup.setVisible(false);
                                        DSS.layer.erosionGroup.setVisible(false);
                                        DSS.layer.PLossGroup.setVisible(false);
									}
								}
							}
						},
					]
			},]
            
        }    
        var phantom = { title: 'Model Select',
                plain: true,
                hidden:true,
                tabConfig:{
//                    tooltip: "Control options and visibility of charts",
//                    cls: "myBar"
                },
//                tabBar : {
//                    layout: {
//                        pack: 'center',
//                            //background: '#C81820',
//                     }
//                 },
                xtype: 'container',
//                style: 'background-color: #377338;',
                html: '<div class = "center">Please click a tab on the left panel. As model runs complete more tabs will be available to select.</div><div id = "modelSpinner" class="loader"></div>',
                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,
            }

//		Main tab panel
        let tabs = Ext.create('Ext.tab.Panel', {
            plain: true,
            tabPosition: 'left',
            id: 'mainTab',
//            disabled:true,
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
            listeners: {change:function()
            {
                console.log('Hi from layers button')
            }},
//                inner tabs for farm and field scale
            items: [
                phantom,
                summary,
                yield,
                erosion,
                nutrients,
                runoff,
                //feedoutput,
                bio,
                economics,
                infrastructure,
                compare,
                outputLayers,
//                summary,
                options,
           ]
        })

		Ext.applyIf(me, {

		    items: [{
				xtype: 'container',
				id: 'dashboardContainer',
				alwaysOnTop: true,
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
