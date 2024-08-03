import React, { useState } from 'react'
import {
  Box,
  Divider,
  Flex,
  GridItem,
  Image,
  Skeleton,
  Text,
  Tooltip,
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

  return (
    <GridItem w="100%" overflow={'hidden'}>
      <Skeleton isLoaded={!translateLoading && !articleLoading}>
        <Box
          ref={articleRef}
          px={6} // Added padding for better spacing
          py={3}
          bg="rgba(26, 21, 39, 0.6)" // Matched background color with the HTML design
          bgGradient="linear(to-r, rgba(26, 21, 39, 0.8), rgba(34, 32, 52, 0.9), rgba(48, 44, 66, 1))"
          borderRadius="lg"
          boxShadow="lg" // Added box shadow to mimic the shadow effect
          color="#E5E7EB"
          fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          fontSize="1.1rem"
          lineHeight="1.8"
        >
          <Flex justifyContent={'center'} mt={5}>
            <Image
              src={imgURL}
              alt="Article Image"
              borderRadius="md"
              mb={5}
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
                mb={4}
                mx={2}
                fontSize="1.1rem"
                letterSpacing={1}
                // style={{ fontFamily: 'Georgia, serif' }}
              >
                {mainText[selectedLanguage][0]}
              </Text>
              {/* <Divider my={2} color="#bfbbb4" width={'10%'} /> */}

              <Box mt={2} mb={2}>
                <Flex position={'relative'} width="100%">
                  <Text
                    ref={textRef}
                    align="justify"
                    letterSpacing={1}
                    fontSize="1.1rem"
                    style={
                      notLoggedIn
                        ? { filter: 'blur(5px)', userSelect: 'none' }
                        : { userSelect: 'text' }
                    }
                    mx={2}
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
                        boxSize={8}
                        zIndex={2}
                      />
                    </Tooltip>
                  )}
                </Flex>
              </Box>
              {/* <Divider my={2} borderColor="gray.200" width={'10%'} /> */}
              <Flex mt={2} mb={2}>
                <Text
                  ref={textRef}
                  align="justify"
                  letterSpacing={1}
                  fontSize="1.1rem"
                  style={
                    notLoggedIn
                      ? { filter: 'blur(5px)', userSelect: 'none' }
                      : { userSelect: 'text' }
                  }
                  mx={2}
                >
                  {mainText[selectedLanguage][2]}
                </Text>
              </Flex>
            </>
          ) : (
            <>
              <Text align="justify" letterSpacing={1} mb={4} fontSize="1.1rem">
                {mainText[selectedLanguage][0]}
              </Text>
              <Flex position={'relative'} width="100%">
                <Text
                  align="justify"
                  letterSpacing={1}
                  fontSize="1.1rem"
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
                      boxSize={8}
                      zIndex={2}
                    />
                  </Tooltip>
                )}
              </Flex>
            </>
          )}
        </Box>
      </Skeleton>
    </GridItem>
  )
}

export default MainArticleContent
