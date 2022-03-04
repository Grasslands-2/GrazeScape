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
import {
    Style,
    Fill as FillStyle,
    RegularShape as RegularShapeStyle,
    Stroke as StrokeStyle
} from 'ol/style'
import {getVectorContext} from 'ol/render';

import { 
    Projection,
    get as getProjection
 } from 'ol/proj'
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

import { useSelector, useDispatch, connect  } from 'react-redux'
import{setActiveTrans,setActiveTransOL, updateTransList,updateAreaSelectionType,
updateActiveTransProps,setVisibilityMapLayer} from '/src/stores/transSlice'
import configureStore from './stores/store'
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

//        getTrans: (value)=> dispatch(getTrans(value)),
        updateAreaSelectionType: (value)=> dispatch(updateAreaSelectionType(value)),
        updateActiveTransProps: (value)=> dispatch(updateActiveTransProps(value)),
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

        this.state = {isDrawing:false,activeTransLayer:null}
    }
    // updates when props have been changed
    componentDidUpdate(prevProps) {
      console.log("components updated")
      console.log(prevProps)
      console.log(this.props)
//      this.rasterLayer.setSource(this.props.rasterLayer1)
      // if area selection has change activate type, activate different map tool
      if (prevProps.areaSelectionType !== this.props.areaSelectionType) {
        this.updateAreaSelectionType(this.props.areaSelectionType);
      }
      // the display layer of a transformation needs to be changed
      if (prevProps.activeDisplayProps !== this.props.activeDisplayProps) {
        // create a new raster source
        console.log("creating new image source")
        console.log(this.props.activeDisplayProps)
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
                        console.log("setting new source")
                        console.log(layers[layer])
                        layers[layer].setSource(rasterLayerSource)
                        console.log(layers[layer])
//                        layers[layer].getSource().refresh()
                        break
                    }
                }
            }
        }
      }
      // turn of give layer (only used for learning hub boundary, huc 10 and huc 12 at this point)
      if(prevProps.layerVisible != this.props.layerVisible){
          let layers = this.map.getLayers().getArray()
//        turn off selection
        this.props.updateAreaSelectionType(null);
        this.map.removeInteraction(this.select);
        for (let ly in this.props.layerVisible){
            for (let layer in layers){
            //          turn off previous active trans
                if(layers[layer].get('name') == this.props.layerVisible[ly].name){
                    layers[layer].setVisible(this.props.layerVisible[ly].visible);
                }
            }
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
        let items = JSON.parse(JSON.stringify(this.props.listTrans))
        let addTransId = this.props.addTrans.id
        for(let trans in items){
            if(items[trans].id == addTransId){
                let displayLayer = new ImageLayer({
                    source: new Static({
                        projection: 'EPSG:3857',
                        imageExtent: [-10118831.03520702, 5369618.99185455, -10114083.11978821, 5376543.89851876],
                    }),
                    visible: true,
                })
                let boundaryLayer = new VectorLayer({
                    source:new VectorSource({
                        projection: 'EPSG:3857',
                    }),
                    visible: true,
                    style: this.stylesBoundaryTrans,
                })
                this.addLayer(displayLayer)
                this.addLayer(boundaryLayer)
                items[trans].displayLayerID = displayLayer.ol_uid
                items[trans].boundaryLayerID = boundaryLayer.ol_uid
                // update transformation list with new data
                this.props.updateTransList(items)

                let aoiExtents = createEmpty();
                let aoiCoors = []
                let layer = boundaryLayer
                 console.log(this.boundaryLayerAOI)
//                 this.boundaryLayerAOI.getSource().forEachFeature(function (feature){
//
//                    // check for feature and get coordinates
//                     layer.getSource().addFeatures(feature.getGeometry().getCoordinates())
////                    if (feature.get('Name') == featureName{
////                       var Coords = feature.getGeometry().getCoordinates();
////                    }
//               })
//                layer.getSource().addFeatures(this.boundaryLayerAOI.getArray())
//                let layer = this.boundaryLayerAOI
                this.boundaryLayerAOI.getSource().getFeatures().forEach((lyr)=>{
                                console.log("looping through layers")
                                aoiExtents = extend(aoiExtents, lyr.getGeometry().getExtent())
                                aoiCoors.push(lyr.getGeometry().getCoordinates())
                                var aa =lyr.getGeometry().getExtent()
                                var oo = getCenter(aa);
                                    console.log("The center is :  "+oo);
                            })

                console.log(aoiExtents)
                console.log(aoiCoors)
                this.props.updateActiveTransProps({"name":'extent', "value":aoiExtents, "type":"reg"})
                this.props.updateActiveTransProps({"name":'field_coors', "value":aoiCoors, "type":"reg"})
            }
        }
      }
      // remove layer
      else if(prevProps.listTrans.length > this.props.listTrans.length){
        let layers = this.map.getLayers().getArray()
        for (let layer in layers){
          if (layers[layer].ol_uid == this.props.removeTrans.displayLayerID ||
          layers[layer] == this.props.removeTrans.boundaryLayerID) {
            this.map.removeLayer(layers[layer])
          }
        };
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
    setActiveRegion(region){

//        let region = "southWestWI_HUC_10.geojson"
//        let region = "cloverBeltWI_HUC_10.geojson"
        let region_10 = region + "_HUC_10.geojson"
        let url = location.origin + "/smartscape/get_image?file_name="+region_10+ "&time="+Date.now()
        let source = new VectorSource({
              url: url,
//              url: "http://geoserver-dev1.glbrc.org:8080/geoserver/SmartScapeVector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=SmartScapeVector%3AWI_Huc_10&bbox=-10177405.371529581,5310171.353307071,-10040067.4011019,5490394.616539205&maxFeatures=5000&outputFormat=application%2Fjson",
              format: new GeoJSON(),
               projection: 'EPSG:3857',
            })
        this.huc10.setSource(source)
        let region_12 = region + "_HUC_12.geojson"
        url = location.origin + "/smartscape/get_image?file_name="+region_12+ "&time="+Date.now()
        source = new VectorSource({
              url: url,
              format: new GeoJSON(),
               projection: 'EPSG:3857',
            })
        this.huc12.setSource(source)

        this.map.removeInteraction(this.select)
        this.selectedFeatures.clear()
        this.map.render()
        this.map.addInteraction(this.select);

    }
    // allows user to draw selection polygon
    // tied to button click right now so it checks state
//    drawBoundary(){

//        if(!this.state.isDrawing){
//            this.setState({isDrawing:true})
//            this.map.addInteraction(this.draw);
//        }
//        else{
//            this.setState({isDrawing:false})
//            this.map.removeInteraction(this.draw)
//        }
//    }
//    drawRectangleBoundary(dragBox){

////        if(dragBox.getGeometry() == null){
////            return
////        }
//        const extent = dragBox.getGeometry().getExtent();
//        const coors = dragBox.getGeometry().getCoordinates();
//        this.props.handleBoundaryChange(extent,coors)
//    }
    // fires after react has created the base component
    componentDidMount(){
        const attribution = new Attribution({
          collapsible: false,
        });
                // create basae style for layers
        const styles = [new Style({
            stroke: new Stroke({
              color: 'blue',
              width: 3,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.0)',
            }),
          })]
          this.stylesBoundary = [new Style({
            stroke: new Stroke({
              color: 'red',
              width: 3,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.0)',
            }),
          })]
          this.stylesBoundaryTrans = [new Style({
            stroke: new Stroke({
              color: '#25AFC6',
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
          zIndex: 100,
          source: new VectorSource({
            projection: 'EPSG:3857',
            }),
            style:this.stylesBoundary,
        });
        // layer to hold huc 10 watersheds
         this.huc10 = new VectorLayer({
            name:'huc10',
            renderMode: 'image',
//          source:new VectorSource({
//              url: static_global_folder + 'smartscape/gis/Watersheds/WI_Huc_10_trim.geojson',
////              url: "http://geoserver-dev1.glbrc.org:8080/geoserver/SmartScapeVector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=SmartScapeVector%3AWI_Huc_10&bbox=-10177405.371529581,5310171.353307071,-10040067.4011019,5490394.616539205&maxFeatures=5000&outputFormat=application%2Fjson",
//              format: new GeoJSON(),
//               projection: 'EPSG:3857',
//            }),
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
               projection: 'EPSG:3857',
            }),
            style: styles,
            visible: false,
//            operation: olSourceRasterOperationCropInner
        });
       // show borders of our three work areas
        this.southCentral = new VectorLayer({
          renderMode: 'image',
          name: "southCentral",
          source:new VectorSource({
              url: static_global_folder + 'smartscape/gis/Boundaries/southCentralWI.geojson',
              format: new GeoJSON(),
               projection: 'EPSG:3857',
            }),
            style: this.stylesBoundary,
        });
        this.southWest = new VectorLayer({
            renderMode: 'image',
            name: "southWest",
          source:new VectorSource({
              url: static_global_folder + 'smartscape/gis/Boundaries/southWestWI.geojson',
              format: new GeoJSON(),
               projection: 'EPSG:3857',
            }),
            style: this.stylesBoundary,
        });
        this.cloverBelt = new VectorLayer({
            renderMode: 'image',
            name: "cloverBelt",
          source:new VectorSource({
              url: static_global_folder + 'smartscape/gis/Boundaries/cloverBelt.geojson',
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

//            this.cloverBelt,
//            this.southCentral,
            this.southWest,
            this.huc10,
            this.huc12,
            this.boundaryLayerAOI,
//            this.waterSheds1,
//            this.huc10Layer,
//            this.waterSheds,


        ]
        // Create an Openlayer Map instance
        this.map = new Map({
            //  Display the map in the div with the id of map
            target: 'map',
            layers: this.layers,
            // Add in the following map controls
            controls: [
                new ZoomSlider(),
                new MousePosition(),
                new ScaleLine(),
//                new OverviewMap(),
                    new Attribution()
////                attributionOptions: collapsible: true
                ],
            // Render the tile layers in a map view with a Mercator projection
            view: new View({
                projection: 'EPSG:3857',
//                center: [0, 0],
//                zoom: 2,
//                centered at the learning hubs
                center: [-10008338,5525100],
                // centered at kickapoo
                center: [-10107218.88240181,5404739.54256515],
				zoom: 8,
				maxZoom: 19,
				minZoom: 3,//10,
			//	constrainRotation: false,
			//	rotation: 0.009,
//				constrainOnlyCenter: true,
//				extent:[-10132000, 5353000, -10103000, 5397000]
            })
        })
        // single slick selection
        this.select = new Select({
            condition: click,
//             multi: true,
           layers:function(layer){
//           console.log("32$$#$#$#$#$$###$")
                           if (layer.get('name') == "aoi"){
                    return false
                }
//                console.log(layer)
           return true},
           filter: function(feature, layer) {
                console.log("sdfhjsadhfjah3wj5")

                return true/* some logic on a feature and layer to decide if it should be selectable; return true if yes */;
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
            console.log(f.target)
//            console.log(f.target.item(0).getGeometry())
            console.log(f.target.item(0).getGeometry().getExtent())
//          selecting by county
            if(f.target.item(0).get("NAME") != undefined){
                console.log("selecting a county!!!!!")
                var extent = f.target.item(0).getGeometry().getExtent()
                console.log(extent)
                this.map.getView().fit(extent,{"duration":500});
                if(f.target.item(0).get("NAME") == "La Crosse"){
                    region = "southWestWI"
                }
                else if (f.target.item(0).get("NAME") == "Clark"){
                    region = "cloverBeltWI"
                }
                this.setActiveRegion(region)

                return
            }

            // get active trans boundary layer
            let layer = this.getActiveBounLay()
            // setting the aoi boundary because we don't have any trans yet
            if (layer == null){
                layer = this.boundaryLayerAOI
            }
            layer.getSource().clear()
            console.log("Selection layer")
            console.log(layer)
            layer.getSource().addFeatures(f.target.getArray())
            layer.getSource().getFeatures().forEach((lyr)=>{
                console.log("looping through layers")
                aoiExtents = extend(aoiExtents, lyr.getGeometry().getExtent())
                aoiCoors.push(lyr.getGeometry().getCoordinates())
            })
//            selecting the huc 10 aoi
            if(layer.get('name')== 'aoi'){
                // set state of appcontainer to the current extents and coords of selection areas
                this.props.handleBoundaryChange(aoiExtents,aoiCoors)
            }
//            otherwise its just a transformation selection
            else{
                this.props.updateActiveTransProps({"name":'extent', "value":aoiExtents, "type":"reg"})
                this.props.updateActiveTransProps({"name":'field_coors', "value":aoiCoors, "type":"reg"})
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
        const style = {
            width: '100%',
            height: '90vh',
            backgroundColor: '#cccccc',
//            position: 'fixed'
        }
        const style1 ={
            width: '100%',
            height: '500px',
        }
        return (
            <div>

			<div id='map' style={style}></div>
            </div>

        )
    }
}
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OLMapFragment)