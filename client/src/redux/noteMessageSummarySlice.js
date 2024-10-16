import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  rating: 0,
  quizRating: 0,
  tournamentQuizRating: 0,
  feedback: '',
  quizFeedback: '',
  tournamentQuizFeedback: '',
}

const noteMessageSummarySlice = createSlice({
  name: 'noteMessageSummary',
  initialState,
  reducers: {
    setRating: (state, action) => {
      state.rating = action.payload
    },
    setQuizRating: (state, action) => {
      state.quizRating = action.payload
    },
    setTournamentQuizRating: (state, action) => {
      state.tournamentQuizRating = action.payload
    },
    setFeedback: (state, action) => {
      state.feedback = action.payload
    },
    setQuizFeedback: (state, action) => {
      state.quizFeedback = action.payload
    },
    setTournamentQuizFeedback: (state, action) => {
      state.tournamentQuizFeedback = action.payload
    },
    resetFeedback: state => {
      state.rating = 0
      state.quizRating = 0
      state.tournamentQuizRating = 0
      state.feedback = ''
      state.quizFeedback = ''
      state.tournamentQuizFeedback = ''
    },
  },
})

export const {
  setRating,
  setQuizRating,
  setTournamentQuizRating,
  setFeedback,
  setQuizFeedback,
  setTournamentQuizFeedback,
  resetFeedback,
} = noteMessageSummarySlice.actions

export default noteMessageSummarySlice.reducer
