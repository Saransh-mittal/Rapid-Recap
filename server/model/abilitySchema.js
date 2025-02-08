const mongoose = require('mongoose')

const abilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
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
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for faster queries
abilitySchema.index({ name: 1 })
abilitySchema.index({ type: 1 })
abilitySchema.index({ isActive: 1 })

const Ability = mongoose.model('ABILITY', abilitySchema)

module.exports = Ability
