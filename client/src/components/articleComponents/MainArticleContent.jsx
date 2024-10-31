import React, { useState } from 'react'
import {
  Box,
  Flex,
  Image,
  Skeleton,
  useBreakpointValue,
  useMediaQuery,
} from '@chakra-ui/react'
import FormattedContent from './MainArticleContentComponents/FormattedContent'
import SourceLinkTag from './MainArticleContentComponents/SourceLinkTag'

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
    <Flex w={{ base: '95vw', sm: '90vw', md: '100%' }} overflow="hidden">
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
                maxHeight={{
                  base: '250px',
                  sm: '300px',
                  md: '400px',
                  lg: '500px',
                }}
                objectFit="contain"
                onError={handleImageError}
                loading="lazy"
              />
            </Flex>
          </Box>

          <FormattedContent
            mainText={mainText[selectedLanguage]}
            themedContent={themedContent}
            dictionary={dictionary}
            importantSentences={importantSentences}
          />

          <SourceLinkTag SourceURL={SourceURL} />
        </Box>
      </Skeleton>
    </Flex>
  )
}

export default MainArticleContent
