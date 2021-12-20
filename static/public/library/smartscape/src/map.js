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
// values from redux state
const mapStateToProps = state => {
    console.log("mapping to map")
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
// function from redux state
const mapDispatchToProps = (dispatch) => {
    console.log("Dispatching!!")
    return{
        setActiveTrans: (value)=> dispatch(setActiveTrans(value)),
        setActiveTransOL: (value)=> dispatch(setActiveTransOL(value)),
        updateTransList: (value)=> dispatch(updateTransList(value)),
        updateAreaSelectionType: (value)=> dispatch(updateAreaSelectionType(value)),
        updateActiveTransProps: (value)=> dispatch(updateActiveTransProps(value)),
    }
};
class OLMapFragment extends React.Component {
    constructor(props) {
        super(props)
        console.log(props)
//        this.drawBoundary = this.drawBoundary.bind(this)
//        this.drawRectangleBoundary = this.drawRectangleBoundary.bind(this)
        this.updateAreaSelectionType = this.updateAreaSelectionType.bind(this)
        this.addLayer = this.addLayer.bind(this)
//        this.
//        configureStore.subscribe(() => {
//          // When state will be updated(in our case, when items will be fetched),
//          // we will update local component state and force component to rerender
//          // with new data.
//            console.log(configureStore.getState())
//          this.setState({
//            activeTransLayer: configureStore.getState().items
//          });
//        });
//        this.testfun
        const styles = [new Style({
            stroke: new Stroke({
              color: 'blue',
              width: 3,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.0)',
            }),
          })]
          const stylesBoundary = [new Style({
            stroke: new Stroke({
              color: 'red',
              width: 5,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.0)',
            }),
          })]
        this.bing_key = 'Anug_v1v0dwJiJPxdyrRWz0BBv_p2sm5XA72OW-ypA064_JoUViwpDXZl3v7KZC1'
        this.rasterLayer = new ImageLayer({
            source: new Static({
//                url: location.origin + "/smartscape/get_image?file_name="+"af8773e9-ce34-4fee-8eee-f8457fef97aa.png",
//                url: "get_image?file_name="+this.props.rasterUrl,
                projection: 'EPSG:3857',
//                url: 'https://imgs.xkcd.com/comics/online_communities.png',
                imageExtent: [-10118831.03520702, 5369618.99185455, -10114083.11978821, 5376543.89851876],
            }),
        })
//        const vectorSource =
        this.boundaryLayerAOI = new VectorLayer({
          name: "aoi",
          source: new VectorSource({
            projection: 'EPSG:3857',
            }),
            style:stylesBoundary,
        });
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
        this.cloverBelt = new VectorLayer({

            renderMode: 'image',
          source:new VectorSource({
              url: static_global_folder + 'smartscape/gis/Boundaries/cloverBelt.geojson',
              format: new GeoJSON(),
               projection: 'EPSG:3857',
            }),
            style: stylesBoundary,
        });
        this.southCentral = new VectorLayer({

            renderMode: 'image',
          source:new VectorSource({
              url: static_global_folder + 'smartscape/gis/Boundaries/southCentralWI.geojson',
              format: new GeoJSON(),
               projection: 'EPSG:3857',
            }),
            style: stylesBoundary,
        });
        this.southWest = new VectorLayer({

            renderMode: 'image',
          source:new VectorSource({
              url: static_global_folder + 'smartscape/gis/Boundaries/southWestWI.geojson',
              format: new GeoJSON(),
               projection: 'EPSG:3857',
            }),
            style: stylesBoundary,
        });

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

//            this.waterSheds1,
            this.rasterLayer,
            this.boundaryLayerAOI,
//            this.huc10Layer,
//            this.waterSheds,
            this.huc10,
            this.huc12,

        ]
        this.state = {isDrawing:false,activeTransLayer:null}
    }
    componentDidUpdate(prevProps) {
      console.log("components updated")
      console.log(prevProps)
      console.log(this.props)
//      this.rasterLayer.setSource(this.props.rasterLayer1)
      // if area selection has change activate type, activate different map tool
      if (prevProps.areaSelectionType !== this.props.areaSelectionType) {
        this.updateAreaSelectionType(prevProps.areaSelectionType, this.props.areaSelectionType);
      }
      if (prevProps.activeDisplayProps !== this.props.activeDisplayProps) {
        let rasterLayerSource =
            new Static({
                url: this.props.activeDisplayProps.url,
                projection: 'EPSG:3857',
                imageExtent: this.props.activeDisplayProps.extents
        })
        // find active trans display layer
        let layers = this.map.getLayers().getArray()
        let newLayer = this.props.activeTrans
        for (let layer in layers){
            console.log(layers[layer])
            if(layers[layer].ol_uid == newLayer.displayLayerID){
                layers[layer].setSource(rasterLayerSource)
            }
        }

      }
      // turn of give layer (only used for huc 10 and huc 12 at this point)
      if(prevProps.layerVisible != this.props.layerVisible){
        console.log("turn off layer!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1")
        let layers = this.map.getLayers().getArray()
        // remove selection interaction
        this.props.updateAreaSelectionType(null);

        for (let layer in layers){
            console.log(layers[layer])
//          turn off previous active trans
            if(layers[layer].get('name') == this.props.layerVisible.name){
                layers[layer].setVisible(this.props.layerVisible.visible);
                return;
            }
        };
      }
      // set source of active trans
      // change active trans
      if(prevProps.activeTrans.id != this.props.activeTrans.id){
        console.log("active layer has changed")
        this.props.updateAreaSelectionType(null);
        let layers = this.map.getLayers().getArray()
        let oldLayer = prevProps.activeTrans
        let newLayer = this.props.activeTrans
        for (let layer in layers){
            console.log(layers[layer])
//          turn off previous active trans
            if(layers[layer].ol_uid == oldLayer.displayLayerID ||layers[layer].ol_uid == oldLayer.boundaryLayerID){
                layers[layer].setVisible(false);
            }
            if(layers[layer].ol_uid == newLayer.displayLayerID ||layers[layer].ol_uid == newLayer.boundaryLayerID){
                layers[layer].setVisible(true);
            }
        };
      }
      // add layer
      if(prevProps.listTrans.length < this.props.listTrans.length){
        console.log("adding new trans")
        console.log(this.props.addTrans)
        let items = JSON.parse(JSON.stringify(this.props.listTrans))
        let addTransId = this.props.addTrans.id
        for(let trans in items){
            if(items[trans].id == addTransId){
                console.log("found trans")
                let displayLayer = new ImageLayer({
                    source: new Static({
        //                url: location.origin + "/smartscape/get_image?file_name="+"af8773e9-ce34-4fee-8eee-f8457fef97aa.png",
        //                url: "get_image?file_name="+this.props.rasterUrl,
                        projection: 'EPSG:3857',
//                        url: 'https://imgs.xkcd.com/comics/online_communities.png',
                        imageExtent: [-10118831.03520702, 5369618.99185455, -10114083.11978821, 5376543.89851876],
                    }),
                    visible: false,

                })
                let boundaryLayer = new VectorLayer({
                    source:new VectorSource({
                        projection: 'EPSG:3857',
                    }),
                    visible: false,
                })
                this.addLayer(displayLayer)
                this.addLayer(boundaryLayer)
                console.log(displayLayer.ol_uid)
                console.log(boundaryLayer.ol_uid)
                items[trans].displayLayerID = displayLayer.ol_uid
                items[trans].boundaryLayerID = boundaryLayer.ol_uid
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
//            layers[layer].setVisible(false)
            this.map.removeLayer(layers[layer])
          }
        };
      }
    }
    addLayer(layer){
        this.map.addLayer(layer);
    }
    updateAreaSelectionType(oldSelection, newSelection){
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
    }
    getActiveBounLay(){
        console.log(this.props.activeTrans)
        console.log(this.props.listTrans)
        let layers = this.map.getLayers().getArray()
        for (let layer in layers){
          if (layers[layer].ol_uid == this.props.activeTrans.boundaryLayerID) {
            console.log(layers[layer].ol_uid)
            return layers[layer]
          }
        };
        return null
    }
    // allows user to draw selection polygon
    // tied to button click right now so it checks state
