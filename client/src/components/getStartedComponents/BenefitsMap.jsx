import React from 'react'
import {
  Box,
  Heading,
  Text,
  Flex,
  Circle,
  Icon,
  useColorModeValue,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ArrowForwardIcon, ArrowDownIcon } from '@chakra-ui/icons'
import { Parallax, ParallaxProvider } from 'react-scroll-parallax'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const BenefitItem = ({ icon, titleKey, descriptionKey, index, speed }) => {
  const { t } = useTranslation('GetStarted')
  return (
    <Parallax speed={speed}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        mb={8}
        textAlign="center"
        width="100%"
      >
        <Circle
          size={{ base: '60px', md: '80px' }}
          bg="rgba(78, 205, 196, 0.1)"
          color="brand.500"
          mb={4}
          mx="auto"
          borderWidth="2px"
          borderColor="brand.500"
        >
          <Icon as={icon} boxSize={{ base: 8, md: 10 }} />
        </Circle>
        <Heading size="md" mb={2} color="brand.500">
          {t(titleKey)}
        </Heading>
        <Text fontSize="sm" maxWidth="250px" mx="auto">
          {t(descriptionKey)}
        </Text>
      </MotionBox>
    </Parallax>
  )
}

const Arrow = ({ direction = 'right' }) => {
  const ArrowIcon = direction === 'down' ? ArrowDownIcon : ArrowForwardIcon
  return (
    <MotionFlex
      justify="center"
      align="center"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      my={2}
    >
      <ArrowIcon
        boxSize={6}
        color="brand.500"
        transform={direction === 'left' ? 'rotate(180deg)' : undefined}
      />
    </MotionFlex>
  )
}

const BenefitsMap = () => {
  const { t } = useTranslation('GetStarted')
  const bgColor = useColorModeValue(
    'rgba(255, 255, 255, 0.8)',
    'rgba(0, 0, 0, 0.8)',
  )
  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <ParallaxProvider>
      <Box py={20} position="relative" overflow="hidden">
        <Parallax speed={-5}>
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg={bgColor}
          />
        </Parallax>
        <Box
          maxWidth="1200px"
          margin="0 auto"
          position="relative"
          zIndex={1}
          px={4}
        >
          <Parallax speed={-2}>
            <Heading
              as="h2"
              size={{ base: 'xl', md: '2xl' }}
              textAlign="center"
              mb={16}
              color="brand.500"
              fontWeight="bold"
              letterSpacing="wide"
            >
              {t('BenefitsMap.mainTitle')}
            </Heading>
          </Parallax>

          <VStack spacing={8} align="stretch">
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align="center"
            >
              <BenefitItem
                icon={() => (
                  <Text fontSize={{ base: '3xl', md: '4xl' }}>📰</Text>
                )}
                titleKey="BenefitsMap.curatedNews.title"
                descriptionKey="BenefitsMap.curatedNews.description"
                index={0}
                speed={2}
              />
              {isMobile ? (
                <Arrow direction="down" />
              ) : (
                <Box width="5%" display="flex" justifyContent="center">
                  <Arrow direction="right" />
                </Box>
              )}
              <BenefitItem
                icon={() => (
                  <Text fontSize={{ base: '3xl', md: '4xl' }}>🧠</Text>
                )}
                titleKey="BenefitsMap.activeLearning.title"
                descriptionKey="BenefitsMap.activeLearning.description"
                index={1}
                speed={3}
              />
              {isMobile ? (
                <Arrow direction="down" />
              ) : (
                <Box width="5%" display="flex" justifyContent="center">
                  <Arrow direction="right" />
                </Box>
              )}
              <BenefitItem
                icon={() => (
                  <Text fontSize={{ base: '3xl', md: '4xl' }}>📊</Text>
                )}
                titleKey="BenefitsMap.trackProgress.title"
                descriptionKey="BenefitsMap.trackProgress.description"
                index={2}
                speed={2}
              />
            </Flex>

            <Arrow direction="down" />

            <Parallax speed={5}>
              <Flex justify="center" align="center">
                <MotionBox
                  bg="brand.500"
                  p={8}
                  borderRadius="lg"
                  width={{ base: '100%', md: '80%' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Heading
                    size={{ base: 'md', md: 'lg' }}
                    mb={4}
                    textAlign="center"
                    color="white"
                  >
                    {t('BenefitsMap.infoRetention.title')}
                  </Heading>
                  <Text
                    fontSize={{ base: 'sm', md: 'md' }}
                    textAlign="center"
                    color="white"
                    lineHeight="tall"
                  >
                    {t('BenefitsMap.infoRetention.description')}
                  </Text>
                </MotionBox>
              </Flex>
            </Parallax>

            <Arrow direction="down" />

            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align="center"
            >
              <BenefitItem
                icon={() => (
                  <Text fontSize={{ base: '3xl', md: '4xl' }}>🏆</Text>
                )}
                titleKey="BenefitsMap.competitiveEdge.title"
                descriptionKey="BenefitsMap.competitiveEdge.description"
                index={3}
                speed={2}
              />
              {isMobile ? (
                <Arrow direction="down" />
              ) : (
                <Box width="5%" display="flex" justifyContent="center">
                  <Arrow direction="right" />
                </Box>
              )}
              <BenefitItem
                icon={() => (
                  <Text fontSize={{ base: '3xl', md: '4xl' }}>🌐</Text>
                )}
                titleKey="BenefitsMap.informedCitizen.title"
                descriptionKey="BenefitsMap.informedCitizen.description"
                index={4}
                speed={3}
              />
              {isMobile ? (
                <Arrow direction="down" />
              ) : (
                <Box width="5%" display="flex" justifyContent="center">
                  <Arrow direction="right" />
                </Box>
              )}
              <BenefitItem
                icon={() => (
                  <Text fontSize={{ base: '3xl', md: '4xl' }}>🚀</Text>
                )}
                titleKey="BenefitsMap.personalGrowth.title"
                descriptionKey="BenefitsMap.personalGrowth.description"
                index={5}
                speed={2}
              />
            </Flex>
          </VStack>
        </Box>
      </Box>
    </ParallaxProvider>
  )
}

export default BenefitsMap
