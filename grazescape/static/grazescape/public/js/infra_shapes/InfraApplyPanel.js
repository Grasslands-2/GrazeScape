DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')
var dupname = false
var InfrastructureSource_loc = new ol.source.Vector({
});
var fenceDrawStyle = new ol.style.Style({
	stroke: new ol.style.Stroke({
		color: '#bfac32',
		width: 4,
	}),
	image: new ol.style.Circle({
		radius: 7,
		fill: new ol.style.Fill({
		  color: '#bfac32',
		}),
	}),
})
var laneDrawStyle = new ol.style.Style({
	stroke: new ol.style.Stroke({
		color: '#bd490f',
		width: 4,
	}),
	image: new ol.style.Circle({
		radius: 7,
		fill: new ol.style.Fill({
		  color: '#bd490f',
		}),
	}),
})
var waterLineDrawStyle = new ol.style.Style({
	stroke: new ol.style.Stroke({
		color: '#0072fc',
		width: 4,
	}),
	image: new ol.style.Circle({
		radius: 7,
		fill: new ol.style.Fill({
		  color: '#0072fc',
		}),
	}),
})
var infraDrawDefaultStyle = new ol.style.Style({
	stroke: new ol.style.Stroke({
		color: '#ff0825',
		width: 4,
	})
})
function infraDrawStyle(infra_typeInput){
	if(infra_typeInput == 'fl'){
		return fenceDrawStyle
	}
	if(infra_typeInput == 'll'){
		return laneDrawStyle
	}
	if(infra_typeInput == 'wl'){
		return waterLineDrawStyle
	}
	else{
		return infraDrawDefaultStyle
	}
};

function get_terrian_distance(data){
    return new Promise(function(resolve) {
    var csrftoken = Cookies.get('csrftoken');
	console.log('data coming into ajax call')
	console.log(data)
    $.ajaxSetup({
            headers: { "X-CSRFToken": csrftoken }
        });
    $.ajax({
    'url' : '/grazescape/run_InfraTrueLength',
    'type' : 'POST',
    'data' : data,
        success: function(responses, opts) {
			console.log('hit infra profile tool')
			console.log(responses)
			infraLength = infraLength + responses.output
			console.log(infraLength)
			resolve([])
		},
		error: function(responses) {
			console.log('python tool call error')
			console.log(responses)
		}
	})}
)}

function wfs_infra_insert(feat,geomType) {  
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
			featureNS: 'http://geoserver.org/GrazeScape_Vector'
			/*'http://geoserver.org/Farms'*/,
			Geometry: 'geom',
			featureType: 'infrastructure_2',
			srsName: 'EPSG:3857'
		});
    console.log(feat.values_)
    node = formatWFS.writeTransaction([feat], null, null, formatGML);
	console.log(node);
    s = new XMLSerializer();
    str = s.serializeToString(node);
    console.log(str);
    geoServer.wfs_infra_insert(str, feat)
}


