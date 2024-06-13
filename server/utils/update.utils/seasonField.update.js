const DailyIQ = require("../../model/dailyIQSchema");
const QuizAttempt = require("../../model/quizAttemptSchema");

const seasonFieldUpdate = async () => {
  try {
    await QuizAttempt.updateMany({}, { $set: { season: 1 } });
    await DailyIQ.updateMany({}, { $set: { season: 1 } });

    console.log("Season Field Updated");
  } catch (error) {
    console.log(error);
  }
};

seasonFieldUpdate();
