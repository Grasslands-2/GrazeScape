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
import TooltipBootstrap from 'react-bootstrap/Tooltip'
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import 'regenerator-runtime/runtime'
import Alert from 'react-bootstrap/Alert'
import RangeSlider from 'react-bootstrap-range-slider';
import Col from 'react-bootstrap/Col'
import Popover from 'react-bootstrap/Popover';


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
        baseTrans:state.transformation.baseTrans,
        aoiFolderId:state.main.aoiFolderId,
        region:state.main.region,

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
        tillageBlank:true,
    };

    this.onDragEnd = this.onDragEnd.bind(this);
    this.handleOpenModalTrans = this.handleOpenModalTrans.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleSelectionChangeGeneral = this.handleSelectionChangeGeneral.bind(this);
    this.handleNitrogenDefaults = this.handleNitrogenDefaults.bind(this);


    this.selectTransClick = this.selectTransClick.bind(this);
    this.handleTransNameChange = this.handleTransNameChange.bind(this);
//    this.addTransformation = this.addTransformation.bind(this);
    this.removeTransformation = this.removeTransformation.bind(this);
    this.getPhosValues = this.getPhosValues.bind(this);
    this.showModal = this.showModal.bind(this);
    this.testVisible = this.testVisible.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);

    this.rotationType = React.createRef();
    this.cover = React.createRef();
    this.tillage = React.createRef();
    this.density = React.createRef();
    this.contour = React.createRef();
    this.legume = React.createRef();
    this.phos_fertilizer = React.createRef();
    this.phos_manure = React.createRef();
