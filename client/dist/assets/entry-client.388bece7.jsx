// client/src/entry-client.jsx
import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ChakraProvider } from '@chakra-ui/react'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'

// Detect environment
const isProd = process.env.NODE_ENV === 'production'

// These are always imported synchronously to avoid initial chunk errors
import { store } from './redux/store'
import i18nInstance from './i18n'

// Core app components - lazy loaded
const SocketProvider = lazy(() => import('./contextAPI/SocketContext.jsx'))
const App = lazy(() => import('./App.jsx'))

// Loading fallback that maintains splash screen
const LoadingFallback = () => null

// Check if this is a bot
const isBot = window.__IS_BOT__

// Track loading times
console.time('App Bootstrap')

// First, detect if this is a return visit - only matters in production
const isReturnVisit = localStorage.getItem('has_visited_before') === 'true'

// Main rendering logic
if (!isBot) {
  // Handle production optimized flow for returning visitors
  if (isProd && isReturnVisit) {
    // Hide splash immediately
    const splashScreen = document.getElementById('splash-screen')
    if (splashScreen) {
      splashScreen.style.display = 'none'
    }

    // Create quick loading view
    const quickLoadView = document.createElement('div')
    quickLoadView.id = 'quick-load-view'
    quickLoadView.style = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background-color: #1A1527; display: flex; flex-direction: column;
      align-items: center; justify-content: center; z-index: 5;
      transition: opacity 0.5s ease-out;
    `

    quickLoadView.innerHTML = `
      <img src="/images/rrlogo_512.png" alt="Rapid Recap" style="width: 80px; height: 80px; margin-bottom: 20px;">
      <div style="font-size: 20px; color: white; margin-bottom: 20px;">Welcome back!</div>
      <div style="width: 200px; height: 4px; background: #2D2D2D; border-radius: 2px; overflow: hidden;">
        <div id="quick-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #6366F1, #8B5CF6); transition: width 0.3s;"></div>
      </div>
    `

    document.body.appendChild(quickLoadView)

    // Progress tracking
    let progress = 0
    const updateProgress = increment => {
      progress += increment
      const progressBar = document.getElementById('quick-progress')
      if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`

      if (progress >= 100) {
        setTimeout(() => {
          quickLoadView.style.opacity = '0'
          setTimeout(() => {
            quickLoadView.remove()
          }, 500)
        }, 300)
      }
    }

    // Start with initial progress
    updateProgress(15)

    // Preload important modules in production
    Promise.all([
      import('./redux/appSlice.js'),
      import('./customHooks/useSocket.js'),
      import('./routes/AppRoutes.jsx'),
      import('./components/Header-Footer/ModernNavbar.jsx'),
    ])
      .then(() => {
        updateProgress(70)

        // Render the app
        setTimeout(() => {
          const root = ReactDOM.createRoot(document.getElementById('root'))
          root.render(
            <BrowserRouter>
              <Provider store={store}>
                <I18nextProvider i18n={i18nInstance}>
                  <ChakraProvider>
                    <HelmetProvider>
                      <Suspense fallback={<LoadingFallback />}>
                        <SocketProvider>
                          <App />
                        </SocketProvider>
                      </Suspense>
                    </HelmetProvider>
                  </ChakraProvider>
                </I18nextProvider>
              </Provider>
            </BrowserRouter>,
          )

          updateProgress(15) // Reach 100%
          console.timeEnd('App Bootstrap')
        }, 100)
      })
      .catch(error => {
        console.error('Error preloading modules:', error)
        updateProgress(85)
        renderStandard()
      })
  } else {
    // Standard loading path for first-time visitors and development mode
    if (isProd) {
      // In production, mark as returning visitor for future visits
      localStorage.setItem('has_visited_before', 'true')
    }

    renderStandard()
  }
}

// Standard rendering function using the original style with nested Suspense components
function renderStandard() {
  try {
    // In development, preload critical app components to avoid "unexpected token <" errors
    ReactDOM.createRoot(document.getElementById('root')).render(
      <Suspense fallback={<LoadingFallback />}>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Provider store={store}>
              <Suspense fallback={<LoadingFallback />}>
                <I18nextProvider i18n={i18nInstance}>
                  <Suspense fallback={<LoadingFallback />}>
                    <ChakraProvider>
                      <Suspense fallback={<LoadingFallback />}>
                        <HelmetProvider>
                          <Suspense fallback={<LoadingFallback />}>
                            <SocketProvider>
                              <Suspense fallback={<LoadingFallback />}>
                                <App />
                              </Suspense>
                            </SocketProvider>
                          </Suspense>
                        </HelmetProvider>
                      </Suspense>
                    </ChakraProvider>
                  </Suspense>
                </I18nextProvider>
              </Suspense>
            </Provider>
          </Suspense>
        </BrowserRouter>
      </Suspense>,
    )

    console.timeEnd('App Bootstrap')

    // In development, hide splash screen with a shorter delay
    if (!isProd || !isReturnVisit) {
      setTimeout(
        () => {
          const splashScreen = document.getElementById('splash-screen')
          if (splashScreen) {
            splashScreen.style.opacity = '0'
            splashScreen.style.transition = 'opacity 0.5s ease-out'

            setTimeout(() => {
              splashScreen.style.display = 'none'
            }, 500)
          }
        },
        isProd ? 1500 : 500,
      ) // Shorter delay in development
    }
  } catch (error) {
    console.error('Error rendering app:', error)

    // Emergency fallback rendering with minimal suspense
    try {
      ReactDOM.createRoot(document.getElementById('root')).render(
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nInstance}>
              <ChakraProvider>
                <HelmetProvider>
                  <Suspense fallback={<div>Loading...</div>}>
                    <SocketProvider>
                      <App />
                    </SocketProvider>
                  </Suspense>
                </HelmetProvider>
              </ChakraProvider>
            </I18nextProvider>
          </Provider>
        </BrowserRouter>,
      )
    } catch (finalError) {
      console.error('Fatal error rendering app:', finalError)
    }
  }
}
