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
import Modal from 'react-bootstrap/Modal'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Table from 'react-bootstrap/Table'
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
setVisibilityMapLayer,setActiveTransDisplay, updateActiveBaseProps} from '/src/stores/transSlice'
import{setActiveRegion, setAoiFolderId} from '/src/stores/mainSlice'
import { useSelector, useDispatch, connect  } from 'react-redux'
import { v4 as uuidv4 } from 'uuid';

const mapStateToProps = state => {
    console.log("mapping sidepannel")
    return{
        activeTrans: state.transformation.activeTrans,
        listTrans:state.transformation.listTrans,
        baseTrans:state.transformation.baseTrans,
        region:state.main.region,

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
        updateActiveBaseProps: (type)=> dispatch(updateActiveBaseProps(type)),
        setActiveRegion: (type)=> dispatch(setActiveRegion(type)),
        setAoiFolderId: (type)=> dispatch(setAoiFolderId(type)),

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


    this.modelPloss = React.createRef();
    this.basePloss = React.createRef();
//    set base line parameters to default values
    this.props.updateActiveBaseProps({"name":"cover", "value":"nc", "type":"mang"})
    this.props.updateActiveBaseProps({"name":"tillage", "value":"su", "type":"mang"})
    this.props.updateActiveBaseProps({"name":"contour", "value":"1", "type":"mang"})
    this.props.updateActiveBaseProps({"name":"fertilizer", "value":"25_50", "type":"mang"})


    this.state = {
        text: '',
        rasterUrl: "",
        rasterExtents: "",
        rasterLayer1:this.rasterLayer1,
        extent:[],
        areaSelectionType:"",
        boundaryRasterId:"",
        coors:[],

        basePloss: "hello world",
        modelPloss: "hello world",
        baseEro: "hello world",
        modelEro: "hello world",
        modelOutputs: {},

//        newTrans:new Transformation("intial",-1,-1)
        };
  }
componentDidUpdate(prevProps) {
    console.log(prevProps)
    console.log(this.props)
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
  componentDidMount(){
    console.log("compoenet mounted")
    this.props.setActiveRegion("testing region set")
  }
  // load rasters for aoi in background
  loadSelectionRaster(){
     // ajax call with selection criteria
    let tempId = uuidv4();

    let newTrans = Transformation("test trans",tempId, 5)
    this.props.setActiveTrans(newTrans)
    this.props.addTrans(newTrans)

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
            this.props.setAoiFolderId(response.folder_id)
            console.log(this.state)
            alert("Raster loaded")
        },

        failure: function(response, opts) {
        }
    });

  }
  // get display raster from active transformation
  displaySelectionCriteria(){
    // ajax call with selection criteria
    console.log(this.props.activeTrans)
    let transPayload = JSON.parse(JSON.stringify(this.props.activeTrans))
    console.log(transPayload)
    var csrftoken = Cookies.get('csrftoken');
    $.ajaxSetup({
        headers: { "X-CSRFToken": csrftoken }
    });
    $.ajax({
        url : '/smartscape/get_selection_criteria_raster',
        type : 'POST',
        data : JSON.stringify({
//            selectionCrit:selectionCrit,
            selectionCrit:transPayload,
            geometry:{
                extent:this.props.activeTrans.selection.extent,
                field_coors:this.props.activeTrans.selection.field_coors,
                field_coors_len:this.props.activeTrans.selection.field_coors.length
            },
            folderId: this.state.boundaryRasterId,
            transId: this.props.activeTrans.id
        }),
        success: (responses, opts) => {
            delete $.ajaxSetup().headers
            console.log(responses)
            let url = location.origin + "/smartscape/get_image?file_name="+responses[0]["url"]+ "&time="+Date.now()
            console.log(url)
            this.props.setActiveTransDisplay({'url':url, 'extents':responses[0]["extent"],'transId':responses[0]["transId"]})
        },

        failure: function(response, opts) {
        }
    });

    // return url to image of raster
    // put image into raster layer
  }

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
