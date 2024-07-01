const Article = require("../../model/articleSchema");
const { Recommendation } = require("../../model/recommendationSchema");

const removeUseLessArticle = async (articleId) => {
  try {
    console.log(`Deleting article with id ${articleId}...`);
    await Article.findByIdAndDelete(articleId);
    const recommendationRecords = await Recommendation.find({});
    for (let record of recommendationRecords) {
      record.recommendations = record.recommendations.filter(
        (recommendation) => recommendation._id.toString() !== articleId
      );
      await record.save();
    }
    console.log(`Article with id ${articleId} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting article with id ${articleId}:`, error);
  }
};

removeUseLessArticle("6681573c875c2a20db23e1d5");
