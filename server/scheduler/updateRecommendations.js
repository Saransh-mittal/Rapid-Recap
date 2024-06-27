const cron = require("node-cron");
const { updateRecommendations } = require("../services/recommendationService");
const User = require("../model/userSchema");

// Run every day at 2 AM
cron.schedule("0 2 * * *", async () => {
  console.log("Running daily recommendation updates");
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await User.find({ lastLogin: { $gte: thirtyDaysAgo } });

    for (const user of activeUsers) {
      await updateRecommendations(user._id);
    }

    console.log("Daily recommendation updates completed");
  } catch (error) {
    console.error("Error in daily recommendation updates:", error);
  }
});
