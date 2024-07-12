const express = require("express");
const {
  allMessages,
  sendMessage,
  deleteMessage,
  updateMessageReadBy,
  permanentDeleteMessageFor,
} = require("../controllers/messageControllers");
const { Authenticate } = require("../middleware/authenticate");

const router = express.Router();

router.route("/:chatId").get(Authenticate, allMessages);
router.route("/").post(Authenticate, sendMessage);
router.route("/:messageId").delete(Authenticate, deleteMessage);
router.route("/readby/:messageId").put(Authenticate, updateMessageReadBy);
router
  .route("/permanentdelete/:messageId")
  .delete(Authenticate, permanentDeleteMessageFor);

module.exports = router;
