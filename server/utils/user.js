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
  await user.populate("dailyIQScores");
  const iqScoresHistory = user.dailyIQScores.map((score) => ({
    date: formatDate(score.date),
    IQScore: score.IQ_score,
    dailyRank: score.dailyRank,
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
  const users = await User.find({}).sort({ IQ_score: -1 });
  const userIndex = users.findIndex(
    (user) => user._id.toString() === userId.toString()
  );

  if (userIndex === -1) {
    throw new Error("User not found");
  }

  return userIndex + 1;
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
};
