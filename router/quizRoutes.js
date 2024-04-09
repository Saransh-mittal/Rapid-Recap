const express = require("express");
const router = express.Router();
const {
  saveAttempt,
  getPercentile,
  givenQuiz,
  getQuizSummary,
} = require("../controllers/quiz");
const Authentication = require("../middleware/authenticate");

router.route("/attempt").post(Authentication, saveAttempt);

router.route("/given/:articleId/:userId").get(Authentication, givenQuiz);
router.route("/summary/:articleId").get(Authentication, getQuizSummary);
router.route("/:articleId/:userId").get(Authentication, getPercentile);

module.exports = router;
