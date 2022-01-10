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
    this.runModels = this.runModels.bind(this);
    this.handleBoundaryChange = this.handleBoundaryChange.bind(this);
    this.handleAreaSelectionType = this.handleAreaSelectionType.bind(this);
    this.addTrans = this.addTrans.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.renderModal = this.renderModal.bind(this);

    this.modelPloss = React.createRef();
    this.basePloss = React.createRef();


    this.state = {
        text: '',
        rasterUrl: "",
        rasterExtents: "",
        rasterLayer1:this.rasterLayer1,
        extent:[],
        areaSelectionType:"",
        boundaryRasterId:"",
        coors:[],
        outputModalShow: false,
        basePloss: "hello world",
        modelPloss: "hello world",

//        newTrans:new Transformation("intial",-1,-1)
        };
  }

  handleTextChange(newText) {

    this.setState({text: newText});
  }
  handleCloseModal(){
    this.setState({outputModalShow: false})
  }
  handleOpenModal(){
      console.log(this.basePloss)
    this.setState({outputModalShow: true})
//    this.basePloss.current.value = "hello world"
  }
  renderModal(){

    return(
            <div>
             <Row xs= '13' >

                <Form.Label >
                  Base Scenario
                </Form.Label>
                <Col xs='6'>
                    <Form.Control  ref={this.basePloss} plaintext readOnly defaultValue={this.state.basePloss} />
                </Col>
            </Row>
            <Form.Label >
              Transformation
            </Form.Label>
            <Form.Control plaintext readOnly defaultValue={this.state.modelPloss} />
            </div>
    )
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
  }
  // load rasters for aoi in background
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
  runModels(){
        // ajax call with selection criteria
        console.log("Running models!!")
        let transPayload = JSON.parse(JSON.stringify(this.props.listTrans))
        let lengthTrans = transPayload.length
        for(let trans in transPayload){
            transPayload[trans].rank = lengthTrans;
            lengthTrans--;
        }
        console.log(transPayload)
        // add method to only grab required trans data and get the rank based on list order
        var csrftoken = Cookies.get('csrftoken');
        $.ajaxSetup({
            headers: { "X-CSRFToken": csrftoken }
        });
        $.ajax({
            url : '/smartscape/get_transformed_land',
            type : 'POST',
            data : JSON.stringify({
                trans: transPayload,
                folderId: this.state.boundaryRasterId,
            }),
            success: (responses, opts) => {
                delete $.ajaxSetup().headers
                console.log(responses)
                this.setState({basePloss:"Phosphorus Loss: " + responses.base.ploss.total + " lb/year; "+ responses.base.ploss.total_per_area + " lb/year/ac"})
                this.setState({modelPloss:"Phosphorus Loss: " + responses.model.ploss.total + " lb/year; "+ responses.model.ploss.total_per_area + " lb/year/ac"})
//                this.setState({modelPloss:5555})
                this.setState({outputModalShow:true})
            },

            failure: function(response, opts) {
            }
        })
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
                        runModels={this.runModels}
                        testfun = {this.testfun}
                        handleAreaSelectionType = {this.handleAreaSelectionType }
                        addTrans = {this.addTrans}
                    />
                        <Button variant="primary" onClick={this.handleOpenModal}>
        View Results
      </Button>
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


      <Modal size="lg" show={this.state.outputModalShow} onHide={this.handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Transformation Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>

            {this.renderModal()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleCloseModal}>
            Close
          </Button>

        </Modal.Footer>
      </Modal>
          </div>
        )


    }
}



export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppContainer);
