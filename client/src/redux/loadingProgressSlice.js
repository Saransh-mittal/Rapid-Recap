import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  tasks: {
    fetchUser: { progress: 0, weight: 45 },
    // serviceWorker: { progress: 0, weight: 15 },
    navbarLoad: { progress: 0, weight: 30 },
    otherTasks: { progress: 0, weight: 25 },
  },
  isLoading: true,
  overallProgress: 0,
}

const loadingProgressSlice = createSlice({
  name: 'loadingProgress',
  initialState,
  reducers: {
    setTaskProgress: (state, action) => {
      const { task, progress } = action.payload
      if (state.tasks[task]) {
        state.tasks[task].progress = progress
      }
      state.overallProgress = calculateOverallProgress(state.tasks)
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload
    },
    resetLoadingProgress: () => initialState,
  },
})

const calculateOverallProgress = tasks => {
  let totalProgress = 0
  let totalWeight = 0

  Object.values(tasks).forEach(task => {
    totalProgress += task.progress * task.weight
    totalWeight += task.weight
  })

  return Math.round(totalProgress / totalWeight)
}

export const { setTaskProgress, setIsLoading, resetLoadingProgress } =
  loadingProgressSlice.actions

export default loadingProgressSlice.reducer
