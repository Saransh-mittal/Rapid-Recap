import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { addNoteMessage } from './appSlice'
import axios from 'axios'

export const checkTournamentRegistration = createAsyncThunk(
  'tournament/checkRegistration',
  async (t, { getState, dispatch }) => {
    const { auth } = getState()
    const { user } = auth

    try {
      const response = await axios.get('/api/tournament/active-registration')

      const { tournament, isRegistered } = response.data

      if (
        tournament.status === 'registration' &&
        !isRegistered &&
        user.role !== 'guest'
      ) {
        if (user.streak < 2 && !user.eligibleForTournament) {
          dispatch(
            addNoteMessage({
              title: t('Keep Going!'),
              messageType: 'tournament',
              tournamentStatus: 'locked',
              tournamentName:
                '#' +
                String(String(tournament?.tournamentNumber).padStart(3, '0')),
              tournamentEndTime: tournament?.registrationEndDate,
              userStreak: user.streak,
              requiredStreak: 2,
              duration: 10000,
              width: '300px',
              actions: [
                {
                  text: 'View Tournament',
                  actionType: 'VIEW_TOURNAMENT',
                },
              ],
            }),
          )
        } else {
          dispatch(
            addNoteMessage({
              title: t('Tournament Time!'),
              duration: 10000,
              width: '300px',
              messageType: 'tournament',
              tournamentStatus: 'registration',
              tournamentName:
                '#' +
                String(String(tournament?.tournamentNumber).padStart(3, '0')),
              tournamentEndTime: tournament?.registrationEndDate,
              userStreak: user?.streak,
              requiredStreak: 2,
              actions: [
                {
                  text: 'Register Tournament',
                  actionType: 'REGISTER_TOURNAMENT',
                },
              ],
            }),
          )
        }
      }

      dispatch(setTournamentId(tournament?._id))
      dispatch(setStatus(tournament?.status))
      return { tournament, isRegistered }
    } catch (error) {
      console.error('Error checking tournament registration:', error)
      // Handle error (e.g., dispatch an error notification)
    }
  },
)

export const getTopLeaderboard = createAsyncThunk(
  'tournament/getTopLeaderboard',
  async ({ tournamentId, t }, { getState, dispatch }) => {
    const { auth } = getState()
    const userId = auth.user._id
    try {
      const response = await axios.get(`/api/tournament/leaderboard`, {
        params: {
          tournamentId,
          page: 1,
          limit: 3,
          userId,
        },
      })
      const { leaderboard, tournamentNumber, userStanding } = response.data
      userStanding && dispatch(setUserStanding(userStanding))
      // check if no leader has score above 0 then dont show the message
      if (leaderboard.length > 0) {
        let showLeaderboardMessage = false
        leaderboard.forEach(leader => {
          if (leader.score > 0) {
            showLeaderboardMessage = true
          }
        })
        showLeaderboardMessage &&
          dispatch(
            addNoteMessage({
              title: t('Ongoing Tournament'),
              tournamentName:
                '#' + String(String(tournamentNumber).padStart(3, '0')),
              messageType: 'tournament',
              tournamentStatus: 'ongoing',
              duration: null,
              width: '300px',
              leaderboard,
              actions: [
                {
                  text: t('View Tournament'),
                  actionType: 'VIEW_TOURNAMENT',
                },
              ],
            }),
          )
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      // Handle error (e.g., dispatch an error notification)
    }
  },
)

const initialState = {
  tournamentId: null,
  category: null,
  currentTournament: null,
  isRegistered: false,
  participatedTournaments: [],
  completedCategories: [],
  leaderboard: [],
  isLoading: false,
  error: null,
  refetchLeaderBoard: false,
  status: null,
  categoryAttempts: {},
  completedCategories: [],
  categoryScores: {},
  isUnderMaintenance: false,
  userStanding: null,
}

const tournamentSlice = createSlice({
  name: 'tournament',
  initialState,
  reducers: {
    setUserStanding: (state, action) => {
      state.userStanding = action.payload
    },
    setIsUnderMaintenance: (state, action) => {
      state.isUnderMaintenance = action.payload
    },
    updateCategoryStatus: (state, action) => {
      const { category, attemptsLeft, isCompleted, score } = action.payload
      state.categoryAttempts[category] = 2 - attemptsLeft
      state.categoryScores[category] = score
      if (isCompleted) {
        state.completedCategories.push(category)
      }
    },
    setIsRegistered: (state, action) => {
      state.isRegistered = action.payload
    },
    setStatus: (state, action) => {
      state.status = action.payload
    },
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
    setRefetchLeaderBoard: (state, action) => {
      state.refetchLeaderBoard = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(checkTournamentRegistration.fulfilled, (state, action) => {
      if (action.payload) {
        state.currentTournament = action.payload.tournament
        state.isRegistered = action.payload.isRegistered
      }
    })
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
  setRefetchLeaderBoard,
  setStatus,
  setIsRegistered,
  updateCategoryStatus,
  setIsUnderMaintenance,
  setUserStanding,
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
