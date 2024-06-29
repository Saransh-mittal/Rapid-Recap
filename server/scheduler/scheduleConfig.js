// scheduleConfig.js
const moment = require("moment-timezone");

// Import all task functions
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
  createSchedule("extractNews1", "02:25", extractNews),
  createSchedule("updateRecommendations", "01:00", updateDailyRecommendations),
  createSchedule("streakBrokenMails", "03:30", sendStreakBrokenMails),
  createSchedule(
    "recommendedNewsNotification1",
    "08:30",
    sendRecommendedNewsNotification
  ),
  createSchedule("extractNews2", "10:25", extractNews),
  createSchedule("streakReminder1", "12:30", () => sendStreakReminder(0)),
  createSchedule(
    "recommendedNewsNotification2",
    "15:42",
    sendRecommendedNewsNotification
  ),
  createSchedule("extractNews3", "18:25", extractNews),
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
