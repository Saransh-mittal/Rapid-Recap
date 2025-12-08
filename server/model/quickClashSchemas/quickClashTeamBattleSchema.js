// model/quickClashSchemas/quickClashTeamBattleSchema.js
const mongoose = require('mongoose')

const quickClashTeamBattleSchema = new mongoose.Schema(
  {
    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QUICK_CLASH_TEAM',
      required: true,
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QUICK_CLASH_TEAM',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'expired', 'cancelled'],
      default: 'pending',
    },
    categories: [
      {
        type: String,
        required: true,
      },
    ],
    // Individual challenge IDs for each category
    challenges: [
      {
        category: {
          type: String,
          required: true,
        },
        challenge: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'QUICK_CLASH_CHALLENGE',
        },
        teamAPlayer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'USER',
          default: null,
        },
        teamBPlayer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'USER',
          default: null,
        },
        teamAScore: {
          type: Number,
          default: 0,
        },
        teamBScore: {
          type: Number,
          default: 0,
        },
        winner: {
          type: String,
          enum: ['teamA', 'teamB', 'tie', null],
          default: null,
        },
        teamACompleted: {
          type: Boolean,
          default: false,
        },
        teamBCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // Overall match results
    teamAWins: {
      type: Number,
      default: 0,
    },
    teamBWins: {
      type: Number,
      default: 0,
    },
    ties: {
      type: Number,
      default: 0,
    },
    teamATotalScore: {
      type: Number,
      default: 0,
    },
    teamBTotalScore: {
      type: Number,
      default: 0,
    },
    winner: {
      type: String,
      enum: ['teamA', 'teamB', 'tie', null],
      default: null,
    },
    // Trophy calculations
    trophyExchange: {
      baseAmount: {
        type: Number,
        default: 120, // Base trophies for 4v4 is 120
      },
      adjustedAmount: {
        type: Number,
        default: 0,
      },
      bonuses: {
        strongerTeam: {
          applied: { type: Boolean, default: false },
          amount: { type: Number, default: 0 },
        },
        allWins: {
          applied: { type: Boolean, default: false },
          amount: { type: Number, default: 0 },
        },
      },
      finalAmount: {
        type: Number,
        default: 0,
      },
      perPlayerAmount: {
        type: Number,
        default: 0,
      },
    },
    // Team member participation and results
    teamAMembers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'USER',
          required: true,
        },
        category: {
          type: String,
          default: null,
        },
        challenge: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'QUICK_CLASH_CHALLENGE',
          default: null,
        },
        participated: {
          type: Boolean,
          default: false,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        score: {
          type: Number,
          default: 0,
        },
        previousTrophies: {
          type: Number,
          default: 0,
        },
        newTrophies: {
          type: Number,
          default: 0,
        },
        trophyChange: {
          type: Number,
          default: 0,
        },
        // Betting fields
        betAmount: {
          type: Number,
          default: 0,
        },
        betResult: {
          type: String,
          enum: ['won', 'lost', 'returned'],
        },
        betTrophyChange: {
          type: Number,
          default: 0,
        },
        // Powerup Loadout
        loadout: {
          items: [
            {
              powerupId: String, // e.g., 'TIME_WARP'
              type: { type: String }, // 'active', 'passive'
              cost: Number,
              phase: String, // 'forge', 'quiz', 'both'
            },
          ],
          housingUsed: {
            type: Number,
            default: 0,
            max: 30,
          },
        },
      },
    ],
    teamBMembers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'USER',
          required: true,
        },
        category: {
          type: String,
          default: null,
        },
        challenge: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'QUICK_CLASH_CHALLENGE',
          default: null,
        },
        participated: {
          type: Boolean,
          default: false,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        score: {
          type: Number,
          default: 0,
        },
        previousTrophies: {
          type: Number,
          default: 0,
        },
        newTrophies: {
          type: Number,
          default: 0,
        },
        trophyChange: {
          type: Number,
          default: 0,
        },
        // Betting fields
        betAmount: {
          type: Number,
          default: 0,
        },
        betResult: {
          type: String,
          enum: ['won', 'lost', 'returned'],
        },
        betTrophyChange: {
          type: Number,
          default: 0,
        },
        // Powerup Loadout
        loadout: {
          items: [
            {
              powerupId: String, // e.g., 'TIME_WARP'
              type: { type: String }, // 'active', 'passive'
              cost: Number,
              phase: String, // 'forge', 'quiz', 'both'
            },
          ],
          housingUsed: {
            type: Number,
            default: 0,
            max: 30,
          },
        },
      },
    ],
    // Team Powerup Pools
    teamAPool: {
      items: [
        {
          powerupId: String,
          type: { type: String },
          cost: Number,
          phase: String,
          donatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'USER',
          },
          donatedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      housingUsed: {
        type: Number,
        default: 0,
        max: 150,
      },
    },
    teamBPool: {
      items: [
        {
          powerupId: String,
          type: { type: String },
          cost: Number,
          phase: String,
          donatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'USER',
          },
          donatedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      housingUsed: {
        type: Number,
        default: 0,
        max: 150,
      },
    },
    // Win Probability Data (Team Mode)
    winProbability: {
      teamA: {
        // Initial calculation (at battle start)
        initial: {
          type: Number,
          min: 0,
          max: 1,
          required: true,
        },
        initialEffectiveRating: Number,
        initialComponents: {
          trophyBase: Number,
          performanceMod: Number,
          synergyMod: Number,
        },
        isEstablishedTeam: Boolean,
        battleCount: Number,

        // Live updates (changes as challenges complete)
        current: {
          type: Number,
          min: 0,
          max: 1,
          required: true,
        },
        // History of probability changes (8 updates max)
        history: [
          {
            afterUserId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'USER',
            },
            afterChallenge: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'QUICK_CLASH_CHALLENGE',
            },
            probability: Number,
            timestamp: Date,
            certaintyScore: Number,
            projectedWins: Number,
          },
        ],
      },
      teamB: {
        initial: {
          type: Number,
          min: 0,
          max: 1,
          required: true,
        },
        initialEffectiveRating: Number,
        initialComponents: {
          trophyBase: Number,
          performanceMod: Number,
          synergyMod: Number,
        },
        isEstablishedTeam: Boolean,
        battleCount: Number,
        current: {
          type: Number,
          min: 0,
          max: 1,
          required: true,
        },
        history: [
          {
            afterUserId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'USER',
            },
            afterChallenge: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'QUICK_CLASH_CHALLENGE',
            },
            probability: Number,
            timestamp: Date,
            certaintyScore: Number,
            projectedWins: Number,
          },
        ],
      },
      calculatedAt: Date,
      lastUpdatedAt: Date,
      totalUpdates: {
        type: Number,
        default: 0,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    allMatchesWon: {
      type: Boolean,
      default: false,
    },
    fromMatchmaking: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for efficient queries
quickClashTeamBattleSchema.index({ teamA: 1, status: 1 })
quickClashTeamBattleSchema.index({ teamB: 1, status: 1 })
quickClashTeamBattleSchema.index({ status: 1, expiresAt: 1 })
quickClashTeamBattleSchema.index({ 'teamAMembers.user': 1 })
quickClashTeamBattleSchema.index({ 'teamBMembers.user': 1 })
quickClashTeamBattleSchema.index({ createdAt: -1 })
quickClashTeamBattleSchema.index({
  'winProbability.teamA.current': -1,
})
quickClashTeamBattleSchema.index({
  'winProbability.teamB.current': -1,
})
quickClashTeamBattleSchema.index({
  'winProbability.lastUpdatedAt': -1,
})

const QuickClashTeamBattle = mongoose.model(
  'QUICK_CLASH_TEAM_BATTLE',
  quickClashTeamBattleSchema,
)

module.exports = QuickClashTeamBattle
