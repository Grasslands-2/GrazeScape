var selectedFields = []
var rotfreqcount = 0
DSS.utils.addStyle('.x-grid-widgetcolumn-cell-inner {padding-left: 0;padding-right: 0;}')
DSS.utils.addStyle('.combo-limit-borders {border-top: transparent; border-bottom: transparent}')
var deleteRecord = {};
var fieldArray = [];
var fieldObj = {};

//Sets new style to highlight selected field on the map.  OL stands for open layers
var selectInteraction = new ol.interaction.Select({
	features: new ol.Collection(),
	toggleCondition: ol.events.condition.never,
	//layers: [DSS.layer.fields_1],
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'white',
				width: 4
			}),
			fill: new ol.style.Fill({
				color: 'rgba(0,0,0,0.1)'
			}),
			text: new ol.style.Text({
				font: '12px Calibri,sans-serif',
				overflow: true,
				fill: new ol.style.Fill({
				  color: '#000',
				}),
				stroke: new ol.style.Stroke({
				  color: '#fff',
				  width: 2,
				}),
			}),
		})
});
// keep track of what fields have had values changed
var fieldChangeList= []
var fieldUrl =""

function refreshview(){
		Ext.getCmp("fieldTable").getView().refresh();
		console.log("refreshview")
}

//Used to refresh the list of selected fields for easy multi field edits
async function refreshSelectedFields(self, record, eOpts){
	selectedFields = []
	selectInteraction.getFeatures().clear()
	DSS.map.removeInteraction(selectInteraction);

	var selectedRecords = self.selected.items
	console.log(selectedRecords)
	for(r in selectedRecords){
		var pushedR = selectedRecords[r].id
		await selectedFields.push(pushedR)
	}
	console.log(selectedFields)
	DSS.map.addInteraction(selectInteraction);
	var fieldFeatures = await DSS.layer.fields_1.getSource().getFeatures();
	for(f in fieldFeatures){
		console.log(fieldFeatures[f].id_)
		for(r in selectedFields){
			console.log(selectedFields)
			if(fieldFeatures[f].id_ == selectedFields[r]){
				await selectInteraction.getFeatures().push(fieldFeatures[f]);
			}
		}
	}
}
//helper function for gatherTableData
function getWFSfields(parameter = '') {
    console.log("getting wfs fields")
    geoServer.getWFSfields(parameter)
}
//takes response from geoserver fields query and populates the fieldArray with response so that data can be presented and edited.
function popFieldsArray(obj) {
	for (i in obj){
		cropRot = ''
		if(obj[i].properties.rotation_disp == 'Pasture' && obj[i].properties.rotational_freq_disp == 'Continuous'){cropRot = 'pt-cn'}
		else if(obj[i].properties.rotation_disp == 'Pasture' && obj[i].properties.rotational_freq_disp != 'Continuous'){cropRot = 'pt-rt'}
		else{
			cropRot = obj[i].properties.rotation
		}
		fieldArray.push({
			id: obj[i].id,
			name: obj[i].properties.field_name,
			owningFarmid: obj[i].properties.owner_id,
			soilP: obj[i].properties.soil_p,
			soilOM: obj[i].properties.om,
			// rotationVal: obj[i].properties.rotation,
			rotationVal: cropRot,
			rotationDisp: obj[i].properties.rotation_disp,
			tillageVal: obj[i].properties.tillage,
			tillageDisp: obj[i].properties.tillage_disp,
			coverCropVal: obj[i].properties.cover_crop,
			coverCropDisp: obj[i].properties.cover_crop_disp,
			onContour: obj[i].properties.on_contour,
			fertPercP:obj[i].properties.perc_fert_p,
			manuPercP:obj[i].properties.perc_manure_p,
			fertPercN:obj[i].properties.perc_fert_n,
			manuPercN:obj[i].properties.perc_manure_n,
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
			fence_unit_cost:obj[i].properties.fence_unit_cost,
			landCost: obj[i].properties.land_cost
		});}
	console.log("DOne with popping fields")
}

function gatherTableData() {
	getWFSfields('&CQL_filter=scenario_id='+DSS.activeScenario);
//Data stores are set up to reflect options for fields in the app
};

