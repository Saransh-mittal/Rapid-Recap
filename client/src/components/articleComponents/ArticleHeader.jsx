import React, { useMemo, useCallback } from 'react'
import {
  Flex,
  Text,
  Skeleton,
  useDisclosure,
  useMediaQuery,
  useToast,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import LanguageToggle from './articleHeaderComponents/LanguageToggle'
import AuthorInfo from './articleHeaderComponents/AuthorInfo'
import BoostSection from './articleHeaderComponents/BoostSection'
import BookmarkIcon from './articleHeaderComponents/BookmarkIcon'
import ShareButton from './ShareButton'
import ShareChatModal from '../chatComponent/miniComponents/ShareChatModal'
import useSound from '../../customHooks/useSound'

const ArticleHeader = ({
  title,
  author,
  selectedLanguage,
  bookmark,
  handleLanguageChange,
  avgTimeRead,
  dateTime,
  bookmarkStatus,
  article,
  isQuinBoostAvailable,
  quizLeftToGetQuizBoost,
  openModal,
  onSigninOpen,
}) => {
  const { isAuthenticated } = useSelector(state => state.auth)
  const { isBoosted } = useSelector(state => state.app)
  const notLoggedIn = !isAuthenticated
  const { playClick } = useSound()
  const { isOpen, onOpen: onOpenShareModal, onClose } = useDisclosure()
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const toast = useToast()

  const toggleLanguage = useCallback(() => {
    if (notLoggedIn) {
      toast({
        title: 'Login Required',
        description: 'Please log in to change the language.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    const newLanguage = selectedLanguage === 'english' ? 'hindi' : 'english'
    handleLanguageChange({ target: { value: newLanguage } })
  }, [selectedLanguage, handleLanguageChange, notLoggedIn, toast])

  const handleBookmarkClick = useCallback(() => {
    bookmarkStatus({ view: false, update: true })
  }, [bookmarkStatus])

  const handleShare = useCallback(() => {
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
  }, [notLoggedIn, onOpenShareModal, toast])

  return (
    <Skeleton isLoaded={!!title[selectedLanguage]} w={'100%'} mb={[3, 4, 5]}>
      <Flex
        bg="linear-gradient(135deg, rgba(42, 47, 79, 0.7) 0%, rgba(145, 127, 179, 0.7) 100%)"
        px={[3, 4, 6]}
        py={[2, 3]}
        borderTopRadius="xl"
        flexDirection="column"
        w="100%"
      >
        <Text
          fontSize={['2xl', '2xl', '2.2rem']}
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
          <Flex w={'100%'} mb={4} gap={1} mt={2}>
            <Flex
              alignItems="center"
              gap={1}
              justifyContent={'flex-start'}
              w={'100%'}
            >
              <AuthorInfo author={author} selectedLanguage={selectedLanguage} />
              {isLargerThan768 && (
                <BookmarkIcon
                  bookmark={bookmark}
                  onBookmarkClick={handleBookmarkClick}
                  playClick={playClick}
                />
              )}
            </Flex>
            {!isLargerThan768 && (
              <BookmarkIcon
                bookmark={bookmark}
                onBookmarkClick={handleBookmarkClick}
                playClick={playClick}
              />
            )}
            {!isLargerThan768 && (
              <Flex alignItems={'center'} h={'100%'}>
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
            <BoostSection
              isQuinBoostAvailable={isQuinBoostAvailable}
              quizLeftToGetQuizBoost={quizLeftToGetQuizBoost}
              openModal={openModal}
              playClick={playClick}
              notLoggedIn={notLoggedIn}
              toast={toast}
              isBoosted={isBoosted}
            />

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
