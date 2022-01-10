import React from 'react'
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar'
import Accordion from 'react-bootstrap/Accordion'
import Image from 'react-bootstrap/Image'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import CSRFToken from './csrf';
import Spinner from 'react-bootstrap/Spinner'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ListGroup from 'react-bootstrap/ListGroup'
import { DoorOpen,PlusLg } from 'react-bootstrap-icons';
import Stack from 'react-bootstrap/Stack'
import Table from './transformation/transformationTable.js'
import Modal from 'react-bootstrap/Modal'

import {Transformation} from './transformation/transformation.js'
import{setActiveTrans, addTrans,updateAreaSelectionType,updateActiveTransProps,
setVisibilityMapLayer} from '/src/stores/transSlice'
import { useSelector, useDispatch, connect  } from 'react-redux'
import { v4 as uuidv4 } from 'uuid';

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
    }
};
class SidePanel extends React.Component{
    constructor(props){
        super(props)
        this.user = props.user
//        this.loadSelectionRaster = this.loadSelectionRaster.bind(this);
        this.displaySelectionCriteria = this.displaySelectionCriteria.bind(this);
        this.runModels = this.runModels.bind(this);
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        this.tabControl = this.tabControl.bind(this);
        this.addTrans = this.addTrans.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleOpenModalBase = this.handleOpenModalBase.bind(this);
        // selection criteria
        this.slope1 = React.createRef();
        this.slope2 = React.createRef();
        this.contCorn = React.createRef();
        this.cashGrain = React.createRef();
        this.dairy = React.createRef();
        this.potato = React.createRef();
        this.cranberry = React.createRef();
        this.hay = React.createRef();
        this.pasture = React.createRef();
        this.grasslandIdle = React.createRef();

        this.selectWatershed = React.createRef();
        this.state = {slope:{slope1:null, slope2:null},
            geometry:{extents:[],coords:[]},
//            newTrans:new Transformation("intial",-1,-1),
            activeTrans:null,
            selectWatershed:false,
            baseModelShow:false,
        }
    }
    // fires anytime state or props are updated
    componentDidUpdate(prevProps) {
        console.log("side pannel update")
        console.log(prevProps)
        if(prevProps.activeTrans.id != this.props.activeTrans.id){
            this.setState({selectWatershed:false})
        }
        // set selection criteria to active scenario
        this.slope1.current.value = this.props.activeTrans.selection.slope1
        this.slope2.current.value = this.props.activeTrans.selection.slope2
        // land use selection
        this.contCorn.current.checked = this.props.activeTrans.selection.landCover.contCorn
        this.cashGrain.current.checked = this.props.activeTrans.selection.landCover.cashGrain
        this.dairy.current.checked = this.props.activeTrans.selection.landCover.dairy
//        this.potato.current.checked = this.props.activeTrans.selection.potato
//        this.cranberry.current.checked = this.props.activeTrans.selection.cranberry
//        this.hay.current.checked = this.props.activeTrans.selection.hay
//        this.pasture.current.checked = this.props.activeTrans.selection.pasture
//        this.grasslandIdle.current.checked = this.props.activeTrans.selection.grasslandIdle


    }
      handleCloseModal(){
        this.setState({baseModalShow: false})
      }
      handleOpenModalBase(){
        this.setState({baseModalShow: true})
      }