//    this.fertilizer = React.createRef();
    this.nitrogen = React.createRef();
    this.nitrogen_fertilizer = React.createRef();
    this.grassYield = React.createRef();
    this.rotFreq = React.createRef();
    this.phos_fert_options_holder = []
  }
  componentDidUpdate(prevProps) {
    console.log("old values", prevProps)
    console.log("new values", this.props)
    if(prevProps.activeTrans.management.nitrogen != this.props.activeTrans.management.nitrogen || prevProps.activeTrans.management.cover != this.props.activeTrans.management.cover){
        if (prevProps.aoiFolderId == null){
            return
        }
        console.log("Nitrogen has changed, calculate new P")
        console.log("Nitrogen has changed, calculate new P", prevProps.activeTrans.management.nitrogen)
        console.log("Nitrogen has changed, calculate new P", this.props.activeTrans.management.nitrogen)
        this.getPhosValues()
    }

  }
    async handleOpenModalTrans(e){
        console.log("handling opening modal!!!!")
        console.log(e)
        // the modal will only open after the active trans has been set
        await this.selectTransClick(e)
        this.getPhosValues()
        this.setState({transModalShow: true})
      }
    handleCloseModal(){
        this.setState({transModalShow: false})
      }
      showModal(){
        console.log("showing modal")
        this.rotationType.current.value = this.props.activeTrans.management.rotationType
        this.density.current.value = this.props.activeTrans.management.density
//        this.fertilizer.current.value = this.props.activeTrans.management.fertilizer
        this.nitrogen.current.value = this.props.activeTrans.management.nitrogen
        this.nitrogen_fertilizer.current.value = this.props.activeTrans.management.nitrogen_fertilizer
        this.cover.current.value = this.props.activeTrans.management.cover
        this.tillage.current.value = this.props.activeTrans.management.tillage
        this.contour.current.value = this.props.activeTrans.management.contour
        this.legume.current.value = this.props.activeTrans.management.legume
        this.phos_fertilizer.current.value = this.props.activeTrans.management.phos_fertilizer
        this.phos_manure.current.value = this.props.activeTrans.management.phos_manure
        this.grassYield.current.value = this.props.activeTrans.management.grassYield
        this.rotFreq.current.value = this.props.activeTrans.management.rotFreq
        this.phos_fert_options_holder = this.props.activeTrans.management.phos_fert_options
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
        this.setState({tillageBlank:false})
        if (cover == "cc"){
            this.setState({
                showTillageNT:true,
                showTillageSU:true,
            })
            if (rot == "dairyRotation" || rot == "cornSoyOat"){
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
//      display reminder box if there is no option for till
        if (this.tillage.current.value == "na"){
            this.setState({tillageBlank:false})
        }
        else{
             this.setState({tillageBlank:true})
        }
//      not pasture
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
             if(this.cover.current.value != this.props.activeTrans.management.cover ||
                this.rotationType.current.value != this.props.activeTrans.management.rotationType){
                    this.configureTillage()
            }
        }
//        turn on pasture options
//      pasture
        else{
//            this.fertilizer.current.value = "0_0"
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
                this.props.updateActiveTransProps({"name":"rotFreq", "value":"1", "type":"mang"})
                this.rotFreq.current.value = "1"
            }
            this.setState({tillageBlank:true})
        }
      }
      testVisible(){
        this.setState({tillageBlank:true})
      }
    handleNitrogenDefaults(type, value){
        if (this.nitrogen.current != null){

            let nitrogen = "0"
            let nitrogen_fert = "0"
            console.log("value is ", value)
            switch (value){
                case "pasture":
                    nitrogen = "0"
                    nitrogen_fert = "0"
                    break;
                case "contCorn":
                    nitrogen = "0"
                    nitrogen_fert = "100"
                    break;
                case "cornGrain":
                    nitrogen = "0"
                    nitrogen_fert = "100"
                    break;
                case "dairyRotation":
                   nitrogen = "100"
                   nitrogen_fert = "25"
                   break;
                case "cornSoyOat":
                   nitrogen = "100"
                   nitrogen_fert = "25"
                   break;

            }
            console.log("value is ", nitrogen, nitrogen_fert)
//            let placeholder = {"currentTarget":{"value":nitrogen}}
//            this.handleSelectionChange("nitrogen", placeholder)
//            let placeholder2 = {"currentTarget":{"value":nitrogen_fert}}
//            this.handleSelectionChange("nitrogen_fertilizer", placeholder2)

            this.props.updateActiveTransProps({"name":"nitrogen", "value":nitrogen, "type":"mang"})
            this.props.updateActiveTransProps({"name":"nitrogen_fertilizer", "value":nitrogen_fert, "type":"mang"})
            this.nitrogen.current.value = nitrogen
            this.nitrogen_fertilizer.current.value = nitrogen_fert
            }
    }
    handleSelectionChange(type, e){
        console.log("Updating selection of ", type)
        if(type == "rotationType" || type == "legume"){
            this.handleNitrogenDefaults(type, e.currentTarget.value)
        }
         this.handleTransMangement()
//      update active transformation with new value
        this.props.updateActiveTransProps({"name":type, "value":e.currentTarget.value, "type":"mang"})
    }
    handleSelectionChangeGeneral(name, e, type){
            this.props.updateActiveTransProps({"name":name, "value":e.currentTarget.value, "type":type})

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

  removeTransformation(e){
    console.log(e.currentTarget)
    console.log(e.currentTarget.id)
    let removeTransId = e.currentTarget.id
    this.props.removeTrans(removeTransId)
  }
  getPhosValues(){
    console.log("transformation ")
    let transPayload = {}
    let transValues = JSON.parse(JSON.stringify(this.props.listTrans))
    let transValues1 = JSON.parse(JSON.stringify(this.props.listTrans))
    let lengthTrans = transValues.length
//        give the transformations the correct ranking
    for(let trans in transValues){
        transValues[trans].rank = lengthTrans;
        transValues1[trans].rank = lengthTrans;
        transValues[trans].selection.field_coors = []
        transPayload[lengthTrans] = transValues[trans]
        lengthTrans--;
    }
    this.props.updateTransList(transValues1);
    var csrftoken = Cookies.get('csrftoken');
        $.ajaxSetup({
            headers: { "X-CSRFToken": csrftoken }
        });
        let payload = {
                trans: transPayload,
                baseTrans:this.props.baseTrans,
                folderId: this.props.aoiFolderId,
                base_calc: false,
                region: this.props.region,
            }
        console.log(payload)
        payload = JSON.stringify(payload)
        $.ajax({
            url : 'https://api.smartscape.grasslandag.org/api/get_phos_fert_options',
            // url : 'http://localhost:9000/api/get_phos_fert_options',
            type : 'POST',
            data : payload,
            success: (response, opts) => {
                delete $.ajaxSetup().headers
                console.log("done with model runs")
                console.log(response)
                let list = JSON.parse(JSON.stringify(this.props.listTrans))
                for (let item in list){
                    console.log(item)
                    console.log(list[item])
                    console.log(list[item].rank)
                    let transId = list[item].id
//                    console.log(responses.land_stats.area_trans[list[item].rank]["area"])
//                    let phos_options = [99,88]
                    console.log(response, transId)
                    let phos_options = response.response[transId].p_choices
//                    let manure_value = 12
                    let manure_value = response.response[transId].p_manure
                    list[item].management.phos_manure = manure_value

                    list[item].management.phos_fert_options = phos_options
                    let phosOpt = phos_options[0]


                    if (phos_options.includes(parseInt(list[item].management.phos_fertilizer))){
                            console.log("phos was a match")
                            phosOpt = list[item].management.phos_fertilizer
                    }


                    list[item].management.phos_fertilizer = phosOpt
//                    if (this.props.activeTrans.id == item.id){
//                  update active trans with new phos options
                    if (this.props.activeTrans.id == transId){
                        this.phos_fert_options_holder = phos_options
                        this.phos_manure.current.value = manure_value
                        this.phos_fertilizer.current.value = phosOpt
//                        list[item].management.phos_fertilizer = phosOpt
                    }
                }
                 this.props.updateTransList(list);
                console.log(this.props.listTrans)
            },

            failure: function(response, opts) {
            }
        })
  }
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
                    <div key = {item1.id}>
                    <InputGroup  size="sm" draggable="true">
                        {/*<Form.Label size="sm" className={this.props.activeTrans.id === item1.id && 'active1 test1' } id={item1.id} onClick={this.selectTransClick}><ThreeDotsVertical/></Form.Label>*/}
                        <OverlayTrigger  placement="top"
                            overlay={<Tooltip>Land Transformation Priority</Tooltip>}>
                            <Form.Label size="sm" className={this.props.activeTrans.id === item1.id && 'active1 test1' } id={item1.id} onClick={this.selectTransClick}>&nbsp;&nbsp;{index +1}&nbsp;&nbsp;</Form.Label>
                        </OverlayTrigger>
                        <Form.Control placeholder="Enter Name..." id={item1.id} className={ this.props.activeTrans.id === item1.id && 'active1' } onChange={this.handleTransNameChange} onClick={this.selectTransClick} />
                        <OverlayTrigger  placement="top"
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
                  <Form.Label>New Land Cover/ Land Use for this Selected Area</Form.Label>
                    <Form.Select aria-label="Default select example" ref={this.rotationType}
                      onChange={(e) => this.handleSelectionChange("rotationType", e)}>
                      <option value="pasture">Pasture</option>
                      <option value="contCorn">Continuous Corn</option>
                      <option value="cornGrain">Cash Grain</option>
                      <option value="dairyRotation">Dairy Rotation (Corn Silage to Corn Grain to Alfalfa 3 yrs)</option>
                      <option value="cornSoyOat">Dairy Rotation II (Corn Silage to Soy Beans to Oats)</option>
                      {/*<option value="ps">Pasture Seeding</option>*/}
                    </Form.Select>
                 
                    <OverlayTrigger
                      trigger="hover"
                      placement="bottom-start"
                      overlay={
                        <Popover id="popover-basic" style={{ maxWidth: "500px" }}>
                          <Popover.Header as="h3">Grass Species Yield Groups</Popover.Header>
                          <Popover.Body style={{ maxHeight: "200px", overflowY: "auto" }}>
                            <strong>Low Yielding:</strong> Italian ryegrass, Kentucky bluegrass, Quackgrass, Meadow fescue (older varieties) <br />
                            <strong>Medium Yielding:</strong> Meadow fescue (newer varieties), Smooth bromegrass, Timothy, Perennial ryegrass <br />
                            <strong>High Yielding:</strong> Orchardgrass, Reed canary grass, Tall fescue, Festulolium, Hybrid and Meadow bromegrass
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <span> {/* Wrapping in a span ensures both elements trigger the popover */}
                      <Form.Label hidden={!this.state.showGrassYield}>Grass Species Yield Groups</Form.Label>
                        <Form.Select
                          aria-label="Default select example"
                          hidden={!this.state.showGrassYield}
                          ref={this.grassYield}
                          onChange={(e) => this.handleSelectionChange("grassYield", e)}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </Form.Select>
                      </span>
                    </OverlayTrigger>

                    <Form.Label hidden={!this.state.showPastureMang}>Grazing System</Form.Label>
                    <Form.Select aria-label="Default select example" hidden={!this.state.showPastureMang} ref={this.density}
                      onChange={(e) => this.handleSelectionChange("density", e)}>
                      <option value="cn_hi">Continuous High Density</option>
                      <option value="cn_lo">Continuous Low Density</option>
                      <option value="rt_rt">Rotational</option>
                    </Form.Select>

                    <Form.Label hidden={!this.state.showRotFreq}>Rotational Frequency</Form.Label>
                    <Form.Select aria-label="Default select example" hidden={!this.state.showRotFreq} ref={this.rotFreq}
                      onChange={(e) => this.handleSelectionChange("rotFreq", e)}>
                      <option value="1.2">More than once a day</option>
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
                    <Form.Select aria-label="Default select examp+le" validated={"false"} hidden={!this.state.showTillage} ref={this.tillage}
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
                    <Alert hidden={this.state.tillageBlank} variant="danger">Please Choose a Tillage</Alert>

                    <Form.Label hidden={!this.state.showCont}>On Contour</Form.Label >
                    <Form.Select aria-label="Default select example" hidden={!this.state.showCont} ref={this.contour}
                      onChange={(e) => this.handleSelectionChange("contour", e)}>
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </Form.Select>

                    <Form.Label hidden={!this.state.showGrassYield}>Interseeded Legume</Form.Label>
                    <Form.Select hidden={!this.state.showGrassYield} aria-label="Default select example" ref={this.legume}
                      onChange={(e) => this.handleSelectionChange("legume", e)}>
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </Form.Select>

                    <OverlayTrigger
                      trigger="hover"
                      placement="bottom-start"
                      overlay={
                        <Popover id="popover-basic" style={{ maxWidth: "500px" }}>
                          <Popover.Header as="h3">Percent Nitrogen Manure</Popover.Header>
                          <Popover.Body style={{ maxHeight: "200px", overflowY: "auto" }}>
                          Enter the amount of manure N applied to the crop rotation as a percentage of the N recommended based on UW-Extension guidelines (A2809) (for legumes, the percentage is based on manure N allowable). <br />
                          For example, a value of 100% would indicate that N applications are identical to recommendations. Note that in grazed systems, manure N is already applied and does not need to be accounted for here.
                          </Popover.Body>
                        </Popover>
                      }
                    >
                    <span>
                    <Form.Label>Percent Nitrogen Manure</Form.Label>
                     <Form.Select aria-label="Default select example" ref={this.nitrogen}
                      onChange={(e) => this.handleSelectionChange("nitrogen", e)}>
                      <option value="0">0</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="75">75</option>
                      <option value="100">100</option>
                      <option value="125">125</option>
                      <option value="150">150</option>
                    </Form.Select>
                    </span>
                    </OverlayTrigger>

                    <OverlayTrigger
                      trigger="hover"
                      placement="bottom-start"
                      overlay={
                        <Popover id="popover-basic" style={{ maxWidth: "500px" }}>
                          <Popover.Header as="h3">Percent Nitrogen Fertilizer</Popover.Header>
                          <Popover.Body style={{ maxHeight: "200px", overflowY: "auto" }}>
                          Enter the amount of fertilizer N applied to the crop rotation as a percentage of the N recommended based on UW-Extension guidelines (A2809). <br />
                          For example, a value of 100% would indicate that N applications are identical to recommendations.
                          </Popover.Body>
                        </Popover>
                      }
                    >
                    <span>
                      <Form.Label>Percent Nitrogen Fertilizer</Form.Label>
                     <Form.Select aria-label="Default select example" ref={this.nitrogen_fertilizer}
                      onChange={(e) => this.handleSelectionChange("nitrogen_fertilizer", e)}>
                      <option value="0">0</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="75">75</option>
                      <option value="100">100</option>
                      <option value="125">125</option>
                      <option value="150">150</option>
                    </Form.Select>
                    </span>
                    </OverlayTrigger>

                    <OverlayTrigger
                      trigger="hover"
                      placement="top-start"
                      overlay={
                        <Popover id="popover-basic" style={{ maxWidth: "500px" }}>
                          <Popover.Header as="h3">Percent Phosphorous Manure (Calculated)</Popover.Header>
                          <Popover.Body style={{ maxHeight: "200px", overflowY: "auto" }}>
                          The amount of manure P applied to the crop rotation as a percentage of the P removed by the crop rotation harvest (e.g., value of 100 means that P inputs and outputs are balanced). <br />
                          Note that in grazed systems, manure P is already applied and does not need to be accounted for here.
                          </Popover.Body>
                        </Popover>
                      }
                    >
                    <span>
                    <Form.Label>Percent Phosphorous Manure (Calculated)</Form.Label>
                    <Form.Control placeholder="0" disabled ref={this.phos_manure}/>
                    </span>
                    </OverlayTrigger>

                    <OverlayTrigger
                      trigger="hover"
                      placement="top-start"
                      overlay={
                        <Popover id="popover-basic" style={{ maxWidth: "500px" }}>
                          <Popover.Header as="h3">Percent Phosphorous Fertilizer</Popover.Header>
                          <Popover.Body style={{ maxHeight: "200px", overflowY: "auto" }}>
                          Enter the amount of fertilizer P applied to the crop rotation as a percentage of the P removed by the crop rotation harvest (e.g., value of 100 means that P inputs and outputs are balanced).
                          </Popover.Body>
                        </Popover>
                      }
                    >
                    <span>
                     <Form.Label>Percent Phosphorous Fertilizer</Form.Label>
                     <Form.Select aria-label="Default select example" ref={this.phos_fertilizer}
                      onChange={(e) => this.handleSelectionChange("phos_fertilizer", e)}>
                        {this.phos_fert_options_holder.map((item1, index) => (
                          
                          <option  key = {item1} value={item1}>{item1}</option>
                        ))}

                    </Form.Select>
                    </span>
                    </OverlayTrigger>


                    <OverlayTrigger
                      trigger="hover"
                      placement="top-start"
                      overlay={
                        <Popover id="popover-basic" style={{ maxWidth: "500px" }}>
                          <Popover.Header as="h3">Adoption Rate</Popover.Header>
                          <Popover.Body style={{ maxHeight: "200px", overflowY: "auto" }}>
                          The percentage of land in the Transformation to change
                          </Popover.Body>
                        </Popover>
                      }
                    >
                    <span>
                    <Row>
                        <Col sm={2}>
                          <Form.Label>Adoption Rate</Form.Label>
                          <Form.Control value={this.props.activeTrans.selection.adoptionRate} size='sm'
                            onChange={(e) => this.handleSelectionChangeGeneral("adoptionRate", e, "reg")}
                          />
                        </Col>
                        <Col sm={10}>
                           <Form.Label></Form.Label>
                           <RangeSlider size='sm'
                            value={this.props.activeTrans.selection.adoptionRate}
                            onChange={(e) => this.handleSelectionChangeGeneral("adoptionRate", e, "reg")}
                            max={100}
                            min={0}
                            variant="info"
                          />
                        </Col>
                    </Row>
                    </span>
                    </OverlayTrigger>



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