function populateChartObj(chartObj){
// need to get a list of scenarios here
//    list of every chart currently in app
    scenList = ['Scenario 1','Scenario 2','Scenario 3']

    for (chart in chartList){
        chartName = chartList[chart]
//        console.log(chartName)
        chartObj[chartName+"_data"]= {
            labels : scenList,
            datasets: []
        }
    }
}

function build_model_request(f, modelChoice){
    console.log(f.get("field_name"))

    let rotation_split = f.get("rotation").split("-")
    crop = rotation_split[0]
    rotation = rotation_split.length > 1 ?rotation_split[1]:null
    model_para = {
        f_name: f.get("field_name"),
        extent: f.getGeometry().getExtent(),
        // at this point fields wont have any holes so just get the first entry
        field_coors: f.getGeometry().getCoordinates()[0],
        grass_type: f.get("grass_speciesval"),
//            need to convert this to integer
        contour: f.get("on_contour")?1:0,
        soil_p: f.get("soil_p"),
        tillage: f.get("tillage"),
        fert: f.get("fertilizerpercent"),
        manure: f.get("manurepercent"),
        crop:crop,
        crop_cover: f.get("cover_crop"),
//			doesn't appear to be in the table at this time
        rotation: rotation,
        density: f.get("grazingdensityval"),
        model_type: modelChoice,

    }
    model_pack = {
        "farm_id": DSS.activeFarm,
        "scenario_id": DSS.activeScenario,
        "model_parameters":model_para
    }
    return model_pack
}
function format_chart_data(model_data){

}
function get_model_data(data){
    var csrftoken = Cookies.get('csrftoken');
    $.ajaxSetup({
            headers: { "X-CSRFToken": csrftoken }
        });
    $.ajax({
    'url' : '/grazescape/get_model_results',
    'type' : 'POST',
    'data' : data,
        success: function(responses, opts) {
            console.log(responses)
            for (response in responses){
                obj = responses[response];
                if(obj.error){
                    console.log("model did not run")
                    me.stopWorkerAnimation();
                    continue
                }
                console.log("response(obj): " + obj);
                let e = obj.extent;

                pt1 = [e[0],e[3]]
                pt2 = [e[2],e[3]]
                pt3 = [e[2],e[1]]
                pt4 = [e[0],e[1]]
                console.log("points")
                console.log(e[0], e[3])
                console.log(pt1)

                let p = new ol.geom.Polygon([
                    [pt1, pt2, pt3, pt4, pt1]
                ]);
                validateImageOL(obj, DSS.layer.ModelResult);
                let s = DSS.layer.ModelBox.getSource();
                s.clear();
                s.addFeature(new ol.Feature({
                    geometry: p
                }));

                console.log("hi from showContinuousLegend")
                DSS.MapState.showContinuousLegend(obj.palette, obj.values);
            }

            return responses

        },

        failure: function(response, opts) {
            me.stopWorkerAnimation();
        }
    });

	}

//---------------------------------------------------------------------------------
function validateImageOL(json, layer, tryCount) {
    var me = this;
    console.log("validateImageOL run");
    console.log(layer)
    tryCount = (typeof tryCount !== 'undefined') ? tryCount : 0;
    Ext.defer(function() {
        var src = new ol.source.ImageStatic({
            url: "http://localhost:8000/grazescape/get_image?file_name=" + json.url,
            crossOrigin: '',
            imageExtent: json.extent,
            projection: 'EPSG:3857',
            imageSmoothing: false
        });

        src.on('imageloadend', function() {
            layer.setSource(src);
            layer.setVisible(true);
        });
        src.on('imageloaderror', function() {
            tryCount++;
            if (tryCount < 5) {
                validateImageOL(json, layer, tryCount);
            }
            else {
                //failed
            }
        });
        src.image_.load();
    }, 50 + tryCount * 50, me);
}

function create_graph(data,units,title,element){
    let barchart = new Chart(element, {
        type: 'bar',
        data: data,
//        data:
//        {
//          x axis labels (scenarios)
//        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
////        labels: ['Red', 'Blue'],
//        datasets: [{
//              label of dataset
//            label: '# of Votes',
//          each entry in data is the average from a scenario
//            data: [12, 19, 3, 5, 2, 3],
//            backgroundColor: [
//                'rgba(247, 148, 29, 1)',
//                'rgba(29, 48, 58, 1)',
//                'rgba(140, 156, 70, 1)',
//                'rgba(51, 72, 86, 1)',
//                'rgba(196, 213, 76, 1)',
//                'rgba(117, 76, 41, 1)'
//            ],
//            borderColor: [
//                'rgba(247, 148, 29, 1)',
//                'rgba(29, 48, 58, 1)',
//                'rgba(140, 156, 70, 1)',
//                'rgba(51, 72, 86, 1)',
//                'rgba(196, 213, 76, 1)',
//                'rgba(117, 76, 41, 1)'
//            ],
//            borderWidth: 1
//        }]
//    },/
        options: {
            responsive: true,
//            maintainAspectRatio: false,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: title
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        maxTicksLimit:5,
                    },
                    scaleLabel: {
                    display: true,
                    labelString: units
                  }
                }]
            }
        }
    });
    return barchart
}
// container for all model types
class ModelData {
  constructor() {
    this.model_dic = {}
  }
  get_model(model_type){
    return this.model_dic.model_type
  }
  add_model(returned_data){
    if (!(returned_data.model_type in this.model_dic)){
        this.model_dic.model_type = new ModelNode(returned_data)
        return
    }
    this.model_dic.model_type.add_model(returned_data)
  }

}
// contains all the data for a particular model
class ModelNode{
    constructor(data) {
        this.units = data.units;
        this.title = data.title;
        this.model_type = data.model_type;
    //    contains field name and the value of the field
        this.data = {}
        this.sum = 0
        this.count = 0
        add_data(data.f_name, data.avg)
    }
    add_data(f_name, value){
        this.data.f_name = value
        this.sum = this.sum + value
        this.count = this.count + 1
    }
    get_field_agg(){
        return this.sum / this.count
    }
}