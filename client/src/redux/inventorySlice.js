import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { setIsQuinBoostAvailable } from './quizSlice'
import { checkQuinBoostAvailability } from '../utils/inventory.utils'
import { addReward } from './rewardsSlice'
import { REWARD_TYPES } from '../components/rewards'
import { isCategoryBoost, isCategoryPowerUp } from '../utils/helper.utils'

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
                name: ability.name,
                type: REWARD_TYPES.RQM_BOOST,
                title: `${ability.name} Unlocked!`,
                description: ability.description,
                multiplier: ability.multiplier,
                isCategoryBoost: isCategoryBoost(ability.name),
              }),
            )
          } else if (ability.type === 'POWER_UP') {
            dispatch(
              addReward({
                _id: ability._id,
                name: ability.name,
                type: REWARD_TYPES.POWER_UP,
                title: `${ability.name} Unlocked!`,
                description: ability.description,
                isCategoryBoost: isCategoryPowerUp(ability.name),
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
  async ({ abilityId, category = null }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/abilities/claim/${abilityId}`, {
        category,
      })
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
  loading: true,
  error: null,
  lastFetched: null,
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearInventory: () => initialState,
    setLoading: (state, action) => {
      state.loading = action.payload
    },
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
      .addCase(claimAbility.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(claimAbility.fulfilled, (state, action) => {
        state.activeAbilities = action.payload.activeAbilities
        state.availableAbilities = action.payload.availableAbilities
        state.effects = action.payload.effects
        state.loading = false
        state.lastFetched = Date.now()
      })
      .addCase(claimAbility.rejected, (state, action) => {
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

export const { clearInventory, setLoading } = inventorySlice.actions
export default inventorySlice.reducer
