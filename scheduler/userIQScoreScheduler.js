const cron = require("node-cron");
const { calculateUserIQScores } = require("../controllers/user");

cron.schedule("0 0 * * *", async () => {
  try {
    // Call your function here
    await calculateUserIQScores();
    console.log("User IQ scores calculated successfully at midnight!");
  } catch (error) {
    console.error("Error calculating IQ scores:", error);
  }
});

// Ensure the script continues running
console.log("Scheduler started. Waiting for midnight...");
