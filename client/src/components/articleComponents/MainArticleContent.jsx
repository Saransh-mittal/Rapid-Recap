// components/articleComponents/MainArticleContent.js

import React from 'react'
import {
  Box,
  Flex,
  GridItem,
  Heading,
  Highlight,
  Image,
  Select,
  Skeleton,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { LockIcon } from '@chakra-ui/icons'
import { CiBookmark } from 'react-icons/ci'
import { FaBookmark } from 'react-icons/fa'

const MainArticleContent = ({
  avgTimeRead,
  imgURL,
  translateLoading,
  selectedLanguage,
  title,
  author,
  mainText,
  alt_image,
  textRef,
  articleRef,
  bookmarkStatus,
  state,
  handleLanguageChange,
  dateTime,
  bookmark,
  articleLoading,
}) => {
  const notLoggedIn = state.show
  return (
    <>
      <GridItem
        w="100%"
        className="article-container"
        width={'100%'}
        overflow={'hidden'}
      >
        <Skeleton isLoaded={!translateLoading && !articleLoading}>
          <Flex
            bg="#2A2F4F"
            p={2}
            color="#FDE2F3"
            borderRadius="xl"
            marginBottom="20px"
          >
            <Heading align="left" letterSpacing={1} as="h3" fontSize="25px">
              {title[selectedLanguage]}
            </Heading>
          </Flex>
          <Flex
            justifyContent={'space-between'}
            mb={3}
            flexDirection={{ base: 'column', md: 'row' }}
            position={'relative'}
          >
            <Flex>
              <Heading
                align="left"
                letterSpacing={1}
                as="h4"
                fontSize="15px"
                marginTop="10px"
              >
                <Highlight
                  query="Author:"
                  styles={{
                    px: '2',
                    py: '1',
                    rounded: 'full',
                    bg: '#F7EFE5',
                  }}
                  margin="5px"
                >
                  Author:
                </Highlight>
                <span style={{ fontSize: '20px', marginLeft: '10px' }}>
                  {author[selectedLanguage]}
                </span>
              </Heading>
              <Flex
                display={{ base: 'none', md: 'flex' }}
                mt={'10px'}
                ml={'10px'}
                cursor={'pointer'}
                onClick={() => bookmarkStatus({ view: false, update: true })}
              >
                {bookmark ? (
                  <FaBookmark size={30} color="red" />
                ) : (
                  <CiBookmark size={30} />
                )}
              </Flex>
            </Flex>
            <Flex
              h={'100%'}
              w={{ base: '100%', md: 'auto' }}
              gap={10}
              className="lang-back-flex"
              mt={{ base: '10px', md: '0' }}
              justifyContent={{ base: 'center', md: 'null' }}
            >
              <Flex
                display={{ base: 'flex', md: 'none' }}
                mt={'10px'}
                ml={'10px'}
                cursor={'pointer'}
                onClick={() => bookmarkStatus({ view: false, update: true })}
              >
                {bookmark ? (
                  <FaBookmark size={30} color="red" />
                ) : (
                  <CiBookmark size={30} />
                )}
              </Flex>
              <Box position={'relative'}>
                <Select
                  variant="outline"
                  w={'150px'}
                  backgroundColor={'#2A2F4F'}
                  defaultValue="english"
                  onChange={handleLanguageChange}
                  style={
                    notLoggedIn
                      ? { filter: 'blur(5px)', pointerEvents: 'none' }
                      : {}
                  }
                >
                  <option
                    style={{ backgroundColor: '#2A2F4F' }}
                    value="english"
                  >
                    English
                  </option>
                  <option style={{ backgroundColor: '#2A2F4F' }} value="hindi">
                    Hindi
                  </option>
                </Select>
                {notLoggedIn && (
                  <Tooltip
                    label="Please log in to change language"
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
              </Box>
            </Flex>
          </Flex>
        </Skeleton>

        {/* Article Image */}
        <Skeleton isLoaded={!translateLoading && !articleLoading}>
          <Box
            ref={articleRef}
            p={4}
            bg="#1a1527"
            borderRadius="md"
            color="#E5E7EB"
          >
            <Flex marginTop={5} justifyContent={'center'}>
              <Image
                src={imgURL}
                alt="Article Image"
                borderRadius="md"
                marginBottom="5"
                width={{ base: '100%', sm: '100%', md: '80%', lg: '80%' }}
                height="auto"
                objectFit="contain"
                onError={e => {
                  e.target.onerror = null
                  e.target.src = alt_image
                }}
              />
            </Flex>
            <Flex
              flexDirection={'row'}
              w={'100%'}
              justifyContent={'space-between'}
            >
              <Text
                style={{
                  fontSize: '1.15rem',
                  textTransform: 'uppercase',
                  color: '#9CAFAA',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                }}
              >
                {dateTime}
                {','}
              </Text>
              <Text
                style={{
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  color: '#9CAFAA',

                  letterSpacing: '1px',
                }}
              >
                {avgTimeRead} MIN READ
              </Text>
            </Flex>
            {mainText[selectedLanguage].length === 3 ? (
              <>
                <Text align="justify" mb={4} fontSize="18px" letterSpacing={1}>
                  {mainText[selectedLanguage][0]}
                </Text>
                <Box
                  marginTop="2"
                  marginBottom="2"
                  display={'flex'}
                  alignItems={'justify'}
                  height={'100%'}
                >
                  <Flex position={'relative'} width="100%">
                    <Text
                      ref={textRef}
                      align="justify"
                      letterSpacing={1}
                      fontSize="18px"
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
                </Box>
                <Flex
                  marginTop="2"
                  marginBottom="2"
                  display={'flex'}
                  alignItems={'justify'}
                  height={'100%'}
                >
                  <Text
                    ref={textRef}
                    align="justify"
                    letterSpacing={1}
                    fontSize="18px"
                    style={
                      notLoggedIn
                        ? { filter: 'blur(5px)', userSelect: 'none' }
                        : { userSelect: 'text' }
                    }
                  >
                    {mainText[selectedLanguage][2]}
                  </Text>
                </Flex>
              </>
            ) : (
              <>
                <Text align="justify" letterSpacing={1} mb={4} fontSize="18px">
                  {mainText[selectedLanguage][0]}
                </Text>
                <Flex position={'relative'} width="100%">
                  <Text
                    align="justify"
                    letterSpacing={1}
                    fontSize="18px"
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
    </>
  )
}

export default MainArticleContent
