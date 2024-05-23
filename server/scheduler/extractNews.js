const cron = require("node-cron");
const { extractNewsUtilityFunc } = require("../utils/article.utils");
const moment = require("moment-timezone");

const currentDate = moment().format("YYYY-MM-DD");
const timeIST = moment.tz(`${currentDate} 11:10`, "Asia/Kolkata"); // Use the current date
const timeUTC = timeIST.clone().tz("UTC");

// Step 2: Convert UTC to local time of the machine
const timeLocal = timeUTC.clone().local();
const localHour = timeLocal.hour();
const localMinute = timeLocal.minute();

// Step 3: Create a cron pattern based on local time
const cronPattern = `${localMinute} ${localHour} * * *`;

cron.schedule(cronPattern, async () => {
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
