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
      const reward = {
        ...action.payload,
        id: action.payload.id || uuidv4(),
      }

      // Check for duplicates based on more specific criteria
      let isDuplicate = false

      if (
        ['TOURNAMENT_ACE', 'TOURNAMENT_PRO', 'TOURNAMENT_CHAMP'].includes(
          reward.type,
        )
      ) {
        // For tournament rewards, check by description
        isDuplicate = state.queue.find(
          item => item.reward.description === reward.description,
        )
      } else {
        // For other rewards, check by _id (more specific than type)
        // This allows multiple abilities of the same type but different IDs
        isDuplicate = state.queue.find(item => item.reward._id === reward._id)
      }

      // Don't add if duplicate exists
      if (isDuplicate) {
        return
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
