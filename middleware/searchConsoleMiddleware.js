const BotVerifier = require('../utils/botVerifier')
const { trackBotVisit } = require('../utils/botTracker')

const searchConsoleMiddleware = async (req, res, next) => {
  const startTime = Date.now()
  const userAgent = req.headers['user-agent'] || ''
  const ip = BotVerifier.getRealIP(req)

  // Log every request's basic info
  console.log('\n🔍 Incoming Request:', {
    timestamp: new Date().toISOString(),
    url: req.originalUrl,
    method: req.method,
  })

  // Log detailed headers for inspection
  console.log('📋 Request Headers:', {
    'user-agent': userAgent,
    accept: req.headers.accept,
    'accept-encoding': req.headers['accept-encoding'],
    'accept-language': req.headers['accept-language'],
    'cache-control': req.headers['cache-control'],
    host: req.headers.host,
    referer: req.headers.referer,
    'x-forwarded-for': req.headers['x-forwarded-for'],
    'x-real-ip': req.headers['x-real-ip'],
  })

  // Log IP information
  console.log('🌐 IP Information:', {
    detectedIP: ip,
    originalIP: req.ip,
    forwardedIP: req.headers['x-forwarded-for'],
    realIP: req.headers['x-real-ip'],
  })

  // Check if it might be a Google bot request
  const isGoogleRelated =
    userAgent.toLowerCase().includes('google') ||
    userAgent.toLowerCase().includes('lighthouse') ||
    userAgent.toLowerCase().includes('chrome-lighthouse')

  if (isGoogleRelated) {
    console.log('🤖 Google-related Request Detected!')
    console.log('User Agent Analysis:', {
      fullUserAgent: userAgent,
      isGooglebot: userAgent.includes('Googlebot'),
      isLighthouse: userAgent.includes('Chrome-Lighthouse'),
      isPageSpeed: userAgent.includes('PageSpeed'),
      isMobile: userAgent.includes('Mobile'),
    })

    try {
      // Log the bot verification process
      console.log('🔒 Starting Bot Verification...')

      // Check user agent validity
      const hasValidUA = BotVerifier.hasValidUserAgent(userAgent)
      console.log('1. User Agent Check:', {
        isValid: hasValidUA,
        timeStamp: new Date().toISOString(),
      })

      // Check IP ranges
      const isInRange = BotVerifier.isInIPRange(ip, 'Googlebot')
      console.log('2. IP Range Check:', {
        isValid: isInRange,
        ip: ip,
        timeStamp: new Date().toISOString(),
      })

      // Full bot verification
      const isLegitBot = await BotVerifier.isLegitimateBot(req)
      const verificationTime = Date.now() - startTime

      console.log('3. Full Verification Result:', {
        isLegitimateBot: isLegitBot,
        verificationTimeMs: verificationTime,
        timeStamp: new Date().toISOString(),
      })

      // Track in bot tracker
      await trackBotVisit({
        botName: 'Googlebot',
        userAgent,
        url: req.originalUrl,
        verified: isLegitBot,
        receivedSSR: true,
        responseTime: verificationTime,
      })

      // Store verification info
      req.botInfo = {
        isBot: true,
        isVerified: isLegitBot,
        botName: 'Googlebot',
        verificationTime,
        userAgent,
        ip,
      }

      // Log final assessment
      console.log('✅ Request Processing Complete:', {
        duration: `${verificationTime}ms`,
        isVerifiedBot: isLegitBot,
        url: req.originalUrl,
        timeStamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('❌ Error in Search Console middleware:', {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        userAgent,
        ip,
        timeStamp: new Date().toISOString(),
      })
    }
  }

  // Log response headers being sent back
  res.on('finish', () => {
    console.log('📤 Response Sent:', {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      responseTime: Date.now() - startTime,
      headers: res.getHeaders(),
      timeStamp: new Date().toISOString(),
    })
  })

  next()
}

module.exports = searchConsoleMiddleware
