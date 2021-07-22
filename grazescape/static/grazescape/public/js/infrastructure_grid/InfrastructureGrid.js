

DSS.utils.addStyle('.x-grid-widgetcolumn-cell-inner {padding-left: 0;padding-right: 0;}')
DSS.utils.addStyle('.combo-limit-borders {border-top: transparent; border-bottom: transparent}')

var infraArray = [];
var infraObj = {};

var infraUrl = 
'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
'service=wfs&'+
'?version=2.0.0&'+
'request=GetFeature&'+
'typeName=GrazeScape_Vector:infrastructure_2&' +
'outputformat=application/json&'+
'srsname=EPSG:3857';

var infrastructure_Source = new ol.source.Vector({
	format: new ol.format.GeoJSON(),
	url: infraUrl
});
var infrastructureLayer = new ol.layer.Vector({
	title: 'infrastructure',
	source: infrastructure_Source
})
console.log(infrastructureLayer)

function getWFSinfra() {
    console.log("getting wfs infra")
	return $.ajax({
		jsonp: false,
		type: 'GET',
		url: infraUrl,
		async: false,
		dataType: 'json',
		success:function(response)
		{
			responseObj = response
			infraObj = response.features
			console.log(responseObj);
			infraArray = [];
			console.log(infraObj[0]);
			popInfraArray(infraObj);
			//placed data store in call function to make sure it was locally available.	
			Ext.create('Ext.data.Store', {
				storeId: 'infraStore1',
				alternateClassName: 'DSS.infraStore',
				fields:['name','infraType','infraTypeDisp','fenceMaterial','fenceMaterialDisp','waterPipe',
				'waterPipeDisp','laneMaterial','laneMaterialDisp', 'costPerFoot','laneWidth','totalCost'],
				data: infraArray
			});
			//Setting store to just declared store fieldStore1, and reloading the store to the grid
			DSS.infrastructure_grid.InfrastructureGrid.setStore(Ext.data.StoreManager.lookup('infraStore1'));
			DSS.infrastructure_grid.InfrastructureGrid.store.reload();
			console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			console.log(response);
			//console.log('DSS.infrastructure_grid.InfrastructureGrid')
			//console.log(DSS.infrastructure_grid.InfrastructureGrid);
		}
	})
}

function popInfraArray(obj) {

	for (i in obj)
	//console.log(i);
	infraArray.push({
		id: obj[i].id,
		name: obj[i].properties.infra_name,
		//owningFarmid: obj[i].properties.farm_id,
        infraType: obj[i].properties.infra_type,
		infraTypeDisp: obj[i].properties.infra_type_disp,
        fenceMaterial: obj[i].properties.fence_material,
		fenceMaterialDisp: obj[i].properties.fence_material_disp,
		waterPipe: obj[i].properties.water_pipe,
		waterPipeDisp: obj[i].properties.water_pipe_disp,
		laneMaterial: obj[i].properties.lane_material,
		laneMaterialDisp: obj[i].properties.lane_material_disp,
		laneWidth: obj[i].properties.lane_width,
        costPerFoot: obj[i].properties.cost_per_foot,
		totalCost: obj[i].properties.total_cost,
		infraLength:obj[i].properties.infra_length
	});
	//DSS.infrastructure_grid.InfrastructureGrid.store.reload(infraArray);
}
console.log(infraArray);

//empty array to catch feature objects 
function gatherInfraTableData() {
	//redeclaring infraUrl to only show filtered fields
	infraUrl = 
	'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:infrastructure_2&' +
	'CQL_filter=scenario_id='+DSS.activeScenario+'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';
	//--------------------------------------------
	getWFSinfra();
	console.log("InfraStructure gatherTableData ran");
	console.log(infraArray);
};
//console.log(infraArray);

