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
  getUserIQScoreHistory,
  currentTopPercentOfUser,
  solvedQuizzesCount,
  dailActivity,
  calculateUserRank,
  // calculateUserIQScores,
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
router.route("/getUserIQScoreHistory").get(Authenticate, getUserIQScoreHistory);
router
  .route("/currentTopPercentOfUser")
  .get(Authenticate, currentTopPercentOfUser);
router.route("/solvedQuizzesCount").get(Authenticate, solvedQuizzesCount);
router.route("/dailyActivity").get(Authenticate, dailActivity);
router.route("/calculateUserRank").get(Authenticate, calculateUserRank);
//router.route("/calculateUserIQScores").get(calculateUserIQScores);
module.exports = router;
