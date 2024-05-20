// Controller to delete a quiz attempt of a user

const Article = require("../../model/articleSchema");
const QuinBoost = require("../../model/quinBoostSchema");
const QuizAttempt = require("../../model/quizAttemptSchema");
const User = require("../../model/userSchema");

const deleteQuizAttempt = async (inGameName, articleId) => {
  try {
    const article = await Article.findById(articleId);
    const user = await User.findOne({ inGameName });
    const userId = user._id.toString();
    if (!article) {
      throw new Error("Article not found");
    }
    // make it false;
    const foundStatus = article.userQuizStatus.find(
      (status) => status.userId.toString() === userId && status.status === true
    );
    if (foundStatus && foundStatus.status) foundStatus.status = false;
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

    user.quizAttempts.pull(quizAttempt._id);
    await user.save();
    console.log("Quiz Attempt removed from user's quizAttempts array");
    return;
  } catch (error) {
    console.log(error);
  }
};

deleteQuizAttempt("saransh_1234", "664aa1f7680a44e232808c2d");
