Ext.define('DSS.app.layerQuery_Range', {
    extend: 'DSS.app.layerQuery_Base',
    alias: 'widget.layer_range',

    dssLessNumberId: 'dss-less-number',
    dssLessTestId: 'dss-less-test',
    dssGreaterNumberId: 'dss-greater-number',
    dssGreaterTestId: 'dss-greater-test',
    
    dssRangeLabelId: 'dss-range-label',
    dssUnit: ' meters',
	dssStepSize: 1,
	dssMaxValue: 100,
    
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				layout: {
					type: 'vbox',
					align: 'middle'
				},
				padding: '2 8 6 12',
				items: [{
					xtype: 'container',
					padding: '2 0',
					layout: {
						type: 'hbox',
						align: 'stretch',
						pack: 'start'
					},
					items: [{
						xtype: 'button',
						tabIndex: me.dssTabIndex + 1,
						itemId: me.dssGreaterTestId,
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
							me.updateNote();
//							Ext.getCmp('DSS_attributeFixMe').valueChanged();
						}
					},{
						xtype: 'numberfield',
						tabIndex: me.dssTabIndex + 2,
						itemId: me.dssGreaterNumberId,
						hideEmptyLabel: true,
						value: me.dssGreaterValue,
						width: 70,
						step: me.dssStepSize,
						minValue: 0,
						maxValue: me.dssMaxValue,
						listeners: {
							change: function(self, newVal, oldVal) {
								me.updateNote();
//								Ext.getCmp('DSS_attributeFixMe').valueChanged();
							}
						}
					},{
						xtype: 'button',
						tabIndex: me.dssTabIndex + 3,
						iconCls: 'swap-icon',
						text: '',
						tooltip: 'Swap values',
						margin: '0 10',
						handler: function(self) {
							var gt = me.down('#' + me.dssGreaterNumberId);
							var lt = me.down('#' + me.dssLessNumberId);
							var ltv = lt.getValue();
							lt.setRawValue(gt.getValue()); // skip change detection here
							gt.setValue(ltv);			// but do it here to auto trigger a refresh
						}
					},{
						xtype: 'button',
						tabIndex: me.dssTabIndex + 4,
						itemId: me.dssLessTestId,
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
							me.updateNote();
//							Ext.getCmp('DSS_attributeFixMe').valueChanged();
						}
					},{
						xtype: 'numberfield',
						tabIndex: me.dssTabIndex + 5,
						itemId: me.dssLessNumberId,
						hideEmptyLabel: true,
						width: 70,
						step: me.dssStepSize,
						value: me.dssLessValue,
						minValue: 0,
						maxValue: me.dssMaxValue,
						listeners: {
							change: function(self, newVal, oldVal) {
								me.updateNote();
//								Ext.getCmp('DSS_attributeFixMe').valueChanged();
							}
						}
					}]
				},{
					xtype: 'component',
					itemId: me.dssRangeLabelId,
					html: 'Value range: -- to -- degrees',
					style: 'color: #777; font-style: italic',
					padding: '2 4 0 4',
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
	//--------------------------------------------------------------------------
	updateNote: function() {
		let me = this,
			val,
			msg;

		val = me.down('#' + me.dssGreaterNumberId).getValue();
		if (val) {
			msg = '>' + val;
		}

		val = me.down('#' + me.dssLessNumberId).getValue();
		if (val) {
			msg = (msg ? msg + ' to ' : '') + ' <' + val;
		}
		
        me.setNote('Range: ' + msg);
	},
	
	//TODO: update query somehow
	

});
