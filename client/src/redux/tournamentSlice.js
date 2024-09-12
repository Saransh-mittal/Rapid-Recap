import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  tournamentId: null,
  category: null,
  currentTournament: null,
  participatedTournaments: [],
  completedCategories: [],
  leaderboard: [],
  isLoading: false,
  error: null,
}

const tournamentSlice = createSlice({
  name: 'tournament',
  initialState,
  reducers: {
    setTournamentId: (state, action) => {
      state.tournamentId = action.payload
    },
    setCategory: (state, action) => {
      state.category = action.payload
    },
    setCurrentTournament: (state, action) => {
      state.currentTournament = action.payload
    },
    setParticipatedTournaments: (state, action) => {
      state.participatedTournaments = action.payload
    },
    addParticipatedTournament: (state, action) => {
      state.participatedTournaments.push(action.payload)
    },
    setLeaderboard: (state, action) => {
      state.leaderboard = action.payload
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setCompletedCategories: (state, action) => {
      state.completedCategories = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    resetTournamentState: state => {
      Object.assign(state, initialState)
    },
  },
})

export const {
  setTournamentId,
  setCategory,
  setCurrentTournament,
  setParticipatedTournaments,
  addParticipatedTournament,
  setLeaderboard,
  setIsLoading,
  setError,
  resetTournamentState,
  setCompletedCategories,
} = tournamentSlice.actions

export default tournamentSlice.reducer

// Selectors
export const selectTournamentId = state => state.tournament.tournamentId
export const selectCategory = state => state.tournament.category
export const selectCurrentTournament = state =>
  state.tournament.currentTournament
export const selectParticipatedTournaments = state =>
  state.tournament.participatedTournaments
export const selectLeaderboard = state => state.tournament.leaderboard
export const selectIsLoading = state => state.tournament.isLoading
export const selectError = state => state.tournament.error
