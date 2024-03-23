const express = require("express");
const router = express.Router();
const {
  saveAttempt,
  getPercentile,
  givenQuiz,
} = require("../controllers/quiz");
const Authentication = require("../middleware/authenticate");

router.route("/attempt").post(Authentication, saveAttempt);
router.route("/:articleId/:userId").get(getPercentile);
router.route("/given/:articleId/:userId").get(givenQuiz);

module.exports = router;
