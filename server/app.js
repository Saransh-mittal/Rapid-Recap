const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const express = require("express");
const userRoutes = require("./router/userRoutes");
const articleRoutes = require("./router/articleRoutes");
const quizRoutes = require("./router/quizRoutes");
const subscriptionRoutes = require("./router/subscriptionRoutes");
const mailRoutes = require("./router/mailRoutes");
const timeSpentRoutes = require("./router/timeSpentRoutes");
const notificationRoutes = require("./router/notificationRoutes");
const authRouter = express.Router();
const webpush = require("web-push");
const cookieParser = require("cookie-parser");

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
// ---------------------------

// -----Bot utils-----
//require("./utils/bot.utils/generateFakeUsers");
//require("./utils/bot.utils/generateFakeQuizAttempts");
//require("./utils/bot.utils/generatePicForUsers");
//require("./utils/bot.utils/updateBots");
// -------------------
app.use(express.json());
// require("./scheduler/userIQScoreScheduler");
// require("./scheduler/mailsForStreakBroken");
// require("./scheduler/mailsForStreakReminder");
// require("./scheduler/extractNews");
const PORT = process.env.PORT;
authRouter.use(cookieParser());
authRouter.use("/user", userRoutes);
authRouter.use("/articles", articleRoutes);
authRouter.use("/quiz", quizRoutes);
authRouter.use("/subs", subscriptionRoutes);
authRouter.use("/mail", mailRoutes);
authRouter.use("/timeSpent", timeSpentRoutes);
authRouter.use("/notify", notificationRoutes);
app.use("/api", authRouter);

app.listen(PORT, () => {
  console.log(`Listening to port no. ${PORT}`);
});
