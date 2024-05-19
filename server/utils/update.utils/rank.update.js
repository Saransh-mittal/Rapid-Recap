const User = require("../../model/userSchema");
const { progressBar } = require("../progress.utils");

const rankUpdate = async () => {
  const users = await User.find({ inGameName: { $exists: true, $ne: "" } })
    .sort({ IQ_score: -1 })
    .populate("quizAttempts");
  //AVG. RQM SCORES
  const result = [];
  console.log("\nCalculating user RQM_avg and quizSubs...\n");
  const updateProgress1 = progressBar(users.length);

  users.forEach((user) => {
    let sum = 0;
    const { IQ_score, _id } = user;
    for (let i = 0; i < user.quizAttempts.length; i++) {
      sum += user.quizAttempts[i].RQM_score;
    }
    const RQM_avg = (sum / user.quizAttempts.length).toFixed(0);
    const quizSubmissions = user.quizAttempts.length;
    result.push({
      _id,
      RQM_avg,
      IQ_score,
      quizSubmissions,
    });
    updateProgress1();
  });
  console.log("\nCalculated user RQM_avg and quizSubs.\n");
  console.log("\nSorting users...\n");

  result.sort((a, b) => {
    if (a.IQ_score !== b.IQ_score) {
      return b.IQ_score - a.IQ_score; // Sort by IQ_score in descending order
    } else if (a.quizSubmissions !== b.quizSubmissions) {
      return b.quizSubmissions - a.quizSubmissions; // Sort by quizSubmissions in descending order
    } else {
      return isNaN(a.RQM_avg)
        ? b.RQM_avg
        : isNaN(b.RQM_avg)
        ? a.RQM_avg
        : b.RQM_avg - a.RQM_avg; // Sort by RQM_avg in descending order
    }
  });

  console.log("\nUpdating user ranks...\n");
  const updateProgress3 = progressBar(result.length);
  let rank = 1;
  for (let i = 0; i < result.length; i++) {
    const user = result[i];
    const u = await User.findById(user._id);
    u.rank = rank;
    await u.save();
    rank++;
    updateProgress3();
  }
  console.log("\nUpdated user ranks.\n");
};

module.exports = rankUpdate;
