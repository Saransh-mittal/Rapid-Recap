// utils/seasonUpdate.js
const configService = require("../../configService");
const CircleAndSocietyData = require("../../data/CircleAndSocietyData");
const DailyIQ = require("../../model/dailyIQSchema");
const QuizAttempt = require("../../model/quizAttemptSchema");
const SeasonData = require("../../model/seasonDataSchema");
const User = require("../../model/userSchema");
const { progressBar } = require("../../utils/progress.utils");

/**
 * Calculate Uj value based on IQ, mean, and standard deviation.
 * @param {number} IQ - The IQ score.
 * @param {number} [mean=1000] - The mean value.
 * @param {number} [stdDev=600] - The standard deviation.
 * @returns {number} - The calculated Uj value.
 */
const calculateUj = (IQ, mean = 1000, stdDev = 600) => {
  return Math.round(((IQ - 100) / 15) * stdDev + mean);
};

/**
 * Decay the Uj value by a given percentage.
 * @param {number} uj - The initial Uj value.
 * @param {number} decayPercentage - The decay percentage.
 * @returns {number} - The decayed Uj value.
 */
const decayUj = (uj, decayPercentage) => {
  return uj * (1 - decayPercentage / 100);
};

/**
 * Calculate the new Zj value.
 * @param {number} uj - The Uj value.
 * @param {number} newMean - The new mean value.
 * @param {number} newStdDev - The new standard deviation.
 * @returns {number} - The calculated Zj value.
 */
const calculateNewZj = (uj, newMean, newStdDev) => {
  return parseFloat(((uj - newMean) / newStdDev).toFixed(2));
};

/**
 * Adjust the IQ score based on the society and circle ranges.
 * @param {number} IQ - The IQ score.
 * @param {number} minIQ - The minimum IQ score.
 * @returns {number} - The adjusted IQ score.
 */
const adjustIQ = (IQ, minIQ) => {
  for (const entry of CircleAndSocietyData) {
    if (
      (entry.IQ_Upper === null || IQ <= entry.IQ_Upper) &&
      IQ >= entry.IQ_Lower
    ) {
      return entry.IQ_Lower > 0 ? entry.IQ_Lower : Math.max(IQ, minIQ);
    }
  }
  return -1; // Default return in case IQ does not fall within any range
};

/**
 * Calculate the mean and standard deviation of an array of numbers.
 * @param {number[]} arr - The array of numbers.
 * @returns {Object} - An object containing the mean and standard deviation.
 */
const calculateMeanAndStdDev = (arr) => {
  const mean = arr.reduce((sum, value) => sum + value, 0) / arr.length;
  const variance =
    arr.reduce((sum, value) => sum + (value - mean) ** 2, 0) / arr.length;
  const stdDev = Math.sqrt(variance);

  return { mean: Math.round(mean), stdDev: Math.round(stdDev) };
};

/**
 * Determine the society for a given IQ.
 * @param {number} IQ - The IQ score.
 * @returns {string|null} - The name of the society or null if not found.
 */
const societyDeterminer = (IQ) => {
  for (const entry of CircleAndSocietyData) {
    if (
      (entry.IQ_Upper === null || IQ <= entry.IQ_Upper) &&
      IQ >= entry.IQ_Lower
    ) {
      return entry.society;
    }
  }
  return null; // Default return in case IQ does not fall within any range
};

/**
 * Update the season data based on user IQ scores and societies.
 * @param {Object[]} societyUsers - The array of society user data.
 */
