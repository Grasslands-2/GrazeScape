import React from 'react'
import Button from 'react-bootstrap/Button';

// Start Openlayers imports
import { 
    Map,
    View
 } from 'ol'
import {
    GeoJSON,
    XYZ
} from 'ol/format'
import {
    Tile as TileLayer,
    Vector as VectorLayer,
} from 'ol/layer'
import {
    Vector as VectorSource,
    OSM as OSMSource,
    XYZ as XYZSource,
    TileWMS as TileWMSSource,
} from 'ol/source'
import {
    Select as SelectInteraction,
    defaults as DefaultInteractions
} from 'ol/interaction'
import { 
    Attribution,
    ScaleLine,
    ZoomSlider,
    Zoom,
    Rotate,
    MousePosition,
    OverviewMap,
    defaults as DefaultControls
} from 'ol/control'
import Overlay from 'ol/Overlay';
import {
    Style,
    Fill as FillStyle,
    RegularShape as RegularShapeStyle,
    Stroke as StrokeStyle
} from 'ol/style'
import {getVectorContext} from 'ol/render';
import {
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
} from 'ol/geom';
import LinearRing from 'ol/geom/LinearRing';
import {
    Projection,
    get as getProjection
 } from 'ol/proj'
 import {getArea, getLength} from 'ol/sphere';
 import ol from 'ol'
 import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import VectorImageLayer from 'ol/layer/VectorImage';
import {DragBox, Select} from 'ol/interaction';
import {platformModifierKeyOnly} from 'ol/events/condition';
import Draw from 'ol/interaction/Draw';
import BingMaps from 'ol/source/BingMaps';
import { defaults as defaultControls} from 'ol/control';
import 'ol/ol.css';
import {Circle as CircleStyle, Fill, Stroke} from 'ol/style';
import {OSM, TileArcGISRest} from 'ol/source';
import {altKeyOnly, click, pointerMove} from 'ol/events/condition';
import {extend, createEmpty,getCenter} from 'ol/extent';
//import * as jsts from "jsts/dist/jsts.js";
import { useSelector, useDispatch, connect  } from 'react-redux'
import{setActiveTrans,setActiveTransOL, updateTransList,updateAreaSelectionType,
updateActiveTransProps,setVisibilityMapLayer, updateActiveBaseProps,reset} from '/src/stores/transSlice'
import configureStore from './stores/store'
import{setVisibilityAOIAcc, setVisibilityTransAcc, setAoiExtentsCoors, setActiveRegion, setAoiArea} from '/src/stores/mainSlice'
import {RotateNorthControl} from '/src/mapControls/controlTransSummary'
import { BallTriangle,RotatingLines, } from  'react-loader-spinner'

proj4.defs(
  'EPSG:27700',
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
    '+x_0=400000 +y_0=-100000 +ellps=airy ' +
    '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
    '+units=m +no_defs'
);
proj4.defs(
'EPSG:3071',"+proj=tmerc +lat_0=0 +lon_0=-90 +k=0.9996 +x_0=520000 +y_0=-4480000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs "
)
register(proj4);
  var customControl = function(opt_options) {
    var element = document.createElement('div');
    element.className = 'custom-control ol-unselectable ol-control';
    ol.control.Control.call(this, {
      element: element
    });
  };
