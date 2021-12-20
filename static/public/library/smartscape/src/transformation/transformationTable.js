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



// fake data generator
//https://www.w3schools.com/js/js_arrow_function.asp
let getItems = count =>
//    console.log(count)
//  Array.from({ length: count }, (v, k) => k).map(k => ({
//    id: `item-${k}`,
//    content: `Transformation ${k}`,
//    transformation: new Transformation(`Transformation ${k}`,`${k}`)
//  }));

  Array.from({ length: count }, (v, k) => k).map(k => (
     Transformation(`Transformation ${k}`,`${k}`,`${k}`)
  ));
//const add_trans = () =>{
//    console.log("adding new trans")
//    let newItem = {id:"4", content:"transform 5", transformation:new Transformation('test1',5)}
//    let items = this.state.items
//    items.push(newItem)
//    this.setState({
//      items
//    });
//}
// a little function to help us with reordering the result
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
    };

    this.onDragEnd = this.onDragEnd.bind(this);
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
                            <Button size="sm" variant="primary" id={item1.id} onClick={this.selectTransClick}><Sliders/></Button>
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
    );
  }
}

// Put the thing into the DOM!
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Table)
