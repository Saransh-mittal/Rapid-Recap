// File Path: server/utils/botVerifier.js

const dns = require('dns')
const { promisify } = require('util')
const reverse = promisify(dns.reverse)
const lookup = promisify(dns.lookup)

class BotVerifier {
  static get knownBots() {
    return [
      'Googlebot',
      'Bingbot',
      'Slurp',
      'DuckDuckBot',
      'Baiduspider',
      'YandexBot',
      'facebookexternalhit',
      'LinkedInBot',
      'Twitterbot',
    ]
  }

  static get botDomains() {
    return {
      Googlebot: '.googlebot.com',
      Bingbot: '.search.msn.com',
      Slurp: '.slurp.inktomi.com',
      DuckDuckBot: '.duckduckgo.com',
      Baiduspider: '.baidu.com',
      YandexBot: '.yandex.ru',
      facebookexternalhit: '.facebook.com',
      LinkedInBot: '.linkedin.com',
      Twitterbot: '.twitter.com',
    }
  }

  static hasValidUserAgent(userAgent) {
    return (
      userAgent &&
      /bot|crawler|spider/i.test(userAgent) &&
      !/chrome|firefox|safari|opera|edge/i.test(userAgent)
    )
  }

  static async verifyBotIP(ip, userAgent) {
    try {
      // Step 1: Reverse DNS lookup (PTR record)
      const hostnames = await reverse(ip)
      if (!hostnames || hostnames.length === 0) return false

      const hostname = hostnames[0].toLowerCase()

      // Find which bot we're dealing with
      const botName = this.knownBots.find(bot =>
        userAgent.toLowerCase().includes(bot.toLowerCase()),
      )

      if (!botName) return false

      const expectedDomain = this.botDomains[botName]
      if (!hostname.endsWith(expectedDomain)) return false

      // Step 2: Forward DNS lookup
      // This verifies that the hostname we got actually points back to the original IP
      // This completes the forward-confirmed reverse DNS (FCrDNS) check
      const { address: resolvedIP } = await lookup(hostname)

      // Compare the resolved IP with the original IP
      // Some bots might use multiple IPs, so we check if it's in the same subnet
      const originalIPParts = ip.split('.')
      const resolvedIPParts = resolvedIP.split('.')

      // Check if first three octets match (same subnet)
      const sameSubnet =
        originalIPParts.slice(0, 3).join('.') ===
        resolvedIPParts.slice(0, 3).join('.')

      return sameSubnet
    } catch (error) {
      console.error('Bot IP verification failed:', error)
      return false
    }
  }

  static async isLegitimateBot(req) {
    const userAgent = req.headers['user-agent'] || ''
    const ip =
      req.ip || req.connection.remoteAddress || req.socket.remoteAddress

    // Clean up IP address if it includes IPv6 prefix
    const cleanIP = ip.replace(/^::ffff:/, '')

    // Development environment check
    if (process.env.NODE_ENV !== 'production') {
      const devResult = this.hasValidUserAgent(userAgent)
      if (devResult) {
        console.log('[DEV] Bot verified through User-Agent only:', userAgent)
      }
      return devResult
    }

    // Production environment checks
    if (!this.hasValidUserAgent(userAgent)) {
      console.log('Invalid user agent format:', userAgent)
      return false
    }

    const isKnownBot = this.knownBots.some(bot =>
      userAgent.toLowerCase().includes(bot.toLowerCase()),
    )

    if (!isKnownBot) {
      console.log('Unknown bot user agent:', userAgent)
      return false
    }

    const isVerified = await this.verifyBotIP(cleanIP, userAgent)

    if (isVerified) {
      console.log('Verified bot:', userAgent, 'from IP:', cleanIP)
    } else {
      console.log('Failed to verify bot:', userAgent, 'from IP:', cleanIP)
    }

    return isVerified
  }

  static logVerificationResult(isVerified, userAgent, ip) {
    if (process.env.NODE_ENV === 'production') {
      const timestamp = new Date().toISOString()
      const logMessage = `[${timestamp}] Bot verification ${
        isVerified ? 'succeeded' : 'failed'
      } - UA: ${userAgent}, IP: ${ip}`

      // You might want to implement proper logging here
      console.log(logMessage)
    }
  }
}

module.exports = BotVerifier
