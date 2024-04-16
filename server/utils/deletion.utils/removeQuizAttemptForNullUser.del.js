const QuizAttempt = require("../../model/quizAttemptSchema");

const removeQuizAttemptForNullUser = async () => {
  try {
    const quizAttempts = await QuizAttempt.find({}).populate("user");
    console.log("Quiz attempts fetched successfully");
    const nullUserAttempts = quizAttempts.filter(
      (attempt) => attempt.user === null
    );
    //console.log(nullUserAttempts.length);
    console.log("Null user attempts fetched successfully");
    console.log("Deleting null user attempts...");
    await Promise.all(
      nullUserAttempts.map(async (attempt) => {
        // Ensure 'attempt' is an instance of QuizAttempt
        if (attempt instanceof QuizAttempt) {
          await QuizAttempt.deleteOne({ _id: attempt._id });
        }
      })
    );
    console.log("Null user attempts deleted successfully");
  } catch (error) {
    console.log("Error deleting quiz attempts for null user");
    console.log(error.message);
  }
};
removeQuizAttemptForNullUser();
