const Article = require("../model/articleSchema");
const Quiz = require("../model/quizSchema");
const QuizAttempt = require("../model/quizAttemptSchema");
const {
  genQuiz,
  generateQuestionsForQuiz,
  updatePercentilesOnQuizDeactivation,
  generateQuestionsForHindiQuiz,
  findQuizByLanguage,
} = require("../utils/quiz");
const {
  breakArticleIntoParagraphs,
  hindiConverter,
  getWorldNewsApi,
} = require("../utils/article");
const NewsAPI = require("newsapi");
const { progressBar } = require("../utils/progress");

const allArticles = async (req, res) => {
  const { page = 1, pageSize = 9, category = "general" } = req.query;
  //console.log(page, pageSize, category);
  try {
    const article = await Article.find({
      category: { $regex: new RegExp("^" + category, "i") },
    })
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
      category: article.category,
      title: article.title,
      mainText: paragraphs,
      author: article.author,
      imgURL: article.imgURL[0],
      hindiTitle: article?.hindiTitle,
      hindiMainText: article?.hindiMainText,
      hindiAuthor: article?.hindiAuthor,
      _id: article._id,
    };
    //console.log(newArticle);
    let quizExpired = false;
    // if (article.quiz) {
    //   const quizId = article.quiz;
    //   const fullQuiz = await Quiz.findById(quizId);
    //   if (!fullQuiz) {
    //     article.quiz = null;
    //     await article.save();
    //     throw new Error("Quiz not found, Please try again.");
    //   }
    //   //console.log(fullQuiz.createdAt.getTime() + 24 * 60 * 60 * 1000);
    //   // if (fullQuiz.createdAt.getTime() + 24 * 60 * 60 * 1000 < Date.now()) {
    //   //   //console.log("quiz expired");
    //   //   //console.log(fullQuiz);
    //   //   if (fullQuiz.isActive) {
    //   //     //console.log("deactivating quiz");
    //   //     await updatePercentilesOnQuizDeactivation({ id: article._id });
    //   //     fullQuiz.isActive = false;
    //   //     await fullQuiz.save();
    //   //   }
    //   //   quizExpired = true;
    //   // }
    // }
    const totalUsersGivenQuiz = await QuizAttempt.find({
      article: article._id,
    }).countDocuments();
    res.status(201).send({ quizExpired, newArticle, totalUsersGivenQuiz });
  } catch (error) {
    res.status(400).json({ error: error.message || "Something went wrong" });
    console.log(error.message);
  }
};

const getQuiz = async (req, res) => {
  const { articleId } = req.params;
  const userId = req.user._id;
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
    if (
      article.userQuizStatus.find(
        (status) =>
          status.userId.toString() === userId && status.status === true
      )
    ) {
      throw new Error("Quiz already started");
    }
    let fullQuiz;
    if (article.quiz && article.quiz.length > 0) {
      fullQuiz = await findQuizByLanguage({
        language: "en",
        articleId,
      });
      if (!fullQuiz) {
        fullQuiz = await generateQuestionsForQuiz({
          title,
          author,
          mainText,
          articleId,
        });
      }
    } else {
      fullQuiz = await generateQuestionsForQuiz({
        title,
        author,
        mainText,
        articleId,
      });
    }
    const timer =
      Math.min(
        5,
        fullQuiz.para1.questions.length +
          fullQuiz.para2.questions.length +
          fullQuiz.para3.questions.length
      ) * 10;
    const quiz = await genQuiz({ fullQuiz, title });
    if (quiz.questions.length <= 2) {
      throw new Error("Article is too short for a quiz");
    }
    return res.status(200).json({
      expired: false,
      message: "Quiz Questions generated successfully",
      timer,
      quiz,
      quizId: fullQuiz._id,
    });
  } catch (error) {
    res.status(400).json({ error: "Something went wrong! Please try again" });
    console.log(error);
  }
};