const updateSeason = async (societyUsers, societyMeans, minIQ) => {
  const DEFAULT_MEAN = 1000;
  const DEFAULT_STDDEV = 600;

  const decayPercentages = {
    "Titans Society": 70,
    "Mavericks Society": 62,
    "Elites Society": 50,
    "Strivers Society": 25,
    "Explorers Society": 2,
  };

  console.log("societyMeans:", societyMeans);
  const currentSeason = configService.getCurrentSeason();

  try {
    const ujValues = calculateInitialUjValues(
      societyMeans,
      DEFAULT_MEAN,
      DEFAULT_STDDEV
    );
    console.log("Initial Uj Values:", ujValues);

    const decayedUjValues = applyDecayToUjValues(ujValues, decayPercentages);
    console.log("Decayed Uj Values:", decayedUjValues);

    const societyUsersWithDecayedUj = getSocietyUsersWithDecayedUj(
      societyUsers,
      decayedUjValues
    );
    const { mean: newMean, stdDev: newStdDev } = calculateMeanAndStdDev(
      societyUsersWithDecayedUj
        .map((societyUser) =>
          Array(societyUser.userCnt).fill(societyUser.decayedUj)
        )
        .flat()
    );

    console.log("new mean:", newMean);
    console.log("new stdDev:", newStdDev);

    const newZjValues = calculateNewZjValues(
      decayedUjValues,
      newMean,
      newStdDev
    );
    console.log("New Zj Values:", newZjValues);

    const newIQScores = calculateNewIQScores(newZjValues);
    console.log("New IQ Scores:", newIQScores);

    const adjustedIQScores = adjustIQScores(newIQScores, minIQ);
    console.log("Adjusted IQ Scores:", adjustedIQScores);

    const finalUjValues = calculateFinalUjValues(
      adjustedIQScores,
      newMean,
      newStdDev
    );
    console.log("Final Uj Values:", finalUjValues);

    // calculate Uj values for the users whose IQ score is less than than adjusted IQ of Explorers Society
    // const users = await User.find({
    //   IQ_score: { $lt: adjustedIQScores["Explorers Society"], $gte: 1 },
    // });
    // console.log(users.length);
    // for (const user of users) {
    //   const userSociety = societyDeterminer(user.IQ_score);
    //   const userIQ = user.IQ_score;
    //   const userUj = calculateUj(userIQ, newMean, newStdDev);

    //   console.log(`User: ${user.inGameName}`);
    //   console.log(`curr IQ: ${user.IQ_score}`);
    //   console.log(`Society: ${userSociety}`);
    //   console.log(`curr Uj: ${user.userScore}`);
    //   console.log(`Final Uj: ${userUj}`);

    //   // user.prevIQScore = userAdjustedIQ;
    //   // user.IQ_score = userFinalAdjustedIQ;

    //   // await user.save();
    // }

    // Update each user with new scores and store previous season data
    const users = await User.find({ IQ_score: { $gte: 1 } });
    const progressIncrement = progressBar(users.length);
    for (const user of users) {
      const userSociety = societyDeterminer(user.IQ_score);
      // Calculate the counts for the previous season
      const quizAttempts = await QuizAttempt.find({
        user: user._id,
        season: ParseInt(currentSeason, 10),
      });

      const easyQuizCount = quizAttempts.filter(
        (qa) => qa.articleDifficulty < 0.5
      ).length;
      const mediumQuizCount = quizAttempts.filter(
        (qa) => qa.articleDifficulty >= 0.5 && qa.articleDifficulty < 0.7
      ).length;
      const hardQuizCount = quizAttempts.filter(
        (qa) => qa.articleDifficulty >= 0.7
      ).length;

      const previousSeasonData = new SeasonData({
        userId: user._id,
        season: ParseInt(currentSeason, 10),
        IQ_score: user.IQ_score,
        prevIQScore: user.prevIQScore,
        userScore: user.userScore,
        easyQuizCount,
        mediumQuizCount,
        hardQuizCount,
        avgRQM: user.avgRQM,
      });

      await previousSeasonData.save();

      user.previousSeasonData.push(previousSeasonData._id);

      // Update user with new season scores
      user.prevIQScore = adjustedIQScores[userSociety];
      user.IQ_score = adjustedIQScores[userSociety];
      user.userScore = finalUjValues[userSociety];
      user.baseUserScore = finalUjValues[userSociety];
      user.avgRQM = 0;
      user.rankedInCurrentSeason = false;
      user.currentSeason = ParseInt(currentSeason, 10) + 1;

      await user.save();
      progressIncrement();
    }

    // Increment the current season
    configService.setCurrentSeason(currentSeason + 1);
  } catch (error) {
    console.error("An error occurred during the season update process:", error);
  }
};

const calculateInitialUjValues = (societyMeans, mean, stdDev) => {
  let ujValues = {};
  for (let [society, meanIQ] of Object.entries(societyMeans)) {
    ujValues[society] = calculateUj(meanIQ, mean, stdDev);
  }
  return ujValues;
};

