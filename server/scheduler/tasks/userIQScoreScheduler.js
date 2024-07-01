const dailyUserIQCalc = require("../../utils/dailyUserIQCalc.utils");
const updateBots = require("../../utils/bot.utils/updateBots");

async function calculateUserIQScores() {
  try {
    await updateBots();
    await dailyUserIQCalc();
    console.log("User IQ scores calculated successfully at midnight!");
  } catch (error) {
    console.error("Error calculating IQ scores:", error);
  }
}

module.exports = calculateUserIQScores;
