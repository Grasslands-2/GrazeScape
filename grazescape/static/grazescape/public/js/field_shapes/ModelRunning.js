// Module is used to run the compute models functions of the app
var chartPopup
var barChartData
var barChart;
function runModels(layer,modelChoice) {

    barChartData = {
        labels: ["Fields"],
        datasets: []
    };
//if (chartPopup != undefined){
//    chartPopup.hide()
//}
    chartPopup = new Ext.form.Panel({
    autoDestroy: true,
    width: 500,
    height: 400,
    title: 'Model Results',
    floating: true,
    closable: true,
    draggable:true,
    resizable:true,
    html: '<div id="container"><canvas id="canvas"></canvas></div>'
});
    chartPopup.hide()
    chartPopup.show()
    var ctx = document.getElementById('canvas').getContext('2d');
    barChart = new Chart(ctx, {
        type: 'bar',
        data: barChartData,
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Model Output'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    scaleLabel: {
                    display: true,
                    labelString:" response.units"
                  }
                }]
            }
        }
    });
	 extentsArray = []; //empty array for extents list
	 layer.getSource().forEachFeature(function(f) { //iterates through fields to build extents array
	    console.log(f)
	    console.log(f.get("rotation"))
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
            crop_cover: f.get("cover_crop"),
//			doesn't appear to be in the table at this time
            rotation: rotation,
            density: f.get("grazingdensityval"),
            model_type: modelChoice
//            model_type: "other"
        }
        extentsArray.push(model_para)
	})
	extentsArray.forEach(myFunction);
////
	function myFunction(item,index) {
        runningLayers = [DSS.layer.ModelResult_field1,DSS.layer.ModelResult_field2,DSS.layer.ModelResult_field3]

      DSS.Inspector.computeResults(item,runningLayers[index]);
    }
//     DSS.Inspector.computeResults(extentsArray[1],runningLayers[1]);

//	//function inside of callmodelrun that actually calls computeresults on each field
//	const callModelRun = (extent,runningLayer) => {
//        console.log("Runing model in model running!!!!!!!!!!!!!!!!!!!!!!!!!")
//		DSS.Inspector.computeResults(extent,runningLayer);
//		return new Promise((resolve) => {
//			setTimeout(() => {
//				resolve();
//				//find way to get this to actually wait for models to complete,
//				//not just 3 seconds
//			}, 3000);
//	  	});
//	}
//
//	const startTime = Date.now();
//	//Sets up each callModelRun to run after each promise is resolved. IOW, makes them run one at a time.
//	const doNextPromise = (z) => {
//		runningLayers = [DSS.layer.ModelResult_field1,DSS.layer.ModelResult_field2,DSS.layer.ModelResult_field3]
//
//		callModelRun(extentsArray[z],runningLayers[z]).then(x => {
//			console.log("just ran this extent: " + extentsArray[z]);
//			z++;
//			if(z < extentsArray.length){
//			doNextPromise(z)}
//			else
//				console.log("DONE IN MODEL RUNNING!")
//		})
//	}
//	doNextPromise(0);
}



//------------------working variables--------------------
var type = "Polygon";
var source = fields_1Source_loc;

Ext.create('Ext.data.Store', {
	storeId: 'modelList',
	fields:['value'],
	data: [{
		value: 'Grass Model',
	}]
});

//------------------------------------------------------------------------------
Ext.define('DSS.field_shapes.ModelRunning', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.model_run_tools',
    alternateClassName: 'DSS.ModelRunTools',
    singleton: true,	
	
    autoDestroy: false,
    
    scrollable: 'y',

	requires: [
		//'DSS.ApplicationFlow.activeFarm',
		'DSS.field_shapes.apply.ModelSelection',
	],
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		if (!DSS['viewModel']) DSS['viewModel'] = {}
		DSS.viewModel.modelRunning = new Ext.app.ViewModel({
			/*formulas: {
				tillageValue: { 
					bind: '{tillage.value}',
					get: function(value) { return {tillage: value }; 			},
					set: function(value) { this.set('tillage.value', value); 	}
				}
			},
			data: {}*/
		})
		
		me.setViewModel(DSS.viewModel.modelRunning);
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				cls: 'section-title light-text text-drp-20',
				html: 'Models<i class="fas fa-draw-polygon fa-fw accent-text text-drp-50"></i>',
				height: 35
				},{
				xtype: 'container',
				style: 'background-color: #666; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); border-top-color:rgba(255,255,255,0.25); border-bottom-color:rgba(0,0,0,0.3); box-shadow: 0 3px 6px rgba(0,0,0,0.2)',
				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				margin: '8 4',
				padding: '2 8 10 8',
				defaults: {
					DSS_parent: me,
				},
				items: [{
					xtype: 'component',
					cls: 'information light-text text-drp-20',
					html: 'Model Settings',
				},{
					xtype: 'modelSelection'
				},
				/*{
					xtype: 'widget',
					editor: {}, // workaround for exception
					text: 'Model List', dataIndex: 'modelList', width: 200, 
					hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
					widget: {
						xtype: 'combobox',
						queryMode: 'local',
						store: 'modelList',
						displayField: 'display',
						valueField: 'value',
						triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
						listeners:{
							select: function(combo, value, eOpts){
								var record = combo.getWidgetRecord();
								record.set('modelList', value.get('value'));
								me.getView().refresh();
							}
						}
					}
				},*/
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Run Model',
					formBind: true,
					handler: function() { 
						var data = me.viewModel.data;
						var modelChoice = data.modelSelected.modelSelection
						console.log(modelChoice);
						console.log("run model");
						runModels(DSS.layer.fields_1,modelChoice);
					}
			    },
			 ]
			}]
		});
		me.callParent(arguments);
	},

	//--------------------------------------------------------------------------
	addModeControl: function() {
		let me = this;
		let c = DSS_viewport.down('#DSS-mode-controls');
		
		if (!c.items.has(me)) {
			Ext.suspendLayouts();
				c.removeAll(false);
				c.add(me);
			Ext.resumeLayouts(true);
		}
	}
	
});


