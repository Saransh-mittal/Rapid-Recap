// Enhanced ArticleHeader.jsx with improved desktop spacing and padding
// Location: client/src/components/articleComponents/ArticleHeader.jsx

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
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  useBreakpointValue,
  Badge,
  Portal,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import BoostSection from './articleHeaderComponents/BoostSection'
import BookmarkIcon from './articleHeaderComponents/BookmarkIcon'
import ShareIcon from './articleHeaderComponents/ShareIcon'
import ReadingModeToggle from './articleHeaderComponents/ReadingModeToggle'
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
import SocialShareComponent from './articleHeaderComponents/SocialShareComponent'
import NotUserLangSwitcher from './articleHeaderComponents/NotUserLangSwitcher'

const ArticleForm = React.lazy(() =>
  import('../dashboardComponents/ArticleManageComponents/ArticleForm'),
)

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const ArticleHeader = ({
  title,
  articleLoading,
  selectedLanguage,
  bookmark,
  avgTimeRead,
  dateTime,
  bookmarkStatus,
  article,
  openModal,
  onThemeChange,
  openStreakSurgeModal,
  openCategoryBoostModal,
  readingMode,
  onReadingModeChange,
  isGameModeAvailable,
}) => {
  const { t } = useTranslation('ArticleHeader')
  const { isAuthenticated, isAdmin } = useSelector(state => state.auth)
  const { isImmersiveModeActive } = useSelector(state => state.articles)
  const dispatchRedux = useDispatch()
  const { isBoosted } = useSelector(state => state.app)
  const notLoggedIn = !isAuthenticated
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })

  const { isOpen, onOpen: onOpenShareModal, onClose } = useDisclosure()

  // Enhanced responsive breakpoints
  const [isMobile] = useMediaQuery('(max-width: 480px)')
  const [isTablet] = useMediaQuery('(max-width: 768px)')
  const [isDesktop] = useMediaQuery('(min-width: 992px)')
  const [isLargeDesktop] = useMediaQuery('(min-width: 1200px)')

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

  // Enhanced responsive configuration with better desktop spacing
  const responsiveConfig = useBreakpointValue({
    base: {
      titleSize: 'lg',
      spacing: 2.5,
      padding: 3,
      themeButtonSize: 'xs',
      themeButtonWidth: '85px',
      iconSpacing: 2,
      rowGap: 2.5,
      containerPadding: 3,
    },
    sm: {
      titleSize: 'lg',
      spacing: 3,
      padding: 3.5,
      themeButtonSize: 'sm',
      themeButtonWidth: '95px',
      iconSpacing: 2,
      rowGap: 3,
      containerPadding: 4,
    },
    md: {
      titleSize: 'xl',
      spacing: 3.5,
      padding: 4.5,
      themeButtonSize: 'sm',
      themeButtonWidth: '105px',
      iconSpacing: 2.5,
      rowGap: 3.5,
      containerPadding: 4,
    },
    lg: {
      titleSize: '2xl',
      spacing: 4,
      padding: 6, // Increased from 4.5
      themeButtonSize: 'sm',
      themeButtonWidth: '120px',
      iconSpacing: 3,
      rowGap: 4, // Increased from 3.5
      containerPadding: 5,
    },
    xl: {
      titleSize: '2xl',
      spacing: 4.5,
      padding: 7, // Even more generous on very large screens
      themeButtonSize: 'sm',
      themeButtonWidth: '130px',
      iconSpacing: 3.5,
      rowGap: 4.5, // More breathing room
      containerPadding: 6,
    },
  })

  const themes = [
    { value: 'original', label: t('original') },
    { value: 'space', label: t('space') },
    { value: 'indian_mythology', label: t('indianMythology') },
    { value: 'bible_mythology', label: t('bibleMythology') },
    { value: 'greek_mythology', label: t('greekMythology') },
    { value: 'scifi', label: t('scifi') },
    { value: 'mystic_world', label: t('mysticWorld') },
  ]

  const handleReadingModeToggle = useCallback(() => {
    playClick()
    const newMode = readingMode === 'normal' ? 'game' : 'normal'
    onReadingModeChange(newMode)
  }, [readingMode, onReadingModeChange, playClick])

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
    <Skeleton isLoaded={!!title[selectedLanguage]} w={'100%'}>
      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        w="100%"
        mb={3}
        mt={{
          base: isImmersiveModeActive ? 0 : 3,
        }}
      >
        <Box
          bg="linear-gradient(135deg, rgba(42, 47, 79, 0.9) 0%, rgba(145, 127, 179, 0.9) 100%)"
          backdropFilter="blur(20px)"
          border="1px solid rgba(255, 255, 255, 0.15)"
          borderRadius="xl"
          p={responsiveConfig.padding} // Enhanced padding that scales better on desktop
          boxShadow="0 15px 35px rgba(0, 0, 0, 0.3)"
          position="relative"
          overflow="hidden"
        >
          {/* Enhanced background decoration for desktop */}
          <Box
            position="absolute"
            top="-10%"
            right="-2%"
            w={isDesktop ? '70px' : '50px'} // Larger on desktop
            h={isDesktop ? '70px' : '50px'}
            bg="radial-gradient(circle, rgba(159, 122, 234, 0.06) 0%, transparent 70%)"
            borderRadius="full"
            pointerEvents="none"
          />

          {/* ENHANCED LAYOUT WITH BETTER DESKTOP SPACING */}
          <Flex direction="column" gap={responsiveConfig.rowGap}>
            {/* ROW 1: Title with enhanced desktop spacing */}
            <MotionBox
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Text
                fontSize={responsiveConfig.titleSize}
                fontWeight="700"
                letterSpacing="tight"
                lineHeight="1.15"
                color="white"
                textShadow="0 2px 4px rgba(0,0,0,0.4)"
                mb={isDesktop ? 1 : 0} // Extra margin on desktop for breathing room
              >
                {title[selectedLanguage]}
              </Text>
            </MotionBox>

            {/* ROW 2: AI Tag + Actions + Theme with enhanced desktop spacing */}
            <MotionFlex
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              justify="space-between"
              align="center"
              w="100%"
              py={isDesktop ? 1 : 0} // Extra vertical padding on desktop
            >
              {/* Left Section: AI Tag + Admin with enhanced spacing */}
              <Flex align="center" gap={responsiveConfig.iconSpacing}>
                <AITagLine t={t} />

                {isAdmin && (
                  <EditIcon
                    h={isDesktop ? '15px' : '13px'} // Slightly larger on desktop
                    w={isDesktop ? '15px' : '13px'}
                    cursor="pointer"
                    onClick={handleEditArticle}
                    color="whiteAlpha.800"
                    _hover={{
                      color: 'white',
                      transform: 'scale(1.1)',
                    }}
                    transition="all 0.2s ease"
                  />
                )}
              </Flex>

              {/* Right Section: Actions + Theme with enhanced spacing */}
              <HStack spacing={responsiveConfig.iconSpacing} align="center">
                <BookmarkIcon
                  bookmark={bookmark}
                  onBookmarkClick={handleBookmarkClick}
                  playClick={playClick}
                />
                <ShareIcon
                  onShare={handleShare}
                  isDisabled={notLoggedIn || user?.role === 'guest'}
                  onOpenSignin={() => dispatchRedux(setIsSigninOpen(true))}
                  user={user}
                  playClick={playClick}
                />

                {/* Enhanced theme menu with better desktop sizing */}
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                    isLoading={isLoadingTheme}
                    loadingText={t('loading')}
                    bg="rgba(255, 255, 255, 0.08)"
                    color="white"
                    borderColor="rgba(255, 255, 255, 0.18)"
                    _hover={{
                      bg: 'rgba(255, 255, 255, 0.14)',
                      borderColor: 'rgba(255, 255, 255, 0.25)',
                      transform: 'translateY(-0.5px)',
                    }}
                    _active={{
                      bg: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(0px)',
                    }}
                    size={responsiveConfig.themeButtonSize}
                    width={responsiveConfig.themeButtonWidth}
                    borderRadius="lg"
                    fontWeight="600"
                    fontSize="xs"
                    h={isDesktop ? '32px' : '28px'} // Taller on desktop
                    px={isDesktop ? 4 : 3} // More horizontal padding on desktop
                    boxShadow="0 2px 6px rgba(0,0,0,0.12)"
                    transition="all 0.2s ease"
                  >
                    {theme
                      ? themes.find(t => t.value === theme)?.label
                      : t('original')}
                  </MenuButton>
                  <Portal>
                    <MenuList
                      bg="rgba(30, 41, 59, 0.96)"
                      borderColor="rgba(255, 255, 255, 0.18)"
                      boxShadow="0 12px 30px rgba(0,0,0,0.4)"
                      backdropFilter="blur(20px)"
                      borderRadius="lg"
                      py={isDesktop ? 2 : 1} // More padding in menu on desktop
                    >
                      {themes.map(themeOption => (
                        <MenuItem
                          key={themeOption.value}
                          onClick={() => handleThemeChange(themeOption.value)}
                          bg="transparent"
                          color="white"
                          _hover={{ bg: 'rgba(159, 122, 234, 0.18)' }}
                          _focus={{ bg: 'rgba(159, 122, 234, 0.18)' }}
                          borderRadius="md"
                          mx={isDesktop ? 2 : 1}
                          my={0.5}
                          px={isDesktop ? 3 : 2} // More horizontal padding on desktop
                          py={isDesktop ? 2 : 1.5} // More vertical padding on desktop
                          fontSize="sm"
                          transition="all 0.15s ease"
                        >
                          {themeOption.label}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Portal>
                </Menu>
              </HStack>
            </MotionFlex>

            {/* ROW 3: Meta Info + Reading Mode with enhanced desktop spacing */}
            <MotionFlex
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              justify="space-between"
              align={isMobile ? 'flex-start' : 'center'}
              w="100%"
              direction={isMobile ? 'column' : 'row'}
              gap={isMobile ? 2 : 0}
              pt={isDesktop ? 1 : 0} // Extra top padding on desktop
            >
              {/* Left: Time Info + Language with enhanced spacing */}
              <Flex align="center" order={isMobile ? 2 : 1} w={'100%'}>
                <Box mr={'auto'}>{!user && <NotUserLangSwitcher />}</Box>

                <Text
                  fontSize={isDesktop ? 'md' : 'sm'} // Larger text on desktop
                  color="whiteAlpha.900"
                  fontWeight="500"
                  textShadow="0 1px 2px rgba(0,0,0,0.3)"
                  ml={'auto'}
                >
                  {avgTimeRead} {t('timeToRead')} •
                  <Box as="time" ml={1}>
                    {formattedDate}
                  </Box>
                </Text>
              </Flex>

              {/* Right: Reading Mode with enhanced desktop spacing */}
              {isGameModeAvailable && (
                <Flex
                  direction="column"
                  align={isMobile ? 'flex-start' : 'flex-end'}
                  gap={isDesktop ? 1.5 : 1} // More gap on desktop
                  order={isMobile ? 1 : 2}
                >
                  {/* Enhanced label with badge for desktop */}
                  {/* <HStack spacing={isDesktop ? 2 : 1.5} align="center">
                    <Text
                      fontSize="2xs"
                      color="whiteAlpha.650"
                      fontWeight="600"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Reading
                    </Text>
                    <Badge
                      size="sm"
                      bg="rgba(159, 122, 234, 0.18)"
                      color="purple.200"
                      borderRadius="full"
                      px={isDesktop ? 3 : 2} // More padding on desktop
                      py={isDesktop ? 1 : 0.5}
                      fontSize="3xs"
                      fontWeight="700"
                      border="1px solid rgba(159, 122, 234, 0.25)"
                    >
                      {readingMode === 'normal' ? 'Standard' : 'Interactive'}
                    </Badge>
                  </HStack> */}

                  {/* Enhanced toggle for desktop */}
                  {/* <ReadingModeToggle
                    readingMode={readingMode}
                    onToggle={handleReadingModeToggle}
                    playClick={playClick}
                  /> */}
                </Flex>
              )}
            </MotionFlex>
          </Flex>

          {/* Admin Article Form */}
          {isAdmin && (
            <Suspense fallback={<Spinner />}>
              <ArticleForm
                isOpen={isOpenArticleForm}
                onClose={onCloseArticleForm}
                onSubmit={handleUpdateArticle}
                article={selectedArticle}
                setArticle={setSelectedArticle}
              />
            </Suspense>
          )}
        </Box>

        {/* Social Share Modal */}
        <SocialShareComponent
          isOpen={isOpen}
          onClose={onClose}
          articleToShare={article}
          notLoggedIn={notLoggedIn}
        />
      </MotionBox>
    </Skeleton>
  )
}

export default ArticleHeader
