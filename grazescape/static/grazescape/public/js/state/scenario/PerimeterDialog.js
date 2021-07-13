
DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')
let field_names = Ext.create('Ext.data.Store', {
                fields: ['name', 'perimeter'],
                data : []
});

let fence_types = Ext.create('Ext.data.Store', {
                fields: ['fence', 'cost'],
                data : [
                    {fence:'Two strand wire',cost:1.81},
                    {fence:'One strand wire',cost:0.84},
                    {fence:'Polywire',cost:0.37}
                ]
});
//------------------------------------------------------------------------------
Ext.define('DSS.state.scenario.PerimeterDialog', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_perimeter_dialog',

	autoDestroy: true,
	closeAction: 'method-destroy',
	constrain: true,
	modal: false,
	width: 400,
	resizable: true,
	bodyPadding: 8,
	titleAlign: 'center',

	title: 'Calculate Fencing',

	layout: DSS.utils.layout('vbox', 'start', 'stretch'),

	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;
        getPerimeter(DSS.layer.fields_1)
        var per_field = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Choose Field',
            store: field_names,
            queryMode: 'local',
            labelAlign: 'left',
            displayField: 'name',
            labelStyle: 'color: white;',
            valueField: 'perimeter',
            listeners:{
                select: function(combo, record, index) {
                  calc_cost(combo.getValue(), per_cost.getValue(), per_result)
                  console.log(combo.getValue())
//                  per_length.setValue((combo.getValue()*3.28084).toFixed(2))
                  per_length.setValue((combo.getValue()).toFixed(2))
                  update_fence_att(per_field.getDisplayValue(), per_fence_type, per_cost)
                }
            }
        })
        var per_fence_type = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Choose Fence Type',
            store: fence_types,
            queryMode: 'local',
            labelAlign: 'left',
            displayField: 'fence',

            labelStyle: 'color: white;',
            valueField: 'cost',
            listeners:{
                select: function(combo, record, index) {
//                              calc_cost(combo.getValue(), per_cost.getValue(), per_result)
                  per_cost.setValue(combo.getValue())
                }
            }
        })
        var per_length = Ext.create('Ext.form.field.Text', {
               name: 'name',
                fieldLabel: 'Perimeter (m)',
                labelStyle: 'color: white;',
                readOnly: true,
                 fieldStyle: 'background-color: #bfbfbf; background-image: none;',
        })
        var per_cost = Ext.create('Ext.form.Number',     {
            xtype: 'numberfield',
            name: 'Fence Cost',
            fieldLabel: 'Cost per linear meter',

            labelStyle: 'color: white;',
            value: 2.0,
            maxValue: 100000,
            minValue: 0,
            ItemId: "number_field",
            step: .2,
            listeners:{
             change: function(num, record, index) {
                  console.log(num.getValue()); // Return Unitad States and no USA
                  calc_cost(per_field.getValue(), num.getValue(), per_result)
                }
                }
        })
        var per_result = Ext.create('Ext.form.field.Text', {
           name: 'name',
            fieldLabel: 'Cost ($)',
            labelStyle: 'color: white;',
            readOnly: true,
            fieldStyle: 'background-color: #bfbfbf; background-image: none;',
        })

        var per_save = Ext.create('Ext.Button',{
            xtype: 'button',
            cls: 'button-text-pad',
            componentCls: 'button-margin',
            text: 'Save',
            handler: function(self) {
                save_per(per_field.getDisplayValue(), per_result.getValue(), per_fence_type.getDisplayValue(),per_length.getValue(), 5,per_cost.getValue())
            }
        })

		Ext.applyIf(me, {

		    items: [{
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
                        html: 'Fence Settings',
                    },
                    per_field,
                    per_length,
                    per_fence_type,
                    per_cost,
                    per_result,
                    per_save
                ]
			}]

		});

		me.callParent(arguments);

		AppEvents.registerListener("viewport_resize", function(opts) {
			me.center();
		})
	},
	test_per: function(){
	    console.log("hello")
	}


});

function getPerimeter(layer) {
    console.log("getting p")
//    console.log(per_field)
//    console.log(per_field.getValue())
    layer.getSource().forEachFeature(function(f) { //iterates through fields to build extents array
		var extentTransform = function(fieldFeature){
			console.log(fieldFeature.get("field_name"))
			console.log(fieldFeature)
			ls = new ol.geom.LineString(fieldFeature.getGeometry().getCoordinates()[0][0])
			console.log(ls.getLength())
            area = fieldFeature.getGeometry().getArea()
            console.log("area meters" , area)
            console.log("area acres" , area/4046.86)
			point_array = []
			for (coor in fieldFeature.getGeometry().getCoordinates()[0][0]){
//			    console.log(fieldFeature.getGeometry().getCoordinates()[0][0][coor])
			    var point = fieldFeature.getGeometry().getCoordinates()[0][0][coor]
			    trans_point = ol.proj.transform(point, 'EPSG:3857', 'EPSG:3071')
			    point_array.push([trans_point[0], trans_point[1],point[0],point[1]])
			}

            var csrftoken = Cookies.get('csrftoken');
			$.ajaxSetup({
                    headers: { "X-CSRFToken": csrftoken }
                });

            $.ajax({
            'url' : '/grazescape/point_elevations',
            'type' : 'POST',
            'data' : {"points": point_array,"extra_data":"test"},
            success: function(response, opts) {
                console.log(response)
                var total_dis = 0
                for (i = 0; i< response.points.length - 1; i++){
                    total_dis += calc_slope_distance(response.points[i], response.points[i+1]).slope_distance
                }
                console.log(total_dis)
//                    per_result.setValue(total_dis)
                field_names.add({"name":fieldFeature.get("field_name"),"perimeter":total_dis})

            },
            failure: function(response, opts) {
//				me.stopWorkerAnimation();
            }
	    	});

		};
		extentTransform(f)//runs extent transform
	})
}

function calc_slope_distance(point1, point2){

    x1 = point1[3]
    y1 = point1[4]
    z1 = point1[2]

    x2 = point2[3]
    y2 = point2[4]
    z2 = point2[2]

    x_dis = Math.pow(x2-x1,2)
    y_dis = Math.pow(y2-y1,2)
    z_dis = Math.pow(z2-z1,2)

    return {"slope_distance":Math.sqrt(x_dis + y_dis + z_dis), "distance":Math.sqrt(x_dis + y_dis)}
}
function calc_cost(length, cost, res_obj) {
    console.log(length)
//    convert feet to meters
//    length = length * 3.28084
    res_obj.setValue((length * cost).toFixed(2))
}
function save_per(field_name, fence_cost, fence_type, perimeter,area,fence_unit_cost){
    DSS.layer.fields_1.getSource().forEachFeature(function(f) {
        if(field_name == f.get('field_name')){
            console.log(field_name)
            console.log("matches")
            f.setProperties({
                area:area,
                perimeter:perimeter,
                fence_type:fence_type,
                fence_cost:fence_cost,
                fence_unit_cost:fence_unit_cost
            })
            wfs_field_update(f)
        }
    })
}

function update_fence_att(field_name, type, cost){
    DSS.layer.fields_1.getSource().forEachFeature(function(f) {
        if(field_name == f.get('field_name')){
            type.setValue(f.get('fence_type'))
            cost.setValue(f.get('fence_unit_cost'))
        }
    })

}