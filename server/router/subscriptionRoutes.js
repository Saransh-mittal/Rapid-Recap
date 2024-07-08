const express = require("express");
const router = express.Router();
const {
  subscribe,
  sendNotify,
  checkSubscription,
  deleteSubscription,
} = require("../controllers/subscription");
const { Authenticate } = require("../middleware/authenticate");

// POST /subscribe
router.post("/check", Authenticate, checkSubscription);
router.route("/subscribe").post(Authenticate, subscribe);
router.route("/send-notification").get(sendNotify);
router.post("/api/subs/unsubscribe", deleteSubscription);

module.exports = router;
