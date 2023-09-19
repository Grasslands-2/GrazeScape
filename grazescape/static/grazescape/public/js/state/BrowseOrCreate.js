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
          xtype: "component",
          cls: "section-title accent-text",
          html: "Farm Operations",
        },
        {
          xtype: "component",
          cls: "information med-text",
          html: "Start by creating a new operation.",
        },
        {
          xtype: "button",
          cls: "button-text-pad",
          componentCls: "button-margin",
          text: "Create New Farm",
          tooltip: "Create a new operation to base scenarios on",
          handler: function () {
            geoServer.setScenariosSource();
            DSS.ApplicationFlow.instance.showNewOperationPage();
            DSS.MapState.removeMapInteractions();
          },
        },
        {
          xtype: "component",
          cls: "information med-text",
          html: "Delete one of your current farms.",
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
        },
        {
          xtype: "component",
          cls: "information med-text",
          html: "Choose a different region to work in.",
        },
        {
          xtype: "button",
          cls: "button-text-pad",
          componentCls: "button-margin",
          text: "Choose Region",
          tooltip: "Go back a step and pick out another region to work in",
          handler: function () {
            fieldZoom = false;
            DSS.ApplicationFlow.instance.showLandingPage();
          },
        },
        {
          xtype: "component",
          cls: "information med-text",
          html: "Or Click on one of your an existing operations!",
        },
      ],
    });

    me.callParent(arguments);
  },
});
