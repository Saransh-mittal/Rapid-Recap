const express = require("express");
const { notificationNews } = require("../controllers/notification");
const router = express.Router();

router.route("/news").get(notificationNews);

module.exports = router;
