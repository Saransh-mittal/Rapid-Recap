const express = require('express')
const router = express.Router()
const {
  registerUser,
  loginUser,
  logoutUser,
  loginCheck,
  verifyUser,
  resendOTP,
  forgotPassword,
  handleGoogleLogin,
  leaderBoard,
  profile,
  editProfile,
  expectedIQScore,
  calculateUserIQScores,
  solvedQuizHistory,
  userSearch,
  profilePrivacy,
  getUpdates,
  readUpdates,
  trashUpdate,
  trashAllUpdate,
  upgradeMessageClose,
  sendMailForNotifySubscribe,
  quizDailyStreakUpdator,
  streakChecker,
  longestStreakCalculatorOfAllUsers,
  seasonHistory,
  updateNewSeasonModal,
  bookmark,
  getBookmarks,
  removeBookmark,
  NavLineGraph,
  getUserIds,
  soundController,
  updateUserLanguage,
  updateDisplayedBadge,
  getUserTournamentData,
  deleteAccount,
  confirmDeleteAccount,
  updateOnboardingProgress,
  getOnboardingProgress,
  claimQuinBoost,
  claimStreakSurge,
  claimTournamentBadge,
  getValidCategories,
  updateBadgeCategory,
  checkRewardsModalStatus,
  getUserAchievements,
  verifyEarlyAdopterCode,
  applyEarlyAdopterCode,
} = require('../controllers/user')
const { Authenticate } = require('../middleware/authenticate')
const {
  exportGuestData,
  enhancedGuestLogin,
} = require('../controllers/guestController')
const {
  getUserMonthlyPerformance,
  getUserHistoricalPerformance,
} = require('../controllers/monthlyLeaderboardController')
const { getMaintenanceStatus } = require('../controllers/maintenanceController')
const {
  getDemotionSummary,
} = require('../controllers/demotionSummaryController')
const maintenanceMiddleware = require('../middleware/maintenanceMiddleware')
const {
  getReferralCode,
  applyReferralCodeHandler,
  getReferralStats,
  checkReferralCode,
} = require('../controllers/referralController')
const { refreshToken } = require('../controllers/refreshTokenController')
const User = require('../model/userSchema')
const mongoose = require('mongoose')

router.route('/auth/refresh').post(refreshToken)
router.route('/csrf-token').get((req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})
router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(Authenticate, logoutUser)
router.route('/verifyEmail').post(verifyUser)
router.route('/loginCheck').get(maintenanceMiddleware, Authenticate, loginCheck)
router.route('/resendOTP').post(resendOTP)
router.route('/forgotPassword').post(forgotPassword)
router.route('/handleGoogleLogin').post(handleGoogleLogin)
router.route('/leaderboard').get(leaderBoard)
router.route('/profile/:inGameName').get(profile)
router.route('/editProfile').post(Authenticate, editProfile)
router.route('/expectedIQScore').get(Authenticate, expectedIQScore)
router.route('/calcUsersIQScore').get(calculateUserIQScores)
router.route('/solvedQuizzesHistory').get(Authenticate, solvedQuizHistory)
router.route('/search').get(Authenticate, userSearch)
router.route('/profilePrivacy').post(Authenticate, profilePrivacy)
router.route('/getUpdates').get(Authenticate, getUpdates)
router.route('/readUpdates').put(Authenticate, readUpdates)
router.route('/trashUpdates/:updateId').put(Authenticate, trashUpdate)
router.route('/trashAllUpdates').put(Authenticate, trashAllUpdate)
router.route('/upgradeMessageClose').put(Authenticate, upgradeMessageClose)
router.route('/sendMailForNotifySubscribe').get(sendMailForNotifySubscribe)
router.route('/quizDailyStreak').get(quizDailyStreakUpdator)
router.route('/streakChecker').get(Authenticate, streakChecker)
router.route('/longestStreakCalculator').get(longestStreakCalculatorOfAllUsers)
router.route('/newSeasonModal').get(Authenticate, updateNewSeasonModal)
router.route('/seasonHistory/:inGameName').get(seasonHistory)
router.route('/bookmark').get(Authenticate, bookmark)
router.route('/getBookmarks').get(Authenticate, getBookmarks)
router.route('/removeBookmark').get(Authenticate, removeBookmark)
router.route('/lineGraph').get(Authenticate, NavLineGraph)
router.route('/getUserIds').get(getUserIds)
router.route('/soundController').post(Authenticate, soundController)
router.route('/language').post(Authenticate, updateUserLanguage)
router.route('/update-displayed-badge').post(Authenticate, updateDisplayedBadge)
router
  .route('/getUserTournamentData/:userId')
  .get(Authenticate, getUserTournamentData)
