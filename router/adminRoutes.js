const express = require("express");
const { Authenticate, adminMiddleware } = require("../middleware/authenticate");
const {
  getQuizAttemptsByUsers,
  getUsersWithLastLoginAfter,
  getTimeSpentByUsers,
  getNotificationStatus,
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
router.get(
  "/notification-status",
  Authenticate,
  adminMiddleware,
  getNotificationStatus
);

module.exports = router;
