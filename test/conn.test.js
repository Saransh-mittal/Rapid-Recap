const mongoose = require("mongoose");
const DB =
  "mongodb+srv://rapidrecap2k23:rapidrecap2k23@test.e3opspf.mongodb.net/";
// const Article = require("../model/articleSchema");
// const articlesData = require("../ArticleHealthData.json");

mongoose
  .connect(DB)
  .then(() => {
    console.log(`connection successful`);
  })
  .catch((err) => {
    console.log(`connection unsuccessful`);
  });

// async function saveArticlesToDB() {
//   try {
//     for (const articleData of articlesData) {
//       const article = new Article(articleData);
//       await article.save();
//       console.log(`Article saved: ${article.title}`);
//     }
//     console.log("All articles saved successfully!");
//   } catch (error) {
//     console.error("Error saving articles:", error);
//   }
// }

// // Call the function to save articles to the database
// saveArticlesToDB();
