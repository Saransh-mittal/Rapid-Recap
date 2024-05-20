const User = require("../../model/userSchema");
const DailyIQ = require("../../model/dailyIQSchema");
const { progressBar } = require("../progress.utils");
const maxIQScoreUpdate = async () => {
  try {
    const users = await User.find();
    const updateProgressBar = progressBar(users.length);
    for (const user of users) {
      const userId = user._id;
      const dailyIQScores = await DailyIQ.find({ user: userId });

      let maxIQScore = 0;
      dailyIQScores.forEach((dailyIQScore) => {
        if (dailyIQScore.IQ_score > maxIQScore) {
          maxIQScore = dailyIQScore.IQ_score;
        }
      });

      await User.findByIdAndUpdate(
        userId,
        { maxIQScore: maxIQScore },
        { new: true }
      );
      updateProgressBar();
    }
  } catch (error) {
    console.log(error.message);
  }
};

maxIQScoreUpdate();
