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
setVisibilityMapLayer,updateActiveBaseProps, setActiveTransDisplay,updateTransList} from '/src/stores/transSlice'
import * as mainSlice from '/src/stores/mainSlice'
import * as charts from '/src/utilities/charts'
import { Doughnut } from 'react-chartjs-2';
import { Slider, Rail, Handles, Tracks, Ticks } from 'react-compound-slider'
import { SliderRail, Handle, Track, Tick } from "./components"; // example render components - source below
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
    return{
    activeTrans: state.transformation.activeTrans,
    listTrans:state.transformation.listTrans,
    baseTrans:state.transformation.baseTrans,
    region:state.main.region,
    hideAOIAcc:state.main.hideAOIAcc,
    hideTransAcc:state.main.hideTransAcc,
    aoiFolderId:state.main.aoiFolderId,
    extents:state.main.aoiExtents,
    aoiCoors:state.main.aoiCoors,
    aoiArea:state.main.aoiArea,
}}

//const domain = [0, 700];
const domainSlope = [0, 51];
const domainStream = [0, 16000];
const sliderStyle = {  // Give the slider some width
  position: 'relative',
  width: '100%',
  height: 40,
}

const railStyle = {
  position: 'absolute',
  width: '100%',
  height: 10,
  marginTop: 35,
  borderRadius: 5,
  backgroundColor: '#8B9CB6',
}
const mapDispatchToProps = (dispatch) => {
    return{
        setActiveTrans: (value)=> dispatch(setActiveTrans(value)),
        addTrans: (value)=> dispatch(addTrans(value)),
        updateAreaSelectionType: (value)=> dispatch(updateAreaSelectionType(value)),
        updateActiveTransProps: (type)=> dispatch(updateActiveTransProps(type)),
        setVisibilityMapLayer: (type)=> dispatch(setVisibilityMapLayer(type)),
        updateActiveBaseProps: (type)=> dispatch(updateActiveBaseProps(type)),
        setActiveTransDisplay: (type)=> dispatch(setActiveTransDisplay(type)),
        updateTransList: (type)=> dispatch(updateTransList(type)),

        setVisibilityAOIAcc: (type)=> dispatch(mainSlice.setVisibilityAOIAcc(type)),
        setVisibilityTransAcc: (type)=> dispatch(mainSlice.setVisibilityTransAcc(type)),
        setActiveRegion: (type)=> dispatch(mainSlice.setActiveRegion(type)),
        setAoiFolderId: (type)=> dispatch(mainSlice.setAoiFolderId(type)),

    }
};

class SidePanel extends React.Component{
    constructor(props){
        super(props)
        this.user = props.user
        this.runModels = this.runModels.bind(this);
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        this.tabControl = this.tabControl.bind(this);
        this.subAreaSelection = this.subAreaSelection.bind(this);
        this.addTrans = this.addTrans.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleOpenModalBase = this.handleOpenModalBase.bind(this);
        this.showModal = this.showModal.bind(this);
        this.handleCloseModalBase = this.handleCloseModalBase.bind(this);
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.loadSelectionRaster = this.loadSelectionRaster.bind(this);
        this.displaySelectionCriteria = this.displaySelectionCriteria.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
        this.reset = this.reset.bind(this);
        this.sliderChangeSlope = this.sliderChangeSlope.bind(this);
        this.sliderChangeStream = this.sliderChangeStream.bind(this);
        // selection criteria

        this.contCorn = React.createRef();
        this.cashGrain = React.createRef();
        this.dairy = React.createRef();
        this.potato = React.createRef();
//        this.cranberry = React.createRef();
        this.hay = React.createRef();
        this.pasture = React.createRef();
        this.grasslandIdle = React.createRef();

        this.feet = React.createRef();
        this.meters = React.createRef();

        this.rotationType = React.createRef();
        this.cover = React.createRef();
        this.tillage = React.createRef();
        this.density = React.createRef();
        this.contour = React.createRef();
        this.fertilizer = React.createRef();
        this.slopeMax = 700;
        this.distStreamMax = 16000;
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
            aoiOrDisplayLoading:false,
            modelsLoading:false,
            showViewResults:false,
            showHuc10:false,
            slopeSliderValues:[0,700]
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

        // land use selection
        this.contCorn.current.checked = this.props.activeTrans.selection.landCover.contCorn
        this.cashGrain.current.checked = this.props.activeTrans.selection.landCover.cashGrain
        this.dairy.current.checked = this.props.activeTrans.selection.landCover.dairy
        this.potato.current.checked = this.props.activeTrans.selection.landCover.potato
//        this.cranberry.current.checked = this.props.activeTrans.selection.landCover.cranberry
        this.hay.current.checked = this.props.activeTrans.selection.landCover.hay
        this.pasture.current.checked = this.props.activeTrans.selection.landCover.pasture
        this.grasslandIdle.current.checked = this.props.activeTrans.selection.landCover.grasslandIdle
//       which unit to use for steam distance
        if (this.props.activeTrans.selection.useFt){
            this.feet.current.checked = true
            this.meters.current.checked = false
        }
        else{
            this.meters.current.checked = true
            this.feet.current.checked = false
        }
//        if region is changed show huc 10
        if (prevProps.region != this.props.region){
            if(this.props.region != null){

                this.setState({showHuc10:true})
            }
           console.log(this.state.showHuc10)
        }
    }

