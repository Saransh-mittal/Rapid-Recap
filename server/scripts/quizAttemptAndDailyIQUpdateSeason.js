const DailyIQ = require("../model/dailyIQSchema");
const QuizAttempt = require("../model/quizAttemptSchema");

const quizAttemptAndDailyIQUpdateSeason = async () => {
  try {
    await QuizAttempt.updateMany(
      { season: { $exists: false } },
      { $set: { season: 1 } }
    );
    await DailyIQ.updateMany(
      { season: { $exists: false } },
      { $set: { season: 1 } }
    );
    console.log("QuizAttempt and DailyIQ updated for season 1");
  } catch (error) {
    console.log(`Error in quizAttemptAndDailyIQUpdateSeason: ${error}`);
  }
};

quizAttemptAndDailyIQUpdateSeason();
