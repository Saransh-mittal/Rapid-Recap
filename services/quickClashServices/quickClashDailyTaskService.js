// services/quickClashServices/quickClashDailyTaskService.js
const mongoose = require('mongoose')
const moment = require('moment')
const QuickClashDailyTask = require('../../model/quickClashSchemas/quickClashDailyTaskSchema')
const User = require('../../model/userSchema')

// Task definitions with template values
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
    descriptionTemplate:
      'Win {target} Quick Clash challenges against other players',
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
    titleTemplate: 'Use {target} Different Categories',
    descriptionTemplate:
      'Complete challenges in {target} different knowledge categories',
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
      'Complete a challenge while spending at least {target} seconds in the reading phase',
    targetRange: [60, 90, 120],
    rewardScale: { xp: 15 },
    difficulty: 2,
  },
]

/**
 * Generate daily tasks for a user
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Array>} Generated tasks
 */
const generateDailyTasks = async ({ userId }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      // Check if user already has active tasks
      const existingTasks = await QuickClashDailyTask.find({
        user: userId,
        expiresAt: { $gt: new Date() },
      }).session(session)

      if (existingTasks.length > 0) {
        return existingTasks // User already has active tasks
      }

      // Get user data to personalize tasks
      const user = await User.findById(userId).session(session)

      if (!user) {
        throw new Error('User not found')
      }

      // Select random tasks (3 easy, 2 medium, 1 hard)
      const easyTasks = TASK_DEFINITIONS.filter(task => task.difficulty <= 2)
      const mediumTasks = TASK_DEFINITIONS.filter(task => task.difficulty === 3)
      const hardTasks = TASK_DEFINITIONS.filter(task => task.difficulty >= 4)

      // Shuffle and select
      const getRandomItems = (array, count) => {
        const shuffled = [...array].sort(() => 0.5 - Math.random())
        return shuffled.slice(0, count)
      }

      const selectedTasks = [
        ...getRandomItems(easyTasks, 3),
        ...getRandomItems(mediumTasks, 2),
        ...getRandomItems(hardTasks, 1),
      ]

      // Create task documents
      const tomorrow = moment().add(1, 'day').endOf('day').toDate()

      const taskDocuments = selectedTasks.map(taskDef => {
        // Choose difficulty level based on user experience
        const difficultyLevel = Math.min(
          Math.floor((user.experienceLevel || 1) / 10),
          taskDef.targetRange.length - 1,
        )

        const target = taskDef.targetRange[difficultyLevel]

        return new QuickClashDailyTask({
          taskType: taskDef.taskType,
          user: userId,
          title: taskDef.titleTemplate.replace('{target}', target),
          description: taskDef.descriptionTemplate.replace('{target}', target),
          target,
          reward: {
            xp: taskDef.rewardScale.xp * (difficultyLevel + 1),
          },
          difficulty: taskDef.difficulty,
          expiresAt: tomorrow,
        })
      })

      // Save all tasks
      await QuickClashDailyTask.insertMany(taskDocuments, { session })

      return taskDocuments
    })
  } finally {
    session.endSession()
  }
}

/**
 * Get active tasks for a user
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Array>} Active tasks
 */
const getUserDailyTasks = async ({ userId }) => {
  // Get active tasks
  let tasks = await QuickClashDailyTask.find({
    user: userId,
    expiresAt: { $gt: new Date() },
  }).sort({ difficulty: 1 })

  // If no active tasks, generate new ones
  if (tasks.length === 0) {
    tasks = await generateDailyTasks({ userId })
  }

  return tasks
}

/**
 * Update task progress
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {string} params.taskType - Task type
 * @param {number} params.incrementBy - Amount to increment progress by
 * @returns {Promise<Object>} Updated task
 */
const updateTaskProgress = async ({
  userId,
  taskType,
  incrementBy = 1,
  metadata = {},
}) => {
  // Find the active task
  const task = await QuickClashDailyTask.findOne({
    user: userId,
    taskType,
    expiresAt: { $gt: new Date() },
    completed: false,
  })
  if (!task) {
    return null // No active task of this type
  }

  switch (taskType) {
    case 'ACHIEVE_RQM_SCORE':
      // Check if the score meets or exceeds the target
      const { score } = metadata
      if (score && score >= task.target) {
        // If score meets or exceeds the target, set progress to target (complete the task)
        if (!task.metadata) {
          task.metadata = { score }
        }
        task.progress = task.target
      }
      break

    case 'IMPROVE_READING_TIME':
      // Check if reading time meets or exceeds the target
      const { readingTime } = metadata
      if (readingTime && readingTime >= task.target) {
        // If reading time meets or exceeds the target, set progress to target
        if (!task.metadata) {
          task.metadata = { readingTime }
        }
        task.progress = task.target
      }
      break

    case 'USE_CATEGORIES':
      // For category-based tasks, we need to track unique categories
      const { category } = metadata
      if (category) {
        // We need to store used categories somewhere
        // If task has no metadata, initialize it
        if (!task.metadata) {
          task.metadata = { usedCategories: [] }
        }

        // If this is a new category, increment progress
        if (!task.metadata.usedCategories.includes(category)) {
          task.metadata.usedCategories.push(category)
          task.progress += 1
        }
      }
      break

    default:
      // For regular increment-based tasks
      task.progress += incrementBy
  }
  // Check if task is now completed
  if (task.progress >= task.target && !task.completed) {
    task.completed = true
    task.completedAt = new Date()
  }

  await task.save()
  return task
}

