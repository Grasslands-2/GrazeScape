// Create Customer class as follows:
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import {
    Vector as VectorSource,
} from 'ol/source'
import {
    Vector as VectorLayer,
} from 'ol/layer'
//class Transformation {
//    constructor(name, id, rank=null){
//        console.log()
//        this.name = name
//        this.id = id
//        // the order of the
//        this.rank = rank
//        // stores the raster cells that will be changed in the model
//        this.displayLayer = new ImageLayer({
//            source: new Static({
////                url: location.origin + "/smartscape/get_image?file_name="+"af8773e9-ce34-4fee-8eee-f8457fef97aa.png",
////                url: "get_image?file_name="+this.props.rasterUrl,
//                projection: 'EPSG:3857',
////                url: 'https://imgs.xkcd.com/comics/online_communities.png',
//                imageExtent: [-10118831.03520702, 5369618.99185455, -10114083.11978821, 5376543.89851876],
//            }),
//        })
//        // stores the areas that the user has selected
//        this.boundaryLayer = new VectorLayer({
//            source:new VectorSource({
//                projection: 'EPSG:3857',
//            })
//        })
//        console.log(this.boundaryLayer)
//
//    }
//   getName() {
//     return 'stackoverflow';
//   }
//}
function Transformation(name, id, rank){
    return {
        name:name,
        id:id,
        rank:rank,
        displayLayerID:-99,
        boundaryLayerID:-99,
        selection:{
            slope1:null,
            slope2:null,
            extent:null,
            field_coors:null
        },
        mangement:{
            crop:null,
            rotationType:null,
            // only for non grass
            cover:null,
            tillage:null,
            contour:null,
            manure:null,
            fertilizer:null,
            // only for pasture
            density:null,

        }
    }
}

const Person =  {
  name:"tests1"
};

export  {Transformation,Person}