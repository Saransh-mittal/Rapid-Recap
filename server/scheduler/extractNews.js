const cron = require("node-cron");
const { extractNewsUtilityFunc } = require("../utils/article.utils");
const moment = require("moment-timezone");
const { sendNotification } = require("../services/notificationService");

const currentDate = moment().format("YYYY-MM-DD");
const timesIST = [
  moment.tz(`${currentDate} 02:25`, "Asia/Kolkata"),
  moment.tz(`${currentDate} 10:25`, "Asia/Kolkata"), // 8 AM IST
  moment.tz(`${currentDate} 18:25`, "Asia/Kolkata"), // 4 PM IST
];

const timesUTC = timesIST.map((time) => time.clone().tz("UTC"));

// Convert UTC to local time of the machine
const timesLocal = timesUTC.map((time) => time.clone().local());
const cronPatterns = timesLocal.map(
  (time) => `${time.minute()} ${time.hour()} * * *`
);

cronPatterns.forEach((cronPattern) => {
  cron.schedule(cronPattern, async () => {
    try {
      const { result, articlesSavedPerCategory } =
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
  });
});

console.log(
  "Scheduler to extract news started. Waiting for scheduled times..."
);
