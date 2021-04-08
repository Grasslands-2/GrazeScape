
DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')
let rotationFreq1 = Ext.create('Ext.data.Store', {
	fields: ['label', 'enum'],
	autoLoad: true,
	proxy: {
		type: 'ajax',
		url: '/get_options',
		reader: 'json',
		extraParams: {
			type: 'rotationalFrequency'
		}
	}
});
let field_names = Ext.create('Ext.data.Store', {
                fields: ['name', 'perimeter'],
                data : []
});

//------------------------------------------------------------------------------
Ext.define('DSS.state.scenario.PerimeterDialog', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_perimeter_dialog',

	autoDestroy: false,
	closeAction: 'hide',
	constrain: true,
	modal: true,
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
//                              alert(combo.getValue()); // Return Unitad States and no USA
                              calc_cost(combo.getValue(), per_cost.getValue(), per_result)
                              per_length.setValue(combo.getValue().toFixed(2))
                            }
                        }
                })
        var per_length = Ext.create('Ext.form.field.Text', {
               name: 'name',
                fieldLabel: 'Perimeter (ft)',
                labelStyle: 'color: white;',
                readOnly: true,
                 fieldStyle: 'background-color: #bfbfbf; background-image: none;',
        })
        var per_cost = Ext.create('Ext.form.Number',     {
                        xtype: 'numberfield',
                        name: 'Fence Cost',
                        fieldLabel: 'Cost per linear foot',

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
            fieldLabel: 'Cost ($/ft)',
            labelStyle: 'color: white;',
            readOnly: true,
            fieldStyle: 'background-color: #bfbfbf; background-image: none;',
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

//                    {
//                        xtype: 'button',
//                        cls: 'button-text-pad',
//                        componentCls: 'button-margin',
//                        text: 'Get perimeter',
//                        formBind: true,
//                        handler: function() {
//                            console.log("get perimeter")
//                            getPerimeter(DSS.layer.fields_1);
//                        }
//                    },
                    per_field,
                    per_length,

                    per_cost,
                    per_result
                             ]
			}]

		});

		me.callParent(arguments);

		AppEvents.registerListener("viewport_resize", function(opts) {
			me.center();
		})
	},

});

function getPerimeter(layer) {
    console.log("getting p")
//    console.log(per_field)
//    console.log(per_field.getValue())
    layer.getSource().forEachFeature(function(f) { //iterates through fields to build extents array
		var extentTransform = function(fieldFeature){
			console.log(fieldFeature.get("field_name"))
			ls = new ol.geom.LineString(fieldFeature.getGeometry().getCoordinates()[0][0])
			console.log(ls.getLength())

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
//                    console.log(total_dis)
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
    res_obj.setValue((length * cost).toFixed(2))
}