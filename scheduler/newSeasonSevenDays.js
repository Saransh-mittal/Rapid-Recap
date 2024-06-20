const cron = require("node-cron");
const User = require("../model/userSchema");

// Cron job to run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    await User.updateMany(
      {
        inGameName: "Smash_dev_ultrA",
        newSeasonModal: true,
      },
      { newSeasonModal: false }
    );
    console.log(
      "Updated newSeasonModal for users who had it set for more than 7 days."
    );
  } catch (error) {
    console.error("Error updating newSeasonModal:", error);
  }
});

console.log("Running newSeasonSevenDays cron job...");
