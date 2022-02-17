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
setVisibilityMapLayer,updateActiveBaseProps} from '/src/stores/transSlice'
import { useSelector, useDispatch, connect  } from 'react-redux'
import { v4 as uuidv4 } from 'uuid';

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
        updateActiveBaseProps: (type)=> dispatch(updateActiveBaseProps(type)),
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
        this.showModal = this.showModal.bind(this);
        // selection criteria
        this.slope1 = React.createRef();
        this.slope2 = React.createRef();
        this.streamDist1 = React.createRef();
        this.streamDist2 = React.createRef();
        this.contCorn = React.createRef();
        this.cashGrain = React.createRef();
        this.dairy = React.createRef();
        this.potato = React.createRef();
        this.cranberry = React.createRef();
        this.hay = React.createRef();
        this.pasture = React.createRef();
        this.grasslandIdle = React.createRef();

        this.rotationType = React.createRef();
        this.cover = React.createRef();
        this.tillage = React.createRef();
        this.density = React.createRef();
        this.contour = React.createRef();
        this.fertilizer = React.createRef();

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
        this.streamDist1.current.value = this.props.activeTrans.selection.streamDist1
        this.streamDist2.current.value = this.props.activeTrans.selection.streamDist2
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
    showModal(){
        console.log("showing modal")
        console.log(this.props)
//        this.rotationType.current.value = this.props.baseTrans.management.rotationType
        this.cover.current.value = this.props.baseTrans.management.cover
        this.tillage.current.value = this.props.baseTrans.management.tillage
//        this.density.current.value = this.props.baseTrans.management.density
        this.contour.current.value = this.props.baseTrans.management.contour
        this.fertilizer.current.value = this.props.baseTrans.management.fertilizer

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
    updateActiveBaseProps(type, e){
        this.props.updateActiveBaseProps({"name":type, "value":e.currentTarget.value, "type":"mang"})
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
                 <h6> Please select a learning hub and then select one HUC 10 watershed </h6>
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
                        <InputGroup size="sm" className="mb-3">
                            <FormControl
                              ref={this.streamDist1}
                              placeholder=""
                              aria-label="Username"
                              aria-describedby="basic-addon1"
                              onChange={(e) => this.handleSelectionChange("streamDist1", e)}
                            />
                            <InputGroup.Text>m</InputGroup.Text>
                            <Form.Select aria-label="Default select example">
                              <option value="<">&lt;</option>
                              <option value="<=">&#60;&#61;</option>
                            </Form.Select>
                            <FormControl
                              ref={this.streamDist2}
                              placeholder=""
                              aria-label="Username"
                              aria-describedby="basic-addon1"
                              onChange={(e) => this.handleSelectionChange("streamDist2", e)}

                            />
                            <InputGroup.Text>m</InputGroup.Text>

                          </InputGroup>
                            <Form.Label>Units</Form.Label>
                            <Form>
                            <Form.Check
                                inline
                                label="feet"
                                name="group1"
                                type="radio"
                              />
                              <Form.Check
                                inline
                                label="meters"
                                name="group1"
                                type="radio"
                                checked={true}
                                onChange={(e) => this.handleSelectionChangeLand("contCorn", e)}
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
            <Modal size="lg" show={this.state.baseModalShow} onHide={this.handleCloseModal} onShow={this.showModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Transformation Results</Modal.Title>
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
                    <Form.Select aria-label="Default select example" ref={this.cover}
                      onChange={(e) => this.updateActiveBaseProps("cover", e)}>
                      <option value="default">Open this select menu</option>
                      <option value="cc">Small Grain</option>
                      <option value="gcds">Grazed Cover Direct Seeded</option>
                      <option value="gcis">Grazed Cover Interseeded</option>
                      <option value="nc">No Cover</option>
                      <option value="na">NA</option>
                    </Form.Select>
                    <Form.Label>Tillage</Form.Label>
                    <Form.Select aria-label="Default select example" ref={this.tillage}
                    onChange={(e) => this.updateActiveBaseProps("tillage", e)}>

                      <option value="default">Open this select menu</option>
                      <option value="fc">Fall Chisel</option>
                      <option value="fm">Fall Moldboard</option>
                      <option value="nt">No Till</option>
                      <option value="sc">Spring Chisel, Disked</option>
                      <option value="sn">Spring Chisel, No Disk</option>
                      <option value="su">Spring Cultivation</option>
                      <option value="sv">Spring Vertical</option>
                      <option value="na">NA</option>
                    </Form.Select>

                    <Form.Label>On Contour</Form.Label>
                    <Form.Select aria-label="Default select example" ref={this.contour}
                      onChange={(e) => this.updateActiveBaseProps("contour", e)}>
                      <option value="default">Open this select menu</option>
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                      <option value="na">N/A</option>
                    </Form.Select>
                     <Form.Label>Manure/ Synthetic Fertilization Options</Form.Label>
                     <Form.Select aria-label="Default select example" ref={this.fertilizer}
                      onChange={(e) => this.updateActiveBaseProps("fertilizer", e)}>

                      <option value="default">Open this select menu</option>
                      <option value="0_0">0/	0</option>
                      <option value="0_100">0/	100</option>
                      <option value="100_0">100/	0</option>
                      <option value="150_0">150/	0</option>
                      <option value="200_0">200/	0</option>
                      <option value="25_50">25/	50</option>
                      <option value="50_0">50/	0</option>
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