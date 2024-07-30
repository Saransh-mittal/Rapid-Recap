import React, { useContext, useRef, useState, useEffect } from 'react'
import {
  Box,
  Heading as ChakraHeading,
  Text,
  Image,
  Flex,
  useBreakpointValue,
  useDisclosure,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react'
import Section from '../miscellaneous/Section'
import curve from '../../assets/curve.webp'
import robot from '../../assets/hero/robot.webp'
import homeSmile from '../../assets/home-smile.svg'
import file02 from '../../assets/file-02.svg'
import searchMd from '../../assets/search-md.svg'
import plusSquare from '../../assets/plus-square.svg'
import { ScrollParallax } from 'react-just-parallax'
import heroBackground from '../../assets/hero/hero-background.webp'
import { AppContext } from '../../contextAPI/appContext'
import {
  Gradient,
  BackgroundCircles,
  MediumScreenbgGradient,
} from './design/Hero'
import GetStarted from '../Header-Footer/navbarComponents/GetStarted'
import Button from '../miscellaneous/ButtonComponent'
import ButtonGradient from '../../assets/svg/ButtonGradient'
import FeedbackModal from './modals/FeedbackModal'
import { useNavigate } from 'react-router-dom'
import Heading from '../miscellaneous/HeadingComponent'

const heroIcons = [homeSmile, file02, searchMd, plusSquare]

const HeroSection = () => {
  const parallaxRef = useRef(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()
  const crossesOffset = useBreakpointValue({
    base: 'translateY(0)',
    lg: 'translateY(5.25rem)',
  })

  const { state } = useContext(AppContext)
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 992)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 992)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleDownload = () => {
    const url = '/RapidRecap.apk'
    const link = document.createElement('a')
    link.href = url
    link.download = 'Rapid Recap - Your News Source.apk'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
        <Box
          position="absolute"
          left="50%"
          transform="translateX(-50%)"
          display={{ base: 'block', md: 'none', lg: 'block' }}
          sx={{
            '@media (max-width: 768px)': {
              top: '-20% !important',
              width: '138%',
              left: '55% !important',
            },
            '@media (max-width: 1024px)': {
              top: '-13%',
              width: '138%',
              left: '50% ',
            },
            '@media (min-width: 1280px)': {
              top: '-21%',
              width: '234%',
              left: '100%',
              height: 'auto',
            },
          }}
        >
          <Image
            src={heroBackground}
            width={1640}
            height={1200}
            alt="hero"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </Box>

        <Box display={'block'}>
          <Box
            maxW="62rem"
            maxH={{ base: 'auto', lg: '30rem' }}
            mx="auto"
            mb={{ base: '3.875rem', md: '5rem' }}
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
                fontSize="lg"
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
            <Flex
              justifyContent={'center'}
              gap={{ base: '3rem', md: '8rem' }}
              mt={6}
              flexDirection={{ base: 'column-reverse', md: 'row' }}
            >
              {state.show && isSmallScreen && (
                <Flex justifyContent="center" alignItems="center" zIndex={10}>
                  <GetStarted innerText="Get Started" />
                </Flex>
              )}
              <Flex
                justifyContent="center"
                alignItems="center"
                zIndex={10}
                flexDirection={'column'}
              >
                <Heading
                  tag="For better and smoother experience"
                  marginBottom="0"
                />
                <ButtonGradient />
                <Button className="download-button" onClick={handleDownload}>
                  {' '}
                  Download
                </Button>
              </Flex>
            </Flex>
          </Box>

          <FeedbackModal isOpen={isOpen} onClose={onClose} />
          <Flex
            position="relative"
            maxW={{ base: '23rem', md: '5xl' }}
            mx="auto"
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Box
              position="relative"
              zIndex={1}
              p={0.5}
              borderRadius="2xl"
              bgGradient="linear(to-br, #FFBF00, #D10363)"
              w={{ base: '100%', md: '80%' }}
            >
              <Box position="relative" bg="gray.600" borderRadius="1rem">
                <Box height="1.4rem" bg="gray.600" borderTopRadius="0.9rem" />
                <Box
                  borderBottomRadius="0.9rem"
                  overflow="hidden"
                  sx={{
                    aspectRatio: '33 / 40',
                    '@media (min-width: 769px)': { aspectRatio: '688 / 390' },
                    '@media (min-width: 1240px)': {
                      aspectRatio: '800 / 390',
                    },
                  }}
                >
                  <Box
                    width="100%"
                    height={'100%'}
                    transform={{
                      base: 'scale(1.7) translateY(8%)',
                      md: 'scale(1) translateY(-10%)',
                    }}
                  >
                    <Image
                      src={robot}
                      width={{ base: 688, lg: 1024 }}
                      height={790}
                      alt="AI"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </Box>

                  <ScrollParallax isAbsolutelyPositioned>
                    <UnorderedList
                      listStyleType={'none'}
                      display={{ base: 'none', xl: 'flex' }}
                      position="absolute"
                      left="-5.5rem"
                      bottom="7.5rem"
                      px={1}
                      py={1}
                      bg="rgba(0, 0, 0, 0.4)"
                      backdropFilter="blur(10px)"
                      border="1px solid rgba(0, 0, 0, 0.1)"
                      borderRadius="2xl"
                    >
                      {heroIcons.map((icon, index) => (
                        <ListItem p={5} key={index}>
                          <Image
                            src={icon}
                            width={12}
                            height={25}
                            alt={icon}
                            background={'transparent'}
                          />
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </ScrollParallax>
                </Box>
              </Box>

              <Gradient />
            </Box>

            <BackgroundCircles />
          </Flex>
        </Box>
      </Box>

      <MediumScreenbgGradient
        top="18.25rem"
        left="-25.375rem"
        width="56.625rem"
      />
      <MediumScreenbgGradient
        top="36.25rem"
        left="40.375rem"
        width="56.625rem"
      />
    </Section>
  )
}

export default HeroSection
