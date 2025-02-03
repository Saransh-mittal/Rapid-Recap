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
  quinBoostChecker,
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
router.route('/quinBoostChecker').get(Authenticate, quinBoostChecker)
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

router.get('/confirmDeleteAccount/:token', confirmDeleteAccount)
router
  .route('/onboarding-progress')
  .post(Authenticate, updateOnboardingProgress)
router.route('/onboarding-progress').get(Authenticate, getOnboardingProgress)

// Guest routes
router.route('/guestLogin').post(enhancedGuestLogin)
router.route('/exportGuestData').post(Authenticate, exportGuestData)

module.exports = router