// map values from redux store to local props
const mapStateToProps = state => {
    return{
        activeTrans: state.transformation.activeTrans,
        listTrans: state.transformation.listTrans,
        removeTrans: state.transformation.removeTrans,
        addTrans: state.transformation.addTrans,
        areaSelectionType: state.transformation.areaSelectionType,
        layerVisible: state.transformation.layerVisible,
        activeDisplayProps: state.transformation.activeDisplayProps,
    }
}
// map functions from redux store to local props
const mapDispatchToProps = (dispatch) => {
    return{
        setActiveTrans: (value)=> dispatch(setActiveTrans(value)),
        setActiveTransOL: (value)=> dispatch(setActiveTransOL(value)),
        updateTransList: (value)=> dispatch(updateTransList(value)),
        setVisibilityMapLayer: (type)=> dispatch(setVisibilityMapLayer(type)),
        setVisibilityTransAcc: (type)=> dispatch(setVisibilityTransAcc(type)),
        updateActiveBaseProps: (type)=> dispatch(updateActiveBaseProps(type)),
        reset: ()=> dispatch(reset()),

//        getTrans: (value)=> dispatch(getTrans(value)),
        updateAreaSelectionType: (value)=> dispatch(updateAreaSelectionType(value)),
        updateActiveTransProps: (value)=> dispatch(updateActiveTransProps(value)),
        setAoiExtentsCoors: (value)=> dispatch(setAoiExtentsCoors(value)),
        setActiveRegion: (value)=> dispatch(setActiveRegion(value)),
        setAoiArea: (value)=> dispatch(setAoiArea(value)),
    }
};
/**
 * Class for containing the map, layers, and associated functions
 */
