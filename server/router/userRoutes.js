const express = require("express");
const router = express.Router();
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
  tutorialTakenCheck,
  tutorialTakenUpdate,
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
} = require("../controllers/user");
const Authenticate = require("../middleware/authenticate");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(Authenticate, logoutUser);
router.route("/verifyEmail").post(verifyUser);
router.route("/loginCheck").get(Authenticate, loginCheck);
router.route("/resendOTP").post(resendOTP);
router.route("/forgotPassword").post(forgotPassword);
router.route("/handleGoogleLogin").post(handleGoogleLogin);
router.route("/leaderboard").get(Authenticate, leaderBoard);
router.route("/profile/:inGameName").get(profile);
router
  .route("/isTutorialTakenCheck/:Page")
  .get(Authenticate, tutorialTakenCheck);
router.route("/isTutorialTakenUpdate").post(Authenticate, tutorialTakenUpdate);
router.route("/editProfile").post(Authenticate, editProfile);
router.route("/expectedIQScore").get(Authenticate, expectedIQScore);
router.route("/calcUsersIQScore").get(calculateUserIQScores);
router.route("/solvedQuizzesHistory").get(Authenticate, solvedQuizHistory);
router.route("/search").get(Authenticate, userSearch);
router.route("/profilePrivacy").post(Authenticate, profilePrivacy);
router.route("/getUpdates").get(Authenticate, getUpdates);
router.route("/readUpdates").put(Authenticate, readUpdates);
router.route("/trashUpdates/:updateId").put(Authenticate, trashUpdate);
router.route("/trashAllUpdates").put(Authenticate, trashAllUpdate);
router.route("/upgradeMessageClose").put(Authenticate, upgradeMessageClose);
router.route("/sendMailForNotifySubscribe").get(sendMailForNotifySubscribe);
router.route("/quizDailyStreak").get(quizDailyStreakUpdator);
router.route("/streakChecker").get(Authenticate, streakChecker);
router.route("/longestStreakCalculator").get(longestStreakCalculatorOfAllUsers);
module.exports = router;
