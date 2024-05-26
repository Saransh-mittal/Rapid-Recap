const nodemailer = require("nodemailer");
// const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const User = require("../model/userSchema");
//const { progressBar } = require("./progress.utils");
const {
  streakBrokenDaysCalculator,
  noLoginDaysSpentCalculator,
} = require("./user.utils");
const MailTemplates = require("../data/MailTemplates");

//These id's and secrets should come from .env file.

const generateOtp = () => {
  let otp = "";
  for (let i = 0; i <= 5; i++) {
    otp += Math.round(Math.random() * 9);
  }
  return otp;
};

const mailTransporter = async () => {
  try {
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLEINT_SECRET = process.env.CLIENT_SECRET;
    const REDIRECT_URI = "https://developers.google.com/oauthplayground";
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

    // const oAuth2Client = new google.auth.OAuth2(
    //   CLIENT_ID,
    //   CLEINT_SECRET,
    //   REDIRECT_URI
    // );
    // oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    // const accessToken = await oAuth2Client.getAccessToken();
    const oAuth2Client = new OAuth2Client(
      CLIENT_ID,
      CLEINT_SECRET,
      REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    const accessToken = await oAuth2Client.getAccessToken();
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "rapidrecap2k23@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const mailForStreakBroken = async () => {
  try {
    const users = await User.find({
      email: { $not: /^dummy\d+@mail\.com$/ },
      name: { $not: /^undefined\sundefined$/ },
    });
    const transporter = await mailTransporter();
    //const updateProgress = progressBar(users.length);
    for (let user of users) {
      const streakBrokenDays = await streakBrokenDaysCalculator(user._id);
      const noLoginDaysSpent = await noLoginDaysSpentCalculator(user._id);

      if (streakBrokenDays === 2) {
        await transporter.sendMail({
          from: MailTemplates.StreakJustBroken.from,
          to: user.email,
          subject: MailTemplates.StreakJustBroken.subject,
          html: MailTemplates.StreakJustBroken.html({
            name: user.name.split(" ")[0],
          }),
        });
      } else if (streakBrokenDays % 7 === 0 && streakBrokenDays > 2) {
        await transporter.sendMail({
          from: MailTemplates.StreakSevenPeriodic.from,
          to: user.email,
          subject: MailTemplates.StreakSevenPeriodic.subject,
          html: MailTemplates.StreakSevenPeriodic.html({
            name: user.name.split(" ")[0],
            streak_days: streakBrokenDays,
          }),
        });
      }

      if (noLoginDaysSpent === 2) {
        await transporter.sendMail({
          from: MailTemplates.noLoginFor2Days.from,
          to: user.email,
          subject: MailTemplates.noLoginFor2Days.subject,
          html: MailTemplates.noLoginFor2Days.html({
            name: user.name.split(" ")[0],
          }),
        });
      } else if (noLoginDaysSpent % 7 === 0 && noLoginDaysSpent > 2) {
        await transporter.sendMail({
          from: MailTemplates.noLoginForSevenPeriodic.from,
          to: user.email,
          subject: MailTemplates.noLoginForSevenPeriodic.subject,
          html: MailTemplates.noLoginForSevenPeriodic.html({
            name: user.name.split(" ")[0],
            inactive_days: noLoginDaysSpent,
          }),
        });
      }
      //updateProgress();
    }
    console.log("\nMails sent successfully\n");
  } catch (error) {
    console.error(error);
  }
};

const mailForMaintainStreakReminder = async ({ template }) => {
  try {
    const users = await User.find({
      email: { $not: /^dummy\d+@mail\.com$/ },
      name: { $not: /^undefined\sundefined$/ },
    });
    const transporter = await mailTransporter();
    //const updateProgress = progressBar(users.length);
    for (let user of users) {
      const streakBrokenDays = await streakBrokenDaysCalculator(user._id);

      if (streakBrokenDays === 1) {
        await transporter.sendMail({
          from: template.from,
          to: user.email,
          subject: template.subject,
          html: template.html({
            name: user.name.split(" ")[0],
          }),
        });
      }
      //updateProgress();
    }
    console.log("\nMails sent successfully\n");
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  generateOtp,
  mailTransporter,
  mailForStreakBroken,
  mailForMaintainStreakReminder,
};
