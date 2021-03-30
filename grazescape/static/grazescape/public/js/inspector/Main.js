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
    	'DSS.inspector.RestrictResults'    	
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
				html: 'Inspector <i class="fas fa-search font-10 accent-text text-drp-50"></i>',
				height: 35				
			},{
				xtype: 'inspector_data_source',
				itemId: 'dss-data-source',
				DSS_Parent: me
			},{
				xtype: 'inspector_restrict_results',
				itemId: 'dss-resrictor'
			}]
		});
		
		me.callParent(arguments);
//		me.setMode('crop-yield');
		
		AppEvents.registerListener('set_inspector_bounds', function(extents, silent) {
			if (!silent) {
			    console.log("Drawing bounding box")
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
		console.log("new computeResults run: " + extents)

		let me = this;
		// TODO: busy feedback
		if (me.DSS_isWorking) {
			DSS_RefilterDelayed(250);
			return;
		}
		
		if (!extents) {
			extents = me.DSS_extents;
		}
		
		if (!extents) {
			console.log("Compute results called but no extent set");
			return;
		}
		if (!me.DSS_mode) me.DSS_mode = 'slope';//crop-yield';
		
		me['DSS_extents'] = extents;
		console.log("current extents before run: " + extents);
		//do i need to round to get to a whole number?
		
		console.log(extents)
		me.startWorkerAnimation();
		
		let options = me.down('#dss-data-source').getOptions();
		let restrictions = me.down('#dss-resrictor').getRestrictions();
//		external js library is used to simply getting the token
		var csrftoken = Cookies.get('csrftoken');
		let data = {
			"farm_id": DSS.activeFarm,
			"scenario_id": DSS.activeScenario,
			"extents": extents,
			"model": me.DSS_mode,
			"options": options,
			"restrictions": restrictions,
			"grass_type":"bluegrass"//start here in morning get feilds data.
		};
		console.log(data)

            $.ajaxSetup({
                    headers: { "X-CSRFToken": csrftoken }
                });

            $.ajax({
            'url' : '/grazescape/get_model_results',
            'type' : 'POST',
            'data' : data,

			success: function(response, opts) {
                obj = response;
				let e = obj.extent;
				//console.log("this is e: " + e)
				let pt1 = ol.proj.transform([e[0],e[3]], 'EPSG:3071', 'EPSG:3857'),
				pt2 = ol.proj.transform([e[2],e[3]], 'EPSG:3071', 'EPSG:3857');
				pt3 = ol.proj.transform([e[2],e[1]], 'EPSG:3071', 'EPSG:3857');
				pt4 = ol.proj.transform([e[0],e[1]], 'EPSG:3071', 'EPSG:3857');
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
				
				
			},
			
			failure: function(response, opts) {
				me.stopWorkerAnimation();
			}
		});
		
	},
	
	//---------------------------------------------------------------------------------
	validateImageOL: function(json, layer, tryCount) {
		var me = this;
		console.log("validateImageOL run");
		tryCount = (typeof tryCount !== 'undefined') ? tryCount : 0;
		Ext.defer(function() {
		    console.log("New image")
			var src = new ol.source.ImageStatic({
				url: "http://localhost:8000/grazescape/get_image?file_name=" + json.url,
				crossOrigin: '',
				imageExtent: json.extent,
				projection: 'EPSG:3071',
				imageSmoothing: false
			});
			
			src.on('imageloadend', function() {
			    console.log("set source of image")
			    console.log(src)
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

