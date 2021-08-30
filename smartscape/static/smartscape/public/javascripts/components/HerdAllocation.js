Ext.create('Ext.data.Store', {
    storeId: 'service',	
    fields: ['type'],
    data: [{
    	type: 'Dairy'
    },{
    	type: 'Beef'
    },{
    	type: 'Bacon'
    }]
});

Ext.create('Ext.data.Store', {
    storeId: 'herd',	
    fields: ['numcows', 'service', 'ration'],
    data: [{
    	numcows: 300, service: 'Beef', ration: '90% Grassfed'
    },{
    	numcows: 950, service: 'Dairy', ration: '90% Grassfed'
    },{
    	numcows: 450, service: 'Beef', ration: '75% CS, 25% AG Hay'
    },{
    	numcows: 400, service: 'Pork', ration: '70% CG, 30% Soy'
    },{
    	numcows: '+', service: '-', ration: '-'
    }]
});

Ext.define('DSS.components.HerdAllocation', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.herd',

    margin: 8,
    bodyPadding: 8,
	title: 'Herd Allocation',
	layout: {
		type: 'hbox',
		align: 'stretch',
		pack: 'start'
	},

	//[error] application - CornYield: 54,063,530   	cells: 6,584,370	$240	82,803.4a
	//[error] application - CornStoverYield: 54,063,530 cells: 6,584,370	$50		82,803.4a
	//[error] application - SoyYield: 6,044,764  		cells: 2,046,833	$400	21,373.4a
	//[error] application - SoyResidueYield: 9,067,146  cells: 2,046,833	$400	21,373.4a
	//[error] application - GrassYield: 50,261,140  	cells: 6,269,113	$100	63,068.2a
	//[error] application - AlfalfaYield: 10,960,000  	cells: 1,259,446	$254	24,484.5a
	// corn prod cost $1135
	// corn stover cost  $412
	// soy cost  $412
	// grass cost $620
	// alfalfa cost $627
	// current = $59.717 million	74.594 million Gal/yr
	// scenario = $59.369 million	75.060 million Gal/yr
	
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		var ht = 48, width = 300, labelWidth = 120;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'tabpanel',
				items: [{
					title: 'Simple',
					margin: '0 4 0 0',
					width: width,
					items: [{
						xtype: 'container',
						height: 32,
						items: [{
							xtype: 'slider',
							itemId: 'numCows',
							fieldLabel: '# Cows',
							labelAlign: 'right',
							minValue: 0,
							maxValue: 14000,
							increment: 50,
							labelWidth: labelWidth,
							width: width,
							listeners: {
								change: function(self) {
									me.DSS_CalculatorContainer.calculateResults();
								}
							}
						}]
					},{
						xtype: 'container',
						height: ht,
						items: [{
							xtype: 'slider',
							itemId: 'service',
							fieldLabel: 'Cow Service (beef vs. dairy)',
							labelAlign: 'right',
							labelWidth: labelWidth,
							value: 60,
							width: width,
							listeners: {
								change: function(self) {
									me.DSS_CalculatorContainer.calculateResults();
								}
							}
						}]
					},{
						xtype: 'container',
						height: ht,
						items: [{
							xtype: 'slider',
							itemId: 'diet',
							fieldLabel: 'Diet (grain vs. grass)',
							labelAlign: 'right',
							labelWidth: labelWidth,
							width: width,
							value: 50,
							listeners: {
								change: function(self) {
									me.DSS_CalculatorContainer.calculateResults();
								}
							}
						}]
					}]
				},{
					title: 'Advanced',
					margin: 4,
					items: [{
						xtype: 'grid',
					    width: width,
					    store: 'herd',
					    columns: [{
					    	text: '#',
					    	dataIndex: 'numcows',
				    		width: 50
					    },{
					    	text: 'Service',
					    	dataIndex: 'service',
					    	flex: 1
					    },{
					    	text: 'Ration',
					    	dataIndex: 'ration',
					    	flex: 2
					    }]
					}]
					
				}]
			},{ //------------------------------
				xtype: 'container',
				itemId: 'cow-details',
				padding: '2 32',
				html: '<b>Details</b><br><i>Allocate some cows for the landscape...</i>'
			}]
		});
		
		me.callParent(arguments);
	},
	
	//---------------------------------------
	process: function(data) {
		
		var me = this;
		if (me.isHidden()) return data;

		var details = "<b>Analysis</b><br>";
		
		var numCows = me.down('#numCows').getValue();
		var service = me.down('#service').getValue() / 100.0;
		var diet = me.down('#diet').getValue() / 100.0;

		var dairyCows = (numCows * service).toFixed(0);
		var beefCows = numCows - dairyCows;
		
		var gallonsMilk = dairyCows * (2250 + (1.0 - diet * 350)); 
		var gallonsMilkValue = gallonsMilk * (1.05 + diet * 0.25) 
		
		var tonsBeef = beefCows * (0.19 + (1.0 - diet) * 0.01);
		var beefValue = tonsBeef * (10500 + diet * 650);
		var tonsManureProduced = ((service * 0.01 + 0.2) + ((1.0 - diet) * 0.01 + 0.02)) * numCows;
		var phosphorus = tonsManureProduced * ((1.0 - diet) * 0.001 + 0.003);
			
		var cornFeedRequired = beefCows * (1.0-diet) * 6.6 
			+ dairyCows * (1.0 -diet) * 7.2;
		var stoverFeedRequired = beefCows * (1.0-diet) * 4.1 
			+ dairyCows * (1.0 - diet) * 3.4;
		var soyFeedRequired = beefCows * (1.0-diet) * 3.1 
			+ dairyCows * (1.0 - diet) * 3.8;
		var residueFeedRequired = beefCows * (1.0-diet) * 2.1 
			+ dairyCows * (1.0 - diet) * 2.2;
		var grassFeedRequired = beefCows * diet + 0.1 * 6.4 
			+ dairyCows * diet + 0.1 * 6.8;
		var alfalfaFeedRequired = beefCows * diet + 0.2 * 3.2 
			+ dairyCows * diet + 0.2 * 4.8;
		
		details += "Total Cows: " + numCows;
		if (dairyCows > 0) {
			details += "<br>Dairy Cattle: " + dairyCows;
			details += "<br>&#x25E6;&nbsp;Milk Produced (litres): " + Ext.util.Format.number(gallonsMilk, '0,000');
			details += "<br>&#x25E6;&nbsp;Milk Value: " + Ext.util.Format.currency(gallonsMilkValue,undefined,0);
		}
		if (beefCows > 0) {
			details += "<br>Beef Cattle: " + beefCows;
			details += "<br>&#x25E6;&nbsp;Beef Produced (tons): " + Ext.util.Format.number(tonsBeef, '0,000');
			details += "<br>&#x25E6;&nbsp;Beef Value: " + Ext.util.Format.currency(beefValue,undefined,0);
		}
		if (numCows > 0) {
			details += "<br>Manure Produced (tons): " + Ext.util.Format.number(tonsManureProduced,'0,000.#');
			details += "<br>Estimated Phosphorus (tons): " + Ext.util.Format.number(phosphorus,'0,000.##');
		}
		
		data['corn'].yield -= cornFeedRequired;
		data['stover'].yield -= stoverFeedRequired;
		data['soy'].yield -= soyFeedRequired;
		data['residue'].yield -= residueFeedRequired;
		data['grass'].yield -= grassFeedRequired;
		data['alfalfa'].yield -= alfalfaFeedRequired;
		
		if (data['corn'].yield < 0) {
			var cost = -data['corn'].yield * data['corn'].price;
			data['corn'].yield = 0;
			details += '<br><b>Corn shortfall - Cost:</b> ' + Ext.util.Format.currency(cost,undefined,0);
			data.costs += cost;
		}
		if (data['stover'].yield < 0) {
			var cost = -data['stover'].yield * data['stover'].price;
			data['stover'].yield = 0;
			details += '<br><b>Stover shortfall - Cost:</b> ' + Ext.util.Format.currency(cost,undefined,0);
			data.costs += cost;
		}
		if (data['soy'].yield < 0) {
			var cost = -data['soy'].yield * data['soy'].price;
			data['soy'].yield = 0;
			details += '<br><b>Soy shortfall - Cost:</b> ' + Ext.util.Format.currency(cost,undefined,0);
			data.costs += cost;
		}
		if (data['residue'].yield < 0) {
			var cost = -data['residue'].yield * data['residue'].price;
			data['residue'].yield = 0;
			details += '<br><b>Soy residue shortfall - Cost:</b> ' + Ext.util.Format.currency(cost,undefined,0);
			data.costs += cost;
		}
		if (data['grass'].yield < 0) {
			var cost = -data['grass'].yield * data['grass'].price;
			data['grass'].yield = 0;
			details += '<br><b>Grass shortfall - Cost:</b> ' + Ext.util.Format.currency(cost,undefined,0);
			data.costs += cost;
		}
		if (data['alfalfa'].yield < 0) {
			var cost = -data['alfalfa'].yield * data['alfalfa'].price;
			data['alfalfa'].yield = 0;
			details += '<br><b>Alfalfa shortfall - Cost:</b> ' + Ext.util.Format.currency(cost,undefined,0);
			data.costs += cost;
		}
		
		me.down('#cow-details').setHtml(details);
		
		data.grossIncome += gallonsMilkValue;
		data.grossIncome += beefValue;
		return data;
	}
	
});
