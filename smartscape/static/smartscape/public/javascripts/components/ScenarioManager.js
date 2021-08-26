
//-----------------------------------------------------
// DSS.components.ScenarioManager
//
//-----------------------------------------------------
Ext.define('DSS.components.ScenarioManager', {
    extend: 'Ext.container.Container',
    alias: 'widget.scenario_manager',
 
    requires: [
        'DSS.components.ScenarioGrid'
    ],
    id: 'dss-scenario-manager',
    
    padding: 6,
    layout: {
    	type: 'vbox',
    	align: 'stretch'
    },
  //  hidden: true,
    width: 660,
    resizable: true,
    resizeHandles: 'n',
    height: 172,
    maxHeight: 300,
    minHeight: 172,
	style: 'background: rgba(48,64,96,0.8); border: 1px solid #256;border-radius: 16px; box-shadow: 0 10px 10px rgba(0,0,0,0.4)' ,
	
	listeners: {
		resize: function() {
			DSS_viewport.positionStatistics();
		}
	},
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items:[{
				xtype: 'component',
				style: 'color: #fff; font-size: 1.1em; font-weight: bold; text-shadow: 1px 1px 1px #000',
				html: 'Transform Matched Land...',
				padding: '2 0 4 8'
			},{
				xtype: 'scenario_grid',
				flex: 1
			}]
		});
		
		me.callParent(arguments);
	},
	
});