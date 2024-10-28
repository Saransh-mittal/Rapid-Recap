// server/utils/botDetection.js
const botPatterns = [
  // Search engines
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'baiduspider',
  // Social media
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  // Other bots
  'slurp',
  'embedly',
  'showyoubot',
  'outbrain',
  'pinterest',
  'slackbot',
  'vkShare',
  'W3C_Validator',
  'redditbot',
  'Applebot',
  'WhatsApp',
  'flipboard',
  'tumblr',
  'bitlybot',
  'SkypeUriPreview',
  'nuzzel',
  'Discordbot',
  'Google Page Speed',
  'Qwantify',
].join('|')

const botPattern = new RegExp(botPatterns, 'i')

function isBot(userAgent = '') {
  return (
    botPattern.test(userAgent) || /bot|crawler|spider|crawling/i.test(userAgent)
  )
}

module.exports = { isBot }
