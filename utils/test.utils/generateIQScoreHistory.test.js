const User = require("../../model/userSchema"); // Import User model
const DailyIQ = require("../../model/dailyIQSchema"); // Import DailyIQ model
const { progressBar } = require("../../utils/progress"); // Import progressBar utility function
async function generateIQScoreHistory() {
  const users = await User.find({});
  const startDate = new Date(); // Start date from today
  const millisecondsInADay = 24 * 60 * 60 * 1000;
  const updateProgress = progressBar(users.length);
  console.log("\nGenerating IQ score history for all users...\n");
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    for (let j = 0; j < 10; j++) {
      const date = new Date(startDate.getTime() - j * millisecondsInADay);
      const iqScoreHistory = new DailyIQ({
        user: user._id,
        date: date,
        IQ_score: Math.round(Math.random() * 200),
        dailyRank: "Beginner",
      });
      await iqScoreHistory.save();
      const updateUser = await User.findById(user._id);
      updateUser.dailyIQScores.push(iqScoreHistory._id);
      await updateUser.save();
    }
    updateProgress();
  }
}

module.exports = generateIQScoreHistory;
