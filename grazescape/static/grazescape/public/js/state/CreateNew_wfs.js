
DSS.utils.addStyle('.underlined-input { border: none; border-bottom: 1px solid #ddd; display:table; width: 100%; height:100%; padding: 0 0 2px}')   
DSS.utils.addStyle('.underlined-input:hover { border-bottom: 1px solid #7ad;}')
DSS.utils.addStyle('.right-pad { padding-right: 32px }')   

//--------------Geoserver WFS source connection-------------------
var scenarioObj = {};

//empty array to catch feature objects
var farmArrayCNO = [];
var scenarioArrayCNO = [];
const ADDRESS_LOOKUP_ZOOM_LEVEL = 15;

//define function to populate data array with farm table data
function popfarmArrayCNO(obj) {
	for (i in obj) {
		farmArrayCNO.push({
			id: obj[i].properties.id,
			gid: obj[i].properties.gid,
			name: obj[i].properties.farm_name
		})
	};
	for (i in farmArrayCNO){
		if (farmArrayCNO[i].id > highestFarmIdCNO){
			highestFarmIdCNO = farmArrayCNO[i].id
		};
	};
}
function popScenarioArrayCNO(obj) {
	for (i in obj){ 
		scenarioArrayCNO.push({
			id: obj[i].id,
			gid: obj[i].properties.gid,
			name: obj[i].properties.farm_name,
			scenarioId:obj[i].properties.scenario_id
		})
	};
	for (i in scenarioArrayCNO){
		if (scenarioArrayCNO[i].scenarioId > highestScenarioIdCNO){
			highestScenarioIdCNO = scenarioArrayCNO[i].scenarioId
		};
	};
}
//var to hold onto largest gid value of current farms before another is added
highestFarmIdCNO = 0;
highestScenarioIdCNO = 0;

async function cnf_farm_insert(feat, fType) {
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/GrazeScape_Vector',
        featureType: fType,
        srsName: 'EPSG:3857'
    });
    node = formatWFS.writeTransaction([feat], null, null, formatGML);
    s = new XMLSerializer();
    str = s.serializeToString(node);
    const intFgid = await geoServer.insertFarm(str);
	return intFgid;
}

async function geocodeLookup(address) {
	try{
		const encodedAddress = encodeURI(address);
		const result = await $.ajax(`http://localhost:8000/geocode/?address=${encodedAddress}`);

		if (result.error_message) {
			console.error("Error geocoding address: \n", result.error_message);
			return {
				error: "Address search is down."
			};
		} else if (result.results && result.results.length == 0) {
			console.log("Geocode result was empty");
			return {};
		} else {
			return {
				coordinate: ol.proj.fromLonLat([
					result.results[0].geometry.location.lng,
					result.results[0].geometry.location.lat,
				])
			};
		}
	} catch(e) {
		return { error: "Unhandled error!" };
	}
}

// Create a new layer for a new farm to be displayed in while the user is asked to confirm the location.
function showFarmInStagingLayer(coordinate, form){
	const point = new ol.geom.Point(coordinate);
	const feature = new ol.Feature({geom: point});
	feature.setGeometryName("geom");
	feature.setProperties({
		farm_name: form.findField('operation').getSubmitValue(),
		farm_owner: form.findField('owner').getSubmitValue(),
		farm_addre: form.findField('address').getSubmitValue(),
	})
	DSS.layer.newFarmStaging = new ol.layer.Vector({
		name: "newFarmStaging",
		style: DSS.farms_1_style,
		source: new ol.source.Vector({features: [feature]})
	});
	DSS.map.addLayer(DSS.layer.newFarmStaging);
	DSS.MapState.zoomToExtent(coordinate, ADDRESS_LOOKUP_ZOOM_LEVEL);
}

async function createFarm(feature) {
	var intFgid = await cnf_farm_insert(feature, 'farm_2')
	console.log(feature);
	DSS.activeFarm = intFgid
	DSS.farmName = feature.values_.farm_name;
	DSS.scenarioName = ''
	DSS.dialogs.ScenarioPicker = Ext.create('DSS.state.FirstScenario'); 
	DSS.dialogs.ScenarioPicker.setViewModel(DSS.viewModel.scenario);		
	DSS.dialogs.ScenarioPicker.show().center().setY(100);
	DSS.MapState.showNewFarm();
}

function enablePlaceFarmMapInteraction(fname,fowner,faddress){
	DSS.MapState.removeMapInteractions()
	DSS.mapClickFunction = undefined;
	DSS.mouseMoveFunction = undefined;
	DSS.draw = new ol.interaction.Draw({
		type: 'Point',
		geometryName: 'geom'
	});
	DSS.map.addInteraction(DSS.draw);
	DSS.draw.on('drawend', async function (e) {
		const coordinate = e.feature.getGeometry().getCoordinates();
		const regionContainsPoint = selectedRegion.getGeometry().intersectsCoordinate(coordinate);
		if(regionContainsPoint){
			e.feature.setProperties({
				farm_name: fname,
				farm_owner: fowner,
				farm_addre: faddress,
			})
			Ext.ComponentQuery.query("#search_results")[0].removeAll();
			await createFarm(e.feature);
		} else if(!Ext.ComponentQuery.query("#search_results_inside_region_message").length > 0){
			Ext.ComponentQuery.query("#search_results")[0].add({ 
				xtype: 'component',
				id: "search_results_inside_region_message",
				cls: 'information',
				style: {
					color: "#FF0000",
				},
				html: 'Farm location must be inside the region!'
			});
		}
	})     
}

