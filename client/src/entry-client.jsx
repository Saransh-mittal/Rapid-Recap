// client/src/entry-client.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { HelmetProvider } from 'react-helmet-async'
import ChatProvider from './contextAPI/ChatProvider.jsx'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'

// Check if this is a bot viewing the page
const isBot = window.__IS_BOT__

// For bots, we don't need to hydrate since they got static HTML
if (!isBot) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <Provider store={store}>
        <ChatProvider>
          <I18nextProvider i18n={i18n}>
            <ChakraProvider>
              <HelmetProvider>
                <App />
              </HelmetProvider>
            </ChakraProvider>
          </I18nextProvider>
        </ChatProvider>
      </Provider>
    </BrowserRouter>,
  )
}
