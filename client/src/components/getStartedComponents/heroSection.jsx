import React, { useEffect, useRef } from 'react'
import {
  Box,
  Flex,
  Image,
  Text,
  Heading as ChakraHeading,
  useDisclosure,
} from '@chakra-ui/react'
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion'
import Section from '../miscellaneous/Section'
import curve from '../../assets/curve.webp'

// Laptop Images
import laptopXl from '../../assets/hero/Laptop/laptop_xl.webp'
import laptopLg from '../../assets/hero/Laptop/laptop_lg.webp'
import laptopMd from '../../assets/hero/Laptop/laptop_md.webp'
import laptopBase from '../../assets/hero/Laptop/laptop_base.webp'
// Ipad Images
import ipadXL from '../../assets/hero/Ipad/ipad_xl.webp'
import ipadLg from '../../assets/hero/Ipad/ipad_lg.webp'
import ipadMd from '../../assets/hero/Ipad/ipad_md.webp'
import ipadBase from '../../assets/hero/Ipad/ipad_base.webp'
// Mobile Images
import mobileXL from '../../assets/hero/Mobile/mobile_xl.webp'
import mobileLg from '../../assets/hero/Mobile/mobile_lg.webp'
import mobileMd from '../../assets/hero/Mobile/mobile_md.webp'
import mobileBase from '../../assets/hero/Mobile/mobile_base.webp'

import {
  BackgroundCircles,
  // MediumScreenbgGradient
} from './design/Hero'

const MotionBox = motion(Box)
const MotionImage = motion(Image)
// const laptop = '/images/laptop-frame-min.webp'

