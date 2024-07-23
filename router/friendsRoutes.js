const express = require("express");
const { Authenticate } = require("../middleware/authenticate");
const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getRequests,
  getFriends,
  checkRequestStatus,
  canSendRequest,
  severTies,
  getUnreadRequestsCount,
  markRequestsAsRead,
} = require("../controllers/friendsController");
const router = express.Router();

// Define a POST route for submitting feedback
router.post("/send-request", Authenticate, sendRequest);
router.post("/accept-request", Authenticate, acceptRequest);
router.post("/reject-request", Authenticate, rejectRequest);
router.get("/get-requests", Authenticate, getRequests);
router.get("/", Authenticate, getFriends);
router.post("/check-request-status", Authenticate, checkRequestStatus);
router.post("/can-send-request", Authenticate, canSendRequest);
router.post("/sever-ties", Authenticate, severTies);
router.get("/unread-requests-count", Authenticate, getUnreadRequestsCount);
router.post("/request-mark-as-read", Authenticate, markRequestsAsRead);

module.exports = router;
