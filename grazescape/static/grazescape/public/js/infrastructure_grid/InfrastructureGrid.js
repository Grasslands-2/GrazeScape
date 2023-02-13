DSS.utils.addStyle('.x-grid-widgetcolumn-cell-inner {padding-left: 0;padding-right: 0;}')
DSS.utils.addStyle('.combo-limit-borders {border-top: transparent; border-bottom: transparent}')

var infraArray = [];
var infraObj = {};

var infraUrl = ""

var selectedInfra = []

function getWFSinfra(parameter = "") {
    console.log("getting wfs infra")
    geoServer.getWFSinfra(parameter)
}
function refreshviewinfra(){
	setTimeout(() => {
		Ext.getCmp("infraTable").getView().refresh()
}, "1000")
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
	getWFSinfra('&CQL_filter=scenario_id='+DSS.activeScenario);
	console.log("InfraStructure gatherTableData ran");
	console.log(infraArray);
};
//console.log(infraArray);

function refreshSelectedInfra(self, record, eOpts){
	selectedInfra = []
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
			selectedInfra.push(pushedR)
		}
		console.log(selectedInfra)
		DSS.map.addInteraction(selectInteraction);
		var fieldFeatures = DSS.layer.fields_1.getSource().getFeatures();
		for(f in fieldFeatures){
			console.log(fieldFeatures[f].id_)
			for(r in selectedInfra){
				if(fieldFeatures[f].id_ == selectedInfra[r]){
					selectInteraction.getFeatures().push(fieldFeatures[f]);
				}
			}
		}
	Ext.getCmp("infraTable").getView().refresh();
}
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
		display: 'High Tensile Electric, One Strand',
		cost: 0.84
	},{ 
		value: 'hte',
		display: 'High Tensile Electric, Two Strand',
		cost:1.81
	},{ 
		value: 'pp',
		display: 'Moveable polywire',
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
	//extend: 'Ext.grid.Panel',
	extend: 'Ext.ux.ExportableGrid',
	alias: 'widget.infra_grid',
	alternateClassName: 'DSS.InfraGrid',
	singleton: true,	
	autoDestroy: false,
	id: "infraTable",
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
	
	store: Ext.data.StoreManager.lookup('InfraStore'),
	dockedItems: [{
		xtype: 'toolbar',
		dock: 'bottom',
		items: [
			{
				xtype: 'button',
				text: 'Select All Fields',
				handler: function (self) {
					selectedInfra = []
					Ext.getCmp("infraTable").getView().refresh();
					Ext.getCmp("infraTable").getSelectionModel().selectAll();
				}
			},
			{
			xtype: 'button',
			text: 'Deselect All Fields',
			handler: function (self) {
				selectedInfra = []
				Ext.getCmp("infraTable").getView().refresh();
				Ext.getCmp("infraTable").getSelectionModel().deselectAll();
			}
		},
		{
			xtype: 'button',
			text: 'Refresh',
			handler: function (self) {
				runInfraUpdate()
				selectedInfra = []
				Ext.getCmp("infraTable").getView().refresh();
				Ext.getCmp("infraTable").getSelectionModel().deselectAll();
			}
		},
		{
			xtype: 'button',
			text: 'Export Table',
			handler: function (self) {
				console.log("infra Table exported")
				Ext.getCmp("infraTable").export('Field Table');
				selectedInfra = []
				Ext.getCmp("infraTable").getView().refresh();
				Ext.getCmp("infraTable").getSelectionModel().deselectAll();
			}
		}]
	},
],
	
	minHeight: 40,
	maxHeight: 600,
	listeners: {
		hide: function(self, newW, newH, oldW, oldH) {
			console.log("Infra Grid hide")
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
			refreshSelectedInfra(self, record, eOpts)
			
		},
		deselect: function (self,record,eOpts) {
			console.log("Record DESelected")
			refreshSelectedInfra(self, record, eOpts)
		
		},
		rowclick: function(self,record){
			deleteRecord = record;
		},
	},
	//requires: ['DSS.map.Main'],

	//-----------------------------------------------------
	
	initComponent: function() {
		console.log("INITCOMPONENT FROM FIELDGRID RAN!!!!!")
		let me = this;
		
		let infraNameColumn = {
			editor: "textfield",
			text: "Label",
			dataIndex: "name",
			width: 120,
			locked: true,
			draggable: false,
			hideable: false,
			enableColumnHide: false,
			lockable: false,
			minWidth: 24,
			tooltip: "<b>Infra Name:</b> Can be editted.",
		};

		let infraTypeColumn = {
			xtype: 'widgetcolumn',
			editor: {}, // workaround for exception
			text: 'Infrastructure Type', dataIndex: 'infraTypeDisp', width: 200, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
			tooltip: '<b>Infra Type:</b> Edit what class of infrastructure you have placed.',
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
					},
					change: function(widget,newValueIT,oldValueIT,record){
						console.log(widget)
						var record = widget.getWidgetRecord();
						var dbvalIT = ""
						console.log(selectedInfra)
						console.log("newValueIT: " + newValueIT)
						console.log("oldValueIT: " + oldValueIT)
						console.log("you've changed man on Infra Type")
						console.log(record)
						var store = me.getStore()
						var storeDataObjArray = store.data.items
						var view = me.getView()
						switch(newValueIT){
							case 'Fencing': dbvalIT = 'fl'
							break;
							case 'Water Line': dbvalIT = 'wl'
							break;
							case 'Lane Line': dbvalIT = 'll'
							break;
							

							case 'fl': dbvalIT = 'fl'
							break;
							case 'wl': dbvalIT = 'wl'
							break;
							case 'll': dbvalIT = 'll'
							break;
							
							default: dbvalIT = 'No Infra Type fROM SWITCH!'
						}
						console.log("dbvalIT: " + dbvalIT)
						if(selectedInfra.length > 0 ){
							for(r in selectedInfra){
								for(f in storeDataObjArray){
									if(selectedInfra[r] == storeDataObjArray[f].id && selectedInfra[r] != record.id){
										console.log("newValueIT: " + newValueIT)
										console.log("dbvalIT: " + dbvalIT)
										console.log(storeDataObjArray[f].id)
										console.log(selectedInfra[r])
										storeDataObjArray[f].dirty = true
										storeDataObjArray[f].data.infraTypeDisp = newValueIT
										storeDataObjArray[f].data.infraType = dbvalIT
										
									}
								}
							}
							selectedInfra = []
							me.getView().refresh();
							me.getSelectionModel().deselectAll();
						}
						console.log("End of Rot Crop change event")
						refreshviewinfra()
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
			tooltip: '<b>Fence Material:</b> Whats the fencing material for this fence.',
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
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
					},
					change: function(widget,newValueFM,oldValueFM,record){
						console.log(widget)
						var record = widget.getWidgetRecord();
						var dbvalFM = ""
						console.log(selectedInfra)
						console.log("newValueFM: " + newValueFM)
						console.log("oldValueFM: " + oldValueFM)
						console.log("you've changed man on Crop Rot")
						//console.log(rotfreqcount)
						console.log(record)
						var store = me.getStore()
						var storeDataObjArray = store.data.items
						var view = me.getView()
						switch(newValueFM){
							case 'High Tensile Electric, One Strand': dbvalFM = 'hte1', dbcostFM = 0.84
							break;
							case 'High Tensile Electric, Two Strand': dbvalFM = 'hte', dbcostFM = 1.81
							break;
							case 'Moveable polywire': dbvalFM = 'pp', dbcostFM = 0.37
							break;
							

							case 'hte1': dbvalFM = 'hte1', dbcostFM = 0.84
							break;
							case 'hte': dbvalFM = 'hte', dbcostFM = 1.81
							break;
							case 'pp': dbvalFM = 'pp', dbcostFM = 0.37
							break;
							default: dbvalFM = 'No Fence Material fROM SWitCH!'
						}
						console.log("dbvalFM: " + dbvalFM)
						if(selectedInfra.length > 0 ){
							for(r in selectedInfra){
								for(f in storeDataObjArray){
									if(selectedInfra[r] == storeDataObjArray[f].id && selectedInfra[r] != record.id){
										console.log("newValueFM: " + newValueFM)
										console.log("dbvalFM: " + dbvalFM)
										console.log(storeDataObjArray[f].id)
										console.log(selectedInfra[r])
										storeDataObjArray[f].dirty = true
										storeDataObjArray[f].data.fenceMaterialDisp = newValueFM
										storeDataObjArray[f].data.fenceMaterial = dbvalFM
										storeDataObjArray[f].data.costPerFoot = dbcostFM
										
									}
								}
							}
							selectedInfra = []
							me.getView().refresh();
							me.getSelectionModel().deselectAll();
						}
						console.log("End of fence material change event")
						refreshviewinfra()
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
			tooltip: '<b>Water Pipe Type:</b> What kind of water pipe is this.',
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
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
					},
					change: function(widget,newValueWP,oldValueWP,record){
						console.log(widget)
						var record = widget.getWidgetRecord();
						var dbvalWP = ""
						console.log(selectedInfra)
						console.log("newValueWP: " + newValueWP)
						console.log("oldValueWP: " + oldValueWP)
						console.log("you've changed man on Infra Type")
						console.log(record)
						var store = me.getStore()
						var storeDataObjArray = store.data.items
						var view = me.getView()
						switch(newValueWP){
							case 'Surface HDPE or PVC Pipe': dbvalWP = 'sup', dbcostWP = 1.17
							break;
							case 'Shallow Buried HDPE or PVC Pipe': dbvalWP = 'sbp', dbcostWP = 2.31
							break;

							case 'sup': dbvalWP = 'sup', dbcostWP = 1.17
							break;
							case 'sbp': dbvalWP = 'sbp', dbcostWP = 2.31
							break;
							
							default: dbvalWP = 'No Waterpipe type fROM SWitCH!'
						}
						console.log("dbvalWP: " + dbvalWP)
						if(selectedInfra.length > 0 ){
							for(r in selectedInfra){
								for(f in storeDataObjArray){
									if(selectedInfra[r] == storeDataObjArray[f].id && selectedInfra[r] != record.id){
										console.log("newValueWP: " + newValueWP)
										console.log("dbvalWP: " + dbvalWP)
										console.log(storeDataObjArray[f].id)
										console.log(selectedInfra[r])
										storeDataObjArray[f].dirty = true
										storeDataObjArray[f].data.waterPipeDisp = newValueWP
										storeDataObjArray[f].data.waterPipe = dbvalWP
										storeDataObjArray[f].data.costPerFoot = dbcostWP
										
									}
								}
							}
							selectedInfra = []
							me.getView().refresh();
							me.getSelectionModel().deselectAll();
						}
						console.log("End of Rot Crop change event")
						refreshviewinfra()
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
			tooltip: '<b>Lane Line Material:</b> What material is this lane made out of.',
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
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
				},
				change: function(widget,newValueLM,oldValueLM,record){
					console.log(widget)
					var record = widget.getWidgetRecord();
					var dbvalLM = ""
					console.log(selectedInfra)
					console.log("newValueLM: " + newValueLM)
					console.log("oldValueLM: " + oldValueLM)
					console.log("you've changed man on Infra Type")
					console.log(record)
					var store = me.getStore()
					var storeDataObjArray = store.data.items
					var view = me.getView()
					switch(newValueLM){
						case 'Surface HDPE or PVC Pipe': dbvalLM = 'sup', dbcostLM = 1.17
						break;
						case 'Shallow Buried HDPE or PVC Pipe': dbvalLM = 'sbp', dbcostLM = 2.31
						break;

						case 'sup': dbvalLM = 'sup', dbcostLM = 1.17
						break;
						case 'sbp': dbvalLM = 'sbp', dbcostLM = 2.31
						break;
						
						default: dbvalLM = 'No Waterpipe type fROM SWitCH!'
					}
					console.log("dbvalLM: " + dbvalLM)
					if(selectedInfra.length > 0 ){
						for(r in selectedInfra){
							for(f in storeDataObjArray){
								if(selectedInfra[r] == storeDataObjArray[f].id && selectedInfra[r] != record.id){
									console.log("newValueLM: " + newValueLM)
									console.log("dbvalLM: " + dbvalLM)
									console.log(storeDataObjArray[f].id)
									console.log(selectedInfra[r])
									storeDataObjArray[f].dirty = true
									storeDataObjArray[f].data.laneMaterialDisp = newValueLM
									storeDataObjArray[f].data.laneMaterial = dbvalLM
									storeDataObjArray[f].data.costPerFoot = dbcostLM
									
								}
							}
						}
						selectedInfra = []
						me.getView().refresh();
						me.getSelectionModel().deselectAll();
					}
					refreshviewinfra()
				}
			}
		};
		//------------------------------------------------------------------
		let widthColumn = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', minValue: 25, maxValue: 175, step: 5, editable: false
			}, text: 'Lane Width (ft)', dataIndex: 'laneWidth', width: 120,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24,
			tooltip: '<b>Lane Width:</b> How wide is this lane?  This will be used to calculate the total cost of the lane.',
		};
		let lengthColumn = {
			xtype: "numbercolumn",
			format: "0.0",
			editor: {
				xtype: "numberfield",
				minValue: 25,
				maxValue: 175,
				step: 5,
				editable: false,
			},
			text: "Length [ft]",
			dataIndex: "infraLength",
			width: 80,
			hideable: false,
			enableColumnHide: false,
			lockable: false,
			minWidth: 24,
			tooltip: "<b>Infrastructure Length:</b> Used in cost calculation.",
    	};
		//------------------------------------------------------------------------------
		let costPerFootColumn = {
			xtype: 'widgetcolumn', format: '0.00',
			exportable: true, exportConverter: function(self){
				console.log(self)
				return self
			},
			    editor: {},
			    widget:{
				    xtype:'numberfield',
				    minValue: 0, maxValue: Infinity, step: .2,
				    listeners:{change: function(editor, newv,oldv, eOpts) {
				                let changeVal = newv

				                let record = editor.getWidgetRecord();
				                let length = record.get("infraLength")

//				                editor.suspendEvents(false)
				                record.set("totalCost",changeVal*length )
//                              the change event for this field first 2 times
                                //which cause the value to not change. Setting the value fires the event a
                                // third time which seems to fix the issue.
                                //The change event only fires twice when we set the value of another column
                                // Probably a bug with extjs
				                record.set("costPerFoot", changeVal)
//				                setTimeout(() => {
//				                    editor.resumeEvents()
//				                                }, 1000);

//				                console.log(record.get("totalCost"))s
								refreshviewinfra()
                            },
//                            single: true
                            },

			    },
			    text: 'Cost Per<br>Foot', dataIndex: 'costPerFoot', width: 90,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24,
			tooltip: '<b>Cost per Square foot of lane material:</b> Based on Material choosen, can be editted.',

		};
		//------------------------------------------------------------------------------
		let totalCostColumn = {
			xtype: 'numbercolumn', format: '0.00',editor: {
				xtype:'numberfield', minValue: 25, maxValue: 175, step: 5,
				exportable: true, exportConverter: function(self){
					console.log(self)
					return self
				},
				listeners:{change: function(editor, newv,oldv, eOpts) {

				    console.log("total cost updated")
					refreshviewinfra()
				}
				}
			}, text: 'Total<br>Cost', dataIndex: 'totalCost', width: 80, formatter: 'usMoney',
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24,
			tooltip: '<b>Total Cost of Infrastructure:</b> Calculated based on length and material of infrastructure.',
		};
		//------------------------------------------------------------------------------
		Ext.applyIf(me, {
			columns: [
				infraNameColumn,
				infraTypeColumn,
				fenceMaterialColumn,
				waterPipeColumn,
				laneLineColumn,
				lengthColumn,
				widthColumn,
				costPerFootColumn,
				totalCostColumn
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
