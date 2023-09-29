//-----------------------------------------------------
// DSS.utils
//
//-----------------------------------------------------
Ext.define('DSS.utils', {
    extend: 'Ext.Base',
    
	statics: {
		constants: {
			DEFAULT_LANE_WIDTH_FT: 12,
		},
		
		layout: function(type, pack, align) {
			return {
				type: type,
				pack: pack || undefined,
				align: align || undefined
			}
		},
		
		// Quicktip singleton config overrides do not cover a few options I want globally...
		tooltip: function(text) {
			return {
				text: text,
	            trackMouse: false,
	            defaultAlign: 'b50-t50',
	            anchor: true,
	            showDelay: 250,
			}
		},
		
		addStyle: function(entry) {
			let style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = entry;
			document.getElementsByTagName('head')[0].appendChild(style);
		},		

		calculateInfrastructureCost(infraType, length, costPerFoot, laneWidth) {
			console.log("Calculating infrastructure cost:")
			console.log(infraType, length, costPerFoot, laneWidth)
			switch(infraType) {
				case 'll': // Lane
					return (length * costPerFoot * laneWidth).toFixed(2);
				case 'fl': // Fence
				case 'wl': // Water
					return (length * costPerFoot).toFixed(2);
				default:
					console.error("Unknown infrastructure type: ", infraType);
					return 0;
			}
		},

		assignFarmsToRegions() {
			try {
				const farms = DSS.layer.farms_1.getSource().getFeatures();

				for (var farm of farms) {
					// Continue if farm already assigned to region.
					if (farm.get("region") != undefined) continue;

					const farmCoord = farm.getGeometry().getCoordinates();
					const farmRegion = DSS.allRegionLayers.find(rL => rL.getSource().getFeaturesAtCoordinate(farmCoord).length > 0);
					if (farmRegion) {
						const region = farmRegion.getSource().getFeatures()[0];
						const regionName = region.get("Name") || region.get("NAME");
						farm.set("region", regionName);
						console.log("Set region " + regionName + " for farm " + farm.get("farm_name"))
					}
				}
			} catch (e) {
				console.error(e);
			}
		},

		updateFarmPickerItems() {
			const farmFeatures = DSS.layer.farms_1.getSource().getFeatures();
			// Reset the farms menu in the sidebar if it's visible
            if (Ext.getCmp("farmsMenu")) {
                Ext.getCmp("farmsMenu").removeAll()
                for (i in farmFeatures) {
					if(!selectedRegion || selectedRegion.get("Name") == farmFeatures[i].get("region")){
						Ext.getCmp("farmsMenu").add({
							text: `${farmFeatures[i].get("farm_name")} <i>${farmFeatures[i].get("farm_owner")}</i>`,
							farm_id: farmFeatures[i].get("gid"),
							farm_name: farmFeatures[i].get("farm_name")
						})
					}
                }
            }
		},

		filterFarmsLayerByRegion(selectedRegion) {			
			const hiddenStyle = new ol.style.Style({
				image: new ol.style.Circle({
					radius: 1,
					fill: new ol.style.Fill({
						color: 'rgba(32,96,160,0.9)'
					}),
					stroke: new ol.style.Stroke({
						color: 'rgba(255,255,255,0.75)',
						width: 1
					}),
					opacity: 0
				})
			});

			const regionName = selectedRegion.get("Name") || selectedRegion.get("NAME");
			console.log("Selected region: " + regionName )
			const farmFeatures = DSS.layer.farms_1.getSource().getFeatures();
			for (i in farmFeatures) {
				if (farmFeatures[i].get("region") != undefined
				&& farmFeatures[i].get("region") != regionName) {	
					farmFeatures[i].set("isInRegion", false);
					farmFeatures[i].setStyle(hiddenStyle);
				} else {
					farmFeatures[i].set("isInRegion", true);
					farmFeatures[i].setStyle();
				}
			}
		},

		highlightSelectedFarm(farmId) {
			var farms_selected_style = function(_, resolution) {
				let r = 4.0 - resolution / 94.0;
				if (r < 0) r = 0
				else if (r > 1) r = 1
				// value from 3 to 16
				r = Math.round(Math.pow(r, 3) * 13 + 3)

				let sw = Math.floor(Math.sqrt(r));
				if (sw < 1) sw = 1;
				var newStyle = new ol.style.Style({
					image: new ol.style.Circle({
						radius: r * 1.2,
						fill: new ol.style.Fill({
							color: 'rgba(99, 159, 219,0.9)'
						}),
						stroke: new ol.style.Stroke({
							color: 'rgba(255,255,255,0.75)',
							width: sw
						}),
					})
				});

				return newStyle;
			}

			DSS.layer.farms_1.getSource().getFeatures().forEach(field => {
				if(!field.get("isInRegion")) return;

				if(field.get("gid")== farmId){
					field.setStyle(farms_selected_style);
				} else {
					field.setStyle();
				}
			})
		}
	},
		
});

//--------------------------------------------------------------------------
Ext.define('AppEvents', {
	extend: 'Ext.Base',
    singleton: true,	
    
	_events: {},
	
	//--------------------------------------------------------------------------
	constructor: function () {
	},

	// WARNING: listeners on temporary objects must clean themselves up!
	// returns 'handle' to added listener for removal later
	//--------------------------------------------------------------------------
	registerListener: function(eventName, eventProcessor, scope) {
		
		var event = {
			processor: eventProcessor,
			scope: scope
		};
		
		var res = this._events[eventName];
		var id = Ext.id();
		if (res) {
			// already have an event array set up for a given event name so append to that array
			res[id] = event;
		}
		else {
			// first event name so add the event name to the master list and 
			//	tie an array of event processors to it (with our first event handler in it)
			var ar = new Object();
			ar[id] = event;
			this._events[eventName] = ar;
		}
		
		return {
			eventName: eventName,
			id: id
		}
	},

	// Takes the handle returned when the listener was registered.
	//	NO SAFETY CHECKING...
	//--------------------------------------------------------------------------
	removeListener: function(registeredHandle) {
		
		var res = this._events[registeredHandle.eventName];
		if (res) {
			delete res[registeredHandle.id];
		}
	},

	// jsonData is optional and could be encoded as an object. The reciever of the
	//	event is responsible for decoding and processing the data
	//--------------------------------------------------------------------------
	triggerEvent: function(eventName, jsonData) {

		var res = this._events[eventName];
		if (res) {
			for (var key in res) {
				var evt = res[key];
				if (evt && evt.processor) {
					evt.processor.call(evt.scope, jsonData);
				}
			}
		}
	}
	
});