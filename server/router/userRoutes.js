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
router.route("/leaderboard").get(leaderBoard);
router.route("/profile/:inGameName").get(profile);
router
  .route("/isTutorialTakenCheck/:Page")
  .get(Authenticate, tutorialTakenCheck);
router.route("/isTutorialTakenUpdate").post(Authenticate, tutorialTakenUpdate);
router.route("/editProfile").post(Authenticate, editProfile);
router.route("/expectedIQScore").get(Authenticate, expectedIQScore);
router.route("/calcUsersIQScore").get(calculateUserIQScores);
router.route("/solvedQuizzesHistory").get(Authenticate, solvedQuizHistory);
module.exports = router;
