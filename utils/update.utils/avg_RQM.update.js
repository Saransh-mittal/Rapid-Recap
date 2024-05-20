const User = require("../../model/userSchema");
const { progressBar } = require("../progress.utils");

const avg_RQM = async () => {
  try {
    const users = await User.find({
      inGameName: { $exists: true, $ne: "" },
    }).populate("quizAttempts");
    const progress = progressBar(users.length);
    for (let user of users) {
      if (user.quizAttempts.length === 0) continue;
      let sum = 0;
      const { _id } = user;
      for (let i = 0; i < user.quizAttempts.length; i++) {
        sum += user.quizAttempts[i].RQM_score;
      }
      const RQM_avg = (sum / user.quizAttempts.length).toFixed(0);
      const u = await User.findById(_id);
      u.avgRQM = RQM_avg;
      await u.save();
      progress();
    }
    console.log("Average RQM updated successfully!");
  } catch (error) {
    console.error(error);
  }
};

avg_RQM();
