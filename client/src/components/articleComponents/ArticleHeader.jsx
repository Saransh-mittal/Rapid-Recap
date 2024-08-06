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
  Skeleton,
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

const LanguageToggle = ({ isEnglish, onToggle, isDisabled, onSigninOpen }) => (
  <Tooltip
    label={isDisabled ? 'Please log in to change language' : 'Toggle language'}
    position={'relative'}
  >
    <Flex position={'relative'}>
      {isDisabled && (
        <LockIcon
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          color="white"
          boxSize={6}
          zIndex={2}
          onClick={onSigninOpen}
          cursor={'pointer'}
        />
      )}
      <Box
        as="button"
        display="flex"
        alignItems="center"
        bg="rgba(255, 255, 255, 0.1)"
        borderRadius="full"
        p="2px"
        cursor={isDisabled ? 'not-allowed' : 'pointer'}
        onClick={onToggle}
        position="relative"
        border="1px solid"
        borderColor="whiteAlpha.300"
        _hover={isDisabled ? {} : { borderColor: 'whiteAlpha.500' }}
        style={
          isDisabled
            ? { filter: 'blur(5px)', userSelect: 'none' }
            : { userSelect: 'text' }
        }
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
    </Flex>
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
  onSigninOpen,
}) => {
  const notLoggedIn = state.show
  const { playClick } = useContext(AppContext)
  const { isOpen, onOpen: onOpenShareModal, onClose } = useDisclosure()
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const toast = useToast()

  const toggleLanguage = () => {
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
    <Skeleton isLoaded={!!title[selectedLanguage]} w={'100%'} mb={[3, 4, 5]}>
      <Flex
        bg="linear-gradient(135deg, #2A2F4F 0%, #917FB3 100%)"
        px={[3, 4, 6]}
        py={[2, 3]}
        borderTopRadius="xl"
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
          align={['flex-start', 'flex-start', 'center']}
        >
          <Flex w={'100%'} mb={4}>
            <Flex
              alignItems="center"
              gap={1}
              justifyContent={'flex-start'}
              w={'100%'}
            >
              <Flex fontSize={['md', 'lg', 'xl']} alignItems={'center'}>
                <Highlight
                  query="Author"
                  styles={{
                    px: '2',
                    py: '1',
                    rounded: 'full',
                    bg: '#F7EFE5',
                    fontWeight: 'bold',
                  }}
                >
                  Author
                </Highlight>

                <Flex>
                  <Text mb={0} fontWeight={'bold'}>
                    {'  : '}
                    {author[selectedLanguage]}
                  </Text>
                </Flex>
              </Flex>
              <Flex
                onClick={() => {
                  playClick()
                  bookmarkStatus({ view: false, update: true })
                }}
                cursor="pointer"
              >
                {bookmark ? (
                  <FaBookmark size={20} color="red" />
                ) : (
                  <CiBookmark size={20} />
                )}
              </Flex>
            </Flex>
            {!isLargerThan768 && (
              <Flex alignItems={'center'} ml={6}>
                <LanguageToggle
                  isEnglish={selectedLanguage === 'english'}
                  onToggle={toggleLanguage}
                  isDisabled={notLoggedIn}
                  onSigninOpen={onSigninOpen}
                />
              </Flex>
            )}
          </Flex>

          <Flex
            alignItems={'center'}
            gap={2}
            w={'100%'}
            justifyContent={{ base: 'space-between', xl: 'flex-end' }}
            position={'relative'}
          >
            <Flex>
              {notLoggedIn && (
                <LockIcon
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  color="white"
                  boxSize={6}
                  zIndex={2}
                  onClick={onSigninOpen}
                  cursor={'pointer'}
                />
              )}

              <Flex
                mb={4}
                style={
                  notLoggedIn
                    ? { filter: 'blur(5px)', userSelect: 'none' }
                    : { userSelect: 'text' }
                }
              >
                {isQuinBoostAvailable ? (
                  <QuinBoost />
                ) : (
                  !state.isBoosted && (
                    <Flex flexDirection={'column'}>
                      <Text
                        m={0}
                        p={0}
                        textAlign={'left'}
                        fontSize={'0.8rem'}
                        fontWeight={'bold'}
                      >
                        Quin Boost
                      </Text>
                      <Flex position="relative">
                        <Button
                          buttonW="7rem"
                          textColor={'white'}
                          onClick={e => {
                            playClick()
                            if (notLoggedIn) {
                              toast({
                                title: 'Login Required',
                                description:
                                  'Please log in to share this article.',
                                status: 'warning',
                                duration: 3000,
                                isClosable: true,
                              })
                              return
                            }
                            quinTour.complete()
                            openModal()
                          }}
                        >
                          {quizLeftToGetQuizBoost} Quiz Left
                        </Button>
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
                    <Badge
                      fontSize={['sm', 'md', 'lg']}
                      color="yellow"
                      bg="none"
                    >
                      Enjoy!! 1.5x multiplier
                    </Badge>
                  </Flex>
                )}
              </Flex>
            </Flex>

            <ShareButton
              onClick={handleShare}
              isDisabled={notLoggedIn}
              onOpenSignin={onSigninOpen}
            />
            {isLargerThan768 && (
              <LanguageToggle
                isEnglish={selectedLanguage === 'english'}
                onToggle={toggleLanguage}
                isDisabled={notLoggedIn}
                onSigninOpen={onSigninOpen}
              />
            )}
          </Flex>
          {!isLargerThan768 && (
            <Flex
              justifyContent={{ base: 'flex-end', lg: '' }}
              w={{ base: '100%', lg: 'auto' }}
            >
              <Text fontSize={['sm', 'md', 'lg']}>
                {avgTimeRead} min read • {dateTime}
              </Text>
            </Flex>
          )}
        </Flex>
        <Flex w={'100%'} justifyContent={'flex-end'}>
          {isLargerThan768 && (
            <Flex
              justifyContent={{ base: 'flex-end', lg: 'flex-start' }}
              w={{ base: '100%', lg: 'auto' }}
            >
              <Text fontSize={['sm', 'md', 'lg']} mb={0}>
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
    </Skeleton>
  )
}

export default ArticleHeader
