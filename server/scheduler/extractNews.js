const cron = require("node-cron");
const { extractNewsUtilityFunc } = require("../utils/article.utils");

cron.schedule("0 2 * * *", async () => {
  try {
    // Call your function here
    const { result, articlesSavedPerCategory } = await extractNewsUtilityFunc();
    console.log(`No. of news fetched for DB : ${result.length}`);
    console.log(articlesSavedPerCategory);
    console.log("News extracted successfully at midnight!");
  } catch (error) {
    console.error("Error extracting news:", error);
  }
});

// Ensure the script continues running
console.log("Scheduler to extract news started. Waiting for midnight...");
