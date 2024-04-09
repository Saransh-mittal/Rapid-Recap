// Main function to generate articles, quizzes, and quiz attempts
const generateFakeArticle = require("./generateFakeArticle.test"); // Import generateFakeArticle utility function
const generateFakeUsers = require("./generateFakeUsers.test"); // Import generateFakeUsers utility function
const selectRandomUsers = require("./selectRandomUsers.test"); // Import selectRandomUsers utility function
const generateQuizAttemptsForUsers = require("./generateQuizAttemptsForUsers.test"); // Import generateQuizAttemptsForUsers utility function
const { progressBar } = require("../../utils/progress"); // Import progressBar utility function
async function generateArticlesQuizzesAndQuizAttempts() {
  // Generate 100 fake users
  console.log("\nGenerating fake users...\n");
  const users = await generateFakeUsers();
  console.log("\nFake users generated successfully\n");
  console.log("\nGenerating fake articles and quizzes...\n");
  // Generate articles and quizzes
  // Assuming you have functions to generate articles and quizzes
  const fakeArticles = [];
  const fakeQuizzes = [];
  const updateProgress = progressBar(100);
  for (let i = 0; i < 100; i++) {
    const { fakeArticle, fakeQuiz } = await generateFakeArticle();
    fakeArticles.push(fakeArticle);
    fakeQuizzes.push(fakeQuiz);
    updateProgress();
  }
  console.log("\nFake articles and quizzes generated successfully\n");

  // Generate quiz attempts for selected users
  console.log("\nGenerating quiz attempts for selected users...\n");
  const updateProgress2 = progressBar(100);
  for (let i = 0; i < 100; i++) {
    const count = Math.floor(Math.random() * 30);
    const selectedUsers = selectRandomUsers(users, count);
    await generateQuizAttemptsForUsers(
      selectedUsers,
      fakeArticles[i]._id,
      fakeQuizzes[i]._id
    );
    updateProgress2();
  }
}

module.exports = generateArticlesQuizzesAndQuizAttempts;
