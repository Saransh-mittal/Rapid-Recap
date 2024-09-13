import { createSlice } from '@reduxjs/toolkit'

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    isOpen: false,
    language: 'en',
    isQuinBoostAvailable: false,
    quizLeftToGetQuizBoost: 5,
    tournamentQuiz: false,
  },
  reducers: {
    setIsOpen(state, action) {
      state.isOpen = action.payload
    },
    setLanguage(state, action) {
      state.language = action.payload
    },
    setIsQuinBoostAvailable(state, action) {
      state.isQuinBoostAvailable = action.payload
    },
    setQuizLeftToGetQuizBoost(state, action) {
      state.quizLeftToGetQuizBoost = action.payload
    },
    setTournamentQuiz(state, action) {
      state.tournamentQuiz = action.payload
    },
  },
})

export const {
  setIsOpen,
  setLanguage,
  setIsQuinBoostAvailable,
  setQuizLeftToGetQuizBoost,
  setTournamentQuiz,
} = quizSlice.actions

export default quizSlice.reducer
