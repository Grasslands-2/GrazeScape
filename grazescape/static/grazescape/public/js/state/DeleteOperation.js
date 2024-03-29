DSS.utils.addStyle('.underlined-input { border: none; border-bottom: 1px solid #ddd; display:table; width: 100%; height:100%; padding: 0 0 2px}')   
DSS.utils.addStyle('.underlined-input:hover { border-bottom: 1px solid #7ad;}')
DSS.utils.addStyle('.right-pad { padding-right: 32px }')   

farmArrayDO=[];
scenArrayDO = [];
fieldArrayDO = [];
infraArrayDO = [];
farmIDToDelete = 0;

var selectedOperation = {}
function selectOperation(){
	DSS.select = new ol.interaction.Select({
		layers:[DSS.layer.farms_1],
		features: new ol.Collection(),
			toggleCondition: ol.events.condition.never,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
				  color: 'rgba(255, 255, 255, 0.2)',
				}),
				stroke: new ol.style.Stroke({
				  color: '#ffcc33',
				  width: 2,
				}),
				image: new ol.style.Circle({
				  radius: 7,
				  fill: new ol.style.Fill({
					color: '#ffcc33'
				}),
			}),
		})
	});
	DSS.map.addInteraction(DSS.select);
	console.log("select is on")
	DSS.select.on('select', function(f) {
		console.log('select on happened');
		selectedOperation = f.selected[0];
		farmArrayDO.push(selectedOperation)
		console.log(farmArrayDO);
		farmIDToDelete = selectedOperation.values_.gid
		console.log(farmIDToDelete)
		//The idea is to capture the farm's id, then select all scenarios,
		//fields and infrastructure with that farm id and delete them.
	});
}

function deleteOperation(feat,featLayer){

		var formatWFS = new ol.format.WFS();
		var formatGML = new ol.format.GML({
			featureNS: 'http://geoserver.org/GrazeScape_Vector'
			/*'http://geoserver.org/Farms'*/,
			Geometry: 'geom',
			featureType: featLayer,
			srsName: 'EPSG:3857'
		});
		console.log(feat)
		node = formatWFS.writeTransaction(null, null, feat, formatGML);
		console.log(node);
		s = new XMLSerializer();
		str = s.serializeToString(node);
		console.log(str);

		geoServer.deleteOperation(str, feat)

}
function resetArraysDO(){
	farmArrayDO=[];
	scenArrayDO = [];
	fieldArrayDO = [];
	infraArrayDO = [];
	farmIDToDelete = 0;
	geoServer.setScenariosSource()
	geoServer.setFarmSource()
	cleanDB()
	DSS.map.render;
	console.log("DO reset arrays complete!!!!!!!!")
}

async function gatherdeleteFeatures(){
	DSS.layer.scenarios.getSource().forEachFeature(function(s) {
		//console.log(s)
		if(s.values_.farm_id == farmIDToDelete){
			scenArrayDO.push(s)
		}
	})
	DSS.layer.fields_1.getSource().forEachFeature(function(f) {
		//console.log(f)
		if(f.values_.farm_id == farmIDToDelete){
			fieldArrayDO.push(f)
		}
	})
	DSS.layer.infrastructure.getSource().forEachFeature(function(i) {
		console.log(i)
		if(i.values_.farm_id == farmIDToDelete){
			infraArrayDO.push(i)
		}
	})
	console.log(scenArrayDO)
	console.log(fieldArrayDO)
	console.log(infraArrayDO)
}

