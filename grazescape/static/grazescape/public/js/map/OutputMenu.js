
Ext.define('DSS.map.OutputMenu', {
//------------------------------------------------------------------------------
	extend: 'Ext.menu.Menu',
	alias: 'widget.map_output_menu',
	alternateClassName: 'DSS.OutputMenu',
	//id: 'OutputMenu',
	header: {
		style: 'background: rgba(200,200,200,0.9)',
		padding: 2
	},
	//closeAction: Ext.getCmp('layersMenu').destroy(),
	closable: true,
    floating: false,
	plain: true,
	width: 160,
	//--------------------------------------------------------------------------
	initComponent: function() {
		
		let me = this;
		
		Ext.applyIf(me, {
			//Id: 'layersMenu',
			//itemId: 'layersMenu',
			//ItemId: 'layermenu',
			defaults: {
				xtype: 'menucheckitem',
				padding: 2,
                hideOnClick: false,
			},
			
			items: [
				{
						xtype: 'menucheckitem',
						//itemID: 'Ploss',
						text: 'Ploss',
						disabled: false,
						//style: 'border-bottom: 1px solid rgba(0,0,0,0.2);padding-top: 4px; background-color: #ccc',			
						checked: true,
						//menu: makeOpacityMenu("hillshade", DSS.layer.hillshade, 30),
						listeners: {
						 afterrender: function(self) {
						 	self.setChecked(DSS.layer.ploss_field.getVisible());
						 }
					},
					handler: function(self) {
						console.log('ploss clicked')
						DSS.map.getLayers().forEach(function (layer){
							console.log(layer);
							if(layer.values_.name == 'DSS.layer.ploss_field_'+ mfieldID){
								console.log(layer);
							}
						})
						Ext.util.Cookies.set('DSS.layer.ploss_field:visible', self.checked ? "0" : "1");                	
						DSS.layer.ploss_field.setVisible(self.checked);
				}
			}]
		});
		
		me.callParent(arguments);
	},

});

