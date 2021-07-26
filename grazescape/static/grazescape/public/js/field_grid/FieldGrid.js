

DSS.utils.addStyle('.x-grid-widgetcolumn-cell-inner {padding-left: 0;padding-right: 0;}')
DSS.utils.addStyle('.combo-limit-borders {border-top: transparent; border-bottom: transparent}')

var fieldArray = [];
var fieldObj = {};

var fieldUrl =geoserverURL + '/geoserver/wfs?'+
'service=wfs&'+
'?version=2.0.0&'+
'request=GetFeature&'+
'typeName=GrazeScape_Vector:field_2&' +
'outputformat=application/json&'+
'srsname=EPSG:3857';

var fields_1Source = new ol.source.Vector({
	format: new ol.format.GeoJSON(),
	url: fieldUrl
});
var fields_1Layer = new ol.layer.Vector({
	title: 'fields_1',
	source: fields_1Source
})
console.log(fields_1Layer)


function getWFSfields() {
    console.log("getting wfs fields")
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
			console.log(fieldObj);
			fieldArray = [];
			console.log(fieldObj[0]);
			popFieldsArray(fieldObj);
			//console.log("PopFieldsArray should have fired if you are reading this")
			//placed data store in call function to make sure it was locally available.
			console.log("creating store")
			Ext.create('Ext.data.Store', {
				storeId: 'fieldStore1',
				alternateClassName: 'DSS.FieldStore',
				fields:[ 'name', 'soilP', 'soilOM', 'rotationVal', 'rotationDisp', 'tillageVal', 'tillageDisp', 'coverCropDisp', 'coverCropVal',
					'onContour','fertPerc','manuPerc','grassSpeciesVal','grassSpeciesDisp','interseededClover', 'pastureGrazingRotCont',
					'grazeDensityVal','grazeDensityDisp','manurePastures', 'grazeDairyLactating',
					'grazeDairyNonLactating', 'grazeBeefCattle', 'area', 'perimeter'],
				data: fieldArray
			});
			//Setting store to just declared store fieldStore1, and reloading the store to the grid
			DSS.field_grid.FieldGrid.setStore(Ext.data.StoreManager.lookup('fieldStore1'));
			DSS.field_grid.FieldGrid.store.reload();
			console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			console.log(response);
			//console.log('DSS.field_grid.FieldGrid')
			//console.log(DSS.field_grid.FieldGrid);
		}
	})
}

function popFieldsArray(obj) {
	for (i in obj)
	fieldArray.push({
		id: obj[i].id,
		name: obj[i].properties.field_name,
		owningFarmid: obj[i].properties.owner_id,
		soilP: obj[i].properties.soil_p,
		soilOM: obj[i].properties.om,
		rotationVal: obj[i].properties.rotation,
		rotationDisp: obj[i].properties.rotation_disp,
		tillageVal: obj[i].properties.tillage,
		tillageDisp: obj[i].properties.tillage_disp,
		coverCropVal: obj[i].properties.cover_crop,
		coverCropDisp: obj[i].properties.cover_crop_disp,
		onContour: obj[i].properties.on_contour,
		fertPerc:obj[i].properties.fertilizerpercent,
		manuPerc:obj[i].properties.manurepercent,
		grassSpeciesVal:obj[i].properties.grass_speciesval,
		grassSpeciesDisp:obj[i].properties.grass_speciesdisp,
		interseededClover: obj[i].properties.interseeded_clover,
		grazeDensityVal:obj[i].properties.grazingdensityval,
		grazeDensityDisp:obj[i].properties.grazingdensitydisp,
		manurePastures: obj[i].properties.spread_confined_manure_on_pastures,
		grazeDairyLactating: obj[i].properties.graze_dairy_lactating,
		grazeDairyNonLactating: obj[i].properties.graze_dairy_non_lactating,
		grazeBeefCattle: obj[i].properties.graze_beef_cattle,
		rotationFreqVal: obj[i].properties.rotational_freq_val,
		rotationFreqDisp: obj[i].properties.rotational_freq_disp,
        area: obj[i].properties.area,
        fence_type: obj[i].properties.fence_type,
        fence_cost: obj[i].properties.fence_cost,
        fence_unit_cost:obj[i].properties.fence_unit_cost
	});
	console.log("DOne with popping fields")
}

