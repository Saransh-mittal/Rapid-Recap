const mongoose = require('mongoose')

const inventorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
  },
  abilities: [
    {
      abilityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ABILITY',
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 0,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
      acquiredAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
})

// Index for faster queries
inventorySchema.index({ user: 1 })
inventorySchema.index({ 'abilities.expiresAt': 1 })
inventorySchema.index({ 'abilities.isActive': 1 })

const Inventory = mongoose.model('INVENTORY', inventorySchema)

module.exports = Inventory
