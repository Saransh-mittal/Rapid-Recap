const Article = require("../../model/articleSchema");
const { hindiConverter } = require("../article");
const { progressBar } = require("../progress");

const generateHindiTrans = async () => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 5);

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
    console.log("\nTotal articles in last 5 days: ", articles.length);
    console.log("\nGenerating Hindi translations for articles...\n");
    for (let art of articles) {
      if (art.hindiTitle === "" || !art.hindiTitle) {
        //console.log("hii");
        try {
          if (art._id.toString() === "6620214df46b052bfa8e4337") continue;
          const response = await hindiConverter(art);
          const article = await Article.findById(art._id);
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
        } catch (error) {
          console.log(`Error processing article ${art._id}: ${error}`);
          continue; // Skip to the next iteration
        }
      }
      progress();
    }
    console.log("\nHindi translations generated successfully!\n");
  } catch (error) {
    console.log(error);
  }
};

generateHindiTrans();
