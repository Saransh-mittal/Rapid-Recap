const { mailForStreakBroken } = require("../../utils/mail.utils");

async function sendStreakBrokenMails() {
  try {
    await mailForStreakBroken();
    console.log("Mails for streak Broken and no logins sent successfully!!");
  } catch (error) {
    console.error(
      "Error sending mails for streak Broken and no logins:",
      error
    );
  }
}

module.exports = sendStreakBrokenMails;