const EnhancedHeroSection = () => {
  const parallaxRef = useRef(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const laptopControls = useAnimation()
  const ipadControls = useAnimation()
  const mobileControls = useAnimation()
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ['start start', 'end start'],
  })
  const laptopY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const ipadY = useTransform(scrollYProgress, [0, 1], [0, 50])
  const mobileY = useTransform(scrollYProgress, [0, 1], [0, 80])

  useEffect(() => {
    const sequence = async () => {
      await laptopControls.start({
        opacity: 1,
        y: 0,
        rotate: 0,
        transition: { delay: 0, duration: 0.1 },
      })
      await ipadControls.start({
        opacity: 1,
        y: 0,
        rotate: 0,
        transition: { delay: 0.1, duration: 0.2 },
      })
      await mobileControls.start({
        opacity: 1,
        y: 0,
        rotate: 0,
        transition: { delay: 0.1, duration: 0.2 },
      })
    }
    sequence()
  }, [laptopControls, ipadControls, mobileControls])

  const deviceVariants = {
    hover: {
      scale: 1.05,
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 0.3,
        yoyo: Infinity,
      },
    },
  }
  return (
    <Section crosses customPaddings={`2.85rem 0 0 0`} id="hero">
      <Box
        position="relative"
        textAlign="center"
        maxW="container.xl"
        mx="auto"
        mb={'2rem'}
        ref={parallaxRef}
      >
        <Box display={'block'}>
          <Box
            maxW="62rem"
            maxH={{ base: 'auto', lg: '30rem' }}
            mx="auto"
            mb={{ base: '0', md: '2rem' }}
            zIndex={99}
            position={'relative'}
            letterSpacing={'2px'}
          >
            <ChakraHeading as="h2" size="2xl" mb="6">
              Turn News Into Knowledge with{' '}
              <Box as="span" display="inline-block" position="relative">
                Rapid Recap{' '}
                <Image
                  src={curve}
                  position="absolute"
                  mt={{ base: '0.5rem', lg: '0.85rem' }}
                  top="100%"
                  left="0"
                  background={{ base: 'none', lg: 'transparent' }}
                  height={{ base: '0.5rem', lg: '0.75rem' }}
                  width="full"
                  transform="translateY(-0.5rem)"
                  alt="Curve"
                />
              </Box>
            </ChakraHeading>
            <Flex justifyContent={'center'}>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                maxW="3xl"
                px={{ base: '1rem', md: '0rem' }}
                mb={{ base: '6', lg: '0' }}
                color={'#9CAFAA'}
                fontWeight={'bold'}
                mt={{ base: '0', lg: '2rem' }}
              >
                Welcome to Rapid Recap, where staying informed meets friendly
                competition. Read the latest news and articles, then test your
                knowledge with interactive quizzes. Your scores contribute to
                your unique Information Quotient (IQ), ranking you on our
                leaderboard. Track your progress, compare with peers, and strive
                for excellence.
              </Text>
            </Flex>
          </Box>

          <MotionBox
            position="relative"
            maxW={{ base: '23rem', md: '5xl' }}
            mx="auto"
            height={{ base: '150px', md: '300px', lg: '450px', xl: '500px' }}
          >
            <MotionImage
              animate={laptopControls}
              initial={{ opacity: 0, y: 50, rotate: -5 }}
              variants={deviceVariants}
              position="absolute"
              left={{ base: '5%', md: '7%', lg: '15%', xl: '0' }}
              top={'-5%'}
              transform={{ base: 'translate(-50%, -50%)', md: 'none' }}
              zIndex={3}
              width="auto"
              height={{ base: '175px', md: '350px', lg: '400px', xl: '525px' }}
              src={laptopXl}
              srcSet={`${laptopXl} 525px, ${laptopLg} 400px, ${laptopMd} 350px, ${laptopBase} 175px`}
              sizes="(max-width: 768px) 175px, (max-width: 1024px) 350px, (max-width: 1280px) 400px, 525px"
              alt="Article Interface"
              loading="eager"
              style={{ y: laptopY }}
              whileHover="hover"
            />
            <MotionImage
              animate={ipadControls}
              initial={{ opacity: 0, y: 50, rotate: 5 }}
              variants={deviceVariants}
              position="absolute"
              left={{ base: '46%', md: '43%', lg: '49%', xl: '42%' }}
              top={{ base: '10%', md: '22%', lg: '30%' }}
              transform={{ base: 'translateX(-50%)', md: 'none' }}
              zIndex={2}
              width="auto"
              height={{ base: '90px', md: '170px', lg: '180px', xl: '250px' }}
              src={ipadXL}
              srcSet={`${ipadBase} 90w, ${ipadMd} 170w, ${ipadLg} 180w, ${ipadXL} 250w`}
              sizes="(max-width: 768px) 90px, (max-width: 1024px) 170px, (max-width: 1280px) 180px, 250px"
              alt="Quiz Instructions"
              loading="eager"
              style={{ y: ipadY }}
              whileHover="hover"
            />
            <MotionImage
              animate={mobileControls}
              initial={{ opacity: 0, y: -50, rotate: -5 }}
              variants={deviceVariants}
              position="absolute"
              left={{ base: '75%', md: '70%', xl: '73%' }}
              top={{ base: '5%', md: '5%' }}
              transform={{ base: 'translateX(-50%)', md: 'none' }}
              zIndex={3}
              width="auto"
              height={{ base: '110px', md: '245px', lg: '275px', xl: '400px' }}
              src={mobileXL}
              srcSet={`${mobileBase} 110w, ${mobileMd} 245w, ${mobileLg} 275w, ${mobileXL} 400w`}
              sizes="(max-width: 768px) 110px, (max-width: 1024px) 245px, (max-width: 1280px) 275px, 400px"
              alt="Quiz Interface"
              loading="eager"
              style={{ y: mobileY }}
              whileHover="hover"
            />

            <BackgroundCircles />
          </MotionBox>
        </Box>
      </Box>

      {/* <MediumScreenbgGradient
        top="18.25rem"
        left="-25.375rem"
        width="56.625rem"
      />
      <MediumScreenbgGradient
        top="36.25rem"
        left="40.375rem"
        width="56.625rem"
      /> */}
    </Section>
  )
}

export default EnhancedHeroSection