//    drawBoundary(){
//        console.log("drawing");
//        console.log(this.state);
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
//        console.log("hi")
//        console.log(dragBox)
////        if(dragBox.getGeometry() == null){
////            return
////        }
//        const extent = dragBox.getGeometry().getExtent();
//        const coors = dragBox.getGeometry().getCoordinates();
//        console.log(extent)
//        this.props.handleBoundaryChange(extent,coors)
//    }

    componentDidMount(){
        console.log("did mount")
        const attribution = new Attribution({
          collapsible: false,
        });
        // Create an Openlayer Map instance with two tile layers
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
        this.select = new Select({
            condition: click,
        });
        // select interaction working on "click"
        const selectClick = new Select({
          condition: click,
        });

        this.selectedFeatures = this.select.getFeatures();
        this.selectedFeatures.on(['remove'], (f)=> {
            console.log(f)
            console.log("removing feature###############")
        })
        this.selectedFeatures.on(['add'], (f)=> {

            console.log("adding feature")
            console.log(f)
            console.log(this.selectedFeatures)
            let aoiExtents = createEmpty();
            let aoiCoors = []
            // get active trans boundary layer
            let layer = this.getActiveBounLay()
            // setting the aoi boundary
            if (layer == null){
                layer = this.boundaryLayerAOI
            }
            console.log(layer)
            console.log(layer.getSource().getFeatures())
            console.log(layer.get('name'))

            layer.getSource().addFeature(f.target.item(0))
            layer.getSource().getFeatures().forEach((lyr)=>{
                console.log("looping through boundary layer !!!!!!!!!!")

                aoiExtents = extend(aoiExtents, lyr.getGeometry().getExtent())
                aoiCoors.push(lyr.getGeometry().getCoordinates())

            })

//            layer.getSource().clear()
//            this.selectedFeatures.forEach(function (lyr) {
//            this.selectedFeatures.forEach((lyr)=> {
//                console.log(lyr);
//                console.log(this.state)
////                let boundLayers = this.state.boundSelectTrans
//                layer.getSource().addFeature(lyr)
////                let layer = boundLayers.push(lyr)
////                this.setState({boundSelectTrans:boundLayers})
//                console.log(lyr.getGeometry().getExtent())
//                console.log(lyr.getGeometry().getCoordinates())
//                aoiExtents = extend(aoiExtents, lyr.getGeometry().getExtent())
//                aoiCoors.push(lyr.getGeometry().getCoordinates())
//            })
            console.log("state after adding layer",this.state)
//            const names = selectedFeatures.getArray().map(function (feature) {
//            return feature.get('name');
            console.log("aoi extents", aoiExtents)
            console.log("aoi coors", aoiCoors)
            if(layer.get('name')== 'aoi'){
                console.log("adding layer to aoi")
                // set state of appcontainer to the current extents and coords of selection areas
                this.props.handleBoundaryChange(aoiExtents,aoiCoors)
            }
            else{
                console.log("adding extents #######################")
                this.props.updateActiveTransProps({"name":'extent', "value":aoiExtents})
                this.props.updateActiveTransProps({"name":'field_coors', "value":aoiCoors})
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
//            console.log("added feature!!!!!!!!!!!!!!!!!!!!!!!!!!!")
//        });
        this.draw.on('drawstart', function(evt){
//            start_drawing = true;
            console.log("starting drawing")
        });
        this.draw.on('drawend', (evt) => {})
        // fire when we add a new polygon
//        this.source.on('addfeature', (evt) => {
////            start_drawing = false;
//            console.log("done drawing")
//            let aoiExtents = createEmpty();
//            let aoiCoors = []
////            console.log(this.boundaryLayer)
//
//            this.boundaryLayer.getSource().forEachFeature(function (lyr) {
//                console.log(lyr);
//                console.log(lyr.getGeometry().getExtent())
//                console.log(lyr.getGeometry().getCoordinates())
//                aoiExtents = extend(aoiExtents, lyr.getGeometry().getExtent())
//                aoiCoors.push(lyr.getGeometry().getCoordinates())
//            })
//            console.log(this.boundaryLayer.getSource().getFeatures().length)
//            console.log("aoi extents", aoiExtents)
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