var readerData=''

async function getNewFieldArea(){
	console.log("HI FROM GET NEW FIELD AREA!")
	await DSS.MapState.showFieldsAfterImport();
};

//------------------------------------------------------------------------------
Ext.define('DSS.field_shapes.ShpFileFieldUpload', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.field_apply_panel',
	id: "ShpFileFieldUpload",
	constrain: false,
	modal: true,
	width: 500,
	resizable: true,
	bodyPadding: 8,
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
				cls: 'information',
				html: 'The Shapefile needs to be unprojected and in the WGS 84/Pseudo-Mercator CRS (EPSG:3857).  More flexiblty coming to this tool soon.',
			},{
				xtype:'form',
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
									//Allows for more than one file to be selected.  Important for shapefiles
									multiple:'multiple'
								});
							}
						}
                    },{
                        xtype: 'button',
                        text: 'Upload Shapefile',
                        handler: async function(){
							const formData = new FormData();
							var file1 = this.up().down('filefield').el.down('input[type=file]').dom.files[0];
							var file2 = this.up().down('filefield').el.down('input[type=file]').dom.files[1];
							var files = this.up().down('filefield').el.down('input[type=file]').dom.files
							//sets up file names for backend to work with
							for(f in files){
								formData.append('shapefile'+ [f],files[f])
							}
							formData.append('scenario_id', DSS.activeScenario);
							formData.append('farm_id', DSS.activeFarm);
							var csrftoken = Cookies.get('csrftoken');
							$.ajaxSetup({
								headers: { "X-CSRFToken": csrftoken }
							});
							//sends shapefile data to back end
							$.ajax({
								'url':'/grazescape/upload/',
								'type' : 'POST',
								'data' : formData,
								'mimeType': "multipart/form-data",
								'contentType': false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
								'processData': false, // NEEDED, DON'T OMIT THIS
								success: async function(responses, opts) {
									console.log(responses)
									console.log(responses[2])
									if(responses[2] == 's'){
										//fires if there is an issue with the shapefiles
										console.log("Shapefile upload FAILED!")
										alert("Your shapefile did not upload!  Please double check your shapefile and try again.");
									}
									else{
										console.log("Shapefile upload SUCCESS!")
										delete $.ajaxSetup().headers
										getNewFieldArea()
										//After the fields go into the db, this calculates their area, then updates the record again.
										DSS.layer.fields_1.getSource().refresh();
										DSS.layer.fieldsLabels.getSource().refresh();
									}
								},
								failure: function(response, opts) {
									console.log("ERROR!")
									console.log(responses)
									me.stopWorkerAnimation();
								}
							})
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
