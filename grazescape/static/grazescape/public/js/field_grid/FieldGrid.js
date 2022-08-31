
var selectedFields = []
var rotfreqcount = 0
DSS.utils.addStyle('.x-grid-widgetcolumn-cell-inner {padding-left: 0;padding-right: 0;}')
DSS.utils.addStyle('.combo-limit-borders {border-top: transparent; border-bottom: transparent}')
var deleteRecord = {};
var fieldArray = [];
var fieldObj = {};
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

function refreshSelectedFields(self, record, eOpts){
	selectedFields = []
			selectInteraction.getFeatures().clear()
			DSS.map.removeInteraction(selectInteraction);
			console.log(self)
			console.log(record)
			console.log(eOpts)
			console.log(record.id)
			var selectedRecords = self.selected.items
			console.log(selectedRecords)
			for(r in selectedRecords){
				var pushedR = selectedRecords[r].id
				selectedFields.push(pushedR)
			}
			console.log(selectedFields)
			DSS.map.addInteraction(selectInteraction);
			var fieldFeatures = DSS.layer.fields_1.getSource().getFeatures();
			for(f in fieldFeatures){
				console.log(fieldFeatures[f].id_)
				for(r in selectedFields){
					if(fieldFeatures[f].id_ == selectedFields[r]){
						selectInteraction.getFeatures().push(fieldFeatures[f]);
					}
				}
			}
			Ext.getCmp("fieldTable").getView().refresh();
}

function getWFSfields(parameter = '') {
    console.log("getting wfs fields")
    geoServer.getWFSfields(parameter)

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
	});
	console.log("DOne with popping fields")
}

