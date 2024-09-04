const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const configService = require('../configService')
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
      unique: true,
      required: true,
    },
    // phone: {
    //   type: Number,
    // },
    password: {
      type: String,
    },
    cpassword: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
      required: true,
    },
    otpCnt: {
      type: Number,
      default: 0,
    },
    otpCntResetTime: {
      type: Date,
      default: null,
    },
    googleId: {
      type: String,
    },
    googleEmail: {
      type: String,
    },
    quizAttempts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QUIZ_ATTEMPT',
      },
    ],
    IQ_score: {
      type: Number,
      default: 0,
    },
    prevIQScore: {
      type: Number,
      default: 0,
    },
    userScore: {
      type: Number,
      default: 0,
    },
    baseUserScore: {
      type: Number,
      default: 0,
    },
    pic: {
      type: String,
      required: true,
      default:
        'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    bio: {
      type: String,
      default: '',
    },
    inGameName: {
      type: String,
      unique: true,
    },
    dailyIQScores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DailyIQ',
      },
    ],
    easyQuizCount: {
      type: Number,
      default: 0,
    },
    mediumQuizCount: {
      type: Number,
      default: 0,
    },
    hardQuizCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    maxIQScore: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    profilePrivacy: {
      fullProfile: { type: Boolean, default: false },
      lineGraph: { type: Boolean, default: false },
      barGraph: { type: Boolean, default: false },
      solvedQuizzes: { type: Boolean, default: false },
      // dailyActivity: { type: Boolean, default: false },
      society: { type: Boolean, default: false },
      seasonAnalytics: { type: Boolean, default: false },
    },
    societyUpgradeMessage: {
      type: String,
      default: '',
    },
    baseUpgradeIQ: {
      type: Number,
    },
    applicationUpdates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'APPLICATION_UPDATES', // This should match the model name
      },
    ],
    streak: {
      type: Number,
      default: 0,
    },
    streakExpiry: {
      type: Date,
      default: function () {
        // Set the default streak expiry to one day from now
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + 1) // Set date to one day from now
        expiry.setHours(0, 0, 0, 0) // Set time to start of the day
        return expiry
      },
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    todaysQuizCnt: {
      type: Number,
      default: 0,
    },
    streakBeforeBreak: {
      type: Number,
      default: 0,
    },
    revivalPeriodEnd: {
      type: Date,
      default: null,
    },
    avgRQM: {
      type: Number,
      default: 0,
    },
    todayBoost: {
      type: Boolean,
      default: false,
    },
    newSeasonModal: {
      type: Boolean,
      default: true,
    },
    newSeasonModalUpdateAt: {
      type: Date,
      default: Date.now,
    },
    quinBoosts: [
      {
        quinBoost: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'QUIN_BOOST',
        },
        boosted: {
          type: Boolean,
          default: true,
        },
      },
    ],
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 0,
    },
    activities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
      },
    ],
    timeSpent: [
      {
        articleId: mongoose.Schema.Types.ObjectId,
        timeSpent: Number,
        date: { type: Date, default: Date.now },
      },
    ],
    role: { type: String, enum: ['user', 'admin', 'guest'], default: 'user' },
    rankedInCurrentSeason: {
      type: Boolean,
      default: false,
    },
    currentSeason: {
      type: Number,
      default: parseInt(configService.getCurrentSeason(), 10),
    },
    previousSeasonData: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SEASON_DATA',
      },
    ],
    maxIQScorePerSeason: [
      {
        season: Number,
        maxIQScore: Number,
      },
    ],
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ARTICLE',
      },
    ],
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'USER',
      },
    ],
    sentRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FriendRequest',
      },
    ],
    receivedRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FriendRequest',
      },
    ],
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    lastInGameNameChange: {
      type: Date,
      default: null,
    },
    guestTempPassword: {
      type: String,
    },
    firstLogin: {
      type: Boolean,
      default: true,
    },
    loginStreak: {
      type: Number,
      default: 0,
    },
    soundSettings: {
      type: Object,
      default: {
        NoteMessage: true,
        Milestone: true,
        Click: true,
        Quiz: true,
      },
    },
    userLanguage: {
      type: String,
      default: 'en',
      enum: ['en', 'hi'],
    },
    expiresAt: { type: Date },
  },
  { collection: 'Users' },
)

userSchema.pre('save', async function (next) {
  if (this.isNew && this.isModified('rank')) {
    // Calculate the default rank as the number of existing users
    const existingUsersCount = await this.constructor.countDocuments()
    this.rank = existingUsersCount + 1
  }

  if (this.isModified('password')) {
    const pass = this.password
    this.password = await bcrypt.hash(pass, 12)
    this.cpassword = await bcrypt.hash(pass, 12)
  }
  next()
})

userSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign(
      { _id: this._id, role: this.role },
      process.env.SECRET_KEY,
    )
    return token
  } catch (error) {
    console.log(error)
  }
}
userSchema.methods.incrementOtpCnt = function () {
  this.otpCnt++
}
userSchema.methods.resetOtpCnt = function () {
  this.otpCnt = 0
  this.otpCntResetTime = null
}

userSchema.methods.setOtpCntResetTime = function () {
  const resetTime = new Date()
  resetTime.setMinutes(resetTime.getMinutes() + 60) // Adjust the time as needed
  this.otpCntResetTime = resetTime
}

const User = mongoose.model('USER', userSchema)

module.exports = User
