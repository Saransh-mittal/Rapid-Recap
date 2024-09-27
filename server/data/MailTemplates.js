const MailTemplates = {
  OTP: {
    from: 'rapidrecap2k23@gmail.com',
    subject: 'OTP for verification',
    text: `Your OTP for verification`,
    html: code => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
  <div style="text-align: center; border-bottom: 1px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 20px;">
    <a href="#" style="font-size: 1.8em; color: #00466a; text-decoration: none; font-weight: bold;">Rapid Recap</a>
  </div>
  <p style="font-size: 1.2em; color: #333;">Hi,</p>
  <p style="font-size: 1em; color: #333;">Thank you for choosing Rapid Recap. Use the following OTP to complete your sign-up procedures. The OTP is valid for 5 minutes.</p>
  <div style="text-align: center; margin: 20px 0;">
    <span style="display: inline-block; background: #00466a; padding: 15px 20px; color: #fff; font-size: 1.5em; border-radius: 5px;">${code}</span>
  </div>
  <p style="font-size: 1em; color: #333;">Regards,<br>Rapid Recap</p>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
  <div style="text-align: center; color: #aaa; font-size: 0.8em; line-height: 1.4;">
    <p>Rapid Recap Inc</p>
    <p>Jaipur, India</p>
  </div>
</div>
`,
  },
  NotifySubscribe: {
    from: 'rapidrecap2k23@gmail.com',
    subject: '📢 Stay Updated with Rapid Recap Notifications! 📰',
    html: ({
      name,
    }) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f4f4f4; padding:30px;">
  <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.1);">
    <div style="text-align:center; border-bottom:1px solid #e0e0e0; padding-bottom:20px;">
      <a href="https://www.rapidrecap.co.in" style="font-size:2em; color:#00466a; text-decoration:none; font-weight:bold; display:flex; align-items:center; justify-content:center;">
        <img src="https://res.cloudinary.com/dxstsrnbs/image/upload/v1720002794/rr_qts9kn.png" alt="Rapid Recap Logo" style="width:40px; height:30px; margin-right:10px;">
        Rapid Recap
      </a>
    </div>
    <div style="padding:20px 0;">
      <p style="font-size:1.2em; color:#333;">Hello ${name},</p>
      <p style="font-size:1em; color:#666; margin-top:20px;">We're excited to introduce you to our latest feature: browser notifications! With Rapid Recap's new notification system, you'll never miss out on the latest articles, breaking news, and exclusive content.</p>
      <p style="font-size:1em; color:#666; margin-top:20px;">To subscribe to browser notifications and stay informed, simply click the button below:</p>
      <div style="text-align:center; margin:30px 0;">
        <a href="https://www.rapidrecap.co.in" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:1em;">Subscribe Now</a>
      </div>

      <div style="margin-top:40px;">
        <h4 style="color:#333; text-align:center;">Articles Recommended for you:</h4>
        <div style="display:flex; justify-content:space-between; margin-top:20px;">
          <div style="width:auto;height:30% background-color:#f9f9f9; padding:10px; border-radius:8px; text-align:center; box-shadow:0 0 10px rgba(0,0,0,0.1); transition:transform 0.3s ease-in-out;">
            <img src="https://via.placeholder.com/150" alt="Article Image" style="width:100%; height:auto; border-radius:8px; transition:transform 0.3s ease-in-out;">
            <p style="font-size:1em; color:#333; margin-top:10px;">Article Title 1</p>
          </div>
          <div style="width:auto;height:30% background-color:#f9f9f9; padding:10px; border-radius:8px; text-align:center; box-shadow:0 0 10px rgba(0,0,0,0.1); transition:transform 0.3s ease-in-out;">
            <img src="https://via.placeholder.com/150" alt="Article Image" style="width:100%; height:auto; border-radius:8px; transition:transform 0.3s ease-in-out;">
            <p style="font-size:1em; color:#333; margin-top:10px;">Article Title 2</p>
          </div>
          <div style="width:auto;height:30% background-color:#f9f9f9; padding:10px; border-radius:8px; text-align:center; box-shadow:0 0 10px rgba(0,0,0,0.1); transition:transform 0.3s ease-in-out;">
            <img src="https://via.placeholder.com/150" alt="Article Image" style="width:100%; height:auto; border-radius:8px; transition:transform 0.3s ease-in-out;">
            <p style="font-size:1em; color:#333; margin-top:10px;">Article Title 3</p>
          </div>
        </div>
      </div>

      <p style="font-size:1em; color:#666; margin-top:40px;">Best regards,<br/>The Rapid Recap Team</p>
    </div>
    <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
    <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
      <p style="margin:0;">Rapid Recap Inc</p>
      <p style="margin:0;">Jaipur, India</p>
    </div>
    <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>P.S.:</strong> Don't forget to stay updated with our latest news and articles by subscribing to browser notifications! If you have any questions or need assistance with subscribing to notifications, feel free to reach out to our support team at <a href="mailto:rapidrecap2k2023@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k2023@gmail.com</a>. We're here to help!</p>
  </div>
</div>

<style>
  div[style*="box-shadow"] {
    transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  }
  div[style*="box-shadow"]:hover {
    box-shadow: 0 0 15px rgba(0, 70, 106, 0.3);
    transform: translateY(-5px);
  }
</style>

`,
  },
  AppUpdates: {
    from: 'rapidrecap2k23@gmail.com',
    subject: 'Application Update',
    html: ({ title, mainText, name, img, articlesForMail }) => `
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapid Recap Update</title>
  <style type="text/css">
    @media screen and (max-width: 600px) {
      .article-table {
        width: 100% !important;
      }
        .td-article-card{
        width: 100% !important;
        display: block !important;
        }
      .article-card {
      margin-left: 0 !important;
      margin-right: 0 !important;
        width: 100% !important;
        display: block !important;
        margin-bottom: 20px !important;
      }
    }
    .article-table {
      width: 100%;
      table-layout: fixed;
    }
      .td-article-card{
      background-color: transparent !important;
      }
    .article-card {
    height: 265px;
    width: 220px;
      margin: 20px;
      box-sizing: border-box;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      text-align: center;
      vertical-align: top;
    }
    .article-image {
      width: 100%;
      max-width: 150px;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
      margin: 15px auto;
    }
    .article-title {
      font-size: 1em;
      color: #333;
      margin-top: 10px;
      text-align: center;
    }
  </style>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f4f4f4; padding:30px; margin:0;">
  <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.1);">
    <div style="text-align:center; border-bottom:1px solid #e0e0e0; padding-bottom:20px;">
      <a href="https://www.rapidrecap.co.in" style="font-size:2em; color:#00466a; text-decoration:none; font-weight:bold; display:inline-block;">
        <img src="https://res.cloudinary.com/dxstsrnbs/image/upload/v1720002794/rr_qts9kn.png" alt="Rapid Recap Logo" style="width:40px; height:30px; vertical-align:middle; margin-right:10px;">
        Rapid Recap
      </a>
    </div>
    <div style="padding:20px 0;">
      <p style="font-size:1.2em; color:#333;">Hello ${name},</p>
      <h4 style="color:#00466a;">${title}</h4>
      ${
        img
          ? `<div style="text-align: center; margin: 20px 0;"><img src="${img}" alt="Image" style="max-width:100%; height:auto; border-radius:10px;"></div>`
          : ''
      }
      <p style="font-size:1em; color:#666; margin-top:20px;">${mainText.replace(
        /\n\n/g,
        '<br><br>',
      )}</p>
      <div style="text-align:center; margin:30px 0;">
        <a href="https://www.rapidrecap.co.in" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:1em;">View</a>
      </div>

      <div style="margin-top:40px; background-color:#A0937D; padding:20px; border-radius:10px;">
        <h4 style="color:#fff; text-align:center;">Articles Recommended for you:</h4>

        <table class="article-table" cellpadding="0" cellspacing="0">
          <tr>
            ${
              articlesForMail.length > 0
                ? articlesForMail
                    .map(
                      (article, index) => `
                        <td class="td-article-card">
                        <a href=${article.link}>
                        <div class="article-card">
                          <img src="${
                            article.articleData.imgURL[0]
                          }" alt="Article Image" class="article-image">
                          <p class="article-title">${
                            article.articleData.title
                          }</p>
                          </div>
                          </a>
                        </td>
                        ${
                          index % 2 === 1 && index < articlesForMail.length - 1
                            ? '</tr><tr>'
                            : ''
                        }
                    `,
                    )
                    .join('')
                : ''
            }
          </tr>
        </table>
      </div>

      <p style="font-size:1em; color:#666; margin-top:40px;">Best regards,<br/>The Rapid Recap Team</p>
    </div>
    <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
    <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
      <p style="margin:0;">Rapid Recap Inc</p>
      <p style="margin:0;">Jaipur, India</p>
    </div>
    <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>P.S.:</strong> Don't forget to stay updated with our latest news and articles by subscribing to browser notifications! If you have any questions or need assistance with subscribing to notifications, feel free to reach out to our support team at <a href="mailto:rapidrecap2k2023@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k2023@gmail.com</a>. We're here to help!</p>
  </div>
</body>
</html>
`,
  },

  StreakJustBroken: {
    from: 'rapidrecap2k23@gmail.com',
    subject:
      'Your Streak Can Still Be Revived! Activate And Utilize QuinBoost Today',
    html: ({
      name,
      articlesForMail,
      remainingTimeBeforeRevival,
    }) => `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Streak Can Still Be Revived!</title>
    <style type="text/css">
      @media screen and (max-width: 600px) {
        .article-table {
          width: 100% !important;
        }
        .td-article-card{
          width: 100% !important;
          display: block !important;
        }
        .article-card {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          display: block !important;
          margin-bottom: 20px !important;
        }
      }
      .article-table {
        width: 100%;
        table-layout: fixed;
      }
      .td-article-card{
        background-color: transparent !important;
      }
      .article-card {
        height: 265px;
        width: 220px;
        margin: 20px;
        box-sizing: border-box;
        background-color: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        vertical-align: top;
      }
      .article-image {
        width: 100%;
        max-width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        margin: 15px auto;
      }
      .article-title {
        font-size: 1em;
        color: #333;
        margin-top: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f4f4f4; padding:30px; margin:0;">
    <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.1);">
      <div style="text-align:center; border-bottom:1px solid #e0e0e0; padding-bottom:20px;">
        <a href="https://www.rapidrecap.co.in" style="font-size:2em; color:#00466a; text-decoration:none; font-weight:bold; display:flex; align-items:center; justify-content:center;">
          <img src="https://res.cloudinary.com/dxstsrnbs/image/upload/v1720002794/rr_qts9kn.png" alt="Rapid Recap Logo" style="width:40px; height:30px; margin-right:10px;">
          Rapid Recap
        </a>
      </div>
      <div style="padding:20px 0;">
        <p style="font-size:1.2em; color:#333;">Dear ${name},</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">We noticed that your impressive streak has come to a pause, but don't worry—there’s still a chance to bring it back!</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">You are now in the Revival Period, which lasts for ${remainingTimeBeforeRevival} days. During this time, you have the opportunity to revive your streak and continue your journey toward greater achievements.</p>
        <h4 style="color:#333; text-align:center; margin-top:30px;">How to Revive Your Streak:</h4>
        <p style="font-size:1em; color:#666; margin-top:10px;">To revive your streak, simply activate and then utilize QuinBoost. All you need to do is complete 6 quizzes in a single day during the Revival Period. Once you do, your streak will be fully restored, and you can continue progressing without missing a beat.</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">Remember, this is a limited-time opportunity. The clock is ticking, so be sure to take advantage of QuinBoost before your Revival Period ends.</p>
        <div style="text-align:center; margin:30px 0;">
          <a href="https://www.rapidrecap.co.in" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:1em;">Activate QuinBoost Now</a>
        </div>

        <div style="margin-top:40px; background-color:#A0937D; padding:20px; border-radius:10px;">
          <h4 style="color:#fff; text-align:center;">Articles Recommended for you:</h4>

          <table class="article-table" cellpadding="0" cellspacing="0">
            <tr>
              ${
                articlesForMail.length > 0
                  ? articlesForMail
                      .map(
                        (article, index) => `
                          <td class="td-article-card">
                          <a href=${article.link}>
                          <div class="article-card">
                            <img src="${
                              article.articleData.imgURL[0]
                            }" alt="Article Image" class="article-image">
                            <p class="article-title">${
                              article.articleData.title
                            }</p>
                            </div>
                            </a>
                          </td>
                          ${
                            index % 2 === 1 &&
                            index < articlesForMail.length - 1
                              ? '</tr><tr>'
                              : ''
                          }
                      `,
                      )
                      .join('')
                  : ''
              }
            </tr>
          </table>
        </div>

        <p style="font-size:1em; color:#666; margin-top:40px;">We’re rooting for you and can’t wait to see you back on track!</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">If you have any questions or need assistance, feel free to reach out to our support team.</p>
      </div>
      <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
      <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
        <p style="margin:0;">Rapid Recap Inc</p>
        <p style="margin:0;">India</p>
      </div>
      <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k23@gmail.com</a>.</p>
    </div>
  </body>
  </html>

  <style>
    div[style*="box-shadow"] {
      transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
    }
    div[style*="box-shadow"]:hover {
      box-shadow: 0 0 15px rgba(0, 70, 106, 0.3);
      transform: translateY(-5px);
    }
  </style>
  `,
  },

  StreakSevenPeriodic: {
    from: 'rapidrecap2k23@gmail.com',
    subject: '🚀 Restart Your Rapid Recap Quiz Streak Today! 🌟',
    html: ({ name, streak_days, articlesForMail }) => `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restart Your Rapid Recap Quiz Streak</title>
    <style type="text/css">
      @media screen and (max-width: 600px) {
        .article-table {
          width: 100% !important;
        }
        .td-article-card{
          width: 100% !important;
          display: block !important;
        }
        .article-card {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          display: block !important;
          margin-bottom: 20px !important;
        }
      }
      .article-table {
        width: 100%;
        table-layout: fixed;
      }
      .td-article-card{
        background-color: transparent !important;
      }
      .article-card {
        height: 265px;
        width: 220px;
        margin: 20px;
        box-sizing: border-box;
        background-color: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        vertical-align: top;
      }
      .article-image {
        width: 100%;
        max-width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        margin: 15px auto;
      }
      .article-title {
        font-size: 1em;
        color: #333;
        margin-top: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f4f4f4; padding:30px; margin:0;">
    <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.1);">
      <div style="text-align:center; border-bottom:1px solid #e0e0e0; padding-bottom:20px;">
        <a href="https://www.rapidrecap.co.in" style="font-size:2em; color:#00466a; text-decoration:none; font-weight:bold; display:flex; align-items:center; justify-content:center;">
          <img src="https://res.cloudinary.com/dxstsrnbs/image/upload/v1720002794/rr_qts9kn.png" alt="Rapid Recap Logo" style="width:40px; height:30px; margin-right:10px;">
          Rapid Recap
        </a>
      </div>
      <div style="padding:20px 0;">
        <p style="font-size:1.2em; color:#333;">Hello ${name} 👋,</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">We hope this message finds you well.</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">We regret to inform you that your Daily Quiz Streak on Rapid Recap has been interrupted for ${streak_days} days. We understand that life can get busy, and it's easy to lose track of routines.</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">However, we miss having you engage with our daily quizzes and would love to see you back on track!</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">Take this opportunity to restart your learning journey. Click below to resume:</p>
        <div style="text-align:center; margin:30px 0;">
          <a href="https://www.rapidrecap.co.in" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:1em;">Get Back on Track</a>
        </div>

        <div style="margin-top:40px; background-color:#A0937D; padding:20px; border-radius:10px;">
          <h4 style="color:#fff; text-align:center;">Articles Recommended for you:</h4>

          <table class="article-table" cellpadding="0" cellspacing="0">
            <tr>
              ${
                articlesForMail.length > 0
                  ? articlesForMail
                      .map(
                        (article, index) => `
                          <td class="td-article-card">
                          <a href=${article.link}>
                          <div class="article-card">
                            <img src="${
                              article.articleData.imgURL[0]
                            }" alt="Article Image" class="article-image">
                            <p class="article-title">${
                              article.articleData.title
                            }</p>
                            </div>
                            </a>
                          </td>
                          ${
                            index % 2 === 1 &&
                            index < articlesForMail.length - 1
                              ? '</tr><tr>'
                              : ''
                          }
                      `,
                      )
                      .join('')
                  : ''
              }
            </tr>
          </table>
        </div>

        <p style="font-size:1em; color:#666; margin-top:40px;">Best regards,<br/>The Rapid Recap Team</p>
      </div>
      <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
      <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
        <p style="margin:0;">Rapid Recap Inc</p>
        <p style="margin:0;">India</p>
      </div>
      <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k23@gmail.com</a>.</p>
    </div>
  </body>
  </html>

  <style>
    div[style*="box-shadow"] {
      transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
    }
    div[style*="box-shadow"]:hover {
      box-shadow: 0 0 15px rgba(0, 70, 106, 0.3);
      transform: translateY(-5px);
    }
  </style>
  `,
  },

  preQuinBoost: {
    from: 'rapidrecap2k23@gmail.com',
    subject: 'Almost There! One More Quiz to Unlock Your Power-Up! 🚀',
    html: ({ name, noOfQuiz, QuinQuizNumber, articlesForMail }) =>
      `<html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Unlock Your Power-Up</title>
      <style type="text/css">
        @media screen and (max-width: 600px) {
          .article-table {
            width: 100% !important;
          }
          .td-article-card{
            width: 100% !important;
            display: block !important;
          }
          .article-card {
            margin-left: 0 !important;
            margin-right: 0 !important;
            width: 100% !important;
            display: block !important;
            margin-bottom: 20px !important;
          }
        }
        .article-table {
          width: 100%;
          table-layout: fixed;
        }
        .td-article-card{
          background-color: transparent !important;
        }
        .article-card {
          height: 265px;
          width: 220px;
          margin: 20px;
          box-sizing: border-box;
          background-color: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          text-align: center;
          vertical-align: top;
        }
        .article-image {
          width: 100%;
          max-width: 150px;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          margin: 15px auto;
        }
        .article-title {
          font-size: 1em;
          color: #333;
          margin-top: 10px;
          text-align: center;
        }
      </style>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f4f4f4; padding:30px; margin:0;">
      <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.1);">
        <div style="text-align:center; border-bottom:1px solid #e0e0e0; padding-bottom:20px;">
          <a href="https://www.rapidrecap.co.in" style="font-size:2em; color:#00466a; text-decoration:none; font-weight:bold; display:flex; align-items:center; justify-content:center;">
            <img src="https://res.cloudinary.com/dxstsrnbs/image/upload/v1720002794/rr_qts9kn.png" alt="Rapid Recap Logo" style="width:40px; height:30px; margin-right:10px;">
            Rapid Recap
          </a>
        </div>
        <div style="padding:20px 0;">
          <p style="font-size:1.2em; color:#333;">Hello ${name} 👋,</p>
          <p style="font-size:1em; color:#666; margin-top:20px;">Congratulations on completing your ${noOfQuiz}th quiz! 🎉</p>
          <p style="font-size:1em; color:#666; margin-top:20px;">You're just one step away from unlocking an exciting power-up. Complete your next quiz to activate the Quin Boost, which will enhance your performance on your ${QuinQuizNumber}th quiz.</p>
          <p style="font-size:1em; color:#666; margin-top:20px;">We can't wait to see you achieve great results with this boost! 🚀</p>
          <div style="text-align:center; margin:30px 0;">
            <a href="https://www.rapidrecap.co.in" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:1em;">Complete Your Next Quiz</a>
          </div>

          <div style="margin-top:40px; background-color:#A0937D; padding:20px; border-radius:10px;">
            <h4 style="color:#fff; text-align:center;">Articles Recommended for you:</h4>

            <table class="article-table" cellpadding="0" cellspacing="0">
              <tr>
                ${
                  articlesForMail.length > 0
                    ? articlesForMail
                        .map(
                          (article, index) => `
                            <td class="td-article-card">
                            <a href=${article.link}>
                            <div class="article-card">
                              <img src="${
                                article.articleData.imgURL[0]
                              }" alt="Article Image" class="article-image">
                              <p class="article-title">${
                                article.articleData.title
                              }</p>
                              </div>
                              </a>
                            </td>
                            ${
                              index % 2 === 1 &&
                              index < articlesForMail.length - 1
                                ? '</tr><tr>'
                                : ''
                            }
                        `,
                        )
                        .join('')
                    : ''
                }
              </tr>
            </table>
          </div>

          <p style="font-size:1em; color:#666; margin-top:40px;">Best regards,<br/>The Rapid Recap Team</p>
        </div>
        <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
        <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
          <p style="margin:0;">Rapid Recap Inc</p>
          <p style="margin:0;">India</p>
        </div>
        <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k23@gmail.com</a>.</p>
      </div>
    </body>
    </html>

    <style>
      div[style*="box-shadow"] {
        transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
      }
      div[style*="box-shadow"]:hover {
        box-shadow: 0 0 15px rgba(0, 70, 106, 0.3);
        transform: translateY(-5px);
      }
    </style>
    `,
  },

  onQuinBoost: {
    from: 'rapidrecap2k23@gmail.com',
    subject: 'Congrats! Your Quin Boost is Now Active! 🌟',
    html1: ({
      name,
      noOfQuiz,
      QuinQuizNumber,
      articlesForMail,
    }) => `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Congrats! Your Quin Boost is Now Active!</title>
    <style type="text/css">
      @media screen and (max-width: 600px) {
        .article-table {
          width: 100% !important;
        }
        .td-article-card {
          width: 100% !important;
          display: block !important;
        }
        .article-card {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          display: block !important;
          margin-bottom: 20px !important;
        }
      }
      .article-table {
        width: 100%;
        table-layout: fixed;
      }
      .td-article-card {
        background-color: transparent !important;
      }
      .article-card {
        height: 265px;
        width: 220px;
        margin: 20px;
        box-sizing: border-box;
        background-color: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        vertical-align: top;
      }
      .article-image {
        width: 100%;
        max-width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        margin: 15px auto;
      }
      .article-title {
        font-size: 1em;
        color: #333;
        margin-top: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f4f4f4; padding:30px; margin:0;">
    <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.1);">
      <div style="text-align:center; border-bottom:1px solid #e0e0e0; padding-bottom:20px;">
        <a href="https://www.rapidrecap.co.in" style="font-size:2em; color:#00466a; text-decoration:none; font-weight:bold; display:flex; align-items:center; justify-content:center;">
          <img src="https://res.cloudinary.com/dxstsrnbs/image/upload/v1720002794/rr_qts9kn.png" alt="Rapid Recap Logo" style="width:40px; height:30px; margin-right:10px;">
          Rapid Recap
        </a>
      </div>
      <div style="padding:20px 0;">
        <p style="font-size:1.2em; color:#333;">Hello ${name} 👋,</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">Great job on completing your ${noOfQuiz}th quiz! 🏅</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">You have now unlocked the Quin Boost! 🎉 This special power-up will amplify your RQM Score by 1.5 times on your next (${QuinQuizNumber}th) quiz. Look out for the special badge indicating your Quin Boost is active.</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">Make sure to take full advantage of this boost and achieve an outstanding score! 🌟</p>
        <div style="text-align:center; margin:30px 0;">
          <a href="https://www.rapidrecap.co.in" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:1em;">Take Your ${QuinQuizNumber}th Quiz Now</a>
        </div>

        <div style="margin-top:40px; background-color:#A0937D; padding:20px; border-radius:10px;">
          <h4 style="color:#fff; text-align:center;">Articles Recommended for you:</h4>

          <table class="article-table" cellpadding="0" cellspacing="0">
            <tr>
              ${
                articlesForMail.length > 0
                  ? articlesForMail
                      .map(
                        (article, index) => `
                          <td class="td-article-card">
                            <a href=${article.link}>
                              <div class="article-card">
                                <img src="${
                                  article.articleData.imgURL[0]
                                }" alt="Article Image" class="article-image">
                                <p class="article-title">${
                                  article.articleData.title
                                }</p>
                              </div>
                            </a>
                          </td>
                          ${
                            index % 2 === 1 &&
                            index < articlesForMail.length - 1
                              ? '</tr><tr>'
                              : ''
                          }
                      `,
                      )
                      .join('')
                  : ''
              }
            </tr>
          </table>
        </div>

        <p style="font-size:1em; color:#666; margin-top:40px;">Best regards,<br/>The Rapid Recap Team</p>
      </div>
      <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
      <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
        <p style="margin:0;">Rapid Recap Inc</p>
        <p style="margin:0;">India</p>
      </div>
      <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k23@gmail.com</a>.</p>
    </div>
  </body>
  </html>

  <style>
    div[style*="box-shadow"] {
      transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
    }
    div[style*="box-shadow"]:hover {
      box-shadow: 0 0 15px rgba(0, 70, 106, 0.3);
      transform: translateY(-5px);
    }
  </style>
  `,

    html2: ({ name, QuinQuizNumber, articlesForMail }) => `<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quick Reminder: Your Quin Boost is About to Expire!</title>
  <style type="text/css">
    @media screen and (max-width: 600px) {
      .article-table {
        width: 100% !important;
      }
      .td-article-card {
        width: 100% !important;
        display: block !important;
      }
      .article-card {
        margin-left: 0 !important;
        margin-right: 0 !important;
        width: 100% !important;
        display: block !important;
        margin-bottom: 20px !important;
      }
    }
    .article-table {
      width: 100%;
      table-layout: fixed;
    }
    .td-article-card {
      background-color: transparent !important;
    }
    .article-card {
      height: 265px;
      width: 220px;
      margin: 20px;
      box-sizing: border-box;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      text-align: center;
      vertical-align: top;
    }
    .article-image {
      width: 100%;
      max-width: 150px;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
      margin: 15px auto;
    }
    .article-title {
      font-size: 1em;
      color: #333;
      margin-top: 10px;
      text-align: center;
    }
  </style>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f4f4f4; padding:30px; margin:0;">
  <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.1);">
    <div style="text-align:center; border-bottom:1px solid #e0e0e0; padding-bottom:20px;">
      <a href="https://www.rapidrecap.co.in" style="font-size:2em; color:#00466a; text-decoration:none; font-weight:bold; display:flex; align-items:center; justify-content:center;">
        <img src="https://res.cloudinary.com/dxstsrnbs/image/upload/v1720002794/rr_qts9kn.png" alt="Rapid Recap Logo" style="width:40px; height:30px; margin-right:10px;">
        Rapid Recap
      </a>
    </div>
    <div style="padding:20px 0;">
      <p style="font-size:1.2em; color:#333;">Hello ${name} 👋,</p>
      <p style="font-size:1em; color:#666; margin-top:20px;">Quick reminder: your Quin Boost will expire in just 1 hour! ⏳</p>
      <p style="font-size:1em; color:#666; margin-top:20px;">Don't miss out on this opportunity to amplify your RQM Score by 1.5 times on your next quiz. Take your ${QuinQuizNumber}th quiz now and make the most of this special power-up! 🌟</p>
      <div style="text-align:center; margin:30px 0;">
        <a href="https://www.rapidrecap.co.in" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:1em;">Take Your ${QuinQuizNumber}th Quiz Now</a>
      </div>

      <div style="margin-top:40px; background-color:#A0937D; padding:20px; border-radius:10px;">
        <h4 style="color:#fff; text-align:center;">Articles Recommended for you:</h4>

        <table class="article-table" cellpadding="0" cellspacing="0">
          <tr>
            ${
              articlesForMail.length > 0
                ? articlesForMail
                    .map(
                      (article, index) => `
                        <td class="td-article-card">
                          <a href=${article.link}>
                            <div class="article-card">
                              <img src="${
                                article.articleData.imgURL[0]
                              }" alt="Article Image" class="article-image">
                              <p class="article-title">${
                                article.articleData.title
                              }</p>
                            </div>
                          </a>
                        </td>
                        ${
                          index % 2 === 1 && index < articlesForMail.length - 1
                            ? '</tr><tr>'
                            : ''
                        }
                    `,
                    )
                    .join('')
                : ''
            }
          </tr>
        </table>
      </div>

      <p style="font-size:1em; color:#666; margin-top:40px;">Best regards,<br/>The Rapid Recap Team</p>
    </div>
    <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
    <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
      <p style="margin:0;">Rapid Recap Inc</p>
      <p style="margin:0;">India</p>
    </div>
    <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</body>
</html>

<style>
  div[style*="box-shadow"] {
    transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  }
  div[style*="box-shadow"]:hover {
    box-shadow: 0 0 15px rgba(0, 70, 106, 0.3);
    transform: translateY(-5px);
  }
</style>
`,
  },

  postQuinBoost: {
    from: 'rapidrecap2k23@gmail.com',
    subject: 'Well Done! Quin Boost Utilized! 🎉 Keep Going for More Boosts!',
    html: ({ name, noOfQuiz, articlesForMail }) =>
      `<html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quin Boost Utilized</title>
      <style type="text/css">
        @media screen and (max-width: 600px) {
          .article-table {
            width: 100% !important;
          }
          .td-article-card{
            width: 100% !important;
            display: block !important;
          }
          .article-card {
            margin-left: 0 !important;
            margin-right: 0 !important;
            width: 100% !important;
            display: block !important;
            margin-bottom: 20px !important;
          }
        }
        .article-table {
          width: 100%;
          table-layout: fixed;
        }
        .td-article-card{
          background-color: transparent !important;
        }
        .article-card {
          height: 265px;
          width: 220px;
          margin: 20px;
          box-sizing: border-box;
          background-color: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          text-align: center;
          vertical-align: top;
        }
        .article-image {
          width: 100%;
          max-width: 150px;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          margin: 15px auto;
        }
        .article-title {
          font-size: 1em;
          color: #333;
          margin-top: 10px;
          text-align: center;
        }
      </style>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f4f4f4; padding:30px; margin:0;">
      <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.1);">
        <div style="text-align:center; border-bottom:1px solid #e0e0e0; padding-bottom:20px;">
          <a href="https://www.rapidrecap.co.in" style="font-size:2em; color:#00466a; text-decoration:none; font-weight:bold; display:flex; align-items:center; justify-content:center;">
            <img src="https://res.cloudinary.com/dxstsrnbs/image/upload/v1720002794/rr_qts9kn.png" alt="Rapid Recap Logo" style="width:40px; height:30px; margin-right:10px;">
            Rapid Recap
          </a>
        </div>
        <div style="padding:20px 0;">
          <p style="font-size:1.2em; color:#333;">Hello ${name} 👋,</p>
          <p style="font-size:1em; color:#666; margin-top:20px;">Congratulations on completing your ${noOfQuiz}th quiz with the Quin Boost! 🎉</p>
          <p style="font-size:1em; color:#666; margin-top:20px;">We hope you enjoyed the enhanced experience and made the most of the 1.5x RQM Score multiplier. Your boosted performance has been truly impressive! 🌟</p>
          <p style="font-size:1em; color:#666; margin-top:20px;">Even though the Quin Boost was temporary, there's good news! The Quin Boost will reactivate after you complete the next five quizzes. Keep up the great work and continue your learning journey with us. We have many more quizzes waiting for you. 📚</p>
          <div style="text-align:center; margin:30px 0;">
            <a href="https://www.rapidrecap.co.in" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:1em;">Continue Learning</a>
          </div>

          <div style="margin-top:40px; background-color:#A0937D; padding:20px; border-radius:10px;">
            <h4 style="color:#fff; text-align:center;">Articles Recommended for you:</h4>

            <table class="article-table" cellpadding="0" cellspacing="0">
              <tr>
                ${
                  articlesForMail.length > 0
                    ? articlesForMail
                        .map(
                          (article, index) => `
                            <td class="td-article-card">
                            <a href=${article.link}>
                            <div class="article-card">
                              <img src="${
                                article.articleData.imgURL[0]
                              }" alt="Article Image" class="article-image">
                              <p class="article-title">${
                                article.articleData.title
                              }</p>
                              </div>
                              </a>
                            </td>
                            ${
                              index % 2 === 1 &&
                              index < articlesForMail.length - 1
                                ? '</tr><tr>'
                                : ''
                            }
                        `,
                        )
                        .join('')
                    : ''
                }
              </tr>
            </table>
          </div>

          <p style="font-size:1em; color:#666; margin-top:40px;">Best regards,<br/>The Rapid Recap Team</p>
        </div>
        <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
        <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
          <p style="margin:0;">Rapid Recap Inc</p>
          <p style="margin:0;">India</p>
        </div>
        <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k23@gmail.com</a>.</p>
      </div>
    </body>
    </html>

    <style>
      div[style*="box-shadow"] {
        transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
      }
      div[style*="box-shadow"]:hover {
        box-shadow: 0 0 15px rgba(0, 70, 106, 0.3);
        transform: translateY(-5px);
      }
    </style>
    `,
  },

  noLoginFor2Days: {
    from: 'rapidrecap2k23@gmail.com',
    subject: `🌟 We Miss You at Rapid Recap! 📚 Resume Your Quiz Journey Today 🚀`,
    html: ({ name, articlesForMail }) => `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>We Miss You</title>
    <style type="text/css">
      @media screen and (max-width: 600px) {
        .article-table {
          width: 100% !important;
        }
        .td-article-card{
          width: 100% !important;
          display: block !important;
        }
        .article-card {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          display: block !important;
          margin-bottom: 20px !important;
        }
      }
      .article-table {
        width: 100%;
        table-layout: fixed;
      }
      .td-article-card{
        background-color: transparent !important;
      }
      .article-card {
        height: 265px;
        width: 220px;
        margin: 20px;
        box-sizing: border-box;
        background-color: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        vertical-align: top;
      }
      .article-image {
        width: 100%;
        max-width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        margin: 15px auto;
      }
      .article-title {
        font-size: 1em;
        color: #333;
        margin-top: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f4f4f4; padding:30px; margin:0;">
    <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.1);">
      <div style="text-align:center; border-bottom:1px solid #e0e0e0; padding-bottom:20px;">
        <a href="https://www.rapidrecap.co.in" style="font-size:2em; color:#00466a; text-decoration:none; font-weight:bold; display:flex; align-items:center; justify-content:center;">
          <img src="https://res.cloudinary.com/dxstsrnbs/image/upload/v1720002794/rr_qts9kn.png" alt="Rapid Recap Logo" style="width:40px; height:30px; margin-right:10px;">
          Rapid Recap
        </a>
      </div>
      <div style="padding:20px 0;">
        <p style="font-size:1.2em; color:#333;">Hello ${name} 👋,</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">We hope this message finds you well.</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">We noticed that you haven't logged into Rapid Recap for the past 2 days. We understand that life can get busy, and it's easy to lose track of routines.</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">We miss having you engage with our daily quizzes and would love to see you back on track!</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">Take this opportunity to restart your learning journey. Click below to resume:</p>
        <div style="text-align:center; margin:30px 0;">
          <a href="https://www.rapidrecap.co.in" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:1em;">Get Back on Track</a>
        </div>

        <div style="margin-top:40px; background-color:#A0937D; padding:20px; border-radius:10px;">
          <h4 style="color:#fff; text-align:center;">Articles Recommended for you:</h4>

          <table class="article-table" cellpadding="0" cellspacing="0">
            <tr>
              ${
                articlesForMail.length > 0
                  ? articlesForMail
                      .map(
                        (article, index) => `
                          <td class="td-article-card">
                          <a href=${article.link}>
                          <div class="article-card">
                            <img src="${
                              article.articleData.imgURL[0]
                            }" alt="Article Image" class="article-image">
                            <p class="article-title">${
                              article.articleData.title
                            }</p>
                            </div>
                            </a>
                          </td>
                          ${
                            index % 2 === 1 &&
                            index < articlesForMail.length - 1
                              ? '</tr><tr>'
                              : ''
                          }
                      `,
                      )
                      .join('')
                  : ''
              }
            </tr>
          </table>
        </div>

        <p style="font-size:1em; color:#666; margin-top:40px;">Best regards,<br/>The Rapid Recap Team</p>
      </div>
      <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
      <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
        <p style="margin:0;">Rapid Recap Inc</p>
        <p style="margin:0;">India</p>
      </div>
      <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k23@gmail.com</a>.</p>
    </div>
  </body>
  </html>

  <style>
    div[style*="box-shadow"] {
      transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
    }
    div[style*="box-shadow"]:hover {
      box-shadow: 0 0 15px rgba(0, 70, 106, 0.3);
      transform: translateY(-5px);
    }
  </style>
  `,
  },

  noLoginForSevenPeriodic: {
    from: 'rapidrecap2k23@gmail.com',
    subject: `🌟 We Miss You at Rapid Recap! 📚 Restart Your Learning Journey Today 🚀`,
    html: ({ name, inactive_days, articlesForMail }) => `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>We Miss You</title>
    <style type="text/css">
      @media screen and (max-width: 600px) {
        .article-table {
          width: 100% !important;
        }
        .td-article-card {
          width: 100% !important;
          display: block !important;
        }
        .article-card {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          display: block !important;
          margin-bottom: 20px !important;
        }
      }
      .article-table {
        width: 100%;
        table-layout: fixed;
      }
      .td-article-card {
        background-color: transparent !important;
      }
      .article-card {
        height: 265px;
        width: 220px;
        margin: 20px;
        box-sizing: border-box;
        background-color: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        vertical-align: top;
      }
      .article-image {
        width: 100%;
        max-width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        margin: 15px auto;
      }
      .article-title {
        font-size: 1em;
        color: #333;
        margin-top: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f4f4f4; padding:30px; margin:0;">
    <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.1);">
      <div style="text-align:center; border-bottom:1px solid #e0e0e0; padding-bottom:20px;">
        <a href="https://www.rapidrecap.co.in" style="font-size:2em; color:#00466a; text-decoration:none; font-weight:bold; display:flex; align-items:center; justify-content:center;">
          <img src="https://res.cloudinary.com/dxstsrnbs/image/upload/v1720002794/rr_qts9kn.png" alt="Rapid Recap Logo" style="width:40px; height:30px; margin-right:10px;">
          Rapid Recap
        </a>
      </div>
      <div style="padding:20px 0;">
        <p style="font-size:1.2em; color:#333;">Hello ${name} 👋,</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">We hope this message finds you well.</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">It's been ${inactive_days} days since you last logged into Rapid Recap. We understand that routines can change, but we really miss your participation in our quizzes and content.</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">There's a lot of new and exciting content waiting for you! We'd love to see you back to continue your learning journey with us.</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">Click below to resume:</p>
        <div style="text-align:center; margin:30px 0;">
          <a href="https://www.rapidrecap.co.in" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:1em;">Get Back on Track</a>
        </div>

        <div style="margin-top:40px; background-color:#A0937D; padding:20px; border-radius:10px;">
          <h4 style="color:#fff; text-align:center;">Articles Recommended for you:</h4>

          <table class="article-table" cellpadding="0" cellspacing="0">
            <tr>
              ${
                articlesForMail.length > 0
                  ? articlesForMail
                      .map(
                        (article, index) => `
                          <td class="td-article-card">
                            <a href=${article.link}>
                              <div class="article-card">
                                <img src="${
                                  article.articleData.imgURL[0]
                                }" alt="Article Image" class="article-image">
                                <p class="article-title">${
                                  article.articleData.title
                                }</p>
                              </div>
                            </a>
                          </td>
                          ${
                            index % 2 === 1 &&
                            index < articlesForMail.length - 1
                              ? '</tr><tr>'
                              : ''
                          }
                      `,
                      )
                      .join('')
                  : ''
              }
            </tr>
          </table>
        </div>

        <p style="font-size:1em; color:#666; margin-top:40px;">We look forward to your return,<br/>The Rapid Recap Team</p>
      </div>
      <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
      <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
        <p style="margin:0;">Rapid Recap Inc</p>
        <p style="margin:0;">India</p>
      </div>
      <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k23@gmail.com</a>.</p>
    </div>
  </body>
  </html>

  <style>
    div[style*="box-shadow"] {
      transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
    }
    div[style*="box-shadow"]:hover {
      box-shadow: 0 0 15px rgba(0, 70, 106, 0.3);
      transform: translateY(-5px);
    }
  </style>
  `,
  },

  streakMaintainReminder1: {
    from: 'rapidrecap2k23@gmail.com',
    subject: `Keep Your Streak Alive! 🌟`,
    html: ({ name, articlesForMail }) => `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Keep Your Streak Alive</title>
    <style type="text/css">
      @media screen and (max-width: 600px) {
        .article-table {
          width: 100% !important;
        }
        .td-article-card {
          width: 100% !important;
          display: block !important;
        }
        .article-card {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          display: block !important;
          margin-bottom: 20px !important;
        }
      }
      .article-table {
        width: 100%;
        table-layout: fixed;
      }
      .td-article-card {
        background-color: transparent !important;
      }
      .article-card {
        height: 265px;
        width: 220px;
        margin: 20px;
        box-sizing: border-box;
        background-color: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        vertical-align: top;
      }
      .article-image {
        width: 100%;
        max-width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        margin: 15px auto;
      }
      .article-title {
        font-size: 1em;
        color: #333;
        margin-top: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f4f4f4; padding:30px; margin:0;">
    <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.1);">
      <div style="text-align:center; border-bottom:1px solid #e0e0e0; padding-bottom:20px;">
        <a href="https://www.rapidrecap.co.in" style="font-size:2em; color:#00466a; text-decoration:none; font-weight:bold; display:flex; align-items:center; justify-content:center;">
          <img src="https://res.cloudinary.com/dxstsrnbs/image/upload/v1720002794/rr_qts9kn.png" alt="Rapid Recap Logo" style="width:40px; height:30px; margin-right:10px;">
          Rapid Recap
        </a>
      </div>
      <div style="padding:20px 0;">
        <p style="font-size:1.2em; color:#333;">Hello ${name} 👋,</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">We hope this message finds you well.</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">Don't forget to take today's quiz and keep your Rapid Recap streak going strong. Your daily dose of knowledge awaits! Log in now and maintain that winning streak!</p>
        <div style="text-align:center; margin:30px 0;">
          <a href="https://www.rapidrecap.co.in" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:1em;">Log in now</a>
        </div>

        <div style="margin-top:40px; background-color:#A0937D; padding:20px; border-radius:10px;">
          <h4 style="color:#fff; text-align:center;">Articles Recommended for you:</h4>

          <table class="article-table" cellpadding="0" cellspacing="0">
            <tr>
              ${
                articlesForMail.length > 0
                  ? articlesForMail
                      .map(
                        (article, index) => `
                          <td class="td-article-card">
                            <a href=${article.link}>
                              <div class="article-card">
                                <img src="${
                                  article.articleData.imgURL[0]
                                }" alt="Article Image" class="article-image">
                                <p class="article-title">${
                                  article.articleData.title
                                }</p>
                              </div>
                            </a>
                          </td>
                          ${
                            index % 2 === 1 &&
                            index < articlesForMail.length - 1
                              ? '</tr><tr>'
                              : ''
                          }
                      `,
                      )
                      .join('')
                  : ''
              }
            </tr>
          </table>
        </div>

        <p style="font-size:1em; color:#666; margin-top:40px;">Best regards,<br/>The Rapid Recap Team</p>
      </div>
      <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
      <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
        <p style="margin:0;">Rapid Recap Inc</p>
        <p style="margin:0;">India</p>
      </div>
      <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k23@gmail.com</a>.</p>
    </div>
  </body>
  </html>

<style>
  div[style*="box-shadow"] {
    transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  }
  div[style*="box-shadow"]:hover {
    box-shadow: 0 0 15px rgba(0, 70, 106, 0.3);
    transform: translateY(-5px);
  }
</style>
`,
    notif: ({ name }) => {
      return {
        title: `Keep Your Streak Alive! 🌟`,
        body: `Hey ${name}, don't miss today's quiz! Keep your Rapid Recap streak going strong. 📚✨ Tap to log in now and stay on track!`,
      }
    },
  },

  streakMaintainReminder2: {
    from: 'rapidrecap2k23@gmail.com',
    subject: `Last Chance to Maintain Your Streak! ⏰`,
    html: ({ name, articlesForMail }) => `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Last Chance to Maintain Your Streak</title>
    <style type="text/css">
      @media screen and (max-width: 600px) {
        .article-table {
          width: 100% !important;
        }
        .td-article-card {
          width: 100% !important;
          display: block !important;
        }
        .article-card {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          display: block !important;
          margin-bottom: 20px !important;
        }
      }
      .article-table {
        width: 100%;
        table-layout: fixed;
      }
      .td-article-card {
        background-color: transparent !important;
      }
      .article-card {
        height: 265px;
        width: 220px;
        margin: 20px;
        box-sizing: border-box;
        background-color: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        vertical-align: top;
      }
      .article-image {
        width: 100%;
        max-width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        margin: 15px auto;
      }
      .article-title {
        font-size: 1em;
        color: #333;
        margin-top: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f4f4f4; padding:30px; margin:0;">
    <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.1);">
      <div style="text-align:center; border-bottom:1px solid #e0e0e0; padding-bottom:20px;">
        <a href="https://www.rapidrecap.co.in" style="font-size:2em; color:#00466a; text-decoration:none; font-weight:bold; display:flex; align-items:center; justify-content:center;">
          <img src="https://res.cloudinary.com/dxstsrnbs/image/upload/v1720002794/rr_qts9kn.png" alt="Rapid Recap Logo" style="width:40px; height:30px; margin-right:10px;">
          Rapid Recap
        </a>
      </div>
      <div style="padding:20px 0;">
        <p style="font-size:1.2em; color:#333;">Hello ${name} 👋,</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">We hope this message finds you well.</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">The day is almost over, but your streak doesn't have to be! Take a few minutes now to complete today's quiz and extend your impressive streak. Don't let the day end without keeping your momentum going!</p>
        <div style="text-align:center; margin:30px 0;">
          <a href="https://www.rapidrecap.co.in" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:1em;">Log in now</a>
        </div>

        <div style="margin-top:40px; background-color:#A0937D; padding:20px; border-radius:10px;">
          <h4 style="color:#fff; text-align:center;">Articles Recommended for you:</h4>

          <table class="article-table" cellpadding="0" cellspacing="0">
            <tr>
              ${
                articlesForMail.length > 0
                  ? articlesForMail
                      .map(
                        (article, index) => `
                          <td class="td-article-card">
                            <a href=${article.link}>
                              <div class="article-card">
                                <img src="${
                                  article.articleData.imgURL[0]
                                }" alt="Article Image" class="article-image">
                                <p class="article-title">${
                                  article.articleData.title
                                }</p>
                              </div>
                            </a>
                          </td>
                          ${
                            index % 2 === 1 &&
                            index < articlesForMail.length - 1
                              ? '</tr><tr>'
                              : ''
                          }
                      `,
                      )
                      .join('')
                  : ''
              }
            </tr>
          </table>
        </div>

        <p style="font-size:1em; color:#666; margin-top:40px;">Best regards,<br/>The Rapid Recap Team</p>
      </div>
      <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
      <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
        <p style="margin:0;">Rapid Recap Inc</p>
        <p style="margin:0;">India</p>
      </div>
      <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k23@gmail.com</a>.</p>
    </div>
  </body>
  </html>

  <style>
    div[style*="box-shadow"] {
      transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
    }
    div[style*="box-shadow"]:hover {
      box-shadow: 0 0 15px rgba(0, 70, 106, 0.3);
      transform: translateY(-5px);
    }
  </style>
  `,
    notif: ({ name }) => {
      return {
        title: `Last Chance to Keep Your Streak! ⏰`,
        body: `Hey ${name}, the day is almost over! Don't miss out on today's quiz and keep your Rapid Recap streak alive. 🌟📚 Tap to log in now!`,
      }
    },
  },

  streakMaintainReminder3: {
    from: 'rapidrecap2k23@gmail.com',
    subject: `Final Call to Keep Your Streak Alive! 🚨`,
    html: ({ name, articlesForMail }) => `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Final Call to Keep Your Streak Alive</title>
    <style type="text/css">
      @media screen and (max-width: 600px) {
        .article-table {
          width: 100% !important;
        }
        .td-article-card {
          width: 100% !important;
          display: block !important;
        }
        .article-card {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          display: block !important;
          margin-bottom: 20px !important;
        }
      }
      .article-table {
        width: 100%;
        table-layout: fixed;
      }
      .td-article-card {
        background-color: transparent !important;
      }
      .article-card {
        height: 265px;
        width: 220px;
        margin: 20px;
        box-sizing: border-box;
        background-color: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        vertical-align: top;
      }
      .article-image {
        width: 100%;
        max-width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        margin: 15px auto;
      }
      .article-title {
        font-size: 1em;
        color: #333;
        margin-top: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f4f4f4; padding:30px; margin:0;">
    <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.1);">
      <div style="text-align:center; border-bottom:1px solid #e0e0e0; padding-bottom:20px;">
        <a href="https://www.rapidrecap.co.in" style="font-size:2em; color:#00466a; text-decoration:none; font-weight:bold; display:flex; align-items:center; justify-content:center;">
          <img src="https://res.cloudinary.com/dxstsrnbs/image/upload/v1720002794/rr_qts9kn.png" alt="Rapid Recap Logo" style="width:40px; height:30px; margin-right:10px;">
          Rapid Recap
        </a>
      </div>
      <div style="padding:20px 0;">
        <p style="font-size:1.2em; color:#333;">Hello ${name} 👋,</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">We hope this message finds you well.</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">We noticed that you haven't completed today's quiz yet. Don't let your hard-earned streak come to an end!</p>
        <p style="font-size:1em; color:#666; margin-top:20px;">Keep your momentum going and set yourself up for success tomorrow by completing today's quiz.</p>
        <div style="text-align:center; margin:30px 0;">
          <a href="https://www.rapidrecap.co.in" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:1em;">Log in now</a>
        </div>

        <div style="margin-top:40px; background-color:#A0937D; padding:20px; border-radius:10px;">
          <h4 style="color:#fff; text-align:center;">Articles Recommended for you:</h4>

          <table class="article-table" cellpadding="0" cellspacing="0">
            <tr>
              ${
                articlesForMail.length > 0
                  ? articlesForMail
                      .map(
                        (article, index) => `
                          <td class="td-article-card">
                            <a href=${article.link}>
                              <div class="article-card">
                                <img src="${
                                  article.articleData.imgURL[0]
                                }" alt="Article Image" class="article-image">
                                <p class="article-title">${
                                  article.articleData.title
                                }</p>
                              </div>
                            </a>
                          </td>
                          ${
                            index % 2 === 1 &&
                            index < articlesForMail.length - 1
                              ? '</tr><tr>'
                              : ''
                          }
                      `,
                      )
                      .join('')
                  : ''
              }
            </tr>
          </table>
        </div>

        <p style="font-size:1em; color:#666; margin-top:40px;">Best regards,<br/>The Rapid Recap Team</p>
      </div>
      <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
      <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
        <p style="margin:0;">Rapid Recap Inc</p>
        <p style="margin:0;">India</p>
      </div>
      <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k23@gmail.com</a>.</p>
    </div>
  </body>
  </html>

  <style>
    div[style*="box-shadow"] {
      transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
    }
    div[style*="box-shadow"]:hover {
      box-shadow: 0 0 15px rgba(0, 70, 106, 0.3);
      transform: translateY(-5px);
    }
  </style>
  `,
    notif: ({ name }) => {
      return {
        title: `Final Call to Keep Your Streak Alive! 🚨`,
        body: `Hey ${name}, don't let your hard-earned streak end! Complete today's quiz now. 🌟📚 Tap to log in!`,
      }
    },
  },
  FestivalGreetings: {
    from: 'rapidrecap2k2023@gmail.com',
    subject: 'Festival Wishes and Updates',
    html: ({ title, mainText, name, img, articlesForMail }) => `
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Festival Greetings</title>
    <style type="text/css">
      @media screen and (max-width: 600px) {
        .article-table {
          width: 100% !important;
        }
        .td-article-card {
          width: 100% !important;
          display: block !important;
        }
        .article-card {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          display: block !important;
          margin-bottom: 20px !important;
        }
      }
      .article-table {
        width: 100%;
        table-layout: fixed;
      }
      .td-article-card {
        background-color: transparent !important;
      }
      .article-card {
        height: 265px;
        width: 220px;
        margin: 20px;
        box-sizing: border-box;
        background-color: #f5f5f5;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        vertical-align: top;
      }
      .article-image {
        width: 100%;
        max-width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        margin: 15px auto;
      }
      .article-title {
        font-size: 1em;
        color: #333;
        margin-top: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f0f0f0; padding:30px; margin:0;">
    <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.1);">
      <div style="padding:20px 0;">
        <p style="font-size:1.2em; color:#333;">Dear ${name},</p>
        <h4 style="color:#ff7f50;">${title}</h4>
        ${
          img
            ? `<div style="text-align: center; margin: 20px 0;"><img src="${img}" alt="Festival Image" style="max-width:100%; height:auto; border-radius:10px;"></div>`
            : ''
        }
        <p style="font-size:1em; color:#666; margin-top:20px;">${mainText.replace(
          /\n\n/g,
          '<br><br>',
        )}</p>

        <div style="margin-top:40px; background-color:#FFD700; padding:20px; border-radius:10px;">
          <h4 style="color:#fff; text-align:center;">Articles Recommended for you:</h4>

          <table class="article-table" cellpadding="0" cellspacing="0">
            <tr>
              ${
                articlesForMail.length > 0
                  ? articlesForMail
                      .map(
                        (article, index) => `
                          <td class="td-article-card">
                          <a href=${article.link}>
                          <div class="article-card">
                            <img src="${
                              article.articleData.imgURL[0]
                            }" alt="Article Image" class="article-image">
                            <p class="article-title">${
                              article.articleData.title
                            }</p>
                            </div>
                            </a>
                          </td>
                          ${
                            index % 2 === 1 &&
                            index < articlesForMail.length - 1
                              ? '</tr><tr>'
                              : ''
                          }
                      `,
                      )
                      .join('')
                  : ''
              }
            </tr>
          </table>
        </div>

        <p style="font-size:1em; color:#666; margin-top:40px;">Best regards,<br/>The Rapid Recap Team</p>
      </div>
      <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
    <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
      <p style="margin:0;">Rapid Recap Inc</p>
      <p style="margin:0;">Jaipur, India</p>
    </div>
    <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>P.S.:</strong> Don't forget to stay updated with our latest news and articles by subscribing to browser notifications! If you have any questions or need assistance with subscribing to notifications, feel free to reach out to our support team at <a href="mailto:rapidrecap2k2023@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k2023@gmail.com</a>. We're here to help!</p>
  </div>
  </body>
  </html>
  `,
  },
  userWeeklyReportTemplate: {
    from: 'rapidrecap2k23@gmail.com',
    subject: 'Your Rapid Recap Weekly Report',
    html: ({
      name,
      inGameName,
      society,
      circle,
      iqScore,
      iqChange,
      averageRQM,
      rqmChange,
      experienceLevel,
      ongoingSeason,
      totalQuizzesThisWeek,
      quizDistribution,
      tournamentRank,
      tournamentScore,
      topPlayers,
      categoryPerformance,
      rank,
    }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapid Recap Weekly Report</title>
  <style type="text/css">
    /* Reset styles for email clients */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    /* Base styles */
    body {
      margin: 0;
      padding: 0;
      font-family: 'Arial', sans-serif;
      font-size: 18px;
      line-height: 1.6;
      background-color: #121212;
      color: #ffffff;
    }
    table {
      border-collapse: collapse;
    }
    h1, h2, h3 {
      color: #bb86fc;
      margin-top: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1e1e1e;
    }
    .header {
      background: linear-gradient(135deg, #4b0082, #9c27b0);
      color: #ffffff;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 48px;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .content {
      padding: 40px 20px;
    }
    .section {
      margin-bottom: 40px;
    }
    .card {
      background-color: #2c2c2c;
      border: 1px solid #3d3d3d;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      color: #ffffff;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .metric {
      display: inline-block;
      margin-right: 30px;
      margin-bottom: 20px;
    }
    .metric-label {
      font-weight: bold;
      color: #bb86fc;
      font-size: 20px;
    }
    .metric-value {
      font-size: 24px;
      color: #03dac6;
    }
    .chart {
      background-color: #333333;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
    }
    .footer {
      background-color: #121212;
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    /* Updated styles for table-based charts */
    .chart-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 10px;
    }
    .chart-bar {
      background: linear-gradient(to top, #6a1b9a, #9c27b0);
      text-align: center;
      color: #ffffff;
      font-weight: bold;
      border-radius: 8px 8px 0 0;
      position: relative;
    }
    .chart-value {
      position: absolute;
      top: -30px;
      left: 0;
      right: 0;
      color: #03dac6;
      font-size: 18px;
      font-weight: bold;
    }
    .chart-label {
      text-align: center;
      color: #e0e0e0;
      font-size: 16px;
      padding-top: 10px;
    }
    @media screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }
      .content-block {
        padding: 20px !important;
      }
    }
    .personal-info {
      font-size: 22px;
    }
    .personal-info .name {
      font-weight: bold;
    }
    .personal-info .in-game-name {
      color: #bb86fc;
      margin-top: 5px;
    }
    .personal-info .society-circle {
      color: #03dac6;
    }
    .top-players-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 10px;
    }
    .top-players-table td {
      padding: 10px 0;
    }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" class="container">
    <tr>
      <td class="header">
        <h1>Rapid Recap</h1>
        <p style="font-size: 24px;">Weekly Report Season ${ongoingSeason}</p>
      </td>
    </tr>
    <tr>
      <td class="content">
        <div class="section">
          <h2 style="font-size: 36px;">Main Report</h2>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="50%" valign="top">
                <div class="card">
                  <h3 style="font-size: 28px;">Personal Info</h3>
                  <div class="personal-info">
                    <p class="name">${name}</p>
                    <p class="in-game-name">@${inGameName}</p>
                    <p class="society-circle"><strong>Society:</strong> ${society}</p>
                    <p class="society-circle"><strong>Circle:</strong> ${circle}</p>
                  </div>
                </div>
              </td>
              <td width="50%" valign="top">
                <div class="card">
                  <h3 style="font-size: 28px;">Performance Metrics</h3>
                  <div class="metric">
                    <div class="metric-label">IQ Score</div>
                    <div class="metric-value">${iqScore} (${
      iqChange >= 0 ? '+' : ''
    }${iqChange})</div>
                  </div>
                  <div class="metric">
                    <div class="metric-label">Average RQM</div>
                    <div class="metric-value">${averageRQM} (${
      rqmChange >= 0 ? '+' : ''
    }${rqmChange})</div>
                  </div>
                  <div class="metric">
                    <div class="metric-label">Experience Level</div>
                    <div class="metric-value">${experienceLevel}</div>
                  </div>
                  <div class="metric">
                    <div class="metric-label">Main Leaderboard Rank</div>
                    <div class="metric-value">${rank}</div>
                  </div>
                  <div class="metric">
                    <div class="metric-label">Total Quizzes This Week</div>
                    <div class="metric-value">${totalQuizzesThisWeek}</div>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </div>
        <div class="section">
          <h2 style="font-size: 36px;">Quiz Distribution</h2>
          <div class="chart">
            <table class="chart-table">
              <tr>
                ${quizDistribution
                  ?.map(
                    item => `
                  <td style="vertical-align: bottom; height: 250px;">
                    <div class="chart-value">${item.value}</div>
                    <div class="chart-bar" style="height: ${item.height}px;"></div>
                  </td>
                `,
                  )
                  ?.join('')}
              </tr>
              <tr>
                ${quizDistribution
                  ?.map(
                    item => `
                  <td class="chart-label">${item.label}</td>
                `,
                  )
                  ?.join('')}
              </tr>
            </table>
          </div>
        </div>
        <div class="section">
          <h2 style="font-size: 36px;">Tournament Report</h2>
          <div class="card">
            <h3 style="font-size: 28px;">Top 5 Players</h3>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="top-players-table">
              <tr>
                <th align="left" style="font-size: 22px; padding-bottom: 10px;">Rank</th>
                <th align="left" style="font-size: 22px; padding-bottom: 10px;">Player</th>
                <th align="left" style="font-size: 22px; padding-bottom: 10px;">Score</th>
              </tr>
              ${topPlayers
                ?.map(
                  (player, index) => `
                <tr>
                  <td style="font-size: 20px;">${index + 1}</td>
                  <td style="font-size: 20px;">${player.name}<br>@${
                    player.inGameName
                  }</td>
                  <td style="font-size: 20px;">${player.score}</td>
                </tr>
              `,
                )
                ?.join('')}
            </table>
            <p style="font-size: 22px;"><strong>Your Rank:</strong> ${tournamentRank}</p>
            <p style="font-size: 22px;"><strong>Your Score:</strong> ${tournamentScore}</p>
          </div>
        </div>
        <div class="section">
          <h3 style="font-size: 28px;">Your Performance by Category</h3>
          <div class="chart">
            <table class="chart-table">
              <tr>
                ${categoryPerformance
                  ?.map(
                    category => `
                  <td style="vertical-align: bottom; height: 300px;">
                    <div class="chart-value">${category.value}%</div>
                    <div class="chart-bar" style="height: ${category.height}px;"></div>
                  </td>
                `,
                  )
                  ?.join('')}
              </tr>
              <tr>
                ${categoryPerformance
                  ?.map(
                    category => `
                  <td class="chart-label">${category.name}</td>
                `,
                  )
                  ?.join('')}
              </tr>
            </table>
          </div>
        </div>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p style="font-size: 20px;">Rapid Recap Inc</p>
        <p style="font-size: 18px;">Jaipur, India</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
}

module.exports = MailTemplates
