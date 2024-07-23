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
const chatsRoutes = require("./router/chatsRoutes");
const messageRoutes = require("./router/messageRoutes");
const friendsRoutes = require("./router/friendsRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const authRouter = express.Router();
const webpush = require("web-push");
const cookieParser = require("cookie-parser");
const Message = require("./model/messageSchema");
const { userOpenChats } = require("./sharedState");
const Chat = require("./model/chatSchema");
const User = require("./model/userSchema");
const path = require("path");
const http = require("http");

dotenv.config({ path: "./config.env" });
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://www.rapidrecap.co.in", // change at the time of production
    credentials: true,
  },
});

// Body parser middleware
app.use(bodyParser.json());
const connectDB = require("./db/conn");

webpush.setVapidDetails(
  "mailto:rapidrecap2k23@gmail.com",
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

app.use(express.json());
// Error Handling middlewares
app.use(errorHandler);

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

// -----Production-----
app.use(express.static(path.join(__dirname, "./client/dist")));
app.get("*", function (_, res) {
  res.sendFile(
    path.join(__dirname, "./client/dist/index.html"),
    function (err) {
      res.status(500).send(err);
    }
  );
});
// ---------------------

// Scheduler
require("./scheduler/setupCronJobs");

io.on("connection", (socket) => {
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
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", async (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
      // Send notification for unread message
      socket.in(user._id).emit("unread notification", {
        messageId: newMessageRecieved._id,
        chatId: chat._id,
        senderId: newMessageRecieved.sender._id,
      });
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

  socket.on("open chat", ({ userId, chatId }) => {
    if (userId && chatId) {
      const userChats = userOpenChats.get(userId) || new Set();
      userChats.add(chatId);
      userOpenChats.set(userId, userChats);
    }
  });

  socket.on("close chat", ({ userId, chatId }) => {
    if (userId && chatId) {
      const userChats = userOpenChats.get(userId);
      if (userChats) {
        userChats.delete(chatId);
      }
    }
  });

  socket.on("user-disconnected", async (userId) => {
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

// Connect to the database before starting the server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Listening to port no. ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
};

startServer();

module.exports = { io, app, server };
