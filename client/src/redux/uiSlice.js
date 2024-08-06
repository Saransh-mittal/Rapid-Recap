import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  modal: false,
  page: 0,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setModal: (state, action) => {
      state.modal = action.payload
    },
    setPageRedux: (state, action) => {
      state.page = action.payload
    },
    resetUIState: state => {
      return initialState
    },
  },
})

export const { setModal, setPageRedux, resetUIState } = uiSlice.actions

export default uiSlice.reducer
