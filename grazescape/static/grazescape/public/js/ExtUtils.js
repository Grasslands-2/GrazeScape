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
					if(!selectedRegion || selectedRegion.get("Name") == farmFeatures[i].get("region") || selectedRegion.get("NAME") == farmFeatures[i].get("region")){
						Ext.getCmp("farmsMenu").add({
							text: `${farmFeatures[i].get("farm_name")} <i>${farmFeatures[i].get("farm_owner")}</i>`,
							farm_id: farmFeatures[i].get("gid"),
							farm_name: farmFeatures[i].get("farm_name")
						})
					}
                }
            }
		},

		async selectRegion(region_name) {
			let extent, view;
			console.log("Selected Region: " + region_name);

			if (region_name == 'CB_WI') {
				selectedRegion = DSS.layer.cloverBeltBorder.getSource().getFeatures()[0];
				DSS.activeRegion = "cloverBeltWI";
				DSS.layer.cloverBeltBorder.setVisible(true)
				DSS.layer.swwiBorder.setVisible(false)
				DSS.layer.northeastBorder.setVisible(false)
				DSS.layer.uplandBorder.setVisible(false)
				DSS.layer.redCedarBorder.setVisible(false)
				DSS.layer.pineRiverBorder.setVisible(false)

				view = new ol.View({
					center: [-10030031, 5610033],
					zoom: 8,
					maxZoom: 30,
					minZoom: 8,
					constrainOnlyCenter: false,
					extent: [-10221386, 5467295, -9843661, 5750901]
				})
				extent = [-10221386, 5467295, -9843661, 5750901]
			} else if (region_name == 'redCedarWI') {
				selectedRegion = DSS.layer.redCedarBorder.getSource().getFeatures()[0];
				DSS.activeRegion = "redCedarWI";

				DSS.layer.redCedarBorder.setVisible(true)
				DSS.layer.swwiBorder.setVisible(false)
				DSS.layer.northeastBorder.setVisible(false)
				DSS.layer.uplandBorder.setVisible(false)
				DSS.layer.cloverBeltBorder.setVisible(false)
				DSS.layer.pineRiverBorder.setVisible(false)

				extent = [-10364871.915906506, 5523673.41766168, -10069499.539759004, 5831321.534259069]
				view = new ol.View({
					center: [-10217185.73, 5677497.476],
					zoom: 8,
					maxZoom: 30,
					minZoom: 8,
					constrainOnlyCenter: false,
					extent: extent
				})
			} else if (region_name == 'pineRiverMN') {
				selectedRegion = DSS.layer.pineRiverBorder.getSource().getFeatures()[0];
				DSS.activeRegion = "pineRiverMN";

				DSS.layer.pineRiverBorder.setVisible(true)
				DSS.layer.redCedarBorder.setVisible(false)
				DSS.layer.swwiBorder.setVisible(false)
				DSS.layer.northeastBorder.setVisible(false)
				DSS.layer.uplandBorder.setVisible(false)
				DSS.layer.cloverBeltBorder.setVisible(false)

				extent = [-10595719.33, 5805080.059, -10358718.96, 6020899.352]
				view = new ol.View({
					center: [-10458132.990856137, 5891167.715123995],
					zoom: 8,
					maxZoom: 30,
					minZoom: 8,
					constrainOnlyCenter: false,
					extent: extent
				})
			} else if (region_name == 'SW_WI') {
				selectedRegion = DSS.layer.swwiBorder.getSource().getFeatures()[0];
				DSS.activeRegion = "southWestWI";

				DSS.layer.cloverBeltBorder.setVisible(false)
				DSS.layer.swwiBorder.setVisible(true)
				DSS.layer.northeastBorder.setVisible(false)
				DSS.layer.uplandBorder.setVisible(false)
				DSS.layer.redCedarBorder.setVisible(false)
				DSS.layer.pineRiverBorder.setVisible(false)

				view = new ol.View({
					center: [-10106698, 5391875],
					zoom: 6,
					maxZoom: 30,
					minZoom: 6,
					constrainOnlyCenter: false,
					extent: [-10258162, 5258487, -9967076, 5520900]
				})
				extent = [-10258162, 5258487, -9967076, 5520900]
			} else if (region_name == 'NE_WI') {
				selectedRegion = DSS.layer.northeastBorder.getSource().getFeatures()[0];
				DSS.activeRegion = "northeastWI";

				DSS.layer.cloverBeltBorder.setVisible(false)
				DSS.layer.swwiBorder.setVisible(false)
				DSS.layer.northeastBorder.setVisible(true)
				DSS.layer.uplandBorder.setVisible(false)
				DSS.layer.redCedarBorder.setVisible(false)
				DSS.layer.pineRiverBorder.setVisible(false)

				view = new ol.View({
					center: [-9786795, 5508847],
					zoom: 6,
					maxZoom: 30,
					minZoom: 6,
					constrainOnlyCenter: false,
					extent: [-9861119, 5428671, -9706548, 5591254]
				})
				extent = [-9841119, 5448671, -9726548, 5571254]
			} else if (region_name == 'UL_WI') {
				selectedRegion = DSS.layer.uplandBorder.getSource().getFeatures()[0];
				DSS.activeRegion = "uplandsWI";

				DSS.layer.cloverBeltBorder.setVisible(false)
				DSS.layer.swwiBorder.setVisible(false)
				DSS.layer.northeastBorder.setVisible(false)
				DSS.layer.uplandBorder.setVisible(true)
				DSS.layer.redCedarBorder.setVisible(false)
				DSS.layer.pineRiverBorder.setVisible(false)

				view = new ol.View({
					center: [-10039400, 5305041],
					zoom: 6,
					maxZoom: 30,
					minZoom: 6,
					constrainOnlyCenter: false,
					extent: [-10247529, 5226215, -9938170, 5420242]
				})
				extent = [-10247529, 5226215, -9938170, 5420242]
			} else {
				throw new Error(`Error! Unknown region: ${region_name}`);
			}

			DSS.ApplicationFlow.instance.showFarmPickerPage();
			DSS.map.un('pointermove', regionHighlighter);
			DSS.map.removeInteraction(DSS.selectRP);
			DSS.layer.farms_1.setVisible(true);
			DSS.layer.regionLabels.setVisible(false);
			await DSS.MapState.zoomToRealExtentRP(extent, view);
			DSS.utils.filterFarmsLayerByRegion(selectedRegion);
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