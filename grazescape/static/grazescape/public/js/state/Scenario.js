var fields_1Source = new ol.source.Vector({
	url:'http://localhost:8081/geoserver/wfs?'+
		'service=wfs&'+
		'?version=2.0.0&'+
		'request=GetFeature&'+
		'typeName=Farms:field_1&' +
		'outputformat=application/json&'+
		'srsname=EPSG:3857',
	format: new ol.format.GeoJSON()
});

function wfs_field_update(feat,geomType) {  
	console.log('in field update func')
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/Farms',
		Geom: 'geom',
        featureType: 'field_1',
        srsName: 'EPSG:3857'
    });
    console.log(feat)
    node = formatWFS.writeTransaction(null, [feat], null, formatGML);
	console.log(node);
    s = new XMLSerializer();
    str = s.serializeToString(node);
	str=str.replace("feature:field_1","Farms:field_1");
	str=str.replace("<Name>geometry</Name>","<Name>geom</Name>");
    console.log(str);
    $.ajax('http://localhost:8081/geoserver/wfs',{
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

//------------------------------------------------------------------------------
Ext.define('DSS.state.Scenario', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
    alternateClassName: 'DSS.StateScenario',
	alias: 'widget.state_scenario',

	requires: [
		'DSS.state.scenario.CropNutrientMode',
		'DSS.state.scenario.AnimalDialog'
	],
	
	layout: DSS.utils.layout('vbox', 'center', 'stretch'),
	cls: 'section',

	statics: {
		get: function() {
			let def = {
					xtype: 'state_scenario'
			};
			
			return def;
		}
	},
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;
		
		Ext.applyIf(me, {
			defaults: {
				margin: '1rem',
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
									DSS.ApplicationFlow.instance.showManageOperationPage();
								}
							});
						}
					}					
				},{
					xtype: 'component',
					flex: 1,
					cls: 'section-title accent-text right-pad',
					// TODO: Dynamic name...
					html: '"Baseline"'
				}]
			},{ 
				xtype: 'container',
				layout: DSS.utils.layout('vbox', 'center', 'stretch'),
				items: [{//------------------------------------------
					xtype: 'component',
					cls: 'information med-text',
					html: 'Configure animals and grazing'
				},{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Animals',
					handler: function(self) {
						if (!DSS.dialogs) DSS.dialogs = {};
						if (!DSS.dialogs.AnimalDialog) {
							DSS.dialogs.AnimalDialog = Ext.create('DSS.state.scenario.AnimalDialog'); 
							DSS.dialogs.AnimalDialog.setViewModel(DSS.viewModel.scenario);		

						}
						DSS.dialogs.AnimalDialog.show().center().setY(0);
					}
				},{//------------------------------------------
					xtype: 'component',
					cls: 'information med-text',
					html: 'Assign crops and nutrients'
				},{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					toggleGroup: 'create-scenario',
					allowDepress: true,
					text: 'Field Properties',
					toggleHandler: function(self, pressed) {
						if (pressed) {
							AppEvents.triggerEvent('show_field_grid')
						}
						else {
							AppEvents.triggerEvent('hide_field_grid')
						}
//						DSS.ApplicationFlow.instance.showNewOperationPage();
					}
				},{//------------------------------------------
					xtype: 'component',
					cls: 'information med-text',
					html: 'Update Field Data'
				},{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					toggleGroup: 'create-scenario',
					allowDepress: false,
					text: 'Update Attributes',
					handler: function() { 
						console.log(selectedField);
						console.log(fieldArray);
						for (i in fieldArray){
							console.log(fieldArray[i].name);
							if(fieldArray[i].name === selectedField.id_){
								console.log(fieldArray[i].name);
								//console.log(selectedField);
								//console.log("here is the selected fields soil p: "+selectedField.values_.soil_p);
								//selectedField.soil_p = i.soilP;
								//selectedField.values_.soil_p = 65;
								selectedField.setProperties({
									soil_p: fieldArray[i].soilP,
									rotation: fieldArray[i].rotationVal,
									om: fieldArray[i].soilOM
								});
								console.log(selectedField);
								console.log('Update Attributes');
								wfs_field_update(selectedField);
							}
						}
						//console.log(DSS.activeFarm);
						//console.log(fieldArray[1].soilP);
						//for( f in fieldArray){
						//	console.log(fieldArray[f].name);
						//	wfs_field_update(f,'MultiPolygon')
					}
				},
						//wfs_field_update();
					//
				{//------------------------------------------
					xtype: 'component',
					height: 32
				},{//------------------------------------------
					xtype: 'component',
					cls: 'information med-text',
					html: 'Run simulations'
				},{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Compute',
					handler: function(self) {
					}
				}]
			}]
		});
		
		me.callParent(arguments);
		DSS.Inspector.addModeControl()
		DSS.MapState.disableFieldDraw();
		DSS.draw.setActive(false);
		DSS.modify.setActive(false);
		DSS.fieldStyleFunction = undefined;	DSS.layer.fields.changed();

		me.initViewModel();
	},
	
	//-----------------------------------------------------------------------------
	initViewModel: function() {
		if (DSS && DSS.viewModel && DSS.viewModel.scenario) return;
		
		if (!DSS['viewModel']) DSS['viewModel'] = {}
		DSS.viewModel.scenario = new Ext.app.ViewModel({
			formulas: {
				tillageValue: { 
					bind: '{tillage.value}',
					get: function(value) { return {tillage: value }; 			},
					set: function(value) { this.set('tillage.value', value); 	}
				}
			},
			data: {
				dairy: {
					// counts
					lactating: 10,
					dry: 20,
					heifers: 40,
					youngstock: 80,
					// milk yield
					'daily-yield': 50,
					// lactating cows / confinement in months / grazing
					'lactating-confined': 12,
					'lactating-graze-time': 24,
					'lactating-rotation-freq': 'R2',
					// non-lactating cows / confinement / grazing
					'non-lactating-confined': 12,
					'non-lactating-graze-time': 24,
					'non-lactating-rotation-freq': 'R2',
				},
				beef: {
					cows: 20,
					stockers: 40,
					finishers: 80,
					// average weight gain
					'daily-gain': 4,
					// confinement in months / grazing
					'confined': 12,
					'graze-time': 24,
					'rotation-freq': 'R2',
				}
			}
		})
	}

});

