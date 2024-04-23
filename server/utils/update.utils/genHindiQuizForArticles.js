const Article = require("../../model/articleSchema");
const {
  findQuizByLanguage,
  generateQuestionsForHindiQuiz,
} = require("../quiz");
const { progressBar } = require("../progress");

const genHindiQuizForArticles = async () => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

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
    console.log("\nGenerating Hindi quizzes for articles...\n");
    for (let article of articles) {
      try {
        const articleId = article._id;
        const { hindiTitle, hindiAuthor, hindiMainText } = article;
        if (!hindiTitle || !hindiAuthor || !hindiMainText) {
          continue;
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

genHindiQuizForArticles();
