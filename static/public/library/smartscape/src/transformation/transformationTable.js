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
class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
        transModalShow:false,
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
    //        this.cover.current.value = this.props.activeTrans.management.cover
    //        this.tillage.current.value = this.props.activeTrans.management.tillage
    //        this.contour.current.value = this.props.activeTrans.management.contour

      }
    handleSelectionChange(type, e){
        this.props.updateActiveTransProps({"name":type, "value":e.currentTarget.value, "type":"mang"})    }
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
    console.log(e.currentTarget)
    console.log("name change")
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
                        <OverlayTrigger key="top" placement="top"
                            overlay={<Tooltip>Land Transformation Priority</Tooltip>}>
                            <Form.Label size="sm" className={this.props.activeTrans.id === item1.id && 'active1 test1' } id={item1.id} onClick={this.selectTransClick}>&nbsp;&nbsp;{index +1}&nbsp;&nbsp;</Form.Label>
                        </OverlayTrigger>
                        <Form.Control placeholder="Selection Name" id={item1.id} className={ this.props.activeTrans.id === item1.id && 'active1' } onChange={this.handleTransNameChange} onClick={this.selectTransClick} />
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
                  <Form.Label>New Land Cover</Form.Label>
                    <Form.Select aria-label="Default select example" ref={this.rotationType}
                      onChange={(e) => this.handleSelectionChange("rotationType", e)}>
                      <option value="default">Open this select menu</option>
                      <option value="pt">Pasture</option>
                      {/*<option value="ps">Pasture Seeding</option>*/}
                    </Form.Select>
                    <Form.Label>Pasture Animal Density</Form.Label>
                    <Form.Select aria-label="Default select example" ref={this.density}
                      onChange={(e) => this.handleSelectionChange("density", e)}>
                      <option value="default">Open this select menu</option>
                      <option value="cn_hi">High</option>
                      <option value="cn_lo">Low</option>
                      <option value="rt_rt">Rotational</option>
                    </Form.Select>
                    <Form.Label>Manure/ Synthetic Fertilization Options</Form.Label>
                     <Form.Select aria-label="Default select example" ref={this.fertilizer}
                      onChange={(e) => this.handleSelectionChange("fertilizer", e)}>

                      <option value="default">Open this select menu</option>
                      <option value="0_0">0/	0</option>
                      <option value="0_100">0/	100</option>
                      <option value="100_0">100/	0</option>
                      <option value="150_0">150/	0</option>
                      <option value="200_0">200/	0</option>
                      <option value="25_50">25/	50</option>
                      <option value="50_0">50/	0</option>
                    </Form.Select>
                    {/*
                    <Form.Label>Cover Crop</Form.Label>
                    <Form.Select aria-label="Default select example" ref={this.cover}
                      onChange={(e) => this.handleSelectionChange("cover", e)}>
                      <option value="default">Open this select menu</option>
                      <option value="cc">Small Grain</option>
                      <option value="gcds">Grazed Cover Direct Seeded</option>
                      <option value="gcis">Grazed Cover Interseeded</option>
                      <option value="nc">No Cover</option>
                      <option value="na">NA</option>
                    </Form.Select>
                    <Form.Label>Tillage</Form.Label>
                    <Form.Select aria-label="Default select example" ref={this.tillage}
                    onChange={(e) => this.handleSelectionChange("tillage", e)}>

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
                      onChange={(e) => this.handleSelectionChange("contour", e)}>
                      <option value="default">Open this select menu</option>
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                      <option value="na">N/A</option>
                    </Form.Select>

                    */}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={this.handleCloseModal}>
                    Close
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
)(Table)