    // triggered by button click and displays selection
    //TODO needs to be updated to work with new redux workflow
    displaySelectionCriteria(){
        console.log(this.state)
        console.log(this.slope1.current.value)
        console.log(this.state)
        this.props.displaySelectionCriteria()
//        this.setState({slope:{slope1: this.slope1.current.value, slope2: this.slope2.current.value}}, () => {
//          console.log("changing state")
//          console.log(this.state);
//          this.props.displaySelectionCriteria(this.state)
//        });
    }
    runModels(){
        this.props.runModels()
    }
    // activates the area selection tool
    handleAreaSelectionType(type, e){
        console.log("selection type", type, e)
//        this.props.handleAreaSelectionType(type)
        if(type === "watershed"){

            this.setState({selectWatershed:true})
        }
        else{
            this.setState({selectWatershed:false})
        }
        this.props.updateAreaSelectionType(type)
    }
    // type needs to match the selection name in transformation
    handleSelectionChange(type, e){
        console.log("Selection updated", type, e)
        console.log(e.currentTarget.value)
        console.log(e.currentTarget.checked)
        this.props.updateActiveTransProps({"name":type, "value":e.currentTarget.value, "type":"reg"})
        console.log(this.props)
    }
    handleSelectionChangeLand(type, e){
        console.log("Selection updated", type, e)
        console.log(e.currentTarget.value)
        console.log(e.currentTarget.checked)
        this.props.updateActiveTransProps({"name":type, "value":e.currentTarget.checked, "type":"land"})
        console.log(this.props)
    }
    // fires when we switch tab so we can download the work area rasters
  tabControl(e){
    console.log(e)
    if(e !== "aoi"){
        // get bounds of current selection method and start downloading
        this.props.loadSelectionRaster()
        // turn off huc 10
        this.props.setVisibilityMapLayer({'name':'huc10', 'visible':false})
        this.props.setVisibilityMapLayer({'name':'huc12', 'visible':true})
    }
    else{
        this.props.setVisibilityMapLayer({'name':'huc10', 'visible':true})
        this.props.setVisibilityMapLayer({'name':'huc12', 'visible':false})
    }
  }
  addTrans(){
    console.log("add new transformation!")
    // example transformation
    // random id from 1 to 100
    let tempId = uuidv4();

    let newTrans = Transformation("test trans",tempId, 5)
    this.props.addTrans(newTrans)
//    this.props.setActiveTrans(newTrans)
  }
    render(){
        return(
        <Container className='side_pannel_style'>
            <h4>Selection Parameters</h4>
            <Container className='progress_bar'>
              <ProgressBar variant="success" now={40} label='Progress'/>
            </Container>
              <Tabs defaultActiveKey="aoi" id="uncontrolled-tab-example" className="mb-3" onSelect={(e) => this.tabControl(e)}>
              <Tab eventKey="aoi" title="Area of Interest">
              <Row>
                     <h4>Select a work area</h4>
                   <InputGroup size="sm" className="mb-3">
                   <Form.Check
                    inline
                    label="Select Watersheds"
                    name="group1"
                    type='radio'
                    id={`inline-$'radio'-1`}
                    onChange={(e) => this.handleAreaSelectionType("watershed", e)}
                  />
                  </InputGroup>
                  <h6>*All land transformations must reside in the work area</h6>
              </Row>
              {/*
              <Row>
                  <Form.Check
                    inline
                    label="Draw Polygon"
                    name="group1"
                    type='radio'
                    id={`inline-$'radio'-2`}
                    onChange={(e) => this.handleAreaSelectionType("polygon", e)}

                  />
              </Row>

              <Row>
                  <Form.Check
                    inline
    //                disabled
                    label="Draw Box"
                    name="group1"
                    type='radio'
                    id={`inline-$'radio'-3`}
                    onChange={(e) => this.handleAreaSelectionType("box", e)}

                  />
              </Row>
              */}
              </Tab>
              <Tab eventKey="selection" title="Selection">
              <h4>Build Scenario</h4>
              <h6>Land Transformations</h6>
              <Stack gap={3}>

              <Button size="sm" variant="primary" onClick={this.addTrans}><PlusLg/></Button>
                <Table
                />
              </Stack>
              <Form.Label>Selection Criteria</Form.Label>
                <Accordion>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Sub Area</Accordion.Header>
                    <Accordion.Body>
                      <Row>
                           <Form.Check
                            inline
                            label="Select Watersheds"
                            ref={this.selectWatershed}
                            checked={this.state.selectWatershed}
                            name="group2"
                            type='radio'
//                            id={`inline-$'radio'-1`}
                            onChange={(e) => this.handleAreaSelectionType("watershed", e)}
                          />
                            <Button variant="secondary" onClick={(e) => this.handleAreaSelectionType("none", e)}>
                            Stop Selection
                          </Button>
                      </Row>
                      {/*
                      <Row>
                          <Form.Check
                            inline
                            label="Draw Polygon"
                            name="group1"
                            type='radio'
                            id={`inline-$'radio'-2`}
                            onChange={(e) => this.handleAreaSelectionType("polygon", e)}

                          />
                      </Row>
                      */}
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
                <Accordion>
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>Slope</Accordion.Header>
                    <Accordion.Body>
                        <Form.Label>Slope Range</Form.Label>
                          <InputGroup size="sm" className="mb-3">
                            <FormControl
                              ref={this.slope1}
                              placeholder=""
                              aria-label="Username"
                              aria-describedby="basic-addon1"
                              onChange={(e) => this.handleSelectionChange("slope1", e)}

                            />
                            <InputGroup.Text>%</InputGroup.Text>
                            <Form.Select aria-label="Default select example">
                              <option value="<">&lt;</option>
                              <option value="<=">&#60;&#61;</option>
                            </Form.Select>
                            <FormControl
                              ref={this.slope2}
                              placeholder=""
                              aria-label="Username"
                              aria-describedby="basic-addon1"
                              onChange={(e) => this.handleSelectionChange("slope2", e)}

                            />
                            <InputGroup.Text>%</InputGroup.Text>
                          </InputGroup>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                <Accordion>
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>Distance to Stream</Accordion.Header>
                    <Accordion.Body>
                        <Form.Label>Slope Range</Form.Label>

                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                <Accordion>
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>Land Type</Accordion.Header>
                    <Accordion.Body>
                        <Form.Label>Land Type to Select</Form.Label>
                        <Form>
                          <Form.Check
                            ref={this.contCorn} type="switch" label="Continuous Corn"
                            onChange={(e) => this.handleSelectionChangeLand("contCorn", e)}
                          />
                          <Form.Check
                            ref={this.cashGrain} type="switch" label="Cash Grain"
                            onChange={(e) => this.handleSelectionChangeLand("cashGrain", e)}
                          />
                          <Form.Check
                            ref={this.dairy} type="switch" label="Dairy Rotation"
                            onChange={(e) => this.handleSelectionChangeLand("dairy", e)}
                          />


                        </Form>

                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                 <Button onClick={this.displaySelectionCriteria} variant="primary">Display Selection</Button>

                 <Button onClick={this.runModels} variant="primary">Run Transformations</Button>
                 <Button onClick={this.handleOpenModalBase} variant="primary">Base Parameters</Button>
                                  {/*
                             <Button onClick={this.displaySelectionCriteria} variant="primary">Clear Selections</Button>

            <Button variant="primary" disabled>
                <Spinner
                  as="span"
                  animation="grow"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                Loading...
              </Button>
              */}
              </Tab>
            </Tabs>
            <Modal size="lg" show={this.state.baseModalShow} onHide={this.handleCloseModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Base Model Parameters</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {/*
                    transform to: pasture
                    cover crop
                    tillage
                    contour
                    manure and fertilizier
                  */}
                    <Form.Label>Cover Crop</Form.Label>
                    <Form.Select aria-label="Default select example" value={4}>
                      <option>Open this select menu</option>
                      <option value="1">Small Grain</option>
                      <option value="2">Grazed Cover Direct Seeded</option>
                      <option value="3">Grazed Cover Interseeded</option>
                      <option value="4">No Cover</option>
                    </Form.Select>
                    <Form.Label>Tillage</Form.Label>
                    <Form.Select aria-label="Default select example" value={6}>
                      <option>Open this select menu</option>
                      <option value="1">Fall Chisel</option>
                      <option value="2">Fall Moldboard</option>
                      <option value="3">No Till</option>
                      <option value="4">Spring Chisel, Disked</option>
                      <option value="5">Spring Chisel, No Disk</option>
                      <option value="6">Spring Cultivation</option>
                      <option value="7">Spring Vertical</option>
                    </Form.Select>
                    <Row>
                      <Form.Label>On Contour</Form.Label>
                      <Form.Check
                        inline
                        label="Yes"
                        name="group2"
                        type="radio"
                        checked={true}
                      />
                      <Form.Check
                        inline
                        label="No"
                        name="group2"
                        type="radio"

                      />
                      </Row>
                      {/*
                    transform to: pasture
                    cover crop
                    tillage
                    contour
                    manure and fertilizier

                      <Col xs="9">
                          <Form.Range
                            value={value}
                            onChange={e => setValue(e.target.value)}
                          />
                        </Col>
                        <Col xs="3">
                          <Form.Control value={value}/>
                          <Form.Control value= {value}/>
                        </Col>
                         */}
                      <Form.Label>Manure/ Synthetic Fertilization Options</Form.Label>
                     <Form.Select aria-label="Default select example" value={6}>
                      <option>Open this select menu</option>
                        <option value="1">0/	0</option>
                      <option value="2">0/	100</option>
                      <option value="3">100/	0</option>
                      <option value="4">150/	0</option>
                      <option value="5">200/	0</option>
                      <option value="6">25/	50</option>
                      <option value="7">50/	0</option>
                    </Form.Select>

                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={this.handleCloseModal}>
                    Close
                  </Button>
                </Modal.Footer>
            </Modal>

            </Container>
        )}
        }
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SidePanel)