
//------------------------------------------------------------------------------
Ext.define('DSS.app_portal.Footer', {
//------------------------------------------------------------------------------
	extend: 'Ext.container.Container',
	alias: 'widget.footer',
	
	padding: 8,
	width: '100%',
	style: 'background-color: #404740; background: -webkit-linear-gradient(to bottom, #404740, #282728);background: linear-gradient(to bottom, #404740, #282728); color: #ddd; text-shadow: 0 0 1px #00000050; font-size: 14px; border-top: 1px solid #00000050;',
	layout: {
		type: 'vbox',
		align: 'middle'
	},

	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				width: 480, 
				height: 90,
				margin: -12,
				html: '<a href="https://energy.wisc.edu"><img src="assets/images/grassland-logo.png" style="width: 60%"></a>' + 
				'<a href="http://gratton.entomology.wisc.edu"><img src="assets/images/gratton-logo.png" style="width: 40%"></a>',
			},{
				xtype: 'component',
				margin: 8,
				html: '&copy;2019 wei.wisc.edu'
			}]
		});
		
		me.callParent(arguments);
	},
	
});

