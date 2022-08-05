var readerData=''

//var shapefile = require("shapefile");
async function getNewFieldArea(){
	console.log("HI FROM GET NEW FIELD AREA!")
	//await DSS.MapState.showFieldsForScenario();
	await DSS.MapState.showFieldsAfterImport();
	// console.log(DSS.activeScenario)
	// await geoServer.setFieldSource('&CQL_filter=scenario_id='+DSS.activeScenario)
	// DSS.layer.fields_1.getSource().refresh();
	// DSS.layer.fields_1.setVisible(true);
	// DSS.layer.fieldsLabels.setVisible(true);
	// console.log(DSS.layer.fields_1.getSource().getFeatures().length)
	// console.log("showfieldsforscenario ran");
// 	setTimeout(() => {
// 	console.log("Right before the plunge!")
// 	DSS.layer.fields_1.getSource().forEachFeature(function(f) {
// 		console.log(f)
// 		if (f.values_.field_name == "(imported field)"){
// 			//f.values_.area = ol.sphere.getArea(f.values_.geometry)* 0.000247105
// 			f.setProperties({
// 				area: ol.sphere.getArea(f.values_.geometry)* 0.000247105
// 			})
// 			console.log(f)
// 			wfs_update(f,'field_2');
// 		}		
// 	})
// }, "5000")
};

//------------------------------------------------------------------------------
Ext.define('DSS.field_shapes.ShpFileFieldUpload', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.field_apply_panel',
	id: "ShpFileFieldUpload",
//	autoDestroy: false,
//	closeAction: 'hide',
	constrain: false,
	modal: true,
	width: 500,
	resizable: true,
	bodyPadding: 8,
	//singleton: true,	
    autoDestroy: false,
    scrollable: 'y',
	titleAlign: 'center',
	title: 'Import Local GeoJSON',
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	//--------------------------------------------------------------------------
	initComponent: function() {

		let me = this;
		if(Ext.getCmp('GeoJSONpath')){
			Ext.getCmp('GeoJSONpath').destroy()
		}
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				cls: 'information-scenlabel',
				x: 0, y: -6,
				width: '100%',
				height: 40,
				style:{
							fontsize: 45,
							color: '#4477AA'
						},
				html: "Imported file must be a Shapefile!",
			},{ //------------------------------------------
				xtype: 'component',
				//id: 'scenIDpanel',
				cls: 'information',
				html: 'The Shapefile needs to be unprojected and in the WGS 84/Pseudo-Mercator CRS (EPSG:3857).  More flexiblty coming to this tool soon.',
			},{
				xtype:'form',
                //xtype: 'fieldset',
                title: 'Browse and upload file',
                items: [
                    {
                        xtype: 'filefield',
						width: 450,
                        label: "Find Shapefile",
                        name: 'shapefile',
						listeners:{
							afterrender:function(cmp){
								cmp.fileInputEl.set({
									multiple:'multiple'
								});
							}
						}
                    },{
                        xtype: 'button',
                        text: 'Upload Shapefile',
                        handler: async function(){
							//var form = $('form')[0]
							const formData = new FormData();
							//formData.append('scenario_id', DSS.activeScenario);
							//formData.append('farm_id', DSS.activeFarm);
							//var file = [this.up().down('filefield').el.down('input[type=file]').dom.files[0]];
							
							var file1 = this.up().down('filefield').el.down('input[type=file]').dom.files[0];
							var file2 = this.up().down('filefield').el.down('input[type=file]').dom.files[1];

							formData.append('shapefile1',file1)
							formData.append('shapefile2',file2)
							formData.append('scenario_id', DSS.activeScenario);
							formData.append('farm_id', DSS.activeFarm);
							console.log(file1)
							console.log(file2)
							var csrftoken = Cookies.get('csrftoken');
							$.ajaxSetup({
								headers: { "X-CSRFToken": csrftoken }
							});
							$.ajax({
								'url':'/grazescape/upload/',
								//'url':'/grazescape/upload_file',
								//'url' : '/grazescape/outside_shpfile_field_insert',
								'type' : 'POST',
								'data' : formData,
								'mimeType': "multipart/form-data",
								'contentType': false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
								'processData': false, // NEEDED, DON'T OMIT THIS
								success: async function(responses, opts) {
									console.log(responses)
									console.log("SUCCESS!")
									delete $.ajaxSetup().headers
									//await resolve({shpfile:responses.data})
									
									getNewFieldArea()
									DSS.layer.fields_1.getSource().refresh();
									DSS.layer.fieldsLabels.getSource().refresh();
								
								},
								failure: function(response, opts) {
									console.log(responses)
									me.stopWorkerAnimation();
								}
							})
						
							//var reader = new FileReader();
							// reader.onload = (function(theFile) {
                                // return async function(e) {
								// 	console.log(e)
								// 	readerData = e.target.result
								// 	console.log(readerData)
								// 	formData.append('file',readerData)
								// 	console.log(formData.values)
								// 	var csrftoken = Cookies.get('csrftoken');
								// 	$.ajaxSetup({
								// 		headers: { "X-CSRFToken": csrftoken }
								// 	});
								// 	$.ajax({
								// 		'url':'/grazescape/upload_file',
								// 		//'url' : '/grazescape/outside_shpfile_field_insert',
								// 		'type' : 'POST',
								// 		'data' : formData,
								// 		'mimeType': "multipart/form-data",
								// 		'contentType': false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
								// 		'processData': false, // NEEDED, DON'T OMIT THIS
								// 		success: async function(responses, opts) {
								// 			console.log(responses)
								// 			console.log("SUCCESS!")
								// 			delete $.ajaxSetup().headers
								// 			//await resolve({shpfile:responses.data})
											
								// 			// getNewFieldArea()
								// 			// DSS.layer.fields_1.getSource().refresh();
								// 			// DSS.layer.fieldsLabels.getSource().refresh();
										
								// 		},
								// 		failure: function(response, opts) {
								// 			console.log(responses)
								// 			me.stopWorkerAnimation();
								// 		}
								// 	})
								// };
                            //})(file);
							//console.log(file)
                            //reader.readAsBinaryString(file);
							// Attach file
							
							// formData.append('file',file)
							// console.log(formData.values)
							// var csrftoken = Cookies.get('csrftoken');
							
							this.up('window').destroy();


							
            			}
					}
				]
        	}]
		});
		me.callParent(arguments);
		AppEvents.registerListener("viewport_resize", function(opts) {
		//	me.center();
		})
                
     },
			
		
		
		
	
	//--------------------------------------------------------------------------
	addModeControl: function() {
		let me = this;
		let c = DSS_viewport.down('#DSS-mode-controls');
		
		if (!c.items.has(me)) {
			Ext.suspendLayouts();
				c.removeAll(false);
				c.add(me);
			Ext.resumeLayouts(true);
		}
	}
	
});
