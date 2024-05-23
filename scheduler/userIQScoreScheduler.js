const cron = require("node-cron");
const dailyUserIQCalc = require("../utils/dailyUserIQCalc.utils");
const moment = require("moment-timezone");

const currentDate = moment().format("YYYY-MM-DD");
const timeIST = moment.tz(`${currentDate} 14:45`, "Asia/Kolkata"); // Use the current date
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
    await dailyUserIQCalc();
    console.log("User IQ scores calculated successfully at midnight!");
  } catch (error) {
    console.error("Error calculating IQ scores:", error);
  }
});

// Ensure the script continues running
console.log("Scheduler started. Waiting for midnight...");
