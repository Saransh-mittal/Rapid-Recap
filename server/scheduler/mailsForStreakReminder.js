const cron = require("node-cron");
const moment = require("moment-timezone");
const MailTemplates = require("../data/MailTemplates"); // Import the mail templates
const { mailForMaintainStreakReminder } = require("../utils/mail.utils");

const createCronPattern = (hour, minute) => {
  const currentDate = moment().format("YYYY-MM-DD");
  const timeIST = moment.tz(`${currentDate} ${hour}:${minute}`, "Asia/Kolkata"); // Use the current date
  const timeUTC = timeIST.clone().tz("UTC");
  const timeLocal = timeUTC.clone().local();
  const localHour = timeLocal.hour();
  const localMinute = timeLocal.minute();
  return `${localMinute} ${localHour} * * *`;
};

// Schedule for 12:30 PM IST
const cronPatternFor1230PMIST = createCronPattern("12", "30");
cron.schedule(cronPatternFor1230PMIST, async () => {
  try {
    await mailForMaintainStreakReminder({
      template: MailTemplates.streakMaintainReminder1,
    });
    console.log("Mails for 12:30 PM streak reminders sent successfully!!");
  } catch (error) {
    console.error("Error sending mails for 12:30 PM streak reminders:", error);
  }
});

// Schedule for 7:00 PM IST
const cronPatternFor7PMIST = createCronPattern("19", "00");
cron.schedule(cronPatternFor7PMIST, async () => {
  try {
    await mailForMaintainStreakReminder({
      template: MailTemplates.streakMaintainReminder2,
    });
    console.log("Mails for 7:00 PM streak reminders sent successfully!!");
  } catch (error) {
    console.error("Error sending mails for 7:00 PM streak reminders:", error);
  }
});

// Schedule for 10:00 PM IST
const cronPatternFor10PMIST = createCronPattern("22", "00");
cron.schedule(cronPatternFor10PMIST, async () => {
  try {
    await mailForMaintainStreakReminder({
      template: MailTemplates.streakMaintainReminder3,
    });
    console.log("Mails for 10:00 PM streak reminders sent successfully!!");
  } catch (error) {
    console.error("Error sending mails for 10:00 PM streak reminders:", error);
  }
});

// Ensure the script continues running
console.log("Scheduler started for streak reminders...");