class OLMapFragment extends React.Component {
    /**
     * Set active transformation
     * @param  {props} inputs from calling function or class
     */
    constructor(props) {
        super(props)
        console.log(props)
//        this.drawBoundary = this.drawBoundary.bind(this)
//        this.drawRectangleBoundary = this.drawRectangleBoundary.bind(this)
        // binding function to class so they share scope
        this.updateAreaSelectionType = this.updateAreaSelectionType.bind(this)
        this.addLayer = this.addLayer.bind(this)
        this.getMapLayer = this.getMapLayer.bind(this)

        this.state = {isDrawing:false,activeTransLayer:null}
    }
    // updates when props have been changed
    componentDidUpdate(prevProps) {
      let aoiExtents = createEmpty();
      let aoiCoors = []
        // if trans extents have been cleared (resetting to aoi)
      if (this.props.activeTrans.selection.extent.length == 0 && this.props.activeTrans.boundaryLayerID != -99){
            this.selectedFeatures.clear()
            let layer = this.getActiveBounLay()
            // setting the aoi boundary because we don't have any trans yet
            if (layer == null){
              console.log("error")
              return
            }
            layer.getSource().clear()
            layer.getSource().addFeatures(this.boundaryLayerAOI.getSource().getFeatures())
            layer.getSource().getFeatures().forEach((lyr)=>{
                console.log("looping through layers")
                aoiExtents = extend(aoiExtents, lyr.getGeometry().getExtent())
                aoiCoors.push(lyr.getGeometry().getCoordinates())
            })

            this.props.updateActiveTransProps({"name":'extent', "value":aoiExtents, "type":"reg"})
            this.props.updateActiveTransProps({"name":'field_coors', "value":aoiCoors, "type":"reg"})

      }
      // if area selection has change activate type, activate different map tool
      if (prevProps.areaSelectionType !== this.props.areaSelectionType) {
        this.updateAreaSelectionType(this.props.areaSelectionType);
      }
      // set opacity of active transformation
      if(this.props.activeTrans.displayOpacity != prevProps.activeTrans.displayOpacity && this.props.activeTrans.displayLayerID != -99){
            this.getMapLayer(this.props.activeTrans.displayLayerID).setOpacity(this.props.activeTrans.displayOpacity/100)
      }
      // the display layer of a transformation needs to be changed
      if (prevProps.activeDisplayProps !== this.props.activeDisplayProps) {
        // create a new raster source
        if(this.props.activeDisplayProps != null){
            let rasterLayerSource =
                new Static({
                    url: this.props.activeDisplayProps.url,
                    projection: 'EPSG:3857',
                    imageExtent: this.props.activeDisplayProps.extents
            })
            let listTrans = this.props.listTrans
            // loop through all transformations to find transformation whose display layer has been updated
            for (let trans in listTrans){
                if(listTrans[trans].id == this.props.activeDisplayProps.transId){
                    let newLayer = listTrans[trans]
                    let layers = this.map.getLayers().getArray()
                    for (let layer in layers){
                        if(layers[layer].ol_uid == newLayer.displayLayerID){
                            layers[layer].setSource(rasterLayerSource)
    //                        layers[layer].getSource().refresh()
                            break
                        }
                    }
                }
            }


        }

      }
      // turn of give layer (only used for learning hub boundary, huc 10 and huc 12 at this point)
      if(prevProps.layerVisible != this.props.layerVisible){
            let layers = this.map.getLayers().getArray()
            this.props.updateAreaSelectionType(null);
            this.map.removeInteraction(this.select);
            for (let ly in this.props.layerVisible){
                for (let layer in layers){
                    if(layers[layer].get('name') == this.props.layerVisible[ly].name){
                        layers[layer].setVisible(this.props.layerVisible[ly].visible);
                    }
                }
            }

    //        zoomm in on aoi
            if(this.props.layerVisible[0].name == "huc12" && this.props.layerVisible[0].visible == false){
                    var extent = this.boundaryLayerAOI.getSource().getExtent()
                    extent = this.add10PerExtent(extent)
                    this.map.getView().fit(extent,{"duration":500});
                    this.huc8.setVisible(false)
            }
            if(this.props.layerVisible[0].name == "huc12" && this.props.layerVisible[0].visible == true){
                this.huc8.setVisible(true)
            }
//          user has pressed the reset button
            if(this.props.layerVisible[0].name == "southWest" && this.props.layerVisible[0].visible == true){
//                zoom out to starting level and activate selection
                console.log("resetting to beginning")
                this.props.reset();
                this.selectedFeatures.clear();
                this.huc12.getSource().clear()
                this.huc8.getSource().clear()
                this.boundaryLayerAOI.setVisible(false)
                this.map.addInteraction(this.select);
                this.props.setVisibilityTransAcc(true)
                this.map.getView().setCenter([-10008338,5525100]);
                this.map.getView().setZoom(7);
                return
            }


      }
      // set source of active trans
      // change active trans layers that are being displayed (border and display layers)
      if(prevProps.activeTrans.id != this.props.activeTrans.id){
        this.props.updateAreaSelectionType(null);
        let layers = this.map.getLayers().getArray()
        let oldLayer = prevProps.activeTrans
        let newLayer = this.props.activeTrans
        for (let layer in layers){
//          turn off previous active trans

            if(layers[layer].ol_uid == oldLayer.displayLayerID ||layers[layer].ol_uid == oldLayer.boundaryLayerID){
                layers[layer].setVisible(false);
            }
            if(layers[layer].ol_uid == newLayer.displayLayerID ||layers[layer].ol_uid == newLayer.boundaryLayerID){
                layers[layer].setVisible(true);
            }
        };
      }
      // create two new layers for a new trans and add them to the map
      if(prevProps.listTrans.length < this.props.listTrans.length){
        let aoiExtents = createEmpty();
        let aoiCoors = []
        let items = JSON.parse(JSON.stringify(this.props.listTrans))
        let addTransId = this.props.addTrans.id
        for(let trans in items){
                        let area = 0

            if(items[trans].id == addTransId){
                let displayLayer = new ImageLayer({
                    source: new Static({
                        projection: 'EPSG:3857',
                        imageExtent: [-10118831.03520702, 5369618.99185455, -10114083.11978821, 5376543.89851876],
                    }),
                    visible: true,
                })
                let boundarySource= new VectorSource({
                        projection: 'EPSG:3071',
                    })
                // new transformations have the aoi as there default area selection
                this.boundaryLayerAOI.getSource().getFeatures().forEach((lyr)=>{
                    console.log("looping through layers")
                    boundarySource.addFeature(lyr)
                    aoiExtents = extend(aoiExtents, lyr.getGeometry().getExtent())
                    aoiCoors.push(lyr.getGeometry().getCoordinates())
                    area = area + lyr.get("areasqM")

                })

                let boundaryLayer = new VectorLayer({
                    source:boundarySource,
                    zIndex: 100,
                    visible: true,
                    style: this.stylesBoundaryTrans,
                })
                this.addLayer(displayLayer)
                this.addLayer(boundaryLayer)
                items[trans].displayLayerID = displayLayer.ol_uid
                items[trans].boundaryLayerID = boundaryLayer.ol_uid
                // update transformation list with new data
                this.props.updateTransList(items)
                this.props.updateActiveTransProps({"name":'extent', "value":aoiExtents, "type":"reg"})
                this.props.updateActiveTransProps({"name":'field_coors', "value":aoiCoors, "type":"reg"})
                this.props.updateActiveTransProps({"name":'area', "value":area, "type":"base"})
                            console.log("area")
            console.log(area)
                displayLayer.setOpacity(this.props.activeTrans.displayOpacity/100)
            }
        }
      }
      // remove layer
      else if(this.props.removeTrans != null && prevProps.listTrans.length > this.props.listTrans.length){
        let layers = this.map.getLayers().getArray()
        for (let layer in layers){
          if (layers[layer].ol_uid == this.props.removeTrans.displayLayerID ||
            layers[layer] == this.props.removeTrans.boundaryLayerID) {
                this.map.removeLayer(layers[layer])
            }
        };
      }
    }
//    return layer of given layer id
    getMapLayer(layerID){
        let layers = this.map.getLayers().getArray()
        for (let layer in layers){
            if(layers[layer].ol_uid == layerID){
                return layers[layer]
            }
        }
    }

