const { extractNewsUtilityFunc } = require('../../utils/article.utils')
const { mailTransporter } = require('../../utils/mail.utils')
const generateSitemap = require('../../generate-sitemap')

async function extractNews(country) {
  try {
    const { result, articlesSavedPerCategory } = await extractNewsUtilityFunc(
      country,
    )
    const transporter = await mailTransporter()

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>News Update from Rapid Recap</title>
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
            <p style="font-size:1.2em; color:#333;">Hello,</p>
            <p style="font-size:1em; color:#666;">We've successfully updated our database with the latest news articles. Here's a summary of the articles added per category:</p>

            <table style="width:100%; border-collapse:collapse; margin-top:20px;">
                <thead>
                    <tr style="background-color:#00466a; color:white;">
                        <th style="padding:10px; text-align:left;">Category</th>
                        <th style="padding:10px; text-align:right;">Articles Added</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(articlesSavedPerCategory)
                      .map(
                        ([category, count]) => `
                        <tr style="border-bottom:1px solid #e0e0e0;">
                            <td style="padding:10px; text-align:left;">${category}</td>
                            <td style="padding:10px; text-align:right;">${count}</td>
                        </tr>
                    `,
                      )
                      .join('')}
                </tbody>
            </table>

            <p style="font-size:1em; color:#666; margin-top:20px;">Total articles added: ${Object.values(
              articlesSavedPerCategory,
            ).reduce((a, b) => a + b, 0)}</p>
        </div>
        <p style="font-size:1em; color:#666; margin-top:40px;">Best regards,<br/>The Rapid Recap Team</p>
    </div>
    <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
    <div style="font-size:0.9em; color:#999; line-height:1.4; text-align:center;">
        <p style="margin:0;">Rapid Recap Inc</p>
        <p style="margin:0;">Jaipur, India</p>
    </div>
    <p style="font-size:0.9em; color:#666; margin-top:20px; text-align:center;"><strong>P.S.:</strong> Don't forget to stay updated with our latest news and articles by subscribing to browser notifications! If you have any questions or need assistance with subscribing to notifications, feel free to reach out to our support team at <a href="mailto:rapidrecap2k2023@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k2023@gmail.com</a>. We're here to help!</p>
</body>
</html>
    `

    await transporter.sendMail({
      from: 'rapidrecap2k23@gmail.com',
      to: '20ucs174@lnmiit.ac.in',
      subject: 'News updated in database',
      html: htmlTemplate,
    })
    generateSitemap()
    console.log(`No. of news fetched for DB : ${result.length}`)
    console.log(articlesSavedPerCategory)
    console.log(`News extracted successfully for country: ${country}`)
  } catch (error) {
    console.error(`Error extracting news for country ${country}:`, error)
  }
}

module.exports = extractNews
