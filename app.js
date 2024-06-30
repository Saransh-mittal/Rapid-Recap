const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const express = require("express");
const userRoutes = require("./router/userRoutes");
const articleRoutes = require("./router/articleRoutes");
const quizRoutes = require("./router/quizRoutes");
const subscriptionRoutes = require("./router/subscriptionRoutes");
const timeSpentRoutes = require("./router/timeSpentRoutes");
const mailRoutes = require("./router/mailRoutes");
const feedbackRoutes = require("./router/feedbackRoutes");
const notificationRoutes = require("./router/notificationRoutes");
const adminRoutes = require("./router/adminRoutes");
const recommendationRoutes = require("./router/recommendationRoutes");
const authRouter = express.Router();
const webpush = require("web-push");
const cookieParser = require("cookie-parser");
const path = require("path");
dotenv.config({ path: "./config.env" });
const app = express();
// Body parser middleware
app.use(bodyParser.json());
webpush.setVapidDetails(
  "mailto:rapidrecap2k23@gmail.com",
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);
const connectDB = require("./db/conn");

// -----Testings-----
//require("./test/conn.test");
//require("./test/index");
// ------------------

// ------Deleteion utils------
//require("./utils/deletion.utils/removeUser.del");
//require("./utils/deletion.utils/removeDailIQField.del");
//require("./utils/deletion.utils/quizGivenByUserDeletion");
//require("./utils/deletion.utils/removeBotUsers.del");
// ---------------------------

// -----Update Collection-----
//require("./utils/update.utils/quizActiveStatus.update");
//require("./utils/update.utils/quizCountUpdate.update");
//require("./utils/update.utils/name.update");
//require("./utils/update.utils/genQuizForArticles");
// ---------------------------

// -----Bot utils-----
//require("./utils/bot.utils/generateFakeUsers");
//require("./utils/bot.utils/generateFakeQuizAttempts");
//require("./utils/bot.utils/generatePicForUsers");
// -------------------
app.use(express.json());
require("./scheduler/setupCronJobs");
const PORT = process.env.PORT;
authRouter.use(cookieParser());
authRouter.use("/user", userRoutes);
authRouter.use("/articles", articleRoutes);
authRouter.use("/quiz", quizRoutes);
authRouter.use("/subs", subscriptionRoutes);
authRouter.use("/mail", mailRoutes);
authRouter.use("/timeSpent", timeSpentRoutes);
authRouter.use("/feedback", feedbackRoutes);
authRouter.use("/notify", notificationRoutes);
authRouter.use("/admin", adminRoutes);
authRouter.use("/recommendation", recommendationRoutes);
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

// Connect to the database before starting the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Listening to port no. ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });
