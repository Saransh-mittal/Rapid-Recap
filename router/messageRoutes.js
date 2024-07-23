const express = require("express");
const {
  allMessages,
  sendMessage,
  deleteMessage,
  updateMessageReadBy,
  permanentDeleteMessageFor,
  addReaction,
  removeReaction,
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
router.route("/reaction/:messageId").post(Authenticate, addReaction);
router.route("/reaction/:messageId").delete(Authenticate, removeReaction);

module.exports = router;
