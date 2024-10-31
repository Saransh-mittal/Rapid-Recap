const BotVerifier = require('../utils/botVerifier')
const { trackBotVisit } = require('../utils/botTracker')

const searchConsoleMiddleware = async (req, res, next) => {
  const userAgent = req.headers['user-agent'] || ''
  const isGoogleTool =
    userAgent.toLowerCase().includes('google') ||
    userAgent.toLowerCase().includes('lighthouse')

  if (isGoogleTool) {
    const startTime = Date.now()
    const ip = BotVerifier.getRealIP(req)

    // Enhanced tool type detection
    const toolType = userAgent.includes('Google-InspectionTool')
      ? 'Search Console Inspection'
      : userAgent.includes('Googlebot/')
      ? 'Googlebot'
      : userAgent.includes('Chrome-Lighthouse')
      ? 'Lighthouse'
      : userAgent.includes('GoogleOther')
      ? 'Google Other'
      : 'Unknown Google Tool'

    console.log(`\n🔍 ${toolType} Request:`, {
      url: req.originalUrl,
      ip,
      userAgent,
    })

    try {
      // Detailed verification checks
      const validUA = BotVerifier.hasValidUserAgent(userAgent)
      const ipRangeCheck = BotVerifier.isInIPRange(ip, 'Googlebot')

      // Perform DNS verification only if initial checks pass
      let dnsVerified = false
      let verificationError = null

      if (validUA && ipRangeCheck) {
        try {
          const fullVerification = await BotVerifier.verifyBotIP(ip, userAgent)
          dnsVerified = fullVerification
        } catch (error) {
          verificationError = error.message
        }
      }

      const verificationTime = Date.now() - startTime
      const isVerified = validUA && ipRangeCheck && dnsVerified

      if (isVerified) {
        console.log('✅ Verified Google Tool:', {
          type: toolType,
          verificationTime: `${verificationTime}ms`,
          url: req.originalUrl,
        })
      } else {
        console.log('❌ Unverified Google Tool:', {
          type: toolType,
          reasons: {
            userAgent: validUA ? 'valid' : 'invalid',
            ipRange: ipRangeCheck ? 'valid' : 'invalid',
            dnsCheck: dnsVerified ? 'valid' : 'failed',
            error: verificationError,
          },
          url: req.originalUrl,
        })
      }

      // Store detailed verification info
      req.botInfo = {
        isBot: true,
        isVerified,
        botName: toolType,
        verificationDetails: {
          userAgentValid: validUA,
          ipRangeValid: ipRangeCheck,
          dnsVerified,
          verificationTime,
        },
      }

      // Track only verified visits
      if (isVerified) {
        await trackBotVisit({
          botName: toolType,
          userAgent,
          url: req.originalUrl,
          verified: true,
          receivedSSR: true,
          responseTime: verificationTime,
        })
      }
    } catch (error) {
      console.error('Error in verification process:', {
        type: toolType,
        error: error.message,
        url: req.originalUrl,
      })
    }
  }

  next()
}

module.exports = searchConsoleMiddleware
