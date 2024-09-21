const mongoose = require('mongoose')

const tournamentSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  registrationStartDate: {
    type: Date,
    required: true,
  },
  registrationEndDate: {
    type: Date,
    required: true,
  },
  tournamentNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
    },
  ],
  status: {
    type: String,
    enum: ['upcoming', 'registration', 'ongoing', 'completed'],
    default: 'upcoming',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isUnderMaintenance: {
    type: Boolean,
    default: false,
  },
})

const Tournament = mongoose.model('TOURNAMENT', tournamentSchema)

module.exports = Tournament
