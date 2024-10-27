import React, {
  useCallback,
  useMemo,
  Suspense,
  useState,
  useEffect,
} from 'react'
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Image,
  Flex,
  Tooltip,
  Skeleton,
  useToast,
  Spinner,
  Button,
} from '@chakra-ui/react'
import { LockIcon } from '@chakra-ui/icons'
import { useDispatch, useSelector } from 'react-redux'
import useSound from '../../customHooks/useSound'
import RelatedArticlesToggle from './RelatedArticlesToggle'
import axios from 'axios'
import { formatDate } from '../../utils/helper.utils'
import slugify from 'slugify'
import { setIsSigninOpen } from '../../redux/appSlice'
import { useTranslation } from 'react-i18next'
import { setIsOpen } from '../../redux/quizSlice'
import { blackListedImgUrls } from '../../assets/blackListedImgUrls'
import { useNavigate } from 'react-router-dom'

//SSR image
const Alt_img = '/images/rr.webp'
const rrImage = '/images/rrlogo_HD.webp'

// Lazy load components
const GivenQuiz = React.lazy(() => import('./GivenQuiz'))
const QuizExpired = React.lazy(() => import('./QuizExpired'))
const TakeQuizButton = React.lazy(() => import('./TakeQuizButton'))
const TotalUserAttempted = React.lazy(() => import('./TotalUserAttempted'))