    addLayer(layer){
        this.map.addLayer(layer);
    }
    /**
     * Update map with a new selection interaction
     * @param  {str} newSelection the new selection type.
     */
    updateAreaSelectionType(newSelection){
        // select
        this.map.removeInteraction(this.select)
        this.map.removeInteraction(this.draw)
        this.map.removeInteraction(this.dragBox)
        this.selectedFeatures.clear();
//        this.boundaryLayer.getSource().clear();
        if (newSelection == 'watershed'){
            this.map.addInteraction(this.select);
        }
        else if(newSelection == 'polygon'){
            this.map.addInteraction(this.draw);
        }
        else if(newSelection == 'box'){
            this.map.addInteraction(this.dragBox);
        }
        else{
        }
    }
    /**
     * Get the boundary layer for the active layer
     */
    getActiveBounLay(){
        let layers = this.map.getLayers().getArray()
        for (let layer in layers){
          if (layers[layer].ol_uid == this.props.activeTrans.boundaryLayerID) {
            return layers[layer]
          }
        };
        return null
    }
    add10PerExtent(extents){
        let x = Math.abs((extents[0]-extents[2]) * .1)
        let y = Math.abs((extents[1]-extents[3]) * .1)
        extents[0] = extents[0] - x
        extents[1] = extents[1] - y
        extents[2] = extents[2] + x
        extents[3] = extents[3] + y
        return extents
    }
    setActiveRegion(region){
        let region_8 = region + "_HUC08.geojson"
        let url = location.origin + "/smartscape/get_image?file_name="+region_8+ "&time="+Date.now()
        let source = new VectorSource({
              url: url,
              format: new GeoJSON(),
               projection: 'EPSG:3857',
            })
        this.huc8.setSource(source)
         let region_10 = region + "_Huc10.geojson"
         url = location.origin + "/smartscape/get_image?file_name="+region_10+ "&time="+Date.now()
         source = new VectorSource({
              url: url,
              format: new GeoJSON(),
               projection: 'EPSG:3071',
            })
        this.huc10.setSource(source)
        let region_12 = region + "_Huc12.geojson"
        url = location.origin + "/smartscape/get_image?file_name="+region_12+ "&time="+Date.now()
        source = new VectorSource({
              url: url,
              format: new GeoJSON(),
            })

        this.huc12.setSource(source)


//        this.huc10.setVisible(true)
        this.props.setActiveRegion(region)
        this.map.removeInteraction(this.select)
        this.selectedFeatures.clear()
        this.map.render()
        this.map.addInteraction(this.select);


    }

