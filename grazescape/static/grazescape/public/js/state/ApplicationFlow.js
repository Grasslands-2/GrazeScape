

DSS.utils.addStyle('.info-panel { border-left: 1px solid #222;  border-bottom: 1px solid rgba(0,0,0,0.25); background-color: #555; background-repeat: no-repeat; background-image: linear-gradient(to right, #333 0%, #3f3f3f 25%, #4a4a4a 50%, #535353 80%, #555 100%); background-size: 2rem 100%;');
DSS.utils.addStyle('.x-resizable-handle-west {width: 6px; background-color: rgba(255,255,255,0.25)}');
DSS.utils.addStyle('.box-label-cls {color: #eee; text-shadow: 0 1px rgba(0,0,0,0.2),1px 0 rgba(0,0,0,0.2); font-size: 0.9rem}');
DSS.utils.addStyle('.small {  font-size: 1rem}');
DSS.utils.addStyle('.light-color {color: #bbb; text-shadow: 0 1px rgba(0,0,0,0.3),1px 0 rgba(0,0,0,0.2);}');
DSS.utils.addStyle('.drop {overflow: visible!important}');
DSS.utils.addStyle('.drop:after {overflow: visible!important; display: block; position: absolute; bottom: -8px; left: calc(50% - 8px); content: ""; background-color: transparent; border-top: 8px solid #666; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent;}');

DSS.utils.addStyle('.accent-text { color: #48b;}')
DSS.utils.addStyle('.light-text { color: #ddd;}')
DSS.utils.addStyle('.med-text { color: #444;}')
DSS.utils.addStyle('.left1-text { text-align: left; color: #999;}')
DSS.utils.addStyle('.box {box-sizing: border-box; float: left; width: 50%; height: 50%;}')
DSS.utils.addStyle('.custom-tab {.x-panel-body-default {border-width: 0px;}}')
DSS.utils.addStyle('.text-drp-20 { text-shadow: 0 1px rgba(0,0,0,0.2)}');
DSS.utils.addStyle('.text-drp-50 { text-shadow: 0 1px rgba(0,0,0,0.3),1px 0 rgba(0,0,0,0.2)}');
DSS.utils.addStyle('.font-10 { font-size: 1rem }');
DSS.utils.addStyle('.font-9 { font-size: 0.9rem }');
DSS.utils.addStyle('.bold { font-weight: bold}');
DSS.utils.addStyle('.box-underline { border-bottom: 1px solid rgba(0,120,180,0.5) }');

DSS.utils.addStyle('.x-mask { background-color: rgba(102,102,102,0.6);}')
DSS.utils.addStyle('.footer-text {border-top: 1px solid rgba(0,0,0,0.15); background: #6F6E67;padding: 0.72rem; color: #fff; font-size: 0.8rem; text-align: center}')

DSS.utils.addStyle('.button-margin { margin: 0.5rem 1.75rem 0.75rem;}')
DSS.utils.addStyle('.button-margin-large { margin: 0.5rem 0.5rem 0.5rem;}')
DSS.utils.addStyle('.button-text-pad { padding: 0.33rem;}')
DSS.utils.addStyle('.button-text-pad-large { padding: 0.2rem;}')

DSS.utils.addStyle('.information-scenlabel { padding: 0.5rem 0 0.25rem 0; font-size: 1.1rem; text-align: center; font-weight: bold}')
DSS.utils.addStyle('.information { padding: 0.5rem 0 0.25rem 0; font-size: 0.9rem; text-align: center}')
DSS.utils.addStyle('.information-compact { padding: 0.1rem 0 0.1rem 0; font-size: 0.9rem; text-align: center}')
DSS.utils.addStyle('.section-title { padding: 0.5rem; font-size: 1.1rem; text-align: center; font-weight: bold}');
DSS.utils.addStyle('.section { margin: 0.5rem; margin-bottom: 1rem; padding: 0.75rem; background-color: #fff; border: 1px solid #bbb; border-radius: 0.3rem; box-shadow: 0px 4px 8px rgba(0,0,0,0.25) }')

DSS.utils.addStyle('.back-button { padding: 0.23rem; color: rgba(34,114,204,0.5); font-size: 1.25rem; cursor: pointer;}');
DSS.utils.addStyle('.back-button:hover { color: rgba(40,120,220,1); text-shadow: 0 1px 0 rgba(0,0,0,0.8)');

// Section that roughly corresponds to the left portion of the application. This area will contain logos, titles, controls, etc
//	and generally be the starting point/container for controlling the entire application flow...whereas the remainder of the
//	application space will contain (primarily) the map display but will be switched out as needed for charts/reports/other.

