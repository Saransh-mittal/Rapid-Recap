const mongoose = require('mongoose')

const demotionSummarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
  },
  prevIQ: {
    type: Number,
    required: true,
  },
  newIQ: {
    type: Number,
    required: true,
  },
  prevSociety: {
    type: String,
    required: true,
  },
  newSociety: {
    type: String,
    required: true,
  },
  prevCircle: String,
  newCircle: String,
  expiryDate: {
    type: Date,
    required: true,
  },
  viewed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 20, // Document will be automatically deleted after 20 days
  },
})

// Add indexes
demotionSummarySchema.index({ userId: 1 })
demotionSummarySchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 })

const DemotionSummary = mongoose.model(
  'DEMOTION_SUMMARY',
  demotionSummarySchema,
)

module.exports = DemotionSummary