    // fires after react has created the base component
    componentDidMount(){
        const attribution = new Attribution({
          collapsible: false,
        });
        // create basae style for layers (using Paul Tol Color Scheme)
        const styles = [new Style({
            stroke: new Stroke({
              color: '#BBBBBB',
              width: 1,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.0)',
            }),
          })]
          this.styleHuc12Sub = new Style({
            stroke: new Stroke({
              color: '#BBBBBB',
              width: 3,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.0)',
            }),
          })
           this.styleHuc8 = new Style({
            stroke: new Stroke({
              color: '#1BADE4',
              width: 3,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 0, 0.0)',
            }),
          })
          this.nullStyle = new Style(null)
          this.stylesBoundary = [new Style({
            stroke: new Stroke({
//              color: 'red',
              color: '#BBBBBB',
              width: 3,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.0)',
            }),
          })]
          this.stylesBoundaryTrans = [new Style({
            stroke: new Stroke({
              color: '#66CCEE',
              width: 3,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.0)',
            }),
          })]
          //todo move bing api key
        this.bing_key = 'Anug_v1v0dwJiJPxdyrRWz0BBv_p2sm5XA72OW-ypA064_JoUViwpDXZl3v7KZC1'
        // layer to hold the users aoi selection
        this.boundaryLayerAOI = new VectorLayer({
          name: "aoi",
          zIndex: 10,
          source: new VectorSource({
            projection: 'EPSG:3071',
            }),
            style:this.stylesBoundary,
        });
         this.subSelectHuc12 = new VectorLayer({
          name: "subHuc12",
//          zIndex: 100,
          source: new VectorSource({
            projection: 'EPSG:3071',
            }),
            style: styles,
        });
        this.huc8 = new VectorLayer({
            name:'huc8',
            renderMode: 'image',
//            visible: false,


            style: this.styleHuc8,
        });
        // layer to hold huc 10 watersheds
         this.huc10 = new VectorLayer({
            name:'huc10',
            renderMode: 'image',
            visible: false,


            style: styles,
        });
        // layer to hold huc 10 watersheds
         this.huc12 = new VectorLayer({
            name: 'huc12',
            renderMode: 'image',
          source:new VectorSource({
//              url: static_global_folder + 'smartscape/gis/Watersheds/WI_Huc_12_json.geojson',
//              url: static_global_folder + 'smartscape/gis/Watersheds/WI_Huc_12_trim.geojson',
              format: new GeoJSON(),
               projection: 'EPSG:3071',
            }),
            style: styles,
            visible: true,
//            operation: olSourceRasterOperationCropInner
        });
       // show borders of our three work areas
        this.northEast = new VectorLayer({
          renderMode: 'image',
          name: "northEast",
          source:new VectorSource({
              url: static_global_folder + 'smartscape/gis/LearningHubs/northEastWI.geojson',
              format: new GeoJSON(),
               projection: 'EPSG:3857',
            }),
            style: this.stylesBoundary,
        });
        this.southWest = new VectorLayer({
            renderMode: 'image',
            name: "southWest",
            source:new VectorSource({
                url: static_global_folder + 'smartscape/gis/LearningHubs/southWestWI.geojson',
                format: new GeoJSON(),
                projection: 'EPSG:3857',
            }),
            style: this.stylesBoundary,
        });
        this.cloverBelt = new VectorLayer({
            renderMode: 'image',
            name: "cloverBelt",
            source:new VectorSource({
              url: static_global_folder + 'smartscape/gis/LearningHubs/cloverBelt.geojson',
              format: new GeoJSON(),
               projection: 'EPSG:3857',
            }),
            style: this.stylesBoundary,
        });
        this.uplands = new VectorLayer({
            renderMode: 'image',
            name: "Driftless",
            source:new VectorSource({
                url: static_global_folder + 'smartscape/gis/LearningHubs/uplandsWI.geojson',
                format: new GeoJSON(),
                projection: 'EPSG:3857',
            }),
            style: this.stylesBoundary,
        });
        this.redCedar = new VectorLayer({
            renderMode: 'image',
            name: "redCedar",
            source:new VectorSource({
                url: static_global_folder + 'smartscape/gis/LearningHubs/redCedarWI.geojson',
                format: new GeoJSON(),
                projection: 'EPSG:3857',
            }),
            style: this.stylesBoundary,
        });
        this.pineRiver = new VectorLayer({
            renderMode: 'image',
            name: "redCedar",
            source:new VectorSource({
                url: static_global_folder + 'smartscape/gis/LearningHubs/pineRiverMN.geojson',
                format: new GeoJSON(),
                projection: 'EPSG:3857',
            }),
            style: this.stylesBoundary,
        });
        this.eastCentral = new VectorLayer({
            renderMode: 'image',
            name: "eastCentral",
            source:new VectorSource({
                url: static_global_folder + 'smartscape/gis/LearningHubs/eastCentralWI.geojson',
                format: new GeoJSON(),
                projection: 'EPSG:3857',
            }),
            style: this.stylesBoundary,
        });
        this.southEast = new VectorLayer({
            renderMode: 'image',
            name: "southEast",
            source:new VectorSource({
                url: static_global_folder + 'smartscape/gis/LearningHubs/southEastWI.geojson',
                format: new GeoJSON(),
                projection: 'EPSG:3857',
            }),
            style: this.stylesBoundary,
        });
        // base map
        this.layers = [
            new TileLayer({
               source: new BingMaps({
                key: this.bing_key,
                imagerySet: 'AerialWithLabelsOnDemand',
                // use maxZoom 19 to see stretched tiles instead of the BingMaps
                // "no photos at this zoom level" tiles
                // maxZoom: 19
              }),
            }),

            this.huc8,
            this.cloverBelt,
            this.northEast,
            this.southWest,
            this.uplands,
            this.redCedar,
            this.pineRiver,
            this.eastCentral,
            this.southEast,
            this.huc10,
            this.huc12,
            this.subSelectHuc12,
            this.boundaryLayerAOI,
//            this.waterSheds1,
//            this.huc10Layer,
//            this.waterSheds,


        ]
        var overlay2 = new Overlay({
            position: [-10008338,5525100],
            element: document.getElementById('overlay2')
        });
        // Create an Openlayer Map instance
        this.map = new Map({
            //  Display the map in the div with the id of map
            target: 'map',
            layers: this.layers,
//            overlays: [overlay2],
            // Add in the following map controls
//            controls: [
//                new ZoomSlider(),
//                new MousePosition(),
//                new ScaleLine(),
////                new OverviewMap(),
//                    new Attribution()
//////                attributionOptions: collapsible: true
//                ],
            // Render the tile layers in a map view with a Mercator projection
            view: new View({
                projection: 'EPSG:3857',
//                projection: 'EPSG:3071',
//                center: [0, 0],
//                zoom: 2,
//                centered at the learning hubs
                center: [-10008338,5525100],
                // centered at kickapoo
//                center: [-10107218.88240181,5404739.54256515],
				zoom: 7,
				maxZoom: 15,
				minZoom: 3,//10,
			//	constrainRotation: false,
			//	rotation: 0.009,
//				constrainOnlyCenter: true,
//				extent:[-10132000, 5353000, -10103000, 5397000]
            })
        })
        this.map.addControl(new ZoomSlider());
        this.map.addControl(new ScaleLine());
