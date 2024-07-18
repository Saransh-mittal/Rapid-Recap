const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const express = require("express");
const userRoutes = require("./router/userRoutes");
const articleRoutes = require("./router/articleRoutes");
const quizRoutes = require("./router/quizRoutes");
const subscriptionRoutes = require("./router/subscriptionRoutes");
const mailRoutes = require("./router/mailRoutes");
const timeSpentRoutes = require("./router/timeSpentRoutes");
const feedbackRoutes = require("./router/feedbackRoutes");
const notificationRoutes = require("./router/notificationRoutes");
const adminRoutes = require("./router/adminRoutes");
const recommendationRoutes = require("./router/recommendationRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const chatsRoutes = require("./router/chatsRoutes");
const messageRoutes = require("./router/messageRoutes");
const friendsRoutes = require("./router/friendsRoutes");
const authRouter = express.Router();
const webpush = require("web-push");
const cookieParser = require("cookie-parser");
const Message = require("./model/messageSchema");
const { userOpenChats } = require("./sharedState");
const Chat = require("./model/chatSchema");
const User = require("./model/userSchema");

dotenv.config({ path: "./config.env" });
const app = express();
// Body parser middleware
app.use(bodyParser.json());
require("./db/conn");
webpush.setVapidDetails(
  "mailto:rapidrecap2k23@gmail.com",
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);
// -----Testings-----
//require("./test/conn.test");
//require("./test/index");
// ------------------

// ------Deleteion utils------
//require("./utils/deletion.utils/removeUser.del");
//require("./utils/deletion.utils/removeDailIQField.del");
//require("./utils/deletion.utils/quizGivenByUserDeletion");
//require("./utils/deletion.utils/removeBotUsers.del");
//require("./utils/deletion.utils/removeQuizAttemptForNullUser.del");
//require("./utils/deletion.utils/removeArticle.del");
// require("./utils/deletion.utils/useLessArticle.del");
// ---------------------------

// -----Update Collection-----
//require("./utils/update.utils/maxIQScore.update.js");
//require("./utils/update.utils/quizActiveStatus.update");
//require("./utils/update.utils/quizCountUpdate.update");
//require("./utils/update.utils/name.update");
//require("./utils/update.utils/rank.update")();
//require("./utils/update.utils/cleanUpBadQuizAttempts.update");
//require("./utils/update.utils/updateUserAppUpdate");
//require("./utils/update.utils/updateAppUpdates.update");
//require("./utils/update.utils/quizLang.update");
//require("./utils/update.utils/generateHindiTrans.update");
//require("./utils/update.utils/genHindiQuizForArticles");
//require("./utils/update.utils/articleCategory.update");
//require("./utils/update.utils/subscription.update");
//require("./utils/update.utils/avg_RQM.update");
//require("./utils/update.utils/userExperienceLevel.update");
// require("./utils/update.utils/season.update");
// require("./utils/update.utils/article.update");
// require("./utils/update.utils/quizAttemptIndex.update");
// require("./utils/update.utils/timeSpentIndexes");
// ---------------------------

// -----Bot utils-----
//require("./utils/bot.utils/generateFakeUsers");
//require("./utils/bot.utils/generateFakeQuizAttempts");
//require("./utils/bot.utils/generatePicForUsers");
//require("./utils/bot.utils/updateBots");

// ------Scripts------
// require("./scripts/usersUsingApp");
// require("./scripts/usersGivingQuizStats");
// require("./scripts/usersLastLoggedInStats");
// require("./scripts/updateUserCurrentSeason");
// require("./scripts/quizAttemptAndDailyIQUpdateSeason");
// require("./scripts/collectionToCSV");
// require("./scripts/script_prepare_article_data")();
// require("./scripts/usersEnabledNotifs");
// -------------------

// const { exportDataToCSV } = require("./services/recommendationService");
// exportDataToCSV();
app.use(express.json());
// Error Handling middlewares
// app.use(notFound);
app.use(errorHandler);
// require("./scheduler/setupCronJobs");
const PORT = process.env.PORT;
authRouter.use(cookieParser());
authRouter.use("/user", userRoutes);
authRouter.use("/articles", articleRoutes);
authRouter.use("/quiz", quizRoutes);
authRouter.use("/subs", subscriptionRoutes);
authRouter.use("/mail", mailRoutes);
authRouter.use("/timeSpent", timeSpentRoutes);
authRouter.use("/contact/feedback", feedbackRoutes);
authRouter.use("/notify", notificationRoutes);
authRouter.use("/admin", adminRoutes);
authRouter.use("/recommendation", recommendationRoutes);
authRouter.use("/chat", chatsRoutes);
authRouter.use("/message", messageRoutes);
authRouter.use("/friends", friendsRoutes);
app.use("/api", authRouter);

const server = app.listen(PORT, () => {
  console.log(`Listening to port no. ${PORT}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173", // change at the time of production
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  // console.log("Connected to socket.io");
  socket.on("setup", async (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
    userOpenChats.set(userData._id, new Set());
    // update user online status in db
    await User.findByIdAndUpdate(userData._id, { isOnline: true });
    socket.broadcast.emit("user online", userData._id);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    // console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", async (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    // console.log("New message recieved", newMessageRecieved);
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        newMessageRecieved._id,
        { status: "sent" },
        { new: true }
      );
      socket.emit("message status updated", {
        messageId: updatedMessage._id,
        status: "sent",
      });
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  });
  // New event listener for message delivered
  socket.on("message delivered", async ({ messageId, userId }) => {
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { status: "delivered" },
        { new: true }
      );
      const userChats = userOpenChats.get(userId);
      if (userChats && userChats.has(updatedMessage.chat.toString())) {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { status: "read", $addToSet: { readBy: userId } },
          { new: true }
        );

        io.to(updatedMessage.sender.toString()).emit("message status updated", {
          messageId,
          status: "read",
        });
        return;
      }
      io.to(updatedMessage.sender.toString()).emit("message status updated", {
        messageId,
        status: "delivered",
      });
    } catch (error) {
      console.error("Error updating message delivery status:", error);
    }
  });

  socket.on("message read", async ({ messageId, userId }) => {
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { status: "read", $addToSet: { readBy: userId } },
        { new: true }
      );

      io.to(updatedMessage.sender.toString()).emit("message status updated", {
        messageId,
        status: "read",
      });
    } catch (error) {
      console.error("Error updating message read status:", error);
    }
  });

  socket.on("delete message", async (deletedMessageInfo) => {
    const { chatId, messageId, deleteType, senderId } = deletedMessageInfo;
    // Emit the delete event to all users in the chat except the sender
    socket
      .to(chatId)
      .emit("message deleted", { messageId, deleteType, chatId });

    const chat = await Chat.findById(chatId);
    if (chat) {
      const allUsersId = chat.users.map((user) => user._id.toString());
      for (let userId of allUsersId) {
        if (userId !== senderId) {
          io.to(userId).emit("message deleted", {
            messageId,
            deleteType,
            chatId,
          });
        }
      }
    }
  });

  // New event to handle when a user opens a chat
  socket.on("open chat", ({ userId, chatId }) => {
    if (userId && chatId) {
      const userChats = userOpenChats.get(userId) || new Set();
      userChats.add(chatId);
      userOpenChats.set(userId, userChats);
    }
  });

  // New event to handle when a user closes a chat
  socket.on("close chat", ({ userId, chatId }) => {
    if (userId && chatId) {
      // console.log("Closing chat", chatId);
      const userChats = userOpenChats.get(userId);
      if (userChats) {
        // console.log("Closing chat", chatId);
        userChats.delete(chatId);
      }
    }
  });
  socket.on("user-disconnected", async (userId) => {
    // console.log("User disconnected", userId);
    userOpenChats.delete(userId);
    socket.leave(userId);
    socket.broadcast.emit("user offline", userId);
    await User.findByIdAndUpdate(userId, { isOnline: false });
  });
  socket.off("setup", (userData) => {
    userOpenChats.delete(userData._id);
    socket.leave(userData._id);
    socket.broadcast.emit("user offline", userData._id);
  });
});

module.exports = { io, app, server };
