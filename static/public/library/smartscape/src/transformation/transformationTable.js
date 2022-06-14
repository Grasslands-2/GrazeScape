import React, { Component } from "react";
import { useSelector, useDispatch, connect  } from 'react-redux'
import{setActiveTrans,updateTransList,removeTrans,updateActiveTransProps} from '/src/stores/transSlice'
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Button from 'react-bootstrap/Button';
import { DoorOpen,PlusLg,DashCircle, Sliders,ThreeDotsVertical,FillEyeFill,FillEyeSlashFill } from 'react-bootstrap-icons';
import {Transformation} from './transformation.js'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form';
import Overlay from 'react-bootstrap/Overlay'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import 'regenerator-runtime/runtime'

// reordering the table
let reorder = (list, startIndex, endIndex) => {
  let result = Array.from(list);
  console.log(result)
  let [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  let index = 0;
//  result[0].rank = 1;
  while (index < result.length) {
      result[index].boundaryLayerID = index
      index++;
    }
  return result;
};//

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightblue" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: '100%'
});

const mapStateToProps = state => {
    return{
        activeTrans: state.transformation.activeTrans,
        listTrans: state.transformation.listTrans,
}}

const mapDispatchToProps = (dispatch) => {
    return{
        setActiveTrans: (value)=> dispatch(setActiveTrans(value)),
        updateTransList: (value)=> dispatch(updateTransList(value)),
        removeTrans: (value)=> dispatch(removeTrans(value)),
        updateActiveTransProps: (type)=> dispatch(updateActiveTransProps(type)),
    }
};
class TransformationTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
        transModalShow:false,
        showPastureMang:true,
        showCover:false,
        showTillage:false,
        showCont:false,
        showGrassYield:true,
        showRotFreq:true,
        showTillageFC:false,
        showTillageFM:false,
        showTillageNT:true,
        showTillageSC:false,
        showTillageSN:true,
        showTillageSU:true,
        showTillageSV:false,
    };

    this.onDragEnd = this.onDragEnd.bind(this);
    this.handleOpenModalTrans = this.handleOpenModalTrans.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);

    this.selectTransClick = this.selectTransClick.bind(this);
    this.handleTransNameChange = this.handleTransNameChange.bind(this);
