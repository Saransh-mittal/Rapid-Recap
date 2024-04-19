const Quiz = require("../../model/quizSchema");
const { progressBar } = require("../progress");

async function updateQuizzes() {
  try {
    // Find all documents where language is not already set
    const quizzesToUpdate = await Quiz.find({ language: { $exists: false } });
    const progress = progressBar(quizzesToUpdate.length);
    // Iterate through each document and update language to "en"
    for (let i = 0; i < quizzesToUpdate.length; i++) {
      const quiz = quizzesToUpdate[i];
      quiz.language = "en";
      await quiz.save();
      progress();
    }

    console.log("Quizzes updated successfully.");
  } catch (error) {
    console.error("Error updating quizzes:", error);
  }
}

updateQuizzes();
