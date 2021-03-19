//This is from the AppViewport.js file
DSS_dataLoadAjax = $.ajax({
            'url' : '/grazescape/load_data',
            'type' : 'GET',
			success: function(response, opts) {
			console.log("Done")
			DSS_isDataLoaded = true;
			},

			failure: function(response, opts) {
//				me.stopWorkerAnimation();
                console.log("fail")
			}
			})
//Everything below here is in the Main.js page for the inspector folder

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

computeResults: function(extents, modelResultsLayer) {
		let me = this;
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
		me.startWorkerAnimation();
//		need to get grass_type from the user

		grass_type = "Orchardgrass-clover"

		let options = me.down('#dss-data-source').getOptions();
		let restrictions = me.down('#dss-resrictor').getRestrictions();
//		external js library is used to simply getting the token
		var csrftoken = Cookies.get('csrftoken');
        console.log(extents)
		let data = {
			"farm_id": DSS.activeFarm,
			"scenario_id": DSS.activeScenario,
			"extents": extents,
			"model": me.DSS_mode,
			"options": options,
			"restrictions": restrictions,
//			this is where the type of grass would go
			"grass_type":grass_type
		};
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
				let pt1 = ol.proj.transform([e[0],e[3]], 'EPSG:3071', 'EPSG:3857'),
				pt2 = ol.proj.transform([e[2],e[3]], 'EPSG:3071', 'EPSG:3857');
				pt3 = ol.proj.transform([e[2],e[1]], 'EPSG:3071', 'EPSG:3857');
				pt4 = ol.proj.transform([e[0],e[1]], 'EPSG:3071', 'EPSG:3857');
				let p = new ol.geom.Polygon([
					[pt1, pt2, pt3, pt4, pt1]
				]);
//				function to draw image
				me.validateImageOL(obj, modelResultsLayer);
				let s = DSS.layer.ModelBox.getSource();
				s.clear();
				s.addFeature(new ol.Feature({
					geometry: p
				}));
				if (obj.key) {
					DSS.MapState.showClassifiedLegend(obj.key)
				}
				else {
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