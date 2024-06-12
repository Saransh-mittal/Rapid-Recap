const {
  getTopArticle,
  getSecondTopArticle,
} = require("../utils/article.utils");
const moment = require("moment-timezone");
const cron = require("node-cron");
const { sendNotification } = require("../services/notificationService");

// Define the notification times in IST
const currentDate = moment().format("YYYY-MM-DD");
const timesIST = [
  moment.tz(`${currentDate} 06:25`, "Asia/Kolkata"),
  moment.tz(`${currentDate} 08:25`, "Asia/Kolkata"),
  moment.tz(`${currentDate} 14:25`, "Asia/Kolkata"),
  moment.tz(`${currentDate} 16:25`, "Asia/Kolkata"),
  moment.tz(`${currentDate} 22:25`, "Asia/Kolkata"),
  moment.tz(`${currentDate} 00:25`, "Asia/Kolkata"),
];

// Convert IST times to UTC
const timesUTC = timesIST.map((time) => time.clone().tz("UTC"));

// Convert UTC to local time of the machine
const timesLocal = timesUTC.map((time) => time.clone().local());
const cronPatterns = timesLocal.map(
  (time) => `${time.minute()} ${time.hour()} * * *`
);

cronPatterns.forEach((cronPattern, index) => {
  cron.schedule(cronPattern, async () => {
    try {
      let article;
      if (index % 2 === 0) {
        article = await getTopArticle();
      } else {
        article = await getSecondTopArticle();
      }

      if (article) {
        const title = article.title;
        const body = article.mainText.slice(0, 150) + "...";
        const url = `https://www.rapidrecap.co.in/article/${article._id}`;
        const image = article.imgURL[0];
        try {
          await sendNotification({ title, body, url, image });
        } catch (error) {
          console.error("Error sending notification:", error);
        }
      } else {
        console.log(
          `No ${
            index % 2 === 0 ? "top" : "second top"
          } article found to send notification.`
        );
      }

      console.log(
        `Notification sent for ${
          index % 2 === 0 ? "top" : "second top"
        } article at scheduled time.`
      );
    } catch (error) {
      console.error("Error fetching article:", error);
    }
  });
});

console.log(
  "Scheduler to send top articles notifications started. Waiting for scheduled times..."
);