//    this.addTransformation = this.addTransformation.bind(this);
    this.removeTransformation = this.removeTransformation.bind(this);
    this.showModal = this.showModal.bind(this);

    this.rotationType = React.createRef();
    this.cover = React.createRef();
    this.tillage = React.createRef();
    this.density = React.createRef();
    this.contour = React.createRef();
    this.fertilizer = React.createRef();
    this.grassYield = React.createRef();
    this.rotFreq = React.createRef();
  }
  componentDidUpdate(prevProps) {
    console.log(prevProps)
    console.log(this.props)
//    if(prevProps.newTrans == undefined && this.props.newTrans == undefined){
//        console.log("no new trans")
//    }
//    else if(prevProps.newTrans == undefined && this.props.newTrans != undefined){
//        console.log("adding new trans")
//        this.addTransformation(this.props.newTrans)
//
//    }
//    else if(prevProps.newTrans.id != this.props.newTrans.id){
//        this.addTransformation(this.props.newTrans)
//    }
  }
    async handleOpenModalTrans(e){
        console.log("handling opening modal!!!!")
        console.log(e)
        // the modal will only open after the active trans has been set
        await this.selectTransClick(e)
        this.setState({transModalShow: true})
      }
    handleCloseModal(){
        this.setState({transModalShow: false})
      }
      showModal(){
        console.log("showing modal")
        this.rotationType.current.value = this.props.activeTrans.management.rotationType
        this.density.current.value = this.props.activeTrans.management.density
        this.fertilizer.current.value = this.props.activeTrans.management.fertilizer
        this.cover.current.value = this.props.activeTrans.management.cover
        this.tillage.current.value = this.props.activeTrans.management.tillage
        this.contour.current.value = this.props.activeTrans.management.contour
        this.grassYield.current.value = this.props.activeTrans.management.grassYield
        this.rotFreq.current.value = this.props.activeTrans.management.rotFreq
        this.handleTransMangement()
      }
      configureTillage(){
        let rot = this.rotationType.current.value
        let cover = this.cover.current.value
        let currentTill = this.tillage.current.value
        console.log("tillage")
        console.log(currentTill)
        console.log(this.tillage)
//        set all till disabled to start
        this.setState({
                showTillageFC:false,
                showTillageFM:false,
                showTillageNT:false,
                showTillageSC:false,
                showTillageSN:false,
                showTillageSU:false,
                showTillageSV:false,
            })

        this.tillage.current.value = "na"
        if (cover == "cc"){
            this.setState({
                showTillageNT:true,
                showTillageSU:true,
            })
            if (rot == "dairyRotation"){
                this.setState({
                    showTillageSC:true

                })
            }
            else{
                this.setState({
                    showTillageSN:true,
                })
            }
        }
        else if (cover == "nc"){
            this.setState({
                showTillageFC:true,
                showTillageFM:true,
                showTillageNT:true,
                showTillageSN:true,
                showTillageSU:true,
                showTillageSV:true,
            })

        }
        else if (cover == "gcis"){
        this.setState({
                showTillageNT:true,
                showTillageSC:true,
                showTillageSU:true,
            })
        }
        else if (cover == "gcds"){
            this.setState({
                    showTillageNT:true,
                    showTillageSC:true,
                    showTillageSU:true,
                })
            }
        console.log(this.state["showTillage" + currentTill.toUpperCase()])
        console.log("showTillage" + currentTill.toUpperCase())

        console.log(this.state)
//        if(this.state["showTillage" + currentTill.toUpperCase()] == true){
//            this.tillage.current.value = currentTill
//        }

      }

      handleTransMangement(){
      //      turn off all pasture options

        if(this.rotationType.current.value != "pasture"){
            this.setState({
                showPastureMang:false,
                showGrassYield:false,
                showRotFreq:false,
                showCover:true,
                showTillage:true,
                showCont:true,
            })
//            configure tillage options

            }
//        turn on pasture options
        else{

         this.setState({
                showPastureMang:true,
                showGrassYield:true,
                showCover:false,
                showTillage:false,
                showCont:false,
            })
//          only show rotational freq if rotational options is selected
            if(this.density.current.value == "rt_rt"){
                this.setState({showRotFreq:true})
            }
            else{
                this.setState({showRotFreq:false})
            }
//            handle tillage display

        }
        if(this.cover.current.value != this.props.activeTrans.management.cover ||
        this.rotationType.current.value != this.props.activeTrans.management.rotationType){
            this.configureTillage()
        }

      }
    handleSelectionChange(type, e){
         this.handleTransMangement()
//      update active transformation with new value
        this.props.updateActiveTransProps({"name":type, "value":e.currentTarget.value, "type":"mang"})
        }

    handleSelectionChangeRadio(type, e){
        this.props.updateActiveTransProps({"name":type, "value":e.currentTarget.checked, "type":"mang"})
    }
  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    console.log(result)
    // deep copy seems to be the only one to make this work
    let list = JSON.parse(JSON.stringify(this.props.listTrans))
    let items = reorder(
      list,
      result.source.index,
      result.destination.index
    );
    this.props.updateTransList(items);
  }

  selectTransClick(e){
    return new Promise((resolve) => {
        let removeTransId = e.currentTarget.id
        let items = this.props.listTrans
        for(let trans in items){
            if(items[trans].id == removeTransId){
                this.props.setActiveTrans(items[trans])
                // pull in the selection parameters from current trans
                console.log(this.props.activeTrans)
                   resolve();
            }
        }
    });
  }
  handleTransNameChange(e){

    this.props.updateActiveTransProps({"name":"name", "value":e.currentTarget.value, "type":"base"})

  }