//empty array to catch feature objects 
function gatherTableData() {
	//redeclaring fieldUrl to only show filtered fields
	fieldUrl = 
	geoserverURL + '/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:field_2&' +
	'CQL_filter=scenario_id='+DSS.activeScenario+'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';
	//--------------------------------------------
	getWFSfields();
	console.log(fieldUrl)
	console.log("gatherTableData ran");
	console.log(fieldArray);
};

Ext.create('Ext.data.Store', {
	storeId: 'rotationList',
	fields:[ 'display', 'value'],
	data: [{
		value: 'pt-cn',
		display: 'Continuous Pasture'
	},{
		value: 'pt-rt',
		display: 'Rotational Pasture'
	},
	// {
	// 	value: 'ps',
	// 	display: 'New Pasture'
	// },
	{
		value: 'dl',
		display: 'Dry Lot'
	},{ 
		value: 'cc',
		display: 'Continuous Corn'
	},{ 
		value: 'cg',
		display: 'Cash Grain (cg/sb)'
	},{ 
		value: 'dr',
		display: 'Corn Silage to Corn Grain to Alfalfa(3x)'
	},{ 
		value: 'cso',
		display: 'Corn Silage to Soybeans to Oats'
	}]
});

Ext.create('Ext.data.Store', {
	storeId: 'coverCrop',
	fields:[ 'display', 'value'],
	data: [{
		value: 'cc',
		display: 'Small Grain'
	},{ 
		value: 'gcis',
		display: 'Grazed/Interseeded'
	},{ 
		value: 'gcds',
		display: 'Grazed/Direct Seeded'
	},{ 
		value: 'nc',
		display: 'No Cover'
	},
	// {
	// 	value: 'na',
	// 	display: 'Not Applicable'
	// }
]
});

