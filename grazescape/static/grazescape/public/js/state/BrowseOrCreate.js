//------------------------------------------------------------------------------
Ext.define("DSS.state.BrowseOrCreate", {
	//------------------------------------------------------------------------------
	extend: "Ext.Container",
	alias: "widget.operation_browse_create",
	layout: DSS.utils.layout("vbox", "center", "stretch"),
	cls: "section",

	initComponent: function () {
		let me = this;

		const farms = DSS.layer.farms_1.getSource().getFeatures().filter(function(farm){
			if(!farm.get("region")) return true;
			return selectedRegion.get("Name") == farm.get("region") || selectedRegion.get("NAME") == farm.get("region");
		});
		console.log("Farms:", farms);
		console.log("Selected Region:", selectedRegion);

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
					cls: "information",
					html: "Available farms:",
					margin: '16 0 0 0'
				},
				{   
					xtype: "menu",
					width: 80,
					scrollable: true,
					id: "farmsMenu",
					floating: false,
					listeners: {
						click: async function (menu, item, e, eOpts) {
							let menuItems = Ext.getCmp("farmsMenu").items.items;
							for (i in menuItems) {
								if (menuItems[i].id == item.id) {
									menuItems[i].setStyle({
										backgroundColor: "#d2e9fa",
									});
								} else {
									menuItems[i].setStyle({
										backgroundColor: "white",
									});
								}
							}
							DSS.activeFarm = item.farm_id;
							DSS.farmName = item.farm_name;
							console.log("Active farm is:", item.farm_id);
							Ext.getCmp("editCurFarm")?.setDisabled(false);
						}
					},
					items: farms.map(function(f){
						return {
							text: `${f.values_.farm_name} <i>${f.values_.farm_owner}</i>`,
							farm_id: f.values_.gid,
							farm_name: f.values_.farm_name
						};
					})
				},
				{
					xtype: "button",
					cls: "button-text-pad",
					id: "editCurFarm",
					componentCls: "button-margin",
					text: "Edit Selected Farm",
					disabled: true,
					handler: function () {
						var farmFeature = DSS.layer.farms_1.getSource().getFeatures()
							.find(f => f.values_.gid == DSS.activeFarm);

						if(!farmFeature) {
							console.error("Couldn't find farm!");
							return;
						}
						DSS.MapState.editSelectedFarm(farmFeature.getGeometry());
					}
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