//------------------------------------------------------------------------------
Ext.define('DSS.state.ApplicationFlow', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.application_flow',

	requires: [
		'DSS.state.ScenarioPicker',
		'DSS.state.MapStateTools',
		'DSS.state.BrowseOrCreate',
		'DSS.state.RegionPickerPanel',
		'DSS.state.CreateNew_wfs',
		'DSS.state.DeleteOperation',
		'DSS.state.Manage',
		'DSS.state.Scenario',
		'DSS.map.RegionPickerIndicator'
	],
	
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),

	DSS_minTitleHeight: 64,
	
	listeners: {
		afterrender: function(self) {
			self.showLandingPage()
		}
	},
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;
		DSS['ApplicationFlow'] = {instance: me};
		me.DSS_App = {};
		
		if (!DSS['viewModel']) DSS['viewModel'] = {}
		
		DSS.viewModel.master = new Ext.app.ViewModel({
			formulas: {
				browse_or_create: {
					bind: '{farm_count}',
					get: function(ct) {
						if (ct < 1) {
							return 'Start by creating a new operation'
						}
						return 'Select <i class="accent-text fas fa-hand-pointer"></i>' + 
						' an operation on the map... or create a new one'
					}
				}
			},
			data: {
				farm_count: 0
			}
		});
		
		me.setViewModel(DSS.viewModel.master);

		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				
				// Top Section (Logo, Titles, MenuWidgets, and general application flow controls)
				//----------------------------------------------------------------------------------
				items: [
				{
					xtype: 'component',
					height: 80,
					style: 'background-image: url("/static/grazescape/public/images/GrazeScape-icon-title.png"); background-size: contain; background-repeat: no-repeat',
				},
				{
					xtype: 'component',
					html: '  v 1.0',
					cls: 'information med-text',
				},
			]
			},{
				// Container for controls necessary at each step in the application flow
				//----------------------------------------------------------------------------------
				xtype: 'container',
				scrollable: true,
				flex: 1,
				listeners: {
					afterrender: function(self) { me.DSS_App['FlowContainer'] = self }
				}			
			},
			{
				// Footer, possibly should hide when not on the "landing" portion of the grazescape application 
				//----------------------------------------------------------------------------------
				xtype: 'component',
				cls: 'footer-text',
				html: 'GrazeScape<br>Copyright ©2023'
			}]
		});
		
		me.callParent(arguments);

		//----------------------------------------------------------------------------------
		window.onhashchange = function() {
			event.preventDefault();
			event.stopPropagation();
		}		
	},
	
	//----------------------------------------------------------------------------------
	setControlBlock: function(extDef) {
		let me = this;
		me.DSS_App.FlowContainer.removeAll();
		me.DSS_App.FlowContainer.add(extDef);
	},
	
	// SHOW Operation management page -------------------------------------------------------------------
	showFarmPickerPage: function() {
		let me = this;
		console.log('IM THE FARM PICKER PAGE!!')
		
		Ext.suspendLayouts();
		//This sets the opertion browse panel in the landing page.  Change this to a region picker menu
		me.setControlBlock({xtype:'operation_browse_create'});

		Ext.resumeLayouts(true);
		
		DSS.MapState.activateFarmsMapHandlers();
		DSS.MapState.zoomToExtent();
		
		DSS.MapState.disableFieldDraw();
		
		DSS.layer.farms_1.setVisible(true);
		DSS.layer.farms_1.setOpacity(1);
		DSS.layer.markers.setVisible(false);
	},
	//----------------------------------------------------------------------------------
	showLandingPage: function() {
		let me = this;
		console.log('IM THE LANDING PAGE!!')
		
		Ext.suspendLayouts();

		me.setControlBlock({xtype:'region_picker_panel'});
		Ext.resumeLayouts(true);
		
		DSS.MapState.zoomToExtent();
		DSS.MapState.disableFieldDraw();
		DSS.MapState.deactivateFarmsMapHandlers();
		
		DSS.layer.farms_1.setVisible(true);
		DSS.layer.farms_1.setOpacity(1);
		DSS.layer.markers.setVisible(false);
		DSS.allRegionLayers.forEach(layer => layer.setVisible(true));
		
		//Region Picker 
		DSS.MapState.activateRegionSelect();
		AppEvents.triggerEvent('show_region_picker_indicator')
		DSS.layer.regionLabels.setVisible(true)
		DSS.layer.farms_1.setVisible(false)
	},
	
	//----------------------------------------------------------------------------------
	showNewOperationPage: function() {
		let me = this;
		
		Ext.suspendLayouts();
			me.setControlBlock({xtype:'operation_create'});
			DSS.mouseMoveFunction = DSS.MapState.mouseoverFarmHandler();
			DSS.layer.farms_1.setOpacity(0.5);
		Ext.resumeLayouts(true);
	},

	//----------------------------------------------------------------------------------
	showDeleteOperationPage: function() {
		let me = this;
		
		Ext.suspendLayouts();
			me.setControlBlock({xtype:'operation_delete'});

			DSS.mouseMoveFunction = DSS.MapState.mouseoverFarmHandler();

			DSS.mapClickFunction = undefined;
			DSS.layer.farms_1.setOpacity(0.5);
		Ext.resumeLayouts(true);
	},
	
	//----------------------------------------------------------------------------------
	showManageOperationPage: function() {
		let me = this;
		
		Ext.suspendLayouts();
			me.setControlBlock([	
				DSS.OperationManage.get()
			]);
		Ext.resumeLayouts(true);
		
		DSS.MapState.deactivateFarmsMapHandlers();
		DSS.MapState.showNewFarm();
		DSS.popupOverlay.setPosition(false);
	},

	//----------------------------------------------------------------------------------
	showScenarioPage: async function() {
		let me = this;
		await gatherScenarioTableData()
		Ext.suspendLayouts();
		me.setControlBlock([	
			DSS.StateScenario.get()
		]);
		Ext.resumeLayouts(true);
		DSS.MapState.deactivateFarmsMapHandlers();
	},
});
