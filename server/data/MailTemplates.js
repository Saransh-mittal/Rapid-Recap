const recommendedArticles = `<div style="margin-top:40px;">
        <h4 style="color:#333; text-align:center;">Articles Recommended for you:</h4>
        <div style="display:flex; justify-content:space-between; margin-top:20px;">
          <div style="width:30%; background-color:#f9f9f9; padding:10px; border-radius:8px; text-align:center; box-shadow:0 0 10px rgba(0,0,0,0.1); transition:transform 0.3s ease-in-out;">
            <img src="https://via.placeholder.com/150" alt="Article Image" style="width:100%; height:auto; border-radius:8px; transition:transform 0.3s ease-in-out;">
            <p style="font-size:1em; color:#333; margin-top:10px;">Article Title 1</p>
          </div>
          <div style="width:30%; background-color:#f9f9f9; padding:10px; border-radius:8px; text-align:center; box-shadow:0 0 10px rgba(0,0,0,0.1); transition:transform 0.3s ease-in-out;">
            <img src="https://via.placeholder.com/150" alt="Article Image" style="width:100%; height:auto; border-radius:8px; transition:transform 0.3s ease-in-out;">
            <p style="font-size:1em; color:#333; margin-top:10px;">Article Title 2</p>
          </div>
          <div style="width:30%; background-color:#f9f9f9; padding:10px; border-radius:8px; text-align:center; box-shadow:0 0 10px rgba(0,0,0,0.1); transition:transform 0.3s ease-in-out;">
            <img src="https://via.placeholder.com/150" alt="Article Image" style="width:100%; height:auto; border-radius:8px; transition:transform 0.3s ease-in-out;">
            <p style="font-size:1em; color:#333; margin-top:10px;">Article Title 3</p>
          </div>
        </div>
      </div>`
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
    subject: "Let's Get Back on Track! 🔄",
    html: ({ name, articlesForMail }) => `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Let's Get Back on Track!</title>
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
        <p style="font-size:1em; color:#666; margin-top:20px;">We noticed that your Rapid Recap streak of daily quizzes was broken, but don't worry – setbacks happen! Let's get you back on track and continue your journey towards mastering knowledge.</p>
        <div style="text-align:center; margin:30px 0;">
          <a href="https://www.rapidrecap.co.in" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:1em;">Log in now</a>
        </div>
        <p style="font-size:1em; color:#666; margin-top:20px;">Daily quizzes are a great way to stay sharp and engaged. Log in now and resume your streak by taking today's quiz. Remember, consistency is key to progress!</p>

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
}

module.exports = MailTemplates
