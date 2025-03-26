// model/specialCategorySchema.js
const mongoose = require('mongoose')

const specialCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '🔥', // Default icon
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0, // Higher numbers will appear first
    },
    apiEndpoint: {
      type: String,
      default: null, // Optional API endpoint for automatic fetching
    },
    apiConfig: {
      apiKey: String,
      queryParams: mongoose.Schema.Types.Mixed,
      headers: mongoose.Schema.Types.Mixed,
    },
    fetchSchedule: {
      type: String, // Cron expression, e.g., "0 */6 * * *" for every 6 hours
      default: null,
    },
    lastFetched: {
      type: Date,
      default: null,
    },
    badgeColor: {
      type: String,
      default: 'purple.500', // Chakra UI color
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'SpecialCategories' },
)

// Add timestamps for createdAt and updatedAt
specialCategorySchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

// Create indexes for efficient queries
specialCategorySchema.index({ isActive: 1 })
specialCategorySchema.index({ startDate: 1, endDate: 1 })
specialCategorySchema.index({ key: 1 }, { unique: true })

// Method to check if a category is currently active based on dates
specialCategorySchema.methods.isCurrentlyActive = function () {
  const now = new Date()
  return this.isActive && this.startDate <= now && this.endDate >= now
}

const SpecialCategory = mongoose.model(
  'SPECIAL_CATEGORY',
  specialCategorySchema,
)

module.exports = SpecialCategory
