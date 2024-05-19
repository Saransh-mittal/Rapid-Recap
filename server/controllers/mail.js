const User = require("../model/userSchema");
const {
  mailTransporter,
  preQuinBoost,
  onQuinBoost,
  postQuinBoost,
  genEmailTemplateForStreakJustBroken,
} = require("../utils/mail.utils");
const {
  streakBrokenDaysCalculator,
  noLoginDaysSpentCalculator,
  currDayStreakCalulator,
} = require("../utils/user.utils");
const { progressBar } = require("../utils/progress.utils");

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
        await transporter.sendMail({
          from: "rapidrecap2k23@gmail.com",
          to: user.email,
          subject: "🚀 Restart Your Rapid Recap Quiz Streak Today! 🌟",
          html: genEmailTemplateForNotifySubscribe({
            name: user.name.split(" ")[0],
            streak_days: streakBrokenDays,
          }),
        });
      }

      if (noLoginDaysSpent === 2) {
      } else if (noLoginDaysSpent % 7 === 0 && noLoginDaysSpent > 2) {
      }
      updateProgress();
    }
    console.log("\nMails sent successfully\n");
    res.status(200).json({ message: "Mails sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};

const QuinBoost = async (req, res) => {
  try {
    const users = await User.find({
      email: { $not: /^dummy\d+@mail\.com$/ },
      name: { $not: /^undefined\sundefined$/ },
    });
    const transporter = await mailTransporter();
    const updateProgress = progressBar(users.length);
    for (let user of users) {
      const todayQuizNumber = await currDayStreakCalulator(user._id);

      if ((todayQuizNumber + 2) % 6 === 0) {
        await transporter.sendMail({
          from: "rapidrecap2k23@gmail.com",
          to: user.email,
          subject: "Almost There! One More Quiz to Unlock Your Power-Up! 🚀",
          html: preQuinBoost({
            name: user.name.split(" ")[0],
          }),
        });
      } else if ((todayQuizNumber + 1) % 6 === 0) {
        await transporter.sendMail({
          from: "rapidrecap2k23@gmail.com",
          to: user.email,
          subject: "Congrats! Your Quin Boost is Now Active! 🌟",
          html: onQuinBoost({
            name: user.name.split(" ")[0],
          }),
        });
      } else if (todayQuizNumber % 6 === 0) {
        await transporter.sendMail({
          from: "rapidrecap2k23@gmail.com",
          to: user.email,
          subject:
            "Well Done! Quin Boost Utilized! 🎉 Keep Going for More Boosts!",
          html: postQuinBoost({
            name: user.name.split(" ")[0],
          }),
        });
      }
      updateProgress();
    }
    console.log("\nMails sent successfully\n");
    res.status(200).json({ message: "Mails sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};

module.exports = { streakBroken, QuinBoost };
