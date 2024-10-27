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
    isLoading: true,
    navigationCount: 0,
    noteMessageQueue: [],
    soundSettings: {},
    updatesLoading: false,
    updatesFetched: false,
  },
  // Add other initial states as needed
})

export async function render(url, options = {}) {
  const helmetContext = {}

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
    preloadedState: createInitialState(),
  })

  // Set language if provided
  if (options.language) {
    i18n.changeLanguage(options.language)
  }

  try {
    // Use renderToString with a simple error boundary
    const html = ReactDOMServer.renderToString(
      <React.StrictMode>
        <Provider store={store}>
          <StaticRouter location={url}>
            <I18nextProvider i18n={i18n}>
              <ChakraProvider>
                <HelmetProvider context={helmetContext}>
                  <React.Suspense fallback="Loading...">
                    <ErrorBoundary>
                      <App ssrMode={true} />
                    </ErrorBoundary>
                  </React.Suspense>
                </HelmetProvider>
              </ChakraProvider>
            </I18nextProvider>
          </StaticRouter>
        </Provider>
      </React.StrictMode>,
    )

    const preloadedState = store.getState()

    return { html, helmetContext, preloadedState }
  } catch (error) {
    console.error('SSR Error:', error)
    // Return a minimal fallback
    return {
      html: '<div id="root">Loading...</div>',
      helmetContext: {},
      preloadedState: createInitialState(),
    }
  }
}

// Simple Error Boundary Component
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
