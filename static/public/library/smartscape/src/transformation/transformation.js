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
        areaSelected: 0,
        areaSelectedPerWorkArea: 0,
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
            },
            landClass:{
                land1:false,
                land2:false,
                land3:false,
                land4:false,
                land5:false,
                land6:false,
                land7:false,
                land8:false,
                landErosion:false,
                landRoot:false,
                landWater:false,
            },
            farmClass:{
                prime:false,
                stateFarm:false,
                notPrime:false,
                prime1:false,
                prime2:false,
                prime3:false,
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

        },
        econ:{
            p2o5:1,
            nFert:1,
            cornSeed:80.5,
            cornPest:56.64,
            cornMach:123,

            soySeed:54,
            soyPest:40,
            soyMach:62,

            alfaSeed:60,
            alfaPest:32,
            alfaMach:136.5,
            alfaFirstYear:225.5,

            oatSeed:30,
            oatPest:20,
            oatMach:63.5,

            pastSeed:28.44,
            pastPest:5,
            pastMach:19.7,
        }
    }
}
export  {Transformation}