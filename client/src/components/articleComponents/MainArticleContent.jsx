import React, { useMemo, useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Icon,
  useBreakpointValue,
  useMediaQuery,
  Skeleton,
  Grid,
  Image,
} from '@chakra-ui/react'
import { StarIcon } from '@chakra-ui/icons'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import FormattedContent from './MainArticleContentComponents/FormattedContent'
import SourceLinkTag from './MainArticleContentComponents/SourceLinkTag'
import { HighlightedWordsProvider } from '../../contextAPI/MainArticleProvider'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const BenefitItem = ({ icon, text }) => (
  <Flex
    align="center"
    bg="rgba(255, 255, 255, 0.05)"
    p={2}
    borderRadius="md"
    _hover={{
      bg: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-1px)',
      transition: 'all 0.2s',
    }}
  >
    <Text fontSize="lg" mr={2}>
      {icon}
    </Text>
    <Text fontSize="sm" color="gray.300">
      {text}
    </Text>
  </Flex>
)
const extractWebsiteInfo = text => {
  if (!text) return null
  // Look for URL in the format "Visit to book your tickets now: URL"
  const urlMatch = text.match(/(?:.*:\s*)(https?:\/\/[^\s]+)$/)
  if (!urlMatch) return null

  const fullUrl = urlMatch[1]
  // Extract domain name without protocol and path
  const domainMatch = fullUrl.match(/^https?:\/\/(?:www\.)?([^\/]+)/)
  if (!domainMatch) return null

  // Get the first part of the domain (e.g., "easyjet" from "easyjet.com")
  const websiteName = domainMatch[1].split('.')[0]

  return {
    websiteName: websiteName.charAt(0).toUpperCase() + websiteName.slice(1), // Capitalize first letter
    fullUrl,
  }
}

const MainArticleContent = React.memo(
  ({
    imgURL,
    selectedLanguage,
    mainText,
    textRef,
    articleRef,

    themedContent,
    SourceURL,
    dictionary = [],
    importantSentences = [],
  }) => {
    const { isAuthenticated } = useSelector(state => state.auth)
    const [useAltImage, setUseAltImage] = useState(false)
    const [isMobile] = useMediaQuery('(max-width: 480px)')

    const websiteInfo = useMemo(() => {
      if (!mainText || !mainText[selectedLanguage]) return null
      const textArray = mainText[selectedLanguage]
      const lastElement = Array.isArray(textArray)
        ? textArray[textArray.length - 1]
        : textArray
      return extractWebsiteInfo(lastElement)
    }, [mainText, selectedLanguage])

    // Memoize the content props
    const contentProps = useMemo(
      () => ({
        mainText: selectedLanguage ? mainText[selectedLanguage] : mainText,
        themedContent,
        dictionary,
        importantSentences,
      }),
      [
        mainText,
        selectedLanguage,
        themedContent,
        dictionary,
        importantSentences,
      ],
    )

    const handleImageError = () => {
      if (!useAltImage) {
        setUseAltImage(true)
      }
    }

    const fontSize = useBreakpointValue({
      base: '1rem',
      sm: '1.1rem',
      md: '1.2rem',
      lg: '1.25rem',
    })

    const padding = useBreakpointValue({
      base: 2,
      sm: 3,
      md: 4,
      lg: 6,
    })

    return (
      <Flex w={{ base: '90vw', sm: '90vw', md: '100%' }} overflow="hidden">
        <Box
          ref={articleRef}
          px={padding}
          py={3}
          bg="rgba(26, 21, 39, 0.8)"
          borderRadius="lg"
          boxShadow="dark-lg"
          fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          fontSize={fontSize}
          lineHeight="1.8"
          position="relative"
        >
          {/* Image Section */}
          <Box as="figure">
            <Flex justifyContent="center" mt={[2, 3, 5]}>
              <Image
                src={imgURL}
                alt="Article Image"
                borderRadius="md"
                mb={[2, 3, 4]}
                width={{ base: '100%', sm: '100%', md: '80%', lg: '100%' }}
                height="auto"
                objectFit="contain"
                onError={handleImageError}
                loading="lazy"
              />
            </Flex>
          </Box>

          {/* Content Container */}
          <Box
            position="relative"
            display={'flex'}
            w={'100%'}
            h={'100%'}
            flexDirection={'column'}
            alignItems={'center'}
            // sx={{
            //   ...(!isAuthenticated && {
            //     '& > *': {
            //       // Target all children
            //       '&::after': {
            //         content: '""',
            //         position: 'absolute',
            //         top: '45%', // Match your first blur layer
            //         left: 0,
            //         right: 0,
            //         bottom: 0,
            //         zIndex: 1,
            //         pointerEvents: 'auto', // Enable pointer events on the blocker
            //         cursor: 'default',
            //         userSelect: 'none',
            //         WebkitUserSelect: 'none',
            //       },
            //     },
            //     '& *::selection': {
            //       background: 'transparent',
            //     },
            //     // Disable all interactive elements below blur
            //     'a, button, [role="button"], [tabindex]': {
            //       pointerEvents: 'none',
            //       cursor: 'default',
            //       '&:hover': {
            //         textDecoration: 'none',
            //       },
            //     },
            //     // Disable dictionary word interactions
            //     '[data-dictionary-word]': {
            //       pointerEvents: 'none',
            //       cursor: 'default',
            //       '&:hover': {
            //         transform: 'none !important',
            //         background: 'none !important',
            //       },
            //     },
            //   }),
            // }}
          >
            {/* Main Content */}
            <Box position="relative">
              <HighlightedWordsProvider>
                <FormattedContent {...contentProps} />
              </HighlightedWordsProvider>
            </Box>

            {/* Source Link */}
            {SourceURL && (
              <Box position="relative" zIndex={2} mt={4}>
                {websiteInfo && (
                  <Link
                    href={websiteInfo.fullUrl}
                    isExternal
                    display="inline-flex"
                    alignItems="center"
                    px={2}
                    py={1}
                    mx={1}
                    fontSize="sm"
                    fontWeight="semibold"
                    color="blue.500"
                    bg="blue.50"
                    borderRadius="md"
                    boxShadow="sm"
                    _hover={{
                      bg: 'blue.100',
                      color: 'blue.600',
                      textDecoration: 'none',
                    }}
                    _active={{
                      bg: 'blue.200',
                    }}
                    transition="all 0.2s ease-in-out"
                  >
                    {websiteInfo.websiteName}
                    <Icon as={ExternalLinkIcon} ml={1} boxSize={3} />
                  </Link>
                )}
                <SourceLinkTag SourceURL={SourceURL} />
              </Box>
            )}
          </Box>
        </Box>
      </Flex>
    )
  },
)

export default MainArticleContent
