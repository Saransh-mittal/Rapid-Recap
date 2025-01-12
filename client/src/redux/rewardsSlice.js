// src/redux/rewardsSlice.js
import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const initialState = {
  queue: [],
  currentReward: null,
  isDisplaying: false,
}

export const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    addReward: (state, action) => {
      // Add id if not provided
      // dont add if already exists
      if (
        ['TOURNAMENT_ACE', 'TOURNAMENT_PRO', 'TOURNAMENT_CHAMP'].includes(
          action.payload.type,
        ) &&
        state.queue.find(
          item => item.reward.description === action.payload.description,
        )
      )
        return
      else if (
        !['TOURNAMENT_ACE', 'TOURNAMENT_PRO', 'TOURNAMENT_CHAMP'].includes(
          action.payload.type,
        ) &&
        state.queue.find(item => item.reward.type === action.payload.type)
      ) {
        return
      }

      const reward = {
        ...action.payload,
        id: action.payload.id || uuidv4(),
      }

      const queueItem = {
        reward,
        claimed: false,
        timestamp: Date.now(),
      }

      state.queue.push(queueItem)

      // If nothing is displaying, show this reward
      if (!state.currentReward) {
        state.currentReward = queueItem
        state.isDisplaying = true
      }
    },

    showNextReward: state => {
      if (state.queue.length > 0) {
        const [nextReward, ...remainingQueue] = state.queue
        state.currentReward = nextReward
        state.queue = remainingQueue
        state.isDisplaying = true
      } else {
        state.currentReward = null
        state.isDisplaying = false
      }
    },

    clearCurrentReward: state => {
      state.currentReward = null
      if (state.queue.length > 0) {
        const [nextReward, ...remainingQueue] = state.queue
        state.currentReward = nextReward
        state.queue = remainingQueue
        state.isDisplaying = true
      } else {
        state.isDisplaying = false
        window.location.reload()
      }
    },

    markCurrentRewardAsClaimed: state => {
      if (state.currentReward) {
        state.currentReward.claimed = true
        state.queue = state.queue.filter(
          item => item.reward.id !== state.currentReward.reward.id,
        )
      }
    },

    reset: () => initialState,
  },
})

export const {
  addReward,
  showNextReward,
  clearCurrentReward,
  markCurrentRewardAsClaimed,
  reset: resetRewards,
} = rewardsSlice.actions

export default rewardsSlice.reducer
