// Function to load HTML content
async function loadHTML(url, targetId) {
  try {
    const response = await fetch(url)
    const html = await response.text()
    document.getElementById(targetId).innerHTML = html
  } catch (error) {
    console.error(`Error loading ${url}:`, error)
  }
}
loadHTML('/splash.html', 'splash')
// Import all bot components when bot is detected
if (window.__IS_BOT__) {
  Promise.all([
    loadHTML('/bot/components/navbar.html', 'bot-navbar'),
    loadHTML('/bot/components/get-started/hero.html', 'bot-hero'),
    loadHTML('/bot/components/get-started/features.html', 'bot-features'),
  ]).then(() => {
    // Initialize splash screen handler after components are loaded
    const splashScript = document.createElement('script')
    splashScript.src = '/scripts/splash.js'
    document.body.appendChild(splashScript)
  })
}