function createinfra(e,infra_nameInput,
	infra_typeInput,
	fence_materialInput,
	water_pipeInput,
	lane_materialInput){
		infra_typeDisp = '';
		fence_materialDisp = '';
		water_pipeDisp = '';
		lane_materialDisp = '';
		costPerFoot = 0;
	
		console.log(infra_nameInput);
		//---------------Setting Infra Values-----------------------
		if(infra_typeInput == 'fl') {infra_typeDisp = 'Fencing'
			if(fence_materialInput == 'hte1') {
				fence_materialDisp = 'High Tensile Electric, One Strand'
				costPerFoot = 0.84}
			else if(fence_materialInput == 'hte'){ 
				fence_materialDisp = 'High Tensile Electric, Two Strand'
				costPerFoot = 1.81}
			else if(fence_materialInput == 'pp'){ 
				fence_materialDisp = 'Moveable polywire'
				costPerFoot = 0.37}
			}
		else if (infra_typeInput == 'wl') {infra_typeDisp = 'Water Line'
			if(water_pipeInput == 'sup') {
				water_pipeDisp = 'Surface HDPE or PVC Pipe'
				costPerFoot = 1.17;}
			else if(water_pipeInput == 'sbp'){ 
				water_pipeDisp = 'Shallow Buried HDPE or PVC Pipe'
				costPerFoot = 2.31;}
			}
		else if(infra_typeInput == 'll'){ infra_typeDisp = 'Lane Line'
			if(lane_materialInput == 're') {
				lane_materialDisp = 'Raised Earth Walkway'
				costPerFoot = 0.16}
			else if(lane_materialInput == 'gw') {
				lane_materialDisp = 'Gravel Walkway'
				costPerFoot = 0.37}
			else if(lane_materialInput == 'gg') {
				lane_materialDisp = 'Gravel over Geotextile'
				costPerFoot = 0.56}
			else if(lane_materialInput == 'ggr'){ 
				lane_materialDisp = 'Gravel Over Graded Rock'
				costPerFoot = 0.96}
			if(lane_materialInput == 'ggrg'){ 
				lane_materialDisp = 'Gravel Over Graded Rock and Geotextile'
				costPerFoot = 1.33}
			}

	//-------------------Now for the actual function-----------------

	addInfraProps(e,infra_nameInput,infra_typeInput,fence_materialInput,water_pipeInput,lane_materialInput)
	// DSS.draw = new ol.interaction.Draw({
	// 	source: source,
	// 	type: 'MultiPolygon',
	// 	geometryName: 'geom'
	// });
	// DSS.map.addInteraction(DSS.draw);
	// console.log("draw is on");
	// var af = parseInt(DSS.activeFarm,10);
	// var as = DSS.activeScenario;
	// console.log('This is the active scenario#: ');
	// setFeatureAttributes(e.feature)
	// addFieldAcreage(e.feature)
	// alert('Field Added!')
}
function addInfraProps(e,infra_nameInput,infra_typeInput,fence_materialInput,water_pipeInput,lane_materialInput) {
	//var geom = e.target;
	console.log(e);
	//		in meters convert to feet
	var lineGeom = e.feature.values_.geom
	//infraLength = e.feature.values_.geom.getLength() * 3.28084;
	infraLength = ol.sphere.getLength(lineGeom) * 3.28084;
	data = {
		extents: e.feature.values_.geom.extent_,
		cords: e.feature.values_.geom.flatCoordinates,
		infraID: e.feature.ol_uid,
		// infraLengthXY kept in meters
		infraLengthXY: infraLength
		//e.feature.values_.geom.getLength()
	}
	console.log(data)
	console.log(infraLength);
	//await get_terrian_distance(data)
	console.log(infraLength);
	totalCost = (infraLength * costPerFoot).toFixed(2)
	console.log(totalCost);
	e.feature.setProperties({
		id: DSS.activeFarm,
		farm_id: DSS.activeFarm,
		scenario_id: DSS.activeScenario,
		infra_name: infra_nameInput,
		infra_type: infra_typeInput,
		infra_type_disp: infra_typeDisp,
		fence_material: fence_materialInput,
		fence_material_disp: fence_materialDisp,
		water_pipe: water_pipeInput,
		water_pipe_disp: water_pipeDisp,
		lane_material: lane_materialInput,
		lane_material_disp:lane_materialDisp,
		cost_per_foot: costPerFoot,
		infra_length: infraLength,
		total_cost: totalCost
	})
	var geomType = 'Line'
	console.log(e.feature)
	DSS.MapState.removeMapInteractions()
	wfs_infra_insert(e.feature, geomType)
	console.log("HI! WFS infra Insert ran!")
	alert('Infrastructure added!')
}    


//------------------working variables--------------------
var type = "Line";
var source = InfrastructureSource_loc

var InfraTypeVar = ''

