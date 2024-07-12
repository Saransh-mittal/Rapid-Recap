const asyncHandler = require("express-async-handler");
const Message = require("../model/messageSchema");
const User = require("../model/userSchema");
const Chat = require("../model/chatSchema");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    const filteredMessages = messages.filter(
      (message) => !message.permanentDeleteFor.includes(userId)
    );

    res.json(filteredMessages);
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
  // console.log(chatId);
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
      // check the next latest message of chat and update it.
      const nextLatestMessage = await Message.findOne({
        chat: message.chat,
        isDeleted: false,
        deletedFor: { $nin: [req.user._id] },
      }).sort({ createdAt: -1 });

      await Chat.findByIdAndUpdate(message.chat, {
        latestMessage: nextLatestMessage,
      });
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

//@description     Permanent Delete Message For
//@route           DELETE /api/Message/:messageId
//@access          Protected
const permanentDeleteMessageFor = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404);
      throw new Error("Message not found");
    }
    if (
      message.deletedFor.find((id) => id.toString() === userId.toString()) ||
      message.isDeleted
    ) {
      //remove the user from deletedFor array
      message.deletedFor = message.deletedFor.filter(
        (id) => id.toString() !== userId.toString()
      );
      message.permanentDeleteFor.push(userId);
      await message.save();
      // check if for all the users in chat the particular message is permanently deleted
      const chat = await Chat.findById(message.chat);
      const users = chat.users.map((id) => id.toString());
      const permanentDeleteFor = message.permanentDeleteFor.map((id) =>
        id.toString()
      );
      const allUsersDeleted =
        permanentDeleteFor.every((id) => users.includes(id.toString())) &&
        users.every((id) => permanentDeleteFor.includes(id.toString()));

      if (allUsersDeleted) {
        await Message.findByIdAndDelete(messageId);
      }

      // update the latestMessage of chat
      const nextLatestMessage = await Message.findOne({
        chat: message.chat,
        isDeleted: false,
        permanentDeleteFor: { $nin: [userId] },
      }).sort({ createdAt: -1 });

      await Chat.findByIdAndUpdate(message.chat, {
        latestMessage: nextLatestMessage,
      });

      res.json({ message: "Message permanently deleted successfully" });
    } else {
      res.status(400);
      throw new Error("Message not deleted for user");
    }
    return;
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
  permanentDeleteMessageFor,
};
