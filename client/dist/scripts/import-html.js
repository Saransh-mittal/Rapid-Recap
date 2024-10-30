// Directory structure should be:
/*
client/
  ├── public/
  │   ├── images/
  │   │   ├── hero-bg.webp
  │   │   ├── tourBGDark.webp
  │   │   └── rrlogo_512.png
  │   ├── bot/
  │   │   ├── components/
  │   │   │   ├── navbar.html
  │   │   │   └── get-started/
  │   │   │       ├── hero.html
  │   │   │       └── features.html
  │   ├── scripts/
  │   │   ├── import-html.js
  │   │   └── splash.js
  │   ├── splash.html
  │   └── manifest.json
  └── src/
      └── entry-client.jsx
*/

// public/scripts/import-html.js
async function loadHTML(url, targetId) {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const targetElement = document.getElementById(targetId)

    if (targetElement) {
      targetElement.innerHTML = html
    } else {
      console.error(`Target element ${targetId} not found`)
    }
  } catch (error) {
    console.error(`Error loading ${url}:`, error)
  }
}

// Update image paths before loading content
function updateImagePaths(html) {
  return html
    .replace(/src=["']\/src\/assets\/hero\//g, 'src="/images/')
    .replace(/src=["']\/images\//g, 'src="/images/')
}

// Main initialization function
async function initializeContent() {
  try {
    if (window.__IS_BOT__) {
      // Load bot content
      document.getElementById('splash-screen').style.display = 'none'
      await Promise.all([
        loadHTML('/bot/components/navbar.html', 'bot-navbar'),
        loadHTML('/bot/components/get-started/hero.html', 'bot-hero'),
        loadHTML('/bot/components/get-started/benefits.html', 'bot-benefits'),
        loadHTML('/bot/components/get-started/features.html', 'bot-features'),
      ])

      // Show bot content
      document.querySelector('.bot-content').style.display = 'block'
    } else {
      // Load splash screen
      // Load splash screen script
      const splashScript = document.createElement('script')
      splashScript.src = '/scripts/splash.js'
      document.body.appendChild(splashScript)
      await loadHTML('/splash.html', 'splash-screen')
    }
  } catch (error) {
    console.error('Error initializing content:', error)
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContent)
} else {
  initializeContent()
}