//------------------------------------------------------------------------------
Ext.define('DSS.infra_shapes.InfraApplyPanel', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.infra_apply_panel',
	id: "infraApplyPanel",
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
	title: 'Choose your new Infrastructures Options',
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	requires: [
		//'DSS.ApplicationFlow.activeFarm',
		//'DSS.infra_shapes.apply.infraName',
		//'DSS.infra_shapes.apply.infraType',
		'DSS.infra_shapes.apply.fenceMaterial',
		'DSS.infra_shapes.apply.waterPipe',
		'DSS.infra_shapes.apply.laneMaterial'
	],
	

	
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		if (!DSS['viewModel']) DSS['viewModel'] = {}
		DSS.viewModel.infraApplyPanel = new Ext.app.ViewModel({
			data: {
				infraName: {
					is_active: true,
					value: '',
				},
				infraType: {
					is_active: true,
					value: '',
				},
				fenceMaterial: {
					is_active: false,
					value: '',
				},
				waterPipe: {
					is_active: false,
					value: '',
				},
				laneMaterial: {
					is_active: false,
					value: '',
				}
			}
		})
		me.setViewModel(DSS.viewModel.infraApplyPanel);
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				cls: 'section-title light-text text-drp-20',
				html: 'infrastructure Lines <i class="fas fa-draw-polygon fa-fw accent-text text-drp-50"></i>',
				height: 35
				},{
				//xtype: 'container',
				xtype: 'form',
				url: 'create_infra', // brought in for form test
				jsonSubmit: true,// brought in for form test
				header: false,// brought in for form test
				border: false,// brought in for form test
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
					html: 'Infrastructure Options',
				},
				//Infra Naming Component!!!!!!!!!
				{
					xtype: 'component',
					x: 0, y: -6,
					width: '100%',
					height: 28,
					cls: 'information accent-text bold',
					html: "Infra Label",
				},
						{
						xtype: 'textfield',
						itemId: 'dss-infra-name',
						layout: 'center',
						padding: 15,
						allowBlank: false,
						labelWidth: 35,
						labelAlign: 'right',
						bind: { value: '{infraName.value}' },
						minValue: 1,
						maxValue: 200,
						width: 160,
						step: 5
					// }]
				},
				//infra type component!!!!!!!!
				{
					xtype: 'container',
					width: '100%',
					layout: 'absolute',
					items: [{
						xtype: 'component',
						x: 0, y: -6,
						width: '100%',
						height: 7,
						cls: 'information accent-text bold',
						html: "Infrastructure Type",
					},
					//getToggle(this, 'infraType.is_active') 
				]},
				{
					xtype: 'radiogroup',
					//id: 'ITcontents',
					style: 'padding: 0px; margin: 0px', // fixme: eh...
					//hideEmptyLabel: true,
					padding: 15,
					columns: 1,
					allowBlank: false,
					vertical: true,
					viewModel: {
						formulas: {
							infraTypeValue: {
								bind: '{infraType.value}', // inherited from parent
								get: function(val) {
									let obj = {};
									obj["infraType"] = val;
									return obj;
								},
								set: function(val) {
									this.set('infraType.value', val["infraType"]);
								}
							}
						}
					},
					listeners:{
						change: function(){
							selectedType = this.getValue().infraType
							InfraTypeVar = selectedType
							 if(InfraTypeVar == 'wl'){
								 console.log('water lines')
								 Ext.getCmp('WPcontentsAP').enable()
								 Ext.getCmp('LMcontentsAP').disable()
								 Ext.getCmp('FMcontentsAP').disable()
							 }else if(InfraTypeVar == 'll'){
								 console.log('lane lines')
								 Ext.getCmp('WPcontentsAP').disable()
								 Ext.getCmp('LMcontentsAP').enable()
								 Ext.getCmp('FMcontentsAP').disable()
							 }else if(InfraTypeVar == 'fl'){
								 console.log('fence lines')
								 Ext.getCmp('WPcontentsAP').disable()
								 Ext.getCmp('LMcontentsAP').disable()
								 Ext.getCmp('FMcontentsAP').enable()
							 }
						}
					},
					bind: '{infraTypeValue}', // formula from viewModel above
					defaults: {
						name: "infraType",
						listeners: {
							afterrender: function(self) {
								if ( self.boxLabelEl) {
									self.boxLabelEl.setStyle('cursor', 'pointer')
								}
							},
						}
					},
					items: [{ 
						boxLabel: 'Water Line', inputValue: 'wl',
					},{ 
						boxLabel: 'Lane Line', inputValue: 'll',
					},{
						boxLabel: 'Fencing', inputValue: 'fl',
					}]
				},
				//Waterpipe!!!!!!!!!!!!!
				{
					xtype: 'container',
					width: '100%',
					layout: 'absolute',
					//disabled: true,
					//itemId: 'WPcontentsAP',
					items: [{
						xtype: 'component',
						x: 0, y: -3,
						width: '100%',
						height: 7,
						cls: 'information accent-text bold',
						html: "Set Water Infrastructure",
					},
				]},
					{
						xtype: 'radiogroup',
						id: 'WPcontentsAP',
						disabled: true,
						style: 'padding: 0px; margin: 0px', // fixme: eh...
						//hideEmptyLabel: true,
						padding: 15,
						columns: 1, 
						vertical: true,
						viewModel: {
							formulas: {
								waterPipeValue: {
									bind: '{waterPipe.value}', // inherited from parent
									get: function(val) {
										let obj = {};
										obj["waterPipe"] = val;
										return obj;
									},
									set: function(val) {
										this.set('waterPipe.value', val["waterPipe"]);
									}
								}
							}
						},
						bind: '{waterPipeValue}', // formula from viewModel above
						defaults: {
							name: "waterPipe",
							listeners: {
								afterrender: function(self) {
									if ( self.boxLabelEl) {
										self.boxLabelEl.setStyle('cursor', 'pointer')
									}
								}
							}
						//	boxLabelCls: 'hover'
						},
						items: [{
							boxLabel: 'Surface HDPE or PVC Pipe', inputValue: 'sup',
						},{ 
							boxLabel: 'Shallow Buried HDPE or PVC Pipe', inputValue: 'sbp',
						}]
					},
					//Lane Materials!!!!!!!!
					{
						xtype: 'component',
						x: 0, y: -6,
						width: '100%',
						height: 7,
						cls: 'information accent-text bold',
						html: "Set Lane Material",
					},
					{
						xtype: 'radiogroup',
						id: 'LMcontentsAP',
						disabled: true,
						style: 'padding: 0px; margin: 0px', // fixme: eh...
						//hideEmptyLabel: true,
						padding: 15,
						columns: 1, 
						vertical: true,
						viewModel: {
							formulas: {
								laneMaterialValue: {
									bind: '{laneMaterial.value}', // inherited from parent
									get: function(val) {
										let obj = {};
										obj["laneMaterial"] = val;
										return obj;
									},
									set: function(val) {
										this.set('laneMaterial.value', val["laneMaterial"]);
									}
								}
							}
						},
						bind: '{laneMaterialValue}', // formula from viewModel above
						defaults: {
							name: "laneMaterial",
							listeners: {
								afterrender: function(self) {
									if ( self.boxLabelEl) {
										self.boxLabelEl.setStyle('cursor', 'pointer')
									}
								}
							}
						//	boxLabelCls: 'hover'
						},
						items: [{
							boxLabel: 'Raised Earth Walkway', inputValue: 're',
						},{ 
							boxLabel: 'Gravel Walkway', inputValue: 'gw',
						},{ 
							boxLabel: 'Gravel over Geotextile', inputValue: 'gg',
						},{ 
							boxLabel: 'Gravel Over Graded Rock', inputValue: 'ggr',
						},{ 
							boxLabel: 'Gravel Over Graded Rock <br>and Geotextile', inputValue: 'ggrg',
						}]
					},
					//Fence Materials!!!!
					{
						xtype: 'component',
						x: 0, y: -6,
						width: '100%',
						height: 7,
						cls: 'information accent-text bold',
						html: "Set Fence Material",
					},
					{
						xtype: 'radiogroup',
						id: 'FMcontentsAP',
						disabled: true,
						style: 'padding: 0px; margin: 0px', // fixme: eh...
						//hideEmptyLabel: true,
						padding: 15,
						columns: 1, 
						vertical: true,
						viewModel: {
							formulas: {
								fenceMaterialValue: {
									bind: '{fenceMaterial.value}', // inherited from parent
									get: function(val) {
										let obj = {};
										obj["fenceMaterial"] = val;
										return obj;
									},
									set: function(val) {
										this.set('fenceMaterial.value', val["fenceMaterial"]);
									}
								}
							}
						},
						bind: '{fenceMaterialValue}', // formula from viewModel above
						defaults: {
							name: "fenceMaterial",
							listeners: {
								afterrender: function(self) {
									if ( self.boxLabelEl) {
										self.boxLabelEl.setStyle('cursor', 'pointer')
									}
								}
							}
						},
						// listeners:{
						// 	change: function(self) {
						// 			if(this.inputValue == 'fl'){
						// 				//this.setDisabled(true);
						// 				console.log('hi from fence material after render')
						// 			}
						// },
						
						items: [{
							boxLabel: 'High Tensile Electric, One Strand', inputValue: 'hte1',
						},{ 
							 boxLabel: 'High Tensile Electric, Two Strand', inputValue: 'hte',
						},{ 
							boxLabel: 'Moveable polywire', inputValue: 'pp',
						}]
					},
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Add Infrastructure',
					formBind: true,
					handler: async function() {
						//console.log(DSS.infra_shapes.apply.infraType.getValue())
						var form =  this.up('form').getForm(); 
						var data = me.viewModel.data;
						dupname = false
						console.log(data.infraType.value)
						console.log(DSS.draw.style)
						if(form.isValid()){
							DSS.map.removeInteraction(DSS.select);
							//console.log(DSS.activeFarm);
							await dupNameCheck(data.infraName.value,DSS.layer.infrastructure,"infra")
							if(dupname){
								alert("You already have infrastructure with that name in this scenario!")
								form.reset()
							}else{
								createinfra(inputInfraObj,
									data.infraName.value,
									data.infraType.value,
									data.fenceMaterial.value,
									data.waterPipe.value,
									data.laneMaterial.value
								);
								//form.reset()
								this.up('window').destroy();
							}
						}
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