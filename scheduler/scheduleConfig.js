const moment = require("moment-timezone");
const extractNews = require("./tasks/extractNews");
const sendRecommendedNewsNotification = require("./tasks/notifForRecommendedNews");
const updateDailyRecommendations = require("./tasks/updateRecommendations");
const resetNewSeasonModal = require("./tasks/newSeasonSevenDays");
const sendStreakBrokenMails = require("./tasks/mailsForStreakBroken");
const sendStreakReminder = require("./tasks/mailsForStreakReminder");
const calculateUserIQScores = require("./tasks/userIQScoreScheduler");

const currentDate = moment().format("YYYY-MM-DD");

const createSchedule = (name, time, task) => ({
  name,
  time: moment.tz(`${currentDate} ${time}`, "Asia/Kolkata"),
  task,
});

let schedules = [
  createSchedule("newSeasonReset", "00:00", resetNewSeasonModal),
  createSchedule("userIQScore", "00:01", calculateUserIQScores),
  createSchedule(
    "recommendedNewsNotification11",
    "20:25",
    sendRecommendedNewsNotification
  ),
  createSchedule(
    "recommendedNewsNotification12",
    "22:25",
    sendRecommendedNewsNotification
  ),
  createSchedule(
    "recommendedNewsNotification1",
    "00:25",
    sendRecommendedNewsNotification
  ),
  createSchedule(
    "recommendedNewsNotification2",
    "02:00",
    sendRecommendedNewsNotification
  ),
  createSchedule("extractNews1", "02:25", () => extractNews("in")),
  createSchedule("extractNews2", "09:00", () => extractNews(null)),
  createSchedule("extractNews3", "15:00", () => extractNews("in")),
  createSchedule("extractNews4", "23:00", () => extractNews(null)),
  createSchedule("updateRecommendations", "01:00", updateDailyRecommendations),
  createSchedule("streakBrokenMails", "03:30", sendStreakBrokenMails),
  createSchedule(
    "recommendedNewsNotification3",
    "04:25",
    sendRecommendedNewsNotification
  ),
  createSchedule(
    "recommendedNewsNotification4",
    "06:25",
    sendRecommendedNewsNotification
  ),
  createSchedule(
    "recommendedNewsNotification5",
    "08:25",
    sendRecommendedNewsNotification
  ),
  createSchedule(
    "recommendedNewsNotification6",
    "10:00",
    sendRecommendedNewsNotification
  ),
  createSchedule("streakReminder1", "12:30", () => sendStreakReminder(0)),
  createSchedule(
    "recommendedNewsNotification7",
    "12:25",
    sendRecommendedNewsNotification
  ),
  createSchedule(
    "recommendedNewsNotification8",
    "14:25",
    sendRecommendedNewsNotification
  ),
  createSchedule(
    "recommendedNewsNotification9",
    "16:25",
    sendRecommendedNewsNotification
  ),
  createSchedule(
    "recommendedNewsNotification10",
    "18:00",
    sendRecommendedNewsNotification
  ),
  createSchedule("streakReminder2", "19:00", () => sendStreakReminder(1)),
  createSchedule("streakReminder3", "22:00", () => sendStreakReminder(2)),
];

// Sort schedules by time
schedules.sort((a, b) => a.time.valueOf() - b.time.valueOf());

// Convert times to cron patterns and add them to each schedule
schedules.forEach((schedule) => {
  const timeUTC = schedule.time.clone().tz("UTC");
  const timeLocal = timeUTC.clone().local();
  schedule.cronPattern = `${timeLocal.minute()} ${timeLocal.hour()} * * *`;
});

module.exports = schedules;
