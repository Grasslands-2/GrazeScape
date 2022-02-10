/*
Redux store for SmartScape
Author: Matthew Bayles
Created: November 2021
*/
import { configureStore } from '@reduxjs/toolkit'
import transSlice from './transSlice'

export default configureStore({
  reducer: {
    transformation: transSlice
  },
})