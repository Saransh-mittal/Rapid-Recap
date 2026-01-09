// model/quickClashSchemas/quickClashTeamSchema.js
const mongoose = require('mongoose')

const quickClashTeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
      default: null, // Null for session-only teams (Spark Engine)
    },
    members: [
      {
        // Either user or sessionPlayer must be set (not both)
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'USER',
          default: null,
        },
        // Spark Engine - session player (for viral invite flow)
        sessionPlayer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'PLAY_SESSION',
          default: null,
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
        // Track which team the member originally came from (if auto-formed)
        sourceTeam: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'QUICK_CLASH_TEAM',
          default: null,
        },
      },
    ],
    teamType: {
      type: String,
      enum: ['manual', 'auto'],
      default: 'manual',
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
    // Add fields to track origin for auto-formed teams
    formationInfo: {
      isAutoFormed: {
        type: Boolean,
        default: false,
      },
      sourceTeams: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'QUICK_CLASH_TEAM',
        },
      ],
      soloPlayers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'USER',
        },
      ],
      formationDate: {
        type: Date,
        default: null,
      },
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
    // Separate user IDs and session player IDs
    const userIds = this.members
      .filter(member => member.user)
      .map(member => member.user)
    const sessionPlayerIds = this.members
      .filter(member => member.sessionPlayer)
      .map(member => member.sessionPlayer)

    // Fetch user trophies from the database
    const User = mongoose.model('USER')
    const users = await User.find(
      { _id: { $in: userIds } },
      'quickClashTrophies',
    )

    // Fetch session player trophies
    let sessionPlayers = []
    if (sessionPlayerIds.length > 0) {
      const PlaySession = mongoose.model('PLAY_SESSION')
      sessionPlayers = await PlaySession.find(
        { _id: { $in: sessionPlayerIds } },
        'trophies',
      )
    }

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

    // Include session players in the calculation
    sessionPlayers.forEach(sp => {
      if (sp.trophies !== undefined && sp.trophies !== null) {
        totalTrophies += sp.trophies
        count++
      } else {
        totalTrophies += 1000
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
quickClashTeamSchema.index({ 'members.sessionPlayer': 1 }) // Spark Engine index
quickClashTeamSchema.index({ isInMatch: 1, avgTrophies: 1 })
quickClashTeamSchema.index({ lastActive: -1 })
quickClashTeamSchema.index({ 'formationInfo.isAutoFormed': 1 }) // Index for auto-formed teams
quickClashTeamSchema.index({ 'formationInfo.sourceTeams': 1 }) // Index for source teams

const QuickClashTeam = mongoose.model('QUICK_CLASH_TEAM', quickClashTeamSchema)

module.exports = QuickClashTeam

