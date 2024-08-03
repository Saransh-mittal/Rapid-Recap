// File: src/components/ArticleHeader.jsx

import React, { useContext, useState } from 'react'
import {
  Flex,
  Text,
  Highlight,
  Switch,
  Tooltip,
  Box,
  useDisclosure,
  Image,
} from '@chakra-ui/react'
import { FaBookmark } from 'react-icons/fa'
import { CiBookmark } from 'react-icons/ci'
import { AiOutlineLock } from 'react-icons/ai' // Importing an alternative lock icon
import { AppContext } from '../../contextAPI/appContext'
import ShareButton from './ShareButton'
import ShareChatModal from '../chatComponent/miniComponents/ShareChatModal'
import QuinBoost from './quizComponents/QuinBoost'
import { LockIcon } from '@chakra-ui/icons'
import TextBackgound from '/images/textBackground.webp'

const LanguageToggle = ({ isEnglish, onToggle, isDisabled }) => (
  <Tooltip
    label={isDisabled ? 'Please log in to change language' : 'Toggle language'}
  >
    <Box
      as="button"
      display="flex"
      alignItems="center"
      bg="rgba(255, 255, 255, 0.1)"
      borderRadius="full"
      p="2px"
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      onClick={isDisabled ? null : onToggle}
      position="relative"
      border="1px solid"
      borderColor="whiteAlpha.300"
      _hover={isDisabled ? {} : { borderColor: 'whiteAlpha.500' }}
    >
      <Box
        px={3}
        py={1}
        borderRadius="full"
        bg={isEnglish ? 'white' : 'transparent'}
        color={isEnglish ? 'purple.800' : 'white'}
        fontWeight="bold"
        transition="all 0.3s"
      >
        ENG
      </Box>
      <Box
        px={3}
        py={1}
        borderRadius="full"
        bg={!isEnglish ? 'white' : 'transparent'}
        color={!isEnglish ? 'purple.800' : 'white'}
        fontWeight="bold"
        transition="all 0.3s"
      >
        HIN
      </Box>
      {isDisabled && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          color="white"
          zIndex={2}
        >
          <AiOutlineLock size={16} />
        </Box>
      )}
    </Box>
  </Tooltip>
)

const ArticleHeader = ({
  title,
  author,
  selectedLanguage,
  bookmark,
  handleLanguageChange,
  avgTimeRead,
  dateTime,
  state,
  bookmarkStatus,
  article,
  isQuinBoostAvailable,
  quizLeftToGetQuizBoost,
}) => {
  const notLoggedIn = state.show
  const { playClick } = useContext(AppContext)
  const { isOpen, onOpen: onOpenShareModal, onClose } = useDisclosure()

  const toggleLanguage = () => {
    const newLanguage = selectedLanguage === 'english' ? 'hindi' : 'english'
    handleLanguageChange({ target: { value: newLanguage } })
  }

  const handleShare = () => {
    if (notLoggedIn) {
      toast({
        title: 'Login Required',
        description: 'Please log in to share this article.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    onOpenShareModal()

    // In a real implementation, you might do something like:
    // shareToChat(article);
  }

  return (
    <Flex
      bg="linear-gradient(135deg, #2A2F4F 0%, #917FB3 100%)"
      p={6}
      borderTopLeftRadius={'xl'}
      borderTopRightRadius={'xl'}
      marginBottom="20px"
      flexDirection="column"
    >
      <Text as="h1" mb={6} fontWeight="bold" letterSpacing="1px">
        {title[selectedLanguage]}
      </Text>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        position="relative"
      >
        <Flex alignItems="center" gap={2}>
          <Text fontSize="xl">
            <Highlight
              query="Author"
              styles={{
                px: '2',
                py: '1',
                rounded: 'full',
                bg: '#F7EFE5',
              }}
              margin="5px"
            >
              Author
            </Highlight>
            <b>{' : '}</b>
            {author[selectedLanguage]}
          </Text>
          <Flex
            display={{ base: 'none', md: 'flex' }}
            mb="0.7rem"
            alignItems="center"
            cursor="pointer"
            onClick={() => {
              playClick()
              bookmarkStatus({ view: false, update: true })
            }}
          >
            {bookmark ? (
              <FaBookmark size={25} color="red" />
            ) : (
              <CiBookmark size={25} />
            )}
          </Flex>
        </Flex>
        <Flex gap={3}>
          <Flex
            flexDirection={'column'}
            // className="quin-boost-tag"
          >
            {isQuinBoostAvailable ? (
              <Flex mb={5}>
                <QuinBoost />
              </Flex>
            ) : (
              !state.isBoosted && (
                <>
                  <Text
                    m={0}
                    p={0}
                    textAlign={'left'}
                    paddingLeft={'30px'}
                    position={'absolute'}
                    color={'#9CAFAA'}
                    fontWeight={'bold'}
                  >
                    Quin Boost
                  </Text>
                  <Flex
                    marginTop={'5px'}
                    position={'relative'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    onClick={e => {
                      playClick()
                      if (notLoggedIn) {
                        e.preventDefault()
                        return
                      }
                      quinTour.complete()
                      openModal()
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <Image
                      src={TextBackgound}
                      background={'none'}
                      height={'100px'}
                      width={'200px'}
                      className="quin-boost-tracker"
                      style={notLoggedIn ? { filter: 'blur(5px)' } : {}}
                    />
                    <Text
                      m={0}
                      p={0}
                      textAlign={'left'}
                      position={'absolute'}
                      color={'black'}
                      fontSize={'20px'}
                      fontWeight={'bold'}
                    >
                      {quizLeftToGetQuizBoost} Quiz Left
                    </Text>
                    {notLoggedIn && (
                      <Tooltip
                        label="Please log in to use the feature"
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
              )
            )}
          </Flex>
          <Flex justifyContent={'center'} alignItems={'center'}>
            <ShareButton onClick={handleShare} isDisabled={notLoggedIn} />
          </Flex>
          <Flex justifyContent={'center'} alignItems={'center'}>
            <LanguageToggle
              isEnglish={selectedLanguage === 'english'}
              onToggle={toggleLanguage}
              isDisabled={notLoggedIn}
            />
          </Flex>
          <Flex alignItems={'center'}>
            <Text fontSize="lg" m={0} textAlign={'center'}>
              {avgTimeRead} min read • {dateTime}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <ShareChatModal
        isOpen={isOpen}
        onClose={onClose}
        articleToShare={article}
        notLoggedIn={notLoggedIn}
      />
    </Flex>
  )
}

export default ArticleHeader