Ext.create('Ext.data.Store', {
	storeId: 'infraTypeStore',
	fields:[ 'display', 'value'],
	data: [{
		value: 'fl',
		display: 'Fencing'
	},{ 
		value: 'wl',
		display: 'Water Line'
	},{ 
		value: 'll',
		display: 'Lane Line'
	}]
});

Ext.create('Ext.data.Store', {
	storeId: 'fenceMaterialStore',
	fields:[ 'display', 'value','cost'],
	data: [{
		value: 'hte1',
		display: 'High Tensile Electric, 1 Strand',
		cost: 0.84
	},{ 
		value: 'hte',
		display: 'Electric - High Tensile',
		cost:1.81
	},{ 
		value: 'pp',
		display: 'Pasture Paddock',
		cost:0.37
	}]
});

Ext.create('Ext.data.Store', {
	storeId: 'waterPipeStore',
	fields:[ 'display', 'value','cost'],
	data: [{
		value: 'sup',
		display: 'Surface HDPE or PVC Pipe',
		cost:1.17
	},{ 
		value: 'sbp',
		display: 'Shallow Buried HDPE or PVC Pipe',
		cost:2.31
	}]
});
Ext.create('Ext.data.Store', {
	storeId: 'laneMaterialStore',
	fields:[ 'display', 'value','cost',],
	data: [{
		value: 're',
		display: 'Raised Earth Walkway',
		cost:0.16
	},{ 
		value: 'gw',
		display: 'Gravel Walkway',
		cost:0.37
	},{ 
		value: 'gg',
		display: 'Gravel over Geotextile',
		cost:0.56
	},{ 
		value: 'ggr',
		display: 'Gravel Over Graded Rock',
		cost:0.96
	},{ 
		value: 'ggrg',
		display: 'Gravel Over Graded Rock and Geotextile',
		cost:1.33
	}]
});
//-----------------------------------fieldStore!---------------------------------
Ext.create('Ext.data.Store', {
	storeId: 'InfraStore',
	alternateClassName: 'DSS.InfraStore',
	fields:['name','infraType','infraTypeDisp','fenceMaterial','fenceMaterialDisp','waterPipe',
	'waterPipeDisp','laneMaterial','laneMaterialDisp', 'costPerFoot','laneWidth','infraLength','totalCost'],
	data: infraArray
});

