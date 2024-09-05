import React, { useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Box,
  Flex,
  Text,
  Heading as ChakraHeading,
  useDisclosure,
  Image,
} from '@chakra-ui/react'
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'

// Lazy-loaded components
const Section = lazy(() => import('../miscellaneous/Section'))
const BackgroundCircles = lazy(() =>
  import('./design/Hero').then(module => ({
    default: module.BackgroundCircles,
  })),
)

// Direct image imports
import curve from '../../assets/curve.webp'
import laptopXl from '../../assets/hero/Laptop/laptop_xl.webp'
import laptopLg from '../../assets/hero/Laptop/laptop_lg.webp'
import laptopMd from '../../assets/hero/Laptop/laptop_md.webp'
import laptopBase from '../../assets/hero/Laptop/laptop_base.webp'
import ipadXL from '../../assets/hero/Ipad/ipad_xl.webp'
import ipadLg from '../../assets/hero/Ipad/ipad_lg.webp'
import ipadMd from '../../assets/hero/Ipad/ipad_md.webp'
import ipadBase from '../../assets/hero/Ipad/ipad_base.webp'
import mobileXL from '../../assets/hero/Mobile/mobile_xl.webp'
import mobileLg from '../../assets/hero/Mobile/mobile_lg.webp'
import mobileMd from '../../assets/hero/Mobile/mobile_md.webp'
import mobileBase from '../../assets/hero/Mobile/mobile_base.webp'

const MotionBox = motion(Box)
const MotionImage = motion(Image)

const EnhancedHeroSection = () => {
  const { t } = useTranslation('heroSection')
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

  const animateSequence = useCallback(async () => {
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
  }, [laptopControls, ipadControls, mobileControls])

  useEffect(() => {
    animateSequence()
  }, [animateSequence])

  const deviceVariants = useMemo(
    () => ({
      hover: {
        scale: 1.05,
        rotate: [0, 2, -2, 0],
        transition: {
          duration: 0.3,
          yoyo: Infinity,
        },
      },
    }),
    [],
  )

  const renderImage = useCallback(
    (controls, y, images, sizes, alt) => (
      <MotionImage
        animate={controls}
        initial={{ opacity: 0, y: 50, rotate: -5 }}
        variants={deviceVariants}
        position="absolute"
        left={sizes.left}
        top={sizes.top}
        transform={sizes.transform}
        zIndex={sizes.zIndex}
        width="auto"
        height={sizes.height}
        src={images.xl}
        srcSet={`${images.xl} ${sizes.xlSize}w, ${images.lg} ${sizes.lgSize}w, ${images.md} ${sizes.mdSize}w, ${images.base} ${sizes.baseSize}w`}
        sizes={sizes.sizes}
        alt={t(`hero.altTexts.${alt}`)}
        loading="eager"
        style={{ y }}
        whileHover="hover"
      />
    ),
    [deviceVariants, t],
  )

  return (
    <Suspense fallback={<Box>Loading...</Box>}>
      <Section crosses customPaddings="2.85rem 0 0 0" id="hero">
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
                {t('hero.title')}{' '}
                <Box as="span" display="inline-block" position="relative">
                  {t('hero.titleHighlight')}{' '}
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
                    alt={t('hero.altTexts.curve')}
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
                  {t('hero.description')}
                </Text>
              </Flex>
            </Box>

            <MotionBox
              position="relative"
              maxW={{ base: '23rem', md: '5xl' }}
              mx="auto"
              height={{ base: '150px', md: '300px', lg: '450px', xl: '500px' }}
            >
              {renderImage(
                laptopControls,
                laptopY,
                { xl: laptopXl, lg: laptopLg, md: laptopMd, base: laptopBase },
                {
                  left: { base: '5%', md: '7%', lg: '15%', xl: '0' },
                  top: '-5%',
                  transform: { base: 'translate(-50%, -50%)', md: 'none' },
                  zIndex: 3,
                  height: {
                    base: '175px',
                    md: '350px',
                    lg: '400px',
                    xl: '525px',
                  },
                  xlSize: 525,
                  lgSize: 400,
                  mdSize: 350,
                  baseSize: 175,
                  sizes:
                    '(max-width: 768px) 175px, (max-width: 1024px) 350px, (max-width: 1280px) 400px, 525px',
                },
                'articleInterface',
              )}

              {renderImage(
                ipadControls,
                ipadY,
                { xl: ipadXL, lg: ipadLg, md: ipadMd, base: ipadBase },
                {
                  left: { base: '46%', md: '43%', lg: '49%', xl: '42%' },
                  top: { base: '10%', md: '22%', lg: '30%' },
                  transform: { base: 'translateX(-50%)', md: 'none' },
                  zIndex: 2,
                  height: {
                    base: '90px',
                    md: '170px',
                    lg: '180px',
                    xl: '250px',
                  },
                  xlSize: 250,
                  lgSize: 180,
                  mdSize: 170,
                  baseSize: 90,
                  sizes:
                    '(max-width: 768px) 90px, (max-width: 1024px) 170px, (max-width: 1280px) 180px, 250px',
                },
                'quizInstructions',
              )}

              {renderImage(
                mobileControls,
                mobileY,
                { xl: mobileXL, lg: mobileLg, md: mobileMd, base: mobileBase },
                {
                  left: { base: '75%', md: '70%', xl: '73%' },
                  top: { base: '5%', md: '5%' },
                  transform: { base: 'translateX(-50%)', md: 'none' },
                  zIndex: 3,
                  height: {
                    base: '110px',
                    md: '245px',
                    lg: '275px',
                    xl: '400px',
                  },
                  xlSize: 400,
                  lgSize: 275,
                  mdSize: 245,
                  baseSize: 110,
                  sizes:
                    '(max-width: 768px) 110px, (max-width: 1024px) 245px, (max-width: 1280px) 275px, 400px',
                },
                'quizInterface',
              )}

              <Suspense fallback={<Box>Loading circles...</Box>}>
                <BackgroundCircles />
              </Suspense>
            </MotionBox>
          </Box>
        </Box>
      </Section>
    </Suspense>
  )
}

export default React.memo(EnhancedHeroSection)
