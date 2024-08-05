import React, { useState } from 'react'
import {
  Box,
  Flex,
  GridItem,
  Image,
  Skeleton,
  Text,
  Tooltip,
  useBreakpointValue,
} from '@chakra-ui/react'
import { LockIcon } from '@chakra-ui/icons'

const MainArticleContent = ({
  imgURL,
  translateLoading,
  selectedLanguage,
  mainText,
  textRef,
  articleRef,
  state,
  articleLoading,
}) => {
  const notLoggedIn = state.show
  const [useAltImage, setUseAltImage] = useState(false)

  const handleImageError = () => {
    if (!useAltImage) {
      setUseAltImage(true)
    }
  }

  const fontSize = useBreakpointValue({
    base: '0.9rem',
    md: '1rem',
    lg: '1.1rem',
  })
  const padding = useBreakpointValue({ base: 3, md: 4, lg: 6 })

  return (
    <Flex w={{ base: '90vw', md: '100%' }} overflow="hidden">
      <Skeleton isLoaded={!translateLoading && !articleLoading}>
        <Box
          ref={articleRef}
          px={padding}
          py={3}
          bg="rgba(26, 21, 39, 0.6)"
          bgGradient="linear(to-r, rgba(26, 21, 39, 0.8), rgba(34, 32, 52, 0.9), rgba(48, 44, 66, 1))"
          borderRadius="lg"
          boxShadow="lg"
          color="#E5E7EB"
          fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          fontSize={fontSize}
          lineHeight="1.8"
        >
          <Flex justifyContent="center" mt={[2, 3, 5]}>
            <Image
              src={imgURL}
              alt="Article Image"
              borderRadius="md"
              mb={[3, 4, 5]}
              width={{ base: '100%', sm: '100%', md: '80%', lg: '98%' }}
              height="auto"
              objectFit="contain"
              onError={handleImageError}
            />
          </Flex>

          {mainText[selectedLanguage].length === 3 ? (
            <>
              <Text
                align="justify"
                mb={[2, 3, 4]}
                mx={[1, 2]}
                fontSize={fontSize}
                letterSpacing={1}
              >
                {mainText[selectedLanguage][0]}
              </Text>

              <Box mt={2} mb={2}>
                <Flex position="relative" width="100%">
                  <Text
                    ref={textRef}
                    align="justify"
                    letterSpacing={1}
                    fontSize={fontSize}
                    style={
                      notLoggedIn
                        ? { filter: 'blur(5px)', userSelect: 'none' }
                        : { userSelect: 'text' }
                    }
                    mx={[1, 2]}
                  >
                    {mainText[selectedLanguage][1]}
                  </Text>
                  {notLoggedIn && (
                    <Tooltip
                      label="Please log in to view content"
                      placement="top"
                    >
                      <LockIcon
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        color="white"
                        boxSize={[6, 7, 8]}
                        zIndex={2}
                      />
                    </Tooltip>
                  )}
                </Flex>
              </Box>

              <Flex mt={2} mb={2}>
                <Text
                  ref={textRef}
                  align="justify"
                  letterSpacing={1}
                  fontSize={fontSize}
                  style={
                    notLoggedIn
                      ? { filter: 'blur(5px)', userSelect: 'none' }
                      : { userSelect: 'text' }
                  }
                  mx={[1, 2]}
                >
                  {mainText[selectedLanguage][2]}
                </Text>
              </Flex>
            </>
          ) : (
            <>
              <Text
                align="justify"
                letterSpacing={1}
                mb={[2, 3, 4]}
                fontSize={fontSize}
              >
                {mainText[selectedLanguage][0]}
              </Text>
              <Flex position="relative" width="100%">
                <Text
                  align="justify"
                  letterSpacing={1}
                  fontSize={fontSize}
                  style={
                    notLoggedIn
                      ? { filter: 'blur(5px)', userSelect: 'none' }
                      : { userSelect: 'text' }
                  }
                >
                  {mainText[selectedLanguage][1]}
                </Text>
                {notLoggedIn && (
                  <Tooltip
                    label="Please log in to view content"
                    placement="top"
                  >
                    <LockIcon
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      color="white"
                      boxSize={[6, 7, 8]}
                      zIndex={2}
                    />
                  </Tooltip>
                )}
              </Flex>
            </>
          )}
        </Box>
      </Skeleton>
    </Flex>
  )
}

export default MainArticleContent