    sliderChangeSlope(e){
        console.log("slider change")
        console.log(e)
//        if slope entered in textbox is greater than box domain dont update slider
        if(e[1] != domainSlope[1]){
            console.log("not updating")
            this.props.updateActiveTransProps({"name":"slope2", "value":e[1], "type":"reg"})
        }
            this.props.updateActiveTransProps({"name":"slope1", "value":e[0], "type":"reg"})
    }
    sliderChangeStream(e){
        console.log("slider change")
        console.log(e)
        this.props.updateActiveTransProps({"name":"streamDist1", "value":e[0], "type":"reg"})
        this.props.updateActiveTransProps({"name":"streamDist2", "value":e[1], "type":"reg"})
    }
      handleCloseModalBase(){
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
    clearSelection(selectionType){

        if(selectionType == "slope"){
             this.handleSelectionChange("slope2", {"currentTarget":{"value":this.slopeMax}})
             this.handleSelectionChange("slope1", {"currentTarget":{"value":0}})

        }
        else if(selectionType == "streamDist"){
             this.handleSelectionChange("streamDist2", {"currentTarget":{"value":this.distStreamMax}})
             this.handleSelectionChange("streamDist1", {"currentTarget":{"value":0}})
        }
        else if(selectionType == "subArea"){
            this.props.updateActiveTransProps({"name":'extent', "value":[], "type":"reg"})

        }
        else if (selectionType == "all"){
             this.handleSelectionChange("slope2", {"currentTarget":{"value":this.slopeMax}})
             this.handleSelectionChange("slope1", {"currentTarget":{"value":0}})
             this.handleSelectionChange("streamDist2", {"currentTarget":{"value":this.distStreamMax}})
             this.handleSelectionChange("streamDist1", {"currentTarget":{"value":0}})
        }


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
    handleSelectionChangeUnit(type, useFt, e){
        this.props.updateActiveTransProps({"name":type, "value":useFt, "type":"reg"})

    }
    reset(){
//      clear any selection criteria
        this.clearSelection("all")
        this.setState({showHuc10:false})
        this.props.setActiveRegion(null)
        this.props.setVisibilityMapLayer([
            {'name':'southWest', 'visible':true},
            {'name':'southCentral', 'visible':true},
            {'name':'cloverBelt', 'visible':true},
            {'name':'subHuc12', 'visible':false},
            {'name':'huc10', 'visible':true}
            ])
        this.props.updateActiveBaseProps({"name":"cover", "value":"nc", "type":"mang"})
        this.props.updateActiveBaseProps({"name":"tillage", "value":"su", "type":"mang"})
        this.props.updateActiveBaseProps({"name":"contour", "value":"1", "type":"mang"})
        this.props.updateActiveBaseProps({"name":"fertilizer", "value":"50_50", "type":"mang"})
        console.log("huc 10 vis ", this.state.showHuc10)
//        remove all transformations
// remove activate transformation
// display all learning hubs

    }
    // fires when we switch tab so we can download the work area rasters
  tabControl(e){
    if(e == "selection"){
        // get bounds of current selection method and start downloading
        this.setState({aoiOrDisplayLoading:true})
        this.loadSelectionRaster()

        // turn off huc 10
        this.props.setVisibilityMapLayer([
            {'name':'huc10', 'visible':false},
            {'name':'southWest', 'visible':false},
            {'name':'southCentral', 'visible':false},
            {'name':'cloverBelt', 'visible':false}
            ])
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
        this.props.setVisibilityMapLayer([{'name':'subHuc12', 'visible':true}])
        this.setState({showHuc12:true})
    }
    else{
//        this.props.setVisibilityMapLayer([{'name':'huc12', 'visible':false}])
        this.props.setVisibilityMapLayer([{'name':'subHuc12', 'visible':false}])
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
//  set default parameters
    let newTrans = Transformation(" ",tempId, 5)
    newTrans.management.rotationType = "pasture"
    newTrans.management.density = "rt_rt"
    newTrans.management.fertilizer = "50_50"
    newTrans.management.contour = "1"
    newTrans.management.cover = "nc"
    newTrans.management.tillage = "nt"
    newTrans.management.grassYield = "medium"
    newTrans.management.rotFreq = "1"
    console.log("Adding new trans")
    console.log(newTrans)
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
    // load rasters for aoi in background
  loadSelectionRaster(){
    if (this.props.listTrans.length < 1){
       this.addTrans()
    }
    console.log(this.props)
     if (this.props.extents.length == 0){
        return
     }
    var csrftoken = Cookies.get('csrftoken');
    $.ajaxSetup({
        headers: { "X-CSRFToken": csrftoken }
    });
    console.log("coordsa")
    console.log(this.state.aoiCoors)
    $.ajax({
        url : '/smartscape/get_selection_raster',
        type : 'POST',
        data : JSON.stringify({
            geometry:{
                // this is the aoi extent; saved to appcontainer local storage
                extent:this.props.extents,
                field_coors:this.props.aoiCoors,
            },
            region:this.props.region,
            baseTrans: this.props.baseTrans
        }),
        success: (response, opts) => {
            delete $.ajaxSetup().headers
            console.log("raster loaded");
            console.log(response);
            this.setState({boundaryRasterId:response.folder_id})
            this.props.setAoiFolderId(response.folder_id)
            console.log(this.state)
//            alert("Raster loaded")
            this.setState({aoiOrDisplayLoading:false})
        },

        failure: function(response, opts) {
        }
    });

  }
  // get display raster from active transformation
  displaySelectionCriteria(){
    this.setState({aoiOrDisplayLoading:true})
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
            folderId: this.props.aoiFolderId,
            transId: this.props.activeTrans.id,
            region:this.props.region,

        }),
        success: (responses, opts) => {
            delete $.ajaxSetup().headers
            console.log(responses)
            let url = location.origin + "/smartscape/get_image?file_name="+responses[0]["url"]+ "&time="+Date.now()
            console.log(url)
            this.props.setActiveTransDisplay({'url':url, 'extents':responses[0]["extent"],'transId':responses[0]["transId"]})
            this.setState({aoiOrDisplayLoading:false})
            let cellRatio = responses[0]["cellRatio"]
            let totalArea = Math.round(this.props.aoiArea* 0.000247105)
            let selectionArea = Math.round(cellRatio * totalArea)
            let perArea = Math.round(selectionArea/totalArea * 100)
            this.props.updateActiveTransProps({"name":"areaSelected", "value":selectionArea, "type":"base"})
            this.props.updateActiveTransProps({"name":"areaSelectedPerWorkArea", "value":perArea, "type":"base"})
        },

        failure: function(response, opts) {
        }
    });

    // return url to image of raster
    // put image into raster layer
  }
   runModels(){
        // ajax call with selection criteria
        this.setState({modelsLoading:true})
        console.log("Running models!!")
        let transPayload = JSON.parse(JSON.stringify(this.props.listTrans))
        let lengthTrans = transPayload.length
//        give the transformations the correct ranking
        for(let trans in transPayload){
            transPayload[trans].rank = lengthTrans;
            lengthTrans--;
        }
        this.props.updateTransList(transPayload);
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
                region: this.props.region,
                aoiArea: this.props.aoiArea,
                aoiExtents: this.props.extents
            }),
            success: (responses, opts) => {
                delete $.ajaxSetup().headers
                console.log("done with model runs")
                console.log(responses)
                let list = JSON.parse(JSON.stringify(this.props.listTrans))
                for (let item in list){
                    console.log("Parsing area for transformation")
                    console.log(item)
                    console.log(list[item])
                    console.log(list[item].rank)
                    console.log(responses.land_stats.area_trans[list[item].rank]["area"])
                    list[item].areaSelected = responses.land_stats.area_trans[list[item].rank]["area"]
                }
                 this.props.updateTransList(list);

                this.setState({basePloss:"Phosphorus Loss: " + responses.base.ploss.total + " lb/year; "+ responses.base.ploss.total_per_area + " lb/year/ac"})
                this.setState({modelPloss:"Phosphorus Loss: " + responses.model.ploss.total + " lb/year; "+ responses.model.ploss.total_per_area + " lb/year/ac"})
                this.setState({baseEro:"Erosion: " + responses.base.ero.total + " tons/year; "+ responses.base.ero.total_per_area + " tons/year/ac"})
                this.setState({modelEro:"Erosion: " + responses.model.ero.total + " tons/year; "+ responses.model.ero.total_per_area + " tons/year/ac"})
//                this.setState({modelPloss:5555})
                this.setState({outputModalShow:true})
                this.setState({modelOutputs:responses})
                this.setState({modelsLoading:false})
                this.setState({showViewResults:true})

            },

            failure: function(response, opts) {
            }
        })
    }
  renderModal(){
    var labels = ['Yield', 'Erosion',
        'Phosphorus Loss', 'Runoff',
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
    let modelWatershed = {
        "yield":null, "yield_total":null, "yield_per_diff":null,
        "ero":null, "ero_total":null,"ero_per_diff":null,
        "ploss":null, "ploss_total":null,"ploss_per_diff":null,
        "cn":null,"cn_per_diff":null,
        "runoff":null,"runoff_per_diff":null,
        "insect":null,"insect_per_diff":null,
    }
    let baseWatershed = {
        "yield":null, "yield_total":null, "yield_per_diff":null,
        "ero":null, "ero_total":null,"ero_per_diff":null,
        "ploss":null, "ploss_total":null,"ploss_per_diff":null,
        "cn":null,"cn_per_diff":null,
        "runoff":null,"runoff_per_diff":null,
        "insect":null,"insect_per_diff":null,
    }
    let areaCalc = 0
    let area = 0
    let areaWatershed = 0
    let areaWatershedCalc = 0
    let radarData = [[1,1,1,1,1,1],[2,2,2,2,2,2]]
    let dataRadar = charts.getChartDataRadar(labels, radarData)
    let dataRadarWatershed = charts.getChartDataRadar(labels, radarData)
    let dataBarPercent = charts.getChartDataBarPercent(labels, [0, 59, 80, -81, 56, 55, 40])
    let dataBarPercentWatershed = charts.getChartDataBarPercent(labels, [0, 59, 80, -81, 56, 55, 40])

    let dataYield = dataBarPercent
    let dataEro= dataBarPercent
    let dataPloss= dataBarPercent
    let dataRun= dataBarPercent
    let dataInsect= dataBarPercent
    let dataCN = dataBarPercent

    let dataYieldWatershed = dataBarPercent
    let dataEroWatershed= dataBarPercent
    let dataPlossWatershed= dataBarPercent
    let dataRunWatershed= dataBarPercent
    let dataInsectWatershed= dataBarPercent
    let dataCNWatershed = dataBarPercent

    let optionsBarPercent = charts.getOptionsBarPercent()
    let optionsYield = optionsBarPercent
    let optionsEro = optionsBarPercent
    let optionsPloss = optionsBarPercent
    let optionsRun = optionsBarPercent
    let optionsInsect = optionsBarPercent
    let optionsCN = optionsBarPercent

//    populate data if we have model outputs
    if (this.state.modelOutputs.hasOwnProperty("base")){
        model.yield = this.state.modelOutputs.model.yield.total_per_area
        model.yield_total = this.state.modelOutputs.model.yield.total
        model.ero = this.state.modelOutputs.model.ero.total_per_area
        model.ero_total = this.state.modelOutputs.model.ero.total
        model.ploss = this.state.modelOutputs.model.ploss.total_per_area
        model.ploss_total = this.state.modelOutputs.model.ploss.total

        model.cn = this.state.modelOutputs.model.cn.total_per_area
        model.runoff = this.state.modelOutputs.model.runoff.total_per_area
        model.runoff_total = this.state.modelOutputs.model.runoff.total
        model.insect = this.state.modelOutputs.model.insect.total_per_area

        base.yield = this.state.modelOutputs.base.yield.total_per_area
        base.yield_total = this.state.modelOutputs.base.yield.total
        base.ero = this.state.modelOutputs.base.ero.total_per_area
        base.ero_total = this.state.modelOutputs.base.ero.total
        base.ploss = this.state.modelOutputs.base.ploss.total_per_area
        base.ploss_total = this.state.modelOutputs.base.ploss.total

        base.cn = this.state.modelOutputs.base.cn.total_per_area
        base.runoff = this.state.modelOutputs.base.runoff.total_per_area
        base.runoff_total = this.state.modelOutputs.base.runoff.total
        base.insect = this.state.modelOutputs.base.insect.total_per_area


        modelWatershed.yield = this.state.modelOutputs.model.yield.total_per_area_watershed
        modelWatershed.yield_total = this.state.modelOutputs.model.yield.total_watershed
        modelWatershed.ero = this.state.modelOutputs.model.ero.total_per_area_watershed
        modelWatershed.ero_total = this.state.modelOutputs.model.ero.total_watershed
        modelWatershed.ploss = this.state.modelOutputs.model.ploss.total_per_area_watershed
        modelWatershed.ploss_total = this.state.modelOutputs.model.ploss.total_watershed

        modelWatershed.cn = this.state.modelOutputs.model.cn.total_per_area_watershed
        modelWatershed.runoff = this.state.modelOutputs.model.runoff.total_per_area_watershed
        modelWatershed.runoff_total = this.state.modelOutputs.model.runoff.total_watershed
        modelWatershed.insect = this.state.modelOutputs.model.insect.total_per_area_watershed

        baseWatershed.yield = this.state.modelOutputs.base.yield.total_per_area_watershed
        baseWatershed.yield_total = this.state.modelOutputs.base.yield.total_watershed
        baseWatershed.ero = this.state.modelOutputs.base.ero.total_per_area_watershed
        baseWatershed.ero_total = this.state.modelOutputs.base.ero.total_watershed
        baseWatershed.ploss = this.state.modelOutputs.base.ploss.total_per_area_watershed
        baseWatershed.ploss_total = this.state.modelOutputs.base.ploss.total_watershed

        baseWatershed.cn = this.state.modelOutputs.base.cn.total_per_area_watershed
        baseWatershed.runoff = this.state.modelOutputs.base.runoff.total_per_area_watershed
        baseWatershed.runoff_total = this.state.modelOutputs.base.runoff.total_watershed
        baseWatershed.insect = this.state.modelOutputs.base.insect.total_per_area_watershed

        area = this.state.modelOutputs.land_stats.area
        areaCalc = this.state.modelOutputs.land_stats.area_calc
        areaWatershed = this.state.modelOutputs.land_stats.area_watershed
        areaWatershedCalc = this.state.modelOutputs.land_stats.area_watershed_calc

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
                  model.yield/base.yield,
                  model.ero/base.ero,
                  model.ploss/base.ploss,
                  model.runoff/base.runoff ,
                  model.insect/base.insect,
                  model.cn/base.cn,
              ],
              backgroundColor: 'rgba(0, 119, 187,.2)',
              borderColor: 'rgba(0, 119, 187,1)',
              borderWidth: 1,
            },
          ],
        };
        dataRadarWatershed = {
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
                  modelWatershed.yield/baseWatershed.yield,
                  modelWatershed.ero/baseWatershed.ero,
                  modelWatershed.ploss/baseWatershed.ploss,
                  modelWatershed.runoff/baseWatershed.runoff ,
                  modelWatershed.insect/baseWatershed.insect,
                  modelWatershed.cn/baseWatershed.cn,
              ],
              backgroundColor: 'rgba(0, 119, 187,.2)',
              borderColor: 'rgba(0, 119, 187,1)',
              borderWidth: 1,
            },
          ],
        };



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
//            model[model_name + "_per_diff"] = Math.round((v1-v2) / ((v1 + v2)/2) * 100)
            let perDif = Math.round(((v1-v2)/v2) * 100)
