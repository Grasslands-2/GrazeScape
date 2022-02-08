
DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')

var regionsList = [{text: "Kickapoo Valley"}, {text: "Clover Belt"}]
DSS.activeRegion = "southWestWI";
//------------------------------------------------------------------------------
Ext.define('DSS.map.RegionPicker', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.map_region_picker',
	id: "regionPicker",
//	autoDestroy: false,
//	closeAction: 'hide',
	constrain: true,
	modal: true,
	width: 832,
	resizable: false,
	bodyPadding: 8,
	titleAlign: 'center',
	
	title: 'Pick The Region you want to work in',
	
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;
		Ext.applyIf(me, {
			items: [{
					xtype: 'container',
					width: '100%',
					layout: 'absolute',
					items: [{
						xtype: 'component',
						x: 0, y: -6,
						width: '100%',
						height: 28,
						cls: 'information accent-text bold',
						html: "Choose From the Regions Below",
					}],
					
				},
				Ext.create('Ext.menu.Menu', {
					width: 100,
					id: "RegionMenu",
					margin: '0 0 10 0',
					floating: false,  // usually you want this set to True (default)
					renderTo: Ext.getBody(),  // usually rendered by it's containing component
					items: regionsList,
					listeners:{
						click: function( menu, item, e, eOpts ) {
							this.up('window').destroy();
							//console.log(item.text);
							console.log(DSS.map.getView())
							if(item.text == "Clover Belt"){
								console.log('Cloverbelt picked')
								//DSS.activeRegion = "cloverBeltWI";
								DSS.activeRegion = "cloverBeltWI";
								
								console.log(DSS.activeRegion);
								DSS.map.setView(new ol.View({
									center: [-10022690, 5616340],
									zoom: 9,
									maxZoom: 30,
									minZoom: 8,//10,
								//	constrainRotation: false,
								//	rotation: 0.009,
									constrainOnlyCenter: false,
									extent:[-10123258, 5529663,-9931236,5682859]
									//extent:[ -10168100, 5318380, -10055830, 5454227]
								}))
							}
							else{
								DSS.activeRegion = "Kickapoo";
								DSS.map.setView(new ol.View({
									center: [-10112582,5392087],
									zoom: 10,
									maxZoom: 30,
									minZoom: 8,//10,
								//	constrainRotation: false,
								//	rotation: 0.009,
									constrainOnlyCenter: false,
									//extent:[-10155160, 5323674, -10065237, 5450767]
									extent:[ -10168100, 5318380, -10055830, 5454227]
								}))
							}
							console.log("REGION PICKER DONE");
							
						}
					}
				}),
//				myMask

			]
		});
		
		me.callParent(arguments);
		AppEvents.registerListener("viewport_resize", function(opts) {
			me.center();
		})
	},
	
});
