
var regionsList = [{text: "Ridge and Valley"}, {text: "Clover Belt"},{text: "Driftless"},{text: "Northeast"},
{text: "Red Cedar"}, {text: "Pine River"}]
//DSS.activeRegion = "southWestWI";
//var testTable = document.createElement('table');
//function createHTMLTable(valuesList){
//    let tableHeader = "<table id='test1'><tr>"+
//        "<th style='border:1px solid black'>Occupancy</th>"+
//        "<th style='border:1px solid black'>Low Yielding Variety</th>"+
//        "<th style='border:1px solid black'>Medium Yielding Variety</th>"+
//        "<th style='border:1px solid black'>High Yielding Variety</th></tr>"
//    tableFooter = "</table>"
//    for (let row in valuesList){
//        console.log(row)
//        tableHeader = tableHeader + "<tr>"
//        for (let col in valuesList[row]){
//            tableHeader = tableHeader +  "<th style='border:1px solid black'>"+valuesList[row][col]+"</th>"
//        }
//        tableHeader = tableHeader + "</tr>"
//    }
//    tableHeader = tableHeader + tableFooter
//    return tableHeader
//}
//testTable11 = createHTMLTable([[0,1,2,3], [5,6,7]])
// Add some rows and columns to the table
//for (var i = 0; i < 5; i++) {
//    var row = testTable.insertRow();
//        for (var j = 0; j < 3; j++) {
//          var cell = row.insertCell();
//          cell.textContent = 'Row ' + (i + 1) + ', Column ' + (j + 1);
//        }
//}
//console.log("table!!!", testTable11)
//let test = "hi"
//var component = Ext.create('Ext.Component', {
//    renderTo: Ext.getBody(),
//    html: `<button onclick="copyGrassTable('`+test+`')">Click me</button>`
//  });
//------------------------------------------------------------------------------
Ext.define('DSS.state.RegionPickerPanel', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.region_picker_panel',

	layout: DSS.utils.layout('vbox', 'center', 'stretch'),
	cls: 'section',

	DSS_singleText: '"Start by Choosing the Region you want to work in."',
					
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		Ext.applyIf(me, {
			defaults: {
				margin: '1rem',
			},
			items: [{
				xtype: 'component',
				x: 0, y: -6,
				width: '100%',
				height: 50,
				cls: 'information accent-text bold',
				html: "Welcome to GrazeScape!",
			},{
				xtype: 'component',
				cls: 'information med-text',
				html: 'Region Selection'
			},
//			{
//				xtype: 'component',
//				html: testTable11
//			},
//			{
//                xtype: 'button',
//                cls: 'button-text-pad',
//                componentCls: 'button-margin',
//                text: 'Copy Table',
//                handler: function(self) {
//                    var table = document.getElementById('test1');
//                      // Create a range object to select the table content
//                      var range = document.createRange();
//                      range.selectNode(table);
//
//                      // Add the range to the current selection
//                      window.getSelection().addRange(range);
//
//                      // Execute the "copy" command to copy the selected content
//                      document.execCommand('copy');
//
//                      // Clear the selection
//                      window.getSelection().removeAllRanges();
//                }
//            },
//			{
//				xtype: 'component',
//				cls: 'information med-text',
//				html: "teststastst"
//			},
//			component,
            {
				xtype: 'container',
				width: '100%',
				layout: 'absolute',
					items: [{
						xtype: 'component',
						x: 0, y: -6,
						width: '100%',
						height: 75,
						cls: 'information accent-text bold',
						html: "Please choose to work in one of the regions below, or click on the region on the map.",
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
						click: async function( menu, item, e, eOpts ) {
							DSS.mouseMoveFunction = DSS.MapState.mouseoverFarmHandler();
							DSS.mapClickFunction = DSS.MapState.clickActivateFarmHandler();
							console.log(DSS.map.getView())
							if(item.text == "Clover Belt"){
								DSS.activeRegion = "cloverBeltWI";
								DSS.map.un('pointermove', regionHighlighter)
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.layer.regionLabels.setVisible(false)
								DSS.layer.farms_1.setVisible(true)
								DSS.ApplicationFlow.instance.showFarmPickerPage();
								DSS.map.removeInteraction(DSS.selectRP);
								let view = new ol.View({
									center: [-10030031,5610033],
									zoom: 8,
									maxZoom: 30,
									minZoom: 8,
									constrainOnlyCenter: false,
									extent:[-10221386, 5467295, -9843661, 5750901]
								})
								let extent = [-10221386, 5467295, -9843661, 5750901]
								await DSS.MapState.zoomToRealExtentRP(extent,view)
							}
							else if(item.text == "Ridge and Valley"){
								DSS.activeRegion = "southWestWI";
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.map.un('pointermove', regionHighlighter)
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.layer.regionLabels.setVisible(false)
								DSS.layer.farms_1.setVisible(true)
								DSS.ApplicationFlow.instance.showFarmPickerPage();
								DSS.map.removeInteraction(DSS.selectRP);
								let view = new ol.View({
									center: [-10106698,5391875],
									zoom: 6,
									maxZoom: 30,
									minZoom: 6,
									constrainOnlyCenter: false,
									extent:[-10258162, 5258487, -9967076, 5520900]
								})
								let extent = [-10258162, 5258487, -9967076, 5520900]
								await DSS.MapState.zoomToRealExtentRP(extent,view)
							}
							else if(item.text == "Northeast"){
								DSS.activeRegion = "northeastWI";
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.map.un('pointermove', regionHighlighter)
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.layer.regionLabels.setVisible(false)
								DSS.layer.farms_1.setVisible(true)
								DSS.ApplicationFlow.instance.showFarmPickerPage();
								DSS.map.removeInteraction(DSS.selectRP);
								let view = new ol.View({
									center: [-9786795,5508847],
									zoom: 6,
									maxZoom: 30,
									minZoom: 6,
									constrainOnlyCenter: false,
									extent:[-9861119, 5428671, -9706548, 5591254]
								})
								let extent = [-9841119, 5448671, -9726548, 5571254]
								await DSS.MapState.zoomToRealExtentRP(extent,view)
							}
							else if(item.text == "Driftless"){
								DSS.activeRegion = "uplandsWI";
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.map.un('pointermove', regionHighlighter)
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.layer.regionLabels.setVisible(false)
								DSS.layer.farms_1.setVisible(true)
								DSS.ApplicationFlow.instance.showFarmPickerPage();
								DSS.map.removeInteraction(DSS.selectRP);
								let view = new ol.View({
									center: [-10039400,5305041],
									zoom: 6,
									maxZoom: 30,
									minZoom: 6,
									constrainOnlyCenter: false,
									extent:[-10247529, 5226215, -9938170, 5420242]
								})
								let extent = [-10247529, 5226215, -9938170, 5420242]
								await DSS.MapState.zoomToRealExtentRP(extent,view)
							}
							else if(item.text == "Red Cedar"){
								DSS.activeRegion = "redCedarWI";
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.map.un('pointermove', regionHighlighter)
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.layer.regionLabels.setVisible(false)
								DSS.layer.farms_1.setVisible(true)
								DSS.ApplicationFlow.instance.showFarmPickerPage();
								DSS.map.removeInteraction(DSS.selectRP);
                                let extent = [-10364871.915906506, 5523673.41766168, -10069499.539759004,5831321.534259069]
                                let view = new ol.View({
                                    center: [-10217185.73, 5677497.476],
                                    zoom: 8,
                                    maxZoom: 30,
                                    minZoom: 8,
                                    constrainOnlyCenter: false,
                                    extent:extent
                                })
                                await DSS.MapState.zoomToRealExtentRP(extent,view)
							}
							else if(item.text == "Pine River"){
								DSS.activeRegion = "pineRiverMN";
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.map.un('pointermove', regionHighlighter)
								AppEvents.triggerEvent('hide_region_picker_indicator')
								DSS.layer.regionLabels.setVisible(false)
								DSS.layer.farms_1.setVisible(true)
								DSS.ApplicationFlow.instance.showFarmPickerPage();
								DSS.map.removeInteraction(DSS.selectRP);
                                let extent = [ -10595719.33,	5805080.059,	-10358718.96,	6020899.352]
                                let view = new ol.View({
                                    center: [-10458132.990856137, 5891167.715123995],
                                    zoom: 8,
                                    maxZoom: 30,
                                    minZoom: 8,
                                    constrainOnlyCenter: false,
                                    extent:extent
                                })
                                await DSS.MapState.zoomToRealExtentRP(extent,view)
							}
							DSS.map.removeInteraction(DSS.selectRP);
						}
					}
				}),
			]
		});
		
		me.callParent(arguments);
	}

});
