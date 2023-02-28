
DSS.utils.addStyle('.underlined-input { border: none; border-bottom: 1px solid #ddd; display:table; width: 100%; height:100%; padding: 0 0 2px}')   
DSS.utils.addStyle('.underlined-input:hover { border-bottom: 1px solid #7ad;}')
DSS.utils.addStyle('.right-pad { padding-right: 32px }')   

//--------------Geoserver WFS source connection-------------------
var scenarioObj = {};

//empty array to catch feature objects
var farmArrayCNO = [];
var scenarioArrayCNO = [];

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
    await geoServer.insertFarm(str, feat,fType)
}

function createFarm(fname,fowner,faddress){
	DSS.MapState.removeMapInteractions()
	DSS.mapClickFunction = undefined;
	DSS.mouseMoveFunction = undefined;
	DSS.draw = new ol.interaction.Draw({
		type: 'Point',
		geometryName: 'geom'
	});
	DSS.map.addInteraction(DSS.draw);
	DSS.draw.on('drawend', async function (e) {
		console.log(e)
		e.feature.setProperties({
			farm_name: fname,
			farm_owner: fowner,
			farm_addre: faddress,
		})
		await cnf_farm_insert(e.feature, 'farm_2')
	})     
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
				html: 'Fill in operation info in the form below, then select farm location on map'
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
					text: 'Place Operation',
					formBind: true,
					handler: function() { 
						var form = this.up('form').getForm();
						if (form.isValid()) {
							createFarm(
								form.findField('operation').getSubmitValue(),
								form.findField('owner').getSubmitValue(),
								form.findField('address').getSubmitValue());
						}
			        }
				}],
			}]
		});	
		me.callParent(arguments);
	},
});