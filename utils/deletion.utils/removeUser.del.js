const User = require("../../model/userSchema");
const QuizAttempt = require("../../model/quizAttemptSchema");
const DailyIQ = require("../../model/dailyIQSchema");
const Article = require("../../model/articleSchema");

// Function to delete a user and related records
async function deleteUserAndRelatedRecords(userId) {
  try {
    // Delete related QuizAttempts
    console.log("Deleting QuizAttempts for the user...");
    await QuizAttempt.deleteMany({ user: userId });
    console.log("QuizAttempts for the user deleted successfully.");
    // Delete related DailyIQ records
    console.log("Deleting DailyIQ records for the user...");
    await DailyIQ.deleteMany({ user: userId });
    console.log("DailyIQ records for the user deleted successfully.");
    // Delete the user
    console.log("Removing userQuizStatus from articles...");
    await Article.updateMany(
      { "userQuizStatus.userId": userId },
      { $pull: { userQuizStatus: { userId } } }
    );
    console.log("userQuizStatus removed from articles successfully.");
    console.log("Deleting the user...");
    await User.findByIdAndDelete(userId);

    console.log("User and related records deleted successfully.");
  } catch (error) {
    console.error("Error deleting user and related records:", error);
  }
}

// Example usage:
const userIdToDelete = "65f6aa8f6f1f4e5477f1ab27";
deleteUserAndRelatedRecords(userIdToDelete);
