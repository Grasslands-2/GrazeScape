//const { stringify } = require("querystring")
// const path = require('path');
// const fs = require('fs');
// ploss scale bar values
var ModelSummaryData = []
Ext.create('Ext.data.Store', {
	storeId: 'fieldSummaryStore',
	alternateClassName: 'DSS.FieldSummaryStore',
	fields:[ 'name', 'soilP', 'soilOM', 'rotationVal', 'rotationDisp', 'tillageVal', 
	'tillageDisp', 'coverCropDisp', 'coverCropVal',
		'onContour','fertPercP','manuPercP','fertPercN','manuPercN','grassSpeciesVal','grassSpeciesDisp',
		'interseededClover','grazeDensityVal','grazeDensityDisp','manurePastures', 'grazeDairyLactating',
		'grazeDairyNonLactating', 'grazeBeefCattle','area', 'perimeter','fence_type',
        'fence_cost','fence_unit_cost','rotationFreqVal','rotationFreqDisp','landCost'],
		sorters: ['name'],
	data: fieldArray
});
// Ext.create('Ext.data.Store', {
//     data: fieldArray
// })

Ext.define('DSS.Field_Summary_Table', {
    extend: 'Ext.grid.Panel',
    title: 'Active Scenario Field Summary',
    store: Ext.data.StoreManager.lookup('fieldSummaryStore'),
    singleton: true,
	autoDestroy: false,
    alternateClassName: 'DSS.Field_Summary_Table',
	id: "SummaryTableOld",
	hidden: true,
    columns: [
        {
                text: 'Field', dataIndex: 'name', width: 120, 
                editable: false,
                hideable: false,  minWidth: 24,
                tooltip: '<b>Field Name:</b> Can be editted and relabeled here.',
            },
            {
                xtype: 'numbercolumn',
                width: 60, 
                format: '0.0',
                text: 'Area',
                dataIndex: 'area',
                //flex: 1,
                editable: false,
                hideable: false,
            },
            {
                xtype: 'numbercolumn',
                format: '0.0',
                text: 'Land Cost ($/ac)',
                dataIndex: 'landCost',
                tooltip: '<b>Land Cost:</b> How much does each field cost to rent or own per acre',
                formatter: 'usMoney',
                minWidth: 24,
                tooltip: '<b>Area:</b> Area in acres',
                editable: false,
                hideable: false,
            },
            {
                xtype: 'numbercolumn',
                format: '0.0',
                text: 'Soil-P (PPM)', 
                dataIndex: 'soilP',
                width: 100,
                tooltip: '<b>Soil Phosphorus:</b> Measured in parts per million.',
                hideable: false,
            },
            {
                xtype: 'numbercolumn',
                format: '0.0',
                text: 'Soil-OM (%)', 
                dataIndex: 'soilOM', 
                width: 100, 
                editable: false,
                hideable: false,
                tooltip: '<b>Soil Organic Matter</b> Measured in percent of soil make up',
            },
            {
                text: 'Crop Rotation', dataIndex: 'rotationDisp', width: 200, 
                editable: false,
                hideable: false, enableColumnHide: false, minWidth: 24,
                tooltip: '<b>Crop Rotation</b> Which crop rotation is being grown in each field.',
            },
            {
                text: 'Cover Crop', dataIndex: 'coverCropDisp', width: 200, 
                editable: false,
                hideable: false,  minWidth: 24,
                tooltip: '<b>Cover Crop</b> Which cover crop is being grown on each field during the none growing season',
            },
            {
                text: 'Tillage', dataIndex: 'tillageDisp', width: 200, 
                editable: false,
                hideable: false,  minWidth: 24,
                tooltip: '<b>Tillage</b> Which tillage practice is being used on each field',
            },
            {
                text: 'On Contour', dataIndex: 'onContour', width: 200, 
                editable: false,
                hideable: false,  minWidth: 24,
                tooltip: '<b>Tillage On Contour</b>Was this field tillage along the contour of the land or not? Checked if yes, blank if no.',
            },
            {
                xtype: 'numbercolumn',
                format: '0.0',
                text: '% Manure N', 
                dataIndex: 'manuPercN', 
                width: 110, tooltip: '<b>Percent Nitrogen Manure</b> Enter the amount of manure N applied to the crop rotation as a percentage of the N removed by the crop rotation harvest (e.g., value of 100 means that N inputs and outputs are balanced). Note that in grazed systems, manure N is already applied and does not need to be accounted for here.',
                editable: false,
            },
            {
                xtype: 'numbercolumn',
                format: '0.0',
                text: '% Fert N', 
                dataIndex: 'fertPercN', 
                width: 80, 
                tooltip: '<b>Percent Nitrogen Fertilizer</b> Enter the amount of fertilizer N applied to the crop rotation as a percentage of the N removed by the crop rotation harvest (e.g., value of 100 means that N inputs and outputs are balanced).',
                editable: false,
            },
            {
                xtype: 'numbercolumn',
                format: '0.0',
                text: '% Fert P', 
                dataIndex: 'fertPercP', 
                width: 80, 
                tooltip: '<b>Percent Phosphorus Fertilizer</b> Enter the amount of fertilizer P applied to the crop rotation as a percentage of the P removed by the crop rotation harvest (e.g., value of 100 means that P inputs and outputs are balanced).',
                editable: false,
            },
            {
                text: 'Grass Species', dataIndex: 'grassSpeciesDisp', width: 150, 
                tooltip: '<b>Low Yielding:</b> Italian ryegrass, Kentucky bluegrass, Quackgrass, Meadow fescue (older varieties)\n<b>Medium Yielding:</b> Meadow fescue (newer varieties), Smooth bromegrass, Timothy, Perennial ryegrass\n<b>High Yielding:</b> Orchardgrass, Reed canary grass, Tall fescue, Festulolium, Hybrid and Meadow bromegrass',
                editable: false,
                hideable: false,  minWidth: 24,
                
            },
            {
                text: 'Rotational Frequency', dataIndex: 'rotationFreqDisp', width: 150,
                tooltip: '<b>Pasture Rotational Frequency</b> How often are animals rotated on and off any given pasture',
                editable: false,
                hideable: false,  minWidth: 24,
                
            },
            {
                text: 'Interseeded Legume', dataIndex: 'interseededClover', width: 145,
                editable: false,
                hideable: false,  minWidth: 24,
                tooltip: '<b>Interseeded Legumes:</b> Are you planting nitrogen fixing legumes like clover.',
            },
            {
                text: 'Animal Density', dataIndex: 'grazeDensityDisp', width: 110,
                tooltip: '<b>Grazing Density</b> How intensely are the pastures getting grazed',
                editable: false,
                hideable: false,  minWidth: 24,
                
            },
    ],
    resizable: true,
    // scrollable: true,
    height: 150,
    //width: 700,
    renderTo: Ext.getBody(),
    
})