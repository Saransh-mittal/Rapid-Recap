const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
  shareMessage,
  handleChatRequest,
  setSeenRequest,
} = require("../controllers/chatControllers");
const { Authenticate } = require("../middleware/authenticate");

const router = express.Router();

router.route("/").post(Authenticate, accessChat);
router.route("/").get(Authenticate, fetchChats);
router.route("/group").post(Authenticate, createGroupChat);
router.route("/rename").put(Authenticate, renameGroup);
router.route("/groupremove").put(Authenticate, removeFromGroup);
router.route("/groupadd").put(Authenticate, addToGroup);
router.route("/share").post(Authenticate, shareMessage);
router.route("/request/handle").put(Authenticate, handleChatRequest);
router.route("/request/seen").put(Authenticate, setSeenRequest);

module.exports = router;
