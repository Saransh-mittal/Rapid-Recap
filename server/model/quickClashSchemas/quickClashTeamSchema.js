// model/quickClashSchemas/quickClashTeamSchema.js
const mongoose = require('mongoose')

const quickClashTeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'USER',
          required: true,
        },
        role: {
          type: String,
          enum: ['leader', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'ready'],
          default: 'accepted',
        },
        selectedCategory: {
          type: String,
          default: null,
        },
      },
    ],
    teamType: {
      type: String,
      enum: ['manual', 'auto'],
      default: 'manual',
    },
    isPersistent: {
      type: Boolean,
      default: false,
    },
    isInMatch: {
      type: Boolean,
      default: false,
    },
    avgTrophies: {
      type: Number,
      default: 0,
    },
    teamCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    maxMembers: {
      type: Number,
      default: 4,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Create team code when creating a new team
quickClashTeamSchema.pre('save', async function (next) {
  if (this.isNew && !this.teamCode) {
    // Generate a 6-character alphanumeric code
    const generateCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let code = ''
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    }

    // Keep generating until we get a unique code
    let code = generateCode()
    let codeExists = true
    let attempts = 0

    while (codeExists && attempts < 10) {
      const existingTeam = await mongoose
        .model('QUICK_CLASH_TEAM')
        .findOne({ teamCode: code })
      if (!existingTeam) {
        codeExists = false
      } else {
        code = generateCode()
        attempts++
      }
    }

    this.teamCode = code
  }
  next()
})

// Calculate average trophies before saving
quickClashTeamSchema.pre('save', async function (next) {
  if (this.members && this.members.length > 0) {
    // Get user IDs of all team members
    const userIds = this.members.map(member => member.user)

    // Fetch user trophies from the database
    const User = mongoose.model('USER')
    const users = await User.find(
      { _id: { $in: userIds } },
      'quickClashTrophies',
    )

    // Calculate average trophies
    let totalTrophies = 0
    let count = 0

    users.forEach(user => {
      if (
        user.quickClashTrophies !== undefined &&
        user.quickClashTrophies !== null
      ) {
        totalTrophies += user.quickClashTrophies
        count++
      } else {
        // Use default trophy value if not set
        totalTrophies += 1000 // Default starting trophies
        count++
      }
    })

    this.avgTrophies = count > 0 ? Math.round(totalTrophies / count) : 0
  }
  next()
})

// Add indexes for efficient queries
quickClashTeamSchema.index({ creator: 1 })
quickClashTeamSchema.index({ teamCode: 1 })
quickClashTeamSchema.index({ 'members.user': 1 })
quickClashTeamSchema.index({ isInMatch: 1, avgTrophies: 1 })
quickClashTeamSchema.index({ lastActive: -1 })

const QuickClashTeam = mongoose.model('QUICK_CLASH_TEAM', quickClashTeamSchema)

module.exports = QuickClashTeam
