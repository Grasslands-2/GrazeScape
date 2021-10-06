import React from 'react'

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
    Vector as VectorLayer
} from 'ol/layer'
import {
    Vector as VectorSource,
    OSM as OSMSource,
    XYZ as XYZSource,
    TileWMS as TileWMSSource
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

var map11 = null;

class OLMapFragment extends React.Component {
    constructor(props) {
        super(props)
        console.log(props)
        this.updateDimensions = this.updateDimensions.bind(this)
        this.bing_key = 'Anug_v1v0dwJiJPxdyrRWz0BBv_p2sm5XA72OW-ypA064_JoUViwpDXZl3v7KZC1'
        this.layers = [
                new TileLayer({
                    source: new XYZSource({
                        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        projection: 'EPSG:3857'
                    })
                }),
//                new TileLayer({
//                    source: new TileWMSSource({
//                        url: 'https://ahocevar.com/geoserver/wms',
//                        params: {
//                            layers: 'topp:states',
//                            'TILED': true,
//                        },
//                        projection: 'EPSG:4326'
//                    }),
//                    name: 'USA'
//                }),
        ]
    }
    updateDimensions(){
        const h = window.innerWidth >= 992 ? window.innerHeight : 400
        this.setState({height: h})
    }
//    componentWillMount(){
//        this.updateDimensions()
//    }
    // rendered to DOM
    componentDidMount(){
        console.log("did mount")
        // Create an Openlayer Map instance with two tile layers
        const map11 = new Map({
            //  Display the map in the div with the id of map
            target: 'map',
            layers: this.layers ,
            // Add in the following map controls
            controls: DefaultControls().extend([
//                new ZoomSlider(),
//                new MousePosition(),
                new ScaleLine(),
                new OverviewMap()
            ]),
            // Render the tile layers in a map view with a Mercator projection
            view: new View({
                projection: 'EPSG:3857',
                center: [0, 0],
                zoom: 2
            })
        })
    }
    componentWillUnmount(){
        window.removeEventListener('resize', this.updateDimensions)
    }
    render(){
        const style = {
            width: '100%',
            height:'800px',
            backgroundColor: '#cccccc',
        }
        return (

			<div id='map' style={style}></div>

        )
    }
}
export default OLMapFragment