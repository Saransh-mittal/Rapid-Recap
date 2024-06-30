const { extractNewsUtilityFunc } = require("../../utils/article.utils");
const { sendNotification } = require("../../services/notificationService");

async function extractNews() {
  try {
    const { result, articlesSavedPerCategory, notificationCategories } =
      await extractNewsUtilityFunc();
    if (result.length > 0) {
      const title = `📢 New ${notificationCategories} Content Alert! 📰`;
      const body =
        "Exciting news just in! Explore our latest articles and breaking news updates to stay ahead of the curve. Tap to discover now!";
      const url = "https://www.rapidrecap.co.in/";
      try {
        await sendNotification({ title, body, url });
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
    console.log(`No. of news fetched for DB : ${result.length}`);
    console.log(articlesSavedPerCategory);
    console.log("News extracted successfully at scheduled times!");
  } catch (error) {
    console.error("Error extracting news:", error);
  }
}

module.exports = extractNews;
