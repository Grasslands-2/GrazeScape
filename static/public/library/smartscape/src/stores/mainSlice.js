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
    region:null
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
  },
})

// Export functions to be used across app
export const {setActiveRegion,
                 } = mainSlice.actions

export default mainSlice.reducer