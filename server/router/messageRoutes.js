const express = require("express");
const {
  allMessages,
  sendMessage,
  deleteMessage,
  updateMessageReadBy,
  messageStatus,
} = require("../controllers/messageControllers");
const { Authenticate } = require("../middleware/authenticate");

const router = express.Router();

router.route("/:chatId").get(Authenticate, allMessages);
router.route("/").post(Authenticate, sendMessage);
router.route("/:messageId").delete(Authenticate, deleteMessage);
router.route("/readby/:messageId").put(Authenticate, updateMessageReadBy);
router.route("/status/:messageId").put(Authenticate, messageStatus);

module.exports = router;
