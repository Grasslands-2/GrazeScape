Ext.define('DSS.app.layerQuery_Base', {
    extend: 'Ext.container.Container',
    alias: 'widget.layer_base',
    
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	width: 300,
	padding: 4,
	margin: 2,
	style: 'background: #fff; border-radius: 8px; border: 1px solid #888',
	focusCls: 'layer-focus',
	tabIndex: 20,
	//draggable: true,
	
	dssConstantWidgets: 'dss-constant-widgets', 
	dssWidgetNotes: 'dss-widget-notes',
	dssTabIndex: 90, // TODO: need to establish safe and logical starting ranges for these...
	dssIsCompact: false,
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
		});
		
		me.callParent(arguments);
		me.insert(0, {xtype: 'container',
			itemId: me.dssConstantWidgets,
			layout: 'hbox',
			items: [{
				xtype: 'component',
				html: me.title,
				flex: 1,
				padding: '2 4',
				style: 'color: #256; font-size: 1rem; cursor: pointer',
				listeners: {
					element: 'el',
					click: function() {
						me.setCompact(!me['dssIsCompact']);
					}
				}				
			},{
				xtype: 'component',
				itemId: me.dssWidgetNotes,
				hidden: true,
//				html: '2 active',
				padding: '2 8',
				style: 'color: #999; font-size: 0.8rem; line-height: 1rem; cursor: pointer',
				listeners: {
					element: 'el',
					click: function() {
						me.setCompact(!me['dssIsCompact']);
					}
				}				
			},{
				xtype: 'tool',
				tabIndex: me.dssTabIndex,
				type: 'close',
				margin: 2,
				callback: function(owner, tool) {
					me.setVisible(false);
					me.DSS_browser.layerHidden(me);
					if (me.cancelClickSelection) {
						me.cancelClickSelection();
					}
				}
			}]
		})
	},
	
	// true: go compact, false: show full
	//-------------------------------------------------------------
	setCompact: function(shrink) {
		var me = this;
		
		me['dssIsCompact'] = shrink;
		
		Ext.each(me.items.items, function(d) {
			if (d.getItemId() !== me.dssConstantWidgets) {
				d.setHidden(shrink);
			}
		});
		me.down('#' + me.dssWidgetNotes).setVisible(shrink);
	},
	
	//-------------------------------------------------------------
	setNote: function(note) {
		var me = this;
		
		me.down('#' + me.dssWidgetNotes).setHtml(note);
	}

});