//empty array to catch feature objects 
function gatherTableData() {
	console.log(fieldUrl)
	console.log("gatherTableData ran");
	console.log(fieldArray);
	//getRotAcrage(fieldArray);
	console.log(pastAcreage);
	console.log(cropAcreage);

	getWFSfields('&CQL_filter=scenario_id='+DSS.activeScenario);

};
// Ext.create('Ext.Button', {
// 	text: 'Export',
// 	renderTo: Ext.getBody(),
// 	handler: function () {
// 		grid.export('mygrid');
// 	}
// });
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
		display: 'Low Yielding'
	},{ 
		value: 'Timothy-clover',
		display: 'Medium Yielding'
	},{ 
		value: 'Orchardgrass-clover',
		display: 'High Yielding'
	},]
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
		value: 'fc',
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
		value: 'fc',
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
 
    // /**
    //  * @property {Boolean} isRows 
    //  * This property indicates the this selection represents selected rows.
    //  * @readonly
    //  */
    // isRows: true,
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
	extend: 'Ext.ux.ExportableGrid',
	alias: 'widget.field_grid',
	alternateClassName: 'DSS.FieldGrid',
	singleton: true,	
	autoDestroy: false,
	id: "fieldTable",
	hidden: true,
	selModel: {
		allowDeselect: true,
		selType: "rowmodel",//'checkboxmodel', // rowmodel is the default selection model
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
		// 	{
		// 	xtype: 'button',
		// 	text: 'Deselect All Fields',
		// 	handler: function (self) {
		// 		selectedFields = []
		// 		console.log(Ext.getCmp("fieldTable").selected.items)
		// 		Ext.getCmp("fieldTable").selected.items.length = 0
		// 		selectInteraction.getFeatures().clear()
		// 		DSS.map.removeInteraction(selectInteraction);
		// 		Ext.getCmp("fieldTable").getView().refresh();
		// 	}
		// },
		{
			xtype: 'button',
			text: 'Save Changes',
			handler: function (self) {
				runFieldUpdate()
				Ext.getCmp("fieldTable").getView().refresh();
			}
		},
		{
			xtype: 'button',
			text: 'Export Table',
			handler: function (self) {
				console.log("field table exported")
				Ext.getCmp("fieldTable").export('Field Table');
			}
		}]
	},
],
	
	minHeight: 40,
	maxHeight: 600,
	listeners: {
		hide: function(self, newW, newH, oldW, oldH) {
			console.log("Field Grid hide")
		},
		resize: function(self, newW, newH, oldW, oldH) {
			if (!self.isAnimating) self.internalHeight = newH;
		},
		update: function (self,record) {
			console.log("UPDATE HAPPENED!")
		    console.log(self,record)
			setTimeout(() => {
				this.getView().refresh()
		}, "1000")
		},
		select: function (self,record,eOpts) {
			console.log("Record Selected")
			refreshSelectedFields(self, record, eOpts)
			
		},
		deselect: function (self,record,eOpts) {
			console.log("Record DESelected")
			refreshSelectedFields(self, record, eOpts)
		
		},
		rowclick: function(self,record){
			//console.log(self.selected.items[0].id)
			//console.log(record.id)
			deleteRecord = record;
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
	},
	//requires: ['DSS.map.Main'],

	//-----------------------------------------------------
	
	initComponent: function() {
		console.log("INITCOMPONENT FROM FIELDGRID RAN!!!!!")
		let me = this;
		
		//------------------------------------------------------------------------------
		let fieldNameColumn = { 
			editor: 'textfield', text: 'Field', dataIndex: 'name', width: 120, 
			locked: true, draggable: false, editable: true,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24,

		};
		//------------------------------------------------------------------------------
		let soilP_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', minValue: 25, maxValue: 175, step: 5,
				listeners:{
					change: function(field,newValue,oldValue,record){
							console.log(selectedFields)
							console.log("newValue: " + newValue)
							console.log("oldValue: " + oldValue)
							console.log("you've changed man on landCost")
							var store = me.getStore()
							var storeDataObjArray = store.data.items
							if(selectedFields.length > 0 ){
								for(r in selectedFields){
									for(f in storeDataObjArray){
										if(selectedFields[r] == storeDataObjArray[f].id && selectedFields[r] != record.id){
											console.log("newValue: " + newValue)
											console.log(storeDataObjArray[f].id)
											console.log(selectedFields[r])
											storeDataObjArray[f].dirty = true
											storeDataObjArray[f].data.soilP = newValue
										}
									}
								}
							// 	setTimeout(() => {
							// 		me.getView().refresh()
							// }, "250")
							}
							var view = me.getView()
							//view.refresh()
					}
				}
			}, text: 'Soil-P', dataIndex: 'soilP', width: 80, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let landCost_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', minValue: 0, maxValue: 10000, step: 5,
				listeners:{
					change: function(field,newValue,oldValue,record){
							console.log(selectedFields)
							console.log("newValue: " + newValue)
							console.log("oldValue: " + oldValue)
							console.log("you've changed man on landCost")
							var store = me.getStore()
							var storeDataObjArray = store.data.items
							if(selectedFields.length > 0 ){
								for(r in selectedFields){
									for(f in storeDataObjArray){
										if(selectedFields[r] == storeDataObjArray[f].id && selectedFields[r] != record.id){
											console.log("newValue: " + newValue)
											console.log(storeDataObjArray[f].id)
											console.log(selectedFields[r])
											storeDataObjArray[f].dirty = true
											storeDataObjArray[f].data.landCost = newValue
										}
									}
								}
							// 	setTimeout(() => {
							// 		me.getView().refresh()
							// }, "250")
						}
					}
				}
			}, text: 'Land Cost ($/ac)', dataIndex: 'landCost', width: 80, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let soilOM_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
			xtype:'numberfield', minValue: 0, maxValue: 60, step: 0.5, disabled: false,
				listeners:{
					change: function(field,newValue,oldValue,record){
							console.log(selectedFields)
							console.log("newValue: " + newValue)
							console.log("oldValue: " + oldValue)
							console.log("you've changed man on soilOM")
							var store = me.getStore()
							var storeDataObjArray = store.data.items
							if(selectedFields.length > 0 ){
								for(r in selectedFields){
									for(f in storeDataObjArray){
										if(selectedFields[r] == storeDataObjArray[f].id && selectedFields[r] != record.id){
											console.log("newValue: " + newValue)
											console.log(storeDataObjArray[f].id)
											console.log(selectedFields[r])
											storeDataObjArray[f].dirty = true
											storeDataObjArray[f].data.soilOM = newValue
										}
									}
								}
							// 	setTimeout(() => {
							// 		me.getView().refresh()
							// }, "250")
							}
							var view = me.getView()
							//view.refresh()
					}
				}
			}, text: 'Soil-OM', dataIndex: 'soilOM', width: 80, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		let cropRotationColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			
			text: 'Crop Rotation', dataIndex: 'rotationDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
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
					select: function(combo, value, rec){
						console.log("Selected")
						console.log(value)
						console.log(rec)
						var record = combo.getWidgetRecord();
						record.set('rotationVal', value.get('value'));
						record.set('rotationDisp', value.get('display'));
						me.getView().refresh();
					},
					change: function(widget,newValueCR,oldValueCR,record){
						console.log(widget)
						var record = widget.getWidgetRecord();
						var dbvalCR = ""
						console.log(selectedFields)
						console.log("newValueCR: " + newValueCR)
						console.log("oldValueCR: " + oldValueCR)
						console.log("you've changed man on Crop Rot")
						//console.log(rotfreqcount)
						console.log(record)
						var store = me.getStore()
						var storeDataObjArray = store.data.items
						var view = me.getView()
						switch(newValueCR){
							case 'Continuous Pasture': dbvalCR = 'pt-cn'
							break;
							case 'Rotational Pasture': dbvalCR = 'pt-rt'
							break;
							case 'Dry Lot': dbvalCR = 'dl'
							break;
							case 'Continuous Corn': dbvalCR = 'cc'
							break;
							case 'Cash Grain (cg/sb)': dbvalCR = 'cg'
							break;
							case 'Corn Silage to Corn Grain to Alfalfa(3x)': dbvalCR = 'dr'
							break;
							case 'Corn Silage to Soybeans to Oats': dbvalCR = 'cso'
							break;

							case 'pt-cn': dbvalCR = 'pt-cn'
							break;
							case 'pt-rt': dbvalCR = 'pt-rt'
							break;
							case 'dl': dbvalCR = 'dl'
							break;
							case 'cc': dbvalCR = 'cc'
							break;
							case 'cg': dbvalCR = 'cg'
							break;
							case 'dr': dbvalCR = 'dr'
							break;
							case 'cso': dbvalCR = 'cso'
							break;
							default: dbvalCR = 'No Rotation fROM SWITCH!'
						}
						console.log("dbvalCR: " + dbvalCR)
						if(selectedFields.length > 0 ){
							for(r in selectedFields){
								for(f in storeDataObjArray){
									if(selectedFields[r] == storeDataObjArray[f].id && selectedFields[r] != record.id){
										console.log("newValueCR: " + newValueCR)
										console.log("dbvalCR: " + dbvalCR)
										console.log(storeDataObjArray[f].id)
										console.log(selectedFields[r])
										storeDataObjArray[f].dirty = true
										storeDataObjArray[f].data.rotationDisp = newValueCR
										storeDataObjArray[f].data.rotationVal = dbvalCR
										
									}
								}
							}
						}
						console.log("End of Rot Crop change event")
						//runFieldUpdate()
						setTimeout(() => {
							me.getView().refresh()
					}, "250")
						//console.log(store)
						
					}
				}
			}
		};
		// console.log(me.view.dataSource.config.data[0].rotationDisp)
						// if(newValue == 'Continuous Pasture'){
						// 	dbval = 'pt-cn'
						// }
						// if(newValue == 'Rotational Pasture'){
						// 	dbval = 'pt-rt'
						// }
						// if(newValue == 'Dry Lot'){
						// 	dbval = 'dl'
						// }
						// if(newValue == 'Continuous Corn'){
						// 	dbval = 'cc'
						// }
						// if(newValue == 'Cash Grain (cg/sb)'){
						// 	dbval = 'cg'
						// }
						// if(newValue == 'Corn Silage to Corn Grain to Alfalfa(3x)'){
						// 	dbval = 'dr'
						// }
						// if(newValue == 'Corn Silage to Soybeans to Oats'){
						// 	dbval = 'cso'
						// }

						//if(rotfreqcount > storeDataObjArray.length){

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
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
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
					},
					change: function(widget,newValueCC,oldValueCC,record){
						var record = widget.getWidgetRecord();
						var dbvalCC = ""
						console.log(selectedFields)
						console.log("newValueCC: " + newValueCC)
						console.log("oldValueCC: " + oldValueCC)
						console.log("you've changed man on Crop Rot")
						//console.log(rotfreqcount)
						console.log(record)
						var store = me.getStore()
						var storeDataObjArray = store.data.items
						var view = me.getView()
						switch(newValueCC){
							case 'Small Grain': dbvalCC = 'cc'
							break;
							case 'Grazed/Interseeded': dbvalCC = 'gcis'
							break;
							case 'Grazed/Direct Seeded': dbvalCC = 'gcds'
							break;
							case 'No Cover': dbvalCC = 'nc'
							break;
							

							case 'cc': dbvalCC = 'cc'
							break;
							case 'gcis': dbvalCC = 'gcis'
							break;
							case 'gcds': dbvalCC = 'gcds'
							break;
							case 'nc': dbvalCC = 'nc'
							break;
							
							default: dbvalCC = 'No Cover Crop fROM SWITCH!'
						}
						console.log("dbvalCC: " + dbvalCC)
						if(selectedFields.length > 0 ){
							for(r in selectedFields){
								for(f in storeDataObjArray){
									if(selectedFields[r] == storeDataObjArray[f].id && selectedFields[r] != record.id){
										console.log("newValueCC: " + newValueCC)
										console.log("dbvalCC: " + dbvalCC)
										console.log(storeDataObjArray[f].id)
										console.log(selectedFields[r])
										storeDataObjArray[f].dirty = true
										storeDataObjArray[f].data.coverCropDisp = newValueCC
										storeDataObjArray[f].data.coverCropVal = dbvalCC
									}
								}
							}
							setTimeout(() => {
								me.getView().refresh()
						}, "250")
						}
						//console.log(store)
						
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
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
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
					},
				change: function(widget,newValue,oldValue,record){
					var record = widget.getWidgetRecord();
					var dbval = ""
					console.log(selectedFields)
					console.log("newValue: " + newValue)
					console.log("oldValue: " + oldValue)
					console.log("you've changed man on Crop Rot")
					//console.log(rotfreqcount)
					console.log(record)
					var store = me.getStore()
					var storeDataObjArray = store.data.items
					var view = me.getView()
					switch(newValue){
						case 'No-Till': dbval = 'nt'
						break;
						case 'Spring Cultivation': dbval = 'su'
						break;
						case 'Spring Chisel + Disk': dbval = 'sc'
						break;
						case 'Spring Chisel No Disk': dbval = 'sn'
						break;
						case 'Spring Vertical': dbval = 'sv'
						break;
						case 'Fall Chisel + Disk': dbval = 'fc'
						break;
						case 'Fall Moldboard Plow': dbval = 'fm'
						break;
						
						case 'nt': dbval = 'nt', newValue = 'No-Till'
						break;
						case 'su': dbval = 'su', newValue = 'Spring Cultivation'
						break;
						case 'sc': dbval = 'sc', newValue = 'Spring Chisel + Disk'
						break;
						case 'sn': dbval = 'sn', newValue = 'Spring Chisel No Disk'
						break;
						case 'sv': dbval = 'sv', newValue = 'Spring Vertical'
						break;
						case 'fc': dbval = 'fc', newValue = 'Fall Chisel + Disk'
						break;
						case 'fm': dbval = 'fm', newValue = 'Fall Moldboard Plow'
						break;
						
						default: dbval = 'No Tillage fROM SWITCH!'
					}

					console.log("dbval: " + dbval)
					if(selectedFields.length > 0 ){
						for(r in selectedFields){
							for(f in storeDataObjArray){
								if(selectedFields[r] == storeDataObjArray[f].id && selectedFields[r] != record.id){
									console.log("newValue: " + newValue)
									console.log("dbval: " + dbval)
									console.log(storeDataObjArray[f].id)
									console.log(selectedFields[r])
									storeDataObjArray[f].dirty = true
									storeDataObjArray[f].data.tillageDisp = newValue
									storeDataObjArray[f].data.tillageVal = dbval
								}
							}
						}
						setTimeout(() => {
							me.getView().refresh()
					}, "250")
					}
					//console.log(store)
					
				}
				}
			}
		};
		//------------------------------------------------------------------------------

		let onContourColumn = {
			xtype: 'widgetcolumn', text: 'On Contour', dataIndex: 'onContour', width: 100,
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
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
			widget: {
				xtype: 'checkbox',
				defaultBindProperty: 'onContour',
				queryMode: 'local',
				listeners:{
					change: function(field,newValue,oldValue,record){
							console.log(selectedFields)
							console.log("newValue: " + newValue)
							console.log("oldValue: " + oldValue)
							console.log("you've changed man on soilOM")
							var store = me.getStore()
							var storeDataObjArray = store.data.items
							if(selectedFields.length > 0 ){
								for(r in selectedFields){
									for(f in storeDataObjArray){
										if(selectedFields[r] == storeDataObjArray[f].id && selectedFields[r] != record.id){
											console.log("newValue: " + newValue)
											console.log(storeDataObjArray[f].id)
											console.log(selectedFields[r])
											storeDataObjArray[f].dirty = true
											storeDataObjArray[f].data.onContour = newValue
										}
									}
								}
								setTimeout(() => {
									me.getView().refresh()
							}, "250")
							}
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
		//Change to fertpercP
		// let PfertPerc_Column = {
		// 	xtype: 'widgetcolumn', format: '0.0',editor: {
		// 		xtype:'numberfield', maxValue: 100, step: 5, minValue: 0,
		// 	}, dataIndex: 'fertPercP',
		// 	text: 'Percent<br>Fert P', dataIndex: 'fertPercP', width: 80, tooltip: 'Enter the amount of fertilizer P applied to the crop rotation as a percentage of the P removed by the crop rotation harvest (e.g., value of 100 means that P inputs and outputs are balanced).',
		// 	hideable: false, enableColumnHide: false, lockable: false, minWidth: 24,
		// 	onWidgetAttach: function(col, widget, rec) {
		// 		if (rec.get('rotationVal') == 'pt-cn' || rec.get('rotationVal') == 'dl') {
		// 			widget.setDisabled(false);
		// 		} else {
		// 			widget.setDisabled(true);
		// 		}
		// 	},
		// 	widget: {
		// 		xtype: 'numbercolumn',
		// 		// queryMode: 'local',
		// 		// dataIndex: 'fertPercP',
		// 		// format: '0.0',
		// 		// hideable: false, enableColumnHide: false, lockable: false, minWidth: 24,
		// 		// editor: {
		// 		// 	xtype:'numberfield', maxValue: 100, step: 5, minValue: 0,
		// 		// }
		// 	}
		// };
		//------------------------------------------------------------------------------


		//------------------------------------------------------------------------------
		//Change to fertpercP
		let PfertPerc_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', maxValue: 150, step: 5, minValue: 0,
				listeners:{
					change: function(field,newValue,oldValue,record){
							console.log(selectedFields)
							console.log("newValue: " + newValue)
							console.log("oldValue: " + oldValue)
							console.log("you've changed man on soilOM")
							var store = me.getStore()
							var storeDataObjArray = store.data.items
							if(selectedFields.length > 0 ){
								for(r in selectedFields){
									for(f in storeDataObjArray){
										if(selectedFields[r] == storeDataObjArray[f].id && selectedFields[r] != record.id){
											console.log("newValue: " + newValue)
											console.log(storeDataObjArray[f].id)
											console.log(selectedFields[r])
											storeDataObjArray[f].dirty = true
											storeDataObjArray[f].data.fertPercP = newValue
										}
									}
								}
							// 	setTimeout(() => {
							// 		me.getView().refresh()
							// }, "250")
							}
							var view = me.getView()
							//view.refresh()
					}
				}
			}, text: '% Fert P', dataIndex: 'fertPercP', width: 80, tooltip: 'Enter the amount of fertilizer P applied to the crop rotation as a percentage of the P removed by the crop rotation harvest (e.g., value of 100 means that P inputs and outputs are balanced).',
			hideable: true, enableColumnHide: true, lockable: false, minWidth: 24,
		};
		//------------------------------------------------------------------------------


		//Change to manupercP
		let PmanuPerc_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', maxValue: 150, step: 5, minValue: 0,
				listeners:{
					change: function(field,newValue,oldValue,record){
							console.log(selectedFields)
							console.log("newValue: " + newValue)
							console.log("oldValue: " + oldValue)
							console.log("you've changed man on soilOM")
							var store = me.getStore()
							var storeDataObjArray = store.data.items
							if(selectedFields.length > 0 ){
								for(r in selectedFields){
									for(f in storeDataObjArray){
										if(selectedFields[r] == storeDataObjArray[f].id && selectedFields[r] != record.id){
											console.log("newValue: " + newValue)
											console.log(storeDataObjArray[f].id)
											console.log(selectedFields[r])
											storeDataObjArray[f].dirty = true
											storeDataObjArray[f].data.manuPercP = newValue
										}
									}
								}
							// 	setTimeout(() => {
							// 		me.getView().refresh()
							// }, "250")
							}
							var view = me.getView()
							//view.refresh()
					}
				}
			}, text: '% Manure P', dataIndex: 'manuPercP', width: 110, tooltip: 'Enter the amount of manure P applied to the crop rotation as a percentage of the P removed by the crop rotation harvest (e.g., value of 100 means that P inputs and outputs are balanced). Note that in grazed systems, manure P is already applied and does not need to be accounted for here.',
			hideable: true, enableColumnHide: true, lockable: false, minWidth: 24
		};
		let NfertPerc_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', maxValue: 150, step: 5, minValue: 0,
				listeners:{
					change: function(field,newValue,oldValue,record){
							console.log(selectedFields)
							console.log("newValue: " + newValue)
							console.log("oldValue: " + oldValue)
							console.log("you've changed man on soilOM")
							var store = me.getStore()
							var storeDataObjArray = store.data.items
							if(selectedFields.length > 0 ){
								for(r in selectedFields){
									for(f in storeDataObjArray){
										if(selectedFields[r] == storeDataObjArray[f].id && selectedFields[r] != record.id){
											console.log("newValue: " + newValue)
											console.log(storeDataObjArray[f].id)
											console.log(selectedFields[r])
											storeDataObjArray[f].dirty = true
											storeDataObjArray[f].data.fertPercN = newValue
										}
									}
								}
							// 	setTimeout(() => {
							// 		me.getView().refresh()
							// }, "250")
							}
							var view = me.getView()
							//view.refresh()
					}
				}
			}, text: '% Fert N', dataIndex: 'fertPercN', width: 80, tooltip: 'Enter the amount of fertilizer N applied to the crop rotation as a percentage of the N removed by the crop rotation harvest (e.g., value of 100 means that N inputs and outputs are balanced).',
			hideable: true, enableColumnHide: true, lockable: false, minWidth: 24
		};
		//------------------------------------------------------------------------------
		//Change to manupercP
		let NmanuPerc_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', maxValue: 150, step: 5, minValue: 0,
				listeners:{
					change: function(field,newValue,oldValue,record){
							console.log(selectedFields)
							console.log("newValue: " + newValue)
							console.log("oldValue: " + oldValue)
							console.log("you've changed man on soilOM")
							var store = me.getStore()
							var storeDataObjArray = store.data.items
							if(selectedFields.length > 0 ){
								for(r in selectedFields){
									for(f in storeDataObjArray){
										if(selectedFields[r] == storeDataObjArray[f].id && selectedFields[r] != record.id){
											console.log("newValue: " + newValue)
											console.log(storeDataObjArray[f].id)
											console.log(selectedFields[r])
											storeDataObjArray[f].dirty = true
											storeDataObjArray[f].data.manuPercN = newValue
										}
									}
								}
							// 	setTimeout(() => {
							// 		me.getView().refresh()
							// }, "250")
							}
							var view = me.getView()
							//view.refresh()
					}
				}
			}, text: '% Manure N', dataIndex: 'manuPercN', width: 110, tooltip: 'Enter the amount of manure N applied to the crop rotation as a percentage of the N removed by the crop rotation harvest (e.g., value of 100 means that N inputs and outputs are balanced). Note that in grazed systems, manure N is already applied and does not need to be accounted for here.',
			hideable: true, enableColumnHide: true, lockable: false, minWidth: 24
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
					select: function(combo, value, eOpts){
						var record = combo.getWidgetRecord();
						record.set('grassSpeciesVal', value.get('value'));
						record.set('grassSpeciesDisp', value.get('display'));
					},
					change: function(widget,newValue,oldValue,record){
						var record = widget.getWidgetRecord();
						var dbval = ""
						console.log(selectedFields)
						console.log("newValue: " + newValue)
						console.log("oldValue: " + oldValue)
						console.log("you've changed man on grass Species")
						//console.log(rotfreqcount)
						console.log(record)
						var store = me.getStore()
						var storeDataObjArray = store.data.items
						var view = me.getView()
						switch(newValue){
							case 'Low Yielding': dbval = 'Bluegrass-clover'
							break;
							case 'Medium Yielding': dbval = 'Timothy-clover'
							break;
							case 'High Yielding': dbval = 'Orchardgrass-clover'
							break;

							case 'Bluegrass-clover': dbval = 'Bluegrass-clover'
							break;
							case 'Timothy-clover': dbval = 'Timothy-clover'
							break;
							case 'Orchardgrass-clover': dbval = 'Orchardgrass-clover'
							break;
							
							default: dbval = 'No Grass Species fROM SWITCH!'
						}
						console.log("dbval: " + dbval)
						if(selectedFields.length > 0 ){
							for(r in selectedFields){
								for(f in storeDataObjArray){
									if(selectedFields[r] == storeDataObjArray[f].id && selectedFields[r] != record.id){
										console.log("newValue: " + newValue)
										console.log("dbval: " + dbval)
										console.log(storeDataObjArray[f].id)
										console.log(selectedFields[r])
										storeDataObjArray[f].dirty = true
										storeDataObjArray[f].data.grassSpeciesDisp = newValue
										storeDataObjArray[f].data.grassSpeciesVal = dbval
									}
								}
							}
							setTimeout(() => {
								me.getView().refresh()
						}, "250")
						}
						//console.log(store)
					}
				}
			}
		};
		let rotationalFreqColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Rotational Frequency', dataIndex: 'rotationFreqDisp', width: 150, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {
				if (rec.get('rotationVal') == 'pt-rt') {
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
					select: function(combo, value, eOpts){
						console.log("rotationFreq selected")
						var record = combo.getWidgetRecord();
						record.set('rotationFreqVal', value.get('value'));
						record.set('rotationFreqDisp', value.get('display'));
						//me.getView().refresh();
					},
					change: function(widget,newValue,oldValue,record){
						var record = widget.getWidgetRecord();
						var dbval = ""
						console.log(selectedFields)
						console.log("newValue: " + newValue)
						console.log("oldValue: " + oldValue)
						console.log("you've changed man on rotationFreq")
						//console.log(rotfreqcount)
						console.log(record)
						var store = me.getStore()
						var storeDataObjArray = store.data.items
						var view = me.getView()
						switch(newValue){
							case 'More then once a day': dbval = '1.2'
							break;
							case 'Once a day': dbval = '1'
							break;
							case 'Every 3 days': dbval = '0.95'
							break;
							case 'Every 7 days': dbval = '0.75'
							break;
							case 'Continuous': dbval = '0.65'
							break;

							case '1.2': dbval = '1.2'
							break;
							case '1': dbval = '1'
							break;
							case '0.95': dbval = '0.95'
							break;
							case '0.75': dbval = '0.75'
							break;
							case '0.65': dbval = '0.65'
							break;
							
							default: dbval = 'No Rot Freq fROM SWITCH!'
						}
						console.log("dbval: " + dbval)
						if(selectedFields.length > 0 ){
							for(r in selectedFields){
								for(f in storeDataObjArray){
									if(selectedFields[r] == storeDataObjArray[f].id && selectedFields[r] != record.id){
										console.log("newValue: " + newValue)
										console.log("dbval: " + dbval)
										console.log(storeDataObjArray[f].id)
										console.log(selectedFields[r])
										storeDataObjArray[f].dirty = true
										storeDataObjArray[f].data.rotationFreqDisp = newValue
										storeDataObjArray[f].data.rotationFreqVal = dbval
									}
								}
							}
							setTimeout(() => {
								me.getView().refresh()
						}, "250")
						}
						//console.log(store)
						
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
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
			widget: {
				xtype: 'checkbox',
				defaultBindProperty: 'interseededClover',
				queryMode: 'local',
				listeners: {
					change: function(widget,value){
					console.log("you've changed man graze clover")
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
			text: 'Animal Density', dataIndex: 'grazeDensityDisp', width: 110, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			onWidgetAttach: function(col, widget, rec) {

				if (rec.get('rotationVal') == 'pt-cn' || rec.get('rotationVal') == 'dl') {
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
				store: 'grazingDensity',
				displayField: 'display',
				valueField: 'value',
				triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
				listeners:{
					select: function(combo, value, eOpts){
						var record = combo.getWidgetRecord();
						record.set('grazeDensityVal', value.get('value'));
						record.set('grazeDensityDisp', value.get('display'));
					},
					change: function(widget,newValue,oldValue,record){
						var record = widget.getWidgetRecord();
						var dbval = ""
						console.log(selectedFields)
						console.log("newValue: " + newValue)
						console.log("oldValue: " + oldValue)
						console.log("you've changed man on Grazing density")
						//console.log(rotfreqcount)
						console.log(record)
						var store = me.getStore()
						var storeDataObjArray = store.data.items
						var view = me.getView()
						switch(newValue){
							case 'high': dbval = 'hi'
							break;
							case 'low': dbval = 'lo'
							break;
							case 'Not Applicable': dbval = 'na'
							break;

							case 'hi': dbval = 'hi'
							break;
							case 'lo': dbval = 'lo'
							break;
							case 'na': dbval = 'na'
							break;
							
							default: dbval = 'No GrazeDensity fROM SWITCH!'
						}
						console.log("dbval: " + dbval)
						if(selectedFields.length > 0 ){
							for(r in selectedFields){
								for(f in storeDataObjArray){
									if(selectedFields[r] == storeDataObjArray[f].id && selectedFields[r] != record.id){
										console.log("newValue: " + newValue)
										console.log("dbval: " + dbval)
										console.log(storeDataObjArray[f].id)
										console.log(selectedFields[r])
										storeDataObjArray[f].dirty = true
										storeDataObjArray[f].data.grazeDensityDisp = newValue
										storeDataObjArray[f].data.grazeDensityVal = dbval
									}
								}
							}
							setTimeout(() => {
								me.getView().refresh()
						}, "250")
						}
						//console.log(store)
						selectedFields = []
						
					}
				}
			}
		};
        let area_Column = {
			xtype: 'numbercolumn', format: '0.0',/*editor: {
				xtype:'numberfield', minValue: 25, maxValue: 175, step: 5, editable: false,
			},*/ text: 'Area(acre)', dataIndex: 'area', width: 90,editable: false,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		};
		let delete_Column = 
		{
			xtype: 'actioncolumn',
			width: 110,
			text: 'Delete Field',
			scale: 'large',
			align: 'center',
			items: [{
				icon: '/static/grazescape/public/images/remove-icon-png-7116.png',
				text:'Delete Field',
				tooltip: 'Delete',
				handler: function(grid, rowIndex) {
					setTimeout(function(){
						let deleteRecID = deleteRecord.id
						console.log(deleteRecID)
						DSS.layer.fields_1.getSource().forEachFeature(function(f) {
							console.log(f)
							if(deleteRecID == f.id_){
								console.log("hit delete field by grid",f)
								selectedField = f
								console.log(selectedField);
								DSS.dialogs.FieldDeletePanel = Ext.create('DSS.field_shapes.Delete'); 		
								DSS.dialogs.FieldDeletePanel.show().center().setY(100);
							}
						})
						//grid.getStore().removeAt(rowIndex);
					}, 500);//wait 2 seconds
					

				},
				scope: this
			}]
		}
		
		//------------------------------------------------------------------------------
		Ext.applyIf(me, {

			columns: [
				fieldNameColumn,
				area_Column,
				landCost_Column,
				soilP_Column,
				soilOM_Column,
				cropRotationColumn,
				coverCropColumn,
				tillageColumn,
				onContourColumn,
				PfertPerc_Column,
				PmanuPerc_Column,
				NfertPerc_Column,
				NmanuPerc_Column,
				//grazeDairyLactatingColumn,
				//grazeDairyNonLactatingColumn,
				//grazeBeefCattleColumn,
				grassSpeciesColumn,
				rotationalFreqColumn,
				//interseededCloverColumn,
				//manurePasturesColumn,
				grazeDensityColumn,
				//perimeter_Column
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
			},
			// {
			// 	ptype: 'gridexporter',
			// }
		]
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



