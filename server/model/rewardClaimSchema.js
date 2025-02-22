const mongoose = require('mongoose')

const rewardClaimSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
  },
  rank: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  claimCode: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['unclaimed', 'claimed', 'expired'],
    default: 'unclaimed',
  },
  claimedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for faster lookup by claim code
rewardClaimSchema.index({ claimCode: 1 })

// Index for finding unclaimed rewards
rewardClaimSchema.index({ status: 1, expiresAt: 1 })

const RewardClaim = mongoose.model('RewardClaim', rewardClaimSchema)

module.exports = RewardClaim
