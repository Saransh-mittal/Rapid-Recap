// /scheduler/tasks/monthlyDemotionTask.js
const {
  executeMonthlyDemotionWithMaintenance,
} = require('../../services/demotionMaintenanceService')
const moment = require('moment-timezone')
const { mailTransporter } = require('../../utils/mail.utils')
const { distributeRewards } = require('../../services/distributeRewardsService')

const sendMonthlyRefreshMail = async stats => {
  try {
    const transporter = await mailTransporter()

    const emailTemplate = {
      from: 'rapidrecap2k23@gmail.com',
      to: '20ucs174@lnmiit.ac.in',
      subject: 'Monthly Leaderboard Refresh Report',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2c3e50;">Monthly Leaderboard Refresh Report</h2>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Refresh Summary</h3>
            <p><strong>Statistics Processed:</strong> ${
              stats.statsProcessed
            }</p>
            <p><strong>Demotions Processed:</strong> ${
              stats.demotionsProcessed
            }</p>
            <p><strong>Errors Encountered:</strong> ${
              stats.errors || 'None'
            }</p>
            <p><strong>Execution Time:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #7f8c8d; font-size: 14px;">
              This is an automated message from the RapidRecap system.
              Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(emailTemplate)
    console.log('Monthly refresh email sent successfully')
  } catch (error) {
    console.error('Error sending monthly refresh email:', error)
  }
}

// Schedule monthly demotion task
// Runs at 00:00 UTC on the 1st of every month
const demotionTask = async () => {
  console.log('Initiating monthly leaderboard refresh process...')

  try {
    // Check if it's the right time
    const currentUTC = moment.utc()
    if (currentUTC.date() !== 1 || currentUTC.hour() !== 0) {
      console.log('Not the correct time for monthly refresh')
      return
    }
    // Check if it's March 1st, 2025 specifically for winners distribution
    const isMarch2025 = currentUTC.year() === 2025 && currentUTC.month() === 2 // month is 0-based, so 2 is March

    if (isMarch2025) {
      const winners = await distributeRewards()
      console.log(`Successfully distributed ${winners.length} rewards`)
    }
    const result = await executeMonthlyDemotionWithMaintenance()

    console.log('Monthly refresh completed:', {
      statsProcessed: result.stats.processedCount,
      demotionsProcessed: result.demotion.processedCount,
      errors: result.stats.statsErrors,
    })

    // Send email notification with results
    await sendMonthlyRefreshMail({
      statsProcessed: result.stats.processedCount,
      demotionsProcessed: result.demotion.processedCount,
      errors: result.stats.statsErrors,
    })
  } catch (error) {
    console.error('Monthly refresh failed:', error)
  }
}

// Function for manual trigger (admin only)
const triggerManualDemotion = async () => {
  try {
    return await executeMonthlyDemotionWithMaintenance()
  } catch (error) {
    console.error('Manual demotion trigger failed:', error)
    throw error
  }
}

module.exports = {
  demotionTask,
  triggerManualDemotion,
}
