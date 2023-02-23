
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
					width: '70%',
					layout: 'absolute',
					items: [{
						xtype: 'component',
						x: 0, y: -6,
						width: '70%',
						height: 28,
						cls: 'information accent-text bold',
						title: 'You Started a New Farm on GrazeScape!'
						//html: "Choose From the Scenarios Below",
					}],
					
				},{ //------------------------------------------
					xtype: 'component',
					//id: 'scenIDpanel',
					//cls: 'information',
					//html: 'You just created your first scenario for your new farm! The next step is to add in your fields by clicking on “Add/Delete Fields”. Once you have added your fields you can edit their attributes in a table by clicking “Edit Field Attributes”. Similarly, you can add in any infrastructure (e.g., fencing) if applicable (not required). You can also adjust production cost assumptions by clicking “Edit Production Costs”. Once you have all of your fields set up properly for your scenario, you can then run the models by clicking “Run Models”.',
					html:'<b>You just named the first scenario of your new farm.<b/> <ul> <li>Next, add fields (required) and infrastructure (optional)</li>  <li>After fields are added, edit their management with “Edit Field Attributes”</li> <li>You can edit infrastructure with “Edit Infrastructure Attributes”</li> <li>You can also adjust seed, pesticide, fertilizer and machinery costs with “Edit Production Costs”</li> <li>Click “Run Models”</li></ul>'
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
