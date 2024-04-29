const Article = require("../model/articleSchema");
const Quiz = require("../model/quizSchema");
const QuizAttempt = require("../model/quizAttemptSchema");
const {
  genQuiz,
  generateQuestionsForQuiz,
  generateQuestionsForHindiQuiz,
  findQuizByLanguage,
} = require("../utils/quiz");
const {
  breakArticleIntoParagraphs,
  hindiConverter,
  fetchNews,
  processNews,
  extractNewsFromLink,
  processExtractedNews,
} = require("../utils/article");
const NewsAPI = require("newsapi");
const { sendNotification } = require("../services/notificationService");
const genQuizForArticles = require("../utils/update.utils/genQuizForArticles");
const genHindiQuizForArticles = require("../utils/update.utils/genHindiQuizForArticles");
const generateHindiTrans = require("../utils/update.utils/generateHindiTrans.update");

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
    const queries = [
      "source-countries=in&text=IPL OR T20WorldCup",
      "source-countries=in&text=elections OR dhruv OR rathee OR Modi OR ashok OR gehlot",
      "text=Ramayan OR pakistani OR gandi OR krishna OR astrology",
    ];

    let allProcessedOutput = [];

    for (let query of queries) {
      const news = await fetchNews(query);

      if (news.length === 0) {
        console.log("No news articles found for query:", query);
        continue;
      }

      console.log("\nProcessing news articles for query:", query, "\n");

      const processedOutput = await processNews(news);

      console.log(
        "\nNews articles processed successfully for query:",
        query,
        "\n"
      );
      allProcessedOutput = allProcessedOutput.concat(processedOutput);
    }
    let genCnt = 0;
    let entCnt = 0;
    let techCnt = 0;
    let sportsCnt = 0;
    let scienceCnt = 0;
    let healthCnt = 0;
    let busiCnt = 0;

    for (let article of allProcessedOutput) {
      if (article.category.toLowerCase() === "general") genCnt++;
      if (article.category.toLowerCase() === "entertainment") entCnt++;
      if (article.category.toLowerCase() === "technology") techCnt++;
      if (article.category.toLowerCase() === "sports") sportsCnt++;
      if (article.category.toLowerCase() === "science") scienceCnt++;
      if (article.category.toLowerCase() === "health") healthCnt++;
      if (article.category.toLowerCase() === "business") busiCnt++;
    }
    res.status(200).json({
      message: `No. of news fetched for DB : ${allProcessedOutput.length}\n General : ${genCnt}\n Entertainment : ${entCnt}\n Technology : ${techCnt}\n Sports : ${sportsCnt}\n Science : ${scienceCnt}\n Health : ${healthCnt}\n Business : ${busiCnt}`,
    });
    // send notification to all users
    const title = "📢 New Content Alert! 📰";
    const body =
      "Exciting news just in! Explore our latest articles and breaking news updates to stay ahead of the curve. Tap to discover now!";
    const url = "https://cyan-crane-tie.cyclic.app/";
    sendNotification({ title, body, url });
  } catch (error) {
    res.status(500).json({ error: error.message || "Something went wrong" });
    console.log(error);
  }
};

const extractNews = async (req, res) => {
  const newsapi = new NewsAPI("fb29cd0efb7e4ed292134d083f457869");
  const apiKeys = [
    "7170746b5aa044069fbd5f48e74817ac",
    "acd1bf365a084183b509789e0aae202a",
    "a46513e934b14f44a9fa2137185f5438",
    "7e4a7d41a3ed463a952349bfb07b1452",
    "e7409124fe384b688c07763501b270dd",
  ];
  const categories = [
    // "general",
    // "sports",
    "health",
    // "science",
    // "business",
    // "technology",
    // "entertainment",
  ];
  const requestsPerKey = 30;
  let currentKeyIndex = 0;
  let requestsMadeWithCurrentKey = 0;

  try {
    let result = [];
    let notificationCategories = categories.join(", ");

    for (let category of categories) {
      console.log(`\nExtracting news of category ${category}\n`);
      const response = await newsapi.v2.topHeadlines({
        category,
        language: "en",
        country: "in",
      });

      const articles = JSON.parse(JSON.stringify(response.articles));
      console.log(articles.length);
      let allProcessedOutput = [];

      for (let article of articles) {
        try {
          if (requestsMadeWithCurrentKey >= requestsPerKey) {
            // If requests limit reached, switch to the next API key
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
            requestsMadeWithCurrentKey = 0;
          }

          const apiKey = apiKeys[currentKeyIndex];
          const extractedNews = await extractNewsFromLink(article.url, apiKey);
          allProcessedOutput.push(extractedNews);

          requestsMadeWithCurrentKey++;
        } catch (error) {
          console.log(
            `Error extracting news from article ${article.title}: ${error}`
          );
        }
      }

      const AiProcessedNews = await processExtractedNews(
        allProcessedOutput,
        category
      );

      await genQuizForArticles(AiProcessedNews);
      await generateHindiTrans(AiProcessedNews);
      await genHindiQuizForArticles(AiProcessedNews);
      // push content of AiProcessedNews in result
      result = result.concat(AiProcessedNews);
    }

    res.status(200).json({
      message: `No. of news fetched for DB : ${result.length}`,
    });

    if (result.length > 0) {
      const title = `📢 New ${notificationCategories} Content Alert! 📰`;
      const body =
        "Exciting news just in! Explore our latest articles and breaking news updates to stay ahead of the curve. Tap to discover now!";
      const url = "https://cyan-crane-tie.cyclic.app/";
      sendNotification({ title, body, url });
    }
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
  extractNews,
  //testNewsApi,
};
