// Module is used to run the compute models functions of the app

function runModels(layer) {
	
	 extentsArray = []; //empty array for extents list
	 layer.getSource().forEachFeature(function(f) { //iterates through fields to build extents array
		var extentTransform = function(fieldFeature){
			let fObj = [];
			let fGrass = fieldFeature.values_.grass_speciesval;
			let fTillage = fieldFeature.values_.tillage;
			let fOnContour = fieldFeature.values_.on_contour;
			let e = fieldFeature.values_.geometry.extent_;
			let pt1 = ol.proj.transform([e[0],e[1]], 'EPSG:3857', 'EPSG:3071'),
			pt2 = ol.proj.transform([e[2],e[3]], 'EPSG:3857', 'EPSG:3071');

			let p =	pt1.concat(pt2);
			
			fObj.push(p,fGrass,fTillage,fOnContour) //push p and field grass type to fObj
			extentsArray.push(fObj) //push each extent to array
			console.log(fObj);
		};
		extentTransform(f)//runs extent transform
	})
	//function inside of callmodelrun that actually calls computeresults on each field
	const callModelRun = (extent) => { 
		DSS.Inspector.computeResults(extent,DSS.layer.ModelResult);
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, 1000);
	  	});
	}
	
	const startTime = Date.now();
	//Sets up each callModelRun to run after each promise is resolved. IOW, makes them run one at a time.
	const doNextPromise = (z) => {
		callModelRun(extentsArray[z]).then(x => {
			console.log("just ran this extent: " + x);
			z++;

			if(z < extentsArray.length)
				doNextPromise(z)
			else 
				console.log("DONE IN MODEL RUNNING!")
		})
	}
	doNextPromise(0);
}


//------------------working variables--------------------
var type = "Polygon";
var source = fields_1Source;

Ext.create('Ext.data.Store', {
	storeId: 'modelList',
	fields:['value'],
	data: [{
		value: 'Grass Model',
	}]
});

//------------------------------------------------------------------------------
Ext.define('DSS.field_shapes.ModelRunning', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.model_run_tools',
    alternateClassName: 'DSS.ModelRunTools',
    singleton: true,	
	
    autoDestroy: false,
    
    scrollable: 'y',

	requires: [
		//'DSS.ApplicationFlow.activeFarm',
		'DSS.field_shapes.apply.ModelSelection',
	],
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		if (!DSS['viewModel']) DSS['viewModel'] = {}
		DSS.viewModel.modelRunning = new Ext.app.ViewModel({
			/*formulas: {
				tillageValue: { 
					bind: '{tillage.value}',
					get: function(value) { return {tillage: value }; 			},
					set: function(value) { this.set('tillage.value', value); 	}
				}
			},
			data: {}*/
		})
		
		me.setViewModel(DSS.viewModel.modelRunning);
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				cls: 'section-title light-text text-drp-20',
				html: 'Models<i class="fas fa-draw-polygon fa-fw accent-text text-drp-50"></i>',
				height: 35
				},{
				xtype: 'container',
				style: 'background-color: #666; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); border-top-color:rgba(255,255,255,0.25); border-bottom-color:rgba(0,0,0,0.3); box-shadow: 0 3px 6px rgba(0,0,0,0.2)',
				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				margin: '8 4',
				padding: '2 8 10 8',
				defaults: {
					DSS_parent: me,
				},
				items: [{
					xtype: 'component',
					cls: 'information light-text text-drp-20',
					html: 'Model Settings',
				},{
					xtype: 'modelSelection'
				},
				/*{
					xtype: 'widget',
					editor: {}, // workaround for exception
					text: 'Model List', dataIndex: 'modelList', width: 200, 
					hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
					widget: {
						xtype: 'combobox',
						queryMode: 'local',
						store: 'modelList',
						displayField: 'display',
						valueField: 'value',
						triggerWrapCls: 'x-form-trigger-wrap combo-limit-borders',
						listeners:{
							select: function(combo, value, eOpts){
								var record = combo.getWidgetRecord();
								record.set('modelList', value.get('value'));
								me.getView().refresh();
							}
						}
					}
				},*/
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Run Model',
					formBind: true,
					handler: function() { 
						console.log("run model")
						runModels(DSS.layer.fields_1);
					}
			    }]
			}]
		});
		me.callParent(arguments);
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


