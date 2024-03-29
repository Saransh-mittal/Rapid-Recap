const Article = require("../../model/articleSchema"); // Import the Article model
const Quiz = require("../../model/quizSchema"); // Import the Quiz model

// Function to delete quiz and related records from the Article schema
async function deleteQuizAndRelatedRecordsFromArticle(quizId) {
  try {
    // Find articles referencing the quizId and remove the reference
    console.log("Removing quiz reference from articles...");
    await Article.updateMany({ quiz: quizId }, { $unset: { quiz: 1 } });
    console.log("Quiz reference removed from articles successfully.");
    // Delete the quiz record
    console.log("Deleting the quiz...");
    await Quiz.findByIdAndDelete(quizId);
    console.log(
      "Quiz and related records deleted from Article schema successfully."
    );
  } catch (error) {
    console.error(
      "Error deleting quiz and related records from Article schema:",
      error
    );
  }
}

// Example usage:
const quizIdToDelete = "quiz_id_to_delete";
deleteQuizAndRelatedRecordsFromArticle(quizIdToDelete);