//------------------------------------------------------------------------------
Ext.define('DSS.infrastructure_grid.InfrastructureGrid', {
	//------------------------------------------------------------------------------
	extend: 'Ext.grid.Panel',
	alias: 'widget.infra_grid',
	alternateClassName: 'DSS.InfraGrid',
	singleton: true,	
	autoDestroy: false,
	
	hidden: true,
	
	height: 0,
	internalHeight: 200,
	isAnimating: false,
	
	resizable: true,
	resizeHandles: 'n',
	
	store: Ext.data.StoreManager.lookup('InfraStore'),
	
	
	minHeight: 40,
	maxHeight: 600,
	listeners: {
		resize: function(self, newW, newH, oldW, oldH) {
			if (!self.isAnimating) self.internalHeight = newH;
		}
	},
	//requires: ['DSS.map.Main'],

	//-----------------------------------------------------
	
	initComponent: function() {
		console.log("INITCOMPONENT FROM FIELDGRID RAN!!!!!")
		let me = this;
		
		//------------------------------------------------------------------------------
		let infraNameColumn = { 
			editor: 'textfield', text: 'Label', dataIndex: 'name', width: 120, 
			locked: true, draggable: false, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24,

		};
		//------------------------------------------------------------------------------
		let infraTypeColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Infrastructure Type', dataIndex: 'infraTypeDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'infraTypeStore',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: function(combo, value, eOpts){
						var record = combo.getWidgetRecord();
						record.set('infraType', value.get('value'));
						record.set('infraTypeDisp', value.get('display'));
						me.getView().refresh();
					}
				}
			}
		};
		//------------------------------------------------------------------------------
		let fenceMaterialColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Fence Material', dataIndex: 'fenceMaterialDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('infraType') == 'fl') {
					widget.setDisabled(false);
				}
				 else {
					widget.setDisabled(true);
				}
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'fenceMaterialStore',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: function(combo, value, cost, eOpts){
						var record = combo.getWidgetRecord();
						record.set('fenceMaterial', value.get('value'));
						record.set('fenceMaterialDisp', value.get('display'));
						record.set('costPerFoot',value.get('cost'));
						me.getView().refresh();
					}
				}
			}
		};
		//------------------------------------------------------------------------------
		let waterPipeColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Water Pipe Type', dataIndex: 'waterPipeDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('infraType') == 'wl') {
					widget.setDisabled(false);
				}else {
					widget.setDisabled(true);
				}
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'waterPipeStore',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: function(combo, value, cost, eOpts,rec,widget){
						var record = combo.getWidgetRecord();
						record.set('waterPipe', value.get('value'));
						record.set('waterPipeDisp', value.get('display'));
						record.set('costPerFoot',value.get('cost'));
						me.getView().refresh();
					}
				}
			}
		};
		//------------------------------------------------------------------
		let laneLineColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Lane Line Material', dataIndex: 'laneMaterialDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('infraType') == 'll') {
					widget.setDisabled(false);
				}else {
					widget.setDisabled(true);
				}
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'laneMaterialStore',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: function(combo, value, cost, eOpts,rec,widget){
						var record = combo.getWidgetRecord();
						record.set('laneMaterial', value.get('value'));
						record.set('laneMaterialDisp', value.get('display'));
						record.set('costPerFoot',value.get('cost'));
						me.getView().refresh();
					}
				}
			}
		};
		//------------------------------------------------------------------
		let widthColumn = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', minValue: 25, maxValue: 175, step: 5, editable: false
			}, text: 'Lane<br>Width', dataIndex: 'laneWidth', width: 80, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		let lengthColumn = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', minValue: 25, maxValue: 175, step: 5, editable: false
			}, text: 'Length', dataIndex: 'infraLength', width: 80, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let costPerFootColumn = {
			xtype: 'numbercolumn', format: '0.00',editor: {
				xtype:'numberfield', minValue: 25, maxValue: 175, step: 5
			}, text: 'Cost Per<br>Foot', dataIndex: 'costPerFoot', width: 80, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let totalCostColumn = {
			xtype: 'numbercolumn', format: '0.00',editor: {
				xtype:'numberfield', minValue: 25, maxValue: 175, step: 5
			}, text: 'Total<br>Cost', dataIndex: 'totalCost', width: 80, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		Ext.applyIf(me, {

			columns: [infraNameColumn,infraTypeColumn,fenceMaterialColumn,
				waterPipeColumn,laneLineColumn,lengthColumn,widthColumn,costPerFootColumn,totalCostColumn],
			
			plugins: {
				ptype: 'cellediting',
				clicksToEdit: 1,
				listeners: {
					beforeedit: function(editor, context, eOpts) {
						if (context.column.widget) return false
					}
				}
			}
		});
		
		me.callParent(arguments);
		
		AppEvents.registerListener('hide_infra_grid', function() {
			me.isAnimating = true;
			me.stopAnimation().animate({
				dynamic: true,
				duration: me.getHeight() / 0.8,
				to: {
					height: 0
				},
				callback: function() {
					me.setHidden(true);
					me.isAnimating = false;
				}
			})
		})
		
		AppEvents.registerListener('show_infra_grid', function() {
			me
			console.log('hi from grid view')

			let height = me.getHeight();
			if (height == 0) height = me.internalHeight;			
			
			me.setHidden(false);
			me.isAnimating = true;
			me.stopAnimation().animate({
				dynamic: true,
				duration: height / 0.8,
				to: {
					height: height
				},
				callback: function() {
					me.isAnimating = false;
				}
			})
		})
	}
});