async function deleteOpFeatures(){
	// DSS.layer.scenarios.getSource().forEachFeature(function(s) {
	// 	//console.log(s)
	// 	if(s.values_.farm_id == farmIDToDelete){
	// 		scenArrayDO.push(s)
	// 	}
	// })
	// DSS.layer.fields_1.getSource().forEachFeature(function(f) {
	// 	//console.log(f)
	// 	if(f.values_.farm_id == farmIDToDelete){
	// 		fieldArrayDO.push(f)
	// 	}
	// })
	// DSS.layer.infrastructure.getSource().forEachFeature(function(i) {
	// 	console.log(i)
	// 	if(i.values_.farm_id == farmIDToDelete){
	// 		infraArrayDO.push(i)
	// 	}
	// })
	// console.log(scenArrayDO)
	// console.log(fieldArrayDO)
	// console.log(infraArrayDO)
	//delArrays = [infraArrayDO,fieldArrayDO,scenArrrayDO]
	await deleteOperation(farmArrayDO,'farm_2');
	await deleteOperation(scenArrayDO,'scenarios_2');
	await deleteOperation(infraArrayDO,'infrastructure_2');
	await deleteOperation(fieldArrayDO,'field_2');
	await resetArraysDO()
};

//------------------------------------------------------------------------------
Ext.define('DSS.state.DeleteOperation', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.operation_delete',
    //alternateClassName: 'DSS.DeleteOperations',
    //singleton: true,	
	
    //autoDestroy: false,
    
    //scrollable: 'y',

	layout: DSS.utils.layout('vbox', 'center', 'stretch'),
	cls: 'section',

	DSS_singleText: '"Delete Current Operation"',
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				cls: 'back-button',
				tooltip: 'Back',
				html: '<i class="fas fa-reply"></i>',
				listeners: {
					render: function(c) {
						c.getEl().getFirstChild().el.on({
							click: function(self) {
								DSS.ApplicationFlow.instance.showFarmPickerPage();
							}
						});
					}
				}					
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
					html: 'Select farm to be deleted then click the "Confirm Deletion" button below.',
				},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: "Confirm Deletion",
					formBind: true,
					handler: async function() {
						//var data = me.viewModel.data;
						console.log("Delete Button");
						if (selectedOperation != {}) {
							//deleteOperation(selectedOperation,'farm_2');
							await gatherdeleteFeatures()
							await deleteOpFeatures()
							geoServer.setFarmSource()

						}
						else {
							console.log("no farm selected")
						}
					}
			    }]
			}]
		});
		
		me.callParent(arguments);
	},
	
	//--------------------------------------------------------------------------
	addModeControl: function(owner) {
		let me = this;
		let c = DSS_viewport.down('#DSS-mode-controls');
		console.log('delete mode on')
		selectOperation()
		
		
		if (!c.items.has(me)) {
			Ext.suspendLayouts();
				c.removeAll(false);
				c.add(me);
			Ext.resumeLayouts(true);
		}
		me.mouseMoveDeleteHandler(owner);
		me.clickdeleteOperationHandler(owner);
	},
	
    //-------------------------------------------------------------
	mouseMoveDeleteHandler: function() {
		
		DSS.mouseMoveFunction = function(evt) {
			let coordinate  =  DSS.map.getEventCoordinate(evt.originalEvent);
			let fs = DSS.layer.fields_1.getSource().getFeaturesAtCoordinate(coordinate);
			let cursor = '';
			let mouseList = [];
			fs.forEach(function(f) {
				let g = f.getGeometry();
				if (g && g.getType() === "Point") {
					cursor = 'pointer';
					mouseList.push(f);
					
					let extent = g.getExtent();
					let center = ol.extent.getCenter(extent);
					center[1] += (ol.extent.getHeight(extent) / 2);
					center = g.getClosestPoint(center);
				}
			})
			DSS.map.getViewport().style.cursor = cursor;
		}		
	},
	
    //-------------------------------------------------------------
    clickdeleteOperationHandler: function(owner) {
    	
    	DSS.mapClickFunction = function(evt) {
			let coordinate  =  DSS.map.getEventCoordinate(evt.originalEvent);
			let fs = DSS.layer.fields_1.getSource().getFeaturesAtCoordinate(coordinate);
			let deleteList = [];
			fs.forEach(function(f) {
				let g = f.getGeometry();
				if (g && g.getType() === "Point") {
					deleteList.push({'f':f, 'f_id': f.getProperties().f_id});
//					deleteList.push(f.getProperties().f_id);
				}
			})
			if (deleteList.length > 0) {
				owner.deleteOperation(deleteList,DSS.activeFarm);
			}
		}		
    },
	
});
