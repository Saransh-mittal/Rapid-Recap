// entry-server.jsx
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { ChakraProvider } from '@chakra-ui/react'
import pkg from 'react-helmet-async'
const { HelmetProvider } = pkg
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import App from './App.jsx'
import i18n from './i18n'

// Import reducers
import authReducer from './redux/authSlice'
import appReducer from './redux/appSlice'
import uiReducer from './redux/uiSlice'
import contentReducer from './redux/contentSlice'
import articleReducer from './redux/articleSlice'
import notificationReducer from './redux/notificationSlice'
import quizReducer from './redux/quizSlice'
import tournamentReducer from './redux/tournamentSlice'
import loadingProgressReducer from './redux/loadingProgressSlice'
import noteMessageSummaryReducer from './redux/noteMessageSummarySlice'

// Create SSR-safe initial state
const createInitialState = () => ({
  auth: {
    isAuthenticated: false,
    user: null,
    loginCheckStatus: 'pending',
    isAdmin: false,
    error: null,
  },
  app: {
    isLoading: false,
    navigationCount: 0,
    noteMessageQueue: [],
    soundSettings: {},
    updatesLoading: false,
    updatesFetched: false,
    isWeakDevice: false, // Add this for GetStarted component
  },
  ui: {
    theme: 'dark',
    language: 'en',
  },
  content: {},
  articles: {
    items: [],
    loading: false,
    error: null,
  },
  notifications: {
    items: [],
    unread: 0,
  },
  quiz: {
    current: null,
    history: [],
  },
  tournament: {
    active: null,
    history: [],
  },
  loadingProgress: {
    progress: 0,
    isLoading: false,
  },
  noteMessageSummary: {
    messages: [],
  },
})

// Preload critical assets for GetStarted
const preloadAssets = () => {
  return [
    '/images/landingPage/featureBg.webp',
    '/images/landingPage/featureBgMobile.webp',
    '/images/landingPage/homeUI.webp',
    '/images/landingPage/articleUI.webp',
    '/images/landingPage/quizUI.webp',
    '/images/landingPage/tournamentUI.webp',
  ]
}

export async function render(url, options = {}) {
  const { emotionCache } = options
  const helmetContext = {}
  const initialState = createInitialState()

  // Create store with initial state
  const store = configureStore({
    reducer: {
      auth: authReducer,
      app: appReducer,
      ui: uiReducer,
      content: contentReducer,
      articles: articleReducer,
      notifications: notificationReducer,
      quiz: quizReducer,
      tournament: tournamentReducer,
      loadingProgress: loadingProgressReducer,
      noteMessageSummary: noteMessageSummaryReducer,
    },
    preloadedState: initialState,
  })

  try {
    const RouterComponent = (
      <React.StrictMode>
        <Provider store={store}>
          <StaticRouter location={url}>
            <I18nextProvider i18n={i18n}>
              <ChakraProvider>
                <HelmetProvider context={helmetContext}>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <ErrorBoundary>
                      <App ssrMode={true} />
                    </ErrorBoundary>
                  </React.Suspense>
                </HelmetProvider>
              </ChakraProvider>
            </I18nextProvider>
          </StaticRouter>
        </Provider>
      </React.StrictMode>
    )

    // Only perform full SSR for the root route
    if (url === '/') {
      const appHtml = ReactDOMServer.renderToString(RouterComponent)
      const { helmet } = helmetContext
      const preloadLinks = preloadAssets()
        .map(
          asset =>
            `<link rel="preload" href="${asset}" as="image" type="image/webp">`,
        )
        .join('\n')

      return {
        appHtml,
        state: store.getState(),
        error: null,
        helmet,
        preloadLinks,
      }
    } else {
      // For other routes, return minimal HTML
      return {
        appHtml: '<div>Loading...</div>',
        state: initialState,
        error: null,
      }
    }
  } catch (error) {
    console.error('SSR Error:', error)
    return {
      appHtml: '<div>Loading...</div>',
      state: initialState,
      error: error.message,
    }
  }
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('SSR Error Boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>
    }
    return this.props.children
  }
}
