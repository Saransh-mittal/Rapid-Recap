import React, { useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { ParallaxProvider } from 'react-scroll-parallax'
import { useInView } from 'react-intersection-observer'
import BenefitsMap from '../components/getStartedComponents/BenefitsMap'
import Features from '../components/getStartedComponents/Features'
import HeroV2 from '../components/getStartedComponents/HeroV2'
import Footer from '../components/Header-Footer/Footer'

const GetStarted = () => {
  const { ref: refFooter, inView: inViewFooter } = useInView()

  useEffect(() => {
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

    preloadImages()
  }, [])

  const renderContent = () => (
    <Box minHeight="100vh">
      <HeroV2 inViewFooter={inViewFooter} />
      <BenefitsMap />

      <Features />
      <Footer refFooter={refFooter} />
    </Box>
  )

  return (
    <>
      <ParallaxProvider>{renderContent()}</ParallaxProvider>
    </>
  )
}

export default GetStarted
