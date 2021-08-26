/*
 * File: app/view/ScenarioTools.js
 */

var DSS_DefaultScenarioSetup = {
	selection_name: null,//'Double Click to Set Custom Name', 
	transform_text: null,//'Double Click to Set Crop',
	management_text: '',
	transform: { land_use: 1, options: undefined },
	query: [{
		"name":"wisc_land","type":"indexed","matchValues":[1]
	}]
};

// TODO: update to use the Landcover Filter layer vs. always using the wisc_land 2.0 filter widget
var baseExample = [{
	selection_name: 'Row crops near open water', transform_text: 'Mixed Grass (C3 / C4)',
	management_text: '<ul><li>Fertilizer: manure (from grazing)</li></ul>',
	transform: { land_use: 6, options: [{type: 'fertilizer',value: 2 }] },
	query: [{
		"name":"wisc_land","type":"indexed","matchValues":[1,14,15,16]
	},{
		"name":"dist_to_water","type":"continuous","lessThanTest":"<=","greaterThanTest":">=","lessThanValue":160
	}]
},{
	selection_name: 'Row crops on marginal soils', transform_text: 'Mixed Grass (C3 / C4)',
	management_text: '<ul><li>Fertilizer: manure (from grazing)</li></ul>',
	transform: { land_use: 6, options: [{type: 'fertilizer',value: 2 }] },
	query: [{
		"name":"wisc_land","type":"indexed","matchValues":[1,14,15,16]
	},{
		"name":"lcc","type":"indexed","matchValues":[5,6,7,8]
	}]
},{
	selection_name: 'Grasses on prime soils', transform_text: 'Cash Grain (50% corn, 50% soy)',
	management_text: '<ul><li>Fertilizer: Manure (not winter)</li><li>Tillage: no-till</li><li>Cover crop: small grain</li><li>Contouring: none</li></ul>',
	transform: { land_use: 2, options: [{type: 'fertilizer',value: 2 }] },
	query: [{
		"name":"wisc_land","type":"indexed","matchValues":[2,3,4,5]
	},{
		"name":"lcc","type":"indexed","matchValues":[1,2,3,4]
	},{
		"name":"dist_to_water","type":"continuous","lessThanTest":"<=","greaterThanTest":">=","greaterThanValue":200
	},{
		"name":"slope","type":"continuous","lessThanTest":"<=","greaterThanTest":">=","lessThanValue":5
	}]
},{
	selection_name: 'Row crops on steeper slopes', transform_text: 'C3 Grass',
	management_text: '<ul><li>Fertilizer: manure (from grazing)</li></ul>',
	transform: { land_use: 6, options: [{type: 'fertilizer',value: 2 }] },
	query: [{
		"name":"wisc_land","type":"indexed","matchValues":[1,14,15,16]
	},{
		"name":"slope","type":"continuous","lessThanTest":"<=","greaterThanTest":">=","greaterThanValue":10,"lessThanValue":15
	}]
}];

var DSS_EmptySelectionName = 'Double Click to Name Selection', 
	DSS_EmptyTransformText = 'Click to Choose a New Landcover Type';

//------------------------------------------------------------------------------
Ext.create('Ext.data.Store', {
	
	storeId: 'dss-scenario-store',
    fields: ['selection_name', 'transform_text', 'management_text', 'transform', 'query'],
    data: {
    	items: baseExample,
    },autoLoad: true,
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },    
    listeners: {
    	// blah, just force the commit to happen, no reason not to save it right away IMHO
    	update: function(store, record, operation, eOps) {
    		if (operation == Ext.data.Model.EDIT) {
    			store.commitChanges();
    		}
    	}
    }
});
 

