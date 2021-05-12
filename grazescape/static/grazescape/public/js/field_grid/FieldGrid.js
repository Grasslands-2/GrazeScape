

DSS.utils.addStyle('.x-grid-widgetcolumn-cell-inner {padding-left: 0;padding-right: 0;}')
DSS.utils.addStyle('.combo-limit-borders {border-top: transparent; border-bottom: transparent}')

var fieldArray = [];
var fieldObj = {};

var fieldUrl = /*'http://localhost:8081/geoserver/wfs?'+
'service=wfs&'+
'?version=2.0.0&'+
'request=GetFeature&'+
'typeName=Farms:field_1&' +
'outputformat=application/json&'+
'srsname=EPSG:3857'*/
'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
'service=wfs&'+
'?version=2.0.0&'+
'request=GetFeature&'+
'typeName=GrazeScape_Vector:field_1&' +
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
			Ext.create('Ext.data.Store', {
				storeId: 'fieldStore1',
				alternateClassName: 'DSS.FieldStore',
				fields:[ 'name', 'soilP', 'soilOM', 'rotationVal', 'rotationDisp', 'tillageVal', 'tillageDisp', 'coverCropDisp', 'coverCropVal',
					'onContour','fertPerc','manuPerc','grassSpeciesVal','grassSpeciesDisp','interseededClover',
					'grazeDensityVal','grazeDensityDisp','manurePastures', 'grazeDairyLactating',
					'grazeDairyNonLactating', 'grazeBeefCattle','grassVal', 'grassDisp', 'area', 'perimeter','fence_type',
					'fence_cost', 'fence_unit_cost'],
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
	//console.log('hi from popFieldsArray')

	for (i in obj)
	//console.log(i);
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
		//animalsVal:obj[i].properties.animalsval,
		//animalsDisp:obj[i].properties.animalsdisp,
		grassSpeciesVal:obj[i].properties.grass_speciesval,
		grassSpeciesDisp:obj[i].properties.grass_speciesdisp,
		interseededClover: obj[i].properties.interseededclover,
		grazeDensityVal:obj[i].properties.grazingdensityval,
		grazeDensityDisp:obj[i].properties.grazingdensitydisp,
		manurePastures: obj[i].properties.spread_confined_manure_on_pastures,
		grazeDairyLactating: obj[i].properties.graze_dairy_lactating,
		grazeDairyNonLactating: obj[i].properties.graze_dairy_non_lactating,
		grazeBeefCattle: obj[i].properties.graze_beef_cattle,
        area: obj[i].properties.area,
        perimeter: obj[i].properties.perimeter,
        fence_type: obj[i].properties.fence_type,
        fence_cost: obj[i].properties.fence_cost,
        fence_unit_cost:obj[i].properties.fence_unit_cost
	});
	//DSS.field_grid.FieldGrid.store.reload(fieldArray);
}
console.log(fieldArray);

//empty array to catch feature objects 
function gatherTableData() {
	//redeclaring fieldUrl to only show filtered fields
	fieldUrl = 
	/*'http://localhost:8081/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=Farms:field_1&'+*/
	'http://geoserver-dev1.glbrc.org:8080/geoserver/wfs?'+
	'service=wfs&'+
	'?version=2.0.0&'+
	'request=GetFeature&'+
	'typeName=GrazeScape_Vector:field_1&' +
	'CQL_filter=id='+DSS.activeFarm+'&'+
	'outputformat=application/json&'+
	'srsname=EPSG:3857';
	//--------------------------------------------
	getWFSfields();
	console.log("gatherTableData ran");
	console.log(fieldArray);
};
//console.log(fieldArray);

