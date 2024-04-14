const DailyIQ = require("../model/dailyIQSchema");
const QuizAttempt = require("../model/quizAttemptSchema");
const User = require("../model/userSchema");
const { progressBar } = require("./progress");
const { updatePercentilesOnQuizDeactivation } = require("./quiz");
const rankUpdate = require("./update.utils/rank.update");

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
    { $group: { _id: "$article" } }, // Group by the article field
    { $project: { _id: 0, articleId: "$_id" } }, // Project only the article IDs
  ]);
  //console.log(uniqueArticleIds);
  console.log("\nUpdating percentiles on quiz...\n");
  await Promise.all(
    uniqueArticleIds.map(async (doc) => {
      // Check if the quiz attempt is valid based on its creation date and quiz activity
      // if (
      //   attempt.article.quiz.createdAt.getTime() + 24 * 60 * 60 * 1000 <
      //   Date.now()
      // ) {
      //if (attempt.article.quiz.isActive) {
      await updatePercentilesOnQuizDeactivation({
        id: doc.articleId.toString(),
      });

      //   attempt.article.quiz.isActive = false;
      //   await attempt.article.quiz.save();
      // }
    })
  );
  console.log("\nUpdated percentiles on quiz.\n");
  // Array to store user scores
  const userScores = [];
  let sumOfUserScores = 0;
  // Fetch quiz attempts concurrently for each user
  const fetchQuizAttemptsPromises = users.map(async (user) => {
    const quizAttempts = await QuizAttempt.find({ user: user._id }).populate({
      path: "article",
      populate: { path: "quiz" },
    });
    return { user, quizAttempts };
  });

  const userQuizAttempts = await Promise.all(fetchQuizAttemptsPromises);
  console.log("\nFetched quiz attempts.\n");
  // Iterate through each user's quiz attempts
  console.log("\nCalculating user scores...\n");
  const updateProgress1 = progressBar(userQuizAttempts.length);
  for (const { user, quizAttempts } of userQuizAttempts) {
    let userScore = 0;

    for (const attempt of quizAttempts) {
      // Check if quiz attempt, quiz, and article exist
      if (
        !attempt ||
        !attempt.article ||
        !attempt.article.quiz ||
        !attempt.articleDifficulty
      ) {
        //console.log("Inside IF", attempt);
        console.error("Invalid quiz attempt data.");
        continue; // Skip this attempt
      }
      //console.log("Outside IF", attempt);

      // Calculate score for the quiz attempt (Wi * Pi)

      const quizScore = attempt.articleDifficulty * attempt.userPercentile;
      userScore += quizScore;
      //}
    }
    // add userScore in the user also
    //check if userScore in NaN

    if (typeof userScore !== "number" || !userScore) userScore = 0;
    const u = await User.findById(user._id);
    u.userScore = userScore;
    await u.save();

    sumOfUserScores += userScore;
    // Add user score to the array
    userScores.push({ user, userScore });
    updateProgress1();
  }

  // Calculate mean and standard deviation
  const meanOfUserScores = sumOfUserScores / userScores.length;
  const sumOfSquares = userScores.reduce(
    (acc, user) => acc + Math.pow(user.userScore - meanOfUserScores, 2),
    0
  );
  const standardDeviation = Math.sqrt(sumOfSquares / userScores.length);

  // Calculate and update IQ scores for each user
  console.log("\nCalculating IQ scores...\n");
  const updateProgress2 = progressBar(userScores.length);
  userScores.sort((a, b) => b.userScore - a.userScore);
  let rank = 1;
  for (const user of userScores) {
    if (!user || !user.user) {
      console.error("Invalid user data.");
      continue; // Skip this user
    }

    const normalizedScore =
      (user.userScore - meanOfUserScores) / standardDeviation;
    const IQScore = 100 + 15 * normalizedScore;
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
    rank++;
    updateProgress2();
  }
  await rankUpdate();
};

module.exports = dailyUserIQCalc;
