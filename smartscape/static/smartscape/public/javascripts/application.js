Ext.tip.QuickTipManager.init(); // Instantiate the QuickTipManager

Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'GeoExt': '/assets/javascripts/vendor/geo-ext',
		'DSS': '/assets/javascripts'
	}
});

Ext.application({
    name: 'DSS',
	requires: ['DSS.app.ApplicationViewport'],
    mainView: 'DSS.app.ApplicationViewport',
	init: function() {
		Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
	},	
});