Ext.create('Ext.data.Store', {
	storeId: 'grassSpecies',
	fields:[ 'display', 'value'],
	data: [{
		value: 'Bluegrass-clover',
		display: 'Bluegrass'
	},{ 
		value: 'Orchardgrass-clover',
		display: 'Orchardgrass'
	},{ 
		value: 'Timothy-clover',
		display: 'Timothy'
	}]
});
Ext.create('Ext.data.Store', {
	storeId: 'tillageList',
	fields:[ 'display', 'value'],
	data: [{
		value: 'nt',
		display: 'No-Till'
	},{ 
		value: 'su',
		display: 'Spring Cultivation'
	},{ 
		value: 'sc',
		display: 'Spring Chisel + Disk'
	},{ 
		value: 'sn',
		display: 'Spring Chisel No Disk'
	},{ 
		value: 'sv',
		display: 'Spring Vertical'
	},{
		value: 'fc',
		display: 'Fall Chisel + Disk'
	},{ 
		value: 'fm',
		display: 'Fall Moldboard Plow'
	}]
});
Ext.create('Ext.data.Store', {
	storeId: 'tillageList_cashCrop',
	fields:[ 'display', 'value'],
	data: [{
		value: 'nt',
		display: 'No-Till'
	},{ 
		value: 'su',
		display: 'Spring Cultivation'
	},{ 
		value: 'sn',
		display: 'Spring Chisel No Disk'
	}]
});
Ext.create('Ext.data.Store', {
	storeId: 'tillageList_crop_grazing',
	fields:[ 'display', 'value'],
	data: [{
		value: 'nt',
		display: 'No-Till'
	},{ 
		value: 'su',
		display: 'Spring Cultivation'
	},{ 
		value: 'sc',
		display: 'Spring Chisel + Disk'
	}]
});
Ext.create('Ext.data.Store', {
	storeId: 'tillageList_noCoverCrop',
	fields:[ 'display', 'value'],
	data: [{
		value: 'nt',
		display: 'No-Till'
	},{ 
		value: 'su',
		display: 'Spring Cultivation'
	},{ 
		value: 'sn',
		display: 'Spring Chisel No Disk'
	},{ 
		value: 'sv',
		display: 'Spring Vertical'
	},{ 
		value: 'fch',
		display: 'Fall Chisel + Disk'
	},{ 
		value: 'fm',
		display: 'Fall Moldboard Plow'
	}]
});
Ext.create('Ext.data.Store', {
	storeId: 'tillageList_newPasture',
	fields:[ 'display', 'value'],
	data: [{
		value: 'nt',
		display: 'No-Till'
	},{ 
		value: 'su',
		display: 'Spring Cultivation'
	},{ 
		value: 'sc',
		display: 'Spring Chisel + Disk'
	},{ 
		value: 'sn',
		display: 'Spring Chisel No Disk'
	},{ 
		value: 'fch',
		display: 'Fall Chisel + Disk'
	},{ 
		value: 'fm',
		display: 'Fall Moldboard Plow'
	}]
});
Ext.create('Ext.data.Store', {
	storeId: 'grazingDensity',
	fields:[ 'display', 'value'],
	data: [{
		value: 'hi',
		display: 'high'
	},{ 
		value: 'lo',
		display: 'low'
	},{
		value: 'na',
		display: 'Not Applicable'
	}]
});
Ext.create('Ext.data.Store', {
	storeId: 'rotationFreq',
	fields:['display', 'value'],
	data: [{
		value: '1.2',
		display: 'More then once a day'
	},{ 
		value: '1',
		display: 'Once a day'
	},{ 
		value: '0.95',
		display: 'Every 3 days'
	},{ 
		value:'0.75',
		display: 'Every 7 days'
	},{ 
		value: '0.65',
		display: 'Continuous'
	}]
});
//-----------------------------------fieldStore!---------------------------------
Ext.create('Ext.data.Store', {
	storeId: 'fieldStore',
	alternateClassName: 'DSS.FieldStore',
	fields:[ 'name', 'soilP', 'soilOM', 'rotationVal', 'rotationDisp', 'tillageVal', 
	'tillageDisp', 'coverCropDisp', 'coverCropVal',
		'onContour','fertPerc','manuPerc','grassSpeciesVal','grassSpeciesDisp',
		'interseededClover','grazeDensityVal','grazeDensityDisp','manurePastures', 'grazeDairyLactating',
		'grazeDairyNonLactating', 'grazeBeefCattle','area', 'perimeter','fence_type',
        'fence_cost','fence_unit_cost','rotationFreqVal','rotationFreqDisp'],
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
	id: "fieldTable",
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
		console.log("INITCOMPONENT FROM FIELDGRID RAN!!!!!")
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
				xtype:'numberfield', minValue: 0, maxValue: 60, step: 0.5, disabled: true
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
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Cover Crop', dataIndex: 'coverCropDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('rotationVal') == 'ps' || rec.get('rotationVal') == 'pt-cn' || rec.get('rotationVal') == 'pt-rt' || rec.get('rotationVal') == 'dl') {
					widget.setDisabled(true);
				}
				 else {
					widget.setDisabled(false);
				}
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'coverCrop',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: function(combo, value, eOpts){
						var record = combo.getWidgetRecord();
						record.set('coverCropVal', value.get('value'));
						record.set('coverCropDisp', value.get('display'));
						me.getView().refresh();
					}
				}
			}
		};
		//------------------------------------------------------------------------------

		
		let tillageColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Tillage', dataIndex: 'tillageDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {
				//console.log(rec)
				//widget turned off
				if (rec.get('rotationVal') == 'pt-cn' || rec.get('rotationVal') == 'pt-rt'|| rec.get('rotationVal') == 'dl') {
					widget.setDisabled(true);
					//widget.setStore('tillageList')
				}
				//tillage options for new pasture
				else if(rec.get('rotationVal') == 'ps'){
					widget.setDisabled(false);
					widget.setStore('tillageList_newPasture')
				}
				//widget gets grazing store options
				// else if ((rec.get('rotationVal') == 'pt-cn' || rec.get('rotationVal') == 'pt-rt') && (rec.get('coverCropVal') == 'gcis' || rec.get('coverCropVal') == 'gcds')) {
				// 	widget.setDisabled(false);
				// 	widget.setStore('tillageList_crop_grazing')
				// }
				//widget gets cashcrop options
				else if((rec.get('rotationVal') == 'cc' || rec.get('rotationVal') == 'cg') 
				&& (rec.get('coverCropVal') == 'cc')
				){
					widget.setDisabled(false);
					widget.setStore('tillageList_cashCrop')
				}
				else if((rec.get('rotationVal') == 'cc' || rec.get('rotationVal') == 'cg') 
				&& (rec.get('coverCropVal') == 'cc' ||  rec.get('coverCropVal') == 'gcis' ||  rec.get('coverCropVal') == 'gcds')
				){
					widget.setDisabled(false);
					widget.setStore('tillageList_crop_grazing')
				}
				
				//widget gets grazing options for cash crop rotations
				else if((rec.get('rotationVal') == 'cc' || rec.get('rotationVal') == 'cg' || rec.get('rotationVal') == 'dr' || rec.get('rotationVal') == 'cso') 
				&& (rec.get('coverCropVal') == 'nc' ||  rec.get('coverCropVal') == null)){
					widget.setDisabled(false);
					widget.setStore('tillageList_noCoverCrop')
				}
				//cash grain tillage options
				else if((rec.get('rotationVal') == 'dr' || rec.get('rotationVal') == 'cso') 
				&& (rec.get('coverCropVal') == 'cc' ||  rec.get('coverCropVal') == 'gcis' ||  rec.get('coverCropVal') == 'gcds')){
					widget.setDisabled(false);
					widget.setStore('tillageList_crop_grazing')
				}
				else {
					widget.setDisabled(false);
					widget.setStore('tillageList')
				}
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				//store: getTillageListStore('ps'),
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
				select: function(combo, value, eOpts,rec,widget){
						var record = combo.getWidgetRecord();
						record.set('tillageVal', value.get('value'));
						record.set('tillageDisp', value.get('display'));
						//me.getView().refresh();
					}
				}
			}
		};
		//------------------------------------------------------------------------------

		let onContourColumn = {
			xtype: 'widgetcolumn', text: 'On<br>Contour', dataIndex: 'onContour', width: 80,
			editor:{}, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24,
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('rotationVal') == 'pt-cn' || rec.get('rotationVal') == 'pt-rt'|| rec.get('rotationVal') == 'dl') {
					widget.setDisabled(true);
				}
				else if(rec.get('onContour') == true){
					widget.setValue(true)
					widget.setDisabled(false);
				}
				else if(rec.get('onContour') == false){
					widget.setValue(false)
					widget.setDisabled(false);
				}
				else{
					widget.setDisabled(false);
				}
			},
			widget: {
				xtype: 'checkbox',
				defaultBindProperty: 'onContour',
				queryMode: 'local',
				listeners: {
					change: function(widget,value){
					console.log("you've changed man")
					var record = widget.getWidgetRecord();
					
					if (value == true){
						record.set('onContour',true)
					}
					else if(value == false){
						record.set('onContour',false)
					}
					console.log(record.get('onContour'))
					//me.getView().refresh();
				}
			}
			}
		};
		//still need to find a way to turn off on contour for dry lot and pasture crop rotations
		//
		//***Figured this out,  Needed to change the check column into a widget column, and then 
		//use a checkbox widget to get this done properly.  Very frustrating task, eventually
		//figured out how to decouple the local value setting from the onContour array value
		//will test more when i get back from vaca. 05202021
		//------------------------------------------------------------------------------
		let fertPerc_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', maxValue: 100, step: 5
			}, text: 'Percent<br>Fertilizer', dataIndex: 'fertPerc', width: 80, 
			hideable: true, enableColumnHide: true, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let manuPerc_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', maxValue: 100, step: 5
			}, text: 'Percent<br>Manure', dataIndex: 'manuPerc', width: 80, 
			hideable: true, enableColumnHide: true, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		//Turn on for pasture only
		let grazeDairyLactatingColumn = {
			xtype: 'widgetcolumn', text: 'Graze Dairy<br>Lactating', dataIndex: 'grazeDairyLactating', width: 100, editor:{},
			hideable: true, enableColumnHide: true, lockable: false, minWidth: 24,
			onWidgetAttach: function(col,widget,rec) {
				if (rec.get('rotationVal') == 'ps' || rec.get('rotationVal') == 'dl' || rec.get('rotationVal') == 'cc' || rec.get('rotationVal') == 'cg' || rec.get('rotationVal') == 'dr' || rec.get('rotationVal') == 'cso') {
					widget.setDisabled(true);
				}
				else if(rec.get('grazeDairyLactating') == true){
					widget.setValue(true)
					widget.setDisabled(false);
				}
				else if(rec.get('grazeDairyLactating') == false){
					widget.setValue(false)
					widget.setDisabled(false);
				}
				else{
					widget.setDisabled(false);
				}
			},
			widget: {
				xtype: 'checkbox',
				defaultBindProperty: 'grazeDairyLactating',
				queryMode: 'local',
				listeners: {
					change: function(widget,value){
					console.log("you've changed man graze lac")
					var record = widget.getWidgetRecord();
					
					if (value == true){
						record.set('grazeDairyLactating',true)
					}
					else if(value == false){
						record.set('grazeDairyLactating',false)
					}
					console.log(record.get('grazeDairyLactating'))
					//me.getView().refresh();
				}
			}
			}
		};
		//------------------------------------------------------------------------------
		//Turn on for pasture only
		// let grazeDairyNonLactating = {
		// 	xtype: 'checkcolumn', text: 'Graze Dairy<br>Non-Lactating', dataIndex: 'grazeDairyNonLactating', width: 120, 
		// 	hideable: true, enableColumnHide: true, lockable: false, minWidth: 24
		// };
		let grazeDairyNonLactatingColumn = {
			xtype: 'widgetcolumn', text: 'Graze Dairy<br>Non-Lactating', dataIndex: 'grazeDairyNonLactating', width: 100, editor:{},
			hideable: true, enableColumnHide: true, lockable: false, minWidth: 24,
			onWidgetAttach: function(col,widget,rec) {
				if (rec.get('rotationVal') == 'ps' || rec.get('rotationVal') == 'dl' || rec.get('rotationVal') == 'cc' || rec.get('rotationVal') == 'cg' || rec.get('rotationVal') == 'dr' || rec.get('rotationVal') == 'cso') {
					widget.setDisabled(true);
				}
				else if(rec.get('grazeDairyNonLactating') == true){
					widget.setValue(true)
					widget.setDisabled(false);
				}
				else if(rec.get('grazeDairyNonLactating') == false){
					widget.setValue(false)
					widget.setDisabled(false);
				}
				else{
					widget.setDisabled(false);
				}
			},
			widget: {
				xtype: 'checkbox',
				defaultBindProperty: 'grazeDairyNonLactating',
				queryMode: 'local',
				listeners: {
					change: function(widget,value){
					console.log("you've changed man graze lac")
					var record = widget.getWidgetRecord();
					
					if (value == true){
						record.set('grazeDairyNonLactating',true)
					}
					else if(value == false){
						record.set('grazeDairyNonLactating',false)
					}
					console.log(record.get('grazeDairyNonLactating'))
					//me.getView().refresh();
				}
			}
			}
		};
		//------------------------------------------------------------------------------
		//Turn on for pasture only
		// let grazeBeefCattle = {
		// 	xtype: 'checkcolumn', text: 'Graze<br>Beef Cattle', dataIndex: 'grazeBeefCattle', width: 100, 
		// 	hideable: true, enableColumnHide: true, lockable: false, minWidth: 24
		// };
		let grazeBeefCattleColumn = {
			xtype: 'widgetcolumn', text: 'Graze<br>Beef Cattle', dataIndex: 'grazeBeefCattle', width: 100, editor:{},
			hideable: true, enableColumnHide: true, lockable: false, minWidth: 24,
			onWidgetAttach: function(col,widget,rec) {
				if (rec.get('rotationVal') == 'ps' || rec.get('rotationVal') == 'dl' || rec.get('rotationVal') == 'cc' || rec.get('rotationVal') == 'cg' || rec.get('rotationVal') == 'dr' || rec.get('rotationVal') == 'cso') {
					widget.setDisabled(true);
				}
				else if(rec.get('grazeBeefCattle') == true){
					widget.setValue(true)
					widget.setDisabled(false);
				}
				else if(rec.get('grazeBeefCattle') == false){
					widget.setValue(false)
					widget.setDisabled(false);
				}
				else{
					widget.setDisabled(false);
				}
			},
			widget: {
				xtype: 'checkbox',
				defaultBindProperty: 'grazeBeefCattle',
				queryMode: 'local',
				listeners: {
					change: function(widget,value){
					console.log("you've changed man graze lac")
					var record = widget.getWidgetRecord();
					
					if (value == true){
						record.set('grazeBeefCattle',true)
					}
					else if(value == false){
						record.set('grazeBeefCattle',false)
					}
					console.log(record.get('grazeBeefCattle'))
					//me.getView().refresh();
				}
			}
			}
		};
		
		//------------------------------------------------------------------------------
		// let canManurePastures = {
		// 	xtype: 'checkcolumn', text: 'Confined Manure<br>to Pastures', dataIndex: 'manurePastures', width: 125, 
		// 	hideable: true, enableColumnHide: true, lockable: false, minWidth: 24
		// };
		let manurePasturesColumn = {
			xtype: 'widgetcolumn', text: 'Confined Manure<br>to Pastures', dataIndex: 'manurePastures', width: 100, editor:{},
			hideable: true, enableColumnHide: true, lockable: false, minWidth: 24,
			onWidgetAttach: function(col,widget,rec) {
				if (rec.get('rotationVal') == 'ps' || rec.get('rotationVal') == 'dl' || rec.get('rotationVal') == 'cc' || rec.get('rotationVal') == 'cg' || rec.get('rotationVal') == 'dr' || rec.get('rotationVal') == 'cso') {
					widget.setDisabled(true);
				}
				else if(rec.get('manurePastures') == true){
					widget.setValue(true)
					widget.setDisabled(false);
				}
				else if(rec.get('manurePastures') == false){
					widget.setValue(false)
					widget.setDisabled(false);
				}
				else{
					widget.setDisabled(false);
				}
			},
			widget: {
				xtype: 'checkbox',
				defaultBindProperty: 'manurePastures',
				queryMode: 'local',
				listeners: {
					change: function(widget,value){
					console.log("you've changed man graze lac")
					var record = widget.getWidgetRecord();
					
					if (value == true){
						record.set('manurePastures',true)
					}
					else if(value == false){
						record.set('manurePastures',false)
					}
					console.log(record.get('manurePastures'))
					//me.getView().refresh();
				}
			}
			}
		};
		//------------------------------------------------------------------------------
		//------------------------------------------------------------------------------

		let grassSpeciesColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Grass Species', dataIndex: 'grassSpeciesDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('rotationVal') == 'pt-cn' || rec.get('rotationVal') == 'pt-rt' || rec.get('rotationVal') == 'ps') {
					widget.setDisabled(false);
				} else {
					widget.setDisabled(true);
				}
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'grassSpecies',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: function(combo, value, eOpts){
						var record = combo.getWidgetRecord();
						record.set('grassSpeciesVal', value.get('value'));
						record.set('grassSpeciesDisp', value.get('display'));
					}
				}
			}
		};
		let rotationalFreqColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Rotational<br>Frequency', dataIndex: 'rotationFreqDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('rotationVal') == 'pt-rt') {
					widget.setDisabled(false);
				}
				 else {
					widget.setDisabled(true);
				}
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'rotationFreq',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: function(combo, value, eOpts){
						var record = combo.getWidgetRecord();
						record.set('rotationFreqVal', value.get('value'));
						record.set('rotationFreqDisp', value.get('display'));
						//me.getView().refresh();
					}
				}
			}
		};
		//------------------------------------------------------------------------------
		//turn on only for pasture and new pasture crop rotation
		// let interseededCloverColumn = {
		// 	xtype: 'checkcolumn', text: 'Interseeded<br>Clover', dataIndex: 'interseededClover', width: 125, 
		// 	hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		// };
		let interseededCloverColumn = {
			xtype: 'widgetcolumn', text: 'Interseeded<br>Clover', dataIndex: 'interseededClover', width: 100, editor:{},
			hideable: true, enableColumnHide: true, lockable: false, minWidth: 24,
			onWidgetAttach: function(col,widget,rec) {
				if (rec.get('rotationVal') == 'dl' || rec.get('rotationVal') == 'cc' || rec.get('rotationVal') == 'cg' || rec.get('rotationVal') == 'dr' || rec.get('rotationVal') == 'cso') {
					widget.setDisabled(true);
				}
				else if(rec.get('interseededClover') == true){
					widget.setValue(true)
					widget.setDisabled(false);
				}
				else if(rec.get('interseededClover') == false){
					widget.setValue(false)
					widget.setDisabled(false);
				}
				else{
					widget.setDisabled(false);
				}
			},
			widget: {
				xtype: 'checkbox',
				defaultBindProperty: 'interseededClover',
				queryMode: 'local',
				listeners: {
					change: function(widget,value){
					console.log("you've changed man graze lac")
					var record = widget.getWidgetRecord();
					
					if (value == true){
						record.set('interseededClover',true)
					}
					else if(value == false){
						record.set('interseededClover',false)
					}
					console.log(record.get('interseededClover'))
					//me.getView().refresh();
				}
			}
			}
		};
		//------------------------------------------------------------------------------
		let grazeDensityColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Animal Density', dataIndex: 'grazeDensityDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {

				if (rec.get('rotationVal') == 'pt-cn' || rec.get('rotationVal') == 'dl') {
					widget.setDisabled(false);
				} else {
					widget.setDisabled(true);
				}
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'grazingDensity',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: function(combo, value, eOpts){
						var record = combo.getWidgetRecord();
						record.set('grazeDensityVal', value.get('value'));
						record.set('grazeDensityDisp', value.get('display'));
					}
				}
			}
		};
        let area_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', minValue: 25, maxValue: 175, step: 5, editable: false
			}, text: 'Area(acre)', dataIndex: 'area', width: 80,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		
		//------------------------------------------------------------------------------
		Ext.applyIf(me, {

			columns: [
				fieldNameColumn,
				soilP_Column,
				soilOM_Column,
				cropRotationColumn,
				coverCropColumn,
				tillageColumn,
				//onContourColumn,
				fertPerc_Column,
				manuPerc_Column,
				//grazeDairyLactatingColumn,
				//grazeDairyNonLactatingColumn,
				//grazeBeefCattleColumn,
				grassSpeciesColumn,
				rotationalFreqColumn,
				//interseededCloverColumn,
				//manurePasturesColumn,
				grazeDensityColumn,
				area_Column,
				//perimeter_Column

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
			me
			console.log('hi from grid view')
			//selectField()

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
