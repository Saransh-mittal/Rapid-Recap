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
      // ... rest of your bot configurations remain the same ...
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
      userAgent.includes('PageSpeed Insights')
    ) {
      return true
    }

    // Reject browsers pretending to be bots, but allow Chrome-Lighthouse
    if (
      /chrome|firefox|safari|opera|edge/i.test(userAgent) &&
      !userAgent.includes('Chrome-Lighthouse')
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

      // Enhanced logging for PageSpeed
      if (
        userAgent.includes('Chrome-Lighthouse') ||
        userAgent.includes('PageSpeed Insights')
      ) {
        this.log('pagespeed-verification-attempt', {
          ip,
          userAgent,
          botName,
          ipRangeMatch: botName ? this.isInIPRange(ip, botName) : false,
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

    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logData))
    } else {
      console.log(`[${timestamp}] Bot Verification:`, event, data)
    }
  }
}

module.exports = BotVerifier
