/*
Redux store for SmartScape
Author: Matthew Bayles
Created: November 2021
*/
import { configureStore } from '@reduxjs/toolkit'
import transSlice from './transSlice'
import mainSlice from './mainSlice'

export default configureStore({
  reducer: {
    transformation: transSlice,
    main: mainSlice
  },
})