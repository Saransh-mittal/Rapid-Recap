// prerenderServer.js
const prerender = require('prerender')

// Configure to match your app port
const APP_HOST = 'http://localhost:3001' // Your app is running here
const PRERENDER_PORT = 3000 // Prerender server will run here

const server = prerender({
  chromeFlags: [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
  ],
  port: PRERENDER_PORT,
  pageLoadTimeout: 20000,
  waitAfterLastRequest: 1000,
})

// Basic logging
server.use({
  requestReceived: function (req, res, next) {
    console.log('\n🔍 Incoming request:', req.url)
    next()
  },
  tabCreated: function (req, res, next) {
    console.log('📑 New tab created for:', req.prerender.url)
    next()
  },
})

// Remove script tags
server.use(prerender.removeScriptTags())

// Handle headers
server.use(prerender.httpHeaders())

server.start()
console.log(`
🚀 Prerender Server Started
--------------------------
Prerender Port: ${PRERENDER_PORT}
App URL: ${APP_HOST}
Status: Running

Test Commands:
1. Test specific article:
   curl http://localhost:${PRERENDER_PORT}/render?url=${APP_HOST}/article/YOUR_ARTICLE_ID

2. Test as Googlebot:
   curl -A "Googlebot" ${APP_HOST}/article/YOUR_ARTICLE_ID
`)
