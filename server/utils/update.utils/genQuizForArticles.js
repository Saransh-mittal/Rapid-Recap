const Article = require("../../model/articleSchema");
const {
  findQuizByLanguage,
  generateQuestionsForQuiz,
} = require("../quiz.utils");
const { progressBar } = require("../progress.utils");

const genQuizForArticles = async (articles) => {
  // const twoDaysAgo = new Date();
  // twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // // Construct the aggregation pipeline
  // const pipeline = [
  //   {
  //     $match: {
  //       dateTime: {
  //         $gte: twoDaysAgo.toISOString(), // Find articles with dateTime greater than or equal to two days ago
  //       },
  //     },
  //   },
  // ];
  try {
    //const articles = await Article.aggregate(pipeline);

    if (articles.length === 0) {
      console.log("No articles found to generate quizzes for.");
      return;
    }

    const progress = progressBar(articles.length);
    console.log("\nGenerating quizzes for articles...\n");
    for (let article of articles) {
      try {
        const articleId = article._id;
        let fullQuiz;
        const { title, author, mainText } = article;
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
      } catch (error) {
        console.log(`Error processing article ${article._id}: ${error}`);
      } finally {
        progress();
      }
    }
    console.log("\nQuizzes generated successfully!\n");
  } catch (error) {
    console.log(error);
  }
};

module.exports = genQuizForArticles;
