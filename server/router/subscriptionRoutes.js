const express = require("express");
const router = express.Router();
const { subscribe, sendNotify } = require("../controllers/subscription");
const { Authenticate } = require("../middleware/authenticate");

// POST /subscribe
router.route("/subscribe").post(Authenticate, subscribe);
router.route("/send-notification").get(sendNotify);

module.exports = router;
