const express = require("express");
const { Authenticate, adminMiddleware } = require("../middleware/authenticate");
const {
  getQuizAttemptsByUsers,
  getUsersWithLastLoginAfter,
  getTimeSpentByUsers,
} = require("../controllers/stats");
const router = express.Router();

router.get(
  "/quiz-attempts",
  Authenticate,
  adminMiddleware,
  getQuizAttemptsByUsers
);
router.get(
  "/last-login",
  Authenticate,
  adminMiddleware,
  getUsersWithLastLoginAfter
);
router.get("/time-spent", Authenticate, adminMiddleware, getTimeSpentByUsers);

module.exports = router;
