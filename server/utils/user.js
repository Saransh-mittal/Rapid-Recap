const DailyIQ = require("../model/dailyIQSchema");
const QuizAttempt = require("../model/quizAttemptSchema");
const User = require("../model/userSchema");
const { formatDate } = require("./date");

const calculateTopPercent = (userIQ, IQScores) => {
  const sortedIQScores = IQScores.sort((a, b) => b - a);
  const index = sortedIQScores.findIndex((score) => score <= userIQ);

  return (((index + 1) / IQScores.length) * 100).toFixed(2);
};

const calculateLabelsAndData = (IQScores) => {
  const labels = Array.from({ length: 40 }, (_, i) => (i + 1) * 10);
  const data = labels.map((threshold) => {
    return IQScores.filter(
      (score) => score >= threshold - 10 && score < threshold
    ).length;
  });

  const filteredLabels = [];
  const filteredIQData = [];
  for (let i = 0; i < labels.length; i++) {
    if (data[i] !== 0) {
      filteredLabels.push(`${labels[i] - 10}-${labels[i]}`);
      filteredIQData.push(data[i]);
    }
  }

  return { filteredLabels, filteredIQData };
};

const calculatePercentilesOfEachBar = (
  IQScores,
  filteredLabels,
  filteredIQData
) => {
  const percentiles = [];

  // Define the function to calculate percentile
  const calculatePercentile = (iqScore) => {
    const sortedScores = IQScores.sort((a, b) => a - b);
    const index = sortedScores.findIndex((score) => score >= iqScore);
    return index === 0 ? 100 : 100 - ((index + 1) / sortedScores.length) * 100;
  };

  // Iterate through each data point
  for (let i = 0; i < filteredLabels.length; i++) {
    const [lowerBound, upperBound] = filteredLabels[i].split("-").map(Number);
    const percentile = calculatePercentile(lowerBound).toFixed(2);
    percentiles.push({
      lowerBound,
      upperBound,
      percentile,
      count: filteredIQData[i],
    });
  }

  return percentiles;
};

const getUserIQScoreHistory = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  //await user.populate("dailyIQScores");
  const latestIQScores = await DailyIQ.aggregate([
    { $match: { user: user._id } }, // Filter by user
    { $sort: { date: -1 } }, // Sort by date in descending order
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        latestScore: { $first: "$IQ_score" },
        latestDailyRank: { $first: "$dailyRank" },
        date: { $first: "$date" },
      },
    },
  ]);

  // Map the result to the desired format
  const iqScoresHistory = latestIQScores.map((score) => ({
    date: formatDate(score.date),
    IQScore: score.latestScore,
    dailyRank: score.latestDailyRank,
  }));

  return iqScoresHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const currentTopPercentOfUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const USER_IQ = user.IQ_score;
  const users = await User.find({});
  const IQScores = users.filter((u) => u.IQ_score > 0).map((u) => u.IQ_score);
  const Top_Percentage = calculateTopPercent(USER_IQ, IQScores);
  //console.log(Top_Percentage);
  const { filteredLabels, filteredIQData } = calculateLabelsAndData(IQScores);
  const percentileData = calculatePercentilesOfEachBar(
    IQScores,
    filteredLabels,
    filteredIQData
  );

  return {
    Top_Percentage,
    percentileData,
    filteredLabels,
    filteredIQData,
    USER_IQ,
  };
};

const getSolvedQuizzesCount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const users = await User.find({});
  const totalSolvedQuiz = user.quizAttempts.length;
  const easyQuizzesCount = user.easyQuizCount;
  const mediumQuizzesCount = user.mediumQuizCount;
  const hardQuizzesCount = user.hardQuizCount;

  const easyBeatsPercentage =
    (users.filter((u) => u.easyQuizCount < easyQuizzesCount).length /
      users.length) *
    100;
  const medBeatsPercentage =
    (users.filter((u) => u.mediumQuizCount < mediumQuizzesCount).length /
      users.length) *
    100;
  const hardBeatsPercentage =
    (users.filter((u) => u.hardQuizCount < hardQuizzesCount).length /
      users.length) *
    100;

  return {
    solvedQuizzesCount: totalSolvedQuiz,
    easy: { easyQuizzesCount, easyBeatsPercentage },
    medium: { mediumQuizzesCount, medBeatsPercentage },
    hard: { hardQuizzesCount, hardBeatsPercentage },
  };
};

