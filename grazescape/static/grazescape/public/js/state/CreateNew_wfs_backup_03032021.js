
DSS.utils.addStyle('.underlined-input { border: none; border-bottom: 1px solid #ddd; display:table; width: 100%; height:100%; padding: 0 0 2px}')   
DSS.utils.addStyle('.underlined-input:hover { border-bottom: 1px solid #7ad;}')
DSS.utils.addStyle('.right-pad { padding-right: 32px }')   

//attribute data is getting in from set properties with e.features in th function declaration at the bottom on this script
//Work on getting the values from the form into those properties, and setting up the insert to happen when the 
//create button is pushed.  Keep in mind you will have to hold onto the geom from the draw function, before the insert

var farms_1Source = new ol.source.Vector({
    url: 'http://localhost:8081/geoserver/wfs?'+
        'service=wfs&'+
        '?version=2.0.0&'+
        'request=GetFeature&'+
        'typeName=Farms:farm_1&' +
        'outputformat=json&'+
        'srsname=EPSG:3857',
    format: new ol.format.GeoJSON()
});
fname = "Kats Cat Farm"
fowner = "Kat"
faddress = "456 Vixen Lane"
function wfs_farm_insert(feat,geomType) {  
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/Farms', // Your namespace
        featureType: 'farm_1',
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
var type = "Point";
var source = farms_1Source;

//------------------------------------------------------------------------------
Ext.define('DSS.state.CreateNew_wfs', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.operation_create',

	layout: DSS.utils.layout('vbox', 'center', 'stretch'),
	cls: 'section',

	DSS_singleText: '"Start by creating a new operation"',
					
	//--------------------------------------------------------------------------
	initComponent: function(map) {
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
				html: '<b style="color:#27b">Select <i class="fas fa-map-marker-alt"></i></b> a location for this operation on the map'
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
					allowBlank: false,
					margin: '10 0',
					padding: 4,
				},{
					fieldLabel: 'Address',
					name: 'address',
					margin: '12 0',
					padding: 4,
				},{
					itemId: 'location_x',
					fieldLabel: 'Location x',
					name: 'location_x',
					allowBlank: true,
					hidden: true,
				},{
					itemId: 'location_y',
					fieldLabel: 'Location y',
					name: 'location_y',
					allowBlank: true,
					hidden: true,
				},{
					itemId: 'geom',
					fieldLabel: 'Geometry',
					name: 'geom',
					allowBlank: true,
					hidden: true,
            	},{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Create',
					formBind: true,
					handler: function() { 
						var form = this.up('form').getForm();
						if (form.isValid()) {
							//form.submit({
								//success: function(form) {
							me.createFarm(this.up('form').getForm().findField('operation').getSubmitValue(),
							this.up('form').getForm().findField('owner').getSubmitValue(),
							this.up('form').getForm().findField('address').getSubmitValue());
								//}
								/*success: function(form, action) {
									var obj = JSON.parse(action.response.responseText);
									console.log(obj);
									console.log("inside new op if")
									//console.log(obj)
									
									DSS.activeFarm = obj.farm.id;
									DSS.activeScenario = obj.farm.scenario;
									
									DSS.ApplicationFlow.instance.showManageOperationPage();
									AppEvents.triggerEvent('activate_operation')
									// TODO: centralize
									DSS.layer.markers.setOpacity(0.5);
								},*/
								//failure: function(form, action) {
								//	console.log(form, action);
								//}
							//});
						}
						
			        }
					
				}],
			}]
		});
		
		me.callParent(arguments);
		//me.bindMapClick();
	},
    

	//------------------------------------------------------------------
	bindMapClick: function() {
		let me = this;
		DSS.mapClickFunction = function(evt, coords) {
            me.down('#location_x').setValue(coords[0]); 
			me.down('#location_y').setValue(coords[1]);
			DSS.MapState.setPinMarker(coords, 1);
            //console.log(coords);
    };
        
    },
    createFarm: function(fname,fowner,faddress){
		DSS.draw = new ol.interaction.Draw({
			source: source,
			type: 'Point',
			geometryName: 'geom'
		});
		DSS.map.addInteraction(DSS.draw);
		console.log("draw is on")
		DSS.draw.on('drawend', function (e) {
			e.feature.setProperties({
				id: 5,
				farm_name: fname,
				farm_owner: fowner,
				farm_addre: faddress
			})
			var geomType = 'point'
			wfs_farm_insert(e.feature, geomType)
			console.log("HI! WFS farm Insert ran!")
		})
                
            
    }

});