const nodemailer = require("nodemailer");
// const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");

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

const generateEmailTemplate = (code) => {
  return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Rapid Recap</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Thank you for choosing Rapid Recap. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${code}</h2>
      <p style="font-size:0.9em;">Regards,<br />Rapid Recap</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>Rapid Recap Inc</p>
        <p>Jaipur</p>
        <p>India</p>
      </div>
    </div>
  </div>`;
};
const genEmailTemplateForNotifySubscribe = ({ name }) => {
  return `<div style="font-family: Helvetica,Arial,sans-serif; min-width:1000px; overflow:auto; line-height:2">
  <div style="margin:50px auto; width:70%; padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em; color:#00466a; text-decoration:none; font-weight:600">Rapid Recap</a>
    </div>
    <p style="font-size:1.1em">Hello ${name},</p>
    <p>We're excited to introduce you to our latest feature: browser notifications! With Rapid Recap's new notification system, you'll never miss out on the latest articles, breaking news, and exclusive content.</p>
    <p>To subscribe to browser notifications and stay informed, simply click the button below:</p>
    <a href="https://www.rapidrecap.co.in/" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:10px 20px; border-radius:5px;">Subscribe Now</a>
    
    <p>Best regards,<br />Rapid Recap Team</p>
    <hr style="border:none; border-top:1px solid #eee" />
    <div style="float:right; padding:8px 0; color:#aaa; font-size:0.8em; line-height:1; font-weight:300">
      <p>Rapid Recap Inc</p>
      <p>Jaipur</p>
      <p>India</p>
    </div>
    <p style="font-size:0.9em;"><strong>P.S.:</strong> Don't forget to stay updated with our latest news and articles by subscribing to browser notifications! If you have any questions or need assistance with subscribing to notifications, feel free to reach out to our support team at <a href="mailto:rapidrecap2k2023@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k2023@gmail.com</a>. We're here to help!</p>
  </div>
</div>
`;
};

const genEmailTemplateForAppUpdates = ({ title, mainText, name }) => {
  return `<div style="font-family: Helvetica,Arial,sans-serif; min-width:1000px; overflow:auto; line-height:2">
  <div style="margin:50px auto; width:70%; padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em; color:#00466a; text-decoration:none; font-weight:600">Rapid Recap</a>
    </div>
    <p style="font-size:1.1em">Hello ${name},</p>
    <h4>${title}</h4>
    <p>${mainText}</p>
    <a href="https://www.rapidrecap.co.in/" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:10px 20px; border-radius:5px;">View</a>
    
    <p>Best regards,<br />Rapid Recap Team</p>
    <hr style="border:none; border-top:1px solid #eee" />
    <div style="float:right; padding:8px 0; color:#aaa; font-size:0.8em; line-height:1; font-weight:300">
      <p>Rapid Recap Inc</p>
      <p>Jaipur</p>
      <p>India</p>
    </div>
    <p style="font-size:0.9em;"><strong>P.S.:</strong> Don't forget to stay updated with our latest news and articles by subscribing to browser notifications! If you have any questions or need assistance with subscribing to notifications, feel free to reach out to our support team at <a href="mailto:rapidrecap2k2023@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k2023@gmail.com</a>. We're here to help!</p>
  </h6>
</div>`;
};

const streakJustBroken = ({ name }) => {};

const streakBrokenSevenPeriodic = ({ name, streak_days }) => {
  return `<div style="font-family: Helvetica, Arial, sans-serif;">
  <div style="margin: 20px auto; max-width: 600px; padding: 20px;">
    <div style="border-bottom: 1px solid #eee; margin-bottom: 20px;">
      <a href="" style="color: #00466a; font-weight: 600; text-decoration: none;">Rapid Recap</a>
    </div>
    <p>Hello ${name},</p>
    <p>We hope this message finds you well.</p>
    <p>We regret to inform you that your Daily Quiz Streak on Rapid Recap has been interrupted for ${streak_days} days. We understand that life can get busy, and it's easy to lose track of routines.</p>
    <p>However, we miss having you engage with our daily quizzes and would love to see you back on track!</p>
    <p>Take this opportunity to restart your learning journey. Click below to resume:</p>
    <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 10px;">Get Back on Track</a>
    <p>Best regards,<br />Rapid Recap Team</p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
    <div style="color: #aaa; font-size: 0.8em;">
      <p>Rapid Recap Inc<br /> India</p>
    </div>
    <p style="font-size: 0.9em;"><strong>P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</div>`;
};

const preQuinBoost = ({ name }) => {
  return `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="margin: 20px auto; max-width: 600px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
    <div style="border-bottom: 2px solid #00466a; margin-bottom: 20px;">
      <a href="" style="color: #00466a; font-weight: 600; font-size: 1.5em; text-decoration: none;">Rapid Recap</a>
    </div>
    <p style="font-size: 1.2em;">Hello ${name} 👋,</p>
    <p>Congratulations on completing your 4th quiz! 🎉</p>
    <p>You're just one step away from unlocking an exciting power-up. Complete your next quiz to activate the Quin Boost, which will enhance your performance on your 6th quiz.</p>
    <p>We can't wait to see you achieve great results with this boost! 🚀</p>
    <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 15px 25px; border-radius: 5px; display: inline-block; font-size: 1.1em; margin-top: 20px;">Complete Your 5th Quiz</a>
    <p style="margin-top: 20px;">Best regards,<br /><strong>Rapid Recap Team</strong></p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
    <div style="color: #aaa; font-size: 0.9em;">
      <p>Rapid Recap Inc<br />India</p>
    </div>
    <p style="font-size: 0.9em;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</div>`;
};

