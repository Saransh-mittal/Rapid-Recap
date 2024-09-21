import React, { useCallback, Suspense, useState } from 'react'
import {
  Flex,
  Text,
  Skeleton,
  useDisclosure,
  useMediaQuery,
  useToast,
  Spinner,
  Select,
  Box,
  Badge,
} from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'
import ReactGA from 'react-ga4'
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
import { formatDate } from '../../utils/helper.utils'

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
  onThemeChange,
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
  const lang = i18n.language // assuming 'i18n.language' returns the current language
  const formattedDate = formatDate(new Date(dateTime), lang)
  const [theme, setTheme] = useState('')
  const [isLoadingTheme, setIsLoadingTheme] = useState(false)

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

  const handleThemeChange = async e => {
    if (i18n.language === 'hi') {
      // toast for feature not available in hindi
      toast({
        title: t('featureNotAvailableTitle'),
        description: t('featureNotAvailableDescription'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
      return
    }
    if (!user || user.role === 'guest') {
      toast({
        title: t('loginRequiredTitleWithRealAccount'),
        description: t('loginRequiredDescriptionWithRealAccount'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
      return
    }
    const selectedTheme = e.target.value
    setTheme(selectedTheme)
    setIsLoadingTheme(true)
    if (!selectedTheme) {
      onThemeChange(null)
      setIsLoadingTheme(false)
      return
    }
    try {
      const response = await axios.post('/api/articles/story', {
        articleId: article._id,
        theme: selectedTheme,
      })
      onThemeChange(response.data.storyContent)
      // Track theme selection in Google Analytics
      ReactGA.event({
        category: 'Article Interaction',
        action: 'Theme Selection',
        label: selectedTheme,
      })
    } catch (error) {
      toast({
        title: t('themeChangeErrorTitle'),
        description:
          error.response?.data?.message || t('themeChangeErrorDescription'),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setIsLoadingTheme(false)
    }
  }

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
        </Flex>
        <Flex
          flexDirection={'row-reverse'}
          justifyContent={'center'}
          alignItems={{ md: '', lg: 'center' }}
        >
          <Flex w={'fit-content'} justifyContent={'flex-end'} ml={'auto'}>
            {isLargerThan768 ? (
              <Flex
                justifyContent={{ base: 'flex-end', lg: 'flex-start' }}
                w={{ base: '100%', lg: 'auto' }}
              >
                <Text fontSize={['sm', 'md', 'lg']} mb={0}>
                  {avgTimeRead} {t('timeToRead')} • <time>{formattedDate}</time>
                </Text>
              </Flex>
            ) : (
              <Flex
                justifyContent={{ base: 'flex-end', lg: '' }}
                w={{ base: '100%', lg: 'auto' }}
                mt={2}
              >
                <Text fontSize={['sm', 'md', 'lg']}>
                  {' '}
                  {avgTimeRead} {t('timeToRead')} • <time>{formattedDate}</time>
                </Text>
              </Flex>
            )}
          </Flex>

          <Flex
            justifyContent="space-between"
            alignItems="center"
            flexDirection={['column', 'column', 'row']}
            gap={2}
            w={'fit-content'}
          >
            <Box position="relative" width={['150px', '100%', '200px']}>
              <Select
                placeholder={t('selectTheme')}
                onChange={handleThemeChange}
                value={theme}
                isDisabled={isLoadingTheme}
                bg="rgba(255, 255, 255, 0.1)"
                color="white"
                borderColor="rgba(255, 255, 255, 0.2)"
                _hover={{ borderColor: 'rgba(255, 255, 255, 0.4)' }}
                _focus={{
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.6)',
                }}
              >
                <option value="space">{t('space')}</option>
                <option value="indian_mythology">{t('indianMythology')}</option>
                <option value="bible_mythology">{t('bibleMythology')}</option>
                <option value="greek_mythology">{t('greekMythology')}</option>
                <option value="scifi">{t('scifi')}</option>
                <option value="mystic_world">{t('mysticWorld')}</option>
              </Select>
              {isLoadingTheme && (
                <Spinner
                  size="sm"
                  position="absolute"
                  right="2.5rem"
                  top="25%"
                  transform="translateY(-50%)"
                  color="white"
                />
              )}
            </Box>
            <Badge
              colorScheme="purple"
              variant="solid"
              px={2}
              py={1}
              borderRadius="md"
              fontSize="xs"
            >
              {t('featureInTesting')}
            </Badge>
          </Flex>
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
