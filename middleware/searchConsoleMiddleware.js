const BotVerifier = require('../utils/botVerifier')
const { trackBotVisit } = require('../utils/botTracker')

const searchConsoleMiddleware = async (req, res, next) => {
  const userAgent = req.headers['user-agent'] || ''

  // Only process Google-related requests
  const isGoogleTool =
    userAgent.toLowerCase().includes('google') ||
    userAgent.toLowerCase().includes('lighthouse')

  if (isGoogleTool) {
    const startTime = Date.now()
    const ip = BotVerifier.getRealIP(req)

    // Identify the specific Google tool
    const toolType = userAgent.includes('Google-InspectionTool')
      ? 'Search Console Inspection'
      : userAgent.includes('Googlebot')
      ? 'Googlebot'
      : userAgent.includes('Chrome-Lighthouse')
      ? 'Lighthouse'
      : 'Other Google Tool'

    console.log(`\n🔍 ${toolType} Request:`, {
      url: req.originalUrl,
      ip,
      userAgent,
    })

    try {
      // Verify the bot
      const isLegitBot = await BotVerifier.isLegitimateBot(req)
      const verificationTime = Date.now() - startTime

      // Only log verification result
      if (isLegitBot) {
        console.log('✅ Verified Google Tool:', {
          type: toolType,
          verificationTime: `${verificationTime}ms`,
          url: req.originalUrl,
        })
      } else {
        console.log('❌ Unverified Google Tool:', {
          type: toolType,
          reason: 'Verification failed',
          url: req.originalUrl,
        })
      }

      // Track verified visits
      if (isLegitBot) {
        await trackBotVisit({
          botName: toolType,
          userAgent,
          url: req.originalUrl,
          verified: true,
          receivedSSR: true,
          responseTime: verificationTime,
        })
      }

      // Store verification result
      req.botInfo = {
        isBot: true,
        isVerified: isLegitBot,
        botName: toolType,
        verificationTime,
      }
    } catch (error) {
      console.error('Error verifying Google tool:', {
        type: toolType,
        error: error.message,
        url: req.originalUrl,
      })
    }
  }

  next()
}

module.exports = searchConsoleMiddleware
