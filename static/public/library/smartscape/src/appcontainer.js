import React, { useState } from 'react';
import { DoorOpen } from 'react-bootstrap-icons';
import Toast from 'react-bootstrap/Toast';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar'
import Row from 'react-bootstrap/Row'
import Image from 'react-bootstrap/Image'
import Col from 'react-bootstrap/Col'
import Ratio from 'react-bootstrap/Ratio'
import Alert from 'react-bootstrap/Alert'
import './App.css';
import CSRFToken from './csrf';
import OLMapFragment from './map.js';
import Header from './header.js';
import SidePanel from './sidepanel.js';
//import Transformation from './transformation/transformation.js'

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
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import {Transformation} from './transformation/transformation.js'
import{setActiveTrans, addTrans,updateAreaSelectionType,updateActiveTransProps,
setVisibilityMapLayer,setActiveTransDisplay} from '/src/stores/transSlice'
import { useSelector, useDispatch, connect  } from 'react-redux'

const mapStateToProps = state => {
    console.log("mapping sidepannel")
    return{
        activeTrans: state.transformation.activeTrans,
        listTrans:state.transformation.listTrans
}}

const mapDispatchToProps = (dispatch) => {
    console.log("Dispatching!!")
    return{
        setActiveTrans: (value)=> dispatch(setActiveTrans(value)),
        addTrans: (value)=> dispatch(addTrans(value)),
        updateAreaSelectionType: (value)=> dispatch(updateAreaSelectionType(value)),
        updateActiveTransProps: (type)=> dispatch(updateActiveTransProps(type)),
        setVisibilityMapLayer: (type)=> dispatch(setVisibilityMapLayer(type)),
        setActiveTransDisplay: (type)=> dispatch(setActiveTransDisplay(type)),
    }
};
class AppContainer extends React.Component{
  constructor(props) {
    super(props);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.loadSelectionRaster = this.loadSelectionRaster.bind(this);
    this.displaySelectionCriteria = this.displaySelectionCriteria.bind(this);
    this.handleBoundaryChange = this.handleBoundaryChange.bind(this);
    this.handleAreaSelectionType = this.handleAreaSelectionType.bind(this);
    this.addTrans = this.addTrans.bind(this);

    this.state = {
        text: '',
        rasterUrl: "",
        rasterExtents: "",
        rasterLayer1:this.rasterLayer1,
        extent:[],
        areaSelectionType:"",
        boundaryRasterId:"",
        coors:[],
//        newTrans:new Transformation("intial",-1,-1)
        };
  }

  handleTextChange(newText) {
    this.setState({text: newText});
  }
  handleBoundaryChange(extent, coors){
    this.setState({
        extent:extent,
        coors:coors
    })
    console.log("boundary changed",this.state)
  }
  handleAreaSelectionType(type){
    console.log("app", type)
    this.setState({areaSelectionType:type})
  }
  addTrans(trans){
    console.log("app container")
    this.setState({newTrans:trans})
  }
  // load rasters for aoi
  loadSelectionRaster(){
     // ajax call with selection criteria
     if (this.state.extent.length == 0){
        return
     }
    console.log("launching ajax")
    console.log(this.state)
    var csrftoken = Cookies.get('csrftoken');
    $.ajaxSetup({
        headers: { "X-CSRFToken": csrftoken }
    });
    $.ajax({
        url : '/smartscape/get_selection_raster',
        type : 'POST',
        data : {
            geometry:{
                // this is the aoi extent; saved to appcontainer local storage
                extent:this.state.extent,
//                field_coors:this.state.coors
            }
        },
        success: (response, opts) => {
            delete $.ajaxSetup().headers
            console.log("raster loaded");
            console.log(response);
            this.setState({boundaryRasterId:response.folder_id})
            console.log(this.state)
        },

        failure: function(response, opts) {
        }
    });

  }
  // get display raster
  displaySelectionCriteria(selectionCrit){
    // ajax call with selection criteria
    console.log("launching ajax")
    console.log(this.props.activeTrans)
    console.log(selectionCrit)
    console.log(this.props.activeTrans.selection.field_coors.length)
    var csrftoken = Cookies.get('csrftoken');
    $.ajaxSetup({
        headers: { "X-CSRFToken": csrftoken }
    });
    $.ajax({
        url : '/smartscape/get_selection_criteria_raster',
        type : 'POST',
        data : {
            selectionCrit:selectionCrit,
            geometry:{
                extent:this.props.activeTrans.selection.extent,
                field_coors:this.props.activeTrans.selection.field_coors,
                field_coors_len:this.props.activeTrans.selection.field_coors.length
            },
            folderId: this.state.boundaryRasterId
        },
        success: (responses, opts) => {
            delete $.ajaxSetup().headers
            console.log(responses)
            let url = location.origin + "/smartscape/get_image?file_name="+responses[0]["url"]
            console.log(url)
            this.props.setActiveTransDisplay({'url':url, 'extents':responses[0]["extent"]})
//            let rasterLayerSource =
//            new Static({
//                url: location.origin + "/smartscape/get_image?file_name="+responses[0]["url"],
////                url: "get_image?file_name="+this.props.rasterUrl,
//                projection: 'EPSG:3857',
//                imageExtent: responses[0]["extent"]
////                imageExtent: [-10118831.03520702, 5369618.99185455, -10114083.11978821, 5376543.89851876],
//        })
        // setting state here will trigger componentDidUpdate in the map file
        // thus updating the raser layer source
//        this.setState({rasterLayer1:rasterLayerSource})
        },

        failure: function(response, opts) {
        }
    });
    // return url to image of raster
    // put image into raster layer
  }
  loadWatershed(){}
    render(){
        return(
          <div id='main'>
            <Header user = {user_info.user_name}
                text={this.state.text}
            />
            <div>
                <Row xs= '7' className = 'row-height'>
                  <Col xs='3' className='sidePanelCol'>
                    <SidePanel
                        text={this.state.text}
                        handleTextChange={this.handleTextChange}
                        loadSelectionRaster={this.loadSelectionRaster}
                        displaySelectionCriteria={this.displaySelectionCriteria}
                        testfun = {this.testfun}
                        handleAreaSelectionType = {this.handleAreaSelectionType }
                        addTrans = {this.addTrans}
                    />
                  </Col>
                  <Col xs='9' className = "sidePanelCol">
                    <OLMapFragment
                        rasterUrl={this.state.rasterUrl}
                        rasterExtents = {this.state.rasterExtents}
                        rasterLayer1 = {this.state.rasterLayer1}
                        handleBoundaryChange={this.handleBoundaryChange}
                        areaSelectionType = {this.state.areaSelectionType}
                    />
                   </Col>
                </Row>
            </div>
          </div>
        )


    }
}



export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppContainer);
