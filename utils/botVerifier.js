const dns = require('dns')
const { promisify } = require('util')
const reverse = promisify(dns.reverse)
const lookup = promisify(dns.lookup)

class BotVerifier {
  // Known bot configurations remain the same
  static get botConfigs() {
    return {
      Googlebot: {
        domains: ['.googlebot.com', '.google.com'],
        ipRanges: ['66.249.', '64.68.', '72.14.', '74.125.', '216.239.'],
        patterns: [
          'Googlebot/',
          'Googlebot-News',
          'Googlebot-Image/',
          'Googlebot-Video/',
          'Googlebot-Mobile/',
          'AdsBot-Google',
          'Mediapartners-Google',
          'APIs-Google',
          'Google-Read-Aloud',
          'Google-Site-Verification',
          'Google-InspectionTool', // Added Google Inspection Tool pattern
          'compatible; Google-InspectionTool', // Added alternative pattern
          'Android.*compatible; Googlebot/', // For mobile Googlebot
          'compatible; GoogleOther', // Add this
          'compatible; Googlebot/2.1', // Added for standard Googlebot
          'compatible; Googlebot-Mobile/2.1', // Added for mobile Googlebot
          '(compatible; Googlebot/2.1; +http://www.google.com/bot.html)', // Added full signature
          'Chrome.*Mobile.*compatible; Googlebot/', // Added for Chrome mobile
          'Android.*compatible; Googlebot/', // Added for Android
        ],
      },
      PageSpeedInsights: {
        domains: ['.google.com', '.googleusercontent.com'],
        ipRanges: [
          '66.249.', // Google crawler IPs
          '64.68.',
          '72.14.',
          '74.125.',
          '216.239.',
          '35.235.', // Google Cloud IPs
          '35.192.',
          '35.241.',
          '35.190.', // Additional PageSpeed IPs
          '130.211.',
          '172.217.',
          '172.253.',
          '142.250.',
          '108.177.',
        ],
        patterns: [
          'Chrome-Lighthouse',
          'PageSpeed Insights',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko; Google Page Speed Insights) Chrome',
        ],
      },
      Bingbot: {
        domains: ['.search.msn.com'],
        ipRanges: ['157.55.', '207.46.', '40.77.', '13.66.'],
        patterns: ['bingbot/', 'BingPreview'],
      },
      Yandexbot: {
        domains: ['.yandex.ru', '.yandex.com', '.yandex.net'],
        ipRanges: ['100.43.', '37.9.', '37.140.'],
        patterns: ['YandexBot/', 'YandexImages/', 'YandexMetrika/'],
      },
      DuckDuckBot: {
        domains: ['.duckduckgo.com'],
        ipRanges: ['50.16.', '54.208.'],
        patterns: ['DuckDuckBot/'],
      },
      Baiduspider: {
        domains: ['.baidu.com', '.baidu.jp'],
        ipRanges: ['180.76.', '123.125.'],
        patterns: ['Baiduspider/', 'Baiduspider-image/', 'Baiduspider-video/'],
      },
      // Social Media Bots
      facebookexternalhit: {
        domains: ['.facebook.com', '.fbsv.net'],
        ipRanges: ['69.63.', '31.13.', '173.252.'],
        patterns: ['facebookexternalhit/', 'FacebookBot'],
      },
      LinkedInBot: {
        domains: ['.linkedin.com'],
        ipRanges: ['108.174.', '104.215.'],
        patterns: ['LinkedInBot/'],
      },
      Twitterbot: {
        domains: ['.twitter.com', '.twimg.com'],
        ipRanges: ['199.16.', '199.59.'],
        patterns: ['Twitterbot/'],
      },
    }
  }

  static get knownBots() {
    return Object.keys(this.botConfigs)
  }

  static getRealIP(req) {
    // Enhanced IP detection for proxy environments
    return (
      req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress
    ).replace(/^::ffff:/, '')
  }

  static getBotConfig(userAgent) {
    const botName = this.knownBots.find(bot =>
      this.botConfigs[bot].patterns.some(pattern =>
        userAgent.toLowerCase().includes(pattern.toLowerCase()),
      ),
    )
    return botName ? this.botConfigs[botName] : null
  }

  static hasValidUserAgent(userAgent) {
    if (!userAgent) return false

    // Special handling for PageSpeed Insights
    if (
      userAgent.includes('Chrome-Lighthouse') ||
      userAgent.includes('PageSpeed Insights') ||
      userAgent.includes('Google-InspectionTool') ||
      userAgent.includes('compatible; Googlebot/') || // Added
      (userAgent.includes('Android') &&
        userAgent.includes('compatible; Googlebot/')) // Added
    ) {
      return true
    }

    // Modified browser check
    const isBrowser = /chrome|firefox|safari|opera|edge/i.test(userAgent)
    const isGoogleBot =
      userAgent.includes('Googlebot/') ||
      userAgent.includes('compatible; Googlebot/')

    // Allow if it's a Googlebot even if it contains browser strings
    if (
      isBrowser &&
      !isGoogleBot &&
      !userAgent.includes('Chrome-Lighthouse') &&
      !userAgent.includes('Google-InspectionTool')
    ) {
      return false
    }
    // Reject browsers pretending to be bots, but allow Chrome-Lighthouse
    if (
      /chrome|firefox|safari|opera|edge/i.test(userAgent) &&
      !userAgent.includes('Chrome-Lighthouse') &&
      !userAgent.includes('Google-InspectionTool') // Added condition
    ) {
      return false
    }

    // Check if it matches any known bot pattern
    return this.knownBots.some(bot =>
      this.botConfigs[bot].patterns.some(pattern =>
        userAgent.toLowerCase().includes(pattern.toLowerCase()),
      ),
    )
  }

  static isInIPRange(ip, botName) {
    const config = this.botConfigs[botName]
    if (!config?.ipRanges) return false

    const isValid = config.ipRanges.some(range => ip.startsWith(range))

    // Enhanced logging for IP range checks
    this.log('ip-range-check', {
      ip,
      botName,
      ranges: config.ipRanges,
      matched: isValid,
    })

    return isValid
  }

  static async verifyBotIP(ip, userAgent) {
    try {
      // Find which bot we're dealing with
      const botName = this.knownBots.find(bot =>
        this.botConfigs[bot].patterns.some(pattern =>
          userAgent.toLowerCase().includes(pattern.toLowerCase()),
        ),
      )
      // Special handling for mobile Googlebot and other Google tools
      const isMobileGooglebot =
        userAgent.includes('Android') &&
        userAgent.includes('compatible; Googlebot/')
      const isGoogleOther = userAgent.includes('GoogleOther')

      // For mobile Googlebot and GoogleOther, only check IP range
      if (isMobileGooglebot || isGoogleOther) {
        const ipValid = this.isInIPRange(ip, 'Googlebot')
        if (ipValid) {
          this.log('verification-succeeded', {
            ip,
            userAgent,
            botName: 'Googlebot',
            verifyMethod: 'ip-only',
          })
          return true
        }
        return false
      }

      if (
        userAgent.includes('GoogleOther') ||
        (userAgent.includes('Android') && userAgent.includes('Googlebot'))
      ) {
        return this.isInIPRange(ip, 'Googlebot')
      }
      // Enhanced logging for PageSpeed
      if (
        userAgent.includes('Chrome-Lighthouse') ||
        userAgent.includes('PageSpeed Insights') ||
        userAgent.includes('Google-InspectionTool') // Added condition
      ) {
        this.log('google-tool-verification-attempt', {
          ip,
          userAgent,
          botName,
          ipRangeMatch: botName ? this.isInIPRange(ip, botName) : false,
          tool: userAgent.includes('Google-InspectionTool')
            ? 'InspectionTool'
            : userAgent.includes('Chrome-Lighthouse')
            ? 'Lighthouse'
            : 'PageSpeed',
        })
      }

      if (!botName) {
        this.log('verification-failed', {
          reason: 'unknown-bot',
          ip,
          userAgent,
        })
        return false
      }

      // Quick IP range check
      if (!this.isInIPRange(ip, botName)) {
        this.log('verification-failed', {
          reason: 'ip-range-mismatch',
          ip,
          userAgent,
          botName,
        })
        return false
      }

      // Step 1: Reverse DNS lookup (PTR record)
      const hostnames = await reverse(ip)
      if (!hostnames?.length) {
        this.log('verification-failed', {
          reason: 'no-reverse-dns',
          ip,
          userAgent,
          botName,
        })
        return false
      }

      const hostname = hostnames[0].toLowerCase()
      const validDomain = this.botConfigs[botName].domains.some(domain =>
        hostname.endsWith(domain),
      )

      if (!validDomain) {
        this.log('verification-failed', {
          reason: 'invalid-domain',
          ip,
          userAgent,
          botName,
          hostname,
        })
        return false
      }

      // Step 2: Forward DNS lookup (FCrDNS)
      const { address: resolvedIP } = await lookup(hostname)

      // Check if IPs are in the same subnet
      const originalIPParts = ip.split('.')
      const resolvedIPParts = resolvedIP.split('.')
      const sameSubnet =
        originalIPParts.slice(0, 3).join('.') ===
        resolvedIPParts.slice(0, 3).join('.')

      if (!sameSubnet) {
        this.log('verification-failed', {
          reason: 'subnet-mismatch',
          ip,
          resolvedIP,
          userAgent,
          botName,
        })
        return false
      }

      this.log('verification-succeeded', { ip, userAgent, botName, hostname })
      return true
    } catch (error) {
      this.log('verification-error', {
        error: error.message,
        ip,
        userAgent,
        stack: error.stack,
      })
      return false
    }
  }

  static async isLegitimateBot(req) {
    const userAgent = req.headers['user-agent'] || ''
    const ip = this.getRealIP(req)

    // Debug logging
    this.log('bot-check-started', {
      detectedIP: ip,
      originalIP: req.ip,
      xForwardedFor: req.headers['x-forwarded-for'],
      xRealIP: req.headers['x-real-ip'],
      userAgent,
    })

    // Handle development environment
    if (process.env.NODE_ENV === 'development') {
      const isDev = req.query.bot === 'true'
      const devResult = isDev && this.hasValidUserAgent(userAgent)
      if (devResult) {
        this.log('dev-verification', { userAgent, ip })
      }
      return devResult
    }

    // Production checks
    if (!this.hasValidUserAgent(userAgent)) {
      this.log('invalid-user-agent', { userAgent, ip })
      return false
    }

    return await this.verifyBotIP(ip, userAgent)
  }

  static log(event, data) {
    const timestamp = new Date().toISOString()
    const logData = {
      timestamp,
      event,
      environment: process.env.NODE_ENV,
      ...data,
    }

    // if (process.env.NODE_ENV === 'production') {
    //   console.log(JSON.stringify(logData))
    // } else {
    //   console.log(`[${timestamp}] Bot Verification:`, event, data)
    // }
  }
}

module.exports = BotVerifier
