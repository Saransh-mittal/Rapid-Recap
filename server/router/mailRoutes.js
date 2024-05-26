const express = require("express");
const { streakBroken } = require("../controllers/mail");
const router = express.Router();

router.route("/streakBroken").get(streakBroken);

module.exports = router;
