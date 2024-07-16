const asyncHandler = require("express-async-handler");
const Message = require("../model/messageSchema");
const User = require("../model/userSchema");
const Chat = require("../model/chatSchema");
const { sendNotification } = require("../services/notificationService");
const { userOpenChats } = require("../sharedState");
const Article = require("../model/articleSchema");
const { formatDate } = require("../utils/miscellaneous.utils");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat")
      .populate("reactions.user", "name pic");
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
  const { content, chatId, type, articleId } = req.body;
  // console.log(chatId);
  if (
    !chatId ||
    ((!type || type === "" || type === "text") && !content) ||
    (type === "article_card" && !articleId)
  ) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  let article;
  if (type === "article_card") {
    article = await Article.findById(articleId).select(
      "_id title category dateTime imgURL"
    );
    if (!article) {
      res.status(404);
      throw new Error("Article not found");
    }
  }
  var newMessage =
    !type || type === "" || type === "text"
      ? {
          sender: req.user._id,
          content: content,
          chat: chatId,
          sent: true,
        }
      : {
          sender: req.user._id,
          type: type,
          chat: chatId,
          sent: true,
          article: {
            _id: article._id,
            title: article.title,
            category: article.category,
            date: formatDate(article.dateTime),
            image: article.imgURL[0],
          },
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
    const chatUsers = message.chat.users;
    for (let user of chatUsers) {
      if (user._id.toString() !== req.user._id.toString()) {
        const userChats = userOpenChats.get(user._id.toString());
        // Only send notification if the user doesn't have this chat open
        if (!userChats || !userChats.has(chatId)) {
          await sendNotification({
            title: `New message from ${message.sender.name}`,
            body: message.content,
            icon: message.sender.pic,
            url: `/chats?chatId=${chatId}`,
            userId: user._id,
            messageId: message._id.toString(),
          });
        }
      }
    }

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

      // Send a special notification to all recipients
      const chat = await Chat.findById(message.chat).populate("users");
      for (let user of chat.users) {
        if (user._id.toString() !== req.user._id.toString()) {
          await sendNotification({
            title: "Message Deleted",
            body: "A message was deleted from this chat",
            icon: req.user.pic,
            url: `/chats?chatId=${message.chat}`,
            userId: user._id,
            messageId: message._id.toString(), // Include the messageId
          });
        }
      }
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
const addReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user._id;
  // Retrieve the message
  const message = await Message.findById(messageId).populate(
    "reactions.user",
    "name pic"
  );

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  // Check if the user has already reacted
  const existingReactionIndex = message.reactions.findIndex(
    (reaction) => reaction.user._id.toString() === userId.toString()
  );
  // console.log(message.reactions);
  // console.log(existingReactionIndex);
  if (existingReactionIndex > -1) {
    // Update the existing reaction
    message.reactions[existingReactionIndex].emoji = emoji;
  } else {
    // Add a new reaction
    message.reactions.push({ user: userId, emoji });
  }

  // Save the updated message
  let updatedMessage = await message.save();

  // Populate the reactions.user field
  updatedMessage = await updatedMessage.populate("reactions.user", "name pic");
  updatedMessage = await updatedMessage.populate("sender", "name pic");
  updatedMessage = await updatedMessage.populate("chat");
  updatedMessage = await User.populate(updatedMessage, {
    path: "chat.users",
    select: "name pic email",
  });

  // Return the updated message
  res.json(updatedMessage);
});

const removeReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  let updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    {
      $pull: { reactions: { user: userId } },
    },
    { new: true }
  ).populate("reactions.user", "name pic");
  updatedMessage = await updatedMessage.populate("sender", "name pic");
  updatedMessage = await updatedMessage.populate("chat");
  updatedMessage = await User.populate(updatedMessage, {
    path: "chat.users",
    select: "name pic email",
  });

  if (!updatedMessage) {
    res.status(404);
    throw new Error("Message not found");
  }

  res.json(updatedMessage);
});
module.exports = {
  allMessages,
  sendMessage,
  deleteMessage,
  updateMessageReadBy,
  permanentDeleteMessageFor,
  addReaction,
  removeReaction,
};
