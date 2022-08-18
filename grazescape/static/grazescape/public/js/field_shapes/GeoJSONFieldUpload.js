var dummyData = [[-10115640.011618003,5414802.3536429405],[-10115648.965725254,5415103.8085870221],[-10116105.625194993,5415118.7320991009],[-10116111.594599824,5414793.3995356858],[-10115640.011618003,5414802.3536429405]]
var readerData=''

async function getNewFieldArea(){
	console.log("HI FROM GET NEW FIELD AREA!")
	await DSS.MapState.showFieldsAfterImport();
};

//------------------------------------------------------------------------------
Ext.define('DSS.field_shapes.GeoJSONFieldUpload', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.field_apply_panel',
	id: "GeoJSONFieldUpload",
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
				html: "Imported file must be a GeoJSON!",
			},{ //------------------------------------------
				xtype: 'component',
				//id: 'scenIDpanel',
				cls: 'information',
				html: 'The GeoJSON needs to be unprojected and in the WGS 84/Pseudo-Mercator CRS (EPSG:3857).  More flexiblty coming to this tool soon.',
			},{
                xtype: 'fieldset',
                title: 'Browse and upload file',
                items: [
                    {
                        xtype: 'filefield',
						width: 450,
                        label: "Find GeoJSON",
                        name: 'GeoJSON'
                     },
					 {
                        xtype: 'button',
                        text: 'Upload Field Boundaries',
                        handler: async function(){
							//Isolates geojson file for upload
                            let file = this.up().down('filefield').el.down('input[type=file]').dom.files[0];
                            var reader = new FileReader();
							reader.fileName = file.name
                            reader.onload = (function(theFile) {
                                return async function(e) {
									readerData = e.target.result
									readerFileName = e.target.fileName
									console.log(readerData)
									console.log(readerFileName)
									//Checks to make sure that the file is a geojson.
									if(readerFileName.indexOf("geojson") !== -1){
										return new Promise(await function(resolve) {
											var csrftoken = Cookies.get('csrftoken');
											$.ajaxSetup({
													headers: { "X-CSRFToken": csrftoken }
											});
											//Sends the read data from the geojson.  
											$.ajax({
												'url' : '/grazescape/outside_geojson_coord_pull',
												'type' : 'POST',
												'data' : {
													scenario_id:DSS.activeScenario,
													farm_id :DSS.activeFarm,
													file_data: readerData
												},
												success: async function(responses, opts) {
													console.log(responses)
													delete $.ajaxSetup().headers
													await resolve({geojson:responses.data})
													//
													getNewFieldArea()
													DSS.layer.fields_1.getSource().refresh();
													DSS.layer.fieldsLabels.getSource().refresh();
												
												},
												failure: function(response, opts) {
													console.log(responses)
													me.stopWorkerAnimation();
												}
											})
										})
									}else{
										//Upload Fail warning 
										console.log("GeoJSON upload FAILED!")
										alert("You choose the wrong file format.  You need to use an unprojected geojson.");
									}
									
                                };
                            })(file);
							//console.log(file)
                            reader.readAsBinaryString(file);
							this.up('window').destroy();
                        }
                    }
                ]
            }
			]
					 //{
            //             xtype: 'button',
            //             text: 'Upload Field Boundaries',
            //             handler: async function(){
            //                 let file = this.up().down('filefield').el.down('input[type=file]').dom.files[0];
            //                 var reader = new FileReader();
            //                 console.log(file)
			// 				reader.onload = (function(theFile) {
            //                     return async function(e) {
			// 						console.log(e)
			// 						readerData = e.target.result
			// 						console.log(readerData)
            //                     };
            //                 })(file);
			// 				//console.log(file)
            //                 reader.readAsBinaryString(file);
			// 				//reader.readAsDataURL(file);
			// 				this.up('window').destroy();
            //             }
            //         }
            //     ]
            // }
			// ]
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
