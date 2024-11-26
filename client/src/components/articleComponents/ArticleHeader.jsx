import React, {
  useCallback,
  Suspense,
  useState,
  useEffect,
  useRef,
} from 'react'
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useDispatch, useSelector } from 'react-redux'
import ReactGA from 'react-ga4'
import BoostSection from './articleHeaderComponents/BoostSection'
import BookmarkIcon from './articleHeaderComponents/BookmarkIcon'
import ShareButton from './ShareButton'
import ShareChatModal from '../chatComponent/miniComponents/ShareChatModal'
import { EditIcon } from '@chakra-ui/icons'
import axios from 'axios'
import { addNoteMessage, setIsSigninOpen } from '../../redux/appSlice'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { formatDate } from '../../utils/helper.utils'
import AITagLine from './articleHeaderComponents/AITagLine'
import { useFeatureDetection } from '../../utils/featureDetection'
import useSafeSound from '../../customHooks/useSafeSound'
import ArticleHeaderSkeleton from './loaders/ArticleHeaderSkeleton'

const ArticleForm = React.lazy(() =>
  import('../dashboardComponents/ArticleManageComponents/ArticleForm'),
)

const ArticleHeader = ({
  title,
  author,
  articleLoading,
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
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  const { isOpen, onOpen: onOpenShareModal, onClose } = useDisclosure()
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const toast = useToast()
  const { user } = useSelector(state => state.auth)
  const lang = i18n.language
  const formattedDate = formatDate(new Date(dateTime), lang)
  const [theme, setTheme] = useState('')
  const [isLoadingTheme, setIsLoadingTheme] = useState(false)
  const timeoutRef = useRef(null)
  const {
    isOpen: isOpenArticleForm,
    onOpen: onOpenArticleForm,
    onClose: onCloseArticleForm,
  } = useDisclosure()
  const [selectedArticle, setSelectedArticle] = React.useState({})

  const themes = [
    { value: 'original', label: t('original') },
    { value: 'space', label: t('space') },
    { value: 'indian_mythology', label: t('indianMythology') },
    { value: 'bible_mythology', label: t('bibleMythology') },
    { value: 'greek_mythology', label: t('greekMythology') },
    { value: 'scifi', label: t('scifi') },
    { value: 'mystic_world', label: t('mysticWorld') },
  ]

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

  const handleThemeChange = async selectedTheme => {
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
    setTheme(selectedTheme)
    setIsLoadingTheme(true)
    if (selectedTheme === 'original' || !selectedTheme) {
      onThemeChange(null)
      setIsLoadingTheme(false)
      return
    }
    try {
      const response = await axios.post('/api/articles/story', {
        articleId: article._id,
        theme: selectedTheme,
        lang: lang,
      })
      onThemeChange(response.data.storyContent)
      ReactGA.event({
        category: 'Article Interaction',
        action: 'Theme Selection',
        label: selectedTheme,
      })
      timeoutRef.current = setTimeout(() => {
        dispatchRedux(
          addNoteMessage({
            messageType: 'storyFeedback',
            title: t('Please rate us'),
            duration: null,
            width: '300px',
            actions: [{ actionType: 'SUBMIT_FEEDBACK' }],
            storyId: response.data._id,
          }),
        )
      }, 45000)
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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  if (articleLoading) {
    return <ArticleHeaderSkeleton />
  }
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
              {/* <AuthorInfo author={author} selectedLanguage={selectedLanguage} /> */}
              <AITagLine />
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
                <BookmarkIcon
                  bookmark={bookmark}
                  onBookmarkClick={handleBookmarkClick}
                  playClick={playClick}
                />
              </Flex>
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
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  isLoading={isLoadingTheme}
                  loadingText={t('loading')}
                  bg="rgba(255, 255, 255, 0.1)"
                  color="white"
                  borderColor="rgba(255, 255, 255, 0.2)"
                  _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                  _active={{ bg: 'rgba(255, 255, 255, 0.3)' }}
                  _focus={{ boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.6)' }}
                  width="100%"
                >
                  {theme
                    ? themes.find(t => t.value === theme)?.label
                    : t('original')}
                </MenuButton>
                <MenuList bg="gray.800" borderColor="gray.600" boxShadow="xl">
                  {themes.map(themeOption => (
                    <MenuItem
                      key={themeOption.value}
                      onClick={() => handleThemeChange(themeOption.value)}
                      bg="gray.800"
                      color="white"
                      _hover={{ bg: 'purple.700' }}
                      _focus={{ bg: 'purple.700' }}
                    >
                      {themeOption.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
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