//            console.log(model_name)
//            console.log("percent different " + perDif)
            if (isNaN(perDif)){
                model[model_name + "_per_diff"] = 0
            }
            else{

                model[model_name + "_per_diff"] = perDif
            }
        }

        for (let m in models) {
            model_name = models[m]
            v1 = parseFloat(modelWatershed[model_name])
            v2 = parseFloat(baseWatershed[model_name])
//            console.log(v1, v2)
//            console.log(((v1 + v2)/2))
//            console.log(((v1-v2) / ((v1 + v2)/2)) * 100)
//            console.log(Math.abs((v1-v2) / ((v1 + v2)/2)) * 100)
//            model[model_name + "_per_diff"] = Math.round(Math.abs((v1-v2) / ((v1 + v2)/2)) * 100)
//            model[model_name + "_per_diff"] = Math.round((v1-v2) / ((v1 + v2)/2) * 100)
            let perDif = Math.round(((v1-v2)/v2) * 100)

            if (isNaN(perDif)){
                modelWatershed[model_name + "_per_diff"] = 0
            }
            else{

                modelWatershed[model_name + "_per_diff"] = perDif
            }
//            modelWatershed[model_name + "_per_diff"] = Math.round(((v1-v2)/v2) * 100)
        }
        dataBarPercent ={ labels: labels,
          datasets: [{
            axis: 'y',
             minBarLength: 7,
            label: 'Relative Change Between Base and Transformation',
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
        dataBarPercentWatershed ={ labels: labels,
          datasets: [{
            axis: 'y',
             minBarLength: 7,
            label: 'Relative Change Between Base and Transformation for Watershed',
            data: [
                modelWatershed.yield_per_diff,
                modelWatershed.ero_per_diff,
                modelWatershed.ploss_per_diff,
                modelWatershed.runoff_per_diff,
                modelWatershed.insect_per_diff,
                modelWatershed.cn_per_diff,

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

        dataYieldWatershed = charts.getChartDataBar([baseWatershed.yield,null], [null,modelWatershed.yield])
        dataEroWatershed= charts.getChartDataBar([baseWatershed.ero,null],[ null,modelWatershed.ero])
        dataPlossWatershed= charts.getChartDataBar([baseWatershed.ploss,null], [null,modelWatershed.ploss])
        dataRunWatershed= charts.getChartDataBar([baseWatershed.runoff,null], [null,modelWatershed.runoff])
        dataInsectWatershed= charts.getChartDataBar([baseWatershed.insect,null], [null,modelWatershed.insect])
        dataCNWatershed = charts.getChartDataBar([baseWatershed.cn,null], [null,modelWatershed.cn])

        optionsYield = charts.getOptionsBar("Yield", "tons-dry matter/acre/year")
        optionsEro = charts.getOptionsBar("Erosion", "tons/acre/year")
        optionsPloss = charts.getOptionsBar("Phosphorus Loss", "lb/acre/year")
        optionsRun = charts.getOptionsBar("Runoff (3 inch Storm)", "inches")
        optionsInsect = charts.getOptionsBar("Honey Bee Toxicity", "honey bee toxicity index")
        optionsCN = charts.getOptionsBar("Curve Number", "curve number index")

    }
    let percentArea = (parseFloat(areaCalc)/parseFloat(areaWatershedCalc) * 100).toFixed(2)

    return(
            <div>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Transformation Information</Accordion.Header>
                <Accordion.Body>
                    <div> Total area Transformed: {area} acres ({percentArea}%)</div>
                    <div> Total area in Work Area: {areaWatershed} acres</div>
                    <Table striped bordered hover size="sm" responsive>
                      <thead>
                      <tr style={{textAlign:"center"}}>
                          <th>Priority</th>
                          <th>Name</th>
                          <th>Area (ac)</th>
                        </tr>
                      </thead>
                        {this.props.listTrans.map((trans, index) => (

                      <tbody>
                        <tr>
                          <td>{index + 1}</td>
                          <td>{trans.name}</td>
                          <td>{trans.areaSelected}</td>
                        </tr>
                       </tbody>
                        ))}
                    </Table>
                </Accordion.Body>
            </Accordion.Item>
            </Accordion>
            <Tabs defaultActiveKey="chartsBar" id="uncontrolled-tab-example" className="mb-3">
              <Tab eventKey="chartsBar" title="Bar Charts">
              <h4>By Selection</h4>
                 <Row>
                    <Col xs={6}>
                        <Bar options = {optionsYield} data={dataYield}/>
                    </Col>
                    <Col xs={6}>
                        <Bar options = {optionsEro} data={dataEro}/>
                    </Col>
                 </Row>
                 <Row>
                    <Col xs={6}>
                        <Bar options = {optionsPloss} data={dataPloss}/>
                    </Col>
                    <Col xs={6}>
                        <Bar options = {optionsRun} data={dataRun}/>
                    </Col>
                 </Row>
                 <Row>
                    <Col xs={6}>
                        <Bar options = {optionsInsect} data={dataInsect}/>
                    </Col>
                    <Col xs={6}>
                        <Bar options = {optionsCN} data={dataCN}/>
                    </Col>
                </Row>
                  <h4>By Watershed</h4>

                 <Row>
                    <Col xs={6}>
                        <Bar options = {optionsYield} data={dataYieldWatershed}/>
                    </Col>
                    <Col xs={6}>
                        <Bar options = {optionsEro} data={dataEroWatershed}/>
                    </Col>
                 </Row>
                 <Row>
                    <Col xs={6}>
                        <Bar options = {optionsPloss} data={dataPlossWatershed}/>
                    </Col>
                    <Col xs={6}>
                        <Bar options = {optionsRun} data={dataRunWatershed}/>
                    </Col>
                 </Row>
                 <Row>
                    <Col xs={6}>
                        <Bar options = {optionsInsect} data={dataInsectWatershed}/>
                    </Col>
                    <Col xs={6}>
                        <Bar options = {optionsCN} data={dataCNWatershed}/>
                    </Col>
                </Row>
              </Tab>
              <Tab eventKey="chart" title="Summary Charts">
              <h4>By Selection</h4>
               <Row>
                <Col xs={6}>
                    <Radar data={dataRadar}/>
                </Col>
                <Col xs={6}>
                    <Bar options = {optionsBarPercent} data={dataBarPercent}/>
                </Col>
                </Row>
                <h4>By Watershed</h4>
                <Row>
                <Col xs={6}>
                    <Radar data={dataRadarWatershed}/>
                </Col>
                <Col xs={6}>
                    <Bar options = {optionsBarPercent} data={dataBarPercentWatershed}/>
                </Col>
                </Row>

            </Tab>
              <Tab eventKey="tabular" title="Tabular">
                  <h4>By Selection</h4>
                <Table striped bordered hover size="sm" responsive>
                  <thead>
                  <tr style={{textAlign:"center"}}>
                      <th></th>
                      <th className="table-cell-left" colSpan={3}>Per Acre</th>
                      <th className="table-cell-left" colSpan={3}>Total</th>
                      <th className="table-cell-left" colSpan={2}></th>
                    </tr>
                    <tr style={{textAlign:"center"}}>
                      <th  >Variable</th>
                      <th className="table-cell-left">Base</th>
                      <th>Transformation</th>
                      <th>Units</th>
                      <th className="table-cell-left">Base</th>
                      <th>Transformation</th>
                      <th>Units</th>
                      <th className="table-cell-left">Relative Change</th>
                      <th>Help</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Yield</td>
                      <td className="table-cell-left">{base.yield}</td>
                      <td>{model.yield}</td>
                      <td>tons-dry matter/acre/year</td>
                      <td className="table-cell-left">{base.yield_total}</td>
                      <td>{model.yield_total}</td>
                      <td>tons-dry matter/year</td>
                      <td className="table-cell-left">{model.yield_per_diff}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Erosion</td>
                      <td className="table-cell-left">{base.ero}</td>
                      <td>{model.ero}</td>
                      <td>tons/acre/year</td>
                      <td className="table-cell-left">{base.ero_total}</td>
                      <td>{model.ero_total}</td>
                      <td>tons/year</td>
                      <td className="table-cell-left">{model.ero_per_diff}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Phosphorus Loss</td>
                      <td className="table-cell-left">{base.ploss}</td>
                      <td>{model.ploss}</td>
                      <td>lb/acre/year</td>
                      <td className="table-cell-left">{base.ploss_total}</td>
                      <td>{model.ploss_total}</td>
                      <td>lb/year</td>
                      <td className="table-cell-left">{model.ploss_per_diff}</td>
                      <td></td>
                    </tr>
                   <tr>
                      <td>Runoff (3 inch Storm)</td>
                      <td className="table-cell-left"> {base.runoff}</td>
                      <td>{model.runoff}</td>
                      <td>inches</td>
                      <td className="table-cell-left">{base.runoff_total}</td>
                      <td>{model.runoff_total}</td>
                      <td>acre-ft</td>
                      <td className="table-cell-left">{model.runoff_per_diff}</td>
                      <td></td>
                   </tr>
                   <tr>
                      <td>Honey Bee Toxicity</td>
                      <td className="table-cell-left">{base.insect}</td>
                      <td>{model.insect}</td>
                      <td>insecticide index</td>
                      <td className="table-cell-left">NA</td>
                      <td>NA</td>
                      <td>NA</td>
                      <td className="table-cell-left">{model.insect_per_diff}</td>
                      <td></td>
                   </tr>
                   <tr>
                      <td>Curve Number</td>
                      <td className="table-cell-left">{base.cn}</td>
                      <td>{model.cn}</td>
                      <td>curve number</td>
                      <td className="table-cell-left">NA</td>
                      <td>NA</td>
                      <td>NA</td>
                      <td className="table-cell-left">{model.cn_per_diff}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
            <h4>By Watershed</h4>

              <Table striped bordered hover size="sm" responsive>
                  <thead>
                  <tr style={{textAlign:"center"}}>
                      <th></th>
                      <th className="table-cell-left" colSpan={3}>Per Acre</th>
                      <th className="table-cell-left" colSpan={3}>Total</th>
                      <th className="table-cell-left" colSpan={2}></th>
                    </tr>
                    <tr style={{textAlign:"center"}}>
                      <th  >Variable</th>
                      <th className="table-cell-left">Base</th>
                      <th>Transformation</th>
                      <th>Units</th>
                      <th className="table-cell-left">Base</th>
                      <th>Transformation</th>
                      <th>Units</th>
                      <th className="table-cell-left">Relative Change</th>
                      <th>Help</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Yield</td>
                      <td className="table-cell-left">{baseWatershed.yield}</td>
                      <td>{modelWatershed.yield}</td>
                      <td>tons-dry matter/acre/year</td>
                      <td className="table-cell-left">{baseWatershed.yield_total}</td>
                      <td>{modelWatershed.yield_total}</td>
                      <td>tons-dry matter/year</td>
                      <td className="table-cell-left">{modelWatershed.yield_per_diff}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Erosion</td>
                      <td className="table-cell-left">{baseWatershed.ero}</td>
                      <td>{modelWatershed.ero}</td>
                      <td>tons/acre/year</td>
                      <td className="table-cell-left">{baseWatershed.ero_total}</td>
                      <td>{modelWatershed.ero_total}</td>
                      <td>tons/year</td>
                      <td className="table-cell-left">{modelWatershed.ero_per_diff}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Phosphorus Loss</td>
                      <td className="table-cell-left">{baseWatershed.ploss}</td>
                      <td>{modelWatershed.ploss}</td>
                      <td>lb/acre/year</td>
                      <td className="table-cell-left">{baseWatershed.ploss_total}</td>
                      <td>{modelWatershed.ploss_total}</td>
                      <td>lb/year</td>
                      <td className="table-cell-left">{modelWatershed.ploss_per_diff}</td>
                      <td></td>
                    </tr>
                   <tr>
                      <td>Runoff (3 inch Storm)</td>
                      <td className="table-cell-left"> {baseWatershed.runoff}</td>
                      <td>{modelWatershed.runoff}</td>
                      <td>inches</td>
                      <td className="table-cell-left">{baseWatershed.runoff_total}</td>
                      <td>{modelWatershed.runoff_total}</td>
                      <td>acre-ft</td>
                      <td className="table-cell-left">{modelWatershed.runoff_per_diff}</td>
                      <td></td>
                   </tr>
                   <tr>
                      <td>Honey Bee Toxicity</td>
                      <td className="table-cell-left">{baseWatershed.insect}</td>
                      <td>{modelWatershed.insect}</td>
                      <td>insecticide index</td>
                      <td className="table-cell-left">NA</td>
                      <td>NA</td>
                      <td>NA</td>
                      <td className="table-cell-left">{modelWatershed.insect_per_diff}</td>
                      <td></td>
                   </tr>
                   <tr>
                      <td>Curve Number</td>
                      <td className="table-cell-left">{baseWatershed.cn}</td>
                      <td>{modelWatershed.cn}</td>
                      <td>curve number</td>
                      <td className="table-cell-left">NA</td>
                      <td>NA</td>
                      <td>NA</td>
                      <td className="table-cell-left">{modelWatershed.cn_per_diff}</td>
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
            {/*

            <Container className='progress_bar'>
             <ProgressBar variant="success" now={40} label='Progress'/>
            </Container>
            */}

              <Accordion  defaultActiveKey="aoi" id="uncontrolled-tab-example" className="mb-3" onSelect={(e) => this.tabControl(e)}>
              <Accordion.Item eventKey="aoi" title="Area of Interest" hidden={this.props.hideAOIAcc}>
                  <Accordion.Header>Select Work Area</Accordion.Header>
              <Accordion.Body>
              <Row>
                  <h5>Select a work area<sup>*</sup></h5>
                  <h5>(by clicking on the map)</h5>
                 <InputGroup size="sm" className="mb-3">
                 <h6 hidden={this.state.showHuc10}> Please select a region</h6>
                 <h6 hidden={!this.state.showHuc10}>  Select at least one large watershed </h6>
                 <div hidden={!this.state.showHuc10}> Hold shift to select multiple watersheds </div>
                  </InputGroup>
                  <h6>*All land transformations must reside in the work area</h6>
                   <Button hidden={!this.state.showHuc10} onClick={this.reset}  size="sm" variant="primary">Reset Work Area</Button>

              </Row>




              </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="selection" title="Selection" hidden={this.props.hideTransAcc}>
              {/*<Accordion.Item eventKey="selection" title="Selection" >*/}
                  <Accordion.Header>Build Scenario</Accordion.Header>

              <Accordion.Body>

                <div className = "criteriaSections">
                <Form.Label>1) Select at least one Land Type<sup>*</sup></Form.Label>
                    <Form >
                      <Form.Check
                        disabled={false} ref={this.contCorn} type="switch" label="Continuous Corn"
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
                      <Form.Check
                        ref={this.potato} type="switch" label="Potato and Vegetable"
                        onChange={(e) => this.handleSelectionChangeLand("potato", e)}
                      />
                      {/*


                        <Form.Check
                        hidden = {true}
                        ref={this.cranberry} type="switch" label="Cranberries"
                        onChange={(e) => this.handleSelectionChangeLand("cranberry", e)}
                      />
*/}

                      <Form.Check
                        ref={this.hay} type="switch" label="Hay"
                        onChange={(e) => this.handleSelectionChangeLand("hay", e)}
                      />
                      <Form.Check
                        ref={this.pasture} type="switch" label="Pasture"
                        onChange={(e) => this.handleSelectionChangeLand("pasture", e)}
                      />
                      <Form.Check
                        ref={this.grasslandIdle} type="switch" label="Idle Grassland"
                        onChange={(e) => this.handleSelectionChangeLand("grasslandIdle", e)}
                      />
                    </Form>
                    <sup>*</sup><a target="_blank" href="https://www.arcgis.com/home/item.html?id=b6cff8bd00304b73bb1d32f7678ecf34">Wiscland 2 Land Categories</a>
                </div>

                <div className = "criteriaSections">
                    <Form.Label>2) Optional Selection Options</Form.Label>
                    <Accordion onSelect={(e) => this.subAreaSelection(e)}>
                      <Accordion.Item eventKey="2">
                        <Accordion.Header>Sub Area</Accordion.Header>
                        <Accordion.Body>
                          <Row>
                               {/*<Form.Check
                                inline
                                label="Select Sub Watersheds"
                                ref={this.selectWatershed}
                                checked={this.state.selectWatershed}
                                name="group2"
                                type='radio'
                                onChange={(e) => this.handleAreaSelectionType("watershed", e)}
                              />*
                                <Button variant="secondary" onClick={(e) => this.handleAreaSelectionType("none", e)}>
                                Stop Selection
                              </Button>*/}
                               <h6> Hold shift to select multiple watersheds. </h6>
                               <h6> Close accordion to stop selection. </h6>
                                <Button variant="primary"  onClick={(e) => this.clearSelection("subArea")}>Clear Selection</Button>

                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion>
                      <Accordion.Item eventKey="3">
                        <Accordion.Header>Slope</Accordion.Header>
                        <Accordion.Body>
                        <Form.Group as={Row}>
                            <Form.Label>Slope Range</Form.Label>
                             <Col xs="12">
                                 <div style={{ margin: "5%", }}>
                                    <Slider
                                      mode={2}
                                      step={1}
                                      domain={domainSlope}
                                      rootStyle={sliderStyle}
                                      onUpdate={this.sliderChangeSlope}
                                      values={[this.props.activeTrans.selection.slope1,this.props.activeTrans.selection.slope2]}
                                    >
                                      <Rail>
                                        {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
                                      </Rail>
                                      <Handles>
                                        {({ handles, getHandleProps }) => (
                                          <div className="slider-handles">
                                            {handles.map((handle) => (
                                              <Handle
                                                key={handle.id}
                                                handle={handle}
                                                domain={domainSlope}
                                                getHandleProps={getHandleProps}
                                              />
                                            ))}
                                          </div>
                                        )}
                                      </Handles>
                                      <Tracks left={false} right={false}>
                                        {({ tracks, getTrackProps }) => (
                                          <div className="slider-tracks">
                                            {tracks.map(({ id, source, target }) => (
                                              <Track
                                                key={id}
                                                source={source}
                                                target={target}
                                                getTrackProps={getTrackProps}
                                              />
                                            ))}
                                          </div>
                                        )}
                                      </Tracks>
                                      <Ticks values={[0,10, 20, 30,40,50]}>
                                        {({ ticks }) => (
                                          <div className="slider-ticks">
                                            {ticks.map((tick) => (
                                              <Tick key={tick.id} tick={tick} count={ticks.length} />
                                            ))}
                                          </div>
                                        )}
                                      </Ticks>
                                    </Slider>
                                  </div>
                                  </Col>

                                </Form.Group>

                             <Form.Group as={Row}>

                                <Col xs="5">
                              <Form.Label>Minimum Slope</Form.Label>
                                  <Form.Control value={this.props.activeTrans.selection.slope1} size='sm'
                                    onChange={(e) => this.handleSelectionChange("slope1", e)}
                                  />
                                </Col>
                                <Col xs="5">
                            <Form.Label>Maximum Slope</Form.Label>
                                  <Form.Control value={this.props.activeTrans.selection.slope2} size='sm'
                                    onChange={(e) => this.handleSelectionChange("slope2", e)}
                                  />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mt-2">

                                <Button variant="primary"  onClick={(e) => this.clearSelection("slope")}>Clear Selection</Button>

                            </Form.Group>







                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <Accordion>

                      <Accordion.Item eventKey="4">
                        <Accordion.Header>Distance to Stream</Accordion.Header>
                        <Accordion.Body>
                            <Form.Group as={Row}>

                                <Col xs="12">
                                 <div style={{ margin: "5%", }}>
                                    <Slider
                                      mode={2}
                                      step={1}
                                      domain={domainStream}
                                      rootStyle={sliderStyle}
                                      onChange={this.sliderChangeStream}
                                      values={[this.props.activeTrans.selection.streamDist1,this.props.activeTrans.selection.streamDist2]}
                                    >
                                      <Rail>
                                        {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
                                      </Rail>
                                      <Handles>
                                        {({ handles, getHandleProps }) => (
                                          <div className="slider-handles">
                                            {handles.map((handle) => (
                                              <Handle
                                                key={handle.id}
                                                handle={handle}
                                                domain={domainStream}
                                                getHandleProps={getHandleProps}
                                              />
                                            ))}
                                          </div>
                                        )}
                                      </Handles>
                                      <Tracks left={false} right={false}>
                                        {({ tracks, getTrackProps }) => (
                                          <div className="slider-tracks">
                                            {tracks.map(({ id, source, target }) => (
                                              <Track
                                                key={id}
                                                source={source}
                                                target={target}
                                                getTrackProps={getTrackProps}
                                              />
                                            ))}
                                          </div>
                                        )}
                                      </Tracks>
                                      <Ticks count={4}>
                                        {({ ticks }) => (
                                          <div className="slider-ticks">
                                            {ticks.map((tick) => (
                                              <Tick key={tick.id} tick={tick} count={ticks.length} />
                                            ))}
                                          </div>
                                        )}
                                      </Ticks>
                                    </Slider>
                                  </div>
                                </Col>
                                </Form.Group>
                             <Form.Group as={Row}>
                                <Col xs="5">
                                    <Form.Label>Minimum Distance to Stream</Form.Label>
                                    <Form.Control value={this.props.activeTrans.selection.streamDist1} size='sm'
                                    onChange={(e) => this.handleSelectionChange("streamDist1", e)}
                                  />
                                </Col>
                                <Col xs="5">
                                    <Form.Label>Maximum Distance to Stream</Form.Label>
                                    <Form.Control value={this.props.activeTrans.selection.streamDist2} size='sm'
                                    onChange={(e) => this.handleSelectionChange("streamDist2", e)}
                                  />
                                </Col>
                                <Form.Label>Units</Form.Label>
                                <Form>
                                <Form.Check ref={this.feet} inline label="feet" name="group1" type="radio"
                                    onClick={(e) => this.handleSelectionChangeUnit("useFt", true, e)}
                                  />
                                  <Form.Check ref={this.meters} inline label="meters" name="group1" type="radio"
                                    onClick={(e) => this.handleSelectionChangeUnit("useFt", false, e)}
                                  />
                                  </Form>
                                <Button className="mt-2" variant="primary"  onClick={(e) => this.clearSelection("streamDist")}>Clear Selection</Button>
                            </Form.Group>



                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                   <Form.Label>Transparency</Form.Label>
                   <RangeSlider size='sm'
                    value={this.props.activeTrans.displayOpacity}
                    onChange={(e) => this.props.updateActiveTransProps({"name":"displayOpacity", "value":parseFloat(e.currentTarget.value), "type":"base"})}
                    max={100}
                    min={0}
                  />
                   <Stack gap={3}>
                   <Button onClick={this.displaySelectionCriteria} variant="primary" hidden={this.state.aoiOrDisplayLoading}>View and Save Selection</Button>
                    <Button id="btnModelsLoading" variant="primary" disabled hidden={!this.state.aoiOrDisplayLoading}>
                        <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                        Loading...
                     </Button>
                   </Stack>
                    </div>
                    <div className = "criteriaSections">
                                      <div>Work Area: {Math.round(this.props.aoiArea* 0.000247105).toLocaleString('en-US')} ac</div>
                      <Table striped bordered hover size="sm" responsive>
                      <thead>
                      <tr style={{textAlign:"center"}}>
                          <th>Name</th>
                          <th>Area (ac)</th>
                          <th>% Work Area</th>
                        </tr>
                      </thead>
                        {this.props.listTrans.map((trans, index) => (

                      <tbody>
                        <tr>
                          <td>{trans.name}</td>
                          <td>{trans.areaSelected.toLocaleString('en-US')}</td>
                          <td>{trans.areaSelectedPerWorkArea.toLocaleString('en-US')}</td>
                        </tr>
                       </tbody>
                        ))}
                    </Table>
                <Form.Label>3) Manage Your Land Transformations</Form.Label>

                  <TransformationTable/>
                  <Stack gap={3}>
                  <Button size="sm" variant="primary" onClick={this.addTrans}><PlusLg/></Button>
                     <Button onClick={this.handleOpenModalBase} variant="primary">Base Assumptions</Button>
                     </Stack>
                      </div>
                            {/* convert from sq m to acres*/}

                      <Form.Label>4) Assess Your Scenario</Form.Label>

                     <Stack gap={3}>
                     <Button onClick={this.runModels} variant="success" hidden={this.state.modelsLoading}>Assess Scenario</Button>
                     <Button id="btnModelsLoading" variant="success" disabled hidden={!this.state.modelsLoading}>
                        <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                        Loading...
                     </Button>
                      <Button variant="primary" hidden={!this.state.showViewResults} onClick={this.handleOpenModal}>View Results</Button>
                     </Stack>
              </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <Modal size="lg" show={this.state.baseModalShow} onHide={this.handleCloseModalBase} onShow={this.showModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Base Assumptions</Modal.Title>
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
                  <Button variant="secondary" onClick={this.handleCloseModalBase}>
                    Save
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