const getHindiQuiz = async (req, res) => {
  const { articleId } = req.params;
  const userId = req.user._id;
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

    const { hindiTitle, hindiAuthor, hindiMainText } = article;
    //console.log(title, author, mainText);
    if (!hindiTitle || !hindiMainText || !hindiAuthor) {
      throw new Error("Please the select the hindi article first");
    }
    if (
      article.userQuizStatus.find(
        (status) =>
          status.userId.toString() === userId && status.status === true
      )
    ) {
      throw new Error("Quiz already started");
    }
    let fullQuiz;
    if (article.quiz && article.quiz.length > 0) {
      fullQuiz = await findQuizByLanguage({
        language: "hi",
        articleId,
      });
      if (!fullQuiz) {
        fullQuiz = await generateQuestionsForHindiQuiz({
          title: hindiTitle,
          author: hindiAuthor,
          mainText: hindiMainText,
          articleId,
        });
      }

      // Now you have a valid fullQuiz
      // Proceed with your code...
    } else {
      fullQuiz = await generateQuestionsForHindiQuiz({
        title: hindiTitle,
        author: hindiAuthor,
        mainText: hindiMainText,
        articleId,
      });
    }
    const timer =
      Math.min(
        5,
        fullQuiz.para1.questions.length +
          fullQuiz.para2.questions.length +
          fullQuiz.para3.questions.length
      ) * 10;
    const quiz = await genQuiz({ fullQuiz, title: hindiTitle });
    if (quiz.questions.length <= 2) {
      throw new Error("Article is too short for a quiz");
    }

    return res.status(200).json({
      expired: false,
      message: "Quiz Questions generated successfully",
      timer,
      quiz,
      quizId: fullQuiz._id,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Something went wrong! Please try again",
    });
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
    if (
      article.userQuizStatus.find(
        (status) =>
          status.userId.toString() === userId && status.status === true
      )
    ) {
      throw new Error("Quiz already started");
    }
    article.userQuizStatus.push({ userId, status: true });
    await article.save();
    res.status(200).json({ message: "Quiz started successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message || "Something went wrong" });
    console.log(error);
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
      return res.status(200).json({ status: false });
    }
    res.status(200).json({ status: userStatus.status });
  } catch (error) {
    res.status(400).json({ error: error.message || "Something went wrong" });
    console.log(error);
  }
};

const getTopRankers = async (req, res) => {
  const { articleId } = req.query;
  try {
    const quizAttempts = await QuizAttempt.find({ article: articleId })
      .sort({ RQM_score: -1 })
      .limit(3)
      .populate({
        path: "user",
        select: "name inGameName IQ_score maxIQScore", // Specify the fields you want to select
      });

    const rankers = [];
    let rank = 1;
    quizAttempts.forEach((attempt, index) => {
      //console.log(attempt);
      if (!attempt.user) {
        return;
      }
      rankers.push({
        rank: rank,
        name: attempt.user.name,
        inGameName: attempt.user.inGameName,
        IQ_score: attempt.user.IQ_score,
        maxIQScore: attempt.user.maxIQScore,
      });
      rank++;
    });
    res.status(200).json({ rankers });
  } catch (error) {
    res.status(500).json({ error: error.message || "Something went wrong" });
    console.log(error);
  }
};

const hindiTranslation = async (req, res) => {
  const { articleId } = req.params;
  try {
    const article = await Article.findById(articleId);
    if (!article) {
      throw new Error("Article not found");
    }
    const response = await hindiConverter(article);
    if (!article.hindiMainText) {
      article.hindiMainText = [];
      await article.save();
    }
    article.hindiTitle = response.hindiTitle;

    for (let key in response.hindiMainText) {
      if (!response.hindiMainText[key]) continue;
      article.hindiMainText.push(response.hindiMainText[key]);
    }
    article.hindiAuthor = response.hindiAuthor;
    await article.save();
    res.status(200).json({ status: "ok", article });
  } catch (error) {
    res.status(500).json({ error: error.message || "Something went wrong" });
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

const getWorldNews = async (req, res) => {
  try {
    const response = await getWorldNewsApi();
    console.log(response.length);
    console.log("\nSaving World news in DB\n");
    //const updateProgress = progressBar(response.length);
    // for (let article of response) {
    //   try {
    //     const isArticle = await Article.findOne({
    //       title: article.title,
    //       author: article.author,
    //     });
    //     if (isArticle) continue;
    //     const newArticle = new Article({ article });
    //     await newArticle.save();
    //   } catch (error) {
    //     console.log(error);
    //   }

    //   updateProgress();
    // }
    res.status(200).json({ message: "World News fetched successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Something went wrong" });
    console.log(error);
  }
};

module.exports = {
  allArticles,
  getArticle,
  getQuiz,
  getArticleQuizStatus,
  startQuiz,
  getTopRankers,
  hindiTranslation,
  getHindiQuiz,
  getWorldNews,
  //testNewsApi,
};
