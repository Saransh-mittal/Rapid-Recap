const User = require("../model/userSchema");
const {
  mailTransporter,
  genEmailTemplateForStreakJustBroken,
} = require("../utils/mail");
const {
  streakBrokenDaysCalculator,
  noLoginDaysSpentCalculator,
} = require("../utils/user");
const { progressBar } = require("../utils/progress");

const streakBroken = async (req, res) => {
  try {
    const users = await User.find({
      email: { $not: /^dummy\d+@mail\.com$/ },
      name: { $not: /^undefined\sundefined$/ },
    });
    const transporter = await mailTransporter();
    const updateProgress = progressBar(users.length);
    for (let user of users) {
      const streakBrokenDays = await streakBrokenDaysCalculator(user._id);
      const noLoginDaysSpent = await noLoginDaysSpentCalculator(user._id);

      if (streakBrokenDays === 2) {
        await transporter.sendMail({
          from: "rapidrecap2k23@gmail.com",
          to: user.email,
          subject: "Let's Get Back on Track! 🔄",
          html: genEmailTemplateForStreakJustBroken({
            name: user.name.split(" ")[0],
          }),
        });
      } else if (streakBrokenDays % 7 === 0 && streakBrokenDays > 2) {
      }

      if (noLoginDaysSpent === 2) {
      } else if (noLoginDaysSpent % 7 === 0 && noLoginDaysSpent > 2) {
      }
      updateProgress();
    }
    console.log("\nMails sent successfully\n");
    res.status(200).json({ message: "Mails sent successfully" });
    q;
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};

module.exports = { streakBroken };
