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

window.onbeforeunload = function(e){
    // Note: Not all browsers use e.returnValue, but they will prevent reload if it's set:
    const fieldTableComponent = Ext.getCmp("fieldTable");
    if(fieldTableComponent) {
        const updatedFields = fieldTableComponent.getStore().getUpdatedRecords();
        if(updatedFields.length) {
            e.returnValue = "Unsaved Fields";
            return;
        }
    } 
    
    const infraTableComponent = Ext.getCmp("infraTable");
    if(infraTableComponent) {
        const updatedInfra = infraTableComponent.getStore().getUpdatedRecords();
        if(updatedInfra.length) {
            e.returnValue = "Unsaved Infrastructure";
            return;
        }
    }
}