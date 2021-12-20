import { createSlice } from '@reduxjs/toolkit'
import {Transformation} from '/src/transformation/transformation.js'

export const transSlice = createSlice({
  name: 'activeTrans',
  initialState: {
//    value: new Transformation("intial11",-1,-1),
    activeTrans:Transformation("test trans",-1, -1),
    addTrans: null,
    removeTrans:null,
    areaSelectionType: null,
    layerVisible:{'name':null,visible:null},
    activeDisplayProps:null,
    listTrans:[
//        Transformation("test trans0","0", "0"),
//        Transformation("test trans1","1", "1"),
//        Transformation("test trans2","2", "2")
    ]
  },
  reducers: {
  // id of active transformation
    setActiveTrans: (state, action) => {
        console.log("setting active trans state")
        console.log(action)
        console.log(action.payload)
        state.activeTrans = action.payload
        console.log(state.activeTrans)
    },
    setActiveTransDisplay(state,action) {
        state.activeDisplayProps = action.payload
    },
    addTrans(state, action){
        state.addTrans = action.payload
        state.listTrans.push(action.payload)
        console.log("just add new trans")
    },
    removeTrans(state, action){
        console.log("removing trans")
        let items = state.listTrans
        let removeTransId = action.payload
        for(let trans in items){
            if(items[trans].id == removeTransId){
                state.removeTrans = items[trans]
                items.splice(trans,1)
                break
            }
        }
//        state.listTrans = items
    },
    // redefine the trans list after a mutation (only used when adding new layer and we get the layer id's)
    updateTransList(state,action){
        state.listTrans = action.payload
    },
    // set the area selection type. currently just selection by watershed
    updateAreaSelectionType(state,action){
        state.areaSelectionType = action.payload
    },
    // set the visibility of map layers
    // TODO move map functions to a separate slice
    setVisibilityMapLayer(state,action){
        state.layerVisible = action.payload
    },
    // update selection criteria for active trans
    updateActiveTransProps(state,action){
        let value = action.payload
        console.log(value)
        let items = state.listTrans
        let activeTransId = state.activeTrans.id
        for(let trans in items){
            if(items[trans].id == activeTransId){
                console.log("value added")
                console.log("value added")
                items[trans].selection[value.name] = value.value
                // reset active transformation so we get the new values
                state.activeTrans = items[trans]
//                state.removeTrans = items[trans]
//                items.splice(trans,1)
                break
            }
        }
    }
  },
})

// Action creators are generated for each case reducer function
export const { setActiveTrans,
                setActiveTransOL,
                addTrans,
                removeTrans,
                updateTransList,
                updateAreaSelectionType,
                updateActiveTransProps,
                setVisibilityMapLayer,
                setActiveTransDisplay,
                 } = transSlice.actions

export default transSlice.reducer