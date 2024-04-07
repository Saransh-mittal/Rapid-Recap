// Controller to delete a quiz attempt of a user

const Article = require("../../model/articleSchema");
const QuizAttempt = require("../../model/quizAttemptSchema");
const User = require("../../model/userSchema");

const deleteQuizAttempt = async (userId, articleId) => {
  try {
    const article = await Article.findById(articleId);
    if (!article) {
      throw new Error("Article not found");
    }
    // make it false;
    const foundStatus = article.userQuizStatus.find(
      (status) => status.userId.toString() === userId && status.status === true
    );
    foundStatus.status = false;
    await article.save();
    console.log("Deleting Quiz Attempt");
    const quizAttempt = await QuizAttempt.findOne({
      user: userId,
      article: articleId,
    });
    if (!quizAttempt) {
      throw new Error("Quiz Attempt not found");
    }
    await QuizAttempt.deleteOne({ _id: quizAttempt._id });
    console.log("Quiz Attempt Deleted Successfully");
    console.log("Removing quiz attempt from user's quizAttempts array");
    const user = await User.findById(userId);
    user.quizAttempts.pull(quizAttempt._id);
    await user.save();
    console.log("Quiz Attempt removed from user's quizAttempts array");
    return;
  } catch (error) {
    console.log(error.message);
  }
};

deleteQuizAttempt("65b1ebbc90ba2e3794e9696d", "6610182a3f9a693aac6ac397");
