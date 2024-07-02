const { extractNewsUtilityFunc } = require("../../utils/article.utils");
const { sendNotification } = require("../../services/notificationService");

async function extractNews() {
  try {
    const { result, articlesSavedPerCategory, notificationCategories } =
      await extractNewsUtilityFunc();

    console.log(`No. of news fetched for DB : ${result.length}`);
    console.log(articlesSavedPerCategory);
    console.log("News extracted successfully at scheduled times!");
  } catch (error) {
    console.error("Error extracting news:", error);
  }
}

module.exports = extractNews;
