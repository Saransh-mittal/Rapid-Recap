import React, { Suspense, useEffect } from 'react'
import { Box, Spinner } from '@chakra-ui/react'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

const Hero = React.lazy(() => import('../components/getStartedComponents/Hero'))
const EnhancedBenefitsMap = React.lazy(() =>
  import('../components/getStartedComponents/BenefitsMap'),
)
const Features = React.lazy(() =>
  import('../components/getStartedComponents/Features'),
)
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'white',
      },
    },
  },
  colors: {
    brand: {
      50: '#e6fffa',
      100: '#b2f5ea',
      500: '#4ecdc4',
    },
  },
})

const GetStarted = () => {
  useEffect(() => {
    const images = [
      '/images/landingPage/featureBg.webp',
      '/images/landingPage/featureBgMobile.webp',
      '/images/landingPage/homeUI.webp',
      '/images/landingPage/articleUI.webp',
      '/images/landingPage/quizUI.webp',
      '/images/landingPage/tournamentUI.webp',
    ]

    images.forEach(src => {
      const img = new Image()
      img.src = src
    })
  }, [])

  return (
    <ChakraProvider theme={theme}>
      <Box
        bgImage={{
          base: "url('/images/landingPage/featureBgMobile.webp')",
          md: "url('/images/landingPage/featureBg.webp')",
        }}
        bgAttachment="fixed"
        bgSize="cover"
        bgPosition="center"
        minHeight="100vh"
      >
        <Suspense fallback={<Spinner />}>
          <Hero />
          <EnhancedBenefitsMap />
          <Features />
        </Suspense>
      </Box>
    </ChakraProvider>
  )
}

export default GetStarted
