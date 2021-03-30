// Module is used to run the compute models functions of the app

function runModels(layer) {
	
	 extentsArray = []; //empty array for extents list
	 layer.getSource().forEachFeature(function(f) { //iterates through fields to build extents array
		var extentTransform = function(fieldFeature){
			//let fObj = [];
			//let fGrass = fieldFeature.values_.;
			let e = fieldFeature.values_.geometry.extent_;
			let pt1 = ol.proj.transform([e[0],e[1]], 'EPSG:3857', 'EPSG:3071'),
			pt2 = ol.proj.transform([e[2],e[3]], 'EPSG:3857', 'EPSG:3071');

			let p =	pt1.concat(pt2);

			extentsArray.push(p) //push each extent to array

		};
		extentTransform(f)//runs extent transform
	})
	//function inside of callmodelrun that actually calls computeresults on each field
	const callModelRun = (extent) => { 
		DSS.Inspector.computeResults(extent,DSS.layer.ModelResult);
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, 1000);
	  	});
	}
	
	const startTime = Date.now();
	//Sets up each callModelRun to run after each promise is resolved. IOW, makes them run one at a time.
	const doNextPromise = (z) => {
		callModelRun(extentsArray[z]).then(x => {
			console.log("just ran this extent: " + x);
			z++;

			if(z < extentsArray.length)
				doNextPromise(z)
			else 
				console.log("DONE IN MODEL RUNNING!")
		})
	}
	doNextPromise(0);
}

function wfs_field_insert(feat,geomType) {  
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/Farms',
		Geometry: 'geom',
        featureType: 'field_1',
        srsName: 'EPSG:3857'
    });
    console.log(feat)
    node = formatWFS.writeTransaction([feat], null, null, formatGML);
	console.log(node);
    s = new XMLSerializer();
    str = s.serializeToString(node);
    console.log(str);
    $.ajax('http://localhost:8081/geoserver/wfs?',{
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
function createField(lac,non_lac,beef,crop,tillageInput,soil_pInput){
	
	DSS.draw = new ol.interaction.Draw({
		source: source,
		type: 'MultiPolygon',
		geometryName: 'geom'
	});
	DSS.map.addInteraction(DSS.draw);
	console.log("draw is on");
	//console.log(DSS.activeFarm);
	var af = parseInt(DSS.activeFarm,10)

	DSS.draw.on('drawend', function (e,) {
		e.feature.setProperties({
			id: af,
			scenario_i: af,
			soil_p: soil_pInput,
			om: 10,
			rotation: 'PS',
			graze_beef_cattle: beef,
			graze_dairy_lactating: lac,
			graze_dairy_non_lactating: non_lac,
			cover_crop: crop,
			tillage: tillageInput
		})
		var geomType = 'polygon'
		wfs_field_insert(e.feature, geomType)
		console.log("HI! WFS feild Insert ran!")
	})     
}
//------------------working variables--------------------
var type = "Polygon";
var source = fields_1Source;

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
						console.log("run model")
						runModels(DSS.layer.fields_1);
					}
			    }]
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


