var fields_1Source_loc = ""

function wfs_field_insert(feat,geomType) {
    var formatWFS = new ol.format.WFS();
    var formatGML = new ol.format.GML({
        featureNS: 'http://geoserver.org/GrazeScape_Vector',
		Geometry: 'geom',
        featureType: 'field_2',
        srsName: 'EPSG:3857'
    });
    console.log(feat)
    node = formatWFS.writeTransaction([feat], null, null, formatGML);
	console.log(node);
    s = new XMLSerializer();
    str = s.serializeToString(node);
    console.log(str);

    geoServer.wfs_field_insert(str, feat)

}
function addFieldAcreage(feature){
	console.log(feature)
	if(feature.values_.rotation == 'pt-cn'|| feature.values_.rotation == 'pt-rt'){
		pastAcreage = pastAcreage + feature.area
	}
	if(feature.values_.rotation == 'cc'|| feature.values_.rotation =='cg' || feature.values_.rotation =='dr' || feature.values_.rotation =='cso'){
		cropAcreage = cropAcreage + feature.area
	}

}
function setFeatureAttributes(feature,af,as){
	console.log(feature)
    console.log(feature.getGeometry().getExtent())
    console.log(feature.getGeometry().getCoordinates()[0])
    data = {
        'extents':feature.getGeometry().getExtent(),
        'coordinates':feature.getGeometry().getCoordinates()[0],
		active_region: DSS.activeRegion
    }
    var csrftoken = Cookies.get('csrftoken');
    $.ajaxSetup({
        headers: { "X-CSRFToken": csrftoken }
    });
    return new Promise(function(resolve) {
    $.ajax({
        'url' : '/grazescape/get_default_om',
        'type' : 'POST',
        'data' : data,
        success: function(responses, opts) {
            delete $.ajaxSetup().headers
            console.log(responses)
            feature.setProperties({"om":responses['om']})

            var geomType = 'polygon'

            DSS.MapState.removeMapInteractions()
            wfs_field_insert(feature, geomType)
            resolve('done')
        },
        failure: function(response, opts) {
            me.stopWorkerAnimation();
        }
    })
    })
}

//------------------working variables--------------------
var type = "Polygon";
var source = fields_1Source_loc

//------------------------------------------------------------------------------
Ext.define('DSS.field_shapes.DrawAndApply', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.field_draw_apply',
    alternateClassName: 'DSS.DrawFieldShapes',
});
