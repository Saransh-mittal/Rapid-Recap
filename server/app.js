const dotenv = require("dotenv");
const express = require("express");
const userRoutes = require("./router/userRoutes");
const articleRoutes = require("./router/articleRoutes");
const quizRoutes = require("./router/quizRoutes");
const authRouter = express.Router();
const cookieParser = require("cookie-parser");

dotenv.config({ path: "./config.env" });
const app = express();

require("./db/conn");

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
// ---------------------------

// -----Update Collection-----
//require("./utils/update.utils/maxIQScore.update.js");
//require("./utils/update.utils/quizActiveStatus.update");
//require("./utils/update.utils/quizCountUpdate.update");
//require("./utils/update.utils/name.update");
//require("./utils/update.utils/rank.update")();
//require("./utils/update.utils/cleanUpBadQuizAttempts.update");
// ---------------------------

// -----Bot utils-----
//require("./utils/bot.utils/generateFakeUsers");
//require("./utils/bot.utils/generateFakeQuizAttempts");
//require("./utils/bot.utils/generatePicForUsers");
//require("./utils/bot.utils/updateBots");
// -------------------
app.use(express.json());
require("./scheduler/userIQScoreScheduler");
const PORT = process.env.PORT;
authRouter.use(cookieParser());
authRouter.use("/user", userRoutes);
authRouter.use("/articles", articleRoutes);
authRouter.use("/quiz", quizRoutes);
app.use("/api", authRouter);

app.listen(PORT, () => {
  console.log(`Listening to port no. ${PORT}`);
});
