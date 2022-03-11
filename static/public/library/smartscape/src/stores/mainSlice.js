/*
Redux slice for SmartScape
Author: Matthew Bayles
Created: November 2021
*/
import { createSlice } from '@reduxjs/toolkit'

export const mainSlice = createSlice({
  name: 'activeTrans',
  // initial state of store
  initialState: {
    region:null,
    hideAOIAcc:false,
    hideTransAcc:true,
    aoiFolderId:null
  },
  // functions to interact with redux store
  reducers: {
    /**
     * Set active region
     * @param  {Transformation} action.payload The new active transformation
     */
    setActiveRegion: (state, action) => {
        state.region = action.payload
    },
    /**
     * Set visibility of the accordion for creating aoi
     * @param  {bool} action.payload Whether to show or hide accordion
     */
    setVisibilityAOIAcc: (state, action) => {
        state.hideAOIAcc = action.payload
    },
    /**
     * Set visibility of the accordion for displaying transformations
     * @param  {bool} action.payload Whether to show or hide accordion
     */
    setVisibilityTransAcc: (state, action) => {
        state.hideTransAcc = action.payload
    },
    setAoiFolderId: (state, action) => {
        state.aoiFolderId = action.payload
    },
  },
})

// Export functions to be used across app
export const {setActiveRegion,
                setVisibilityAOIAcc,
                setVisibilityTransAcc,
                setAoiFolderId,
                 } = mainSlice.actions

export default mainSlice.reducer