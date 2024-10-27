import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ChatProvider from './contextAPI/ChatProvider'
import i18n from './i18n'
import App from './App'
// import pkg from 'react-helmet-async'
// const { HelmetProvider } = pkg
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

// Function to handle splash screen
const removeSplashScreen = () => {
  const splash = document.getElementById('splash-screen')
  if (splash) {
    splash.style.opacity = '0'
    splash.style.transition = 'opacity 0.5s ease'
    setTimeout(() => {
      splash.remove()
    }, 500)
  }
}

// Function to get initial state
const getInitialState = () => {
  // Try to get preloaded state from window
  const preloadedState = window.__PRELOADED_STATE__

  if (preloadedState) {
    try {
      delete window.__PRELOADED_STATE__
      return preloadedState
    } catch (e) {
      console.error('Error parsing preloaded state:', e)
    }
  }

  // Fallback initial state
  return {
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
  }
}

// Create store
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
  preloadedState: getInitialState(),
})

const Providers = ({ children }) => (
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <ChatProvider>
          <I18nextProvider i18n={i18n}>
            <ChakraProvider>
              <HelmetProvider>{children}</HelmetProvider>
            </ChakraProvider>
          </I18nextProvider>
        </ChatProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
)

const root = document.getElementById('root')
const shouldHydrate = root?.getAttribute('data-ssr') === 'true'

// Initialize the app
const initializeApp = () => {
  if (shouldHydrate) {
    console.log('Hydrating SSR content...')
    ReactDOM.hydrateRoot(
      root,
      <Providers>
        <App />
      </Providers>,
    )
  } else {
    console.log('Creating new React root...')
    ReactDOM.createRoot(root).render(
      <Providers>
        <App />
      </Providers>,
    )
  }

  // Remove splash screen after short delay
  setTimeout(removeSplashScreen, 1000)
}

// Initialize once the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}