//        this.map.addControl(zoomslider);
        // single slick selection
        this.select = new Select({
            condition: click,
//             multi: true,
           layers:function(layer){
//           console.log("32$$#$#$#$#$$###$")
//               if (layer.get('name') == "aoi"){
//                    return false
//                }
                console.log("selecting layer", layer.get('name'))
                if (layer.get('name') == "subHuc12" || layer.get('name') == "huc10" ||
                    layer.get('name') == "huc12"||
                    layer.get('name') == "southWest"||
                    layer.get('name') == "cloverBelt"||
                    layer.get('name') == "northEast"||
                    layer.get('name') == "redCedar"||
                    layer.get('name') == "eastCentral"||
                    layer.get('name') == "southEast"||
                    layer.get('name') == "Driftless")
                    {
                        return true
                    }
//                console.log(layer)
            return false
           },

        });
        // select interaction working on "click"
//        const selectClick = new Select({
//          condition: click,
//           multi: true,
//           layers:function(layer){
//                console.log(layer)
//               console.log("hello32$$#$#$#$#$$###$")
//               return false
//           },

//          filter: function(layer){
//                        console.log("in the select condition@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
//                console.log(layer)
//                return false
//                    },
//          layerFilter: function(layer) {
//            console.log("in the select condition@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
//                console.log(layer)
//              return layer.get('typename') == 'layerDIST';
//            },
//        });
        // get selected features from map
        this.selectedFeatures = this.select.getFeatures();
        this.selectedFeatures.on(['remove'], (f)=> {
            console.log("remove selected feature")
        })
        // get selected features and add them to active trans
        this.selectedFeatures.on(['add'], (f)=> {
            let region = ""
            let aoiExtents = createEmpty();
            let aoiCoors = []
            // cumulative area of selection
            let area = 0
//            console.log(f.target.item(0).getGeometry())
//          selecting by county
            console.log("getting target", f.target)
            console.log('f.target.item(0)', f.target.item(0))
            console.log('f.target.item(0).get("NAME")', f.target.item(0).get("NAME"))
            if(f.target.item(0).get("NAME") != undefined){
                console.log("selecting a county!!!!!")
                var extent = f.target.item(0).getGeometry().getExtent()
//                console.log(extent)
                extent = this.add10PerExtent(extent)
                console.log(extent)

                this.map.getView().fit(extent,{"duration":500});
                if(f.target.item(0).get("NAME") == "La Crosse"){
                    region = "southWestWI"
                }
                else if (f.target.item(0).get("NAME") == "Clark"){
                    region = "cloverBeltWI"
                }
                else if (f.target.item(0).get("NAME") == "Kewaunee"){
                    region = "northeastWI"
                }
                else if (f.target.item(0).get("NAME") == "Grant"){
                    region = "uplandsWI"
                }
                else if (f.target.item(0).get("NAME") == "Barron"){
                    region = "redCedarWI"
                }
                else if (f.target.item(0).get("NAME") == "pineRiverMN"){
                    region = "pineRiverMN"
                }
                else if (f.target.item(0).get("NAME") == "Oconto"){
                    region = "eastCentralWI"
                }
                else if (f.target.item(0).get("NAME") == "Calumet"){
                    region = "southEastWI"
                }
                else{
                    throw new Error("Invalid region");
                }
                console.log("region@@@@@@@@@@@@@", f.target.item(0).get("NAME"), region)
                this.setActiveRegion(region)

                return
            }

            // get active trans boundary layer
            let layer = this.getActiveBounLay()
            // setting the aoi boundary because we don't have any trans yet
            if (layer == null){
               this.props.setVisibilityTransAcc(false)
               layer = this.boundaryLayerAOI
            }
            layer.getSource().clear()
            console.log("Selection layer")
            layer.getSource().addFeatures(f.target.getArray())
            layer.getSource().getFeatures().forEach((lyr)=>{
                console.log("looping through layers")
                console.log(lyr)
                aoiExtents = extend(aoiExtents, lyr.getGeometry().getExtent())
                aoiCoors.push(lyr.getGeometry().getCoordinates())
                area = area + lyr.get("areasqM")
            })
//            selecting the huc 10 aoi
            if(layer.get('name')== 'aoi'){
                // set state of appcontainer to the current extents and coords of selection areas
                this.props.setAoiExtentsCoors({"extents":aoiExtents, "coors":aoiCoors})
                this.props.setAoiArea({"aoiArea":area})

            }
//            otherwise its just a transformation selection
            else{
                this.props.updateActiveTransProps({"name":'extent', "value":aoiExtents, "type":"reg"})
                this.props.updateActiveTransProps({"name":'field_coors', "value":aoiCoors, "type":"reg"})
                this.props.updateActiveTransProps({"name":'area', "value":area, "type":"base"})
                console.log("area")
                console.log(area)

            }
            console.log("done with add selection")
          });



        // a DragBox interaction used to select features by drawing boxes
        this.dragBox = new DragBox({
//          condition: platformModifierKeyOnly,
        });

        this.dragBox.on('boxend', () => this.drawRectangleBoundary(this.dragBox))
        // clear selection when drawing a new box and when clicking on the map
        this.dragBox.on('boxstart', function () {
//          this.selectedFeatures.clear();

        });
        const value = "Polygon";