const getDailyActivity = async (userId) => {
  const quizAttempts = await QuizAttempt.find({ user: userId });

  return quizAttempts.map((attempt) => ({
    date: attempt.createdAt,
  }));
};

const calculateUserRank = async (userId) => {
  const users = await User.find({})
    .sort({ IQ_score: -1 })
    .populate("quizAttempts");
  const result = [];
  users.forEach((user) => {
    let sum = 0;
    const { name, inGameName, IQ_score, pic, _id } = user;
    for (let i = 0; i < user.quizAttempts.length; i++) {
      sum += user.quizAttempts[i].RQM_score;
    }
    const RQM_avg = (sum / user.quizAttempts.length).toFixed(0);
    const quizSubmissions = user.quizAttempts.length;
    result.push({
      _id,
      RQM_avg,
      name,
      inGameName,
      IQ_score,
      pic,
      quizSubmissions,
    });
  });
  result.sort((a, b) => {
    if (a.IQ_score !== b.IQ_score) {
      return b.IQ_score - a.IQ_score; // Sort by IQ_score in descending order
    } else if (a.quizSubmissions !== b.quizSubmissions) {
      return b.quizSubmissions - a.quizSubmissions; // Sort by quizSubmissions in descending order
    } else {
      return b.RQM_avg - a.RQM_avg; // Sort by RQM_avg in descending order
    }
  });
  const userIndex = result.findIndex(
    (user) => user._id.toString() === userId.toString()
  );

  if (userIndex === -1) {
    throw new Error("User not found");
  }

  return userIndex + 1;
};

const dailyStreakCalculator = async (userId) => {
  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // If user not found, return error
    if (!user) {
      throw new Error("User not found");
    }

    // Use aggregation pipeline to group quiz attempts by day
    const streakData = await QuizAttempt.aggregate([
      {
        $match: {
          user: user._id,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 }, // Sort by date in descending order
      },
    ]);
    if (streakData.length === 0) {
      return 0; // No streak
    }

    // const yesterday = new Date(streakData[1]._id);
    const latestAttemptDate = new Date(streakData[0]._id);
    // const isDiffDay = Math.floor(
    //   (yesterday.getTime() - latestAttemptDate.getTime()) / (1000 * 3600 * 24)
    // );
    // //console.log(isDiffDay, yesterday, latestAttemptDate, streakData[0]._id);
    // if (isDiffDay) {
    //   user.streak = 0;
    //   latestAttemptDate.setDate(latestAttemptDate.getDate() + 1);
    //   latestAttemptDate.setHours(0, 0, 0, 0);
    //   user.streakExpiry = latestAttemptDate;
    //   return 0; // No streak
    // }

    // Iterate through quiz attempts to find streak
    let streak = 1;
    for (let i = 1; i < streakData.length; i++) {
      // Check if consecutive days
      const currentDay = new Date(streakData[i]._id);
      const prevDay = new Date(streakData[i - 1]._id);
      const diffInTime = currentDay.getTime() - prevDay.getTime();
      const diffInDays = diffInTime / (1000 * 3600 * 24);
      //console.log(currentDay, prevDay);
      if (Math.abs(diffInDays) === 1) {
        streak++;
      } else {
        if (i == 1) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          latestAttemptDate.setHours(0, 0, 0, 0);
          if (
            yesterday.getTime() !== latestAttemptDate.getTime() &&
            today.getTime() !== latestAttemptDate.getTime()
          ) {
            streak = 0;
          }
        }
        // Streak broken, exit loop
        break;
      }
    }

    //if (user.inGameName === "dynamic_queen") console.log(streak);
    user.streak = streak;
    latestAttemptDate.setDate(latestAttemptDate.getDate() + 1);
    latestAttemptDate.setHours(0, 0, 0, 0);
    user.streakExpiry = latestAttemptDate;
    await user.save();
    return streak;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  calculateTopPercent,
  calculateLabelsAndData,
  calculatePercentilesOfEachBar,
  getUserIQScoreHistory,
  currentTopPercentOfUser,
  getSolvedQuizzesCount,
  getDailyActivity,
  calculateUserRank,
  dailyStreakCalculator,
};
