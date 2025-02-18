const mongoose = require('mongoose')

const abilitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['BOOST', 'POWER_UP'],
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  multiplier: {
    type: Number,
    default: 1,
  },
  duration: {
    type: Number, // Duration in minutes, null means permanent
    default: null,
  },
  cooldown: {
    type: Number, // Cooldown in minutes before ability can be used again
    default: 0,
  },
  stackable: {
    type: Boolean,
    default: false,
  },
  maxStacks: {
    type: Number,
    default: 1,
  },
  icon: {
    type: String, // URL to ability icon
    default: null,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  claimed: {
    type: Boolean,
    default: false,
  },
  isBadgePowerUp: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Ability = mongoose.model('ABILITY', abilitySchema)

module.exports = Ability
