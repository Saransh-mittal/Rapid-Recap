const DailyIQ = require("../model/dailyIQSchema");
const QuizAttempt = require("../model/quizAttemptSchema");
const User = require("../model/userSchema");
const { progressBar } = require("./progress");
const { updatePercentilesOnQuizDeactivation } = require("./quiz");
const rankUpdate = require("./update.utils/rank.update");
const CircleAndSocietyData = require("./../data/CircleAndSocietyData");

const handleSocietyOrCircleUpgrade = async (
  userId,
  prevIQScore,
  currIQScore
) => {
  const upgradeData = CircleAndSocietyData.find((entry) => {
    // Check if the user's IQ score falls within the range specified in the upgrade data
    return (
      currIQScore >= entry.IQ_Lower &&
      (entry.IQ_Upper === null || currIQScore < entry.IQ_Upper)
    );
  });

  if (upgradeData) {
    const { upgradeMsg } = upgradeData;
    const updatedUser = await User.findById(userId);
    updatedUser.societyUpgradeMessage = upgradeMsg;
    await updatedUser.save();
    console.log(`Sending upgrade message to user ${userId}: ${upgradeMsg}`);
  }
};

const dailyUserIQCalc = async () => {
  console.log("\nFetching users...\n");
  const users = await User.aggregate([
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
  console.log("\nFetched users.\n");

  const uniqueArticleIds = await QuizAttempt.aggregate([
    { $group: { _id: "$article" } },
    { $project: { _id: 0, articleId: "$_id" } },
  ]);

  console.log("\nUpdating percentiles on quiz...\n");
  await Promise.all(
    uniqueArticleIds.map(async (doc) => {
      await updatePercentilesOnQuizDeactivation({
        id: doc.articleId.toString(),
      });
    })
  );
  console.log("\nUpdated percentiles on quiz.\n");

  const userScores = [];
  let sumOfUserScores = 0;

  const fetchQuizAttemptsPromises = users.map(async (user) => {
    const quizAttempts = await QuizAttempt.find({ user: user._id }).populate({
      path: "article",
      populate: { path: "quiz" },
    });
    return { user, quizAttempts };
  });

  const userQuizAttempts = await Promise.all(fetchQuizAttemptsPromises);
  console.log("\nFetched quiz attempts.\n");

  console.log("\nCalculating user scores...\n");
  const updateProgress1 = progressBar(userQuizAttempts.length);

  for (const { user, quizAttempts } of userQuizAttempts) {
    let userScore = 0;

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

    if (typeof userScore !== "number" || !userScore) userScore = 0;
    const u = await User.findById(user._id);
    u.userScore = userScore;
    await u.save();

    sumOfUserScores += userScore;
    userScores.push({ user, userScore });
    updateProgress1();
  }

  const meanOfUserScores = sumOfUserScores / userScores.length;
  const sumOfSquares = userScores.reduce(
    (acc, user) => acc + Math.pow(user.userScore - meanOfUserScores, 2),
    0
  );
  const standardDeviation = Math.sqrt(sumOfSquares / userScores.length);

  console.log("\nCalculating IQ scores...\n");
  const updateProgress2 = progressBar(userScores.length);
  userScores.sort((a, b) => b.userScore - a.userScore);
  let rank = 1;

  for (const user of userScores) {
    if (!user || !user.user) {
      console.error("Invalid user data.");
      continue;
    }

    const normalizedScore =
      (user.userScore - meanOfUserScores) / standardDeviation;
    const IQScore = 100 + 15 * normalizedScore;

    const prevIQScore = updatedUser.IQ_score;
    const currIQScore = Math.round(IQScore);
    const updatedUser = await User.findById(user.user._id);
    updatedUser.IQ_score = Math.round(IQScore);
    updatedUser.maxIQScore = Math.max(
      updatedUser.maxIQScore,
      Math.round(IQScore)
    );

    const dailyIQ = new DailyIQ({
      user: updatedUser._id,
      IQ_score: Math.round(IQScore),
      dailyRank: `${rank}/${userScores.length}`,
    });
    await dailyIQ.save();
    updatedUser.dailyIQScores.push(dailyIQ._id);
    await updatedUser.save();
    await handleSocietyOrCircleUpgrade(
      updatedUser._id,
      prevIQScore,
      currIQScore
    );
    rank++;
    updateProgress2();
  }
  await rankUpdate();
};

module.exports = dailyUserIQCalc;
