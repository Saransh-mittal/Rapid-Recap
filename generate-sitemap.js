const fs = require('fs').promises
const path = require('path')
const xml = require('xmlbuilder')

const BASE_URL = 'https://rapidrecap.ai'
const MAX_URLS_PER_SITEMAP = 50000

async function generateSitemap() {
  console.log('Starting sitemap generation...')

  try {
    const staticRoutes = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/manual', priority: 0.9, changefreq: 'weekly' },
      { url: '/manual/quick-clash-v2-overview', priority: 0.8, changefreq: 'weekly' },
      { url: '/manual/forge-phase', priority: 0.8, changefreq: 'weekly' },
      { url: '/manual/quiz-phase', priority: 0.8, changefreq: 'weekly' },
      { url: '/manual/powerups', priority: 0.8, changefreq: 'weekly' },
      { url: '/manual/matchmaking-spark-engine', priority: 0.8, changefreq: 'weekly' },
      { url: '/manual/solo-drill-custom-drill', priority: 0.8, changefreq: 'weekly' },
      { url: '/quickclash/leaderboard', priority: 0.8, changefreq: 'daily' },
      { url: '/contact', priority: 0.5, changefreq: 'monthly' },
      { url: '/contact/feedback', priority: 0.5, changefreq: 'monthly' }
    ]

    const allRoutes = [...staticRoutes]
    const finalRoutes = allRoutes.slice(0, MAX_URLS_PER_SITEMAP)

    // Generate sitemap XML
    const root = xml
      .create('urlset', { version: '1.0', encoding: 'UTF-8' })
      .att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')

    finalRoutes.forEach(route => {
      const url = root.ele('url')
      url.ele('loc', `${BASE_URL}${route.url}`)
      url.ele('lastmod', new Date().toISOString())
      url.ele('changefreq', route.changefreq)
      url.ele('priority', route.priority)
    })

    const sitemap = root.end({ pretty: true })

    // Write sitemap to file
    const outputPath = path.join(__dirname, './client/dist', 'sitemap.xml')
    await fs.writeFile(outputPath, sitemap)

    console.log(`Sitemap generated successfully at ${outputPath}`)
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }
}

module.exports = generateSitemap
