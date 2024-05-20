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

module.exports = {
  generateOtp,
  mailTransporter,
};
