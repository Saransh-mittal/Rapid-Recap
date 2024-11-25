// File Path: server/utils/botTracker.js

const { mailTransporter } = require('./mail.utils')
const cron = require('node-cron')

// In-memory storage using closure
const createDailyStats = () => {
  let dailyStats = new Map()

  return {
    track: ({
      botName,
      userAgent,
      url,
      verified,
      receivedSSR,
      responseTime,
    }) => {
      const stats = dailyStats.get(botName) || {
        visits: 0,
        verifiedVisits: 0,
        ssrServed: 0,
        totalResponseTime: 0,
        urls: new Set(),
        userAgents: new Set(),
      }

      stats.visits++
      if (verified) stats.verifiedVisits++
      if (receivedSSR) stats.ssrServed++
      stats.totalResponseTime += responseTime
      stats.urls.add(url)
      stats.userAgents.add(userAgent)

      dailyStats.set(botName, stats)
    },
    getStats: () => dailyStats,
    reset: () => {
      dailyStats = new Map()
    },
  }
}

// Create stats tracker
const statsTracker = createDailyStats()

// Generate HTML report content
const generateReportHtml = stats => {
  let totalVisits = 0
  let emailContent = `
    <h2>Bot Visits Summary - ${new Date().toLocaleDateString()}</h2>
    <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
      <tr style="background-color: #f2f2f2;">
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Bot Name</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total Visits</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Verified %</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">SSR Success %</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Avg Response Time</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Unique URLs</th>
      </tr>
  `

  // Store URL details for the detailed section
  let urlDetails = ''

  stats.forEach((botStats, botName) => {
    totalVisits += botStats.visits
    const verifiedPercent = (
      (botStats.verifiedVisits / botStats.visits) *
      100
    ).toFixed(1)
    const ssrPercent = ((botStats.ssrServed / botStats.visits) * 100).toFixed(1)
    const avgResponseTime = (
      botStats.totalResponseTime / botStats.visits
    ).toFixed(0)

    const verifiedColor = verifiedPercent >= 90 ? 'green' : 'orange'
    const ssrColor = ssrPercent >= 90 ? 'green' : 'red'

    emailContent += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${botName}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${botStats.visits}</td>
        <td style="border: 1px solid #ddd; padding: 8px; color: ${verifiedColor};">${verifiedPercent}%</td>
        <td style="border: 1px solid #ddd; padding: 8px; color: ${ssrColor};">${ssrPercent}%</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${avgResponseTime}ms</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${botStats.urls.size}</td>
      </tr>
    `

    // Add URL details section for each bot
    urlDetails += `
      <div style="margin-top: 20px;">
        <h3 style="color: #333;">${botName} - Crawled URLs</h3>
        <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
          <ol style="margin: 0; padding-left: 20px;">
            ${Array.from(botStats.urls)
              .sort()
              .map(url => `<li style="margin: 5px 0;">${url}</li>`)
              .join('')}
          </ol>
        </div>
      </div>
    `
  })

  emailContent += `
    </table>
    <p style="margin-top: 20px;">Total bot visits today: ${totalVisits}</p>

    <div style="margin-top: 30px;">
      <h2>Detailed URL Breakdown</h2>
      ${urlDetails}
    </div>
  `

  return emailContent
}

// Send daily report
const sendDailyReport = async email => {
  try {
    const transporter = await mailTransporter()
    const stats = statsTracker.getStats()

    if (stats.size === 0) {
      console.log('No bot visits to report today')
      return false
    }

    const emailContent = generateReportHtml(stats)

    await transporter.sendMail({
      from: 'rapidrecap2k23@gmail.com',
      to: email || '20ucs174@lnmiit.ac.in',
      subject: `Bot Analytics Report - ${new Date().toLocaleDateString()}`,
      html: emailContent,
    })

    console.log('Daily bot report sent successfully')
    statsTracker.reset()
    return true
  } catch (error) {
    console.error('Error sending daily report:', error)
    return false
  }
}

// Setup daily report schedule
const setupDailyReport = () => {
  // Run at 11:48 PM every day
  cron.schedule('48 23 * * *', sendDailyReport)
}

// Track bot visit
const trackBotVisit = async visitData => {
  statsTracker.track(visitData)
}

// Initialize tracking
const initBotTracking = () => {
  if (process.env.NODE_ENV === 'production') {
    setupDailyReport()
  }
}

module.exports = {
  trackBotVisit,
  initBotTracking,
  sendDailyReport, // Exported for manual triggering in development
  statsTracker,
}
