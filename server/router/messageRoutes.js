const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../controllers/messageControllers");
const { Authenticate } = require("../middleware/authenticate");

const router = express.Router();

router.route("/:chatId").get(Authenticate, allMessages);
router.route("/").post(Authenticate, sendMessage);

module.exports = router;
