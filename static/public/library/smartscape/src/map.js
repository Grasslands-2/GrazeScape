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
import {extend, createEmpty} from 'ol/extent';

import { useSelector, useDispatch, connect  } from 'react-redux'
import{setActiveTrans,setActiveTransOL, updateTransList,updateAreaSelectionType,
updateActiveTransProps} from '/src/stores/transSlice'
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
              width: 5,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.0)',
            }),
          })]
          this.stylesBoundaryTrans = [new Style({
            stroke: new Stroke({
              color: '#25AFC6',
              width: 5,
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
          source: new VectorSource({
            projection: 'EPSG:3857',
            }),
            style:this.stylesBoundary,
        });
        // layer to hold huc 10 watersheds
         this.huc10 = new VectorLayer({
            name:'huc10',
            renderMode: 'image',
          source:new VectorSource({
//              url: static_global_folder + 'smartscape/gis/Watersheds/WI_Huc_10_json.geojson',
              url: static_global_folder + 'smartscape/gis/Watersheds/WI_Huc_10_trim.geojson',
              format: new GeoJSON(),
               projection: 'EPSG:3857',
            }),
            style: styles,
        });
        // layer to hold huc 10 watersheds
         this.huc12 = new VectorLayer({
            name: 'huc12',
            renderMode: 'image',
          source:new VectorSource({
//              url: static_global_folder + 'smartscape/gis/Watersheds/WI_Huc_12_json.geojson',
              url: static_global_folder + 'smartscape/gis/Watersheds/WI_Huc_12_trim.geojson',
              format: new GeoJSON(),
               projection: 'EPSG:3857',
            }),
            style: styles,
            visible: false,
        });
       // show borders of our three work areas
        this.southCentral = new VectorLayer({

            renderMode: 'image',
          source:new VectorSource({
              url: static_global_folder + 'smartscape/gis/Boundaries/southCentralWI.geojson',
              format: new GeoJSON(),
               projection: 'EPSG:3857',
            }),
            style: this.stylesBoundary,
        });
        this.southWest = new VectorLayer({
            renderMode: 'image',
          source:new VectorSource({
              url: static_global_folder + 'smartscape/gis/Boundaries/southWestWI.geojson',
              format: new GeoJSON(),
               projection: 'EPSG:3857',
            }),
            style: this.stylesBoundary,
        });
        this.cloverBelt = new VectorLayer({
            renderMode: 'image',
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

            this.cloverBelt,
            this.southCentral,
            this.southWest,
            this.boundaryLayerAOI,
              this.huc10,
            this.huc12,
//            this.waterSheds1,
//            this.huc10Layer,
//            this.waterSheds,


        ]
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
      // turn of give layer (only used for huc 10 and huc 12 at this point)
      if(prevProps.layerVisible != this.props.layerVisible){
        let layers = this.map.getLayers().getArray()
        this.props.updateAreaSelectionType(null);
        for (let layer in layers){
//          turn off previous active trans
            if(layers[layer].get('name') == this.props.layerVisible.name){
                layers[layer].setVisible(this.props.layerVisible.visible);
                return;
            }
        };
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
                    visible: false,
                })
                let boundaryLayer = new VectorLayer({
                    source:new VectorSource({
                        projection: 'EPSG:3857',
                    }),
                    visible: false,
                    style: this.stylesBoundaryTrans,
                })
                this.addLayer(displayLayer)
                this.addLayer(boundaryLayer)
                items[trans].displayLayerID = displayLayer.ol_uid
                items[trans].boundaryLayerID = boundaryLayer.ol_uid
                // update transformation list with new data
                this.props.updateTransList(items)
                break
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
        console.log(this.props.activeTrans)
        console.log(this.props.listTrans)
        let layers = this.map.getLayers().getArray()
        for (let layer in layers){
          if (layers[layer].ol_uid == this.props.activeTrans.boundaryLayerID) {
            return layers[layer]
          }
        };
        return null
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
                center: [-10118000,5375100],
				zoom: 10,
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
        });
        // select interaction working on "click"
        const selectClick = new Select({
          condition: click,
        });
        // get selected features from map
        this.selectedFeatures = this.select.getFeatures();
        this.selectedFeatures.on(['remove'], (f)=> {

        })
        // get selected features and add them to active trans
        this.selectedFeatures.on(['add'], (f)=> {

            let aoiExtents = createEmpty();
            let aoiCoors = []
            // get active trans boundary layer
            let layer = this.getActiveBounLay()
            // setting the aoi boundary
            if (layer == null){
                layer = this.boundaryLayerAOI
            }

            layer.getSource().addFeature(f.target.item(0))
            layer.getSource().getFeatures().forEach((lyr)=>{
                aoiExtents = extend(aoiExtents, lyr.getGeometry().getExtent())
                aoiCoors.push(lyr.getGeometry().getCoordinates())

            })

//            layer.getSource().clear()
//            this.selectedFeatures.forEach(function (lyr) {
//            this.selectedFeatures.forEach((lyr)=> {

////                let boundLayers = this.state.boundSelectTrans
//                layer.getSource().addFeature(lyr)
////                let layer = boundLayers.push(lyr)
////                this.setState({boundSelectTrans:boundLayers})

//                aoiExtents = extend(aoiExtents, lyr.getGeometry().getExtent())
//                aoiCoors.push(lyr.getGeometry().getCoordinates())
//            })
//            const names = selectedFeatures.getArray().map(function (feature) {
//            return feature.get('name');

            if(layer.get('name')== 'aoi'){
                // set state of appcontainer to the current extents and coords of selection areas
                this.props.handleBoundaryChange(aoiExtents,aoiCoors)
            }
            else{
                this.props.updateActiveTransProps({"name":'extent', "value":aoiExtents, "type":"reg"})
                this.props.updateActiveTransProps({"name":'field_coors', "value":aoiCoors, "type":"reg"})
            }
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