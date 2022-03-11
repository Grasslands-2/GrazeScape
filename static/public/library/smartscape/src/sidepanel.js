import React from 'react'
import Nav from 'react-bootstrap/Nav';
import Modal from 'react-bootstrap/Modal'
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
import Table from 'react-bootstrap/Table'
import ListGroup from 'react-bootstrap/ListGroup'
import { DoorOpen,PlusLg } from 'react-bootstrap-icons';
import Stack from 'react-bootstrap/Stack'
import TransformationTable from './transformation/transformationTable.js'
import RangeSlider from 'react-bootstrap-range-slider';
import './App.css';
import {Transformation} from './transformation/transformation.js'
import{setActiveTrans, addTrans,updateAreaSelectionType,updateActiveTransProps,
setVisibilityMapLayer,updateActiveBaseProps} from '/src/stores/transSlice'
import{setVisibilityAOIAcc, setVisibilityTransAcc} from '/src/stores/mainSlice'
import * as charts from '/src/utilities/charts'
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
)
import { useSelector, useDispatch, connect  } from 'react-redux'
import { v4 as uuidv4 } from 'uuid';

const mapStateToProps = state => {
    console.log("mapping sidepannel")
    return{
    activeTrans: state.transformation.activeTrans,
    listTrans:state.transformation.listTrans,
    baseTrans:state.transformation.baseTrans,
    region:state.main.region,
    hideAOIAcc:state.main.hideAOIAcc,
    hideTransAcc:state.main.hideTransAcc,
    aoiFolderId:state.main.aoiFolderId,
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
        setVisibilityAOIAcc: (type)=> dispatch(setVisibilityAOIAcc(type)),
        setVisibilityTransAcc: (type)=> dispatch(setVisibilityTransAcc(type)),
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
        this.subAreaSelection = this.subAreaSelection.bind(this);
        this.addTrans = this.addTrans.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleOpenModalBase = this.handleOpenModalBase.bind(this);
        this.showModal = this.showModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.renderModal = this.renderModal.bind(this);
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
            showHuc12:false,
            transVisible:false,
            outputModalShow: false,
            basePloss: "hello world",
            modelPloss: "hello world",
            baseEro: "hello world",
            modelEro: "hello world",
            modelOutputs: {},
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
    if(e == "selection"){
        // get bounds of current selection method and start downloading
        this.props.loadSelectionRaster()
        // turn off huc 10
        this.props.setVisibilityMapLayer([{'name':'huc10', 'visible':false},{'name':'southWest', 'visible':false}])
//        this.props.setVisibilityMapLayer()
//        this.props.setVisibilityMapLayer({'name':'huc12', 'visible':true})
    }
    else if (e == "aoi"){
        this.props.setVisibilityMapLayer([{'name':'huc10', 'visible':true}])
//        this.props.setVisibilityMapLayer({'name':'huc12', 'visible':false})
    }
    else{}
  }
  subAreaSelection(e){

    console.log(this.state.showHuc12)
    // show huc 12 if the subwatershed accordion is open
    // otherwise hide huc 12
    if (!this.state.showHuc12){
        this.props.setVisibilityMapLayer([{'name':'huc12', 'visible':true}])
        this.setState({showHuc12:true})
    }
    else{
        this.props.setVisibilityMapLayer([{'name':'huc12', 'visible':false}])
        this.setState({showHuc12:false})
    }
    console.log("sub area selection")
    console.log(e)
  }
  addTrans(){
    console.log("add new transformation!")
    // example transformation
    // random id from 1 to 100
    let tempId = uuidv4();

    let newTrans = Transformation("test trans",tempId, 5)
    this.props.setActiveTrans(newTrans)
    this.props.addTrans(newTrans)
//    this.props.setActiveTrans(newTrans)
  }
    handleCloseModal(){
    this.setState({outputModalShow: false})
  }
  handleOpenModal(){
    console.log(this.basePloss)
    this.setState({outputModalShow: true})
//    this.basePloss.current.value = "hello world"
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
                folderId: this.props.aoiFolderId,
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
  renderModal(){
    var labels = ['Yield', 'Erosion',
        'Phosphours Lose', 'Runoff',
        'Honey Bee Toxicity', 'Curve Number'
    ]
    console.log(this.state.modelOutputs)
    let model = {
        "yield":null, "yield_total":null, "yield_per_diff":null,
        "ero":null, "ero_total":null,"ero_per_diff":null,
        "ploss":null, "ploss_total":null,"ploss_per_diff":null,
        "cn":null,"cn_per_diff":null,
        "runoff":null,"runoff_per_diff":null,
        "insect":null,"insect_per_diff":null,
    }
    let base = {
        "yield":null, "yield_total":null, "yield_per_diff":null,
        "ero":null, "ero_total":null,"ero_per_diff":null,
        "ploss":null, "ploss_total":null,"ploss_per_diff":null,
        "cn":null,"cn_per_diff":null,
        "runoff":null,"runoff_per_diff":null,
        "insect":null,"insect_per_diff":null,
    }
    let area = 0
    let radarData = [[1,1,1,1,1,1],[2,2,2,2,2,2]]
    let dataRadar = charts.getChartDataRadar(labels, radarData)
    console.log("done with radar")
    let dataBarPercent = charts.getChartDataBarPercent(labels, [0, 59, 80, 81, 56, 55, 40])
    let dataYield = dataBarPercent
    let dataEro= dataBarPercent
    let dataPloss= dataBarPercent
    let dataRun= dataBarPercent
    let dataInsect= dataBarPercent
    let dataCN = dataBarPercent

    let optionsBarPercent = charts.getOptionsBarPercent()
    let optionsYield = optionsBarPercent
    let optionsEro = optionsBarPercent
    let optionsPloss = optionsBarPercent
    let optionsRun = optionsBarPercent
    let optionsInsect = optionsBarPercent
    let optionsCN = optionsBarPercent
//    populate data if we have model outputs
    if (this.state.modelOutputs.hasOwnProperty("base")){
        area = this.state.modelOutputs.land_stats.area
        dataRadar = {
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
              data: [
                  this.state.modelOutputs.model.yield.total_per_area/this.state.modelOutputs.base.yield.total_per_area,
                  this.state.modelOutputs.model.ero.total_per_area/this.state.modelOutputs.base.ero.total_per_area,
                  this.state.modelOutputs.model.ploss.total_per_area/this.state.modelOutputs.base.ploss.total_per_area,
                  this.state.modelOutputs.model.runoff.total_per_area/this.state.modelOutputs.base.runoff.total_per_area,
                  this.state.modelOutputs.model.insect.total_per_area/this.state.modelOutputs.base.insect.total_per_area,
                  this.state.modelOutputs.model.cn.total_per_area/this.state.modelOutputs.base.cn.total_per_area,
              ],
              backgroundColor: 'rgba(0, 119, 187,.2)',
              borderColor: 'rgba(0, 119, 187,1)',
              borderWidth: 1,
            },
          ],
        };

        model.yield = this.state.modelOutputs.model.yield.total_per_area
        model.yield_total = this.state.modelOutputs.model.yield.total
        model.ero = this.state.modelOutputs.model.ero.total_per_area
        model.ero_total = this.state.modelOutputs.model.ero.total
        model.ploss = this.state.modelOutputs.model.ploss.total_per_area
        model.ploss_total = this.state.modelOutputs.model.ploss.total

        model.cn = this.state.modelOutputs.model.cn.total_per_area
        model.runoff = this.state.modelOutputs.model.runoff.total_per_area
        model.insect = this.state.modelOutputs.model.insect.total_per_area

        base.yield = this.state.modelOutputs.base.yield.total_per_area
        base.yield_total = this.state.modelOutputs.base.yield.total
        base.ero = this.state.modelOutputs.base.ero.total_per_area
        base.ero_total = this.state.modelOutputs.base.ero.total
        base.ploss = this.state.modelOutputs.base.ploss.total_per_area
        base.ploss_total = this.state.modelOutputs.base.ploss.total

        base.cn = this.state.modelOutputs.base.cn.total_per_area
        base.runoff = this.state.modelOutputs.base.runoff.total_per_area
        base.insect = this.state.modelOutputs.base.insect.total_per_area

        let models = ["yield","ero","ploss","cn","insect","runoff"]
        let v1, v2 = 0
        let model_name = ""
//        calculate percent difference
        for (let m in models) {
            model_name = models[m]
            v1 = parseFloat(model[model_name])
            v2 = parseFloat(base[model_name])
//            console.log(v1, v2)
//            console.log(((v1 + v2)/2))
//            console.log(((v1-v2) / ((v1 + v2)/2)) * 100)
//            console.log(Math.abs((v1-v2) / ((v1 + v2)/2)) * 100)
//            model[model_name + "_per_diff"] = Math.round(Math.abs((v1-v2) / ((v1 + v2)/2)) * 100)
            model[model_name + "_per_diff"] = Math.round((v1-v2) / ((v1 + v2)/2) * 100)
        }
        dataBarPercent ={ labels: labels,
          datasets: [{
            axis: 'y',
             minBarLength: 7,
            label: 'Percent Difference Between Base and Transformation',
            data: [
                model.yield_per_diff,
                model.ero_per_diff,
                model.ploss_per_diff,
                model.runoff_per_diff,
                model.insect_per_diff,
                model.cn_per_diff,

            ],
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
        dataYield = charts.getChartDataBar([base.yield,null], [null,model.yield])
        dataEro= charts.getChartDataBar([base.ero,null],[ null,model.ero])
        dataPloss= charts.getChartDataBar([base.ploss,null], [null,model.ploss])
        dataRun= charts.getChartDataBar([base.runoff,null], [null,model.runoff])
        dataInsect= charts.getChartDataBar([base.insect,null], [null,model.insect])
        dataCN = charts.getChartDataBar([base.cn,null], [null,model.cn])
        console.log(dataCN)

        optionsYield = charts.getOptionsBar("Yield", "Tons-Dry Matter/year")
        optionsEro = charts.getOptionsBar("Erosion", "Tons/Year")
        optionsPloss = charts.getOptionsBar("Phosphorus Loss", "LB/Year")
        optionsRun = charts.getOptionsBar("Runoff", "IN")
        optionsInsect = charts.getOptionsBar("Honey Bee Toxicity", "")
        optionsCN = charts.getOptionsBar("Curve Number", "")

    }

    return(
            <div>
            <div> Total area Transformed: {area} acres</div>
            <Tabs defaultActiveKey="chart" id="uncontrolled-tab-example" className="mb-3">
              <Tab eventKey="chart" title="Chart">
               <Row className = 'row-height'>
                <Col  className='sidePanelCol'>
                    <Radar data={dataRadar}/>
                </Col>
                <Col  className='sidePanelCol'>
                    <Bar options = {optionsBarPercent} data={dataBarPercent}/>
                </Col>
                </Row>
                <Row className = 'row-height'>
                <Col  className='sidePanelCol'>
                    <Bar options = {optionsYield} data={dataYield}/>
                </Col>
                <Col  className='sidePanelCol'>
                    <Bar options = {optionsEro} data={dataEro}/>
                </Col>
                </Row>
                <Row className = 'row-height'>
                <Col  className='sidePanelCol'>
                    <Bar options = {optionsPloss} data={dataPloss}/>
                </Col>
                <Col  className='sidePanelCol'>
                    <Bar options = {optionsRun} data={dataRun}/>
                </Col>
                </Row>
                <Row className = 'row-height'>
                <Col  className='sidePanelCol'>
                    <Bar options = {optionsInsect} data={dataInsect}/>
                </Col>
                <Col  className='sidePanelCol'>
                    <Bar options = {optionsCN} data={dataCN}/>
                </Col>
                </Row>
            </Tab>
              <Tab eventKey="tabular" title="Tabular">
                <Table striped bordered hover size="sm" responsive>
                  <thead>
                  <tr style={{textAlign:"center"}}>
                      <th></th>
                      <th colSpan={3}>Per Acre</th>
                      <th colSpan={3}>Total</th>
                      <th colSpan={2}></th>
                    </tr>
                    <tr style={{textAlign:"center"}}>
                      <th>Variable</th>
                      <th>Base</th>
                      <th>Transformation</th>
                      <th>Units</th>
                      <th>Base</th>
                      <th>Transformation</th>
                      <th>Units</th>
                      <th>% Difference</th>
                      <th>Help</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Yield</td>
                      <td>{base.yield}</td>
                      <td>{model.yield}</td>
                      <td>Tons-Dry Matter/year</td>
                      <td>{base.yield_total}</td>
                      <td>{model.yield_total}</td>
                      <td>Tons-Dry Matter/year</td>
                      <td>{model.yield_per_diff}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Erosion</td>
                      <td>{base.ero}</td>
                      <td>{model.ero}</td>
                      <td>Tons/Year</td>
                      <td>{base.ero_total}</td>
                      <td>{model.ero_total}</td>
                      <td>Tons/Year</td>
                      <td>{model.ero_per_diff}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Phosphorus Loss</td>
                      <td>{base.ploss}</td>
                      <td>{model.ploss}</td>
                      <td>LB/Year</td>
                      <td>{base.ploss_total}</td>
                      <td>{model.ploss_total}</td>
                      <td>LB/Year</td>
                      <td>{model.ploss_per_diff}</td>
                      <td></td>
                    </tr>
                   <tr>
                      <td>Runoff</td>
                      <td>{base.runoff}</td>
                      <td>{model.runoff}</td>
                      <td>IN</td>
                      <td>NA</td>
                      <td>NA</td>
                      <td>NA</td>
                      <td>{model.runoff_per_diff}</td>
                      <td></td>
                   </tr>
                   <tr>
                      <td>Honey Bee Toxicity</td>
                      <td>{base.insect}</td>
                      <td>{model.insect}</td>
                      <td>Insecticide Index</td>
                      <td>NA</td>
                      <td>NA</td>
                      <td>NA</td>
                      <td>{model.insect_per_diff}</td>
                      <td></td>
                   </tr>
                   <tr>
                      <td>Curve Number</td>
                      <td>{base.cn}</td>
                      <td>{model.cn}</td>
                      <td>NA</td>
                      <td>NA</td>
                      <td>NA</td>
                      <td>NA</td>
                      <td>{model.cn_per_diff}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              </Tab>

            </Tabs>
            </div>
    )
  }
    render(){
        return(
        <Container className='side_pannel_style'>
            <h4>Selection Parameters</h4>
            <Container className='progress_bar'>
              <ProgressBar variant="success" now={40} label='Progress'/>
            </Container>
              <Accordion  defaultActiveKey="aoi" id="uncontrolled-tab-example" className="mb-3" onSelect={(e) => this.tabControl(e)}>
              <Accordion.Item eventKey="aoi" title="Area of Interest" hidden={this.props.hideAOIAcc}>
                  <Accordion.Header>Select Work Area</Accordion.Header>
              <Accordion.Body>
              <Row>
                  <h4>Select a work area<sup>*</sup></h4>
                 <InputGroup size="sm" className="mb-3">
                 <h6> Please select a region and then select at least one large watershed </h6>
                 <h6> Hold shift to select multiple watersheds </h6>
                  </InputGroup>
                  <h6>*All land transformations must reside in the work area</h6>
              </Row>
              </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="selection" title="Selection" hidden={this.props.hideTransAcc}>
              {/*<Accordion.Item eventKey="selection" title="Selection" >*/}
                  <Accordion.Header>Build Scenario</Accordion.Header>

              <Accordion.Body>

                <div className = "criteriaSections">
                <Form.Label>1) Select at least one Land Type</Form.Label>
                    <Form >
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

                </div>

                <div className = "criteriaSections">
                    <Form.Label>2) Optional Selection Options</Form.Label>
                    <Accordion onSelect={(e) => this.subAreaSelection(e)}>
                      <Accordion.Item eventKey="2">
                        <Accordion.Header>Sub Area</Accordion.Header>
                        <Accordion.Body>
                          <Row>
                               <Form.Check
                                inline
                                label="Select Sub Watersheds"
                                ref={this.selectWatershed}
                                checked={this.state.selectWatershed}
                                name="group2"
                                type='radio'
                                onChange={(e) => this.handleAreaSelectionType("watershed", e)}
                              />
                                <Button variant="secondary" onClick={(e) => this.handleAreaSelectionType("none", e)}>
                                Stop Selection
                              </Button>
                               <h6> Hold shift to select multiple watersheds </h6>

                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion>
                      <Accordion.Item eventKey="3">
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
                                <RangeSlider
                                  value={55}
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

                      <Accordion.Item eventKey="4">
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
                                <Form.Check inline label="feet" name="group1" type="radio"
                                  />
                                  <Form.Check inline label="meters" name="group1" type="radio" checked={true}
                                    onChange={(e) => this.handleSelectionChangeLand("contCorn", e)}
                                  />
                                  </Form>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    </div>
                                    <div className = "criteriaSections">

                <Form.Label>3) Manage Your Land Transformations</Form.Label>

                    <TransformationTable/>
                                      <Stack gap={3}>
                  <Button size="sm" variant="primary" onClick={this.addTrans}><PlusLg/></Button>
                     <Button onClick={this.handleOpenModalBase} variant="primary">Base Assumptions</Button>
                     <Button onClick={this.displaySelectionCriteria} variant="primary">Display Selection</Button>
                     </Stack>
                      </div>
                      <Form.Label>4) Assess Your Scenario</Form.Label>

                     <Stack gap={3}>
                     <Button onClick={this.runModels} variant="success">Assess Scenario</Button>
                      <Button variant="primary" onClick={this.handleOpenModal}>View Results</Button>
                     </Stack>

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
              </Accordion.Body>
              </Accordion.Item>
            </Accordion>
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
                      <option value="50_50">50/	50</option>
                    </Form.Select>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={this.handleCloseModal}>
                    Close
                  </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={this.state.outputModalShow} onHide={this.handleCloseModal} dialogClassName="modal-90w">
            <Modal.Header closeButton>
              <Modal.Title>Transformation Results</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                {this.renderModal()}
            </Modal.Body >
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