const placeFarmManuallyButton = () => ({
	xtype: 'button',
	cls: 'button-text-pad',
	componentCls: 'button-margin',
	text: 'Place Farm Manually',
	handler: function(self) { 
		var form = self.up('form').getForm();
		enablePlaceFarmMapInteraction(
			form.findField('operation').getSubmitValue(),
			form.findField('owner').getSubmitValue(),
			form.findField('address').getSubmitValue());
		resetFarmSearchState(self);
	}
});

function resetFarmSearchState(self) {
	DSS.map.removeLayer(DSS.layer.newFarmStaging);
	const searchResults = self.up("operation_create").down("#search_results");
	searchResults.removeAll();
}

var type = "Point";

//---------------------------Create New Farm Container, and component declaration---------------
Ext.define('DSS.state.CreateNew_wfs', {
	extend: 'Ext.Container',
	alias: 'widget.operation_create',

	layout: DSS.utils.layout('vbox', 'center', 'stretch'),
	cls: 'section',

	DSS_singleText: '"Start by creating a new operation"',
					
	initComponent: function() {
		let me = this;

		Ext.applyIf(me, {
			defaults: {
				margin: '2rem',
			},
			items: [{
				xtype: 'container',
				layout: DSS.utils.layout('hbox', 'start', 'begin'),
				items: [{
					xtype: 'component',
					cls: 'back-button',
					tooltip: 'Back',
					html: '<i class="fas fa-reply"></i>',
					listeners: {
						render: function(c) {
							c.getEl().getFirstChild().el.on({
								click: function(self) {
									DSS.ApplicationFlow.instance.showLandingPage();
								}
							});
						}
					}					
				},{
					xtype: 'component',
					flex: 1,
                    itemId: 'create_farm',
					cls: 'section-title accent-text right-pad',
					html: 'Create New',
				}]
			},
            { 
				xtype: 'component',
				cls: 'information',
				html: 'First, fill in farm info in the form below.'
			},{
				xtype: 'form',
				url: 'create_operation',
				jsonSubmit: true,
				header: false,
				border: false,
				layout: DSS.utils.layout('vbox', 'center', 'stretch'),
				margin: '8 0',
				defaults: {
					xtype: 'textfield',
					labelAlign: 'right',
					labelWidth: 70,
					triggerWrapCls: 'underlined-input',
				},
				items: [{
					fieldLabel: 'Operation',
					name: 'operation',
					allowBlank: false,
					value: me.DSS_operation,
					margin: '10 0',
					padding: 4,
				},{
					fieldLabel: 'Owner',
					name: 'owner',
					allowBlank: true,
					margin: '10 0',
					padding: 4,
				},{
					fieldLabel: 'Address',
					name: 'address',
                    allowBlank: true,
					margin: '12 0',
					padding: 4,
            	},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Search',
					formBind: true,
					handler: async function(self) { 
						var form = this.up('form').getForm();
						if (form.isValid()) {
							resetFarmSearchState(self);

							const address = form.findField('address').getSubmitValue();
							const result = await geocodeLookup(address);
							const coordinate = result.coordinate;

							if(!coordinate) {
								const searchResults = self.up("operation_create").down("#search_results");
								const errorText = result.error 
									? result.error + " Please place your farm by clicking 'Place Farm Manually', then clicking on the map."
									: 'Error! Unable to find location. Try again with a different address, or place farm by clicking on the map.';
								searchResults.add({ 
									xtype: 'component',
									cls: 'information',
									style: {
										color: "#FF0000",
									},
									html: errorText
								});
								searchResults.add(placeFarmManuallyButton());
								return;
							}

							const regionContainsPoint = selectedRegion.getGeometry().intersectsCoordinate(coordinate);
							if(regionContainsPoint){
								showFarmInStagingLayer(coordinate, form);

								const searchResults = self.up("operation_create").down("#search_results");
								searchResults.add({ 
									xtype: 'component',
									cls: 'information',
									html: 'Location found. If this looks right, click Confirm. Otherwise, try another search or place farm by clicking on the map.'
								})
								searchResults.add({
									xtype: 'button',
									cls: 'button-text-pad',
									componentCls: 'button-margin',
									text: 'Confirm',
									handler: async function(self) { 
										const feature = DSS.layer.newFarmStaging.getSource().getFeatures()[0];
										if(!feature) {
											alert("Error placing farm! Feature not found.");
											return;
										}
										console.log(feature);
										await createFarm(feature);
										resetFarmSearchState(self);
									}
								});
								searchResults.add(placeFarmManuallyButton());
							} else {
								const searchResults = self.up("operation_create").down("#search_results");
								searchResults.add({ 
									xtype: 'component',
									cls: 'information',
									style: {
										color: "#FF0000",
									},
									html: 'Location was not inside the region. Try again with a different address, or place farm by clicking on the map.'
								});
								searchResults.add(placeFarmManuallyButton())
							}
						}
			        }
				},
				{
					xtype: 'container',
					layout: DSS.utils.layout('vbox', 'center', 'stretch'),
					id: 'search_results',
					items: []
				}],
			}]
		});	
		me.callParent(arguments);
	},
});