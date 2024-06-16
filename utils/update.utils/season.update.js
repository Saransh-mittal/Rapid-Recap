// utils/seasonUpdate.js

const CircleAndSocietyData = require("../../data/CircleAndSocietyData");
const User = require("../../model/userSchema");

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
 * @param {Object[]} users - The array of user data.
 */
const updateSeason = async (users, societyMeans, minIQ) => {
  const DEFAULT_MEAN = 1000;
  const DEFAULT_STDDEV = 600;

  const decayPercentages = {
    "Titans Society": 76,
    "Mavericks Society": 57,
    "Elites Society": 46.8,
    "Strivers Society": 25,
    "Explorers Society": 5,
  };

  console.log("societyMeans:", societyMeans);

  try {
    const ujValues = calculateInitialUjValues(
      societyMeans,
      DEFAULT_MEAN,
      DEFAULT_STDDEV
    );
    console.log("Initial Uj Values:", ujValues);

    const decayedUjValues = applyDecayToUjValues(ujValues, decayPercentages);
    console.log("Decayed Uj Values:", decayedUjValues);

    const usersWithDecayedUj = getUsersWithDecayedUj(users, decayedUjValues);
    const { mean: newMean, stdDev: newStdDev } = calculateMeanAndStdDev(
      usersWithDecayedUj
        .map((user) => Array(user.userCnt).fill(user.decayedUj))
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

const getUsersWithDecayedUj = (users, decayedUjValues) => {
  let usersWithDecayedUj = [];
  for (let [society, decayedUj] of Object.entries(decayedUjValues)) {
    const usersInSociety = users.find((user) => user.society === society);
    usersWithDecayedUj.push({
      society,
      decayedUj,
      userCnt: usersInSociety.userCnt,
    });
  }
  return usersWithDecayedUj;
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
    const users = initializeUsers();

    updateUsersWithSocietyMeans(users, societyMeans, societyIQs);
    updateSeason(users, societyMeans, minIQ);
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

const initializeUsers = () => {
  return [
    { id: 1, society: "Titans Society", userCnt: 0 },
    { id: 2, society: "Mavericks Society", userCnt: 0 },
    { id: 3, society: "Elites Society", userCnt: 0 },
    { id: 4, society: "Strivers Society", userCnt: 0 },
    { id: 5, society: "Explorers Society", userCnt: 0 },
  ];
};

const updateUsersWithSocietyMeans = (users, societyMeans, societyIQs) => {
  for (const [society, meanIQ] of Object.entries(societyMeans)) {
    users.find((user) => user.society === society).userCnt =
      societyIQs[society].length;
  }
};

societyMeansCalculator();
