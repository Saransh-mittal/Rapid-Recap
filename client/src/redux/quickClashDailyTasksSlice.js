// redux/quickClashDailyTasksSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { setUser } from './authSlice'
import { DAILY_TASKS_ENABLED } from '../utils/featureFlags'

const TASK_DEFINITIONS = [
  {
    taskType: 'COMPLETE_CHALLENGES',
    titleTemplate: 'Complete {target} Challenges',
    descriptionTemplate: 'Complete {target} Quick Clash challenges',
    targetRange: [1, 3, 5],
    rewardScale: { xp: 10 },
    difficulty: 1,
  },
  {
    taskType: 'ACHIEVE_RQM_SCORE',
    titleTemplate: 'Score {target}+ RQM',
    descriptionTemplate: 'Score {target} or higher RQM in a single challenge',
    targetRange: [30, 40, 50],
    rewardScale: { xp: 15 },
    difficulty: 2,
  },
  {
    taskType: 'WIN_CHALLENGES',
    titleTemplate: 'Win {target} Challenges',
    descriptionTemplate: 'Win {target} Quick Clash challenges against players',
    targetRange: [1, 2, 3],
    rewardScale: { xp: 20 },
    difficulty: 3,
  },
  {
    taskType: 'CHALLENGE_FRIEND',
    titleTemplate: 'Challenge {target} Friends',
    descriptionTemplate: 'Send challenges to {target} different friends',
    targetRange: [1, 2, 3],
    rewardScale: { xp: 15 },
    difficulty: 1,
  },
  {
    taskType: 'USE_CATEGORIES',
    titleTemplate: 'Use {target} Categories',
    descriptionTemplate:
      'Complete challenges in {target} different categories',
    targetRange: [2, 3, 5],
    rewardScale: { xp: 20 },
    difficulty: 2,
  },
  {
    taskType: 'COMPLETE_MATCHMAKING',
    titleTemplate: 'Complete {target} Matchmaking Challenges',
    descriptionTemplate:
      'Complete {target} challenges initiated through matchmaking',
    targetRange: [1, 3, 5],
    rewardScale: { xp: 15 },
    difficulty: 2,
  },
  {
    taskType: 'VIEW_ANALYSES',
    titleTemplate: 'View {target} Challenge Analyses',
    descriptionTemplate: 'View AI analysis for {target} completed challenges',
    targetRange: [1, 3, 5],
    rewardScale: { xp: 10 },
    difficulty: 1,
  },
  {
    taskType: 'MAINTAIN_WINSTREAK',
    titleTemplate: 'Maintain a {target}-Win Streak',
    descriptionTemplate: 'Win {target} challenges in a row without losing',
    targetRange: [2, 3, 5],
    rewardScale: { xp: 30 },
    difficulty: 4,
  },
  {
    taskType: 'IMPROVE_READING_TIME',
    titleTemplate: 'Complete Challenge with {target}s Reading Time',
    descriptionTemplate:
      'Complete a challenge with at least {target}s in reading phase',
    targetRange: [60, 90, 120],
    rewardScale: { xp: 15 },
    difficulty: 2,
  },
]

const clampPositiveInteger = value => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue) || numberValue <= 0) return 1
  return Math.floor(numberValue)
}

const shuffleArray = items => {
  const array = [...items]
  for (let i = array.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[randomIndex]] = [array[randomIndex], array[i]]
  }
  return array
}

const pickRandomItems = (items, count) =>
  shuffleArray(items).slice(0, Math.min(count, items.length))

const getEndOfTodayIso = () => {
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)
  return endOfToday.toISOString()
}

const replaceTargetInTemplate = (template, target) =>
  template.replace('{target}', String(target))

const createTaskFromDefinition = (definition, index, assignedAt, expiresAt) => {
  const targetChoices = definition.targetRange || [1]
  const target =
    targetChoices[Math.floor(Math.random() * targetChoices.length)] ||
    targetChoices[0]

  return {
    _id: `local-task-${Date.now()}-${index}-${definition.taskType}`,
    taskType: definition.taskType,
    title: replaceTargetInTemplate(definition.titleTemplate, target),
    description: replaceTargetInTemplate(definition.descriptionTemplate, target),
    target,
    progress: 0,
    reward: {
      xp: definition.rewardScale?.xp || 0,
    },
    difficulty: definition.difficulty,
    metadata: null,
    assignedAt,
    expiresAt,
    completed: false,
    rewardClaimed: false,
    completedAt: null,
  }
}

