import React, { Component } from "react";
import { useSelector, useDispatch, connect  } from 'react-redux'
import{setActiveTrans,updateTransList,removeTrans} from '/src/stores/transSlice'
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

    this.selectTransClick = this.selectTransClick.bind(this);
    this.handleTransNameChange = this.handleTransNameChange.bind(this);
//    this.addTransformation = this.addTransformation.bind(this);
    this.removeTransformation = this.removeTransformation.bind(this);
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
    handleOpenModalTrans(){
        this.setState({transModalShow: true})
      }
            handleCloseModal(){
        this.setState({transModalShow: false})
      }
  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    console.log(result)
    // deep copy seems to be the only one to make this work
    let list = JSON.parse(JSON.stringify(this.props.listTrans))
//    const list = this.state.items
//    list[0].boundaryLayerID = 99
    let items = reorder(
      list,
      result.source.index,
      result.destination.index
    );
    this.props.updateTransList(items);
  }

  selectTransClick(e){
    console.log("I'm clicked")
    console.log(this.state)
    console.log(this.props)
    let removeTransId = e.currentTarget.id
    console.log(this.state.items)
    let items = this.props.listTrans
    for(let trans in items){
        console.log(items[trans])
        if(items[trans].id == removeTransId){
            console.log("setting active trans")
            console.log(items)
            this.props.setActiveTrans(items[trans])
            // pull in the selection parameters from current trans
            console.log(this.props.activeTrans)
            return
        }
    }
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
                        <Form.Label size="sm" className={this.props.activeTrans.id === item1.id && 'active1 test1' } id={item1.id} onClick={this.selectTransClick}><ThreeDotsVertical/></Form.Label>
                        <Form.Control placeholder="Enter name" id={item1.id} className={ this.props.activeTrans.id === item1.id && 'active1' } onChange={this.handleTransNameChange} onClick={this.selectTransClick} />
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
                  <Modal size="lg" show={this.state.transModalShow} onHide={this.handleCloseModal}>
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
                  <Row>
                  <Form.Label>New Land Cover</Form.Label>
                  <Form.Check
                    inline
                    label="Pasture"
                    name="group1"
                    type="radio"
                    checked={true}
                  />
                  <Form.Check
                    inline
                    label="Pasture Seeding"
                    name="group1"
                    type="radio"
                  />
                  </Row>
                    <Form.Label>Cover Crop</Form.Label>
                    <Form.Select aria-label="Default select example" value={5}>
                      <option>Open this select menu</option>
                      <option value="1">Small Grain</option>
                      <option value="2">Grazed Cover Direct Seeded</option>
                      <option value="3">Grazed Cover Interseeded</option>
                      <option value="4">No Cover</option>
                      <option value="5">NA</option>
                    </Form.Select>
                    <Form.Label>Tillage</Form.Label>
                    <Form.Select aria-label="Default select example" value={8}>
                      <option>Open this select menu</option>
                      <option value="1">Fall Chisel</option>
                      <option value="2">Fall Moldboard</option>
                      <option value="3">No Till</option>
                      <option value="4">Spring Chisel, Disked</option>
                      <option value="5">Spring Chisel, No Disk</option>
                      <option value="6">Spring Cultivation</option>
                      <option value="7">Spring Vertical</option>
                      <option value="8">NA</option>
                    </Form.Select>
                    <Form.Label>Pasture Animal Density</Form.Label>
                    <Form.Select aria-label="Default select example" value={3}>
                      <option>Open this select menu</option>
                      <option value="1">High</option>
                      <option value="2">Low</option>
                      <option value="3">Rotational</option>
                    </Form.Select>
                    <Row>
                      <Form.Label>On Contour</Form.Label>
                      <Form.Check
                        inline
                        label="Yes"
                        name="group2"
                        type="radio"
                      />
                      <Form.Check
                        inline
                        label="No"
                        name="group2"
                        type="radio"

                      />
                       <Form.Check
                        inline
                        label="NA"
                        name="group2"
                        type="radio"
                        checked={true}


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
                     <Form.Select aria-label="Default select example" value={1}>
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
      </div>
    );
  }
}

// Put the thing into the DOM!
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Table)
