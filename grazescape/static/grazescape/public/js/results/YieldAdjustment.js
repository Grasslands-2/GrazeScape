
DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')

function userUpdateYields(){
	var dmFarmTotal = chartObj.rotation_yield_farm.chartData.datasets[0]
	var grassFarmTotal = chartObj.grass_yield_farm.chartData.datasets[0]
	var cornFarmTotal = chartObj.corn_yield_farm.chartData.datasets[0]
	var soyFarmTotal = chartObj.soy_yield_farm.chartData.datasets[0]
	var oatFarmTotal = chartObj.oat_yield_farm.chartData.datasets[0]
	var silageFarmTotal = chartObj.corn_silage_yield_farm.chartData.datasets[0]
	var alfalfaFarmTotal = chartObj.alfalfa_yield_farm.chartData.datasets[0]
	var dmDataArray = chartObj.rotation_yield_field.chartData.datasets
	var grassdataarray = chartObj.grass_yield_field.chartData.datasets
    var corndataarray = chartObj.corn_yield_field.chartData.datasets
    var silagedataarray = chartObj.corn_silage_yield_field.chartData.datasets
    var soydataarray = chartObj.soy_yield_field.chartData.datasets
    var oatdataarray = chartObj.oat_yield_field.chartData.datasets
    var alfalfadataarray = chartObj.alfalfa_yield_field.chartData.datasets
	dmFarmTotal.data[0] = 0
	grassFarmTotal.data[0] = 0
	cornFarmTotal.data[0] = 0
	soyFarmTotal.data[0] = 0
	silageFarmTotal.data[0] = 0
	oatFarmTotal.data[0] = 0
	alfalfaFarmTotal.data[0] = 0

	for(f in fieldYieldArray){
		var fieldID = fieldYieldArray[f].id
		fieldYieldArray[f].dMYieldAc = 0
		// for(d in dmDataArray){
		// 	if(dmDataArray[d].dbID == fieldID){
		// 		dmFarmTotal.data[0] = dmFarmTotal.data[0] + 
		// 		console.log(dmFarmTotal.data[0])
		// 	}
		// }
		//use the above example to update the farm values in the chartobj to reflect the new totals after a user adjusts the yields.
		for(g in grassdataarray){
			if (grassdataarray[g].dbID == fieldID){
				//console.log(fieldYieldArray[f].grassYieldTonsAc)
				/*field crop value*/grassdataarray[g].data[0] = fieldYieldArray[f].grassYieldTonsAc
				/*farm crop value*/grassFarmTotal.data[0] = grassFarmTotal.data[0] + (fieldYieldArray[f].grassYieldTonsAc * chartObj.grass_yield_field.area[g])
				console.log(grassFarmTotal.data[0])
				/*total DM for field*/fieldYieldArray[f].dMYieldAc = fieldYieldArray[f].dMYieldAc + fieldYieldArray[f].grassYieldTonsAc
			}
		}
		for(c in corndataarray){
			if (corndataarray[c].dbID == fieldID){
				corndataarray[c].data[0] = fieldYieldArray[f].cornGrainBrusdAc
				cornFarmTotal.data[0] = cornFarmTotal.data[0] + (fieldYieldArray[f].cornGrainBrusdAc * chartObj.corn_yield_field.area[c])
				//console.log(cornFarmTotal.data[0])
				fieldYieldArray[f].dMYieldAc = fieldYieldArray[f].dMYieldAc + (fieldYieldArray[f].cornGrainBrusdAc/39.3680)
				//console.log(fieldYieldArray[f].dMYieldAc)
			}
		}
		for(so in soydataarray){
			if (soydataarray[so].dbID == fieldID){
				soydataarray[so].data[0] = fieldYieldArray[f].soyGrainBrusAc
				soyFarmTotal.data[0] = soyFarmTotal.data[0] + (fieldYieldArray[f].soyGrainBrusAc * chartObj.soy_yield_field.area[so])
				fieldYieldArray[f].dMYieldAc = fieldYieldArray[f].dMYieldAc + (fieldYieldArray[f].soyGrainBrusAc/33.33)
			}
		}
		for(s in silagedataarray){
			if (silagedataarray[s].dbID == fieldID){
				silagedataarray[s].data[0] = fieldYieldArray[f].cornSilageTonsAc
				silageFarmTotal.data[0] = silageFarmTotal.data[0] + fieldYieldArray[f].cornSilageTonsAc
				//dmDataArray.data[0] = dmDataArray.data[0] +
				//Apperently silage is not considered as part of the DM yield in this case.  Ask team.
			}
		}
		for(o in oatdataarray){
			if (oatdataarray[o].dbID == fieldID){
				oatdataarray[o].data[0] = fieldYieldArray[f].oatYieldBrusAc
				oatFarmTotal.data[0] = oatFarmTotal.data[0] + fieldYieldArray[f].oatYieldBrusAc
				fieldYieldArray[f].dMYieldAc = fieldYieldArray[f].dMYieldAc + (fieldYieldArray[f].oatYieldBrusAc/62.5)
			}
		}
		for(a in alfalfadataarray){
			if (alfalfadataarray[a].dbID == fieldID){
				alfalfadataarray[a].data[0] = fieldYieldArray[f].alfalfaYieldTonsAc
				alfalfaFarmTotal.data[0] = alfalfaFarmTotal.data[0] + (fieldYieldArray[f].alfalfaYieldTonsAc * chartObj.alfalfa_yield_field.area[a])
				fieldYieldArray[f].dMYieldAc = fieldYieldArray[f].dMYieldAc + fieldYieldArray[f].alfalfaYieldTonsAc
			}
		}
		console.log('DM yeild total for field: ' + fieldID + ': ' + fieldYieldArray[f].dMYieldAc)
		for(d in dmDataArray){
			if (dmDataArray[d].dbID == fieldID){
				dmDataArray[d].data[0] = fieldYieldArray[f].dMYieldAc///chartObj.rotation_yield_field.area[d]
				dmFarmTotal.data[0] = dmFarmTotal.data[0] + fieldYieldArray[f].dMYieldAc
				console.log(dmFarmTotal.data[0])
			}
		}
		//dmFarmTotal.data[0] = dmFarmTotal.data[0] + fieldYieldArray[f].dMYieldAc
	}
	//final farm and DM calcs
	grassFarmTotal.data[0] = grassFarmTotal.data[0] /chartObj.grass_yield_farm.area[0]
	console.log(grassFarmTotal.data[0])
	cornFarmTotal.data[0] = cornFarmTotal.data[0]/chartObj.corn_yield_farm.area[0]
	console.log(cornFarmTotal.data[0])
	soyFarmTotal.data[0] = soyFarmTotal.data[0] /chartObj.soy_yield_farm.area[0]
	console.log(soyFarmTotal.data[0])
	oatFarmTotal.data[0] = oatFarmTotal.data[0] /chartObj.oat_yield_farm.area[0]
	console.log(oatFarmTotal.data[0])
	alfalfaFarmTotal.data[0] = alfalfaFarmTotal.data[0] /chartObj.oat_yield_farm.area[0]
	console.log(alfalfaFarmTotal.data[0])
	dmFarmTotal.data[0] = dmFarmTotal.data[0] /chartObj.rotation_yield_farm.area[0]

	console.log(chartObj)
}
//FOLLOW THE CORN MODEL TO GET THE MULTIPLE AND DIVIDE BY ACRES RIGHT!!!!!!!!!!!!!!
//------------------------------------------------------------------------------
Ext.define('DSS.results.YieldAdjustment', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.results_yield_adjust',
	autoDestroy: false,
	closeAction: 'hide',
	constrain: true,
	modal: true,
	width: 832,
	resizable: true,
	bodyPadding: 8,
	titleAlign: 'center',
	
	title: 'Adjust Yields from Model Results',
	
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;
		Ext.create('Ext.data.Store', {
			storeId: 'rotationList',
			fields:[ 'display', 'value'],
			data: [{
				value: 'pt-cn',
				display: 'Continuous Pasture'
			},{
				value: 'pt-rt',
				display: 'Rotational Pasture'
			},
			{
				value: 'dl',
				display: 'Dry Lot'
			},{ 
				value: 'cc',
				display: 'Continuous Corn'
			},{ 
				value: 'cg',
				display: 'Cash Grain (cg/sb)'
			},{ 
				value: 'dr',
				display: 'Corn Silage to Corn Grain to Alfalfa(3x)'
			},{ 
				value: 'cso',
				display: 'Corn Silage to Soybeans to Oats'
			}]
		});
		Ext.create('Ext.data.Store', {
			storeId: 'yieldStore',
			alternateClassName: 'DSS.FieldStore',
			fields:['name','rotationVal','rotationDisp',/*'dMYieldAc'*/'grassYieldTonsAc',
			'cornGrainBrusdAc','cornSilageTonsAc','soyGrainBrusAc','oatYieldBrusAc',
			'alfalfaYieldTonsAc'],
			data: fieldYieldArray
		});
		let fieldNameColumn = { 
			editor: 'textfield', text: 'Fields', dataIndex: 'name', width: 120, 
			locked: true, draggable: false, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24,

		};
		let cropRotationColumn = {
			editor: 'textfield',
			text: 'Crop Rotation', dataIndex: 'rotationVal', width: 200, editable: false,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24, sortable: true,
		};
		// let dmYield_Column = {
		// 	xtype: 'numbercolumn', format: '0.0',editor: {
		// 		xtype:'numberfield',
		// 	}, text: 'Dry Matter t/acre', dataIndex: 'dMYieldAc', width: 80,
		// 	hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		// }
		let grassYield_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', editable: true
			}, text: 'Grass Yield t/acre', dataIndex: 'grassYieldTonsAc', width: 80,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		}
		let cornGrain_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', editable: true
			}, text: 'Corn Grain b/acre', dataIndex: 'cornGrainBrusdAc', width: 80,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		}
		let cornSilage_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', editable: true
			}, text: 'Corn Silage t/acre', dataIndex: 'cornSilageTonsAc', width: 80,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		}
		let soyGrain_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', editable: true
			}, text: 'Soy Grain b/acre', dataIndex: 'soyGrainBrusAc', width: 80,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		}
		let oatGrain_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', editable: true
			}, text: 'Oat Grain b/acre', dataIndex: 'oatYieldBrusAc', width: 80,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		}
		let alfalfaYield_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', editable: true
			}, text: 'Alfalfa t/acre', dataIndex: 'alfalfaYieldTonsAc', width: 80,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		}

		var grid = Ext.create('Ext.grid.Panel', {
			store: Ext.data.StoreManager.lookup('yieldStore'),
			loadMask: true,
			width: 400,
			columns: [
				fieldNameColumn,
				cropRotationColumn,
				//dmYield_Column,
				grassYield_Column,
				cornGrain_Column,
				cornSilage_Column,
				soyGrain_Column,
				oatGrain_Column,
				alfalfaYield_Column
			],
			plugins: {
				ptype: 'cellediting',
				clicksToEdit: 1,
				listeners: {
					beforeedit: function(editor, context, eOpts) {
						if (context.column.widget) return false
					}
				}
			}
		});
		

		Ext.applyIf(me, {
			items: [
				grid,
				{
					xtype: 'button',
					cls: 'button-text-pad',
					componentCls: 'button-margin',
					text: 'Save Changes',
					handler: async function(self) {
						//await getWFSScenario()
						userUpdateYields()
						console.log("Changes saved")

						let scenIndexAS = chartDatasetContainer.indexScenario(DSS.activeScenario)
						//console.log(scenIndexAS)
						
						var heiferFeedData = {
							pastYield: (chartObj.grass_yield_farm.sum[scenIndexAS]/chartObj.grass_yield_farm.count[scenIndexAS])*chartObj.grass_yield_farm.area[scenIndexAS],
							cornYield:(chartObj.corn_yield_farm.sum[scenIndexAS]/chartObj.corn_yield_farm.count[scenIndexAS])*chartObj.corn_yield_farm.area[scenIndexAS],
							cornSilageYield: (chartObj.corn_silage_yield_farm.sum[scenIndexAS]/chartObj.corn_silage_yield_farm.count[scenIndexAS])*chartObj.corn_silage_yield_farm.area[scenIndexAS],
							oatYield: (chartObj.oat_yield_farm.sum[scenIndexAS]/chartObj.oat_yield_farm.count[scenIndexAS])*chartObj.oat_yield_farm.area[scenIndexAS],
							alfalfaYield: (chartObj.alfalfa_yield_farm.sum[scenIndexAS]/chartObj.alfalfa_yield_farm.count[scenIndexAS])*chartObj.alfalfa_yield_farm.area[scenIndexAS],
							totalHeifers: DSS['viewModel'].scenario.data.heifers.heifers,
							heiferBreed: DSS['viewModel'].scenario.data.heifers.breedSize,
							heiferBred: DSS['viewModel'].scenario.data.heifers.bred,
							heiferDOP: DSS['viewModel'].scenario.data.heifers.daysOnPasture,
							heiferASW: DSS['viewModel'].scenario.data.heifers.asw,
							heiferWGG: DSS['viewModel'].scenario.data.heifers.tdwg
						}
						for (const prop in heiferFeedData){
							if (heiferFeedData[prop] == undefined || isNaN(heiferFeedData[prop] && typeof(heiferFeedData) !== 'string')){
								heiferFeedData[prop] = 0
							}
						}
						//console.log(heiferFeedData)
						//calcHeiferFeedBreakdown(heiferFeedData)
						//console.log(chartObj)
					}
				}]
		});
		
		me.callParent(arguments);
		
		AppEvents.registerListener("viewport_resize", function(opts) {
			me.center();
		})
	},
	
});
