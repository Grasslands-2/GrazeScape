
//Ext.tip.QuickTipManager.init(true, {shadow: false}); // Instantiate the QuickTipManager
Ext.Loader.setConfig({
	enabled: true,
//	disableCaching:false,
	paths: {
//		'GeoExt': '/assets/javascripts/vendor/geo-ext',
        'Ext.ux': '/static/grazescape/public/vendor/extjs/ux' //Should be the path to the ux folder.
	}
});
Ext.require('Ext.ux.ExportableGrid');
//--------------------------------------------
Ext.application({
	name: 'DSS',
	appFolder: '/static/grazescape/public/js',

    views: [
		'AppViewport',
        //'field_grid.exporter'
	],
	mainView: 'DSS.view.AppViewport',
	init: function() {
		Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
	},

//	 Routes handling....
    routes: {
    	'browse_or_create': 'browse_or_create'
    },
    listen: {
        controller: {
            '#': {
                unmatchedroute: 'onUnmatchedRoute'
            }
        }
    },

    browse_or_create: function() {
    	alert('hello:' + location.origin);

    },
    onUnmatchedRoute: function(hash) {
    	alert('badness');
        console.log('Unmatched', hash);

    },
});