//        this.source = new VectorSource({
//            projection: 'EPSG:3857',
//        })
//        this.boundaryLayer.setSource(this.source)
        this.draw = new Draw({
          source: this.source,
          type: value,
        });
//        this.source.on('addfeature', function(evt){
////            start_drawing = true;
//        });
        this.draw.on('drawstart', function(evt){
//            start_drawing = true;
        });
        this.draw.on('drawend', (evt) => {})
        // fire when we add a new polygon
//        this.source.on('addfeature', (evt) => {
////            start_drawing = false;
//            let aoiExtents = createEmpty();
//            let aoiCoors = []
//
//            this.boundaryLayer.getSource().forEachFeature(function (lyr) {

//                aoiExtents = extend(aoiExtents, lyr.getGeometry().getExtent())
//                aoiCoors.push(lyr.getGeometry().getCoordinates())
//            })

//            this.props.handleBoundaryChange(aoiExtents,aoiCoors)
//
//
//        });
    this.map.addInteraction(this.select);
    }
    render(){
//        size of loader
        let loaderSize = 100
        let windowHeight = window.innerHeight
        let windowWidth = window.innerWidth

        let loaderHeight = (windowHeight/2 - loaderSize/2) / windowHeight * 100
//        console.log(loaderHeight)
        let heightString = String(loaderHeight) + "%"
        let loaderRight = null
        console.log(document.getElementById("map"))
        if (document.getElementById("map") != null){

            loaderRight = document.getElementById("map").offsetWidth/2
        }
        else{
            loaderRight = windowWidth *(9/12)/2
        }
        console.log(loaderRight)
        let widthString = String(loaderRight-loaderSize) + "px"
//        console.log(heightString)
        const style = {
            width: '100%',
            height: '90vh',
            backgroundColor: '#cccccc',

//            position:'absolute',
//            position: 'fixed'
        }

        const style1 ={
            width: '100%',
            height: '500px',
        }
        const overlayStyle={

             width: '50%',
             backgroundColor: 'transparent',
             hidden: "true"
        }
        const loaderStyle={
            position: "absolute",
            zIndex: "100",
            top: heightString,
            right: widthString,
            color:"#8b32a8",
            fontSize: "40px",
            textAlign: "center",
            fontWeight: "bold"
        }

        return (
            <div>
            <div id = "loaderDiv" style = {loaderStyle} hidden={true}>
                <RotatingLines
                  width={loaderSize}
                  strokeWidth={5}
                  strokeColor="#8b32a8"
                  ariaLabel="loading"

                />
                <p></p>
                Loading
                </div>
			<div id='map' style={style}>

			</div>

            <div id="overlay2" >hizsfdsfafasdfsadfasdfsadfdf3434343</div>
            </div>

        )
    }
}
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OLMapFragment)