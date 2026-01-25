// model/quickClashSchemas/analyticsAdminSchema.js
// Schema for managing analytics dashboard access control
// Part of the new Quick Clash Validation Analytics system

const mongoose = require('mongoose')

const analyticsAdminSchema = new mongoose.Schema(
  {
    // User who has analytics access
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
      required: true,
      unique: true,
    },
    // User who granted access
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
      required: true,
    },
    // When access was granted
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    // Access level
    accessLevel: {
      type: String,
      enum: ['viewer', 'admin'],
      default: 'viewer',
    },
    // Whether access is currently active
    isActive: {
      type: Boolean,
      default: true,
    },
    // Notes about why access was granted
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient lookups
analyticsAdminSchema.index({ user: 1 })
analyticsAdminSchema.index({ isActive: 1 })

const AnalyticsAdmin = mongoose.model('ANALYTICS_ADMIN', analyticsAdminSchema)

module.exports = AnalyticsAdmin