// router.route("/mailForQuinBoost").get(mailForQuinBoost);
router.post('/deleteAccount', Authenticate, deleteAccount)
router.post('/claim-quinboost', Authenticate, claimQuinBoost)
router.post('/claim-streak-surge', Authenticate, claimStreakSurge)
router.route('/claim-badge').post(Authenticate, claimTournamentBadge)
router.get('/valid-categories', Authenticate, getValidCategories)
router.put('/update-category', Authenticate, updateBadgeCategory)
router.get('/modal-status', Authenticate, checkRewardsModalStatus)
router.get('/stats/monthly', Authenticate, getUserMonthlyPerformance)
router.get('/stats/historical', Authenticate, getUserHistoricalPerformance)
router.get('/maintenance-status', getMaintenanceStatus)
router.route('/demotion-summary').get(Authenticate, getDemotionSummary)
router.get('/achievements', Authenticate, getUserAchievements)
router.route('/referral-code').get(Authenticate, getReferralCode)
router.route('/apply-referral').post(Authenticate, applyReferralCodeHandler)
router.route('/referral-stats').get(Authenticate, getReferralStats)
router.route('/check-referral').get(Authenticate, checkReferralCode)

router.get('/confirmDeleteAccount/:token', confirmDeleteAccount)
router
  .route('/onboarding-progress')
  .post(Authenticate, updateOnboardingProgress)
router.route('/onboarding-progress').get(Authenticate, getOnboardingProgress)

router.route('/verify-early-adopter').get(Authenticate, verifyEarlyAdopterCode)
router.route('/apply-early-adopter').post(Authenticate, applyEarlyAdopterCode)

// Guest routes
router.route('/guestLogin').post(enhancedGuestLogin)
router.route('/exportGuestData').post(Authenticate, exportGuestData)

// Add this route to your userRoutes.js file
router.route('/test-db-performance').get(async (req, res) => {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
  }

  try {
    // Test 1: Basic mongoose connection check
    console.time('connection-check')
    const connectionState = mongoose.connection.readyState
    console.timeEnd('connection-check')
    results.tests.connectionState = {
      state: connectionState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
      time: 'logged to console',
    }

    // Test 2: Simple count query
    console.time('simple-count')
    const userCount = await User.countDocuments()
    console.timeEnd('simple-count')
    results.tests.simpleCount = {
      count: userCount,
      time: 'logged to console',
    }

    // Test 3: Find by ID (same as loginCheck but with any user)
    console.time('findById-test')
    const testUser = await User.findOne({}).select('_id inGameName').lean()
    console.timeEnd('findById-test')

    if (testUser) {
      console.time('findById-actual')
      const foundUser = await User.findById(testUser._id)
        .select('-password -cpassword -googleId')
        .lean()
        .exec()
      console.timeEnd('findById-actual')

      results.tests.findById = {
        found: !!foundUser,
        userId: testUser._id,
        time: 'logged to console',
      }
    }

    // Test 4: Test the exact loginCheck query with your user ID
    if (req.query.userId) {
      console.time('loginCheck-exact')
      const loginUser = await User.findById(req.query.userId)
        .select('-password -cpassword -googleId')
        .lean()
        .exec()
      console.timeEnd('loginCheck-exact')

      results.tests.loginCheckExact = {
        found: !!loginUser,
        time: 'logged to console',
      }
    }

    // Test 5: Multiple small queries (test connection reuse)
    console.time('multiple-queries')
    await Promise.all([
      User.findOne({}).select('_id').lean(),
      User.findOne({}).select('_id').lean(),
      User.findOne({}).select('_id').lean(),
    ])
    console.timeEnd('multiple-queries')
    results.tests.multipleQueries = {
      time: 'logged to console',
    }

    res.json({
      status: 'success',
      message: 'Check server console for detailed timings',
      results,
      instructions: {
        normal: 'curl "https://your-domain.com/api/user/test-db-performance"',
        withUserId:
          'curl "https://your-domain.com/api/user/test-db-performance?userId=YOUR_USER_ID"',
      },
    })
  } catch (error) {
    console.error('Test failed:', error)
    res.status(500).json({
      status: 'error',
      error: error.message,
      results,
    })
  }
})

module.exports = router
