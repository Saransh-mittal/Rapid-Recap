const prerenderNode = require('prerender-node')
const cache = require('memory-cache')

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

function setupPrerenderMiddleware(app) {
  // Initialize prerender middleware
  const prerenderMiddleware = prerenderNode
    .set('prerenderToken', process.env.PRERENDER_TOKEN)
    .set('protocol', 'https')
    .set('host', process.env.FRONTEND_URL || 'rapidrecap.co.in')
    .set(
      'prerenderServiceUrl',
      process.env.PRERENDER_SERVICE_URL || 'https://service.prerender.io/',
    )

    // Cache prerendered pages
    .set('beforeRender', function (req, done) {
      const cachedResponse = cache.get(`prerender-${req.url}`)
      if (cachedResponse) {
        done(null, cachedResponse)
      } else {
        done()
      }
    })
    .set('afterRender', function (err, req, prerendered) {
      if (!err) {
        cache.put(`prerender-${req.url}`, prerendered, CACHE_DURATION)
      }
    })

    // Blacklist paths that don't need prerendering
    .blacklisted([
      '^/api',
      '^/socket.io',
      '\\.(?:js|css|xml|less|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|rar|exe|wmv|doc|avi|ppt|mpg|mpeg|tif|wav|mov|psd|ai|xls|mp4|m4a|swf|dat|dmg|iso|flv|m4v|torrent)$',
    ])

    // Whitelist paths that need prerendering
    .whitelisted([
      '^/$',
      '^/articles/*',
      '^/quiz/*',
      '^/tournament/*',
      '^/profile/*',
      '^/leaderboard/*',
    ])

  // Add custom headers for prerendered content
  app.use((req, res, next) => {
    if (req.prerender) {
      // Set caching headers for prerendered content
      res.header('Cache-Control', 'public, max-age=300, s-maxage=600')
      // Add other SEO-related headers
      res.header('X-Robots-Tag', 'index, follow')
    }
    next()
  })

  // Monitor prerender errors
  prerenderMiddleware.on('error', err => {
    console.error('Prerender error:', err)
  })

  return prerenderMiddleware
}

module.exports = setupPrerenderMiddleware
