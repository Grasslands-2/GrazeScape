
//------------------------------------------------------------------------------
Ext.define('DSS.app.dash_card', {
//------------------------------------------------------------------------------
    extend: 'Ext.Container',
	alias: 'widget.dash_card',
	
	layout: {
		type: 'vbox',
		pack: 'start',
		align: 'stretch'
	},
	width: 290, 
//	padding: 8,
//	style: 'background: rgba(32,90,150,0.5); border-right: 1px solid rgba(16,32,100,0.5)',
	style: 'background: rgba(94,98,90,0.5); border-right: 1px solid rgba(42,45,40,0.5)',
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		let style = 'background: #f5f6f4; border: 1px solid #777; border-top-color: #888; border-bottom-color: #666; border-radius: 8px; box-shadow: 0 4px 4px rgba(0,0,0,0.3)';
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				margin: 8,//'8 8 0 8',
				height: 70, // a fixed height improves page layout responsiveness unfortunately
				html: '<a href="/"><img id="ddd" src="assets/images/dss-logo-white.png" style="width:100%"></a>',
			},{
				xtype: 'container',
				style: style,
				height: 120,
				margin: '0 12 12 12',
				layout: {
					type: 'vbox',
					align: 'center',
					pack: 'middle'
				},
				items: [{
					xtype: 'component',
					html: 'Livestock',
					padding: 8,
					style: 'color: #444; font-size: 16px; font-weight: bold;'
				},{
					xtype: 'component',
					html: 'Total Cows: 18,950',
					style: 'color: #444; font-size: 14px;',
					padding: '4 24'
				}]
			},{
				xtype: 'container',
				style: style,
				height: 120,
				margin: '0 12 12 12',
				layout: {
					type: 'vbox',
					align: 'center',
					pack: 'middle'
				},
				items: [{
					xtype: 'component',
					html: 'Landcover',
					padding: 8,
					style: 'color: #444; font-size: 16px; font-weight: bold;'
				}]
			},{
				xtype: 'container',
				style: style,
				height: 120,
				margin: '0 12 12 12',
				layout: {
					type: 'vbox',
					align: 'center',
					pack: 'middle'
				},
				items: [{
					xtype: 'component',
					html: 'Assumptions',
					padding: 8,
					style: 'color: #444; font-size: 16px; font-weight: bold;'
				}]
			},{
				xtype: 'component',
				flex: 1
			},{
				xtype: 'container',
				height: 40,
				margin: '0 12 12 12',
				layout: {
					type: 'hbox',
					align: 'stretch',
					pack: 'start'
				},
				items: [{
					xtype: 'button',
					text: 'New',
					width: 60,
					tabIndex: 100
				},{
					xtype: 'button',
					text: 'Load',
					width: 60,
					margin: '0 8',
					tabIndex: 101,
				},{
					xtype: 'button',
					text: 'Simulate >>',
					flex: 1,
					tabIndex: 102,
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
});



