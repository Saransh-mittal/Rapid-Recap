const cron = require("node-cron");
const moment = require("moment-timezone");
const { mailForStreakBroken } = require("../utils/mail.utils");

const currentDate = moment().format("YYYY-MM-DD");
const timeIST = moment.tz(`${currentDate} 03:00`, "Asia/Kolkata"); // Use the current date
const timeUTC = timeIST.clone().tz("UTC");

// Step 2: Convert UTC to local time of the machine
const timeLocal = timeUTC.clone().local();
const localHour = timeLocal.hour();
const localMinute = timeLocal.minute();

// Step 3: Create a cron pattern based on local time
const cronPattern = `${localMinute} ${localHour} * * *`;
cron.schedule(cronPattern, async () => {
  try {
    await mailForStreakBroken();
    console.log("Mails for streak Broken and no logins sent successfully!!");
  } catch (error) {
    console.error(
      "Error sending mails for streak Broken and no logins:",
      error
    );
  }
});

// Ensure the script continues running
console.log("Scheduler started for streak Broken and no logins...");
