import React, { useMemo, useState } from 'react'
import {
  Box,
  Flex,
  Icon,
  Image,
  Link,
  Skeleton,
  useBreakpointValue,
  useMediaQuery,
} from '@chakra-ui/react'
import FormattedContent from './MainArticleContentComponents/FormattedContent'
import SourceLinkTag from './MainArticleContentComponents/SourceLinkTag'
import { HighlightedWordsProvider } from '../../contextAPI/MainArticleProvider'
import { ExternalLinkIcon } from '@chakra-ui/icons'

const MainArticleContent = ({
  imgURL,
  selectedLanguage,
  mainText,
  textRef,
  articleRef,
  articleLoading,
  themedContent,
  SourceURL,
  dictionary = [],
  importantSentences = [],
}) => {
  const [useAltImage, setUseAltImage] = useState(false)
  const [isMobile] = useMediaQuery('(max-width: 480px)')
  // Memoize the content props
  const contentProps = useMemo(
    () => ({
      mainText: mainText[selectedLanguage],
      themedContent,
      dictionary,
      importantSentences,
    }),
    [mainText, selectedLanguage, themedContent, dictionary, importantSentences],
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
      <Skeleton isLoaded={!articleLoading} w="100%">
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
        >
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
          <HighlightedWordsProvider>
            <FormattedContent {...contentProps} />
          </HighlightedWordsProvider>
          <Link
            // key={index}
            // href={part}
            // isExternal
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
            {/* {websiteName} */}
            Read More
            <Icon as={ExternalLinkIcon} ml={1} boxSize={3} />
          </Link>
          <SourceLinkTag SourceURL={SourceURL} />
        </Box>
      </Skeleton>
    </Flex>
  )
}

export default MainArticleContent
