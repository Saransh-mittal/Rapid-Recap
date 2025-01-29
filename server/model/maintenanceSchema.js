const mongoose = require('mongoose')

const maintenanceSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: false,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  allowedRoles: [
    {
      type: String,
      enum: ['admin'],
      default: ['admin'],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

maintenanceSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

const MaintenanceWindow = mongoose.model('MaintenanceWindow', maintenanceSchema)

module.exports = MaintenanceWindow