/**
 * Claim task reward
 * @param {Object} params - Parameters
 * @param {string} params.taskId - Task ID
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Reward result
 */
const claimTaskReward = async ({ taskId, userId }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      // Find the completed task
      const task = await QuickClashDailyTask.findOne({
        _id: taskId,
        user: userId,
        completed: true,
        rewardClaimed: false,
      }).session(session)

      if (!task) {
        throw new Error('Task not found or already claimed')
      }

      // Mark as claimed
      task.rewardClaimed = true
      await task.save({ session })

      // Update user with rewards
      const user = await User.findById(userId).session(session)

      if (!user) {
        throw new Error('User not found')
      }

      // Store original level for comparison
      const originalLevel = user.level || 0

      // Add XP to user
      const xpAwarded = task.reward.xp
      user.xp = (user.xp || 0) + xpAwarded

      // Calculate new level based on total XP
      let level = originalLevel
      const xpBaseAtCurrLevel = (level * (level + 1) * 10) / 2
      let totalXp = user.xp
      let leftXp = totalXp - xpBaseAtCurrLevel

      while (leftXp >= (level + 1) * 10) {
        level++
        leftXp -= level * 10
      }

      // Calculate XP needed for next level
      const xpForNextLevel = (level + 1) * 10
      const xpProgress = leftXp
      const xpProgressPercentage = Math.floor(
        (xpProgress / xpForNextLevel) * 100,
      )

      // Update user level
      user.level = level
      const levelUp = level > originalLevel

      await user.save({ session })

      return {
        taskId: task._id,
        reward: task.reward,
        newTotals: {
          xp: user.xp,
        },
        levelInfo: {
          currentLevel: level,
          previousLevel: originalLevel,
          levelUp,
          xpProgress,
          xpForNextLevel,
          xpProgressPercentage,
        },
      }
    })
  } finally {
    session.endSession()
  }
}

/**
 * Get comprehensive task statistics for a user
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Detailed task statistics
 */
