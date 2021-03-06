//--------------------------------------------------------------------------
var filter_task = new Ext.util.DelayedTask(function(){
	if (!DSS.layer) return;

	DSS.Inspector.computeResults(undefined, DSS.layer.ModelResult);
});

var DSS_Refilter = function() {
	filter_task.delay(0);
}
var DSS_RefilterDelayed = function(msDelay) {
	filter_task.delay(msDelay);
}



//var

DSS.utils.addStyle('.fa-spin-fast {-webkit-animation: fa-spin 1s linear infinite;animation:fa-spin 1s linear infinite}')
DSS.utils.addStyle('.spinner-working { color: #d41; display: block}')//#3892d4
DSS.utils.addStyle('.spinner-working-lt { color: #f87; display: block}')//#0ff
DSS.utils.addStyle('.spinner-working-dk { color: #000; display: block}')
DSS.utils.addStyle('.spinner-working-shdw { color: rgba(0,0,0,0.1); text-shadow: 0 0 2px rgba(0,0,0,0.1); display: block}')

//------------------------------------------------------------------------------
Ext.define('DSS.inspector.Main', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.inspector',
    alternateClassName: 'DSS.Inspector',
    singleton: true,	
    autoDestroy: false,
	
    requires: [
    	'DSS.inspector.DataSource',
    	'DSS.inspector.RestrictResults',
    	'DSS.results.ResultsMain',
    ],
    
    scrollable: 'y',

    listeners: {
    	afterrender: function(self) {
    		self.DSS_InspectorWorking = Ext.create('Ext.container.Container', {
    			floating: true,
    			shadow: false,
    			width: 36, height: 36,
    			x: DSS.LayerButton.x,
    			y: 36,
    			layout: 'absolute',
    			items: [{
    				xtype: 'component',
    				x: 4, y: 8,
    				cls: 'spinner-working-shdw',
    				html: '<i class="fas fa-2x fa-spinner fa-spin-fast"></i>',
    			},{
    				xtype: 'component',
    				x: 4, y: 0,
    				cls: 'spinner-working-lt',
    				html: '<i class="fas fa-2x fa-spinner fa-spin-fast"></i>',
    			},{
    				xtype: 'component',
    				x: 4, y: 1,
    				cls: 'spinner-working-dk',
    				html: '<i class="fas fa-2x fa-spinner fa-spin-fast"></i>',
    			},{
    				xtype: 'component',
    				x: 4, y: 0.5,
    				cls: 'spinner-working',
    				html: '<i class="fas fa-2x fa-spinner fa-spin-fast"></i>',
    			}]
    		});
    		self.DSS_InspectorWorking.show();
    		self.DSS_InspectorWorking.animate({
    			from: {
    				opacity: 1
    			},
    			to: {
    				opacity: 0
    			},
    			duration: 10
    		});
    	}
    },
    
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		Ext.applyIf(me, {
			defaults: {
				xtype: 'component',
			},
			items: [{
				cls: 'section-title light-text text-drp-20',
				html: "GrazeScape",
				//html: 'Inspector <i class="fas fa-search font-10 accent-text text-drp-50"></i>',
				height: 35
			},
			// {
			// 	xtype: 'inspector_data_source',
			// 	itemId: 'dss-data-source',
			// 	DSS_Parent: me
			// },{
			// 	xtype: 'inspector_restrict_results',
			// 	itemId: 'dss-resrictor'
			// }
		]
		});
		
		me.callParent(arguments);
//		me.setMode('crop-yield');
		
		AppEvents.registerListener('set_inspector_bounds', function(extents, silent) {
			if (!silent) {
			    console.log("Drawing bounding box")
				//me.computeResults(extents,DSS.layer.ModelResult);
				//DISABLE ME TO TEST INSPECTOR MODE!!!!!
			     if(DSS_isDataLoaded == false){
				    alert("data not loaded!")
                }
                else{
				    me.computeResults(extents,DSS.layer.ModelResult);
                }
			}
		})
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
	},
	
	//-------------------------------------------------------------------------------------------------
	inspectorOptionsChanged: function(options, silent) {
		let me = this;

		me.DSS_options = options;
		if (!silent) {
			DSS_Refilter();//
//			me.computeResults(undefined, DSS.layer ? DSS.layer.ModelResult : undefined);
		}
	},
	
	//-------------------------------------------------------------------------------------------------
	setMode: function(mode) {
		let me = this;
		
		me.DSS_mode = mode;
	},
	
	//-------------------------------------------------------------------------------------------------
	startWorkerAnimation: function() {
		let me = this;
		me.DSS_isWorking = true;
		me.DSS_InspectorWorking.stopAnimation().animate({
			to: {
				opacity: 1
			},
			duration: 100
		});
	},
	
	//-------------------------------------------------------------------------------------------------
	stopWorkerAnimation: function() {
		let me = this;
		me.DSS_isWorking = false;
		me.DSS_InspectorWorking.stopAnimation().animate({
			to: {
				opacity: 0
			},
			duration: 400
		});
	},
	
	//-------------------------------------------------------------------------------------------------
	computeResults: function(extents, modelResultsLayer) {
		//console.log("new computeResults run: " + modelResultsLayer)
        console.log("Getting table object")
        console.log(extents)
		let me = this;
		// TODO: busy feedback
//		if (me.DSS_isWorking) {
//			DSS_RefilterDelayed(250);
//			return;
//		}

//		if (!extents) {
//			extents = me.DSS_extents;
//		}
//
		if (!extents) {
			console.log("Compute results called but no extent set");
			return;
		}
		if (!me.DSS_mode) me.DSS_mode = 'slope';//crop-yield';
		

		me['DSS_extents'] = extents[0];
		console.log("current extents before run: " + extents[0]);
		//do i need to round to get to a whole number?
		
		me.startWorkerAnimation();

		let options = me.down('#dss-data-source').getOptions();
		let restrictions = me.down('#dss-resrictor').getRestrictions();
//		external js library is used to simply getting the token

		let data = {
			"farm_id": DSS.activeFarm,
			"scenario_id": DSS.activeScenario,
			"model_parameters":extents

		};

		var csrftoken = Cookies.get('csrftoken');
            $.ajaxSetup({
                    headers: { "X-CSRFToken": csrftoken }
                });

            $.ajax({
            'url' : '/grazescape/get_model_results',
            'type' : 'POST',
            'data' : data,
			success: function(response, opts) {
			    console.log(response)
                obj = response;
                if(response.error){
                    console.log("model did not run")
                    me.stopWorkerAnimation();
                    return
                }
				console.log("response(obj): " + obj);
				let e = obj.extent;

                pt1 = [e[0],e[3]]
                pt2 = [e[2],e[3]]
                pt3 = [e[2],e[1]]
                pt4 = [e[0],e[1]]
                console.log("points")
				console.log(e[0], e[3])
				console.log(pt1)

				let p = new ol.geom.Polygon([
					[pt1, pt2, pt3, pt4, pt1]
				]);
				//console.log("this is P: "+p)
				me.validateImageOL(obj, modelResultsLayer);
				let s = DSS.layer.ModelBox.getSource();
				s.clear();
				s.addFeature(new ol.Feature({
					geometry: p
				}));
				if (obj.key) {
					console.log("hi from showClassifiedLegend")
					DSS.MapState.showClassifiedLegend(obj.key)
					
				}
				else {
					console.log("hi from showContinuousLegend")
					DSS.MapState.showContinuousLegend(obj.palette, obj.values);
				}
				if (obj.fields) {
			//		DSS.fieldList.addStats(me.DSS_mode, obj.fields)
				}


        var color = Chart.helpers.color;

        newData ={
                label: extents[5],
                backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
                borderColor: window.chartColors.red,
                borderWidth: 1,
                data: [response.avg]
            }
        window.barChartData.datasets.push(newData)
        console.log(window.barChart)
        console.log(window.barChartData)
        window.barChart.options.scales.yAxes[0].scaleLabel.labelString = response.units
        window.barChart.update();


			},
			
			failure: function(response, opts) {
				me.stopWorkerAnimation();
			}
		});
		
	},
	
	//---------------------------------------------------------------------------------
	validateImageOL: function(json, layer, tryCount) {
		var me = this;
		console.log(json.url)
		console.log("validateImageOL run");
		console.log(layer)
		tryCount = (typeof tryCount !== 'undefined') ? tryCount : 0;
		Ext.defer(function() {
			var src = new ol.source.ImageStatic({
				//url: "http://localhost:8000/grazescape/get_image?file_name=" + json.url,
				url: "http://geoserver-dev1.glbrc.org:8080//geoserver/ows?service=WCS&version=2.0.1&" +
				"request=GetCoverage&CoverageId=" + json.url,
				crossOrigin: '',
				imageExtent: json.extent,
				projection: 'EPSG:3857',
				imageSmoothing: false
			});
			
			src.on('imageloadend', function() {
				layer.setSource(src);
				layer.setVisible(true);	
				me.stopWorkerAnimation();
			});
			src.on('imageloaderror', function() {
				tryCount++;
				if (tryCount < 5) {
					me.validateImageOL(json, layer, tryCount);
				}
				else {
					//failed
					me.stopWorkerAnimation();
				}
			});
			src.image_.load();
		}, 50 + tryCount * 50, me);  
	},
		
	//---------------------------------------------------------------------------------
	extractData: function(data, crop, toDat) {
		
		let d = data['model-results'];
		if (!d) return;
		d = d.crops;
		d = d[crop].totals.histogram;
		
		let v = "";
		let dv = d.values, ah = d['area-ha'];
		for (let i = 0; i < dv.length; i++) {
			
			v += "{'datax_" + toDat + "':" + dv[i] + ", 'datay_"+ toDat + "':" + ah[i] + "},";
		}
		console.log(v);
	}

});

