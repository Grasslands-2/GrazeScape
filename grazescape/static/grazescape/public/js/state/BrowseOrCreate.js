

//------------------------------------------------------------------------------
Ext.define('DSS.state.BrowseOrCreate', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.operation_browse_create',

	layout: DSS.utils.layout('vbox', 'center', 'stretch'),
	cls: 'section',

	DSS_singleText: '"Start by creating a new operation"',
					
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		Ext.applyIf(me, {
			defaults: {
				margin: '1rem',
			},
			items: [{
				xtype: 'component',
				cls: 'section-title accent-text',
				html: 'Farm Operations'
			},{ 
				xtype: 'container',
				layout: DSS.utils.layout('vbox', 'center', 'stretch'),
				items: [{
					xtype: 'component',
					cls: 'information med-text',
					bind: {
						html: '{browse_or_create}',
					},
					html: me.DSS_singleText
				},{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Create New',
					handler: function() {
						DSS.ApplicationFlow.instance.showNewOperationPage();
						DSS.MapState.removeMapInteractions();
					}
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Delete Operation',
					handler: function() {
						DSS.ApplicationFlow.instance.showDeleteOperationPage();
						DSS.MapState.removeMapInteractions();
						selectOperation();
					}
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'test dashboard',
					handler: function() {
					    var test_data = {"scenario 1":
                            {
                            "fields":[{
                                "field 1": {
                                    "erosion":{"units":"tons / acre","mean":1},
                                    "PL": {"units":"tons","mean":1},
                                    "yield":{"units":"tons","mean":1, "type":"grass"}

                                },
                                "field 5": {
                                    "erosion":{"units":"tons / acre","mean":1},
                                    "PL": {"units":"tons","mean":1},
                                    "yield":{"units":"tons","mean":1, "type":"grass"}
                                }

                                }],

                                "Farm": {
                                    "erosion":{"units":"tons / acre","mean":1},
                                    "PL": {"units":"tons","mean":1},
                                    "yield":{"units":"tons","mean":1, "type":"grass"}

                                }
                            },

                        }
                        if (!DSS.dialogs) DSS.dialogs = {};
                        if (!DSS.dialogs.PerimeterDialog) {
                            DSS.dialogs.PerimeterDialog = Ext.create('DSS.results.Dashboard', {
                                numberOfLines: 20,
                                inputData:test_data,
                                runModel:true,
                                // any other option you like...
                            });
                            DSS.dialogs.PerimeterDialog.setViewModel(DSS.viewModel.scenario);

                        }
                        DSS.dialogs.PerimeterDialog.show().center();


					}
				}]
			}]
		});
		
		me.callParent(arguments);
	}

});
