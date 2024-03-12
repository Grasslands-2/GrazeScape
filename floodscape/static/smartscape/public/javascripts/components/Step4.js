
var	inputData= {
	corn: {
		yield: 34063530 / 250.0,
		cost: (82803.4/2.471) * 1135,
		price: 240,
	},
	stover: {
		yield: 34063530 / 250.0,
		cost: (82803.4/2.471) * 300,
		price: 50,
	},
	soy: {
		yield: 6044764 / 250.0,
		cost: (21373.4/2.471) * 412,
		price: 400,
	},
	residue: {
		yield: 9067146 / 250.0,
		cost: (21373.4/2.471) * 20,
		price: 25,
	},
	grass: {
		yield: 30261140 / 250.0,
		cost: (63068.2/2.471) * 620,
		price: 100,
	},
	alfalfa: {
		yield: 10960000 / 250.0,
		cost: (24484.5/2.471) * 627,
		price: 254,
	},
	grossIncome: 0,
	costs: 0,
	biofuelProduced: 0,
	dairyCattle: 0,
	beefCattle: 0,
	milkProduced: 0,
	beefProduced: 0,
	pollinationModifier: 0
};


//-----------------------------------------------------
// DSS.components.LayerBase
//
//-----------------------------------------------------
Ext.define('DSS.components.Step4', {
    extend: 'Ext.window.Window',
    alias: 'widget.step4',

    require: [
    	'DSS.components.CropToMarket',
    	'DSS.components.Biofuels',
    	'DSS.components.HerdAllocation',
    	'DSS.components.Pollination',
    	'DSS.components.Pest',
    	'DSS.components.YieldChart',
    	'DSS.components.d3_sankey',
    ],
    modal: true,
    width: 900, minWidth: 800,
    height: 720, minHeight: 600,
    
	title: 'SmartScape Interactions Estimator (Toy Model)',
	resizable: true,
	maximizable: true,
	layout: {
		type: 'hbox',
		align: 'stretch',
		pack: 'start'
	},
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				itemId: 'modules',
				width: 180,
				padding: 2,
				style: 'background-color: #ddd',
				layout: {
					type: 'vbox',
					align: 'stretch',
					pack: 'start'
				},
				defaults: {
					margin: 6,
					xtype: 'button',
					scale: 'medium',
					enableToggle: true,
					height: 40,
				},
				items: [{
					text: 'Pest Suppression',
					hidden: true,
					more: true,
					toggleHandler: function(self, state) {
						me.down('#pest').setVisible(state);
						me.calculateResults();
					}
				},{
					text: 'Pollination Services',
					hidden: true,
					more: true,
					toggleHandler: function(self, state) {
						me.down('#pollination').setVisible(state);
						me.calculateResults();
					}
				},{
					text: 'Phosphorus Retention',
					disabled: true,
					more: true,
					hidden: true
				},{
					text: 'Soil Retention',
					disabled: true,
					more: true,
					hidden: true
				},{
					text: 'Soil Carbon',
					disabled: true,
					more: true,
					hidden: true
				},{
					text: 'Reserve Biomatter',
					toggleHandler: function(self, state) {
						me.down('#crops2market').setVisible(state);
						me.calculateResults();
					}
				},{
					text: 'Biofuel Production',
					toggleHandler: function(self, state) {
						me.down('#biofuels').setVisible(state);
						me.calculateResults();
					}
				},{
					text: 'Herd Allocation',
					toggleHandler: function(self, state) {
						me.down('#herd').setVisible(state);
						me.calculateResults();
					}
				},{
					text: 'Water Infiltration',
					disabled: true,
					more: true,
					hidden: true
				},{
					text: 'Aquatic Recreation',
					disabled: true,
					more: true,
					hidden: true
				},{
					text: 'Eco-Tourism',
					disabled: true,
					more: true,
					hidden: true
				},{
					xtype: 'radiogroup',
					columns: 2,
					margin: '0 0 0 24',
					items: [{
						boxLabel: 'Less', name: 't', value: 1,
						handler: function(self, active) {
							if (active) {
								var i = me.down('#modules').items;
								Ext.each(i.items, function(item) {
									if (item.more) item.setVisible(false);
								});
							}
						}
					},{
						boxLabel: 'More', name: 't', value: 2,
						handler: function(self, active) {
							if (active) {
								var i = me.down('#modules').items;
								Ext.each(i.items, function(item) {
									if (item.isHidden()) item.setVisible(true);
								});
							}
						}
					}]
				},{
					xtype: 'container',
					flex: 1
				},{
					text: 'Yield Change',
					toggleHandler: function(self, state) {
						me.down('#chart').setVisible(state);
					}
				}]
			},{
				xtype: 'container',
				style: 'background-color: #ddd',
				itemId: 'holder',
				scrollable: true,
				layout: {
					type: 'vbox',
					align: 'stretch',
					pack: 'start'
				},
				flex: 1,
				items: [{
					xtype: 'container',
					padding: 2,
					layout: 'hbox',
					items: [{
						xtype: 'container',
						flex: 1,
						margin: 2,
						style: 'text-align: right',
						html: '<b>Gross Income:<br>Costs:<br>Net Income:</b>'
					},{
						xtype: 'container',
						itemId: 'incomeStatistics',
						flex: 1,
						margin: 2,
						style: 'text-align: left',
						html: '--<br>--<br>--'
					}]
				}]
			}]
		});
		
		me.callParent(arguments);
		me.addModules();
	},
	
	//--------------------------------------------------------
	addModules: function() {
		
		var me = this;
		var item = Ext.create('DSS.components.Pest', {
			itemId: 'pest', hidden: true,
			DSS_CalculatorContainer: me
		});
		me.down('#holder').add(item);
		
		item = Ext.create('DSS.components.Pollination', {
			itemId: 'pollination', hidden: true,
			DSS_CalculatorContainer: me
		});
		me.down('#holder').add(item);
		
		item = Ext.create('DSS.components.CropToMarket', {
			itemId: 'crops2market', hidden: true,
			DSS_CalculatorContainer: me
		});
		me.down('#holder').add(item);
		
		item = Ext.create('DSS.components.Biofuels', {
			itemId: 'biofuels', hidden: true,
			DSS_CalculatorContainer: me
		});
		me.down('#holder').add(item);
		
		item = Ext.create('DSS.components.HerdAllocation', {
			itemId: 'herd', hidden: true,
			DSS_CalculatorContainer: me
		});
		me.down('#holder').add(item);
		
		me.down('#holder').add(
			Ext.create('DSS.components.d3_sankey', {
				itemId: 'chart', hidden: true
		}));
	},
	
	//--------------------------------------------------------
	calculateResults: function() {
		var me = this;
		
		var cloned = Ext.clone(inputData);
		Ext.suspendLayouts();
		var result = me.down('#pest').process(cloned);
		result = me.down('#pollination').process(cloned);
		result = me.down('#crops2market').process(cloned);
		result = me.down('#biofuels').process(cloned);
		result = me.down('#herd').process(cloned);

		// force any leftovers to be sold on the market
		var marketIncome = (result['corn'].yield * result['corn'].price) +
			(result['stover'].yield * result['stover'].price) +
			(result['soy'].yield * result['soy'].price) +
			(result['residue'].yield * result['residue'].price) +
			(result['grass'].yield * result['grass'].price) +
			(result['alfalfa'].yield * result['alfalfa'].price);

		var grossIncome = marketIncome + result.grossIncome;
		
		// collect the costs
		var productionCosts = result['corn'].cost +
			result['stover'].cost +
			result['soy'].cost +
			result['residue'].cost +
			result['grass'].cost +
			result['alfalfa'].cost;
		var totalCosts = productionCosts + result.costs;
		
		results = Ext.util.Format.currency(grossIncome, undefined, 0) + '<br>' +
			Ext.util.Format.currency(totalCosts, undefined, 0) + '<br>' +
			Ext.util.Format.currency(grossIncome - totalCosts, undefined, 0);
		
		me.down('#incomeStatistics').setHtml(results);
		Ext.resumeLayouts(true);
		me.down('#chart').doResized();
	}
	
});
