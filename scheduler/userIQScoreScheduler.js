const cron = require("node-cron");
const dailyUserIQCalc = require("../utils/dailyUserIQCalc");

cron.schedule("0 0 * * *", async () => {
  try {
    // Call your function here
    await dailyUserIQCalc();
    console.log("User IQ scores calculated successfully at midnight!");
  } catch (error) {
    console.error("Error calculating IQ scores:", error);
  }
});

// Ensure the script continues running
console.log("Scheduler started. Waiting for midnight...");
