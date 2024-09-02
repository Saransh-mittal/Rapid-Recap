import React, { useCallback, Suspense } from 'react'
import {
  Flex,
  Text,
  Skeleton,
  useDisclosure,
  useMediaQuery,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'
import AuthorInfo from './articleHeaderComponents/AuthorInfo'
import BoostSection from './articleHeaderComponents/BoostSection'
import BookmarkIcon from './articleHeaderComponents/BookmarkIcon'
import ShareButton from './ShareButton'
import ShareChatModal from '../chatComponent/miniComponents/ShareChatModal'
import useSound from '../../customHooks/useSound'
import { EditIcon } from '@chakra-ui/icons'
import axios from 'axios'
import { setIsSigninOpen } from '../../redux/appSlice'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { formatDateLangTranslate } from '../../utils/helper.utils'

const ArticleForm = React.lazy(() =>
  import('../dashboardComponents/ArticleManageComponents/ArticleForm'),
)

const ArticleHeader = ({
  title,
  author,
  selectedLanguage,
  bookmark,
  avgTimeRead,
  dateTime,
  bookmarkStatus,
  article,
  isQuinBoostAvailable,
  quizLeftToGetQuizBoost,
  openModal,
}) => {
  const { t } = useTranslation('ArticleHeader')
  const { isAuthenticated, isAdmin } = useSelector(state => state.auth)
  const dispatchRedux = useDispatch()
  const { isBoosted } = useSelector(state => state.app)
  const notLoggedIn = !isAuthenticated
  const { playClick } = useSound()
  const { isOpen, onOpen: onOpenShareModal, onClose } = useDisclosure()
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const toast = useToast()
  const { user } = useSelector(state => state.auth)
  const locale = i18n.language === 'hi' ? 'hi-IN' : 'en-US' // assuming 'i18n.language' returns the current language
  const formattedDate = formatDateLangTranslate(new Date(dateTime), locale)

  const {
    isOpen: isOpenArticleForm,
    onOpen: onOpenArticleForm,
    onClose: onCloseArticleForm,
  } = useDisclosure()
  const [selectedArticle, setSelectedArticle] = React.useState({})

  const handleEditArticle = useCallback(async () => {
    try {
      const response = await axios.get(`/api/admin/articles/${article._id}`)
      setSelectedArticle(response.data)
      onOpenArticleForm()
    } catch (error) {
      console.error(t('fetchErrorTitle'), error)
      toast({
        title: t('fetchErrorTitle'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [onCloseArticleForm, toast, article])

  const handleUpdateArticle = useCallback(
    async updatedData => {
      try {
        await axios.put(
          `/api/admin/articles/${selectedArticle._id}`,
          updatedData,
        )
        onCloseArticleForm()
        toast({
          title: t('updateSuccessTitle'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        console.error(t('updateErrorTitle'), error)
        toast({
          title: t('updateErrorTitle'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [selectedArticle, onOpenArticleForm, toast, article],
  )

  const handleBookmarkClick = useCallback(() => {
    bookmarkStatus({ view: false, update: true })
  }, [bookmarkStatus])

  const handleShare = useCallback(() => {
    if (notLoggedIn) {
      toast({
        title: t('loginRequiredTitle'),
        description: t('loginRequiredDescription'),
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
              {isAdmin && (
                <>
                  <EditIcon
                    h={'25px'}
                    w={'25px'}
                    cursor={'pointer'}
                    onClick={handleEditArticle}
                  />
                  <Suspense fallback={<Spinner />}>
                    <ArticleForm
                      isOpen={isOpenArticleForm}
                      onClose={onCloseArticleForm}
                      onSubmit={handleUpdateArticle}
                      article={selectedArticle}
                      setArticle={setSelectedArticle}
                    />
                  </Suspense>
                </>
              )}

              <Flex mt={'-2'}>
                {isLargerThan768 && (
                  <BookmarkIcon
                    bookmark={bookmark}
                    onBookmarkClick={handleBookmarkClick}
                    playClick={playClick}
                  />
                )}
              </Flex>
            </Flex>
            <Flex mt={'-2'}>
              {!isLargerThan768 && (
                <BookmarkIcon
                  bookmark={bookmark}
                  onBookmarkClick={handleBookmarkClick}
                  playClick={playClick}
                />
              )}
            </Flex>
          </Flex>

          <Flex
            alignItems={'center'}
            gap={2}
            w={'100%'}
            justifyContent={{ base: 'space-between', md: 'flex-end' }}
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
              isDisabled={notLoggedIn || user?.role === 'guest'}
              onOpenSignin={() => dispatchRedux(setIsSigninOpen(true))}
              user={user}
            />
          </Flex>
          {!isLargerThan768 && (
            <Flex
              justifyContent={{ base: 'flex-end', lg: '' }}
              w={{ base: '100%', lg: 'auto' }}
            >
              <Text fontSize={['sm', 'md', 'lg']}>
                {' '}
                {avgTimeRead} {t('timeToRead')} • <time>{formattedDate}</time>
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
                {avgTimeRead} {t('timeToRead')} • <time>{formattedDate}</time>
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
