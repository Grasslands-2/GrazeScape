
DSS.utils.addStyle('.underlined-input { border: none; border-bottom: 1px solid #ddd; display:table; width: 100%; height:100%; padding: 0 0 2px}')   
DSS.utils.addStyle('.underlined-input:hover { border-bottom: 1px solid #7ad;}')
DSS.utils.addStyle('.right-pad { padding-right: 32px }')   

//--------------Geoserver WFS source connection-------------------
//wfs farm layer url for general use
var farmUrl = 
'http://localhost:8081/geoserver/wfs?'+
'service=wfs&'+
'?version=2.0.0&'+
'request=GetFeature&'+
'typeName=Farms:farm_1&' +
'outputformat=json&'+
'srsname=EPSG:3857'
//declaring farm source var
var farms_1Source = new ol.source.Vector({
    url: farmUrl,
    format: new ol.format.GeoJSON()
});
//bring in farm layer table as object for iteration
function getWFS() {
	return $.ajax({
		jsonp: false,
		type: 'GET',
		url: farmUrl,
		async: false,
		dataType: 'json',
		success:function(response)
		{
			farmObj = response.features
			console.log(farmObj[0])
		}
	})
}
//empty array to catch feature objects 
farmArray = [],
// call getWFS to get farm table object
getWFS()
//define function to populate data array with farm table data
function popArray(obj) {
	for (i in obj) 
	farmArray.push({
		id: obj[i].id,
		gid: obj[i].properties.gid,
		name: obj[i].properties.farm_name
	});
}
//populate data array with farm object data from each farm
popArray(farmObj);
//var to hold onto largest gid value of current farms before another is added
highestFarmId = 0;
//loops through data array gids to find largest value and hold on to it with highestfarmid
for (i in farmArray){
	//console.log(farmArray[i].gid)
	if (farmArray[i].gid > highestFarmId){
		highestFarmId = farmArray[i].gid
	};
};
//console.log(highestFarmId);


//---------------------------------Working Functions-------------------------------
function wfs_farm_insert(feat,geomType) {  
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/Farms',
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
			DSS.map.render();
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
function createFarm(fname,fowner,faddress){
	DSS.draw = new ol.interaction.Draw({
		source: source,
		type: 'Point',
		geometryName: 'geom'
	});
	DSS.map.addInteraction(DSS.draw);
	console.log("draw is on")
	DSS.draw.on('drawend', function (e) {
		e.feature.setProperties({
			//plugs in highestFarmId and gives it an id +1 to make sure its unique
			id: highestFarmId + 1,
			farm_name: fname,
			farm_owner: fowner,
			farm_addre: faddress
		})
		var geomType = 'point'
		wfs_farm_insert(e.feature, geomType)
		console.log("HI! WFS farm Insert ran!")
	})     
}
//------------------working variables--------------------
var type = "Point";
var source = farms_1Source;

//---------------------------Create New Farm Container, and component declaration---------------
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
				html: 'Fill in operation info in the form below, then select operation location on map'
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
                    allowBlank: false,
					margin: '12 0',
					padding: 4,
            	},{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Place Farm',
					formBind: true,
					handler: function() { 
						var form = this.up('form').getForm();
						if (form.isValid()) {
							createFarm(form.findField('operation').getSubmitValue(),
							form.findField('owner').getSubmitValue(),
							form.findField('address').getSubmitValue());
						}
			        }
				}],
			}]
		});	
		me.callParent(arguments);
	},
	//------------------------------------------------------------------
    
});