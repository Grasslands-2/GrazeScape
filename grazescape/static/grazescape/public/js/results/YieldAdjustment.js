
DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')
var dbYieldUpdatesArray = [];
//async function prepYieldAdjustmentForDB(){
//	console.log(yieldmodelsDataArray)
//	function loop1(){
//		for(f in fieldYieldArray){
//		var fieldID = fieldYieldArray[f].id
//		var fieldRot = fieldYieldArray[f].rotationVal1
//			for(y in yieldmodelsDataArray){
//			var yieldmodelID = yieldmodelsDataArray[y].fieldId
//			var yieldmodelRot = yieldmodelsDataArray[y].cropRo
//				if (fieldID == yieldmodelID && fieldRot == yieldmodelRot){
//					fieldYieldArray[f].cellCount = yieldmodelsDataArray[y].cells
//					fieldYieldArray[f].area = yieldmodelsDataArray[y].area
//					fieldYieldArray[f].scenName = yieldmodelsDataArray[y].scenario
//					fieldYieldArray[f].scenId = yieldmodelsDataArray[y].scenarioId
//					fieldYieldArray[f].farmId = DSS.activeFarm
//					fieldYieldArray[f].till = yieldmodelsDataArray[y].till
//					fieldYieldArray[f].cellSums = []
//					fieldYieldArray[f].yieldTypes = []
//				}
//			}
//		}
//	}
//	function loop2(){
//		dbYieldUpdatesArray = []
//		for(i in fieldYieldArray){
//			fieldObj = fieldYieldArray[i]
//			if (fieldObj.rotationVal1 == 'cc'){
//				fieldObj.cellSums.push(fieldObj.cornGrainBrusdAc * fieldObj.cellCount)
//				fieldObj.yieldTypes.push('Corn Grain')
//			}
//			if(fieldObj.rotationVal1 == 'pt'){
//				fieldObj.cellSums.push(fieldObj.grassYieldTonsAc * fieldObj.cellCount)
//				fieldObj.yieldTypes.push('Grass')
//			}
//			if(fieldObj.rotationVal1 == 'cg'){
//				fieldObj.cellSums.push(fieldObj.cornGrainBrusdAc * fieldObj.cellCount)
//				fieldObj.yieldTypes.push('Corn Grain')
//				fieldObj.cellSums.push(fieldObj.soyGrainBrusAc * fieldObj.cellCount)
//				fieldObj.yieldTypes.push('Soy')
//			}
//			if(fieldObj.rotationVal1 == 'dr'){
//				fieldObj.cellSums.push(fieldObj.cornGrainBrusdAc * fieldObj.cellCount)
//				fieldObj.yieldTypes.push('Corn Grain')
//				fieldObj.cellSums.push(fieldYieldArray[i].cornSilageTonsAc * fieldYieldArray[i].cellCount)
//				fieldObj.yieldTypes.push('Corn Silage')
//				fieldObj.cellSums.push(fieldYieldArray[i].alfalfaYieldTonsAc * fieldYieldArray[i].cellCount)
//				fieldObj.yieldTypes.push('Alfalfa')
//			}
//			if(fieldObj.rotationVal1 == 'cso'){
//				fieldObj.cellSums.push(fieldYieldArray[i].soyGrainBrusAc * fieldYieldArray[i].cellCount)
//				fieldObj.yieldTypes.push('Soy')
//				fieldObj.cellSums.push(fieldYieldArray[i].cornSilageTonsAc * fieldYieldArray[i].cellCount)
//				fieldObj.yieldTypes.push('Corn Silage')
//				fieldObj.cellSums.push(fieldYieldArray[i].oatYieldBrusAc * fieldYieldArray[i].cellCount)
//				fieldObj.yieldTypes.push('Oats')
//			}
//		}
//	}
//	await loop1()
//	await loop2()
//	console.log(fieldYieldArray);
//	//console.log(dbYieldUpdatesArray)
//	for( r in fieldYieldArray){
//		await pushYieldAdjustmetsToDB(fieldYieldArray[r]);
//	}
//}
function userUpdateYields(){
	//use the array position of the obj with the active scen as the dbID to hold on to the right value for the following values.
	var chartDataArray = chartObj.rotation_yield_farm.chartData.datasets
	for(dataSet in chartDataArray){
		//console.log(dataSet)
		//console.log(chartDataArray[dataSet])
		if(chartDataArray[dataSet].dbID == DSS.activeScenario){
			console.log("ACTIVE SCENARIO HIT CHARTDATAARRAY!!!!!!")
			var rotYeildFarm = chartObj.rotation_yield_farm.chartData.datasets[dataSet]
			var grassYeildFarm = chartObj.grass_yield_farm.chartData.datasets[dataSet]
			var cornYeildFarm = chartObj.corn_yield_farm.chartData.datasets[dataSet]
			var soyYeildFarm = chartObj.soy_yield_farm.chartData.datasets[dataSet]
			var oatYeildFarm = chartObj.oat_yield_farm.chartData.datasets[dataSet]
			var silageYeildFarm = chartObj.corn_silage_yield_farm.chartData.datasets[dataSet]
			var alfalfaYeildFarm = chartObj.alfalfa_yield_farm.chartData.datasets[dataSet]
			var rotYeildFieldDS = chartObj.rotation_yield_field.chartData.datasets
			var grassYeildFieldDS = chartObj.grass_yield_field.chartData.datasets
			var cornYeildFieldDS = chartObj.corn_yield_field.chartData.datasets
			var silageYeildFieldDS = chartObj.corn_silage_yield_field.chartData.datasets
			var soyYeildFieldDS = chartObj.soy_yield_field.chartData.datasets
			var oatYeildFieldDS = chartObj.oat_yield_field.chartData.datasets
			var alfalfaYeildFieldDS = chartObj.alfalfa_yield_field.chartData.datasets
			rotYeildFarm.data[0] = 0
			grassYeildFarm.data[0] = 0
			cornYeildFarm.data[0] = 0
			soyYeildFarm.data[0] = 0
			silageYeildFarm.data[0] = 0
			oatYeildFarm.data[0] = 0
			alfalfaYeildFarm.data[0] = 0

			// console.log(fieldYieldArray)
			// console.log(rotYeildFarm)
			console.log(grassYeildFarm.data[0])
			// console.log(cornYeildFarm)
			// console.log(soyYeildFarm)
			for(f in fieldYieldArray){
				var fieldID = fieldYieldArray[f].id
				fieldYieldArray[f].dMYieldAc = 0
				// for(d in rotYeildFieldDS){
				// 	if(rotYeildFieldDS[d].dbID == fieldID){
				// 		rotYeildFarm.data[0] = rotYeildFarm.data[0] + 
				// 		console.log(rotYeildFarm.data[0])
				// 	}
				// }
				//use the above example to update the farm values in the chartobj to reflect the new totals after a user adjusts the yields.
				for(g in grassYeildFieldDS){
					if (grassYeildFieldDS[g].dbID == fieldID && typeof(fieldYieldArray[f].grassYieldTonsAc) == 'number'){
						console.log(grassYeildFarm.data[0])
						console.log(chartObj.grass_yield_farm.chartData.datasets[dataSet])
						console.log(chartObj.grass_yield_field.area[g])
						console.log(typeof(grassYeildFarm.data[0]))
						console.log(typeof(chartObj.grass_yield_field.area[g]))
						console.log(fieldYieldArray[f].grassYieldTonsAc)
						//if(typeof(fieldYieldArray[f].grassYieldTonsAc) == 'number'){
							console.log("GRASS NUMBER VALUE HITS!!!!!!!")
							grassYeildFieldDS[g].data[dataSet] = fieldYieldArray[f].grassYieldTonsAc
							grassYeildFieldDS[g].fieldData = parseFloat((fieldYieldArray[f].grassYieldTonsAc))
							grassYeildFarm.data[0] = grassYeildFarm.data[0] + parseFloat((fieldYieldArray[f].grassYieldTonsAc * chartObj.rotation_yield_field.area[g]))
							//console.log(grassYeildFarm.data[0])
							fieldYieldArray[f].dMYieldAc = fieldYieldArray[f].dMYieldAc + fieldYieldArray[f].grassYieldTonsAc
						//}
					}
				}
				for(c in cornYeildFieldDS){
					if (cornYeildFieldDS[c].dbID == fieldID && typeof(fieldYieldArray[f].cornGrainBrusdAc) == 'number'){
						//if(typeof(fieldYieldArray[f].cornGrainBrusdAc) == 'number'){
							console.log("CORN GRAIN!!! NUMBER VALUE HITS!!!!!!!")
							cornYeildFieldDS[c].data[dataSet] = fieldYieldArray[f].cornGrainBrusdAc
							cornYeildFieldDS[c].fieldData = fieldYieldArray[f].cornGrainBrusdAc
							cornYeildFarm.data[0] = cornYeildFarm.data[0] + (fieldYieldArray[f].cornGrainBrusdAc * chartObj.rotation_yield_field.area[c])
						//}
						//console.log(cornYeildFarm.data[0])
						// if(fieldYieldArray[f].rotationVal1 == "cc"){
						// 	fieldYieldArray[f].dMYieldAc = fieldYieldArray[f].dMYieldAc + (fieldYieldArray[f].cornGrainBrusdAc* 56 * (1 - 0.155) / 2000
								
						// 		//39.3680
						// 		)
						// }
						//console.log(fieldYieldArray[f].dMYieldAc)
					}
				}
				for(so in soyYeildFieldDS){
					if (soyYeildFieldDS[so].dbID == fieldID && typeof(fieldYieldArray[f].soyGrainBrusAc) == 'number'){
						soyYeildFieldDS[so].data[dataSet] = fieldYieldArray[f].soyGrainBrusAc
						soyYeildFieldDS[so].fieldData = fieldYieldArray[f].soyGrainBrusAc
						soyYeildFarm.data[0] = soyYeildFarm.data[0] + (fieldYieldArray[f].soyGrainBrusAc * chartObj.rotation_yield_field.area[so])
						//fieldYieldArray[f].dMYieldAc = fieldYieldArray[f].dMYieldAc + (fieldYieldArray[f].soyGrainBrusAc/33.33)
					}
				}
				for(s in silageYeildFieldDS){
					if (silageYeildFieldDS[s].dbID == fieldID && typeof(fieldYieldArray[f].cornSilageTonsAc) == 'number'){
						silageYeildFieldDS[s].data[dataSet] = fieldYieldArray[f].cornSilageTonsAc
						silageYeildFieldDS[s].fieldData = fieldYieldArray[f].cornSilageTonsAc
						silageYeildFarm.data[0] = silageYeildFarm.data[0] + fieldYieldArray[f].cornSilageTonsAc
						
						//rotYeildFieldDS.data[0] = rotYeildFieldDS.data[0] +
						//Apperently silage is not considered as part of the DM yield in this case.  Ask team.
					}
				}
				for(o in oatYeildFieldDS){
					if (oatYeildFieldDS[o].dbID == fieldID && typeof(fieldYieldArray[f].oatYieldBrusAc) == 'number'){
						oatYeildFieldDS[o].data[dataSet] = fieldYieldArray[f].oatYieldBrusAc
						oatYeildFieldDS[o].fieldData = fieldYieldArray[f].oatYieldBrusAc
						oatYeildFarm.data[0] = oatYeildFarm.data[0] + fieldYieldArray[f].oatYieldBrusAc
						//fieldYieldArray[f].dMYieldAc = fieldYieldArray[f].dMYieldAc + (fieldYieldArray[f].oatYieldBrusAc/62.5)
					}
				}
				for(a in alfalfaYeildFieldDS){
					if (alfalfaYeildFieldDS[a].dbID == fieldID && typeof(fieldYieldArray[f].alfalfaYieldTonsAc) == 'number'){
						alfalfaYeildFieldDS[a].data[dataSet] = fieldYieldArray[f].alfalfaYieldTonsAc
						alfalfaYeildFieldDS[a].fieldData = fieldYieldArray[f].alfalfaYieldTonsAc
						alfalfaYeildFarm.data[0] = alfalfaYeildFarm.data[0] + (fieldYieldArray[f].alfalfaYieldTonsAc * chartObj.rotation_yield_field.area[a])
						//fieldYieldArray[f].dMYieldAc = fieldYieldArray[f].dMYieldAc + fieldYieldArray[f].alfalfaYieldTonsAc
					}
				}
				if(fieldYieldArray[f].rotationVal1 == "cc"){
					var cornGrainDM = fieldYieldArray[f].cornGrainBrusdAc* 56 * (1 - 0.155) / 2000
					fieldYieldArray[f].dMYieldAc = cornGrainDM
				}
				if(fieldYieldArray[f].rotationVal1 == "cg"){
					var cornGrainDM = fieldYieldArray[f].cornGrainBrusdAc* 56 * (1 - 0.155) / 2000
					var soyDM = fieldYieldArray[f].soyGrainBrusAc* 60 * 0.792 * 0.9008 / 2000
					fieldYieldArray[f].dMYieldAc = (cornGrainDM+soyDM)/2
				}
				if(fieldYieldArray[f].rotationVal1 == "dr"){
					var silageDM = fieldYieldArray[f].cornSilageTonsAc * 2000 * (
						1 - 0.65) /2000
					var cornGrainDM = (fieldYieldArray[f].cornGrainBrusdAc* 56 * (1 - 0.155) / 2000)
					var alfalfaDM = fieldYieldArray[f].alfalfaYieldTonsAc * 2000 * (1 - 0.13) / 2000
					fieldYieldArray[f].dMYieldAc = 3/5*alfalfaDM + 1/5*silageDM + 1/5*cornGrainDM
				}
				if(fieldYieldArray[f].rotationVal1 == "cso"){
					var silageDM = fieldYieldArray[f].cornSilageTonsAc * 2000 * (
						1 - 0.65) /2000
					var soyDM = (fieldYieldArray[f].soyGrainBrusAc* 60 * 0.792 * 0.9008 / 2000)
					var oatsDM = (fieldYieldArray[f].oatYieldBrusAc * 32 * (1 - 0.14) / 2000)
					fieldYieldArray[f].dMYieldAc = 1/3*silageDM+1/3*soyDM+1/3*oatsDM
				}

				//rotations field yeilds still off after manual adjustment.
				//You need to set up a series of conditionals based on the rotation of each field.  Use a switch. In these conditionals you 
				//will have to recalcuate the rotational yield for each field based on the new yields, and the formal for each rotation type.
				//for example if field is a cash crop.  you will need to run formal for rotational yield for cash crop, and use the new
				//corn and soy yeilds from the update chart obj for that specific field to run the rotional yield formule for cash crop.
				//A switch statement for each of the multi crop rotations would work well.
				console.log('DM yeild total for field: ' + fieldID + ': ' + fieldYieldArray[f].dMYieldAc)
				for(d in rotYeildFieldDS){
					if (rotYeildFieldDS[d].dbID == fieldID){
						console.log(rotYeildFieldDS[d].cropRo)
						console.log(fieldYieldArray[f])
						rotYeildFieldDS[d].data[dataSet] = (fieldYieldArray[f].dMYieldAc).toFixed(2)
						rotYeildFieldDS[d].fieldData = parseFloat((fieldYieldArray[f].dMYieldAc).toFixed(2))
						rotYeildFarm.data[0] = rotYeildFarm.data[0] + ((fieldYieldArray[f].dMYieldAc * chartObj.rotation_yield_field.area[d])/chartObj.rotation_yield_farm.area[0])
						//Total DM formula!!!! each fields DM * its acres / total acres + each other = total DM
						//console.log(rotYeildFarm.data[0])
			}
		}
		//rotYeildFarm.data[0] = rotYeildFarm.data[0] + fieldYieldArray[f].dMYieldAc
	}
	//final farm and DM calcs
	console.log(grassYeildFarm.data[dataSet])
	console.log(typeof(grassYeildFarm.data[dataSet]))
	console.log(chartObj.grass_yield_farm.area[dataSet])
	if(typeof(grassYeildFarm.data[0]) == 'number'){
		grassYeildFarm.data[0] = parseFloat((grassYeildFarm.data[0] /chartObj.grass_yield_farm.area[dataSet]).toFixed(2))
		console.log(grassYeildFarm.data[dataSet])
	}
	if(typeof(cornYeildFarm.data[0]) == 'number'){
		cornYeildFarm.data[0] = parseFloat((cornYeildFarm.data[0]/chartObj.corn_yield_farm.area[dataSet]).toFixed(2))
		//console.log(cornYeildFarm.data[dataSet])
	}
	if(typeof(soyYeildFarm.data[0]) == 'number'){
		soyYeildFarm.data[0] = parseFloat((soyYeildFarm.data[0] /chartObj.soy_yield_farm.area[dataSet]).toFixed(2))
		//console.log(soyYeildFarm.data[dataSet])
	}
	if(typeof(oatYeildFarm.data[0]) == 'number'){
		oatYeildFarm.data[0] = parseFloat((oatYeildFarm.data[0] /chartObj.oat_yield_farm.area[dataSet]).toFixed(2))
		//console.log(oatYeildFarm.data[dataSet])
	}
	if(typeof(alfalfaYeildFarm.data[0]) == 'number'){
		alfalfaYeildFarm.data[0] = parseFloat((alfalfaYeildFarm.data[0] /chartObj.alfalfa_yield_farm.area[dataSet]).toFixed(2))
		//console.log(alfalfaYeildFarm.data[dataSet])
		//rotYeildFarm.data[dataSet] = rotYeildFarm.data[dataSet] /chartObj.rotation_yield_farm.area[dataSet]
	}
	if(typeof(rotYeildFarm.data[0]) == 'number'){
		rotYeildFarm.data[0] = (rotYeildFarm.data[0]).toFixed(2)
	}
	console.log(typeof(grassYeildFarm.data[dataSet]))
	console.log(chartObj)
		}
	}
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
	width: 1050,
	resizable: true,
	bodyPadding: 8,
	titleAlign: 'center',
	
	title: 'Adjust Yields from Model Results',
	
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	listeners:{
		"close": function(){
            Ext.destroy('DSS.results.YieldAdjustment');
        },
	},

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
			},{
				value: 'dl',
				display: 'Dry Lot'
			},{ 
				value: 'cc',
				display: 'Continuous Corn'
			},{ 
				value: 'cg',
				display: 'Cash Grain (corn/soy)'
			},{ 
				value: 'dr',
				display: 'Corn Silage to Corn Grain to Alfalfa 3 yrs'
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
			sorters: ['name'],
			data: fieldYieldArray
		});
		let fieldNameColumn = { 
			/*editor: 'textfield',*/ text: 'Fields', dataIndex: 'name', width: 100, 
			locked: true, draggable: false, 
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24,

		};
		let cropRotationColumn = {
			/*editor: 'textfield',*/
			text: 'Crop Rotation', dataIndex: 'rotationDisp', width: 120, editable: false,
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
			}, text: 'Grass Yield t/acre', dataIndex: 'grassYieldTonsAc', width: 130,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		}
		let cornGrain_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', editable: true
			}, text: 'Corn Grain b/acre', dataIndex: 'cornGrainBrusdAc', width: 130,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		}
		let cornSilage_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', editable: true
			}, text: 'Corn Silage t/acre', dataIndex: 'cornSilageTonsAc', width: 130,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		}
		let soyGrain_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', editable: true
			}, text: 'Soy Grain b/acre', dataIndex: 'soyGrainBrusAc', width: 130,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		}
		let oatGrain_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', editable: true
			}, text: 'Oat Grain b/acre', dataIndex: 'oatYieldBrusAc', width: 130,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		}
		let alfalfaYield_Column = {
			xtype: 'numbercolumn', format: '0.0',editor: {
				xtype:'numberfield', editable: true
			}, text: 'Alfalfa t/acre', dataIndex: 'alfalfaYieldTonsAc', width: 120,
			hideable: false, enableColumnHide: false, lockable: false, minWidth: 24
		}

		var grid = Ext.create('Ext.grid.Panel', {
			singleton: true,	
			autoDestroy: false,
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
						await userUpdateYields()
						console.log("Changes saved")

						//let scenIndexAS = chartDatasetContainer.indexScenario(DSS.activeScenario)
						//console.log(scenIndexAS)
						
						// var heiferFeedData = {
						// 	pastYield: (chartObj.grass_yield_farm.sum[scenIndexAS]/chartObj.grass_yield_farm.count[scenIndexAS])*chartObj.grass_yield_farm.area[scenIndexAS],
						// 	cornYield:(chartObj.corn_yield_farm.sum[scenIndexAS]/chartObj.corn_yield_farm.count[scenIndexAS])*chartObj.corn_yield_farm.area[scenIndexAS],
						// 	cornSilageYield: (chartObj.corn_silage_yield_farm.sum[scenIndexAS]/chartObj.corn_silage_yield_farm.count[scenIndexAS])*chartObj.corn_silage_yield_farm.area[scenIndexAS],
						// 	oatYield: (chartObj.oat_yield_farm.sum[scenIndexAS]/chartObj.oat_yield_farm.count[scenIndexAS])*chartObj.oat_yield_farm.area[scenIndexAS],
						// 	alfalfaYield: (chartObj.alfalfa_yield_farm.sum[scenIndexAS]/chartObj.alfalfa_yield_farm.count[scenIndexAS])*chartObj.alfalfa_yield_farm.area[scenIndexAS],
						// 	totalHeifers: DSS['viewModel'].scenario.data.heifers.heifers,
						// 	heiferBreed: DSS['viewModel'].scenario.data.heifers.breedSize,
						// 	heiferBred: DSS['viewModel'].scenario.data.heifers.bred,
						// 	heiferDOP: DSS['viewModel'].scenario.data.heifers.daysOnPasture,
						// 	heiferASW: DSS['viewModel'].scenario.data.heifers.asw,
						// 	heiferWGG: DSS['viewModel'].scenario.data.heifers.tdwg
						// }
						// for (const prop in heiferFeedData){
						// 	if (heiferFeedData[prop] == undefined || isNaN(heiferFeedData[prop] && typeof(heiferFeedData) !== 'string')){
						// 		heiferFeedData[prop] = 0
						// 	}
						// }
						//console.log(heiferFeedData)
						//calcHeiferFeedBreakdown(heiferFeedData)						
						console.log(chartObj)
						if(chartObj.grass_yield_farm.chart !== null){await chartObj.grass_yield_farm.chart.update()}
						if(chartObj.corn_yield_farm.chart !== null){await chartObj.corn_yield_farm.chart.update()}
						if(chartObj.corn_silage_yield_farm.chart !== null){await chartObj.corn_silage_yield_farm.chart.update()}
						if(chartObj.soy_yield_farm.chart !== null){await chartObj.soy_yield_farm.chart.update()}
						if(chartObj.oat_yield_farm.chart !== null){await chartObj.oat_yield_farm.chart.update()}
						if(chartObj.alfalfa_yield_farm.chart !== null){await chartObj.alfalfa_yield_farm.chart.update()}
						if(chartObj.rotation_yield_farm.chart !== null){await chartObj.rotation_yield_farm.chart.update()}
						
						await chartObj.grass_yield_field.chart.update()
						await chartObj.corn_yield_field.chart.update()
						await chartObj.corn_silage_yield_field.chart.update()
						await chartObj.soy_yield_field.chart.update()
						await chartObj.oat_yield_field.chart.update()
						await chartObj.alfalfa_yield_field.chart.update()
						await chartObj.rotation_yield_field.chart.update()
						
						console.log("post transaction")
						//chartObj.feed_breakdown.chart.update()
						this.up('window').close();
						Ext.destroy('DSS.results.YieldAdjustment');
						// Ext.create('Ext.data.Store', {
						// 	storeId: 'yieldStore',
						// 	alternateClassName: 'DSS.FieldStore',
						// 	fields:['name','rotationVal','rotationDisp',/*'dMYieldAc'*/'grassYieldTonsAc',
						// 	'cornGrainBrusdAc','cornSilageTonsAc','soyGrainBrusAc','oatYieldBrusAc',
						// 	'alfalfaYieldTonsAc'],
						// 	sorters: ['name'],
						// 	data: fieldYieldArray
						// });
//						await prepYieldAdjustmentForDB()
						//fieldYieldArray = [] 
						//Ext.data.StoreManager.clearData('yieldStore')
						//DSS.results.YieldAdjustment.yieldStore.clearData();
					//The real problem is the data isnt getting updated in the indivigual fields 
					//in the chartobj
					
					
					}
				}]
		});
		
		me.callParent(arguments);
		
		AppEvents.registerListener("viewport_resize", function(opts) {
			me.center();
		})
	},
});
//function pushYieldAdjustmetsToDB(data){
//    return new Promise(function(resolve) {
//    var csrftoken = Cookies.get('csrftoken');
//	console.log('data coming into ajax call')
//	console.log(data)
//    $.ajaxSetup({
//            headers: { "X-CSRFToken": csrftoken }
//        });
//    $.ajax({
//    'url' : '/grazescape/adjust_field_yields',
//    'type' : 'POST',
//    'data' : data,
//    success: function(responses) {
//		console.log(responses)
//		resolve([])
//	},
//	error: function(responses) {
//		console.log('python tool call error')
//		console.log(responses)
//	}
//	})
//	})
//}

