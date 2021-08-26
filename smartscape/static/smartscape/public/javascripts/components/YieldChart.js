Ext.create('Ext.data.Store', {
	storeId: 'chartData',
	fields: ['stage', 'corn', 'soy', 'grass', 'alfalfa'],
	data: [{ 
		stage: '-', corn: 90.0, soy: 18.9, grass: 120.0, alfalfa: 34.2 
	},{
		stage: 'Market', corn: 90.6, soy: 10.0, grass: 120.1, alfalfa: 34.2
	},{
		stage: 'Biofuels', corn: 40.0, soy: 10.0, grass: 70.0, alfalfa: 34.2
	},{
		stage: 'Dairy', corn: 10.0, soy: 6.0, grass: 40.0, alfalfa: 12.0
	},{
		stage: 'Beef', corn: 2.0, soy: 3.0, grass: 20.0, alfalfa: 8.0
	}]
});

Ext.define('DSS.components.YieldChart', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.yieldchart',

    margin: 8,
    bodyPadding: 8,
	title: 'Yield Remaining (tons)',
	height: 460,
	layout: 'fit',

	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'cartesian',
				insetPadding: 40,
				store: 'chartData',
				legend: {
					docked: 'bottom'
				},
		        axes: [{
		            type: 'numeric',
		            fields: ['corn','soy','grass','alfalfa'],
		            position: 'left',
		            grid: true,
		            minimum: 0
		        }, {
		            type: 'category',
		            fields: 'stage',
		            position: 'bottom',
		            grid: true,
		            label: {
		                rotate: {
		                    degrees: -45
		                }
		            }
		        }],				
		        series: [{
		        	type: 'area',
		        	title: [ 'Corn', 'Soy', 'Grass', 'Alfalfa' ],
		        	xField: 'stage',
		        	yField: [ 'corn', 'soy', 'grass', 'alfalfa' ],
		        	style: {
		        		opacity: 0.80
		        	},
		        	marker: {
		        		opacity: 0,
		        		scaling: 0.01,
		        		fx: {
		        			duration: 200,
		        			easing: 'easeOut'
		        		}
		        	},
		        	highlightCfg: {
		        		opacity: 1,
		        		scaling: 1.5
		        	}
		        }]				
			}]
		});
		
		me.callParent(arguments);
	},
	
});

