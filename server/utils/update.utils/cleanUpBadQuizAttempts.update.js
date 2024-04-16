const QuizAttempt = require("../../model/quizAttemptSchema");
const User = require("../../model/userSchema");
const { progressBar } = require("../progress");

const cleanUpBadQuizAttempts = async () => {
  try {
    const allQuizAttempts = await QuizAttempt.find().populate({
      path: "article",
      populate: { path: "quiz" },
    });
    console.log("Cleaning up bad quiz attempts...");
    allQuizAttempts.forEach(async (attempt) => {
      if (
        !attempt ||
        !attempt.article ||
        !attempt.article.quiz ||
        !attempt.articleDifficulty
      ) {
        if (attempt instanceof QuizAttempt) {
          await QuizAttempt.deleteOne({ _id: attempt._id });
        }
      }
    });
    console.log("Cleaned up bad quiz attempts.");
    const users = await User.find().populate({
      path: "quizAttempts",
      populate: { path: "article", populate: { path: "quiz" } },
    });
    console.log("Cleaning up bad user quiz attempts...");
    const updateProgress = progressBar(users.length);
    for (let user of users) {
      const quizAttempts = user.quizAttempts;
      for (let attempt of quizAttempts) {
        if (
          !attempt ||
          !attempt.article ||
          !attempt.article.quiz ||
          !attempt.articleDifficulty
        ) {
          console.log("Deleting bad quiz attempt for user: ", user.name);
        }
      }
      updateProgress();
    }
  } catch (error) {
    console.log(error);
  }
};

cleanUpBadQuizAttempts();
