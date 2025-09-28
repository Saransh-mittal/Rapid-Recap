// client/src/entry-client.jsx
import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { initializeCsrf } from './services/csrfService.js'
import { initializeTokenRefresh } from './services/tokenRefreshService.js'
import { NotificationProvider } from './utils/notifications.jsx'
// import { SocketProvider } from './contextAPI/SocketContext.jsx'

// Lazy load all major components
const BrowserRouter = lazy(() =>
  import('react-router-dom').then(module => ({
    default: module.BrowserRouter,
  })),
)
const SocketProvider = lazy(() => import('./contextAPI/SocketContext.jsx'))
const Provider = lazy(() =>
  import('react-redux').then(module => ({
    default: module.Provider,
  })),
)
const ChakraProvider = lazy(() =>
  import('@chakra-ui/react').then(module => ({
    default: module.ChakraProvider,
  })),
)
const HelmetProvider = lazy(() =>
  import('react-helmet-async').then(module => ({
    default: module.HelmetProvider,
  })),
)
// const ChatProvider = lazy(() => import('./contextAPI/ChatProvider.jsx'))
const I18nextProvider = lazy(() =>
  import('react-i18next').then(module => ({
    default: module.I18nextProvider,
  })),
)
const App = lazy(() => import('./App.jsx'))

// Loading component for suspended content
const LoadingFallback = () => {
  return null // Return null to keep showing splash screen while components load
}

// Create a component that loads store first, then renders Provider
const ReduxWrapper = ({ children }) => {
  const [store, setStore] = React.useState(null)

  React.useEffect(() => {
    // Load store first
    import('./redux/store').then(module => {
      setStore(module.store)
    })
  }, [])

  // Only render Provider once store is loaded
  if (!store) return <LoadingFallback />

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Provider store={store}>{children}</Provider>
    </Suspense>
  )
}

// Create a component that loads i18n first, then renders I18nextProvider
const I18nWrapper = ({ children }) => {
  const [i18nInstance, setI18nInstance] = React.useState(null)

  React.useEffect(() => {
    // Load i18n first
    import('./i18n').then(module => {
      setI18nInstance(module.default)
    })
  }, [])

  // Only render I18nextProvider once i18n is loaded
  if (!i18nInstance) return <LoadingFallback />

  return (
    <Suspense fallback={<LoadingFallback />}>
      <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
    </Suspense>
  )
}

// Check if this is a bot viewing the page
const isBot = window.__IS_BOT__

// For bots, we don't need to hydrate since they got static HTML
if (!isBot) {
  initializeCsrf()
  initializeTokenRefresh()
  ReactDOM.createRoot(document.getElementById('root')).render(
    <Suspense fallback={<LoadingFallback />}>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <ReduxWrapper>
            <Suspense fallback={<LoadingFallback />}>
              {/* <ChatProvider> */}
              <SocketProvider>
                <Suspense fallback={<LoadingFallback />}>
                  <I18nWrapper>
                    <Suspense fallback={<LoadingFallback />}>
                      <ChakraProvider>
                        <Suspense fallback={<LoadingFallback />}>
                          <HelmetProvider>
                            <Suspense fallback={<LoadingFallback />}>
                              <NotificationProvider>
                                <App />
                              </NotificationProvider>
                            </Suspense>
                          </HelmetProvider>
                        </Suspense>
                      </ChakraProvider>
                    </Suspense>
                  </I18nWrapper>
                </Suspense>
              </SocketProvider>
              {/* </ChatProvider> */}
            </Suspense>
          </ReduxWrapper>
        </Suspense>
      </BrowserRouter>
    </Suspense>,
  )
}
