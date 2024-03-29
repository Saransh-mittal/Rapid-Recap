// Function to generate quiz attempts for selected users
const QuizAttempt = require("../../model/quizAttemptSchema"); // Import QuizAttempt model
const User = require("../../model/userSchema"); // Import User model
async function generateQuizAttemptsForUsers(users, articleId, quizId) {
  for (const user of users) {
    const fakeQuizAttempt = new QuizAttempt({
      user: user._id,
      article: articleId,
      responses: [], // Add quiz responses as needed
      RQM_score: (Math.random() * 300).toFixed(0),
      articleDifficulty: (Math.random() * 0.9 + 0.1).toFixed(1),
      userPercentile: (Math.random() * 100).toFixed(2),
    });
    await fakeQuizAttempt.save();
    user.quizAttempts.push(fakeQuizAttempt._id);
    if (fakeQuizAttempt.articleDifficulty < 0.4) user.easyQuizCount++;
    else if (fakeQuizAttempt.articleDifficulty < 0.7) user.mediumQuizCount++;
    else user.hardQuizCount++;
    await user.save();
  }
}

module.exports = generateQuizAttemptsForUsers;
