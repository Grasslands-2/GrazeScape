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
import ListGroup from 'react-bootstrap/ListGroup'
import { DoorOpen,PlusLg } from 'react-bootstrap-icons';
import Stack from 'react-bootstrap/Stack'
import Table from './transformation/transformationTable.js'
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
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        this.tabControl = this.tabControl.bind(this);
        this.addTrans = this.addTrans.bind(this);
        this.slope1 = React.createRef();
        this.slope2 = React.createRef();
        this.selectWatershed = React.createRef();
        this.state = {slope:{slope1:null, slope2:null},
            geometry:{extents:[],coords:[]},
//            newTrans:new Transformation("intial",-1,-1),
            activeTrans:null,
            selectWatershed:false
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
    }
    // triggered by button click and displays selection
    //TODO needs to be updated to work with new redux workflow
    displaySelectionCriteria(){
        console.log(this.state)
        console.log(this.slope1.current.value)
        console.log(this.state)
        this.setState({slope:{slope1: this.slope1.current.value, slope2: this.slope2.current.value}}, () => {
          console.log("changing state")
          console.log(this.state);
          this.props.displaySelectionCriteria(this.state)
        });
    }
    // activates the area selection tool
    handleAreaSelectionType(type, e){
        console.log("selection type", type, e)
//        this.props.handleAreaSelectionType(type)
        this.setState({selectWatershed:true})
        this.props.updateAreaSelectionType(type)
    }
    // type needs to match the selection name in transformation
    handleSelectionChange(type, e){
        console.log("Slope1", type, e)
        console.log(e.currentTarget.value)
        this.props.updateActiveTransProps({"name":type, "value":e.currentTarget.value})
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
    //TODO update this to have only unqiue ids!!!!
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
                        <Form.Label>Slope Range</Form.Label>

                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                 <Button onClick={this.displaySelectionCriteria} variant="primary">Display Selection</Button>
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

            </Container>
        )}
        }
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SidePanel)