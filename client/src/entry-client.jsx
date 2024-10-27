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

// Import your reducers
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

// Get the preloaded state from the server
const preloadedState = window.__PRELOADED_STATE__
delete window.__PRELOADED_STATE__ // Clean up after using

// Create store with preloaded state
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
  preloadedState,
})

const root = document.getElementById('root')
const isSSRRoute = ['/'].includes(window.location.pathname)

const Providers = ({ children }) => (
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
)

if (isSSRRoute) {
  ReactDOM.hydrateRoot(
    root,
    <Providers>
      <App />
    </Providers>,
  )
} else {
  ReactDOM.createRoot(root).render(
    <Providers>
      <App />
    </Providers>,
  )
}
