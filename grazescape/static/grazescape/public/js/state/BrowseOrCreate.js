//------------------------------------------------------------------------------
Ext.define("DSS.state.BrowseOrCreate", {
	//------------------------------------------------------------------------------
	extend: "Ext.Container",
	alias: "widget.operation_browse_create",
	layout: DSS.utils.layout("vbox", "center", "stretch"),
	cls: "section",

	initComponent: function () {
		let me = this;

		Ext.applyIf(me, {
			defaults: {
				margin: "1rem",
			},
			items: [
				{
					xtype: 'container',
					layout: DSS.utils.layout('hbox', 'start', 'begin'),
					items: [{
						xtype: 'component',
						cls: 'back-button',
						tooltip: 'Back',
						html: '<i class="fas fa-reply"></i>',
						listeners: {
							render: function(c) {
								c.getEl().getFirstChild().el.on({
									click: function(self){
										DSS.ApplicationFlow.instance.showLandingPage();
									},
								});
							}
						}					
					},{
						xtype: "component",
						cls: "section-title accent-text",
						html: "Farm Operations",
					}]
				},
				{
					xtype: "component",
					cls: "information med-text",
					html: "Start by creating a new farming operation, or click on an existing farm to continue.",
				},
				{
					xtype: "button",
					cls: "button-text-pad",
					componentCls: "button-margin",
					text: "Create New Farm",
					tooltip: "Create a new operation to base scenarios on. ",
					handler: function () {
						geoServer.setScenariosSource();
						DSS.ApplicationFlow.instance.showNewOperationPage();
						DSS.MapState.removeMapInteractions();
					},
				},
				{
					xtype: "component",
					cls: "information med-text",
					html: "Delete an existing farm and all its scenarios."
				},
				{
					xtype: "button",
					cls: "button-text-pad",
					componentCls: "button-margin",
					text: "Delete Farm",
					tooltip: "Delete a farm and all its scenarios",
					handler: function () {
						//Make sure all the features are on the table.
						geoServer.setFieldSource();
						geoServer.setFarmSource();
						geoServer.setInfrastructureSource();
						geoServer.setScenariosSource();
						DSS.ApplicationFlow.instance.showDeleteOperationPage();
						DSS.MapState.removeMapInteractions();
						selectOperation();
					},
				}
			],
		});

		me.callParent(arguments);
	},
});
