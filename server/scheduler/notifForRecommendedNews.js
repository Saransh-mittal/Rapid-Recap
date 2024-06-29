// notifForRecommendedNews.js

const cron = require("node-cron");
const moment = require("moment-timezone");
const { sendNotification } = require("../services/notificationService");
const {
  getRecommendationsForNotification,
} = require("../services/recommendationService");
const User = require("../model/userSchema");
const Recommendation = require("../model/recommendationSchema");
const Article = require("../model/articleSchema");

// Define the notification times in IST
const currentDate = moment().format("YYYY-MM-DD");
const timesIST = [
  moment.tz(`${currentDate} 08:30`, "Asia/Kolkata"),
  moment.tz(`${currentDate} 16:30`, "Asia/Kolkata"),
];

// Convert IST times to UTC
const timesUTC = timesIST.map((time) => time.clone().tz("UTC"));

// Convert UTC to local time of the machine
const timesLocal = timesUTC.map((time) => time.clone().local());
const cronPatterns = timesLocal.map(
  (time) => `${time.minute()} ${time.hour()} * * *`
);

async function sendRecommendedNewsNotification(userId) {
  try {
    const recommendation = await getRecommendationsForNotification(userId, 20); // Get from top 20 recommendations

    if (recommendation) {
      const article = await Article.findById(recommendation._id);
      if (!article) {
        console.log(
          `Article not found for recommendation: ${recommendation._id}`
        );
        return;
      }

      const title = article.title;
      const body = `Check out this recommended article in the ${article.category} category.`;
      const url = `https://www.rapidrecap.co.in/article/${article._id}`;
      const image =
        article.imgURL && article.imgURL.length > 0 ? article.imgURL[0] : null;

      await sendNotification({ userId, title, body, url, image });

      console.log(
        `Notification sent for recommended article to user ${userId}`
      );
    } else {
      console.log(`No new recommendations found for user ${userId}`);
    }
  } catch (error) {
    console.error(
      `Error sending recommendation notification for user ${userId}:`,
      error
    );
  }
}

async function processAllUsers() {
  try {
    const users = await User.find({}, "_id");

    for (const user of users) {
      await sendRecommendedNewsNotification(user._id);
    }

    console.log("Processed recommendations for all users");
  } catch (error) {
    console.error("Error processing users for recommendations:", error);
  }
}

cronPatterns.forEach((cronPattern) => {
  cron.schedule(cronPattern, processAllUsers);
});

console.log(
  "Scheduler to send recommended news notifications started. Waiting for scheduled times..."
);
