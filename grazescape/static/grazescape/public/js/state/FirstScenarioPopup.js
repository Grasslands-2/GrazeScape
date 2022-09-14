
//------------------------------------------------------------------------------
Ext.define('DSS.state.FirstScenarioPopup', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_first_scenario_popup',
	
	autoDestroy: false,
	closeAction: 'hide',
	constrain: true,
	modal: true,
	width: 832,
	resizable: false,
	bodyPadding: 8,
	titleAlign: 'center',
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		console.log("hit popup")
		let me = this;
		//getWFSScenarioNS()
		Ext.applyIf(me, {
			items: [{
					xtype: 'container',
					width: '100%',
					layout: 'absolute',
					items: [{
						xtype: 'component',
						x: 0, y: -6,
						width: '100%',
						height: 28,
						cls: 'information accent-text bold',
						title: 'You Started a New Farm on GrazeScape!'
						//html: "Choose From the Scenarios Below",
					}],
					
				},{ //------------------------------------------
					xtype: 'component',
					//id: 'scenIDpanel',
					cls: 'information',
					html: "You just created your first scenario for your new farm!  Next step is to add in your fields and infrastructure.  You can do so with the options under the Add/Delete Fields and Add/Delete Infrastructure buttons.  Once you have added your fields and infrastructure you can then edit their attributes in a table format by clicking the 'Edit Field Attributes' and 'Edit Infrastructure Attributes' buttons. You can also adjust your scnearios seed, pesticide, and machinery costs by clicking the 'Edit Scenario Costs' button.  Once you have all of your fields and costs set up properly for your scenario, you can then the models by clicking the 'Run Models' button",
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'OK',
					formBind: true,
					handler: async function() { 
						console.log('new scenario button pushed')
						this.up('window').destroy();
					}
				}]
		});
		me.callParent(arguments);
		AppEvents.registerListener("viewport_resize", function(opts) {
		//	me.center();
		})
	},
	
});
