/*
Redux slice for SmartScape
Author: Matthew Bayles
Created: November 2021
*/
import { createSlice } from '@reduxjs/toolkit'
import {Transformation} from '/src/transformation/transformation.js'

export const transSlice = createSlice({
  name: 'activeTrans',
  // initial state of store
  initialState: {
//    value: new Transformation("intial11",-1,-1),
    // active transformation
    activeTrans:Transformation(" ",-1, -1, "transformation"),
    // tracks new transformation
    addTrans: null,
    // transformation to remove
    removeTrans:null,
    // map selection type
    areaSelectionType: null,
    // turn of layer be name (only for huc 12 and huc 10)
    layerVisible:{'name':null,visible:null},
    // update this to update a transformation's display layer
    activeDisplayProps:null,
    // list of all transformations
    listTrans:[],
    // base case transformations holds the initial conditions
    baseTrans:Transformation("base",-1, -1, "base"),
  },
  // functions to interact with redux store
  reducers: {
    /**
     * Set active transformation
     * @param  {Transformation} action.payload The new active transformation
     */
    setActiveTrans: (state, action) => {
        state.activeTrans = action.payload
    },
    reset: (state, action) => {
        // active transformation
        state.activeTrans =Transformation(" ",-1, -1, "transformation")
        // tracks new transformation
//        state.addTrans = null
        // transformation to remove
        state.removeTrans = null
        // map selection type
        state.areaSelectionType = null
        // turn of layer be name (only for huc 12 and huc 10)
//        layerVisible = {'name':null,visible:null}
        // update this to update a transformation's display layer
        state.activeDisplayProps = null
        // list of all transformations
        state.listTrans = []
        // base case transformations holds the initial conditions
    },
    /**
     * Set active transformation display layer. Triggers an update in map.js
     * @param  {Transformation} action.payload The new active display.
     * to change the active layer
     */
    setActiveTransDisplay(state,action) {
        state.activeDisplayProps = action.payload
    },
    /**
     * Add a new transformation
     * @param  {Transformation} action.payload The new Transformation.
     * to change the active layer
     */
    addTrans(state, action){
        state.addTrans = action.payload
        state.listTrans.push(action.payload)
    },
    /**
     * Remove a transformation
     * @param  {int} action.payload The Transformation id to remove.
     * to change the active layer
     */
    removeTrans(state, action){
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
//    getTrans(state, action){
//        let items = state.listTrans
//        let transId = action.payload
//        for(let trans in items){
//            if(items[trans].id == transId){
//                return items[trans]
//            }
//        }
//    },
    // redefine the trans list after a mutation (only used when adding new layer and reordering)
    updateTransList(state,action){
        state.listTrans = action.payload
    },
    // set the area selection type. currently just selection by watershed
    updateAreaSelectionType(state,action){
        state.areaSelectionType = action.payload
    },
    // set the visibility of map layers
    setVisibilityMapLayer(state,action){
        state.layerVisible = action.payload
    },
    // update selection criteria for active trans
    updateActiveTransProps(state,action){
        let value = action.payload
        let items = state.listTrans
        let activeTransId = state.activeTrans.id
        for(let trans in items){
            if(items[trans].id == activeTransId){
                // change selection criteria
                if(action.payload.type === "reg"){
                    items[trans].selection[value.name] = value.value
                }
                // mangement style is being changed
                else if(action.payload.type === "mang"){
                    items[trans].management[value.name] = value.value
                }
                else if(action.payload.type === "base"){
                    items[trans][value.name] = value.value
                }
                // land cover is being updated
                else if(action.payload.type === "land"){
                    items[trans].selection.landCover[value.name] = value.value
                }
                else{
                    items[trans].selection[value.type][value.name] = value.value

                }
                // reset active transformation so we get the new values
                state.activeTrans = items[trans]
//                state.removeTrans = items[trans]
//                items.splice(trans,1)
                break
            }
        }
    },
     updateActiveBaseProps(state,action){
        let value = action.payload
        let base = state.baseTrans
        // change selection criteria
        console.log("state", state, action)
        if(action.payload.type === "reg"){
            base.selection[value.name] = value.value
        }
        // mangement style is being changed
        else if(action.payload.type === "mang"){
            base.management[value.name] = value.value
        }
        else if (action.payload.type === "econ"){
            base.econ[value.name] = value.value
        }
        else if (action.payload.type === "base"){
            console.log("updating a base value")
            base[value.name] = value.value
        }
        // land cover is being updated
        else{
            base.selection.landCover[value.name] = value.value
        }
        state.baseTrans = base
    },
    updateActiveBaseManagementProps(state,action){
        console.log(action.payload)
        let value = action.payload
        let base = state.baseTrans
        base[value.name][value.prop] = value.value
        state.baseTrans = base
    }
  },
})

// Export functions to be used across app
export const { setActiveTrans,
                setActiveTransOL,
                addTrans,
                removeTrans,
//                getTrans,
                updateTransList,
                updateAreaSelectionType,
                updateActiveTransProps,
                setVisibilityMapLayer,
                setActiveTransDisplay,
                updateActiveBaseProps,
                updateActiveBaseManagementProps,
                reset,
                 } = transSlice.actions

export default transSlice.reducer