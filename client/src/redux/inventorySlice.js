import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { setIsQuinBoostAvailable } from './quizSlice'
import { checkQuinBoostAvailability } from '../utils/inventory.utils'
import { addReward } from './rewardsSlice'
import { REWARD_TYPES } from '../components/rewards'

// Async thunk for fetching inventory
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.get('/api/abilities/check')
      dispatch(
        setIsQuinBoostAvailable(
          checkQuinBoostAvailability(response.data.activeAbilities),
        ),
      )
      if (response.data.unclaimedAbilities.length > 0) {
        response.data.unclaimedAbilities.forEach(ability => {
          if (ability.type === 'BOOST' && ability.name != 'QuinBoost') {
            dispatch(
              addReward({
                _id: ability._id,
                type: REWARD_TYPES.RQM_BOOST,
                title: `${ability.name} Unlocked!`,
                description: ability.description,
                multiplier: ability.multiplier,
              }),
            )
          }
        })
      }
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch inventory',
      )
    }
  },
)

export const claimAbility = createAsyncThunk(
  'inventory/claimAbility',
  async (abilityId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/abilities/claim/${abilityId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to claim ability',
      )
    }
  },
)

// Async thunk for activating ability
export const activateAbility = createAsyncThunk(
  'inventory/activateAbility',
  async (abilityId, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/abilities/activate/${abilityId}`)
      dispatch(
        setIsQuinBoostAvailable(
          checkQuinBoostAvailability(response.data.activeAbilities),
        ),
      )
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to activate ability',
      )
    }
  },
)

const initialState = {
  activeAbilities: [],
  availableAbilities: [],
  unclaimedAbilities: [],
  effects: {
    boost: { multiplier: 1 },
  },
  loading: false,
  error: null,
  lastFetched: null,
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearInventory: () => initialState,
  },
  extraReducers: builder => {
    builder
      // Fetch Inventory
      .addCase(fetchInventory.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.activeAbilities = action.payload.activeAbilities
        state.availableAbilities = action.payload.availableAbilities
        state.unclaimedAbilities = action.payload.unclaimedAbilities
        state.effects = action.payload.effects
        state.loading = false
        state.lastFetched = Date.now()
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Activate Ability
      .addCase(activateAbility.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(activateAbility.fulfilled, (state, action) => {
        state.availableAbilities = action.payload.availableAbilities
        state.activeAbilities = action.payload.activeAbilities
        state.effects = action.payload.effects
        state.loading = false
      })
      .addCase(activateAbility.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearInventory } = inventorySlice.actions
export default inventorySlice.reducer