//  addTransformation(newTrans){
//    let items = this.state.items
//    items.push(newTrans)
//    this.setState({
//      items:items
//    });
//  }
  removeTransformation(e){
    console.log(e.currentTarget)
    console.log(e.currentTarget.id)
    let removeTransId = e.currentTarget.id
    this.props.removeTrans(removeTransId)
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  //https://egghead.io/lessons/react-reorder-a-list-with-react-beautiful-dnd
  render() {
    return (
    <div>
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {this.props.listTrans.map((item1, index) => (

                <Draggable key={item1.id} draggableId={item1.id} index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                    <div >
                    <InputGroup  size="sm" draggable="true">
                        {/*<Form.Label size="sm" className={this.props.activeTrans.id === item1.id && 'active1 test1' } id={item1.id} onClick={this.selectTransClick}><ThreeDotsVertical/></Form.Label>*/}
                        <OverlayTrigger key="top1" placement="top"
                            overlay={<Tooltip>Land Transformation Priority</Tooltip>}>
                            <Form.Label size="sm" className={this.props.activeTrans.id === item1.id && 'active1 test1' } id={item1.id} onClick={this.selectTransClick}>&nbsp;&nbsp;{index +1}&nbsp;&nbsp;</Form.Label>
                        </OverlayTrigger>
                        <Form.Control placeholder="Enter Name..." id={item1.id} className={ this.props.activeTrans.id === item1.id && 'active1' } onChange={this.handleTransNameChange} onClick={this.selectTransClick} />
                        <OverlayTrigger key="top" placement="top"
                          overlay={<Tooltip>Set Transformation</Tooltip>}>
                            <Button size="sm" variant="primary" id={item1.id} onClick={this.handleOpenModalTrans}><Sliders/></Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top"
                          overlay={<Tooltip>Delete Selection</Tooltip>}>
                            <Button size="sm" id={item1.id} variant="danger" onClick={this.removeTransformation}><DashCircle/></Button>
                         </OverlayTrigger>
                      </InputGroup>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
              <Modal size="lg" show={this.state.transModalShow} onHide={this.handleCloseModal} onShow={this.showModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Transformation Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                                      {/*
                    transform to: pasture
                    cover crop
                    tillage
                    contour
                    manure and fertilizier
                  */}
                  <Form.Label>New Land Cover</Form.Label>
                    <Form.Select aria-label="Default select example" ref={this.rotationType}
                      onChange={(e) => this.handleSelectionChange("rotationType", e)}>
                      <option value="pasture">Pasture</option>
                      <option value="contCorn">Continuous Corn</option>
                      <option value="cornGrain">Cash Grain</option>
                      <option value="dairyRotation">Corn Silage to Corn Grain to Alfalfa(3x)</option>
                      {/*<option value="ps">Pasture Seeding</option>*/}
                    </Form.Select>

                    <Form.Label hidden={!this.state.showGrassYield}>Grass Yield</Form.Label>
                    <Form.Select aria-label="Default select example" hidden={!this.state.showGrassYield} ref={this.grassYield}
                      onChange={(e) => this.handleSelectionChange("grassYield", e)}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Form.Select>

                    <Form.Label hidden={!this.state.showPastureMang}>Pasture Management</Form.Label>
                    <Form.Select aria-label="Default select example" hidden={!this.state.showPastureMang} ref={this.density}
                      onChange={(e) => this.handleSelectionChange("density", e)}>
                      <option value="cn_hi">Continuous High Density</option>
                      <option value="cn_lo">Continuous Low Density</option>
                      <option value="rt_rt">Rotational</option>
                    </Form.Select>

                    <Form.Label hidden={!this.state.showRotFreq}>Rotational Frequency</Form.Label>
                    <Form.Select aria-label="Default select example" hidden={!this.state.showRotFreq} ref={this.rotFreq}
                      onChange={(e) => this.handleSelectionChange("rotFreq", e)}>
                      <option value="1.2">More then once a day</option>
                      <option value="1">Once a day</option>
                      <option value="0.95">Every 3 days</option>
                      <option value="0.75">Every 7 days</option>
                    </Form.Select>

                    <Form.Label hidden={!this.state.showCover}>Cover Crop</Form.Label>
                    <Form.Select aria-label="Default select example" hidden={!this.state.showCover} ref={this.cover}
                      onChange={(e) => this.handleSelectionChange("cover", e)}>
                      <option value="cc">Small Grain</option>
                      <option value="gcds">Grazed Cover Direct Seeded</option>
                      <option value="gcis">Grazed Cover Interseeded</option>
                      <option value="nc">No Cover</option>
                    </Form.Select>

                    <Form.Label hidden={!this.state.showTillage} >Tillage</Form.Label >
                    <Form.Select aria-label="Default select example" hidden={!this.state.showTillage} ref={this.tillage}
                    onChange={(e) => this.handleSelectionChange("tillage", e)}>
                      <option disabled={!this.state.showTillageFC} value="fc">Fall Chisel</option>
                      <option disabled={!this.state.showTillageFM} value="fm">Fall Moldboard</option>
                      <option disabled={!this.state.showTillageNT} value="nt">No Till</option>
                      <option disabled={!this.state.showTillageSC} value="sc">Spring Chisel, Disked</option>
                      <option disabled={!this.state.showTillageSN} value="sn">Spring Chisel, No Disk</option>
                      <option disabled={!this.state.showTillageSU} value="su">Spring Cultivation</option>
                      <option disabled={!this.state.showTillageSV} value="sv">Spring Vertical</option>
                      <option value="na">Please Select a Value</option>
                    </Form.Select>

                    <Form.Label hidden={!this.state.showCont}>On Contour</Form.Label >
                    <Form.Select aria-label="Default select example" hidden={!this.state.showCont} ref={this.contour}
                      onChange={(e) => this.handleSelectionChange("contour", e)}>
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </Form.Select>
                    <Form.Label>Manure/ Synthetic Fertilization Options</Form.Label>
                     <Form.Select aria-label="Default select example" ref={this.fertilizer}
                      onChange={(e) => this.handleSelectionChange("fertilizer", e)}>
                      <option value="0_0">0/	0</option>
                      <option value="0_100">0/	100</option>
                      <option value="100_0">100/	0</option>
                      <option value="150_0">150/	0</option>
                      <option value="200_0">200/	0</option>
                      <option value="25_50">25/	50</option>
                      <option value="50_0">50/	0</option>
                      <option value="50_50">50/	50</option>
                    </Form.Select>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={this.handleCloseModal}>
                    Save
                  </Button>
                </Modal.Footer>
            </Modal>
      </div>
    );
  }
}

// Put the thing into the DOM!
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TransformationTable)
