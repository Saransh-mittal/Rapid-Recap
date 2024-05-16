const DailyIQ = require("../model/dailyIQSchema");
const QuizAttempt = require("../model/quizAttemptSchema");
const User = require("../model/userSchema");
const { formatDate } = require("./date");
const {
  binarySearch,
  binarySearchForLeftRange,
  binarySearchForRightRange,
} = require("./miscellaneous");

const calculateTopPercent = (userIQ, sortedIQScores) => {
  //sortedIQScores.sort((a, b) => b - a);
  // const index = sortedIQScores.findIndex((score) => score === userIQ);
  const index = binarySearch(sortedIQScores, userIQ);
  if (index === -1) {
    throw new Error("User IQ score not found in the list");
  }
  return (100 - ((index + 1) / sortedIQScores.length) * 100).toFixed(2);
};

const calculateLabelsAndData = (IQScores) => {
  const labels = Array.from({ length: 40 }, (_, i) => (i + 1) * 10);
  const filteredLabels = [];
  const filteredIQData = [];

  for (let i = 0; i < labels.length; i++) {
    const lowerBound = labels[i] - 10;
    const upperBound = labels[i];
    const index_left = binarySearchForLeftRange(IQScores, lowerBound);
    const index_right = binarySearchForRightRange(IQScores, upperBound);

    // // Calculate the count of elements within the current threshold range
    const count =
      index_left == -1 || index_right == -1 || index_left > index_right
        ? 0
        : index_right - index_left + 1;

    // // If count is not zero, add the label and count to filteredLabels and filteredIQData respectively
    if (count !== 0) {
      filteredLabels.push(`${lowerBound}-${upperBound}`);
      filteredIQData.push(count);
    }
  }

  return { filteredLabels, filteredIQData };
};

const calculatePercentilesOfEachBar = (
  sortedScores,
  filteredLabels,
  filteredIQData
) => {
  const percentiles = [];

  // Define the function to calculate percentile
  const calculatePercentile = (iqScore) => {
    //const sortedScores = IQScores.sort((a, b) => a - b);
    //const index = sortedScores.findIndex((score) => score >= iqScore);
    const index = binarySearchForLeftRange(sortedScores, iqScore);
    return index === 0 || index === -1
      ? 100
      : 100 - ((index + 1) / sortedScores.length) * 100;
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
  const users = await User.find({ IQ_score: { $gt: 0 } });
  const IQScores = users.map((u) => u.IQ_score);

  const sortedIQScores = IQScores.sort((a, b) => a - b);
  const Top_Percentage =
    USER_IQ === 0 ? 100 : calculateTopPercent(USER_IQ, sortedIQScores);
  const { filteredLabels, filteredIQData } =
    calculateLabelsAndData(sortedIQScores);

  return {
    Top_Percentage,
    percentileData: calculatePercentilesOfEachBar(
      sortedIQScores,
      filteredLabels,
      filteredIQData
    ),
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

  const totalSolvedQuiz = user.quizAttempts.length;
  const easyQuizzesCount = user.easyQuizCount;
  const mediumQuizzesCount = user.mediumQuizCount;
  const hardQuizzesCount = user.hardQuizCount;

  // Calculate the number of users with fewer easy, medium, and hard quizzes
  const usersCount = await User.countDocuments();
  const easyBeatsPercentage =
    ((await User.countDocuments({ easyQuizCount: { $lt: easyQuizzesCount } })) /
      usersCount) *
    100;
  const medBeatsPercentage =
    ((await User.countDocuments({
      mediumQuizCount: { $lt: mediumQuizzesCount },
    })) /
      usersCount) *
    100;
  const hardBeatsPercentage =
    ((await User.countDocuments({ hardQuizCount: { $lt: hardQuizzesCount } })) /
      usersCount) *
    100;

  return {
    solvedQuizzesCount: totalSolvedQuiz,
    easy: { easyQuizzesCount, easyBeatsPercentage },
    medium: { mediumQuizzesCount, medBeatsPercentage },
    hard: { hardQuizzesCount, hardBeatsPercentage },
  };
};

const getDailyActivity = async (userId) => {
  const quizAttempts = await QuizAttempt.aggregate([
    { $match: { user: userId } }, // Filter quiz attempts by user ID
    { $project: { date: "$createdAt" } }, // Rename createdAt to date
  ]);

  return quizAttempts;
};

const calculateUserRank = async (userId) => {
  const user = await User.findById(userId);
  return user.rank;
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
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set time to start of the day

    // const isDiffDay = Math.floor(
    //   (yesterday.getTime() - latestAttemptDate.getTime()) / (1000 * 3600 * 24)
    // );
    // //console.log(isDiffDay, yesterday, latestAttemptDate, streakData[0]._id);
    // if (isDiffDay) {
    //   user.streak = 0;
    //   latestAttemptDate.setUTCDate(latestAttemptDate.getUTCDate() + 1);
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
          yesterday.setUTCDate(yesterday.getUTCDate() - 1);
          yesterday.setUTCHours(0, 0, 0, 0);
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);
          latestAttemptDate.setUTCHours(0, 0, 0, 0);
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
    latestAttemptDate.setUTCDate(latestAttemptDate.getUTCDate() + 1);
    latestAttemptDate.setUTCHours(0, 0, 0, 0);
    if (today.getTime() > user.streakExpiry.getTime()) {
      // Reset streak
      user.streak = 0;
      user.streakExpiry = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      await user.save();
      return 0;
    }
    user.streak = streak;
    user.streakExpiry = latestAttemptDate;
    await user.save();
    return streak;
  } catch (error) {
    console.error(error);
  }
};

const longestStreakCalculator = async (userId) => {
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
      user.longestStreak = 0;
      await user.save();
      return 0; // No streak
    }

    // Iterate through streakData to find longest streak
    let longestStreak = 0;

    for (let i = 0; i < streakData.length; i++) {
      let streak = 1;
      for (let j = i + 1; j < streakData.length; j++) {
        const currentDay = new Date(streakData[j]._id);
        const prevDay = new Date(streakData[j - 1]._id);
        const diffInTime = currentDay.getTime() - prevDay.getTime();
        const diffInDays = diffInTime / (1000 * 3600 * 24);
        if (Math.abs(diffInDays) === 1) {
          streak++;
        } else {
          break;
        }
      }
      longestStreak = Math.max(longestStreak, streak);
    }
    user.longestStreak = longestStreak;
    await user.save();
    return longestStreak;
  } catch (error) {
    console.error(error);
  }
};

const streakBrokenDaysCalculator = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // last quiz attempt dateTime in UTC
    const lastAttempt = await QuizAttempt.findOne({ user: userId }).sort({
      createdAt: -1,
    });
    if (!lastAttempt) {
      return -1;
    }
    const lastAttemptDate = lastAttempt.createdAt;
    lastAttemptDate.setUTCHours(0, 0, 0, 0);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // If last attempt was today, no streak broken
    if (lastAttemptDate.getTime() === today.getTime()) {
      return 0;
    }
    // If last attempt was day before yesterday then streak broken recently i.e total days = 2 = today - lastAttemptDate
    const diffInTime = today.getTime() - lastAttemptDate.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24);
    return diffInDays;
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
  longestStreakCalculator,
  streakBrokenDaysCalculator,
};
