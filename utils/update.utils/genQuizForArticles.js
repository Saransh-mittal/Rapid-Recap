const Article = require("../../model/articleSchema");
const { findQuizByLanguage, generateQuestionsForQuiz } = require("../quiz");
const { progressBar } = require("../progress");

const genQuizForArticles = async () => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 3);

  // Construct the aggregation pipeline
  const pipeline = [
    {
      $match: {
        dateTime: {
          $gte: twoDaysAgo.toISOString(), // Find articles with dateTime greater than or equal to two days ago
        },
      },
    },
  ];
  try {
    const articles = await Article.aggregate(pipeline);
    const progress = progressBar(articles.length);
    console.log("\nGenerating quizzes for articles...\n");
    for (let article of articles) {
      const articleId = article._id;
      const { title, author, mainText } = article;
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
      progress();
    }
    console.log("\nQuizzes generated successfully!\n");
  } catch (error) {
    console.log(error);
  }
};

genQuizForArticles();
