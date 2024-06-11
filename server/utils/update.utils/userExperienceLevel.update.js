// update all users experience level

const { activityTypes } = require("../../data/activityTypes");
const DailyIQ = require("../../model/dailyIQSchema");
const User = require("../../model/userSchema");
const { logActivity } = require("../activity.utils");
const { progressBar } = require("../progress.utils");

const updateUsersExperienceLevel = async () => {
  try {
    const users = await User.find({
      inGameName: { $exists: true },
    }).populate({
      path: "quizAttempts",
      select: "createdAt",
    });
    const progressBarIncrement = progressBar(users.length);
    for (let user of users) {
      const iqHistory = await DailyIQ.find({ user: user._id }).sort({
        date: 1,
      });
      if (iqHistory.length !== 0) {
        let previousIQ = iqHistory[0].IQ_score;
        for (let record of iqHistory) {
          const currentIQ = record.IQ_score;
          try {
            await logActivity({
              userInGameName: user.inGameName,
              type: activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type,
              userIQ: currentIQ,
              previousIQ,
              date: record.date,
            });
          } catch (error) {
            console.log(error);
          }
          previousIQ = currentIQ;
        }
      }
      const quizAttempts = user.quizAttempts;
      //console.log(quizAttempts.length);
      for (let attempt of quizAttempts) {
        try {
          await logActivity({
            userInGameName: user.inGameName,
            type: activityTypes.RANDOM_QUIZ.type,
            userIQ: user.IQ_score,
            previousIQ: user.prevIQScore,
            date: attempt.createdAt,
          });
        } catch (error) {
          console.log(error);
        }
      }
      progressBarIncrement();
    }
  } catch (error) {
    console.log(error);
  }
};

updateUsersExperienceLevel();

// module.exports = { updateUsersExperienceLevel };
