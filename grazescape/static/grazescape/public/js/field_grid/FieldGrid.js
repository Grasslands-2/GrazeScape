

DSS.utils.addStyle('.x-grid-widgetcolumn-cell-inner {padding-left: 0;padding-right: 0;}')
DSS.utils.addStyle('.combo-limit-borders {border-top: transparent; border-bottom: transparent}')


//Trying to only show active farms fields.  This script runs when the app starts
//How do we interrupt that so it runs when an active farm is selected?
//Can the redraw of the selected fields help?
//look into how exactly that happens again, then try to retrace
//for this problem.

//trying to update geoserver features based on their reps and changes on the table
//Could grab use a for loop to loop through all fields, and another to loop through 
//fieldsarray(table rows), if they're ids match, place table row tables in the selected rows 
//values, and run update transation.  
//Another thought might be to run an jquery ajax request.  not sure that will work
//Last optoin.  remove tables, have pop up with field values, edit there trigger update to 
//geoserver when deselected, or with button.

var fieldArray = [];
var fieldObj = {};

var fieldUrl = 
'http://localhost:8081/geoserver/wfs?'+
'service=wfs&'+
'?version=2.0.0&'+
'request=GetFeature&'+
'typeName=Farms:field_1&' +
'outputformat=application/json&'+
'srsname=EPSG:3857';

var fields_1Source = new ol.source.Vector({
	format: new ol.format.GeoJSON(),
	url: fieldUrl
});
var fields_1Layer = new ol.layer.Vector({
	title: 'fields_1',
	//visible: true,
	//updateWhileAnimating: true,
	//updateWhileInteracting: true,
	source: fields_1Source
})
console.log(fields_1Layer)

function getWFSfields() {
	return $.ajax({
		jsonp: false,
		type: 'GET',
		url: fieldUrl,
		async: false,
		dataType: 'json',
		success:function(response)
		{
			responseObj = response
			fieldObj = response.features
			console.log(responseObj);
			console.log(fieldObj[0]);
		}
	})
}

function popFieldsArray(obj) {
	//console.log(activeFarm);
	//.properties values ar coming from the postGIS/Geoserver layers
	for (i in obj) 
	fieldArray.push({
		id: obj[i].id,
		name: obj[i].properties.field_name,
		owningFarmid: obj[i].properties.scenario_i,
		soilP: obj[i].properties.soil_p,
		soilOM: obj[i].properties.om,
		rotationVal: obj[i].properties.rotation,
		//rotationDisp: obj[i].properties. ,
		tillageVal: obj[i].properties.tillage ,
		//tillageDisp: obj[i].properties ,
		coverCrop: obj[i].properties.has_cover_crop ,
		onContour: obj[i].properties.on_contour ,
		manurePastures: obj[i].properties.spread_confined_manure_on_pastures,
		grazeDairyLactating: obj[i].properties.graze_dairy_lactating,
		grazeDairyNonLactating: obj[i].properties.graze_dairy_non_lactating,
		grazeBeefCattle: obj[i].properties.graze_beef_cattle,
		grassVal: obj[i].properties.grass_species ,
		//grassDisp: obj[i].properties ,
	});
}
console.log(fieldArray);
console.log(DSS.activeFarm);

//empty array to catch feature objects 

getWFSfields();
popFieldsArray(fieldObj);


Ext.create('Ext.data.Store', {
	storeId: 'rotationList',
	fields:[ 'display', 'value'],
	data: [{
		value: 'ep',
		display: 'Pasture - Establish'
	},{ 
		value: 'ps',
		display: 'Pasture - 30% Legumes'
	},{ 
		value: 'cc',
		display: 'Continuous Corn'
	},{ 
		value: 'cg',
		display: 'Cash Grain (cg/sb)'
	},{ 
		value: 'dr1',
		display: 'Dairy Rotation (cg/cs/alf_x3)'
	},{ 
		value: 'dr2',
		display: 'Dairy Rot. alt (cs/sb/oat)'
	}]
});

Ext.create('Ext.data.Store', {
	storeId: 'grassComposition',
	fields:[ 'display', 'value'],
	data: [{
		value: 'bw',
		display: 'Bluegrass - White Clover'
	},{ 
		value: 'oa',
		display: 'Orchardgrass - Alsike'
	},{ 
		value: 'or',
		display: 'Orchardgrass - Red Clover'
	},{ 
		value: 'ta',
		display: 'Timothy - Alsike'
	}]
});

Ext.create('Ext.data.Store', {
	storeId: 'tillageList',
	fields:[ 'display', 'value'],
	data: [{
		value: 'nt',
		display: 'No-Till'
	},{ 
		value: 'scu',
		display: 'Spring Cultivation'
	},{ 
		value: 'sch',
		display: 'Spring Chisel + Disk'
	},{ 
		value: 'smb',
		display: 'Spring Moldboard Plow'
	},{ 
		value: 'fch',
		display: 'Fall Chisel + Disk'
	},{ 
		value: 'fmb',
		display: 'Fall Moldboard Plow'
	}]
});
//-----------------------------------fieldStore!---------------------------------
Ext.create('Ext.data.Store', {
	storeId: 'fieldStore',
	fields:[ 'name', 'soilP', 'soilOM', 'rotationVal', 'rotationDisp', 'tillageVal', 'tillageDisp', 'coverCrop', 
		'onContour', 'manurePastures', 'grazeDairyLactating', 'grazeDairyNonLactating', 'grazeBeefCattle',
		'grassVal', 'grassDisp'],
	data: fieldArray
});