// Scenario Summary....
//------------------------------------------------------------------------------
Ext.define('DSS.components.ScenarioGrid', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.scenario_grid',
	
	requires: [
		'DSS.components.TransformPopup',
	],
    
	id: 'dss-scenario-grid',
	autoScroll: true,
    header: false,
	dockedItems: [{
		xtype: 'toolbar',
		dock: 'right',
		items:[{
			xtype: 'tool',
			type: 'refresh',
		    baseCls: 'dss-tool',
		    disabledCls: 'dss-tool-disabled',
		    toolPressedCls: 'dss-tool-pressed',
		    toolOverCls: 'dss-tool-over',		
			width: 28, height: 28,
			tooltip: 'Start over with a new scenario',
			callback: function(toolOwner, tool) {
				Ext.Msg.show({
				    title: 'Would you like to start over?',
				    message: 'Clicking "YES" will remove any steps you\'ve already configured. Proceed?',
				    buttons: Ext.Msg.YES | Ext.Msg.CANCEL,
				    icon: Ext.Msg.QUESTION,
				    fn: function(btn) {
				        if (btn === 'yes') {
							Ext.data.StoreManager.lookup('dss-scenario-store').loadRawData([{items: DSS_DefaultScenarioSetup}], false);
							Ext.data.StoreManager.lookup('dss-scenario-store').commitChanges();
				        }
				    }
				});
			}
		},'->',{
			xtype: 'tool',
			type: 'plus' ,
		    baseCls: 'dss-tool',
		    disabledCls: 'dss-tool-disabled',
		    toolPressedCls: 'dss-tool-pressed',
		    toolOverCls: 'dss-tool-over',		
			width: 28, height: 28,
			tooltip: 'Add another step to my landscape transformation',
			callback: function(toolOwner, tool) {
				Ext.data.StoreManager.lookup('dss-scenario-store').add({items: DSS_DefaultScenarioSetup});
				Ext.data.StoreManager.lookup('dss-scenario-store').commitChanges();
			}
		},' ',' ',{
			xtype: 'tool',
			type: 'gear',
		    baseCls: 'dss-tool',
		    disabledCls: 'dss-tool-disabled',
		    toolPressedCls: 'dss-tool-pressed',
		    toolOverCls: 'dss-tool-over',		
			width: 28, height: 28,
			tooltip: 'Calculate the outcomes for my landscape transformations',
			callback: function(toolOwner, tool) {
				Ext.getCmp('dss-scenario-grid').runJob();
				// TODO: actually run the simulation
				DSS_viewport.enableNavBar();
				Ext.defer(function() {
					DSS_viewport.virtualClickAnalyze();
				}, 1000);
			}
		}]
	}],
    bodyStyle: {'background-color': '#fafcff'},
	
    store: 'dss-scenario-store',
    enableColumnHide: false,
    enableColumnMove: false,
    sortableColumns: false,
    columnLines: true,
    
	plugins: [
		Ext.create('Ext.grid.plugin.CellEditing', {
			clicksToEdit: 2,
			listeners: {
				edit: {
					fn: function(editor, e) {
						// no real need for validation, but if we don't commit the changes,
						//	changed fields will show a red triangle in the corner...
						e.record.commit();
					//	var dssLeftPanel = Ext.getCmp('DSS_LeftPanel');
					//	dssLeftPanel.up().DSS_SetTitle(e.record.get('selection_name'));
					}
				}
			}
		})
	],
	viewConfig: {
		stripeRows: true,
		plugins: {
			ptype: 'gridviewdragdrop',
			dragText: 'Drag and drop transforms to reorder them'
		}
	},
	
	listeners: {
		cellclick: function(me, td, cellIndex, record, tr, rowIndex, e, eOpts) {
			if (cellIndex == 1 || cellIndex == 2) {
				var query = record.get('query');
				var name = record.get('selection_name')
				DSS_viewport.updateLayerBrowser(query, name, true);
			}
			if (cellIndex == 3) {
				var rectOfClicked = e.target.getBoundingClientRect();
				me.up().showTransformPopup(me, rowIndex, rectOfClicked);
			}
		},
		beforedeselect: function(me, record, index, eOpts) {
			var query = DSS_viewport.getLayerBrowserQuery();
			record.set('query', query);
			record.commit();
		},
		viewready: function(me, eOpts ) {
			/*var query = DSS_ViewSelectToolbar.buildQuery()
			var record = me.getStore().getAt(0);
			record.set('query', query);
			record.commit();
			*/
			//me.getSelectionModel().select(0);
	        var view = me.getView();
	        var t = Ext.create('Ext.tip.ToolTip', {
	            // The overall target element.
	            target: view.el,
	            // Each grid row causes its own separate show and hide.
	            delegate: view.cellSelector, // view.itemSelector seems to be set to table.x-grid-item
	            trackMouse: false,
	            defaultAlign: 'b50-t50',
	            anchor: true,
	            hideDelay: 25,
	            dismissDelay: 0,
	            showDelay: 0,
	            layout: 'vbox',
	            bodyPadding: 8,
	            items: [{
	            	xtype: 'container',
	            	margin: 2,
	            	html: 'Landcover Transformation',
	            	style: 'font-weight: bold; text-decoration: underline',
	            },{
	            	xtype: 'container',
	            	margin: '4 16',
	            	itemId: 'msg',
	            },{
	            	xtype: 'container',
	            	margin: 2,
	            	html: 'Management Practices',
	            	style: 'font-weight: bold; text-decoration: underline',
	            },{
	            	xtype: 'container',
	            	margin: '-8 2 2 -16',
	            	itemId: 'management',
	            	html: '<ul><li>50% synthetic fertilizer</li><li>50% Manure (fall spread)</li><li>Cover crop: alfalfa</li></ul>',
	            }],
	            // Render immediately so that tip.body can be referenced prior to the first show.
	            renderTo: Ext.getBody(),
	            listeners: {
	                // Change content dynamically depending on which element triggered the show.
	                beforeshow: function updateTipBody(tip) {
	                	if (!Ext.fly(tip.triggerElement).hasCls('dss-trx-col'))
	                		return false;
	                	var tt = tip.down('#msg');
	                	var trx_text = view.getRecord(tip.triggerElement).get('transform_text');
	                	if (!trx_text) {
	                		tt.update('click to choose...');
		                	tt = tip.down('#management');
		                	tt.update('<ul><li>click to choose...</li></ul>');
	                	} else {
	                		tt.update('To: ' + view.getRecord(tip.triggerElement).get('transform_text'));
		                	tt = tip.down('#management');
		                	tt.update(view.getRecord(tip.triggerElement).get('management_text'));
	                	}
	                }
	            }
	        });  
		}
	},
	//--------------------------------------------------------------------------
	columns: {
		items:[{
			xtype: 'actioncolumn',
			width: 32,
			resizable: false,
			align: 'center',
			dirtyText: null, // prevents addition of an unneeded DOM el
			iconCls: 'dss-inspect-icon',
			tooltip: 'View the effective selection for this tranform',
			handler: function(grid, rowIndex, colIndex) {
				var record = grid.getStore().getAt(rowIndex);
				
				// FIXME: sync the browser to prevent settings corruptions due to 
				//	listern 'beforedeselect' but don't let it actually query...
				var query = record.get('query');
				var name = record.get('selection_name')
				// FIXME: but then this still causes other weirdness. 
				//	like show occlusion but ALSO then show the filter query results
		//		DSS_viewport.updateLayerBrowser(query, name, false);

				grid.getSelectionModel().select([record]); // make record selected to make things less confusing IMO
				
				if (rowIndex > 0) {
					var queries1 = [];
					for (var i = 0; i < rowIndex; i++) {
						queries1.push({
							queryLayers: grid.getStore().getAt(i).get('query')
						});
					}
					var query2 = grid.getStore().getAt(rowIndex).get('query');
					Ext.getCmp('DSS_attributeFixMe').showOcclusion(queries1, {
						queryLayers: query2
					});
				}
				else {
					var query2 = grid.getStore().getAt(rowIndex).get('query');
					Ext.getCmp('DSS_attributeFixMe').showOcclusion(null, {
						queryLayers: query2
					});
				}
/*				var record = grid.getStore().getAt(rowIndex);
				grid.getSelectionModel().select([record]); // make record selected to make things less confusing IMO
				var query = record.get('query');
				if (query) {
					DSS.Layers.showOcclusion(null, query);
				}*/
			}
		},{
			xtype: 'rownumberer',
			text: 'Priority',
			align: 'center',
			dirtyText: null, // prevents addition of an unneeded DOM el
			width: 66,
		},{
			dataIndex: 'selection_name',
			text: 'User-Named Selection',
			flex: 1, 
		//	maxWidth: 280,
			resizable: false,
			editor: {
				xtype: 'textfield',
				allowBlank: false
			},
			renderer : function(value, meta, record) {
				if (value) {
        			meta.style = "color: #000";
        			return value;
    			} else {
        			meta.style = "color: RGBA(0,0,0,0.3)";
        			return DSS_EmptySelectionName;
    			}
    		},
			tdCls: 'dss-grey-scenario-grid'
		},{
			dataIndex: 'transform_text',
			text: 'Transforms & Managment',
			flex: 1, 
		//	maxWidth: 280,
			resizable: false,
			tdCls: 'dss-grey-scenario-grid dss-trx-col',
			renderer: function(value, meta, record) {
				if (!value) {
					meta.style = 'color: red';
					return DSS_EmptyTransformText;
				}
			//	meta.tdAttr = 'data-qtip=" wow stuff' + record.get("ManagementText") + '"';
				return value;
			}
		},{
			xtype: 'actioncolumn',
			width: 32,
			resizable: false,
			align: 'center',
			dirtyText: null, // prevents addition of an unneeded DOM el
			iconCls: 'dss-delete-icon',
			tooltip: 'Remove this transformation step',
			handler: function(grid, rowIndex, colIndex) {
				Ext.Msg.show({
					 title: 'Confirm Deleting this Transformation Step',
					 msg: 'Are you sure you want to delete this transformation step?',
					 buttons: Ext.Msg.YESNO,
					 icon: Ext.Msg.QUESTION,
					 fn: function(btn) {
					 	 if (btn == 'yes') {
							var record = grid.getStore().getAt(rowIndex);
							grid.getStore().remove(record);
							record.commit();
							var selModel = grid.getSelectionModel();
							if (selModel.selected.getCount() < 1) {
								selModel.select(0);
							}
					 	 }
					 }
				});
			}
		}]
	},

	//--------------------------------------------------------------------------
    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
        });

        me.callParent(arguments);
    },

	//--------------------------------------------------------------------------
	showTransformPopup: function(grid,rowIndex, rectOfClicked) {
		
		var record = grid.getStore().getAt(rowIndex);
		var transform = record.get('transform');
		var window = Ext.create('DSS.components.TransformPopup', {
			DSS_TransformIn: transform,
			listeners: {
				beforedestroy: function(win) {
					if (win.DSS_Transform) {
						record.set('transform', win.DSS_Transform.config);
						record.set('transform_text', win.DSS_Transform.text);
						record.set('management_text', win.DSS_Transform.m_text);
						record.commit();
					}
				}
			}});
		window.show();
		window.setPosition(rectOfClicked.left,
							(rectOfClicked.top - window.getSize().height),
							false);
	},
	
	//--------------------------------------------------------------------------
	prepareModelRequest: function() {
	
		var scCombo1 = Ext.getCmp('DSS_ScenarioCompareCombo_1').getValue();	
		var haveQuery = false;
		var requestData = {
			clientID: 1234, //temp
			modelRequestCount: this.DSS_modelTypes.length,
			compare1ID: scCombo1,//-1, // default
			assumptions: DSS_AssumptionsAdjustable.Assumptions,
			transforms: []
		};
		
		var clientID_cookie = Ext.util.Cookies.get('DSS_clientID');
		if (clientID_cookie) {
			requestData.clientID = clientID_cookie;
		}
		else {
			requestData.clientID = 'BadID';
			console.log('WARNING: no client id cookie was found...');
		}

		var saveID_cookie = Ext.util.Cookies.get('DSS_nextSaveID');
		if (saveID_cookie) {
			requestData.saveID = saveID_cookie;
		}
		else {
			requestData.saveID = 0;
			console.log('WARNING: no save id cookie was found...');
		}

		DSS_currentModelRunID = requestData.saveID;
		var record = DSS_ScenarioComparisonStore.findRecord('Index', DSS_currentModelRunID);
		if (record) {
			DSS_ScenarioComparisonStore.remove(record);
		}
		
		// Add the new record and select it in the combo box....
		DSS_ScenarioComparisonStore.add({'Index': DSS_currentModelRunID, 'scenario_name': 'Unstored Scenario Result'});
		DSS_ScenarioComparisonStore.commitChanges(); // FIXME: this necessary?
		Ext.getCmp('DSS_ScenarioCompareCombo_2').setValue(DSS_currentModelRunID);

		
		var st = this.getStore();
		for (var idx = 0; idx < st.getCount(); idx++) {
			var rec = st.getAt(idx);
			
			if (rec.get('Active')) {
				var query = rec.get('query');		
				if (query == null) {
					break;
				}
				
				var trx = rec.get('transform');
				if (trx == null) {
					trx = DSS_DefaultScenarioSetup.Transform; // blurf, set to corn....
				}
				
				var transform = {
					queryLayers: query.queryLayers,
					config: trx
				};
				requestData.transforms.push(transform);
				haveQuery = true;
			}
		}
		
//		console.log(requestData);
		if (haveQuery) {
			this.createScenario(requestData);
		}
		else {
			alert("No query built - nothing to query");
		}
	},
	
    //--------------------------------------------------------------------------
	createScenario: function(requestData) {
		
		var button = Ext.getCmp('DSS_runModelButton');
		button.setIcon('app/images/spinner_16a.gif');
		button.setDisabled(true);
		
		var self = this;
		var obj = Ext.Ajax.request({
			url: location.href + '/createScenario',
			jsonData: requestData,
			timeout: 10 * 60 * 1000, // minutes * seconds * (i.e. converted to) milliseconds
			
			success: function(response, opts) {
				
				try {
					var obj= JSON.parse(response.responseText);
//					console.log("success: ");
//					console.log(obj);
					var newRequest = requestData;
					newRequest.scenarioID = obj.scenarioID;
					self.submitModel(newRequest);
				}
				catch(err) {
					console.log(err);
				}
			},
			
			failure: function(respose, opts) {
				button.setIcon('app/images/go_icon.png');
				button.setDisabled(false);
				alert("Model run failed, request timed out?");
			}
		});
	},

    //--------------------------------------------------------------------------
    submitModel: function(queryJson) {
    	
    	var me = this;
//		console.log(queryJson);
		var button = Ext.getCmp('DSS_runModelButton');
		
		// NOTE: these strings MUST be synchronized with the server, or else the server will
		//	not know which models to run. FIXME: should maybe set this up in a more robust fashion?? How?
		
		var requestCount = me.DSS_modelTypes.length;
		var successCount = 0;
		
		Ext.getCmp('DSS_ReportDetail').setWaitFields();
		Ext.getCmp('DSS_SpiderGraphPanel').clearSpiderData(0);// set all fields to zero
		// Disable the save button until all models complete...
		Ext.getCmp('DSS_ScenarioSaveButton').setDisabled(true);

		for (var i = 0; i < me.DSS_modelTypes.length; i++) {
			var request = queryJson;
			request.modelType = me.DSS_modelTypes[i];
			
			var obj = Ext.Ajax.request({
				url: location.href + '/modelCluster',
				jsonData: request,
				timeout: 10 * 60 * 1000, // minutes * seconds * (i.e. converted to) milliseconds
				
				success: function(response, opts) {
					
					try {
						var obj= JSON.parse(response.responseText);
//						console.log("success: ");
//						console.log(obj);
						Ext.getCmp('DSS_ReportDetail').setData(obj);
					}
					catch(err) {
						console.log(err);
					}
					var reportPanel = Ext.getCmp('DSS_report_panel');
					if (reportPanel.getCollapsed() != false) {
						reportPanel.expand();
					}
					requestCount--;
					successCount++;
					if (requestCount <= 0) {
						button.setIcon('app/images/go_icon.png');
						button.setDisabled(false);
						
						// Only enable save button if all models succeed?
						if (successCount >= me.DSS_modelTypes.length) {
							Ext.getCmp('DSS_ScenarioSaveButton').setDisabled(false);
						}
					}
				},
				
				failure: function(respose, opts) {
					requestCount--;
					if (requestCount <=0) {
						button.setIcon('app/images/go_icon.png');
						button.setDisabled(false);
						alert("Model run failed for: '" + request.modelType 
								+ "', request timed out?");
					}
				}
			})
		}
    },

    //----------------------------------------------------------------------------------
    runJob: function() {
    	
    	var me = this;
    	Ext.Ajax.request({
			url: location.href + '/requestModelRun',
			jsonData: {
				"transforms": baseExample
			},
			timeout: 10 * 60 * 1000, // minutes * seconds * (i.e. converted to) milliseconds
			
			success: function(response, opts) {
				try {
					var obj= JSON.parse(response.responseText);
					console.log(obj);
					me['dss-job-timer'] = Ext.TaskManager.start({
						run: me.checkDone,
						scope: me,
						interval: 1000
					});
					me['dss-job-parms'] = obj;
				}
				catch(err) {
					console.log(err);
				}
			},
			
			failure: function(respose, opts) {
				alert("Model run failed");
			}
		})
    },
    
    //----------------------------------------------------------------------------------
    checkDone: function() {
    	var me = this;
    	var jobKey = me['dss-job-parms'].jobKey;
    	
    	console.log("checking done-ness for key: " + jobKey);
    	Ext.Ajax.request({
			url: location.href + '/getModelRunProgress',
			jsonData: {
				"jobKey": jobKey,
			},
			timeout: 10 * 60 * 1000, // minutes * seconds * (i.e. converted to) milliseconds
			
			success: function(response, opts) {
				try {
					var obj= JSON.parse(response.responseText);
					if (obj && obj.done) {
						console.log(me['dss-job-timer']);
						Ext.TaskManager.stop(me['dss-job-timer']);
//						clearInterval(me['dss-job-timer']);
						me.getResults();
					}
				}
				catch(err) {
					console.log(err);
				}
			},
			
			failure: function(respose, opts) {
				alert("Model progress failed");
			}
		})
    },
    
    //----------------------------------------------------------------------------------
    getResults: function() {
    	var me = this;
    	var parms = me['dss-job-parms'];
    	
    	console.log("getting results: " + parms.jobKey);
    	Ext.Ajax.request({
			url: location.href + '/getModelRunResults',
			jsonData: parms,
			timeout: 10 * 60 * 1000, // minutes * seconds * (i.e. converted to) milliseconds
			
			success: function(response, opts) {
				try {
					var obj= JSON.parse(response.responseText);
					console.log(obj);
				}
				catch(err) {
					console.log(err);
				}
			},
			
			failure: function(respose, opts) {
				alert("Model results failed");
			}
		})
    }
    
    
});

