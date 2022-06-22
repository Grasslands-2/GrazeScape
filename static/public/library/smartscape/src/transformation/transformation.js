/*
The transformation base object. The object keeps track of all attributes needed by the transformation
Author: Matthew Bayles
Created: November 2021
*/
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import {
    Vector as VectorSource,
} from 'ol/source'
import {
    Vector as VectorLayer,
} from 'ol/layer'

function Transformation(name, id, rank){
    return {
        name:name,
        id:id,
        rank: 99,
<<<<<<< HEAD
        areaSelected: 0,
        areaSelectedPerWorkArea: 0,
=======
>>>>>>> 9fda76af2c930326cb472f6f2b722fcc8b091dfe
        area:0,
        // the open layers id of the selection display layer
        displayLayerID:-99,
        // ol id of the layer containing the boundary information
        boundaryLayerID:-99,
        displayOpacity:50,
        // all selection criteria stored here
        selection:{
            slope1:0,
            slope2:700,
            streamDist1:0,
            streamDist2:16000,
            useFt:true,
            extent:[],
            field_coors:[],
            landCover:{
                contCorn:false,
                cashGrain:false,
                dairy:false,
                potato:false,
                cranberry:false,
                hay:false,
                pasture:false,
                grasslandIdle:false
            }
        },
        // store the changes to the management practices
        management:{
//            crop:null,
            rotationType:"default",
            // only for non grass
            cover:"default",
            tillage:"default",
            contour:"default",
            fertilizer:"default",
            // only for pasture
            density:"default",
            grassYield:"default",
            rotFreq:"default",

        }
    }
}
export  {Transformation}