import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slice'
import transSlice from './transSlice'

export default configureStore({
  reducer: {
    counter: counterReducer,
    transformation: transSlice
  },
})