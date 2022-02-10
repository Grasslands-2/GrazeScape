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
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);
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
import { useSelector, useDispatch, connect  } from 'react-redux'

const mapStateToProps = state => {
    console.log("mapping sidepannel")
    return{
        activeTrans: state.transformation.activeTrans,
        listTrans:state.transformation.listTrans,
        baseTrans:state.transformation.baseTrans,

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
        outputModalShow: false,
        basePloss: "hello world",
        modelPloss: "hello world",
        baseEro: "hello world",
        modelEro: "hello world",
        modelOutputs: {},

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
    var labels = ['Yield', 'Erosion', 'Phosphours Lose', 'Curve Number', 'Runoff', 'Honey Bee Toxicity']
    console.log(this.state.modelOutputs)
    var data = {
  labels: labels,
  datasets: [
    {
      label: 'Base',
      data: [1,1,1,1,1,1],
      backgroundColor: 'rgba(238, 119, 51,.2)',
      borderColor: 'rgba(238, 119, 51,1)',
      borderWidth: 1,
    },
            {
      label: 'Transformation',
      data: [],
      backgroundColor: 'rgba(0, 119, 187,.2)',
      borderColor: 'rgba(0, 119, 187,1)',
      borderWidth: 1,
    },
  ],
};
    var data_bar = {
      labels: labels,
      datasets: [{
        axis: 'y',
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1
      }]
    };
    var options_bar = {
          indexAxis: 'y',
          elements: {
            bar: {
              borderWidth: 2,
            },
          },
          responsive: true,

        };

    if (this.state.modelOutputs.hasOwnProperty("base")){
        var data = {
          labels: labels,
          datasets: [
            {
              label: 'Base',
              data: [1,1,1,1,1,1

              ],
              backgroundColor: 'rgba(238, 119, 51,.2)',
              borderColor: 'rgba(238, 119, 51,1)',
              borderWidth: 1,
            },
                    {
              label: 'Transformation',
              data: [
                  this.state.modelOutputs.model.yield.total_per_area/this.state.modelOutputs.base.yield.total_per_area,
                  this.state.modelOutputs.model.ero.total_per_area/this.state.modelOutputs.base.ero.total_per_area,
                  this.state.modelOutputs.model.ploss.total_per_area/this.state.modelOutputs.base.ploss.total_per_area,
                  this.state.modelOutputs.model.cn.total_per_area/this.state.modelOutputs.base.cn.total_per_area,
                  this.state.modelOutputs.model.runoff.total_per_area/this.state.modelOutputs.base.runoff.total_per_area,
                  this.state.modelOutputs.model.insect.total_per_area/this.state.modelOutputs.base.insect.total_per_area,
              ],
              backgroundColor: 'rgba(0, 119, 187,.2)',
              borderColor: 'rgba(0, 119, 187,1)',
              borderWidth: 1,
            },
          ],
    };

    }

    return(
            <div>
             <Row xs= '13' >

                <Form.Label >
                  Base Scenario
                </Form.Label>
                <Col xs='6'>
                    <Form.Control  ref={this.basePloss} plaintext readOnly defaultValue={this.state.basePloss} />
                    <Form.Control plaintext readOnly defaultValue={this.state.baseEro} />
                </Col>
            </Row>
            <Form.Label >
              Transformation
            </Form.Label>
            <Form.Control plaintext readOnly defaultValue={this.state.modelPloss} />
            <Form.Control plaintext readOnly defaultValue={this.state.modelEro} />
            <Radar data={data}/>;
            <Bar options = {options_bar} data={data_bar}/>
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
//        give the transformations the correct ranking
        for(let trans in transPayload){
            transPayload[trans].rank = lengthTrans;
            lengthTrans--;
        }
        console.log(transPayload)
        console.log(this.props.baseTrans)
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
                base:this.props.baseTrans,
                folderId: this.state.boundaryRasterId,
                region: "southWestWI"
            }),
            success: (responses, opts) => {
                delete $.ajaxSetup().headers
                console.log(responses)
                this.setState({basePloss:"Phosphorus Loss: " + responses.base.ploss.total + " lb/year; "+ responses.base.ploss.total_per_area + " lb/year/ac"})
                this.setState({modelPloss:"Phosphorus Loss: " + responses.model.ploss.total + " lb/year; "+ responses.model.ploss.total_per_area + " lb/year/ac"})
                this.setState({baseEro:"Erosion: " + responses.base.ero.total + " tons/year; "+ responses.base.ero.total_per_area + " tons/year/ac"})
                this.setState({modelEro:"Erosion: " + responses.model.ero.total + " tons/year; "+ responses.model.ero.total_per_area + " tons/year/ac"})
//                this.setState({modelPloss:5555})
                this.setState({outputModalShow:true})
                this.setState({modelOutputs:responses})
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
