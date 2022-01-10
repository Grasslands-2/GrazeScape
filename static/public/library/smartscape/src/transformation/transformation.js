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
        // the open layers id of the selection display layer
        displayLayerID:-99,
        // ol id of the layer containing the boundary information
        boundaryLayerID:-99,
        // all selection criteria stored here
        selection:{
            slope1:null,
            slope2:null,
            extent:null,
            field_coors:null,
            landCover:{
                contCorn:false,
                cashGrain:false,
                dairy:false,
                potato:false,
                cranberry:false,
                hay:false,
                pasture:false,
                grassland:false
            }
        },
        // store the changes to the management practices
        management:{
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
export  {Transformation}