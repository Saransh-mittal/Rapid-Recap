// redux/quickClashDailyTasksSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { setUser } from './authSlice'

// Async thunks for fetching and updating tasks
export const fetchDailyTasks = createAsyncThunk(
  'quickClashDailyTasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/quickClash/dailyTasks')
      return response.data.tasks || []
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch daily tasks',
      )
    }
  },
)

export const refreshDailyTasks = createAsyncThunk(
  'quickClashDailyTasks/refreshTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/quickClash/dailyTasks/refresh')
      return response.data.tasks || []
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to refresh daily tasks',
      )
    }
  },
)

export const updateTaskProgress = createAsyncThunk(
  'quickClashDailyTasks/updateProgress',
  async ({ taskType, incrementBy = 1, metadata }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/quickClash/dailyTasks/${taskType}/progress`,
        { incrementBy, metadata },
      )
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update task progress',
      )
    }
  },
)

export const claimTaskReward = createAsyncThunk(
  'quickClashDailyTasks/claimReward',
  async (taskId, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await axios.post(
        `/api/quickClash/dailyTasks/${taskId}/claim`,
      )

      // Update user XP and level in the auth state
      if (response.data.levelInfo) {
        const currentUser = getState().auth.user
        dispatch(
          setUser({
            ...currentUser,
            xp: response.data.newTotals.xp,
            level: response.data.levelInfo.currentLevel,
          }),
        )
      }

      return {
        taskId,
        reward: response.data.reward,
        newTotals: response.data.newTotals,
        levelInfo: response.data.levelInfo,
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to claim task reward',
      )
    }
  },
)

export const fetchTaskStatistics = createAsyncThunk(
  'quickClashDailyTasks/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/quickClash/dailyTasks/statistics')
      return response.data.statistics || {}
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch task statistics',
      )
    }
  },
)

const initialState = {
  tasks: [],
  tasksLoading: false,
  tasksError: null,

  // Track the currently completed task for animation purposes
  justCompletedTaskId: null,

  // Track claimed reward animation
  lastClaimedReward: null,
  lastClaimedReward: null,
  lastLevelInfo: null,

  // Statistics
  statistics: {
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    today: { total: 0, completed: 0 },
    byDifficulty: {},
    rewards: { xp: 0 },
  },
  statisticsLoading: false,
  statisticsError: null,
}

const quickClashDailyTasksSlice = createSlice({
  name: 'quickClashDailyTasks',
  initialState,
  reducers: {
    updateTaskProgressDirectInRedux: (state, action) => {
      // Find and update the task in the state
      const task = action.payload
      const index = state.tasks.findIndex(t => t._id === task._id)

      if (index !== -1) {
        state.tasks[index] = task
      }
    },
    clearJustCompletedTask: state => {
      state.justCompletedTaskId = null
    },
    clearLastClaimedReward: state => {
      state.lastClaimedReward = null
    },
  },
  extraReducers: builder => {
    builder
      // Fetch daily tasks
      .addCase(fetchDailyTasks.pending, state => {
        state.tasksLoading = true
        state.tasksError = null
      })
      .addCase(fetchDailyTasks.fulfilled, (state, action) => {
        state.tasks = action.payload
        state.tasksLoading = false
      })
      .addCase(fetchDailyTasks.rejected, (state, action) => {
        state.tasksLoading = false
        state.tasksError = action.payload
      })

      // Refresh daily tasks
      .addCase(refreshDailyTasks.pending, state => {
        state.tasksLoading = true
        state.tasksError = null
      })
      .addCase(refreshDailyTasks.fulfilled, (state, action) => {
        state.tasks = action.payload
        state.tasksLoading = false
      })
      .addCase(refreshDailyTasks.rejected, (state, action) => {
        state.tasksLoading = false
        state.tasksError = action.payload
      })

      // Update task progress
      .addCase(updateTaskProgress.fulfilled, (state, action) => {
        // Find and update the task in the state
        const { task, justCompleted } = action.payload
        const index = state.tasks.findIndex(t => t._id === task._id)

        if (index !== -1) {
          state.tasks[index] = task

          // If the task was just completed, store its ID for animation
          if (justCompleted) {
            state.justCompletedTaskId = task._id
          }
        }
      })

      // Claim task reward
      .addCase(claimTaskReward.pending, state => {
        state.tasksError = null
      })
      .addCase(claimTaskReward.fulfilled, (state, action) => {
        const { taskId, reward, levelInfo } = action.payload

        // Find and update the task in the state
        const index = state.tasks.findIndex(t => t._id === taskId)
        if (index !== -1) {
          state.tasks[index].rewardClaimed = true
        }

        // Store the claimed reward for animation
        state.lastClaimedReward = {
          taskId,
          ...reward,
        }

        // Store level info for animation
        state.lastLevelInfo = levelInfo
      })
      .addCase(claimTaskReward.rejected, (state, action) => {
        state.tasksError = action.payload
      })

      // Fetch task statistics
      .addCase(fetchTaskStatistics.pending, state => {
        state.statisticsLoading = true
        state.statisticsError = null
      })
      .addCase(fetchTaskStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload
        state.statisticsLoading = false
      })
      .addCase(fetchTaskStatistics.rejected, (state, action) => {
        state.statisticsLoading = false
        state.statisticsError = action.payload
      })
  },
})

export const {
  updateTaskProgressDirectInRedux,
  clearJustCompletedTask,
  clearLastClaimedReward,
} = quickClashDailyTasksSlice.actions

export default quickClashDailyTasksSlice.reducer
