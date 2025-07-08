// scheduler/tasks/fetchIndoPakNews.js
const SpecialCategory = require('../../../model/specialCategorySchema')
const {
  runScraper,
  processScrapedArticles,
} = require('../../../utils/scraper.utils/indoPakNewsRunner')
const { mailTransporter } = require('../../../utils/mail.utils')

/**
 * Fetch Indo-Pak news for the designated special category
 */
const fetchIndoPakNews = async () => {
  try {
    console.log('Starting scheduled Indo-Pak news fetch...')

    // Find the active Indo-Pak news special category
    const now = new Date()
    const specialCategory = await SpecialCategory.findOne({
      key: 'indo-pak',
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })

    if (!specialCategory) {
      console.log('No active Indo-Pak special category found. Skipping fetch.')
      return
    }

    // Run the scraper
    const articles = await runScraper(specialCategory.key)

    if (!articles || articles.length === 0) {
      console.log('No articles found by the Indo-Pak scraper')
      return
    }

    // Process and save articles
    const results = await processScrapedArticles(articles, specialCategory._id)

    // Update the lastFetched timestamp
    specialCategory.lastFetched = new Date()
    await specialCategory.save()

    console.log(
      `Indo-Pak news fetch completed. Added: ${results.added}, Duplicates: ${results.duplicates}, Errors: ${results.errors}`,
    )

    // Send notification email if articles were added
    if (results.added > 0) {
      await sendNotificationEmail(specialCategory, results, articles.length)
    }

    return results
  } catch (error) {
    console.error('Error in Indo-Pak news fetch:', error)
    throw error
  }
}

/**
 * Send notification email about the fetch results
 */
const sendNotificationEmail = async (category, results, totalFetched) => {
  try {
    const transporter = await mailTransporter()

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a2e69; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .stats { margin-bottom: 15px; padding: 10px; background-color: #fff; border-radius: 5px; }
    .success { color: #28a745; }
    .warning { color: #ffc107; }
    .error { color: #dc3545; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Indo-Pak News Update</h2>
    </div>
    <div class="content">
      <p>The system has completed a scheduled fetch of Indo-Pak news articles. Here's a summary:</p>

      <div class="stats">
        <h3>${category.name} Category Update</h3>
        <p><strong>Total articles fetched:</strong> ${totalFetched}</p>
        <p class="success"><strong>Articles added:</strong> ${results.added}</p>
        <p class="warning"><strong>Duplicates skipped:</strong> ${
          results.duplicates
        }</p>
        <p class="error"><strong>Errors:</strong> ${results.errors}</p>
      </div>

      ${
        results.errorDetails && results.errorDetails.length > 0
          ? `
      <div class="stats">
        <h3>Error Details</h3>
        <ul>
          ${results.errorDetails
            .map(err => `<li>${err.title}: ${err.error}</li>`)
            .join('')}
        </ul>
      </div>
      `
          : ''
      }

      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `

    await transporter.sendMail({
      from: 'rapidrecap2k23@gmail.com',
      to: '20ucs174@lnmiit.ac.in', // Change to your admin email
      subject: `Indo-Pak News Update: ${results.added} articles added`,
      html: htmlContent,
    })

    console.log('Indo-Pak news fetch notification email sent')
  } catch (error) {
    console.error('Error sending notification email:', error)
  }
}

module.exports = fetchIndoPakNews
