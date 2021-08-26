Ext.create('Ext.data.Store', {
	storeId: 'dss-assumption-years',
	fields: ['year'],
	data: [{
		year: '2008'},{
		year: '2012'},{
		year: '2016'},{
		year: '2017'},{
		year: '2018'
	}]
});

Ext.create('Ext.data.Store', {
	storeId: 'dss-assumptions',
	fields: ['id', 'category', 'item', 'value'],
	data: [{ 
		id:'mp-cg',category:'Market Price',item:'Corn Grain',value:220.2},{
		id:'mp-cs',category:'Market Price',item:'Corn Stover',value:45.0},{
		id:'mp-s',category:'Market Price',item:'Soybeans',value:350.0},{
		id:'mp-a',category:'Market Price',item:'Alfalfa',value:100.0},{
		id:'mp-w',category:'Market Price',item:'Wheat',value:140.0},{
		id:'mp-gfb',category:'Market Price',item:'Grass-Fed Beef',value:156.1},{
		id:'mp-cb',category:'Market Price',item:'Conventional Beef',value:134.2},{
		id:'mp-gfm',category:'Market Price',item:'Grass-Fed Milk',value:15.4},{
		id:'mp-cm',category:'Market Price',item:'Conventional Milk',value:12.2},{
		id:'mp-b',category:'Market Price',item:'Biofuel',value:12.2},{
		
		id:'pc-cg',category:'Production Cost',item:'Corn Grain',value:100.2},{
		id:'pc-s',category:'Production Cost',item:'Soybeans',value:120.0},{
		id:'pc-a',category:'Production Cost',item:'Alfalfa',value:50.0},{
		id:'pc-w',category:'Production Cost',item:'Wheat',value:100.0},{
		id:'pc-gfb',category:'Production Cost',item:'Grass-Fed Beef',value:100},{
		id:'pc-cb',category:'Production Cost',item:'Conventional Beef',value:121},{
		id:'pc-gfm',category:'Production Cost',item:'Grass-Fed Milk',value:9.2},{
		id:'pc-cm',category:'Production Cost',item:'Conventional Milk',value:10.2},{
		
		id:'bce-cg',category:'Biofuel Conversion Efficiency',item:'Corn Grain',value:0.8},{
		id:'bce-cs',category:'Biofuel Conversion Efficiency',item:'Corn Stover',value:0.4},{
		id:'bce-s',category:'Biofuel Conversion Efficiency',item:'Soybeans',value:0.6},{
		id:'bce-a',category:'Biofuel Conversion Efficiency',item:'Alfalfa',value:0.5},{
		id:'bce-w',category:'Biofuel Conversion Efficiency',item:'Wheat',value:0.2},{
		id:'bce-g',category:'Biofuel Conversion Efficiency',item:'Grass',value:0.6
	}]
});

//------------------------------------------------------------------------------
Ext.define('DSS.app_portal.Assumptions', {
//------------------------------------------------------------------------------
	extend: 'Ext.panel.Panel',
	alias: 'widget.assumptions',

	floating: true,
	width: 380,
	height: 1,
	layout: 'fit',
	bodyPadding: '16 32',
	title: 'Review and Adjust Assumptions',
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				layout: {
					type: 'vbox',
					align: 'end',
				},
				items: [{
					xtype: 'combo',
					store: 'dss-assumption-years',
				    fieldLabel: 'Assign from historical year',
				    labelWidth: 180,
				    width: 290,
				   // height: 32,
				    padding: '0 0 8 0',
				    labelAlign: 'right',
				    queryMode: 'local',
				    displayField: 'year',
				    valueField: 'year',
				    value: '2018'
				},{
					xtype: 'grid',
					width: '100%',
					flex: 1,
				    selModel: 'cellmodel',
				    plugins: {
				        ptype: 'cellediting',
				        clicksToEdit: 1
				    },				
					store: 'dss-assumptions',
					columns:[{
						text: 'Category', dataIndex: 'category', flex: 4
					},{
						text: 'Item', dataIndex: 'item', flex: 3,
					},{
						xtype: 'numbercolumn',text: 'Value', 
						dataIndex: 'value', flex: 1, format: '0,000.####', editor: 'numberfield'
					}],
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
});
