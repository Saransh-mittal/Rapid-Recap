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
    <a href="https://cyan-crane-tie.cyclic.app/" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:10px 20px; border-radius:5px;">Subscribe Now</a>
    
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
module.exports = {
  generateOtp,
  mailTransporter,
  generateEmailTemplate,
  genEmailTemplateForNotifySubscribe,
};
