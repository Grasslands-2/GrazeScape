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
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import TooltipBootstrap from 'react-bootstrap/Tooltip'

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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import ReactSpeedometer from "react-d3-speedometer"
import ZingChart from 'zingchart-react';
import "zingchart/es6";
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
var selectionTime = 0
//const domain = [0, 700];
const domainSlope = [0, 51];
let domainStream = [0, 16000];
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
let chartList = []

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
let rasterDownloaded = false

class SidePanel extends React.Component{
    constructor(props){
        super(props)
        this.user = props.user
        this.runModels = this.runModels.bind(this);
        this.downloadBase = this.downloadBase.bind(this);
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        this.tabControl = this.tabControl.bind(this);
        this.tabControlResults = this.tabControlResults.bind(this);
        this.subAreaSelection = this.subAreaSelection.bind(this);
        this.addTrans = this.addTrans.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleOpenModalBase = this.handleOpenModalBase.bind(this);
        this.showModal = this.showModal.bind(this);
        this.handleCloseModalBase = this.handleCloseModalBase.bind(this);
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.printSummary = this.printSummary.bind(this);
        this.loadSelectionRaster = this.loadSelectionRaster.bind(this);
        this.displaySelectionCriteria = this.displaySelectionCriteria.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
        this.reset = this.reset.bind(this);
        this.sliderChangeSlope = this.sliderChangeSlope.bind(this);
        this.sliderChangeStream = this.sliderChangeStream.bind(this);
        this.getPhosValuesBase = this.getPhosValuesBase.bind(this);
        // selection criteria

        this.contCorn = React.createRef();
        this.cashGrain = React.createRef();
        this.dairy = React.createRef();
        this.potato = React.createRef();
//        this.cranberry = React.createRef();
        this.hay = React.createRef();
        this.pasture = React.createRef();
        this.grasslandIdle = React.createRef();

        this.land1 = React.createRef();
        this.land2 = React.createRef();
        this.land3 = React.createRef();
        this.land4 = React.createRef();
        this.land5 = React.createRef();
        this.land6 = React.createRef();
        this.land7 = React.createRef();
        this.land8 = React.createRef();
//        this.landErosion = React.createRef();
//        this.landRoot = React.createRef();
//        this.landWater = React.createRef();

        this.prime = React.createRef();
        this.stateFarm = React.createRef();
        this.notPrime = React.createRef();
        this.prime1 = React.createRef();
        this.prime2 = React.createRef();
        this.prime3 = React.createRef();

        this.feet = React.createRef();
        this.meters = React.createRef();

        this.rotationType = React.createRef();
        this.cover = React.createRef();
        this.tillage = React.createRef();
        this.density = React.createRef();
        this.contour = React.createRef();
//        this.fertilizer = React.createRef();
        this.nitrogen = React.createRef();
        this.nitrogen_fertilizer = React.createRef();
        this.phos_fertilizer = React.createRef();
        this.phos_manure = React.createRef();

        this.p2o5 = React.createRef();
        this.nFert = React.createRef();
        this.cornSeed = React.createRef();
        this.cornPest = React.createRef();
        this.cornMach = React.createRef();
        this.soySeed = React.createRef();
        this.soyPest = React.createRef();
        this.soyMach = React.createRef();
        this.alfaSeed = React.createRef();
        this.alfaPest = React.createRef();
        this.alfaMach = React.createRef();
        this.alfaFirstYear = React.createRef();
        this.oatSeed = React.createRef();
        this.oatPest = React.createRef();
        this.oatMach = React.createRef();
        this.pastSeed = React.createRef();
        this.pastPest = React.createRef();
        this.pastMach = React.createRef();



        this.slopeMax = 700;
        this.distStreamMax = 16000;
        this.selectWatershed = React.createRef();
        this.state = {slope:{slope1:null, slope2:null},
            geometry:{extents:[],coords:[]},
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
            phos_fert_options_holder:[],
            modelsLoading:false,
            showViewResults:false,
            showHuc10:false,
            showHuc12:false,
            printingPDF:false,
            speedometerWidth:window.innerWidth*.7/2,
            speedometerHeight:window.innerWidth*.7/2/2,
            landTypeSelected:false
        }
    }
    // fires anytime state or props are updated
    componentDidUpdate(prevProps) {
        console.log("UI updating")
        document.getElementById("loaderDiv").hidden = !this.state.aoiOrDisplayLoading
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
        let displayNext = false
//        todo this doesn't seem to quite be working properly
        for (let val in this.props.activeTrans.selection.landCover){
            if (this.props.activeTrans.selection.landCover[val] == true){
                displayNext = true
           }
        }
        console.log(displayNext, this.state.landTypeSelected)
        if (displayNext && this.state.landTypeSelected == false && !this.state.aoiOrDisplayLoading){
            this.setState({landTypeSelected:true})
        }
        else if (!displayNext && this.state.landTypeSelected == true && this.props.listTrans == 1){
            this.setState({landTypeSelected:false})
        }
//        if (landCoverCounter == Object.keys(this.props.activeTrans.selection.landCover).length){
//            console.log("hide everything")
//            this.setState({landTypeSelected:false})
//        }

        this.land1.current.checked = this.props.activeTrans.selection.landClass.land1
        this.land2.current.checked = this.props.activeTrans.selection.landClass.land2
        this.land3.current.checked = this.props.activeTrans.selection.landClass.land3
        this.land4.current.checked = this.props.activeTrans.selection.landClass.land4
        this.land5.current.checked = this.props.activeTrans.selection.landClass.land5
        this.land6.current.checked = this.props.activeTrans.selection.landClass.land6
        this.land7.current.checked = this.props.activeTrans.selection.landClass.land7
        this.land8.current.checked = this.props.activeTrans.selection.landClass.land8
//        this.landErosion = React.createRef();
//        this.landRoot = React.createRef();
//        this.landWater = React.createRef();

        this.prime.current.checked = this.props.activeTrans.selection.farmClass.prime
        this.stateFarm.current.checked = this.props.activeTrans.selection.farmClass.stateFarm
        this.notPrime.current.checked = this.props.activeTrans.selection.farmClass.notPrime
        this.prime1.current.checked = this.props.activeTrans.selection.farmClass.prime1
        this.prime2.current.checked = this.props.activeTrans.selection.farmClass.prime2
        this.prime3.current.checked = this.props.activeTrans.selection.farmClass.prime3

//       which unit to use for steam distance
        if (this.props.activeTrans.selection.useFt){
            this.feet.current.checked = true
            this.meters.current.checked = false
        }
        else{
            this.meters.current.checked = true
            this.feet.current.checked = false
        }
        if(prevProps.baseTrans.management.nitrogen != this.props.baseTrans.management.nitrogen){
            console.log("Nitrogen has changed, calculate new P")
            this.getPhosValuesBase()
        }
//        if region is changed show huc 10
        if (prevProps.region != this.props.region){
            if(this.props.region != null){
                if(this.props.region == "southWestWI"){
                    this.props.updateActiveBaseProps({"name":"cover", "value":"nc", "type":"mang"})
                    this.props.updateActiveBaseProps({"name":"tillage", "value":"su", "type":"mang"})
                    this.props.updateActiveBaseProps({"name":"contour", "value":"1", "type":"mang"})
                    this.props.updateActiveBaseProps({"name":"fertilizer", "value":"0_100", "type":"mang"})
                    this.props.updateActiveBaseProps({"name":"nitrogen", "value":"0", "type":"mang"})
                    this.props.updateActiveBaseProps({"name":"nitrogen_fertilizer", "value":"0", "type":"mang"})

                    this.props.updateActiveBaseProps({"name":"legume", "value":"false", "type":"mang"})
                }
//                clover belt for now
               else{
                    this.props.updateActiveBaseProps({"name":"cover", "value":"nc", "type":"mang"})
                    this.props.updateActiveBaseProps({"name":"tillage", "value":"su", "type":"mang"})
                    this.props.updateActiveBaseProps({"name":"contour", "value":"0", "type":"mang"})
                    this.props.updateActiveBaseProps({"name":"fertilizer", "value":"0_100", "type":"mang"})
                    this.props.updateActiveBaseProps({"name":"nitrogen", "value":"0", "type":"mang"})
                    this.props.updateActiveBaseProps({"name":"nitrogen_fertilizer", "value":"0", "type":"mang"})

                    this.props.updateActiveBaseProps({"name":"legume", "value":"false", "type":"mang"})
               }

//                this.setState({showHuc10:true})
                this.setState({showHuc12:true})
            }
//           console.log(this.state.showHuc10)
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }
    tabControlResults(tabName){
        console.log(tabName)
        if (tabName == "gauges"){
            setTimeout(function(){
                let width = document.getElementById("modalResults").offsetWidth
                this.setState({ speedometerWidth: width, speedometerHeight:width/2});
            }.bind(this), 1)
        }
    }
    updateDimensions = () => {
//        console.log("dimensions updated", window.innerWidth, window.innerHeight)
        let width = 0
        if(document.getElementById("modalResults") != null){
            width = document.getElementById("modalResults").offsetWidth
        }
        else{
            width = window.innerWidth*.7/2
        }
        console.log(width)
        this.setState({ speedometerWidth: width, speedometerHeight:width/2});
    };


    sliderChangeSlope(e){
//        console.log("slider change")
//        console.log(e)
//        if slope entered in textbox is greater than box domain dont update slider
        if(e[1] != domainSlope[1]){
//            console.log("not updating")
//            this.props.updateActiveTransProps({"name":"slope2", "value":e[1], "type":"reg"})
            this.handleSelectionChangeGeneralNumeric("slope2", "reg", e[1])


        }
//            this.props.updateActiveTransProps({"name":"slope1", "value":e[0], "type":"reg"})
            this.handleSelectionChangeGeneralNumeric("slope1", "reg", e[0])
    }
    sliderChangeStream(e){
//        console.log("slider change")
//        console.log(e)
//        this.props.updateActiveTransProps({"name":"streamDist1", "value":e[0], "type":"reg"})
        this.handleSelectionChangeGeneralNumeric("streamDist1", "reg", e[0])

//        this.props.updateActiveTransProps({"name":"streamDist2", "value":e[1], "type":"reg"})
        this.handleSelectionChangeGeneralNumeric("streamDist2", "reg", e[1])

    }
      handleCloseModalBase(){
        this.downloadBase()
        this.setState({baseModalShow: false})
      }
      handleOpenModalBase(){
        this.setState({baseModalShow: true})
      }
    showModal(){
        console.log("showing modal")
        this.getPhosValuesBase()
        console.log(this.props)
//        this.rotationType.current.value = this.props.baseTrans.management.rotationType
        this.cover.current.value = this.props.baseTrans.management.cover
        this.tillage.current.value = this.props.baseTrans.management.tillage
//        this.density.current.value = this.props.baseTrans.management.density
        this.contour.current.value = this.props.baseTrans.management.contour
//        this.fertilizer.current.value = this.props.baseTrans.management.fertilizer
        this.nitrogen.current.value = this.props.baseTrans.management.nitrogen
        this.nitrogen_fertilizer.current.value = this.props.baseTrans.management.nitrogen_fertilizer


        this.p2o5.current.value = this.props.baseTrans.econ.p2o5
        this.nFert.current.value = this.props.baseTrans.econ.nFert
        this.cornSeed.current.value = this.props.baseTrans.econ.cornSeed
        this.cornPest.current.value = this.props.baseTrans.econ.cornPest
        this.cornMach.current.value = this.props.baseTrans.econ.cornMach
        this.soySeed.current.value = this.props.baseTrans.econ.soySeed
        this.soyPest.current.value = this.props.baseTrans.econ.soyPest
        this.soyMach.current.value = this.props.baseTrans.econ.soyMach
        this.alfaSeed.current.value = this.props.baseTrans.econ.alfaSeed
        this.alfaPest.current.value = this.props.baseTrans.econ.alfaPest
        this.alfaMach.current.value = this.props.baseTrans.econ.alfaMach
        this.alfaFirstYear.current.value = this.props.baseTrans.econ.alfaFirstYear
        this.oatSeed.current.value = this.props.baseTrans.econ.oatSeed
        this.oatPest.current.value = this.props.baseTrans.econ.oatPest
        this.oatMach.current.value = this.props.baseTrans.econ.oatMach
        this.pastSeed.current.value = this.props.baseTrans.econ.pastSeed
        this.pastPest.current.value = this.props.baseTrans.econ.pastPest
        this.pastMach.current.value = this.props.baseTrans.econ.pastMach



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
//        this.props.updateActiveTransProps({"name":type, "value":e.currentTarget.value, "type":"reg"})
        this.handleSelectionChangeGeneral(type, "reg", e)
    }
    updateActiveBaseProps(type, e){
        this.props.updateActiveBaseProps({"name":type, "value":e.currentTarget.value, "type":"mang"})
        console.log(this.props)
    }
    updateActiveBaseEcon(type, e){
        this.props.updateActiveBaseProps({"name":type, "value":e.currentTarget.value, "type":"econ"})

    }
    handleSelectionChangeLand(type, e){
//        this.props.updateActiveTransProps({"name":type, "value":e.currentTarget.checked, "type":"land"})
        this.handleSelectionChangeGeneral(type, "land", e)
    }
    handleSelectionChangeGeneral(name, type, e){
        this.setState({aoiOrDisplayLoading:false})
        this.setState({aoiOrDisplayLoading:true})

        console.log(name, type)
        this.props.updateActiveTransProps({"name":name, "value":e.currentTarget.checked, "type":type})
        selectionTime = new Date();
        setTimeout(function(){
            if (new Date() - selectionTime >= 1000 && rasterDownloaded){
                console.log("active trans ",this.props.activeTrans)
                this.displaySelectionCriteria()
            }

        }.bind(this), 1000)
    }
    handleSelectionChangeGeneralNumeric(name, type, e){
//        this is a hack. slope1 is being triggered at the beginning of the app
        if (name == "slope1" && this.props.listTrans.length < 1){return}

        this.setState({aoiOrDisplayLoading:false})
        this.setState({aoiOrDisplayLoading:true})


        this.props.updateActiveTransProps({"name":name, "value":e, "type":type})
        this.setState({aoiOrDisplayLoading:false})
        this.setState({aoiOrDisplayLoading:true})
        selectionTime = new Date();
        setTimeout(function(){
            if (new Date() - selectionTime >= 1000 && rasterDownloaded){
                console.log(name)
                this.displaySelectionCriteria()
            }

        }.bind(this), 1000)

    }
    handleSelectionChangeUnit(type, useFt, e){
        console.log(type)
        console.log(useFt)
        let dist = this.props.activeTrans.selection.streamDist2
        console.log(this.props.activeTrans.selection.streamDist2)
        console.log(!useFt)
        console.log(dist == 16000)
//        converting to meters or feet
        if(!useFt && dist == 16000){
            console.log("converting to meters")
            dist = 4878
//            this.props.updateActiveTransProps({"name":"streamDist2", "value":dist, "type":"reg"})
            this.handleSelectionChangeGeneralNumeric("streamDist2", "reg", dist)
            domainStream[1] = 4878
        }
        else if(useFt && dist == 4878) {
            dist = 16000
//            this.props.updateActiveTransProps({"name":"streamDist2", "value":dist, "type":"reg"})
            this.handleSelectionChangeGeneralNumeric("streamDist2", "reg", dist)
            domainStream[1] = 16000
        }
//        this.props.updateActiveTransProps({"name":"streamDist2", "value":e[1], "type":"reg"})

//        this.props.updateActiveTransProps({"name":type, "value":useFt, "type":"reg"})
        console.log(domainStream)
        this.handleSelectionChangeGeneralNumeric(type, "reg", useFt)


    }
    reset(){
//      clear any selection criteria
        this.clearSelection("all")
//        this.setState({showHuc10:false})
        this.setState({showHuc12:false})
        this.props.setActiveRegion(null)
        this.props.setVisibilityMapLayer([
            {'name':'southWest', 'visible':true},
            {'name':'southCentral', 'visible':true},
            {'name':'cloverBelt', 'visible':true},
            {'name':'subHuc12', 'visible':false},
//            {'name':'huc10', 'visible':true},
            {'name':'huc12', 'visible':true}
            ])
        this.props.updateActiveBaseProps({"name":"cover", "value":"nc", "type":"mang"})
        this.props.updateActiveBaseProps({"name":"tillage", "value":"su", "type":"mang"})
        this.props.updateActiveBaseProps({"name":"contour", "value":"1", "type":"mang"})
        this.props.updateActiveBaseProps({"name":"fertilizer", "value":"50_50", "type":"mang"})
        this.props.updateActiveBaseProps({"name":"nitrogen", "value":"125", "type":"mang"})
        this.props.updateActiveBaseProps({"name":"nitrogen_fertilizer", "value":"25", "type":"mang"})
        this.props.updateActiveBaseProps({"name":"phos_manure", "value":"0", "type":"mang"})
        this.props.updateActiveBaseProps({"name":"legume", "value":"false", "type":"mang"})
        console.log("huc 10 vis ", this.state.showHuc10)
        this.setState({aoiOrDisplayLoading:false})
//        document.getElementById("loaderDiv").hidden = !this.state.aoiOrDisplayLoading

//        remove all transformations
// remove activate transformation
// display all learning hubs

    }
    // fires when we switch tab so we can download the work area rasters
  tabControl(e){
    if(e == "selection"){
        // get bounds of current selection method and start downloading

        this.loadSelectionRaster()

        // turn off huc 10
        this.props.setVisibilityMapLayer([
//            {'name':'huc10', 'visible':false},
            {'name':'huc12', 'visible':false},
            {'name':'southWest', 'visible':false},
            {'name':'southCentral', 'visible':false},
            {'name':'cloverBelt', 'visible':false}
            ])
//        this.props.setVisibilityMapLayer()
//        this.props.setVisibilityMapLayer({'name':'huc12', 'visible':true})
    }
    else if (e == "aoi"){
        this.props.setVisibilityMapLayer([{'name':'huc12', 'visible':true}])
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
    let tempId = uuidv4();
    console.log("trans id ", tempId)
//  set default parameters
    let newTrans = Transformation(" ",tempId, 5)
    newTrans.management.rotationType = "pasture"
    newTrans.management.density = "rt_rt"
    newTrans.management.fertilizer = "0_100"
    newTrans.management.nitrogen = "0"
    newTrans.management.nitrogen_fertilizer = "0"
//    newTrans.management.phos_fertilizer = "0"
//    newTrans.management.phos_manure = "0"
    newTrans.management.legume = "false"
    newTrans.management.contour = "1"
    newTrans.management.cover = "nc"
    newTrans.management.tillage = "su"
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
    rasterDownloaded = false
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
    let downloadFolder = uuidv4();
    this.props.setAoiFolderId(downloadFolder)
    this.setState({aoiOrDisplayLoading:true})
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
            baseTrans: this.props.baseTrans,
            folderId: downloadFolder,
        }),
        success: (response, opts) => {
            delete $.ajaxSetup().headers
            console.log("raster loaded");
            console.log(response);
            this.setState({boundaryRasterId:response.folder_id})
//            this.props.setAoiFolderId(response.folder_id)
            console.log(this.state)
//            alert("Raster loaded")
            this.setState({aoiOrDisplayLoading:false})
            rasterDownloaded = true
            this.displaySelectionCriteria()
        },
        failure: function(response, opts) {
        }
    });

  }
  // get display raster from active transformation
  displaySelectionCriteria(){
    this.setState({aoiOrDisplayLoading:true})
    // ajax call with selection criteria
    let transPayload = JSON.parse(JSON.stringify(this.props.activeTrans))
    var csrftoken = Cookies.get('csrftoken');
    if(this.props.region == null){
            this.setState({aoiOrDisplayLoading:false})

        return
    }
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
//          only works if whole area is selected
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
  downloadBase(){
    var csrftoken = Cookies.get('csrftoken');
        $.ajaxSetup({
            headers: { "X-CSRFToken": csrftoken }
        });
        let payload = {
                baseTrans:this.props.baseTrans,
                folderId: this.props.aoiFolderId,
                region: this.props.region,
            }
        console.log(payload)
        payload = JSON.stringify(payload)
        $.ajax({
            url : '/smartscape/download_base_rasters',
            type : 'POST',
            data : payload,
            success: (responses, opts) => {
                delete $.ajaxSetup().headers
                console.log("base loaded")
            },
            failure: function(response, opts) {
            }
        })
  }
   runModels(){
        // ajax call with selection criteria
        this.setState({modelsLoading:true})
        console.log("Running models!!")
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
//        let transPayload1 = JSON.parse(JSON.stringify(this.props.listTrans))
//
//        for(let trans in transPayload1){
//            console.log( transPayload1[trans])
//
//        }
        console.log(transPayload)
        console.log(this.props.baseTrans)
        // add method to only grab required trans data and get the rank based on list order
        var csrftoken = Cookies.get('csrftoken');
        $.ajaxSetup({
            headers: { "X-CSRFToken": csrftoken }
        });
        let payload = {
                trans: transPayload,
                base:this.props.baseTrans,
                folderId: this.props.aoiFolderId,
                region: this.props.region,
                aoiArea: this.props.aoiArea,
                aoiExtents: this.props.extents,
                baseLoaded:true
            }
        console.log(payload)
        payload = JSON.stringify(payload)
        $.ajax({
            url : '/smartscape/get_transformed_land',
            type : 'POST',
            data : payload,
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
   getPhosValuesBase(){
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
                base_calc: true,
            }
        console.log(payload)
        payload = JSON.stringify(payload)
        $.ajax({
            url : '/smartscape/get_phos_fert_options',
            type : 'POST',
            data : payload,
            success: (response, opts) => {
                delete $.ajaxSetup().headers
                console.log("done with model runs")
                console.log(response)

//                let phos_options = response.response["base"].p_choices
                let phos_options = response.response["base"].p_choices
                let manure_value = response.response["base"].p_manure
//                let manure_value = response.response["base"].p_manure
                console.log(phos_options, manure_value)

                this.props.updateActiveBaseProps({"name":"phos_manure", "value": manure_value, "type":"mang"})
//                this.props.updateActiveBaseProps({"name":"phos_fert_options", "value": phos_options, "type":"mang"})
                this.props.updateActiveBaseProps({"name":"phos_fertilizer", "value":phos_options[0], "type":"mang"})

//                this.phos_fert_options_holder = ["6","8","9"]
                this.setState({phos_fert_options_holder:phos_options})
                this.phos_manure.current.value = manure_value
                this.phos_fertilizer.current.value = phos_options[0]

                console.log(this.phos_fertilizer )

            },

            failure: function(response, opts) {
            }
        })
  }
    printSummary(){
        var doc = new jsPDF();
//        var node = document.getElementById("map")
//        var clone = node.cloneNode(true);
//        doc.html(document.getElementById("map"), {
//           callback: function (doc) {
//             doc.save("test1.pdf");
//           }
//        });


        this.setState({printingPDF:true})
        var pdf = new jsPDF('p', 'pt',"letter" )
//        var pdf = new jsPDF('p', 'pt',[4000, 4000] )


        console.log(pdf)
        console.log(pdf.getCurrentPageInfo().pageContext.mediaBox)
        var pageWidth = pdf.getCurrentPageInfo().pageContext.mediaBox.topRightX
        var pageHeight = pdf.getCurrentPageInfo().pageContext.mediaBox.topRightY
        console.log("page width ", pageWidth,pageHeight)

        var canvas = document.getElementById("selChart1");
        var div = document.getElementById("chartPrintDiv");
        var rowNum = 0
        div.hidden = false
        setTimeout(function(){
    //        canvas.width = 830
    //        canvas.height = 414
//            var ctx = canvas.getContext("2d");
//            pdf.html(document.getElementById("selChart1")).then(() => pdf.save('fileName.pdf'));
          var width = document.getElementById("map").offsetWidth
          var scale = (pageWidth / width)
            console.log(width, scale)
//            html2canvas(document.getElementById("map"),{scale:0.25}).then(function(canvasMap) {
//                pdf.addPage(imgData,'l')
                pdf.autoTable({
                    html: '#transResultsTable',
                    styles: {
                    fillColor: [0, 0, 0,0],
                     textColor:[0, 0, 0],
                     lineColor:[0, 0, 0],
                     lineWidth:1
                     }
                })

//
//                var newCanvas = canvasMap.cloneNode(true);
//                var ctx = newCanvas.getContext('2d');
//                console.log(newCanvas.width)
//                var ratio1 = (pageWidth / newCanvas.width)
//                var ratio1 = 2
//                console.log(ratio1)
//                console.log(newCanvas)
//                newCanvas.width =pageWidth;
//                newCanvas.height = pageHeight;
//                newCanvas.style.width = pageWidth+ "px";
//                newCanvas.style.height = pageHeight+ "px";
////                ctx.setTransform(ratio1,0,0,ratio1,0,0);
//                console.log(newCanvas)
//                var imgData = canvasMap.toDataURL("image/png", 1);
//                pdf.addPage("letter",'p')
//                pdf.addImage(imgData, 'png', 0, 0,0,0);
//
////                document.body.appendChild(canvas);
//
                pdf.addPage("p",'p')
                pdf.text("By Selection", 20, 20)
                for (let i = 1; i <= 8; i++) {
//                    console.log("loop ", i)
                    canvas = document.getElementById("selChart" + i);
                    var newCanvas = canvas.cloneNode(true);
                    var ctx = newCanvas.getContext('2d');
                    var ratio1 = (pageWidth / newCanvas.width)/2
                    newCanvas.width = newCanvas.width * ratio1;
                    newCanvas.height = newCanvas.height * ratio1;
                    newCanvas.style.width = (newCanvas.width)+ "px";
                    newCanvas.style.height = (newCanvas.height)+ "px";
                    ctx.setTransform(ratio1,0,0,ratio1,0,0);

                    ctx.fillStyle = "#FFF";
                    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
                    ctx.drawImage(canvas, 0, 0);
                    var imgData = newCanvas.toDataURL("image/png", 1);
//                    console.log("row ", newCanvas.width * ((i-1)%2), " column ", newCanvas.height * (Math.floor(i / 2) + i%2 -1))
                    pdf.addImage(imgData, 'png', newCanvas.width * ((i-1)%2), 40 + newCanvas.height * (Math.floor(i / 2) + i%2 -1),0,0);
                }
                 pdf.addPage(imgData,'p')
                 pdf.text("By Watershed", 20, 20)
                for (let i = 1; i <= 8; i++) {
//                    console.log("loop ", i)
                    canvas = document.getElementById("watChart" + i);
                    var newCanvas = canvas.cloneNode(true);
                    var ctx = newCanvas.getContext('2d');
                    var ratio1 = (pageWidth / newCanvas.width)/2
                    newCanvas.width = newCanvas.width * ratio1;
                    newCanvas.height = newCanvas.height * ratio1;
                    newCanvas.style.width = (newCanvas.width)+ "px";
                    newCanvas.style.height = (newCanvas.height)+ "px";
                    ctx.setTransform(ratio1,0,0,ratio1,0,0);

                    ctx.fillStyle = "#FFF";
                    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
                    ctx.drawImage(canvas, 0, 0);
                    var imgData = newCanvas.toDataURL("image/png", 1);
//                    console.log("row ", newCanvas.width * ((i-1)%2), " column ", newCanvas.height * (Math.floor(i / 2) + i%2 -1))
                    pdf.addImage(imgData, 'png', newCanvas.width * ((i-1)%2), 40 + newCanvas.height * (Math.floor(i / 2) + i%2 -1),0,0);
                }
                pdf.addPage(imgData,'p')
                pdf.text("Comparison Charts", 20, 20)
                for (let i = 1; i <= 4; i++) {
//                    console.log("loop ", i)
                    canvas = document.getElementById("comChart" + i);
                    var newCanvas = canvas.cloneNode(true);
                    var ctx = newCanvas.getContext('2d');
                    var ratio1 = (pageWidth / newCanvas.width)/2
                    newCanvas.width = newCanvas.width * ratio1;
                    newCanvas.height = newCanvas.height * ratio1;
                    newCanvas.style.width = (newCanvas.width)+ "px";
                    newCanvas.style.height = (newCanvas.height)+ "px";
                    ctx.setTransform(ratio1,0,0,ratio1,0,0);

                    ctx.fillStyle = "#FFF";
                    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
                    ctx.drawImage(canvas, 0, 0);
                    var imgData = newCanvas.toDataURL("image/png", 1);
//                    console.log("row ", newCanvas.width * ((i-1)%2), " column ", newCanvas.height * (Math.floor(i / 2) + i%2 -1))
                    pdf.addImage(imgData, 'png', newCanvas.width * ((i-1)%2), 40 + newCanvas.height * (Math.floor(i / 2) + i%2 -1),0,0);
                }


                pdf.addPage(imgData,'l')
                pdf.autoTable({
                    html: '#summaryTable',
                    styles: {
                    fillColor: [0, 0, 0,0],
                     textColor:[0, 0, 0],
                     lineColor:[0, 0, 0],
                     lineWidth:1
                     }
                })
                pdf.save("SmartScape.pdf");
                div.hidden = true
//            })
        this.setState({printingPDF:false})
        }.bind(this), 3000)

    }
renderModal(){
//     let width = document.getElementById("modalResults").offsetWidth
//     this.setState({ speedometerWidth: width});
    var pdf = new jsPDF('p', 'pt',"letter" )
    var pageWidth = pdf.getCurrentPageInfo().pageContext.mediaBox.topRightX
    var labels = ['Yield', 'Erosion',
        'Phosphorus Loss', 'Runoff',
        'Honey Bee Toxicity', 'Curve Number', "Bird Friendliness", "Economics", "Nitrate Leaching"
    ]
//    console.log(this.state.modelOutputs)
    let model = {
        "yield":null, "yield_total":null, "yield_per_diff":null,
        "ero":null, "ero_total":null,"ero_per_diff":null,
        "ploss":null, "ploss_total":null,"ploss_per_diff":null,
        "econ":null, "econ_total":null,"econ_per_diff":null,
        "nitrate":null, "nitrate_total":null,"nitrate_per_diff":null,
        "cn":null,"cn_per_diff":null,
        "runoff":null,"runoff_per_diff":null,
        "insect":null,"insect_per_diff":null,
        "bird":null,"bird_per_diff":null,
    }
    let base = {
        "yield":null, "yield_total":null, "yield_per_diff":null,
        "ero":null, "ero_total":null,"ero_per_diff":null,
        "ploss":null, "ploss_total":null,"ploss_per_diff":null,
        "econ":null, "econ_total":null,"econ_per_diff":null,
         "nitrate":null, "nitrate_total":null,"nitrate_per_diff":null,

        "cn":null,"cn_per_diff":null,
        "runoff":null,"runoff_per_diff":null,
        "insect":null,"insect_per_diff":null,
        "bird":null,"bird_per_diff":null,
    }
    let modelWatershed = {
        "yield":null, "yield_total":null, "yield_per_diff":null,
        "ero":null, "ero_total":null,"ero_per_diff":null,
        "ploss":null, "ploss_total":null,"ploss_per_diff":null,
         "econ":null, "econ_total":null,"econ_per_diff":null,
        "nitrate":null, "nitrate_total":null,"nitrate_per_diff":null,

        "cn":null,"cn_per_diff":null,
        "runoff":null,"runoff_per_diff":null,
        "insect":null,"insect_per_diff":null,
        "bird":null,"bird_per_diff":null,
    }
    let baseWatershed = {
        "yield":null, "yield_total":null, "yield_per_diff":null,
        "ero":null, "ero_total":null,"ero_per_diff":null,
        "ploss":null, "ploss_total":null,"ploss_per_diff":null,
         "econ":null, "econ_total":null,"econ_per_diff":null,
      "nitrate":null, "nitrate_total":null,"nitrate_per_diff":null,

        "cn":null,"cn_per_diff":null,
        "runoff":null,"runoff_per_diff":null,
        "insect":null,"insect_per_diff":null,
        "bird":null,"bird_per_diff":null,
    }
    let areaCalc = 0
    let area = 0
    let areaWatershed = 0
    let areaWatershedCalc = 0
    let radarData = [[1,1,1,1,1,1,1,1,1],[2,2,2,2,2,2,2,2,2]]
    let dataRadar = charts.getChartDataRadar(labels, radarData)
    let dataRadarWatershed = charts.getChartDataRadar(labels, radarData)
    let dataBarPercent = charts.getChartDataBarPercent(labels, [0, 59, 80, -81, 56, 55, 40, 40, 40,40])
    let dataBarPercentWatershed = charts.getChartDataBarPercent(labels, [0, 59, 80, -81, 56, 55, 40,40, 40,40])

    this.dataYield = charts.getChartDataBar([1,null], [null,5])
    let dataEro= dataBarPercent
    let dataPloss= dataBarPercent
    let dataRun= dataBarPercent
    let dataInsect= dataBarPercent
    let dataCN = dataBarPercent
    let dataBird = dataBarPercent
    let dataEcon = dataBarPercent
    let dataNitrate = dataBarPercent

    let dataYieldWatershed = dataBarPercent
    let dataEroWatershed= dataBarPercent
    let dataPlossWatershed= dataBarPercent
    let dataRunWatershed= dataBarPercent
    let dataInsectWatershed= dataBarPercent
    let dataCNWatershed = dataBarPercent
    let dataBirdWatershed = dataBarPercent
    let dataEconWatershed = dataBarPercent
    let dataNitrateWatershed = dataBarPercent

    let optionsBarPercent = charts.getOptionsBarPercent()
    this.optionsYield = charts.getOptionsBar("Yield", "tons-dry matter/acre/year")
    let optionsEro = optionsBarPercent
    let optionsPloss = optionsBarPercent
    let optionsRun = optionsBarPercent
    let optionsInsect = optionsBarPercent
    let optionsCN = optionsBarPercent
    let optionsBird= optionsBarPercent
    let optionsEcon= optionsBarPercent
    let optionsNitrate= optionsBarPercent
    let configErosionGauge = {
      type: "gauge",
      legend: {

        },
        title: {
          text: "Erosion"
        },

      'scale-r': {
        aperture: 200,     //Specify your scale range.
        values: "0:20:5", //Provide min/max/step scale values.
        ring: {
          size:10,
           rules: [
        {
          rule: "%v >= 0 && %v <= 5",
          'background-color': "green red"
        },
        {
          rule: "%v >= 5 && %v <= 10",
          'background-color': "yellow"
        },
        {
          rule: "%v >= 10 && %v <= 15",
          'background-color': "rgb(245, 117, 66)"
        },
        {
          rule: "%v >= 15 && %v <= 20",
          'background-color': "red"
        },

      ],

        },
//        labels: [ "0", "Poor", "Fair", "Good", "Great", "100" ],  //Scale Labels
        labels: [ "Great", "Good", "Fair", "Poor", "Worst"],  //Scale Labels
        item: {    //Scale Label Styling
          'font-color': "purple",
          'font-family': "Georgia, serif",
          'font-size':12,
          'font-weight': "bold",     //or "normal"
          'font-style': "normal",    //or "italic"
          'offset-r': -50,    //To adjust the placement of your scale labels.
          angle: "auto"    //To adjust the angle of your scale labels.
        }
      },
        tooltip: { //Tooltips
          text: "%t - %v",
          'font-color': "black",
          'font-family': "Georgia",
          'background-color': "white",
          alpha:0.7,
          'border-color': "none"
        },
          series: [
            { values: [13], text: "Base",'background-color': '#be5dc2 '},
            { values: [2], text: "Transformation",'background-color': 'rgba(0, 119, 187,1)'},
          ]
    }
    let configPhosGauge =  structuredClone(configErosionGauge)
    configPhosGauge.title.text = "Phosphorus Loss"
    configPhosGauge.series[1].values[0] = 5

//    populate data if we have model outputs
    if (this.state.modelOutputs.hasOwnProperty("base")){
        model.yield = this.state.modelOutputs.model.yield.total_per_area
        model.yield_total = this.state.modelOutputs.model.yield.total
        model.ero = this.state.modelOutputs.model.ero.total_per_area
        model.ero_total = this.state.modelOutputs.model.ero.total
        model.ploss = this.state.modelOutputs.model.ploss.total_per_area
        model.ploss_total = this.state.modelOutputs.model.ploss.total
        model.econ = this.state.modelOutputs.model.econ.total_per_area
        model.econ_total = this.state.modelOutputs.model.econ.total
        model.nitrate = this.state.modelOutputs.model.nitrate.total_per_area
        model.nitrate_total = this.state.modelOutputs.model.nitrate.total

        model.cn = this.state.modelOutputs.model.cn.total_per_area
        model.runoff = this.state.modelOutputs.model.runoff.total_per_area
        model.runoff_total = this.state.modelOutputs.model.runoff.total
        model.insect = this.state.modelOutputs.model.insect.total_per_area
        model.bird = this.state.modelOutputs.model.bird.total_per_area

        base.yield = this.state.modelOutputs.base.yield.total_per_area
        base.yield_total = this.state.modelOutputs.base.yield.total
        base.ero = this.state.modelOutputs.base.ero.total_per_area
        base.ero_total = this.state.modelOutputs.base.ero.total
        base.ploss = this.state.modelOutputs.base.ploss.total_per_area
        base.ploss_total = this.state.modelOutputs.base.ploss.total
        base.econ = this.state.modelOutputs.base.econ.total_per_area
        base.econ_total = this.state.modelOutputs.base.econ.total
        base.nitrate = this.state.modelOutputs.base.nitrate.total_per_area
        base.nitrate_total = this.state.modelOutputs.base.nitrate.total

        base.cn = this.state.modelOutputs.base.cn.total_per_area
        base.runoff = this.state.modelOutputs.base.runoff.total_per_area
        base.runoff_total = this.state.modelOutputs.base.runoff.total
        base.insect = this.state.modelOutputs.base.insect.total_per_area
        base.bird = this.state.modelOutputs.base.bird.total_per_area


        modelWatershed.yield = this.state.modelOutputs.model.yield.total_per_area_watershed
        modelWatershed.yield_total = this.state.modelOutputs.model.yield.total_watershed
        modelWatershed.ero = this.state.modelOutputs.model.ero.total_per_area_watershed
        modelWatershed.ero_total = this.state.modelOutputs.model.ero.total_watershed
        modelWatershed.ploss = this.state.modelOutputs.model.ploss.total_per_area_watershed
        modelWatershed.ploss_total = this.state.modelOutputs.model.ploss.total_watershed
        modelWatershed.econ = this.state.modelOutputs.model.econ.total_per_area_watershed
        modelWatershed.econ_total = this.state.modelOutputs.model.econ.total_watershed
        modelWatershed.nitrate = this.state.modelOutputs.model.nitrate.total_per_area_watershed
        modelWatershed.nitrate_total = this.state.modelOutputs.model.nitrate.total_watershed

        modelWatershed.cn = this.state.modelOutputs.model.cn.total_per_area_watershed
        modelWatershed.runoff = this.state.modelOutputs.model.runoff.total_per_area_watershed
        modelWatershed.runoff_total = this.state.modelOutputs.model.runoff.total_watershed
        modelWatershed.insect = this.state.modelOutputs.model.insect.total_per_area_watershed
        modelWatershed.bird = this.state.modelOutputs.model.bird.total_per_area_watershed

        baseWatershed.yield = this.state.modelOutputs.base.yield.total_per_area_watershed
        baseWatershed.yield_total = this.state.modelOutputs.base.yield.total_watershed
        baseWatershed.ero = this.state.modelOutputs.base.ero.total_per_area_watershed
        baseWatershed.ero_total = this.state.modelOutputs.base.ero.total_watershed
        baseWatershed.ploss = this.state.modelOutputs.base.ploss.total_per_area_watershed
        baseWatershed.ploss_total = this.state.modelOutputs.base.ploss.total_watershed
        baseWatershed.econ = this.state.modelOutputs.base.econ.total_per_area_watershed
        baseWatershed.econ_total = this.state.modelOutputs.base.econ.total_watershed
        baseWatershed.nitrate = this.state.modelOutputs.base.nitrate.total_per_area_watershed
        baseWatershed.nitrate_total = this.state.modelOutputs.base.nitrate.total_watershed

        baseWatershed.cn = this.state.modelOutputs.base.cn.total_per_area_watershed
        baseWatershed.runoff = this.state.modelOutputs.base.runoff.total_per_area_watershed
        baseWatershed.runoff_total = this.state.modelOutputs.base.runoff.total_watershed
        baseWatershed.insect = this.state.modelOutputs.base.insect.total_per_area_watershed
        baseWatershed.bird = this.state.modelOutputs.base.bird.total_per_area_watershed

        area = this.state.modelOutputs.land_stats.area
        areaCalc = this.state.modelOutputs.land_stats.area_calc
        areaWatershed = this.state.modelOutputs.land_stats.area_watershed
        areaWatershedCalc = this.state.modelOutputs.land_stats.area_watershed_calc

        dataRadar = {
          labels: labels,
          datasets: [
            {
              label: 'Base',
              data: [1,1,1,1,1,1,1,1,1],
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
                  model.bird/base.bird,
                  model.econ/base.econ,
                  model.nitrate/base.nitrate,
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
              data: [1,1,1,1,1,1,1,1,1],
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
                  modelWatershed.bird/baseWatershed.bird,
                  modelWatershed.econ/baseWatershed.econ,
                  modelWatershed.nitrate/baseWatershed.nitrate,
              ],
              backgroundColor: 'rgba(0, 119, 187,.2)',
              borderColor: 'rgba(0, 119, 187,1)',
              borderWidth: 1,
            },
          ],
        };



        let models = ["yield","ero","ploss","cn","insect","runoff","bird","econ","nitrate" ]
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
                model.bird_per_diff,
                model.econ_per_diff,
                model.nitrate_per_diff,

            ],
            fill: false,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(136, 34, 85, 0.2)',
              'rgba(153, 153, 51, 0.2)',
              'rgba(255, 99, 132, 0.2)',
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)',
              'rgb(153, 102, 255)',
              'rgb(136, 34, 85)',
              'rgb(153, 153, 51)',
              'rgb(255, 99, 132)',
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
                modelWatershed.bird_per_diff,
                modelWatershed.econ_per_diff,
                modelWatershed.nitrate_per_diff,

            ],
            fill: false,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(136, 34, 85, 0.2)',
              'rgba(153, 153, 51, 0.2)',
              'rgba(255, 99, 132, 0.2)',

            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)',
              'rgb(153, 102, 255)',
              'rgb(136, 34, 85)',
              'rgb(153, 153, 51)',
              'rgb(255, 99, 132)',
            ],
            borderWidth: 1
          }]
        };
        this.dataYield = charts.getChartDataBar([base.yield,null], [null,model.yield])
        dataEro= charts.getChartDataBar([base.ero,null],[ null,model.ero])
        dataPloss= charts.getChartDataBar([base.ploss,null], [null,model.ploss])
        dataRun= charts.getChartDataBar([base.runoff,null], [null,model.runoff])
        dataInsect= charts.getChartDataBar([base.insect,null], [null,model.insect])
        dataCN = charts.getChartDataBar([base.cn,null], [null,model.cn])
        dataBird = charts.getChartDataBar([base.bird,null], [null,model.bird])
        dataEcon = charts.getChartDataBar([base.econ,null], [null,model.econ])
        dataNitrate = charts.getChartDataBar([base.nitrate,null], [null,model.nitrate])

        dataYieldWatershed = charts.getChartDataBar([baseWatershed.yield,null], [null,modelWatershed.yield])
        dataEroWatershed= charts.getChartDataBar([baseWatershed.ero,null],[ null,modelWatershed.ero])
        dataPlossWatershed= charts.getChartDataBar([baseWatershed.ploss,null], [null,modelWatershed.ploss])
        dataRunWatershed= charts.getChartDataBar([baseWatershed.runoff,null], [null,modelWatershed.runoff])
        dataInsectWatershed= charts.getChartDataBar([baseWatershed.insect,null], [null,modelWatershed.insect])
        dataCNWatershed = charts.getChartDataBar([baseWatershed.cn,null], [null,modelWatershed.cn])
        dataBirdWatershed = charts.getChartDataBar([baseWatershed.bird,null], [null,modelWatershed.bird])
        dataEconWatershed = charts.getChartDataBar([baseWatershed.econ,null], [null,modelWatershed.econ])
        dataNitrateWatershed = charts.getChartDataBar([baseWatershed.nitrate,null], [null,modelWatershed.nitrate])

        this.optionsYield = charts.getOptionsBar("Yield", "tons-dry matter/acre/year")
        optionsEro = charts.getOptionsBar("Erosion", "tons/acre/year")
        optionsPloss = charts.getOptionsBar("Phosphorus Loss", "lb/acre/year")
        optionsRun = charts.getOptionsBar("Runoff (3 inch Storm)", "inches")
        optionsInsect = charts.getOptionsBar("Honey Bee Toxicity", "honey bee toxicity index")
        optionsCN = charts.getOptionsBar("Curve Number", "curve number index")
        optionsBird = charts.getOptionsBar("Bird Friendliness", "bird friendliness index")
        optionsEcon = charts.getOptionsBar("Production Cost", "$acre/year")
        optionsNitrate = charts.getOptionsBar("Nitrate Leaching", "lb/acre/year")
        configErosionGauge = {
  type: "gauge",
  'scale-r': {
    aperture: 200,     //Specify your scale range.
    values: "0:100:20" //Provide min/max/step scale values.
  },
  series: [
    { values: [87]}
  ]
}

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
                    <Table id = "transResultsTable" striped bordered hover size="sm" responsive>
                      <thead>
                      <tr style={{textAlign:"center"}}>
                          <th>Priority</th>
                          <th>Name</th>
                          <th>Area (ac)</th>
                        </tr>
                      </thead>
                        {this.props.listTrans.map((trans, index) => (

                      <tbody >
                        <tr>
                          <td>{index + 1}</td>
                          <td>{trans.name}</td>
                          <td>{trans.areaSelected}</td>
                        </tr>
                       </tbody>
                        ))}
                    </Table>
                    <Button variant="success" onClick={this.printSummary} hidden={this.state.printingPDF}>Print PDF</Button>
                    <Button id="btnModelsLoading" variant="success" disabled hidden={!this.state.printingPDF}>
                        <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                        Loading...
                     </Button>
                </Accordion.Body>
            </Accordion.Item>
            </Accordion>
            <Tabs defaultActiveKey="chartsBar" id="uncontrolled-tab-example" className="mb-3" onSelect={(k) => this.tabControlResults(k)}>
              <Tab eventKey="chartsBar" title="Bar Charts">
              <h4>By Selection</h4>
                 <Row>
                    <Col xs={6}>
                        <Bar options = {this.optionsYield} data={this.dataYield}/>
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
                 <Row>
                    <Col xs={6}>
                        <Bar options = {optionsBird} data={dataBird}/>
                    </Col>
                    <Col xs={6}>
                        <Bar options = {optionsEcon} data={dataEcon}/>
                    </Col>

                </Row>
                <Row>
                    <Col xs={6}>
                        <Bar options = {optionsNitrate} data={dataNitrate}/>
                    </Col>
                    <Col xs={6}>
                    </Col>

                </Row>
                  <h4>By Watershed</h4>

                 <Row>
                    <Col xs={6}>
                        <Bar options = {this.optionsYield} data={dataYieldWatershed}/>
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
                <Row>
                    <Col xs={6}>
                        <Bar options = {optionsBird} data={dataBirdWatershed}/>
                    </Col>
                    <Col xs={6}>
                        <Bar options = {optionsEcon} data={dataEconWatershed}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        <Bar options = {optionsNitrate} data={dataNitrateWatershed}/>
                    </Col>
                    <Col xs={6}>
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
                <Table id = "summaryTable" striped bordered hover size="sm" responsive>
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
                      <td>Nitrate Leaching</td>
                      <td className="table-cell-left">{base.nitrate}</td>
                      <td>{model.nitrate}</td>
                      <td>lb/acre/year</td>
                      <td className="table-cell-left">{base.nitrate_total}</td>
                      <td>{model.nitrate_total}</td>
                      <td>lb/year</td>
                      <td className="table-cell-left">{model.nitrate_per_diff}</td>
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
                    <tr>
                      <td>Bird Friendliness</td>
                      <td className="table-cell-left">{base.bird}</td>
                      <td>{model.bird}</td>
                      <td>bird friendliness index</td>
                      <td className="table-cell-left">NA</td>
                      <td>NA</td>
                      <td>NA</td>
                      <td className="table-cell-left">{model.bird_per_diff}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Production Cost</td>
                      <td className="table-cell-left">{base.econ}</td>
                      <td>{model.econ}</td>
                      <td>$/acre/year</td>
                      <td className="table-cell-left">{base.econ_total}</td>
                      <td>{model.econ_total}</td>
                      <td>$/year</td>
                      <td className="table-cell-left">{model.econ_per_diff}</td>
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
                      <td>Nitrate Leaching</td>
                      <td className="table-cell-left">{baseWatershed.nitrate}</td>
                      <td>{modelWatershed.nitrate}</td>
                      <td>lb/acre/year</td>
                      <td className="table-cell-left">{baseWatershed.nitrate_total}</td>
                      <td>{modelWatershed.nitrate_total}</td>
                      <td>lb/year</td>
                      <td className="table-cell-left">{modelWatershed.nitrate_per_diff}</td>
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
                    <tr>
                      <td>Bird Friendliness</td>
                      <td className="table-cell-left">{baseWatershed.bird}</td>
                      <td>{modelWatershed.bird}</td>
                      <td>bird friendliness index</td>
                      <td className="table-cell-left">NA</td>
                      <td>NA</td>
                      <td>NA</td>
                      <td className="table-cell-left">{modelWatershed.bird_per_diff}</td>
                      <td></td>

                    </tr>
                    <tr>
                      <td>Production Cost</td>
                      <td className="table-cell-left">{baseWatershed.econ}</td>
                      <td>{modelWatershed.econ}</td>
                      <td>$/acre/year</td>
                      <td className="table-cell-left">{baseWatershed.econ_total}</td>
                      <td>{modelWatershed.econ_total}</td>
                      <td>$/year</td>
                      <td className="table-cell-left">{modelWatershed.econ_per_diff}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              </Tab>
              <Tab eventKey="gauges" title="Gauges">
               <Row>
               <h4>By Selection</h4>
                <Col xs={6} id = "modalResults">

                        <ZingChart data={configErosionGauge}/>

                    </Col>
                     <Col xs={6}>
                        <ZingChart data={configPhosGauge}/>
                     </Col>
                 </Row>
              </Tab>
            </Tabs>
            <div id = "chartPrintDiv" style = {{width:pageWidth/2}} hidden={true}>
                <Bar id = "selChart1" options = {this.optionsYield} data={this.dataYield}/>
                <Bar id = "selChart2" options = {optionsEro} data={dataEro}/>
                <Bar id = "selChart3" options = {optionsPloss} data={dataPloss}/>
                <Bar id = "selChart4" options = {optionsRun} data={dataRun}/>
                <Bar id = "selChart5" options = {optionsInsect} data={dataInsect}/>
                <Bar id = "selChart6" options = {optionsCN} data={dataCN}/>
                <Bar id = "selChart7" options = {optionsBird} data={dataBird}/>
                <Bar id = "selChart8" options = {optionsEcon} data={dataEcon}/>
                <Bar id = "selChart8" options = {optionsNitrate} data={dataNitrate}/>

                <Bar id = "watChart1" options = {this.optionsYield} data={dataYieldWatershed}/>
                <Bar id = "watChart2" options = {optionsEro} data={dataEroWatershed}/>
                <Bar id = "watChart3" options = {optionsPloss} data={dataPlossWatershed}/>
                <Bar id = "watChart4" options = {optionsRun} data={dataRunWatershed}/>
                <Bar id = "watChart5" options = {optionsInsect} data={dataInsectWatershed}/>
                <Bar id = "watChart6" options = {optionsCN} data={dataCNWatershed}/>
                <Bar id = "watChart7" options = {optionsBird} data={dataBirdWatershed}/>
                <Bar id = "watChart8" options = {optionsEcon} data={dataEconWatershed}/>
                <Bar id = "watChart8" options = {optionsNitrate} data={dataNitrateWatershed}/>

                <Radar id = "comChart1" data={dataRadar}/>
                <Bar id = "comChart2" options = {optionsBarPercent} data={dataBarPercent}/>
                <Radar id = "comChart3" data={dataRadarWatershed}/>
                <Bar id = "comChart4" options = {optionsBarPercent} data={dataBarPercentWatershed}/>
            </div>

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
                 <h6 hidden={this.state.showHuc12}> Please select a region</h6>
                 <h6 hidden={!this.state.showHuc12}>  Select at least one large watershed </h6>
                 <div hidden={!this.state.showHuc12}> Hold shift to select multiple watersheds </div>
                  </InputGroup>
                  <h6>*All land transformations will reside in the work area</h6>
                   <Button hidden={!this.state.showHuc12} onClick={this.reset}  size="sm" variant="primary">Reset Work Area</Button>

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
                    <a className = "wisc_link" target="_blank" href="https://www.arcgis.com/home/item.html?id=b6cff8bd00304b73bb1d32f7678ecf34"><sup>*</sup>From Wiscland 2 (2019)</a>
                </div>
                <div hidden ={!this.state.landTypeSelected}>
                <div className = "criteriaSections">
                    <Form.Label>2) Optional Selection Options</Form.Label>
                     <Accordion>
                      <Accordion.Item eventKey="4">
                        <Accordion.Header>Land Classification</Accordion.Header>
                        <Accordion.Body>
                             <Form.Check
                                ref={this.land1} type="switch" label="Well Suited for Cropland I (Best)"
                                onChange={(e) => this.handleSelectionChangeGeneral("land1","landClass", e)}
                             />
                             <Form.Check
                                ref={this.land2} type="switch" label="Well Suited for Cropland II"
                                onChange={(e) => this.handleSelectionChangeGeneral("land2","landClass", e)}
                             />
                             <Form.Check
                                ref={this.land3} type="switch" label="Well Suited for Cropland III"
                                onChange={(e) => this.handleSelectionChangeGeneral("land3","landClass", e)}
                             />
                             <Form.Check
                                ref={this.land4} type="switch" label="Well Suited for Cropland IV"
                                onChange={(e) => this.handleSelectionChangeGeneral("land4","landClass", e)}
                             />
                             <Form.Check
                                ref={this.land5} type="switch" label="Generally Unsuited for Agriculture V"
                                onChange={(e) => this.handleSelectionChangeGeneral("land5","landClass", e)}
                             />
                             <Form.Check
                                ref={this.land6} type="switch" label="Generally Unsuited for Agriculture VI"
                                onChange={(e) => this.handleSelectionChangeGeneral("land6","landClass", e)}
                             />
                             <Form.Check
                                ref={this.land7} type="switch" label="Generally Unsuited for Agriculture VII"
                                onChange={(e) => this.handleSelectionChangeGeneral("land7","landClass", e)}
                             />
                             <Form.Check
                                ref={this.land8} type="switch" label="Generally Unsuited for Agriculture VIII (Worst)"
                                onChange={(e) => this.handleSelectionChangeGeneral("land8","landClass", e)}
                             />
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion>
                      <Accordion.Item eventKey="5">
                        <Accordion.Header>Farmland Classification</Accordion.Header>
                        <Accordion.Body>
                            <Form.Check
                                ref={this.prime} type="switch" label="All Areas are Prime Farmland"
                                onChange={(e) => this.handleSelectionChangeGeneral("prime", "farmClass", e)}
                            />
                            <Form.Check
                                ref={this.stateFarm} type="switch" label="Farmland of Statewide Importance"
                                onChange={(e) => this.handleSelectionChangeGeneral("stateFarm", "farmClass", e)}
                            />
                            <Form.Check
                                ref={this.notPrime} type="switch" label="Not Prime Farmland"
                                onChange={(e) => this.handleSelectionChangeGeneral("notPrime", "farmClass", e)}
                            />
                            <Form.Check
                                ref={this.prime1} type="switch" label="Prime Farmland if Modified I"
                                onChange={(e) => this.handleSelectionChangeGeneral("prime1", "farmClass", e)}
                            />
                            <Form.Check
                                ref={this.prime2} type="switch" label="Prime Farmland if Modified II"
                                onChange={(e) => this.handleSelectionChangeGeneral("prime2", "farmClass", e)}
                            />
                            <Form.Check
                                ref={this.prime3} type="switch" label="Prime Farmland if Modified III"
                                onChange={(e) => this.handleSelectionChangeGeneral("prime3", "farmClass", e)}
                            />
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
                                <Form.Label>Min Slope</Form.Label>
                                  <Form.Control value={this.props.activeTrans.selection.slope1} size='sm'
                                    onChange={(e) => this.handleSelectionChange("slope1", e)}
                                  />
                                </Col>
                                <Col xs="5">
                            <Form.Label>Max Slope</Form.Label>
                                  <Form.Control value={this.props.activeTrans.selection.slope2} size='sm'
                                    onChange={(e) => this.handleSelectionChange("slope2", e)}
                                  />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mt-2">

                                <Button variant="primary"  onClick={(e) => this.clearSelection("slope")}>Reset Slope</Button>

                            </Form.Group>

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <Accordion>

                      <Accordion.Item eventKey="4" >
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
                                <Button className="mt-2" variant="primary"  onClick={(e) => this.clearSelection("streamDist")}>Reset Stream Distance</Button>
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
                     </Stack>
                      </div>
                            {/* convert from sq m to acres*/}

                      <Form.Label>4) Assess Your Scenario</Form.Label>

                     <Stack gap={3}>
                     {/*

                     <Button onClick={this.runModels} variant="success" >Assess Scenario</Button>
                     */}
                     <Button onClick={this.runModels} variant="success" hidden={this.state.modelsLoading}>Assess Scenario</Button>
                     <Button id="btnModelsLoading" variant="success" disabled hidden={!this.state.modelsLoading}>
                        <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                        Loading...
                     </Button>
                      <Button onClick={this.handleOpenModalBase} variant="info">Base Assumptions</Button>

                      <Button variant="primary" hidden={!this.state.showViewResults} onClick={this.handleOpenModal}>View Results</Button>

                     </Stack>

              </div>
              </Accordion.Body>
              </Accordion.Item>
            </Accordion>
            {/*

                <Button variant="primary"  onClick={this.handleOpenModal}>View Results</Button>
            */}


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

                <Tabs defaultActiveKey="mange" id="uncontrolled-tab-example" className="mb-3">
                  <Tab eventKey="mange" title="Crop Land Management">
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
                    {/*<Form.Label>Interseeded Legume</Form.Label>
                    <Form.Select aria-label="Default select example" ref={this.legume}
                      onChange={(e) => this.updateActiveBaseProps("legume", e)}>
                      <option value="default">Open this select menu</option>
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </Form.Select>*/}
                    <Form.Label>On Contour</Form.Label>
                    <Form.Select aria-label="Default select example" ref={this.contour}
                      onChange={(e) => this.updateActiveBaseProps("contour", e)}>
                      <option value="default">Open this select menu</option>
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                      <option value="na">N/A</option>
                    </Form.Select>
                    {/*
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
                    */}
                    <OverlayTrigger key="top1" placement="top"
                        overlay={<TooltipBootstrap>Enter the amount of manure N applied to the crop rotation as a percentage of the N recommended based on UW-Extension guidelines (A2809) (for legumes, the percentage is based on manure N allowable). For example, a value of 100% would indicate that N applications are identical to recommendations. Note that in grazed systems, manure N is already applied and does not need to be accounted for here.</TooltipBootstrap>}>
                        <Form.Label>Percent Recommended Nitrogen Manure</Form.Label>
                    </OverlayTrigger>
                     <Form.Select aria-label="Default select example" ref={this.nitrogen}
                      onChange={(e) => this.updateActiveBaseProps("nitrogen", e)}>
                      <option value="0">0</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="75">75</option>
                      <option value="100">100</option>
                      <option value="125">125</option>
                      <option value="150">150</option>
                    </Form.Select>

                    <OverlayTrigger key="top2" placement="top"
                        overlay={<TooltipBootstrap>Enter the amount of fertilizer N applied to the crop rotation as a percentage of the N recommended based on UW-Extension guidelines (A2809). For example, a value of 100% would indicate that N applications are identical to recommendations.</TooltipBootstrap>}>
                        <Form.Label>Percent Recommended Nitrogen Fertilizer</Form.Label>
                    </OverlayTrigger>
                     <Form.Select aria-label="Default select example" ref={this.nitrogen_fertilizer}
                      onChange={(e) => this.updateActiveBaseProps("nitrogen_fertilizer", e)}>
                      <option value="0">0</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="75">75</option>
                      <option value="100">100</option>
                      <option value="125">125</option>
                      <option value="150">150</option>
                    </Form.Select>

                    <OverlayTrigger key="top3" placement="top"
                            overlay={<TooltipBootstrap>The amount of manure P applied to the crop rotation as a percentage of the P removed by the crop rotation harvest (e.g., value of 100 means that P inputs and outputs are balanced). Note that in grazed systems, manure P is already applied and does not need to be accounted for here.</TooltipBootstrap>}>
                        <Form.Label>Percent Phosphorous Manure</Form.Label>
                    </OverlayTrigger>
                    <Form.Control placeholder="0" disabled ref={this.phos_manure}/>

                    <OverlayTrigger key="top4" placement="top"
                            overlay={<TooltipBootstrap> Enter the amount of fertilizer P applied to the crop rotation as a percentage of the P removed by the crop rotation harvest (e.g., value of 100 means that P inputs and outputs are balanced).</TooltipBootstrap>}>
                        <Form.Label>Percent Phosphorous Fertilizer</Form.Label>
                    </OverlayTrigger>
                     <Form.Select aria-label="Default select example" ref={this.phos_fertilizer}
                      onChange={(e) => this.updateActiveBaseProps("phos_fertilizer", e)}>
                       {this.state.phos_fert_options_holder.map((item1, index) => (

                         <option  key = {item1} value={item1}>{item1}</option>
                        ))}
                    </Form.Select>
                 </Tab>
                 <Tab eventKey="economics" title="Economics">

                       <Form.Label>P2O5 per lb:</Form.Label><Form.Control type="number" ref={this.p2o5} onChange={(e) => this.updateActiveBaseEcon("p2o5", e)}/>
                       <Form.Label>N per lb:</Form.Label><Form.Control type="number" ref={this.nFert} onChange={(e) => this.updateActiveBaseEcon("nFert", e)}/>

                       <Form.Label>Corn Seed Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.cornSeed} onChange={(e) => this.updateActiveBaseEcon("cornSeed", e)}/>
                       <Form.Label>Corn Pesticide Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.cornPest} onChange={(e) => this.updateActiveBaseEcon("cornPest", e)}/>
                       <Form.Label>Corn Machinery Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.cornMach} onChange={(e) => this.updateActiveBaseEcon("cornMach", e)}/>

                       <Form.Label>Soy Seed Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.soySeed} onChange={(e) => this.updateActiveBaseEcon("soySeed", e)}/>
                       <Form.Label>Soy Pesticide Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.soyPest} onChange={(e) => this.updateActiveBaseEcon("soyPest", e)}/>
                       <Form.Label>Soy Machinery Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.soyMach} onChange={(e) => this.updateActiveBaseEcon("soyMach", e)}/>

                       <Form.Label>Alfalfa Seed Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.alfaSeed} onChange={(e) => this.updateActiveBaseEcon("alfaSeed", e)}/>
                       <Form.Label>Alfalfa Pesticide Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.alfaPest} onChange={(e) => this.updateActiveBaseEcon("alfaPest", e)}/>
                       <Form.Label>Alfalfa Machinery Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.alfaMach} onChange={(e) => this.updateActiveBaseEcon("alfaMach", e)}/>
                       <Form.Label>Alfalfa Machinery Cost First Year:</Form.Label><Form.Control type="number" ref={this.alfaFirstYear} onChange={(e) => this.updateActiveBaseEcon("alfaFirstYear", e)}/>

                       <Form.Label>Oat Seed Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.oatSeed} onChange={(e) => this.updateActiveBaseEcon("oatSeed", e)}/>
                       <Form.Label>Oat Pesticide Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.oatPest} onChange={(e) => this.updateActiveBaseEcon("oatPest", e)}/>
                       <Form.Label>Oat Machinery Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.oatMach} onChange={(e) => this.updateActiveBaseEcon("oatMach", e)}/>

                       <Form.Label>Pasture Seed Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.pastSeed} onChange={(e) => this.updateActiveBaseEcon("pastSeed", e)}/>
                       <Form.Label>Pasture Pesticide Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.pastPest} onChange={(e) => this.updateActiveBaseEcon("pastPest", e)}/>
                       <Form.Label>Pasture Machinery Cost Per Acre:</Form.Label><Form.Control type="number" ref={this.pastMach} onChange={(e) => this.updateActiveBaseEcon("pastMach", e)}/>

                      </Tab>
                </Tabs>
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