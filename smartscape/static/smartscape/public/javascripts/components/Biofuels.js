Ext.define('DSS.components.Biofuels', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.biofuels',

    margin: 8,
    bodyPadding: 8,
	title: 'Biofuel Production',
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
		
		var ht = 32, width = 300, labelWidth = 120;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				items: [{
					xtype: 'container',
					height: ht,
					items: [{
						xtype: 'slider',
						itemId: 'corn',
						fieldLabel: 'Corn Grain',
						labelAlign: 'right',
						labelWidth: labelWidth,
						maxValue: 150,
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
					hidden: true,
					items: [{
						xtype: 'slider',
						itemId: 'stover',
						fieldLabel: 'Corn Stover',
						labelAlign: 'right',
						maxValue: 150,
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
						itemId: 'soy',
						fieldLabel: 'Soybeans',
						maxValue: 150,
						labelAlign: 'right',
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
					hidden: true,
					height: ht,
					items: [{
						xtype: 'slider',
						itemId: 'residue',
						maxValue: 150,
						fieldLabel: 'Soybean Residue',
						labelAlign: 'right',
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
						itemId: 'grass',
						maxValue: 150,
						fieldLabel: 'Grass',
						labelAlign: 'right',
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
						maxValue: 150,
						itemId: 'alfalfa',
						fieldLabel: 'Alfalfa',
						labelAlign: 'right',
						labelWidth: labelWidth,
						width: width,
						listeners: {
							change: function(self) {
								me.DSS_CalculatorContainer.calculateResults();
							}
						}
					}]
				}]
			},{ //------------------------------
				xtype: 'container',
				itemId: 'bio-details',
				padding: '2 32',
				html: '<b>Details</b><br><i>Allocate some resources to biofuel production...</i>'
			}]
		});
		
		me.callParent(arguments);
	},
	
	//---------------------------------------
	process: function(data) {
		
		var me = this;
		if (me.isHidden()) return data;

		var details = "<b>Details</b><br>";
		
		var corn = me.down('#corn').getValue() * 1000;
		var stover = me.down('#stover').getValue() * 1000;
		var soy = me.down('#soy').getValue() * 1000;
		var residue = me.down('#residue').getValue() * 1000;
		var grass = me.down('#grass').getValue() * 1000;
		var alfalfa = me.down('#alfalfa').getValue() * 1000;

		data['corn'].yield 		-= corn;
		data['stover'].yield 	-= stover;
		data['soy'].yield 		-= soy;
		data['residue'].yield 	-= residue;
		data['grass'].yield 	-= grass;
		data['alfalfa'].yield 	-= alfalfa;
		
		if (data['corn'].yield < 0) {
			corn += data['corn'].yield;
			data['corn'].yield = 0;
			details += "<br><b>Insufficient Corn (tons):</b> " + corn.toFixed(0); 
		}

		if (data['stover'].yield < 0) {
			stover += data['stover'].yield;
			data['stover'].yield = 0;
			details += "<br><b>Insufficient Stover (tons):</b> " + stover.toFixed(0); 
		}
		if (data['soy'].yield < 0) {
			soy += data['soy'].yield;
			data['soy'].yield = 0;
			details += "<br><b>Insufficient Soy (tons):</b> " + soy.toFixed(0); 
		}
		if (data['residue'].yield < 0) {
			residue += data['residue'].yield;
			data['residue'].yield = 0;
			details += "<br><b>Insufficient residue (tons):</b> " + residue.toFixed(0); 
		}
		if (data['grass'].yield < 0) {
			grass += data['grass'].yield;
			data['grass'].yield = 0;
			details += "<br><b>Insufficient grass (tons):</b> " + grass.toFixed(0); 
		}
		if (data['alfalfa'].yield < 0) {
			alfalfa += data['alfalfa'].yield;
			data['alfalfa'].yield = 0;
			details += "<br><b>Insufficient alfalfa (tons):</b> " + alfalfa.toFixed(0); 
		}
		
		data.biofuelProduced += 400.0 * 0.5 * corn;
		data.biofuelProduced += 380.0 * 0.25 * stover;
		data.biofuelProduced += 200.0 * soy;
		data.biofuelProduced += 190.0 * residue;
		data.biofuelProduced += 360.0 * grass;
		data.biofuelProduced += 350.0 * alfalfa;
		
		sankeyData.links[0].value = /*sankeyDataClone.links[0].value +*/ soy * 0.001;
		sankeyData.links[1].value = /*sankeyDataClone.links[1].value +*/ data['soy'].yield * 0.001;
		sankeyData.links[36].value = /*sankeyDataClone.links[1].value +*/ data.biofuelProduced * 0.000003;
		sankeyData.links[37].value = /*sankeyDataClone.links[0].value +*/ corn * 0.0005;
		sankeyData.links[7].value = /*sankeyDataClone.links[7].value*/ + data['corn'].yield * 0.001;


		console.log(sankeyData.links[1].value);
		
		details += "<br>Litres produced: " + Ext.util.Format.number(data.biofuelProduced, '0,000');

		var costs = 8.2 * corn;
		costs += 9.3 * stover;
		costs += 5.2 * soy;
		costs += 11.3 * residue;
		costs += 12.3 * grass;
		costs += 13.3 * alfalfa;
		
		var value = data.biofuelProduced * 2.2;
		
		data.grossIncome += value;
		details += "<br>Biofuel Market Value: " + Ext.util.Format.currency(value,undefined,0);
		details += "<br>Biofuel Production Costs: " + Ext.util.Format.currency(costs,undefined,0);
		details += "<br>Biofuel Net Income: " + Ext.util.Format.currency(value-costs,undefined,0);
		
		me.down('#bio-details').setHtml(details);
		
		data.costs += costs;
		return data;
	}
	
});