const Sidebar = ({
  givenQuiz,
  percentile,
  RQM_score,
  onGoingQuiz,
  quizExpired,
  isQuinBoostAvailable,
  trackGenerateQuizClick,
  setShowQuiz,
  showQuiz,
  totalUsersGivenQuiz,
  articleHeight,
  article,
  id,
  isQuizGivenLoading,
  i18n,
  loadingRealatedArticles,
  setLoadingRelatedArticles,
  setShouldScrollToTop,
  shouldScrollToTop,
}) => {
  const { t } = useTranslation('Sidebar')
  const { t: formatDateTranslate } = useTranslation('formatDate')
  const { isAuthenticated } = useSelector(state => state.auth)
  const notLoggedIn = !isAuthenticated
  const { playClick } = useSound()
  const toast = useToast()
  const [showRelated, setShowRelated] = useState(false)
  const [recommendedArticles, setRecommendedArticles] = useState([])
  const [page, setPage] = useState(1)
  const [pageRelated, setPageRelated] = useState(1)
  const [loading, setLoading] = useState(false)
  const [latestNews, setLatestNews] = useState([])
  // const [loadingArticles, setLoadingArticles] = useState({})
  const navigate = useNavigate()
  const dispatchRedux = useDispatch()

  const isLoaded = useMemo(() => {
    return (
      onGoingQuiz !== null &&
      quizExpired !== null &&
      isQuizGivenLoading !== null
    )
  }, [onGoingQuiz, quizExpired, isQuizGivenLoading])

  const handleQuizButtonClick = useCallback(() => {
    playClick()
    if (notLoggedIn) {
      toast({
        title: t('loginRequired'),
        description: t('loginToShare'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    trackGenerateQuizClick()
    dispatchRedux(setIsOpen(true))
  }, [
    notLoggedIn,
    playClick,
    toast,
    trackGenerateQuizClick,
    setShowQuiz,
    showQuiz,
    dispatchRedux,
    t,
  ])

  const handleRelatedArticleClick = useCallback(
    async (e, item) => {
      if (notLoggedIn) {
        e.preventDefault()
        toast({
          title: t('loginRequired'),
          description: t('loginToShare'),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      playClick()

      // cut after article id
      const pathname = location.pathname.split('/').slice(0, 3).join('/')

      if (
        pathname === `/article/${item._id}/${slugify(item.title)}` ||
        pathname === `/article/${item._id}/${slugify(item.title)}/` ||
        pathname === `/article/${item._id}` ||
        pathname === `/article/${item._id}/`
      ) {
        toast({
          title: t('alreadyOnArticle'),
          description: t('alreadyOnArticleDesc'),
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
        return
      }
      // If the user is already on the article, give a toast message
      setShouldScrollToTop(true)
      setLoadingRelatedArticles(prev => ({ ...prev, [item._id]: true }))

      const path =
        i18n.language === 'en'
          ? `/article/${item._id}/${slugify(item.title)}`
          : `/article/${item._id}/${slugify(item.hindiTitle)}`

      navigate(path)

      // Reset loading state after navigation
      // setTimeout(() => {
      //   setLoadingArticles(prev => ({ ...prev, [item._id]: false }))
      // }, 1000)
    },
    [notLoggedIn, playClick, toast, navigate, i18n.language, t],
  )

  const fetchRelatedArticles = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(
        `/api/articles/related/${id}?page=${pageRelated}&limit=5&lang=${i18n.language}`,
      )

      setLatestNews(prevArticles => [...prevArticles, ...data.relatedArticles])
      setPageRelated(prevPage => prevPage + 1)
    } catch (error) {
      console.error('Error fetching related articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendedArticles = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `/api/recommendation/articlePageRecommendations/${id}?page=${page}&pageSize=5&lang=${i18n.language}`,
      )
      setRecommendedArticles(prevArticles => [
        ...prevArticles,
        ...response.data,
      ])
      setPage(prevPage => prevPage + 1)
    } catch (error) {
      console.error('Error fetching recommended articles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendedArticles()
  }, [])

  useEffect(() => {
    if (loadingRealatedArticles[id] === false && shouldScrollToTop) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
      setShouldScrollToTop(false)
    }
  }, [loadingRealatedArticles])

  const renderArticles = () => {
    const articlesToShow = showRelated
      ? latestNews.filter(
          (_, idx) =>
            idx < Math.floor(articleHeight / 100) && _._id !== article._id,
        )
      : recommendedArticles

    return articlesToShow.map(item => (
      <Box
        minHeight="100px"
        key={item._id}
        onClick={e => handleRelatedArticleClick(e, item)}
        style={
          notLoggedIn
            ? { filter: 'blur(5px)', userSelect: 'none' }
            : { userSelect: 'text', cursor: 'pointer' }
        }
        borderTop="2px solid lightblue"
        p={2}
        w="100%"
        h={'auto'}
        display="flex"
        className="related-article"
        backgroundColor="rgba(42, 47, 79, 0.7)"
        borderRadius="xl"
        transition="all 0.3s ease"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        mb={3}
        flexDirection={'column'}
        position="relative"
      >
        {loadingRealatedArticles[item._id] && (
          <Flex
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            backgroundColor="rgba(0, 0, 0, 0.6)"
            justifyContent="center"
            alignItems="center"
            borderRadius="xl"
            zIndex={3}
          >
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </Flex>
        )}
        <Flex w="100%" justifyContent="space-between">
          <Text
            m={0}
            p={0}
            textTransform="uppercase"
            color="#9CAFAA"
            fontWeight="bold"
            letterSpacing="1px"
          >
            {formatDate(item?.dateTime, formatDateTranslate, i18n.language)}
          </Text>
          <Text
            fontSize="0.8rem"
            m={0}
            p={0}
            textTransform="uppercase"
            color="#9CAFAA"
            letterSpacing="1px"
          >
            {item.avgReadTime || 'N/A'} {t('minRead')}
          </Text>
        </Flex>
        <Flex mr={3} mb={2} alignItems={'center'}>
          <Image
            w={{ base: '130px', md: '160px' }}
            h="auto"
            maxHeight={{ base: '100px', md: '120px' }}
            mr={3}
            mt={2}
            float="left"
            src={
              (!blackListedImgUrls.find(url => url === item?.imgURL?.[0]) &&
                item?.imgURL?.[0]) ||
              rrImage
            }
            alt={t('articleImageAlt')}
            onError={e => {
              e.target.onerror = null
              e.target.src = Alt_img
              e.target.style.height = '100%'
            }}
            borderRadius="8px"
          />
          <Flex flexDirection="column" w="100%">
            <Text mt={2} color="#e0e0e0">
              {i18n.language === 'en' ? item.title : item.hindiTitle}
            </Text>
          </Flex>
        </Flex>
      </Box>
    ))
  }

  return (
    <Skeleton isLoaded={isLoaded}>
      <Box
        boxShadow={'0 100px 200px rgba(1, 1, 1, 1.1)'}
        borderRadius={'15px'}
        p={1.5}
        w={{ base: '90vw', md: '100%' }}
      >
        <Suspense fallback={<Spinner />}>
          {givenQuiz ? (
            <GivenQuiz
              articleId={id}
              percentile={percentile}
              RQM_score={RQM_score}
            />
          ) : onGoingQuiz ? (
            <Heading
              size="md"
              margin={'5px'}
              mb={5}
              height={'100px'}
              color={'red'}
            >
              {t('quizAlreadyOngoing')}
            </Heading>
          ) : quizExpired ? (
            <QuizExpired />
          ) : (
            <Box position={'relative'}>
              <Box
                style={
                  notLoggedIn
                    ? { filter: 'blur(5px)', userSelect: 'none' }
                    : { userSelect: 'text' }
                }
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
              >
                {isQuizGivenLoading ? (
                  <Spinner />
                ) : (
                  <TakeQuizButton
                    onClick={handleQuizButtonClick}
                    isQuinBoostAvailable={isQuinBoostAvailable}
                  />
                )}
              </Box>
              {notLoggedIn && (
                <Tooltip label={t('loginToGiveQuiz')} placement="top">
                  <LockIcon
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    color="white"
                    boxSize={8}
                    zIndex={2}
                    onClick={() => dispatchRedux(setIsSigninOpen(true))}
                    cursor={'pointer'}
                  />
                </Tooltip>
              )}
            </Box>
          )}
        </Suspense>
        <Suspense fallback={<Spinner />}>
          <TotalUserAttempted
            totalUsersGivenQuiz={totalUsersGivenQuiz}
            notLoggedIn={notLoggedIn}
            RQM_score={RQM_score}
            articleId={id}
          />
        </Suspense>
        <Flex justifyContent="center" alignItems="center" mb={4}>
          <RelatedArticlesToggle
            showRelated={showRelated}
            onToggle={() => {
              if (!showRelated && pageRelated === 1) fetchRelatedArticles()
              setShowRelated(!showRelated)
            }}
          />
        </Flex>
        <SimpleGrid
          columns={1}
          marginTop={5}
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          position="relative"
        >
          {renderArticles()}
          {loading && <Spinner />}
          {!loading && recommendedArticles.length > 0 && (
            <Flex justifyContent="center" w="100%">
              <Button
                onClick={() =>
                  showRelated
                    ? fetchRelatedArticles()
                    : fetchRecommendedArticles()
                }
                mt={4}
              >
                {t('loadMore')}
              </Button>
            </Flex>
          )}
          {notLoggedIn && (
            <Tooltip label={t('loginToNavigate')} placement="top">
              <LockIcon
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                color="white"
                boxSize={8}
                zIndex={2}
                onClick={() => dispatchRedux(setIsSigninOpen(true))}
                cursor={'pointer'}
              />
            </Tooltip>
          )}
        </SimpleGrid>
      </Box>
    </Skeleton>
  )
}

export default React.memo(Sidebar)
