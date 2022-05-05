var dummyData = [[-10115640.011618003,5414802.3536429405],[-10115648.965725254,5415103.8085870221],[-10116105.625194993,5415118.7320991009],[-10116111.594599824,5414793.3995356858],[-10115640.011618003,5414802.3536429405]]


//------------------------------------------------------------------------------
Ext.define('DSS.field_shapes.ShpFieldUpload', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.field_apply_panel',
	id: "ShpFieldUpload",
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
	title: 'Upload a Local Shapefile for field boundaries',
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	//--------------------------------------------------------------------------
	initComponent: function() {

		let me = this;
		if(Ext.getCmp('Shpfilepath')){
			Ext.getCmp('Shpfilepath').destroy()
		}
		Ext.applyIf(me, {
			items: [{
                xtype: 'fieldset',
                title: 'My Uploader',
                items: [
                    {
                        xtype: 'filefield',
                        label: "MyPhoto:",
                        name: 'photo'
                    }, {
                        xtype: 'button',
                        text: 'Get File',
                        handler: function(){
                            let file = this.up().down('filefield').el.down('input[type=file]').dom.files[0];
                            var reader = new FileReader();

                            reader.onload = (function(theFile) {
                                return function(e) {
									console.log(e.target)
									console.log(e.target.result)
                                    //process upload
                                    alert(e.target.result);
                                };
                            })(file);
							console.log(file)
                            reader.readAsBinaryString(file);

							console.log(dummyData)
							return new Promise(function(resolve) {
								var csrftoken = Cookies.get('csrftoken');
								$.ajaxSetup({
										headers: { "X-CSRFToken": csrftoken }
								});
								$.ajax({
									'url' : '/grazescape/outside_geom_field_insert',
									'type' : 'POST',
									'data' : {
										scenario_id:DSS.activeScenario,
										farm_id :DSS.activeFarm,
										coords_array : JSON.stringify(dummyData)
									},
									success: function(responses, opts) {
										console.log(responses)
										delete $.ajaxSetup().headers
										resolve({geojson:responses.data, current:currObj})
									},
					
									failure: function(response, opts) {
										console.log(responses)
										me.stopWorkerAnimation();
									}
								})
							})
                        }
                    }
                ]
            }




				// {
				// 	xtype: 'component',
				// 	x: 0, y: -6,
				// 	width: '100%',
				// 	height: 75,
				// 	cls: 'information accent-text bold',
				// 	html: [
				// 		'<form class="upload">',
				// 			'<input type="file" name="uploadFile" accept="json, geojson"/>',
				// 			'<br/><br/>',
				// 			'<input type="submit" />',
				// 		'</form>'
				// 	]
				// 	//html: "Choose From the Scenarios Below",
				// },


			// 		{
			// 		xtype: 'form',
					
			// 		title: 'Upload a Photo',
			// 		width: 400,
			// 		bodyPadding: 10,
			// 		frame: true,
			// 		renderTo: Ext.getBody(),
			// 		items: [
			// 			{
			// 				xtype: 'filefield',
			// 				id:'Shpfilepath',
			// 				accept: 'geojson',
			// 				name: 'photo',
			// 				fieldLabel: 'Photo',
			// 				labelWidth: 50,
			// 				msgTarget: 'side',
			// 				allowBlank: false,
			// 				anchor: '100%',
			// 				buttonText: 'Select Photo...'
			// 			}
			// 	],
			// 	buttons: [{
			// 		text: 'Upload',
			// 		handler: function() {
			// 			let file = this.up().down('filefield').el.down('input[type=file]').dom.files[0];
			// 			var reader = new FileReader();

			// 			reader.onload = (function(theFile) {
			// 				return function(e) {
			// 					let result = e.target.result;
			// 					//process upload with result
			// 					alert(result);
			// 				};
			// 			})(file);

			// 			reader.readAsBinaryString(file);
			// 			// var form = this.up('form').getForm();
			// 			// if(form.isValid()) {
			// 			// 	console.log(Ext.getCmp('Shpfilepath'))
			// 				//form.submit({

			// 					// url: 'photo-upload.php',
			// 					// waitMsg: 'Uploading your photo...',
			// 					// success: function(fp, o) {
			// 					// 	Ext.Msg.alert('Success', 'Your photo "' + o.result.file + '" has been uploaded.');
			// 					// }
			// 				//});
			// 			}
			// 		}
			// 	]

			// }
			]
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
