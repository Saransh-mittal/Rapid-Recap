import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './contextAPI/appContext'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import ChatProvider from './contextAPI/ChatProvider.jsx'

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'transparent',
        color: 'gray.100',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'full',
      },
      variants: {
        solid: {
          bg: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
    Progress: {
      baseStyle: {
        filledTrack: {
          bg: 'purple.400',
        },
      },
    },
  },
})
ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <BrowserRouter>
    <AppProvider>
      <ChatProvider theme={theme}>
        <ChakraProvider>
          <HelmetProvider>
            <Helmet>
              <title>Rapid Recap - Stay Informed, Stay Ahead</title>
              <meta
                name="description"
                content="Rapid Recap is your go-to source for the latest news and articles. Test your knowledge with quizzes and track your Information Quotient (IQ) score."
              />
              <meta
                name="keywords"
                content="Rapid Recap, news, articles, quizzes, IQ score, leaderboard"
              />
              <meta
                property="og:title"
                content="Rapid Recap - Stay Informed, Stay Ahead"
              />
              <meta
                property="og:description"
                content="Stay updated with the latest news and articles. Take quizzes and see your Information Quotient (IQ) score on Rapid Recap."
              />
            </Helmet>
            <App />
          </HelmetProvider>
        </ChakraProvider>
      </ChatProvider>
    </AppProvider>
  </BrowserRouter>,
  // </React.StrictMode>
)