Ext.create('Ext.data.Store', {
	storeId: 'rotationList',
	fields:[ 'display', 'value'],
	data: [{
		value: 'pt-cn',
		display: 'Continuous Pasture'
	},{
		value: 'pt-rt',
		display: 'Rotational Pasture'
	},{
		value: 'ps',
		display: 'New Pasture'
	},{
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
	{
		value: 'na',
		display: 'Not Applicable'
	}]
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
		value: 'sm',
		display: 'Spring Moldboard Plow'
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
		value: 'smb',
		display: 'Spring Moldboard Plow'
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
	}]
});
//-----------------------------------fieldStore!---------------------------------
Ext.create('Ext.data.Store', {
	storeId: 'fieldStore',
	alternateClassName: 'DSS.FieldStore',
	fields:[ 'name', 'soilP', 'soilOM', 'rotationVal', 'rotationDisp', 'tillageVal', 'tillageDisp', 'coverCropDisp', 'coverCropVal',
		'onContour','fertPerc','manuPerc','grassSpeciesVal','grassSpeciesDisp','interseededClover',
		'grazeDensityVal','grazeDensityDisp','manurePastures', 'grazeDairyLactating',
		'grazeDairyNonLactating', 'grazeBeefCattle','grassVal', 'grassDisp','area', 'perimeter','fence_type',
        'fence_cost','fence_unit_cost'],
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
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Cover Crop', dataIndex: 'coverCropDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('rotationVal') == 'ps' || rec.get('rotationVal') == 'pt' || rec.get('rotationVal') == 'dl') {
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
				if (rec.get('rotationVal') == 'pt' || rec.get('rotationVal') == 'dl') {
					widget.setDisabled(true);
				}else {
					widget.setDisabled(false);
				}
			},
			//working on making this having different tillage options available from the launch of the grid.  currently user has to click on and off to show new options.
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'tillageList',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
				select: function(combo, value, eOpts,rec,widget){
						var record = combo.getWidgetRecord();
						record.set('tillageVal', value.get('value'));
						record.set('tillageDisp', value.get('display'));
						//console.log(record.get('rotationVal'));
//**If crop rotation is cont corn, or cash grains
//**and coverage is small grain, tillage can only be spring cult, spring chisel no disk or no till.

//**If no any of the pastures or dry lot and cover crop is one of graze options.
//**then tillage can be no till, spring cult, or spring chisel + disk

//**for any crop rotations besides pasture, new pasturem or dry lot. and no cover crop
//**tillage options include: fall chisel disk, fall moldboard plow, no till, spring chisel no disk, spring vertical, spring cult.

//**if crop rotation corn silage to alfalfa, or corn silage to sb to oats. and cover crop is small grain,
//**tillage optoins: no till, spring chisel plus disk, spring cult

//**if crop rotation new pasture, tillage options: fall chisel disk, fall moldboard plow, no till, spring chisel disk, spring chisel no disk, spring cult.
//come back too.  none critical at this point. VALUE IS THE CURRENT TABLE VALUE. RECORD IS WHAT IS COMING FROM FIELD ARRAY
//Think I just figured it out. had to move the record.set blocks up above the ifs...check in the morning.
						/*
						if ((record.get('rotationVal') == 'cc' || record.get('rotationVal') == 'cg') && record.get('coverCropVal') == 'cc');
						{
							combo.setStore('tillageList_cashCrop');
						}
						if ((record.get('rotationVal') == 'cc' || record.get('rotationVal') == 'cg' || record.get('rotationVal') == 'dr' || record.get('rotationVal') == 'cso') && record.get('coverCropVal') == 'nc' );
						{
							combo.setStore('tillageList_noCoverCrop');
						}
						if ((record.get('rotationVal') == 'cc' || record.get('rotationVal') == 'cg' || record.get('rotationVal') == 'dr' || record.get('rotationVal') == 'cso') && (record.get('coverCropVal') == 'gcis' || record.get('coverCropVal') == 'gcds'));
						{
							combo.setStore('tillageList_crop_grazing');
						}
						if ((record.get('rotationVal') == 'dr' || record.get('rotationVal') == 'cso' ) && record.get('coverCropVal') == 'cc');
						{
							combo.setStore('tillageList_crop_grazing');
						}
						if (record.get('rotationVal') == 'ps');
						{
							combo.setStore('tillageList_newPasture');
						}*/
					}
				}
			}
		};
		//------------------------------------------------------------------------------
		//still need to find a way to turn off on contour for dry lot and pasture crop rotations
		let onContourColumn = {
			xtype: 'checkcolumn', text: 'On<br>Contour', dataIndex: 'onContour', width: 80, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24,
			/*renderer: function (value, meta,rec) {

				if (rec.get('rotationVal') == 'pt' || rec.get('rotationVal') == 'dl') {
					meta['tdCls'] = 'x-item-disabled';
				} else {
					meta['tdCls'] = '';
				}
				//return new Ext.ux.CheckColumn().renderer(value);
			},
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('rotationVal') == 'pt' || rec.get('rotationVal') == 'dl') {
					widget.setDisabled(true);
				} else {
					widget.setDisabled(false);
				}
			},*/
		};
		//------------------------------------------------------------------------------
		let fertPerc_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', minValue: 25, maxValue: 175, step: 5
			}, text: 'Percent<br>Fertilizer', dataIndex: 'fertPerc', width: 80, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let manuPerc_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', minValue: 25, maxValue: 175, step: 5
			}, text: 'Percent<br>Manure', dataIndex: 'manuPerc', width: 80, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let animalColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Animals', dataIndex: 'animals', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('coverCropVal') == 'cc' || rec.get('coverCropVal') == 'nc') {
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
						record.set('animalVal', value.get('value'));
						record.set('animalDisp', value.get('display'));
						me.getView().refresh();
					}
				}
			}
		};
		//------------------------------------------------------------------------------
		//Turn on for pasture only
		let grazeDairyLactating = {
			xtype: 'checkcolumn', text: 'Graze Dairy<br>Lactating', dataIndex: 'grazeDairyLactating', width: 100, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		//Turn on for pasture only
		let grazeDairyNonLactating = {
			xtype: 'checkcolumn', text: 'Graze Dairy<br>Non-Lactating', dataIndex: 'grazeDairyNonLactating', width: 120, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		//Turn on for pasture only
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

		let grassSpeciesColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Grass Species', dataIndex: 'grassSpeciesDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('rotationVal') == 'pt-cn' || rec.get('rotationVal') == 'pt-rt') {
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
		//------------------------------------------------------------------------------
		//turn on only for pasture and new pasture crop rotation
		let interseededCloverColumn = {
			xtype: 'checkcolumn', text: 'Interseeded<br>Clover', dataIndex: 'interseededClover', width: 125, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let grazeDensityColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Animal Density', dataIndex: 'grazingDensity', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {

				if (rec.get('rotationVal') == 'pt-cn' || rec.get('rotationVal') == 'pt-rt' || rec.get('rotationVal') == 'dl') {
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
				xtype:'numberfield', minValue: 25, maxValue: 175, step: 5
			}, text: 'Area', dataIndex: 'area', width: 80,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
        let perimeter_Column = {
			xtype: 'numbercolumn', format: '0.00',editor: {
				xtype:'numberfield', minValue: 25, maxValue: 175, step: 5
			}, text: 'Perimeter', dataIndex: 'perimeter', width: 80,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
        let fence_type_Column = {
			editor: 'textfield', text: 'Fence Type', dataIndex: 'fence_type', width: 120,
			draggable: false,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24,

		};
        let fence_cost_Column = {
			xtype: 'numbercolumn', format: '0.00',editor: {
				xtype:'numberfield', minValue: 0, maxValue: 100000000, step: 5
			}, text: 'Fence Cost', dataIndex: 'fence_cost', width: 160,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		let fence_unit_cost_Column = {
			xtype: 'numbercolumn', format: '0.00',editor: {
				xtype:'numberfield', minValue: 0, maxValue: 100000000, step: 5
			}, text: 'Fence Cost Per Ft', dataIndex: 'fence_unit_cost', width: 160,
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
				onContourColumn,
				fertPerc_Column,
				manuPerc_Column,
				//animalColumn,
				grazeDairyLactating,
				grazeDairyNonLactating,
				grazeBeefCattle,
				grassSpeciesColumn,
				interseededCloverColumn,
				//canManurePastures,
				grazeDensityColumn,
				area_Column,
				perimeter_Column,
				fence_type_Column,
				fence_cost_Column,
				fence_unit_cost_Column

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
