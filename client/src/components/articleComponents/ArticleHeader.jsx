// File: src/components/ArticleHeader.jsx

import React, { useContext } from 'react'
import {
  Flex,
  Text,
  Highlight,
  Box,
  useDisclosure,
  Image,
  Badge,
  Stack,
  useMediaQuery,
  Tooltip,
  useToast,
} from '@chakra-ui/react'
import { FaBookmark } from 'react-icons/fa'
import { CiBookmark } from 'react-icons/ci'
import { AiOutlineLock } from 'react-icons/ai'
import { AppContext } from '../../contextAPI/appContext'
import ShareButton from './ShareButton'
import ShareChatModal from '../chatComponent/miniComponents/ShareChatModal'
import QuinBoost from './quizComponents/QuinBoost'
import { LockIcon } from '@chakra-ui/icons'
import TextBackgound from '/images/textBackground.webp'
import starBoost from '/GIFs/starBoost.gif'
import Button from '../miscellaneous/ButtonComponent'

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
        px={2}
        py={1}
        borderRadius="full"
        bg={isEnglish ? 'white' : 'transparent'}
        color={isEnglish ? 'purple.800' : 'white'}
        fontWeight="bold"
        transition="all 0.3s"
        fontSize={['xs', 'sm']}
      >
        ENG
      </Box>
      <Box
        px={2}
        py={1}
        borderRadius="full"
        bg={!isEnglish ? 'white' : 'transparent'}
        color={!isEnglish ? 'purple.800' : 'white'}
        fontWeight="bold"
        transition="all 0.3s"
        fontSize={['xs', 'sm']}
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
  openModal,
  quinTour,
}) => {
  const notLoggedIn = state.show
  const { playClick } = useContext(AppContext)
  const { isOpen, onOpen: onOpenShareModal, onClose } = useDisclosure()
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const toast = useToast()

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
  }

  return (
    <Flex
      bg="linear-gradient(135deg, #2A2F4F 0%, #917FB3 100%)"
      px={[3, 4, 6]}
      py={[2, 3]}
      borderTopRadius="xl"
      mb={[3, 4, 5]}
      flexDirection="column"
      w="100%"
    >
      <Text
        fontSize={['xl', '2xl', '2.2rem']}
        mb={2}
        fontWeight="bold"
        letterSpacing="1px"
      >
        {title[selectedLanguage]}
      </Text>

      <Flex
        spacing={[2, 3, 4]}
        direction={['column', 'column', 'row']}
        justify="space-between"
        // justifyContent={'flex-end'}
        align={['flex-start', 'flex-start', 'center']}
      >
        <Flex>
          <Flex alignItems="center" gap={2} justifyContent={'center'}>
            <Text fontSize={['md', 'lg', 'xl']}>
              <Highlight
                query="Author"
                styles={{
                  px: '2',
                  py: '1',
                  rounded: 'full',
                  bg: '#F7EFE5',
                }}
              >
                Author
              </Highlight>
              <b>{' : '}</b>
              {author[selectedLanguage]}
            </Text>
            <Flex
              onClick={() => {
                playClick()
                bookmarkStatus({ view: false, update: true })
              }}
              cursor="pointer"
              mb={4}
            >
              {bookmark ? (
                <FaBookmark size={20} color="red" />
              ) : (
                <CiBookmark size={20} />
              )}
            </Flex>
          </Flex>
          {!isLargerThan768 && (
            <Flex alignItems={'center'} mb={4} ml={6}>
              <LanguageToggle
                isEnglish={selectedLanguage === 'english'}
                onToggle={toggleLanguage}
                isDisabled={notLoggedIn}
              />
            </Flex>
          )}
        </Flex>

        <Flex alignItems={'center'} gap={2}>
          <Flex mb={4}>
            {isQuinBoostAvailable ? (
              <QuinBoost />
            ) : (
              !state.isBoosted && (
                <Flex flexDirection={'column'}>
                  <Text
                    m={0}
                    p={0}
                    textAlign={'left'}
                    // paddingLeft={'30px'}
                    // position={'absolute'}
                    fontSize={'0.8rem'}
                    // color={'#9CAFAA'}
                    fontWeight={'bold'}
                  >
                    Quin Boost
                  </Text>
                  <Flex
                    position="relative"
                    onClick={e => {
                      playClick()
                      if (notLoggedIn) {
                        e.preventDefault()
                        return
                      }
                      quinTour.complete()
                      openModal()
                    }}
                    cursor="pointer"
                  >
                    <Button textColor={'white'}>
                      {quizLeftToGetQuizBoost} Quiz Left
                    </Button>
                    {notLoggedIn && (
                      <LockIcon
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        color="white"
                        boxSize={6}
                        zIndex={2}
                      />
                    )}
                  </Flex>
                </Flex>
              )
            )}

            {state.isBoosted && (
              <Flex
                alignItems="center"
                gap={2}
                cursor="pointer"
                onClick={() => {
                  playClick()
                  openModal()
                }}
              >
                <Image
                  src={starBoost}
                  bg="none"
                  h={['40px', '50px', '60px']}
                  w={['40px', '50px', '60px']}
                />
                <Badge fontSize={['sm', 'md', 'lg']} color="yellow" bg="none">
                  Enjoy!! 1.5x multiplier
                </Badge>
              </Flex>
            )}
          </Flex>

          <ShareButton onClick={handleShare} isDisabled={notLoggedIn} />
          {isLargerThan768 && (
            <LanguageToggle
              isEnglish={selectedLanguage === 'english'}
              onToggle={toggleLanguage}
              isDisabled={notLoggedIn}
            />
          )}
          {isLargerThan768 && (
            <Flex
              justifyContent={{ base: 'flex-end', md: '' }}
              w={{ base: '100%', md: 'auto' }}
            >
              <Text fontSize={['sm', 'md', 'lg']} mb={0}>
                {avgTimeRead} min read • {dateTime}
              </Text>
            </Flex>
          )}
        </Flex>
        {!isLargerThan768 && (
          <Flex
            justifyContent={{ base: 'flex-end', md: '' }}
            w={{ base: '100%', md: 'auto' }}
          >
            <Text fontSize={['sm', 'md', 'lg']}>
              {avgTimeRead} min read • {dateTime}
            </Text>
          </Flex>
        )}
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