const applyDecayToUjValues = (ujValues, decayPercentages) => {
  let decayedUjValues = {};
  for (let [society, uj] of Object.entries(ujValues)) {
    decayedUjValues[society] = Math.floor(
      decayUj(uj, decayPercentages[society])
    );
  }
  return decayedUjValues;
};

const getSocietyUsersWithDecayedUj = (societyUsers, decayedUjValues) => {
  let societyUsersWithDecayedUj = [];
  for (let [society, decayedUj] of Object.entries(decayedUjValues)) {
    const usersInSociety = societyUsers.find(
      (societyUser) => societyUser.society === society
    );
    societyUsersWithDecayedUj.push({
      society,
      decayedUj,
      userCnt: usersInSociety.userCnt,
    });
  }
  return societyUsersWithDecayedUj;
};

const calculateNewZjValues = (decayedUjValues, newMean, newStdDev) => {
  let newZjValues = {};
  for (let [society, decayedUj] of Object.entries(decayedUjValues)) {
    newZjValues[society] = calculateNewZj(decayedUj, newMean, newStdDev);
  }
  return newZjValues;
};

const calculateNewIQScores = (newZjValues) => {
  let newIQScores = {};
  for (let [society, newZj] of Object.entries(newZjValues)) {
    newIQScores[society] = Math.round(newZj * 15 + 100);
  }
  return newIQScores;
};

const adjustIQScores = (newIQScores, minIQ) => {
  let adjustedIQScores = {};
  for (let [society, IQ] of Object.entries(newIQScores)) {
    const adjustedIQ = adjustIQ(IQ, minIQ);
    if (adjustedIQ === -1) {
      console.log(`IQ ${IQ} does not fall within any range`);
      continue;
    }
    adjustedIQScores[society] = adjustedIQ;
  }
  return adjustedIQScores;
};

const calculateFinalUjValues = (adjustedIQScores, newMean, newStdDev) => {
  let finalUjValues = {};
  for (let [society, IQ] of Object.entries(adjustedIQScores)) {
    finalUjValues[society] = calculateUj(IQ, newMean, newStdDev);
  }
  return finalUjValues;
};

/**
 * Calculate the mean IQ for each society.
 */
const societyMeansCalculator = async () => {
  try {
    const usersInDB = await User.find({ IQ_score: { $gte: 1 } }).select(
      "IQ_score"
    );
    const { societyIQs, minIQ } = groupUsersBySociety(usersInDB);

    const societyMeans = calculateSocietyMeans(societyIQs);
    const societyUsers = initializeSocietyUsers();

    updateSocietyUsersWithSocietyMeans(societyUsers, societyMeans, societyIQs);
    updateSeason(societyUsers, societyMeans, minIQ);
  } catch (error) {
    console.error("Error calculating society means:", error);
  }
};

const groupUsersBySociety = (usersInDB) => {
  const societyIQs = {};
  let minIQ = 1000;
  usersInDB.forEach((user) => {
    const society = societyDeterminer(user.IQ_score);
    if (society) {
      if (!societyIQs[society]) {
        societyIQs[society] = [];
      }
      minIQ = Math.min(minIQ, user.IQ_score);
      societyIQs[society].push(user.IQ_score);
    }
  });
  return { societyIQs, minIQ };
};

const calculateSocietyMeans = (societyIQs) => {
  const societyMeans = {};
  for (const [society, IQs] of Object.entries(societyIQs)) {
    const meanIQ = IQs.reduce((sum, IQ) => sum + IQ, 0) / IQs.length;
    societyMeans[society] = Math.round(meanIQ);
  }
  return societyMeans;
};

const initializeSocietyUsers = () => {
  return [
    { id: 1, society: "Titans Society", userCnt: 0 },
    { id: 2, society: "Mavericks Society", userCnt: 0 },
    { id: 3, society: "Elites Society", userCnt: 0 },
    { id: 4, society: "Strivers Society", userCnt: 0 },
    { id: 5, society: "Explorers Society", userCnt: 0 },
  ];
};

const updateSocietyUsersWithSocietyMeans = (
  societyUsers,
  societyMeans,
  societyIQs
) => {
  for (const [society, meanIQ] of Object.entries(societyMeans)) {
    societyUsers.find(
      (societyUser) => societyUser.society === society
    ).userCnt = societyIQs[society].length;
  }
};

societyMeansCalculator();
