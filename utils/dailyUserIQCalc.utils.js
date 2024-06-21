// utils/dailyUserIQCalc.js

const DailyIQ = require("../model/dailyIQSchema");
const QuizAttempt = require("../model/quizAttemptSchema");
const User = require("../model/userSchema");
const { updatePercentilesOnQuizDeactivation } = require("./quiz.utils");
const rankUpdate = require("./update.utils/rank.update");
const CircleAndSocietyData = require("../data/CircleAndSocietyData");
const { logActivity } = require("./activity.utils");
const { activityTypes } = require("../data/activityTypes");
const configService = require("../configService");
// const { progressBar } = require("./progress.utils");

const findSocietyCircleByIQ = (IQScore) => {
  return CircleAndSocietyData.find((data) => {
    return (
      IQScore >= data.IQ_Lower &&
      (data.IQ_Upper === null || IQScore < data.IQ_Upper)
    );
  });
};

const handleSocietyOrCircleUpgrade = async (
  userId,
  prevIQScore,
  currIQScore,
  previousIQForXp,
  awardableXpOrNot
) => {
  try {
    const prevSocietyCircle = findSocietyCircleByIQ(prevIQScore);
    const currSocietyCircle = findSocietyCircleByIQ(currIQScore);

    if (!prevSocietyCircle || !currSocietyCircle) return;

    if (
      (prevSocietyCircle.society !== currSocietyCircle.society ||
        prevSocietyCircle.circle !== currSocietyCircle.circle) &&
      prevSocietyCircle.IQ_Upper <= currSocietyCircle.IQ_Lower
    ) {
      const upgradeMsg = currSocietyCircle.upgradeMsg;
      const user = await User.findById(userId);
      user.societyUpgradeMessage = upgradeMsg;
      await user.save();
      if (awardableXpOrNot) {
        await logActivity({
          userId,
          type: activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type,
          userIQ: currIQScore,
          previousIQ: previousIQForXp,
        });
      }
    }
  } catch (error) {
    console.error(`Error in handleSocietyOrCircleUpgrade: ${error.message}`);
  }
};

const fetchUsersWithQuizAttempts = async () => {
  return User.aggregate([
    {
      $lookup: {
        from: "quiz_attempts",
        localField: "_id",
        foreignField: "user",
        as: "quizAttempts",
      },
    },
    {
      $addFields: {
        distinctArticles: { $size: { $setUnion: "$quizAttempts.article" } },
      },
    },
    {
      $match: {
        distinctArticles: { $gte: 10 },
      },
    },
  ]);
};

const fetchUniqueArticleIds = async () => {
  return QuizAttempt.aggregate([
    { $group: { _id: "$article" } },
    { $project: { _id: 0, articleId: "$_id" } },
  ]);
};

const updatePercentilesForArticles = async (uniqueArticleIds) => {
  await Promise.all(
    uniqueArticleIds.map(async (doc) => {
      await updatePercentilesOnQuizDeactivation({
        id: doc.articleId.toString(),
      });
    })
  );
};

const calculateUserScores = async (users) => {
  const userScores = [];
  let sumOfUserScores = 0;
  const currSeason = configService.getCurrentSeason();

  const fetchQuizAttemptsPromises = users.map(async (user) => {
    const quizAttempts = await QuizAttempt.find({
      user: user._id,
      season: parseInt(currSeason, 10),
    }).populate({
      path: "article",
      populate: { path: "quiz" },
    });
    return { user, quizAttempts };
  });

  const userQuizAttempts = await Promise.all(fetchQuizAttemptsPromises);
  // const progressBarIncrement = progressBar(userQuizAttempts.length);
  for (const { user, quizAttempts } of userQuizAttempts) {
    let userScore = user.baseUserScore || 0;

    for (const attempt of quizAttempts) {
      if (
        !attempt ||
        !attempt.article ||
        !attempt.article.quiz ||
        !attempt.articleDifficulty
      ) {
        console.error("Invalid quiz attempt data.");
        continue;
      }

      const quizScore = attempt.articleDifficulty * attempt.userPercentile;
      userScore += quizScore;
    }

    userScore = typeof userScore === "number" && userScore ? userScore : 0;
    const u = await User.findById(user._id);
    u.userScore = userScore;
    await u.save();

    sumOfUserScores += userScore;
    userScores.push({ user, userScore });
    // progressBarIncrement();
  }

  return { userScores, sumOfUserScores };
};

const calculateAndAssignIQScores = async (userScores, sumOfUserScores) => {
  const meanOfUserScores = sumOfUserScores / userScores.length;
  const sumOfSquares = userScores.reduce(
    (acc, user) => acc + Math.pow(user.userScore - meanOfUserScores, 2),
    0
  );
  const standardDeviation = Math.sqrt(sumOfSquares / userScores.length);

  userScores.sort((a, b) => b.userScore - a.userScore);
  let rank = 1;
  // const progressBarIncrement = progressBar(userScores.length);
  for (const { user, userScore } of userScores) {
    if (!user) {
      console.error("Invalid user data.");
      continue;
    }

    const normalizedScore = (userScore - meanOfUserScores) / standardDeviation;
    const IQScore = 100 + 15 * normalizedScore;

    const currIQScore = Math.round(IQScore);
    const updatedUser = await User.findById(user._id);
    const awardableXpOrNot = currIQScore > user.maxIQScore;
    const previousIQForXp = user.maxIQScore;
    const prevIQScore = updatedUser.IQ_score;

    updatedUser.IQ_score = currIQScore;
    updatedUser.maxIQScore = Math.max(updatedUser.maxIQScore, currIQScore);
    updatedUser.prevIQScore = prevIQScore;
    const currentSeason = configService.getCurrentSeason();
    const dailyIQ = new DailyIQ({
      user: updatedUser._id,
      IQ_score: currIQScore,
      dailyRank: `${rank}/${userScores.length}`,
      season: parseInt(currentSeason, 10),
    });
    await dailyIQ.save();

    updatedUser.dailyIQScores.push(dailyIQ._id);
    await updatedUser.save();

    await handleSocietyOrCircleUpgrade(
      updatedUser._id.toString(),
      prevIQScore,
      currIQScore,
      previousIQForXp,
      awardableXpOrNot
    );
    rank++;
    // progressBarIncrement();
  }
};

const dailyUserIQCalc = async () => {
  try {
    console.log("\nFetching users...\n");
    const users = await fetchUsersWithQuizAttempts();
    console.log("\nFetched users.\n");

    console.log("\nFetching unique article IDs...\n");
    const uniqueArticleIds = await fetchUniqueArticleIds();
    console.log("\nFetched unique article IDs.\n");

    console.log("\nUpdating percentiles on quiz...\n");
    await updatePercentilesForArticles(uniqueArticleIds);
    console.log("\nUpdated percentiles on quiz.\n");

    console.log("\nCalculating user scores...\n");
    const { userScores, sumOfUserScores } = await calculateUserScores(users);
    console.log("\nCalculated user scores.\n");

    console.log("\nCalculating and assigning IQ scores...\n");
    await calculateAndAssignIQScores(userScores, sumOfUserScores);
    console.log("\nCalculated and assigned IQ scores.\n");

    await rankUpdate();
    console.log("\nRank updated.\n");
  } catch (error) {
    console.error(`Error in dailyUserIQCalc: ${error}`);
  }
};

module.exports = dailyUserIQCalc;