const onQuinBoost = ({ name }) => {
  return `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="margin: 20px auto; max-width: 600px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
    <div style="border-bottom: 2px solid #00466a; margin-bottom: 20px;">
      <a href="" style="color: #00466a; font-weight: 600; font-size: 1.5em; text-decoration: none;">Rapid Recap</a>
    </div>
    <p style="font-size: 1.2em;">Hello ${name} 👋,</p>
    <p>Great job on completing your 5th quiz! 🏅</p>
    <p>You have now unlocked the Quin Boost! 🎉 This special power-up will amplify your RQM Score by 1.5 times on your next (6th) quiz. Look out for the special badge indicating your Quin Boost is active.</p>
    <p>Make sure to take full advantage of this boost and achieve an outstanding score! 🌟</p>
    <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 15px 25px; border-radius: 5px; display: inline-block; font-size: 1.1em; margin-top: 20px;">Take Your 6th Quiz Now</a>
    <p style="margin-top: 20px;">Best regards,<br /><strong>Rapid Recap Team</strong></p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
    <div style="color: #aaa; font-size: 0.9em;">
      <p>Rapid Recap Inc<br />India</p>
    </div>
    <p style="font-size: 0.9em;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</div>`;
};

const postQuinBoost = ({ name }) => {
  return `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="margin: 20px auto; max-width: 600px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
    <div style="border-bottom: 2px solid #00466a; margin-bottom: 20px;">
      <a href="" style="color: #00466a; font-weight: 600; font-size: 1.5em; text-decoration: none;">Rapid Recap</a>
    </div>
    <p style="font-size: 1.2em;">Hello ${name} 👋,</p>
    <p>Congratulations on completing your 6th quiz with the Quin Boost! 🎉</p>
    <p>We hope you enjoyed the enhanced experience and made the most of the 1.5x RQM Score multiplier. Your boosted performance has been truly impressive! 🌟</p>
    <p>Even though the Quin Boost was temporary, there's good news! The Quin Boost will reactivate after you complete the next five quizzes. Keep up the great work and continue your learning journey with us. We have many more quizzes waiting for you. 📚</p>
    <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 15px 25px; border-radius: 5px; display: inline-block; font-size: 1.1em; margin-top: 20px;">Continue Learning</a>
    <p style="margin-top: 20px;">Best regards,<br /><strong>Rapid Recap Team</strong></p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
    <div style="color: #aaa; font-size: 0.9em;">
      <p>Rapid Recap Inc<br />India</p>
    </div>
    <p style="font-size: 0.9em;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</div>`;
};

module.exports = {
  generateOtp,
  mailTransporter,
  generateEmailTemplate,
  genEmailTemplateForNotifySubscribe,
  genEmailTemplateForAppUpdates,
  streakBrokenSevenPeriodic,
  preQuinBoost,
  onQuinBoost,
  postQuinBoost,
};
