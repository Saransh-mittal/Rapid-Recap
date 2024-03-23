const Article = require("../model/articleSchema");
const Quiz = require("../model/quizSchema");
const {
  genQuiz,
  generateQuestionsForQuiz,
  updatePercentilesOnQuizDeactivation,
} = require("../utils/quiz");
const { breakArticleIntoParagraphs } = require("../utils/article");
const NewsAPI = require("newsapi");

const allArticles = async (req, res) => {
  const { page = 1, pageSize = 9 } = req.query;
  try {
    const article = await Article.find({})
      .sort({
        dateTime: -1,
        "sentiments.compound": -1,
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    if (!article) {
      throw new Error("No articles found");
    }
    res.send(article);
  } catch (error) {
    res.status(400).json({ error: error.message || "Something went wrong" });
    console.log(error.message);
  }
};

const getArticle = async (req, res) => {
  const { id } = req.params;
  try {
    const article = await Article.findById(id);
    if (!article) {
      res.status(422).json({ error: "Article not found" });
      throw new Error("Article not found");
    }
    const paragraphs = await breakArticleIntoParagraphs(article.mainText);
    //console.log(paragraphs);
    //article.mainText = paragraphs;
    const newArticle = {
      title: article.title,
      mainText: paragraphs,
      author: article.author,
      imgURL: article.imgURL[0],
      _id: article._id,
    };
    //console.log(newArticle);
    let quizExpired = false;
    if (article.quiz) {
      const quizId = article.quiz;
      const fullQuiz = await Quiz.findById(quizId);
      if (!fullQuiz) {
        article.quiz = null;
        await article.save();
        throw new Error("Quiz not found, Please try again.");
      }
      //console.log(fullQuiz.createdAt.getTime() + 24 * 60 * 60 * 1000);
      // if (fullQuiz.createdAt.getTime() + 24 * 60 * 60 * 1000 < Date.now()) {
      //   //console.log("quiz expired");
      //   //console.log(fullQuiz);
      //   if (fullQuiz.isActive) {
      //     //console.log("deactivating quiz");
      //     await updatePercentilesOnQuizDeactivation({ id: article._id });
      //     fullQuiz.isActive = false;
      //     await fullQuiz.save();
      //   }
      //   quizExpired = true;
      // }
    }
    //console.log(article.mainText);
    //console.log(article);
    res.status(201).send({ quizExpired, newArticle });
  } catch (error) {
    res.status(400).json({ error: error.message || "Something went wrong" });
    console.log(error.message);
  }
};

const getQuiz = async (req, res) => {
  const { articleId } = req.params;
  //console.log(articleId);
  try {
    if (!articleId) {
      throw new Error("No article provided");
    }
    const article = await Article.findById(articleId);
    if (!article) {
      throw new Error("Article not found");
    }
    //console.log(article);

    const { title, author, mainText } = article;
    //console.log(title, author, mainText);
    if (!title || !mainText) {
      throw new Error("Please provide all the details");
    }
    if (article.quiz) {
      const quizId = article.quiz;
      const fullQuiz = await Quiz.findById(quizId);
      if (!fullQuiz) {
        article.quiz = null;
        await article.save();
        throw new Error("Quiz not found, Please try again.");
      }
      // if (fullQuiz.createdAt.getTime() + 24 * 60 * 60 * 1000 < Date.now()) {
      //   if (fullQuiz.isActive) {
      //     await updatePercentilesOnQuizDeactivation({ id: article._id });
      //     fullQuiz.isActive = false;
      //     await fullQuiz.save();
      //   }
      //   return res.status(200).json({ expired: true, message: "Quiz expired" });
      // }
      return res.status(200).json({
        expired: false,
        message: "Quiz Questions generated successfully",
      });
    }
    const response = await generateQuestionsForQuiz({
      title,
      author,
      mainText,
    });
    //console.log(response);
    const newQuiz = new Quiz({
      article: articleId,
      para1: response.para1,
      para2: response.para2,
      para3: response.para3,
      overAllDifficulty: response.overAllDifficulty,
    });
    await newQuiz.save();
    article.quiz = newQuiz._id;
    await article.save();
    res.status(200).json({ message: "Quiz Questions generated successfully" });
  } catch (error) {
    res.status(400).json({ error: "Something went wrong! Please try again" });
    console.log(error.message);
  }
};

const startQuiz = async (req, res) => {
  const { articleId } = req.params;
  const userId = req.user._id;
  //console.log(userId);
  try {
    if (!articleId) {
      throw new Error("No article provided");
    }
    const article = await Article.findById(articleId);
    if (!article) {
      throw new Error("Article not found");
    }
    const { title } = article;
    if (
      article.userQuizStatus.find(
        (status) =>
          status.userId.toString() === userId && status.status === true
      )
    ) {
      throw new Error("Quiz already started");
    }
    if (article.quiz) {
      const quizId = article.quiz;
      const fullQuiz = await Quiz.findById(quizId);
      if (!fullQuiz) {
        article.quiz = null;
        await article.save();
        throw new Error("Quiz not found, Please try again.");
      }
      const quiz = genQuiz({ fullQuiz, title });
      if (quiz.questions.length <= 2) {
        throw new Error("Article is too short for a quiz");
      }
      article.userQuizStatus.push({ userId, status: true });
      await article.save();
      res.status(200).send(quiz);
      return;
    } else {
      throw new Error("Quiz not found, Please try again.");
    }
  } catch (error) {
    res.status(400).json({ error: error.message || "Something went wrong" });
    console.log(error.message);
  }
};

const getArticleQuizStatus = async (req, res) => {
  const { articleId } = req.params;
  const userId = req.user._id;
  try {
    const article = await Article.findById(articleId);
    if (!article) {
      throw new Error("Article not found");
    }
    const userStatus = article.userQuizStatus.find(
      (status) => status.userId.toString() === userId
    );
    if (!userStatus) {
      throw new Error("User not found");
    }
    res.status(200).json({ status: userStatus.status });
  } catch (error) {
    res.status(400).json({ error: error.message || "Something went wrong" });
    console.log(error);
  }
};

// const testNewsApi = async (req, res) => {
//   const newsapi = new NewsAPI("fb29cd0efb7e4ed292134d083f457869");
//   try {
//     const response = await newsapi.v2.topHeadlines({
//       category: "entertainment",
//       language: "en",
//     });
//     //console.log(response.articles[1]);
//     res.status(200).json(response);
//   } catch (error) {
//     console.log(error);
//   }
// };

module.exports = {
  allArticles,
  getArticle,
  getQuiz,
  getArticleQuizStatus,
  startQuiz,
  //testNewsApi,
};
