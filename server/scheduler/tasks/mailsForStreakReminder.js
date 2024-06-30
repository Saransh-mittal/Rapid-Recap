const MailTemplates = require("../../data/MailTemplates");
const { mailForMaintainStreakReminder } = require("../../utils/mail.utils");

const templates = [
  MailTemplates.streakMaintainReminder1,
  MailTemplates.streakMaintainReminder2,
  MailTemplates.streakMaintainReminder3,
];

async function sendStreakReminder(index) {
  try {
    await mailForMaintainStreakReminder({
      template: templates[index],
    });
    console.log(`Mails for streak reminder ${index + 1} sent successfully!!`);
  } catch (error) {
    console.error(
      `Error sending mails for streak reminder ${index + 1}:`,
      error
    );
  }
}

module.exports = sendStreakReminder;