//------------------------------------------------------------------------------
Ext.define('DSS.field_grid.FieldGrid', {
	//------------------------------------------------------------------------------
	extend: 'Ext.grid.Panel',
	alias: 'widget.field_grid',
	alternateClassName: 'DSS.FieldGrid',
	singleton: true,	
	autoDestroy: false,
	
	hidden: true,
	
	height: 0,
	internalHeight: 200,
	isAnimating: false,
	
	resizable: true,
	resizeHandles: 'n',
	
	store: Ext.data.StoreManager.lookup('fieldStore'),
	
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
		let me = this;
		
		//------------------------------------------------------------------------------
		let fieldNameColumn = { 
			editor: 'textfield', text: 'Field', dataIndex: 'name', width: 120, 
			locked: true, draggable: false, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24,

		};
		//------------------------------------------------------------------------------
		let soilP_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', minValue: 25, maxValue: 175, step: 5
			}, text: 'Soil-P', dataIndex: 'soilP', width: 80, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let soilOM_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', minValue: 0, maxValue: 60, step: 0.5
			}, text: 'Soil-OM', dataIndex: 'soilOM', width: 80, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let cropRotationColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Crop Rotation', dataIndex: 'rotationDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'rotationList',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: function(combo, value, eOpts){
						var record = combo.getWidgetRecord();
						record.set('rotationVal', value.get('value'));
						record.set('rotationDisp', value.get('display'));
						me.getView().refresh();
					}
				}
			}
		};
		//------------------------------------------------------------------------------
		let coverCropColumn = {
			xtype: 'checkcolumn', text: 'Cover<br>Crop?', dataIndex: 'coverCrop', width: 80, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let tillageColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Tillage', dataIndex: 'tillageDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('rotationVal') == 'ps') {
					widget.setDisabled(true);
				} else {
					widget.setDisabled(false);
				}
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'tillageList',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: function(combo, value, eOpts){
						var record = combo.getWidgetRecord();
						record.set('tillageVal', value.get('value'));
						record.set('tillageDisp', value.get('display'));
					}
				}
			}
		};
		//------------------------------------------------------------------------------
		let onContourColumn = {
			xtype: 'checkcolumn', text: 'On<br>Contour', dataIndex: 'onContour', width: 80, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let grazeDairyLactating = {
			xtype: 'checkcolumn', text: 'Graze Dairy<br>Lactating', dataIndex: 'grazeDairyLactating', width: 100, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let grazeDairyNonLactating = {
			xtype: 'checkcolumn', text: 'Graze Dairy<br>Non-Lactating', dataIndex: 'grazeDairyNonLactating', width: 120, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let grazeBeefCattle = {
			xtype: 'checkcolumn', text: 'Graze<br>Beef Cattle', dataIndex: 'grazeBeefCattle', width: 100, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let canManurePastures = {
			xtype: 'checkcolumn', text: 'Confined Manure<br>to Pastures', dataIndex: 'manurePastures', width: 125, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------

		let grassComposition = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Grass Composition', dataIndex: 'grassDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('rotationVal') == 'ps') {
					widget.setDisabled(false);
				} else {
					widget.setDisabled(true);
				}
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'grassComposition',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: function(combo, value, eOpts){
						var record = combo.getWidgetRecord();
						record.set('grassVal', value.get('value'));
						record.set('grassDisp', value.get('display'));
					}
				}
			}
		};
		
		//------------------------------------------------------------------------------
		Ext.applyIf(me, {

			columns: [
				fieldNameColumn,
				soilP_Column,
				soilOM_Column,
				cropRotationColumn,
				tillageColumn,
				coverCropColumn,
				onContourColumn,
				grassComposition,
				grazeDairyLactating,
				grazeDairyNonLactating,
				grazeBeefCattle,
				canManurePastures,
				//updateButton
			],
			
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
		
		AppEvents.registerListener('hide_field_grid', function() {
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
		
		AppEvents.registerListener('show_field_grid', function() {
			console.log('hi from grid view')
			selectField()

			//Fun with trying to only show fields for active farm FIX ME LATER
			//console.log(DSS.activeFarm);
			//fieldArray = fieldArray.filter(i => i.owningFarmid == DSS.activeFarm)
			//console.log(fieldObj);
			//onsole.log(fieldArray);
			//DSS.FieldGrid.store.reload()
			//DSS.FieldGrid.initComponent
			//popFieldsArray(fieldObj);

			//Maybe shove entire grid opps into this function?
			


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
