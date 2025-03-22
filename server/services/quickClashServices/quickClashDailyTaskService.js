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

      // Add XP to user
      user.xp = (user.xp || 0) + task.reward.xp

      await user.save({ session })

      return {
        taskId: task._id,
        reward: task.reward,
        newTotals: {
          xp: user.xp,
        },
      }
    })
  } finally {
    session.endSession()
  }
}

/**
 * Get task completion statistics
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Task statistics
 */
const getTaskStatistics = async ({ userId }) => {
  const today = moment().startOf('day')
  const pastWeek = moment().subtract(7, 'days').startOf('day')

  // Get all tasks for the user in the past week
  const tasks = await QuickClashDailyTask.find({
    user: userId,
    assignedAt: { $gte: pastWeek.toDate() },
  })

  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // Get today's task counts
  const todaysTasks = tasks.filter(task =>
    moment(task.assignedAt).isSame(today, 'day'),
  )
  const todaysCompleted = todaysTasks.filter(task => task.completed).length

  // Get tasks by difficulty
  const tasksByDifficulty = tasks.reduce((acc, task) => {
    const diffLevel = task.difficulty
    if (!acc[diffLevel]) {
      acc[diffLevel] = { total: 0, completed: 0 }
    }
    acc[diffLevel].total++
    if (task.completed) {
      acc[diffLevel].completed++
    }
    return acc
  }, {})

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

  return {
    totalTasks,
    completedTasks,
    completionRate,
    today: {
      total: todaysTasks.length,
      completed: todaysCompleted,
    },
    byDifficulty: tasksByDifficulty,
    rewards: totalRewardsEarned,
  }
}

module.exports = {
  generateDailyTasks,
  getUserDailyTasks,
  updateTaskProgress,
  claimTaskReward,
  getTaskStatistics,
}