const generateDailyTaskSet = () => {
  const easyTasks = TASK_DEFINITIONS.filter(task => task.difficulty <= 2)
  const mediumTasks = TASK_DEFINITIONS.filter(task => task.difficulty === 3)
  const hardTasks = TASK_DEFINITIONS.filter(task => task.difficulty >= 4)

  const selectedTasks = [
    ...pickRandomItems(easyTasks, 3),
    ...pickRandomItems(mediumTasks, 2),
    ...pickRandomItems(hardTasks, 1),
  ]

  const pickedTaskTypes = new Set(selectedTasks.map(task => task.taskType))
  if (selectedTasks.length < 6) {
    const remainingDefinitions = TASK_DEFINITIONS.filter(
      task => !pickedTaskTypes.has(task.taskType),
    )
    selectedTasks.push(
      ...pickRandomItems(remainingDefinitions, 6 - selectedTasks.length),
    )
  }

  const assignedAt = new Date().toISOString()
  const expiresAt = getEndOfTodayIso()

  return selectedTasks
    .map((definition, index) =>
      createTaskFromDefinition(definition, index, assignedAt, expiresAt),
    )
    .sort((left, right) => left.difficulty - right.difficulty)
}

const calculateLevelInfo = ({ previousLevel, totalXp }) => {
  let currentLevel = 0
  let consumedXp = 0
  let xpForNextLevel = 10

  while (totalXp - consumedXp >= xpForNextLevel) {
    consumedXp += xpForNextLevel
    currentLevel += 1
    xpForNextLevel = (currentLevel + 1) * 10
  }

  const xpProgress = totalXp - consumedXp
  const xpProgressPercentage =
    xpForNextLevel > 0 ? Math.floor((xpProgress / xpForNextLevel) * 100) : 0

  return {
    currentLevel,
    previousLevel,
    levelUp: currentLevel > previousLevel,
    xpProgress,
    xpForNextLevel,
    xpProgressPercentage,
  }
}

const calculateTaskStatistics = tasks => {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const today = new Date().toDateString()
  const todaysTasks = tasks.filter(
    task => new Date(task.assignedAt).toDateString() === today,
  )

  const rewards = tasks.reduce(
    (accumulator, task) => {
      if (task.rewardClaimed) {
        accumulator.xp += task.reward?.xp || 0
      }
      return accumulator
    },
    { xp: 0 },
  )

  const byDifficulty = [1, 2, 3, 4, 5].reduce((accumulator, difficulty) => {
    const difficultyTasks = tasks.filter(task => task.difficulty === difficulty)
    const completedDifficultyTasks = difficultyTasks.filter(
      task => task.completed,
    ).length
    accumulator[difficulty] = {
      total: difficultyTasks.length,
      completed: completedDifficultyTasks,
      completionRate:
        difficultyTasks.length > 0
          ? Math.round((completedDifficultyTasks / difficultyTasks.length) * 100)
          : 0,
    }
    return accumulator
  }, {})

  return {
    totalTasks,
    completedTasks,
    completionRate,
    today: {
      total: todaysTasks.length,
      completed: todaysTasks.filter(task => task.completed).length,
    },
    byDifficulty,
    rewards,
    streak: completedTasks === totalTasks && totalTasks > 0 ? 1 : 0,
  }
}

const isTaskSetExpired = tasks =>
  tasks.length === 0 || tasks.every(task => new Date(task.expiresAt) <= new Date())

const applyTaskProgressUpdate = ({ tasks, taskType, incrementBy, metadata }) => {
  const taskToUpdate = tasks.find(task => task.taskType === taskType && !task.completed)

  if (!taskToUpdate) {
    return { task: null, justCompleted: false }
  }

  const updatedTask = {
    ...taskToUpdate,
    metadata: taskToUpdate.metadata ? { ...taskToUpdate.metadata } : null,
    progress: taskToUpdate.progress || 0,
  }

  switch (taskType) {
    case 'ACHIEVE_RQM_SCORE': {
      const score = Number(metadata?.score)
      if (Number.isFinite(score) && score >= updatedTask.target) {
        updatedTask.progress = updatedTask.target
        updatedTask.metadata = { ...(updatedTask.metadata || {}), score }
      }
      break
    }

    case 'IMPROVE_READING_TIME': {
      const readingTime = Number(metadata?.readingTime)
      if (Number.isFinite(readingTime) && readingTime >= updatedTask.target) {
        updatedTask.progress = updatedTask.target
        updatedTask.metadata = { ...(updatedTask.metadata || {}), readingTime }
      }
      break
    }

    case 'USE_CATEGORIES': {
      const category = metadata?.category
      if (category) {
        const usedCategories = Array.isArray(updatedTask.metadata?.usedCategories)
          ? [...updatedTask.metadata.usedCategories]
          : []

        if (!usedCategories.includes(category)) {
          usedCategories.push(category)
          updatedTask.progress = Math.min(updatedTask.target, updatedTask.progress + 1)
        }

        updatedTask.metadata = { ...(updatedTask.metadata || {}), usedCategories }
      }
      break
    }

    default: {
      const safeIncrementBy = clampPositiveInteger(incrementBy)
      updatedTask.progress = Math.min(
        updatedTask.target,
        updatedTask.progress + safeIncrementBy,
      )
    }
  }

  let justCompleted = false
  if (updatedTask.progress >= updatedTask.target && !updatedTask.completed) {
    updatedTask.completed = true
    updatedTask.completedAt = new Date().toISOString()
    justCompleted = true
  }

  return { task: updatedTask, justCompleted }
}