const getTaskStatistics = async ({ userId }) => {
  // Define time ranges for queries
  const today = moment().startOf('day')
  const yesterday = moment().subtract(1, 'days').startOf('day')
  const pastWeek = moment().subtract(7, 'days').startOf('day')
  const pastMonth = moment().subtract(30, 'days').startOf('day')

  // Get all tasks for the user in the past month (for better statistics)
  const tasks = await QuickClashDailyTask.find({
    user: userId,
    assignedAt: { $gte: pastMonth.toDate() },
  })

  // Get user for streak information
  const user = await User.findById(userId).select(
    'lastTaskCompletionDate taskCompletionStreak',
  )

  // Basic statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  const unclaimedRewards = tasks.filter(
    task => task.completed && !task.rewardClaimed,
  ).length

  // Today's task counts
  const todaysTasks = tasks.filter(task =>
    moment(task.assignedAt).isSame(today, 'day'),
  )
  const todaysCompleted = todaysTasks.filter(task => task.completed).length
  const todaysCompletionRate =
    todaysTasks.length > 0 ? (todaysCompleted / todaysTasks.length) * 100 : 0

  // Yesterday's task counts (for comparison)
  const yesterdaysTasks = tasks.filter(task =>
    moment(task.assignedAt).isSame(yesterday, 'day'),
  )
  const yesterdaysCompleted = yesterdaysTasks.filter(
    task => task.completed,
  ).length

  // Get tasks by difficulty
  const tasksByDifficulty = [1, 2, 3, 4, 5].reduce((acc, level) => {
    const difficultyTasks = tasks.filter(task => task.difficulty === level)
    acc[level] = {
      total: difficultyTasks.length,
      completed: difficultyTasks.filter(task => task.completed).length,
      completionRate:
        difficultyTasks.length > 0
          ? (difficultyTasks.filter(task => task.completed).length /
              difficultyTasks.length) *
            100
          : 0,
    }
    return acc
  }, {})

  // Get tasks by type
  const taskTypes = [
    'COMPLETE_CHALLENGES',
    'ACHIEVE_RQM_SCORE',
    'WIN_CHALLENGES',
    'CHALLENGE_FRIEND',
    'USE_CATEGORIES',
    'COMPLETE_MATCHMAKING',
    'VIEW_ANALYSES',
    'MAINTAIN_WINSTREAK',
    'IMPROVE_READING_TIME',
  ]

  const tasksByType = taskTypes.reduce((acc, type) => {
    const typeTasks = tasks.filter(task => task.taskType === type)
    acc[type] = {
      total: typeTasks.length,
      completed: typeTasks.filter(task => task.completed).length,
    }
    return acc
  }, {})

  // Determine best performing category/difficulty
  let bestDifficulty = { level: 0, rate: 0 }
  for (const [level, stats] of Object.entries(tasksByDifficulty)) {
    if (stats.total >= 3 && stats.completionRate > bestDifficulty.rate) {
      bestDifficulty = {
        level: parseInt(level),
        rate: stats.completionRate,
        completed: stats.completed,
        total: stats.total,
      }
    }
  }

  // Get total rewards earned
  const totalRewardsEarned = tasks
    .filter(task => task.rewardClaimed)
    .reduce(
      (acc, task) => {
        acc.xp += task.reward.xp
        return acc
      },
      { xp: 0 },
    )

  // Recent activity - last 5 completed tasks
  const recentActivity = tasks
    .filter(task => task.completed)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 5)
    .map(task => ({
      id: task._id,
      title: task.title,
      type: task.taskType,
      difficulty: task.difficulty,
      completedAt: task.completedAt,
      rewardClaimed: task.rewardClaimed,
    }))

  // Streak information - either from user document or calculate
  let streak = user?.taskCompletionStreak || 0

  // If we need to calculate streak manually (if not stored in user document)
  if (!user?.taskCompletionStreak) {
    // Get all completed tasks sorted by completion date
    const userTasks = await QuickClashDailyTask.find({
      user: userId,
      completed: true,
    }).sort({ completedAt: -1 })

    if (userTasks.length > 0) {
      // Check if any task was completed today
      const latestTask = userTasks[0]
      const latestDate = moment(latestTask.completedAt).startOf('day')
      const isToday = latestDate.isSame(today, 'day')

      if (isToday) {
        // Start streak counter at 1 for today
        streak = 1
        let previousDate = today.clone().subtract(1, 'day')

        // Check previous days
        for (let i = 1; i < userTasks.length; i++) {
          const taskDate = moment(userTasks[i].completedAt).startOf('day')

          // If this task's date matches the previous date we're looking for
          if (taskDate.isSame(previousDate, 'day')) {
            streak++
            previousDate = previousDate.clone().subtract(1, 'day')
          } else if (taskDate.isBefore(previousDate, 'day')) {
            // We found a gap, so break the loop
            break
          }
        }
      }
    }
  }

  // Weekly progress trend - percentage completed each day for the past week
  const weeklyTrend = []
  for (let i = 6; i >= 0; i--) {
    const date = moment().subtract(i, 'days').startOf('day')
    const dayTasks = tasks.filter(task =>
      moment(task.assignedAt).isSame(date, 'day'),
    )
    const dayCompleted = dayTasks.filter(task => task.completed).length
    const dayRate =
      dayTasks.length > 0 ? (dayCompleted / dayTasks.length) * 100 : 0

    weeklyTrend.push({
      date: date.format('YYYY-MM-DD'),
      dayName: date.format('ddd'),
      totalTasks: dayTasks.length,
      completedTasks: dayCompleted,
      completionRate: dayRate,
    })
  }

  return {
    // Overall statistics
    totalTasks,
    completedTasks,
    unclaimedRewards,
    completionRate,

    // Today's stats
    today: {
      total: todaysTasks.length,
      completed: todaysCompleted,
      completionRate: todaysCompletionRate,
    },

    // Yesterday comparison
    yesterday: {
      total: yesterdaysTasks.length,
      completed: yesterdaysCompleted,
    },

    // Categorized stats
    byDifficulty: tasksByDifficulty,
    byType: tasksByType,

    // Performance metrics
    bestPerforming: bestDifficulty.level ? bestDifficulty : null,
    streak,

    // Rewards
    rewards: totalRewardsEarned,

    // Activity and trends
    recentActivity,
    weeklyTrend,
  }
}

module.exports = {
  generateDailyTasks,
  getUserDailyTasks,
  updateTaskProgress,
  claimTaskReward,
  getTaskStatistics,
}
