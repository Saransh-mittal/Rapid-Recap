const fs = require('fs').promises
const path = require('path')
const Article = require('./model/articleSchema')
const User = require('./model/userSchema')
const xml = require('xmlbuilder')

const BASE_URL = 'https://www.rapidrecap.co.in'
const MAX_URLS_PER_SITEMAP = 50000
const MAX_ARTICLES = 5000
const MAX_PROFILES = 5000

async function generateSitemap() {
  console.log('Starting sitemap generation...')

  try {
    const staticRoutes = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/home', priority: 0.9, changefreq: 'daily' },
      { url: '/home/top', priority: 0.8, changefreq: 'daily' },
      { url: '/home/general', priority: 0.8, changefreq: 'daily' },
      { url: '/leaderboard', priority: 0.8, changefreq: 'daily' },
      { url: '/contact', priority: 0.5, changefreq: 'monthly' },
    ]

    // Fetch article IDs
    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .limit(MAX_ARTICLES)
      .select('_id')
    const articleRoutes = articles.map(article => ({
      url: `/article/${article._id}`,
      priority: 0.7,
      changefreq: 'weekly',
    }))

    // Fetch user inGameNames
    const users = await User.find()
      .sort({ lastActive: -1 })
      .limit(MAX_PROFILES)
      .select('inGameName')
    const profileRoutes = users.map(user => ({
      url: `/profile/${user.inGameName}`,
      priority: 0.6,
      changefreq: 'monthly',
    }))

    // Combine all routes
    const allRoutes = [...staticRoutes, ...articleRoutes, ...profileRoutes]
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
