//-----------------------------------------------------
// DSS.components.LayerFloat
//
//-----------------------------------------------------
Ext.define('DSS.components.LayerFloat', {
    extend: 'DSS.components.LayerBase',
    alias: 'widget.layer_float',
    
	title: 'Title',
	
	DSS_serverLayer: false, // 'cdl_2012' for example
	DSS_stepSize: 1,
	DSS_greaterThanValue: 10,
	DSS_maxValue: 100,
	DSS_layerUnit: ' (meters)',
	
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				layout: {
					type: 'vbox',
					align: 'left'
				},
				padding: '0 8 6 0',
				items: [{
					// Livestock Count section...
					xtype: 'container',
					padding: '2 0',
					layout: {
						type: 'hbox',
						align: 'stretch',
						pack: 'start'
					},
					items: [{
						xtype: 'component',
						style: 'text-align: right',
						html: me.DSS_shortTitle,
						width: 72,
						padding: '3 4',
					},{
						xtype: 'button',
						itemId: 'greaterThanTest',
						width: 34, // would be nice to not have to set a width but changing the button text causes a resize
						text: '>=',
						tooltip: 'Change comparison function',
						handler: function(self) {
							if (self.getText() === '>=') {
								self.setText('>')
							}
							else {
								self.setText('>=')
							}
							Ext.getCmp('DSS_attributeFixMe').valueChanged();
						}
					},{
						xtype: 'numberfield',
						itemId: 'greaterThan',
						hideEmptyLabel: true,
						value: me.DSS_greaterThanValue,
						width: 70,
						step: me.DSS_stepSize,
						minValue: 0,
						maxValue: me.DSS_maxValue,
						listeners: {
							change: function(self, newVal, oldVal) {
								Ext.getCmp('DSS_attributeFixMe').valueChanged();
							}
						}
					},{
						xtype: 'button',
						iconCls: 'swap-icon',
						text: '',
						tooltip: 'Swap values',
						margin: '0 10',
						handler: function(self) {
							var gt = me.down('#greaterThan');
							var lt = me.down('#lessThan');
							var ltv = lt.getValue();
							lt.setRawValue(gt.getValue()); // skip change detection here
							gt.setValue(ltv);			// but do it here to auto trigger a refresh
						}
					},{
						xtype: 'button',
						itemId: 'lessThanTest',
						width: 34,
						text: '<=',
						tooltip: 'Change comparison function',
						handler: function(self) {
							if (self.getText() === '<=') {
								self.setText('<')
							}
							else {
								self.setText('<=')
							}
							Ext.getCmp('DSS_attributeFixMe').valueChanged();
						}
					},{
						xtype: 'numberfield',
						itemId: 'lessThan',
						hideEmptyLabel: true,
						width: 70,
						step: me.DSS_stepSize,
						value: me.DSS_lessThanValue,
						minValue: 0,
						maxValue: me.DSS_maxValue,
						listeners: {
							change: function(self, newVal, oldVal) {
								Ext.getCmp('DSS_attributeFixMe').valueChanged();
							}
						}
					}]
				},{
					xtype: 'component',
					itemId: 'dss-value-range',
					html: 'Value range: -- to -- degrees',
					style: 'color: #777; font-style: italic',
					padding: '2 4 0 80',
				}]
			}]
		});
		
		me.callParent(arguments);
//		me.requestLayerRange();
	},
	
	//--------------------------------------------------------------------------
	configureSelection: function() {
		
		var me = this;
		if (me.isHidden()) return false;
		
		var selectionDef = { 
				name: me.DSS_serverLayer,
				type: 'continuous',
				lessThanTest: '<=',
				greaterThanTest: '>='
			};

		var gt = me.down('#greaterThan').getValue();
		if (gt) selectionDef['greaterThanValue'] = gt;
		
		var lt = me.down('#lessThan').getValue();
		if (lt) selectionDef['lessThanValue'] = lt;

		selectionDef['greaterThanTest'] = me.down('#greaterThanTest').getText();
		selectionDef['lessThanTest'] = me.down('#lessThanTest').getText();
		
		
//		String lessTest = queryNode.get("lessThanTest").textValue();
//		String gtrTest = queryNode.get("greaterThanTest").textValue();
        return selectionDef;		
	},
	
	//--------------------------------------------------------------------------
    requestLayerRange: function() {

    	var me = this;
		var queryLayerRequest = { 
			name: me.DSS_serverLayer,
			type: 'layerRange',
		};
    	
		var obj = Ext.Ajax.request({
			url: location.href + '/layerParmRequest',
			jsonData: queryLayerRequest,
			timeout: 10000,
			scope: me,
			
			success: function(response, opts) {
				
				if (response.responseText != '') {
					var obj = JSON.parse(response.responseText);
					if (obj.length == 0 || obj.layerMin == null || obj.layerMax == null) {
						console.log("layer request object return was null?");
						return;
					}
					
					me.down('#greaterThan').setMinValue(Math.floor(obj.layerMin));
					me.down('#lessThan').setMinValue(Math.floor(obj.layerMin));
					
					me.down('#greaterThan').setMaxValue(Math.ceil(obj.layerMax));
					me.down('#lessThan').setMaxValue(Math.ceil(obj.layerMax));

					var rangeLabel = 'Value range: ' + 
								Ext.util.Format.number(obj.layerMin, '0,000.##') +
								' to ' + 
								Ext.util.Format.number(obj.layerMax, '0,000.##') + me.DSS_layerUnit;
	
					me.down('#dss-value-range').setHtml(rangeLabel);
				}
			},
			
			failure: function(response, opts) {
				console.log('layer request failed');
			}
		});
	},

	//--------------------------------------------------------------------------
	fromQuery: function(queryStep) {
		var me = this;

		me.down('#greaterThan').setValue(queryStep.greaterThanValue);
		me.down('#lessThan').setValue(queryStep.lessThanValue);
		me.down('#greaterThanTest').setText(queryStep.greaterThanTest);
		me.down('#lessThanTest').setText(queryStep.lessThanTest);
	}

});
