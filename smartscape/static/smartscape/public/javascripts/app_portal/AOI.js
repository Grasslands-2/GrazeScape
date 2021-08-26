// AOI - Area of Interest

//-------------------------------------------------------------
Ext.create('Ext.data.Store', {
	storeId: 'dss-areas',
	fields: ['name', 'value', 'desc', 'feature'],
	data: [{ 
		name: 'Central Sands', value: 'cs', objectid: 0,
		desc: "The remnants of an ancient lake, the sandier soils here favor crops less commonly grown in other portions of the state. Less able to hold applied fertilizers, the sandier soils risk leaching nutrients into the nearby Wisconsin River with potential for far-reaching effects.",
	},{ 
		name: 'Driftless', value: 'd', objectid: 1,
		desc: "The driftless area escaped glaciation during the last ice age and is characterized by steep, forested ridges, deeply-carved river valleys, and cold-water trout streams.",
	},{ 
		name: 'Fox River Valley', value: 'frv', objectid: 2,
		desc: "Some special risks and opportunities here...Far too many to list.",
	},{ 
		name: 'Urban Corridor', value: 'uc', objectid: 3,
		desc: "This area is characterized by a mix of densely populated areas surrounding lakes, glaciated areas to the east, and hillier landscapes to the west. With agricultural activities to the north, excess nutrients have easy access to a chain of lakes and the river system they feed.",
	}]
});

//------------------------------------------------------------------------------
Ext.define('DSS.app_portal.AOI', {
//------------------------------------------------------------------------------
	extend: 'Ext.panel.Panel',
	alias: 'widget.aoi',
	
	width: 380,
	height: 195,
	store: 'dss-areas',
	title: 'Getting Started...',
	layout: 'fit',
	listeners: {
		afterrender: function(self) {
			Ext.defer(function() {
				//self.getSelectionModel().select(3);
			}, 500);
		}
	},
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		var me = this;
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				padding: 8,
				layout: {
					type: 'vbox',
					align: 'center'
				},
				items: [{
					xtype: 'component',
					width: '100%',
					style: 'color: #333',
					html: 'To get started, SmartScape must first be narrowed down to an Area of Interest. ' + 
						'Select one of the following choices...or choose directly on the map.'
				},{
					xtype: 'container',
					layout: 'column',
					itemId: 'dss-button-options',
					padding: '8 16 10 16',
					width: '100%',
					defaults: {
						xtype: 'button',
						scale: 'medium',
						columnWidth : 0.5,
						cls: 'ext-landing-button',
						margin: 4,
						toggleGroup: 'dss-toggle',
						allowDepress: false,
						toggleHandler: function(self, pressed) {
							self.addCls('ext-landing-button'); // eh?

							if (!pressed) return;
							me.onActivated();
							var chartData = Ext.data.StoreManager.lookup('dss-values');
							chartData.setFilters(new Ext.util.Filter({
								property: 'location',
								value: self.DSS_areaCode
							}))
							chartData = Ext.data.StoreManager.lookup('dss-proportions');
							chartData.setFilters(new Ext.util.Filter({
								property: 'location',
								value: self.DSS_areaCode
							}));
							DSS_PortalMap.selectFeature('region', self.DSS_areaId, true);
							var areas = Ext.data.StoreManager.lookup('dss-areas');
							var rec = areas.findRecord('value', self.DSS_areaCode);
							Ext.getCmp('dss-selected-info').setHtml(rec.get('desc'))
							Ext.getCmp('dss-selected-region').setHtml('Region: ' + rec.get('name'))
						}
					},
					items: [{
						text: 'Central Sands',
						DSS_areaCode: 'cs',
						DSS_areaId: 0
					},{
						text: 'Driftless',
						DSS_areaCode: 'd',
						DSS_areaId: 1
					},{
						text: 'Fox River Valley',
						DSS_areaCode: 'frv',
						DSS_areaId: 2
					},{
						text: 'Urban Corridor',
						DSS_areaCode: 'uc',
						DSS_areaId: 3
					}]
					
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
	//----------------------------------------------------------
	setSelection: function(selection) {
		var me = this;
		var i = me.down('#dss-button-options').items.items;
		i.forEach(function(item) {
			if (item.DSS_areaId == selection) {
				item.toggle(true, false);
				return;
			}
		})
	},
	
	//----------------------------------------------------------
	updateState: function(selected) {
		var me = this;
		if (selected) {
		}
		else {
		}
	}

	
});
