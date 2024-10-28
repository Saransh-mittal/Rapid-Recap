import React, { useEffect, useRef } from 'react'
import { Box, ChakraProvider, extendTheme } from '@chakra-ui/react'
import { ParallaxProvider } from 'react-scroll-parallax'
import { useDispatch, useSelector } from 'react-redux'
import { addNoteMessage } from '../redux/appSlice'
import { useTranslation } from 'react-i18next'
import { isClient } from '../utils/environment'

import Hero from '../components/getStartedComponents/Hero'
import BenefitsMap from '../components/getStartedComponents/BenefitsMap'
import Features from '../components/getStartedComponents/Features'

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

// Move device detection to a separate utility
const detectWeakDevice = () => {
  if (!isClient) return false

  const isLowEndDevice = () => {
    const navigator = window.navigator
    const hardwareConcurrency = navigator.hardwareConcurrency || 4
    const deviceMemory = navigator.deviceMemory || 4
    return hardwareConcurrency < 4 || deviceMemory < 4
  }

  const isSlowNetwork = () => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection
    if (connection) {
      return (
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.saveData
      )
    }
    return false
  }

  const isOlderBrowser = () => {
    const userAgent = window.navigator.userAgent
    return /MSIE|Trident|Android 4/.test(userAgent)
  }

  return isLowEndDevice() || isSlowNetwork() || isOlderBrowser()
}

const GetStarted = () => {
  const { t } = useTranslation('GetStarted')
  const dispatch = useDispatch()
  const { isWeakDevice } = useSelector(state => state.app)
  const isMonitoring = useRef(true)

  const askForWeakMode = () => {
    if (!isClient) return
    dispatch(
      addNoteMessage({
        title: t('performanceIssueDetected'),
        content: t('switchToWeakModePrompt'),
        duration: null,
        width: '350px',
        actions: [
          { text: t('switchToWeakMode'), actionType: 'SWITCH_TO_WEAK_MODE' },
          { text: t('stayInNormalMode'), actionType: 'STAY_IN_NORMAL_MODE' },
        ],
      }),
    )
  }

  useEffect(() => {
    if (!isClient) {
      console.log('Client-side only')
      return
    }

    const initialWeakDevice = detectWeakDevice()
    if (initialWeakDevice) {
      askForWeakMode()
    }

    const preloadImages = () => {
      const images = [
        '/images/landingPage/featureBg.webp',
        '/images/landingPage/featureBgMobile.webp',
        '/images/landingPage/homeUI.webp',
        '/images/landingPage/articleUI.webp',
        '/images/landingPage/quizUI.webp',
        '/images/landingPage/tournamentUI.webp',
      ]

      images.forEach(src => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = src
        document.head.appendChild(link)
      })
    }

    if (!initialWeakDevice) {
      preloadImages()
    } else {
      isMonitoring.current = false
    }

    return () => {
      isMonitoring.current = false
    }
  }, [])

  const renderContent = weakDevice => (
    <Box
      bgImage={{
        base: "url('/images/landingPage/featureBgMobile.webp')",
        md: "url('/images/landingPage/featureBg.webp')",
      }}
      bgAttachment={weakDevice ? 'scroll' : 'fixed'}
      bgSize="cover"
      bgPosition="center"
      minHeight="100vh"
    >
      {isClient ? (
        <>
          <Hero isWeakDevice={weakDevice} />

          <BenefitsMap isWeakDevice={weakDevice} />

          <Features isWeakDevice={weakDevice} />
        </>
      ) : (
        // Server-side render only Hero initially
        <Hero isWeakDevice={weakDevice} />
      )}
    </Box>
  )

  return (
    <ChakraProvider theme={theme}>
      {isWeakDevice || !isClient ? (
        renderContent(true)
      ) : (
        <ParallaxProvider>{renderContent(false)}</ParallaxProvider>
      )}
    </ChakraProvider>
  )
}

export default GetStarted
