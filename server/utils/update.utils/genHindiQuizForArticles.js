const Article = require("../../model/articleSchema");
const {
  findQuizByLanguage,
  generateQuestionsForHindiQuiz,
} = require("../quiz.utils");
const { progressBar } = require("../progress.utils");

const genHindiQuizForArticles = async (articles) => {
  // const twoDaysAgo = new Date();
  // twoDaysAgo.setDate(twoDaysAgo.getDate() - 3);

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
    const progress = progressBar(articles.length);
    console.log("\nGenerating Hindi quizzes for articles...\n");
    for (let article of articles) {
      try {
        const articleId = article._id;
        const art = await Article.findById(articleId);
        const { hindiTitle, hindiAuthor, hindiMainText } = art;
        if (!hindiTitle || !hindiAuthor || !hindiMainText) {
          continue;
        }
        let fullQuiz;
        if (art.quiz && art.quiz.length > 0) {
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
      } catch (error) {
        console.log(`Error processing article ${article._id}: ${error}`);
      }

      progress();
    }
    console.log("\nHindi quizzes generated successfully!\n");
  } catch (error) {
    console.log(error);
  }
};

module.exports = genHindiQuizForArticles;