// Async thunks for local (non-network) task management
export const fetchDailyTasks = createAsyncThunk(
  'quickClashDailyTasks/fetchTasks',
  async (_, { getState }) => {
    if (!DAILY_TASKS_ENABLED) {
      return []
    }

    const existingTasks = getState().quickClashDailyTasks.tasks
    if (!isTaskSetExpired(existingTasks)) {
      return existingTasks
    }
    return generateDailyTaskSet()
  },
)

export const refreshDailyTasks = createAsyncThunk(
  'quickClashDailyTasks/refreshTasks',
  async () => {
    if (!DAILY_TASKS_ENABLED) {
      return []
    }

    return generateDailyTaskSet()
  },
)

export const updateTaskProgress = createAsyncThunk(
  'quickClashDailyTasks/updateProgress',
  async ({ taskType, incrementBy = 1, metadata = {} }, { getState }) => {
    if (!DAILY_TASKS_ENABLED) {
      return { task: null, justCompleted: false }
    }

    const tasks = getState().quickClashDailyTasks.tasks
    return applyTaskProgressUpdate({ tasks, taskType, incrementBy, metadata })
  },
)

export const claimTaskReward = createAsyncThunk(
  'quickClashDailyTasks/claimReward',
  async (taskId, { rejectWithValue, dispatch, getState }) => {
    if (!DAILY_TASKS_ENABLED) {
      return rejectWithValue('Daily tasks are disabled')
    }

    const state = getState()
    const task = state.quickClashDailyTasks.tasks.find(item => item._id === taskId)
    const currentUser = state.auth.user

    if (!task) {
      return rejectWithValue('Task not found')
    }
    if (!task.completed) {
      return rejectWithValue('Task is not completed yet')
    }
    if (task.rewardClaimed) {
      return rejectWithValue('Reward already claimed')
    }
    if (!currentUser) {
      return rejectWithValue('Login required to claim rewards')
    }

    const reward = task.reward || { xp: 0 }
    const rewardXp = Number(reward.xp) || 0
    const currentXp = Number(currentUser.xp) || 0
    const newXp = currentXp + rewardXp
    const previousLevel = Number(currentUser.level) || 0
    const levelInfo = calculateLevelInfo({ previousLevel, totalXp: newXp })

    dispatch(
      setUser({
        ...currentUser,
        xp: newXp,
        level: levelInfo.currentLevel,
      }),
    )

    return {
      taskId,
      reward,
      newTotals: { xp: newXp },
      levelInfo,
    }
  },
)

export const fetchTaskStatistics = createAsyncThunk(
  'quickClashDailyTasks/fetchStatistics',
  async (_, { getState }) => {
    if (!DAILY_TASKS_ENABLED) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        today: { total: 0, completed: 0 },
        byDifficulty: {},
        rewards: { xp: 0 },
        streak: 0,
      }
    }

    const tasks = getState().quickClashDailyTasks.tasks
    return calculateTaskStatistics(tasks)
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
  lastLevelInfo: null,

  // Statistics
  statistics: {
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    today: { total: 0, completed: 0 },
    byDifficulty: {},
    rewards: { xp: 0 },
    streak: 0,
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
        const wasCompleted = state.tasks[index].completed
        state.tasks[index] = task
        if (!wasCompleted && task.completed) {
          state.justCompletedTaskId = task._id
        }
        state.statistics = calculateTaskStatistics(state.tasks)
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
        state.statistics = calculateTaskStatistics(action.payload)
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
        state.statistics = calculateTaskStatistics(action.payload)
      })
      .addCase(refreshDailyTasks.rejected, (state, action) => {
        state.tasksLoading = false
        state.tasksError = action.payload
      })

      // Update task progress
      .addCase(updateTaskProgress.fulfilled, (state, action) => {
        // Find and update the task in the state
        const { task, justCompleted } = action.payload || {}
        if (!task) {
          return
        }

        const index = state.tasks.findIndex(t => t._id === task._id)

        if (index !== -1) {
          state.tasks[index] = task

          // If the task was just completed, store its ID for animation
          if (justCompleted) {
            state.justCompletedTaskId = task._id
          }
        }

        state.statistics = calculateTaskStatistics(state.tasks)
      })
      .addCase(updateTaskProgress.rejected, (state, action) => {
        state.tasksError = action.payload
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
        state.statistics = calculateTaskStatistics(state.tasks)
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
        state.statistics = action.payload || calculateTaskStatistics(state.tasks)
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
