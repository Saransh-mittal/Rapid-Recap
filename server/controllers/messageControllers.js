const asyncHandler = require("express-async-handler");
const Message = require("../model/messageSchema");
const User = require("../model/userSchema");
const Chat = require("../model/chatSchema");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Update Message ReadBy
//@route           PUT /api/Message/readby/:messageId
//@access          Protected
const updateMessageReadBy = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404);
      throw new Error("Message not found");
    }

    // Check if the user has already read the message
    if (!message.readBy.includes(req.user._id)) {
      message.readBy.push(req.user._id);
      await message.save();
    }

    res.json({ message: "Message read status updated successfully" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Delete Message
//@route           DELETE /api/Message/:messageId
//@access          Protected
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { deleteType } = req.body;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404);
      throw new Error("Message not found");
    }

    if (
      message.sender.toString() !== req.user._id.toString() &&
      deleteType === "everyone"
    ) {
      res.status(403);
      throw new Error("You can only delete your own messages for everyone");
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (deleteType === "everyone" && message.createdAt < oneHourAgo) {
      res.status(400);
      throw new Error(
        "You can only delete messages for everyone within 1 hour of sending"
      );
    }

    if (deleteType === "everyone") {
      message.isDeleted = true;
      message.content = "This message was deleted";
      await message.save();
    } else if (deleteType === "me") {
      message.deletedFor.push(req.user._id);
      await message.save();
    } else {
      res.status(400);
      throw new Error("Invalid delete type");
    }

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  allMessages,
  sendMessage,
  deleteMessage,
  updateMessageReadBy,
};