Ext.create('Ext.data.Store', {
	storeId: 'rotationList',
	fields:[ 'display', 'value'],
	data: [
		{
			value: 'pt-cn',
			display: 'Pasture'
		},{
			value: 'dl',
			display: 'Dry Lot'
		},{ 
			value: 'cc',
			display: 'Continuous Corn'
		},{ 
			value: 'cg',
			display: 'Cash Grain (corn/soy)'
		},{ 
			value: 'dr',
			display: 'Corn Silage to Corn Grain to Alfalfa 3 yrs'
		},{ 
			value: 'cso',
			display: 'Corn Silage to Soybeans to Oats'
		}
	]
});

Ext.create('Ext.data.Store', {
	storeId: 'coverCrop',
	fields:[ 'display', 'value'],
	data: [
		{
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
	]
});

Ext.create('Ext.data.Store', {
	storeId: 'grassSpecies',
	fields:[ 'display', 'value'],
	data: [
		{
			value: 'Bluegrass-clover',
			display: 'Low Yielding'
		},{ 
			value: 'Timothy-clover',
			display: 'Medium Yielding'
		},{ 
			value: 'Orchardgrass-clover',
			display: 'High Yielding'
		}
	]
});

Ext.create('Ext.data.Store', {
	storeId: 'tillageList',
	fields:[ 'display', 'value'],
	data: [
		{
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
		}
	]
});

Ext.create('Ext.data.Store', {
	storeId: 'tillageList_cashCrop',
	fields:[ 'display', 'value'],
	data: [
		{
			value: 'nt',
			display: 'No-Till'
		},{ 
			value: 'su',
			display: 'Spring Cultivation'
		},{ 
			value: 'sn',
			display: 'Spring Chisel No Disk'
		}
	]
});

Ext.create('Ext.data.Store', {
	storeId: 'tillageList_crop_grazing',
	fields:[ 'display', 'value'],
	data: [
		{
			value: 'nt',
			display: 'No-Till'
		},{ 
			value: 'su',
			display: 'Spring Cultivation'
		},{ 
			value: 'sc',
			display: 'Spring Chisel + Disk'
		}
	]
});
Ext.create('Ext.data.Store', {
	storeId: 'tillageList_noCoverCrop',
	fields:[ 'display', 'value'],
	data: [
	{
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
		value: 'fc',
		display: 'Fall Chisel + Disk'
	},{ 
		value: 'fm',
		display: 'Fall Moldboard Plow'
	}
]
});

Ext.create('Ext.data.Store', {
	storeId: 'tillageList_newPasture',
	fields:[ 'display', 'value'],
	data: [
	{
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
		value: 'fc',
		display: 'Fall Chisel + Disk'
	},{ 
		value: 'fm',
		display: 'Fall Moldboard Plow'
	}
]
});

Ext.create('Ext.data.Store', {
	storeId: 'grazingDensityDL',
	fields:[ 'display', 'value'],
	data: [
	{
		value: 'hi',
		display: 'high'
	},{ 
		value: 'lo',
		display: 'low'
	},{
		value: 'na',
		display: 'Not Applicable'
	}
]
});

Ext.create('Ext.data.Store', {
	storeId: 'grazingDensityPT',
	fields:[ 'display', 'value'],
	data: [
	{
		value: 'hi',
		display: 'high'
	},{ 
		value: 'lo',
		display: 'low'
	}
]
});

Ext.create('Ext.data.Store', {
	storeId: 'rotationFreq',
	fields:['display', 'value'],
	data: [
	{
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
	}
]
});

//-----------------------------------fieldStore!---------------------------------
//Data store for the grid that gets applied to each field
Ext.create('Ext.data.Store', {
	storeId: 'fieldStore',
	alternateClassName: 'DSS.FieldStore',
	fields:[ 'name', 'soilP', 'soilOM', 'rotationVal', 'rotationDisp', 'tillageVal', 
	'tillageDisp', 'coverCropDisp', 'coverCropVal',
		'onContour','fertPercP','manuPercP','fertPercN','manuPercN','grassSpeciesVal','grassSpeciesDisp',
		'interseededClover','grazeDensityVal','grazeDensityDisp','manurePastures', 'grazeDairyLactating',
		'grazeDairyNonLactating', 'grazeBeefCattle','area', 'perimeter','fence_type',
        'fence_cost','fence_unit_cost','rotationFreqVal','rotationFreqDisp','landCost'],
		sorters: ['name'],
	data: fieldArray
});
Ext.define('DSS.field_grid.FieldGrid', {
    extend: 'Ext.grid.selection.Selection',
    requires: [
        'Ext.util.Collection',
		'Ext.ux.ExportableGrid'
    ],
 
    type: 'rows',
});
let exportButton = {
	xtype: 'button',
	text: 'Export Table',
	handler: function (self) {
		console.log("field table exported")
		console.log(this)
		console.log(self)
		console.log(Ext.getCmp("fieldTable"))
		Ext.getCmp("fieldTable").export('mygrid');
	}
}
//------------------------------------------------------------------------------
Ext.define('DSS.field_grid.FieldGrid', {
	//------------------------------------------------------------------------------
	//extend: 'Ext.grid.Panel',
	//Imported sub extention of grid panel for extjs.  It can be downloaded as a exportable table.
	extend: 'Ext.ux.ExportableGrid',
	alias: 'widget.field_grid',
	alternateClassName: 'DSS.FieldGrid',
	singleton: true,	
	autoDestroy: false,
	id: "fieldTable",
	hidden: true,
	columnLines: true,
	rowLines: true,
	selModel: {
		allowDeselect: true,
		selType: "cellmodel",
		mode: 'MULTI'
	},
	
	height: 0,
	internalHeight: 200,
	isAnimating: false,
	resizable: true,
	resizeHandles: 'n',
	store: Ext.data.StoreManager.lookup('fieldStore'),
	dockedItems: [{
		xtype: 'toolbar',
		dock: 'bottom',
		items: [
			{
				xtype: 'button',
				text: 'Select All Fields',
				disabled: true,
				handler: function (self) {
					selectedFields = []
					Ext.getCmp("fieldTable").getView().refresh();
					Ext.getCmp("fieldTable").getSelectionModel().selectAll();
				}
			},
			{
				xtype: 'button',
				text: 'Deselect All Fields',
				disabled: true,
				handler: function (self) {
					selectedFields = []
					Ext.getCmp("fieldTable").getView().refresh();
					Ext.getCmp("fieldTable").getSelectionModel().deselectAll();
				}
			},
			{
				//refreshes the fields view and saves changes
				xtype: 'button',
				text: 'Refresh',
				handler: async function (self) {
					await runFieldUpdate()
					selectedFields = []
					Ext.getCmp("fieldTable").getView().refresh();
				}
			},
			{
				//The reason for the exportable grid extension.  Exports a csv of the current fields table
				xtype: 'button',
				text: 'Export Table',
				handler: function (self) {
					console.log("field table exported")
					Ext.getCmp("fieldTable").export('Field Table');
					selectedFields = []
					Ext.getCmp("fieldTable").getView().refresh();
					Ext.getCmp("fieldTable").getSelectionModel().deselectAll();
				}
			}]
		},
	],
	minHeight: 40,
	maxHeight: 600,
	listeners: {
		resize: function(self, newW, newH, oldW, oldH) {
			if (!self.isAnimating) self.internalHeight = newH;
		},
		select: function (self,record,eOpts) {
			console.log("Record Selected")
			refreshSelectedFields(self, record, eOpts)
			
		},
		deselect: function (self,record,eOpts) {
			console.log("Record DESelected")
			refreshSelectedFields(self, record, eOpts)
		
		},
		rowclick: function(self,record,eOpts){
			console.log("Record rowclick")
			//console.log(self.selected.items[0].id)
			console.log(record.id)
			deleteRecord = record;
			// refreshSelectedFields(self, record, eOpts)
		// 	setTimeout(() => {
		// 		this.getView().refresh()
		// }, "250")
			// DSS.map.addInteraction(selectInteraction);
			// console.log("ROWcd d CLICK")
			// var fieldFeatures = DSS.layer.fields_1.getSource().getFeatures();
			// for(f in fieldFeatures){
			// 	console.log(fieldFeatures[f].id_)
			// 	if(fieldFeatures[f].id_ == record.id){
			// 		selectInteraction.getFeatures().clear()
			// 		selectInteraction.getFeatures().push(fieldFeatures[f]);
			// 		console.log(selectInteraction.getFeatures())
			// 		//DSS.map.removeInteraction(selectInteraction);
			// 		break;
			// 	}
			// }
		},
		// cellclick: function(self,record,eOpts){
		// 	Ext.getCmp("fieldTable").getView().refresh()
			
		// 	//console.log(self.selected.items[0].id)
		// 	console.log("cell click")
		// 	console.log(record.id)
		// 	deleteRecord = record;
		// 	//refreshSelectedFields(self, record, eOpts)
		// }
		
	},
	//requires: ['DSS.map.Main'],
	
	initComponent: function() {
		console.log("INITCOMPONENT FROM FIELDGRID RAN!!!!!")
		let me = this;
		
		let fieldNameColumn = { 
			editor: 'textfield', text: 'Field', dataIndex: 'name', width: 120, 
			locked: true, draggable: false, editable: true,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24,
			tooltip: '<b>Field Name:</b> Can be editted and relabeled here.',
		};

		let soilP_Column = {
			xtype: "numbercolumn",
			format: "0.0",
			editor: {
				xtype: "numberfield",
				minValue: 25,
				maxValue: 175,
				step: 5,
			},
			text: "Soil-P (PPM)",
			dataIndex: "soilP",
			width: 100,
			tooltip: "<b>Soil Phosphorus:</b> Measured in parts per million.",
			hideable: false,
			enableColumnHide: false,
			lockable: false,
			minWidth: 24,
		};

		let landCost_Column = {
			xtype: "numbercolumn",
			format: "0.0",
			editor: {
				xtype: "numberfield",
				minValue: 0,
				maxValue: 10000,
				step: 5,
			},
			text: "Land Cost ($/ac)",
			dataIndex: "landCost",
			width: 120,
			tooltip:
				"<b>Land Cost:</b> How much does each field cost to rent or own per acre",
			hideable: false,
			enableColumnHide: false,
			lockable: false,
			minWidth: 24,
			formatter: "usMoney",
    	};

		let soilOM_Column = {
			xtype: "numbercolumn",
			format: "0.00",
			editor: {
				xtype: "numberfield",
				minValue: 0,
				maxValue: 60,
				step: 0.5,
				disabled: false,
			},
			text: "Soil-OM (%)",
			dataIndex: "soilOM",
			width: 100,
			tooltip: "<b>Soil Organic Matter</b> Measured in percent of soil make up",
			hideable: false,
			enableColumnHide: false,
			lockable: false,
			minWidth: 24,
		};

		let cropRotationColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Crop Rotation', dataIndex: 'rotationDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			tooltip: '<b>Crop Rotation</b> Which crop rotation is being grown in each field.',
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'rotationList',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: async function(combo, value, rec){
						console.log("Selected")
						console.log(value.data.value)
						console.log(rec)
						var record = combo.getWidgetRecord();
						console.log(record)
						console.log(record.data.interseededClover)
						interseedTrue = true
						fertDefaultArray = await get_field_rot_defaults({"rotation": value.get('value'),/*interseedTrue*/ "legume":record.data.interseededClover})
						
						if(value.data.value.includes('pt')){
							console.log('pt hit')
//							if(record.data.rotationFreqDisp == 'Continuous'){
//								record.set('rotationVal','pt-cn')
//								record.set('rotationDisp', value.get('display'));
//								record.set('manuPercN',fertDefaultArray.fertDefaults[0])
//								record.set('fertPercN',fertDefaultArray.fertDefaults[1])
//								record.set('fertPercP',fertDefaultArray.fertDefaults[2])
//								record.set('interseededClover',true)
//								console.log('pt-cn')
//
//							}else{
//								record.set('rotationVal','pt-rt')
//								record.set('rotationDisp', value.get('display'));
//								record.set('manuPercN',fertDefaultArray.fertDefaults[0])
//								record.set('fertPercN',fertDefaultArray.fertDefaults[1])
//								record.set('fertPercP',fertDefaultArray.fertDefaults[2])
//								record.set('interseededClover',true)
//								console.log('pt-rt')
//							}
                            console.log("Select value", value)
							record.set('rotationVal','pt-rt')
                            record.set('rotationDisp', value.get('display'));
                            record.set('manuPercN',fertDefaultArray.fertDefaults[0])
                            record.set('fertPercN',fertDefaultArray.fertDefaults[1])
                            record.set('fertPercP',fertDefaultArray.fertDefaults[2])
                            record.set('interseededClover',true)
                            record.set('grassSpeciesVal', "Timothy-clover")
                            record.set('grassSpeciesDisp',"Medium Yielding")
                            record.set('rotationFreqVal',1)
                            record.set('rotationFreqDisp',"Once a day")
//                            console.log('pt-cn')
							console.log(record)
						} 
						else if(value.data.value.includes('dl')){
							record.set('rotationVal', value.get('value'));
							record.set('rotationDisp', value.get('display'));
							record.set('manuPercN',fertDefaultArray.fertDefaults[0])
							record.set('fertPercN',fertDefaultArray.fertDefaults[1])
							record.set('fertPercP',fertDefaultArray.fertDefaults[2])
							console.log("DL")
							console.log(NmanuPerc_Column)
						}
						else{
							record.set('rotationVal', value.get('value'));
							record.set('rotationDisp', value.get('display'));
							record.set('manuPercN',fertDefaultArray.fertDefaults[0])
							record.set('fertPercN',fertDefaultArray.fertDefaults[1])
							record.set('fertPercP',fertDefaultArray.fertDefaults[2])
						}
						refreshview()
					},					
				}
			}
		};
		

		//------------------------------------------------------------------------------
		let coverCropColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Cover Crop', 
			dataIndex: 'coverCropDisp', 
			width: 200, 
			hideable: false, 
			enableColumnHide: false, 
			lockable: false, 
			minWidth: 24, 
			sortable: true,
			tooltip: '<b>Cover Crop</b> Which cover crop is being grown on each field during the none growing season',
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('rotationVal') == 'ps' || rec.get('rotationVal') == 'pt-cn' || rec.get('rotationVal') == 'pt-rt' || rec.get('rotationVal') == 'dl') {
					widget.setDisabled(true);
				}
				 else {
					widget.setDisabled(false);
				}
			},
			exportable: true, 
			exportConverter: function(self){
				return self;
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
						refreshview()
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
			tooltip: '<b>Tillage</b> Which tillage practice is being used on each field',
			onWidgetAttach: function(col, widget, rec) {
				//widget turned off
				if (rec.get('rotationVal') == 'pt-cn' || rec.get('rotationVal') == 'pt-rt'|| rec.get('rotationVal') == 'dl') {
					widget.setDisabled(true);
				}

				//tillage options for new pasture
				else if(rec.get('rotationVal') == 'ps'){
					widget.setDisabled(false);
					widget.setStore('tillageList_newPasture')
				}
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
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
				select: async function(combo, value, eOpts){
						var record = combo.getWidgetRecord();
						record.set('tillageVal', value.get('value'));
						record.set('tillageDisp', value.get('display'));
					},
				}
			}
		};
		
		let onContourColumn = {
			xtype: 'widgetcolumn', 
			text: 'On Contour', 
			dataIndex: 'onContour', 
			width: 100,
			editor:{},
			tooltip: '<b>Tillage On Contour</b> Was this field tillage along the contour of the land or not? Checked if yes, blank if no.',
			hideable: false, 
			enableColumnHide: false, 
			lockable: false, 
			minWidth: 24,
			listeners:{
				afterrender: function(self){
					self.setAlign('center')
				},
			},
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
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
			widget: {
				xtype: 'checkbox',
				defaultBindProperty: 'onContour',
				queryMode: 'local',
				floating: false,
				padding: '0 0 0 30',
				listeners:{
					change: async function(widget,value){
						var record = widget.getWidgetRecord();
						record.set('onContour', !!value);
					}
				}
			}
		};

		let PfertPerc_Column = {
			xtype: "numbercolumn",
			id: "PfertPerc",
			format: "0.0",
			editor: {
				xtype: "numberfield",
				maxValue: 150,
				step: 5,
				minValue: 0,
			},
			text: "% Fert P",
			dataIndex: "fertPercP",
			width: 80,
			tooltip:
				"<b>Percent Phosphorus Fertilizer</b> Enter the amount of fertilizer P applied to the crop rotation as a percentage of the P removed by the crop rotation harvest (e.g., value of 100 means that P inputs and outputs are balanced).",
			hideable: true,
			enableColumnHide: true,
			lockable: false,
			minWidth: 24,
		};

		let NfertPerc_Column = {
			xtype: "numbercolumn",
			id: "NfertPerc",
			format: "0.0",
			editor: {
				xtype: "numberfield",
				maxValue: 150,
				step: 5,
				minValue: 0,
			},
			text: "% Fert N",
			dataIndex: "fertPercN",
			width: 80,
			tooltip:
				"<b>Percent Nitrogen Fertilizer</b> Enter the amount of fertilizer N applied to the crop rotation as a percentage of the N recommended based on UW-Extension guidelines (A2809). For example, a value of 100% would indicate that N applications are identical to recommendations.",
			hideable: true,
			enableColumnHide: true,
			lockable: false,
			minWidth: 24,
    	};

		//Change to manupercP
		let NmanuPerc_Column = {
			xtype: "numbercolumn",
			format: "0.0",
			editor: {
				xtype: "numberfield",
				maxValue: 150,
				step: 5,
				minValue: 0,
			},
			text: "% Manure N",
			dataIndex: "manuPercN",
			width: 110,
			tooltip:
				"<b>Percent Nitrogen Manure</b> Enter the amount of manure N applied to the crop rotation as a percentage of the N recommended based on UW-Extension guidelines (A2809) (for legumes, the percentage is based on manure N allowable). For example, a value of 100% would indicate that N applications are identical to recommendations. Note that in grazed systems, manure N is already applied and does not need to be accounted for here.",
			hideable: true,
			enableColumnHide: true,
			lockable: false,
			minWidth: 24,
    	};
		//------------------------------------------------------------------------------
		//Turn on for pasture only
		//Add fertpectN and manuPercN 
		//fertpectN maxValue to 200
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
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
			widget: {
				xtype: 'checkbox',
				padding: '0 0 0 30',
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
			xtype: 'widgetcolumn', text: 'Non-Lactating', dataIndex: 'grazeDairyNonLactating', width: 100, editor:{},
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
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
			widget: {
				xtype: 'checkbox',
				padding: '0 0 0 30',
				defaultBindProperty: 'grazeDairyNonLactating',
				queryMode: 'local',
				listeners: {
					change: function(widget,value){
					console.log("you've changed man graze non lac")
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
			xtype: 'widgetcolumn', text: 'Beef Cattle', dataIndex: 'grazeBeefCattle', width: 100, editor:{},
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
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
			widget: {
				xtype: 'checkbox',
				padding: '0 0 0 30',
				defaultBindProperty: 'grazeBeefCattle',
				queryMode: 'local',
				listeners: {
					change: function(widget,value){
					console.log("you've changed man graze beef")
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
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
			widget: {
				xtype: 'checkbox',
				padding: '0 0 0 30',
				defaultBindProperty: 'manurePastures',
				queryMode: 'local',
				listeners: {
					change: function(widget,value){
					console.log("you've changed man graze manure")
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
			text: 'Grass Species', dataIndex: 'grassSpeciesDisp', width: 150, tooltip: '<b>Low Yielding:</b> Italian ryegrass, Kentucky bluegrass, Quackgrass, Meadow fescue (older varieties)\n<b>Medium Yielding:</b> Meadow fescue (newer varieties), Smooth bromegrass, Timothy, Perennial ryegrass\n<b>High Yielding:</b> Orchardgrass, Reed canary grass, Tall fescue, Festulolium, Hybrid and Meadow bromegrass',
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('rotationVal') == 'pt-cn' || rec.get('rotationVal') == 'pt-rt' || rec.get('rotationVal') == 'ps') {
					widget.setDisabled(false);
				} else {
					widget.setDisabled(true);
				}
			},
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'grassSpecies',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: async function(combo, value, eOpts){
						var record = combo.getWidgetRecord();
						record.set('grassSpeciesVal', value.get('value'));
						record.set('grassSpeciesDisp', value.get('display'));
					},
				}
			}
		};
		let rotationalFreqColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Rotational Frequency', dataIndex: 'rotationFreqDisp', width: 150, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			tooltip: '<b>Pasture Rotational Frequency</b> How often are animals rotated on and off any given pasture',
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('rotationDisp') == 'Pasture' ) {
					widget.setDisabled(false);
				}
				 else {
					widget.setDisabled(true);
				}
			},
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				store: 'rotationFreq',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				queryMode: 'local',
				listeners:{
					select: async function(combo, value, eOpts){
						console.log("rotationFreq selected")
						var record = combo.getWidgetRecord();
						record.set('rotationFreqVal', value.get('value'));
						record.set('rotationFreqDisp', value.get('display'));
						refreshview()
					},
				}
			}
		};
		//------------------------------------------------------------------------------
		//turn on only for pasture and new pasture crop rotation
		let interseededCloverColumn = {
			xtype: 'widgetcolumn', 
			text: 'Interseeded Legume', 
			dataIndex: 'interseededClover', 
			width: 145, 
			editor:{},
			hideable: true, 
			enableColumnHide: true, 
			lockable: false, 
			minWidth: 24,
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
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
			widget: {
				xtype: 'checkbox',
				padding: '0 0 0 50',
				defaultBindProperty: 'interseededClover',
				queryMode: 'local',
				listeners: {
					change: async function(widget,value){
						var record = widget.getWidgetRecord();
						fertDefaultArray = await get_field_rot_defaults({"rotation": record.data.rotationVal, "legume":value})
						
						record.set('interseededClover', !!value)

						record.set('manuPercN',fertDefaultArray.fertDefaults[0])
						record.set('fertPercN',fertDefaultArray.fertDefaults[1])
						record.set('fertPercP',fertDefaultArray.fertDefaults[2])
					}
				}
			},
			tooltip: '<b>Interseeded Legumes:</b> Are you planting nitrogen fixing legumes like clover.',
		};

		let grazeDensityColumn = {
			xtype: 'widgetcolumn',
			editor: {},
			text: 'Animal Density', 
			dataIndex: 'grazeDensityDisp', 
			minWidth: 24, 
			width: 110, 
			hideable: false, 
			enableColumnHide: false, 
			lockable: false, 
			sortable: true,
			tooltip: '<b>Grazing Density</b> How intensely are the pastures getting grazed',
			onWidgetAttach: function(col, widget, rec) {
				if(rec.get('rotationVal') == 'dl' ) {
					widget.setStore('grazingDensityDL')
					widget.setDisabled(false);
				} else if(rec.get('rotationFreqDisp') == 'Continuous' && rec.get('rotationDisp') == 'Pasture') {
					widget.setStore('grazingDensityPT')
					widget.setDisabled(false);
				}
				else {
					widget.setDisabled(true);
				}
			},
			exportable: true, 
			exportConverter: function(self){
				return self
			},
			widget: {
				xtype: 'combobox',
				queryMode: 'local',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: function(combo, value, eOpts){
						var record = combo.getWidgetRecord();
						record.set('grazeDensityVal', value.get('value'));
						record.set('grazeDensityDisp', value.get('display'));
					},
				}
			}
		};

        let area_Column = {
			xtype: 'numbercolumn', 
			format: '0.0',
			text: 'Area (acres)', 
			dataIndex: 'area', 
			width: 90,
			editable: false,
			hideable: false, 
			enableColumnHide: false, 
			lockable: false, 
			minWidth: 24,
			tooltip: '<b>Area:</b> Area in acres',
		};

		let delete_Column = 
		{
			xtype: 'actioncolumn',
			width: 110,
			text: 'Delete Field',
			scale: 'large',
			align: 'center',
			tooltip: '<b>Delete Field:</b> Click the button to delete a field',
			items: [{
				icon: '/static/grazescape/public/images/remove-icon-png-7116.png',
				text:'Delete Field',
				tooltip: 'Delete',
				handler: function(grid, rowIndex) {
					const recordToDelete = grid.store.data.items[rowIndex];
					selectedFields = []
					Ext.getCmp("fieldTable").getView().refresh();
					Ext.getCmp("fieldTable").getSelectionModel().deselectAll();

					DSS.layer.fields_1.getSource().forEachFeature(function(f) {
						if(recordToDelete.id == f.id_){
							selectedField = f
							DSS.dialogs.FieldDeletePanel = Ext.create('DSS.field_shapes.Delete'); 		
							DSS.dialogs.FieldDeletePanel.show().center().setY(100);
						}
					})
				},
				scope: this
			}]
		}
		
		Ext.applyIf(me, {

			columns: [
				fieldNameColumn,
				area_Column,
				soilP_Column,
				soilOM_Column,
				cropRotationColumn,
				coverCropColumn,
				tillageColumn,
				onContourColumn,
				NmanuPerc_Column,
				//PmanuPerc_Column,
				NfertPerc_Column,
				PfertPerc_Column,
				//grazeDairyLactatingColumn,
				//grazeDairyNonLactatingColumn,
				//grazeBeefCattleColumn,
				grassSpeciesColumn,
				rotationalFreqColumn,
				interseededCloverColumn,
				//manurePasturesColumn,
				grazeDensityColumn,
				//perimeter_Column
				landCost_Column,
				delete_Column,
			],
			
			plugins: [{
				ptype: 'cellediting',
				clicksToEdit: 1,
				listeners: {
					beforeedit: function(editor, context, eOpts) {
						if (context.column.widget) return false
					}
				}
			}]
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
	},
});