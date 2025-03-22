// model/quickClashSchemas/quickClashDailyTaskSchema.js
const mongoose = require('mongoose')

const quickClashDailyTaskSchema = new mongoose.Schema({
  // Task type uniquely identifies the task
  taskType: {
    type: String,
    required: true,
    enum: [
      'COMPLETE_CHALLENGES',
      'ACHIEVE_RQM_SCORE',
      'WIN_CHALLENGES',
      'CHALLENGE_FRIEND',
      'USE_CATEGORIES',
      'COMPLETE_MATCHMAKING',
      'VIEW_ANALYSES',
      'MAINTAIN_WINSTREAK',
      'IMPROVE_READING_TIME',
    ],
  },
  // User this task belongs to
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
  },
  // Title shown to users
  title: {
    type: String,
    required: true,
  },
  // Description explains the task
  description: {
    type: String,
    required: true,
  },
  // Target value (e.g., number of challenges to complete)
  target: {
    type: Number,
    required: true,
    min: 1,
  },
  // Current progress
  progress: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Rewards (XP, etc.)
  reward: {
    xp: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  // Difficulty level (1-5)
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 1,
  },
  // Task-specific metadata (e.g., list of used categories)
  metadata: {
    type: Object,
    default: null,
  },
  // When the task was assigned
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  // When the task expires
  expiresAt: {
    type: Date,
    required: true,
  },
  // Whether the task has been completed
  completed: {
    type: Boolean,
    default: false,
  },
  // Whether the reward has been claimed
  rewardClaimed: {
    type: Boolean,
    default: false,
  },
  // When the task was completed
  completedAt: {
    type: Date,
  },
})

// Create indexes for efficient queries
quickClashDailyTaskSchema.index({ user: 1, expiresAt: 1 })
quickClashDailyTaskSchema.index({ user: 1, completed: 1 })

const QuickClashDailyTask = mongoose.model(
  'QUICK_CLASH_DAILY_TASK',
  quickClashDailyTaskSchema,
)

module.exports = QuickClashDailyTask
